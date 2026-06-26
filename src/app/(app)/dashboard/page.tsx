import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects, artifacts } from '@/lib/db/schema'
import { eq, and, ne, count, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/project/ProjectCard'
import { DashboardClient } from './DashboardClient'

export const metadata = { title: 'Dashboard' }

async function getUserProjects(userId: string) {
  const rows = await db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      status: projects.status,
      template: projects.template,
      createdAt: projects.createdAt,
      updatedAt: projects.updatedAt,
      artifactsCompleted: sql<number>`count(case when ${artifacts.status} = 'completed' then 1 end)::int`,
      artifactsTotal: sql<number>`count(${artifacts.id})::int`,
    })
    .from(projects)
    .leftJoin(artifacts, eq(artifacts.projectId, projects.id))
    .where(
      and(
        eq(projects.userId, userId),
        ne(projects.status, 'archived')
      )
    )
    .groupBy(projects.id)
    .orderBy(sql`${projects.updatedAt} desc`)

  return rows
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/signin')

  const userProjects = await getUserProjects(session.user.id)
  const firstName = session.user.name?.split(' ')[0] ?? 'là'

  return (
    <div className="flex flex-col flex-1 px-8 py-8 max-w-6xl w-full mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-2xl font-semibold mb-1"
            style={{ color: 'var(--foreground)' }}
          >
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {userProjects.length === 0
              ? 'Créez votre premier projet pour commencer.'
              : `${userProjects.length} projet${userProjects.length > 1 ? 's' : ''} en cours.`}
          </p>
        </div>

        <Link href="/projects/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Empty state */}
      {userProjects.length === 0 && (
        <div
          className="flex flex-col items-center justify-center flex-1 rounded-xl border border-dashed py-24 gap-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--brand-muted)' }}
          >
            <FolderOpen className="w-6 h-6" style={{ color: 'var(--brand)' }} />
          </div>
          <div className="text-center">
            <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
              Aucun projet pour l'instant
            </p>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              Décrivez votre idée et laissez l'IA générer l'architecture complète.
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="gap-2 mt-2">
              <Plus className="w-4 h-4" />
              Créer mon premier projet
            </Button>
          </Link>
        </div>
      )}

      {/* Projects grid */}
      {userProjects.length > 0 && (
        <DashboardClient projects={userProjects} />
      )}
    </div>
  )
}
