ALTER TABLE "feedbacks" DROP CONSTRAINT "feedbacks_triggered_version_id_artifact_versions_id_fk";
--> statement-breakpoint
DROP INDEX "idx_artifact_versions_artifact_id";--> statement-breakpoint
DROP INDEX "idx_artifacts_project_id";--> statement-breakpoint
DROP INDEX "idx_artifacts_project_type";--> statement-breakpoint
DROP INDEX "idx_generation_jobs_project_id";--> statement-breakpoint
DROP INDEX "idx_generation_steps_job_id";--> statement-breakpoint
DROP INDEX "idx_projects_user_id";--> statement-breakpoint
DROP INDEX "idx_projects_user_status";--> statement-breakpoint
DROP INDEX "idx_users_email";--> statement-breakpoint
ALTER TABLE "artifact_versions" ALTER COLUMN "change_desc" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "artifacts" ALTER COLUMN "type" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "artifacts" ALTER COLUMN "coherence_score" SET DATA TYPE varchar(10);--> statement-breakpoint
ALTER TABLE "artifacts" ALTER COLUMN "coherence_issues" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "feedbacks" ALTER COLUMN "type" SET DEFAULT 'modification';--> statement-breakpoint
ALTER TABLE "generation_steps" ALTER COLUMN "artifact_type" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "template" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "generation_steps" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "locale" varchar(5) DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "feedbacks" DROP COLUMN "triggered_version_id";--> statement-breakpoint
ALTER TABLE "generation_jobs" DROP COLUMN "error_message";--> statement-breakpoint
ALTER TABLE "generation_steps" DROP COLUMN "step_order";--> statement-breakpoint
ALTER TABLE "generation_steps" DROP COLUMN "attempt_count";--> statement-breakpoint
ALTER TABLE "generation_steps" DROP COLUMN "llm_provider";--> statement-breakpoint
ALTER TABLE "generation_steps" DROP COLUMN "llm_model";--> statement-breakpoint
ALTER TABLE "generation_steps" DROP COLUMN "prompt_tokens";--> statement-breakpoint
ALTER TABLE "generation_steps" DROP COLUMN "completion_tokens";--> statement-breakpoint
ALTER TABLE "generation_steps" DROP COLUMN "started_at";--> statement-breakpoint
ALTER TABLE "generation_steps" DROP COLUMN "completed_at";--> statement-breakpoint
ALTER TABLE "projects" DROP COLUMN "archived_at";