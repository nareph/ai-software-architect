# Evaluation Framework

## Objective

The evaluation framework measures the quality of generated artifacts objectively and reproducibly. It serves three uses:

1. **Continuous validation** — each generation is automatically scored before being presented to the user
2. **Prompt improvement** — compare performance between prompt versions
3. **Model selection** — objective benchmark between LLM providers

---

## Evaluation dimensions

### 1. Structural validity (automatic) — Blocking

Verifies the artifact respects the expected JSON schema via Zod validation. A structurally invalid artifact triggers an immediate retry.

### 2. Completeness (automatic) — 20%

| Artifact | Completeness criteria |
|---|---|
| Business Analysis | ≥ 2 actors, ≥ 5 features, ≥ 2 business rules |
| Architecture | ≥ 3 stack layers, ≥ 2 modules, ≥ 1 risk |
| Database Schema | ≥ 3 tables, all tables have PK + timestamps |
| Diagrams | C4 + sequence present and non-empty |
| Backlog | ≥ 2 epics, ≥ 8 stories, ≥ 1 critical story |

### 3. Cross-artifact coherence (automatic) — 35%

| Rule | Check |
|---|---|
| `entities_db_coverage` | Business entities → DB tables |
| `features_stories_coverage` | Critical features → stories |
| `actors_backlog_coverage` | Actors → user stories |
| `modules_diagram_sync` | Architecture modules → C4 diagram |
| `db_stories_consistency` | CRUD stories → existing tables |

### 4. Technical quality (semi-automatic) — 45%

Auto-detected anti-patterns:
- Stack too complex for an MVP (> 8 different technologies)
- Microservices recommended for < 3 actors without scale justification
- Missing cache for a system with > 1,000 expected users
- Missing authentication in architecture

---

## Global score

```
Global score = (
  Completeness × 0.20 +
  Coherence    × 0.35 +
  Quality      × 0.45
)
```

| Score | Level | Behavior |
|---|---|---|
| ≥ 0.90 | ✅ Excellent | Green indicator |
| 0.80 – 0.89 | ✅ Good | Light green |
| 0.70 – 0.79 | ⚠️ Acceptable | Orange + warnings |
| < 0.70 | ❌ Insufficient | Red + auto retry recommended |

---

## Production metrics

| Metric | Definition | Target |
|---|---|---|
| `avg_global_score` | Average global score of all generations | ≥ 0.85 |
| `structural_failure_rate` | % of generations with structural failure | < 2% |
| `retry_rate` | % of steps requiring ≥ 1 retry | < 10% |
| `fallback_rate` | % of steps switching to fallback LLM | < 5% |
| `coherence_avg_score` | Average coherence score | ≥ 0.90 |
| `avg_generation_time_ms` | Average complete generation duration | < 90,000ms |
