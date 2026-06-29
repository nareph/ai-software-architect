import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { db } from '@/lib/db'
import { projects, artifacts } from '@/lib/db/schema'
import { eq, and, ne, count, sql } from 'drizzle-orm'
import { z } from 'zod'

// ── Validation ───────────────────────────────────────────────────────────────
const CreateProjectSchema = z.object({
  description: z.string().min(1),
  template: z.string().nullable().optional(),
  constraints: z.string().nullable().optional(),
})

// ── Helpers ──────────────────────────────────────────────────────────────────
function generateProjectName(description: string): string {
  // Extrait les premiers mots significatifs de la description
  const words = description.trim().split(/\s+/).slice(0, 6).join(' ')
  return words.length > 50 ? words.slice(0, 50) + '...' : words
}

// ── GET /api/projects ────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  try {
    const rows = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        template: projects.template,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        artifactsCompleted: sql<number>`count(case when ${artifacts.status} = 'completed' then 1 end)::int`,
        artifactsTotal: sql<number>`count(${artifacts.id})::int`,
      })
      .from(projects)
      .leftJoin(artifacts, eq(artifacts.projectId, projects.id))
      .where(
        and(
          eq(projects.userId, session.user.id),
          ne(projects.status, 'archived')
        )
      )
      .groupBy(projects.id)
      .orderBy(sql`${projects.updatedAt} desc`)

    return NextResponse.json({ data: rows, meta: { total: rows.length } })
  } catch (error) {
    console.error('[GET /api/projects]', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch projects' } },
      { status: 500 }
    )
  }
}

// ── POST /api/projects ───────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    )
  }

  // Validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } },
      { status: 400 }
    )
  }

  const parsed = CreateProjectSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid request data', details: parsed.error.flatten() } },
      { status: 400 }
    )
  }

  const { description, template, constraints } = parsed.data

  // Check plan limits (free = max 10 projects)
  try {
    const [{ value: projectCount }] = await db
      .select({ value: count() })
      .from(projects)
      .where(
        and(
          eq(projects.userId, session.user.id),
          ne(projects.status, 'archived')
        )
      )

    if (Number(projectCount) >= 10) {
      return NextResponse.json(
        {
          error: {
            code: 'PLAN_LIMIT_REACHED',
            message: 'You have reached the maximum of 10 projects on the free plan.',
          },
        },
        { status: 403 }
      )
    }
  } catch (error) {
    console.error('[POST /api/projects] Count error', error)
  }

  // Create project
  try {
    const name = generateProjectName(description)

    const [project] = await db
      .insert(projects)
      .values({
        userId: session.user.id,
        name,
        description,
        template: template ?? null,
        constraints: constraints ?? null,
        status: 'draft',
      })
      .returning()

    // Pre-create artifact rows (pending)
    const artifactTypes = [
      'business_analysis',
      'architecture',
      'database_schema',
      'diagrams',
      'backlog',
    ] as const

    await db.insert(artifacts).values(
      artifactTypes.map(type => ({
        projectId: project.id,
        type,
        status: 'pending' as const,
      }))
    )

    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/projects]', error)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } },
      { status: 500 }
    )
  }
}
