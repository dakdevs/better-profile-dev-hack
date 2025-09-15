import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/platform/db';
import { user, userSkills, recruiterProfiles, jobPostings } from '~/platform/db/schema';
import { nanoid } from 'nanoid';
import { sql } from 'drizzle-orm';

export async function POST(_req: NextRequest) {
  try {
    // Ensure platform tables exist (dev convenience)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "emailVerified" boolean NOT NULL DEFAULT false,
        "image" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "recruiter_profiles" (
        "id" text PRIMARY KEY,
        "user_id" text NOT NULL,
        "organization_name" text NOT NULL,
        "recruiting_for" text NOT NULL,
        "contact_email" text,
        "phone_number" text,
        "timezone" text NOT NULL DEFAULT 'UTC',
        "cal_com_connected" boolean DEFAULT false,
        "cal_com_api_key" text,
        "cal_com_username" text,
        "cal_com_user_id" integer,
        "cal_com_schedule_id" integer,
        "cal_com_event_type_id" integer,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "job_postings" (
        "id" text PRIMARY KEY,
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
        "status" text NOT NULL DEFAULT 'active',
        "ai_confidence_score" decimal(3,2),
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "user_skills" (
        "id" text PRIMARY KEY,
        "user_id" text NOT NULL,
        "skill_name" text NOT NULL,
        "mention_count" integer NOT NULL DEFAULT 0,
        "last_mentioned" timestamp NOT NULL DEFAULT now(),
        "proficiency_score" text NOT NULL DEFAULT '0',
        "average_confidence" text NOT NULL DEFAULT '0',
        "average_engagement" text NOT NULL DEFAULT 'medium',
        "topic_depth_average" text NOT NULL DEFAULT '0',
        "first_mentioned" timestamp NOT NULL DEFAULT now(),
        "synonyms" jsonb,
        "created_at" timestamp NOT NULL DEFAULT now(),
        "updated_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    const recruiterProfileId = `recruiter_profile_${nanoid(10)}`;

    const recruiterInsert = await db
      .insert(user)
      .values({
        id: `recruiter_${nanoid(10)}`,
        name: 'Test Recruiter',
        email: `recruiter_${nanoid(6)}@example.com`,
        emailVerified: true,
      })
      .returning({ id: user.id });
    const recruiterUserId = recruiterInsert[0].id;

    await db.insert(recruiterProfiles).values({
      id: recruiterProfileId,
      userId: recruiterUserId,
      organizationName: 'Acme Corp',
      recruitingFor: 'Engineering',
      contactEmail: `talent_${nanoid(6)}@acme.example.com`,
      timezone: 'UTC',
    });

    const candidateInsert = await db
      .insert(user)
      .values({
        id: `candidate_${nanoid(10)}`,
        name: 'Jane Developer',
        email: `candidate_${nanoid(6)}@example.com`,
        emailVerified: true,
      })
      .returning({ id: user.id });
    const candidateId = candidateInsert[0].id;

    const candidateSkills = [
      { id: `skill_${nanoid(8)}`, userId: candidateId, skillName: 'react', proficiencyScore: '85' },
      { id: `skill_${nanoid(8)}`, userId: candidateId, skillName: 'typescript', proficiencyScore: '80' },
      { id: `skill_${nanoid(8)}`, userId: candidateId, skillName: 'node', proficiencyScore: '70' },
    ];
    await db.insert(userSkills).values(candidateSkills);

    const jobId = `job_${nanoid(10)}`;
    await db.insert(jobPostings).values({
      id: jobId,
      recruiterId: recruiterProfileId,
      title: 'Frontend Engineer',
      rawDescription: 'Seeking a Frontend Engineer skilled in React and TypeScript.',
      requiredSkills: [
        { name: 'react' },
        { name: 'typescript' },
      ],
      preferredSkills: [
        { name: 'node' },
      ],
      experienceLevel: 'mid',
      location: 'Remote',
      remoteAllowed: true,
      employmentType: 'full-time',
      status: 'active',
    } as any);

    return NextResponse.json({
      success: true,
      jobID: jobId,
      candidateID: candidateId,
      info: {
        note: 'Use these IDs to test POST /api/jobs/matching',
        requiredSkills: ['react', 'typescript'],
        preferredSkills: ['node'],
      },
    });
  } catch (error) {
    console.error('❌ Seed matching debug error:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed data', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}


