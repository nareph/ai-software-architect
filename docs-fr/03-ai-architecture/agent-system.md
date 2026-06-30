# AI Software Architect - Agent System

## Vue d'ensemble

Le pipeline de génération est composé de 6 agents : 5 agents de génération spécialisés et 1 agent de validation transversale. Chaque agent est une classe TypeScript encapsulant son prompt système, sa logique d'appel LLM et la validation de son output.

---

## Agent 1 — Requirements Analyst

### Rôle
Analyste métier. Transforme une description textuelle libre en analyse métier structurée : acteurs, fonctionnalités, règles de gestion, contraintes et hypothèses.

### Input
```typescript
{
  description: string;       // Description brute de l'utilisateur
  template: string | null;   // Template sélectionné (saas, marketplace, etc.)
  constraints: string | null; // Contraintes additionnelles
}
```

### Output
```typescript
{
  summary: string;           // Résumé exécutif du projet (2-3 phrases)
  actors: {
    name: string;
    role: string;
    description: string;
  }[];
  features: {
    name: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    actor: string;           // Acteur principal concerné
  }[];
  businessRules: string[];   // Règles métier explicites
  constraints: string[];     // Contraintes techniques et métier
  assumptions: string[];     // Hypothèses formulées par l'agent
  outOfScope: string[];      // Ce qui est explicitement hors périmètre
}
```

### Prompt système (résumé)
```
Tu es un analyste métier senior spécialisé dans l'analyse de besoins logiciels.
Ta mission : extraire les informations structurées d'une description de projet.

Règles :
- Identifie tous les acteurs humains et systèmes externes
- Classe les fonctionnalités par priorité (critical = indispensable au MVP)
- Formule les hypothèses que tu fais quand la description est ambiguë
- Liste explicitement ce qui est hors périmètre pour éviter le scope creep
- Réponds UNIQUEMENT en JSON valide selon le schéma fourni
```

### Particularités
- Si la description est trop courte (< 50 mots), génère 3 questions de clarification au lieu d'un artefact complet.
- Les hypothèses (`assumptions`) sont cruciales — elles permettent à l'utilisateur de corriger les incompréhensions.

---

## Agent 2 — Solution Architect

### Rôle
Architecte logiciel senior. Conçoit l'architecture technique du système à partir de l'analyse métier. Propose une stack justifiée, des modules, des patterns et identifie les risques.

### Input
```typescript
{
  description: string;
  business_analysis: BusinessAnalysis; // Output Agent 1
  constraints: string | null;
}
```

### Output
```typescript
{
  overview: string;           // Description de l'architecture en 2-3 phrases
  style: string;              // Monolithe modulaire | Microservices | Serverless | etc.
  justification: string;      // Pourquoi ce style architectural
  stack: {
    layer: string;            // Frontend | Backend | Database | Cache | Queue | etc.
    technology: string;
    version: string | null;
    justification: string;
    alternatives: string[];   // Alternatives considérées
  }[];
  modules: {
    name: string;
    responsibility: string;
    technology: string;
    dependencies: string[];   // Noms des autres modules dont il dépend
    exposedApis: string[];    // Endpoints ou interfaces exposés
  }[];
  patterns: {
    name: string;             // Repository Pattern, CQRS, Event Sourcing, etc.
    justification: string;
  }[];
  integrations: {
    name: string;             // Stripe, SendGrid, etc.
    type: 'payment' | 'email' | 'storage' | 'auth' | 'analytics' | 'other';
    justification: string;
  }[];
  risks: {
    description: string;
    severity: 'high' | 'medium' | 'low';
    mitigation: string;
  }[];
  scalabilityNotes: string;   // Comment le système scale
  securityNotes: string;      // Points de sécurité clés
}
```

### Prompt système (résumé)
```
Tu es un architecte logiciel senior avec 15 ans d'expérience.
Ta mission : concevoir l'architecture technique d'un système à partir d'une analyse métier.

Règles :
- Choisis le style architectural le plus adapté au contexte (taille équipe, budget, complexité)
- Justifie chaque choix technologique — pas de choix arbitraires
- Liste les alternatives que tu as considérées pour les choix critiques
- Identifie les risques architecturaux et leurs mitigations
- Adapte la complexité au contexte : une startup de 2 personnes n'a pas besoin de microservices
- Réponds UNIQUEMENT en JSON valide selon le schéma fourni
```

### Particularités
- L'agent ajuste automatiquement la complexité selon les signaux contextuels (taille d'équipe mentionnée, budget, nombre d'utilisateurs attendus).
- Les `alternatives` dans le stack sont importantes pour la justification des choix auprès des équipes.

---

## Agent 3 — Database Architect

### Rôle
Architecte de bases de données. Conçoit le schéma de données relationnel à partir de l'analyse métier et de l'architecture. Produit un modèle conceptuel avec tables, relations, index et contraintes.

### Input
```typescript
{
  description: string;
  business_analysis: BusinessAnalysis;  // Output Agent 1
  architecture: Architecture;           // Output Agent 2
}
```

### Output
```typescript
{
  engine: string;             // PostgreSQL | MySQL | MongoDB | etc.
  justification: string;      // Pourquoi ce moteur
  tables: {
    name: string;
    description: string;
    columns: {
      name: string;
      type: string;           // VARCHAR(255), UUID, TEXT, JSONB, etc.
      nullable: boolean;
      unique: boolean;
      primaryKey: boolean;
      foreignKey: {
        table: string;
        column: string;
        onDelete: 'CASCADE' | 'SET NULL' | 'RESTRICT';
      } | null;
      default: string | null;
      description: string;
    }[];
    indexes: {
      columns: string[];
      unique: boolean;
      description: string;
    }[];
  }[];
  relations: {
    from: string;             // table.column
    to: string;               // table.column
    type: 'one_to_one' | 'one_to_many' | 'many_to_many';
    description: string;
  }[];
  enums: {
    name: string;
    values: string[];
  }[];
  notes: string[];            // Considérations de performance, partitionnement, etc.
}
```

### Prompt système (résumé)
```
Tu es un architecte de bases de données spécialisé en PostgreSQL.
Ta mission : concevoir le schéma de données d'un système à partir de l'analyse métier et de l'architecture.

Règles :
- Respecte les formes normales (3NF minimum)
- Utilise des UUID comme clés primaires
- Toujours prévoir created_at et updated_at sur les tables principales
- Prévoir soft delete (deleted_at) pour les entités sensibles
- Justifie les index — pas d'index systématique sans raison
- Les colonnes JSONB sont acceptables pour les données semi-structurées
- Réponds UNIQUEMENT en JSON valide selon le schéma fourni
```

### Particularités
- L'agent détecte les entités implicites dans l'analyse métier (ex: si "notifications" est mentionné dans les features, crée une table `notifications`).
- Les enums sont préférés aux VARCHAR non contraints pour les statuts et types.

---

## Agent 4 — Diagram Generator

### Rôle
Générateur de diagrammes. Produit des diagrammes Mermaid exploitables à partir de l'architecture et du schéma de données.

### Input
```typescript
{
  architecture: Architecture;       // Output Agent 2
  database_schema: DatabaseSchema;  // Output Agent 3
}
```

### Output
```typescript
{
  c4_container: string;     // Diagramme C4 niveau 2 (Mermaid)
  sequence: string;         // Diagramme de séquence du flux principal (Mermaid)
  erd: string;              // Entity Relationship Diagram simplifié (Mermaid)
  deployment: string | null; // Diagramme de déploiement si architecture complexe
}
```

### Prompt système (résumé)
```
Tu es un expert en modélisation de systèmes et diagrammes techniques.
Ta mission : générer des diagrammes Mermaid précis et exploitables.

Règles strictes pour Mermaid :
- Utilise UNIQUEMENT la syntaxe Mermaid valide
- C4 Container : utilise le type "C4Container" avec les balises Person, Container, System
- Sequence : utilise "sequenceDiagram" avec participant, ->> et -->>
- ERD : utilise "erDiagram" avec les relations ||--o{, }o--||, etc.
- Limite les diagrammes à 15 éléments max pour la lisibilité
- Pas de caractères spéciaux dans les labels (apostrophes, guillemets)
- Réponds UNIQUEMENT en JSON valide avec les diagrammes en string Mermaid
```

### Particularités
- Le diagramme de séquence représente toujours le flux principal identifié dans l'analyse métier (ex: processus de commande, flow d'authentification).
- Le diagramme de déploiement est généré uniquement si l'architecture comporte des composants cloud distincts.
- Les diagrammes sont validés syntaxiquement via `@mermaid-js/mermaid` avant persistance.

---

## Agent 5 — Project Manager

### Rôle
Chef de projet technique. Génère un backlog de développement structuré en épics et user stories, avec priorités et estimations en points Fibonacci.

### Input
```typescript
{
  business_analysis: BusinessAnalysis; // Output Agent 1
  architecture: Architecture;          // Output Agent 2
}
```

### Output
```typescript
{
  epics: {
    id: string;             // EP-01, EP-02, etc.
    name: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
  }[];
  stories: {
    id: string;             // US-001, US-002, etc.
    epicId: string;
    title: string;
    asA: string;            // En tant que [acteur]
    iWant: string;          // Je veux [action]
    soThat: string;         // Afin de [bénéfice]
    priority: 'critical' | 'high' | 'medium' | 'low';
    storyPoints: 1 | 2 | 3 | 5 | 8 | 13;
    acceptanceCriteria: string[];
    technicalNotes: string | null;  // Notes d'implémentation pour les devs
    dependencies: string[];         // IDs des stories dont elle dépend
  }[];
  totalStoryPoints: number;
  estimatedSprintsCount: number;  // Estimation à 2 semaines par sprint, 20 pts/sprint
  mvpStories: string[];           // IDs des stories indispensables au MVP
}
```

### Prompt système (résumé)
```
Tu es un Product Manager technique senior.
Ta mission : créer un backlog de développement structuré et actionnable.

Règles :
- Utilise le format "En tant que / Je veux / Afin de" pour chaque story
- Les points Fibonacci uniquement : 1, 2, 3, 5, 8, 13
- Minimum 3 critères d'acceptance par story
- Les stories critiques correspondent au MVP minimal viable
- Les dépendances entre stories doivent être explicites
- Ajoute des notes techniques quand une story implique un choix d'implémentation
- Vise 10 à 25 stories pour un MVP standard
- Réponds UNIQUEMENT en JSON valide selon le schéma fourni
```

### Particularités
- Le champ `mvpStories` permet à l'utilisateur d'identifier immédiatement les stories indispensables.
- Les `technicalNotes` sont le pont entre la story utilisateur et l'implémentation — elles référencent les tables DB et les modules architecturaux concernés.

---

## Agent 6 — Coherence Validator

### Rôle
Réviseur transversal. Vérifie la cohérence entre tous les artefacts générés et produit un score de cohérence global.

### Input
```typescript
{
  business_analysis: BusinessAnalysis;
  architecture: Architecture;
  database_schema: DatabaseSchema;
  diagrams: Diagrams;
  backlog: Backlog;
}
```

### Output
```typescript
{
  score: number;              // 0.000 à 1.000
  passed: boolean;            // true si score >= 0.85
  issues: {
    severity: 'error' | 'warning' | 'info';
    rule: string;             // Identifiant de la règle violée
    description: string;
    affectedArtifacts: string[];
    suggestion: string;       // Comment corriger
  }[];
}
```

### Règles de cohérence

| ID règle | Sévérité | Description |
|---|---|---|
| `entities_db_coverage` | error | Toute entité métier majeure doit avoir une table DB |
| `actors_backlog_coverage` | warning | Chaque acteur doit apparaître dans au moins une story |
| `tech_stack_diagram_sync` | warning | Les technologies du stack doivent apparaître dans les diagrammes |
| `features_stories_coverage` | error | Chaque feature critique doit avoir au moins une story |
| `modules_diagram_sync` | warning | Les modules de l'architecture doivent apparaître dans le diagramme C4 |
| `db_stories_consistency` | info | Les stories CRUD doivent référencer des tables existantes |

### Seuils

| Score | Statut | Comportement |
|---|---|---|
| ≥ 0.90 | ✅ Excellent | Indicateur vert affiché |
| 0.80 – 0.89 | ⚠️ Acceptable | Indicateur orange + liste des warnings |
| < 0.80 | ❌ Problématique | Indicateur rouge + retry ciblé recommandé |

---

## AgentFactory

Classe utilitaire qui instancie le bon agent selon le type d'artefact.

```typescript
class AgentFactory {
  static create(type: ArtifactType): BaseAgent {
    const agents = {
      business_analysis: RequirementsAnalystAgent,
      architecture: SolutionArchitectAgent,
      database_schema: DatabaseArchitectAgent,
      diagrams: DiagramGeneratorAgent,
      backlog: ProjectManagerAgent,
    };
    return new agents[type](llmClient);
  }
}
```

---

## Interface commune BaseAgent

Tous les agents implémentent la même interface pour garantir l'interopérabilité avec l'orchestrateur.

```typescript
abstract class BaseAgent {
  abstract readonly type: ArtifactType;
  abstract readonly outputSchema: ZodSchema;

  abstract buildPrompt(context: GenerationContext): LLMRequest;

  async run(context: GenerationContext): Promise<ArtifactContent> {
    const request = this.buildPrompt(context);
    const response = await this.llmClient.complete(request);
    const parsed = this.parseOutput(response.content);
    const validated = this.outputSchema.parse(parsed);
    return validated;
  }

  private parseOutput(content: string): unknown {
    // Supprime les backticks markdown si présents
    const clean = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(clean);
  }
}
```
