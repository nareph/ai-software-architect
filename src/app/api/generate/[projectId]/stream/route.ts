// src/app/api/generate/[projectId]/stream/route.ts
// Lit la locale depuis le projet en DB — plus depuis le Referer header

import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { runGenerationPipeline } from '@/lib/agents/orchestrator'
import { getGenerationLimiter, checkRateLimit } from '@/lib/utils/ratelimit'
import type { SSEEmitter } from '@/lib/agents/types'

function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
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

  // Rate limiting
  try {
    const limiter = getGenerationLimiter()
    const rl = await checkRateLimit(limiter, session.user.id)
    if (!rl.success) {
      const resetDate = new Date(rl.reset).toISOString()
      const encoder = new TextEncoder()
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(sseMessage('generation_error', {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Limit of ${rl.limit} generations/hour reached. Reset at ${resetDate}.`,
            resetAt: resetDate,
          })))
          controller.close()
        }
      })
      return new Response(stream, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
      })
    }
  } catch (rlError) {
    console.error('[RateLimit] Redis unavailable:', rlError)
  }

  // Fetch project — locale is stored in DB
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.userId, session.user.id)
    ),
  })

  if (!project) return new Response('Not found', { status: 404 })

  // Use project locale directly — not from headers
  const locale = (project.locale ?? 'en') as 'fr' | 'en'
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
        console.error('[SSE generate stream]', error)
        emit('generation_error', {
          message: 'An unexpected error occurred.',
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
