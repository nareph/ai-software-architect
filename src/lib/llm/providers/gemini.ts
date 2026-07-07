// src/lib/llm/providers/gemini.ts
import type { LLMProvider, LLMRequest, LLMResponse } from '../types'

export class GeminiProvider implements LLMProvider {
  readonly name = 'google'
  readonly model = 'gemini-2.0-flash'

  async call(request: LLMRequest): Promise<LLMResponse> {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY is not set')

    const start = Date.now()

    // Gemini uses a different message format — merge system into user
    const systemMessage = request.messages.find(m => m.role === 'system')
    const userMessages = request.messages.filter(m => m.role !== 'system')

    const contents = userMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const body: Record<string, unknown> = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.3,
        maxOutputTokens: request.maxTokens ?? 8192,
        ...(request.responseFormat === 'json' && {
          responseMimeType: 'application/json',
        }),
      },
    }

    if (systemMessage) {
      body.systemInstruction = {
        parts: [{ text: systemMessage.content }],
      }
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    )

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`Gemini API error ${res.status}: ${JSON.stringify(err)}`)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    const usage = data.usageMetadata ?? {}

    return {
      content: text,
      provider: this.name,
      model: this.model,
      inputTokens: usage.promptTokenCount ?? 0,
      outputTokens: usage.candidatesTokenCount ?? 0,
      durationMs: Date.now() - start,
    }
  }
}
