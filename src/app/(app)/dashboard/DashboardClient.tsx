"use client"

import { useState } from 'react'
import { List, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from '@/components/project/ProjectCard'
import { ProjectRow } from '@/components/project/ProjectRow'

const GRID_PREVIEW = 6

interface Project {
  id: string
  name: string
  description: string
  status: string
  template: string | null
  artifactsCompleted: number
  artifactsTotal: number
  createdAt: Date
  updatedAt: Date
}

export function DashboardClient({ projects }: { projects: Project[] }) {
  const [showAll, setShowAll] = useState(false)
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const displayed = showAll ? projects : projects.slice(0, GRID_PREVIEW)
  const hasMore = projects.length > GRID_PREVIEW

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
          {showAll ? `${projects.length} projets` : `${displayed.length} projets récents`}
        </p>
        <div
          className="flex items-center gap-1 p-1 rounded-lg border"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <button
            onClick={() => setView('grid')}
            className="p-1.5 rounded-md transition-colors"
            style={{
              background: view === 'grid' ? 'var(--surface-active)' : 'transparent',
              color: view === 'grid' ? 'var(--brand)' : 'var(--foreground-tertiary)',
            }}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className="p-1.5 rounded-md transition-colors"
            style={{
              background: view === 'list' ? 'var(--surface-active)' : 'transparent',
              color: view === 'list' ? 'var(--brand)' : 'var(--foreground-tertiary)',
            }}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map(p => (
            <ProjectCard key={p.id} {...p} status={p.status as any} />
          ))}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: 'var(--border)' }}
        >
          {displayed.map((p, i) => (
            <ProjectRow
              key={p.id}
              {...p}
              status={p.status as any}
              isLast={i === displayed.length - 1}
            />
          ))}
        </div>
      )}

      {/* Show all / show less */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowAll(!showAll)
              if (showAll) setView('grid')
              else setView('list')
            }}
          >
            {showAll ? 'Réduire' : `Voir tous les ${projects.length} projets`}
          </Button>
        </div>
      )}
    </div>
  )
}
