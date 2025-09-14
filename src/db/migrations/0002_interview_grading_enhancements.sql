-- Add new columns to interview_sessions table
ALTER TABLE "interview_sessions" ADD COLUMN "buzzwords" jsonb;
ALTER TABLE "interview_sessions" ADD COLUMN "max_depth_reached" integer DEFAULT 0;
ALTER TABLE "interview_sessions" ADD COLUMN "total_depth" integer DEFAULT 0;

-- Add new columns to user_skills table
ALTER TABLE "user_skills" ADD COLUMN "average_confidence" text DEFAULT '0';
ALTER TABLE "user_skills" ADD COLUMN "average_engagement" text DEFAULT 'medium';
ALTER TABLE "user_skills" ADD COLUMN "topic_depth_average" text DEFAULT '0';
ALTER TABLE "user_skills" ADD COLUMN "synonyms" text;

-- Add new columns to skill_mentions table
ALTER TABLE "skill_mentions" ADD COLUMN "message_index" integer;
ALTER TABLE "skill_mentions" ADD COLUMN "engagement_level" text;
ALTER TABLE "skill_mentions" ADD COLUMN "topic_depth" text;
ALTER TABLE "skill_mentions" ADD COLUMN "conversation_context" text;


