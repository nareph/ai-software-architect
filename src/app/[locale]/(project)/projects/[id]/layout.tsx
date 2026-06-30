// src/app/[locale]/(app)/projects/[id]/layout.tsx
// Layout spécifique aux pages projet : sidebar globale réduite à une icon rail

import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { ProjectIconRail } from '@/components/layout/ProjectIconRail'

export default async function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  const locale = await getLocale()

  if (!session) redirect(`/${locale}/signin`)

  return (
    <div className="flex min-h-screen">
      <ProjectIconRail />
      <main className="flex-1 flex min-w-0">
        {children}
      </main>
    </div>
  )
}
