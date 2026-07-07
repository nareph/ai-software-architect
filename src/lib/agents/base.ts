// src/lib/agents/base.ts
import { getLLMClient } from '@/lib/llm/client'
import type { GenerationContext, ArtifactType } from './types'

export interface AgentResult {
  content: unknown
  durationMs: number
  provider: string
  inputTokens: number
  outputTokens: number
}

export abstract class BaseAgent {
  abstract readonly type: ArtifactType

  protected abstract buildSystemPrompt(context: GenerationContext): string
  protected abstract buildUserPrompt(context: GenerationContext): string

  async run(context: GenerationContext): Promise<AgentResult> {
    const client = getLLMClient()
    const start = Date.now()

    const response = await client.callJSON<unknown>({
      messages: [
        { role: 'system', content: this.buildSystemPrompt(context) },
        { role: 'user', content: this.buildUserPrompt(context) },
      ],
      temperature: 0.3,
      maxTokens: 8192,
    })

    return {
      content: response,
      durationMs: Date.now() - start,
      provider: 'gemini',
      inputTokens: 0,
      outputTokens: 0,
    }
  }
}
