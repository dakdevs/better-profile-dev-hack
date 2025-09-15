'use client'

import { useState } from 'react'

import { JobPosting, JobPostingsResponse, JobPostingStatus } from '~/types/interview-management'

interface JobPostingListProps {
	jobs: JobPosting[]
	pagination?: JobPostingsResponse['pagination']
	onEdit?: (job: JobPosting) => void
	onDelete?: (jobId: string) => void
	onStatusChange?: (jobId: string, status: JobPostingStatus) => void
	onPageChange?: (page: number) => void
	isLoading?: boolean
}

export function JobPostingList({
	jobs,
	pagination,
	onEdit,
	onDelete,
	onStatusChange,
	onPageChange,
	isLoading = false,
}: JobPostingListProps) {
	const [selectedJob, setSelectedJob] = useState<string | null>(null)

	const getStatusColor = (status: JobPostingStatus) => {
		switch (status) {
			case 'active':
				return 'bg-apple-green/10 text-apple-green'
			case 'paused':
				return 'bg-apple-orange/10 text-apple-orange'
			case 'closed':
				return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
			case 'draft':
				return 'bg-apple-blue/10 text-apple-blue'
			default:
				return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
		}
	}

	const formatSalary = (min?: number, max?: number) => {
		if (!min && !max) return 'Not specified'
		if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
		if (min) return `From $${min.toLocaleString()}`
		return `Up to $${max?.toLocaleString()}`
	}

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		}).format(new Date(date))
	}

	const copyScheduleLink = async (jobId: string) => {
		try {
			const response = await fetch(`/api/jobs/${jobId}/schedule-link`)
			const data = await response.json()

			if (data.success && data.scheduling.available && data.scheduling.scheduleUrl) {
				await navigator.clipboard.writeText(data.scheduling.scheduleUrl)
				// You could add a toast notification here
				alert('Schedule link copied to clipboard!')
			} else {
				alert('Interview scheduling is not set up for this job. Please connect Cal.com first.')
			}
		} catch (error) {
			console.error('Error copying schedule link:', error)
			alert('Failed to copy schedule link')
		}
	}

	if (isLoading) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, index) => (
					<div
						key={index}
						className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black"
					>
						<div className="animate-pulse">
							<div className="mb-3 h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
							<div className="mb-4 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
							<div className="space-y-2">
								<div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
								<div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
							</div>
						</div>
					</div>
				))}
			</div>
		)
	}

	if (jobs.length === 0) {
		return (
			<div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-black">
				<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
					<svg
						className="h-8 w-8 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
						/>
					</svg>
				</div>
				<h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
					No job postings yet
				</h3>
				<p className="mb-6 text-gray-600 dark:text-gray-400">
					Create your first job posting to start finding great candidates.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{jobs.map((job) => (
				<div
					key={job.id}
					className="rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-black"
				>
					<div className="mb-4 flex items-start justify-between">
						<div className="min-w-0 flex-1">
							<div className="mb-2 flex items-center gap-3">
								<h3 className="truncate text-lg font-semibold text-black dark:text-white">
									{job.title}
								</h3>
								<span
									className={`rounded-full px-2 py-1 text-[12px] font-medium capitalize ${getStatusColor(job.status)}`}
								>
									{job.status}
								</span>
							</div>

							<div className="mb-3 flex items-center gap-4 text-[13px] text-gray-600 dark:text-gray-400">
								{job.location && (
									<span className="flex items-center gap-1">
										<svg
											className="h-3 w-3"
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
										{job.location}
									</span>
								)}

								{job.remoteAllowed && (
									<span className="flex items-center gap-1">
										<svg
											className="h-3 w-3"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
											/>
										</svg>
										Remote OK
									</span>
								)}

								<span className="capitalize">{job.employmentType}</span>

								{job.experienceLevel && (
									<span className="capitalize">{job.experienceLevel} level</span>
								)}
							</div>

							<p className="mb-3 line-clamp-2 text-[15px] text-gray-600 dark:text-gray-400">
								{job.rawDescription.length > 150
									? `${job.rawDescription.substring(0, 150)}...`
									: job.rawDescription}
							</p>

							<div className="flex items-center gap-4 text-[13px] text-gray-600 dark:text-gray-400">
								<span>Salary: {formatSalary(job.salaryMin, job.salaryMax)}</span>
								<span>Posted: {formatDate(job.createdAt)}</span>
								{job.aiConfidenceScore && (
									<span>AI Confidence: {Math.round(job.aiConfidenceScore * 100)}%</span>
								)}
							</div>
						</div>

						<div className="ml-4 flex items-center gap-2">
							<a
								href={`/recruiter/jobs/${job.id}/candidates`}
								className="bg-apple-blue rounded-lg px-3 py-2 text-[13px] font-medium text-white transition-colors duration-150 ease-out hover:bg-blue-600"
								title="View candidates for this job"
							>
								View Candidates
							</a>

							<JobStatusDropdown
								currentStatus={job.status}
								onStatusChange={(status) => onStatusChange?.(job.id, status)}
							/>

							<button
								onClick={() => copyScheduleLink(job.id)}
								className="hover:text-apple-green hover:bg-apple-green/10 rounded-lg p-2 text-gray-600 transition-colors duration-150 ease-out dark:text-gray-400"
								title="Copy interview schedule link"
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
										d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-4 0V3m0 4h4m0 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4"
									/>
								</svg>
							</button>

							<button
								onClick={() => onEdit?.(job)}
								className="rounded-lg p-2 text-gray-600 transition-colors duration-150 ease-out hover:bg-gray-50 hover:text-black dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-white"
								title="Edit job posting"
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
										d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
									/>
								</svg>
							</button>

							<button
								onClick={() => onDelete?.(job.id)}
								className="hover:text-apple-red hover:bg-apple-red/10 rounded-lg p-2 text-gray-600 transition-colors duration-150 ease-out dark:text-gray-400"
								title="Delete job posting"
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
										d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
									/>
								</svg>
							</button>
						</div>
					</div>

					{/* Skills */}
					{job.requiredSkills && job.requiredSkills.length > 0 && (
						<div className="border-t border-gray-200 pt-4 dark:border-gray-700">
							<div className="flex flex-wrap gap-2">
								{job.requiredSkills.slice(0, 8).map((skill, index) => (
									<span
										key={index}
										className="bg-apple-blue/10 text-apple-blue rounded px-2 py-1 text-[12px] font-medium"
									>
										{skill.name}
									</span>
								))}
								{job.requiredSkills.length > 8 && (
									<span className="rounded bg-gray-100 px-2 py-1 text-[12px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
										+{job.requiredSkills.length - 8} more
									</span>
								)}
							</div>
						</div>
					)}
				</div>
			))}

			{/* Pagination */}
			{pagination && pagination.totalPages > 1 && (
				<div className="flex items-center justify-between pt-6">
					<p className="text-[13px] text-gray-600 dark:text-gray-400">
						Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
						{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}{' '}
						jobs
					</p>

					<div className="flex items-center gap-2">
						<button
							onClick={() => onPageChange?.(pagination.page - 1)}
							disabled={!pagination.hasPrev}
							className="rounded-lg px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors duration-150 ease-out hover:bg-gray-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-600 dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-white disabled:hover:dark:text-gray-400"
						>
							Previous
						</button>

						<span className="px-3 py-2 text-[13px] font-medium text-black dark:text-white">
							Page {pagination.page} of {pagination.totalPages}
						</span>

						<button
							onClick={() => onPageChange?.(pagination.page + 1)}
							disabled={!pagination.hasNext}
							className="rounded-lg px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors duration-150 ease-out hover:bg-gray-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-600 dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-white disabled:hover:dark:text-gray-400"
						>
							Next
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

// Job Status Dropdown Component
interface JobStatusDropdownProps {
	currentStatus: JobPostingStatus
	onStatusChange: (status: JobPostingStatus) => void
}

function JobStatusDropdown({ currentStatus, onStatusChange }: JobStatusDropdownProps) {
	const [isOpen, setIsOpen] = useState(false)

	const statusOptions: { value: JobPostingStatus; label: string; color: string }[] = [
		{ value: 'active', label: 'Active', color: 'text-apple-green' },
		{ value: 'paused', label: 'Paused', color: 'text-apple-orange' },
		{ value: 'closed', label: 'Closed', color: 'text-gray-600 dark:text-gray-400' },
		{ value: 'draft', label: 'Draft', color: 'text-apple-blue' },
	]

	const currentOption = statusOptions.find((option) => option.value === currentStatus)

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors duration-150 ease-out hover:bg-gray-50 hover:text-black dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-white"
			>
				<span className={currentOption?.color}>{currentOption?.label}</span>
				<svg
					className="h-3 w-3"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{isOpen && (
				<>
					<div
						className="fixed inset-0 z-10"
						onClick={() => setIsOpen(false)}
					/>
					<div className="absolute top-full right-0 z-20 mt-1 w-32 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-black">
						{statusOptions.map((option) => (
							<button
								key={option.value}
								onClick={() => {
									onStatusChange(option.value)
									setIsOpen(false)
								}}
								className={`w-full px-3 py-2 text-left text-[13px] font-medium transition-colors duration-150 ease-out first:rounded-t-lg last:rounded-b-lg hover:bg-gray-50 hover:dark:bg-gray-900 ${option.color} ${
									option.value === currentStatus ? 'bg-gray-50 dark:bg-gray-900' : ''
								}`}
							>
								{option.label}
							</button>
						))}
					</div>
				</>
			)}
		</div>
	)
}
