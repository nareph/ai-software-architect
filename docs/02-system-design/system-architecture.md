# System Architecture

## Overview

AI Software Architect is a full-stack Next.js 16 application deployed on Vercel, with Neon PostgreSQL as the primary database and Upstash Redis for caching and generation queue management.

The architecture follows a **modular monolith** pattern for the MVP: a single Next.js repo containing the frontend, backend API Routes, and the LLM orchestration pipeline.

---

## Global schema

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 16 (App Router)               │
│            Frontend · API Routes · SSE                   │
└─────────────────┬───────────────────────────────────────┘
                  │
     ┌────────────┼────────────┐
     ▼            ▼            ▼
  Neon DB    Upstash Redis   Generation Pipeline
 (Projects,  (Rate limit,    │
  Artifacts)  Cache)         ├─ Requirements Analyst
                             ├─ Solution Architect
                             ├─ Database Architect
                             ├─ Diagram Generator
                             ├─ Project Manager
                             └─ Coherence Validator
                                      │
                             ┌────────┴────────┐
                             ▼                 ▼
                      Gemini 3.5 Flash   DeepSeek V4 Flash
                        (Primary)          (Fallback)
```

---

## Application layers

### 1. Frontend (Next.js 16 App Router)

**Responsibilities:**
- Complete user interface (landing, auth, dashboard, editor, results)
- Artifact rendering (Markdown, Mermaid, tables)
- Client state management (React Context + Zustand for generation state)
- Streaming generation results (Server-Sent Events)

**Main pages:**

| Route | Description |
|---|---|
| `/[locale]` | Landing page (SSG) |
| `/[locale]/signin` | Email/password login |
| `/[locale]/dashboard` | User project list |
| `/[locale]/projects/new` | Creation form |
| `/[locale]/projects/[id]` | Project dashboard + artifacts |

---

### 2. API Routes (Backend)

**Responsibilities:**
- Authentication and authorization
- Project and artifact CRUD
- Generation pipeline orchestration
- Cross-artifact validation
- Document export

---

### 3. Orchestration Layer (LLM Pipeline)

**Responsibilities:**
- Sequential orchestration of 5 generation steps
- Prompt and context management
- Structural and coherence validation of each artifact
- Automatic retry (max 2 attempts per step)
- Fallback to DeepSeek on Gemini failure

**Generation pipeline:**

```
User input
      │
      ▼
[Step 1] Requirements Analyst → business_analysis
      ▼
[Step 2] Solution Architect → architecture
      ▼
[Step 3] Database Architect → database_schema
      ▼
[Step 4] Diagram Generator → mermaid_diagrams
      ▼
[Step 5] Project Manager → backlog
      ▼
[Validation] Coherence Checker
      ▼
Results saved to database
```

---

## Key architectural decisions

### ADR-001: Next.js monolith vs separate microservices
**Decision:** Next.js monolith for MVP.
**Reason:** Reduced operational complexity, native Vercel deployment, rapid iteration.

### ADR-002: Sequential vs parallel generation
**Decision:** Sequential artifact generation.
**Reason:** Each artifact depends on previous ones to guarantee consistency.

### ADR-003: Streaming vs polling
**Decision:** Server-Sent Events (SSE) for progress tracking.
**Reason:** Real-time feedback without WebSocket complexity. Compatible with Vercel Edge.

### ADR-004: JSON artifact storage
**Decision:** Artifacts stored as structured JSON in database (PostgreSQL `jsonb` column).
**Reason:** Schema flexibility per artifact type, multi-format export facilitated.
