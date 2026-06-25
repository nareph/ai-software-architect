# AI Software Architect - System Architecture

## Vue d'ensemble

AI Software Architect est une application web full-stack construite sur Next.js 16.2.9 (App Router, Turbopack par défaut), déployée sur Vercel, avec Neon PostgreSQL comme base de données principale et Upstash Redis pour le cache et la gestion des queues de génération.

> **Note :** Next.js 16 requiert Node.js ≥ 20.9.0. Turbopack remplace webpack comme bundler par défaut — aucune config webpack custom n'est utilisée dans ce projet.

L'architecture suit un modèle **monolithe modulaire** pour le MVP : un seul repo Next.js contenant le frontend, les API Routes backend, et le pipeline d'orchestration LLM. Cette approche minimise la complexité opérationnelle tout en permettant une extraction en microservices en V2.

---

## Schéma global

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT                                  │
│                    Next.js 16 (App Router)                       │
│         Landing · Dashboard · Editor · Results · Export          │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                           │
│              CDN · Edge Middleware · Auth Guard                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS API ROUTES                             │
│                                                                  │
│  /api/auth          /api/projects      /api/generate             │
│  /api/artifacts     /api/export        /api/feedback             │
└──────┬─────────────────────┬───────────────────┬────────────────┘
       │                     │                   │
       ▼                     ▼                   ▼
┌─────────────┐   ┌──────────────────┐  ┌───────────────────────┐
│  NextAuth   │   │  Neon PostgreSQL  │  │  Orchestration Layer  │
│  (Auth)     │   │  (Projets, Arti- │  │  (Pipeline LLM)       │
│             │   │  facts, Users,   │  │                       │
│             │   │  Versions)       │  │  1. Business Analysis │
└─────────────┘   └──────────────────┘  │  2. Architecture      │
                                        │  3. Database Schema   │
                  ┌──────────────────┐  │  4. Mermaid Diagrams  │
                  │  Upstash Redis   │  │  5. Backlog           │
                  │  (Cache · Queue  │  └──────────┬────────────┘
                  │   · Rate limit)  │             │
                  └──────────────────┘             ▼
                                        ┌──────────────────────┐
                                        │   Anthropic API      │
                                        │   Claude Sonnet 4.6  │
                                        │   (Principal)        │
                                        │                      │
                                        │   OpenRouter         │
                                        │   GPT-4o (Fallback)  │
                                        └──────────────────────┘
```

---

## Couches applicatives

### 1. Frontend (Next.js 16.2.9 App Router)

**Responsabilités :**
- Interface utilisateur complète (landing, auth, dashboard, éditeur, résultats)
- Rendu des artefacts (Markdown, Mermaid, tableaux)
- Gestion de l'état client (React Context + Zustand pour l'état de génération)
- Streaming des résultats de génération (Server-Sent Events)

**Pages principales :**

| Route | Description |
|-------|-------------|
| `/` | Landing page (SSG) |
| `/auth/signin` | Connexion email/password |
| `/dashboard` | Liste des projets utilisateur |
| `/projects/new` | Formulaire de création |
| `/projects/[id]` | Dashboard projet + artefacts |
| `/projects/[id]/edit` | Modification d'un artefact |

**Composants clés :**
- `ArtifactViewer` — affichage tabulé des artefacts avec rendu Mermaid
- `GenerationProgress` — barre de progression temps réel (SSE)
- `ChatPanel` — interface d'itération et de feedback
- `ExportMenu` — export Markdown / PDF / JSON

---

### 2. API Routes (Backend)

**Responsabilités :**
- Authentification et autorisation
- CRUD des projets et artefacts
- Orchestration du pipeline de génération
- Validation inter-artefacts
- Export des documents

**Structure des routes :**

```
/api
├── auth/
│   └── [...nextauth]     # NextAuth handlers
├── projects/
│   ├── POST /            # Créer un projet
│   ├── GET /             # Lister les projets
│   ├── GET /[id]         # Détail d'un projet
│   └── DELETE /[id]      # Supprimer un projet
├── generate/
│   └── POST /[projectId] # Lancer la génération
├── artifacts/
│   ├── GET /[id]         # Récupérer un artefact
│   └── PATCH /[id]       # Modifier + régénérer un artefact
├── export/
│   └── POST /[projectId] # Exporter (md / pdf / json)
└── feedback/
    └── POST /[projectId] # Soumettre un feedback
```

---

### 3. Orchestration Layer (Pipeline LLM)

**Responsabilités :**
- Orchestration séquentielle des 5 étapes de génération
- Gestion des prompts et des contextes
- Validation structurelle et de cohérence de chaque artefact
- Retry automatique (max 2 tentatives par étape)
- Fallback vers GPT-4o en cas d'échec Anthropic

**Pipeline de génération :**

```
Input utilisateur
      │
      ▼
[Step 1] Requirements Analyst
      │  → business_analysis (JSON)
      ▼
[Step 2] Solution Architect
      │  context: business_analysis
      │  → architecture (JSON)
      ▼
[Step 3] Database Architect
      │  context: business_analysis + architecture
      │  → database_schema (JSON)
      ▼
[Step 4] Diagram Generator
      │  context: architecture + database_schema
      │  → mermaid_diagrams (Mermaid string)
      ▼
[Step 5] Project Manager
      │  context: business_analysis + architecture
      │  → backlog (JSON)
      ▼
[Validation] Coherence Checker
      │  → cohérence inter-artefacts
      ▼
Résultats sauvegardés en base
```

Chaque étape reçoit en contexte les artefacts précédents pour garantir la cohérence globale.

---

### 4. Base de données (Neon PostgreSQL)

**Responsabilités :**
- Persistance des projets, artefacts et versions
- Stockage des utilisateurs et sessions
- Historique des générations et feedbacks

Schéma détaillé dans `database-design.md`.

---

### 5. Cache et Queue (Upstash Redis)

**Responsabilités :**
- **Rate limiting :** 20 requêtes/heure/utilisateur sur `/api/generate`
- **Cache des artefacts :** TTL 1 heure pour les artefacts récemment consultés
- **Queue de génération (MVP) :** File d'attente simple pour éviter les appels LLM concurrents par utilisateur
- **Session store :** Stockage des sessions NextAuth

**Clés Redis :**

| Clé | Type | TTL | Usage |
|-----|------|-----|-------|
| `rate:userId` | Counter | 1h | Rate limiting |
| `cache:artifact:id` | String | 1h | Cache artefact |
| `queue:userId` | List | - | Queue génération |
| `session:token` | Hash | 24h | Sessions NextAuth |

---

### 6. LLM Providers

| Provider | Modèle | Rôle | Déclenchement |
|----------|--------|------|---------------|
| Anthropic | Claude Sonnet 4.6 | Principal | Toujours en premier |
| OpenRouter | GPT-4o | Fallback | Si Anthropic timeout (>30s) ou erreur 5xx |

**Stratégie de fallback :**
1. Appel Anthropic avec timeout à 30 secondes
2. En cas d'échec → retry sur Anthropic (1 fois)
3. En cas d'échec persistant → switch vers OpenRouter/GPT-4o
4. En cas d'échec total → notification utilisateur + option retry manuel

---

### 7. Observabilité

| Outil | Usage |
|-------|-------|
| Vercel Analytics | Trafic, performances, Core Web Vitals |
| Vercel Logs | Logs des API Routes en production |
| Sentry | Capture des erreurs frontend et backend |
| PostHog (optionnel V2) | Analytics produit, funnels, heatmaps |

**Métriques surveillées :**
- Temps de génération par étape et total
- Taux d'erreur par étape LLM
- Taux de retry et fallback
- Taux d'export par format

---

## Décisions architecturales clés

### ADR-001 : Monolithe Next.js vs microservices séparés
**Décision :** Monolithe Next.js 16.2.9 pour le MVP.
**Raison :** Complexité opérationnelle réduite, déploiement Vercel natif, itération rapide. Le pipeline LLM est extrait en service indépendant en V2 si la charge le justifie.

### ADR-002 : Génération séquentielle vs parallèle
**Décision :** Génération séquentielle des artefacts.
**Raison :** Chaque artefact dépend des précédents pour garantir la cohérence. La parallélisation sacrifie la qualité pour la vitesse — incompatible avec l'objectif de cohérence inter-artefacts.

### ADR-003 : Streaming vs polling
**Décision :** Server-Sent Events (SSE) pour le suivi de progression.
**Raison :** Feedback temps réel sans complexité WebSocket. Compatible avec Vercel Edge. Le polling toutes les 2 secondes est le fallback si SSE échoue.

### ADR-004 : Stockage des artefacts en JSON
**Décision :** Les artefacts sont stockés en JSON structuré en base (colonne `jsonb` PostgreSQL).
**Raison :** Flexibilité du schéma par type d'artefact, requêtes sur le contenu si nécessaire, export multi-format facilité.
