'use client'

import { useState } from 'react'

import { AvailabilityStatus, CandidateAvailability } from '~/types/interview-management'

interface AvailabilityListProps {
	availability: CandidateAvailability[]
	onEdit?: (availability: CandidateAvailability) => void
	onDelete?: (availabilityId: string) => void
	isLoading?: boolean
	timezone?: string
}

export function AvailabilityList({
	availability,
	onEdit,
	onDelete,
	isLoading = false,
	timezone = 'UTC',
}: AvailabilityListProps) {
	const [deletingId, setDeletingId] = useState<string | null>(null)

	// Format date and time for display
	const formatDateTime = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			dateStyle: 'medium',
			timeStyle: 'short',
			timeZone: timezone,
		}).format(date)
	}

	// Format date only
	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			dateStyle: 'medium',
			timeZone: timezone,
		}).format(date)
	}

	// Format time only
	const formatTime = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			timeStyle: 'short',
			timeZone: timezone,
		}).format(date)
	}

	// Get status color
	const getStatusColor = (status: AvailabilityStatus) => {
		switch (status) {
			case 'available':
				return 'bg-apple-green/10 text-apple-green border-apple-green/20'
			case 'booked':
				return 'bg-apple-blue/10 text-apple-blue border-apple-blue/20'
			case 'unavailable':
				return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
			default:
				return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700'
		}
	}

	// Get recurrence description
	const getRecurrenceDescription = (availability: CandidateAvailability) => {
		if (!availability.isRecurring || !availability.recurrencePattern) {
			return null
		}

		const pattern = availability.recurrencePattern
		let description = `Every ${pattern.interval > 1 ? pattern.interval + ' ' : ''}${pattern.type}`

		if (pattern.type === 'weekly' && pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
			const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
			const days = pattern.daysOfWeek.map((d) => dayNames[d]).join(', ')
			description += ` on ${days}`
		}

		if (pattern.endDate) {
			description += ` until ${formatDate(new Date(pattern.endDate))}`
		} else if (pattern.maxOccurrences) {
			description += ` (${pattern.maxOccurrences} times)`
		}

		return description
	}

	// Handle delete with confirmation
	const handleDelete = async (availabilityId: string) => {
		if (!onDelete) return

		const confirmed = window.confirm('Are you sure you want to delete this availability slot?')
		if (!confirmed) return

		setDeletingId(availabilityId)
		try {
			await onDelete(availabilityId)
		} finally {
			setDeletingId(null)
		}
	}

	// Group availability by date
	const groupedAvailability = availability.reduce(
		(groups, slot) => {
			const dateKey = formatDate(slot.startTime)
			if (!groups[dateKey]) {
				groups[dateKey] = []
			}
			groups[dateKey].push(slot)
			return groups
		},
		{} as Record<string, CandidateAvailability[]>,
	)

	// Sort dates
	const sortedDates = Object.keys(groupedAvailability).sort((a, b) => {
		const dateA = new Date(groupedAvailability[a][0].startTime)
		const dateB = new Date(groupedAvailability[b][0].startTime)
		return dateA.getTime() - dateB.getTime()
	})

	if (availability.length === 0) {
		return (
			<div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-black">
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
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<h3 className="mb-2 text-lg font-medium text-black dark:text-white">No availability set</h3>
				<p className="text-gray-600 dark:text-gray-400">
					Add your available times to let recruiters know when you can interview.
				</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{sortedDates.map((dateKey) => (
				<div
					key={dateKey}
					className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-black"
				>
					{/* Date Header */}
					<div className="border-b border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
						<h3 className="text-lg font-semibold text-black dark:text-white">{dateKey}</h3>
					</div>

					{/* Availability Slots */}
					<div className="divide-y divide-gray-200 dark:divide-gray-700">
						{groupedAvailability[dateKey]
							.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
							.map((slot) => (
								<div
									key={slot.id}
									className="p-6 transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-900"
								>
									<div className="flex items-center justify-between">
										<div className="min-w-0 flex-1">
											{/* Time Range */}
											<div className="mb-2 flex items-center gap-3">
												<div className="text-lg font-medium text-black dark:text-white">
													{formatTime(slot.startTime)} - {formatTime(slot.endTime)}
												</div>
												<div
													className={`rounded-full border px-3 py-1 text-sm font-medium ${getStatusColor(slot.status)}`}
												>
													{slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
												</div>
											</div>

											{/* Timezone */}
											<div className="mb-1 text-sm text-gray-600 dark:text-gray-400">
												Timezone: {slot.timezone}
											</div>

											{/* Recurrence Info */}
											{slot.isRecurring && (
												<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
													<span>{getRecurrenceDescription(slot)}</span>
												</div>
											)}

											{/* Created/Updated Info */}
											<div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
												Created {formatDateTime(slot.createdAt)}
												{slot.updatedAt.getTime() !== slot.createdAt.getTime() && (
													<span> • Updated {formatDateTime(slot.updatedAt)}</span>
												)}
											</div>
										</div>

										{/* Actions */}
										<div className="ml-4 flex items-center gap-2">
											{onEdit && (
												<button
													onClick={() => onEdit(slot)}
													className="hover:text-apple-blue hover:bg-apple-blue/10 rounded-lg p-2 text-gray-600 transition-all duration-150 dark:text-gray-400"
													disabled={isLoading}
													title="Edit availability"
												>
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
															d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
														/>
													</svg>
												</button>
											)}

											{onDelete && slot.status !== 'booked' && (
												<button
													onClick={() => handleDelete(slot.id)}
													className="hover:text-apple-red hover:bg-apple-red/10 rounded-lg p-2 text-gray-600 transition-all duration-150 dark:text-gray-400"
													disabled={isLoading || deletingId === slot.id}
													title="Delete availability"
												>
													{deletingId === slot.id ? (
														<div className="border-t-apple-red h-5 w-5 animate-spin rounded-full border-2 border-gray-200"></div>
													) : (
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
																d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
															/>
														</svg>
													)}
												</button>
											)}
										</div>
									</div>
								</div>
							))}
					</div>
				</div>
			))}
		</div>
	)
}
