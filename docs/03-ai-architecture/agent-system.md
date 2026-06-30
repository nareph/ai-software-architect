# Agent System

## Overview

The pipeline consists of 6 agents: 5 specialized generation agents and 1 cross-cutting validation agent.

---

## Agent 1 — Requirements Analyst

**Role:** Business analyst. Transforms free text into structured business analysis.

**Output:** `business_analysis` — actors, features, business rules, constraints, assumptions, out-of-scope.

**Key rule:** If description < 50 words, generates 3 clarifying questions instead of a full artifact.

---

## Agent 2 — Solution Architect

**Role:** Senior software architect. Designs the technical architecture from business analysis.

**Output:** `architecture` — style, stack (with justifications and alternatives), modules, patterns, risks, scalability notes.

**Key rule:** Adapts complexity to context — a 3-person startup doesn't need microservices.

---

## Agent 3 — Database Architect

**Role:** Database architect specialized in PostgreSQL. Designs the relational data schema.

**Output:** `database_schema` — tables, columns, relations, indexes, enums.

**Key rules:**
- 3NF minimum
- UUID primary keys
- `created_at` + `updated_at` on all main tables
- `deleted_at` for soft delete on sensitive entities
- Detects implicit entities from business analysis

---

## Agent 4 — Diagram Generator

**Role:** Systems modeling expert. Generates valid Mermaid diagrams.

**Output:** `diagrams` — C4 container, sequence diagram, ERD, optional deployment diagram.

**Key rules:**
- Maximum 15 elements per diagram for readability
- No special characters in Mermaid labels
- Syntax validated via `@mermaid-js/mermaid` before persistence

---

## Agent 5 — Project Manager

**Role:** Senior technical product manager. Creates a structured development backlog.

**Output:** `backlog` — epics, user stories (As a / I want / So that), Fibonacci story points, acceptance criteria, dependencies.

**Key rules:**
- Fibonacci points only: 1, 2, 3, 5, 8, 13
- Minimum 3 acceptance criteria per story
- `mvpStories` field identifies MVP-critical stories

---

## Agent 6 — Coherence Validator

**Role:** Cross-cutting reviewer. Verifies consistency between all generated artifacts.

**Output:** `coherence` — global score (0-1), issues with severity and remediation suggestions.

| Score | Status | Behavior |
|---|---|---|
| ≥ 0.90 | ✅ Excellent | Green indicator |
| 0.80 – 0.89 | ✅ Good | Light green |
| 0.70 – 0.79 | ⚠️ Acceptable | Orange + warnings |
| < 0.70 | ❌ Insufficient | Red + auto retry recommended |

---

## Common interface

All agents implement the same interface:

```typescript
abstract class BaseAgent {
  abstract readonly type: ArtifactType
  abstract readonly outputSchema: ZodSchema
  abstract buildPrompt(context: GenerationContext): LLMRequest
  async run(context: GenerationContext): Promise<ArtifactContent>
}
```
