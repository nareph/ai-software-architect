"use client"

// src/components/artifacts/views/DatabaseSchemaView.tsx
import { Table2, Link2, Key } from 'lucide-react'

interface DatabaseSchemaContent {
  engine: string
  justification: string
  tables: {
    name: string
    description: string
    columns: { name: string; type: string; nullable: boolean; primaryKey: boolean; foreignKey: { table: string } | null }[]
  }[]
  relations: { from: string; to: string; type: string; description: string }[]
}

export function DatabaseSchemaView({ content }: { content: DatabaseSchemaContent }) {
  return (
    <div className="flex flex-col gap-6">

      {/* Engine */}
      <div
        className="flex items-center justify-between rounded-lg p-4"
        style={{ background: 'var(--background-secondary)' }}
      >
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--foreground-tertiary)' }}>Database engine</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{content.engine}</p>
        </div>
        <span
          className="text-xs px-3 py-1 rounded-full"
          style={{ background: 'var(--brand-muted)', color: 'var(--brand-muted-fg)' }}
        >
          {content.tables.length} tables
        </span>
      </div>

      {/* Tables */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Table2 className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Tables</h3>
        </div>

        <div className="flex flex-col gap-3">
          {content.tables.map((table) => (
            <div
              key={table.name}
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <div
                className="px-4 py-2.5 border-b"
                style={{ borderColor: 'var(--border)', background: 'var(--background-secondary)' }}
              >
                <code className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
                  {table.name}
                </code>
                <p className="text-xs mt-0.5" style={{ color: 'var(--foreground-secondary)' }}>
                  {table.description}
                </p>
              </div>

              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {table.columns.map((col) => (
                  <div
                    key={col.name}
                    className="flex items-center gap-2 px-4 py-2"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {col.primaryKey && <Key className="w-3 h-3 shrink-0" style={{ color: 'var(--warning)' }} />}
                    {col.foreignKey && <Link2 className="w-3 h-3 shrink-0" style={{ color: 'var(--info)' }} />}
                    <code className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                      {col.name}
                    </code>
                    <span className="flex-1" />
                    <code
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: 'var(--background-tertiary)', color: 'var(--foreground-tertiary)' }}
                    >
                      {col.type}
                    </code>
                    {!col.nullable && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
                      >
                        NOT NULL
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Relations */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4" style={{ color: 'var(--brand)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Relations</h3>
        </div>
        <div className="flex flex-col gap-2">
          {content.relations.map((rel, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border p-3 text-sm"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
            >
              <code style={{ color: 'var(--brand)' }}>{rel.from}</code>
              <span style={{ color: 'var(--foreground-tertiary)' }}>→</span>
              <code style={{ color: 'var(--brand)' }}>{rel.to}</code>
              <span
                className="text-xs px-2 py-0.5 rounded-full ml-auto shrink-0"
                style={{ background: 'var(--background-tertiary)', color: 'var(--foreground-tertiary)' }}
              >
                {rel.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
