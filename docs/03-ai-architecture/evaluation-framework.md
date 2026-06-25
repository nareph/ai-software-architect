# AI Software Architect - Evaluation Framework

## Objectif

Le framework d'évaluation mesure la qualité des artefacts générés de façon objective et reproductible. Il sert trois usages :

1. **Validation continue** — chaque génération est scorée automatiquement avant d'être présentée à l'utilisateur.
2. **Amélioration des prompts** — comparer les performances entre versions de prompts.
3. **Sélection de modèles** — benchmark objectif entre providers LLM.

---

## Dimensions d'évaluation

### 1. Validité structurelle (automatique)

Vérifie que l'artefact respecte le schéma JSON attendu.

| Critère | Méthode | Poids |
|---|---|---|
| JSON valide | `JSON.parse()` sans erreur | Bloquant |
| Schéma respecté | Validation Zod | Bloquant |
| Champs obligatoires présents | Zod `.required()` | Bloquant |
| Types corrects | Zod type checking | Bloquant |

Un artefact qui échoue à la validité structurelle déclenche un retry immédiat — il n'est jamais présenté à l'utilisateur.

---

### 2. Complétude (automatique)

Vérifie que l'artefact couvre l'ensemble du périmètre attendu.

| Artefact | Critères de complétude | Poids |
|---|---|---|
| Business Analysis | ≥ 2 acteurs, ≥ 5 features, ≥ 2 règles métier | 15 % |
| Architecture | ≥ 3 layers dans le stack, ≥ 2 modules, ≥ 1 risque | 15 % |
| Database Schema | ≥ 3 tables, toutes les tables ont PK + timestamps | 15 % |
| Diagrams | C4 + séquence présents et non vides | 15 % |
| Backlog | ≥ 2 épics, ≥ 8 stories, ≥ 1 story critique | 15 % |

Score de complétude = (critères satisfaits / critères totaux) × 100

---

### 3. Cohérence inter-artefacts (automatique)

Exécuté par le Coherence Validator après la génération complète.

| Règle | Vérification | Poids |
|---|---|---|
| `entities_db_coverage` | Entités métier → tables DB | 25 % |
| `features_stories_coverage` | Features critiques → stories | 25 % |
| `actors_backlog_coverage` | Acteurs → user stories | 15 % |
| `modules_diagram_sync` | Modules archi → diagramme C4 | 20 % |
| `db_stories_consistency` | Stories CRUD → tables existantes | 15 % |

Score de cohérence = moyenne pondérée des règles satisfaites.

---

### 4. Qualité technique (semi-automatique)

Évalue la pertinence des choix techniques. Partiellement automatisable via des règles heuristiques.

**Architecture :**

| Critère | Heuristique | Poids |
|---|---|---|
| Justifications présentes | Chaque stack item a `justification` non vide | 20 % |
| Alternatives listées | ≥ 1 alternative pour les choix critiques | 15 % |
| Risques identifiés | ≥ 1 risque avec mitigation | 15 % |
| Cohérence style/stack | Microservices → présence d'un API Gateway ou message broker | 25 % |
| Absence d'antipatterns détectés | Règles heuristiques (voir ci-dessous) | 25 % |

**Antipatterns détectés automatiquement :**
- Stack trop complexe pour un MVP (> 8 technologies différentes)
- Microservices recommandés pour < 3 acteurs sans justification de scale
- Absence de cache pour un système avec > 1 000 utilisateurs attendus
- Absence d'authentification dans l'architecture

**Database Schema :**

| Critère | Heuristique | Poids |
|---|---|---|
| UUIDs comme PKs | Toutes les PKs sont de type UUID | 20 % |
| Timestamps présents | `created_at` + `updated_at` sur toutes les tables | 20 % |
| Index justifiés | Chaque index a une description non vide | 20 % |
| Relations cohérentes | Types de relations (`one_to_many`, etc.) cohérents avec le domaine | 20 % |
| Normalisation | Absence de données dupliquées détectable (heuristique) | 20 % |

**Diagrams :**

| Critère | Méthode | Poids |
|---|---|---|
| Syntaxe Mermaid valide | Parsing via `@mermaid-js/mermaid` | 50 % |
| Nombre d'éléments raisonnable | Entre 3 et 15 éléments par diagramme | 25 % |
| Labels lisibles | Absence de caractères spéciaux problématiques | 25 % |

**Backlog :**

| Critère | Heuristique | Poids |
|---|---|---|
| Format user story respecté | `asA` + `iWant` + `soThat` non vides | 20 % |
| Points Fibonacci valides | Valeurs dans {1, 2, 3, 5, 8, 13} uniquement | 20 % |
| Critères d'acceptance testables | ≥ 3 par story, formulés avec "Quand/Alors" ou équivalent | 30 % |
| Dépendances cohérentes | Les IDs référencés dans `dependencies` existent | 30 % |

---

### 5. Score global

```
Score global = (
  Score complétude × 0.20 +
  Score cohérence × 0.35 +
  Score qualité technique × 0.45
)
```

La validité structurelle est un prérequis bloquant — un artefact invalide ne reçoit pas de score global.

| Score global | Niveau | Comportement |
|---|---|---|
| ≥ 0.90 | ✅ Excellent | Indicateur vert |
| 0.80 – 0.89 | ✅ Bon | Indicateur vert clair |
| 0.70 – 0.79 | ⚠️ Acceptable | Indicateur orange + liste des points d'attention |
| < 0.70 | ❌ Insuffisant | Indicateur rouge + retry automatique recommandé |

---

## Évaluation humaine (bêta)

Pendant la phase bêta, 5 architectes seniors évaluent un échantillon de générations selon une grille standardisée.

### Grille d'évaluation humaine

**Pour chaque artefact, noter de 1 à 5 :**

| Dimension | Question | 1 | 3 | 5 |
|---|---|---|---|---|
| Pertinence | Les choix correspondent-ils au besoin ? | Hors sujet | Partiellement adapté | Parfaitement adapté |
| Justesse technique | Les choix sont-ils techniquement corrects ? | Erreurs majeures | Quelques imprécisions | Irréprochable |
| Complétude | Rien d'important n'est manquant ? | Lacunes critiques | Quelques oublis | Complet |
| Exploitabilité | Peut-on l'utiliser directement ? | Inutilisable | Nécessite des corrections | Prêt à l'emploi |
| Cohérence globale | Les artefacts sont-ils alignés entre eux ? | Contradictions | Légères incohérences | Parfaitement cohérents |

**Cible bêta :** Score moyen ≥ 4.0 / 5.0 sur un panel de 20 projets représentatifs.

---

## Pipeline d'évaluation automatique

```typescript
class ArtifactEvaluator {
  async evaluate(artifacts: GeneratedArtifacts): Promise<EvaluationResult> {

    // 1. Validité structurelle (bloquant)
    const structural = await this.validateStructure(artifacts);
    if (!structural.passed) return { passed: false, reason: 'structural', ...structural };

    // 2. Complétude
    const completeness = await this.evaluateCompleteness(artifacts);

    // 3. Cohérence inter-artefacts
    const coherence = await this.coherenceValidator.validate(artifacts);

    // 4. Qualité technique
    const quality = await this.evaluateTechnicalQuality(artifacts);

    // 5. Score global
    const globalScore =
      completeness.score * 0.20 +
      coherence.score * 0.35 +
      quality.score * 0.45;

    return {
      passed: globalScore >= 0.70,
      globalScore,
      completeness,
      coherence,
      quality,
      issues: [
        ...coherence.issues,
        ...quality.issues
      ].sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])
    };
  }
}
```

---

## Benchmark de prompts

Lors d'une mise à jour de prompt, un benchmark est exécuté avant déploiement.

### Procédure

1. Sélectionner 10 projets de référence couvrant les 5 templates (2 projets par template).
2. Générer les artefacts avec la version actuelle du prompt (baseline).
3. Générer les artefacts avec la nouvelle version du prompt (challenger).
4. Comparer les scores sur les 5 dimensions.
5. Déployer uniquement si le challenger améliore ou maintient le score global sur ≥ 8/10 projets.

### Projets de référence

| ID | Description | Template | Complexité |
|---|---|---|---|
| REF-01 | Plateforme de réservation salle de sport | saas | Moyenne |
| REF-02 | SaaS de facturation B2B | saas | Haute |
| REF-03 | E-commerce de vêtements | ecommerce | Moyenne |
| REF-04 | E-commerce avec ERP existant | ecommerce | Haute |
| REF-05 | Marketplace de freelances | marketplace | Haute |
| REF-06 | Marketplace de services locaux | marketplace | Moyenne |
| REF-07 | App mobile de fitness | mobile | Moyenne |
| REF-08 | App mobile de suivi médical | mobile | Haute |
| REF-09 | API publique de paiement | api | Haute |
| REF-10 | Migration monolithe PHP | legacy | Très haute |

---

## Métriques de suivi (production)

Ces métriques sont collectées en production et consultables dans le back-office admin.

| Métrique | Définition | Cible |
|---|---|---|
| `avg_global_score` | Score global moyen de toutes les générations | ≥ 0.85 |
| `structural_failure_rate` | % de générations avec échec de structure | < 2 % |
| `retry_rate` | % d'étapes ayant nécessité ≥ 1 retry | < 10 % |
| `fallback_rate` | % d'étapes ayant basculé sur GPT-4o | < 5 % |
| `coherence_avg_score` | Score de cohérence moyen | ≥ 0.90 |
| `human_approval_rate` | % d'artefacts approuvés sans modification (bêta) | ≥ 80 % |
| `avg_generation_time_ms` | Durée moyenne d'une génération complète | < 90 000 ms |

Ces métriques sont loggées par `GenerationStep` en base et agrégées via des requêtes SQL quotidiennes.
