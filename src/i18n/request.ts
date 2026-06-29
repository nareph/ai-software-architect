import { getRequestConfig } from 'next-intl/server'
import { locales, defaultLocale, type Locale } from './config'

export default getRequestConfig(async ({ requestLocale }) => {
  // Lire la locale depuis l'URL
  let locale = await requestLocale

  // Valider — fallback sur la locale par défaut si invalide
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})