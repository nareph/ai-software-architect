// src/proxy.ts  (remplace l'ancien middleware NextAuth uniquement)
// next-intl gère le routing des locales + NextAuth protège les routes

import createMiddleware from 'next-intl/middleware'
import { auth } from '@/lib/auth/config'
import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale } from '@/i18n/config'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
})

// Routes qui nécessitent une authentification
const protectedPaths = ['/dashboard', '/projects']

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Vérifie si c'est une route protégée (avec ou sans locale)
  const isProtected = locales.some(locale =>
    protectedPaths.some(path =>
      pathname.startsWith(`/${locale}${path}`)
    )
  )

  if (isProtected) {
    const session = await auth()
    if (!session) {
      // Extraire la locale de l'URL pour rediriger correctement
      const locale = locales.find(l => pathname.startsWith(`/${l}/`)) ?? defaultLocale
      return NextResponse.redirect(new URL(`/${locale}/signin`, req.url))
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // Toutes les routes sauf API, _next, fichiers statiques
    '/((?!api|_next/static|_next/image|favicon|.*\\..*).*)',
  ],
}
