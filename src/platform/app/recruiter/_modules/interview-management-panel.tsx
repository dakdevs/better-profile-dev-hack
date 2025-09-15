'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Calendar, CheckCircle, Clock, User, Video, XCircle } from 'lucide-react'

interface InterviewSession {
	id: string
	candidateName: string
	candidateEmail: string
	jobTitle: string
	scheduledStart: Date
	scheduledEnd: Date
	status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
	meetingLink?: string
	calComBookingId?: number
	notes?: string
}

interface InterviewManagementPanelProps {
	recruiterId: string
}

export function InterviewManagementPanel({ recruiterId }: InterviewManagementPanelProps) {
	const [interviews, setInterviews] = useState<InterviewSession[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [filter, setFilter] = useState<'all' | 'upcoming' | 'today' | 'completed'>('upcoming')

	useEffect(() => {
		loadInterviews()
	}, [recruiterId, filter])

	const loadInterviews = async () => {
		try {
			setLoading(true)
			setError(null)

			const response = await fetch(`/api/recruiter/interviews?filter=${filter}`)
			if (!response.ok) {
				throw new Error('Failed to load interviews')
			}

			const data = await response.json()
			if (data.success) {
				setInterviews(
					data.interviews.map((interview: any) => ({
						...interview,
						scheduledStart: new Date(interview.scheduledStart),
						scheduledEnd: new Date(interview.scheduledEnd),
					})),
				)
			} else {
				throw new Error(data.error || 'Failed to load interviews')
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load interviews')
		} finally {
			setLoading(false)
		}
	}

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'confirmed':
				return <CheckCircle className="text-apple-green h-4 w-4" />
			case 'completed':
				return <CheckCircle className="text-apple-blue h-4 w-4" />
			case 'cancelled':
				return <XCircle className="text-apple-red h-4 w-4" />
			case 'rescheduled':
				return <AlertCircle className="text-apple-orange h-4 w-4" />
			default:
				return <Clock className="h-4 w-4 text-gray-400" />
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'confirmed':
				return 'text-apple-green bg-apple-green/10 border-apple-green/20'
			case 'completed':
				return 'text-apple-blue bg-apple-blue/10 border-apple-blue/20'
			case 'cancelled':
				return 'text-apple-red bg-apple-red/10 border-apple-red/20'
			case 'rescheduled':
				return 'text-apple-orange bg-apple-orange/10 border-apple-orange/20'
			default:
				return 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-800 dark:border-gray-700'
		}
	}

	const formatDateTime = (date: Date) => {
		const today = new Date()
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		const isToday = date.toDateString() === today.toDateString()
		const isTomorrow = date.toDateString() === tomorrow.toDateString()

		const timeString = date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		})

		if (isToday) {
			return `Today at ${timeString}`
		} else if (isTomorrow) {
			return `Tomorrow at ${timeString}`
		} else {
			return `${date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			})} at ${timeString}`
		}
	}

	const filterButtons = [
		{
			key: 'upcoming',
			label: 'Upcoming',
			count: interviews.filter((i) => i.status === 'scheduled' || i.status === 'confirmed').length,
		},
		{
			key: 'today',
			label: 'Today',
			count: interviews.filter(
				(i) => new Date(i.scheduledStart).toDateString() === new Date().toDateString(),
			).length,
		},
		{
			key: 'completed',
			label: 'Completed',
			count: interviews.filter((i) => i.status === 'completed').length,
		},
		{ key: 'all', label: 'All', count: interviews.length },
	]

	if (loading) {
		return (
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<div className="mb-6 flex items-center gap-3">
					<Calendar className="text-apple-blue h-5 w-5" />
					<h3 className="text-lg font-semibold text-black dark:text-white">Interview Management</h3>
				</div>

				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<div
							key={i}
							className="animate-pulse"
						>
							<div className="mb-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
							<div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
						</div>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			<div className="mb-6 flex items-center justify-between">
				<div className="flex items-center gap-3">
					<Calendar className="text-apple-blue h-5 w-5" />
					<h3 className="text-lg font-semibold text-black dark:text-white">Interview Management</h3>
				</div>

				<button
					onClick={loadInterviews}
					className="p-2 text-gray-600 transition-colors duration-150 hover:text-black dark:text-gray-400 dark:hover:text-white"
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
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						/>
					</svg>
				</button>
			</div>

			{/* Filter Tabs */}
			<div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-900">
				{filterButtons.map((button) => (
					<button
						key={button.key}
						onClick={() => setFilter(button.key as any)}
						className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 ${
							filter === button.key
								? 'text-apple-blue bg-white shadow-sm dark:bg-black'
								: 'text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white'
						}`}
					>
						{button.label}
						{button.count > 0 && (
							<span
								className={`ml-1 rounded-full px-1.5 py-0.5 text-xs ${
									filter === button.key
										? 'bg-apple-blue/10 text-apple-blue'
										: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
								}`}
							>
								{button.count}
							</span>
						)}
					</button>
				))}
			</div>

			{error && (
				<div className="bg-apple-red/10 border-apple-red/20 mb-4 rounded-lg border p-3">
					<p className="text-apple-red text-sm">{error}</p>
				</div>
			)}

			{/* Interviews List */}
			<div className="space-y-3">
				{interviews.length === 0 ? (
					<div className="py-8 text-center">
						<Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
						<p className="mb-2 text-gray-500 dark:text-gray-400">
							{filter === 'upcoming' ? 'No upcoming interviews' : `No ${filter} interviews`}
						</p>
						<p className="text-sm text-gray-400 dark:text-gray-500">
							Interviews scheduled by candidates will appear here
						</p>
					</div>
				) : (
					interviews.map((interview) => (
						<div
							key={interview.id}
							className="rounded-lg border border-gray-200 p-4 transition-colors duration-150 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
						>
							<div className="mb-3 flex items-start justify-between">
								<div className="flex-1">
									<div className="mb-1 flex items-center gap-2">
										<User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
										<h4 className="font-medium text-black dark:text-white">
											{interview.candidateName}
										</h4>
										<span
											className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(interview.status)}`}
										>
											{interview.status}
										</span>
									</div>
									<p className="mb-1 text-sm text-gray-600 dark:text-gray-400">
										{interview.jobTitle}
									</p>
									<p className="text-sm text-gray-500 dark:text-gray-500">
										{interview.candidateEmail}
									</p>
								</div>

								<div className="flex items-center gap-2">{getStatusIcon(interview.status)}</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
									<div className="flex items-center gap-1">
										<Clock className="h-4 w-4" />
										<span>{formatDateTime(interview.scheduledStart)}</span>
									</div>

									{interview.meetingLink && (
										<a
											href={interview.meetingLink}
											target="_blank"
											rel="noopener noreferrer"
											className="text-apple-blue flex items-center gap-1 transition-colors duration-150 hover:text-blue-600"
										>
											<Video className="h-4 w-4" />
											<span>Join Meeting</span>
										</a>
									)}
								</div>

								<div className="flex items-center gap-2">
									<button className="p-1 text-gray-400 transition-colors duration-150 hover:text-gray-600 dark:hover:text-gray-300">
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
												d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
											/>
										</svg>
									</button>
								</div>
							</div>

							{interview.notes && (
								<div className="mt-3 rounded bg-gray-50 p-2 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-400">
									<strong>Notes:</strong> {interview.notes}
								</div>
							)}
						</div>
					))
				)}
			</div>

			{interviews.length > 0 && (
				<div className="mt-4 text-center">
					<button className="text-apple-blue text-sm transition-colors duration-150 hover:text-blue-600">
						View All Interviews
					</button>
				</div>
			)}
		</div>
	)
}
