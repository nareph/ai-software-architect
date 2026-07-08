// src/lib/agents/mock/pipeline.ts
import { db } from '@/lib/db'
import { projects, artifacts, artifactVersions, generationJobs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { MOCK_ARTIFACTS, MOCK_DELAY_MS } from '@/lib/mock/artifacts'
import { validateCoherence } from '../coherence-validator'
import type {
  PipelineStrategy,
  GenerationContext,
  SSEEmitter,
  PipelineResult,
  ArtifactType,
} from '../types'
import { PIPELINE_STEPS } from '../types'

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export class MockPipeline implements PipelineStrategy {
  async run(context: GenerationContext, emit: SSEEmitter): Promise<PipelineResult> {
    const { projectId } = context
    const startTime = Date.now()
    const completedSteps: ArtifactType[] = []
    const failedSteps: ArtifactType[] = []
    const completedArtifacts: Record<string, unknown> = {}

    const [job] = await db.insert(generationJobs).values({
      projectId,
      status: 'running',
      startedAt: new Date(),
    }).returning()

    await db.update(projects)
      .set({ status: 'generating', updatedAt: new Date() })
      .where(eq(projects.id, projectId))

    emit('generation_started', { jobId: job.id, projectId, totalSteps: PIPELINE_STEPS.length })

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      const artifactType = PIPELINE_STEPS[i]
      const order = i + 1
      const delay = MOCK_DELAY_MS[artifactType]
      const stepStart = Date.now()

      emit('step_started', { artifactType, order, startedAt: new Date().toISOString() })

      await db.update(artifacts)
        .set({ status: 'generating', updatedAt: new Date() })
        .where(and(eq(artifacts.projectId, projectId), eq(artifacts.type, artifactType)))

      try {
        await sleep(delay)

        const mockContent = MOCK_ARTIFACTS[artifactType]
        completedArtifacts[artifactType] = mockContent
        const durationMs = Date.now() - stepStart

        // Real coherence validation on accumulated artifacts
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
            content: mockContent as any,
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
          content: mockContent as any,
          changeDesc: 'Initial generation (mock)',
          triggerInput: null,
        })

        completedSteps.push(artifactType)
        emit('step_completed', { artifactType, order, durationMs, coherenceScore, completedAt: new Date().toISOString() })

      } catch (error) {
        console.error(`[MockPipeline] Step ${artifactType} failed:`, error)
        failedSteps.push(artifactType)
        await db.update(artifacts)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(and(eq(artifacts.projectId, projectId), eq(artifacts.type, artifactType)))
        emit('step_failed', { artifactType, order, error: 'Step failed unexpectedly' })
      }
    }

    // Global coherence validation
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
