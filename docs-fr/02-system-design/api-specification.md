# AI Software Architect - API Specification

## Conventions

- **Base URL :** `/api`
- **Format :** JSON (`Content-Type: application/json`)
- **Auth :** Bearer token (NextAuth JWT) dans le header `Authorization`
- **Erreurs :** Format uniforme (voir section Erreurs)
- **Pagination :** Cursor-based (`cursor` + `limit`)
- **Dates :** ISO 8601 UTC (`2025-01-15T10:30:00Z`)

---

## Authentification

### POST /api/auth/register

Créer un compte utilisateur.

**Request**
```json
{
  "email": "user@example.com",
  "password": "Min8Chars!",
  "name": "John Doe"
}
```

**Response 201**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "plan": "free",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Erreurs**
- `400` — Email invalide ou mot de passe trop court
- `409` — Email déjà utilisé

---

### POST /api/auth/signin

Les routes signin/signout/session sont gérées par NextAuth via `/api/auth/[...nextauth]`. Se référer à la documentation NextAuth pour les détails.

---

## Projects

### GET /api/projects

Lister les projets de l'utilisateur authentifié.

**Query params**

| Param | Type | Défaut | Description |
|-------|------|--------|-------------|
| `status` | string | - | Filtrer par statut (`draft`, `completed`, etc.) |
| `limit` | integer | 20 | Nombre de résultats (max 50) |
| `cursor` | string | - | Cursor de pagination (UUID du dernier projet) |

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Plateforme de réservation sportive",
      "status": "completed",
      "template": "saas",
      "artifactsCompleted": 5,
      "artifactsTotal": 5,
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:05:00Z"
    }
  ],
  "meta": {
    "total": 42,
    "hasMore": true,
    "nextCursor": "uuid"
  }
}
```

---

### POST /api/projects

Créer un nouveau projet.

**Request**
```json
{
  "description": "Je veux créer une plateforme de réservation pour des salles de sport...",
  "template": "saas",
  "constraints": "Budget cloud max 200€/mois. Doit supporter 500 utilisateurs simultanés."
}
```

**Validation**
- `description` : requis, minimum 50 mots
- `template` : optionnel, valeurs `saas | ecommerce | marketplace | mobile | api | legacy | custom`
- `constraints` : optionnel, maximum 500 caractères

**Response 201**
```json
{
  "project": {
    "id": "uuid",
    "name": "Plateforme de réservation sportive",
    "status": "draft",
    "template": "saas",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}
```

**Erreurs**
- `400` — Description trop courte
- `403` — Limite de projets atteinte (plan free)

---

### GET /api/projects/:id

Récupérer un projet avec ses artefacts.

**Response 200**
```json
{
  "project": {
    "id": "uuid",
    "name": "Plateforme de réservation sportive",
    "description": "Je veux créer...",
    "status": "completed",
    "template": "saas",
    "constraints": "Budget cloud max 200€/mois.",
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-01-15T10:05:00Z",
    "artifacts": [
      {
        "id": "uuid",
        "type": "business_analysis",
        "status": "completed",
        "coherenceScore": 0.97,
        "coherenceIssues": [],
        "generatedAt": "2025-01-15T10:01:00Z"
      },
      {
        "id": "uuid",
        "type": "architecture",
        "status": "completed",
        "coherenceScore": 0.94,
        "coherenceIssues": [],
        "generatedAt": "2025-01-15T10:02:00Z"
      }
    ]
  }
}
```

**Erreurs**
- `403` — Projet appartenant à un autre utilisateur
- `404` — Projet introuvable

---

### DELETE /api/projects/:id

Supprimer un projet (soft delete → archivage).

**Response 200**
```json
{ "message": "Project archived successfully" }
```

---

## Generate

### POST /api/generate/:projectId

Lancer le pipeline de génération complet pour un projet.

**Request** (body optionnel)
```json
{
  "regenerate": ["architecture", "backlog"]
}
```

Si `regenerate` est absent ou vide → génération complète de tous les artefacts.
Si `regenerate` est présent → régénération des types d'artefacts listés uniquement.

**Response 202** (Accepted — génération asynchrone)
```json
{
  "jobId": "uuid",
  "projectId": "uuid",
  "status": "queued",
  "estimatedDurationMs": 90000
}
```

**Erreurs**
- `400` — Projet non trouvé ou déjà en génération
- `429` — Rate limit atteint (20 req/h pour plan free)

---

### GET /api/generate/:projectId/status

Récupérer le statut du job de génération en cours ou du dernier job.

**Response 200**
```json
{
  "job": {
    "id": "uuid",
    "status": "running",
    "startedAt": "2025-01-15T10:00:00Z",
    "steps": [
      {
        "artifactType": "business_analysis",
        "order": 1,
        "status": "completed",
        "durationMs": 8200,
        "attemptCount": 1,
        "llmProvider": "anthropic"
      },
      {
        "artifactType": "architecture",
        "order": 2,
        "status": "running",
        "durationMs": null,
        "attemptCount": 1,
        "llmProvider": "anthropic"
      },
      {
        "artifactType": "database_schema",
        "order": 3,
        "status": "pending",
        "durationMs": null,
        "attemptCount": 0,
        "llmProvider": null
      }
    ]
  }
}
```

**Note :** Pour un suivi temps réel, utiliser le endpoint SSE ci-dessous.

---

### GET /api/generate/:projectId/stream

Suivi temps réel du pipeline via Server-Sent Events (SSE).

**Headers requis**
```
Accept: text/event-stream
```

**Flux SSE — Events**

```
event: step_started
data: {"artifactType":"architecture","order":2,"startedAt":"2025-01-15T10:01:10Z"}

event: step_completed
data: {"artifactType":"architecture","order":2,"durationMs":9400,"coherenceScore":0.94}

event: step_failed
data: {"artifactType":"architecture","order":2,"attemptCount":2,"error":"LLM timeout","retrying":true}

event: step_fallback
data: {"artifactType":"architecture","order":2,"provider":"openrouter","model":"gpt-4o"}

event: generation_completed
data: {"jobId":"uuid","totalDurationMs":87000,"status":"completed"}

event: generation_failed
data: {"jobId":"uuid","failedSteps":["diagrams"],"status":"partial"}
```

---

## Artifacts

### GET /api/artifacts/:id

Récupérer le contenu complet d'un artefact.

**Query params**

| Param | Type | Description |
|-------|------|-------------|
| `version` | integer | Numéro de version (défaut : dernière version) |

**Response 200**
```json
{
  "artifact": {
    "id": "uuid",
    "projectId": "uuid",
    "type": "architecture",
    "status": "completed",
    "coherenceScore": 0.94,
    "coherenceIssues": [],
    "content": {
      "stack": [
        {
          "layer": "Frontend",
          "technology": "Next.js 14",
          "justification": "SSR natif, App Router, compatibilité Vercel optimale"
        }
      ],
      "modules": [...],
      "patterns": ["Repository Pattern", "CQRS léger"],
      "risks": [...]
    },
    "currentVersion": 2,
    "generatedAt": "2025-01-15T10:02:00Z"
  }
}
```

---

### GET /api/artifacts/:id/versions

Lister l'historique des versions d'un artefact.

**Response 200**
```json
{
  "versions": [
    {
      "id": "uuid",
      "versionNumber": 2,
      "changeDesc": "Passage en microservices demandé par l'utilisateur",
      "triggerInput": "Et si je passais en microservices ?",
      "createdAt": "2025-01-15T11:00:00Z"
    },
    {
      "id": "uuid",
      "versionNumber": 1,
      "changeDesc": "Génération initiale",
      "triggerInput": null,
      "createdAt": "2025-01-15T10:02:00Z"
    }
  ]
}
```

---

### PATCH /api/artifacts/:id

Soumettre un feedback pour régénérer un artefact.

**Request**
```json
{
  "type": "modification",
  "content": "Passe l'architecture en microservices avec un API Gateway Kong."
}
```

**Types de feedback**
- `modification` → régénère l'artefact avec l'instruction
- `question` → répond sans régénérer
- `comparison` → génère une variante et compare

**Response 200**
```json
{
  "feedback": {
    "id": "uuid",
    "type": "modification",
    "content": "Passe l'architecture en microservices...",
    "response": null,
    "triggeredVersionId": "uuid"
  },
  "artifact": {
    "id": "uuid",
    "status": "generating"
  }
}
```

Pour `type: question` :
```json
{
  "feedback": {
    "id": "uuid",
    "type": "question",
    "content": "Pourquoi PostgreSQL plutôt que MongoDB ?",
    "response": "PostgreSQL a été choisi pour ses garanties ACID, sa maturité et sa compatibilité avec les relations complexes de votre domaine métier. MongoDB serait pertinent si votre modèle de données était principalement orienté documents sans relations, ce qui n'est pas le cas ici.",
    "triggeredVersionId": null
  }
}
```

---

### POST /api/artifacts/:id/restore

Restaurer une version antérieure d'un artefact.

**Request**
```json
{
  "versionNumber": 1
}
```

**Response 200**
```json
{
  "artifact": {
    "id": "uuid",
    "currentVersion": 3,
    "restoredFromVersion": 1
  }
}
```

---

## Export

### POST /api/export/:projectId

Générer un export du projet complet.

**Request**
```json
{
  "format": "markdown",
  "artifacts": ["business_analysis", "architecture", "database_schema", "diagrams", "backlog"]
}
```

**Formats disponibles :** `markdown | pdf | json`

Si `artifacts` est absent → export de tous les artefacts complétés.

**Response 200**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="project-name-2025-01-15.md"
```

Retourne le fichier directement en stream binaire.

**Erreurs**
- `400` — Format invalide ou aucun artefact complété
- `404` — Projet introuvable

---

## Feedback global

### POST /api/feedback

Soumettre une évaluation de l'expérience globale (post-génération).

**Request**
```json
{
  "projectId": "uuid",
  "rating": 4,
  "comment": "Les diagrammes Mermaid sont excellents, le backlog pourrait être plus détaillé."
}
```

**Response 201**
```json
{ "message": "Feedback recorded. Thank you!" }
```

---

## Format d'erreur uniforme

Toutes les erreurs retournent le même format :

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "You have exceeded the generation limit (20/hour). Try again in 23 minutes.",
    "details": {
      "limit": 20,
      "resetAt": "2025-01-15T11:00:00Z"
    }
  }
}
```

### Codes d'erreur

| Code HTTP | Code erreur | Description |
|-----------|-------------|-------------|
| 400 | `VALIDATION_ERROR` | Données invalides |
| 401 | `UNAUTHORIZED` | Token manquant ou expiré |
| 403 | `FORBIDDEN` | Ressource appartenant à un autre utilisateur |
| 403 | `PLAN_LIMIT_REACHED` | Limite du plan free atteinte |
| 404 | `NOT_FOUND` | Ressource introuvable |
| 409 | `CONFLICT` | Email déjà utilisé, génération déjà en cours |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit dépassé |
| 500 | `INTERNAL_ERROR` | Erreur serveur |
| 503 | `LLM_UNAVAILABLE` | Tous les providers LLM indisponibles |

---

## Rate Limiting

| Endpoint | Plan free | Plan pro |
|----------|-----------|----------|
| `POST /api/generate/:id` | 20 req/heure | 100 req/heure |
| `PATCH /api/artifacts/:id` | 50 req/heure | 200 req/heure |
| `POST /api/export/:id` | 30 req/heure | Illimité |
| Autres endpoints | 200 req/heure | Illimité |

Les headers de rate limit sont inclus dans chaque réponse :
```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 14
X-RateLimit-Reset: 1736935200
```
