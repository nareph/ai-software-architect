// src/lib/agents/coherence-validator.ts
// Validation de cohérence entre les artefacts générés
// Vérifie l'alignement sémantique entre business_analysis, architecture,
// database_schema, diagrams et backlog

export interface CoherenceIssue {
  rule: string
  severity: 'error' | 'warning' | 'info'
  message: string
  details?: string
}

export interface CoherenceResult {
  score: number          // 0 to 1
  passed: boolean        // score >= 0.80
  issues: CoherenceIssue[]
  breakdown: {
    entities_db_coverage: number
    features_stories_coverage: number
    actors_backlog_coverage: number
    modules_diagram_sync: number
    db_stories_consistency: number
  }
}

// ── Rule implementations ──────────────────────────────────────────────────────

/**
 * Rule 1 — entities_db_coverage
 * Vérifie que les entités métier principales ont une table DB correspondante
 */
function checkEntitiesDbCoverage(
  businessAnalysis: any,
  databaseSchema: any
): { score: number; issues: CoherenceIssue[] } {
  const issues: CoherenceIssue[] = []

  if (!businessAnalysis?.actors || !databaseSchema?.tables) {
    return { score: 0.5, issues: [{ rule: 'entities_db_coverage', severity: 'warning', message: 'Cannot validate: missing actors or tables' }] }
  }

  const tableNames = (databaseSchema.tables as any[]).map((t: any) =>
    t.name.toLowerCase().replace(/[_-]/g, '')
  )

  const actors = (businessAnalysis.actors as any[]).filter(
    (a: any) => !a.role?.toLowerCase().includes('external') &&
                !a.name?.toLowerCase().includes('stripe') &&
                !a.name?.toLowerCase().includes('twilio') &&
                !a.name?.toLowerCase().includes('sendgrid') &&
                !a.name?.toLowerCase().includes('resend')
  )

  let covered = 0
  for (const actor of actors) {
    const actorName = actor.name.toLowerCase().replace(/[_\s-]/g, '')
    const hasTable = tableNames.some(t =>
      t.includes(actorName) ||
      actorName.includes(t) ||
      // Common mappings
      (actorName === 'member' && tableNames.some(n => n.includes('user'))) ||
      (actorName === 'user' && tableNames.some(n => n.includes('member'))) ||
      (actorName === 'admin' && tableNames.some(n => n.includes('user')))
    )

    if (hasTable) {
      covered++
    } else {
      issues.push({
        rule: 'entities_db_coverage',
        severity: 'warning',
        message: `Actor "${actor.name}" has no corresponding DB table`,
        details: `Consider adding a table for this actor or verifying the mapping`,
      })
    }
  }

  const score = actors.length > 0 ? covered / actors.length : 1
  return { score, issues }
}

/**
 * Rule 2 — features_stories_coverage
 * Vérifie que les features critiques ont des user stories correspondantes
 */
function checkFeaturesStoriesCoverage(
  businessAnalysis: any,
  backlog: any
): { score: number; issues: CoherenceIssue[] } {
  const issues: CoherenceIssue[] = []

  if (!businessAnalysis?.features || !backlog?.stories) {
    return { score: 0.5, issues: [{ rule: 'features_stories_coverage', severity: 'warning', message: 'Cannot validate: missing features or stories' }] }
  }

  const criticalFeatures = (businessAnalysis.features as any[]).filter(
    (f: any) => f.priority === 'critical' || f.priority === 'high'
  )

  const storyTitles = (backlog.stories as any[]).map((s: any) =>
    `${s.title} ${s.iWant} ${s.soThat}`.toLowerCase()
  )

  let covered = 0
  for (const feature of criticalFeatures) {
    const featureName = feature.name.toLowerCase()
    const featureWords = featureName.split(/\s+/).filter((w: string) => w.length > 3)

    const hasStory = storyTitles.some(storyText =>
      featureWords.some((word: string) => storyText.includes(word))
    )

    if (hasStory) {
      covered++
    } else {
      issues.push({
        rule: 'features_stories_coverage',
        severity: feature.priority === 'critical' ? 'error' : 'warning',
        message: `Critical feature "${feature.name}" has no corresponding user story`,
        details: `Priority: ${feature.priority}`,
      })
    }
  }

  const score = criticalFeatures.length > 0 ? covered / criticalFeatures.length : 1
  return { score, issues }
}

/**
 * Rule 3 — actors_backlog_coverage
 * Vérifie que chaque acteur principal est mentionné dans au moins une user story
 */
function checkActorsBacklogCoverage(
  businessAnalysis: any,
  backlog: any
): { score: number; issues: CoherenceIssue[] } {
  const issues: CoherenceIssue[] = []

  if (!businessAnalysis?.actors || !backlog?.stories) {
    return { score: 0.5, issues: [] }
  }

  const humanActors = (businessAnalysis.actors as any[]).filter(
    (a: any) => !a.role?.toLowerCase().includes('external') &&
                !a.role?.toLowerCase().includes('system')
  )

  const storyActors = (backlog.stories as any[]).map((s: any) =>
    s.asA?.toLowerCase() ?? ''
  )

  let covered = 0
  for (const actor of humanActors) {
    const actorName = actor.name.toLowerCase()
    const hasStory = storyActors.some(sa =>
      sa.includes(actorName) || actorName.includes(sa)
    )

    if (hasStory) {
      covered++
    } else {
      issues.push({
        rule: 'actors_backlog_coverage',
        severity: 'warning',
        message: `Actor "${actor.name}" has no user story ("As a ${actor.name}...")`,
      })
    }
  }

  const score = humanActors.length > 0 ? covered / humanActors.length : 1
  return { score, issues }
}

/**
 * Rule 4 — modules_diagram_sync
 * Vérifie que les modules de l'architecture sont représentés dans les diagrammes
 */
function checkModulesDiagramSync(
  architecture: any,
  diagrams: any
): { score: number; issues: CoherenceIssue[] } {
  const issues: CoherenceIssue[] = []

  if (!architecture?.modules || !diagrams?.c4_container) {
    return { score: 0.5, issues: [] }
  }

  const diagramText = diagrams.c4_container.toLowerCase()
  const modules = architecture.modules as any[]

  let covered = 0
  for (const module of modules) {
    const moduleName = module.name.toLowerCase().replace(/\s+module$/i, '')
    const moduleWords = moduleName.split(/[\s_-]+/).filter((w: string) => w.length > 2)

    const inDiagram = moduleWords.some((word: string) => diagramText.includes(word))

    if (inDiagram) {
      covered++
    } else {
      issues.push({
        rule: 'modules_diagram_sync',
        severity: 'info',
        message: `Module "${module.name}" may not be represented in the container diagram`,
        details: 'Consider verifying the C4 diagram includes all architecture modules',
      })
    }
  }

  const score = modules.length > 0 ? covered / modules.length : 1
  return { score, issues }
}

/**
 * Rule 5 — db_stories_consistency
 * Vérifie que les stories CRUD font référence à des tables qui existent
 */
function checkDbStoriesConsistency(
  databaseSchema: any,
  backlog: any
): { score: number; issues: CoherenceIssue[] } {
  const issues: CoherenceIssue[] = []

  if (!databaseSchema?.tables || !backlog?.stories) {
    return { score: 0.5, issues: [] }
  }

  const tableNames = (databaseSchema.tables as any[]).map((t: any) =>
    t.name.toLowerCase()
  )

  // Find stories that mention specific data entities
  const crudKeywords = ['create', 'add', 'delete', 'remove', 'update', 'edit', 'list', 'view', 'manage']
  const crudStories = (backlog.stories as any[]).filter((s: any) => {
    const text = `${s.title} ${s.iWant}`.toLowerCase()
    return crudKeywords.some(kw => text.includes(kw))
  })

  let consistent = 0
  for (const story of crudStories) {
    const storyText = `${story.title} ${story.iWant} ${story.technicalNotes ?? ''}`.toLowerCase()

    // Check if at least one table name appears in the story context
    const referencesTable = tableNames.some(table => {
      const singular = table.endsWith('s') ? table.slice(0, -1) : table
      return storyText.includes(table) || storyText.includes(singular)
    })

    if (referencesTable || story.technicalNotes) {
      consistent++
    } else {
      // Soft check — not an error, just info
      issues.push({
        rule: 'db_stories_consistency',
        severity: 'info',
        message: `Story "${story.id}: ${story.title}" could reference DB tables in technical notes`,
        details: 'Adding table references in technicalNotes improves traceability',
      })
    }
  }

  // This rule is more lenient — info only, score mostly high
  const baseScore = crudStories.length > 0 ? consistent / crudStories.length : 1
  const score = 0.5 + (baseScore * 0.5) // floor at 0.5 for this rule
  return { score, issues }
}

// ── Main validator ────────────────────────────────────────────────────────────

export function validateCoherence(artifacts: {
  business_analysis?: unknown
  architecture?: unknown
  database_schema?: unknown
  diagrams?: unknown
  backlog?: unknown
}): CoherenceResult {

  const ba = artifacts.business_analysis as any
  const arch = artifacts.architecture as any
  const db = artifacts.database_schema as any
  const diag = artifacts.diagrams as any
  const bl = artifacts.backlog as any

  // Run all rules
  const r1 = checkEntitiesDbCoverage(ba, db)
  const r2 = checkFeaturesStoriesCoverage(ba, bl)
  const r3 = checkActorsBacklogCoverage(ba, bl)
  const r4 = checkModulesDiagramSync(arch, diag)
  const r5 = checkDbStoriesConsistency(db, bl)

  // Weighted score
  const weights = {
    entities_db_coverage:      0.25,
    features_stories_coverage: 0.30,
    actors_backlog_coverage:   0.20,
    modules_diagram_sync:      0.15,
    db_stories_consistency:    0.10,
  }

  const weightedScore =
    r1.score * weights.entities_db_coverage +
    r2.score * weights.features_stories_coverage +
    r3.score * weights.actors_backlog_coverage +
    r4.score * weights.modules_diagram_sync +
    r5.score * weights.db_stories_consistency

  const score = parseFloat(weightedScore.toFixed(3))
  const allIssues = [...r1.issues, ...r2.issues, ...r3.issues, ...r4.issues, ...r5.issues]

  return {
    score,
    passed: score >= 0.80,
    issues: allIssues,
    breakdown: {
      entities_db_coverage:      parseFloat(r1.score.toFixed(3)),
      features_stories_coverage: parseFloat(r2.score.toFixed(3)),
      actors_backlog_coverage:   parseFloat(r3.score.toFixed(3)),
      modules_diagram_sync:      parseFloat(r4.score.toFixed(3)),
      db_stories_consistency:    parseFloat(r5.score.toFixed(3)),
    },
  }
}
