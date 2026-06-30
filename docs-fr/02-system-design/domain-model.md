# AI Software Architect - Domain Model

## Approche

Le modèle de domaine suit les principes du **Domain-Driven Design (DDD)**. Le domaine est organisé autour de deux bounded contexts principaux : **Project Management** (gestion du cycle de vie des projets) et **Generation** (orchestration de la génération d'artefacts par l'IA).

---

## Bounded Contexts

```
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│      PROJECT MANAGEMENT         │   │          GENERATION             │
│                                 │   │                                 │
│  User                           │   │  GenerationJob                  │
│  Project                        │◄──│  GenerationStep                 │
│  Artifact                       │   │  ValidationResult               │
│  ArtifactVersion                │   │  LLMRequest                     │
│  Feedback                       │   │  LLMResponse                    │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## Entités et agrégats

### User (Agrégat)

Représente un utilisateur inscrit sur la plateforme.

```
User
├── id: UUID
├── email: string (unique)
├── name: string
├── passwordHash: string
├── plan: enum(free, pro)
├── createdAt: DateTime
├── lastLoginAt: DateTime
└── projects: Project[] (relation)
```

**Règles métier :**
- Un utilisateur `free` peut avoir au maximum 10 projets actifs.
- Un utilisateur `free` est limité à 20 générations par heure.
- La suppression d'un utilisateur entraîne l'archivage (soft delete) de tous ses projets.

---

### Project (Agrégat racine)

Le projet est l'entité centrale. Il encapsule la description initiale de l'utilisateur et tous les artefacts générés.

```
Project
├── id: UUID
├── userId: UUID (FK → User)
├── name: string (déduit de la description)
├── description: string (input utilisateur, min 50 mots)
├── status: enum(draft, generating, completed, partial, archived)
├── template: enum(saas, ecommerce, marketplace, mobile, api, legacy, custom) | null
├── constraints: string | null (contraintes additionnelles)
├── createdAt: DateTime
├── updatedAt: DateTime
├── artifacts: Artifact[] (relation)
└── generationJobs: GenerationJob[] (relation)
```

**Règles métier :**
- Un projet passe en statut `generating` dès qu'un job de génération est lancé.
- Un projet est `completed` si tous les artefacts sont générés sans erreur.
- Un projet est `partial` si au moins un artefact a échoué.
- Un projet `archived` n'est plus visible dans le dashboard mais reste en base.

**Transitions de statut :**
```
draft → generating → completed
                  → partial → generating → completed
                                        → partial (échecs persistants)
completed → generating (régénération complète)
partial   → generating (régénération des artefacts échoués)
* → archived
```

Un projet `partial` repasse en `generating` lorsque l'utilisateur relance les artefacts en échec. Il passe en `completed` si tous les artefacts sont désormais générés avec succès, ou reste `partial` si certains échouent à nouveau.

---

### Artifact (Entité)

Un artefact est un document généré par l'IA, associé à un projet. Chaque type d'artefact a sa propre structure de contenu.

```
Artifact
├── id: UUID
├── projectId: UUID (FK → Project)
├── type: enum(business_analysis, architecture, database_schema, diagrams, backlog)
├── status: enum(pending, generating, completed, failed)
├── content: JSONB (structure variable selon le type)
├── coherenceScore: float | null (score de cohérence 0-1)
├── coherenceIssues: string[] | null (liste des incohérences détectées)
├── generatedAt: DateTime | null
├── versions: ArtifactVersion[] (relation)
└── feedback: Feedback[] (relation)
```

**Structure du contenu par type :**

```
business_analysis:
  {
    summary: string,
    actors: { name, role, description }[],
    features: { name, description, priority }[],
    constraints: string[],
    assumptions: string[]
  }

architecture:
  {
    stack: { layer, technology, justification }[],
    modules: { name, responsibility, dependencies }[],
    patterns: string[],
    risks: { description, mitigation }[]
  }

database_schema:
  {
    tables: {
      name, description,
      columns: { name, type, nullable, unique, default }[],
      indexes: { columns, unique }[],
      foreignKeys: { column, references }[]
    }[],
    relations: { from, to, type }[]
  }

diagrams:
  {
    c4_container: string (Mermaid),
    sequence: string (Mermaid),
    deployment: string (Mermaid) | null
  }

backlog:
  {
    epics: { name, description }[],
    stories: {
      id, epic, title, asA, iWant, soThat,
      priority: enum(critical, high, medium, low),
      storyPoints: number,
      acceptanceCriteria: string[]
    }[]
  }
```

---

### ArtifactVersion (Entité)

Chaque modification d'un artefact crée une nouvelle version. Permet l'historique et le retour arrière.

```
ArtifactVersion
├── id: UUID
├── artifactId: UUID (FK → Artifact)
├── versionNumber: integer (auto-incrémenté par artefact)
├── content: JSONB (snapshot du contenu)
├── changeDescription: string | null (description du changement)
├── createdAt: DateTime
└── triggerInput: string | null (input utilisateur ayant déclenché la régénération)
```

**Règles métier :**
- La version 1 est créée lors de la génération initiale.
- Chaque régénération d'un artefact (totale ou partielle) crée une nouvelle version.
- Le retour à une version antérieure crée une nouvelle version (pas d'écrasement).

---

### GenerationJob (Entité)

Représente une exécution complète du pipeline de génération pour un projet.

```
GenerationJob
├── id: UUID
├── projectId: UUID (FK → Project)
├── status: enum(queued, running, completed, failed)
├── startedAt: DateTime | null
├── completedAt: DateTime | null
├── totalDurationMs: integer | null
├── steps: GenerationStep[] (relation)
└── errorMessage: string | null
```

---

### GenerationStep (Entité)

Représente une étape individuelle du pipeline (une étape = un appel LLM = un type d'artefact).

```
GenerationStep
├── id: UUID
├── jobId: UUID (FK → GenerationJob)
├── artifactType: enum(business_analysis, architecture, database_schema, diagrams, backlog)
├── order: integer (1 à 5)
├── status: enum(pending, running, completed, failed, retrying)
├── attemptCount: integer (max 2 retries + 1 fallback)
├── llmProvider: enum(anthropic, openrouter) | null
├── llmModel: string | null
├── promptTokens: integer | null
├── completionTokens: integer | null
├── durationMs: integer | null
├── startedAt: DateTime | null
├── completedAt: DateTime | null
└── errorMessage: string | null
```

**Règles métier :**
- Les étapes sont exécutées dans l'ordre (1 → 5).
- Une étape échouée après 2 retries bascule sur le fallback LLM.
- Si le fallback échoue, l'étape passe en statut `failed` et le job continue (projet `partial`).

---

### Feedback (Entité)

Retour utilisateur sur un artefact, déclenche une régénération ciblée.

```
Feedback
├── id: UUID
├── artifactId: UUID (FK → Artifact)
├── userId: UUID (FK → User)
├── type: enum(modification, question, comparison)
├── content: string (texte libre de l'utilisateur)
├── response: string | null (réponse de l'IA si type=question)
├── triggeredVersionId: UUID | null (FK → ArtifactVersion si régénération)
└── createdAt: DateTime
```

---

### Decision (Entité — V2)

Stockage des décisions architecturales pour réutilisation future (base du système RAG V2).

```
Decision
├── id: UUID
├── projectId: UUID (FK → Project)
├── category: enum(stack, pattern, database, security, infra)
├── title: string
├── description: string
├── justification: string
├── alternatives: string[]
└── createdAt: DateTime
```

---

## Relations entre entités

```
User (1) ──────────── (N) Project
Project (1) ────────── (N) Artifact
Project (1) ────────── (N) GenerationJob
Artifact (1) ────────── (N) ArtifactVersion
Artifact (1) ────────── (N) Feedback
GenerationJob (1) ────── (N) GenerationStep
Feedback (0..1) ────────── (1) ArtifactVersion (triggered)
```

---

## Value Objects

### ProjectStatus
`draft | generating | completed | partial | archived`

### ArtifactType
`business_analysis | architecture | database_schema | diagrams | backlog`

### Priority
`critical | high | medium | low`

### StoryPoints
Valeurs Fibonacci uniquement : `1 | 2 | 3 | 5 | 8 | 13`

### CoherenceScore
Float entre 0 et 1. Seuil d'avertissement : `< 0.85`. Seuil d'échec : `< 0.60`.

---

## Ubiquitous Language

| Terme | Définition |
|-------|-----------|
| **Projet** | L'unité de travail centrale — une description métier + ses artefacts générés |
| **Artefact** | Un document structuré produit par l'IA (analyse, architecture, DB, diagrammes, backlog) |
| **Version** | Un snapshot immuable d'un artefact à un instant donné |
| **Génération** | Le processus complet d'exécution du pipeline LLM pour un projet |
| **Job** | Une instance d'exécution du pipeline de génération |
| **Étape** | Un appel LLM individuel produisant un artefact |
| **Cohérence** | L'alignement sémantique entre les artefacts d'un même projet |
| **Feedback** | Une instruction utilisateur déclenchant une modification ou régénération |
| **Fallback** | Le basculement automatique vers le LLM secondaire (GPT-4o) |
| **Template** | Un profil de projet préconfigré (SaaS, marketplace, etc.) |
