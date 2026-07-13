"use client"

// src/components/project/ProjectCard.tsx
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { ArrowRight, CheckCircle2, Clock, AlertCircle, FileEdit, Archive, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ProjectStatus = 'draft' | 'generating' | 'completed' | 'partial' | 'archived'

interface ProjectCardProps {
  id: string
  name: string
  description: string
  status: ProjectStatus
  template: string | null
  artifactsCompleted: number
  artifactsTotal: number
  createdAt: Date
  updatedAt: Date
}

const statusConfig: Record<ProjectStatus, {
  label: string; color: string; bg: string; icon: React.ElementType
}> = {
  draft:      { label: 'Draft',        color: 'var(--foreground-tertiary)', bg: 'var(--background-tertiary)', icon: FileEdit },
  generating: { label: 'Generating...', color: 'var(--warning)',             bg: 'var(--warning-muted)',       icon: Clock },
  completed:  { label: 'Completed',    color: 'var(--success)',             bg: 'var(--success-muted)',       icon: CheckCircle2 },
  partial:    { label: 'Incomplete',   color: 'var(--warning)',             bg: 'var(--warning-muted)',       icon: AlertCircle },
  archived:   { label: 'Archived',     color: 'var(--foreground-tertiary)', bg: 'var(--background-tertiary)', icon: Archive },
}

const templateLabels: Record<string, string> = {
  saas: 'SaaS', ecommerce: 'E-commerce', marketplace: 'Marketplace',
  mobile: 'Mobile', api: 'API', legacy: 'Migration', custom: 'Custom',
}

export function ProjectCard({
  id, name, description, status, template,
  artifactsCompleted, artifactsTotal, createdAt, updatedAt,
}: ProjectCardProps) {
  const router = useRouter()
  const locale = useLocale()
  const dateLocale = locale === 'fr' ? fr : enUS

  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const cfg = statusConfig[status]
  const StatusIcon = cfg.icon
  const progress = artifactsTotal > 0
    ? Math.round((artifactsCompleted / artifactsTotal) * 100)
    : 0

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!confirmDelete) {
      setConfirmDelete(true)
      // Auto-cancel confirmation after 3s
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } catch (err) {
      console.error('[Delete project]', err)
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  return (
    <div
      className="flex flex-col rounded-xl border p-5 gap-4 hover:shadow-md transition-shadow group relative"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      {/* Delete button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-3 right-3 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        style={{
          background: confirmDelete ? 'var(--danger-muted)' : 'transparent',
          color: confirmDelete ? 'var(--danger)' : 'var(--foreground-tertiary)',
        }}
        title={confirmDelete ? 'Click again to confirm deletion' : 'Delete project'}
      >
        {deleting
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Trash2 className="w-3.5 h-3.5" />
        }
      </button>

      {/* Confirm message */}
      {confirmDelete && (
        <div
          className="absolute top-10 right-3 text-xs px-2 py-1 rounded-lg z-10 whitespace-nowrap"
          style={{ background: 'var(--danger-muted)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
        >
          Click again to confirm
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 pr-6">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate mb-1" style={{ color: 'var(--foreground)' }}>
            {name}
          </h3>
          <p className="text-xs line-clamp-2" style={{ color: 'var(--foreground-secondary)' }}>
            {description}
          </p>
        </div>
        <span
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </div>

      {/* Progress bar */}
      {(status === 'generating' || status === 'partial' || status === 'completed') && (
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--foreground-tertiary)' }}>
            <span>{artifactsCompleted}/{artifactsTotal} artifacts</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: status === 'completed' ? 'var(--success)' : 'var(--brand)',
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          {template && (
            <span
              className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: 'var(--brand-muted)', color: 'var(--brand-muted-fg)' }}
            >
              {templateLabels[template] ?? template}
            </span>
          )}
          <span className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
            {formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: dateLocale })}
          </span>
        </div>

        <Link href={`/${locale}/projects/${id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--brand)' }}
          >
            Open
            <ArrowRight className="w-3 h-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
