# AI Software Architect - Project Structure

## Structure complète du repo

```
ai-software-architect/
│
├── README.md
├── ROADMAP.md
├── .env.local                        # Variables d'environnement (non versionné)
├── .env.example                      # Template des variables (versionné)
├── .gitignore
├── .eslintrc.json
├── .prettierrc
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── drizzle.config.ts
├── package.json
│
├── docs/
│   ├── README.md
│   ├── 00-research/
│   ├── 01-product/
│   ├── 02-system-design/
│   ├── 03-ai-architecture/
│   ├── 04-mvp/
│   │   ├── mvp-implementation-spec.md
│   │   ├── project-structure.md
│   │   └── getting-started.md
│   └── assets/diagrams/
│
├── drizzle/
│   └── migrations/                   # Migrations générées par Drizzle Kit
│
├── public/
│   ├── favicon.ico
│   └── og-image.png
│
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   ├── signin/
    │   │   │   └── page.tsx
    │   │   └── register/
    │   │       └── page.tsx
    │   ├── (app)/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/
    │   │   │   └── page.tsx
    │   │   └── projects/
    │   │       ├── new/
    │   │       │   └── page.tsx
    │   │       └── [id]/
    │   │           ├── page.tsx
    │   │           └── loading.tsx
    │   ├── api/
    │   │   ├── auth/
    │   │   │   └── [...nextauth]/
    │   │   │       └── route.ts
    │   │   ├── projects/
    │   │   │   ├── route.ts
    │   │   │   └── [id]/
    │   │   │       └── route.ts
    │   │   ├── generate/
    │   │   │   └── [projectId]/
    │   │   │       ├── route.ts
    │   │   │       ├── status/
    │   │   │       │   └── route.ts
    │   │   │       └── stream/
    │   │   │           └── route.ts
    │   │   ├── artifacts/
    │   │   │   └── [id]/
    │   │   │       ├── route.ts
    │   │   │       ├── versions/
    │   │   │       │   └── route.ts
    │   │   │       └── restore/
    │   │   │           └── route.ts
    │   │   ├── export/
    │   │   │   └── [projectId]/
    │   │   │       └── route.ts
    │   │   └── feedback/
    │   │       ├── route.ts
    │   │       └── [artifactId]/
    │   │           └── route.ts
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    │
    ├── components/
    │   ├── ui/                        # shadcn/ui (auto-générés, ne pas modifier)
    │   ├── layout/
    │   │   ├── Navbar.tsx
    │   │   ├── Sidebar.tsx
    │   │   └── Footer.tsx
    │   ├── project/
    │   │   ├── ProjectCard.tsx
    │   │   ├── ProjectForm.tsx
    │   │   └── ProjectStatus.tsx
    │   ├── generation/
    │   │   ├── GenerationProgress.tsx
    │   │   ├── StepIndicator.tsx
    │   │   └── StreamListener.tsx
    │   ├── artifacts/
    │   │   ├── ArtifactTabs.tsx
    │   │   ├── ArtifactViewer.tsx
    │   │   ├── MermaidRenderer.tsx
    │   │   ├── MarkdownRenderer.tsx
    │   │   ├── CoherenceScore.tsx
    │   │   └── VersionHistory.tsx
    │   ├── export/
    │   │   └── ExportMenu.tsx
    │   └── feedback/
    │       ├── ChatPanel.tsx
    │       └── RatingForm.tsx
    │
    ├── lib/
    │   ├── db/
    │   │   ├── index.ts
    │   │   ├── schema.ts
    │   │   └── queries/
    │   │       ├── projects.ts
    │   │       ├── artifacts.ts
    │   │       ├── generation.ts
    │   │       └── users.ts
    │   ├── auth/
    │   │   ├── config.ts
    │   │   └── middleware.ts
    │   ├── llm/
    │   │   ├── client.ts
    │   │   ├── types.ts
    │   │   └── providers/
    │   │       ├── gemini.ts
    │   │       └── deepseek.ts
    │   ├── agents/
    │   │   ├── orchestrator.ts
    │   │   ├── base.ts
    │   │   ├── factory.ts
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
    │   │   └── config.ts
    │   ├── schemas/
    │   │   ├── artifacts.ts
    │   │   └── api.ts
    │   ├── export/
    │   │   ├── markdown.ts
    │   │   ├── pdf.ts
    │   │   └── json.ts
    │   ├── redis/
    │   │   └── index.ts
    │   └── utils/
    │       ├── ratelimit.ts
    │       ├── sanitize.ts
    │       └── context.ts
    │
    ├── types/
    │   ├── artifacts.ts
    │   ├── api.ts
    │   └── db.ts
    │
    └── middleware.ts
```

---

## Fichiers de configuration

### `package.json`

```json
{
  "name": "ai-software-architect",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:push": "drizzle-kit push"
  },
  "dependencies": {
    "next": "16.2.9",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-auth": "^5.0.0-beta.25",
    "@auth/drizzle-adapter": "latest",
    "drizzle-orm": "^0.38.0",
    "@neondatabase/serverless": "latest",
    "@upstash/ratelimit": "latest",
    "@upstash/redis": "latest",
    "@google/generative-ai": "latest",
    "zod": "^3.23.0",
    "react-markdown": "^9.0.0",
    "rehype-sanitize": "latest",
    "mermaid": "^11.0.0",
    "@react-pdf/renderer": "^4.0.0",
    "bcryptjs": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/bcryptjs": "latest",
    "typescript": "^5",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "drizzle-kit": "latest",
    "prettier": "^3"
  }
}
```

---

### `next.config.ts`

```typescript
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://generativelanguage.googleapis.com https://api.deepseek.com",
      "frame-src 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  experimental: {
    // Turbopack est le défaut en Next.js 16, pas besoin de l'activer
  },
};

export default nextConfig;
```

---

### `drizzle.config.ts`

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

---

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### `.env.example`

```bash
# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

# Database (Neon PostgreSQL)
DATABASE_URL=

# LLM — MVP (free tier Google + DeepSeek)
GEMINI_API_KEY=
DEEPSEEK_API_KEY=

# LLM — V1 (décommenter pour la prod)
# ANTHROPIC_API_KEY=
# OPENROUTER_API_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

### `.gitignore`

```
# Dependencies
node_modules/
.pnpm-store/

# Next.js
.next/
out/

# Env
.env
.env.local
.env.*.local

# Debug
npm-debug.log*
pnpm-debug.log*

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# DB
drizzle/migrations/*.sql  # garder les migrations en git si tu veux les versionner
                          # (retire cette ligne dans ce cas)
```

---

## Conventions de code

### Nommage

| Type | Convention | Exemple |
|---|---|---|
| Composants React | PascalCase | `ArtifactViewer.tsx` |
| Hooks | camelCase avec `use` | `useStreamListener.ts` |
| Utils / lib | camelCase | `sanitize.ts`, `ratelimit.ts` |
| API Routes | `route.ts` (convention Next.js) | `route.ts` |
| Types | PascalCase | `ArtifactType`, `GenerationContext` |
| Constantes | SCREAMING_SNAKE_CASE | `PIPELINE_STEPS`, `MAX_RETRIES` |
| Variables DB | snake_case (SQL) → camelCase (TS via Drizzle) | `created_at` → `createdAt` |

### Commit messages (Conventional Commits)

```
feat: add SSE stream endpoint for generation progress
fix: handle Gemini timeout in LLM client fallback
chore: add Drizzle migration for artifact_versions table
docs: update getting-started guide with Neon setup
refactor: extract context condensation to utils/context.ts
test: add unit tests for CoherenceValidator
```

### Structure d'une API Route

```typescript
// Pattern standard pour toutes les API Routes
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { z } from 'zod';

const RequestSchema = z.object({ /* ... */ });

export async function POST(req: NextRequest) {
  // 1. Auth
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  // 2. Validation
  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  // 3. Logique métier
  try {
    const result = await doSomething(parsed.data, session.user.id);
    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR' } }, { status: 500 });
  }
}
```
