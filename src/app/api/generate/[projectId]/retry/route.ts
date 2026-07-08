// src/app/api/generate/[projectId]/retry/route.ts
// Relance la génération d'un seul artefact échoué
// Reconstruit le contexte cumulatif depuis les artefacts déjà complétés en DB

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects, artifacts, artifactVersions } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { AgentFactory } from '@/lib/agents/factory'
import { validateCoherence } from '@/lib/agents/coherence-validator'
import type { ArtifactType, GenerationContext } from '@/lib/agents/types'
import { PIPELINE_STEPS } from '@/lib/agents/types'
import { z } from 'zod'

const RetrySchema = z.object({
  artifactType: z.enum([
    'business_analysis',
    'architecture',
    'database_schema',
    'diagrams',
    'backlog',
  ]),
})

function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function extractLocale(req: NextRequest): 'fr' | 'en' {
  const referer = req.headers.get('referer') ?? ''
  if (referer.includes('/fr/')) return 'fr'
  if (referer.includes('/en/')) return 'en'
  return 'en'
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { projectId } = await params

  // Validate body
  let body: unknown
  try { body = await req.json() } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const parsed = RetrySchema.safeParse(body)
  if (!parsed.success) {
    return new Response('Invalid artifactType', { status: 400 })
  }

  const { artifactType } = parsed.data

  // Fetch project
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.userId, session.user.id)
    ),
  })

  if (!project) return new Response('Not found', { status: 404 })

  // Check if mock mode
  const useMock = process.env.USE_MOCK_GENERATION !== 'false'
  if (useMock) {
    return new Response(
      JSON.stringify({ error: 'Retry not available in mock mode' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const locale = extractLocale(req)
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseMessage(event, data)))
      }

      try {
        // ── Reconstruct cumulative context from DB ──────────────────────────
        const existingArtifacts = await db.query.artifacts.findMany({
          where: eq(artifacts.projectId, project.id),
        })

        const context: GenerationContext = {
          projectId: project.id,
          description: project.description,
          template: project.template,
          constraints: project.constraints,
          locale,
        }

        // Inject previously completed artifacts as context
        for (const artifact of existingArtifacts) {
          if (artifact.status === 'completed' && artifact.content) {
            if (artifact.type === 'business_analysis') {
              context.businessAnalysis = artifact.content
            } else if (artifact.type === 'architecture') {
              context.architecture = artifact.content
            } else if (artifact.type === 'database_schema') {
              context.databaseSchema = artifact.content
            }
          }
        }

        // ── Mark artifact as generating ─────────────────────────────────────
        await db.update(artifacts)
          .set({ status: 'generating', updatedAt: new Date() })
          .where(and(
            eq(artifacts.projectId, project.id),
            eq(artifacts.type, artifactType)
          ))

        emit('retry_started', {
          artifactType,
          projectId: project.id,
        })

        // ── Run the agent ───────────────────────────────────────────────────
        const stepStart = Date.now()
        const agent = AgentFactory.create(artifactType)
        const result = await agent.run(context)
        const durationMs = Date.now() - stepStart

        // ── Save result ─────────────────────────────────────────────────────
        const completedArtifacts: Record<string, unknown> = {}
        for (const a of existingArtifacts) {
          if (a.status === 'completed' && a.content) {
            completedArtifacts[a.type] = a.content
          }
        }
        completedArtifacts[artifactType] = result.content

        const coherenceResult = validateCoherence({
          business_analysis: completedArtifacts.business_analysis,
          architecture: completedArtifacts.architecture,
          database_schema: completedArtifacts.database_schema,
          diagrams: completedArtifacts.diagrams,
          backlog: completedArtifacts.backlog,
        })

        // Get current version number
        const existingArtifact = existingArtifacts.find(a => a.type === artifactType)
        const currentVersions = existingArtifact
          ? await db.query.artifactVersions.findMany({
              where: (av, { eq }) => eq(av.artifactId, existingArtifact.id),
            })
          : []
        const nextVersion = currentVersions.length + 1

        const [updatedArtifact] = await db.update(artifacts)
          .set({
            status: 'completed',
            content: result.content as any,
            coherenceScore: String(coherenceResult.score),
            coherenceIssues: coherenceResult.issues as any,
            generatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(
            eq(artifacts.projectId, project.id),
            eq(artifacts.type, artifactType)
          ))
          .returning()

        await db.insert(artifactVersions).values({
          artifactId: updatedArtifact.id,
          versionNumber: nextVersion,
          content: result.content as any,
          changeDesc: `Retry generation (attempt ${nextVersion})`,
          triggerInput: null,
        })

        // Update project status if all artifacts now completed
        const updatedArtifacts = await db.query.artifacts.findMany({
          where: eq(artifacts.projectId, project.id),
        })
        const allCompleted = PIPELINE_STEPS.every(step =>
          updatedArtifacts.find(a => a.type === step)?.status === 'completed'
        )
        if (allCompleted) {
          await db.update(projects)
            .set({ status: 'completed', updatedAt: new Date() })
            .where(eq(projects.id, project.id))
        }

        emit('retry_completed', {
          artifactType,
          durationMs,
          coherenceScore: coherenceResult.score,
          allCompleted,
        })

      } catch (error) {
        console.error('[Retry] Error:', error)

        await db.update(artifacts)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(and(
            eq(artifacts.projectId, project.id),
            eq(artifacts.type, artifactType)
          ))

        emit('retry_failed', {
          artifactType,
          error: (error as Error).message,
        })
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
