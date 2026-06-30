# Prompt Strategy

## Philosophy

Prompts are treated as **production code**: versioned, tested, documented, and evolvable.

Three principles guide the prompting strategy:

1. **Specific and contextualized role.** Each agent is assigned a precise role with a credible specialty and fictitious experience. A generic role ("you are the best expert") has no useful effect — the model has been trained on millions of texts written by experts in precise domains. Specifying the role orients it toward the corresponding corpus in its training space. "Senior software architect specialized in distributed systems" activates a targeted set of knowledge; "best at everything" activates nothing specific.

2. **Mandatory JSON formatted output.** The output schema is always included in the system prompt. No free text — format is a constraint, not a suggestion.

3. **Minimal but sufficient context.** Injecting all available context is not always optimal. Each agent receives only what it needs.

---

## Universal prompt structure

```
┌─────────────────────────────────────────┐
│  SYSTEM PROMPT                          │
│  - Agent role and expertise             │
│  - Precise mission                      │
│  - Behavior rules                       │
│  - Expected JSON output schema          │
│  - Examples (few-shot if needed)        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  USER PROMPT                            │
│  - Project description (always)         │
│  - Cumulative context (previous         │
│    artifacts, condensed if large)       │
│  - Additional constraints               │
│  - Final generation instruction         │
└─────────────────────────────────────────┘
```

---

## Guardrails

### Guardrail 1 — Mandatory JSON format
Any non-JSON output triggers a retry with a reinforced prompt.

### Guardrail 2 — Incomplete schema
If JSON is valid but doesn't match the expected schema, the Zod error is injected into the retry.

### Guardrail 3 — Anti-hallucination
Agents are instructed to only use documented and stable technologies.

### Guardrail 4 — Prompt injection
User input is always encapsulated between explicit delimiters:
```
Project description:
"""
{{user_input_sanitized}}
"""
```

---

## Prompt versioning

Prompts are stored in `src/lib/prompts/` and versioned as code:

```
src/lib/prompts/
├── v1.0.0/
│   ├── requirements-analyst.ts
│   ├── solution-architect.ts
│   └── ...
└── config.ts   ← PROMPT_VERSIONS constant
```

Each prompt change is a new version — no overwriting. This allows comparing performance between versions in the evaluation framework.
