export type Job = {
  title: string
  company?: string
  location?: string
  description: string
  skills: {
    name: string
    years?: number
    level?: 'beginner' | 'intermediate' | 'expert'
  }[]
  salaryRange?: {
    min?: number
    max?: number
    currency?: string
  }
  employmentType?: string
  experienceLevel?: string
  requirements?: string[]
  responsibilities?: string[]
  benefits?: string[]
  metadata?: Record<string, any>
}
