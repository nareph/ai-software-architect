# AI Software Architect - Model Selection

## Contexte de l'évaluation

Le choix du modèle LLM est une décision architecturale critique pour ce projet. Les artefacts générés doivent être :
- **Structurellement valides** (JSON conforme au schéma)
- **Techniquement corrects** (choix architecturaux cohérents)
- **Cohérents entre eux** (alignement inter-artefacts)
- **Générés rapidement** (< 30s par étape, < 2 min total)
- **Économiquement viables** (coût par génération maîtrisé)

---

## Stratégie par phase

La sélection du modèle évolue avec le cycle de vie du projet :

| Phase | Contexte | Modèle principal | Fallback | Coût estimé |
|---|---|---|---|---|
| **MVP bêta** (≤ 10 utilisateurs, ≤ 5 projets) | Validation de la qualité, coût nul requis | Gemini 3.5 Flash (free tier) | DeepSeek V4 Flash | ~$0 |
| **V1 publique** (utilisateurs payants) | Qualité maximale, rentabilité | Claude Sonnet 4.6 | GPT-4o via OpenRouter | ~$0.12/génération |
| **V2 scale** (> 1 000 utilisateurs actifs) | Optimisation coût/qualité | Sélection dynamique | Multi-provider | TBD |

---

## Modèles évalués

### Gemini 3.5 Flash (Google) — Choix MVP

**Free tier :** ✅ Oui — tokens d'entrée et de sortie gratuits sur le niveau sans frais.

**Forces :**
- Free tier généreux adapté au MVP bêta (≤ 10 utilisateurs, ≤ 5 projets) — coût zéro garanti
- Modèle le plus récent et le plus intelligent de la gamme Flash Google (juin 2026)
- Fenêtre de contexte 1M tokens — aucun problème de troncature sur le pipeline
- Structured output (JSON) supporté nativement
- API compatible OpenAI — intégration simple, SDK JS disponible

**Limites :**
- Sur le free tier, les données sont utilisées pour améliorer les produits Google
- Rate limits plus restrictifs sur le free tier
- Légèrement inférieur à Claude Sonnet sur les raisonnements architecturaux très complexes

**Pricing (juin 2026) :**
- Free tier : $0.00 (entrée + sortie)
- Payant : $1.50/MTok input, $9/MTok output
- Coût estimé par génération (~21K tokens) sur free tier : **$0.00**

---

### DeepSeek V4 Flash — Fallback MVP

**Free tier :** ❌ Non — payant mais quasi-gratuit grâce au KV cache.

**Forces :**
- Coût très faible : $0.14/MTok (cache miss) et **$0.0028/MTok (cache hit)**
- Avec le system prompt mis en cache (~60% des tokens), coût réel < $0.01/génération
- Contexte 1M tokens, output 384K max
- Supporte JSON output et tool calls
- Compatible format Anthropic API (migration facile)

**Limites :**
- Provider moins établi que Google ou Anthropic
- Données traitées hors UE — à surveiller pour conformité RGPD en V1

**Pricing (juin 2026) :**
- Input cache miss : $0.14/MTok
- Input cache hit : $0.0028/MTok
- Output : $0.28/MTok
- Coût estimé par génération avec cache actif : **~$0.007**

---

### Claude Sonnet 4.6 (Anthropic) — Choix V1 publique

**Free tier :** ❌ Non (petit crédit offert à l'inscription uniquement).

**Forces :**
- Raisonnement structuré excellent — suit des instructions complexes avec précision
- Respect du format JSON strict très fiable (< 2% d'échec de format)
- Meilleure compréhension des patterns architecturaux et des décisions de conception
- Fenêtre de contexte 200K tokens
- SLA et disponibilité Anthropic fiables pour la production

**Limites :**
- Pas de free tier utilisable en production
- Coût le plus élevé parmi les candidats retenus

**Pricing (juin 2026) :**
- Input : $3/MTok
- Output : $15/MTok
- Coût estimé par génération complète (~21K tokens) : **~$0.12**

---

### GPT-4o (OpenAI via OpenRouter) — Fallback V1

**Free tier :** ❌ Non.

**Forces :**
- Performances proches de Claude Sonnet sur les tâches structurées
- Provider différent d'Anthropic — résilience en cas de panne
- Accessible via OpenRouter sans contrat direct OpenAI

**Limites :**
- Tendance à ignorer certaines contraintes de format sur les outputs longs
- Moins fiable sur la génération de diagrammes Mermaid
- Coût similaire à Claude Sonnet

**Pricing (juin 2026) :**
- Input : $2.5/MTok
- Output : $10/MTok
- Coût estimé par génération : **~$0.09**

---

### GPT-4o Mini / Gemini Flash-Lite / DeepSeek V4 Flash (économiques)

Évalués et rejetés pour la génération principale : taux d'échec de format JSON trop élevé sur les schémas complexes multi-artefacts (~15%). Acceptables pour des tâches simples (résumés, questions contextuelles) en V2.

---

## Tableau comparatif

| Critère | Gemini 3.5 Flash | DeepSeek V4 Flash | Claude Sonnet 4.6 | GPT-4o |
|---|:---:|:---:|:---:|:---:|
| Free tier MVP | ✅ Oui | ❌ Non | ❌ Non | ❌ Non |
| Qualité JSON structuré | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Raisonnement architectural | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Génération Mermaid | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Cohérence inter-artefacts | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Latence | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Coût MVP | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Disponibilité / SLA | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Conformité RGPD (free) | ⚠️ données utilisées | ⚠️ hors UE | ✅ | ✅ |

---

## Configuration par phase

### Phase MVP bêta

```typescript
// src/config/llm.ts — MVP
export const LLM_CONFIG = {
  primary: {
    provider: 'google',
    model: 'gemini-3.5-flash',
    maxTokens: 4096,
    timeoutMs: 30_000,
    temperature: 0.3,
  },
  fallback: {
    provider: 'deepseek',
    model: 'deepseek-v4-flash',
    maxTokens: 4096,
    timeoutMs: 30_000,
    temperature: 0.3,
  }
} as const;
```

### Phase V1 publique

```typescript
// src/config/llm.ts — V1
export const LLM_CONFIG = {
  primary: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
    maxTokens: 4096,
    timeoutMs: 30_000,
    temperature: 0.3,
  },
  fallback: {
    provider: 'openrouter',
    model: 'openai/gpt-4o',
    maxTokens: 4096,
    timeoutMs: 30_000,
    temperature: 0.3,
  }
} as const;
```

**Température à 0.3 :** Réglage bas pour favoriser la reproductibilité et le respect strict du format JSON. Une température haute introduit de la variabilité créative non souhaitée pour des artefacts techniques structurés.

---

## Estimation des coûts

### MVP bêta (free tier Gemini)

| Scénario | Générations | Coût LLM |
|---|---|---|
| 10 utilisateurs × 5 projets | 50 | **$0.00** |

### V1 publique (Claude Sonnet 4.6)

| Scénario | Générations/mois | Coût LLM/mois |
|---|---|---|
| 100 utilisateurs actifs | ~1 200 | ~$144 |
| 1 000 utilisateurs actifs | ~12 000 | ~$1 440 |
| 10 000 utilisateurs actifs | ~120 000 | ~$14 400 |

À partir de 1 000 utilisateurs actifs, l'activation du **prompt caching Anthropic** (0.30x sur les cache hits) et l'optimisation des prompts permettront de réduire ces coûts de 40 à 60%.

---

## Note RGPD sur le free tier Gemini

Sur le niveau gratuit de l'API Gemini, les données soumises peuvent être utilisées par Google pour améliorer ses modèles. Pour le MVP bêta fermé (10 utilisateurs sélectionnés, projets non sensibles), ce risque est acceptable.

Dès l'ouverture publique de la V1, le passage au niveau payant Gemini (ou à Claude Sonnet 4.6) est obligatoire pour garantir que les données des utilisateurs ne sont pas utilisées à des fins d'entraînement.

---

## Roadmap modèles V2

| Évolution | Déclencheur | Action |
|---|---|---|
| Benchmark Gemini payant vs Claude | > 500 générations/mois | A/B test sur 10% du trafic |
| Sélection dynamique de modèle | > 10 000 générations/mois | Router selon coût/qualité en temps réel |
| Fine-tuning | > 50 000 générations avec feedback | Dataset sur les meilleurs artefacts validés |
| DeepSeek V1 (si RGPD OK) | Certification conformité UE | Évaluation comme alternative économique |
