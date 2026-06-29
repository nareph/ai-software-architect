// src/app/[locale]/(app)/dashboard/page.tsx
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects, artifacts } from '@/lib/db/schema'
import { eq, and, ne, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getLocale, getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Plus, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DashboardClient } from './DashboardClient'

export async function generateMetadata() {
  const t = await getTranslations('nav')
  return { title: t('dashboard') }
}

async function getUserProjects(userId: string) {
  return db
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
    .where(and(eq(projects.userId, userId), ne(projects.status, 'archived')))
    .groupBy(projects.id)
    .orderBy(sql`${projects.updatedAt} desc`)
}

export default async function DashboardPage() {
  const session = await auth()
  const locale = await getLocale()
  const t = await getTranslations('dashboard')

  if (!session) redirect(`/${locale}/signin`)

  const userProjects = await getUserProjects(session.user.id)
  const firstName = session.user.name?.split(' ')[0] ?? ''

  return (
    <div className="flex flex-col flex-1 px-8 py-8 max-w-6xl w-full mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
            {t('greeting', { name: firstName })}
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {userProjects.length === 0
              ? t('emptySubtitle')
              : t('projectsCount', { count: userProjects.length })
            }
          </p>
        </div>
        <Link href={`/${locale}/projects/new`}>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            {t('newProject')}
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
              {t('emptyState.title')}
            </p>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
              {t('emptyState.subtitle')}
            </p>
          </div>
          <Link href={`/${locale}/projects/new`}>
            <Button className="gap-2 mt-2">
              <Plus className="w-4 h-4" />
              {t('emptyState.cta')}
            </Button>
          </Link>
        </div>
      )}

      {userProjects.length > 0 && (
        <DashboardClient projects={userProjects} />
      )}
    </div>
  )
}
