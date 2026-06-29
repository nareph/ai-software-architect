// src/app/[locale]/layout.tsx
// Layout principal — rend le <html> avec la bonne locale, ThemeProvider et next-intl

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { locales } from '@/i18n/config'
import type { Locale } from '@/i18n/config'
import '../globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'AI Software Architect',
    template: '%s | AI Software Architect',
  },
  description:
    'Transform a business description into a complete software architecture in under 5 minutes. Generate business analysis, architecture decisions, database schema, diagrams, and backlog — before writing a single line of code.',
  keywords: [
    'software architecture',
    'AI',
    'architecture generator',
    'system design',
    'technical documentation',
    'backlog generator',
    'Mermaid diagrams',
  ],
  authors: [{ name: 'Nareph', url: 'https://nareph-portfolio.vercel.app' }],
  creator: 'Nareph',
  metadataBase: new URL('https://ai-software-architect-zeta.vercel.app'),
  openGraph: {
    type: 'website',
    url: 'https://ai-software-architect-zeta.vercel.app',
    title: 'AI Software Architect',
    description:
      'Transform a business description into a complete software architecture in under 5 minutes.',
    siteName: 'AI Software Architect',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Software Architect',
    description:
      'Transform a business description into a complete software architecture in under 5 minutes.',
    creator: '@nareph',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Valider la locale — 404 si invalide
  if (!locales.includes(locale as Locale)) notFound()

  const messages = await getMessages()

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className="bg-[var(--background)] text-[var(--foreground)]"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <div className="relative min-h-screen">
              {children}
            </div>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
