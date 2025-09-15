import { NextRequest, NextResponse } from 'next/server';
import { candidateMatchingService } from '~/platform/services/candidate-matching';
import { db } from '~/platform/db';
import { jobPostings, recruiterProfiles, user, userSkills } from '~/platform/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/jobs/matching - Get candidates matching a job posting
// Input: { jobID: string }
// Output: { candidateID: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobID } = body;

    if (!jobID || typeof jobID !== 'string') {
      return NextResponse.json(
        { error: 'jobID parameter is required and must be a string' },
        { status: 400 }
      );
    }

    const job = await db
      .select({
        id: jobPostings.id,
        title: jobPostings.title,
        recruiterId: jobPostings.recruiterId,
        requiredSkills: jobPostings.requiredSkills,
        preferredSkills: jobPostings.preferredSkills,
        status: jobPostings.status,
        rawDescription: jobPostings.rawDescription,
        experienceLevel: jobPostings.experienceLevel,
        salaryMin: jobPostings.salaryMin,
        salaryMax: jobPostings.salaryMax,
        location: jobPostings.location,
        remoteAllowed: jobPostings.remoteAllowed,
        employmentType: jobPostings.employmentType,
        aiConfidenceScore: jobPostings.aiConfidenceScore,
        createdAt: jobPostings.createdAt,
        updatedAt: jobPostings.updatedAt,
      })
      .from(jobPostings)
      .innerJoin(recruiterProfiles, eq(jobPostings.recruiterId, recruiterProfiles.id))
      .where(eq(jobPostings.id, jobID))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    const jobData = job[0];

    const matchesResult = await candidateMatchingService.findMatchingCandidates(
      jobData as any,
      undefined,
      { page: 1, limit: 1 }
    );

    if (matchesResult.data.length === 0) {
      const candidateWithSkills = await db
        .select({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
        })
        .from(user)
        .innerJoin(userSkills, eq(user.id, userSkills.userId))
        .limit(1);

      if (candidateWithSkills.length === 0) {
        return NextResponse.json(
          { 
            error: 'No candidates found in database',
          },
          { status: 404 }
        );
      }

      const candidateID = candidateWithSkills[0].userId;
      return NextResponse.json({ candidateID });
    }

    const topCandidate = matchesResult.data[0];
    const candidateID = topCandidate.candidate.id;
    return NextResponse.json({ candidateID });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to find matching candidates' },
      { status: 500 }
    );
  }
}


