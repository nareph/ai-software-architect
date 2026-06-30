"use client"

// src/components/artifacts/MermaidRenderer.tsx
import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

interface MermaidRendererProps {
  chart: string
  title?: string
}

export function MermaidRenderer({ chart, title }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2, 9)}`)

  useEffect(() => {
    let cancelled = false

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default

        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          themeVariables: {
            primaryColor: '#6366F1',
            primaryTextColor: resolvedTheme === 'dark' ? '#F1F5F9' : '#0F172A',
            primaryBorderColor: '#6366F1',
            lineColor: resolvedTheme === 'dark' ? '#475569' : '#94A3B8',
            background: resolvedTheme === 'dark' ? '#1E293B' : '#ffffff',
            secondaryColor: resolvedTheme === 'dark' ? '#1E1B4B' : '#EEF2FF',
          },
          securityLevel: 'strict',
        })

        const { svg: renderedSvg } = await mermaid.render(idRef.current, chart)

        if (!cancelled) {
          setSvg(renderedSvg)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to render this diagram.')
          console.error('[Mermaid render error]', err)
        }
      }
    }

    render()
    return () => { cancelled = true }
  }, [chart, resolvedTheme])

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {title && (
        <div
          className="px-4 py-2.5 border-b text-xs font-medium"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground-secondary)' }}
        >
          {title}
        </div>
      )}
      <div className="p-6 overflow-x-auto">
        {error && (
          <p className="text-sm text-center py-8" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}
        {!error && !svg && (
          <div className="flex items-center justify-center py-8">
            <div
              className="w-5 h-5 rounded-full border-2 animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--brand)' }}
            />
          </div>
        )}
        {!error && svg && (
          <div
            ref={containerRef}
            className="flex justify-center [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        )}
      </div>
    </div>
  )
}
