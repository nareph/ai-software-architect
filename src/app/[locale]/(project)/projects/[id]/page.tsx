// src/app/[locale]/(project)/projects/[id]/page.tsx
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects, artifacts } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { redirect, notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { ProjectDetailClient } from './ProjectDetailClient'
import { PIPELINE_STEPS } from '@/lib/agents/types'

interface ProjectPageProps {
  params: Promise<{ id: string; locale: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth()
  const locale = await getLocale()
  const { id } = await params

  if (!session) redirect(`/${locale}/signin`)

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, id),
      eq(projects.userId, session.user.id)
    ),
  })

  if (!project) notFound()

  const projectArtifacts = await db.query.artifacts.findMany({
    where: eq(artifacts.projectId, project.id),
  })

  const fullArtifacts = PIPELINE_STEPS.map(type => {
    const existing = projectArtifacts.find(a => a.type === type)
    return existing ?? {
      id: `pending-${type}`,
      type,
      status: 'pending' as const,
      content: null,
      coherenceScore: null,
    }
  })

  return (
    <ProjectDetailClient
      project={{
        id: project.id,
        name: project.name,
        status: project.status as any,
        updatedAt: project.updatedAt,
        artifacts: fullArtifacts.map(a => ({
          id: a.id,
          type: a.type as any,
          status: a.status as any,
          content: a.content,
          coherenceScore: a.coherenceScore
            ? parseFloat(a.coherenceScore as any)
            : null,
        })),
      }}
    />
  )
}
