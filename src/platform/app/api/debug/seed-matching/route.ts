import { NextRequest, NextResponse } from 'next/server';
import { db } from '~/db';
import { user, userSkills, recruiterProfiles, jobPostings } from '~/db/schema';
import { nanoid } from 'nanoid';

export async function POST(_req: NextRequest) {
  try {
    // Create a recruiter user and profile
    const recruiterUserId = `recruiter_${nanoid(10)}`;
    const recruiterProfileId = `recruiter_profile_${nanoid(10)}`;
    await db.insert(user).values({
      id: recruiterUserId,
      name: 'Test Recruiter',
      email: `recruiter_${nanoid(6)}@example.com`,
      emailVerified: true,
    });

    await db.insert(recruiterProfiles).values({
      id: recruiterProfileId,
      userId: recruiterUserId,
      organizationName: 'Acme Corp',
      recruitingFor: 'Engineering',
      contactEmail: `talent_${nanoid(6)}@acme.example.com`,
      timezone: 'UTC',
    });

    // Create a candidate user with skills
    const candidateId = `candidate_${nanoid(10)}`;
    await db.insert(user).values({
      id: candidateId,
      name: 'Jane Developer',
      email: `candidate_${nanoid(6)}@example.com`,
      emailVerified: true,
    });

    const candidateSkills = [
      { id: `skill_${nanoid(8)}`, userId: candidateId, skillName: 'react', proficiencyScore: '85' },
      { id: `skill_${nanoid(8)}`, userId: candidateId, skillName: 'typescript', proficiencyScore: '80' },
      { id: `skill_${nanoid(8)}`, userId: candidateId, skillName: 'node', proficiencyScore: '70' },
    ];
    await db.insert(userSkills).values(candidateSkills);

    // Create a job posting requiring the candidate's skills
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
        note: 'Use these IDs to test POST /platform/api/jobs/matching',
        requiredSkills: ['react', 'typescript'],
        preferredSkills: ['node'],
      },
    });
  } catch (error) {
    console.error('❌ Seed matching debug error:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed data' }, { status: 500 });
  }
}


