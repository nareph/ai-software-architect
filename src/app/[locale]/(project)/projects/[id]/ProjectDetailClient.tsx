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
  artifacts: Artifact[]
}

export function ProjectDetailClient({ project }: { project: Project }) {
  const router = useRouter()
  const locale = useLocale()

  const [active, setActive] = useState<ArtifactType>('business_analysis')
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const [artifactStatuses, setArtifactStatuses] = useState<
    Record<ArtifactType, Artifact['status']>
  >(
    project.artifacts.reduce((acc, a) => {
      acc[a.type] = a.status
      return acc
    }, {} as Record<ArtifactType, Artifact['status']>)
  )

  // Live artifact content — updated by feedback without full page reload
  const [artifactContents, setArtifactContents] = useState<
    Record<ArtifactType, unknown>
  >(
    project.artifacts.reduce((acc, a) => {
      acc[a.type] = a.content
      return acc
    }, {} as Record<ArtifactType, unknown>)
  )

  const handleRetrySuccess = useCallback(async (artifactType: ArtifactType) => {
    // Mettre à jour le statut immédiatement
    setArtifactStatuses(prev => ({ ...prev, [artifactType]: 'completed' }))

    // Trouver l'artifact id correspondant
    const artifact = project.artifacts.find(a => a.type === artifactType)
    if (!artifact || artifact.id.startsWith('pending-')) return

    // Re-fetcher le contenu depuis l'API
    try {
      const res = await fetch(`/api/artifacts/${artifact.id}`)
      if (res.ok) {
        const json = await res.json()
        setArtifactContents(prev => ({
          ...prev,
          [artifactType]: json.artifact.content,
        }))
      }
    } catch (err) {
      console.error('[handleRetrySuccess] Failed to fetch updated artifact:', err)
      // Fallback: full page refresh
      router.refresh()
    }
  }, [project.artifacts, router])

  const handleArtifactUpdated = useCallback((content: unknown) => {
    setArtifactContents(prev => ({ ...prev, [active]: content }))
  }, [active])

  const globalCoherence = project.artifacts.length > 0
    ? project.artifacts.reduce((sum, a) => sum + (a.coherenceScore ?? 0), 0) / project.artifacts.length
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
          status={project.status}
          updatedAt={project.updatedAt}
          coherenceScore={globalCoherence}
        />

        <div
          className="flex-1 overflow-y-auto px-7 py-6 w-full"
          style={{ maxWidth: feedbackOpen ? '100%' : '1152px', margin: '0 auto' }}
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
                    The LLM service was unavailable or the API quota was exceeded.
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

      {/* Feedback Panel */}
      {activeArtifact && activeStatus === 'completed' && (
        <FeedbackPanel
          projectId={project.id}
          artifactId={activeArtifact.id}
          artifactType={active}
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
