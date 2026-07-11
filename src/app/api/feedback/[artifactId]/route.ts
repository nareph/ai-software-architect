// src/app/api/feedback/[artifactId]/route.ts
// Feedback sur un artefact — modification ou explication via LLM

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { artifacts, artifactVersions, projects, feedbacks } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { getLLMClient } from '@/lib/llm/client'
import { getLanguageInstruction } from '@/lib/prompts/config'
import { validateCoherence } from '@/lib/agents/coherence-validator'
import { z } from 'zod'

const FeedbackSchema = z.object({
  message: z.string().min(1).max(2000),
  mode: z.enum(['modify', 'explain']).default('modify'),
  locale: z.enum(['fr', 'en']).default('en'),
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
  const langInstruction = getLanguageInstruction(locale)

  const system = `You are an expert software architect and technical analyst. You are helping a user refine a specific artifact from a software architecture document.

${langInstruction}

Your task is to apply the user's requested modification to the artifact and return the COMPLETE updated artifact in the EXACT SAME JSON structure as the input. Do not change the structure — only update the relevant content.

RULES:
- Return ONLY valid JSON, no markdown, no preamble, no explanation
- Preserve ALL existing content that the user did not ask to change
- Apply ONLY the modifications the user explicitly requested
- The output must be complete — not a diff or partial update`

  const user = `ARTIFACT TYPE: ${artifactType}

CURRENT ARTIFACT CONTENT:
${JSON.stringify(currentContent, null, 2)}

USER MODIFICATION REQUEST:
"""
${userMessage}
"""

Apply the requested modification and return the complete updated artifact JSON.`

  return { system, user }
}

function buildExplainPrompt(
  artifactType: string,
  currentContent: unknown,
  userMessage: string,
  locale: string
): { system: string; user: string } {
  const langInstruction = getLanguageInstruction(locale)

  const system = `You are an expert software architect and technical analyst. You are helping a user understand a specific artifact from a software architecture document.

${langInstruction}

Your task is to answer the user's question about this artifact in a clear, concise, and informative way. Focus on practical explanations that help the user understand the reasoning and implications of the architectural decisions.

Respond in plain text (no JSON). Be thorough but concise — aim for 100-300 words.`

  const user = `ARTIFACT TYPE: ${artifactType}

ARTIFACT CONTENT:
${JSON.stringify(currentContent, null, 2)}

USER QUESTION:
"""
${userMessage}
"""

Please explain or answer the user's question about this artifact.`

  return { system, user }
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

  const { message, mode, locale } = parsed.data

  // Fetch artifact + verify ownership
  const artifact = await db.query.artifacts.findFirst({
    where: eq(artifacts.id, artifactId),
  })

  if (!artifact || !artifact.content) {
    return new Response('Artifact not found', { status: 404 })
  }

  // Verify project ownership
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, artifact.projectId),
      eq(projects.userId, session.user.id)
    ),
  })

  if (!project) return new Response('Forbidden', { status: 403 })

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseMessage(event, data)))
      }

      try {
        emit('feedback_started', { artifactId, mode })

        const client = getLLMClient()

        if (mode === 'explain') {
          // ── Explanation mode — returns plain text ─────────────────────────
          const { system, user } = buildExplainPrompt(
            artifact.type,
            artifact.content,
            message,
            locale
          )

          const response = await client.callWithRetry({
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
            temperature: 0.4,
            maxTokens: 1024,
          })

          // Save feedback record
          await db.insert(feedbacks).values({
            artifactId: artifact.id,
            userId: session.user.id,
            type: 'question',
            content: message,
            response: response.content,
          })

          emit('explanation_ready', {
            artifactId,
            explanation: response.content,
          })

        } else {
          // ── Modify mode — returns updated artifact JSON ───────────────────
          const { system, user } = buildModifyPrompt(
            artifact.type,
            artifact.content,
            message,
            locale
          )

          const updatedContent = await client.callJSON<unknown>({
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: user },
            ],
            temperature: 0.2,
            maxTokens: 8192,
            responseFormat: 'json',
          })

          // Get current versions count
          const versions = await db.query.artifactVersions.findMany({
            where: (av, { eq }) => eq(av.artifactId, artifact.id),
          })
          const nextVersion = versions.length + 1

          // Save new version
          await db.insert(artifactVersions).values({
            artifactId: artifact.id,
            versionNumber: nextVersion,
            content: updatedContent as any,
            changeDesc: `User feedback: ${message.slice(0, 100)}`,
            triggerInput: message,
          })

          // Update artifact
          await db.update(artifacts)
            .set({
              content: updatedContent as any,
              updatedAt: new Date(),
            })
            .where(eq(artifacts.id, artifact.id))

          // Save feedback record
          await db.insert(feedbacks).values({
            artifactId: artifact.id,
            userId: session.user.id,
            type: 'modification',
            content: message,
            response: 'Artifact updated successfully',
          })

          emit('artifact_updated', {
            artifactId,
            content: updatedContent,
            versionNumber: nextVersion,
          })
        }

        emit('feedback_completed', { artifactId, mode })

      } catch (error) {
        console.error('[Feedback] Error:', error)
        const errorMsg = (error as Error).message

        let userMessage = 'An error occurred. Please try again.'
        if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE')) {
          userMessage = 'LLM service temporarily unavailable. Please try again in a few minutes.'
        } else if (errorMsg.includes('429') || errorMsg.includes('quota')) {
          userMessage = 'API quota exceeded. Please try again later.'
        } else if (errorMsg.includes('402')) {
          userMessage = 'API balance insufficient. Please recharge your account.'
        }

        emit('feedback_error', { artifactId, error: userMessage })
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
