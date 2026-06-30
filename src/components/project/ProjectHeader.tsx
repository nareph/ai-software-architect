"use client"

// src/components/project/ProjectHeader.tsx
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { useLocale } from 'next-intl'
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'

type ProjectStatus = 'draft' | 'generating' | 'completed' | 'partial' | 'archived'

interface ProjectHeaderProps {
  name: string
  status: ProjectStatus
  updatedAt: Date
  coherenceScore: number | null
}

const statusConfig: Record<ProjectStatus, { color: string; bg: string }> = {
  draft:      { color: 'var(--foreground-tertiary)', bg: 'var(--background-tertiary)' },
  generating: { color: 'var(--warning)', bg: 'var(--warning-muted)' },
  completed:  { color: 'var(--success)', bg: 'var(--success-muted)' },
  partial:    { color: 'var(--warning)', bg: 'var(--warning-muted)' },
  archived:   { color: 'var(--foreground-tertiary)', bg: 'var(--background-tertiary)' },
}

export function ProjectHeader({ name, status, updatedAt, coherenceScore }: ProjectHeaderProps) {
  const t = useTranslations('project.status')
  const locale = useLocale()
  const dateLocale = locale === 'fr' ? fr : enUS

  const cfg = statusConfig[status]

  const coherenceLevel =
    coherenceScore === null ? null :
    coherenceScore >= 0.85 ? 'good' :
    coherenceScore >= 0.70 ? 'warning' : 'bad'

  const coherenceColors = {
    good:    { color: 'var(--success)', bg: 'var(--success-muted)', Icon: ShieldCheck },
    warning: { color: 'var(--warning)', bg: 'var(--warning-muted)', Icon: ShieldAlert },
    bad:     { color: 'var(--danger)',  bg: 'var(--danger-muted)',  Icon: ShieldX },
  }

  return (
    <div
      className="flex items-center justify-between px-7 py-4 border-b"
      style={{ borderColor: 'var(--border)' }}
    >
      <div>
        <p className="text-sm font-medium mb-0.5" style={{ color: 'var(--foreground)' }}>
          {name}
        </p>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            {t(status)}
          </span>
          <span className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
            {formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: dateLocale })}
          </span>
        </div>
      </div>

      {coherenceLevel && (
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background: coherenceColors[coherenceLevel].bg }}
        >
          {(() => {
            const Icon = coherenceColors[coherenceLevel].Icon
            return <Icon className="w-4 h-4" style={{ color: coherenceColors[coherenceLevel].color }} />
          })()}
          <span
            className="text-sm font-medium"
            style={{ color: coherenceColors[coherenceLevel].color }}
          >
            {Math.round((coherenceScore ?? 0) * 100)}% coherence
          </span>
        </div>
      )}
    </div>
  )
}
