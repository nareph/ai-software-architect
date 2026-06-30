"use client"

// src/components/layout/ErrorState.tsx
import { useRouter } from 'next/navigation'
import { AlertTriangle, FileQuestion, ServerCrash, ArrowLeft, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorVariant = 'not-found' | 'server-error' | 'unauthorized' | 'generic'

interface ErrorStateProps {
  variant?: ErrorVariant
  title: string
  description: string
  backLabel: string
  homeLabel?: string
  code?: string | number
  onRetry?: () => void
  retryLabel?: string
}

const variantConfig: Record<ErrorVariant, { icon: React.ElementType; color: string }> = {
  'not-found':    { icon: FileQuestion, color: 'var(--brand)' },
  'server-error': { icon: ServerCrash,  color: 'var(--danger)' },
  'unauthorized': { icon: AlertTriangle, color: 'var(--warning)' },
  'generic':      { icon: AlertTriangle, color: 'var(--danger)' },
}

export function ErrorState({
  variant = 'generic',
  title,
  description,
  backLabel,
  homeLabel,
  code,
  onRetry,
  retryLabel,
}: ErrorStateProps) {
  const router = useRouter()
  const { icon: Icon, color } = variantConfig[variant]

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center">

      {/* Blueprint grid background accent */}
      <div className="relative mb-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{ background: `color-mix(in srgb, ${color} 12%, transparent)` }}
        >
          <Icon className="w-10 h-10" style={{ color }} />
        </div>
        {code && (
          <span
            className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'var(--surface)', border: `1px solid ${color}`, color }}
          >
            {code}
          </span>
        )}
      </div>

      <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
        {title}
      </h1>
      <p className="text-sm max-w-md mb-8" style={{ color: 'var(--foreground-secondary)' }}>
        {description}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Button>

        {onRetry && (
          <Button onClick={onRetry} className="gap-2">
            {retryLabel}
          </Button>
        )}

        {homeLabel && (
          <Button onClick={() => router.push('/')} variant="ghost" className="gap-2">
            <Home className="w-4 h-4" />
            {homeLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
