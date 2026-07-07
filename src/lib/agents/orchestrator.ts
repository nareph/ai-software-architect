// src/lib/agents/orchestrator.ts
// Point d'entrée UNIQUE pour la génération d'artefacts.
// Les routes API n'appellent QUE cette fonction.
//
// Basculer mock → LLM réel :
//   USE_MOCK_GENERATION=false  → appels LLM réels (Gemini + DeepSeek fallback)
//   USE_MOCK_GENERATION=true   → pipeline mock (défaut)

import type { GenerationContext, SSEEmitter, PipelineResult } from './types'

export async function runGenerationPipeline(
  context: GenerationContext,
  emit: SSEEmitter
): Promise<PipelineResult> {
  const useMock = process.env.USE_MOCK_GENERATION !== 'false'

  if (useMock) {
    const { MockPipeline } = await import('./mock/pipeline')
    return new MockPipeline().run(context, emit)
  }

  const { LLMPipeline } = await import('./llm/pipeline')
  return new LLMPipeline().run(context, emit)
}
