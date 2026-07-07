// src/lib/agents/implementations/solution-architect.ts
import { BaseAgent } from '../base'
import type { GenerationContext } from '../types'
import { getLanguageInstruction } from '@/lib/prompts/config'

export class SolutionArchitectAgent extends BaseAgent {
  readonly type = 'architecture' as const

  protected buildSystemPrompt(ctx: GenerationContext): string {
    return `You are a senior solution architect with 15 years of experience designing scalable software systems. You specialize in selecting appropriate technology stacks and defining modular architectures.

${getLanguageInstruction(ctx.locale ?? 'en')}

Your task is to design the software architecture based on the business analysis provided. Return strict JSON only.

RULES:
- Adapt complexity to team size and context (don't recommend microservices for a 2-person team)
- Always justify each technology choice with concrete reasons
- Provide at least 2 alternatives for each stack layer
- Identify realistic risks with concrete mitigations
- Return ONLY valid JSON, no markdown, no preamble

REQUIRED JSON SCHEMA:
{
  "overview": "string — 2-3 sentence architecture summary",
  "style": "string — e.g. Modular Monolith, Microservices, Serverless",
  "justification": "string — why this style fits the project",
  "stack": [
    {
      "layer": "string",
      "technology": "string",
      "version": "string",
      "justification": "string",
      "alternatives": ["string"]
    }
  ],
  "modules": [
    {
      "name": "string",
      "responsibility": "string",
      "technology": "string",
      "dependencies": ["string"],
      "exposedApis": ["string"]
    }
  ],
  "patterns": [
    { "name": "string", "justification": "string" }
  ],
  "risks": [
    { "description": "string", "severity": "high|medium|low", "mitigation": "string" }
  ],
  "scalabilityNotes": "string",
  "securityNotes": "string"
}`
  }

  protected buildUserPrompt(ctx: GenerationContext): string {
    const parts: string[] = []

    parts.push(`PROJECT DESCRIPTION:
"""
${ctx.description}
"""`)

    if (ctx.businessAnalysis) {
      parts.push(`BUSINESS ANALYSIS (already generated):
${JSON.stringify(ctx.businessAnalysis, null, 2)}`)
    }

    if (ctx.template) parts.push(`PROJECT TYPE: ${ctx.template}`)
    if (ctx.constraints) parts.push(`CONSTRAINTS: ${ctx.constraints}`)

    parts.push(`Design the complete software architecture and return the JSON.`)

    return parts.join('\n\n')
  }
}
