import { db } from '~/db'
import { jobs, type Job } from '~/db/models'

type JobSkill = {
  name: string
  years?: number
  level?: 'beginner' | 'intermediate' | 'expert'
}

type ParsedJob = {
  title: string
  company?: string
  location?: string
  description: string
  skills: JobSkill[]
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
}

/**
 * Parse job posting from URL or raw description
 */
export async function parseJobPosting(url?: string, description?: string): Promise<ParsedJob> {
  // If URL is provided, fetch the content first
  let jobText = description
  if (url) {
    const response = await fetch(url)
    jobText = await response.text()
  }

  if (!jobText) {
    throw new Error('No job description provided')
  }

  // Here you can integrate with vercel/openai to parse the job
  // This is a placeholder implementation
  const parsedJob: ParsedJob = {
    title: 'Software Engineer', // Extract from text
    description: jobText,
    skills: [
      { name: 'TypeScript', level: 'intermediate' },
      { name: 'React' },
      { name: 'Node.js' }
    ],
    // Add other fields as needed
  }

  // Store in database
  await db.insert(jobs).values({
    title: parsedJob.title,
    description: parsedJob.description,
    metadata: parsedJob // Store full parsed data
  })

  return parsedJob
}
