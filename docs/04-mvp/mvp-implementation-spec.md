# MVP Implementation Spec

## Scope

The MVP is a Next.js 16 monolithic application allowing a user to:
1. Enter a project description with a chosen language (FR/EN)
2. Trigger the generation pipeline (5 sequential AI agents)
3. Visualize generated artifacts by tabs
4. Export in Markdown, PDF, or JSON
5. Refine artifacts via feedback/chat panel
6. Retry failed artifacts individually

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
| PDF export | @react-pdf/renderer | latest |
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

**To switch default UI language: change ONE env var**

```bash
NEXT_PUBLIC_DEFAULT_LOCALE=fr   # French (default)
NEXT_PUBLIC_DEFAULT_LOCALE=en   # English
```

All UI strings live in `messages/fr.json` and `messages/en.json`. No hardcoded text in components.

**Project language** is set independently at project creation — artifacts and feedback always follow the project language, regardless of the UI locale.

---

## MVP completion criteria

| Criterion | Status | Description |
|---|---|---|
| Functional auth | ✅ | Registration, login, logout |
| Project creation | ✅ | Form + name + language selector + validation + persistence |
| Project language | ✅ | FR/EN per project, dissociated from UI locale |
| Complete pipeline | ✅ | 5 sequential agents with retry (max 2) and fallback |
| Real-time progress | ✅ | SSE operational, progress bar updated |
| Artifact visualization | ✅ | 5 tabs, Mermaid rendered, typed views |
| Coherence score | ✅ | Real validation (5 rules), not random |
| Single artifact retry | ✅ | Retry button per failed artifact, context reconstructed |
| JSON repair | ✅ | Truncated LLM responses auto-repaired |
| Markdown export | ✅ | Complete .md download |
| JSON export | ✅ | Structured .json download |
| PDF export | ✅ | Formatted .pdf with cover page |
| Feedback/Chat | ✅ | Modify + explain modes, project locale |
| Project deletion | ✅ | Soft delete (archive) with confirmation |
| Rate limiting | ✅ | 20 generations/hour, 30 exports/hour |
| XSS sanitization | ✅ | LLM output sanitized before display |
| Responsive | ✅ | Mobile, tablet, desktop |
| i18n UI | ✅ | French and English supported |
| Documentation | ✅ | GitBook EN (primary) + FR (variant) |
| Version history | ⬜ | UI navigable — Phase 5 |
| 10 beta users | ⬜ | Each generated ≥ 3 projects |

---

## Architecture decisions

### ADR-001: Project-level language
**Decision:** Language stored on the `projects` table, not derived from UI locale.
**Reason:** Users may have projects in different languages. Artifacts, feedback, and retry all follow project language automatically.

### ADR-002: JSON repair strategy
**Decision:** `repairJSON()` in LLMClient attempts to close open structures before failing.
**Reason:** Gemini 3.5 Flash sometimes truncates large JSON responses. Repair avoids unnecessary retries.

### ADR-003: Single artifact retry
**Decision:** `POST /api/generate/[projectId]/retry` reconstructs cumulative context from completed artifacts in DB.
**Reason:** Full pipeline retry wastes tokens and time when only one step failed.

### ADR-004: Feedback panel language
**Decision:** FeedbackPanel UI language follows `project.locale`, not UI locale.
**Reason:** Content modification requests must be in the same language as the artifact to maintain coherence.
