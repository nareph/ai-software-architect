"use client"

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ArrowRight, CheckCircle2, Clock, AlertCircle, FileEdit, Archive } from 'lucide-react'

type ProjectStatus = 'draft' | 'generating' | 'completed' | 'partial' | 'archived'

interface ProjectRowProps {
  id: string
  name: string
  description: string
  status: ProjectStatus
  template: string | null
  artifactsCompleted: number
  artifactsTotal: number
  updatedAt: Date
  isLast: boolean
}

const statusConfig: Record<ProjectStatus, {
  label: string
  color: string
  bg: string
  icon: React.ElementType
}> = {
  draft:      { label: 'Brouillon',   color: 'var(--foreground-tertiary)', bg: 'var(--background-tertiary)', icon: FileEdit },
  generating: { label: 'En cours...', color: 'var(--warning)',             bg: 'var(--warning-muted)',       icon: Clock },
  completed:  { label: 'Terminé',     color: 'var(--success)',             bg: 'var(--success-muted)',       icon: CheckCircle2 },
  partial:    { label: 'Incomplet',   color: 'var(--warning)',             bg: 'var(--warning-muted)',       icon: AlertCircle },
  archived:   { label: 'Archivé',     color: 'var(--foreground-tertiary)', bg: 'var(--background-tertiary)', icon: Archive },
}

const templateLabels: Record<string, string> = {
  saas: 'SaaS', ecommerce: 'E-commerce', marketplace: 'Marketplace',
  mobile: 'Mobile', api: 'API', legacy: 'Migration', custom: 'Custom',
}

export function ProjectRow({
  id, name, description, status, template,
  artifactsCompleted, artifactsTotal, updatedAt, isLast,
}: ProjectRowProps) {
  const cfg = statusConfig[status]
  const StatusIcon = cfg.icon

  return (
    <Link href={`/projects/${id}`}>
      <div
        className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-hover)] transition-colors group"
        style={{
          background: 'var(--surface)',
          borderBottom: isLast ? 'none' : '1px solid var(--border)',
        }}
      >
        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
            {name}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--foreground-secondary)' }}>
            {description}
          </p>
        </div>

        {/* Template */}
        {template && (
          <span
            className="text-xs px-2 py-0.5 rounded-md shrink-0 hidden sm:inline"
            style={{ background: 'var(--brand-muted)', color: 'var(--brand-muted-fg)' }}
          >
            {templateLabels[template] ?? template}
          </span>
        )}

        {/* Artifacts */}
        <span className="text-xs shrink-0 hidden md:inline" style={{ color: 'var(--foreground-tertiary)' }}>
          {artifactsCompleted}/{artifactsTotal} artefacts
        </span>

        {/* Status */}
        <span
          className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium shrink-0"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>

        {/* Date */}
        <span className="text-xs shrink-0 hidden lg:inline" style={{ color: 'var(--foreground-tertiary)' }}>
          {formatDistanceToNow(new Date(updatedAt), { addSuffix: true, locale: fr })}
        </span>

        {/* Arrow */}
        <ArrowRight
          className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--brand)' }}
        />
      </div>
    </Link>
  )
}
