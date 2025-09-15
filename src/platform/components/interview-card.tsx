'use client'

import { useState } from 'react'
import { Building, Calendar, Clock, MapPin, Phone, Video } from 'lucide-react'

import { InterviewSession, InterviewStatus, InterviewType } from '~/types/interview-management'

import { InterviewActions } from './interview-actions'
import { InterviewStatusBadge } from './interview-status-badge'

interface InterviewCardProps {
	interview: InterviewSession
	userType: 'candidate' | 'recruiter'
	onConfirm?: (interviewId: string, confirmed: boolean, notes?: string) => Promise<void>
	onReschedule?: (interviewId: string) => void
	onCancel?: (interviewId: string, reason?: string) => Promise<void>
	onEdit?: (interviewId: string) => void
	showActions?: boolean
	compact?: boolean
}

export function InterviewCard({
	interview,
	userType,
	onConfirm,
	onReschedule,
	onCancel,
	onEdit,
	showActions = true,
	compact = false,
}: InterviewCardProps) {
	const [actionLoading, setActionLoading] = useState<string | null>(null)

	const formatDateTime = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			dateStyle: compact ? 'short' : 'medium',
			timeStyle: 'short',
		}).format(new Date(date))
	}

	const formatDuration = (start: Date, end: Date) => {
		const diffInMinutes = Math.round(
			(new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60),
		)
		const hours = Math.floor(diffInMinutes / 60)
		const minutes = diffInMinutes % 60

		if (hours > 0) {
			return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
		}
		return `${minutes}m`
	}

	const getInterviewTypeIcon = (type: InterviewType) => {
		switch (type) {
			case 'video':
				return <Video className="h-4 w-4" />
			case 'phone':
				return <Phone className="h-4 w-4" />
			case 'in-person':
				return <Building className="h-4 w-4" />
			default:
				return <Calendar className="h-4 w-4" />
		}
	}

	const getInterviewTypeColor = (type: InterviewType) => {
		switch (type) {
			case 'video':
				return 'text-apple-blue bg-apple-blue/10'
			case 'phone':
				return 'text-apple-green bg-apple-green/10'
			case 'in-person':
				return 'text-apple-orange bg-apple-orange/10'
			default:
				return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
		}
	}

	const isUpcoming = () => {
		return (
			new Date(interview.scheduledStart) > new Date()
			&& ['scheduled', 'confirmed', 'rescheduled'].includes(interview.status)
		)
	}

	const needsConfirmation = () => {
		if (interview.status !== 'scheduled') return false

		return userType === 'candidate' ? !interview.candidateConfirmed : !interview.recruiterConfirmed
	}

	const handleAction = async (action: string, ...args: any[]) => {
		setActionLoading(action)
		try {
			switch (action) {
				case 'confirm':
					if (onConfirm) await onConfirm(interview.id, args[0], args[1])
					break
				case 'cancel':
					if (onCancel) await onCancel(interview.id, args[0])
					break
				case 'reschedule':
					if (onReschedule) onReschedule(interview.id)
					break
				case 'edit':
					if (onEdit) onEdit(interview.id)
					break
			}
		} catch (error) {
			console.error(`Failed to ${action} interview:`, error)
		} finally {
			setActionLoading(null)
		}
	}

	if (compact) {
		return (
			<div className="rounded-lg border border-gray-200 bg-white p-4 transition-shadow duration-150 hover:shadow-sm dark:border-gray-700 dark:bg-black">
				<div className="flex items-center justify-between">
					<div className="flex min-w-0 flex-1 items-center gap-3">
						<div
							className={`flex h-8 w-8 items-center justify-center rounded-full ${getInterviewTypeColor(interview.interviewType)}`}
						>
							{getInterviewTypeIcon(interview.interviewType)}
						</div>
						<div className="min-w-0 flex-1">
							<div className="mb-1 flex items-center gap-2">
								<h3 className="truncate font-medium text-black dark:text-white">
									{interview.interviewType.charAt(0).toUpperCase()
										+ interview.interviewType.slice(1)}{' '}
									Interview
								</h3>
								<InterviewStatusBadge
									status={interview.status}
									size="sm"
								/>
							</div>
							<p className="truncate text-sm text-gray-600 dark:text-gray-400">
								{formatDateTime(interview.scheduledStart)}
							</p>
						</div>
					</div>

					{showActions && (
						<InterviewActions
							interview={interview}
							userType={userType}
							onConfirm={(confirmed, notes) => handleAction('confirm', confirmed, notes)}
							onReschedule={() => handleAction('reschedule')}
							onCancel={(reason) => handleAction('cancel', reason)}
							onEdit={() => handleAction('edit')}
							loading={actionLoading}
							compact={true}
						/>
					)}
				</div>
			</div>
		)
	}

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-black">
			{/* Header */}
			<div className="mb-4 flex items-start justify-between">
				<div className="flex items-center gap-3">
					<div
						className={`flex h-10 w-10 items-center justify-center rounded-lg ${getInterviewTypeColor(interview.interviewType)}`}
					>
						{getInterviewTypeIcon(interview.interviewType)}
					</div>
					<div>
						<h3 className="text-lg font-semibold text-black dark:text-white">
							{interview.interviewType.charAt(0).toUpperCase() + interview.interviewType.slice(1)}{' '}
							Interview
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{formatDateTime(interview.scheduledStart)} - {formatDateTime(interview.scheduledEnd)}
						</p>
					</div>
				</div>
				<InterviewStatusBadge status={interview.status} />
			</div>

			{/* Interview Details */}
			<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
				<div className="flex items-center gap-2 text-sm">
					<Clock className="h-4 w-4 text-gray-400" />
					<span className="text-gray-600 dark:text-gray-400">Duration:</span>
					<span className="font-medium text-black dark:text-white">
						{formatDuration(interview.scheduledStart, interview.scheduledEnd)}
					</span>
				</div>

				<div className="flex items-center gap-2 text-sm">
					<MapPin className="h-4 w-4 text-gray-400" />
					<span className="text-gray-600 dark:text-gray-400">Timezone:</span>
					<span className="font-medium text-black dark:text-white">{interview.timezone}</span>
				</div>

				{interview.meetingLink && (
					<div className="flex items-center gap-2 text-sm md:col-span-2">
						<Video className="h-4 w-4 text-gray-400" />
						<span className="text-gray-600 dark:text-gray-400">Meeting:</span>
						<a
							href={interview.meetingLink}
							target="_blank"
							rel="noopener noreferrer"
							className="text-apple-blue font-medium hover:underline"
						>
							Join Meeting
						</a>
					</div>
				)}
			</div>

			{/* Confirmation Status */}
			{isUpcoming() && (
				<div className="mb-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
					<div className="flex items-center justify-between text-sm">
						<span className="font-medium text-gray-700 dark:text-gray-300">
							Confirmation Status:
						</span>
						<div className="flex items-center gap-4">
							<span
								className={`flex items-center gap-1 ${interview.candidateConfirmed ? 'text-green-600' : 'text-gray-500'}`}
							>
								{interview.candidateConfirmed ? '✓' : '○'} Candidate
							</span>
							<span
								className={`flex items-center gap-1 ${interview.recruiterConfirmed ? 'text-green-600' : 'text-gray-500'}`}
							>
								{interview.recruiterConfirmed ? '✓' : '○'} Recruiter
							</span>
						</div>
					</div>
				</div>
			)}

			{/* Notes */}
			{interview.notes && (
				<div className="mb-4">
					<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</span>
					<p className="mt-1 rounded-lg bg-gray-50 p-3 text-sm whitespace-pre-wrap text-gray-600 dark:bg-gray-900 dark:text-gray-400">
						{interview.notes}
					</p>
				</div>
			)}

			{/* Actions */}
			{showActions && (
				<div className="border-t border-gray-200 pt-4 dark:border-gray-700">
					<InterviewActions
						interview={interview}
						userType={userType}
						onConfirm={(confirmed, notes) => handleAction('confirm', confirmed, notes)}
						onReschedule={() => handleAction('reschedule')}
						onCancel={(reason) => handleAction('cancel', reason)}
						onEdit={() => handleAction('edit')}
						loading={actionLoading}
					/>
				</div>
			)}
		</div>
	)
}
