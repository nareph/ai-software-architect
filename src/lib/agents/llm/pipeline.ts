// src/lib/agents/llm/pipeline.ts
import { db } from '@/lib/db'
import { projects, artifacts, artifactVersions, generationJobs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { AgentFactory } from '../factory'
import { validateCoherence } from '../coherence-validator'
import type {
  PipelineStrategy,
  GenerationContext,
  SSEEmitter,
  PipelineResult,
  ArtifactType,
} from '../types'
import { PIPELINE_STEPS } from '../types'

const MAX_STEP_RETRIES = 2

export class LLMPipeline implements PipelineStrategy {
  async run(context: GenerationContext, emit: SSEEmitter): Promise<PipelineResult> {
    const { projectId } = context
    const startTime = Date.now()
    const completedSteps: ArtifactType[] = []
    const failedSteps: ArtifactType[] = []

    const cumulativeContext: GenerationContext = { ...context }
    const completedArtifacts: Record<string, unknown> = {}

    const [job] = await db.insert(generationJobs).values({
      projectId,
      status: 'running',
      startedAt: new Date(),
    }).returning()

    await db.update(projects)
      .set({ status: 'generating', updatedAt: new Date() })
      .where(eq(projects.id, projectId))

    emit('generation_started', {
      jobId: job.id,
      projectId,
      totalSteps: PIPELINE_STEPS.length,
    })

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      const artifactType = PIPELINE_STEPS[i]
      const order = i + 1

      emit('step_started', { artifactType, order, startedAt: new Date().toISOString() })

      await db.update(artifacts)
        .set({ status: 'generating', updatedAt: new Date() })
        .where(and(eq(artifacts.projectId, projectId), eq(artifacts.type, artifactType)))

      let success = false
      let lastError: Error | null = null
      let resultContent: unknown = null
      let durationMs = 0

      for (let attempt = 0; attempt < MAX_STEP_RETRIES; attempt++) {
        try {
          const agent = AgentFactory.create(artifactType)
          const result = await agent.run(cumulativeContext)
          resultContent = result.content
          durationMs = result.durationMs
          success = true
          break
        } catch (err) {
          lastError = err as Error
          console.error(`[LLMPipeline] Step ${artifactType} attempt ${attempt + 1} failed:`, lastError.message)
          if (attempt < MAX_STEP_RETRIES - 1) await new Promise(r => setTimeout(r, 2000))
        }
      }

      if (!success || !resultContent) {
        failedSteps.push(artifactType)
        await db.update(artifacts)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(and(eq(artifacts.projectId, projectId), eq(artifacts.type, artifactType)))
        emit('step_failed', { artifactType, order, error: lastError?.message ?? 'Step failed' })
        continue
      }

      // ── Real per-step coherence (partial — only what's available so far) ──
      completedArtifacts[artifactType] = resultContent
      const partialCoherence = validateCoherence({
        business_analysis: completedArtifacts.business_analysis,
        architecture: completedArtifacts.architecture,
        database_schema: completedArtifacts.database_schema,
        diagrams: completedArtifacts.diagrams,
        backlog: completedArtifacts.backlog,
      })
      const coherenceScore = partialCoherence.score

      const [updatedArtifact] = await db.update(artifacts)
        .set({
          status: 'completed',
          content: resultContent as any,
          coherenceScore: String(coherenceScore),
          coherenceIssues: partialCoherence.issues as any,
          generatedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(artifacts.projectId, projectId), eq(artifacts.type, artifactType)))
        .returning()

      await db.insert(artifactVersions).values({
        artifactId: updatedArtifact.id,
        versionNumber: 1,
        content: resultContent as any,
        changeDesc: 'Initial generation (LLM)',
        triggerInput: null,
      })

      // Update cumulative context
      if (artifactType === 'business_analysis') cumulativeContext.businessAnalysis = resultContent
      else if (artifactType === 'architecture') cumulativeContext.architecture = resultContent
      else if (artifactType === 'database_schema') cumulativeContext.databaseSchema = resultContent

      completedSteps.push(artifactType)
      emit('step_completed', { artifactType, order, durationMs, coherenceScore, completedAt: new Date().toISOString() })
    }

    // ── Global coherence validation (all artifacts) ───────────────────────
    const globalCoherence = validateCoherence({
      business_analysis: completedArtifacts.business_analysis,
      architecture: completedArtifacts.architecture,
      database_schema: completedArtifacts.database_schema,
      diagrams: completedArtifacts.diagrams,
      backlog: completedArtifacts.backlog,
    })

    emit('coherence_checked', {
      score: globalCoherence.score,
      passed: globalCoherence.passed,
      issues: globalCoherence.issues,
      breakdown: globalCoherence.breakdown,
    })

    const totalDurationMs = Date.now() - startTime
    const finalStatus = failedSteps.length > 0 ? 'partial' : 'completed'

    await Promise.all([
      db.update(projects)
        .set({ status: finalStatus, updatedAt: new Date() })
        .where(eq(projects.id, projectId)),
      db.update(generationJobs)
        .set({ status: finalStatus, completedAt: new Date(), totalDurationMs })
        .where(eq(generationJobs.id, job.id)),
    ])

    emit('generation_completed', { jobId: job.id, projectId, status: finalStatus, totalDurationMs })

    return {
      success: failedSteps.length === 0,
      completedSteps,
      failedSteps,
      totalDurationMs,
      globalCoherenceScore: globalCoherence.score,
    }
  }
}
