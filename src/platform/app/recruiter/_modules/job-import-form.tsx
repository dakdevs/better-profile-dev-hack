'use client'

import { useState } from 'react'

import { Button } from '~/components/ui/button'

interface JobImportData {
	title: string
	company: string
	location: string
	description: string
	rawDescription: string
	url: string
}

interface JobImportFormProps {
	onJobImported?: (jobData: JobImportData) => void
	onCancel?: () => void
}

export function JobImportForm({ onJobImported, onCancel }: JobImportFormProps) {
	const [url, setUrl] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [importedJob, setImportedJob] = useState<JobImportData | null>(null)

	const handleImport = async () => {
		if (!url.trim()) {
			setError('Please enter a job posting URL')
			return
		}

		// Validate URL format
		try {
			const urlObj = new URL(url)
			if (!urlObj.hostname.includes('greenhouse.io')) {
				setError('Currently only Greenhouse.io job postings are supported')
				return
			}
		} catch {
			setError('Please enter a valid URL')
			return
		}

		setIsLoading(true)
		setError('')
		setImportedJob(null)

		try {
			const response = await fetch(`/api/convert_from_json?url=${encodeURIComponent(url)}`)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
				throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
			}

			const data = await response.json()

			if (!data.text && !data.structured) {
				throw new Error('No job description found')
			}

			let jobData: JobImportData

			// Use structured data if available, otherwise parse text
			if (data.structured && data.structured.title) {
				jobData = {
					title: data.structured.title || 'Untitled Position',
					company: data.structured.company || 'Unknown Company',
					location: data.structured.location || 'Location not specified',
					description: stripHtmlTags(data.structured.content) || data.text,
					rawDescription: data.structured.content || data.text,
					url,
				}
			} else {
				// Fallback to text parsing
				const lines = data.text.split('\n').filter((line) => line.trim())

				let title = ''
				let company = ''
				let location = ''
				let description = ''

				// Extract title (first line)
				if (lines.length > 0) {
					title = lines[0].trim()
				}

				// Extract company and location from header lines
				for (let i = 1; i < Math.min(lines.length, 5); i++) {
					const line = lines[i].trim()
					if (line.startsWith('Company:')) {
						company = line.replace('Company:', '').trim()
					} else if (line.startsWith('Location:')) {
						location = line.replace('Location:', '').trim()
					}
				}

				// The rest is the job description
				const descriptionStartIndex = lines.findIndex(
					(line, index) =>
						index > 0
						&& !line.startsWith('Company:')
						&& !line.startsWith('Location:')
						&& line.length > 10,
				)

				if (descriptionStartIndex > -1) {
					description = lines.slice(descriptionStartIndex).join('\n').trim()
				}

				jobData = {
					title: title || 'Untitled Position',
					company: company || 'Unknown Company',
					location: location || 'Location not specified',
					description: description || data.text,
					rawDescription: data.text,
					url,
				}
			}

			setImportedJob(jobData)
		} catch (err) {
			console.error('Job import error:', err)
			setError(err instanceof Error ? err.message : 'Failed to import job posting')
		} finally {
			setIsLoading(false)
		}
	}

	// Helper function to strip HTML tags
	const stripHtmlTags = (html: string): string => {
		if (!html || typeof html !== 'string') {
			return ''
		}
		return html
			.replace(/<[^>]*>/g, '')
			.replace(/&nbsp;/g, ' ')
			.replace(/&amp;/g, '&')
			.replace(/&lt;/g, '<')
			.replace(/&gt;/g, '>')
			.replace(/&quot;/g, '"')
			.replace(/&#39;/g, "'")
			.replace(/\s+/g, ' ')
			.trim()
	}

	const handleUseJob = () => {
		if (importedJob && onJobImported) {
			onJobImported(importedJob)
		}
	}

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			<h3 className="mb-4 text-lg font-semibold text-black dark:text-white">Import Job Posting</h3>

			<p className="mb-6 text-gray-600 dark:text-gray-400">
				Import job details from a Greenhouse.io job posting URL to automatically populate the job
				form.
			</p>

			<div className="space-y-4">
				<div>
					<label
						htmlFor="job-url"
						className="mb-2 block text-sm font-medium text-black dark:text-white"
					>
						Job Posting URL
					</label>
					<input
						id="job-url"
						type="url"
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://boards.greenhouse.io/company/jobs/123456"
						className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
					/>
				</div>

				<div className="flex gap-3">
					<Button
						onClick={handleImport}
						disabled={isLoading || !url.trim()}
						className="bg-apple-blue text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
					>
						{isLoading ? 'Importing...' : 'Import Job'}
					</Button>

					{onCancel && (
						<Button
							onClick={onCancel}
							variant="secondary"
							className="border border-gray-200 bg-gray-50 text-black hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
						>
							Cancel
						</Button>
					)}
				</div>
			</div>

			{error && (
				<div className="bg-apple-red/10 border-apple-red/20 mt-4 rounded-lg border p-3">
					<p className="text-apple-red text-sm">{error}</p>
				</div>
			)}

			{importedJob && (
				<div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
					<h4 className="mb-3 text-sm font-medium text-black dark:text-white">
						Imported Job Details:
					</h4>

					<div className="space-y-2 text-sm">
						<div>
							<span className="font-medium text-gray-700 dark:text-gray-300">Title:</span>
							<span className="ml-2 text-gray-600 dark:text-gray-400">{importedJob.title}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700 dark:text-gray-300">Company:</span>
							<span className="ml-2 text-gray-600 dark:text-gray-400">{importedJob.company}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700 dark:text-gray-300">Location:</span>
							<span className="ml-2 text-gray-600 dark:text-gray-400">{importedJob.location}</span>
						</div>
						<div>
							<span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
							<div className="mt-1 max-h-32 overflow-y-auto rounded border border-gray-200 bg-white p-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-black dark:text-gray-400">
								{importedJob.description.substring(0, 300)}
								{importedJob.description.length > 300 && '...'}
							</div>
						</div>
					</div>

					<div className="mt-4 flex gap-2">
						<Button
							onClick={handleUseJob}
							className="bg-apple-green text-white hover:bg-green-600"
						>
							Use This Job
						</Button>
						<Button
							onClick={() => setImportedJob(null)}
							variant="secondary"
							className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
						>
							Try Again
						</Button>
					</div>
				</div>
			)}

			<div className="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
				<h4 className="mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
					Supported Platforms:
				</h4>
				<ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
					<li>• Greenhouse.io job postings</li>
					<li>• More platforms coming soon...</li>
				</ul>
			</div>
		</div>
	)
}
