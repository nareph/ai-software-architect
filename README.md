# AI Software Architect

> Transform a business description into a complete software architecture in under 5 minutes.

AI Software Architect is an AI-powered platform that generates structured technical architecture artifacts — business analysis, architecture decisions, database schema, Mermaid diagrams, and development backlog — from a plain text description, before a single line of code is written.

**This is not a code generator.** It generates the decisions that guide the code.

---

## Why this exists

Every code generation tool (v0, Bolt, Lovable, Devin) skips the most critical phase of software development: architecture. They jump straight to implementation, making implicit decisions with no visibility or control.

AI Software Architect fills this gap. It sits upstream of all code generation tools and produces the artifacts that teams need before development starts.

---

## What it generates

From a single business description, the platform produces:

| Artifact | Description |
|---|---|
| **Business Analysis** | Actors, features, business rules, constraints, assumptions |
| **Architecture** | Stack, modules, patterns, justifications, risks |
| **Database Schema** | Tables, columns, relations, indexes |
| **Mermaid Diagrams** | C4 container, sequence diagram, ERD |
| **Development Backlog** | Epics, user stories, story points, acceptance criteria |

All artifacts are coherence-validated against each other before delivery.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Language | TypeScript 5.x |
| UI | React 19 + Tailwind CSS 4 + shadcn/ui |
| Database | Neon PostgreSQL (serverless) |
| ORM | Drizzle ORM |
| Auth | NextAuth.js v5 |
| Cache / Rate limiting | Upstash Redis |
| LLM — MVP | Google Gemini 3.5 Flash (free tier) |
| LLM — Fallback MVP | DeepSeek V4 Flash |
| LLM — V1 production | Claude Sonnet 4.6 (Anthropic) |
| Deployment | Vercel |

---

## Project status

```
Phase 0 — Research & Product Definition     ✅ Complete
Phase 1 — Product Requirements              ✅ Complete
Phase 2 — System Design                     ✅ Complete
Phase 3 — AI Architecture                   ✅ Complete
Phase 4 — MVP                               🚧 In progress
Phase 5 — Advanced AI Features              ⬜ Planned
Phase 6 — Engineering Excellence            ⬜ Planned
Phase 7 — Portfolio Assets                  ⬜ Planned
Phase 8 — V2                                ⬜ Planned
```

See [ROADMAP.md](./ROADMAP.md) for the full roadmap.

---

## Getting started

### Prerequisites

- Node.js ≥ 20.9.0
- pnpm 9.x

### Installation

```bash
# Clone the repo
git clone https://github.com/nareph/ai-software-architect.git
cd ai-software-architect

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# → Fill in your keys (see docs/04-mvp/getting-started.md)

# Run database migrations
pnpm db:migrate

# Start the dev server
pnpm dev
```

App available at [http://localhost:3000](http://localhost:3000).

For the full setup guide (Neon, Gemini API key, Upstash, Vercel deployment), see [docs/04-mvp/getting-started.md](./docs/04-mvp/getting-started.md).

---

## Available scripts

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
pnpm type-check   # TypeScript check (no emit)
pnpm db:generate  # Generate Drizzle migrations
pnpm db:migrate   # Apply migrations
pnpm db:studio    # Open Drizzle Studio
```

---

## Documentation

The full documentation lives in [`docs/`](./docs/README.md) :

| Section | Description |
|---|---|
| [00 — Research](./docs/00-research/) | Project vision, market analysis, personas, problem statement |
| [01 — Product](./docs/01-product/) | PRD, use cases, user journey |
| [02 — System Design](./docs/02-system-design/) | Architecture, domain model, database, API, security |
| [03 — AI Architecture](./docs/03-ai-architecture/) | Agents, prompts, model selection, evaluation |
| [04 — MVP](./docs/04-mvp/) | Implementation spec, project structure, getting started |

---

## Architecture overview

```
┌─────────────────────────────────────────────┐
│             Next.js 16 (App Router)         │
│        Frontend · API Routes · SSE          │
└─────────────────┬───────────────────────────┘
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
  Neon DB    Upstash Redis   Generation Pipeline
 (Projects,  (Rate limit,    │
  Artifacts)  Cache)         ├─ Requirements Analyst
                             ├─ Solution Architect
                             ├─ Database Architect
                             ├─ Diagram Generator
                             ├─ Project Manager
                             └─ Coherence Validator
                                      │
                             ┌────────┴────────┐
                             ▼                 ▼
                      Gemini 3.5 Flash   DeepSeek V4 Flash
                        (Primary)          (Fallback)
```

---

## License

MIT — see [LICENSE](./LICENSE)
