// src/app/layout.tsx
// Root layout minimal — le <html> est géré par [locale]/layout.tsx
// Ce fichier existe uniquement pour satisfaire Next.js App Router
// NE PAS ajouter de <html> ou <body> ici

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
