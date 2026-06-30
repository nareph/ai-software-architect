"use client"

// src/app/[locale]/error.tsx
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ErrorState } from '@/components/layout/ErrorState'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errors')

  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <ErrorState
        variant="server-error"
        code={500}
        title={t('serverError')}
        description={error.message || t('notFoundDesc')}
        backLabel={t('backHome')}
        onRetry={reset}
        retryLabel="Retry"
      />
    </div>
  )
}
