// src/lib/agents/orchestrator.ts
// Point d'entrée UNIQUE pour la génération d'artefacts.
// Les routes API n'appellent QUE cette fonction — jamais le mock ou le LLM directement.
//
// Pour basculer mock → LLM réel :
//   Dans .env.local / Vercel env vars :
//   USE_MOCK_GENERATION=false   → appels LLM réels
//   USE_MOCK_GENERATION=true    → pipeline mock (défaut)

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

  // Phase B : décommente quand le LLM est prêt
  // const { LLMPipeline } = await import('./llm/pipeline')
  // return new LLMPipeline().run(context, emit)

  throw new Error(
    'LLM pipeline not implemented yet. Set USE_MOCK_GENERATION=true or implement src/lib/agents/llm/pipeline.ts'
  )
}
