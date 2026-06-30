# User Journey

## Journey overview

```
1. Access & Input
   |
   v
2. Analysis & Clarification
   |
   v
3. Artifact Generation
   |
   v
4. Visualization & Discovery
   |
   v
5. Feedback & Iteration
   |
   v
6. Export & Use
```

---

## Step 1: Access and input

**Entry point:** Platform home page.

**User actions:**
- User arrives on the home page
- Reads a brief service presentation
- Clicks "New project"
- Enters project description (minimum 50 words, recommended 200+)
- Optionally: selects a template, adds constraints
- Clicks "Generate my architecture"

---

## Step 2: Analysis and clarification

**Scenario A (complete description):** AI proceeds directly to generation.

**Scenario B (partial description):** AI generates 2-4 clarifying questions. User answers, AI continues with new elements.

---

## Step 3: Artifact generation

Sequential generation of artifacts, displayed one by one:

```
✅ Business analysis complete
⏳ Architecture in progress... (45%)
⬜ Database schema
⬜ Mermaid diagrams
⬜ Development backlog
```

Each artifact passes through automatic coherence validation before being marked complete.

---

## Step 4: Visualization and discovery

Results displayed in tabs:

| Tab | Content |
|---|---|
| **📋 Analysis** | Summary, actors, features, constraints |
| **🏗️ Architecture** | Tech stack, modules, justifications, risks |
| **🗄️ Database** | ERD schema, tables with columns |
| **📊 Diagrams** | Mermaid rendering (C4, sequence, deployment) |
| **📝 Backlog** | User stories, priority, story points |

---

## Step 5: Feedback and iteration

- **Partial modification:** Click "Edit" on an artifact → write the desired change → AI regenerates only that artifact
- **Contextual question:** Integrated chat → AI responds with justification
- **Comparison:** User can request a variant → AI generates alternative and compares

---

## Step 6: Export and use

| Format | Content | Use |
|---|---|---|
| **Markdown (.md)** | All artifacts | Technical documentation in repo |
| **PDF** | Printable version | Presentation to stakeholders |
| **JSON** | Structured data | Reuse in other tools (e.g. Jira import) |

---

## Session persistence

- Projects are automatically saved after generation
- Users access all projects from their personal dashboard
- Each regeneration creates a new version — history navigable
- Free plan: 90-day retention, max 10 projects
