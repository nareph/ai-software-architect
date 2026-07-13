// src/app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects, artifacts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// ── GET /api/projects/[id] ────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  const { id } = await params

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, session.user.id)),
  })

  if (!project) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Project not found' } },
      { status: 404 }
    )
  }

  const projectArtifacts = await db.query.artifacts.findMany({
    where: eq(artifacts.projectId, project.id),
  })

  return NextResponse.json({ project, artifacts: projectArtifacts })
}

// ── DELETE /api/projects/[id] ─────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  const { id } = await params

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.id, id), eq(projects.userId, session.user.id)),
  })

  if (!project) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Project not found' } },
      { status: 404 }
    )
  }

  // Soft delete — archive instead of hard delete
  await db.update(projects)
    .set({ status: 'archived', updatedAt: new Date() })
    .where(eq(projects.id, id))

  return NextResponse.json({ success: true, message: 'Project archived' })
}
