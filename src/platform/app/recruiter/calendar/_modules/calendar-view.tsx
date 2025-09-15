'use client'

import { useEffect, useState } from 'react'

interface CalendarEvent {
	id: string
	title: string
	start: string
	end: string
	type: 'interview' | 'meeting' | 'other'
	candidateName?: string
	jobTitle?: string
	status?: string
	meetingLink?: string
	source?: 'local' | 'calcom'
}

export function CalendarView() {
	const [currentDate, setCurrentDate] = useState(new Date())
	const [events, setEvents] = useState<CalendarEvent[]>([])
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		loadCalendarEvents()
	}, [currentDate])

	const loadCalendarEvents = async () => {
		setIsLoading(true)
		try {
			// Load both local interviews and Cal.com bookings
			const [interviewsResponse, calComResponse] = await Promise.all([
				fetch(`/api/recruiter/interviews?filter=all`),
				fetch(
					`/api/cal_com_api/bookings?month=${currentDate.getMonth()}&year=${currentDate.getFullYear()}`,
				),
			])

			const combinedEvents: CalendarEvent[] = []

			// Process local interviews
			if (interviewsResponse.ok) {
				const interviewsData = await interviewsResponse.json()
				if (interviewsData.success && interviewsData.interviews) {
					const interviewEvents = interviewsData.interviews.map((interview: any) => ({
						id: `interview-${interview.id}`,
						title: interview.candidateName || 'Interview',
						start: interview.scheduledStart,
						end: interview.scheduledEnd,
						type: 'interview' as const,
						candidateName: interview.candidateName,
						jobTitle: interview.jobTitle,
						status: interview.status,
						meetingLink: interview.meetingLink,
						source: 'local',
					}))
					combinedEvents.push(...interviewEvents)
				}
			}

			// Process Cal.com bookings
			if (calComResponse.ok) {
				const calComData = await calComResponse.json()
				if (calComData.success && calComData.bookings) {
					const calComEvents = calComData.bookings.map((booking: any) => ({
						id: `calcom-${booking.id}`,
						title: booking.title || 'Cal.com Booking',
						start: booking.startTime,
						end: booking.endTime,
						type: 'interview' as const,
						candidateName: booking.attendees?.[0]?.name || 'Unknown',
						jobTitle: booking.eventType?.title || 'Interview',
						status: booking.status?.toLowerCase() || 'scheduled',
						meetingLink: booking.location,
						source: 'calcom',
					}))
					combinedEvents.push(...calComEvents)
				}
			}

			setEvents(combinedEvents)
		} catch (error) {
			console.error('Error loading calendar events:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const getDaysInMonth = (date: Date) => {
		const year = date.getFullYear()
		const month = date.getMonth()
		const firstDay = new Date(year, month, 1)
		const lastDay = new Date(year, month + 1, 0)
		const daysInMonth = lastDay.getDate()
		const startingDayOfWeek = firstDay.getDay()

		const days = []

		// Add empty cells for days before the first day of the month
		for (let i = 0; i < startingDayOfWeek; i++) {
			days.push(null)
		}

		// Add days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			days.push(new Date(year, month, day))
		}

		return days
	}

	const getEventsForDate = (date: Date | null) => {
		if (!date) return []
		const dateStr = date.toISOString().split('T')[0]
		return events.filter((event) => event.start.startsWith(dateStr))
	}

	const navigateMonth = (direction: 'prev' | 'next') => {
		setCurrentDate((prev) => {
			const newDate = new Date(prev)
			if (direction === 'prev') {
				newDate.setMonth(prev.getMonth() - 1)
			} else {
				newDate.setMonth(prev.getMonth() + 1)
			}
			return newDate
		})
	}

	const formatTime = (dateString: string) => {
		return new Date(dateString).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		})
	}

	const days = getDaysInMonth(currentDate)
	const monthYear = currentDate.toLocaleDateString('en-US', {
		month: 'long',
		year: 'numeric',
	})

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			{/* Calendar Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="text-xl font-semibold text-black dark:text-white">{monthYear}</h2>
					<div className="mt-2 flex items-center gap-4">
						<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
							<div className="bg-apple-blue/20 border-apple-blue h-3 w-3 rounded-sm border-l-2"></div>
							<span>Local Interviews</span>
						</div>
						<div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
							<div className="bg-apple-green/20 border-apple-green h-3 w-3 rounded-sm border-l-2"></div>
							<span>Cal.com Bookings</span>
						</div>
					</div>
				</div>
				<div className="flex gap-2">
					<button
						onClick={loadCalendarEvents}
						className="rounded-lg p-2 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
						title="Refresh calendar"
					>
						<svg
							className="h-5 w-5 text-gray-600 dark:text-gray-400"
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
					<button
						onClick={() => navigateMonth('prev')}
						className="rounded-lg p-2 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						<svg
							className="h-5 w-5 text-gray-600 dark:text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<button
						onClick={() => setCurrentDate(new Date())}
						className="rounded-lg bg-gray-100 px-3 py-2 text-sm transition-colors duration-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
					>
						Today
					</button>
					<button
						onClick={() => navigateMonth('next')}
						className="rounded-lg p-2 transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-gray-800"
					>
						<svg
							className="h-5 w-5 text-gray-600 dark:text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			</div>

			{/* Calendar Grid */}
			<div className="mb-4 grid grid-cols-7 gap-1">
				{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
					<div
						key={day}
						className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400"
					>
						{day}
					</div>
				))}
			</div>

			{isLoading ? (
				<div className="grid grid-cols-7 gap-1">
					{Array.from({ length: 35 }).map((_, i) => (
						<div
							key={i}
							className="aspect-square animate-pulse rounded bg-gray-50 p-2 dark:bg-gray-900"
						/>
					))}
				</div>
			) : (
				<div className="grid grid-cols-7 gap-1">
					{days.map((date, index) => {
						const dayEvents = getEventsForDate(date)
						const isToday = date && date.toDateString() === new Date().toDateString()
						const isCurrentMonth = date && date.getMonth() === currentDate.getMonth()

						return (
							<div
								key={index}
								className={`aspect-square rounded border border-gray-100 p-1 transition-colors duration-150 dark:border-gray-800 ${
									isCurrentMonth ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-gray-900'
								} ${isToday ? 'ring-apple-blue ring-2' : ''}`}
							>
								{date && (
									<>
										<div
											className={`mb-1 text-sm font-medium ${
												isCurrentMonth
													? 'text-black dark:text-white'
													: 'text-gray-400 dark:text-gray-600'
											} ${isToday ? 'text-apple-blue' : ''}`}
										>
											{date.getDate()}
										</div>
										<div className="space-y-1">
											{dayEvents.slice(0, 2).map((event) => (
												<div
													key={event.id}
													className={`relative truncate rounded px-1 py-0.5 text-xs ${
														event.type === 'interview'
															? event.source === 'calcom'
																? 'bg-apple-green/10 text-apple-green border-apple-green border-l-2'
																: 'bg-apple-blue/10 text-apple-blue border-apple-blue border-l-2'
															: event.type === 'meeting'
																? 'bg-apple-orange/10 text-apple-orange'
																: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
													}`}
													title={`${event.candidateName || event.title} - ${formatTime(event.start)} ${event.source === 'calcom' ? '(Cal.com)' : ''}`}
												>
													<div className="flex items-center gap-1">
														{event.source === 'calcom' && (
															<div className="bg-apple-green h-1 w-1 flex-shrink-0 rounded-full"></div>
														)}
														<span className="truncate">
															{formatTime(event.start)} {event.candidateName || event.title}
														</span>
													</div>
												</div>
											))}
											{dayEvents.length > 2 && (
												<div className="px-1 text-xs text-gray-500 dark:text-gray-400">
													+{dayEvents.length - 2} more
												</div>
											)}
										</div>
									</>
								)}
							</div>
						)
					})}
				</div>
			)}

			{/* Upcoming Events */}
			<div className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
				<h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
					Upcoming Interviews
				</h3>
				<div className="space-y-3">
					{events
						.filter((event) => event.type === 'interview' && new Date(event.start) > new Date())
						.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
						.slice(0, 5)
						.map((event) => (
							<div
								key={event.id}
								className={`flex items-center justify-between rounded-lg border-l-4 p-3 ${
									event.source === 'calcom'
										? 'bg-apple-green/5 border-apple-green'
										: 'bg-apple-blue/5 border-apple-blue'
								}`}
							>
								<div className="flex-1">
									<div className="mb-1 flex items-center gap-2">
										<div className="font-medium text-black dark:text-white">
											{event.candidateName} - {event.jobTitle}
										</div>
										<div
											className={`rounded-full px-2 py-1 text-xs ${
												event.source === 'calcom'
													? 'bg-apple-green/10 text-apple-green'
													: 'bg-apple-blue/10 text-apple-blue'
											}`}
										>
											{event.source === 'calcom' ? 'Cal.com' : 'Local'}
										</div>
										{event.status && (
											<div
												className={`rounded-full px-2 py-1 text-xs capitalize ${
													event.status === 'confirmed'
														? 'bg-apple-green/10 text-apple-green'
														: event.status === 'cancelled'
															? 'bg-apple-red/10 text-apple-red'
															: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
												}`}
											>
												{event.status}
											</div>
										)}
									</div>
									<div className="text-sm text-gray-600 dark:text-gray-400">
										{new Date(event.start).toLocaleDateString('en-US', {
											weekday: 'long',
											month: 'short',
											day: 'numeric',
										})}{' '}
										at {formatTime(event.start)}
									</div>
								</div>
								<div className="flex items-center gap-2">
									{event.meetingLink && (
										<a
											href={event.meetingLink}
											target="_blank"
											rel="noopener noreferrer"
											className="text-apple-blue hover:bg-apple-blue/10 rounded px-3 py-1 text-sm transition-colors duration-150"
										>
											Join Meeting
										</a>
									)}
									<button className="rounded px-3 py-1 text-sm text-gray-600 transition-colors duration-150 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
										Details
									</button>
								</div>
							</div>
						))}
					{events.filter(
						(event) => event.type === 'interview' && new Date(event.start) > new Date(),
					).length === 0 && (
						<div className="py-8 text-center text-gray-500 dark:text-gray-400">
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
										d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-4 0V3m0 4h4m0 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4"
									/>
								</svg>
							</div>
							<p className="font-medium">No upcoming interviews scheduled</p>
							<p className="mt-1 text-sm">
								Interviews will appear here once candidates book time slots
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
