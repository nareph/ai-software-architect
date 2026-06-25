"use client"

import * as z from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"

const schema = z.object({
  email: z.email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})

type FormData = z.infer<typeof schema>

export default function SignInPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setServerError(null)

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setServerError("Email ou mot de passe incorrect")
        return
      }

      router.push("/dashboard")
      router.refresh()
    } catch {
      setServerError("Impossible de joindre le serveur. Réessaie.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Connexion</CardTitle>
          <CardDescription>
            Accédez à votre espace AI Software Architect
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id="signin-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="signin-email"
                      type="email"
                      placeholder="vous@exemple.com"
                      autoComplete="name"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="signin-password">Mot de passe</FieldLabel>
                    <Input
                      {...field}
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              {serverError && (
                <p className="text-sm text-destructive">{serverError}</p>
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
                Connexion...
              </span>
            ) : "Se connecter"}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-primary font-medium underline-offset-4 hover:underline">
              Créer un compte
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}