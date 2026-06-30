// src/app/[locale]/page.tsx
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ArrowRight, Layers, Database, GitBranch, FileText, CheckSquare, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

const GITBOOK_URL = 'https://ai-software-architect.gitbook.io/ai-software-architect/'

const Logo = () => (
  <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="14" fill="#0F172A"/>
    <rect x="12" y="14" width="40" height="10" rx="3" fill="#6366F1"/>
    <rect x="12" y="27" width="40" height="10" rx="3" fill="#4F46E5" opacity="0.85"/>
    <rect x="12" y="40" width="40" height="10" rx="3" fill="#3730A3" opacity="0.7"/>
    <circle cx="8" cy="19" r="2.5" fill="#A5B4FC"/>
    <circle cx="8" cy="32" r="2.5" fill="#A5B4FC"/>
    <circle cx="8" cy="45" r="2.5" fill="#A5B4FC"/>
    <line x1="8" y1="21.5" x2="8" y2="29.5" stroke="#6366F1" strokeWidth="1" opacity="0.6"/>
    <line x1="8" y1="34.5" x2="8" y2="42.5" stroke="#6366F1" strokeWidth="1" opacity="0.6"/>
    <rect x="14" y="17.5" width="18" height="2" rx="1" fill="#E0E7FF" opacity="0.5"/>
    <rect x="14" y="30.5" width="26" height="2" rx="1" fill="#E0E7FF" opacity="0.4"/>
    <rect x="14" y="43.5" width="22" height="2" rx="1" fill="#E0E7FF" opacity="0.3"/>
  </svg>
)

const artifactIcons = [FileText, Layers, Database, GitBranch, CheckSquare]
const artifactKeys = ['businessAnalysis', 'architecture', 'databaseSchema', 'diagrams', 'backlog'] as const

export default function LandingPage() {
  const t = useTranslations('landing')
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')

  return (
    <div className="relative min-h-screen flex flex-col">

      {/* Nav */}
      <nav
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <Logo />
          <span className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>
            {tCommon('appName')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Documentation link */}
          <a
            href={GITBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="sm" className="gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">{tNav('documentation')}</span>
            </Button>
          </a>

          <Link href="/signin">
            <Button variant="ghost" size="sm">{t('hero.ctaSecondary')}</Button>
          </Link>

          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
          style={{ background: 'var(--brand-muted)', color: 'var(--brand-muted-fg)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--brand)' }} />
          {t('badge')}
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight max-w-3xl mb-6"
          style={{ color: 'var(--foreground)', lineHeight: 1.15 }}
        >
          Architecture decisions{' '}
          <span style={{ color: 'var(--brand)' }}>{t('hero.titleHighlight')}</span>{' '}
          the first line of code
        </h1>

        <p className="text-lg max-w-xl mb-10" style={{ color: 'var(--foreground-secondary)' }}>
          {t('hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-20">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              {t('hero.ctaPrimary')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/signin">
            <Button size="lg" variant="outline">
              {t('hero.ctaSecondary')}
            </Button>
          </Link>
        </div>

        {/* Artifacts grid */}
        <div className="w-full max-w-3xl">
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--foreground-tertiary)' }}>
            {t('artifacts.sectionTitle')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {artifactKeys.map((key, i) => {
              const Icon = artifactIcons[i]
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl text-center"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="p-2 rounded-lg" style={{ background: 'var(--brand-muted)' }}>
                    <Icon className="w-4 h-4" style={{ color: 'var(--brand)' }} />
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {t(`artifacts.${key}.label`)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
                    {t(`artifacts.${key}.desc`)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className="px-6 py-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-center text-xs border-t"
        style={{ color: 'var(--foreground-tertiary)', borderColor: 'var(--border)' }}
      >
        <span>
          © 2026 {tCommon('appName')} · {t('footer.builtBy')}{' '}
          <a
            href="https://nareph-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--brand)' }}
            className="hover:underline"
          >
            Nareph
          </a>
        </span>
        <span className="hidden sm:inline">·</span>
        <a
          href={GITBOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--brand)' }}
          className="hover:underline"
        >
          {tNav('documentation')}
        </a>
      </footer>
    </div>
  )
}
