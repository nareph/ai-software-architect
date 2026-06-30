"use client"

// src/app/[locale]/not-found.tsx
import { useTranslations } from 'next-intl'
import { ErrorState } from '@/components/layout/ErrorState'

export default function NotFound() {
  const t = useTranslations('errors')

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <ErrorState
        variant="not-found"
        code={404}
        title={t('notFound')}
        description={t('notFoundDesc')}
        backLabel={t('backHome')}
      />
    </div>
  )
}
