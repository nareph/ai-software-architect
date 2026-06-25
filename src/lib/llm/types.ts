export interface LLMRequest {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  provider: 'gemini' | 'deepseek';
  model: string;
  promptTokens: number;
  completionTokens: number;
  durationMs: number;
}
