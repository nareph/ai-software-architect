"use client"

// src/components/artifacts/views/BusinessAnalysisView.tsx
import { Users, ListChecks, Scale } from 'lucide-react'

interface BusinessAnalysisContent {
  summary: string
  actors: { name: string; role: string; description: string }[]
  features: { name: string; description: string; priority: string; actor: string }[]
  businessRules: string[]
  constraints: string[]
  assumptions: string[]
  outOfScope: string[]
}

const priorityColors: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--danger)', bg: 'var(--danger-muted)' },
  high:     { color: 'var(--warning)', bg: 'var(--warning-muted)' },
  medium:   { color: 'var(--info)', bg: 'var(--info-muted)' },
  low:      { color: 'var(--foreground-tertiary)', bg: 'var(--background-tertiary)' },
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-lg p-3"
      style={{ background: 'var(--background-secondary)' }}
    >
      <p className="text-xs mb-1" style={{ color: 'var(--foreground-tertiary)' }}>{label}</p>
      <p className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>{value}</p>
    </div>
  )
}

export function BusinessAnalysisView({ content }: { content: BusinessAnalysisContent }) {
  return (
    <div className="flex flex-col gap-6">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Actors" value={content.actors.length} />
        <StatCard label="Features" value={content.features.length} />
        <StatCard label="Business rules" value={content.businessRules.length} />
      </div>

      {/* Summary */}
      <div
        className="rounded-lg p-4"
        style={{ background: 'var(--background-secondary)' }}
      >
        <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground-secondary)' }}>
          {content.summary}
        </p>
      </div>

      {/* Actors */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Actors</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {content.actors.map((actor) => (
            <div
              key={actor.name}
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  {actor.name}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--brand-muted)', color: 'var(--brand-muted-fg)' }}
                >
                  {actor.role}
                </span>
              </div>
              <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                {actor.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Features</h3>
        </div>
        <div className="flex flex-col gap-2">
          {content.features.map((feature) => {
            const pCfg = priorityColors[feature.priority] ?? priorityColors.medium
            return (
              <div
                key={feature.name}
                className="flex items-start gap-3 rounded-lg border p-3"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5"
                  style={{ color: pCfg.color, background: pCfg.bg }}
                >
                  {feature.priority}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    {feature.name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-secondary)' }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Business rules */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Scale className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Business rules</h3>
        </div>
        <ul className="flex flex-col gap-2">
          {content.businessRules.map((rule, i) => (
            <li
              key={i}
              className="text-sm flex items-start gap-2"
              style={{ color: 'var(--foreground-secondary)' }}
            >
              <span className="shrink-0 mt-1.5 w-1 h-1 rounded-full" style={{ background: 'var(--brand)' }} />
              {rule}
            </li>
          ))}
        </ul>
      </div>

      {/* Constraints + Assumptions side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Constraints</h3>
          <ul className="flex flex-col gap-1.5">
            {content.constraints.map((c, i) => (
              <li key={i} className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                • {c}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Assumptions</h3>
          <ul className="flex flex-col gap-1.5">
            {content.assumptions.map((a, i) => (
              <li key={i} className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                • {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
