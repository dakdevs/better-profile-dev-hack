-- Add topic tree fields to interview_sessions table
ALTER TABLE "interview_sessions" ADD COLUMN "topic_tree_state" jsonb;
ALTER TABLE "interview_sessions" ADD COLUMN "current_path" jsonb;
ALTER TABLE "interview_sessions" ADD COLUMN "exhausted_topics" jsonb;


