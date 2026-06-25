# AI Software Architect - AI Architecture

## Vue d'ensemble

L'architecture IA de la plateforme repose sur un **pipeline séquentiel multi-agents** orchestré par un coordinateur central. Chaque agent est spécialisé sur un type d'artefact, reçoit en contexte les artefacts produits par les agents précédents, et retourne un output structuré validé avant de passer la main à l'agent suivant.

L'objectif n'est pas de créer des agents autonomes capables de prendre des décisions libres — c'est de créer un **pipeline déterministe et reproductible** qui transforme une description métier en artefacts cohérents et exploitables.

---

## Principes directeurs

1. **Séquentiel, pas parallèle.** Chaque agent enrichit le contexte pour le suivant. La cohérence inter-artefacts prime sur la vitesse.
2. **Output structuré obligatoire.** Chaque agent retourne du JSON validé contre un schéma strict. Pas de texte libre non structuré.
3. **Contexte cumulatif.** Chaque agent reçoit l'intégralité des artefacts précédents dans son prompt. Le contexte grandit à chaque étape.
4. **Validation systématique.** Un validateur de cohérence vérifie les liens entre artefacts après chaque étape.
5. **Fallback explicite.** En cas d'échec, le comportement de retry et de fallback est défini et testé.

---

## Architecture globale du pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATOR                                 │
│              (Coordinateur du pipeline de génération)               │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │            INPUT PROCESSOR              │
          │  Nettoyage · Détection langue · Template│
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │         REQUIREMENTS ANALYST            │  Step 1
          │         → business_analysis (JSON)      │
          └────────────────────┬────────────────────┘
                               │ + business_analysis
          ┌────────────────────▼────────────────────┐
          │          SOLUTION ARCHITECT             │  Step 2
          │         → architecture (JSON)           │
          └────────────────────┬────────────────────┘
                               │ + architecture
          ┌────────────────────▼────────────────────┐
          │         DATABASE ARCHITECT              │  Step 3
          │         → database_schema (JSON)        │
          └────────────────────┬────────────────────┘
                               │ + database_schema
          ┌────────────────────▼────────────────────┐
          │          DIAGRAM GENERATOR              │  Step 4
          │         → diagrams (Mermaid)            │
          └────────────────────┬────────────────────┘
                               │ + diagrams
          ┌────────────────────▼────────────────────┐
          │           PROJECT MANAGER               │  Step 5
          │         → backlog (JSON)                │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │         COHERENCE VALIDATOR             │
          │  Vérification croisée de tous les       │
          │  artefacts · Score · Issues             │
          └────────────────────┬────────────────────┘
                               │
          ┌────────────────────▼────────────────────┐
          │              OUTPUT STORE               │
          │  Persistance en DB · Notification SSE   │
          └─────────────────────────────────────────┘
```

---

## Composants de l'architecture IA

### 1. Orchestrator

Le coordinateur central qui gère le cycle de vie du pipeline.

**Responsabilités :**
- Instancier et séquencer les agents
- Passer le contexte cumulatif à chaque agent
- Gérer les retries et le fallback LLM
- Émettre les événements SSE de progression
- Persister les résultats en base après chaque étape

**Implémentation :** Classe TypeScript `GenerationOrchestrator` instanciée par l'API Route `POST /api/generate/:projectId`.

```typescript
class GenerationOrchestrator {
  async run(project: Project): Promise<GenerationResult> {
    const context: GenerationContext = { project, artifacts: {} };

    for (const step of PIPELINE_STEPS) {
      const agent = AgentFactory.create(step.type);
      const result = await this.runStep(agent, context);
      context.artifacts[step.type] = result;
      await this.persist(step.type, result, project.id);
      await this.emit(step.type, 'completed');
    }

    const validation = await this.validate(context);
    return { artifacts: context.artifacts, validation };
  }
}
```

---

### 2. Input Processor

Prétraitement de la description utilisateur avant injection dans le pipeline.

**Opérations :**
- Suppression des caractères de contrôle et séquences dangereuses
- Normalisation des espaces et sauts de ligne
- Détection de la langue (si non-français → note ajoutée au contexte)
- Enrichissement avec le template sélectionné (si présent)
- Enrichissement avec les contraintes additionnelles

---

### 3. Agents spécialisés

Cinq agents, un par type d'artefact. Chaque agent encapsule :
- Son prompt système (rôle + instructions + format de sortie)
- La logique d'appel LLM (avec retry et fallback)
- La validation de son output contre un schéma JSON

Détail complet dans `agent-system.md`.

---

### 4. Coherence Validator

Agent de révision exécuté après les 5 étapes de génération.

**Vérifications effectuées :**

| Vérification | Description | Score impact |
|---|---|---|
| Entités DB ↔ Architecture | Toute entité mentionnée dans l'archi doit exister en DB | Élevé |
| Acteurs métier ↔ Backlog | Chaque acteur de l'analyse doit apparaître dans au moins une user story | Moyen |
| Tables DB ↔ Backlog | Les stories CRUD doivent référencer des tables existantes | Moyen |
| Composants diagrammes ↔ Architecture | Les composants Mermaid doivent correspondre à l'archi | Élevé |
| Stack technique ↔ Diagrammes | Les technologies mentionnées doivent apparaître dans les diagrammes | Faible |

**Output du validateur :**
```json
{
  "score": 0.94,
  "issues": [
    {
      "severity": "warning",
      "rule": "actors_backlog",
      "description": "L'acteur 'Coach' est défini dans l'analyse mais absent du backlog",
      "artifacts": ["business_analysis", "backlog"]
    }
  ]
}
```

---

### 5. LLM Client

Couche d'abstraction sur les providers LLM.

**Responsabilités :**
- Appel Anthropic SDK (provider principal)
- Fallback automatique vers OpenRouter (provider secondaire)
- Gestion des timeouts (30s par appel)
- Comptage des tokens (prompt + completion)
- Logging des appels pour l'observabilité

```typescript
class LLMClient {
  async complete(request: LLMRequest): Promise<LLMResponse> {
    try {
      return await this.anthropic.complete(request);
    } catch (error) {
      if (this.isFallbackError(error)) {
        return await this.openrouter.complete(request);
      }
      throw error;
    }
  }
}
```

---

## Gestion du contexte

Le contexte est l'élément central qui assure la cohérence entre agents. Il grossit à chaque étape.

### Structure du contexte

```typescript
interface GenerationContext {
  project: {
    description: string;
    template: string | null;
    constraints: string | null;
  };
  artifacts: {
    business_analysis?: BusinessAnalysis;
    architecture?: Architecture;
    database_schema?: DatabaseSchema;
    diagrams?: Diagrams;
    backlog?: Backlog;
  };
}
```

### Gestion de la taille du contexte

Le contexte cumulatif peut atteindre ~8 000 tokens à l'étape 5 (backlog). Pour rester dans les limites du modèle et optimiser les coûts :

- **Steps 1-2 :** Contexte complet (description + template)
- **Steps 3-4 :** Résumé condensé de l'analyse métier + artefacts complets précédents
- **Step 5 :** Résumé condensé des artefacts 1-4 + points clés

La condensation est effectuée par une fonction `summarize()` appliquée aux artefacts volumineux avant injection dans le prompt.

---

## Stratégie de retry et fallback

```
Appel LLM
    │
    ├─ Succès → Validation schéma
    │               ├─ Valide → Continuer
    │               └─ Invalide → Retry #1
    │                               ├─ Succès → Continuer
    │                               └─ Échec → Retry #2
    │                                           ├─ Succès → Continuer
    │                                           └─ Échec → Fallback OpenRouter
    │                                                       ├─ Succès → Continuer
    │                                                       └─ Échec → Step FAILED
    │
    └─ Timeout (30s) → Retry #1 → ... (même séquence)
```

**Comportement en cas de Step FAILED :**
- Le job continue avec les étapes suivantes
- Le projet passe en statut `partial`
- L'artefact défaillant reste en statut `failed`
- L'utilisateur peut relancer uniquement l'étape défaillante

---

## Évolutions V2 — Architecture multi-agents avancée

En V2, le pipeline séquentiel sera enrichi de deux capacités supplémentaires :

### Architecture Review Agent
Agent critique qui analyse l'architecture générée et détecte les antipatterns (God Object, couplage fort, absence de séparation des responsabilités) avant de valider.

### Parallel Sub-Agents
Pour les projets complexes, certaines étapes pourront être décomposées en sous-agents parallèles (ex: génération simultanée du diagramme C4 et du diagramme de séquence).
