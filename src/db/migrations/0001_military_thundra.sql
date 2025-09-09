CREATE TABLE "candidate_job_matches" (
	"id" text PRIMARY KEY NOT NULL,
	"job_posting_id" text NOT NULL,
	"candidate_id" uuid NOT NULL,
	"match_score" numeric(5, 2) NOT NULL,
	"matching_skills" jsonb,
	"skill_gaps" jsonb,
	"overall_fit" text
);
--> statement-breakpoint
ALTER TABLE "candidate_job_matches" ADD CONSTRAINT "candidate_job_matches_job_posting_id_job_postings_id_fk" FOREIGN KEY ("job_posting_id") REFERENCES "public"."job_postings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_job_matches" ADD CONSTRAINT "candidate_job_matches_candidate_id_users_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "candidate_job_matches_job_posting_idx" ON "candidate_job_matches" USING btree ("job_posting_id");--> statement-breakpoint
CREATE INDEX "candidate_job_matches_candidate_idx" ON "candidate_job_matches" USING btree ("candidate_id");