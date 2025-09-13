import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InterviewRAGAgent } from '../rag-agent'

// Mock the database and embedding utilities
vi.mock('~/db', () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([
              { content: 'Previous interview about React', similarity: 0.85 },
              { content: 'Discussion about JavaScript skills', similarity: 0.78 }
            ]))
          }))
        }))
      }))
    }))
  }
}))

vi.mock('~/utils/embeddings', () => ({
  embedOne: vi.fn(() => Promise.resolve([0.1, 0.2, 0.3, 0.4, 0.5]))
}))

describe('InterviewRAGAgent', () => {
  let agent: InterviewRAGAgent
  let mockFetch: any

  beforeEach(() => {
    agent = new InterviewRAGAgent()
    mockFetch = vi.fn()
    global.fetch = mockFetch
  })

  describe('processQuery', () => {
    it('should process relevant query and return enhanced prompt', async () => {
      // Mock relevance check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'YES' } }]
        })
      })

      const result = await agent.processQuery(
        'Tell me about your React experience',
        'user123'
      )

      expect(result.isRelevant).toBe(true)
      expect(result.enhancedPrompt).toContain('Tell me about your React experience')
      expect(result.enhancedPrompt).toContain('Previous conversation context')
    })

    it('should block off-topic queries', async () => {
      // Mock relevance check to return NO
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'NO' } }]
        })
      })

      const result = await agent.processQuery(
        'What is the weather like today?',
        'user123'
      )

      expect(result.isRelevant).toBe(false)
      expect(result.response).toContain("Let's stay focused on the interview")
    })

    it('should handle API failures gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'))

      const result = await agent.processQuery(
        'Tell me about your experience',
        'user123'
      )

      // Should default to relevant when API fails
      expect(result.isRelevant).toBe(true)
    })

    it('should handle timeout in relevance check', async () => {
      // Mock a timeout scenario
      mockFetch.mockImplementationOnce(() => 
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100)
        })
      )

      const result = await agent.processQuery(
        'Tell me about your experience',
        'user123'
      )

      // Should default to relevant when timeout occurs
      expect(result.isRelevant).toBe(true)
    })

    it('should handle malformed API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'MAYBE' } }] // Invalid response
        })
      })

      const result = await agent.processQuery(
        'Tell me about your experience',
        'user123'
      )

      // Should default to not relevant for invalid responses
      expect(result.isRelevant).toBe(false)
    })

    it('should handle empty API response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: []
        })
      })

      const result = await agent.processQuery(
        'Tell me about your experience',
        'user123'
      )

      // Should default to not relevant for empty responses
      expect(result.isRelevant).toBe(false)
    })
  })

  describe('checkRelevance', () => {
    it('should return true for relevant queries', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'YES' } }]
        })
      })

      const result = await agent['checkRelevance']('Tell me about your React skills')
      expect(result.isRelevant).toBe(true)
    })

    it('should return false for irrelevant queries', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'NO' } }]
        })
      })

      const result = await agent['checkRelevance']('What is the weather?')
      expect(result.isRelevant).toBe(false)
    })

    it('should handle case-insensitive responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'yes' } }] // lowercase
        })
      })

      const result = await agent['checkRelevance']('Tell me about your skills')
      expect(result.isRelevant).toBe(true)
    })

    it('should default to relevant on API error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await agent['checkRelevance']('Any query')
      expect(result.isRelevant).toBe(true)
    })

    it('should default to relevant on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const result = await agent['checkRelevance']('Any query')
      expect(result.isRelevant).toBe(true)
    })
  })

  describe('getRelevantContext', () => {
    it('should retrieve and return relevant context', async () => {
      const result = await agent['getRelevantContext']('Tell me about React', 'user123')

      expect(result).toHaveLength(2)
      expect(result[0]).toBe('Previous interview about React')
      expect(result[1]).toBe('Discussion about JavaScript skills')
    })

    it('should handle embedding generation failure', async () => {
      const { embedOne } = await import('~/utils/embeddings')
      vi.mocked(embedOne).mockResolvedValueOnce([])

      const result = await agent['getRelevantContext']('Test query', 'user123')

      expect(result).toEqual([])
    })

    it('should handle database query failure', async () => {
      const { db } = await import('~/db')
      vi.mocked(db.select).mockImplementationOnce(() => {
        throw new Error('Database error')
      })

      const result = await agent['getRelevantContext']('Test query', 'user123')

      expect(result).toEqual([])
    })
  })

  describe('createEnhancedPrompt', () => {
    it('should create prompt with context', () => {
      const context = [
        'Previous discussion about React',
        'Talked about JavaScript experience'
      ]
      const userQuery = 'Tell me more about your frontend skills'

      const result = agent['createEnhancedPrompt'](userQuery, context)

      expect(result).toContain('Previous conversation context')
      expect(result).toContain('Previous discussion about React')
      expect(result).toContain('Talked about JavaScript experience')
      expect(result).toContain('Tell me more about your frontend skills')
    })

    it('should create prompt without context', () => {
      const context: string[] = []
      const userQuery = 'Tell me about yourself'

      const result = agent['createEnhancedPrompt'](userQuery, context)

      expect(result).not.toContain('Previous conversation context')
      expect(result).toContain('Tell me about yourself')
    })

    it('should handle multiple context pieces', () => {
      const context = [
        'First context piece',
        'Second context piece',
        'Third context piece'
      ]
      const userQuery = 'Current question'

      const result = agent['createEnhancedPrompt'](userQuery, context)

      expect(result).toContain('First context piece')
      expect(result).toContain('Second context piece')
      expect(result).toContain('Third context piece')
      expect(result).toContain('---') // Separator between context pieces
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete workflow for relevant query', async () => {
      // Mock relevance check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'YES' } }]
        })
      })

      const result = await agent.processQuery(
        'What are your strongest technical skills?',
        'user123'
      )

      expect(result.isRelevant).toBe(true)
      expect(result.enhancedPrompt).toBeDefined()
      expect(result.response).toBeUndefined()
    })

    it('should handle complete workflow for irrelevant query', async () => {
      // Mock relevance check
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          choices: [{ message: { content: 'NO' } }]
        })
      })

      const result = await agent.processQuery(
        'How do I cook pasta?',
        'user123'
      )

      expect(result.isRelevant).toBe(false)
      expect(result.response).toContain("Let's stay focused on the interview")
      expect(result.enhancedPrompt).toBeUndefined()
    })

    it('should handle network failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const result = await agent.processQuery(
        'Tell me about your experience',
        'user123'
      )

      // Should default to relevant and continue processing
      expect(result.isRelevant).toBe(true)
      expect(result.enhancedPrompt).toBeDefined()
    })
  })
})
