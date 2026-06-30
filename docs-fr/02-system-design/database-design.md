# AI Software Architect - Database Design

## Technologie

**PostgreSQL** via **Neon** (serverless, compatible Vercel).
ORM : **Drizzle ORM** (typesafe, léger, compatible Edge Runtime).

---

## ERD — Vue d'ensemble

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
  │
  └── (sessions — géré par NextAuth)
```

---

## Tables

### users

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  name          VARCHAR(255),
  password_hash VARCHAR(255),                          -- null si OAuth (V2)
  plan          VARCHAR(20) NOT NULL DEFAULT 'free'    -- free | pro
                CHECK (plan IN ('free', 'pro')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at    TIMESTAMPTZ                            -- soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan  ON users(plan);
```

---

### projects

```sql
CREATE TABLE projects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name         VARCHAR(255) NOT NULL,
  description  TEXT NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'draft'
               CHECK (status IN ('draft','generating','completed','partial','archived')),
  template     VARCHAR(30)
               CHECK (template IN ('saas','ecommerce','marketplace','mobile','api','legacy','custom')),
  constraints  TEXT,                                   -- contraintes additionnelles (optionnel)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at  TIMESTAMPTZ
);

CREATE INDEX idx_projects_user_id  ON projects(user_id);
CREATE INDEX idx_projects_status   ON projects(status);
CREATE INDEX idx_projects_user_status ON projects(user_id, status);
```

---

### artifacts

```sql
CREATE TABLE artifacts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type              VARCHAR(30) NOT NULL
                    CHECK (type IN (
                      'business_analysis','architecture',
                      'database_schema','diagrams','backlog'
                    )),
  status            VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','generating','completed','failed')),
  content           JSONB,                             -- null tant que non généré
  coherence_score   NUMERIC(4,3),                     -- 0.000 à 1.000
  coherence_issues  TEXT[],                            -- liste des incohérences détectées
  generated_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(project_id, type)                             -- un seul artefact par type par projet
);

CREATE INDEX idx_artifacts_project_id ON artifacts(project_id);
CREATE INDEX idx_artifacts_type       ON artifacts(type);
CREATE INDEX idx_artifacts_status     ON artifacts(status);
CREATE INDEX idx_artifacts_content    ON artifacts USING GIN(content);  -- recherche dans le JSON
```

---

### artifact_versions

```sql
CREATE TABLE artifact_versions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id      UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  version_number   INTEGER NOT NULL,
  content          JSONB NOT NULL,                     -- snapshot complet du contenu
  change_desc      TEXT,                               -- description du changement
  trigger_input    TEXT,                               -- input utilisateur ayant déclenché la regen
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(artifact_id, version_number)
);

CREATE INDEX idx_artifact_versions_artifact_id ON artifact_versions(artifact_id);
```

---

### generation_jobs

```sql
CREATE TABLE generation_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status          VARCHAR(20) NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued','running','completed','failed')),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  total_duration_ms INTEGER,
  error_message   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generation_jobs_project_id ON generation_jobs(project_id);
CREATE INDEX idx_generation_jobs_status     ON generation_jobs(status);
```

---

### generation_steps

```sql
CREATE TABLE generation_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES generation_jobs(id) ON DELETE CASCADE,
  artifact_type   VARCHAR(30) NOT NULL
                  CHECK (artifact_type IN (
                    'business_analysis','architecture',
                    'database_schema','diagrams','backlog'
                  )),
  step_order      INTEGER NOT NULL CHECK (step_order BETWEEN 1 AND 5),
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','running','completed','failed','retrying')),
  attempt_count   INTEGER NOT NULL DEFAULT 0,
  llm_provider    VARCHAR(20) CHECK (llm_provider IN ('anthropic','openrouter')),
  llm_model       VARCHAR(100),
  prompt_tokens   INTEGER,
  completion_tokens INTEGER,
  duration_ms     INTEGER,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  error_message   TEXT,

  UNIQUE(job_id, step_order)
);

CREATE INDEX idx_generation_steps_job_id ON generation_steps(job_id);
```

---

### feedbacks

```sql
CREATE TABLE feedbacks (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_id          UUID NOT NULL REFERENCES artifacts(id) ON DELETE CASCADE,
  user_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                 VARCHAR(20) NOT NULL
                       CHECK (type IN ('modification','question','comparison')),
  content              TEXT NOT NULL,
  response             TEXT,                           -- réponse IA si type=question
  triggered_version_id UUID REFERENCES artifact_versions(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedbacks_artifact_id ON feedbacks(artifact_id);
CREATE INDEX idx_feedbacks_user_id     ON feedbacks(user_id);
```

---

### sessions (NextAuth)

NextAuth gère ses propres tables. Avec l'adapter Drizzle, les tables suivantes sont créées automatiquement :

```sql
-- Gérées par NextAuth Drizzle Adapter
accounts        -- OAuth providers (V2)
sessions        -- sessions utilisateur
verification_tokens  -- tokens email/magic link
```

---

## Données de référence et contraintes

### Limites par plan

Ces règles sont appliquées au niveau applicatif (pas de contrainte DB), mais documentées ici pour référence :

| Règle | Free | Pro |
|-------|------|-----|
| Projets actifs max | 10 | Illimité |
| Générations / heure | 20 | 100 |
| Rétention projets | 90 jours | Illimité |
| Versions par artefact | 10 | Illimité |

---

## Migrations

Outil : **Drizzle Kit** (`drizzle-kit generate` + `drizzle-kit migrate`).

Les migrations sont versionnées dans `/drizzle/migrations/` et appliquées automatiquement au déploiement via un script de build Vercel.

```bash
# Générer une migration
npx drizzle-kit generate

# Appliquer les migrations
npx drizzle-kit migrate
```

---

## Considérations de performance

### Indexes
- Index composé `(user_id, status)` sur `projects` pour le dashboard utilisateur.
- Index GIN sur `artifacts.content` pour permettre des requêtes sur le contenu JSON si nécessaire en V2.
- Tous les champs `created_at` sont indexés implicitement via les PKs UUID.

### Partitionnement (V2)
Si le volume de `generation_steps` dépasse 10M de lignes, partitionnement par `created_at` (mensuel).

### Archivage
Les projets archivés depuis plus de 90 jours (plan free) sont supprimés par un job CRON Vercel hebdomadaire.

---

## Exemple de requêtes clés

### Dashboard utilisateur — liste des projets
```sql
SELECT
  p.id, p.name, p.status, p.template,
  p.created_at, p.updated_at,
  COUNT(a.id) FILTER (WHERE a.status = 'completed') AS artifacts_completed,
  COUNT(a.id) AS artifacts_total
FROM projects p
LEFT JOIN artifacts a ON a.project_id = p.id
WHERE p.user_id = $1
  AND p.status != 'archived'
GROUP BY p.id
ORDER BY p.updated_at DESC
LIMIT 20;
```

### Détail d'un projet avec ses artefacts
```sql
SELECT
  p.*,
  json_agg(
    json_build_object(
      'id', a.id,
      'type', a.type,
      'status', a.status,
      'coherence_score', a.coherence_score,
      'generated_at', a.generated_at
    ) ORDER BY a.type
  ) AS artifacts
FROM projects p
LEFT JOIN artifacts a ON a.project_id = p.id
WHERE p.id = $1
  AND p.user_id = $2
GROUP BY p.id;
```

### Dernière version d'un artefact
```sql
SELECT av.*
FROM artifact_versions av
WHERE av.artifact_id = $1
ORDER BY av.version_number DESC
LIMIT 1;
```

### Métriques de génération (observabilité)
```sql
SELECT
  DATE_TRUNC('day', gj.created_at) AS day,
  COUNT(*)                          AS jobs_total,
  COUNT(*) FILTER (WHERE gj.status = 'completed') AS jobs_success,
  AVG(gj.total_duration_ms)         AS avg_duration_ms,
  AVG(gs.attempt_count)             AS avg_attempts_per_step
FROM generation_jobs gj
JOIN generation_steps gs ON gs.job_id = gj.id
WHERE gj.created_at >= NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1 DESC;
```
