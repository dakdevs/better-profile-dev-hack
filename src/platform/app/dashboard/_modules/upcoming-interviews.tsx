'use client'

import { useState } from 'react'
import { Calendar, Clock, ExternalLink, MapPin, Phone, Plus, User, Video } from 'lucide-react'

const mockInterviews = [
	{
		id: '1',
		jobTitle: 'Senior Frontend Developer',
		company: 'TechCorp Inc.',
		interviewType: 'video',
		scheduledAt: '2025-01-10T14:00:00Z',
		duration: '60 minutes',
		interviewerName: 'Sarah Johnson',
		interviewerEmail: 'sarah.johnson@techcorp.com',
		meetingLink: 'https://zoom.us/j/123456789',
		status: 'scheduled',
	},
	{
		id: '2',
		jobTitle: 'Product Manager',
		company: 'StartupXYZ',
		interviewType: 'phone',
		scheduledAt: '2025-01-12T10:30:00Z',
		duration: '45 minutes',
		interviewerName: 'Mike Chen',
		interviewerEmail: 'mike.chen@startupxyz.com',
		status: 'scheduled',
	},
	{
		id: '3',
		jobTitle: 'UX Designer',
		company: 'Design Studio',
		interviewType: 'in-person',
		scheduledAt: '2025-01-15T15:00:00Z',
		duration: '90 minutes',
		interviewerName: 'Emily Davis',
		interviewerEmail: 'emily.davis@designstudio.com',
		location: '123 Design Ave, New York, NY',
		status: 'scheduled',
	},
]

const interviewTypeConfig = {
	video: { icon: Video, label: 'Video Call', color: 'text-blue-600 bg-blue-50' },
	phone: { icon: Phone, label: 'Phone Call', color: 'text-green-600 bg-green-50' },
	'in-person': { icon: MapPin, label: 'In Person', color: 'text-purple-600 bg-purple-50' },
	technical: { icon: Video, label: 'Technical', color: 'text-orange-600 bg-orange-50' },
}

export function UpcomingInterviews() {
	const [showAll, setShowAll] = useState(false)

	const displayedInterviews = showAll ? mockInterviews : mockInterviews.slice(0, 3)

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString)
		const today = new Date()
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		const isToday = date.toDateString() === today.toDateString()
		const isTomorrow = date.toDateString() === tomorrow.toDateString()

		const timeStr = date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		})

		if (isToday) return `Today at ${timeStr}`
		if (isTomorrow) return `Tomorrow at ${timeStr}`

		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		})
	}

	const getTimeUntil = (dateString: string) => {
		const date = new Date(dateString)
		const now = new Date()
		const diffTime = date.getTime() - now.getTime()
		const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))

		if (diffHours < 1) return 'Starting soon'
		if (diffHours < 24) return `In ${diffHours} hours`
		const diffDays = Math.ceil(diffHours / 24)
		return `In ${diffDays} days`
	}

	return (
		<div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
			{/* Header */}
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h2 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h2>
					<p className="mt-1 text-sm text-gray-600">{mockInterviews.length} scheduled</p>
				</div>
				<button className="rounded-lg p-2 transition-colors hover:bg-gray-100">
					<Plus className="h-4 w-4 text-gray-600" />
				</button>
			</div>

			{/* Interviews List */}
			<div className="space-y-4">
				{displayedInterviews.map((interview) => {
					const typeConfig =
						interviewTypeConfig[interview.interviewType as keyof typeof interviewTypeConfig]
					const TypeIcon = typeConfig.icon

					return (
						<div
							key={interview.id}
							className="group rounded-xl border border-gray-200 p-4 transition-all hover:border-gray-300 hover:shadow-sm"
						>
							{/* Header */}
							<div className="mb-3 flex items-start justify-between">
								<div className="flex-1">
									<h3 className="mb-1 text-sm font-semibold text-gray-900">{interview.jobTitle}</h3>
									<p className="text-sm text-gray-600">{interview.company}</p>
								</div>
								<div
									className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${typeConfig.color}`}
								>
									<TypeIcon className="h-3 w-3" />
									{typeConfig.label}
								</div>
							</div>

							{/* Time & Duration */}
							<div className="mb-3 flex items-center gap-4 text-sm text-gray-600">
								<div className="flex items-center gap-1">
									<Calendar className="h-3 w-3" />
									{formatDateTime(interview.scheduledAt)}
								</div>
								<div className="flex items-center gap-1">
									<Clock className="h-3 w-3" />
									{interview.duration}
								</div>
							</div>

							{/* Interviewer */}
							<div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
								<User className="h-3 w-3" />
								<span>{interview.interviewerName}</span>
							</div>

							{/* Time Until */}
							<div className="flex items-center justify-between">
								<span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-600">
									{getTimeUntil(interview.scheduledAt)}
								</span>
								<div className="flex items-center gap-2">
									{interview.meetingLink && (
										<button className="text-xs font-medium text-blue-600 hover:text-blue-700">
											Join Call
										</button>
									)}
									<button className="text-xs font-medium text-gray-600 hover:text-gray-700">
										Details
									</button>
								</div>
							</div>
						</div>
					)
				})}
			</div>

			{/* Show More/Less */}
			{mockInterviews.length > 3 && (
				<div className="mt-4">
					<button
						onClick={() => setShowAll(!showAll)}
						className="w-full rounded-lg py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
					>
						{showAll ? 'Show less' : `Show ${mockInterviews.length - 3} more`}
					</button>
				</div>
			)}

			{mockInterviews.length === 0 && (
				<div className="py-8 text-center">
					<Calendar className="mx-auto mb-3 h-8 w-8 text-gray-300" />
					<h3 className="mb-1 font-medium text-gray-900">No interviews scheduled</h3>
					<p className="mb-4 text-sm text-gray-600">Your upcoming interviews will appear here</p>
					<button className="text-sm font-medium text-blue-600 hover:text-blue-700">
						Schedule Interview
					</button>
				</div>
			)}

			{/* Quick Actions */}
			<div className="mt-6 border-t border-gray-100 pt-4">
				<div className="grid grid-cols-2 gap-3">
					<button className="flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
						<Calendar className="h-4 w-4" />
						Calendar
					</button>
					<button className="flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900">
						<Clock className="h-4 w-4" />
						Reschedule
					</button>
				</div>
			</div>
		</div>
	)
}
