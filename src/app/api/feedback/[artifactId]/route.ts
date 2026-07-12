// src/app/api/feedback/[artifactId]/route.ts
// Lit la locale depuis le projet en DB — cohérence garantie avec la génération

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { artifacts, artifactVersions, projects, feedbacks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getLLMClient } from '@/lib/llm/client'
import { getLanguageInstruction } from '@/lib/prompts/config'
import { z } from 'zod'

const FeedbackSchema = z.object({
  message: z.string().min(1).max(2000),
  mode:    z.enum(['modify', 'explain']).default('modify'),
  // locale retiré — on lit depuis le projet en DB
})

function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function buildModifyPrompt(
  artifactType: string,
  currentContent: unknown,
  userMessage: string,
  locale: string
): { system: string; user: string } {
  return {
    system: `You are an expert software architect. You are helping a user refine a specific artifact from a software architecture document.

${getLanguageInstruction(locale)}

Apply the user's requested modification to the artifact and return the COMPLETE updated artifact in the EXACT SAME JSON structure. Return ONLY valid JSON, no markdown, no preamble.`,

    user: `ARTIFACT TYPE: ${artifactType}

CURRENT ARTIFACT:
${JSON.stringify(currentContent, null, 2)}

USER REQUEST:
"""
${userMessage}
"""

Return the complete updated artifact JSON.`,
  }
}

function buildExplainPrompt(
  artifactType: string,
  currentContent: unknown,
  userMessage: string,
  locale: string
): { system: string; user: string } {
  return {
    system: `You are an expert software architect helping a user understand their architecture document.

${getLanguageInstruction(locale)}

Answer the user's question clearly and concisely (100-300 words). Respond in plain text.`,

    user: `ARTIFACT TYPE: ${artifactType}

ARTIFACT:
${JSON.stringify(currentContent, null, 2)}

QUESTION:
"""
${userMessage}
"""`,
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ artifactId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { artifactId } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const parsed = FeedbackSchema.safeParse(body)
  if (!parsed.success) {
    return new Response('Invalid request', { status: 400 })
  }

  const { message, mode } = parsed.data

  // Fetch artifact
  const artifact = await db.query.artifacts.findFirst({
    where: eq(artifacts.id, artifactId),
  })

  if (!artifact?.content) return new Response('Artifact not found', { status: 404 })

  // Verify ownership + get project locale
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, artifact.projectId),
      eq(projects.userId, session.user.id)
    ),
  })

  if (!project) return new Response('Forbidden', { status: 403 })

  // Use project locale — not from request headers or body
  const locale = (project.locale ?? 'en') as string

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseMessage(event, data)))
      }

      try {
        emit('feedback_started', { artifactId, mode, locale })

        const client = getLLMClient()

        if (mode === 'explain') {
          const { system, user } = buildExplainPrompt(artifact.type, artifact.content, message, locale)

          const response = await client.callWithRetry({
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
            temperature: 0.4,
            maxTokens: 1024,
          })

          await db.insert(feedbacks).values({
            artifactId: artifact.id,
            userId: session.user.id,
            type: 'question',
            content: message,
            response: response.content,
          })

          emit('explanation_ready', { artifactId, explanation: response.content })

        } else {
          const { system, user } = buildModifyPrompt(artifact.type, artifact.content, message, locale)

          const updatedContent = await client.callJSON<unknown>({
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
            temperature: 0.2,
            maxTokens: 8192,
            responseFormat: 'json',
          })

          const versions = await db.query.artifactVersions.findMany({
            where: (av, { eq }) => eq(av.artifactId, artifact.id),
          })
          const nextVersion = versions.length + 1

          await db.insert(artifactVersions).values({
            artifactId: artifact.id,
            versionNumber: nextVersion,
            content: updatedContent as any,
            changeDesc: `User feedback: ${message.slice(0, 100)}`,
            triggerInput: message,
          })

          await db.update(artifacts)
            .set({ content: updatedContent as any, updatedAt: new Date() })
            .where(eq(artifacts.id, artifact.id))

          await db.insert(feedbacks).values({
            artifactId: artifact.id,
            userId: session.user.id,
            type: 'modification',
            content: message,
            response: 'Artifact updated successfully',
          })

          emit('artifact_updated', { artifactId, content: updatedContent, versionNumber: nextVersion })
        }

        emit('feedback_completed', { artifactId, mode })

      } catch (error) {
        console.error('[Feedback]', error)
        const msg = (error as Error).message
        let userMsg = 'An error occurred. Please try again.'
        if (msg.includes('503') || msg.includes('UNAVAILABLE')) {
          userMsg = 'LLM service temporarily unavailable. Please try again in a few minutes.'
        } else if (msg.includes('402')) {
          userMsg = 'API balance insufficient. Please recharge your account.'
        }
        emit('feedback_error', { artifactId, error: userMsg })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
