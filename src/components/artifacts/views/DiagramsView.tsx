"use client"

// src/components/artifacts/views/DiagramsView.tsx
import { MermaidRenderer } from '@/components/artifacts/MermaidRenderer'

interface DiagramsContent {
  c4_container: string
  sequence: string
  erd: string
  deployment: string | null
}

export function DiagramsView({ content }: { content: DiagramsContent }) {
  return (
    <div className="flex flex-col gap-6">
      <MermaidRenderer chart={content.c4_container} title="C4 Container diagram" />
      <MermaidRenderer chart={content.sequence} title="Sequence diagram" />
      <MermaidRenderer chart={content.erd} title="Entity Relationship Diagram" />
      {content.deployment && (
        <MermaidRenderer chart={content.deployment} title="Deployment diagram" />
      )}
    </div>
  )
}
