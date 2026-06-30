"use client"

// src/components/artifacts/views/ArchitectureView.tsx
import { Layers, Package, AlertTriangle, Puzzle } from 'lucide-react'

interface ArchitectureContent {
  overview: string
  style: string
  justification: string
  stack: { layer: string; technology: string; justification: string; alternatives: string[] }[]
  modules: { name: string; responsibility: string; technology: string; dependencies: string[] }[]
  patterns: { name: string; justification: string }[]
  risks: { description: string; severity: string; mitigation: string }[]
  scalabilityNotes: string
}

const severityColors: Record<string, { color: string; bg: string }> = {
  high:   { color: 'var(--danger)', bg: 'var(--danger-muted)' },
  medium: { color: 'var(--warning)', bg: 'var(--warning-muted)' },
  low:    { color: 'var(--info)', bg: 'var(--info-muted)' },
}

export function ArchitectureView({ content }: { content: ArchitectureContent }) {
  return (
    <div className="flex flex-col gap-6">

      {/* Style + overview */}
      <div
        className="rounded-lg p-4"
        style={{ background: 'var(--background-secondary)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Layers className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <span
            className="text-sm font-semibold px-2 py-0.5 rounded-md"
            style={{ background: 'var(--brand-muted)', color: 'var(--brand-muted-fg)' }}
          >
            {content.style}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
          {content.overview}
        </p>
      </div>

      {/* Stack */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Package className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Technology stack</h3>
        </div>
        <div className="flex flex-col gap-2">
          {content.stack.map((item) => (
            <div
              key={item.layer}
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: 'var(--foreground-tertiary)' }}>
                  {item.layer}
                </span>
                <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {item.technology}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                {item.justification}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modules */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Puzzle className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Modules</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.modules.map((module) => (
            <div
              key={module.name}
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                {module.name}
              </p>
              <p className="text-xs mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                {module.responsibility}
              </p>
              <span
                className="text-xs px-2 py-0.5 rounded-md"
                style={{ background: 'var(--background-tertiary)', color: 'var(--foreground-tertiary)' }}
              >
                {module.technology}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Risks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Risks</h3>
        </div>
        <div className="flex flex-col gap-2">
          {content.risks.map((risk, i) => {
            const sCfg = severityColors[risk.severity] ?? severityColors.medium
            return (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border p-3"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5"
                  style={{ color: sCfg.color, background: sCfg.bg }}
                >
                  {risk.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: 'var(--foreground)' }}>{risk.description}</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--foreground-tertiary)' }}>
                    Mitigation: {risk.mitigation}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Scalability */}
      <div
        className="rounded-lg p-4 border"
        style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
      >
        <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Scalability notes</h3>
        <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
          {content.scalabilityNotes}
        </p>
      </div>
    </div>
  )
}
