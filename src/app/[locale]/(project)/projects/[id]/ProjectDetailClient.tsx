"use client"

// src/app/[locale]/(app)/projects/[id]/ProjectDetailClient.tsx
import { useState } from 'react'
import { ArtifactSidebar } from '@/components/artifacts/ArtifactSidebar'
import { ProjectHeader } from '@/components/project/ProjectHeader'
import { BusinessAnalysisView } from '@/components/artifacts/views/BusinessAnalysisView'
import { ArchitectureView } from '@/components/artifacts/views/ArchitectureView'
import { DatabaseSchemaView } from '@/components/artifacts/views/DatabaseSchemaView'
import { DiagramsView } from '@/components/artifacts/views/DiagramsView'
import { BacklogView } from '@/components/artifacts/views/BacklogView'
import type { ArtifactType } from '@/lib/agents/types'

interface Artifact {
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
  const [active, setActive] = useState<ArtifactType>('business_analysis')

  const artifactStatuses = project.artifacts.reduce((acc, a) => {
    acc[a.type] = a.status
    return acc
  }, {} as Record<ArtifactType, Artifact['status']>)

  const activeArtifact = project.artifacts.find(a => a.type === active)

  const globalCoherence = project.artifacts.length > 0
    ? project.artifacts.reduce((sum, a) => sum + (a.coherenceScore ?? 0), 0) / project.artifacts.length
    : null

  return (
    <div className="flex flex-1 min-h-screen">
      <ArtifactSidebar
        activeArtifact={active}
        onSelect={setActive}
        artifactStatuses={artifactStatuses}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <ProjectHeader
          name={project.name}
          status={project.status}
          updatedAt={project.updatedAt}
          coherenceScore={globalCoherence}
        />

        <div className="flex-1 overflow-y-auto px-7 py-6 max-w-4xl w-full">
          {!activeArtifact || activeArtifact.status !== 'completed' ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-sm" style={{ color: 'var(--foreground-tertiary)' }}>
                {activeArtifact?.status === 'generating' ? 'Generating...' : 'Not yet generated.'}
              </p>
            </div>
          ) : (
            <ArtifactRenderer type={active} content={activeArtifact.content} />
          )}
        </div>
      </div>
    </div>
  )
}

function ArtifactRenderer({ type, content }: { type: ArtifactType; content: any }) {
  switch (type) {
    case 'business_analysis': return <BusinessAnalysisView content={content} />
    case 'architecture': return <ArchitectureView content={content} />
    case 'database_schema': return <DatabaseSchemaView content={content} />
    case 'diagrams': return <DiagramsView content={content} />
    case 'backlog': return <BacklogView content={content} />
    default: return null
  }
}
