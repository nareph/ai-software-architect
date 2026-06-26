import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

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
    locale: 'fr_FR',
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className="bg-[var(--background)] text-[var(--foreground)]"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        <ThemeProvider>
          <AnimatedBackground />
          <div className="relative" style={{ zIndex: 1 }}>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
