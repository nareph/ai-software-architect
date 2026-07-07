// src/lib/agents/implementations/project-manager.ts
import { BaseAgent } from '../base'
import type { GenerationContext } from '../types'
import { getLanguageInstruction } from '@/lib/prompts/config'

export class ProjectManagerAgent extends BaseAgent {
  readonly type = 'backlog' as const

  protected buildSystemPrompt(ctx: GenerationContext): string {
    return `You are a senior technical product manager with 12 years of experience creating development backlogs for software projects. You write clear, actionable user stories with realistic story point estimates.

${getLanguageInstruction(ctx.locale ?? 'en')}

Your task is to create a complete development backlog based on the business analysis and architecture provided. Return strict JSON only.

RULES:
- Group stories into epics (4-6 epics maximum)
- Use Fibonacci for story points: 1, 2, 3, 5, 8, 13 ONLY
- Each story must have minimum 3 acceptance criteria
- Mark MVP-critical stories in mvpStories array (the minimum to launch)
- Stories must cover all critical and high-priority features from business analysis
- Return ONLY valid JSON, no markdown, no preamble

REQUIRED JSON SCHEMA:
{
  "epics": [
    { "id": "EP-01", "name": "string", "description": "string", "priority": "critical|high|medium|low" }
  ],
  "stories": [
    {
      "id": "US-001",
      "epicId": "EP-01",
      "title": "string",
      "asA": "string — actor name",
      "iWant": "string — action/goal",
      "soThat": "string — business value",
      "priority": "critical|high|medium|low",
      "storyPoints": 1|2|3|5|8|13,
      "acceptanceCriteria": ["string", "string", "string"],
      "technicalNotes": "string",
      "dependencies": ["US-xxx"]
    }
  ],
  "totalStoryPoints": number,
  "estimatedSprintsCount": number,
  "mvpStories": ["US-001", "US-002"]
}`
  }

  protected buildUserPrompt(ctx: GenerationContext): string {
    const parts: string[] = []

    parts.push(`PROJECT DESCRIPTION:
"""
${ctx.description}
"""`)

    if (ctx.businessAnalysis) {
        const ba = ctx.businessAnalysis as any
      parts.push(`BUSINESS ANALYSIS:
${JSON.stringify({
  actors: ba.actors,
  features: ba.features,
  businessRules: ba.businessRules,
}, null, 2)}`)
    }

    if (ctx.architecture) {
        const arch = ctx.architecture as any
      parts.push(`ARCHITECTURE SUMMARY:
- Style: ${arch.style}
- Modules: ${arch.modules?.map((m: any) => m.name).join(', ')}`)
    }

    if (ctx.template) parts.push(`PROJECT TYPE: ${ctx.template}`)

    parts.push(`Create the complete development backlog and return the JSON.`)

    return parts.join('\n\n')
  }
}
