// src/app/not-found.tsx
// Catch-all pour les routes qui échouent AVANT d'entrer dans [locale]/
// (ex: /en/projects/some-invalid-id sans page.tsx correspondant)
//
// Ce fichier ne peut pas utiliser useTranslations (pas de locale ici),
// donc on affiche un message neutre bilingue puis on laisse l'utilisateur
// naviguer vers l'accueil, qui redirige vers la bonne locale.

import Link from 'next/link'
import { FileQuestion } from 'lucide-react'

export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            background: '#0F172A',
            color: '#F1F5F9',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(99, 102, 241, 0.12)',
              marginBottom: 24,
            }}
          >
            <FileQuestion size={40} color="#818CF8" />
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>
            Page not found / Page introuvable
          </h1>
          <p style={{ fontSize: 14, color: '#94A3B8', maxWidth: 400, marginBottom: 32 }}>
            The page you are looking for does not exist.
            <br />
            La page que vous recherchez n'existe pas.
          </p>

          <Link
            href="/"
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: '#6366F1',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Back to home / Retour à l'accueil
          </Link>
        </div>
      </body>
    </html>
  )
}
