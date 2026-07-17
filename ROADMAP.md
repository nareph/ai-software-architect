# Roadmap

## Vision

AI Software Architect is an AI-powered engineering platform capable of transforming business requirements into actionable technical artifacts:

* Business Analysis
* User Stories
* Software Architecture
* Mermaid Diagrams
* Database Schema
* Cloud Architecture
* Development Backlog
* DevOps Plan
* Cost Estimation

The goal is not to generate code. The goal is to generate the **architecture decisions** needed before development.

---

## Phase 0 — Research & Product Definition ✅

* Project Vision
* Market Analysis
* Personas
* Problem Statement

---

## Phase 1 — Product Requirements ✅

* Product Requirements Document (PRD)
* Use Cases
* User Journey

---

## Phase 2 — System Design ✅

* System Architecture
* Domain Model
* Database Design
* API Specification
* Security

---

## Phase 3 — AI Architecture ✅

* AI Architecture Overview
* Agent System
* Prompt Strategy
* Model Selection
* Evaluation Framework

---

## Phase 4 — MVP ✅

### Completed features

**Auth & Users**
* Email/password registration and login
* JWT sessions via NextAuth.js v5
* Secure password hashing (bcrypt cost 12)

**Project Management**
* Project creation form (name, description, language selector, template, constraints)
* Project-level language setting (FR/EN, dissociated from UI locale)
* Soft delete (archive) + hard delete via SQL
* Dashboard with grid/list view

**Generation Pipeline**
* 5 sequential AI agents (Requirements Analyst, Solution Architect, Database Architect, Diagram Generator, Project Manager)
* Real LLM integration: Gemini 3.5 Flash (primary) + DeepSeek V4 Flash (fallback)
* Automatic retry (max 2 attempts per step)
* SSE real-time progress streaming
* Mock pipeline for development (USE_MOCK_GENERATION=true)
* Single-artifact retry on failure (UI button)
* JSON repair for truncated LLM responses

**Coherence Validation**
* 5 weighted rules: entities_db_coverage, features_stories_coverage, actors_backlog_coverage, modules_diagram_sync, db_stories_consistency
* Real score (0-1) replacing random placeholder
* Issues list with severity levels (error, warning, info)

**Artifact Visualization**
* 5 typed views: BusinessAnalysis, Architecture, DatabaseSchema, Diagrams, Backlog
* Mermaid rendering (theme-aware, light/dark)
* Collapsible user stories in Backlog view

**Export**
* Markdown (.md) — full structured output
* JSON (.json) — structured with meta
* PDF (.pdf) — cover page + 5 artifact pages (@react-pdf/renderer)

**Feedback / Chat**
* Slide-in panel (Notion AI style)
* Modify mode: updates artifact + creates new version in DB
* Explain mode: answers questions without modifying artifact
* Panel UI in project language (FR/EN), not UI language
* LLM error messages localized

**i18n**
* URL-based routing (/fr/*, /en/*)
* Language switcher in sidebar and auth nav
* All UI strings in messages/fr.json and messages/en.json
* Generated artifacts in project language (independent of UI locale)

**Security**
* Rate limiting: 20 generations/hour, 30 exports/hour (Upstash Redis)
* XSS sanitization on LLM output (rehype-sanitize)
* RBAC: resource ownership check on all API routes

**Documentation**
* GitBook EN (primary): docs/
* GitBook FR (variant): docs_fr/
* README.md (EN) at project root

---

## Phase 5 — Advanced AI Features ⬜

### Multi-Agent Workflow

```
Requirements Analyst
        ↓
    Architect
        ↓
  Database Expert
        ↓
  DevOps Expert
        ↓
    Reviewer (Architecture Review Agent)
```

### Planned features
* Architecture Review Agent (anti-pattern detection)
* Cost estimation (AWS, Azure, GCP)
* Technology recommendations based on context
* Version history UI (navigable)
* Parallel sub-agents for complex projects

---

## Phase 6 — Engineering Excellence ⬜

### Tests
* Unit
* Integration
* E2E
* AI Evaluation Tests

### Observability
* OpenTelemetry
* Logs, Metrics, Tracing

### CI/CD
* GitHub Actions
* Docker
* Terraform

---

## Phase 7 — Portfolio Assets ⬜

* Demo video (10-15 min)
* Blog posts
* Case studies

---

## Phase 8 — V2 ⬜

* C4 Model, UML, Sequence Diagrams, Infrastructure Diagrams
* Architecture Knowledge Graph
* RAG (technical documentation, RFCs, best practices)
* IDE Integration (VS Code, Cursor, Claude Code)
* Claude Sonnet 4.6 as primary LLM

---

## Success Criteria

The project is successful when:

* A product idea can be transformed into a complete architecture in under 5 minutes
* Diagrams are directly usable
* The backlog is coherent
* Technical recommendations are justified
* Documentation is automatically produced
* A senior recruiter immediately understands the value of the project after a 3-minute demo
