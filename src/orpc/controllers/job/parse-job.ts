import { z } from 'zod'

import { publicBase } from '~/orpc/middleware/bases'
import { parseJobPosting } from '~/services/job-posting'

const jobInputSchema = z.object({
  job_url: z.string().url().optional(),
  job_description: z.string().optional(),
}).refine(
  data => data.job_url || data.job_description, 
  { message: 'Either job_url or job_description must be provided' }
)

export default publicBase
  .input(jobInputSchema)
  .handler(async function({ input }) {
    if (input.job_url) {
      const parsedJob = await parseJobPosting(input.job_url)
      return parsedJob
    }

    if (input.job_description) {
      const parsedJob = await parseJobPosting(undefined, input.job_description)
      return parsedJob
    }

    throw new Error('Invalid input')
  })
