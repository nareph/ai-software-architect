# API Specification

## Conventions

- **Base URL:** `/api`
- **Format:** JSON (`Content-Type: application/json`)
- **Auth:** Bearer token (NextAuth JWT) in `Authorization` header
- **Errors:** Uniform format (see Error section)
- **Dates:** ISO 8601 UTC

---

## Projects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/projects` | List user projects |
| POST | `/api/projects` | Create a project |
| GET | `/api/projects/:id` | Get project with artifacts |
| DELETE | `/api/projects/:id` | Archive project |

---

## Generation

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/generate/:projectId` | Start generation |
| GET | `/api/generate/:projectId/status` | Get job status |
| GET | `/api/generate/:projectId/stream` | **SSE** — real-time progress |

### SSE Events

```
event: generation_started
event: step_started       → { artifactType, order }
event: step_completed     → { artifactType, durationMs, coherenceScore }
event: step_failed        → { artifactType, error }
event: coherence_checked  → { score, passed, issues }
event: generation_completed
event: generation_error
```

---

## Artifacts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/artifacts/:id` | Get artifact content |
| GET | `/api/artifacts/:id/versions` | Version history |
| PATCH | `/api/artifacts/:id` | Submit feedback / regenerate |
| POST | `/api/artifacts/:id/restore` | Restore previous version |

---

## Export

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/export/:projectId` | Export (md / pdf / json) |

---

## Uniform error format

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded the generation limit (20/hour).",
    "details": { "limit": 20, "resetAt": "2026-01-15T11:00:00Z" }
  }
}
```

### Error codes

| HTTP | Code | Description |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Invalid data |
| 401 | `UNAUTHORIZED` | Missing or expired token |
| 403 | `FORBIDDEN` | Resource belongs to another user |
| 403 | `PLAN_LIMIT_REACHED` | Free plan limit reached |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| 503 | `LLM_UNAVAILABLE` | All LLM providers unavailable |
