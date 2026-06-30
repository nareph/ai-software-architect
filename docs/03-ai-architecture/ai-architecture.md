# AI Architecture

## Overview

The AI architecture relies on a **sequential multi-agent pipeline** orchestrated by a central coordinator. Each agent specializes in one artifact type, receives previous artifacts as context, and returns a validated structured output before passing control to the next agent.

The goal is not to create autonomous agents capable of making free decisions — it's to create a **deterministic and reproducible pipeline** that transforms a business description into coherent, usable artifacts.

---

## Core principles

1. **Sequential, not parallel.** Each agent enriches the context for the next. Cross-artifact consistency takes priority over speed.
2. **Mandatory structured output.** Each agent returns JSON validated against a strict schema.
3. **Cumulative context.** Each agent receives all previous artifacts. Context grows with each step.
4. **Systematic validation.** A coherence validator checks links between artifacts after each step.
5. **Explicit fallback.** Retry and fallback behavior on failure is defined and tested.

---

## Pipeline

```
User input
      │
      ▼
[Step 1] Requirements Analyst    → business_analysis
      │
      ▼
[Step 2] Solution Architect      → architecture
      │  (context: business_analysis)
      ▼
[Step 3] Database Architect      → database_schema
      │  (context: + architecture)
      ▼
[Step 4] Diagram Generator       → diagrams
      │  (context: + database_schema)
      ▼
[Step 5] Project Manager         → backlog
      │  (context: business_analysis + architecture)
      ▼
[Validation] Coherence Validator
      │
      ▼
Results persisted + SSE notification
```

---

## Orchestrator

Single entry point — `src/lib/agents/orchestrator.ts`. API Routes only call this function, never the mock or LLM directly.

**Switching mock → real LLM: change ONE env var**

```bash
USE_MOCK_GENERATION=false   # real LLM calls
USE_MOCK_GENERATION=true    # mock pipeline (default)
```

---

## Retry & fallback strategy

```
LLM call
    │
    ├─ Success → Schema validation
    │               ├─ Valid → Continue
    │               └─ Invalid → Retry #1 → Retry #2 → Fallback DeepSeek
    │
    └─ Timeout (30s) → Retry #1 → ... (same sequence)
```

**On Step FAILED:** Job continues with remaining steps. Project moves to `partial` status. User can relaunch only the failed step.

---

## V2 Evolution

- **Architecture Review Agent** — critic agent detecting anti-patterns before validation
- **Parallel Sub-Agents** — for complex projects, some steps can be decomposed into parallel sub-agents
