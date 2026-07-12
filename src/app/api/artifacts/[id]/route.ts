import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { artifacts, projects } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const artifact = await db.query.artifacts.findFirst({
    where: eq(artifacts.id, id),
  })

  if (!artifact) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Verify ownership via project
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, artifact.projectId),
      eq(projects.userId, session.user.id)
    ),
  })

  if (!project) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ artifact })
}