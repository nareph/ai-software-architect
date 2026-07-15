// src/lib/llm/client.ts
// Client LLM unifié avec retry automatique, fallback DeepSeek et réparation JSON

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

/**
 * Tente de réparer un JSON tronqué ou mal formé retourné par le LLM.
 * Stratégies :
 * 1. Strip des fences markdown
 * 2. Fermer les accolades/crochets manquants
 * 3. Supprimer la dernière propriété incomplète si nécessaire
 */
function repairJSON(text: string): string {
  let cleaned = stripJsonFences(text)

  // Essai direct
  try {
    JSON.parse(cleaned)
    return cleaned
  } catch {}

  // Compter les accolades et crochets ouverts non fermés
  let braces = 0
  let brackets = 0
  let inString = false
  let escape = false
  let lastCompletePropertyEnd = -1

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]

    if (escape) { escape = false; continue }
    if (char === '\\' && inString) { escape = true; continue }
    if (char === '"') { inString = !inString; continue }
    if (inString) continue

    if (char === '{') braces++
    else if (char === '}') { braces--; if (braces >= 0 && brackets === 0) lastCompletePropertyEnd = i }
    else if (char === '[') brackets++
    else if (char === ']') brackets--
  }

  // Si JSON tronqué — essayer de fermer proprement
  if (braces > 0 || brackets > 0) {
    // Supprimer la dernière propriété incomplète (potentiellement tronquée)
    let truncated = cleaned.trimEnd()

    // Supprimer la virgule ou propriété incomplète à la fin
    truncated = truncated.replace(/,\s*"[^"]*"\s*:\s*[^,}\]]*$/, '')
    truncated = truncated.replace(/,\s*$/, '')

    // Fermer les structures ouvertes
    const closing = ']'.repeat(Math.max(0, brackets)) + '}'.repeat(Math.max(0, braces))
    const repaired = truncated + closing

    try {
      JSON.parse(repaired)
      console.warn('[LLM] JSON repaired by closing open structures')
      return repaired
    } catch {}
  }

  // Dernière tentative : extraire uniquement le premier objet JSON valide
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch[0])
      console.warn('[LLM] JSON repaired by extracting first object')
      return jsonMatch[0]
    } catch {}
  }

  throw new Error(`Cannot repair JSON. Preview: ${cleaned.slice(0, 200)}`)
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

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await this.primary.call(request)
      } catch (err) {
        lastError = err as Error
        console.warn(`[LLM] Gemini attempt ${attempt + 1} failed:`, lastError.message)
        if (attempt < MAX_RETRIES - 1) await sleep(RETRY_DELAY_MS)
      }
    }

    console.warn('[LLM] Falling back to DeepSeek...')
    try {
      return await this.fallback.call(request)
    } catch (err) {
      throw new Error(
        `All LLM providers failed. Primary: ${lastError?.message}. Fallback: ${(err as Error).message}`
      )
    }
  }

  async callJSON<T>(request: LLMRequest): Promise<T> {
    // Augmenter maxTokens pour éviter la troncature
    const enhancedRequest: LLMRequest = {
      ...request,
      maxTokens: request.maxTokens ?? 16384,
      responseFormat: 'json',
    }

    const response = await this.callWithRetry(enhancedRequest)

    try {
      const repaired = repairJSON(response.content)
      return JSON.parse(repaired) as T
    } catch (repairError) {
      // Retry once with explicit instruction to return compact JSON
      console.warn('[LLM] JSON repair failed, retrying with compact instruction...')
      try {
        const retryRequest: LLMRequest = {
          ...enhancedRequest,
          messages: [
            ...enhancedRequest.messages,
            {
              role: 'assistant' as const,
              content: response.content,
            },
            {
              role: 'user' as const,
              content: 'The JSON was truncated. Please return the COMPLETE JSON in a more compact format (no extra spaces, shorter descriptions if needed). Return ONLY the complete valid JSON.',
            },
          ],
        }
        const retryResponse = await this.callWithRetry(retryRequest)
        const repaired = repairJSON(retryResponse.content)
        return JSON.parse(repaired) as T
      } catch {
        throw new Error(
          `LLM returned invalid JSON after repair attempts. Provider: ${response.provider}. Content preview: ${response.content.slice(0, 200)}`
        )
      }
    }
  }
}

let client: LLMClient | null = null
export function getLLMClient(): LLMClient {
  if (!client) client = new LLMClient()
  return client
}
