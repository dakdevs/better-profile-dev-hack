import { eq } from 'drizzle-orm' 
import { db } from '~/db' 
import { userSkills } from '~/db/models/user-skills' 
import { jobPostings } from '~/db/models/jobs' 
import { NextRequest, NextResponse } from 'next/server'

import { users } from '~/db/models/users' 

interface Skill {
  name: string 
  proficiencyScore?: number 
  category?: string 
}

interface CandidateSkills {
  id: string 
  name: string 
  email: string 
  skills: Skill[] 
}

interface JobMatch {
  candidateId: string 
  candidateName: string 
  matchScore: number 
  matchingSkills: Skill[] 
  skillGaps: Skill[] 
  overallFit: 'excellent' | 'good' | 'fair' | 'poor' 
}

class CandidateMatchingService {
  /**
   * Find candidates matching a job's requirements
   */
  async findMatchingCandidates(jobId: string): Promise<JobMatch[]> {
    try {
      // Get job details
      const job = await db.query.jobPostings.findFirst({
        where: eq(jobPostings.id, jobId)
      }) 

      if (!job) {
        throw new Error('Job not found') 
      }

      const requiredSkills = (job.requiredSkills as Skill[]) || [] 
      const preferredSkills = (job.preferredSkills as Skill[]) || [] 

      // Get all candidates with their skills
      const results = await db
        .select({
          userId: users.id,
          userName: users.name,
          userEmail: users.email,
          skillName: userSkills.skillName,
          proficiencyScore: userSkills.proficiencyScore,
          mentionCount: userSkills.mentionCount,
          averageConfidence: userSkills.averageConfidence,
        })
        .from(users)
        .innerJoin(userSkills, eq(users.id, userSkills.userId)) 

      // Group results by candidate
      const candidatesMap = new Map<string, CandidateSkills>() 
      results.forEach(row => {
        if (!candidatesMap.has(row.userId)) {
          candidatesMap.set(row.userId, {
            id: row.userId,
            name: row.userName,
            email: row.userEmail,
            skills: []
          }) 
        }
        
        const candidate = candidatesMap.get(row.userId)! 
        candidate.skills.push({
          name: row.skillName,
          proficiencyScore: parseFloat(row.proficiencyScore),
          category: 'technical' // Default category
        }) 
      }) 

      // Calculate match scores for each candidate
      const matches: JobMatch[] = [] 
      for (const candidate of candidatesMap.values()) {
        const matchResult = this.calculateSkillMatch(
          candidate.skills,
          requiredSkills,
          preferredSkills
        ) 

        matches.push({
          candidateId: candidate.id,
          candidateName: candidate.name,
          matchScore: matchResult.matchScore,
          matchingSkills: matchResult.matchingSkills,
          skillGaps: matchResult.skillGaps,
          overallFit: matchResult.overallFit
        })
      }

      // Sort by match score (highest first) and filter for good matches (>60%)
      return matches
        .filter(match => match.matchScore >= 60)
        .sort((a, b) => b.matchScore - a.matchScore) 

    } catch (error) {
      logger.error('Error finding matching candidates', {
        operation: 'candidate-matching.find',
        metadata: { jobId },
      }, error as Error) 
      
      throw new Error('Failed to find matching candidates') 
    }
  }

  /**
   * Calculate skill match between candidate and job requirements
   */
  private calculateSkillMatch(
    candidateSkills: Skill[],
    requiredSkills: Skill[],
    preferredSkills: Skill[]
  ): {
    matchingSkills: Skill[] 
    skillGaps: Skill[] 
    matchScore: number 
    overallFit: 'excellent' | 'good' | 'fair' | 'poor' 
  } {
    const candidateSkillMap = new Map(
      candidateSkills.map(skill => [skill.name.toLowerCase().trim(), skill])
    ) 

    // Create a fuzzy matching function for better skill matching
    const findSkillMatch = (jobSkill: Skill): Skill | null => {
      const jobSkillName = jobSkill.name.toLowerCase().trim() 
      
      // Exact match first
      if (candidateSkillMap.has(jobSkillName)) {
        return candidateSkillMap.get(jobSkillName)! 
      }

      // Fuzzy matching for common variations
      for (const [candidateSkillName, candidateSkill] of candidateSkillMap) {
        // Check if one skill name contains the other (for variations like "React" vs "React.js")
        if (candidateSkillName.includes(jobSkillName) || jobSkillName.includes(candidateSkillName)) {
          return candidateSkill 
        }
      }

      return null 
    } 

    // Find matching required skills with fuzzy matching
    const matchingRequired: Skill[] = [] 
    const matchingRequiredCandidateSkills: Skill[] = [] 
    
    requiredSkills.forEach(jobSkill => {
      const candidateSkill = findSkillMatch(jobSkill) 
      if (candidateSkill) {
        matchingRequired.push(jobSkill) 
        matchingRequiredCandidateSkills.push(candidateSkill) 
      }
    }) 

    // Find matching preferred skills with fuzzy matching
    const matchingPreferred: Skill[] = [] 
    const matchingPreferredCandidateSkills: Skill[] = [] 
    
    preferredSkills.forEach(jobSkill => {
      const candidateSkill = findSkillMatch(jobSkill) 
      if (candidateSkill) {
        matchingPreferred.push(jobSkill) 
        matchingPreferredCandidateSkills.push(candidateSkill) 
      }
    }) 

    // Find skill gaps (required skills not possessed by candidate)
    const skillGaps = requiredSkills.filter(skill => !findSkillMatch(skill)) 

    // Calculate match score
    const requiredScore = requiredSkills.length > 0 
      ? (matchingRequired.length / requiredSkills.length) * 100
      : 100  // If no required skills, give full score

    const preferredScore = preferredSkills.length > 0
      ? (matchingPreferred.length / preferredSkills.length) * 100
      : 0  // If no preferred skills, no bonus

    // Apply proficiency weighting
    const proficiencyWeightedScore = this.applyProficiencyWeighting(
      matchingRequiredCandidateSkills,
      matchingPreferredCandidateSkills,
      requiredScore,
      preferredScore
    ) 

    // Final weighted score: 80% required, 20% preferred
    const finalScore = Math.round((proficiencyWeightedScore.required * 0.8) + (proficiencyWeightedScore.preferred * 0.2)) 
    const boundedScore = Math.min(100, Math.max(0, finalScore)) 

    return {
      matchingSkills: [...matchingRequired, ...matchingPreferred],
      skillGaps,
      matchScore: boundedScore,
      overallFit: this.determineOverallFit(boundedScore),
    } 
  }

  /**
   * Apply proficiency-based weighting to skill matches
   */
  private applyProficiencyWeighting(
    matchingRequiredCandidateSkills: Skill[],
    matchingPreferredCandidateSkills: Skill[],
    baseRequiredScore: number,
    basePreferredScore: number
  ): { required: number , preferred: number } {
    // Weight required skills
    let weightedRequiredScore = baseRequiredScore 
    if (matchingRequiredCandidateSkills.length > 0) {
      const proficiencyScores = matchingRequiredCandidateSkills.map(skill => 
        skill.proficiencyScore || 50
      ) 
      const avgProficiency = proficiencyScores.reduce((sum, score) => sum + score, 0) / proficiencyScores.length 
      const proficiencyMultiplier = 0.7 + (avgProficiency / 100) * 0.6 
      weightedRequiredScore = baseRequiredScore * proficiencyMultiplier 
    }

    // Weight preferred skills
    let weightedPreferredScore = basePreferredScore 
    if (matchingPreferredCandidateSkills.length > 0) {
      const proficiencyScores = matchingPreferredCandidateSkills.map(skill => 
        skill.proficiencyScore || 50
      ) 
      const avgProficiency = proficiencyScores.reduce((sum, score) => sum + score, 0) / proficiencyScores.length 
      const proficiencyMultiplier = 0.7 + (avgProficiency / 100) * 0.6 
      weightedPreferredScore = basePreferredScore * proficiencyMultiplier 
    }

    return {
      required: weightedRequiredScore,
      preferred: weightedPreferredScore,
    } 
  }

  /**
   * Determine overall fit category based on match score
   */
  private determineOverallFit(matchScore: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (matchScore >= 90) return 'excellent' 
    if (matchScore >= 75) return 'good' 
    if (matchScore >= 60) return 'fair' 
    return 'poor' 
  }
}

// Initialize service
const candidateMatchingService = new CandidateMatchingService() 

export async function POST(request: NextRequest) {
  try {
    // Get the current user session
    const session = await auth.api.getSession({
      headers: request.headers,
    }) 
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      ) 
    }

    logger.info('Job matching request received', {
      operation: 'jobs-matching.get',
      metadata: {
        candidateId: session.user.id,
        candidateName: session.user.name,
        candidateEmail: session.user.email,
      },
    }) 
export class JobMatchingService {
  /**
   * Find jobs matching a candidate's skills with 90%+ match score
   */
  async findMatchingJobs(candidateId: string): Promise<JobMatch[]> {
    return withLogging('job-matching.find', async () => {
      // Check cache first

      try {
        // Get candidate skills
        const candidateSkills = await this.getCandidateSkills(candidateId) 
        
        if (candidateSkills.skills.length === 0) {
          logger.debug('No skills found for candidate', {
            operation: 'job-matching.find',
            metadata: { candidateId },
          }) 
          return [] 
        }

        // Get all active job listings
        const jobs = await this.getActiveJobListings() 
        
        if (jobs.length === 0) {
          logger.debug('No active job listings found', {
            operation: 'job-matching.find',
          }) 
          return [] 
        }

        // Calculate match scores for each job
        const matches = jobs.map(job => this.calculateJobMatch(candidateSkills, job)) 

        // Filter by minimum match score (90%)
        const highQualityMatches = matches.filter(match => match.matchScore >= 90) 

        // Sort by match score (highest first)
        const sortedMatches = highQualityMatches.sort((a, b) => b.matchScore - a.matchScore) 

        // Cache the result
        

        logger.debug('Job matching completed', {
          operation: 'job-matching.find',
          metadata: { 
            candidateId,
            totalJobs: jobs.length,
            matchedJobs: sortedMatches.length,
            minScore: 90
          },
        }) 

        return sortedMatches 
      } catch (error) {
        logger.error('Error finding matching jobs', {
          operation: 'job-matching.find',
          metadata: { candidateId },
        }, error as Error) 
        
        throw new Error('Failed to find matching jobs') 
      }
    }) 
  }

  /**
   * Calculate match score between candidate skills and job requirements
   */
  private calculateJobMatch(candidate: CandidateSkills, job: JobListing): JobMatch {
    const requiredSkills = job.requiredSkills || [] 
    const preferredSkills = job.preferredSkills || [] 
    
    // Calculate skill matches
    const matchResult = this.calculateSkillMatch(
      candidate.skills,
      requiredSkills,
      preferredSkills
    ) 

    return {
      job,
      matchScore: matchResult.matchScore,
      matchingSkills: matchResult.matchingSkills,
      skillGaps: matchResult.skillGaps,
      overallFit: matchResult.overallFit,
    } 
  }

  /**
   * Calculate skill-based matching between candidate and job requirements
   */
  private calculateSkillMatch(
    candidateSkills: Skill[],
    requiredSkills: Skill[],
    preferredSkills: Skill[]
  ): {
    matchingSkills: Skill[] 
    skillGaps: Skill[] 
    matchScore: number 
    overallFit: 'excellent' | 'good' | 'fair' | 'poor' 
  } {
    const candidateSkillMap = new Map(
      candidateSkills.map(skill => [skill.name.toLowerCase().trim(), skill])
    ) 

    // Create a fuzzy matching function for better skill matching
    const findSkillMatch = (jobSkill: Skill): Skill | null => {
      const jobSkillName = jobSkill.name.toLowerCase().trim() 
      
      // Exact match first
      if (candidateSkillMap.has(jobSkillName)) {
        return candidateSkillMap.get(jobSkillName)! 
      }

      // Fuzzy matching for common variations
      for (const [candidateSkillName, candidateSkill] of candidateSkillMap) {
        // Check if one skill name contains the other (for variations like "React" vs "React.js")
        if (candidateSkillName.includes(jobSkillName) || jobSkillName.includes(candidateSkillName)) {
          return candidateSkill 
        }
        
        // Check for common synonyms/variations
       
      }

      return null 
    } 

    // Find matching required skills with fuzzy matching
    const matchingRequired: Skill[] = [] 
    const matchingRequiredCandidateSkills: Skill[] = [] 
    
    requiredSkills.forEach(jobSkill => {
      const candidateSkill = findSkillMatch(jobSkill) 
      if (candidateSkill) {
        matchingRequired.push(jobSkill) 
        matchingRequiredCandidateSkills.push(candidateSkill) 
      }
    }) 

    // Find matching preferred skills with fuzzy matching
    const matchingPreferred: Skill[] = [] 
    const matchingPreferredCandidateSkills: Skill[] = [] 
    
    preferredSkills.forEach(jobSkill => {
      const candidateSkill = findSkillMatch(jobSkill) 
      if (candidateSkill) {
        matchingPreferred.push(jobSkill) 
        matchingPreferredCandidateSkills.push(candidateSkill) 
      }
    }) 

    // Find skill gaps (required skills not possessed by candidate)
    const skillGaps = requiredSkills.filter(skill => !findSkillMatch(skill)) 

    // Calculate weighted match score
    const requiredScore = requiredSkills.length > 0 
      ? (matchingRequired.length / requiredSkills.length) * 100
      : 100  // If no required skills, give full score

    const preferredScore = preferredSkills.length > 0
      ? (matchingPreferred.length / preferredSkills.length) * 100
      : 0  // If no preferred skills, no bonus

    // Apply proficiency weighting for matching skills
    const proficiencyWeightedScore = this.applyProficiencyWeighting(
      matchingRequiredCandidateSkills,
      matchingPreferredCandidateSkills,
      requiredScore,
      preferredScore
    ) 

    // Final weighted score: 80% required, 20% preferred (higher weight on required for job matching)
    const finalScore = Math.round((proficiencyWeightedScore.required * 0.8) + (proficiencyWeightedScore.preferred * 0.2)) 

    return {
      matchingSkills: [...matchingRequired, ...matchingPreferred],
      skillGaps,
      matchScore: Math.min(100, Math.max(0, finalScore)),
      overallFit: this.determineOverallFit(finalScore),
    } 
  }

  /**
   * Apply proficiency-based weighting to skill matches
   */
  private applyProficiencyWeighting(
    matchingRequiredCandidateSkills: Skill[],
    matchingPreferredCandidateSkills: Skill[],
    baseRequiredScore: number,
    basePreferredScore: number
  ): { required: number  preferred: number } {
    // Calculate proficiency-weighted required score
    let weightedRequiredScore = baseRequiredScore 
    if (matchingRequiredCandidateSkills.length > 0) {
      const proficiencyScores = matchingRequiredCandidateSkills.map(skill => 
        skill.proficiencyScore || 50 // Default to 50 if no proficiency
      ) 

      // Calculate weighted average based on proficiency scores
      const totalProficiency = proficiencyScores.reduce((sum, score) => sum + score, 0) 
      const avgProficiency = totalProficiency / proficiencyScores.length 

      // Apply proficiency multiplier (0.7 to 1.3 based on proficiency)
      const proficiencyMultiplier = 0.7 + (avgProficiency / 100) * 0.6 
      weightedRequiredScore = baseRequiredScore * proficiencyMultiplier 
    }

    // Calculate proficiency-weighted preferred score
    let weightedPreferredScore = basePreferredScore 
    if (matchingPreferredCandidateSkills.length > 0) {
      const proficiencyScores = matchingPreferredCandidateSkills.map(skill => 
        skill.proficiencyScore || 50
      ) 

      const totalProficiency = proficiencyScores.reduce((sum, score) => sum + score, 0) 
      const avgProficiency = totalProficiency / proficiencyScores.length 

      const proficiencyMultiplier = 0.7 + (avgProficiency / 100) * 0.6 
      weightedPreferredScore = basePreferredScore * proficiencyMultiplier 
    }

    return {
      required: weightedRequiredScore,
      preferred: weightedPreferredScore,
    } 
  }

  /**
   * Check if two skill names are similar (for fuzzy matching)
   */

  /**
   * Determine overall fit category based on match score
   */
  private determineOverallFit(matchScore: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (matchScore >= 90) return 'excellent' 
    if (matchScore >= 75) return 'good' 
    if (matchScore >= 60) return 'fair' 
    return 'poor' 
  }

  /**
   * Get candidate skills from database
   */
  private async getCandidateSkills(candidateId: string): Promise<CandidateSkills> {
    try {
      const results = await db
        .select({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          skillName: userSkills.skillName,
          proficiencyScore: userSkills.proficiencyScore,
          mentionCount: userSkills.mentionCount,
          averageConfidence: userSkills.averageConfidence,
        })
        .from(user)
        .innerJoin(userSkills, eq(user.id, userSkills.userId))
        .where(eq(user.id, candidateId)) 

      if (results.length === 0) {
        // Return empty candidate if no skills found
        const userResult = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
          })
          .from(user)
          .where(eq(user.id, candidateId))
          .limit(1) 

        if (userResult.length === 0) {
          throw new Error('Candidate not found') 
        }

        return {
          id: userResult[0].id,
          name: userResult[0].name,
          email: userResult[0].email,
          skills: [],
        } 
      }

      // Use first result for user info, then aggregate skills
      const firstResult = results[0] 
      const skills: Skill[] = results.map(row => ({
        name: row.skillName,
        proficiencyScore: parseFloat(row.proficiencyScore),
        category: 'technical', // Default category
      })) 

      return {
        id: firstResult.userId,
        name: firstResult.userName,
        email: firstResult.userEmail,
        skills,
      } 
    } catch (error) {
      logger.error('Error getting candidate skills', {
        operation: 'job-matching.get-candidate-skills',
        metadata: { candidateId },
      }, error as Error) 
      throw new Error('Failed to retrieve candidate skills') 
    }
  }

  /**
   * Get all active job listings from database
   */
  private async getActiveJobListings(): Promise<JobListing[]> {
    try {
      const results = await db
        .select()
        .from(jobListings)
        .where(eq(jobListings.status, 'active'))
        .orderBy(desc(jobListings.createdAt)) 

      return results.map(row => ({
        id: row.id,
        title: row.title,
        company: row.company,
        description: row.description,
        requiredSkills: (row.requiredSkills as Skill[]) || [],
        preferredSkills: (row.preferredSkills as Skill[]) || [],
        location: row.location,
        salaryMin: row.salaryMin || undefined,
        salaryMax: row.salaryMax || undefined,
        jobType: row.jobType,
        experienceLevel: row.experienceLevel,
        remoteAllowed: row.remoteAllowed || false,
        benefits: (row.benefits as string[]) || undefined,
        applicationUrl: row.applicationUrl || undefined,
        contactEmail: row.contactEmail || undefined,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })) 
    } catch (error) {
      logger.error('Error getting active job listings', {
        operation: 'job-matching.get-active-jobs',
      }, error as Error) 
      throw new Error('Failed to retrieve job listings') 
    }
  }

  /**
   * Invalidate job matching cache for a candidate
   */
  
}
    // Get job ID from request body
    const body = await request.json() 
    const { jobId } = body 

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID is required' },
        { status: 400 }
      ) 
    }

    logger.info('Candidate matching request received', {
      operation: 'candidate-matching.post',
      metadata: {
        jobId,
        requesterId: session.user.id,
      },
    }) 

    // Find matching candidates
    const matches = await candidateMatchingService.findMatchingCandidates(jobId) 

    logger.info('Candidate matching completed', {
      operation: 'candidate-matching.post',
      metadata: {
        jobId,
        matchCount: matches.length,
      },
    }) 

    return NextResponse.json({
      success: true,
      matches,
      jobId,
      matchCount: matches.length,
    }) 

  } catch (error) {
    logger.error('Error in candidate matching API', {
      operation: 'candidate-matching.post',
    }, error as Error) 

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to find matching candidates',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    ) 
  }
}