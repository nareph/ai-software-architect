// src/app/api/export/[projectId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects, artifacts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { z } from 'zod'
import { generateMarkdown } from '@/lib/export/markdown'
import { generateJSON } from '@/lib/export/json'
import { PIPELINE_STEPS } from '@/lib/agents/types'

const ExportSchema = z.object({
  format: z.enum(['markdown', 'json', 'pdf']),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }

  const { projectId } = await params

  // Validate format
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

  // Fetch project
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

  // Fetch artifacts in pipeline order
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

  // Sanitize filename
  const safeName = project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50)
  const dateStr = new Date().toISOString().slice(0, 10)
  const baseFilename = `${safeName}-${dateStr}`

  // Generate export
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
    // PDF — Phase suivante
    return NextResponse.json(
      { error: { code: 'NOT_IMPLEMENTED', message: 'PDF export coming soon' } },
      { status: 501 }
    )
  }

  return NextResponse.json(
    { error: { code: 'VALIDATION_ERROR', message: 'Unknown format' } },
    { status: 400 }
  )
}