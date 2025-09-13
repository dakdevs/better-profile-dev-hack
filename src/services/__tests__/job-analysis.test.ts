import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the server config before importing the service
vi.mock('~/config/server-config', () => ({
  serverConfig: {
    ai: {
      openRouterApiKey: 'test-key'
    }
  }
}))

import { JobAnalysisService } from '../job-analysis'

describe('JobAnalysisService', () => {
  let service: JobAnalysisService
  let mockFetch: any

  beforeEach(() => {
    service = new JobAnalysisService()
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  describe('analyzeJobPosting', () => {
    it('should analyze job posting with AI successfully', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              extractedSkills: [{ name: 'JavaScript', confidence: 0.9, category: 'programming' }],
              requiredSkills: [{ name: 'React', required: true, category: 'frontend' }],
              preferredSkills: [{ name: 'TypeScript', required: false, category: 'programming' }],
              experienceLevel: 'mid',
              salaryRange: { min: 80000, max: 120000 },
              keyTerms: ['remote', 'startup'],
              confidence: 0.85,
              summary: 'Mid-level React developer position'
            })
          }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await service.analyzeJobPosting(
        'We are looking for a React developer with JavaScript experience',
        'Frontend Developer'
      )

      expect(result.extractedSkills).toHaveLength(1)
      expect(result.requiredSkills).toHaveLength(1)
      expect(result.confidence).toBe(0.85)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('openrouter.ai'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Bearer')
          })
        })
      )
    })

    it('should fallback to basic analysis when AI fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      const result = await service.analyzeJobPosting('Test job description')

      expect(result.extractedSkills).toEqual([])
      expect(result.confidence).toBe(0.1)
      expect(result.summary).toBe('Basic fallback analysis used.')
    })

    it('should handle invalid AI response gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'invalid json' } }]
        })
      })

      const result = await service.analyzeJobPosting('Test description')
      expect(result.confidence).toBe(0.1) // Should fallback
    })

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized')
      })

      const result = await service.analyzeJobPosting('Test description')
      expect(result.confidence).toBe(0.1) // Should fallback
    })

    it('should handle empty AI response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: {} }]
        })
      })

      const result = await service.analyzeJobPosting('Test description')
      expect(result.confidence).toBe(0.1) // Should fallback
    })
  })

  describe('fallback analysis', () => {
    it('should return basic analysis structure', () => {
      const result = service['fallbackAnalysis']('Test description', 'Test title')

      expect(result).toEqual({
        extractedSkills: [],
        requiredSkills: [],
        preferredSkills: [],
        experienceLevel: 'mid',
        salaryRange: undefined,
        keyTerms: [],
        confidence: 0.1,
        summary: 'Basic fallback analysis used.'
      })
    })
  })
})
