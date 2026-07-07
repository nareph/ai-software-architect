// src/lib/agents/types.ts
// Interfaces communes — stables entre mock et LLM réel

export type ArtifactType =
  | 'business_analysis'
  | 'architecture'
  | 'database_schema'
  | 'diagrams'
  | 'backlog'

export const PIPELINE_STEPS: ArtifactType[] = [
  'business_analysis',
  'architecture',
  'database_schema',
  'diagrams',
  'backlog',
]

export interface GenerationContext {
  projectId: string
  description: string
  template: string | null
  constraints: string | null
  locale: 'fr' | 'en'
  // Cumulative context — populated as pipeline progresses
  businessAnalysis?: unknown
  architecture?: unknown
  databaseSchema?: unknown
}

export type SSEEmitter = (event: string, data: unknown) => void

export interface StepResult {
  artifactType: ArtifactType
  content: unknown
  coherenceScore: number
  durationMs: number
}

export interface PipelineResult {
  success: boolean
  completedSteps: ArtifactType[]
  failedSteps: ArtifactType[]
  totalDurationMs: number
  globalCoherenceScore: number
}

export interface PipelineStrategy {
  run(context: GenerationContext, emit: SSEEmitter): Promise<PipelineResult>
}
