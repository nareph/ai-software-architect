# Project Structure

## Repository root

```
ai-software-architect/
│
├── README.md                    ← Project presentation, stack, getting started
├── ROADMAP.md                   ← Product roadmap (phases 0 → 8)
├── .env.example                 ← Environment variables template
├── next.config.ts               ← Next.js + next-intl config
├── drizzle.config.ts            ← Drizzle Kit config
├── package.json
│
├── docs/                        ← Full documentation
│   ├── README.md                ← Documentation index
│   ├── 00-research/
│   ├── 01-product/
│   ├── 02-system-design/
│   ├── 03-ai-architecture/
│   └── 04-mvp/
│
├── messages/                    ← i18n strings
│   ├── fr.json
│   └── en.json
│
├── drizzle/migrations/          ← Versioned SQL migrations
│
└── src/
    ├── app/
    │   ├── layout.tsx           ← Root layout (children only, no html tag)
    │   ├── page.tsx             ← Redirect / → /fr
    │   ├── globals.css          ← Design system CSS variables
    │   ├── [locale]/            ← All pages under locale routing
    │   │   ├── layout.tsx       ← html + body + ThemeProvider + NextIntl
    │   │   ├── page.tsx         ← Landing page
    │   │   ├── (auth)/          ← signin, register
    │   │   └── (app)/           ← dashboard, projects
    │   └── api/                 ← API Routes (no locale prefix)
    │
    ├── components/
    │   ├── ui/                  ← shadcn/ui components
    │   ├── layout/              ← Sidebar, ThemeToggle, LanguageSwitcher
    │   ├── project/             ← ProjectCard, ProjectRow
    │   ├── artifacts/           ← ArtifactTabs, MermaidRenderer, etc.
    │   └── export/              ← ExportMenu
    │
    ├── lib/
    │   ├── db/                  ← Drizzle client + schema + queries
    │   ├── auth/                ← NextAuth config
    │   ├── agents/              ← Orchestrator + agents
    │   │   ├── orchestrator.ts  ← Single entry point
    │   │   ├── types.ts         ← Shared interfaces
    │   │   ├── mock/pipeline.ts ← Mock implementation
    │   │   └── llm/pipeline.ts  ← LLM stub (Phase B)
    │   ├── llm/                 ← LLM client (Gemini + DeepSeek)
    │   ├── mock/artifacts.ts    ← Mock artifacts data
    │   ├── prompts/             ← Versioned prompt templates
    │   ├── schemas/             ← Zod schemas for artifacts
    │   ├── export/              ← Markdown, PDF, JSON exporters
    │   └── redis/               ← Upstash client
    │
    ├── i18n/
    │   ├── config.ts            ← Supported locales
    │   └── request.ts           ← next-intl server config
    │
    └── types/                   ← Shared TypeScript types
```
