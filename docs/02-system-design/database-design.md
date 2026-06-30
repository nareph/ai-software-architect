# Database Design

## Technology

**PostgreSQL** via **Neon** (serverless, Vercel-compatible).
ORM: **Drizzle ORM** (typesafe, lightweight, Edge Runtime compatible).

---

## Tables overview

| Table | Description |
|---|---|
| `users` | Platform users (members, admins) |
| `projects` | Projects with description and status |
| `artifacts` | Generated artifacts (5 per project) |
| `artifact_versions` | Version history per artifact |
| `generation_jobs` | Pipeline execution instances |
| `generation_steps` | Individual LLM calls |
| `feedbacks` | User feedback on artifacts |

---

## Key design decisions

- **UUID primary keys** — non-guessable, globally unique
- **Timestamps on all tables** — `created_at`, `updated_at`
- **Soft delete** — `deleted_at` on `users`, `archived_at` on `projects`
- **JSONB for artifact content** — flexible schema per artifact type
- **Unique constraint** on `(project_id, type)` in `artifacts` — one artifact per type per project
- **Unique constraint** on `(artifact_id, version_number)` in `artifact_versions`

---

## ERD

```
users
  │
  ├──< projects
  │       │
  │       ├──< artifacts
  │       │       │
  │       │       ├──< artifact_versions
  │       │       │
  │       │       └──< feedbacks
  │       │
  │       └──< generation_jobs
  │               │
  │               └──< generation_steps
```

---

## Migrations

Tool: **Drizzle Kit** (`drizzle-kit generate` + `drizzle-kit push`).

Migrations are versioned in `/drizzle/migrations/` and applied automatically at Vercel deployment via a build script.

> ⚠️ **Network note:** On some networks (particularly in certain African regions), Node.js connections to Neon PostgreSQL AWS endpoints may be blocked. Use the Neon SQL Editor to apply migrations manually, or deploy via Vercel where connectivity is unrestricted.
