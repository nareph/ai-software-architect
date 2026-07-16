"use client"

// src/app/[locale]/(project)/projects/[id]/ProjectDetailClient.tsx
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { AlertCircle } from 'lucide-react'
import { ArtifactSidebar } from '@/components/artifacts/ArtifactSidebar'
import { ProjectHeader } from '@/components/project/ProjectHeader'
import { FeedbackPanel } from '@/components/feedback/FeedbackPanel'
import { BusinessAnalysisView } from '@/components/artifacts/views/BusinessAnalysisView'
import { ArchitectureView } from '@/components/artifacts/views/ArchitectureView'
import { DatabaseSchemaView } from '@/components/artifacts/views/DatabaseSchemaView'
import { DiagramsView } from '@/components/artifacts/views/DiagramsView'
import { BacklogView } from '@/components/artifacts/views/BacklogView'
import type { ArtifactType } from '@/lib/agents/types'
import { PIPELINE_STEPS } from '@/lib/agents/types'

interface Artifact {
  id: string
  type: ArtifactType
  status: 'pending' | 'generating' | 'completed' | 'failed'
  content: unknown
  coherenceScore: number | null
}

interface Project {
  id: string
  name: string
  status: 'draft' | 'generating' | 'completed' | 'partial' | 'archived'
  updatedAt: Date
  locale: string
  artifacts: Artifact[]
}

export function ProjectDetailClient({ project }: { project: Project }) {
  const router = useRouter()

  const [active, setActive] = useState<ArtifactType>('business_analysis')
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [projectStatus, setProjectStatus] = useState(project.status)

  const [artifactStatuses, setArtifactStatuses] = useState<
    Record<ArtifactType, Artifact['status']>
  >(
    project.artifacts.reduce((acc, a) => {
      acc[a.type] = a.status
      return acc
    }, {} as Record<ArtifactType, Artifact['status']>)
  )

  const [artifactContents, setArtifactContents] = useState<
    Record<ArtifactType, unknown>
  >(
    project.artifacts.reduce((acc, a) => {
      acc[a.type] = a.content
      return acc
    }, {} as Record<ArtifactType, unknown>)
  )

  // Track coherence scores per artifact
  const [coherenceScores, setCoherenceScores] = useState<
    Record<ArtifactType, number | null>
  >(
    project.artifacts.reduce((acc, a) => {
      acc[a.type] = a.coherenceScore
      return acc
    }, {} as Record<ArtifactType, number | null>)
  )

  // Retry success — re-fetch content + update coherence
  const handleRetrySuccess = useCallback(async (artifactType: ArtifactType) => {
    setArtifactStatuses(prev => {
      const updated = { ...prev, [artifactType]: 'completed' as const }

      const allDone = PIPELINE_STEPS.every(step => updated[step] === 'completed')
      if (allDone) {
        setProjectStatus('completed')
      }

      return updated
    })

    const artifact = project.artifacts.find(a => a.type === artifactType)
    if (!artifact || artifact.id.startsWith('pending-')) return

    try {
      const res = await fetch(`/api/artifacts/${artifact.id}`)
      if (res.ok) {
        const json = await res.json()
        setArtifactContents(prev => ({
          ...prev,
          [artifactType]: json.artifact.content,
        }))
        if (json.artifact.coherenceScore !== null) {
          setCoherenceScores(prev => ({
            ...prev,
            [artifactType]: parseFloat(json.artifact.coherenceScore),
          }))
        }
      }
    } catch {
      router.refresh()
    }
  }, [project.artifacts, router])

  const handleArtifactUpdated = useCallback((content: unknown) => {
    setArtifactContents(prev => ({ ...prev, [active]: content }))
  }, [active])

  // Compute global coherence from current scores
  const scores = Object.values(coherenceScores).filter((s): s is number => s !== null)
  const globalCoherence = scores.length > 0
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : null

  const activeArtifact = project.artifacts.find(a => a.type === active)
  const activeContent = artifactContents[active]
  const activeStatus = artifactStatuses[active]

  return (
    <div className="flex flex-1 min-h-screen overflow-hidden">
      <ArtifactSidebar
        projectId={project.id}
        activeArtifact={active}
        onSelect={(type) => {
          setActive(type)
          setFeedbackOpen(false)
        }}
        artifactStatuses={artifactStatuses}
        onRetrySuccess={handleRetrySuccess}
        onFeedbackOpen={() => setFeedbackOpen(true)}
        isFeedbackOpen={feedbackOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ProjectHeader
          name={project.name}
          status={projectStatus}
          updatedAt={project.updatedAt}
          coherenceScore={globalCoherence}
        />

        <div
          className="flex-1 overflow-y-auto px-7 py-6 w-full"
          style={{ maxWidth: '1152px', margin: '0 auto' }}
        >
          {activeStatus !== 'completed' || !activeContent ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-8">
              {activeStatus === 'failed' ? (
                <>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: 'var(--danger-muted)' }}
                  >
                    <AlertCircle className="w-6 h-6" style={{ color: 'var(--danger)' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                    Generation failed
                  </p>
                  <p className="text-xs max-w-xs" style={{ color: 'var(--foreground-secondary)' }}>
                    Click the <strong>↺</strong> button next to the artifact name to retry.
                  </p>
                </>
              ) : activeStatus === 'generating' ? (
                <p className="text-sm" style={{ color: 'var(--brand)' }}>Generating...</p>
              ) : (
                <p className="text-sm" style={{ color: 'var(--foreground-tertiary)' }}>Not yet generated.</p>
              )}
            </div>
          ) : (
            <ArtifactRenderer type={active} content={activeContent} />
          )}
        </div>
      </div>

      {/* Feedback Panel — passes project locale */}
      {activeArtifact && activeStatus === 'completed' && (
        <FeedbackPanel
          projectId={project.id}
          artifactId={activeArtifact.id}
          artifactType={active}
          projectLocale={project.locale as 'fr' | 'en'}
          isOpen={feedbackOpen}
          onClose={() => setFeedbackOpen(false)}
          onArtifactUpdated={handleArtifactUpdated}
        />
      )}
    </div>
  )
}

function ArtifactRenderer({ type, content }: { type: ArtifactType; content: any }) {
  switch (type) {
    case 'business_analysis': return <BusinessAnalysisView content={content} />
    case 'architecture':      return <ArchitectureView content={content} />
    case 'database_schema':   return <DatabaseSchemaView content={content} />
    case 'diagrams':          return <DiagramsView content={content} />
    case 'backlog':           return <BacklogView content={content} />
    default:                  return null
  }
}
