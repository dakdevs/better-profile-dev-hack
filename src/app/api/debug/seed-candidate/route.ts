import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { db } from '~/db'
import { users, userSkills } from '~/db/models'
import { sql } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export async function POST(_req: NextRequest) {
  try {
    // Ensure required tables exist; if not, return a helpful error
    const usersCheck: any = await db.execute(sql`SELECT to_regclass('public.users') AS users_table;`)
    const users_table: string | null = usersCheck?.rows?.[0]?.users_table ?? null
    const userSkillsCheck: any = await db.execute(sql`SELECT to_regclass('public.user_skills') AS user_skills_table;`)
    const user_skills_table: string | null = userSkillsCheck?.rows?.[0]?.user_skills_table ?? null

    if (!users_table) {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" uuid PRIMARY KEY,
          "name" text NOT NULL,
          "email" text NOT NULL UNIQUE,
          "email_verified" boolean NOT NULL DEFAULT false,
          "image" text,
          "created_at" timestamp NOT NULL DEFAULT now(),
          "updated_at" timestamp NOT NULL DEFAULT now(),
          "role" text,
          "banned" boolean,
          "ban_reason" text,
          "ban_expires" timestamp
        );
      `)
    }
    if (!user_skills_table) {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "user_skills" (
          "id" text PRIMARY KEY,
          "user_id" uuid NOT NULL,
          "skill_name" text NOT NULL,
          "mention_count" integer NOT NULL DEFAULT 0,
          "last_mentioned" timestamp NOT NULL DEFAULT now(),
          "proficiency_score" text NOT NULL DEFAULT '0',
          "average_confidence" text DEFAULT '0',
          "average_engagement" text DEFAULT 'medium',
          "topic_depth_average" text DEFAULT '0',
          "created_at" timestamp NOT NULL DEFAULT now(),
          "updated_at" timestamp NOT NULL DEFAULT now()
        );
      `)
    }
    // 1) Create a candidate user (uses uuid default on users.id)
    const [created] = await db
      .insert(users)
      .values({
        id: randomUUID(),
        name: 'Mock Candidate',
        email: `candidate_${nanoid(6)}@example.com`,
        emailVerified: true,
      })
      .returning({ id: users.id, name: users.name, email: users.email })

    const candidateId = created.id

    // 2) Attach a small set of skills
    const skills = [
      { name: 'react', proficiency: '85' },
      { name: 'typescript', proficiency: '80' },
      { name: 'node', proficiency: '70' },
    ]

    await db.insert(userSkills).values(
      skills.map((s) => ({
        id: `skill_${nanoid(8)}`,
        userId: candidateId,
        skillName: s.name,
        proficiencyScore: s.proficiency,
      }))
    )

    return NextResponse.json({
      success: true,
      candidateID: candidateId,
      skills: skills.map((s) => s.name),
      note: 'Use an existing jobID with /api/jobs/matching to test matching.'
    })
  } catch (error) {
    console.error('❌ seed-candidate error:', error)
    return NextResponse.json({ success: false, error: 'Failed to seed candidate', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}


