// src/lib/llm/providers/deepseek.ts
import type { LLMProvider, LLMRequest, LLMResponse } from '../types'

export class DeepSeekProvider implements LLMProvider {
  readonly name = 'deepseek'
  readonly model = 'deepseek-chat'

  async call(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) throw new Error('DEEPSEEK_API_KEY is not set')

    const start = Date.now()

    const body: Record<string, unknown> = {
      model: this.model,
      messages: request.messages,
      temperature: request.temperature ?? 0.3,
      max_tokens: request.maxTokens ?? 8192,
      ...(request.responseFormat === 'json' && {
        response_format: { type: 'json_object' },
      }),
    }

    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`DeepSeek API error ${res.status}: ${JSON.stringify(err)}`)
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content ?? ''
    const usage = data.usage ?? {}

    return {
      content: text,
      provider: this.name,
      model: this.model,
      inputTokens: usage.prompt_tokens ?? 0,
      outputTokens: usage.completion_tokens ?? 0,
      durationMs: Date.now() - start,
    }
  }
}
