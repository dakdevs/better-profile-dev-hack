'use client'

import { useState } from 'react'
import {
	Calendar,
	Check,
	Edit,
	ExternalLink,
	MessageSquare,
	MoreHorizontal,
	Trash2,
	X,
} from 'lucide-react'

import { InterviewSession } from '~/types/interview-management'

interface InterviewActionsProps {
	interview: InterviewSession
	userType: 'candidate' | 'recruiter'
	onConfirm?: (confirmed: boolean, notes?: string) => Promise<void>
	onReschedule?: () => void
	onCancel?: (reason?: string) => Promise<void>
	onEdit?: () => void
	loading?: string | null
	compact?: boolean
}

export function InterviewActions({
	interview,
	userType,
	onConfirm,
	onReschedule,
	onCancel,
	onEdit,
	loading,
	compact = false,
}: InterviewActionsProps) {
	const [showCancelModal, setShowCancelModal] = useState(false)
	const [showConfirmModal, setShowConfirmModal] = useState(false)
	const [cancelReason, setCancelReason] = useState('')
	const [confirmNotes, setConfirmNotes] = useState('')
	const [showDropdown, setShowDropdown] = useState(false)

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

	const canReschedule = () => {
		return isUpcoming() && ['scheduled', 'confirmed'].includes(interview.status)
	}

	const canCancel = () => {
		return isUpcoming()
	}

	const canEdit = () => {
		return userType === 'recruiter' && isUpcoming()
	}

	const handleConfirm = async (confirmed: boolean) => {
		if (!onConfirm) return

		try {
			await onConfirm(confirmed, confirmNotes || undefined)
			setShowConfirmModal(false)
			setConfirmNotes('')
		} catch (error) {
			console.error('Failed to confirm interview:', error)
		}
	}

	const handleCancel = async () => {
		if (!onCancel) return

		try {
			await onCancel(cancelReason || undefined)
			setShowCancelModal(false)
			setCancelReason('')
		} catch (error) {
			console.error('Failed to cancel interview:', error)
		}
	}

	const joinMeeting = () => {
		if (interview.meetingLink) {
			window.open(interview.meetingLink, '_blank', 'noopener,noreferrer')
		}
	}

	if (compact) {
		return (
			<div className="relative">
				<button
					onClick={() => setShowDropdown(!showDropdown)}
					className="rounded p-1 text-gray-400 transition-colors duration-150 hover:text-gray-600 dark:hover:text-gray-300"
					disabled={loading !== null}
				>
					<MoreHorizontal className="h-4 w-4" />
				</button>

				{showDropdown && (
					<>
						<div
							className="fixed inset-0 z-10"
							onClick={() => setShowDropdown(false)}
						/>
						<div className="absolute top-full right-0 z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-black">
							<div className="py-1">
								{needsConfirmation() && onConfirm && (
									<>
										<button
											onClick={() => {
												setShowDropdown(false)
												handleConfirm(true)
											}}
											disabled={loading === 'confirm'}
											className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-900"
										>
											<div className="flex items-center gap-2">
												<Check className="h-4 w-4" />
												{loading === 'confirm' ? 'Confirming...' : 'Confirm'}
											</div>
										</button>
										<button
											onClick={() => {
												setShowDropdown(false)
												handleConfirm(false)
											}}
											disabled={loading === 'confirm'}
											className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-900"
										>
											<div className="flex items-center gap-2">
												<X className="h-4 w-4" />
												Decline
											</div>
										</button>
									</>
								)}

								{interview.meetingLink && (
									<button
										onClick={() => {
											setShowDropdown(false)
											joinMeeting()
										}}
										className="text-apple-blue w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-900"
									>
										<div className="flex items-center gap-2">
											<ExternalLink className="h-4 w-4" />
											Join Meeting
										</div>
									</button>
								)}

								{canReschedule() && onReschedule && (
									<button
										onClick={() => {
											setShowDropdown(false)
											onReschedule()
										}}
										disabled={loading === 'reschedule'}
										className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-900"
									>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											Reschedule
										</div>
									</button>
								)}

								{canEdit() && onEdit && (
									<button
										onClick={() => {
											setShowDropdown(false)
											onEdit()
										}}
										className="w-full px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900"
									>
										<div className="flex items-center gap-2">
											<Edit className="h-4 w-4" />
											Edit
										</div>
									</button>
								)}

								{canCancel() && onCancel && (
									<button
										onClick={() => {
											setShowDropdown(false)
											setShowCancelModal(true)
										}}
										className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:hover:bg-gray-900"
									>
										<div className="flex items-center gap-2">
											<Trash2 className="h-4 w-4" />
											Cancel
										</div>
									</button>
								)}
							</div>
						</div>
					</>
				)}

				{/* Cancel Modal */}
				{showCancelModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
						<div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-black">
							<div className="p-6">
								<h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
									Cancel Interview
								</h3>
								<p className="mb-4 text-gray-600 dark:text-gray-400">
									Are you sure you want to cancel this interview? This action cannot be undone.
								</p>
								<textarea
									value={cancelReason}
									onChange={(e) => setCancelReason(e.target.value)}
									placeholder="Reason for cancellation (optional)"
									className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-black dark:border-gray-700 dark:bg-black dark:text-white"
									rows={3}
								/>
								<div className="mt-4 flex gap-2">
									<button
										onClick={() => setShowCancelModal(false)}
										className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 transition-colors duration-150 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
									>
										Keep Interview
									</button>
									<button
										onClick={handleCancel}
										disabled={loading === 'cancel'}
										className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors duration-150 hover:bg-red-700 disabled:opacity-50"
									>
										{loading === 'cancel' ? 'Cancelling...' : 'Cancel Interview'}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="flex flex-wrap items-center gap-2">
			{/* Meeting Link */}
			{interview.meetingLink && (
				<button
					onClick={joinMeeting}
					className="bg-apple-blue inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white transition-colors duration-150 hover:bg-blue-600"
				>
					<ExternalLink className="h-4 w-4" />
					Join Meeting
				</button>
			)}

			{/* Confirmation Actions */}
			{needsConfirmation() && onConfirm && (
				<>
					<button
						onClick={() => setShowConfirmModal(true)}
						disabled={loading === 'confirm'}
						className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm text-white transition-colors duration-150 hover:bg-green-700 disabled:opacity-50"
					>
						<Check className="h-4 w-4" />
						{loading === 'confirm' ? 'Confirming...' : 'Confirm'}
					</button>
					<button
						onClick={() => handleConfirm(false)}
						disabled={loading === 'confirm'}
						className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-3 py-2 text-sm text-white transition-colors duration-150 hover:bg-gray-700 disabled:opacity-50"
					>
						<X className="h-4 w-4" />
						Decline
					</button>
				</>
			)}

			{/* Reschedule */}
			{canReschedule() && onReschedule && (
				<button
					onClick={onReschedule}
					disabled={loading === 'reschedule'}
					className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors duration-150 hover:bg-blue-700 disabled:opacity-50"
				>
					<Calendar className="h-4 w-4" />
					Reschedule
				</button>
			)}

			{/* Edit */}
			{canEdit() && onEdit && (
				<button
					onClick={onEdit}
					className="inline-flex items-center gap-2 rounded-lg bg-gray-600 px-3 py-2 text-sm text-white transition-colors duration-150 hover:bg-gray-700"
				>
					<Edit className="h-4 w-4" />
					Edit
				</button>
			)}

			{/* Cancel */}
			{canCancel() && onCancel && (
				<button
					onClick={() => setShowCancelModal(true)}
					className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm text-white transition-colors duration-150 hover:bg-red-700"
				>
					<Trash2 className="h-4 w-4" />
					Cancel
				</button>
			)}

			{/* Confirm Modal */}
			{showConfirmModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-black">
						<div className="p-6">
							<h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
								Confirm Interview
							</h3>
							<p className="mb-4 text-gray-600 dark:text-gray-400">
								Please confirm your attendance for this interview.
							</p>
							<textarea
								value={confirmNotes}
								onChange={(e) => setConfirmNotes(e.target.value)}
								placeholder="Add any notes or questions (optional)"
								className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-black dark:border-gray-700 dark:bg-black dark:text-white"
								rows={3}
							/>
							<div className="mt-4 flex gap-2">
								<button
									onClick={() => setShowConfirmModal(false)}
									className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 transition-colors duration-150 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
								>
									Cancel
								</button>
								<button
									onClick={() => handleConfirm(true)}
									disabled={loading === 'confirm'}
									className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white transition-colors duration-150 hover:bg-green-700 disabled:opacity-50"
								>
									{loading === 'confirm' ? 'Confirming...' : 'Confirm Interview'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Cancel Modal */}
			{showCancelModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
					<div className="w-full max-w-md rounded-xl bg-white shadow-2xl dark:bg-black">
						<div className="p-6">
							<h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
								Cancel Interview
							</h3>
							<p className="mb-4 text-gray-600 dark:text-gray-400">
								Are you sure you want to cancel this interview? This action cannot be undone.
							</p>
							<textarea
								value={cancelReason}
								onChange={(e) => setCancelReason(e.target.value)}
								placeholder="Reason for cancellation (optional)"
								className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-black dark:border-gray-700 dark:bg-black dark:text-white"
								rows={3}
							/>
							<div className="mt-4 flex gap-2">
								<button
									onClick={() => setShowCancelModal(false)}
									className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-gray-600 transition-colors duration-150 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900"
								>
									Keep Interview
								</button>
								<button
									onClick={handleCancel}
									disabled={loading === 'cancel'}
									className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors duration-150 hover:bg-red-700 disabled:opacity-50"
								>
									{loading === 'cancel' ? 'Cancelling...' : 'Cancel Interview'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
