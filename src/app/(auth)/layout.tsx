import Link from "next/link"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "var(--border)" }}>
        <Link href="/" className="flex items-center gap-3">
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
          <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>
            AI Software Architect
          </span>
        </Link>
        <ThemeToggle />
      </nav>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}