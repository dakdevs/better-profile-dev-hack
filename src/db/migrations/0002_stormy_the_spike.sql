CREATE TABLE "job_postings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"raw_description" text NOT NULL,
	"extracted_skills" jsonb,
	"required_skills" jsonb,
	"preferred_skills" jsonb,
	"experience_level" text,
	"salary_min" integer,
	"salary_max" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_postings" ADD CONSTRAINT "job_postings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_postings_user_id_index" ON "job_postings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_postings_title_index" ON "job_postings" USING btree ("title");--> statement-breakpoint
CREATE INDEX "job_postings_experience_level_index" ON "job_postings" USING btree ("experience_level");