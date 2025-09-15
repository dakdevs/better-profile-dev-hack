'use client'

import { useState } from 'react'

import {
	CandidateWithMatch,
	InterviewType,
	ScheduleInterviewRequest,
	TimeSlot,
} from '~/types/interview-management'

interface InterviewSchedulingModalProps {
	isOpen: boolean
	onClose: () => void
	candidate: CandidateWithMatch
	jobPostingId: string
	onSchedule: (request: ScheduleInterviewRequest) => Promise<void>
	isLoading?: boolean
}

export function InterviewSchedulingModal({
	isOpen,
	onClose,
	candidate,
	jobPostingId,
	onSchedule,
	isLoading = false,
}: InterviewSchedulingModalProps) {
	const [selectedTimes, setSelectedTimes] = useState<TimeSlot[]>([])
	const [interviewType, setInterviewType] = useState<InterviewType>('video')
	const [duration, setDuration] = useState(60)
	const [notes, setNotes] = useState('')
	const [timezone, setTimezone] = useState('UTC')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		if (selectedTimes.length === 0) {
			alert('Please select at least one preferred time slot')
			return
		}

		const request: ScheduleInterviewRequest = {
			jobPostingId,
			candidateId: candidate.candidate.id,
			preferredTimes: selectedTimes,
			interviewType,
			duration,
			notes: notes.trim() || undefined,
			timezone,
		}

		try {
			await onSchedule(request)
			onClose()
			// Reset form
			setSelectedTimes([])
			setNotes('')
			setDuration(60)
			setInterviewType('video')
		} catch (error) {
			console.error('Failed to schedule interview:', error)
		}
	}

	const addTimeSlot = () => {
		const now = new Date()
		const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
		tomorrow.setHours(10, 0, 0, 0) // Default to 10 AM tomorrow

		const endTime = new Date(tomorrow.getTime() + duration * 60 * 1000)

		setSelectedTimes([
			...selectedTimes,
			{
				start: tomorrow,
				end: endTime,
				timezone,
			},
		])
	}

	const removeTimeSlot = (index: number) => {
		setSelectedTimes(selectedTimes.filter((_, i) => i !== index))
	}

	const updateTimeSlot = (index: number, field: 'start' | 'end', value: string) => {
		const updated = [...selectedTimes]
		const newDate = new Date(value)

		if (field === 'start') {
			updated[index] = {
				...updated[index],
				start: newDate,
				end: new Date(newDate.getTime() + duration * 60 * 1000),
			}
		} else {
			updated[index] = {
				...updated[index],
				end: newDate,
			}
		}

		setSelectedTimes(updated)
	}

	if (!isOpen) return null

	return (
		<div className="animate-in fade-in fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm duration-200">
			<div className="animate-in slide-in-from-bottom-5 zoom-in-95 mx-4 max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl duration-300 dark:bg-black">
				{/* Modal Header */}
				<div className="flex items-center justify-between border-b border-gray-200 px-6 py-6 dark:border-gray-700">
					<div>
						<h2 className="m-0 text-xl font-semibold text-black dark:text-white">
							Schedule Interview
						</h2>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
							with {candidate.candidate.name}
						</p>
					</div>
					<button
						onClick={onClose}
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border-none bg-none text-gray-600 transition-all duration-150 ease-out hover:bg-gray-50 hover:text-black dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-white"
					>
						×
					</button>
				</div>

				{/* Modal Content */}
				<div className="max-h-[60vh] overflow-y-auto px-6 py-6">
					<form
						onSubmit={handleSubmit}
						className="space-y-6"
					>
						{/* Candidate Info */}
						<div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
							<h3 className="mb-2 font-medium text-black dark:text-white">Candidate Details</h3>
							<div className="space-y-2 text-sm">
								<p className="text-gray-600 dark:text-gray-400">
									<span className="font-medium">Email:</span> {candidate.candidate.email}
								</p>
								<p className="text-gray-600 dark:text-gray-400">
									<span className="font-medium">Match Score:</span> {candidate.match.score}%
								</p>
								<p className="text-gray-600 dark:text-gray-400">
									<span className="font-medium">Top Skills:</span>{' '}
									{candidate.match.matchingSkills
										.slice(0, 3)
										.map((s) => s.name)
										.join(', ')}
								</p>
							</div>
						</div>

						{/* Interview Type */}
						<div>
							<label className="mb-2 block text-sm font-medium text-black dark:text-white">
								Interview Type
							</label>
							<select
								value={interviewType}
								onChange={(e) => setInterviewType(e.target.value as InterviewType)}
								className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white"
							>
								<option value="video">Video Call</option>
								<option value="phone">Phone Call</option>
								<option value="in-person">In Person</option>
							</select>
						</div>

						{/* Duration */}
						<div>
							<label className="mb-2 block text-sm font-medium text-black dark:text-white">
								Duration (minutes)
							</label>
							<select
								value={duration}
								onChange={(e) => setDuration(parseInt(e.target.value))}
								className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white"
							>
								<option value={30}>30 minutes</option>
								<option value={45}>45 minutes</option>
								<option value={60}>1 hour</option>
								<option value={90}>1.5 hours</option>
								<option value={120}>2 hours</option>
							</select>
						</div>

						{/* Timezone */}
						<div>
							<label className="mb-2 block text-sm font-medium text-black dark:text-white">
								Timezone
							</label>
							<select
								value={timezone}
								onChange={(e) => setTimezone(e.target.value)}
								className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white"
							>
								<option value="UTC">UTC</option>
								<option value="America/New_York">Eastern Time</option>
								<option value="America/Chicago">Central Time</option>
								<option value="America/Denver">Mountain Time</option>
								<option value="America/Los_Angeles">Pacific Time</option>
								<option value="Europe/London">London</option>
								<option value="Europe/Paris">Paris</option>
								<option value="Asia/Tokyo">Tokyo</option>
							</select>
						</div>

						{/* Preferred Times */}
						<div>
							<div className="mb-2 flex items-center justify-between">
								<label className="block text-sm font-medium text-black dark:text-white">
									Preferred Times
								</label>
								<button
									type="button"
									onClick={addTimeSlot}
									className="bg-apple-blue rounded-lg px-3 py-1 text-sm text-white transition-colors duration-150 hover:bg-blue-600"
								>
									Add Time Slot
								</button>
							</div>

							{selectedTimes.length === 0 && (
								<p className="text-sm text-gray-500 italic">Add at least one preferred time slot</p>
							)}

							<div className="space-y-3">
								{selectedTimes.map((slot, index) => (
									<div
										key={index}
										className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
									>
										<div className="grid flex-1 grid-cols-2 gap-2">
											<div>
												<label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
													Start
												</label>
												<input
													type="datetime-local"
													value={slot.start.toISOString().slice(0, 16)}
													onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
													className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-black dark:text-white"
												/>
											</div>
											<div>
												<label className="mb-1 block text-xs text-gray-600 dark:text-gray-400">
													End
												</label>
												<input
													type="datetime-local"
													value={slot.end.toISOString().slice(0, 16)}
													onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
													className="w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-black dark:text-white"
												/>
											</div>
										</div>
										<button
											type="button"
											onClick={() => removeTimeSlot(index)}
											className="text-apple-red rounded p-2 transition-colors duration-150 hover:bg-red-50 dark:hover:bg-red-900/20"
										>
											×
										</button>
									</div>
								))}
							</div>
						</div>

						{/* Notes */}
						<div>
							<label className="mb-2 block text-sm font-medium text-black dark:text-white">
								Notes (Optional)
							</label>
							<textarea
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Add any additional notes or requirements for the interview..."
								rows={3}
								className="font-system focus:border-apple-blue w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
							/>
						</div>
					</form>
				</div>

				{/* Modal Actions */}
				<div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-6 dark:border-gray-700">
					<button
						type="button"
						onClick={onClose}
						disabled={isLoading}
						className="px-4 py-2 text-gray-600 transition-colors duration-150 hover:text-black disabled:opacity-50 dark:text-gray-400 hover:dark:text-white"
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={isLoading || selectedTimes.length === 0}
						className="bg-apple-blue font-system focus-visible:outline-apple-blue disabled:hover:bg-apple-blue inline-flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3 text-[17px] leading-tight font-semibold text-white transition-all duration-150 ease-out outline-none hover:-translate-y-px hover:bg-[#0056CC] focus-visible:outline-2 focus-visible:outline-offset-2 active:translate-y-0 active:bg-[#004499] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
					>
						{isLoading ? (
							<>
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
								Scheduling...
							</>
						) : (
							'Schedule Interview'
						)}
					</button>
				</div>
			</div>
		</div>
	)
}
