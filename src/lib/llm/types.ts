// src/lib/llm/types.ts

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMRequest {
  messages: LLMMessage[]
  temperature?: number
  maxTokens?: number
  responseFormat?: 'json' | 'text'
}

export interface LLMResponse {
  content: string
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  durationMs: number
}

export interface LLMProvider {
  name: string
  model: string
  call(request: LLMRequest): Promise<LLMResponse>
}
