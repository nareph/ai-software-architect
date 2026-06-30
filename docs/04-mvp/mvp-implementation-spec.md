# MVP Implementation Spec

## Scope

The MVP is a Next.js 16 monolithic application allowing a user to:
1. Enter a project description
2. Trigger the generation pipeline (5 sequential agents)
3. Visualize generated artifacts by tabs
4. Export in Markdown, PDF, or JSON

---

## Exact tech stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.2.9 |
| Runtime | Node.js | ≥ 20.9.0 |
| Language | TypeScript | 5.x |
| UI | React | 19.x |
| Styles | Tailwind CSS | 4.x |
| Components | shadcn/ui (Nova preset) | latest |
| Database | Neon PostgreSQL | serverless |
| ORM | Drizzle ORM | 0.38+ |
| Auth | NextAuth.js | 5.x (beta) |
| Cache / Rate limit | Upstash Redis | latest |
| LLM primary | Google Gemini 3.5 Flash | free tier |
| LLM fallback | DeepSeek V4 Flash | latest |
| Diagrams | Mermaid.js | 11.x |
| i18n | next-intl | latest |
| Package manager | pnpm | 9.x |
| Deployment | Vercel | - |

---

## Mock → Real LLM migration

**To switch from mock to real LLM: change ONE env var**

```bash
# Mock (default for MVP beta)
USE_MOCK_GENERATION=true

# Real LLM (V1 public)
USE_MOCK_GENERATION=false
```

The orchestrator at `src/lib/agents/orchestrator.ts` handles the switch automatically. No route or component modification needed.

---

## i18n

**To switch default language: change ONE env var**

```bash
NEXT_PUBLIC_DEFAULT_LOCALE=fr   # French (default)
NEXT_PUBLIC_DEFAULT_LOCALE=en   # English
```

All UI strings live in `messages/fr.json` and `messages/en.json`. No hardcoded text in components.

---

## MVP completion criteria

| Criterion | Description |
|---|---|
| ✅ Functional auth | Registration, login, logout |
| ✅ Project creation | Form + validation + persistence |
| ✅ Complete pipeline | 5 sequential agents with retry and fallback |
| ✅ Real-time progress | SSE operational, progress bar updated |
| ✅ Artifact visualization | 5 tabs, Mermaid rendered, secure Markdown |
| ✅ Coherence score | Displayed after generation with issues |
| ✅ Markdown export | Complete .md download |
| ✅ JSON export | Structured .json download |
| ✅ PDF export | Formatted .pdf download |
| ✅ Version history | Visible and navigable |
| ✅ Rate limiting | 20 generations/hour on `/api/generate` |
| ✅ Responsive | Mobile, tablet, desktop |
| ✅ i18n | French and English supported |
| ✅ 10 beta users | Each generated ≥ 3 projects |
