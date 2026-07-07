// src/lib/agents/implementations/database-architect.ts
import { BaseAgent } from '../base'
import type { GenerationContext } from '../types'
import { getLanguageInstruction } from '@/lib/prompts/config'

export class DatabaseArchitectAgent extends BaseAgent {
  readonly type = 'database_schema' as const

  protected buildSystemPrompt(ctx: GenerationContext): string {
    return `You are a senior database architect specialized in PostgreSQL and relational database design. You design normalized, performant schemas with proper constraints and indexes.

${getLanguageInstruction(ctx.locale ?? 'en')}

Your task is to design the complete database schema based on the business analysis and architecture provided. Return strict JSON only.

RULES:
- Minimum 3NF normalization
- UUID primary keys (gen_random_uuid())
- All main tables must have created_at TIMESTAMPTZ
- Use deleted_at for soft delete on sensitive entities
- Define indexes for all foreign keys and common query patterns
- Detect implicit entities from the business analysis
- Return ONLY valid JSON, no markdown, no preamble

REQUIRED JSON SCHEMA:
{
  "engine": "string — e.g. PostgreSQL",
  "justification": "string",
  "tables": [
    {
      "name": "string",
      "description": "string",
      "columns": [
        {
          "name": "string",
          "type": "string — e.g. UUID, VARCHAR(255), TIMESTAMPTZ, INTEGER, BOOLEAN, JSONB",
          "nullable": boolean,
          "unique": boolean,
          "primaryKey": boolean,
          "foreignKey": { "table": "string", "column": "string", "onDelete": "string" } | null,
          "default": "string | null",
          "description": "string"
        }
      ],
      "indexes": [
        { "columns": ["string"], "unique": boolean, "description": "string" }
      ]
    }
  ],
  "relations": [
    { "from": "table.column", "to": "table.column", "type": "one_to_one|one_to_many|many_to_one|many_to_many", "description": "string" }
  ],
  "enums": [
    { "name": "string", "values": ["string"] }
  ],
  "notes": ["string"]
}`
  }

  protected buildUserPrompt(ctx: GenerationContext): string {
    const parts: string[] = []

    parts.push(`PROJECT DESCRIPTION:
"""
${ctx.description}
"""`)

    if (ctx.businessAnalysis) {
      parts.push(`BUSINESS ANALYSIS:
${JSON.stringify(ctx.businessAnalysis, null, 2)}`)
    }

    if (ctx.architecture) {
      parts.push(`ARCHITECTURE:
${JSON.stringify(ctx.architecture, null, 2)}`)
    }

    parts.push(`Design the complete PostgreSQL database schema and return the JSON.`)

    return parts.join('\n\n')
  }
}
