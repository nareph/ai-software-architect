"use client"

// src/components/export/ExportMenu.tsx
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Download, FileText, Braces, FileImage, Loader2, Check } from 'lucide-react'

type ExportFormat = 'markdown' | 'json' | 'pdf'
type ExportState = 'idle' | 'loading' | 'success' | 'error'

interface ExportMenuProps {
  projectId: string
}

const formats: { key: ExportFormat; icon: React.ElementType; label: string; ext: string; available: boolean }[] = [
  { key: 'markdown', icon: FileText,  label: 'Markdown',  ext: '.md',   available: true },
  { key: 'json',     icon: Braces,    label: 'JSON',      ext: '.json', available: true },
  { key: 'pdf',      icon: FileImage, label: 'PDF',       ext: '.pdf',  available: false },
]

export function ExportMenu({ projectId }: ExportMenuProps) {
  const tCommon = useTranslations('common')
  const [states, setStates] = useState<Record<ExportFormat, ExportState>>({
    markdown: 'idle',
    json: 'idle',
    pdf: 'idle',
  })

  async function handleExport(format: ExportFormat) {
    if (states[format] === 'loading') return

    setStates(prev => ({ ...prev, [format]: 'loading' }))

    try {
      const res = await fetch(`/api/export/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error?.message ?? 'Export failed')
      }

      // Trigger download
      const blob = await res.blob()
      const contentDisposition = res.headers.get('Content-Disposition') ?? ''
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/)
      const filename = filenameMatch?.[1] ?? `export.${format === 'markdown' ? 'md' : format}`

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setStates(prev => ({ ...prev, [format]: 'success' }))
      setTimeout(() => setStates(prev => ({ ...prev, [format]: 'idle' })), 2000)

    } catch (err) {
      console.error('[Export error]', err)
      setStates(prev => ({ ...prev, [format]: 'error' }))
      setTimeout(() => setStates(prev => ({ ...prev, [format]: 'idle' })), 3000)
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {formats.map(({ key, icon: Icon, label, ext, available }) => {
        const state = states[key]
        const isLoading = state === 'loading'
        const isSuccess = state === 'success'
        const isError = state === 'error'

        if (!available) {
          return (
            <button
              key={key}
              disabled
              title={tCommon('comingSoon')}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium opacity-40 cursor-not-allowed text-left"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{label}</span>
              <span className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>{ext}</span>
            </button>
          )
        }

        return (
          <button
            key={key}
            onClick={() => handleExport(key)}
            disabled={isLoading}
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors text-left hover:bg-[var(--surface-hover)]"
            style={{
              color: isError ? 'var(--danger)' : isSuccess ? 'var(--success)' : 'var(--foreground)',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" style={{ color: 'var(--brand)' }} />
            ) : isSuccess ? (
              <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} />
            ) : (
              <Icon className="w-4 h-4 shrink-0" />
            )}
            <span className="flex-1">
              {isLoading ? 'Exporting...' : isError ? 'Error — retry' : label}
            </span>
            <span className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>{ext}</span>
          </button>
        )
      })}
    </div>
  )
}