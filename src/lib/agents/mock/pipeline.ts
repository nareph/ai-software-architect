// src/lib/agents/mock/pipeline.ts
// Implémentation mock du pipeline de génération.
// Simule les délais réalistes et retourne des artefacts pré-définis.
// NE PAS modifier cette classe pour intégrer le LLM — créer llm/pipeline.ts à la place.

import { db } from '@/lib/db'
import { projects, artifacts, artifactVersions, generationJobs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { MOCK_ARTIFACTS, MOCK_DELAY_MS } from '@/lib/mock/artifacts'
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

    // Créer le job en DB
    const [job] = await db.insert(generationJobs).values({
      projectId,
      status: 'running',
      startedAt: new Date(),
    }).returning()

    // Mettre à jour le statut du projet
    await db.update(projects)
      .set({ status: 'generating', updatedAt: new Date() })
      .where(eq(projects.id, projectId))

    emit('generation_started', {
      jobId: job.id,
      projectId,
      totalSteps: PIPELINE_STEPS.length,
    })

    // ── Pipeline séquentiel ────────────────────────────────────────────────
    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      const artifactType = PIPELINE_STEPS[i]
      const order = i + 1
      const delay = MOCK_DELAY_MS[artifactType]
      const stepStart = Date.now()

      emit('step_started', {
        artifactType,
        order,
        startedAt: new Date().toISOString(),
      })

      // Marquer l'artefact comme en cours
      await db.update(artifacts)
        .set({ status: 'generating', updatedAt: new Date() })
        .where(and(
          eq(artifacts.projectId, projectId),
          eq(artifacts.type, artifactType)
        ))

      try {
        // Simuler le délai LLM
        await sleep(delay)

        const mockContent = MOCK_ARTIFACTS[artifactType]
        const coherenceScore = parseFloat((0.92 + Math.random() * 0.07).toFixed(3))
        const durationMs = Date.now() - stepStart

        // Sauvegarder l'artefact
        const [updatedArtifact] = await db.update(artifacts)
          .set({
            status: 'completed',
            content: mockContent as any,
            coherenceScore: String(coherenceScore),
            coherenceIssues: [],
            generatedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(and(
            eq(artifacts.projectId, projectId),
            eq(artifacts.type, artifactType)
          ))
          .returning()

        // Créer la version initiale
        await db.insert(artifactVersions).values({
          artifactId: updatedArtifact.id,
          versionNumber: 1,
          content: mockContent as any,
          changeDesc: 'Génération initiale (mock)',
          triggerInput: null,
        })

        completedSteps.push(artifactType)

        emit('step_completed', {
          artifactType,
          order,
          durationMs,
          coherenceScore,
          completedAt: new Date().toISOString(),
        })

      } catch (error) {
        console.error(`[MockPipeline] Step ${artifactType} failed:`, error)
        failedSteps.push(artifactType)

        await db.update(artifacts)
          .set({ status: 'failed', updatedAt: new Date() })
          .where(and(
            eq(artifacts.projectId, projectId),
            eq(artifacts.type, artifactType)
          ))

        emit('step_failed', {
          artifactType,
          order,
          error: 'Step failed unexpectedly',
        })
      }
    }

    // ── Validation de cohérence globale ───────────────────────────────────
    const globalCoherenceScore = parseFloat((0.93 + Math.random() * 0.06).toFixed(3))

    emit('coherence_checked', {
      score: globalCoherenceScore,
      passed: globalCoherenceScore >= 0.85,
      issues: [],
    })

    // ── Finalisation ──────────────────────────────────────────────────────
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

    emit('generation_completed', {
      jobId: job.id,
      projectId,
      status: finalStatus,
      totalDurationMs,
    })

    return {
      success: failedSteps.length === 0,
      completedSteps,
      failedSteps,
      totalDurationMs,
      globalCoherenceScore,
    }
  }
}
