// src/app/[locale]/(app)/layout.tsx
import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const locale = await getLocale()

  if (!session) redirect(`/${locale}/signin`)

  return (
    <div className="flex min-h-screen">
      <Sidebar user={session.user} />
      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  )
}
