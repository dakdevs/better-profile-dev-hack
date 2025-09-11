import { convert } from 'html-to-text'
import { z } from 'zod'

import { protectedBase } from '~/orpc/middleware/bases'
import { jobPostingService } from '~/services/job-posting'

// Define explicit types for Greenhouse API response
interface GreenhouseLocation {
	name: string
}

interface GreenhouseJob {
	content?: string
	description?: string
	job_description?: string
	title?: string
	location?: GreenhouseLocation
	company?: string
	company_name?: string
}

// --- Helper functions for URL importing ---
function turnUrlToJsonUrl(url: string): string {
	if (!url.includes('greenhouse.io')) {
		throw new Error('Only Greenhouse.io URLs are supported')
	}
	const regex = /greenhouse\.io\/([^/]+)\/jobs\/(\d+)|greenhouse\.io\/jobs\/(\d+)/
	const match = url.match(regex)
	if (!match) {
		throw new Error('Could not parse the company name or job ID from the Greenhouse URL.')
	}
	const companyName = match[1] || 'greenhouse'
	const jobId = match[2] || match[3]
	return `https://boards-api.greenhouse.io/v1/boards/${companyName}/jobs/${jobId}?questions=true`
}

function stripHtmlTags(html: string): string {
	if (!html || typeof html !== 'string') return ''
	//first pass
	const basicText = convert(html, {
		wordwrap: false,
		preserveNewlines: false,
		selectors: [
			{ selector: 'script', format: 'skip' },
			{ selector: 'style', format: 'skip' },
			{ selector: 'noscript', format: 'skip' },
			{ selector: 'iframe', format: 'skip' },
			{ selector: 'object', format: 'skip' },
			{ selector: 'embed', format: 'skip' },
			{ selector: 'h1', format: 'block', options: { leadingLineBreaks: 2, trailingLineBreaks: 1 } },
			{ selector: 'h2', format: 'block', options: { leadingLineBreaks: 2, trailingLineBreaks: 1 } },
			{ selector: 'h3', format: 'block', options: { leadingLineBreaks: 2, trailingLineBreaks: 1 } },
			{ selector: 'h4', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{ selector: 'h5', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{ selector: 'h6', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{ selector: 'p', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{
				selector: 'div',
				format: 'block',
				options: { leadingLineBreaks: 1, trailingLineBreaks: 1 },
			},
			{ selector: 'br', format: 'lineBreak' },
			{ selector: 'ul', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{ selector: 'ol', format: 'block', options: { leadingLineBreaks: 1, trailingLineBreaks: 1 } },
			{
				selector: 'li',
				format: 'block',
				options: { itemPrefix: '• ', leadingLineBreaks: 0, trailingLineBreaks: 0 },
			},
			{ selector: 'strong', format: 'inline' },
			{ selector: 'b', format: 'inline' },
			{ selector: 'em', format: 'inline' },
			{ selector: 'i', format: 'inline' },
			{ selector: 'span', format: 'inline' },
			{ selector: 'a', format: 'inline' },
			{ selector: 'code', format: 'inline' },
			{ selector: 'kbd', format: 'inline' },
			{ selector: 'samp', format: 'inline' },
			{ selector: 'var', format: 'inline' },
			{ selector: 'mark', format: 'inline' },
			{ selector: 'small', format: 'inline' },
			{ selector: 'sub', format: 'inline' },
			{ selector: 'sup', format: 'inline' },
		],
	})

	// Second pass
	let cleanText = basicText
	for (let i = 0; i < 5; i++) {
		cleanText = cleanText.replace(/<[^>]*>/g, '')
	}

	// Remove HTML entities
	cleanText = cleanText
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&#x27;/g, "'")
		.replace(/&apos;/g, "'")
		.replace(/&hellip;/g, '...')
		.replace(/&mdash;/g, '—')
		.replace(/&ndash;/g, '–')
		.replace(/&rsquo;/g, "'")
		.replace(/&lsquo;/g, "'")
		.replace(/&rdquo;/g, '"')
		.replace(/&ldquo;/g, '"')
		.replace(/&copy;/g, '©')
		.replace(/&reg;/g, '®')
		.replace(/&trade;/g, '™')
		.replace(/&deg;/g, '°')
		.replace(/&plusmn;/g, '±')
		.replace(/&times;/g, '×')
		.replace(/&divide;/g, '÷')

	cleanText = cleanText.replace(/&#\d+;/g, '')
	cleanText = cleanText.replace(/&#x[0-9a-fA-F]+;/g, '')

	// Third pass
	cleanText = cleanText
		.replace(/\r\n/g, '\n')
		.replace(/\r/g, '\n')
		.replace(/\n{3,}/g, '\n\n')
		.replace(/[ \t]{2,}/g, ' ')
		.replace(/^\s+|\s+$/gm, '')
		.replace(/\n\s*\n/g, '\n\n')
		.trim()

	return cleanText
}

// FIX: Properly type the data parameter to resolve no-unsafe-assignment
function extractAndClean(data: GreenhouseJob): string {
	const htmlToConvert = data.content ?? data.description ?? data.job_description ?? ''
	if (!htmlToConvert) {
		return ''
	}
	const descriptionText = stripHtmlTags(htmlToConvert)
	const title = data.title ?? ''
	const location = data.location?.name ?? ''
	const company = data.company ?? data.company_name ?? ''
	const header = [
		title,
		company ? `Company: ${company}` : '',
		location ? `Location: ${location}` : '',
	]
		.filter(Boolean)
		.join('\n')
	return `${header}\n\n${descriptionText}`.trim()
}

export const jobs = {
	create: protectedBase
		.input(
			z.object({
				title: z.string().min(1, 'Title is required'),
				description: z.string().min(50, 'Description must be at least 50 characters'),
				remoteAllowed: z.boolean().optional(),
				employmentType: z.string().optional(),
				location: z.string().optional(),
				salaryMin: z.number().optional(),
				salaryMax: z.number().optional(),
			}),
		)
		.handler(async function ({ input, ctx }) {
			const user = ctx.user as { id: string } | undefined
			if (!user?.id) throw new Error('User not authenticated')
			const recruiterId = user.id
			const result = await jobPostingService.createJobPosting(recruiterId, input)
			if (!result.success) {
				throw new Error(result.error ?? 'Failed to create job posting')
			}
			return result.data
		}),

	importFromURL: protectedBase
		.input(
			z.object({
				url: z.string().url('Invalid URL format'),
			}),
		)
		.handler(async function ({ input }) {
			try {
				const urlToFetch = turnUrlToJsonUrl(input.url)
				const response = await fetch(urlToFetch, {
					headers: { 'User-Agent': 'Mozilla/5.0 (RecruiterApp/1.0)' },
				})
				if (!response.ok) {
					throw new Error(`Failed to fetch from Greenhouse: ${response.statusText}`)
				}
				// FIX: Add type assertion for response data
				const data = (await response.json()) as GreenhouseJob
				const extractedContent = extractAndClean(data)
				if (!extractedContent) {
					throw new Error('Could not extract meaningful content from the URL.')
				}
				return {
					text: extractedContent,
					structured: {
						title: data.title ?? '',
						location: data.location?.name ?? '',
						content: data.content ?? '',
					},
				}
			} catch (error) {
				// FIX: Handle error message safely
				const message = error instanceof Error ? error.message : 'An unknown error occurred'
				console.error('[orpc/importFromURL] Error:', message)
				throw new Error(message)
			}
		}),
}
