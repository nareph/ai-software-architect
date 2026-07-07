// src/lib/agents/implementations/requirements-analyst.ts
import { BaseAgent } from '../base'
import type { GenerationContext } from '../types'
import { getLanguageInstruction } from '@/lib/prompts/config'

export class RequirementsAnalystAgent extends BaseAgent {
  readonly type = 'business_analysis' as const

  protected buildSystemPrompt(ctx: GenerationContext): string {
    return `You are a senior business analyst with 15 years of experience in software project analysis. Your specialty is transforming business descriptions into structured, actionable analysis documents.

${getLanguageInstruction(ctx.locale ?? 'en')}

Your task is to analyze the project description and produce a complete business analysis in strict JSON format.

RULES:
- Extract ALL actors mentioned or implied (users, admins, external systems)
- Identify features with their priority: critical | high | medium | low
- Be exhaustive — better too many items than too few
- Never invent technologies or implementation details
- Return ONLY valid JSON, no markdown, no preamble

REQUIRED JSON SCHEMA:
{
  "summary": "string — 2-3 sentence project overview",
  "actors": [
    { "name": "string", "role": "string", "description": "string" }
  ],
  "features": [
    { "name": "string", "description": "string", "priority": "critical|high|medium|low", "actor": "string" }
  ],
  "businessRules": ["string"],
  "constraints": ["string"],
  "assumptions": ["string"],
  "outOfScope": ["string"]
}`
  }

  protected buildUserPrompt(ctx: GenerationContext): string {
    const parts: string[] = []

    parts.push(`PROJECT DESCRIPTION:
"""
${ctx.description}
"""`)

    if (ctx.template) {
      parts.push(`PROJECT TYPE: ${ctx.template}`)
    }

    if (ctx.constraints) {
      parts.push(`ADDITIONAL CONSTRAINTS:
"""
${ctx.constraints}
"""`)
    }

    parts.push(`Analyze this project and return the complete business analysis JSON.`)

    return parts.join('\n\n')
  }
}
