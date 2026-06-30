# Getting Started

## ⚠️ Local development limitation

Direct connections from Node.js to Neon PostgreSQL may fail locally on certain networks due to ISP-level filtering of AWS IP ranges. This affects `drizzle-kit` CLI commands and runtime DB queries.

**This is a known network constraint — not a bug in the code.**

**Recommended workflow:**
```
Code locally → git push → Vercel auto-deploys → test on preview URL
```

---

## Prerequisites

| Tool | Min version | Check |
|---|---|---|
| Node.js | 20.9.0 | `node --version` |
| pnpm | 9.x | `pnpm --version` |
| Git | 2.x | `git --version` |
| Vercel account | - | vercel.com |

---

## Installation

```bash
# Clone the repo
git clone https://github.com/nareph/ai-software-architect.git
cd ai-software-architect

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

---

## Environment variables

### Required

```bash
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=    # openssl rand -base64 32

# Database (Neon PostgreSQL)
DATABASE_URL=       # from Neon dashboard

# LLM — MVP (free tier)
GEMINI_API_KEY=     # from Google AI Studio
DEEPSEEK_API_KEY=   # from DeepSeek Platform

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App config
USE_MOCK_GENERATION=true
NEXT_PUBLIC_DEFAULT_LOCALE=fr
```

### Getting API keys

- **GEMINI_API_KEY** — [aistudio.google.com](https://aistudio.google.com) → Get API Key (free)
- **DEEPSEEK_API_KEY** — [platform.deepseek.com](https://platform.deepseek.com) → API Keys
- **DATABASE_URL** — [console.neon.tech](https://console.neon.tech) → Connection Details
- **UPSTASH** — [upstash.com](https://upstash.com) → Redis → REST API

---

## Database setup

```bash
# Generate migrations from schema
pnpm db:generate

# Apply to Neon (requires unrestricted network)
pnpm db:push

# Or paste generated SQL into Neon SQL Editor
cat drizzle/migrations/0000_*.sql
```

---

## Deploy to Vercel

```bash
# Link to Vercel (first time)
pnpm vercel link

# Add environment variables
pnpm vercel env add NEXTAUTH_URL
pnpm vercel env add NEXTAUTH_SECRET
pnpm vercel env add DATABASE_URL
pnpm vercel env add GEMINI_API_KEY
pnpm vercel env add DEEPSEEK_API_KEY
pnpm vercel env add UPSTASH_REDIS_REST_URL
pnpm vercel env add UPSTASH_REDIS_REST_TOKEN
pnpm vercel env add USE_MOCK_GENERATION     # true
pnpm vercel env add NEXT_PUBLIC_DEFAULT_LOCALE  # fr

# Deploy preview
pnpm vercel deploy

# Deploy production
pnpm vercel deploy --prod
```

---

## Available scripts

| Script | Network required | Description |
|---|---|---|
| `pnpm dev` | No (UI only) | Dev server (Turbopack) |
| `pnpm build` | No | Production build |
| `pnpm type-check` | No | TypeScript check |
| `pnpm db:generate` | No | Generate Drizzle migrations |
| `pnpm db:push` | Yes (Neon) | Apply schema to Neon |
| `pnpm db:studio` | Yes (Neon) | Open Drizzle Studio |
| `pnpm vercel deploy` | Yes (Vercel) | Deploy to Vercel |

---

## Common issues

| Error | Solution |
|---|---|
| `fetch failed` on DB calls locally | Network limitation — test via Vercel |
| `NEXTAUTH_URL mismatch` | Dev: `http://localhost:3000`, Prod: `https://your-app.vercel.app` |
| `drizzle-kit push` silent (no success message) | Check tables on console.neon.tech |
| Two `drizzle-orm` instances in pnpm | Add `pnpm.overrides.drizzle-orm` in package.json |
| `Response.json` TypeScript error | Add `"ES2023"` to `lib` in tsconfig.json |
