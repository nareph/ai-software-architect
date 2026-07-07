// src/lib/llm/client.ts
// Client LLM unifié avec retry automatique et fallback DeepSeek

import type { LLMRequest, LLMResponse, LLMProvider } from './types'
import { GeminiProvider } from './providers/gemini'
import { DeepSeekProvider } from './providers/deepseek'

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 2000

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function stripJsonFences(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

export class LLMClient {
  private primary: LLMProvider
  private fallback: LLMProvider

  constructor() {
    this.primary = new GeminiProvider()
    this.fallback = new DeepSeekProvider()
  }

  async callWithRetry(request: LLMRequest): Promise<LLMResponse> {
    let lastError: Error | null = null

    // Try primary (Gemini) with retries
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await this.primary.call(request)
        return response
      } catch (err) {
        lastError = err as Error
        console.warn(`[LLM] Gemini attempt ${attempt + 1} failed:`, lastError.message)
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS)
      }
    }

    // Fallback to DeepSeek
    console.warn('[LLM] Falling back to DeepSeek...')
    try {
      const response = await this.fallback.call(request)
      return response
    } catch (err) {
      throw new Error(
        `All LLM providers failed. Primary: ${lastError?.message}. Fallback: ${(err as Error).message}`
      )
    }
  }

  async callJSON<T>(request: LLMRequest): Promise<T> {
    const response = await this.callWithRetry({
      ...request,
      responseFormat: 'json',
    })

    const cleaned = stripJsonFences(response.content)

    try {
      return JSON.parse(cleaned) as T
    } catch {
      throw new Error(
        `LLM returned invalid JSON. Provider: ${response.provider}. Content preview: ${cleaned.slice(0, 200)}`
      )
    }
  }
}

// Singleton
let client: LLMClient | null = null
export function getLLMClient(): LLMClient {
  if (!client) client = new LLMClient()
  return client
}
