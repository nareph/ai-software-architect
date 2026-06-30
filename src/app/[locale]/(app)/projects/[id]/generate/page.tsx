"use client"

// src/app/[locale]/(app)/projects/[id]/generate/page.tsx
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { CheckCircle2, Clock, AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ArtifactType } from '@/lib/agents/types'
import { PIPELINE_STEPS } from '@/lib/agents/types'

type StepStatus = 'pending' | 'running' | 'completed' | 'failed'

interface Step {
  artifactType: ArtifactType
  order: number
  status: StepStatus
  durationMs?: number
  coherenceScore?: number
}

interface GeneratePageProps {
  params: Promise<{ id: string; locale: string }>
}

export default function GeneratePage({ params }: GeneratePageProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('generation')

  const [projectId, setProjectId] = useState<string | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [status, setStatus] = useState<'connecting' | 'running' | 'completed' | 'failed'>('connecting')
  const [error, setError] = useState<string | null>(null)
  const [coherenceScore, setCoherenceScore] = useState<number | null>(null)
  const [totalDurationMs, setTotalDurationMs] = useState<number | null>(null)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    params.then(p => setProjectId(p.id))
  }, [params])

  useEffect(() => {
    if (!projectId || hasStartedRef.current) return
    hasStartedRef.current = true

    const es = new EventSource(`/api/generate/${projectId}/stream`)

    es.addEventListener('generation_started', () => setStatus('running'))

    es.addEventListener('step_started', (e) => {
      const data = JSON.parse(e.data)
      setSteps(prev => {
        const exists = prev.find(s => s.artifactType === data.artifactType)
        if (exists) {
          return prev.map(s => s.artifactType === data.artifactType ? { ...s, status: 'running' } : s)
        }
        return [...prev, { artifactType: data.artifactType, order: data.order, status: 'running' }]
      })
    })

    es.addEventListener('step_completed', (e) => {
      const data = JSON.parse(e.data)
      setSteps(prev => prev.map(s =>
        s.artifactType === data.artifactType
          ? { ...s, status: 'completed', durationMs: data.durationMs, coherenceScore: data.coherenceScore }
          : s
      ))
    })

    es.addEventListener('step_failed', (e) => {
      const data = JSON.parse(e.data)
      setSteps(prev => prev.map(s =>
        s.artifactType === data.artifactType ? { ...s, status: 'failed' } : s
      ))
    })

    es.addEventListener('coherence_checked', (e) => {
      setCoherenceScore(JSON.parse(e.data).score)
    })

    es.addEventListener('generation_completed', (e) => {
      const data = JSON.parse(e.data)
      setStatus('completed')
      setTotalDurationMs(data.totalDurationMs)
      es.close()
      setTimeout(() => router.push(`/${locale}/projects/${projectId}`), 1500)
    })

    es.addEventListener('generation_error', (e) => {
      setStatus('failed')
      setError(JSON.parse(e.data).message)
      es.close()
    })

    es.onerror = () => {
      setStatus('failed')
      setError(t('error.connectionLost'))
      es.close()
    }

    return () => es.close()
  }, [projectId, router, locale, t])

  const completedCount = steps.filter(s => s.status === 'completed').length
  const totalSteps = PIPELINE_STEPS.length
  const progress = Math.round((completedCount / totalSteps) * 100)

  function handleRetry() {
    hasStartedRef.current = false
    setSteps([])
    setStatus('connecting')
    setError(null)
    setCoherenceScore(null)
    setTotalDurationMs(null)
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-6 py-16 max-w-2xl w-full mx-auto">

      <div className="text-center mb-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--brand-muted)' }}
        >
          {status === 'completed'
            ? <CheckCircle2 className="w-7 h-7" style={{ color: 'var(--success)' }} />
            : status === 'failed'
            ? <AlertCircle className="w-7 h-7" style={{ color: 'var(--danger)' }} />
            : <Sparkles className="w-7 h-7" style={{ color: 'var(--brand)' }} />
          }
        </div>
        <h1 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          {t(`title.${status}`)}
        </h1>
        <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
          {status === 'running'
            ? t('subtitle.running', { completed: completedCount, total: totalSteps })
            : t(`subtitle.${status}`)
          }
        </p>
      </div>

      {(status === 'running' || status === 'completed') && (
        <div className="w-full mb-8">
          <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${status === 'completed' ? 100 : progress}%`,
                background: status === 'completed' ? 'var(--success)' : 'var(--brand)',
              }}
            />
          </div>
          <div className="flex justify-between text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
            <span>{status === 'completed' ? t('progress.done') : t('progress.inProgress')}</span>
            <span>{status === 'completed' ? 100 : progress}%</span>
          </div>
        </div>
      )}

      <div
        className="w-full rounded-2xl border overflow-hidden"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        {PIPELINE_STEPS.map((artifactType, i) => {
          const step = steps.find(s => s.artifactType === artifactType)
          const stepStatus: StepStatus = step?.status ?? 'pending'

          return (
            <div
              key={artifactType}
              className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottom: i < totalSteps - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div className="shrink-0">
                {stepStatus === 'completed' && <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />}
                {stepStatus === 'running' && <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--brand)' }} />}
                {stepStatus === 'failed' && <AlertCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />}
                {stepStatus === 'pending' && <Clock className="w-5 h-5" style={{ color: 'var(--foreground-tertiary)' }} />}
              </div>

              <div className="flex-1">
                <p
                  className="text-sm font-medium"
                  style={{ color: stepStatus === 'pending' ? 'var(--foreground-tertiary)' : 'var(--foreground)' }}
                >
                  {t(`steps.${artifactType}`)}
                </p>
                {stepStatus === 'running' && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--brand)' }}>{t('stepStatus.running')}</p>
                )}
                {stepStatus === 'failed' && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--danger)' }}>{t('stepStatus.failed')}</p>
                )}
              </div>

              {step?.durationMs && (
                <span className="text-xs shrink-0" style={{ color: 'var(--foreground-tertiary)' }}>
                  {(step.durationMs / 1000).toFixed(1)}s
                </span>
              )}

              {step?.coherenceScore && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: 'var(--success-muted)', color: 'var(--success)' }}
                >
                  {Math.round(step.coherenceScore * 100)}%
                </span>
              )}
            </div>
          )
        })}
      </div>

      {coherenceScore !== null && (
        <div
          className="w-full flex items-center justify-between px-5 py-3 rounded-xl mt-3"
          style={{ background: 'var(--success-muted)', border: '1px solid var(--success)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--success)' }}>{t('coherence.passed')}</span>
          <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>
            {Math.round(coherenceScore * 100)}%
          </span>
        </div>
      )}

      {status === 'failed' && (
        <div className="w-full mt-6 flex flex-col gap-3">
          {error && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl border"
              style={{ background: 'var(--danger-muted)', borderColor: 'var(--danger)', color: 'var(--danger)' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => router.push(`/${locale}/dashboard`)}>
              {t('actions.backToDashboard')}
            </Button>
            <Button onClick={handleRetry}>{t('actions.retry')}</Button>
          </div>
        </div>
      )}

      {totalDurationMs && status === 'completed' && (
        <p className="mt-4 text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
          {t('duration', { seconds: (totalDurationMs / 1000).toFixed(1) })}
        </p>
      )}
    </div>
  )
}
