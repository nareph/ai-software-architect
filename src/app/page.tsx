"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Layers, Database, GitBranch, FileText, CheckSquare } from "lucide-react"
import { ThemeToggle } from "@/components/layout/ThemeToggle"

const artifacts = [
  { icon: FileText,    label: "Business Analysis",  desc: "Actors, features, business rules" },
  { icon: Layers,      label: "Architecture",        desc: "Stack, modules, patterns, risks" },
  { icon: Database,    label: "Database Schema",     desc: "Tables, relations, indexes" },
  { icon: GitBranch,   label: "Mermaid Diagrams",    desc: "C4, sequence, ERD" },
  { icon: CheckSquare, label: "Dev Backlog",          desc: "Epics, stories, story points" },
]

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* ── Nav ── */}
      <nav className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3">
          {/* Logo Option B inline */}
          <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="14" fill="#0F172A"/>
            <rect x="12" y="14" width="40" height="10" rx="3" fill="#6366F1"/>
            <rect x="12" y="27" width="40" height="10" rx="3" fill="#4F46E5" opacity="0.85"/>
            <rect x="12" y="40" width="40" height="10" rx="3" fill="#3730A3" opacity="0.7"/>
            <circle cx="8" cy="19" r="2.5" fill="#A5B4FC"/>
            <circle cx="8" cy="32" r="2.5" fill="#A5B4FC"/>
            <circle cx="8" cy="45" r="2.5" fill="#A5B4FC"/>
            <line x1="8" y1="21.5" x2="8" y2="29.5" stroke="#6366F1" strokeWidth="1" opacity="0.6"/>
            <line x1="8" y1="34.5" x2="8" y2="42.5" stroke="#6366F1" strokeWidth="1" opacity="0.6"/>
            <text x="44" y="21.5" fontFamily="system-ui" fontSize="7" fontWeight="600" fill="#E0E7FF" textAnchor="middle">AI</text>
            <rect x="14" y="17.5" width="18" height="2" rx="1" fill="#E0E7FF" opacity="0.5"/>
            <rect x="14" y="30.5" width="26" height="2" rx="1" fill="#E0E7FF" opacity="0.4"/>
            <rect x="14" y="43.5" width="22" height="2" rx="1" fill="#E0E7FF" opacity="0.3"/>
          </svg>
          <span className="font-semibold text-base" style={{ color: "var(--foreground)" }}>
            AI Software Architect
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/signin">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* ── Hero ── */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-8"
          style={{ background: "var(--brand-muted)", color: "var(--brand-muted-fg)", border: "1px solid var(--brand-muted)" }}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--brand)" }} />
          MVP — Beta
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight max-w-3xl mb-6"
          style={{ color: "var(--foreground)", lineHeight: 1.15 }}>
          Architecture decisions{" "}
          <span style={{ color: "var(--brand)" }}>before</span>{" "}
          the first line of code
        </h1>

        <p className="text-lg max-w-xl mb-10" style={{ color: "var(--foreground-secondary)" }}>
          Describe your project in plain text. Get a complete, coherent software
          architecture in under 5 minutes — ready for your team to build from.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-20">
          <Link href="/register">
            <Button size="lg" className="gap-2">
              Generate my architecture
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/signin">
            <Button size="lg" variant="outline">
              Sign in
            </Button>
          </Link>
        </div>

        {/* ── Artifacts grid ── */}
        <div className="w-full max-w-3xl">
          <p className="text-sm font-medium mb-4" style={{ color: "var(--foreground-tertiary)" }}>
            WHAT GETS GENERATED
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {artifacts.map(({ icon: Icon, label, desc }) => (
              <div key={label}
                className="flex flex-col items-center gap-2 p-4 rounded-xl text-center"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div className="p-2 rounded-lg" style={{ background: "var(--brand-muted)" }}>
                  <Icon className="w-4 h-4" style={{ color: "var(--brand)" }} />
                </div>
                <span className="text-xs font-medium" style={{ color: "var(--foreground)" }}>{label}</span>
                <span className="text-xs" style={{ color: "var(--foreground-tertiary)" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="px-6 py-6 text-center text-xs border-t"
        style={{ color: "var(--foreground-tertiary)", borderColor: "var(--border)" }}>
        © 2026 AI Software Architect · Built by{" "}
        <a href="https://nareph-portfolio.vercel.app" target="_blank" rel="noopener noreferrer"
          style={{ color: "var(--brand)" }} className="hover:underline">
          Nareph
        </a>
      </footer>
    </div>
  )
}
