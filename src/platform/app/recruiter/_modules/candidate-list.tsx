'use client'

import React, { useEffect, useState } from 'react'

import { InterviewSchedulingModal } from '~/components/interview-scheduling-modal'
import { secureApiRequest, useCSRFToken } from '~/hooks/use-csrf-token'
import {
	CandidateFilters,
	CandidateWithMatch,
	ScheduleInterviewRequest,
} from '~/types/interview-management'

import { CandidateCard } from './candidate-card'
import { CandidateFiltersPanel } from './candidate-filters-panel'

interface CandidateListProps {
	jobId: string
	initialCandidates?: CandidateWithMatch[]
	initialFilters?: CandidateFilters
}

interface SortOption {
	value: string
	label: string
}

const sortOptions: SortOption[] = [
	{ value: 'matchScore', label: 'Match Score' },
	{ value: 'name', label: 'Name' },
	{ value: 'email', label: 'Email' },
]

export function CandidateList({
	jobId,
	initialCandidates = [],
	initialFilters = {},
}: CandidateListProps) {
	const [candidates, setCandidates] = useState<CandidateWithMatch[]>(initialCandidates)
	const [filters, setFilters] = useState<CandidateFilters>(initialFilters)
	const [sortBy, setSortBy] = useState('matchScore')
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showFilters, setShowFilters] = useState(false)
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const [totalCandidates, setTotalCandidates] = useState(0)
	const [schedulingCandidate, setSchedulingCandidate] = useState<CandidateWithMatch | null>(null)
	const [schedulingLoading, setSchedulingLoading] = useState(false)

	// Initialize CSRF token
	const csrfToken = useCSRFToken()

	// Fetch candidates with current filters and sorting
	const fetchCandidates = async (resetPage = false, forceRefresh = false) => {
		setLoading(true)
		setError(null)

		try {
			const currentPage = resetPage ? 1 : page
			const params = new URLSearchParams({
				page: currentPage.toString(),
				limit: '20',
				sortBy,
				sortOrder,
			})

			// Add refresh parameter if requested
			if (forceRefresh) {
				params.set('refresh', 'true')
			}

			// Add filters to params
			if (filters.skills?.length) {
				params.set('skills', filters.skills.join(','))
			}
			if (filters.experienceLevel?.length) {
				params.set('experienceLevel', filters.experienceLevel.join(','))
			}
			if (filters.location) {
				params.set('location', filters.location)
			}
			if (filters.remoteOnly !== undefined) {
				params.set('remoteOnly', filters.remoteOnly.toString())
			}
			if (filters.minMatchScore !== undefined) {
				params.set('minMatchScore', filters.minMatchScore.toString())
			}
			if (filters.availability?.startDate) {
				params.set('availabilityStartDate', filters.availability.startDate)
			}
			if (filters.availability?.endDate) {
				params.set('availabilityEndDate', filters.availability.endDate)
			}
			if (filters.availability?.timezone) {
				params.set('availabilityTimezone', filters.availability.timezone)
			}

			const response = await fetch(`/api/recruiter/jobs/${jobId}/candidates?${params}`)
			const data = await response.json()

			if (!response.ok) {
				throw new Error(data.error || 'Failed to fetch candidates')
			}

			if (resetPage || currentPage === 1) {
				setCandidates(data.data)
			} else {
				setCandidates((prev) => [...prev, ...data.data])
			}

			setTotalCandidates(data.pagination.total)
			setHasMore(data.pagination.hasNext)

			if (resetPage) {
				setPage(1)
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch candidates')
		} finally {
			setLoading(false)
		}
	}

	// Load more candidates
	const loadMore = () => {
		if (!loading && hasMore) {
			setPage((prev) => prev + 1)
		}
	}

	// Handle filter changes
	const handleFiltersChange = (newFilters: CandidateFilters) => {
		setFilters(newFilters)
		fetchCandidates(true, true) // Force refresh when filters change
	}

	// Handle sort changes
	const handleSortChange = (newSortBy: string) => {
		setSortBy(newSortBy)
		fetchCandidates(true)
	}

	const handleSortOrderToggle = () => {
		setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
		fetchCandidates(true)
	}

	// Refresh candidates with force refresh
	const refreshCandidates = async () => {
		await fetchCandidates(true, true)
	}

	// Fetch candidates when page changes
	useEffect(() => {
		if (page > 1) {
			fetchCandidates()
		}
	}, [page])

	// Handle interview scheduling
	const handleScheduleInterview = (candidateId: string) => {
		const candidate = candidates.find((c) => c.candidate.id === candidateId)
		if (candidate) {
			setSchedulingCandidate(candidate)
		}
	}

	const handleScheduleSubmit = async (request: ScheduleInterviewRequest) => {
		try {
			setSchedulingLoading(true)

			const response = await secureApiRequest('/api/interviews/schedule', {
				method: 'POST',
				body: JSON.stringify(request),
			})

			const data = await response.json()

			if (!data.success) {
				if (data.data?.suggestedTimes) {
					alert(
						`No mutual availability found. Suggested times: ${data.data.suggestedTimes.length} alternatives available.`,
					)
				} else {
					throw new Error(data.error || 'Failed to schedule interview')
				}
				return
			}

			alert('Interview scheduled successfully!')
			setSchedulingCandidate(null)
		} catch (error) {
			console.error('Error scheduling interview:', error)
			alert(error instanceof Error ? error.message : 'Failed to schedule interview')
			throw error
		} finally {
			setSchedulingLoading(false)
		}
	}

	// Initial load with force refresh to get latest candidates
	useEffect(() => {
		if (initialCandidates.length === 0) {
			fetchCandidates(true, true) // Force refresh on initial load
		}
	}, [])

	return (
		<div className="space-y-6">
			{/* Header with controls */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h2 className="text-xl font-semibold text-black dark:text-white">Candidates</h2>
					<p className="text-sm text-gray-600 dark:text-gray-400">
						{totalCandidates} candidates found
					</p>
				</div>

				<div className="flex items-center gap-2">
					{/* Filters toggle */}
					<button
						onClick={() => setShowFilters(!showFilters)}
						className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
					>
						Filters {showFilters ? '−' : '+'}
					</button>

					{/* Sort controls */}
					<select
						value={sortBy}
						onChange={(e) => handleSortChange(e.target.value)}
						className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-black"
					>
						{sortOptions.map((option) => (
							<option
								key={option.value}
								value={option.value}
							>
								{option.label}
							</option>
						))}
					</select>

					<button
						onClick={handleSortOrderToggle}
						className="rounded-lg border border-gray-200 px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
						title={`Sort ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
					>
						{sortOrder === 'asc' ? '↑' : '↓'}
					</button>

					{/* Refresh button */}
					<button
						onClick={refreshCandidates}
						disabled={loading}
						className="bg-apple-blue rounded-lg px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? 'Refreshing...' : 'Refresh'}
					</button>
				</div>
			</div>

			{/* Filters panel */}
			{showFilters && (
				<CandidateFiltersPanel
					filters={filters}
					onFiltersChange={handleFiltersChange}
					onClose={() => setShowFilters(false)}
				/>
			)}

			{/* Error message */}
			{error && (
				<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
					<p className="text-red-700 dark:text-red-400">{error}</p>
				</div>
			)}

			{/* Candidates list */}
			<div className="space-y-4">
				{candidates.map((candidateMatch) => (
					<CandidateCard
						key={candidateMatch.candidate.id}
						candidateMatch={candidateMatch}
						jobId={jobId}
						onScheduleInterview={handleScheduleInterview}
					/>
				))}

				{/* Loading state */}
				{loading && candidates.length === 0 && (
					<div className="flex items-center justify-center py-12">
						<div className="border-t-apple-blue h-6 w-6 animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
						<span className="ml-2 text-gray-600 dark:text-gray-400">Loading candidates...</span>
					</div>
				)}

				{/* Empty state */}
				{!loading && candidates.length === 0 && !error && (
					<div className="py-12 text-center">
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
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
							No candidates found
						</h3>
						<p className="mb-4 text-gray-600 dark:text-gray-400">
							Try adjusting your filters or refresh the candidate list.
						</p>
						<button
							onClick={refreshCandidates}
							className="bg-apple-blue rounded-lg px-4 py-2 text-white transition-colors hover:bg-blue-600"
						>
							Refresh Candidates
						</button>
					</div>
				)}

				{/* Load more button */}
				{hasMore && candidates.length > 0 && (
					<div className="pt-6 text-center">
						<button
							onClick={loadMore}
							disabled={loading}
							className="rounded-lg border border-gray-200 px-6 py-3 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-900"
						>
							{loading ? 'Loading...' : 'Load More'}
						</button>
					</div>
				)}
			</div>

			{/* Interview Scheduling Modal */}
			{schedulingCandidate && (
				<InterviewSchedulingModal
					isOpen={true}
					onClose={() => setSchedulingCandidate(null)}
					candidate={schedulingCandidate}
					jobPostingId={jobId}
					onSchedule={handleScheduleSubmit}
					isLoading={schedulingLoading}
				/>
			)}
		</div>
	)
}
