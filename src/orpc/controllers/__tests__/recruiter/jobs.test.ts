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

import { jobs } from '../../recruiter/jobs'
import { jobPostingService } from '~/services/job-posting'

// Debug logging removed

// Mock the service
vi.mock('~/services/job-posting', () => ({
  jobPostingService: {
    createJobPosting: vi.fn()
  }
}))

describe('Jobs Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('create', () => {
    it('should create job posting successfully', async () => {
      const mockInput = {
        title: 'React Developer',
        description: 'We are looking for a skilled React developer with 3+ years of experience in building modern web applications...',
        remoteAllowed: true,
        employmentType: 'full-time',
        location: 'San Francisco',
        salaryMin: 80000,
        salaryMax: 120000
      }

      const mockResult = {
        success: true,
        data: {
          job: {
            id: 'job123',
            title: 'React Developer',
            recruiterId: 'recruiter123',
            rawDescription: mockInput.description,
            extractedSkills: [],
            requiredSkills: [],
            preferredSkills: [],
            experienceLevel: 'mid',
            salaryMin: 80000,
            salaryMax: 120000,
            location: 'San Francisco',
            remoteAllowed: true,
            employmentType: 'full-time',
            status: 'active',
            aiConfidenceScore: '0.85'
          },
          analysis: {
            extractedSkills: [],
            requiredSkills: [],
            preferredSkills: [],
            confidence: 0.85
          }
        }
      }

      vi.mocked(jobPostingService.createJobPosting).mockResolvedValueOnce(mockResult)

      const mockContext = {
        user: { id: 'recruiter123' }
      }

      const result = await jobs.create['~orpc'].handler({
        input: mockInput,
        ctx: mockContext
      })

      expect(jobPostingService.createJobPosting).toHaveBeenCalledWith(
        'recruiter123',
        mockInput
      )
      expect(result).toEqual(mockResult.data)
    })

    it('should throw error when service fails', async () => {
      const mockInput = {
        title: 'React Developer',
        description: 'We are looking for a skilled React developer with 3+ years of experience...'
      }

      vi.mocked(jobPostingService.createJobPosting).mockResolvedValueOnce({
        success: false,
        error: 'Job posting creation failed'
      })

      const mockContext = {
        user: { id: 'recruiter123' }
      }

      await expect(
        jobs.create['~orpc'].handler({
          input: mockInput,
          ctx: mockContext
        })
      ).rejects.toThrow('Job posting creation failed')
    })

    it('should throw error when user is not authenticated', async () => {
      const mockInput = {
        title: 'React Developer',
        description: 'We are looking for a skilled React developer with 3+ years of experience...'
      }

      const mockContext = {
        user: undefined
      }

      await expect(
        jobs.create['~orpc'].handler({
          input: mockInput,
          ctx: mockContext
        })
      ).rejects.toThrow('User not authenticated')
    })

    it('should validate input requirements', async () => {
      const invalidInput = {
        title: '', // Empty title should fail
        description: 'Short' // Too short description
      }

      const mockContext = {
        user: { id: 'recruiter123' }
      }

      await expect(
        jobs.create['~orpc'].handler({
          input: invalidInput,
          ctx: mockContext
        })
      ).rejects.toThrow()
    })

    it('should handle service throwing error', async () => {
      const mockInput = {
        title: 'React Developer',
        description: 'We are looking for a skilled React developer with 3+ years of experience...'
      }

      vi.mocked(jobPostingService.createJobPosting).mockRejectedValueOnce(
        new Error('Database connection failed')
      )

      const mockContext = {
        user: { id: 'recruiter123' }
      }

      await expect(
        jobs.create['~orpc'].handler({
          input: mockInput,
          ctx: mockContext
        })
      ).rejects.toThrow('Database connection failed')
    })
  })

  describe('importFromURL', () => {
    beforeEach(() => {
      // Reset fetch mock
      global.fetch = vi.fn()
    })

    it('should import job from Greenhouse URL successfully', async () => {
      const mockInput = {
        url: 'https://boards.greenhouse.io/company/jobs/123456'
      }

      const mockGreenhouseResponse = {
        title: 'Senior React Developer',
        location: { name: 'San Francisco, CA' },
        content: '<p>We are looking for a senior React developer with 5+ years of experience...</p>'
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGreenhouseResponse)
      })

      const result = await jobs.importFromURL['~orpc'].handler({
        input: mockInput
      })

      expect(result.text).toContain('Senior React Developer')
      expect(result.structured.title).toBe('Senior React Developer')
      expect(result.structured.location).toBe('San Francisco, CA')
      expect(result.structured.content).toBe('<p>We are looking for a senior React developer with 5+ years of experience...</p>')
    })

    it('should throw error for invalid URL', async () => {
      const mockInput = {
        url: 'https://invalid-url.com/jobs/123'
      }

      await expect(
        jobs.importFromURL['~orpc'].handler({
          input: mockInput
        })
      ).rejects.toThrow('Only Greenhouse.io URLs are supported')
    })

    it('should throw error for malformed Greenhouse URL', async () => {
      const mockInput = {
        url: 'https://boards.greenhouse.io/invalid-url'
      }

      await expect(
        jobs.importFromURL['~orpc'].handler({
          input: mockInput
        })
      ).rejects.toThrow('Could not parse the company name or job ID from the Greenhouse URL')
    })

    it('should handle fetch failure', async () => {
      const mockInput = {
        url: 'https://boards.greenhouse.io/company/jobs/123456'
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found'
      })

      await expect(
        jobs.importFromURL['~orpc'].handler({
          input: mockInput
        })
      ).rejects.toThrow('Failed to fetch from Greenhouse: Not Found')
    })

    it('should handle network error', async () => {
      const mockInput = {
        url: 'https://boards.greenhouse.io/company/jobs/123456'
      }

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(
        jobs.importFromURL['~orpc'].handler({
          input: mockInput
        })
      ).rejects.toThrow('Network error')
    })

    it('should handle empty response content', async () => {
      const mockInput = {
        url: 'https://boards.greenhouse.io/company/jobs/123456'
      }

      const mockGreenhouseResponse = {
        title: '',
        location: null,
        content: ''
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGreenhouseResponse)
      })

      await expect(
        jobs.importFromURL['~orpc'].handler({
          input: mockInput
        })
      ).rejects.toThrow('Could not extract meaningful content from the URL')
    })

    it('should handle different Greenhouse URL formats', async () => {
      const testCases = [
        {
          url: 'https://boards.greenhouse.io/company/jobs/123456',
          expectedCompany: 'company',
          expectedJobId: '123456'
        },
        {
          url: 'https://boards.greenhouse.io/jobs/789012',
          expectedCompany: 'greenhouse',
          expectedJobId: '789012'
        }
      ]

      for (const testCase of testCases) {
        const mockGreenhouseResponse = {
          title: 'Test Job',
          location: { name: 'Test Location' },
          content: '<p>Test content</p>'
        }

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockGreenhouseResponse)
        })

        const result = await jobs.importFromURL['~orpc'].handler({
          input: { url: testCase.url }
        })

        expect(result.structured.title).toBe('Test Job')
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining(`boards/${testCase.expectedCompany}/jobs/${testCase.expectedJobId}`),
          expect.objectContaining({
            headers: { 'User-Agent': 'Mozilla/5.0 (RecruiterApp/1.0)' }
          })
        )
      }
    })
  })
})
