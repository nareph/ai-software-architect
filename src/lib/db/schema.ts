// Drizzle schema — all tables
import {
    pgTable, uuid, varchar, text, integer,
    numeric, timestamp, jsonb, index, uniqueIndex
  } from 'drizzle-orm/pg-core';
  
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
  }, (t) => [
    index('idx_users_email').on(t.email),
  ]);
  
  export const projects = pgTable('projects', {
    id:          uuid('id').primaryKey().defaultRandom(),
    userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    name:        varchar('name', { length: 255 }).notNull(),
    description: text('description').notNull(),
    status:      varchar('status', { length: 20 }).notNull().default('draft'),
    template:    varchar('template', { length: 30 }),
    constraints: text('constraints'),
    createdAt:   timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:   timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    archivedAt:  timestamp('archived_at', { withTimezone: true }),
  }, (t) => [
    index('idx_projects_user_id').on(t.userId),
    index('idx_projects_user_status').on(t.userId, t.status),
  ]);
  
  export const artifacts = pgTable('artifacts', {
    id:             uuid('id').primaryKey().defaultRandom(),
    projectId:      uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    type:           varchar('type', { length: 30 }).notNull(),
    status:         varchar('status', { length: 20 }).notNull().default('pending'),
    content:        jsonb('content'),
    coherenceScore: numeric('coherence_score', { precision: 4, scale: 3 }),
    coherenceIssues: text('coherence_issues').array(),
    generatedAt:    timestamp('generated_at', { withTimezone: true }),
    createdAt:      timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:      timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }, (t) => [
    index('idx_artifacts_project_id').on(t.projectId),
    uniqueIndex('idx_artifacts_project_type').on(t.projectId, t.type),
  ]);
  
  export const artifactVersions = pgTable('artifact_versions', {
    id:            uuid('id').primaryKey().defaultRandom(),
    artifactId:    uuid('artifact_id').notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull(),
    content:       jsonb('content').notNull(),
    changeDesc:    text('change_desc'),
    triggerInput:  text('trigger_input'),
    createdAt:     timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  }, (t) => [
    index('idx_artifact_versions_artifact_id').on(t.artifactId),
  ]);
  
  export const generationJobs = pgTable('generation_jobs', {
    id:              uuid('id').primaryKey().defaultRandom(),
    projectId:       uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
    status:          varchar('status', { length: 20 }).notNull().default('queued'),
    startedAt:       timestamp('started_at', { withTimezone: true }),
    completedAt:     timestamp('completed_at', { withTimezone: true }),
    totalDurationMs: integer('total_duration_ms'),
    errorMessage:    text('error_message'),
    createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  }, (t) => [
    index('idx_generation_jobs_project_id').on(t.projectId),
  ]);
  
  export const generationSteps = pgTable('generation_steps', {
    id:               uuid('id').primaryKey().defaultRandom(),
    jobId:            uuid('job_id').notNull().references(() => generationJobs.id, { onDelete: 'cascade' }),
    artifactType:     varchar('artifact_type', { length: 30 }).notNull(),
    stepOrder:        integer('step_order').notNull(),
    status:           varchar('status', { length: 20 }).notNull().default('pending'),
    attemptCount:     integer('attempt_count').notNull().default(0),
    llmProvider:      varchar('llm_provider', { length: 20 }),
    llmModel:         varchar('llm_model', { length: 100 }),
    promptTokens:     integer('prompt_tokens'),
    completionTokens: integer('completion_tokens'),
    durationMs:       integer('duration_ms'),
    startedAt:        timestamp('started_at', { withTimezone: true }),
    completedAt:      timestamp('completed_at', { withTimezone: true }),
    errorMessage:     text('error_message'),
  }, (t) => [
    index('idx_generation_steps_job_id').on(t.jobId),
  ]);
  
  export const feedbacks = pgTable('feedbacks', {
    id:                 uuid('id').primaryKey().defaultRandom(),
    artifactId:         uuid('artifact_id').notNull().references(() => artifacts.id, { onDelete: 'cascade' }),
    userId:             uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type:               varchar('type', { length: 20 }).notNull(),
    content:            text('content').notNull(),
    response:           text('response'),
    triggeredVersionId: uuid('triggered_version_id').references(() => artifactVersions.id),
    createdAt:          timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  });