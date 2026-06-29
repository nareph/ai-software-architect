"use client"

// src/components/layout/Sidebar.tsx
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher'
import { useState } from 'react'

interface SidebarProps {
  user: { name?: string | null; email?: string | null }
}

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

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navItems = [
    { href: `/${locale}/dashboard`, icon: LayoutDashboard, label: t('dashboard') },
    { href: `/${locale}/dashboard/settings`, icon: Settings, label: t('settings') },
  ]

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user.email?.[0].toUpperCase() ?? '?'

  return (
    <aside
      className="w-60 flex flex-col border-r shrink-0"
      style={{ background: 'var(--background-secondary)', borderColor: 'var(--border)', minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <Logo />
        <span className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
          AI Architect
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: active ? 'var(--surface-active)' : 'transparent',
                color: active ? 'var(--brand)' : 'var(--foreground-secondary)',
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
        {/* Language + Theme */}
        <div className="flex items-center justify-between px-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-[var(--surface-hover)]"
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
              style={{ background: 'var(--brand-muted)', color: 'var(--brand-muted-fg)' }}
            >
              {initials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="truncate text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                {user.name ?? user.email}
              </p>
              {user.name && (
                <p className="truncate text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
                  {user.email}
                </p>
              )}
            </div>
            <ChevronDown className="w-3 h-3 shrink-0" style={{ color: 'var(--foreground-tertiary)' }} />
          </button>

          {userMenuOpen && (
            <div
              className="absolute bottom-full left-0 right-0 mb-1 rounded-lg border py-1 shadow-lg"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-hover)]"
                style={{ color: 'var(--danger)' }}
              >
                <LogOut className="w-4 h-4" />
                {tCommon('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
