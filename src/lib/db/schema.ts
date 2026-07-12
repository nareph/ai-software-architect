// src/lib/db/schema.ts
// Ajout du champ locale sur la table projects
// Migration requise : pnpm db:generate && pnpm db:push

import { pgTable, uuid, varchar, text, jsonb, integer, timestamp, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Users ─────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        varchar('email', { length: 255 }).notNull().unique(),
  name:         varchar('name', { length: 255 }),
  passwordHash: varchar('password_hash', { length: 255 }),
  plan:         varchar('plan', { length: 20 }).notNull().default('free'),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt:  timestamp('last_login_at', { withTimezone: true }),
  deletedAt:    timestamp('deleted_at', { withTimezone: true }),
})

// ── Projects ──────────────────────────────────────────────────────────────────
export const projects = pgTable('projects', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name:        varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  template:    varchar('template', { length: 50 }),
  constraints: text('constraints'),
  status:      varchar('status', { length: 20 }).notNull().default('draft'),
  locale:      varchar('locale', { length: 5 }).notNull().default('en'), // ← NEW
  createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Artifacts ─────────────────────────────────────────────────────────────────
export const artifacts = pgTable('artifacts', {
  id:               uuid('id').primaryKey().defaultRandom(),
  projectId:        uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  type:             varchar('type', { length: 50 }).notNull(),
  status:           varchar('status', { length: 20 }).notNull().default('pending'),
  content:          jsonb('content'),
  coherenceScore:   varchar('coherence_score', { length: 10 }),
  coherenceIssues:  jsonb('coherence_issues'),
  generatedAt:      timestamp('generated_at', { withTimezone: true }),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Artifact Versions ─────────────────────────────────────────────────────────
export const artifactVersions = pgTable('artifact_versions', {
  id:            uuid('id').primaryKey().defaultRandom(),
  artifactId:    uuid('artifact_id').notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  content:       jsonb('content').notNull(),
  changeDesc:    varchar('change_desc', { length: 255 }),
  triggerInput:  text('trigger_input'),
  createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Generation Jobs ───────────────────────────────────────────────────────────
export const generationJobs = pgTable('generation_jobs', {
  id:             uuid('id').primaryKey().defaultRandom(),
  projectId:      uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  status:         varchar('status', { length: 20 }).notNull().default('queued'),
  startedAt:      timestamp('started_at', { withTimezone: true }),
  completedAt:    timestamp('completed_at', { withTimezone: true }),
  totalDurationMs: integer('total_duration_ms'),
  createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Generation Steps ──────────────────────────────────────────────────────────
export const generationSteps = pgTable('generation_steps', {
  id:           uuid('id').primaryKey().defaultRandom(),
  jobId:        uuid('job_id').notNull().references(() => generationJobs.id, { onDelete: 'cascade' }),
  artifactType: varchar('artifact_type', { length: 50 }).notNull(),
  status:       varchar('status', { length: 20 }).notNull().default('pending'),
  durationMs:   integer('duration_ms'),
  errorMessage: text('error_message'),
  createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Feedbacks ─────────────────────────────────────────────────────────────────
export const feedbacks = pgTable('feedbacks', {
  id:         uuid('id').primaryKey().defaultRandom(),
  artifactId: uuid('artifact_id').notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
  userId:     uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type:       varchar('type', { length: 20 }).notNull().default('modification'),
  content:    text('content').notNull(),
  response:   text('response'),
  createdAt:  timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

// ── Relations ─────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  projects:  many(projects),
  feedbacks: many(feedbacks),
}))

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user:           one(users, { fields: [projects.userId], references: [users.id] }),
  artifacts:      many(artifacts),
  generationJobs: many(generationJobs),
}))

export const artifactsRelations = relations(artifacts, ({ one, many }) => ({
  project:  one(projects, { fields: [artifacts.projectId], references: [projects.id] }),
  versions: many(artifactVersions),
  feedbacks: many(feedbacks),
}))

export const artifactVersionsRelations = relations(artifactVersions, ({ one }) => ({
  artifact: one(artifacts, { fields: [artifactVersions.artifactId], references: [artifacts.id] }),
}))

export const generationJobsRelations = relations(generationJobs, ({ one, many }) => ({
  project: one(projects, { fields: [generationJobs.projectId], references: [projects.id] }),
  steps:   many(generationSteps),
}))

export const generationStepsRelations = relations(generationSteps, ({ one }) => ({
  job: one(generationJobs, { fields: [generationSteps.jobId], references: [generationJobs.id] }),
}))

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  artifact: one(artifacts, { fields: [feedbacks.artifactId], references: [artifacts.id] }),
  user:     one(users, { fields: [feedbacks.userId], references: [users.id] }),
}))
