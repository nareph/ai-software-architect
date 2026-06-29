// src/i18n/config.ts
export const locales = ['fr', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'fr'

// Pour changer la langue par défaut :
// Dans .env.local / Vercel env vars :
// NEXT_PUBLIC_DEFAULT_LOCALE=en
export function getDefaultLocale(): Locale {
  const envLocale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE
  if (envLocale && locales.includes(envLocale as Locale)) {
    return envLocale as Locale
  }
  return defaultLocale
}
