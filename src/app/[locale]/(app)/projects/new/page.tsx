"use client"

// src/app/[locale]/(app)/projects/new/page.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

const TEMPLATE_KEYS = ['', 'saas', 'ecommerce', 'marketplace', 'mobile', 'api', 'legacy'] as const

export default function NewProjectPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('newProject')

  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const schema = z.object({
    name: z.string().min(1, 'Project name is required').max(80, 'Maximum 80 characters'),
    description: z
      .string()
      .min(1)
      .refine(val => countWords(val) >= 50, t('description.tooShort', { min: 50 })),
    locale: z.enum(['fr', 'en']),
    template: z.string().optional(),
    constraints: z.string().max(500).optional(),
  })
  type FormData = z.infer<typeof schema>

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      locale: locale as 'fr' | 'en',
      template: '',
      constraints: '',
    },
  })

  const description = form.watch('description')
  const wordCount = countWords(description)
  const wordTarget = 50
  const wordProgress = Math.min((wordCount / wordTarget) * 100, 100)
  const wordOk = wordCount >= wordTarget

  async function onSubmit(data: FormData) {
    setLoading(true)
    setServerError(null)

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          locale: data.locale,
          template: data.template || null,
          constraints: data.constraints || null,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        if (res.status === 403 && json.error?.code === 'PLAN_LIMIT_REACHED') {
          setServerError(t('errors.planLimit'))
          return
        }
        if (res.status === 401) {
          router.push(`/${locale}/signin`)
          return
        }
        setServerError(json.error?.message ?? t('errors.serverError'))
        return
      }

      router.push(`/${locale}/projects/${json.project.id}/generate`)
    } catch {
      setServerError(t('errors.serverError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-8 max-w-3xl w-full mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/${locale}/dashboard`)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
            {t('title')}
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
            {t('subtitle')}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">

        {/* Project name */}
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="project-name">
                {t('name.label')}
                <span className="ml-1 text-xs font-normal" style={{ color: 'var(--foreground-tertiary)' }}>
                  {t('name.required')}
                </span>
              </FieldLabel>
              <Input
                {...field}
                id="project-name"
                placeholder={t('name.placeholder')}
                maxLength={80}
                aria-invalid={fieldState.invalid}
              />
              <div className="flex justify-between mt-1">
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : <span />}
                <span className="text-xs tabular-nums" style={{ color: (field.value?.length ?? 0) > 65 ? 'var(--warning)' : 'var(--foreground-tertiary)' }}>
                  {field.value?.length ?? 0}/80
                </span>
              </div>
            </Field>
          )}
        />

        {/* Content language */}
        <Controller
          name="locale"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                {t('language.label')}
                <span className="ml-1 text-xs font-normal" style={{ color: 'var(--foreground-tertiary)' }}>
                  {t('language.hint')}
                </span>
              </FieldLabel>
              <div className="flex gap-3 mt-1">
                {[
                  { value: 'en', flag: '🇬🇧', label: 'English' },
                  { value: 'fr', flag: '🇫🇷', label: 'Français' },
                ].map(({ value, flag, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => field.onChange(value)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all"
                    style={{
                      background: field.value === value ? 'var(--brand-muted)' : 'var(--surface)',
                      borderColor: field.value === value ? 'var(--brand)' : 'var(--border)',
                      color: field.value === value ? 'var(--brand-muted-fg)' : 'var(--foreground)',
                    }}
                  >
                    <span className="text-lg">{flag}</span>
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--foreground-tertiary)' }}>
                {t('language.description')}
              </p>
            </Field>
          )}
        />

        {/* Description */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="description">
                {t('description.label')}
                <span className="ml-1 text-xs font-normal" style={{ color: 'var(--foreground-tertiary)' }}>
                  {t('description.required')}
                </span>
              </FieldLabel>
              <textarea
                {...field}
                id="description"
                rows={8}
                placeholder={t('description.placeholder')}
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--surface)',
                  borderColor: fieldState.invalid ? 'var(--danger)' : 'var(--border)',
                  color: 'var(--foreground)',
                  lineHeight: '1.7',
                } as React.CSSProperties}
                aria-invalid={fieldState.invalid}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${wordProgress}%`,
                        background: wordOk ? 'var(--success)' : 'var(--brand)',
                      }}
                    />
                  </div>
                  <span className="text-xs shrink-0 tabular-nums" style={{ color: wordOk ? 'var(--success)' : 'var(--foreground-tertiary)' }}>
                    {t('description.wordCount', { count: wordCount, target: wordTarget })}
                  </span>
                </div>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Template */}
        <Controller
          name="template"
          control={form.control}
          render={({ field }) => (
            <Field>
              <FieldLabel>
                {t('template.label')}
                <span className="ml-1 text-xs font-normal" style={{ color: 'var(--foreground-tertiary)' }}>
                  {t('template.optional')}
                </span>
              </FieldLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-1">
                {TEMPLATE_KEYS.map((key) => {
                  const selected = field.value === key
                  const desc = key === '' ? t('template.noneDesc') : t(`template.${key}Desc`)
                  return (
                    <button
                      key={key || 'none'}
                      type="button"
                      onClick={() => field.onChange(key)}
                      className="flex flex-col items-start p-3 rounded-xl border text-left transition-all"
                      style={{
                        background: selected ? 'var(--brand-muted)' : 'var(--surface)',
                        borderColor: selected ? 'var(--brand)' : 'var(--border)',
                        color: selected ? 'var(--brand-muted-fg)' : 'var(--foreground)',
                      }}
                    >
                      <span className="text-xs font-medium capitalize">
                        {key === '' ? t('template.none') : key}
                      </span>
                      <span className="text-xs mt-0.5" style={{ color: selected ? 'var(--brand)' : 'var(--foreground-tertiary)' }}>
                        {desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Field>
          )}
        />

        {/* Constraints */}
        <Controller
          name="constraints"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="constraints">
                {t('constraints.label')}
                <span className="ml-1 text-xs font-normal" style={{ color: 'var(--foreground-tertiary)' }}>
                  {t('constraints.optional')}
                </span>
              </FieldLabel>
              <textarea
                {...field}
                id="constraints"
                rows={3}
                placeholder={t('constraints.placeholder')}
                className="w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
                style={{
                  background: 'var(--surface)',
                  borderColor: fieldState.invalid ? 'var(--danger)' : 'var(--border)',
                  color: 'var(--foreground)',
                } as React.CSSProperties}
              />
              <div className="flex justify-between mt-1">
                {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : <span />}
                <span className="text-xs tabular-nums" style={{ color: (field.value?.length ?? 0) > 450 ? 'var(--warning)' : 'var(--foreground-tertiary)' }}>
                  {t('constraints.maxChars', { count: field.value?.length ?? 0 })}
                </span>
              </div>
            </Field>
          )}
        />

        {serverError && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl border"
            style={{ background: 'var(--danger-muted)', borderColor: 'var(--danger)', color: 'var(--danger)' }}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-sm">{serverError}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
            {t('submit.estimatedTime')}
          </p>
          <Button type="submit" size="lg" className="gap-2" disabled={loading || !wordOk}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                {t('submit.loading')}
              </span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {t('submit.button')}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
