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
CREATE TABLE "user_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"skill_name" text NOT NULL,
	"mention_count" integer DEFAULT 0 NOT NULL,
	"last_mentioned" timestamp DEFAULT now() NOT NULL,
	"proficiency_score" text DEFAULT '0' NOT NULL,
	"average_confidence" text DEFAULT '0',
	"average_engagement" text DEFAULT 'medium',
	"topic_depth_average" text DEFAULT '0',
	"synonyms" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recruiter_profiles" ADD CONSTRAINT "recruiter_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recruiter_profiles_user_idx" ON "recruiter_profiles" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recruiter_profiles_organization_idx" ON "recruiter_profiles" USING btree ("organization_name");--> statement-breakpoint
CREATE INDEX "recruiter_profiles_cal_com_user_idx" ON "recruiter_profiles" USING btree ("cal_com_user_id");--> statement-breakpoint
CREATE INDEX "user_skills_user_skill_idx" ON "user_skills" USING btree ("user_id","skill_name");