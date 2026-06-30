# Problem Statement

## The cost of the architecture phase

The architecture phase represents a considerable hidden cost in software projects today:

**Direct cost:** 20 to 40% of project time is dedicated to analysis and design phases. For a 6-month project, this represents 1 to 2 months of architect and project manager work.

**Indirect cost:** Implicit or poorly documented decisions generate technical debt that translates into:
* 15 to 20% additional development time
* Costly redesigns during maintenance phase
* Increased bugs related to inappropriate architectural choices

**Opportunity cost:** Time spent documenting and designing could be invested in innovation or improving existing products.

---

## Common mistakes

### 1. Implicit decisions
Architects make decisions without documenting them. The development team discovers them progressively, often too late.

### 2. Inconsistencies between artifacts
Business analysis, architecture, and backlog are not aligned. User stories don't reflect architectural choices.

### 3. Lack of justification
Technical choices are rarely justified. Teams inherit decisions without understanding the "why."

### 4. Systematic reinvention
Each project starts from scratch. Proven patterns are not reused from one project to another.

### 5. Obsolete documentation
Architecture documents are rarely updated. They quickly become unusable.

---

## Limitations of current solutions

### Code generation tools (v0, Bolt, Lovable)
* **Problem:** They skip the architecture step and go directly to code.
* **Consequence:** Decisions are made implicitly by the AI, without visibility or control.
* **Risk:** Architectures poorly adapted to real needs, difficult to evolve.

### Development assistants (Cursor, Claude Code)
* **Problem:** They assume an existing codebase.
* **Consequence:** They don't help with upstream design.
* **Risk:** Bad decisions are made before the assistant is even used.

### Autonomous agents (Devin)
* **Problem:** They execute well-defined tasks, but don't design architecture.
* **Consequence:** They're effective for implementation, not strategic thinking.
* **Risk:** Autonomization of implementation without overall architectural vision.

### Traditional modeling tools (Miro, Structurizr, Archi)
* **Problem:** They are manual and time-consuming. Structurizr and Archi require high expertise.
* **Consequence:** Rarely used in practice, except in heavily constrained large projects.
* **Risk:** Chronic underuse, non-existent documentation in the majority of real projects.

### General-purpose LLMs (ChatGPT, Claude ad hoc)
* **Problem:** They can produce architecture artifacts, but without structure, pipeline, or consistency validation.
* **Consequence:** Results depend entirely on prompt quality. Each user reinvents their own workflow.
* **Risk:** Inconsistent, non-exportable, non-reproducible artifacts. No organizational adoption possible.

---

## Why AI Software Architect is necessary

AI Software Architect fills a critical gap in the current ecosystem:

1. **It acts upstream** — before code is written, where decisions have the most impact.
2. **It produces structured artifacts** — not code, but documents usable by teams.
3. **It justifies decisions** — each technical choice is accompanied by its reasoning.
4. **It ensures consistency** — all artifacts are aligned and traceable.
5. **It standardizes** — best practices are reused from one project to another.

---

## Why now?

This project would not have been viable three years ago. Three converging evolutions create the window of opportunity today:

### 1. The maturity of complex reasoning LLMs

Models from 2021-2022 produced plausible text, not coherent architectural reasoning. Current models (Claude 3.5/3.7, GPT-4o) are capable of:
* Maintaining consistency across multiple interdependent artifacts
* Justifying technical choices with business and technical arguments
* Detecting anti-patterns in a high-level description
* Adapting recommendations to context (team size, budget, technical constraints)

### 2. Artifact format standardization

Mermaid is the de facto standard for diagrams in Git repos. Markdown is universal. OpenAPI and JSON are accepted in all project management tools. It is now possible to produce directly integrable artifacts into existing workflows without friction.

### 3. The void left by the vibe coding explosion

v0, Bolt, Lovable and Devin created a mass market for AI in development in 2023-2024 — and all ignored the architecture phase. In doing so, they made the problem even more visible: generating code without prior architecture creates projects that are difficult to maintain, evolve, and transfer.

---

## Success metrics

| Metric | Target |
|---|---|
| Generation time (standard project) | < 5 minutes |
| Generation time (complex project) | < 10 minutes |
| Approval rate by senior architects | > 80% |
| Reduction in time spent on analysis phase | > 70% |
| Coherence between artifacts (automatic verification) | > 95% |
| Utilization rate of technical recommendations | > 75% |
