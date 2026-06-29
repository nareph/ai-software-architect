"use client"

// src/components/layout/LanguageSwitcher.tsx
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { locales, type Locale } from '@/i18n/config'
import { Button } from '@/components/ui/button'

const localeLabels: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
}

const localeFlags: Record<Locale, string> = {
  fr: '🇫🇷',
  en: '🇬🇧',
}

export function LanguageSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(newLocale: Locale) {
    if (newLocale === locale) return
    // Remplace le préfixe de locale dans l'URL
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
    router.refresh()
  }

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg border"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      {locales.map(l => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors"
          style={{
            background: locale === l ? 'var(--surface-active)' : 'transparent',
            color: locale === l ? 'var(--brand)' : 'var(--foreground-tertiary)',
          }}
          title={l === 'fr' ? 'Français' : 'English'}
        >
          <span>{localeFlags[l]}</span>
          <span>{localeLabels[l]}</span>
        </button>
      ))}
    </div>
  )
}
