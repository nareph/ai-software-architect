"use client"

// src/components/feedback/FeedbackPanel.tsx
import { useState, useRef, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { X, Send, Loader2, MessageCircle, Pencil, HelpCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ArtifactType } from '@/lib/agents/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  mode: 'modify' | 'explain'
  status: 'pending' | 'streaming' | 'done' | 'error'
}

interface FeedbackPanelProps {
  projectId: string
  artifactId: string
  artifactType: ArtifactType
  isOpen: boolean
  onClose: () => void
  onArtifactUpdated: (content: unknown) => void
}

const artifactLabels: Record<ArtifactType, string> = {
  business_analysis: 'Business Analysis',
  architecture:      'Architecture',
  database_schema:   'Database Schema',
  diagrams:          'Diagrams',
  backlog:           'Backlog',
}

export function FeedbackPanel({
  projectId,
  artifactId,
  artifactType,
  isOpen,
  onClose,
  onArtifactUpdated,
}: FeedbackPanelProps) {
  const locale = useLocale()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<'modify' | 'explain'>('modify')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [input])

  // Reset messages when artifact changes
  useEffect(() => {
    setMessages([])
    setInput('')
  }, [artifactId])

  async function handleSend() {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      mode,
      status: 'done',
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      mode,
      status: 'streaming',
    }

    setMessages(prev => [...prev, userMessage, assistantMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch(`/api/feedback/${artifactId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          mode,
          locale,
        }),
      })

      if (!res.ok || !res.body) throw new Error('Failed to start feedback')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let eventName = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n')

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventName = line.slice(7).trim()
          }

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              if (eventName === 'explanation_ready') {
                setMessages(prev => prev.map(m =>
                  m.id === assistantMessage.id
                    ? { ...m, content: data.explanation, status: 'done' }
                    : m
                ))
              }

              if (eventName === 'artifact_updated') {
                onArtifactUpdated(data.content)
                setMessages(prev => prev.map(m =>
                  m.id === assistantMessage.id
                    ? {
                        ...m,
                        content: `✓ Artifact updated (version ${data.versionNumber}). The view has been refreshed.`,
                        status: 'done',
                      }
                    : m
                ))
              }

              if (eventName === 'feedback_error') {
                setMessages(prev => prev.map(m =>
                  m.id === assistantMessage.id
                    ? { ...m, content: data.error, status: 'error' }
                    : m
                ))
              }
            } catch {}

            eventName = ''
          }
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.status === 'streaming'
          ? { ...m, content: 'Connection error. Please try again.', status: 'error' }
          : m
      ))
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={onClose}
          style={{ background: 'rgba(0,0,0,0.2)' }}
        />
      )}

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl"
        style={{
          width: 420,
          background: 'var(--background)',
          borderLeft: '1px solid var(--border)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" style={{ color: 'var(--brand)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                Feedback
              </span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-tertiary)' }}>
              {artifactLabels[artifactType]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            style={{ color: 'var(--foreground-tertiary)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode selector */}
        <div
          className="flex gap-1 px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setMode('modify')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 justify-center"
            style={{
              background: mode === 'modify' ? 'var(--brand-muted)' : 'var(--surface)',
              color: mode === 'modify' ? 'var(--brand-muted-fg)' : 'var(--foreground-secondary)',
              border: `1px solid ${mode === 'modify' ? 'var(--brand)' : 'var(--border)'}`,
            }}
          >
            <Pencil className="w-3 h-3" />
            Modify
          </button>
          <button
            onClick={() => setMode('explain')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-1 justify-center"
            style={{
              background: mode === 'explain' ? 'var(--brand-muted)' : 'var(--surface)',
              color: mode === 'explain' ? 'var(--brand-muted-fg)' : 'var(--foreground-secondary)',
              border: `1px solid ${mode === 'explain' ? 'var(--brand)' : 'var(--border)'}`,
            }}
          >
            <HelpCircle className="w-3 h-3" />
            Explain
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--brand-muted)' }}
              >
                {mode === 'modify'
                  ? <Pencil className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                  : <HelpCircle className="w-5 h-5" style={{ color: 'var(--brand)' }} />
                }
              </div>
              <div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                  {mode === 'modify' ? 'Modify this artifact' : 'Ask a question'}
                </p>
                <p className="text-xs" style={{ color: 'var(--foreground-secondary)' }}>
                  {mode === 'modify'
                    ? 'Describe what you want to change and the AI will update the artifact accordingly.'
                    : 'Ask anything about this artifact — architecture decisions, trade-offs, explanations.'
                  }
                </p>
              </div>

              {/* Examples */}
              <div className="w-full space-y-2 mt-2">
                {(mode === 'modify'
                  ? [
                      'Add a notifications table to the database schema',
                      'Add Redis caching to the architecture',
                      'Add a story for the password reset flow',
                    ]
                  : [
                      'Why did you choose this architecture style?',
                      'What are the risks of this database design?',
                      'Explain the difference between these two modules',
                    ]
                ).map(example => (
                  <button
                    key={example}
                    onClick={() => setInput(example)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg border transition-colors hover:bg-[var(--surface-hover)]"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--foreground-secondary)',
                      background: 'var(--surface)',
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className="max-w-[85%] rounded-xl px-3 py-2.5 text-sm"
                style={{
                  background: msg.role === 'user'
                    ? 'var(--brand)'
                    : msg.status === 'error'
                    ? 'var(--danger-muted)'
                    : 'var(--surface)',
                  color: msg.role === 'user'
                    ? 'var(--brand-foreground)'
                    : msg.status === 'error'
                    ? 'var(--danger)'
                    : 'var(--foreground)',
                  border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                }}
              >
                {msg.status === 'streaming' ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: 'var(--brand)' }} />
                    <span className="text-xs" style={{ color: 'var(--foreground-tertiary)' }}>
                      {mode === 'modify' ? 'Updating artifact...' : 'Thinking...'}
                    </span>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed text-xs">{msg.content}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <span
                  className="text-xs px-2"
                  style={{ color: 'var(--foreground-tertiary)' }}
                >
                  {msg.mode === 'modify' ? '✏️ Modify' : '❓ Explain'}
                </span>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div
          className="px-4 py-3 border-t shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="flex items-end gap-2 rounded-xl border px-3 py-2"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === 'modify'
                  ? 'Describe your modification...'
                  : 'Ask a question about this artifact...'
              }
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm outline-none"
              style={{
                color: 'var(--foreground)',
                minHeight: 24,
                maxHeight: 120,
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-1.5 rounded-lg transition-colors shrink-0"
              style={{
                background: input.trim() && !isLoading ? 'var(--brand)' : 'var(--border)',
                color: input.trim() && !isLoading ? 'white' : 'var(--foreground-tertiary)',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              }}
            >
              {isLoading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
            </button>
          </div>
          <p className="text-xs mt-1.5 text-center" style={{ color: 'var(--foreground-tertiary)' }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  )
}
