// src/lib/export/pdf.ts
// Génère un fichier PDF à partir des artefacts d'un projet
// Utilise @react-pdf/renderer côté serveur

import React from 'react'
import {
  Document, Page, Text, View, StyleSheet, Font, renderToBuffer
} from '@react-pdf/renderer'

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    backgroundColor: '#ffffff',
    color: '#0F172A',
  },

  // Cover
  coverPage: {
    fontFamily: 'Helvetica',
    paddingTop: 120,
    paddingHorizontal: 48,
    paddingBottom: 48,
    backgroundColor: '#0F172A',
  },
  coverAccent: {
    width: 48,
    height: 4,
    backgroundColor: '#6366F1',
    marginBottom: 24,
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: '#F1F5F9',
    marginBottom: 12,
    lineHeight: 1.3,
  },
  coverSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 8,
  },
  coverMeta: {
    fontSize: 10,
    color: '#475569',
    marginTop: 4,
  },
  coverFooter: {
    position: 'absolute',
    bottom: 48,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverFooterText: {
    fontSize: 9,
    color: '#334155',
  },

  // Page header
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  pageHeaderTitle: {
    fontSize: 9,
    color: '#94A3B8',
  },
  pageHeaderProject: {
    fontSize: 9,
    color: '#6366F1',
    fontFamily: 'Helvetica-Bold',
  },

  // Section heading
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 4,
    marginTop: 8,
  },
  sectionAccent: {
    width: 32,
    height: 2,
    backgroundColor: '#6366F1',
    marginBottom: 16,
  },

  // Subsection
  subTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1E293B',
    marginTop: 14,
    marginBottom: 6,
  },

  // Body text
  body: {
    fontSize: 10,
    color: '#334155',
    lineHeight: 1.6,
    marginBottom: 8,
  },
  bodyMuted: {
    fontSize: 9,
    color: '#64748B',
    lineHeight: 1.5,
    marginBottom: 6,
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  },

  // Card
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#6366F1',
  },
  cardTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 3,
  },
  cardBody: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },

  // Table
  table: {
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableCell: {
    fontSize: 9,
    color: '#334155',
  },
  tableCellBold: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  tableCode: {
    fontSize: 8,
    color: '#6366F1',
    fontFamily: 'Helvetica',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },

  // Code block (for Mermaid — displayed as text)
  codeBlock: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 7.5,
    color: '#A5B4FC',
    lineHeight: 1.5,
    fontFamily: 'Helvetica',
  },

  // List
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  listBullet: {
    width: 12,
    fontSize: 9,
    color: '#6366F1',
    marginTop: 1,
  },
  listText: {
    flex: 1,
    fontSize: 9,
    color: '#334155',
    lineHeight: 1.5,
  },

  // Story card
  storyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  storyId: {
    fontSize: 8,
    color: '#94A3B8',
    fontFamily: 'Helvetica-Bold',
  },
  storyTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    flex: 1,
  },
  storyPoints: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyPointsText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6366F1',
  },
  storyStatement: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
    marginBottom: 6,
    fontStyle: 'italic',
  },

  // Spacer
  spacer: { marginBottom: 12 },
  spacerLg: { marginBottom: 24 },
})

// ── Priority colors ──────────────────────────────────────────────────────────
const priorityBg: Record<string, string> = {
  critical: '#FEF2F2',
  high:     '#FFFBEB',
  medium:   '#EFF6FF',
  low:      '#F8FAFC',
}
const priorityColor: Record<string, string> = {
  critical: '#EF4444',
  high:     '#F59E0B',
  medium:   '#3B82F6',
  low:      '#94A3B8',
}

// ── Section components ───────────────────────────────────────────────────────

function PageHeader({ projectName, section }: { projectName: string; section: string }) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.pageHeaderProject}>{projectName}</Text>
      <Text style={styles.pageHeaderTitle}>{section}</Text>
    </View>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <View>
      <Text style={styles.sectionTitle}>{children}</Text>
      <View style={styles.sectionAccent} />
    </View>
  )
}

function ListItem({ children }: { children: string }) {
  return (
    <View style={styles.listItem}>
      <Text style={styles.listBullet}>•</Text>
      <Text style={styles.listText}>{children}</Text>
    </View>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const bg = priorityBg[priority] ?? '#F8FAFC'
  const color = priorityColor[priority] ?? '#94A3B8'
  return (
    <View style={{ ...styles.badge, backgroundColor: bg }}>
      <Text style={{ ...styles.badgeText, color }}>{priority.toUpperCase()}</Text>
    </View>
  )
}

// ── Artifact pages ───────────────────────────────────────────────────────────

function BusinessAnalysisPage({ content, projectName }: { content: any; projectName: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader projectName={projectName} section="Business Analysis" />
      <SectionTitle>Business Analysis</SectionTitle>

      <View style={styles.card}>
        <Text style={styles.cardBody}>{content.summary}</Text>
      </View>
      <View style={styles.spacer} />

      {/* Actors */}
      <Text style={styles.subTitle}>Actors</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Name</Text>
          <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Role</Text>
          <Text style={{ ...styles.tableHeaderCell, flex: 5 }}>Description</Text>
        </View>
        {(content.actors ?? []).map((actor: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={{ ...styles.tableCellBold, flex: 2 }}>{actor.name}</Text>
            <Text style={{ ...styles.tableCell, flex: 2 }}>{actor.role}</Text>
            <Text style={{ ...styles.tableCell, flex: 5 }}>{actor.description}</Text>
          </View>
        ))}
      </View>

      {/* Features */}
      <Text style={styles.subTitle}>Features</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={{ ...styles.tableHeaderCell, flex: 3 }}>Feature</Text>
          <Text style={{ ...styles.tableHeaderCell, flex: 1.5 }}>Priority</Text>
          <Text style={{ ...styles.tableHeaderCell, flex: 5 }}>Description</Text>
        </View>
        {(content.features ?? []).map((f: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={{ ...styles.tableCellBold, flex: 3 }}>{f.name}</Text>
            <View style={{ flex: 1.5, flexDirection: 'row' }}>
              <PriorityBadge priority={f.priority} />
            </View>
            <Text style={{ ...styles.tableCell, flex: 5 }}>{f.description}</Text>
          </View>
        ))}
      </View>

      {/* Business Rules */}
      {(content.businessRules ?? []).length > 0 && (
        <View>
          <Text style={styles.subTitle}>Business Rules</Text>
          {content.businessRules.map((rule: string, i: number) => (
            <ListItem key={i}>{rule}</ListItem>
          ))}
        </View>
      )}

      {/* Constraints + Assumptions */}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 12 }}>
        {(content.constraints ?? []).length > 0 && (
          <View style={{ flex: 1 }}>
            <Text style={styles.subTitle}>Constraints</Text>
            {content.constraints.map((c: string, i: number) => (
              <ListItem key={i}>{c}</ListItem>
            ))}
          </View>
        )}
        {(content.assumptions ?? []).length > 0 && (
          <View style={{ flex: 1 }}>
            <Text style={styles.subTitle}>Assumptions</Text>
            {content.assumptions.map((a: string, i: number) => (
              <ListItem key={i}>{a}</ListItem>
            ))}
          </View>
        )}
      </View>
    </Page>
  )
}

function ArchitecturePage({ content, projectName }: { content: any; projectName: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader projectName={projectName} section="Architecture" />
      <SectionTitle>Architecture</SectionTitle>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 }}>
        <View style={{ ...styles.badge, backgroundColor: '#EEF2FF' }}>
          <Text style={{ ...styles.badgeText, color: '#6366F1' }}>{content.style}</Text>
        </View>
      </View>
      <Text style={styles.body}>{content.overview}</Text>
      <Text style={styles.bodyMuted}>{content.justification}</Text>
      <View style={styles.spacer} />

      {/* Stack */}
      <Text style={styles.subTitle}>Technology Stack</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Layer</Text>
          <Text style={{ ...styles.tableHeaderCell, flex: 3 }}>Technology</Text>
          <Text style={{ ...styles.tableHeaderCell, flex: 5 }}>Justification</Text>
        </View>
        {(content.stack ?? []).map((s: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={{ ...styles.tableCell, flex: 2 }}>{s.layer}</Text>
            <Text style={{ ...styles.tableCellBold, flex: 3 }}>{s.technology}</Text>
            <Text style={{ ...styles.tableCell, flex: 5 }}>{s.justification}</Text>
          </View>
        ))}
      </View>

      {/* Modules */}
      <Text style={styles.subTitle}>Modules</Text>
      {(content.modules ?? []).map((m: any, i: number) => (
        <View key={i} style={styles.card}>
          <Text style={styles.cardTitle}>{m.name}</Text>
          <Text style={styles.cardBody}>{m.responsibility}</Text>
          <Text style={{ ...styles.cardBody, color: '#6366F1', marginTop: 2 }}>
            {m.technology}
          </Text>
        </View>
      ))}

      {/* Risks */}
      {(content.risks ?? []).length > 0 && (
        <View>
          <Text style={styles.subTitle}>Risks</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderCell, flex: 1.5 }}>Severity</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 4 }}>Risk</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 4 }}>Mitigation</Text>
            </View>
            {content.risks.map((r: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <View style={{ flex: 1.5, flexDirection: 'row' }}>
                  <PriorityBadge priority={r.severity} />
                </View>
                <Text style={{ ...styles.tableCell, flex: 4 }}>{r.description}</Text>
                <Text style={{ ...styles.tableCell, flex: 4 }}>{r.mitigation}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Page>
  )
}

function DatabaseSchemaPage({ content, projectName }: { content: any; projectName: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader projectName={projectName} section="Database Schema" />
      <SectionTitle>Database Schema</SectionTitle>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
        <View style={{ ...styles.badge, backgroundColor: '#EEF2FF' }}>
          <Text style={{ ...styles.badgeText, color: '#6366F1' }}>{content.engine}</Text>
        </View>
        <Text style={styles.bodyMuted}>{content.justification}</Text>
      </View>

      {(content.tables ?? []).map((table: any, i: number) => (
        <View key={i} style={{ marginBottom: 14 }}>
          <Text style={styles.subTitle}>{table.name}</Text>
          <Text style={{ ...styles.bodyMuted, marginBottom: 6 }}>{table.description}</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderCell, flex: 3 }}>Column</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 2.5 }}>Type</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 1 }}>Null</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 3 }}>Notes</Text>
            </View>
            {(table.columns ?? []).map((col: any, j: number) => (
              <View key={j} style={styles.tableRow}>
                <View style={{ flex: 3, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {col.primaryKey && <Text style={{ fontSize: 8, color: '#F59E0B' }}>🔑</Text>}
                  {col.foreignKey && <Text style={{ fontSize: 8, color: '#3B82F6' }}>→</Text>}
                  <Text style={styles.tableCellBold}>{col.name}</Text>
                </View>
                <Text style={{ ...styles.tableCode, flex: 2.5 }}>{col.type}</Text>
                <Text style={{ ...styles.tableCell, flex: 1 }}>{col.nullable ? 'YES' : 'NO'}</Text>
                <Text style={{ ...styles.tableCell, flex: 3 }}>
                  {col.foreignKey ? `→ ${col.foreignKey.table}` : col.default ?? ''}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}

      {/* Relations */}
      {(content.relations ?? []).length > 0 && (
        <View>
          <Text style={styles.subTitle}>Relations</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={{ ...styles.tableHeaderCell, flex: 3 }}>From</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 3 }}>To</Text>
              <Text style={{ ...styles.tableHeaderCell, flex: 2 }}>Type</Text>
            </View>
            {content.relations.map((r: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={{ ...styles.tableCode, flex: 3 }}>{r.from}</Text>
                <Text style={{ ...styles.tableCode, flex: 3 }}>{r.to}</Text>
                <Text style={{ ...styles.tableCell, flex: 2 }}>{r.type}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </Page>
  )
}

function DiagramsPage({ content, projectName }: { content: any; projectName: string }) {
  const diagrams = [
    { key: 'c4_container', label: 'Container Diagram' },
    { key: 'sequence', label: 'Sequence Diagram' },
    { key: 'erd', label: 'Entity Relationship Diagram' },
    { key: 'deployment', label: 'Deployment Diagram' },
  ]

  return (
    <Page size="A4" style={styles.page}>
      <PageHeader projectName={projectName} section="Diagrams" />
      <SectionTitle>Diagrams</SectionTitle>
      <Text style={{ ...styles.bodyMuted, marginBottom: 16 }}>
        Mermaid diagram source code — render at mermaid.live or in any Markdown viewer.
      </Text>

      {diagrams.map(({ key, label }) => {
        const code = content[key]
        if (!code) return null
        return (
          <View key={key} style={{ marginBottom: 16 }}>
            <Text style={styles.subTitle}>{label}</Text>
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{code}</Text>
            </View>
          </View>
        )
      })}
    </Page>
  )
}

function BacklogPage({ content, projectName }: { content: any; projectName: string }) {
  return (
    <Page size="A4" style={styles.page}>
      <PageHeader projectName={projectName} section="Development Backlog" />
      <SectionTitle>Development Backlog</SectionTitle>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Epics', value: (content.epics ?? []).length },
          { label: 'Stories', value: (content.stories ?? []).length },
          { label: 'Story Points', value: content.totalStoryPoints },
          { label: 'Sprints', value: content.estimatedSprintsCount },
        ].map(({ label, value }) => (
          <View key={label} style={{ flex: 1, backgroundColor: '#F8FAFC', borderRadius: 6, padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#6366F1' }}>{value}</Text>
            <Text style={{ fontSize: 8, color: '#94A3B8', marginTop: 2 }}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Epics */}
      <Text style={styles.subTitle}>Epics</Text>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={{ ...styles.tableHeaderCell, flex: 1 }}>ID</Text>
          <Text style={{ ...styles.tableHeaderCell, flex: 3 }}>Epic</Text>
          <Text style={{ ...styles.tableHeaderCell, flex: 1.5 }}>Priority</Text>
          <Text style={{ ...styles.tableHeaderCell, flex: 5 }}>Description</Text>
        </View>
        {(content.epics ?? []).map((epic: any, i: number) => (
          <View key={i} style={styles.tableRow}>
            <Text style={{ ...styles.tableCode, flex: 1 }}>{epic.id}</Text>
            <Text style={{ ...styles.tableCellBold, flex: 3 }}>{epic.name}</Text>
            <View style={{ flex: 1.5, flexDirection: 'row' }}>
              <PriorityBadge priority={epic.priority} />
            </View>
            <Text style={{ ...styles.tableCell, flex: 5 }}>{epic.description}</Text>
          </View>
        ))}
      </View>

      {/* Stories */}
      <Text style={styles.subTitle}>User Stories</Text>
      {(content.stories ?? []).map((story: any, i: number) => {
        const isMvp = (content.mvpStories ?? []).includes(story.id)
        return (
          <View key={i} style={styles.storyCard}>
            <View style={styles.storyHeader}>
              <Text style={styles.storyId}>{story.id}</Text>
              <Text style={styles.storyTitle}>{story.title}</Text>
              {isMvp && (
                <View style={{ ...styles.badge, backgroundColor: '#EEF2FF' }}>
                  <Text style={{ ...styles.badgeText, color: '#6366F1' }}>MVP</Text>
                </View>
              )}
              <PriorityBadge priority={story.priority} />
              <View style={styles.storyPoints}>
                <Text style={styles.storyPointsText}>{story.storyPoints}</Text>
              </View>
            </View>
            <Text style={styles.storyStatement}>
              As a {story.asA}, I want {story.iWant}, so that {story.soThat}.
            </Text>
            {(story.acceptanceCriteria ?? []).map((ac: string, j: number) => (
              <ListItem key={j}>{ac}</ListItem>
            ))}
          </View>
        )
      })}
    </Page>
  )
}

// ── Main PDF Document ────────────────────────────────────────────────────────

function PDFDocument({ project }: { project: any }) {
  const date = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  const getArtifact = (type: string) =>
    project.artifacts.find((a: any) => a.type === type)?.content ?? null

  return React.createElement(Document, {
    title: project.name,
    author: 'AI Software Architect',
    subject: 'Software Architecture Report',
    creator: 'AI Software Architect — ai-software-architect-zeta.vercel.app',
  },
    // Cover page
    React.createElement(Page, { size: 'A4', style: styles.coverPage },
      React.createElement(View, { style: styles.coverAccent }),
      React.createElement(Text, { style: styles.coverTitle }, project.name),
      React.createElement(Text, { style: styles.coverSubtitle }, 'Software Architecture Report'),
      React.createElement(Text, { style: styles.coverMeta }, `Generated on ${date}`),
      project.template && React.createElement(Text, { style: styles.coverMeta }, `Template: ${project.template}`),
      React.createElement(View, { style: styles.coverFooter },
        React.createElement(Text, { style: styles.coverFooterText }, 'AI Software Architect'),
        React.createElement(Text, { style: styles.coverFooterText }, 'ai-software-architect-zeta.vercel.app'),
      )
    ),

    // Artifact pages
    ...[
      { type: 'business_analysis', Component: BusinessAnalysisPage },
      { type: 'architecture', Component: ArchitecturePage },
      { type: 'database_schema', Component: DatabaseSchemaPage },
      { type: 'diagrams', Component: DiagramsPage },
      { type: 'backlog', Component: BacklogPage },
    ].map(({ type, Component }) => {
      const content = getArtifact(type)
      if (!content) return null
      return React.createElement(Component, {
        key: type,
        content,
        projectName: project.name,
      })
    }).filter(Boolean)
  )
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generatePDF(project: {
  id: string
  name: string
  description: string
  template: string | null
  createdAt: Date
  artifacts: { type: string; content: any; coherenceScore: number | null }[]
}): Promise<Buffer> {
  const doc = React.createElement(PDFDocument, { project })
  return renderToBuffer(doc as any)
}