// src/lib/export/json.ts
// Génère un export JSON structuré des artefacts d'un projet

interface ExportArtifact {
  type: string
  content: any
  coherenceScore: number | null
}

interface ExportProject {
  id: string
  name: string
  description: string
  template: string | null
  createdAt: Date
  artifacts: ExportArtifact[]
}

export function generateJSON(project: ExportProject): string {
  const output = {
    meta: {
      exportedAt: new Date().toISOString(),
      exportedBy: 'AI Software Architect',
      version: '1.0.0',
      projectId: project.id,
    },
    project: {
      name: project.name,
      description: project.description,
      template: project.template,
      createdAt: new Date(project.createdAt).toISOString(),
    },
    artifacts: project.artifacts.reduce((acc, artifact) => {
      if (artifact.content) {
        acc[artifact.type] = {
          coherenceScore: artifact.coherenceScore,
          content: artifact.content,
        }
      }
      return acc
    }, {} as Record<string, any>),
  }

  return JSON.stringify(output, null, 2)
}