# AI Software Architect - Security

## Vue d'ensemble

La sécurité est conçue par couches (defense in depth). Pour le MVP, l'objectif est une posture de sécurité solide et proportionnelle : pas de sur-ingénierie, mais aucune lacune évidente dans les vecteurs d'attaque courants d'une application SaaS.

---

## Authentification

### Mécanisme

**NextAuth.js** avec stratégie **Credentials** (email/password) pour le MVP.

- Les mots de passe sont hashés avec **bcrypt** (cost factor 12).
- Les sessions sont gérées via **JWT** signé (secret 256 bits minimum, stocké dans `NEXTAUTH_SECRET`).
- Durée de session : 24 heures (renouvelée automatiquement à chaque requête active).
- Les tokens JWT ne contiennent que : `userId`, `email`, `plan`, `iat`, `exp`.

### Flux d'authentification

```
Client → POST /api/auth/signin
              │
              ▼
         Vérification email (DB)
              │
         Vérification bcrypt(password, hash)
              │
         Génération JWT signé (NEXTAUTH_SECRET)
              │
         Set-Cookie: next-auth.session-token (HttpOnly, Secure, SameSite=Lax)
              │
              ▼
         Client authentifié
```

### Politique de mots de passe

- Minimum 8 caractères
- Au moins une majuscule, un chiffre, un caractère spécial
- Validation côté serveur (zod schema) — la validation frontend est un confort, pas une sécurité

### Évolutions V2

- OAuth2 (Google, GitHub) via NextAuth providers
- Magic link (email)
- SSO SAML pour les comptes enterprise

---

## Autorisation (RBAC)

### Rôles MVP

| Rôle | Description |
|------|-------------|
| `user` | Utilisateur standard (plan free ou pro) |
| `admin` | Accès back-office (métriques, gestion utilisateurs) — usage interne uniquement |

### Règles d'accès

Toutes les API Routes appliquent les vérifications suivantes dans l'ordre :

1. **Authentification :** Token JWT valide présent → sinon `401`
2. **Propriété de la ressource :** `resource.userId === session.userId` → sinon `403`
3. **Limites du plan :** Vérification des quotas (projets actifs, rate limit) → sinon `403 PLAN_LIMIT_REACHED`

```typescript
// Middleware d'autorisation appliqué à toutes les routes protégées
export async function withAuth(
  handler: NextApiHandler,
  options?: { requireOwnership?: boolean }
) {
  return async (req, res) => {
    const session = await getServerSession(req, res, authOptions);
    if (!session) return res.status(401).json({ error: { code: 'UNAUTHORIZED' } });

    req.userId = session.user.id;
    req.userPlan = session.user.plan;

    return handler(req, res);
  };
}
```

### Middleware Vercel Edge

Un middleware Edge appliqué globalement protège toutes les routes `/api/*` (sauf `/api/auth/*`) et `/dashboard/*` :

```typescript
// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/dashboard/:path*', '/api/projects/:path*', '/api/generate/:path*',
            '/api/artifacts/:path*', '/api/export/:path*']
};
```

---

## Rate Limiting

### Implémentation

Rate limiting via **Upstash Redis** (sliding window algorithm) appliqué au niveau de l'API Route.

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  prefix: 'ratelimit:generate'
});

// Usage dans POST /api/generate/:projectId
const { success, limit, remaining, reset } = await ratelimit.limit(userId);
if (!success) {
  return res.status(429).json({
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: `Limit: ${limit}/hour. Resets at ${new Date(reset).toISOString()}`,
      details: { limit, remaining: 0, resetAt: new Date(reset).toISOString() }
    }
  });
}
```

### Limites par endpoint (rappel)

| Endpoint | Free | Pro |
|----------|------|-----|
| `POST /api/generate/:id` | 20/h | 100/h |
| `PATCH /api/artifacts/:id` | 50/h | 200/h |
| `POST /api/export/:id` | 30/h | Illimité |
| Autres routes API | 200/h | Illimité |

---

## Protection des données

### Données sensibles

| Donnée | Stockage | Protection |
|--------|----------|------------|
| Mots de passe | DB (hash bcrypt) | Jamais en clair, jamais loggué |
| Clés API LLM | Env vars Vercel | Jamais exposées côté client |
| JWT secret | Env var Vercel | Rotation recommandée tous les 90 jours |
| Redis URL | Env var Vercel | Connexion TLS uniquement |
| DB connection string | Env var Vercel | Connexion TLS uniquement |

### Variables d'environnement requises

```bash
# Auth
NEXTAUTH_URL=https://ai-software-architect.vercel.app
NEXTAUTH_SECRET=<256-bit-random-secret>

# Database
DATABASE_URL=postgresql://...@neon.tech/...?sslmode=require

# LLM Providers
ANTHROPIC_API_KEY=sk-ant-...
OPENROUTER_API_KEY=sk-or-...

# Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...

# Optionnel (observabilité)
SENTRY_DSN=https://...@sentry.io/...
```

**Règle absolue :** Aucune variable d'environnement préfixée `NEXT_PUBLIC_` ne contient de secrets. Les clés API ne transitent jamais vers le client.

### PII (Personally Identifiable Information)

Données PII stockées : email, nom.

- Aucune donnée de carte bancaire (Stripe gère le PCI-DSS en V2)
- Les descriptions de projets peuvent contenir des informations métier sensibles — elles ne sont jamais partagées entre utilisateurs
- Droit à l'oubli : suppression d'un compte → soft delete immédiat + purge complète après 30 jours (CRON)

---

## Sécurité des appels LLM

### Injection de prompt

Les descriptions utilisateur sont potentiellement hostiles. Protections :

1. **Sanitisation de l'input :** Suppression des séquences de contrôle et caractères non imprimables avant l'envoi au LLM.
2. **Séparation stricte system/user :** Le prompt système (instructions) et l'input utilisateur sont toujours dans des blocs séparés (`system` vs `user` dans l'API Anthropic).
3. **Validation de l'output :** La réponse LLM est validée contre un schéma JSON strict avant d'être persistée. Un output non conforme déclenche un retry.
4. **Pas d'exécution de code :** Les artefacts générés sont du texte/JSON statique — aucun `eval()` ni exécution dynamique.

### Limites d'output

Les appels LLM sont limités à `max_tokens: 4096` par artefact pour éviter les coûts incontrôlés et les timeouts.

---

## Sécurité Web (OWASP Top 10)

### Injection SQL
Drizzle ORM utilise des requêtes préparées exclusivement. Aucune concaténation de chaînes dans les requêtes SQL.

### XSS (Cross-Site Scripting)
- Next.js échappe automatiquement les variables dans le JSX.
- Le contenu Markdown est rendu via `react-markdown` avec `rehype-sanitize` — les balises HTML dangereuses (`<script>`, `<iframe>`, etc.) sont supprimées.
- Le rendu Mermaid se fait dans un `<iframe>` sandboxé.

### CSRF
NextAuth gère nativement la protection CSRF via un token double-submit sur toutes ses routes. Les API Routes custom utilisent la vérification de l'`Origin` header.

### Clickjacking
Headers de sécurité configurés dans `next.config.js` :

```javascript
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",   // requis pour Next.js
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.anthropic.com https://openrouter.ai",
      "frame-src 'none'"
    ].join('; ')
  },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  }
];
```

### Exposition de données
- Les endpoints vérifient systématiquement que la ressource demandée appartient à l'utilisateur authentifié (pas de référence directe non sécurisée — IDOR).
- Les IDs sont des UUID v4 — non devinables.

---

## Audit Logs

Chaque action significative est loggée avec l'userId, le timestamp et le résultat.

### Actions auditées

| Action | Niveau |
|--------|--------|
| Connexion réussie | INFO |
| Connexion échouée (3 fois) | WARN |
| Création de projet | INFO |
| Lancement de génération | INFO |
| Échec de génération | ERROR |
| Export de projet | INFO |
| Suppression de projet | WARN |
| Rate limit atteint | WARN |
| Erreur LLM provider | ERROR |

### Format de log

```json
{
  "timestamp": "2025-01-15T10:00:00Z",
  "level": "INFO",
  "action": "generation.started",
  "userId": "uuid",
  "projectId": "uuid",
  "meta": {
    "provider": "anthropic",
    "template": "saas"
  }
}
```

Les logs sont collectés par Vercel Logs et envoyés à Sentry pour les niveaux ERROR.

---

## Checklist de sécurité MVP

| Contrôle | Statut |
|----------|--------|
| Mots de passe hashés bcrypt (cost 12) | ✅ |
| JWT signé avec secret fort | ✅ |
| HTTPS obligatoire (Vercel natif) | ✅ |
| Variables d'env jamais exposées client | ✅ |
| Rate limiting Redis par userId | ✅ |
| Vérification propriété ressource (anti-IDOR) | ✅ |
| Requêtes préparées (anti-SQLi) | ✅ |
| Sanitisation Markdown + Mermaid sandboxé | ✅ |
| Headers de sécurité (CSP, HSTS, etc.) | ✅ |
| Séparation system/user prompt LLM | ✅ |
| Validation schéma output LLM | ✅ |
| Soft delete + purge PII sous 30 jours | ✅ |
| Audit logs actions critiques | ✅ |
| Rotation secret NextAuth (90 jours) | 📋 Procédure à documenter |
| Penetration test | 📋 Prévu avant lancement public |
