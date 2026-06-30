# AI Software Architect - MVP Implementation Spec

## Périmètre du MVP

Le MVP est une application Next.js 16 monolithique permettant à un utilisateur de :
1. Saisir une description de projet
2. Déclencher le pipeline de génération (5 agents séquentiels)
3. Visualiser les artefacts générés par onglets
4. Exporter en Markdown, PDF ou JSON

**Hors périmètre MVP :** multi-agents parallèles, RAG, estimation de coûts cloud, intégration IDE, plan DevOps.

---

## Stack technique exact

| Couche | Technologie | Version | Usage |
|---|---|---|---|
| Framework | Next.js | 16.2.9 | App Router, API Routes, SSE |
| Runtime | Node.js | ≥ 20.9.0 | Requis par Next.js 16 |
| Langage | TypeScript | 5.x | Typage strict |
| UI | React | 19.x | Composants |
| Styles | Tailwind CSS | 4.x | Utilitaires CSS |
| Composants | shadcn/ui | latest | Composants accessibles |
| Base de données | Neon PostgreSQL | serverless | Stockage projets/artefacts |
| ORM | Drizzle ORM | 0.38+ | Requêtes typesafe |
| Auth | NextAuth.js | 5.x (beta) | Email/password, JWT |
| Cache / Rate limit | Upstash Redis | latest | Rate limiting, cache |
| LLM principal | Google Gemini 3.5 Flash | free tier | Pipeline de génération MVP |
| LLM fallback | DeepSeek V4 Flash | latest | Fallback si Gemini indisponible |
| Diagrammes | Mermaid.js | 11.x | Rendu des diagrammes |
| Markdown | react-markdown + rehype-sanitize | latest | Rendu sécurisé |
| Validation | Zod | 3.x | Schémas d'artefacts |
| PDF export | @react-pdf/renderer | latest | Export PDF côté serveur |
| Package manager | pnpm | 9.x | Monorepo compatible |
| Déploiement | Vercel | - | CI/CD natif |
| Migrations DB | Drizzle Kit | latest | Versionning schema |

---

## Architecture des dossiers (détail)

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group auth (pas de layout principal)
│   │   ├── signin/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/                    # Route group app (avec layout principal)
│   │   ├── layout.tsx            # Layout avec sidebar + navbar
│   │   ├── dashboard/page.tsx    # Liste des projets
│   │   ├── projects/
│   │   │   ├── new/page.tsx      # Formulaire de création
│   │   │   └── [id]/
│   │   │       ├── page.tsx      # Dashboard projet + artefacts
│   │   │       └── loading.tsx   # Skeleton loading
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── projects/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   └── [id]/route.ts     # GET (detail), DELETE
│   │   ├── generate/
│   │   │   ├── [projectId]/route.ts        # POST (start)
│   │   │   ├── [projectId]/status/route.ts # GET (status)
│   │   │   └── [projectId]/stream/route.ts # GET (SSE)
│   │   ├── artifacts/
│   │   │   ├── [id]/route.ts               # GET (content)
│   │   │   ├── [id]/versions/route.ts      # GET (history)
│   │   │   └── [id]/restore/route.ts       # POST (restore)
│   │   ├── export/[projectId]/route.ts     # POST (export)
│   │   └── feedback/
│   │       ├── route.ts                    # POST (global rating)
│   │       └── [artifactId]/route.ts       # PATCH (artifact feedback)
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── ui/                       # shadcn/ui components (auto-générés)
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   └── Footer.tsx
│   ├── project/
│   │   ├── ProjectCard.tsx       # Carte projet dans le dashboard
│   │   ├── ProjectForm.tsx       # Formulaire de création/édition
│   │   └── ProjectStatus.tsx     # Badge de statut
│   ├── generation/
│   │   ├── GenerationProgress.tsx # Barre de progression SSE
│   │   ├── StepIndicator.tsx      # Indicateur d'étape
│   │   └── StreamListener.tsx     # Hook SSE client
│   ├── artifacts/
│   │   ├── ArtifactTabs.tsx      # Onglets des 5 artefacts
│   │   ├── ArtifactViewer.tsx    # Affichage d'un artefact
│   │   ├── MermaidRenderer.tsx   # Rendu Mermaid dans iframe sandboxé
│   │   ├── MarkdownRenderer.tsx  # Rendu Markdown sécurisé
│   │   ├── CoherenceScore.tsx    # Score + issues de cohérence
│   │   └── VersionHistory.tsx    # Historique des versions
│   ├── export/
│   │   └── ExportMenu.tsx        # Menu d'export (md/pdf/json)
│   └── feedback/
│       ├── ChatPanel.tsx         # Panel d'itération
│       └── RatingForm.tsx        # Évaluation post-génération
│
├── lib/
│   ├── db/
│   │   ├── index.ts              # Client Drizzle + connexion Neon
│   │   ├── schema.ts             # Schéma complet (toutes les tables)
│   │   └── queries/              # Requêtes réutilisables par entité
│   │       ├── projects.ts
│   │       ├── artifacts.ts
│   │       ├── generation.ts
│   │       └── users.ts
│   ├── auth/
│   │   ├── config.ts             # NextAuth config (providers, callbacks)
│   │   └── middleware.ts         # withAuth helper
│   ├── llm/
│   │   ├── client.ts             # LLMClient (Gemini + DeepSeek fallback)
│   │   ├── types.ts              # LLMRequest, LLMResponse interfaces
│   │   └── providers/
│   │       ├── gemini.ts         # Google Gemini SDK wrapper
│   │       └── deepseek.ts       # DeepSeek API wrapper
│   ├── agents/
│   │   ├── orchestrator.ts       # GenerationOrchestrator
│   │   ├── base.ts               # BaseAgent abstract class
│   │   ├── factory.ts            # AgentFactory
│   │   ├── coherence-validator.ts
│   │   └── implementations/
│   │       ├── requirements-analyst.ts
│   │       ├── solution-architect.ts
│   │       ├── database-architect.ts
│   │       ├── diagram-generator.ts
│   │       └── project-manager.ts
│   ├── prompts/
│   │   ├── v1.0.0/
│   │   │   ├── requirements-analyst.ts
│   │   │   ├── solution-architect.ts
│   │   │   ├── database-architect.ts
│   │   │   ├── diagram-generator.ts
│   │   │   └── project-manager.ts
│   │   └── config.ts             # PROMPT_VERSIONS
│   ├── schemas/
│   │   ├── artifacts.ts          # Zod schemas pour chaque artefact
│   │   └── api.ts                # Zod schemas pour les API routes
│   ├── export/
│   │   ├── markdown.ts           # Export Markdown
│   │   ├── pdf.ts                # Export PDF
│   │   └── json.ts               # Export JSON
│   ├── redis/
│   │   └── index.ts              # Client Upstash Redis
│   └── utils/
│       ├── ratelimit.ts          # Rate limiting helper
│       ├── sanitize.ts           # Sanitisation input LLM
│       └── context.ts            # Condensation du contexte
│
├── types/
│   ├── artifacts.ts              # Types TypeScript des artefacts
│   ├── api.ts                    # Types request/response API
│   └── db.ts                     # Types inférés depuis Drizzle schema
│
└── middleware.ts                 # NextAuth Edge middleware
```

---

## Implémentation des modules clés

### 1. LLM Client

```typescript
// src/lib/llm/client.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  provider: 'gemini' | 'deepseek';
  model: string;
  promptTokens: number;
  completionTokens: number;
  durationMs: number;
}

export class LLMClient {
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async complete(request: LLMRequest): Promise<LLMResponse> {
    const start = Date.now();
    try {
      return await this.callGemini(request, start);
    } catch (error) {
      if (this.shouldFallback(error)) {
        return await this.callDeepSeek(request, start);
      }
      throw error;
    }
  }

  private async callGemini(request: LLMRequest, start: number): Promise<LLMResponse> {
    const model = this.gemini.getGenerativeModel({
      model: 'gemini-2.5-flash',  // gemini-3.5-flash dès disponibilité stable
      systemInstruction: request.systemPrompt,
      generationConfig: {
        maxOutputTokens: request.maxTokens ?? 4096,
        temperature: request.temperature ?? 0.3,
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(request.userPrompt);
    const text = result.response.text();
    const usage = result.response.usageMetadata;

    return {
      content: text,
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      promptTokens: usage?.promptTokenCount ?? 0,
      completionTokens: usage?.candidatesTokenCount ?? 0,
      durationMs: Date.now() - start,
    };
  }

  private async callDeepSeek(request: LLMRequest, start: number): Promise<LLMResponse> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-v4-flash',
        messages: [
          { role: 'system', content: request.systemPrompt },
          { role: 'user', content: request.userPrompt },
        ],
        max_tokens: request.maxTokens ?? 4096,
        temperature: request.temperature ?? 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      provider: 'deepseek',
      model: 'deepseek-v4-flash',
      promptTokens: data.usage.prompt_tokens,
      completionTokens: data.usage.completion_tokens,
      durationMs: Date.now() - start,
    };
  }

  private shouldFallback(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('429') ||
             error.message.includes('503') ||
             error.message.includes('timeout');
    }
    return false;
  }
}
```

---

### 2. Orchestrateur

```typescript
// src/lib/agents/orchestrator.ts
import { db } from '@/lib/db';
import { artifacts, generationJobs, generationSteps } from '@/lib/db/schema';
import { AgentFactory } from './factory';
import { CoherenceValidator } from './coherence-validator';
import type { Project } from '@/types/db';

export type SSEEmitter = (event: string, data: unknown) => void;

const PIPELINE: Array<{ type: ArtifactType; order: number }> = [
  { type: 'business_analysis', order: 1 },
  { type: 'architecture', order: 2 },
  { type: 'database_schema', order: 3 },
  { type: 'diagrams', order: 4 },
  { type: 'backlog', order: 5 },
];

export class GenerationOrchestrator {
  private validator = new CoherenceValidator();

  async run(project: Project, jobId: string, emit: SSEEmitter): Promise<void> {
    const context: GenerationContext = {
      project: {
        description: project.description,
        template: project.template,
        constraints: project.constraints,
      },
      artifacts: {},
    };

    // Mise à jour statut job → running
    await db.update(generationJobs)
      .set({ status: 'running', startedAt: new Date() })
      .where(eq(generationJobs.id, jobId));

    let hasFailure = false;

    for (const step of PIPELINE) {
      emit('step_started', { artifactType: step.type, order: step.order });

      const result = await this.runStep(step, context, jobId, emit);

      if (result.success) {
        context.artifacts[step.type] = result.content;
      } else {
        hasFailure = true;
        emit('step_failed', { artifactType: step.type, error: result.error });
      }
    }

    // Validation de cohérence globale
    if (!hasFailure) {
      const validation = await this.validator.validate(context.artifacts);
      await this.persistValidation(project.id, validation);
      emit('coherence_checked', validation);
    }

    // Mise à jour statut projet
    const finalStatus = hasFailure ? 'partial' : 'completed';
    await db.update(projects)
      .set({ status: finalStatus, updatedAt: new Date() })
      .where(eq(projects.id, project.id));

    emit(hasFailure ? 'generation_failed' : 'generation_completed', {
      jobId,
      status: finalStatus,
    });
  }

  private async runStep(
    step: { type: ArtifactType; order: number },
    context: GenerationContext,
    jobId: string,
    emit: SSEEmitter,
  ) {
    const agent = AgentFactory.create(step.type);
    let attemptCount = 0;
    const MAX_RETRIES = 2;

    while (attemptCount <= MAX_RETRIES) {
      attemptCount++;
      try {
        const content = await agent.run(context);
        await this.persistArtifact(context.project.id, step.type, content, jobId, attemptCount);
        emit('step_completed', { artifactType: step.type, order: step.order });
        return { success: true, content };
      } catch (error) {
        if (attemptCount > MAX_RETRIES) {
          await this.markStepFailed(jobId, step.type, error);
          return { success: false, error: String(error) };
        }
        emit('step_retrying', { artifactType: step.type, attempt: attemptCount });
        await new Promise(r => setTimeout(r, 1000 * attemptCount)); // backoff
      }
    }
    return { success: false, error: 'Max retries exceeded' };
  }
}
```

---

### 3. SSE Handler

```typescript
// src/app/api/generate/[projectId]/stream/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { GenerationOrchestrator } from '@/lib/agents/orchestrator';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

export async function GET(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, params.projectId),
      eq(projects.userId, session.user.id)
    ),
  });
  if (!project) return new Response('Not Found', { status: 404 });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: string, data: unknown) => {
        const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(message));
      };

      try {
        const orchestrator = new GenerationOrchestrator();
        const job = await createGenerationJob(project.id);
        await orchestrator.run(project, job.id, emit);
      } catch (error) {
        emit('error', { message: String(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

---

### 4. Drizzle Schema

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, varchar, text, integer,
         numeric, timestamp, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  name:         varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  plan:         varchar('plan', { length: 20 }).notNull().default('free'),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt:  timestamp('last_login_at', { withTimezone: true }),
  deletedAt:    timestamp('deleted_at', { withTimezone: true }),
}, (t) => ({
  emailIdx: index('idx_users_email').on(t.email),
}));

export const projects = pgTable('projects', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:        varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  status:      varchar('status', { length: 20 }).notNull().default('draft'),
  template:    varchar('template', { length: 30 }),
  constraints: text('constraints'),
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  archivedAt:  timestamp('archived_at', { withTimezone: true }),
}, (t) => ({
  userIdIdx:      index('idx_projects_user_id').on(t.userId),
  userStatusIdx:  index('idx_projects_user_status').on(t.userId, t.status),
}));

export const artifacts = pgTable('artifacts', {
  id:               uuid('id').primaryKey().defaultRandom(),
  projectId:        uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type:             varchar('type', { length: 30 }).notNull(),
  status:           varchar('status', { length: 20 }).notNull().default('pending'),
  content:          jsonb('content'),
  coherenceScore:   numeric('coherence_score', { precision: 4, scale: 3 }),
  coherenceIssues:  text('coherence_issues').array(),
  generatedAt:      timestamp('generated_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  projectIdIdx:       index('idx_artifacts_project_id').on(t.projectId),
  projectTypeUnique:  uniqueIndex('idx_artifacts_project_type').on(t.projectId, t.type),
}));

export const artifactVersions = pgTable('artifact_versions', {
  id:            uuid('id').primaryKey().defaultRandom(),
  artifactId:    uuid('artifact_id').notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  content:       jsonb('content').notNull(),
  changeDesc:    text('change_desc'),
  triggerInput:  text('trigger_input'),
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  artifactIdIdx: index('idx_artifact_versions_artifact_id').on(t.artifactId),
}));

export const generationJobs = pgTable('generation_jobs', {
  id:              uuid('id').primaryKey().defaultRandom(),
  projectId:       uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  status:          varchar('status', { length: 20 }).notNull().default('queued'),
  startedAt:       timestamp('started_at', { withTimezone: true }),
  completedAt:     timestamp('completed_at', { withTimezone: true }),
  totalDurationMs: integer('total_duration_ms'),
  errorMessage:    text('error_message'),
  createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => ({
  projectIdIdx: index('idx_generation_jobs_project_id').on(t.projectId),
}));

export const generationSteps = pgTable('generation_steps', {
  id:              uuid('id').primaryKey().defaultRandom(),
  jobId:           uuid('job_id').notNull().references(() => generationJobs.id, { onDelete: 'cascade' }),
  artifactType:    varchar('artifact_type', { length: 30 }).notNull(),
  stepOrder:       integer('step_order').notNull(),
  status:          varchar('status', { length: 20 }).notNull().default('pending'),
  attemptCount:    integer('attempt_count').notNull().default(0),
  llmProvider:     varchar('llm_provider', { length: 20 }),
  llmModel:        varchar('llm_model', { length: 100 }),
  promptTokens:    integer('prompt_tokens'),
  completionTokens: integer('completion_tokens'),
  durationMs:      integer('duration_ms'),
  startedAt:       timestamp('started_at', { withTimezone: true }),
  completedAt:     timestamp('completed_at', { withTimezone: true }),
  errorMessage:    text('error_message'),
}, (t) => ({
  jobIdIdx: index('idx_generation_steps_job_id').on(t.jobId),
}));

export const feedbacks = pgTable('feedbacks', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  artifactId:         uuid('artifact_id').notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  userId:             uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:               varchar('type', { length: 20 }).notNull(),
  content:            text('content').notNull(),
  response:           text('response'),
  triggeredVersionId: uuid('triggered_version_id').references(() => artifactVersions.id),
  createdAt:          timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
```

---

### 5. Variables d'environnement

```bash
# .env.local

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<générer avec: openssl rand -base64 32>

# Database
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# LLM — MVP (free tier)
GEMINI_API_KEY=<Google AI Studio API key>
DEEPSEEK_API_KEY=<DeepSeek Platform API key>

# LLM — V1 (commenté en MVP)
# ANTHROPIC_API_KEY=sk-ant-...
# OPENROUTER_API_KEY=sk-or-...

# Redis
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Critères de complétion du MVP

| Critère | Description |
|---|---|
| ✅ Auth fonctionnelle | Inscription, connexion, déconnexion |
| ✅ Création de projet | Formulaire + validation + persistance |
| ✅ Pipeline complet | 5 agents séquentiels avec retry et fallback |
| ✅ Progression temps réel | SSE opérationnel, barre de progression mise à jour |
| ✅ Visualisation des artefacts | 5 onglets, Mermaid rendu, Markdown sécurisé |
| ✅ Score de cohérence | Affiché après génération avec issues |
| ✅ Export Markdown | Téléchargement .md complet |
| ✅ Export JSON | Téléchargement .json structuré |
| ✅ Export PDF | Téléchargement .pdf mis en page |
| ✅ Historique des versions | Visible et navigable |
| ✅ Rate limiting | 20 générations/heure sur `/api/generate` |
| ✅ Responsive | Mobile, tablette, desktop |
| ✅ 10 utilisateurs bêta | Ont chacun généré ≥ 3 projets |
