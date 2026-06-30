# Security

## Overview

Security is designed in layers (defense in depth). For the MVP, the goal is a solid and proportionate security posture: no over-engineering, but no obvious gap in common SaaS attack vectors.

---

## Authentication

**NextAuth.js v5** with **Credentials** strategy (email/password) for MVP.

- Passwords hashed with **bcrypt** (cost factor 12)
- Sessions managed via signed **JWT** (256-bit minimum secret)
- Session duration: 24 hours (automatically renewed on each active request)
- `trustHost: true` for Vercel preview deployments

---

## Authorization (RBAC)

All API Routes apply these checks in order:

1. **Authentication:** Valid JWT token present → else `401`
2. **Resource ownership:** `resource.userId === session.userId` → else `403`
3. **Plan limits:** Quota verification → else `403 PLAN_LIMIT_REACHED`

---

## Rate Limiting

Via **Upstash Redis** (sliding window algorithm):

| Endpoint | Free | Pro |
|---|---|---|
| `POST /api/generate/:id` | 20/h | 100/h |
| `PATCH /api/artifacts/:id` | 50/h | 200/h |
| `POST /api/export/:id` | 30/h | Unlimited |

---

## LLM Security

### Prompt injection protection

1. **Input sanitization:** Remove control sequences before LLM injection
2. **Strict system/user separation:** System prompt and user input always in separate blocks
3. **Output validation:** LLM response validated against strict JSON schema before persistence
4. **No code execution:** Generated artifacts are static text/JSON — no `eval()` or dynamic execution

---

## Web Security (OWASP Top 10)

| Threat | Protection |
|---|---|
| SQL Injection | Drizzle ORM — prepared queries exclusively |
| XSS | Next.js auto-escaping + `rehype-sanitize` for Markdown |
| CSRF | NextAuth native CSRF protection |
| Clickjacking | `X-Frame-Options: DENY` header |
| IDOR | Resource ownership check on all endpoints |

---

## Security headers

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; ...
```

---

## MVP Security Checklist

| Control | Status |
|---|---|
| bcrypt passwords (cost 12) | ✅ |
| Signed JWT with strong secret | ✅ |
| HTTPS mandatory (Vercel native) | ✅ |
| Env vars never exposed to client | ✅ |
| Redis rate limiting per userId | ✅ |
| Resource ownership check (anti-IDOR) | ✅ |
| Prepared queries (anti-SQLi) | ✅ |
| Markdown sanitization | ✅ |
| Security headers | ✅ |
| System/user prompt separation | ✅ |
| LLM output schema validation | ✅ |
