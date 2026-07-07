// src/app/api/generate/[projectId]/stream/route.ts
// Route SSE — délègue TOUT à l'orchestrateur.
// Lit la locale depuis l'URL pour passer au pipeline.

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { runGenerationPipeline } from '@/lib/agents/orchestrator'
import type { SSEEmitter } from '@/lib/agents/types'

function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

function extractLocale(req: NextRequest): 'fr' | 'en' {
  // Try to get locale from Referer header URL
  const referer = req.headers.get('referer') ?? ''
  if (referer.includes('/fr/')) return 'fr'
  if (referer.includes('/en/')) return 'en'
  // Fallback to Accept-Language
  const acceptLang = req.headers.get('accept-language') ?? ''
  if (acceptLang.startsWith('fr')) return 'fr'
  return 'en'
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { projectId } = await params

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.userId, session.user.id)
    ),
  })

  if (!project) {
    return new Response('Not found', { status: 404 })
  }

  const locale = extractLocale(req)
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const emit: SSEEmitter = (event, data) => {
        controller.enqueue(encoder.encode(sseMessage(event, data)))
      }

      try {
        await runGenerationPipeline(
          {
            projectId: project.id,
            description: project.description,
            template: project.template,
            constraints: project.constraints,
            locale,
          },
          emit
        )
      } catch (error) {
        console.error('[SSE /api/generate stream]', error)
        emit('generation_error', {
          message: 'An unexpected error occurred during generation.',
          code: 'INTERNAL_ERROR',
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
