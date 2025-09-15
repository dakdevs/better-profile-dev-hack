'use client'

import { useEffect, useState } from 'react'

import { InterviewSession, InterviewStatus, InterviewType } from '~/types/interview-management'

import { InterviewCard } from './interview-card'

interface InterviewListProps {
	userType: 'candidate' | 'recruiter'
	onConfirm?: (interviewId: string, confirmed: boolean, notes?: string) => Promise<void>
	onReschedule?: (interviewId: string) => void
	onCancel?: (interviewId: string, reason?: string) => Promise<void>
}

export function InterviewList({ userType, onConfirm, onReschedule, onCancel }: InterviewListProps) {
	const [interviews, setInterviews] = useState<InterviewSession[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [statusFilter, setStatusFilter] = useState<InterviewStatus | 'all'>('all')
	const [actionLoading, setActionLoading] = useState<string | null>(null)

	useEffect(() => {
		fetchInterviews()
	}, [userType, statusFilter])

	const fetchInterviews = async () => {
		try {
			setLoading(true)
			setError(null)

			const params = new URLSearchParams({
				userType,
				limit: '50',
			})

			if (statusFilter !== 'all') {
				params.append('status', statusFilter)
			}

			const response = await fetch(`/api/interviews?${params}`)
			const data = await response.json()

			if (!data.success) {
				throw new Error(data.error || 'Failed to fetch interviews')
			}

			setInterviews(data.data || [])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch interviews')
		} finally {
			setLoading(false)
		}
	}

	const handleConfirm = async (interviewId: string, confirmed: boolean, notes?: string) => {
		if (!onConfirm) return

		await onConfirm(interviewId, confirmed, notes)
		await fetchInterviews() // Refresh the list
	}

	const handleCancel = async (interviewId: string, reason?: string) => {
		if (!onCancel) return

		await onCancel(interviewId, reason)
		await fetchInterviews() // Refresh the list
	}

	if (loading) {
		return (
			<div className="space-y-4">
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black"
					>
						<div className="animate-pulse">
							<div className="mb-2 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
							<div className="mb-4 h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
							<div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
						</div>
					</div>
				))}
			</div>
		)
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
				<p className="text-red-800 dark:text-red-400">{error}</p>
				<button
					onClick={fetchInterviews}
					className="mt-2 text-sm text-red-600 hover:underline dark:text-red-400"
				>
					Try again
				</button>
			</div>
		)
	}

	return (
		<div className="space-y-4">
			{/* Filter Controls */}
			<div className="mb-6 flex items-center gap-4">
				<label className="text-sm font-medium text-black dark:text-white">Filter by status:</label>
				<select
					value={statusFilter}
					onChange={(e) => setStatusFilter(e.target.value as InterviewStatus | 'all')}
					className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-black dark:text-white"
				>
					<option value="all">All Interviews</option>
					<option value="scheduled">Scheduled</option>
					<option value="confirmed">Confirmed</option>
					<option value="completed">Completed</option>
					<option value="cancelled">Cancelled</option>
					<option value="rescheduled">Rescheduled</option>
				</select>
			</div>

			{/* Interview List */}
			{interviews.length === 0 ? (
				<div className="py-12 text-center">
					<div className="mb-4 text-6xl">📅</div>
					<h3 className="mb-2 text-lg font-medium text-black dark:text-white">
						No interviews found
					</h3>
					<p className="text-gray-600 dark:text-gray-400">
						{statusFilter === 'all'
							? "You don't have any interviews scheduled yet."
							: `No interviews with status "${statusFilter}".`}
					</p>
				</div>
			) : (
				<div className="space-y-4">
					{interviews.map((interview) => (
						<InterviewCard
							key={interview.id}
							interview={interview}
							userType={userType}
							onConfirm={handleConfirm}
							onReschedule={onReschedule}
							onCancel={handleCancel}
						/>
					))}
				</div>
			)}
		</div>
	)
}
