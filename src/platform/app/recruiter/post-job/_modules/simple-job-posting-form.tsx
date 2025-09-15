'use client'

import { useState } from 'react'

import { secureApiRequest, useCSRFToken } from '~/hooks/use-csrf-token'
import { CreateJobPostingRequest, JobAnalysisResult } from '~/types/interview-management'

interface SimpleJobPostingFormProps {
	onSuccess: (result: any) => void
}

export function SimpleJobPostingForm({ onSuccess }: SimpleJobPostingFormProps) {
	const [jobPosting, setJobPosting] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [debugInfo, setDebugInfo] = useState<string | null>(null)

	// URL import states
	const [importUrl, setImportUrl] = useState('')
	const [isImporting, setIsImporting] = useState(false)
	const [importError, setImportError] = useState<string | null>(null)

	// Initialize CSRF token
	const csrfToken = useCSRFToken()

	const checkStatus = async () => {
		try {
			const response = await fetch('/api/recruiter/profile')
			const data = await response.json()

			setDebugInfo(
				`Status: ${response.status}, Auth: ${response.ok ? 'OK' : 'Failed'}, Profile: ${data.success ? 'Exists' : 'Missing'}, Error: ${data.error || 'None'}`,
			)

			// If profile is missing, show helpful error
			if (response.status === 404) {
				setError(
					'You need to create a recruiter profile before posting jobs. Please set up your profile first.',
				)
			}
		} catch (err) {
			setDebugInfo(`Error checking status: ${err instanceof Error ? err.message : 'Unknown'}`)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		console.log('[SIMPLE-JOB-FORM] handleSubmit called')
		e.preventDefault()

		if (!jobPosting.trim()) {
			console.log('[SIMPLE-JOB-FORM] Error: Empty job posting')
			setError('Please enter a job posting')
			return
		}

		if (jobPosting.trim().length < 50) {
			setError('Job posting must be at least 50 characters long')
			return
		}

		setIsLoading(true)
		setError(null)

		// Wait for CSRF token to be available
		if (!csrfToken) {
			setError('Security token not ready. Please wait a moment and try again.')
			setIsLoading(false)
			return
		}

		try {
			// Extract a basic title from the first line or first few words
			const lines = jobPosting.trim().split('\n')
			const firstLine = lines[0].trim()
			const title = firstLine.length > 100 ? firstLine.substring(0, 100) + '...' : firstLine

			const jobData: CreateJobPostingRequest = {
				title: title || 'Job Posting',
				description: jobPosting.trim(),
				remoteAllowed: false,
				employmentType: 'full-time',
			}

			console.log('[SIMPLE-JOB-FORM] Submitting job data:', jobData)
			console.log('[SIMPLE-JOB-FORM] CSRF token available:', !!csrfToken)

			const response = await secureApiRequest('/api/recruiter/jobs', {
				method: 'POST',
				body: JSON.stringify(jobData),
			})

			console.log('[SIMPLE-JOB-FORM] Response status:', response.status)
			console.log(
				'[SIMPLE-JOB-FORM] Response headers:',
				Object.fromEntries(response.headers.entries()),
			)

			if (!response.ok) {
				let errorMessage = 'Failed to create job posting'
				let errorData = null

				try {
					const responseText = await response.text()
					console.log('[SIMPLE-JOB-FORM] Error response text:', responseText)
					console.log('[SIMPLE-JOB-FORM] Response status:', response.status)
					console.log('[SIMPLE-JOB-FORM] Response status text:', response.statusText)

					if (responseText) {
						try {
							errorData = JSON.parse(responseText)
							console.log('[SIMPLE-JOB-FORM] Parsed error data:', errorData)
							errorMessage = errorData.error || errorData.message || errorMessage
						} catch (jsonError) {
							console.log('[SIMPLE-JOB-FORM] Response is not JSON:', jsonError)
							errorMessage =
								responseText || `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`
						}
					} else {
						errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`
					}
				} catch (parseError) {
					console.log('[SIMPLE-JOB-FORM] Error reading response:', parseError)
					errorMessage = `HTTP ${response.status}: ${response.statusText || 'Unknown error'}`
				}

				console.log('[SIMPLE-JOB-FORM] Final error message:', errorMessage)
				console.log('[SIMPLE-JOB-FORM] Error message type:', typeof errorMessage)

				// Handle object errors properly
				if (typeof errorMessage === 'object') {
					const errorObj = errorMessage as any
					errorMessage = errorObj.message || errorObj.error || 'Server error occurred'
				}

				// Provide more specific error messages
				if (String(errorMessage).includes('AI analysis')) {
					errorMessage =
						'AI analysis failed. The job posting was not created. Please try again or contact support if the issue persists.'
				} else if (String(errorMessage).includes('Database')) {
					errorMessage = 'Database error occurred. Please try again.'
				} else if (String(errorMessage).includes('Network')) {
					errorMessage = 'Network error. Please check your connection and try again.'
				}

				throw new Error(String(errorMessage))
			}

			const result = await response.json()
			console.log('[SIMPLE-JOB-FORM] API response result:', result)
			console.log('[SIMPLE-JOB-FORM] result.data:', result.data)
			console.log('[SIMPLE-JOB-FORM] result.data type:', typeof result.data)
			console.log(
				'[SIMPLE-JOB-FORM] result.data keys:',
				result.data ? Object.keys(result.data) : 'null',
			)
			console.log('[SIMPLE-JOB-FORM] result.data.job:', result.data?.job)
			console.log('[SIMPLE-JOB-FORM] result.data.analysis:', result.data?.analysis)

			if (result.success && result.data) {
				console.log('[SIMPLE-JOB-FORM] Calling onSuccess with entire result:', result)
				onSuccess(result) // Pass the entire API response
			} else {
				throw new Error(result.error || 'Failed to create job posting')
			}
		} catch (err) {
			console.error('[SIMPLE-JOB-FORM] Error creating job posting:', err)
			console.error('[SIMPLE-JOB-FORM] Error type:', err?.constructor?.name)
			console.error(
				'[SIMPLE-JOB-FORM] Error message:',
				err instanceof Error ? err.message : String(err),
			)
			console.error('[SIMPLE-JOB-FORM] Error stack:', err instanceof Error ? err.stack : 'No stack')

			let errorMessage = 'An unexpected error occurred'
			if (err instanceof Error) {
				errorMessage = err.message

				// Show raw error for debugging
				console.log('[SIMPLE-JOB-FORM] Raw error message:', errorMessage)

				// Provide helpful guidance for common errors
				if (errorMessage.includes('Recruiter profile not found')) {
					errorMessage =
						'Please create your recruiter profile first before posting jobs. Go to Profile → Create Profile to get started.'
				} else if (errorMessage.includes('CSRF token')) {
					errorMessage = 'Security token expired. Please refresh the page and try again.'
				} else if (errorMessage.includes('Authentication required')) {
					errorMessage = 'Please sign in to post jobs.'
				}
			}

			// For debugging, show the raw error in the UI temporarily
			setError(`${errorMessage} (Raw: ${err instanceof Error ? err.message : 'Unknown'})`)
		} finally {
			setIsLoading(false)
		}
	}

	const handlePaste = (e: React.ClipboardEvent) => {
		// Allow the paste to happen naturally
		setTimeout(() => {
			setError(null)
		}, 0)
	}

	const handleUrlImport = async () => {
		if (!importUrl.trim()) {
			setImportError('Please enter a job posting URL')
			return
		}

		// Validate URL format
		try {
			const urlObj = new URL(importUrl)
			if (!urlObj.hostname.includes('greenhouse.io')) {
				setImportError('Currently only Greenhouse.io job postings are supported')
				return
			}
		} catch {
			setImportError('Please enter a valid URL')
			return
		}

		setIsImporting(true)
		setImportError(null)

		try {
			const response = await fetch(`/api/convert_from_json?url=${encodeURIComponent(importUrl)}`)

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
				throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
			}

			const data = await response.json()

			if (!data.text && !data.structured) {
				throw new Error('No job description found')
			}

			// Use the extracted text to populate the job posting textarea
			setJobPosting(data.text)
			setImportUrl('') // Clear the URL input
			setError(null) // Clear any existing errors

			// Show success message briefly
			setImportError(null)
		} catch (err) {
			console.error('URL import error:', err)
			setImportError(err instanceof Error ? err.message : 'Failed to import job posting')
		} finally {
			setIsImporting(false)
		}
	}

	const handleUrlKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleUrlImport()
		}
	}

	const exampleJobPosting = `Senior Software Engineer - Full Stack

We're looking for a Senior Software Engineer to join our growing team at TechCorp. You'll be working on our core platform using React, Node.js, and PostgreSQL.

Requirements:
- 5+ years of experience in software development
- Strong proficiency in JavaScript/TypeScript
- Experience with React and Node.js
- Knowledge of SQL databases (PostgreSQL preferred)
- Experience with AWS or similar cloud platforms
- Strong problem-solving skills and attention to detail

Nice to have:
- Experience with Docker and Kubernetes
- Knowledge of GraphQL
- Previous startup experience

We offer:
- Competitive salary ($120,000 - $160,000)
- Equity package
- Remote work flexibility
- Health, dental, and vision insurance
- 401k matching

Location: San Francisco, CA (Remote OK)
Type: Full-time`

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			{/* Profile Required Notice */}
			{debugInfo && debugInfo.includes('Profile: Missing') && (
				<div className="border-apple-orange bg-apple-orange/10 text-apple-orange mb-6 rounded-lg border px-4 py-4">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 h-5 w-5 flex-shrink-0">
							<svg
								className="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<h3 className="mb-1 font-semibold">Profile Required</h3>
							<p className="mb-3 text-[15px]">
								You need to create a recruiter profile before you can post jobs. This helps
								candidates learn about your company and contact you.
							</p>
							<a
								href="/recruiter/profile"
								className="bg-apple-orange inline-flex items-center gap-2 rounded-lg px-4 py-2 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-orange-600"
							>
								<svg
									className="h-4 w-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								Create Recruiter Profile
							</a>
						</div>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className="space-y-6"
			>
				{/* Instructions */}
				<div className="bg-apple-blue/10 border-apple-blue/20 rounded-lg border p-4">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 h-5 w-5 flex-shrink-0">
							<svg
								className="text-apple-blue h-5 w-5"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<h3 className="text-apple-blue mb-1 font-semibold">How it works</h3>
							<p className="text-apple-blue/80 text-[15px]">
								Simply paste your complete job posting below. Our AI will automatically extract:
							</p>
							<ul className="text-apple-blue/70 mt-2 space-y-1 text-[13px]">
								<li>• Required and preferred skills</li>
								<li>• Experience level and salary range</li>
								<li>• Job type and location details</li>
								<li>• Key responsibilities and requirements</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Quick URL Import */}
				<div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
					<div className="mb-3 flex items-center gap-3">
						<div className="h-5 w-5 flex-shrink-0">
							<svg
								className="text-apple-blue h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<h3 className="font-medium text-black dark:text-white">Quick Import from URL</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">
								Paste a Greenhouse.io job posting URL to automatically extract the job description
							</p>
						</div>
					</div>

					<div className="flex gap-2">
						<input
							type="url"
							value={importUrl}
							onChange={(e) => setImportUrl(e.target.value)}
							onKeyPress={handleUrlKeyPress}
							placeholder="https://boards.greenhouse.io/company/jobs/123456"
							className="focus:border-apple-blue flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black transition-colors duration-150 ease-out outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white"
							disabled={isImporting || isLoading}
						/>
						<button
							type="button"
							onClick={handleUrlImport}
							disabled={isImporting || isLoading || !importUrl.trim()}
							className="bg-apple-blue flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
						>
							{isImporting ? (
								<>
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
									Importing...
								</>
							) : (
								<>
									<svg
										className="h-4 w-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
										/>
									</svg>
									Import
								</>
							)}
						</button>
					</div>

					{importError && (
						<div className="text-apple-red mt-2 flex items-center gap-1 text-sm">
							<svg
								className="h-4 w-4 flex-shrink-0"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
							{importError}
						</div>
					)}
				</div>

				{/* Job Posting Input */}
				<div>
					<label
						htmlFor="jobPosting"
						className="mb-2 block text-[15px] font-medium text-black dark:text-white"
					>
						Job Posting *
					</label>
					<textarea
						id="jobPosting"
						value={jobPosting}
						onChange={(e) => setJobPosting(e.target.value)}
						onPaste={handlePaste}
						rows={20}
						className="font-system focus:border-apple-blue resize-vertical w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[15px] leading-relaxed text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
						placeholder="Paste your complete job posting here..."
						disabled={isLoading}
					/>
					<div className="mt-2 flex items-center justify-between">
						<p className="text-[13px] text-gray-600 dark:text-gray-400">
							{jobPosting.length} characters{' '}
							{jobPosting.length < 50 && jobPosting.length > 0 && '(minimum 50 required)'}
						</p>
						<button
							type="button"
							onClick={() => setJobPosting(exampleJobPosting)}
							className="text-apple-blue text-[13px] transition-colors duration-150 hover:text-blue-600"
							disabled={isLoading}
						>
							Use example
						</button>
					</div>
				</div>

				{/* Error Message */}
				{error && (
					<div className="border-apple-red bg-apple-red/10 text-apple-red flex items-start gap-2 rounded-lg border px-4 py-3">
						<div className="mt-0.5 h-5 w-5 flex-shrink-0">
							<svg
								className="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clipRule="evenodd"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<p className="text-[15px] font-medium">Error</p>
							<p className="text-[14px] opacity-90">{error}</p>
							{error.includes('recruiter profile') && (
								<div className="mt-2">
									<a
										href="/recruiter/profile"
										className="text-apple-blue inline-flex items-center gap-1 text-[13px] transition-colors duration-150 hover:text-blue-600"
									>
										<svg
											className="h-4 w-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M13 7l5 5m0 0l-5 5m5-5H6"
											/>
										</svg>
										Go to Profile Setup
									</a>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Debug Info */}
				{debugInfo && (
					<div className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
						<p className="font-mono text-[13px]">{debugInfo}</p>
					</div>
				)}

				{/* Submit Button */}
				<div className="flex gap-3 pt-4">
					<button
						type="button"
						onClick={checkStatus}
						className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white transition-colors duration-150 hover:bg-gray-600"
					>
						Check Status
					</button>

					<button
						type="submit"
						disabled={
							isLoading
							|| !jobPosting.trim()
							|| jobPosting.trim().length < 50
							|| (debugInfo && debugInfo.includes('Profile: Missing'))
						}
						className="bg-apple-blue font-system disabled:hover:bg-apple-blue flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3 text-[17px] font-semibold text-white transition-all duration-150 ease-out hover:-translate-y-px hover:bg-[#0056CC] active:translate-y-0 active:bg-[#004499] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
					>
						{isLoading ? (
							<>
								<div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
								Analyzing with AI...
							</>
						) : (
							<>
								<svg
									className="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13 10V3L4 14h7v7l9-11h-7z"
									/>
								</svg>
								Analyze & Post Job
							</>
						)}
					</button>
				</div>

				{/* AI Processing Info */}
				{isLoading && (
					<div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
						<div className="flex items-center gap-3">
							<div className="border-apple-blue/30 border-t-apple-blue h-6 w-6 animate-spin rounded-full border-2"></div>
							<div className="flex-1">
								<p className="text-[15px] font-medium text-black dark:text-white">
									AI is analyzing your job posting...
								</p>
								<p className="mt-1 text-[13px] text-gray-600 dark:text-gray-400">
									This usually takes 10-30 seconds. We're extracting skills, requirements, and other
									details.
								</p>
							</div>
						</div>
					</div>
				)}
			</form>
		</div>
	)
}
