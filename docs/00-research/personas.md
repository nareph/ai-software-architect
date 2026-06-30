# Personas

## 1. Startup Founder

**Profile:** Company creator, often non-technical or with limited technical skills. Must validate an idea quickly to raise funding or attract early users.

**Goals:**
* Transform an idea into a credible architecture
* Get a cloud cost estimate
* Have a recommended and justified tech stack
* Produce presentable documentation for investors

**Pain points:**
* Doesn't know where to start technically
* The developers consulted give contradictory opinions
* Difficulty estimating costs and timelines
* Code generation tools don't help make decisions

**Success metric:** Get a complete, documented architecture in under 5 minutes, presentable to a CTO or investor.

---

## 2. Freelance Developer

**Profile:** Independent developer chaining missions. Often alone or with a small team. Must deliver quickly and at low cost.

**Goals:**
* Speed up analysis and design phases
* Reduce time spent upstream of projects
* Produce quality documentation without effort
* Bill more development days (vs. analysis)

**Pain points:**
* Analysis phases are not billed or poorly billed
* Spends too much time documenting already-made decisions
* Lacks perspective on architectural choices
* Must often justify choices to clients

**Success metric:** Reduce time spent on architecture artifacts by 70%.

---

## 3. Solution Architect

**Profile:** Senior software architect in a medium to large company (200 to 2,000 employees). Responsible for technical consistency across 3 to 8 simultaneous projects. Key interlocutor between business and development teams.

**Operational context:**
* Manages multiple projects in parallel with different teams
* Must produce documentation usable by junior and senior developers
* Works in a tooled environment: Confluence, Jira, draw.io, sometimes Structurizr
* Deliverables are expected by teams before sprint 0

**Goals:**
* Automate first-level documentation production
* Focus on critical trade-offs rather than repetitive writing
* Ensure consistency across projects in their portfolio
* Have traceability of architectural decisions over time

**Pain points:**
* Spends 30 to 50% of their time writing documents that AI could produce automatically
* Development teams don't follow recommendations due to lack of clear documentation
* Decisions made verbally are never formalized and get lost
* Each new project starts from an empty template rather than proven patterns
* Documentation maintenance becomes impossible once the project gains speed

**Relationship to existing tools:**
* Already uses draw.io or Miro for diagrams — too manual, too slow
* Tried Structurizr — too much friction for teams unfamiliar with C4 DSL
* Uses ChatGPT ad hoc — useful but inconsistent results, no reproducible workflow

**Success metric:** Automated production of 80% of first-level architecture artifacts, allowing 100% of remaining time to be devoted to non-automatable critical decisions.

---

## 4. CTO

**Profile:** Technical leader of a scale-up or SME (50 to 500 employees). Oversees the entire technical strategy, team organization, and infrastructure choices. Bears responsibility for medium and long-term technical decisions.

**Operational context:**
* Supervises between 3 and 15 simultaneous projects carried by autonomous teams
* No longer in code daily — depends on reports and artifacts produced by teams
* Must align teams with heterogeneous technical maturity levels
* Reports to a board or investors on technical choices

**Goals:**
* Standardize technical decisions across the organization to avoid fragmentation
* Reduce recurring architecture errors that generate technical debt
* Accelerate new projects reaching the development phase
* Have consolidated visibility on technical choices of each project

**Pain points:**
* Each team reinvents its own architecture, creating pattern fragmentation and maintenance debt
* Architectural errors repeat from one project to another due to lack of common knowledge base
* No formalized internal standard: decisions depend on the most senior architect present
* New projects start without documentation, slowing developer onboarding
* Impossible to quickly audit technical choices of a project without diving into the code

**Relationship to existing tools:**
* Already has Confluence + Jira — but architecture documentation there is rare, inconsistent, or outdated
* Teams use draw.io or PowerPoint slides for architectures — unmaintainable
* Aware that LLMs can help, but has no structured process to integrate them into the workflow

**What they concretely look for:**
* A tool that teams naturally adopt at the start of a project
* Exportable artifacts to existing tools (Confluence, Jira, GitHub)
* A minimum consistency guarantee between what is documented and what is implemented

**Success metric:** All new projects start with a documented, coherent, and shared architectural foundation — without friction for teams.
