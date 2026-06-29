// src/lib/agents/llm/pipeline.ts
// Implémentation LLM réelle du pipeline de génération.
// Phase B : implémenter cette classe pour remplacer le mock.
//
// Pour activer : dans .env.local / Vercel env vars :
//   USE_MOCK_GENERATION=false
//
// Dépendances à implémenter :
//   - src/lib/llm/client.ts       (LLMClient Gemini + DeepSeek fallback)
//   - src/lib/agents/base.ts      (BaseAgent)
//   - src/lib/agents/factory.ts   (AgentFactory)
//   - src/lib/prompts/v1.0.0/     (prompt templates)

import type {
  PipelineStrategy,
  GenerationContext,
  SSEEmitter,
  PipelineResult,
} from '../types'

export class LLMPipeline implements PipelineStrategy {
  async run(context: GenerationContext, emit: SSEEmitter): Promise<PipelineResult> {
    // TODO Phase B — implémenter le pipeline LLM réel
    // Référence : docs/03-ai-architecture/ai-architecture.md
    //
    // Étapes :
    // 1. Instancier LLMClient (Gemini primary, DeepSeek fallback)
    // 2. Pour chaque étape du PIPELINE_STEPS :
    //    a. Créer l'agent via AgentFactory.create(artifactType)
    //    b. Appeler agent.run(context) avec retry (max 2) + fallback
    //    c. Valider l'output via Zod schema
    //    d. Sauvegarder en DB
    //    e. Émettre les événements SSE
    // 3. Lancer CoherenceValidator sur tous les artefacts
    // 4. Finaliser le job en DB
    //
    // Structure identique à MockPipeline pour garantir la compatibilité.

    throw new Error(
      'LLMPipeline.run() not implemented yet. See docs/03-ai-architecture/ai-architecture.md'
    )
  }
}
