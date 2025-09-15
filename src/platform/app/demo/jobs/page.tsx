'use client'

import { useEffect, useState } from 'react'

import { JobPosting } from '~/types/interview-management'

interface JobWithDetails extends JobPosting {
	salaryRange?: string
	requiredSkillsCount?: number
	preferredSkillsCount?: number
	extractedSkillsCount?: number
}

export default function DemoJobsPage() {
	const [jobs, setJobs] = useState<JobWithDetails[]>([])
	const [error, setError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [selectedJob, setSelectedJob] = useState<JobWithDetails | null>(null)
	const [stats, setStats] = useState<{
		totalJobs: number
		avgRequiredSkills: number
		avgPreferredSkills: number
		avgExtractedSkills: number
		avgConfidenceScore: number
	} | null>(null)

	// Use the recruiter ID from our mock data
	const recruiterId = '21b448edfc635d367b1d9216654d74f5'

	useEffect(() => {
		loadJobs()
	}, [])

	const loadJobs = async () => {
		setIsLoading(true)
		setError(null)
		try {
			console.log('[DEMO-JOBS] Fetching jobs from test API')
			const response = await fetch(`/api/test-jobs?recruiterId=${recruiterId}`)

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`)
			}

			const data = await response.json()
			console.log('[DEMO-JOBS] API response:', data)

			if (data.success) {
				setJobs(data.data.jobs || [])
				setStats(data.data.summary || null)
				console.log('[DEMO-JOBS] Loaded jobs:', data.data.jobs?.length || 0, 'jobs')
			} else {
				console.error('Failed to load jobs:', data.error)
				setError(data.error || 'Failed to load jobs')
				setJobs([])
			}
		} catch (error) {
			console.error('Error loading jobs:', error)
			setError(error instanceof Error ? error.message : 'Failed to load jobs')
			setJobs([])
		} finally {
			setIsLoading(false)
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active':
				return 'text-apple-green bg-apple-green/10 border-apple-green/20'
			case 'paused':
				return 'text-apple-orange bg-apple-orange/10 border-apple-orange/20'
			case 'closed':
				return 'text-gray-600 bg-gray-100 border-gray-200'
			case 'draft':
				return 'text-apple-blue bg-apple-blue/10 border-apple-blue/20'
			default:
				return 'text-gray-600 bg-gray-100 border-gray-200'
		}
	}

	const getExperienceLevelColor = (level: string) => {
		switch (level) {
			case 'entry':
				return 'text-apple-green bg-apple-green/10'
			case 'mid':
				return 'text-apple-blue bg-apple-blue/10'
			case 'senior':
				return 'text-apple-purple bg-apple-purple/10'
			case 'executive':
				return 'text-apple-red bg-apple-red/10'
			default:
				return 'text-gray-600 bg-gray-100'
		}
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
				<div className="mx-auto max-w-6xl">
					<div className="flex items-center justify-center py-12">
						<div className="border-t-apple-blue h-8 w-8 animate-spin rounded-full border-2 border-gray-200"></div>
						<span className="ml-3 text-gray-600 dark:text-gray-400">Loading jobs...</span>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
			<div className="mx-auto max-w-6xl">
				{/* Header */}
				<header className="mb-8">
					<h1 className="mb-2 text-3xl font-bold text-black dark:text-white">Job Postings Demo</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Demonstrating 25 diverse job postings with AI-powered skill extraction and candidate
						matching
					</p>
				</header>

				{/* Stats Cards */}
				{stats && (
					<div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
						<div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-black">
							<div className="mb-1 text-2xl font-semibold text-black dark:text-white">
								{stats.totalJobs}
							</div>
							<div className="text-[13px] text-gray-600 dark:text-gray-400">Total Jobs</div>
						</div>

						<div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-black">
							<div className="text-apple-blue mb-1 text-2xl font-semibold">
								{stats.avgRequiredSkills.toFixed(1)}
							</div>
							<div className="text-[13px] text-gray-600 dark:text-gray-400">
								Avg Required Skills
							</div>
						</div>

						<div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-black">
							<div className="text-apple-green mb-1 text-2xl font-semibold">
								{stats.avgPreferredSkills.toFixed(1)}
							</div>
							<div className="text-[13px] text-gray-600 dark:text-gray-400">
								Avg Preferred Skills
							</div>
						</div>

						<div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-black">
							<div className="text-apple-purple mb-1 text-2xl font-semibold">
								{stats.avgExtractedSkills.toFixed(1)}
							</div>
							<div className="text-[13px] text-gray-600 dark:text-gray-400">
								Avg Extracted Skills
							</div>
						</div>

						<div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-black">
							<div className="text-apple-orange mb-1 text-2xl font-semibold">
								{(stats.avgConfidenceScore * 100).toFixed(0)}%
							</div>
							<div className="text-[13px] text-gray-600 dark:text-gray-400">Avg AI Confidence</div>
						</div>
					</div>
				)}

				{/* Error Display */}
				{error && (
					<div className="bg-apple-red/10 border-apple-red/20 mb-6 rounded-xl border p-4">
						<div className="flex items-center gap-2">
							<svg
								className="text-apple-red h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							<span className="text-apple-red font-medium">Error loading jobs</span>
						</div>
						<p className="text-apple-red/80 mt-1 text-sm">{error}</p>
						<button
							onClick={loadJobs}
							className="bg-apple-red mt-2 rounded px-3 py-1 text-sm text-white transition-colors hover:bg-red-600"
						>
							Retry
						</button>
					</div>
				)}

				{/* Job Grid */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{jobs.map((job) => (
						<div
							key={job.id}
							className="cursor-pointer rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-black"
							onClick={() => setSelectedJob(job)}
						>
							{/* Job Header */}
							<div className="mb-4">
								<div className="mb-2 flex items-start justify-between">
									<h3 className="line-clamp-2 text-lg font-semibold text-black dark:text-white">
										{job.title}
									</h3>
									<span
										className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(job.status)}`}
									>
										{job.status}
									</span>
								</div>

								<div className="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									<span>{job.location}</span>
									{job.remoteAllowed && (
										<span className="bg-apple-blue/10 text-apple-blue rounded px-2 py-0.5 text-xs">
											Remote OK
										</span>
									)}
								</div>

								{job.salaryRange && (
									<div className="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
												d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
											/>
										</svg>
										<span>{job.salaryRange}</span>
									</div>
								)}

								<div className="flex items-center gap-2">
									<span
										className={`rounded px-2 py-1 text-xs font-medium ${getExperienceLevelColor(job.experienceLevel || 'mid')}`}
									>
										{job.experienceLevel || 'Mid'} Level
									</span>
									{job.aiConfidenceScore && (
										<span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
											AI: {(job.aiConfidenceScore * 100).toFixed(0)}%
										</span>
									)}
								</div>
							</div>

							{/* Skills Summary */}
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-400">Required Skills</span>
									<span className="text-apple-red font-medium">
										{job.requiredSkills?.length || 0}
									</span>
								</div>

								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-400">Preferred Skills</span>
									<span className="text-apple-blue font-medium">
										{job.preferredSkills?.length || 0}
									</span>
								</div>

								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600 dark:text-gray-400">AI Extracted</span>
									<span className="text-apple-green font-medium">
										{job.extractedSkills?.length || 0}
									</span>
								</div>
							</div>

							{/* Quick Skills Preview */}
							{job.requiredSkills && job.requiredSkills.length > 0 && (
								<div className="mt-4 border-t border-gray-200 pt-4 dark:border-gray-700">
									<div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
										Top Required Skills:
									</div>
									<div className="flex flex-wrap gap-1">
										{job.requiredSkills.slice(0, 3).map((skill, index) => (
											<span
												key={index}
												className="bg-apple-red/10 text-apple-red rounded px-2 py-1 text-xs"
											>
												{skill.name}
											</span>
										))}
										{job.requiredSkills.length > 3 && (
											<span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
												+{job.requiredSkills.length - 3} more
											</span>
										)}
									</div>
								</div>
							)}
						</div>
					))}
				</div>

				{/* Job Detail Modal */}
				{selectedJob && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
						<div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-black">
							{/* Modal Header */}
							<div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
								<h2 className="text-xl font-semibold text-black dark:text-white">
									{selectedJob.title}
								</h2>
								<button
									onClick={() => setSelectedJob(null)}
									className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-none text-gray-600 transition-all duration-150 ease-out hover:bg-gray-50 hover:text-black dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-white"
								>
									×
								</button>
							</div>

							{/* Modal Content */}
							<div className="max-h-[calc(90vh-120px)] overflow-y-auto px-6 py-6">
								<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
									{/* Job Details */}
									<div>
										<h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
											Job Details
										</h3>

										<div className="space-y-3">
											<div>
												<span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
												<span className="ml-2 text-black dark:text-white">
													{selectedJob.location}
												</span>
												{selectedJob.remoteAllowed && (
													<span className="bg-apple-blue/10 text-apple-blue ml-2 rounded px-2 py-0.5 text-xs">
														Remote OK
													</span>
												)}
											</div>

											<div>
												<span className="text-sm text-gray-600 dark:text-gray-400">
													Experience Level:
												</span>
												<span
													className={`ml-2 rounded px-2 py-1 text-xs font-medium ${getExperienceLevelColor(selectedJob.experienceLevel || 'mid')}`}
												>
													{selectedJob.experienceLevel || 'Mid'} Level
												</span>
											</div>

											{selectedJob.salaryRange && (
												<div>
													<span className="text-sm text-gray-600 dark:text-gray-400">Salary:</span>
													<span className="ml-2 text-black dark:text-white">
														{selectedJob.salaryRange}
													</span>
												</div>
											)}

											<div>
												<span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
												<span
													className={`ml-2 rounded border px-2 py-1 text-xs font-medium ${getStatusColor(selectedJob.status)}`}
												>
													{selectedJob.status}
												</span>
											</div>

											{selectedJob.aiConfidenceScore && (
												<div>
													<span className="text-sm text-gray-600 dark:text-gray-400">
														AI Confidence:
													</span>
													<span className="ml-2 text-black dark:text-white">
														{(selectedJob.aiConfidenceScore * 100).toFixed(0)}%
													</span>
												</div>
											)}
										</div>
									</div>

									{/* Skills */}
									<div>
										<h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
											Skills Analysis
										</h3>

										{/* Required Skills */}
										{selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0 && (
											<div className="mb-4">
												<h4 className="text-apple-red mb-2 text-sm font-medium">
													Required Skills ({selectedJob.requiredSkills.length})
												</h4>
												<div className="flex flex-wrap gap-2">
													{selectedJob.requiredSkills.map((skill, index) => (
														<span
															key={index}
															className="bg-apple-red/10 text-apple-red border-apple-red/20 rounded border px-2 py-1 text-sm"
														>
															{skill.name}
														</span>
													))}
												</div>
											</div>
										)}

										{/* Preferred Skills */}
										{selectedJob.preferredSkills && selectedJob.preferredSkills.length > 0 && (
											<div className="mb-4">
												<h4 className="text-apple-blue mb-2 text-sm font-medium">
													Preferred Skills ({selectedJob.preferredSkills.length})
												</h4>
												<div className="flex flex-wrap gap-2">
													{selectedJob.preferredSkills.map((skill, index) => (
														<span
															key={index}
															className="bg-apple-blue/10 text-apple-blue border-apple-blue/20 rounded border px-2 py-1 text-sm"
														>
															{skill.name}
														</span>
													))}
												</div>
											</div>
										)}

										{/* AI Extracted Skills */}
										{selectedJob.extractedSkills && selectedJob.extractedSkills.length > 0 && (
											<div>
												<h4 className="text-apple-green mb-2 text-sm font-medium">
													AI Extracted Skills ({selectedJob.extractedSkills.length})
												</h4>
												<div className="flex flex-wrap gap-2">
													{selectedJob.extractedSkills.map((skill, index) => (
														<span
															key={index}
															className="bg-apple-green/10 text-apple-green border-apple-green/20 rounded border px-2 py-1 text-sm"
															title={`Confidence: ${((skill as any).confidence * 100).toFixed(0)}%`}
														>
															{skill.name}
														</span>
													))}
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Footer */}
				<footer className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-700">
					<div className="text-center text-sm text-gray-600 dark:text-gray-400">
						<p className="mb-2">
							Demonstrating AI-powered job analysis with skill extraction and candidate matching
						</p>
						<div className="flex justify-center gap-4 text-xs">
							<span>• 25 diverse job postings across 5 industries</span>
							<span>• AI skill extraction with confidence scores</span>
							<span>• Realistic candidate matching system</span>
						</div>
					</div>
				</footer>
			</div>
		</div>
	)
}
