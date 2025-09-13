import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the server config before importing
vi.mock('~/config/server-config', () => ({
  serverConfig: {
    app: {
      isDevelopment: true
    },
    ai: {
      openRouterApiKey: 'test-key'
    },
    cal: {
      apiKey: 'test-cal-key'
    },
    db: {
      url: 'postgresql://test:test@localhost:5432/test'
    },
    auth: {
      google: {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret'
      }
    },
    betterAuth: {
      secret: 'test-secret'
    }
  }
}))

import { matching } from '../../recruiter/matching'
import { jobPostingService } from '~/services/job-posting'
import { candidateMatchingService } from '~/services/candidate-matching'

// Mock the services
vi.mock('~/services/job-posting', () => ({
  jobPostingService: {
    getJobPosting: vi.fn()
  }
}))

vi.mock('~/services/candidate-matching', () => ({
  candidateMatchingService: {
    findMatchingCandidates: vi.fn()
  }
}))

describe('Matching Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findMatches', () => {
    it('should find matching candidates successfully', async () => {
      const mockInput = {
        jobPostingId: 'job123',
        minMatchScore: 70,
        page: 1,
        limit: 10
      }

      const mockJobPosting = {
        id: 'job123',
        recruiterId: 'recruiter123',
        title: 'React Developer',
        rawDescription: 'Looking for React developer',
        extractedSkills: [],
        requiredSkills: [
          { name: 'React', proficiency: 'expert', category: 'frontend' },
          { name: 'JavaScript', proficiency: 'expert', category: 'programming' }
        ],
        preferredSkills: [],
        experienceLevel: 'mid',
        remoteAllowed: true,
        employmentType: 'full-time'
      }

      const mockJobResponse = {
        success: true,
        data: { job: mockJobPosting }
      }

      const mockMatches = [
        {
          candidate: {
            id: 'candidate1',
            name: 'John Doe',
            email: 'john@example.com',
            skills: [
              { name: 'React', proficiency: 'expert', category: 'frontend' },
              { name: 'JavaScript', proficiency: 'expert', category: 'programming' }
            ]
          },
          match: {
            score: 95,
            matchingSkills: [
              { name: 'React', proficiency: 'expert', category: 'frontend' },
              { name: 'JavaScript', proficiency: 'expert', category: 'programming' }
            ],
            skillGaps: [],
            overallFit: 'excellent',
            availability: []
          }
        }
      ]

      vi.mocked(jobPostingService.getJobPosting).mockResolvedValueOnce(mockJobResponse)
      vi.mocked(candidateMatchingService.findMatchingCandidates).mockReturnValueOnce(mockMatches)

      const mockContext = {
        auth: { user: { id: 'recruiter123' } }
      }

      const result = await matching.findMatches['~orpc'].handler({
        input: mockInput,
        context: mockContext
      })

      expect(jobPostingService.getJobPosting).toHaveBeenCalledWith('job123')
      expect(candidateMatchingService.findMatchingCandidates).toHaveBeenCalledWith([], mockJobPosting)
      expect(result).toEqual(mockMatches)
    })

    it('should throw error when user is not authenticated', async () => {
      const mockInput = {
        jobPostingId: 'job123'
      }

      const mockContext = {
        auth: { user: { id: undefined } }
      }

      await expect(
        matching.findMatches['~orpc'].handler({
          input: mockInput,
          context: mockContext
        })
      ).rejects.toThrow('User not authenticated')
    })

    it('should throw error when job posting not found', async () => {
      const mockInput = {
        jobPostingId: 'nonexistent-job'
      }

      const mockJobResponse = {
        success: false,
        error: 'Job posting not found'
      }

      vi.mocked(jobPostingService.getJobPosting).mockResolvedValueOnce(mockJobResponse)

      const mockContext = {
        auth: { user: { id: 'recruiter123' } }
      }

      await expect(
        matching.findMatches['~orpc'].handler({
          input: mockInput,
          context: mockContext
        })
      ).rejects.toThrow('Job posting not found')
    })

    it('should throw error when job posting service fails', async () => {
      const mockInput = {
        jobPostingId: 'job123'
      }

      vi.mocked(jobPostingService.getJobPosting).mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      const mockContext = {
        auth: { user: { id: 'recruiter123' } }
      }

      await expect(
        matching.findMatches['~orpc'].handler({
          input: mockInput,
          context: mockContext
        })
      ).rejects.toThrow('Database connection failed')
    })

    it('should handle job posting with no data', async () => {
      const mockInput = {
        jobPostingId: 'job123'
      }

      const mockJobResponse = {
        success: true,
        data: undefined
      }

      vi.mocked(jobPostingService.getJobPosting).mockResolvedValueOnce(mockJobResponse)

      const mockContext = {
        auth: { user: { id: 'recruiter123' } }
      }

      await expect(
        matching.findMatches['~orpc'].handler({
          input: mockInput,
          context: mockContext
        })
      ).rejects.toThrow('Job posting not found or you do not have permission to view it')
    })

    it('should validate input requirements', async () => {
      const invalidInput = {
        jobPostingId: '', // Empty job posting ID should fail
        minMatchScore: -10, // Invalid score
        page: 0, // Invalid page
        limit: -5 // Invalid limit
      }

      const mockContext = {
        auth: { user: { id: 'recruiter123' } }
      }

      await expect(
        matching.findMatches['~orpc'].handler({
          input: invalidInput,
          context: mockContext
        })
      ).rejects.toThrow()
    })

    it('should handle optional parameters correctly', async () => {
      const mockInput = {
        jobPostingId: 'job123'
        // No optional parameters
      }

      const mockJobPosting = {
        id: 'job123',
        recruiterId: 'recruiter123',
        title: 'React Developer',
        rawDescription: 'Looking for React developer',
        extractedSkills: [],
        requiredSkills: [],
        preferredSkills: [],
        experienceLevel: 'mid',
        remoteAllowed: true,
        employmentType: 'full-time'
      }

      const mockJobResponse = {
        success: true,
        data: { job: mockJobPosting }
      }

      const mockMatches = []

      vi.mocked(jobPostingService.getJobPosting).mockResolvedValueOnce(mockJobResponse)
      vi.mocked(candidateMatchingService.findMatchingCandidates).mockReturnValueOnce(mockMatches)

      const mockContext = {
        auth: { user: { id: 'recruiter123' } }
      }

      const result = await matching.findMatches['~orpc'].handler({
        input: mockInput,
        context: mockContext
      })

      expect(result).toEqual(mockMatches)
    })

    it('should handle matching service returning empty results', async () => {
      const mockInput = {
        jobPostingId: 'job123'
      }

      const mockJobPosting = {
        id: 'job123',
        recruiterId: 'recruiter123',
        title: 'React Developer',
        rawDescription: 'Looking for React developer',
        extractedSkills: [],
        requiredSkills: [],
        preferredSkills: [],
        experienceLevel: 'mid',
        remoteAllowed: true,
        employmentType: 'full-time'
      }

      const mockJobResponse = {
        success: true,
        data: { job: mockJobPosting }
      }

      vi.mocked(jobPostingService.getJobPosting).mockResolvedValueOnce(mockJobResponse)
      vi.mocked(candidateMatchingService.findMatchingCandidates).mockReturnValueOnce([])

      const mockContext = {
        auth: { user: { id: 'recruiter123' } }
      }

      const result = await matching.findMatches['~orpc'].handler({
        input: mockInput,
        context: mockContext
      })

      expect(result).toEqual([])
    })
  })
})
