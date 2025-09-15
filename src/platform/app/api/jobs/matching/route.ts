import { NextRequest, NextResponse } from 'next/server';
import { auth } from '~/lib/auth';
import { jobMatchingService } from '~/services/job-matching';
import { logger } from '~/lib/logger';
import { candidateMatchingService } from '~/services/candidate-matching';
import { db } from '~/db';
import { jobPostings, recruiterProfiles, user, userSkills } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    logger.info('Job matching request received', {
      operation: 'jobs-matching.get',
      metadata: {
        candidateId: session.user.id,
        candidateName: session.user.name,
        candidateEmail: session.user.email,
      },
    });

    // Find matching jobs for the candidate
    const matches = await jobMatchingService.findMatchingJobs(session.user.id);

    logger.info('Job matching completed', {
      operation: 'jobs-matching.get',
      metadata: {
        candidateId: session.user.id,
        matchCount: matches.length,
      },
    });

    return NextResponse.json({
      success: true,
      matches,
      candidateId: session.user.id,
      matchCount: matches.length,
    });

  } catch (error) {
    logger.error('Error in job matching API', {
      operation: 'jobs-matching.get',
    }, error as Error);

    console.error('❌ Error in job matching:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to find matching jobs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/jobs/matching - Get candidates matching a job posting
// Input: { jobID: string }
// Output: { candidateID: string }
export async function POST(req: NextRequest) {
  try {
    console.log('🔍 POST /api/jobs/matching called');
    const body = await req.json();
    const { jobID } = body;

    console.log('📝 Request body:', { jobID });

    // Validate required parameters
    if (!jobID || typeof jobID !== 'string') {
      return NextResponse.json(
        { error: 'jobID parameter is required and must be a string' },
        { status: 400 }
      );
    }

    // Verify job exists and get job data
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
    console.log('✅ Found job:', jobData.title);

    // Get matching candidates using the existing candidate matching service
    // Use no filters to get all candidates, then take the first one
    const matchesResult = await candidateMatchingService.findMatchingCandidates(
      jobData as any,
      undefined,
      { page: 1, limit: 1 }
    );

    console.log('🔍 Matching results:', {
      totalCandidates: matchesResult.pagination.total,
      foundCandidates: matchesResult.data.length,
      jobTitle: jobData.title,
      requiredSkills: jobData.requiredSkills,
      preferredSkills: jobData.preferredSkills
    });

    // Fallback: if no matches found, get any candidate with skills
    if (matchesResult.data.length === 0) {
      console.log('⚠️ No candidates found via matching service, trying direct database query...');

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
            debug: {
              totalCandidates: matchesResult.pagination.total,
              jobTitle: jobData.title,
              requiredSkills: jobData.requiredSkills,
              preferredSkills: jobData.preferredSkills
            }
          },
          { status: 404 }
        );
      }

      const candidateID = candidateWithSkills[0].userId;
      console.log('✅ Found candidate via fallback:', {
        candidateID,
        name: candidateWithSkills[0].userName
      });

      return NextResponse.json({
        candidateID: candidateID
      });
    }

    // Return the top candidate from the matching service
    const topCandidate = matchesResult.data[0];
    const candidateID = topCandidate.candidate.id;

    console.log('✅ Found top candidate:', {
      candidateID,
      name: topCandidate.candidate.name,
      matchScore: topCandidate.match.score
    });
    
    return NextResponse.json({
      candidateID: candidateID
    });

  } catch (error) {
    console.error('❌ POST error:', error);
    return NextResponse.json(
      { error: 'Failed to find matching candidates' },
      { status: 500 }
    );
  }
}