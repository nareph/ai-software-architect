"use client"

// src/components/artifacts/ArtifactSidebar.tsx
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  ClipboardList, Layers, Database, Workflow, ListChecks,
  Check, Loader2, AlertCircle, Download, MessageCircle, RefreshCw,
} from 'lucide-react'
import { ExportMenu } from '@/components/export/ExportMenu'
import type { ArtifactType } from '@/lib/agents/types'
import { PIPELINE_STEPS } from '@/lib/agents/types'

interface ArtifactSidebarProps {
  projectId: string
  activeArtifact: ArtifactType
  onSelect: (type: ArtifactType) => void
  artifactStatuses: Record<ArtifactType, 'pending' | 'generating' | 'completed' | 'failed'>
  onRetrySuccess?: (artifactType: ArtifactType) => void
}

const artifactIcons: Record<ArtifactType, React.ElementType> = {
  business_analysis: ClipboardList,
  architecture:      Layers,
  database_schema:   Database,
  diagrams:          Workflow,
  backlog:           ListChecks,
}

export function ArtifactSidebar({
  projectId,
  activeArtifact,
  onSelect,
  artifactStatuses,
  onRetrySuccess,
}: ArtifactSidebarProps) {
  const t = useTranslations('generation.steps')
  const tCommon = useTranslations('common')

  const [retrying, setRetrying] = useState<ArtifactType | null>(null)
  const [retryError, setRetryError] = useState<string | null>(null)

  async function handleRetry(artifactType: ArtifactType) {
    setRetrying(artifactType)
    setRetryError(null)

    try {
      const res = await fetch(`/api/generate/${projectId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifactType }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Failed to start retry')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n')

        let eventName = ''

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventName = line.slice(7).trim()
          }
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (eventName === 'retry_completed') {
                onRetrySuccess?.(artifactType)
              }
              if (eventName === 'retry_failed') {
                // Parse le vrai message d'erreur
                const errorMsg = data.error ?? 'Unknown error'
                if (errorMsg.includes('503') || errorMsg.includes('UNAVAILABLE')) {
                  throw new Error('LLM service temporarily unavailable. Please try again in a few minutes.')
                }
                if (errorMsg.includes('429') || errorMsg.includes('quota')) {
                  throw new Error('API quota exceeded. Please try again later or check your billing.')
                }
                if (errorMsg.includes('402') || errorMsg.includes('Insufficient Balance')) {
                  throw new Error('DeepSeek account balance insufficient. Please recharge your account.')
                }
                throw new Error(errorMsg)
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'retry_failed') throw e
            }
            eventName = ''
          }
        }
      }
    } catch (err) {
      setRetryError((err as Error).message)
    } finally {
      setRetrying(null)
    }
  }

  const hasFailedArtifacts = PIPELINE_STEPS.some(
    t => artifactStatuses[t] === 'failed'
  )

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
          const isRetrying = retrying === type

          return (
            <div key={type} className="flex items-center gap-1">
              <button
                onClick={() => onSelect(type)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors text-left flex-1 min-w-0"
                style={{
                  background: active ? 'var(--brand-muted)' : 'transparent',
                  color: active ? 'var(--brand-muted-fg)' : 'var(--foreground)',
                }}
              >
                <Icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: active ? 'var(--brand)' : 'var(--foreground-secondary)' }}
                />
                <span className="flex-1 truncate text-xs">{t(type)}</span>

                {isRetrying && (
                  <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" style={{ color: 'var(--brand)' }} />
                )}
                {!isRetrying && status === 'completed' && (
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--success)' }} />
                )}
                {!isRetrying && status === 'generating' && (
                  <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" style={{ color: 'var(--brand)' }} />
                )}
                {!isRetrying && status === 'failed' && (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--danger)' }} />
                )}
              </button>

              {/* Retry button — only for failed artifacts */}
              {status === 'failed' && !isRetrying && (
                <button
                  onClick={() => handleRetry(type)}
                  className="p-1.5 rounded-lg transition-colors shrink-0 hover:bg-[var(--surface-hover)]"
                  style={{ color: 'var(--danger)' }}
                  title="Retry generation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </nav>

      {/* Retry error */}
      {retryError && (
        <div
          className="mx-2 mt-2 p-2 rounded-lg text-xs"
          style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
        >
          {retryError}
        </div>
      )}

      {/* Export */}
      <div className="mt-auto pt-3 border-t flex flex-col gap-1" style={{ borderColor: 'var(--border)' }}>
        <p
          className="text-xs font-medium px-2.5 mb-1"
          style={{ color: 'var(--foreground-tertiary)' }}
        >
          Export
        </p>
        <ExportMenu projectId={projectId} />
      </div>

      {/* Feedback — coming soon */}
      <div className="pt-1">
        <button
          disabled
          title={tCommon('comingSoon')}
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed w-full"
          style={{ color: 'var(--foreground-secondary)' }}
        >
          <MessageCircle className="w-4 h-4 shrink-0" />
          Feedback
        </button>
      </div>
    </div>
  )
}
