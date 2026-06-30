"use client"

// src/components/artifacts/views/BacklogView.tsx
import { useState } from 'react'
import { ChevronDown, ChevronRight, Layers3 } from 'lucide-react'

interface BacklogContent {
  epics: { id: string; name: string; description: string; priority: string }[]
  stories: {
    id: string
    epicId: string
    title: string
    asA: string
    iWant: string
    soThat: string
    priority: string
    storyPoints: number
    acceptanceCriteria: string[]
  }[]
  totalStoryPoints: number
  estimatedSprintsCount: number
  mvpStories: string[]
}

const priorityColors: Record<string, { color: string; bg: string }> = {
  critical: { color: 'var(--danger)', bg: 'var(--danger-muted)' },
  high:     { color: 'var(--warning)', bg: 'var(--warning-muted)' },
  medium:   { color: 'var(--info)', bg: 'var(--info-muted)' },
  low:      { color: 'var(--foreground-tertiary)', bg: 'var(--background-tertiary)' },
}

function StoryCard({ story, isMvp }: { story: BacklogContent['stories'][0]; isMvp: boolean }) {
  const [open, setOpen] = useState(false)
  const pCfg = priorityColors[story.priority] ?? priorityColors.medium

  return (
    <div
      className="rounded-lg border overflow-hidden"
      style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--foreground-tertiary)' }} />
        ) : (
          <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--foreground-tertiary)' }} />
        )}
        <code className="text-xs shrink-0" style={{ color: 'var(--foreground-tertiary)' }}>{story.id}</code>
        <span className="text-sm font-medium flex-1 min-w-0 truncate" style={{ color: 'var(--foreground)' }}>
          {story.title}
        </span>
        {isMvp && (
          <span
            className="text-xs px-2 py-0.5 rounded-full shrink-0"
            style={{ background: 'var(--brand-muted)', color: 'var(--brand-muted-fg)' }}
          >
            MVP
          </span>
        )}
        <span
          className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
          style={{ color: pCfg.color, background: pCfg.bg }}
        >
          {story.priority}
        </span>
        <span
          className="text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold shrink-0"
          style={{ background: 'var(--background-tertiary)', color: 'var(--foreground-secondary)' }}
        >
          {story.storyPoints}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-3" style={{ borderTop: '1px solid var(--border)' }}>
          <p className="text-sm pt-3" style={{ color: 'var(--foreground-secondary)' }}>
            <span style={{ color: 'var(--foreground-tertiary)' }}>As a</span> {story.asA},{' '}
            <span style={{ color: 'var(--foreground-tertiary)' }}>I want</span> {story.iWant},{' '}
            <span style={{ color: 'var(--foreground-tertiary)' }}>so that</span> {story.soThat}.
          </p>
          <div>
            <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--foreground-tertiary)' }}>
              Acceptance criteria
            </p>
            <ul className="flex flex-col gap-1">
              {story.acceptanceCriteria.map((c, i) => (
                <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--foreground-secondary)' }}>
                  <span className="shrink-0 mt-1 w-1 h-1 rounded-full" style={{ background: 'var(--brand)' }} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export function BacklogView({ content }: { content: BacklogContent }) {
  return (
    <div className="flex flex-col gap-6">

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg p-3" style={{ background: 'var(--background-secondary)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--foreground-tertiary)' }}>Epics</p>
          <p className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>{content.epics.length}</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: 'var(--background-secondary)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--foreground-tertiary)' }}>Stories</p>
          <p className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>{content.stories.length}</p>
        </div>
        <div className="rounded-lg p-3" style={{ background: 'var(--background-secondary)' }}>
          <p className="text-xs mb-1" style={{ color: 'var(--foreground-tertiary)' }}>Story points</p>
          <p className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>{content.totalStoryPoints}</p>
        </div>
      </div>

      {/* Epics */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Layers3 className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Epics</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {content.epics.map((epic) => (
            <div
              key={epic.id}
              className="rounded-lg border p-3"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <code className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>{epic.id}</code>
                <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{epic.name}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>{epic.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stories */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>User stories</h3>
        <div className="flex flex-col gap-2">
          {content.stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              isMvp={content.mvpStories.includes(story.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
