"use client"

// src/components/layout/ProjectIconRail.tsx
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, Settings } from 'lucide-react'

export function ProjectIconRail() {
  const locale = useLocale()
  const t = useTranslations('nav')

  return (
    <aside
      className="w-14 flex flex-col items-center py-4 gap-5 border-r shrink-0"
      style={{ background: 'var(--background-secondary)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: '#0F172A' }}
      >
        <svg width="16" height="16" viewBox="0 0 64 64" fill="none">
          <rect x="8" y="14" width="48" height="10" rx="3" fill="#6366F1"/>
          <rect x="8" y="27" width="48" height="10" rx="3" fill="#4F46E5" opacity="0.85"/>
          <rect x="8" y="40" width="48" height="10" rx="3" fill="#3730A3" opacity="0.7"/>
        </svg>
      </div>

      {/* Back to dashboard */}
      <Link
        href={`/${locale}/dashboard`}
        className="p-2 rounded-lg transition-colors hover:bg-[var(--surface-hover)]"
        style={{ color: 'var(--foreground-tertiary)' }}
        title={t('dashboard')}
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>

      <div className="flex-1" />

      {/* Settings */}
      <Link
        href={`/${locale}/dashboard/settings`}
        className="p-2 rounded-lg transition-colors hover:bg-[var(--surface-hover)]"
        style={{ color: 'var(--foreground-tertiary)' }}
        title={t('settings')}
      >
        <Settings className="w-4 h-4" />
      </Link>
    </aside>
  )
}
