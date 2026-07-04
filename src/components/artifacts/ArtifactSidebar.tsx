"use client"

// src/components/artifacts/ArtifactSidebar.tsx
import { useTranslations } from 'next-intl'
import {
  ClipboardList, Layers, Database, Workflow, ListChecks,
  Check, Loader2, AlertCircle, Download, MessageCircle,
} from 'lucide-react'
import type { ArtifactType } from '@/lib/agents/types'
import { PIPELINE_STEPS } from '@/lib/agents/types'
import { ExportMenu } from '../export/ExportMenu'

interface ArtifactSidebarProps {
  activeArtifact: ArtifactType
  onSelect: (type: ArtifactType) => void
  artifactStatuses: Record<ArtifactType, 'pending' | 'generating' | 'completed' | 'failed'>,
  projectId: string
}

const artifactIcons: Record<ArtifactType, React.ElementType> = {
  business_analysis: ClipboardList,
  architecture: Layers,
  database_schema: Database,
  diagrams: Workflow,
  backlog: ListChecks,
}

export function ArtifactSidebar({ activeArtifact, onSelect, artifactStatuses, projectId }: ArtifactSidebarProps) {
  const t = useTranslations('generation.steps')

  return (
    <div
      className="w-56 flex flex-col border-r shrink-0 py-4 px-3"
      style={{ background: 'var(--background-secondary)', borderColor: 'var(--border)' }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wide px-2 mb-3"
        style={{ color: 'var(--foreground-tertiary)' }}
      >
        Artifacts
      </p>

      <nav className="flex flex-col gap-1">
        {PIPELINE_STEPS.map((type) => {
          const Icon = artifactIcons[type]
          const status = artifactStatuses[type]
          const active = activeArtifact === type

          return (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors text-left"
              style={{
                background: active ? 'var(--brand-muted)' : 'transparent',
                color: active ? 'var(--brand-muted-fg)' : 'var(--foreground)',
              }}
            >
              <Icon
                className="w-4 h-4 shrink-0"
                style={{ color: active ? 'var(--brand)' : 'var(--foreground-secondary)' }}
              />
              <span className="flex-1 truncate">{t(type)}</span>

              {status === 'completed' && (
                <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--success)' }} />
              )}
              {status === 'generating' && (
                <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" style={{ color: 'var(--brand)' }} />
              )}
              {status === 'failed' && (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--danger)' }} />
              )}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto pt-3 border-t flex flex-col gap-1" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-medium px-2.5 mb-1" style={{ color: 'var(--foreground-tertiary)' }}>
          Export
        </p>
        <ExportMenu projectId={projectId} />
      </div>
    </div>
  )
}
