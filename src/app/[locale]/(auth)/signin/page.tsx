"use client"

// src/app/[locale]/(auth)/signin/page.tsx
import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { AlertCircle } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('auth.signin')

  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const schema = z.object({
    email: z.email(),
    password: z.string().min(1),
  })
  type FormData = z.infer<typeof schema>

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setServerError(null)
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        setServerError(t('invalidCredentials'))
        return
      }
      router.push(`/${locale}/dashboard`)
      router.refresh()
    } catch {
      setServerError(t('serverError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signin-email">{t('emailLabel')}</FieldLabel>
                    <Input
                      {...field}
                      id="signin-email"
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      autoComplete="username"
                      data-lpignore="true"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signin-password">{t('passwordLabel')}</FieldLabel>
                    <Input
                      {...field}
                      id="signin-password"
                      type="password"
                      placeholder={t('passwordPlaceholder')}
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
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
            form="signin-form"
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
            {t('noAccount')}{' '}
            <Link
              href={`/${locale}/register`}
              className="font-medium underline-offset-4 hover:underline"
              style={{ color: 'var(--brand)' }}
            >
              {t('registerLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
