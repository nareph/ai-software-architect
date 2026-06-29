"use client"

// src/app/[locale]/(auth)/register/page.tsx
import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'

export default function RegisterPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth.register')

  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const schema = z.object({
    name: z.string().min(1).max(255),
    email: z.email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  }).refine(d => d.password === d.confirmPassword, {
    message: t('passwordMismatch'),
    path: ['confirmPassword'],
  })
  type FormData = z.infer<typeof schema>

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setServerError(null)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      })
      const json = await res.json()

      if (!res.ok) {
        if (res.status === 409) { setServerError(t('emailConflict')); return }
        setServerError(json.error?.message ?? t('serverError'))
        return
      }

      const { signIn } = await import('next-auth/react')
      await signIn('credentials', { email: data.email, password: data.password, redirect: false })
      router.push(`/${locale}/dashboard`)
      router.refresh()
    } catch {
      setServerError(t('serverError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form id="register-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {(['name', 'email', 'password', 'confirmPassword'] as const).map(fieldName => (
                <Controller
                  key={fieldName}
                  name={fieldName}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={`register-${fieldName}`}>
                        {t(`${fieldName}Label`)}
                      </FieldLabel>
                      <Input
                        {...field}
                        id={`register-${fieldName}`}
                        type={fieldName.toLowerCase().includes('password') ? 'password' : fieldName === 'email' ? 'email' : 'text'}
                        placeholder={t(`${fieldName}Placeholder`)}
                        autoComplete={
                          fieldName === 'email' ? 'username' :
                          fieldName === 'name' ? 'name' : 'new-password'
                        }
                        data-lpignore={fieldName === 'email' ? 'true' : undefined}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              ))}
              {serverError && (
                <div
                  className="flex items-center gap-2 p-3 rounded-lg text-sm"
                  style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {serverError}
                </div>
              )}
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            form="register-form"
            className="w-full font-semibold"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {t('submitLoading')}
              </span>
            ) : t('submitButton')}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {t('alreadyAccount')}{' '}
            <Link
              href={`/${locale}/signin`}
              className="font-medium underline-offset-4 hover:underline"
              style={{ color: 'var(--brand)' }}
            >
              {t('signinLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
