import { describe, it, expect, beforeEach } from 'vitest'
import { CandidateMatchingService } from '../candidate-matching'
import type { CandidateWithSkills, JobPosting } from '~/types/internal'

describe('CandidateMatchingService', () => {
  let service: CandidateMatchingService

  beforeEach(() => {
    service = new CandidateMatchingService()
  })

  describe('calculateCandidateMatch', () => {
    it('should calculate high match score for perfect skill match', () => {
      const candidate: CandidateWithSkills = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        skills: [
          { name: 'React', proficiency: 'expert', category: 'frontend' },
          { name: 'JavaScript', proficiency: 'expert', category: 'programming' }
        ]
      }

      const job: JobPosting = {
        id: '1',
        recruiterId: 'rec1',
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

      const result = service.calculateCandidateMatch(candidate, job)

      expect(result.match.score).toBe(70) // 100% required * 0.7 + 0% preferred * 0.3 = 70 (no preferred skills in job)
      expect(result.match.overallFit).toBe('good')
      expect(result.match.matchingSkills).toHaveLength(2)
      expect(result.match.skillGaps).toHaveLength(0)
    })

    it('should identify skill gaps correctly', () => {
      const candidate: CandidateWithSkills = {
        id: '1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        skills: [{ name: 'React', proficiency: 'expert', category: 'frontend' }]
      }

      const job: JobPosting = {
        id: '1',
        recruiterId: 'rec1',
        title: 'Full Stack Developer',
        rawDescription: 'Looking for full stack developer',
        extractedSkills: [],
        requiredSkills: [
          { name: 'React', proficiency: 'expert', category: 'frontend' },
          { name: 'Node.js', proficiency: 'expert', category: 'backend' }
        ],
        preferredSkills: [],
        experienceLevel: 'mid',
        remoteAllowed: true,
        employmentType: 'full-time'
      }

      const result = service.calculateCandidateMatch(candidate, job)

      expect(result.match.score).toBe(35) // 50% required * 0.7 + 0% preferred * 0.3 = 35
      expect(result.match.overallFit).toBe('poor') // 35 < 40, so poor
      expect(result.match.skillGaps).toHaveLength(1)
      expect(result.match.skillGaps[0].name).toBe('Node.js')
    })

    it('should handle fuzzy skill matching', () => {
      const candidate: CandidateWithSkills = {
        id: '1',
        name: 'Bob Smith',
        email: 'bob@example.com',
        skills: [{ name: 'JavaScript', proficiency: 'expert', category: 'programming' }]
      }

      const job: JobPosting = {
        id: '1',
        recruiterId: 'rec1',
        title: 'JS Developer',
        rawDescription: 'Looking for JS developer',
        extractedSkills: [],
        requiredSkills: [{ name: 'javascript', proficiency: 'expert', category: 'programming' }], // Use lowercase for fuzzy matching
        preferredSkills: [],
        experienceLevel: 'mid',
        remoteAllowed: true,
        employmentType: 'full-time'
      }

      const result = service.calculateCandidateMatch(candidate, job)

      expect(result.match.matchingSkills).toHaveLength(1)
      expect(result.match.score).toBe(70) // 100% required * 0.7 + 0% preferred * 0.3 = 70
    })

    it('should handle case-insensitive skill matching', () => {
      const candidate: CandidateWithSkills = {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        skills: [{ name: 'react', proficiency: 'expert', category: 'frontend' }]
      }

      const job: JobPosting = {
        id: '1',
        recruiterId: 'rec1',
        title: 'React Developer',
        rawDescription: 'Looking for React developer',
        extractedSkills: [],
        requiredSkills: [{ name: 'REACT', proficiency: 'expert', category: 'frontend' }],
        preferredSkills: [],
        experienceLevel: 'mid',
        remoteAllowed: true,
        employmentType: 'full-time'
      }

      const result = service.calculateCandidateMatch(candidate, job)

      expect(result.match.matchingSkills).toHaveLength(1)
      expect(result.match.score).toBe(70) // 100% required * 0.7 + 0% preferred * 0.3 = 70
    })

    it('should handle empty required skills', () => {
      const candidate: CandidateWithSkills = {
        id: '1',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        skills: [{ name: 'Python', proficiency: 'expert', category: 'programming' }]
      }

      const job: JobPosting = {
        id: '1',
        recruiterId: 'rec1',
        title: 'General Developer',
        rawDescription: 'Looking for any developer',
        extractedSkills: [],
        requiredSkills: [],
        preferredSkills: [{ name: 'Python', proficiency: 'expert', category: 'programming' }],
        experienceLevel: 'mid',
        remoteAllowed: true,
        employmentType: 'full-time'
      }

      const result = service.calculateCandidateMatch(candidate, job)

      expect(result.match.score).toBe(100) // 100% required (empty) * 0.7 + 100% preferred * 0.3 = 100
      expect(result.match.overallFit).toBe('excellent')
    })

    it('should calculate overall fit categories correctly', () => {
      const candidate: CandidateWithSkills = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        skills: []
      }

      const job: JobPosting = {
        id: '1',
        recruiterId: 'rec1',
        title: 'Test Job',
        rawDescription: 'Test job',
        extractedSkills: [],
        requiredSkills: [
          { name: 'Skill1', proficiency: 'expert', category: 'test' },
          { name: 'Skill2', proficiency: 'expert', category: 'test' },
          { name: 'Skill3', proficiency: 'expert', category: 'test' },
          { name: 'Skill4', proficiency: 'expert', category: 'test' },
          { name: 'Skill5', proficiency: 'expert', category: 'test' }
        ],
        preferredSkills: [],
        experienceLevel: 'mid',
        remoteAllowed: true,
        employmentType: 'full-time'
      }

      // Test different match scenarios
      const testCases = [
        { matchingSkills: 5, expectedFit: 'good' }, // 100% * 0.7 = 70, >= 80? No, so good
        { matchingSkills: 4, expectedFit: 'fair' }, // 80% * 0.7 = 56, >= 60? No, so fair
        { matchingSkills: 3, expectedFit: 'fair' }, // 60% * 0.7 = 42, >= 40? Yes, so fair
        { matchingSkills: 2, expectedFit: 'poor' }, // 40% * 0.7 = 28, >= 40? No, so poor
        { matchingSkills: 1, expectedFit: 'poor' }, // 20% * 0.7 = 14, >= 40? No, so poor
        { matchingSkills: 0, expectedFit: 'poor' } // 0% * 0.7 = 0, >= 40? No, so poor
      ]

      testCases.forEach(({ matchingSkills, expectedFit }) => {
        const testCandidate = {
          ...candidate,
          skills: Array.from({ length: matchingSkills }, (_, i) => ({
            name: `Skill${i + 1}`,
            proficiency: 'expert' as const,
            category: 'test'
          }))
        }

        const result = service.calculateCandidateMatch(testCandidate, job)
        expect(result.match.overallFit).toBe(expectedFit)
      })
    })
  })

  describe('findMatchingCandidates', () => {
    it('should sort candidates by match score', () => {
      const candidates: CandidateWithSkills[] = [
        {
          id: '1',
          name: 'Low Match',
          email: 'low@example.com',
          skills: [{ name: 'Python', proficiency: 'expert', category: 'programming' }]
        },
        {
          id: '2',
          name: 'High Match',
          email: 'high@example.com',
          skills: [
            { name: 'React', proficiency: 'expert', category: 'frontend' },
            { name: 'JavaScript', proficiency: 'expert', category: 'programming' }
          ]
        }
      ]

      const job: JobPosting = {
        id: '1',
        recruiterId: 'rec1',
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

      const results = service.findMatchingCandidates(candidates, job)

      expect(results[0].candidate.name).toBe('High Match')
      expect(results[1].candidate.name).toBe('Low Match')
      expect(results[0].match.score).toBeGreaterThan(results[1].match.score)
    })

    it('should handle empty candidates array', () => {
      const candidates: CandidateWithSkills[] = []
      const job: JobPosting = {
        id: '1',
        recruiterId: 'rec1',
        title: 'Test Job',
        rawDescription: 'Test job',
        extractedSkills: [],
        requiredSkills: [],
        preferredSkills: [],
        experienceLevel: 'mid',
        remoteAllowed: true,
        employmentType: 'full-time'
      }

      const results = service.findMatchingCandidates(candidates, job)
      expect(results).toHaveLength(0)
    })
  })
})
