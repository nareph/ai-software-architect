# Model Selection

## Evaluation context

The LLM choice is a critical architectural decision. Generated artifacts must be:
- **Structurally valid** (JSON conforming to schema)
- **Technically correct** (coherent architectural choices)
- **Consistent** (cross-artifact alignment)
- **Generated quickly** (< 30s per step, < 2 min total)
- **Economically viable** (controlled cost per generation)

---

## Strategy by phase

| Phase | Context | Primary model | Fallback | Estimated cost |
|---|---|---|---|---|
| **MVP beta** (≤ 10 users, ≤ 5 projects) | Quality validation, zero cost required | Gemini 3.5 Flash (free tier) | DeepSeek V4 Flash | ~$0 |
| **V1 public** (paying users) | Maximum quality, profitability | Claude Sonnet 4.6 | GPT-4o via OpenRouter | ~$0.12/generation |
| **V2 scale** (> 1,000 active users) | Cost/quality optimization | Dynamic selection | Multi-provider | TBD |

---

## Models evaluated

### Gemini 3.5 Flash (Google) — MVP choice ✅

**Free tier:** Yes — input and output tokens free on the no-cost tier.

**Strengths:**
- Generous free tier for MVP beta — zero cost guaranteed
- Most recent and intelligent model in the Flash Google range (2026)
- 1M token context window
- Native structured output (JSON) support
- OpenAI-compatible API

**Limitations:**
- On free tier, data may be used to improve Google products
- More restrictive rate limits on free tier

**Pricing (June 2026):**
- Free tier: $0.00
- Paid: $1.50/MTok input, $9/MTok output

---

### DeepSeek V4 Flash — MVP Fallback

**Strengths:**
- Very low cost: $0.14/MTok (cache miss) and **$0.0028/MTok (cache hit)**
- With system prompt cached (~60% of tokens), real cost < $0.01/generation

**Limitations:**
- Less established provider
- Data processed outside EU — to monitor for GDPR compliance in V1

---

### Claude Sonnet 4.6 (Anthropic) — V1 Public choice

**Strengths:**
- Excellent structured reasoning — follows complex instructions with precision
- Very reliable strict JSON format compliance (< 2% format failure)
- Best understanding of architectural patterns
- 200K token context window

**Pricing (June 2026):**
- Input: $3/MTok — Output: $15/MTok
- Estimated cost per generation: **~$0.12**

---

## Configuration

```typescript
// MVP
export const LLM_CONFIG = {
  primary: { provider: 'google', model: 'gemini-3.5-flash', temperature: 0.3 },
  fallback: { provider: 'deepseek', model: 'deepseek-v4-flash', temperature: 0.3 }
}

// V1 Production
export const LLM_CONFIG = {
  primary: { provider: 'anthropic', model: 'claude-sonnet-4-6', temperature: 0.3 },
  fallback: { provider: 'openrouter', model: 'openai/gpt-4o', temperature: 0.3 }
}
```

**Temperature at 0.3:** Low setting favors reproducibility and strict JSON format compliance.
