# Market Analysis

## Overview of existing solutions

### v0.dev (Vercel) → v0.app

**What they do:** AI assistant for frontend scaffolding. Transforms text prompts into React components styled with Tailwind CSS. The new v0.app version is "agentic": it can search, reason, debug, and plan. It generates full-stack applications with UI, content, backend, and logic.

**What they don't do:** No software architecture, no database modeling, no backlog, no structured business analysis. Remains focused on UI and frontend code generation.

**Positioning:** "AI builder for everyone" — rapid prototyping tool, not an architecture assistant.

---

### Bolt (StackBlitz)

**What they do:** AI full-stack web development agent. Bolt v2 offers multi-model agents (Claude, etc.) with integrated infrastructure (databases, hosting, authentication, payments). Executes complex tasks in parallel.

**What they don't do:** No prior business analysis, no structured architectural documentation. The user must already know what they want to build.

**Positioning:** "Vibe coding pro" — code generation, not architectural design.

---

### Lovable

**What they do:** Chat-based development platform. Generates full-stack applications with React frontend and Supabase backend. Agent mode capable of exploring the codebase, fixing bugs, and refactoring. GitHub integration and one-click deployment.

**What they don't do:** Relatively locked tech stack (React + Supabase). No architecture design independent of code.

**Positioning:** Most complete "vibe coding" tool for the web — but focused on implementation, not design.

---

### Devin (Cognition)

**What they do:** "First autonomous AI software engineer." Can write, execute, and test code. Plans and executes complex tasks, from code migration to incident resolution. Operates in a sandboxed environment with shell, editor, and browser.

**What they don't do:** Does not produce upstream architecture. Designed for well-defined tasks, not system design.

**Positioning:** Autonomous implementation agent, not an architect.

---

### Claude Code (Anthropic)

**What they do:** Command-line agent that reads codebases, edits files, executes commands. Covers the full lifecycle: exploration, design, building, deployment, support.

**What they don't do:** Requires an existing codebase. No architecture generation from a simple business description.

**Positioning:** Development assistant integrated into the code environment, not an upstream design tool.

---

### Cursor

**What they do:** Autonomous IDE (VS Code fork) centered on AI. Understanding of the entire codebase. Local and cloud agents, parallel execution.

**What they don't do:** Coding tool, not architecture generation. Requires an existing project.

**Positioning:** "IDE rebuilt around AI" — development assistant, not architect.

---

### Traditional modeling tools

#### Miro / Lucidchart / draw.io

**What they do:** Collaborative whiteboards and diagram tools. Allow manually drawing architectures, flows, ERDs, and C4 diagrams.

**What they don't do:** No automatic generation from a business description. No guaranteed consistency between artifacts. No backlog, no integrated business analysis.

**Main limitation:** 100% manual. Quality depends entirely on user expertise.

#### Structurizr

**What they do:** C4 modeling tool based on code (DSL). Allows describing an architecture in text and automatically generating consistent diagrams.

**What they don't do:** Requires C4 expertise and DSL mastery. No business analysis, no backlog, no stack recommendations. No generation from natural language.

#### ChatGPT / Claude (general use)

**What they do:** Can produce architecture drafts, database schemas, or backlogs if asked manually.

**What they don't do:** No structured workflow. No guaranteed consistency between artifacts. No standardized export. No automatic validation. Each user reinvents their own process.

---

## Comparison table

| Tool | Code Gen | Architecture | Business Analysis | Backlog | Diagrams | Cost Est. | Non-expert Accessible |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| v0.app | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Bolt | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Lovable | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Devin | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| Claude Code | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |
| Miro / draw.io | ❌ | ⚠️ manual | ❌ | ❌ | ⚠️ manual | ❌ | ✅ |
| Structurizr | ❌ | ⚠️ partial | ❌ | ❌ | ✅ | ❌ | ❌ |
| ChatGPT / Claude ad hoc | ❌ | ⚠️ unstructured | ⚠️ unstructured | ⚠️ unstructured | ⚠️ unstructured | ❌ | ✅ |
| **AI Software Architect** | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Conclusion:** No existing tool combines automatic generation, inter-artifact consistency, and accessibility for non-experts on the upstream architecture phase. AI Software Architect occupies an empty and complementary space: **design before implementation, automated and accessible**.
