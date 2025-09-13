import { describe, it, expect, vi, beforeEach } from 'vitest'
import { jobPostingService } from '~/services/job-posting'
import { candidateMatchingService } from '~/services/candidate-matching'
import type { CandidateWithSkills, JobPosting } from '~/types/internal'

// Mock the database
vi.mock('~/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([{
            id: 'rec123',
            userId: 'user123',
            organizationName: 'Test Company',
            recruitingFor: 'Engineering',
            timezone: 'UTC'
          }]))
        }))
      }))
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([{
          id: 'job123',
          recruiterId: 'rec123',
          title: 'Senior React Developer',
          rawDescription: 'We are looking for a senior React developer...',
          extractedSkills: [
            { name: 'React', confidence: 0.9, category: 'frontend' },
            { name: 'JavaScript', confidence: 0.8, category: 'programming' }
          ],
          requiredSkills: [
            { name: 'React', proficiency: 'expert', category: 'frontend' },
            { name: 'JavaScript', proficiency: 'expert', category: 'programming' }
          ],
          preferredSkills: [
            { name: 'TypeScript', proficiency: 'expert', category: 'programming' }
          ],
          experienceLevel: 'mid',
          salaryMin: 80000,
          salaryMax: 120000,
          location: null,
          remoteAllowed: false,
          employmentType: 'full-time',
          status: 'active',
          aiConfidenceScore: '0.85',
          createdAt: new Date(),
          updatedAt: new Date()
        }]))
      }))
    }))
  }
}))

// Mock the job analysis service
vi.mock('~/services/job-analysis', () => ({
  jobAnalysisService: {
    analyzeJobPosting: vi.fn(() => Promise.resolve({
      extractedSkills: [
        { name: 'React', confidence: 0.9, category: 'frontend' },
        { name: 'JavaScript', confidence: 0.8, category: 'programming' }
      ],
      requiredSkills: [
        { name: 'React', proficiency: 'expert', category: 'frontend' },
        { name: 'JavaScript', proficiency: 'expert', category: 'programming' }
      ],
      preferredSkills: [
        { name: 'TypeScript', proficiency: 'expert', category: 'programming' }
      ],
      experienceLevel: 'mid',
      salaryRange: { min: 80000, max: 120000 },
      keyTerms: ['remote', 'startup'],
      confidence: 0.85,
      summary: 'Mid-level React developer position'
    }))
  }
}))

describe('Job Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should complete full job posting to matching workflow', async () => {
    // 1. Create job posting
    const jobResult = await jobPostingService.createJobPosting('rec123', {
      title: 'Senior React Developer',
      description: 'We are looking for a senior React developer with TypeScript experience and 5+ years of frontend development experience...'
    })

    expect(jobResult.success).toBe(true)
    expect(jobResult.data?.job.title).toBe('Senior React Developer')
    expect(jobResult.data?.job.requiredSkills).toHaveLength(2)
    expect(jobResult.data?.job.preferredSkills).toHaveLength(1)

    // 2. Test candidate matching
    const candidates: CandidateWithSkills[] = [
      {
        id: 'candidate1',
        name: 'John Doe',
        email: 'john@example.com',
        skills: [
          { name: 'React', proficiency: 'expert', category: 'frontend' },
          { name: 'JavaScript', proficiency: 'expert', category: 'programming' },
          { name: 'TypeScript', proficiency: 'expert', category: 'programming' }
        ]
      },
      {
        id: 'candidate2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        skills: [
          { name: 'React', proficiency: 'expert', category: 'frontend' },
          { name: 'JavaScript', proficiency: 'expert', category: 'programming' }
        ]
      },
      {
        id: 'candidate3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        skills: [
          { name: 'Vue.js', proficiency: 'expert', category: 'frontend' },
          { name: 'Python', proficiency: 'expert', category: 'programming' }
        ]
      }
    ]

    const matches = candidateMatchingService.findMatchingCandidates(
      candidates,
      jobResult.data!.job
    )

    expect(matches).toHaveLength(3)
    
    // John should be the best match (100% required + preferred skills)
    expect(matches[0].candidate.name).toBe('John Doe')
    expect(matches[0].match.score).toBe(100) // 100% required * 0.7 + 100% preferred * 0.3 = 100
    expect(matches[0].match.overallFit).toBe('excellent')
    expect(matches[0].match.matchingSkills).toHaveLength(3)
    expect(matches[0].match.skillGaps).toHaveLength(0)

    // Jane should be second (100% required skills, 0% preferred)
    expect(matches[1].candidate.name).toBe('Jane Smith')
    expect(matches[1].match.score).toBe(70) // 100% required * 0.7 + 0% preferred * 0.3 = 70
    expect(matches[1].match.overallFit).toBe('good')
    expect(matches[1].match.matchingSkills).toHaveLength(2)
    expect(matches[1].match.skillGaps).toHaveLength(0)

    // Bob should be last (0% match)
    expect(matches[2].candidate.name).toBe('Bob Johnson')
    expect(matches[2].match.score).toBe(0)
    expect(matches[2].match.overallFit).toBe('poor')
    expect(matches[2].match.matchingSkills).toHaveLength(0)
    expect(matches[2].match.skillGaps).toHaveLength(2)
  })

  it('should handle job posting creation failure', async () => {
    // Mock recruiter not found
    const { db } = await import('~/db')
    vi.mocked(db.select).mockReturnValueOnce({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])) // No recruiter found
        }))
      }))
    } as any)

    const result = await jobPostingService.createJobPosting('nonexistent-recruiter', {
      title: 'Test Job',
      description: 'Test description'
    })

    expect(result.success).toBe(false)
    expect(result.error).toBe('Recruiter not found')
  })

  it('should handle empty candidate list', async () => {
    const jobResult = await jobPostingService.createJobPosting('rec123', {
      title: 'Test Job',
      description: 'Test description'
    })

    const matches = candidateMatchingService.findMatchingCandidates(
      [], // Empty candidates array
      jobResult.data!.job
    )

    expect(matches).toHaveLength(0)
  })

  it('should handle job with no required skills', async () => {
    const jobResult = await jobPostingService.createJobPosting('rec123', {
      title: 'General Developer',
      description: 'Looking for any developer with any skills'
    })

    // Override the job to have no required skills
    const jobWithNoRequirements: JobPosting = {
      ...jobResult.data!.job,
      requiredSkills: [],
      preferredSkills: [
        { name: 'Python', proficiency: 'expert', category: 'programming' }
      ]
    }

    const candidates: CandidateWithSkills[] = [
      {
        id: 'candidate1',
        name: 'Python Developer',
        email: 'python@example.com',
        skills: [
          { name: 'Python', proficiency: 'expert', category: 'programming' }
        ]
      }
    ]

    const matches = candidateMatchingService.findMatchingCandidates(
      candidates,
      jobWithNoRequirements
    )

    expect(matches).toHaveLength(1)
    expect(matches[0].match.score).toBe(100) // 100% required (empty) * 0.7 + 100% preferred * 0.3 = 100
    expect(matches[0].match.overallFit).toBe('excellent')
  })

  it('should handle fuzzy skill matching in integration', async () => {
    const jobResult = await jobPostingService.createJobPosting('rec123', {
      title: 'JavaScript Developer',
      description: 'Looking for a JavaScript developer'
    })

    // Create a job with fuzzy matching skills
    const jobWithFuzzySkills: JobPosting = {
      id: 'job123',
      recruiterId: 'rec123',
      title: 'JavaScript Developer',
      rawDescription: 'Looking for a JavaScript developer',
      extractedSkills: [],
      requiredSkills: [
        { name: 'JavaScript', proficiency: 'expert', category: 'programming' }
      ],
      preferredSkills: [],
      experienceLevel: 'mid',
      salaryMin: 80000,
      salaryMax: 120000,
      location: null,
      remoteAllowed: false,
      employmentType: 'full-time',
      status: 'active',
      aiConfidenceScore: '0.85',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const candidates: CandidateWithSkills[] = [
      {
        id: 'candidate1',
        name: 'JS Expert',
        email: 'js@example.com',
        skills: [
          { name: 'JavaScript', proficiency: 'expert', category: 'programming' }
        ]
      }
    ]

    const matches = candidateMatchingService.findMatchingCandidates(
      candidates,
      jobWithFuzzySkills
    )

    expect(matches).toHaveLength(1)
    expect(matches[0].match.score).toBe(70) // 100% required * 0.7 + 0% preferred * 0.3 = 70
    expect(matches[0].match.matchingSkills).toHaveLength(1)
  })
})
