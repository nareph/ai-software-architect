// src/lib/agents/implementations/diagram-generator.ts
import { BaseAgent } from '../base'
import type { GenerationContext } from '../types'
import { getLanguageInstruction } from '@/lib/prompts/config'

export class DiagramGeneratorAgent extends BaseAgent {
  readonly type = 'diagrams' as const

  protected buildSystemPrompt(ctx: GenerationContext): string {
    return `You are a systems modeling expert specialized in Mermaid diagram syntax. You create clear, readable diagrams that accurately represent software architectures.

${getLanguageInstruction(ctx.locale ?? 'en')}

Your task is to generate Mermaid diagrams based on the architecture and database schema provided. Return strict JSON only.

CRITICAL MERMAID SYNTAX RULES:
- Use "flowchart LR" for container/architecture diagrams (NOT C4Container — it renders poorly)
- Use "sequenceDiagram" for sequence diagrams
- Use "erDiagram" for entity relationship diagrams
- Maximum 12 elements per diagram for readability
- Node labels must NOT contain: parentheses (), brackets [], special characters except spaces and hyphens
- For flowchart: use subgraph for grouping, --> for arrows, -- label --> for labeled arrows
- For erDiagram: use || and |{ for cardinality, keep column types simple
- Test mentally that your Mermaid syntax is valid before outputting

EXAMPLE valid flowchart:
flowchart LR
  subgraph Users
    M([Member])
    A([Admin])
  end
  subgraph App["Application"]
    WEB["Web App"]
    API["API"]
    DB[("Database")]
  end
  M --> WEB
  A --> WEB
  WEB --> API
  API --> DB

Return ONLY valid JSON, no markdown, no preamble.

REQUIRED JSON SCHEMA:
{
  "c4_container": "string — flowchart LR diagram of the system architecture",
  "sequence": "string — sequenceDiagram for the main user flow",
  "erd": "string — erDiagram for the database schema",
  "deployment": null
}`
  }

  protected buildUserPrompt(ctx: GenerationContext): string {
    const parts: string[] = []

    parts.push(`PROJECT DESCRIPTION:
"""
${ctx.description}
"""`)

    if (ctx.architecture) {
      parts.push(`ARCHITECTURE:
${JSON.stringify(ctx.architecture, null, 2)}`)
    }

    if (ctx.databaseSchema) {
        const schema = ctx.databaseSchema as any
      parts.push(`DATABASE SCHEMA (tables and relations):
${JSON.stringify({
  tables: schema.tables?.map((t: any) => ({
    name: t.name,
    columns: t.columns?.map((c: any) => ({ name: c.name, type: c.type, primaryKey: c.primaryKey, foreignKey: c.foreignKey }))
  })),
  relations: schema.relations,
}, null, 2)}`)
    }

    parts.push(`Generate the 3 Mermaid diagrams and return the JSON. Ensure all Mermaid syntax is valid and renderable.`)

    return parts.join('\n\n')
  }
}
