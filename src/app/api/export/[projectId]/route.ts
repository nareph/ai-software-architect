// src/app/api/export/[projectId]/route.ts
// Route export avec rate limiting

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects, artifacts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { generateMarkdown } from '@/lib/export/markdown'
import { generateJSON } from '@/lib/export/json'
import { generatePDF } from '@/lib/export/pdf'
import { PIPELINE_STEPS } from '@/lib/agents/types'
import { getExportLimiter, checkRateLimit } from '@/lib/utils/ratelimit'

const ExportSchema = z.object({
  format: z.enum(['markdown', 'json', 'pdf']),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  // ── Rate limiting ──────────────────────────────────────────────────────────
  try {
    const limiter = getExportLimiter()
    const rl = await checkRateLimit(limiter, session.user.id)

    if (!rl.success) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Export limit reached (${rl.limit}/hour). Try again later.`,
            resetAt: new Date(rl.reset).toISOString(),
          },
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rl.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rl.reset).toISOString(),
          },
        }
      )
    }
  } catch (rlError) {
    console.error('[RateLimit] Redis unavailable for export:', rlError)
  }

  const { projectId } = await params

  // ── Validate format ────────────────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } },
      { status: 400 }
    )
  }

  const parsed = ExportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Format must be markdown, json, or pdf' } },
      { status: 400 }
    )
  }

  const { format } = parsed.data

  // ── Fetch project ──────────────────────────────────────────────────────────
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.userId, session.user.id)
    ),
  })

  if (!project) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Project not found' } },
      { status: 404 }
    )
  }

  // ── Fetch artifacts ────────────────────────────────────────────────────────
  const projectArtifacts = await db.query.artifacts.findMany({
    where: eq(artifacts.projectId, project.id),
  })

  const orderedArtifacts = PIPELINE_STEPS
    .map(type => projectArtifacts.find(a => a.type === type))
    .filter((a): a is NonNullable<typeof a> => a !== undefined && a.status === 'completed')
    .map(a => ({
      type: a.type,
      content: a.content,
      coherenceScore: a.coherenceScore ? parseFloat(a.coherenceScore as any) : null,
    }))

  if (orderedArtifacts.length === 0) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'No completed artifacts to export' } },
      { status: 400 }
    )
  }

  const exportProject = {
    id: project.id,
    name: project.name,
    description: project.description,
    template: project.template,
    createdAt: project.createdAt,
    artifacts: orderedArtifacts,
  }

  const safeName = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
  const dateStr = new Date().toISOString().slice(0, 10)
  const baseFilename = `${safeName}-${dateStr}`

  // ── Generate export ────────────────────────────────────────────────────────
  if (format === 'markdown') {
    const content = generateMarkdown(exportProject)
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${baseFilename}.md"`,
      },
    })
  }

  if (format === 'json') {
    const content = generateJSON(exportProject)
    return new NextResponse(content, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="${baseFilename}.json"`,
      },
    })
  }

  if (format === 'pdf') {
    try {
      const pdfBuffer = await generatePDF(exportProject)
      return new NextResponse(new Uint8Array(pdfBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${baseFilename}.pdf"`,
        },
      })
    } catch (error) {
      console.error('PDF generation error:', error)
      return NextResponse.json(
        { error: { code: 'PDF_GENERATION_ERROR', message: 'Failed to generate PDF' } },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: 'Unknown format' } },
    { status: 400 }
  )
}
