# Product Requirements Document (PRD)

## Product objective

AI Software Architect is an AI-assisted engineering platform that transforms business requirements into actionable technical artifacts (architecture, DB schema, backlog, diagrams) before any code is written.

---

## Scope (MVP)

### Included features

| Feature | Description |
|---|---|
| **Text input** | User enters a project description (minimum 50 words). |
| **Business analysis** | Automatic extraction of requirements, actors, features, and constraints. |
| **Architecture generation** | Tech stack proposal, modules, and justifications. |
| **Database schema** | Conceptual model with tables, relations, and constraints. |
| **Mermaid diagrams** | Automatic diagram generation (C4 level 2 or sequence). |
| **Development backlog** | User stories with priority and story points (Fibonacci). |
| **Export** | Download in Markdown, PDF, and JSON formats. |

### Excluded features (V1)
* Source code generation
* IDE integrations (VS Code, Cursor)
* Dynamic multi-model agents
* Shared knowledge base (RAG)
* Cloud cost estimation (AWS, Azure, GCP)

---

## Technical constraints

| Domain | Constraint |
|---|---|
| **Response time** | Complete generation must take less than 2 minutes for a standard project. |
| **Language** | French interface (MVP), English planned for V2. |
| **Primary LLM** | Google Gemini 3.5 Flash (free tier) — fixed model for MVP. |
| **Fallback LLM** | DeepSeek V4 Flash — activated automatically on primary model unavailability. |
| **Dynamic model selection** | Deferred to V2. |
| **Storage** | PostgreSQL for projects, artifacts, and version history. |
| **Authentication** | Simple email/password (MVP), SSO planned for V2. |
| **Rate limit** | 20 requests per hour per user (free). |

---

## Artifact validation strategy

Each artifact passes through an automatic validation step before being displayed to the user.

### Validation pipeline

```
LLM generates artifact
        ↓
Structural validation (format, completeness)
        ↓
Cross-artifact coherence validation
        ↓
        ├─ Success → Display to user
        └─ Failure → Automatic retry (max 2 attempts)
                        ↓
                  Persistent failure → User notification + manual retry option
```

### Cross-artifact coherence rules

| Check | Description |
|---|---|
| **Architecture ↔ DB Schema** | Entities in architecture must exist in DB schema |
| **DB Schema ↔ Backlog** | CRUD stories must reference existing tables |
| **Business Analysis ↔ Architecture** | Identified actors must correspond to roles in architecture |
| **Diagrams ↔ Architecture** | Mermaid components must reflect generated architecture |

---

## Product OKRs

| Objective | Metric | Target |
|---|---|---|
| **Adoption** | Projects generated per week | > 100 |
| **Quality** | Architect approval rate | > 80% |
| **Engagement** | User feedback return rate | > 30% |
| **Efficiency** | Reduction in estimated design time | > 70% |

---

## Detailed KPIs

| KPI | Definition | Critical threshold |
|---|---|---|
| **Generation time** | Delay between submission and artifact display | < 120 seconds |
| **Completion rate** | % of generations that complete without error | > 95% |
| **Coherence score** | Automatic cross-artifact coherence check | > 90% |
| **User satisfaction** | Average score out of 5 (post-generation survey) | > 4.0 |
| **Export rate** | % of users who export artifacts | > 60% |
| **Manual retry rate** | % of generations requiring a user retry | < 5% |

---

## UX Principles

1. **Simplicity:** One input field, one "Generate" button.
2. **Transparency:** Step-by-step progress display.
3. **Control:** Ability to modify intermediate inputs.
4. **Clarity:** Structured visualization (tabs, diagrams, tables).
5. **Actionability:** Artifacts are directly usable by teams.

---

## MVP exit criteria

- [ ] 10 beta users have generated at least 3 projects each
- [ ] 100% of test cases (defined in use-cases.md) pass successfully
- [ ] Average generation time is under 2 minutes
- [ ] 5 senior architects have validated the quality of results
- [ ] Interface is responsive (mobile, tablet, desktop)
- [ ] Cross-artifact validation pipeline is active and covers 100% of defined rules
- [ ] Automatic retry mechanism is operational and tested
