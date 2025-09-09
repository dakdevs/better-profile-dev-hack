CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"id_token" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"impersonated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean,
	"ban_reason" text,
	"ban_expires" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recruiter_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_name" text NOT NULL,
	"recruiting_for" text NOT NULL,
	"contact_email" text,
	"phone_number" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"cal_com_connected" boolean DEFAULT false,
	"cal_com_api_key" text,
	"cal_com_username" text,
	"cal_com_user_id" integer,
	"cal_com_schedule_id" integer,
	"cal_com_event_type_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_postings" (
	"id" text PRIMARY KEY NOT NULL,
	"recruiter_id" text NOT NULL,
	"title" text NOT NULL,
	"raw_description" text NOT NULL,
	"extracted_skills" jsonb,
	"required_skills" jsonb,
	"preferred_skills" jsonb,
	"experience_level" text,
	"salary_min" integer,
	"salary_max" integer,
	"location" text,
	"remote_allowed" boolean DEFAULT false,
	"employment_type" text DEFAULT 'full-time',
	"status" text DEFAULT 'active' NOT NULL,
	"ai_confidence_score" numeric(3, 2),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"session_type" text DEFAULT 'interview' NOT NULL,
	"title" text,
	"description" text,
	"duration" integer,
	"message_count" integer DEFAULT 0 NOT NULL,
	"average_engagement" text DEFAULT 'medium',
	"overall_score" text DEFAULT '0',
	"topics_explored" jsonb,
	"skills_identified" jsonb,
	"final_analysis" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_mentions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_skill_id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" text,
	"mention_text" text,
	"confidence" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_skills" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"skill_name" text NOT NULL,
	"mention_count" integer DEFAULT 0 NOT NULL,
	"last_mentioned" timestamp DEFAULT now() NOT NULL,
	"proficiency_score" text DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "embeddings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"session_id" text,
	"content" text NOT NULL,
	"embedding" vector(768),
	"message_index" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_messages" ADD CONSTRAINT "interview_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiter_profiles" ADD CONSTRAINT "recruiter_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_recruiter_id_recruiter_profiles_id_fk" FOREIGN KEY ("recruiter_id") REFERENCES "public"."recruiter_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mentions" ADD CONSTRAINT "skill_mentions_user_skill_id_user_skills_id_fk" FOREIGN KEY ("user_skill_id") REFERENCES "public"."user_skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mentions" ADD CONSTRAINT "skill_mentions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_mentions" ADD CONSTRAINT "skill_mentions_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "embeddings" ADD CONSTRAINT "embeddings_session_id_interview_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."interview_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_id_index" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "interview_messages_user_id_created_at_id_index" ON "interview_messages" USING btree ("user_id","created_at","id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_index" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "verifications_identifier_index" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "recruiter_profiles_user_idx" ON "recruiter_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recruiter_profiles_organization_idx" ON "recruiter_profiles" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "recruiter_profiles_cal_com_user_idx" ON "recruiter_profiles" USING btree ("cal_com_user_id");--> statement-breakpoint
CREATE INDEX "job_postings_recruiter_idx" ON "job_postings" USING btree ("recruiter_id");--> statement-breakpoint
CREATE INDEX "job_postings_status_idx" ON "job_postings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "job_postings_title_idx" ON "job_postings" USING btree ("title");--> statement-breakpoint
CREATE INDEX "job_postings_location_idx" ON "job_postings" USING btree ("location");--> statement-breakpoint
CREATE INDEX "job_postings_experience_level_idx" ON "job_postings" USING btree ("experience_level");--> statement-breakpoint
CREATE INDEX "interview_sessions_user_idx" ON "interview_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "skill_mentions_user_skill_idx" ON "skill_mentions" USING btree ("user_skill_id");--> statement-breakpoint
CREATE INDEX "user_skills_user_skill_idx" ON "user_skills" USING btree ("user_id","skill_name");--> statement-breakpoint
CREATE INDEX "embeddings_embedding_idx" ON "embeddings" USING hnsw ("embedding" vector_cosine_ops);