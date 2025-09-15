'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Calendar, CheckCircle, Clock, Mail, Video } from 'lucide-react'

interface InterviewDetails {
	id: string
	candidateName: string
	candidateEmail: string
	jobTitle: string
	scheduledStart: string
	scheduledEnd: string
	meetingLink?: string
	organizationName: string
}

export default function InterviewScheduledPage() {
	const searchParams = useSearchParams()
	const interviewId = searchParams.get('id')
	const [interview, setInterview] = useState<InterviewDetails | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (interviewId) {
			fetchInterviewDetails()
		} else {
			setError('No interview ID provided')
			setLoading(false)
		}
	}, [interviewId])

	const fetchInterviewDetails = async () => {
		try {
			const response = await fetch(`/api/interviews/${interviewId}`)
			if (!response.ok) {
				throw new Error('Failed to fetch interview details')
			}

			const data = await response.json()
			if (data.success) {
				setInterview(data.interview)
			} else {
				throw new Error(data.error || 'Failed to load interview details')
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load interview details')
		} finally {
			setLoading(false)
		}
	}

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString)
		return {
			date: date.toLocaleDateString('en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			}),
			time: date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true,
			}),
		}
	}

	const addToCalendar = () => {
		if (!interview) return

		const startDate = new Date(interview.scheduledStart)
		const endDate = new Date(interview.scheduledEnd)

		const formatDateForCalendar = (date: Date) => {
			return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
		}

		const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
			`Interview: ${interview.jobTitle}`,
		)}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${encodeURIComponent(
			`Interview for ${interview.jobTitle} position at ${interview.organizationName}\n\nCandidate: ${interview.candidateName}\nEmail: ${interview.candidateEmail}${
				interview.meetingLink ? `\n\nMeeting Link: ${interview.meetingLink}` : ''
			}`,
		)}&location=${encodeURIComponent(interview.meetingLink || 'Video Call')}`

		window.open(calendarUrl, '_blank')
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
				<div className="text-center">
					<div className="border-t-apple-blue mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 dark:border-gray-700"></div>
					<p className="text-gray-600 dark:text-gray-400">Loading interview details...</p>
				</div>
			</div>
		)
	}

	if (error || !interview) {
		return (
			<div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
				<div className="mx-auto max-w-2xl px-4">
					<div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-black">
						<div className="bg-apple-red/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
							<svg
								className="text-apple-red h-8 w-8"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
								/>
							</svg>
						</div>
						<h1 className="mb-2 text-2xl font-semibold text-black dark:text-white">
							Interview Not Found
						</h1>
						<p className="mb-6 text-gray-600 dark:text-gray-400">
							{error || 'The interview details could not be loaded.'}
						</p>
						<Link
							href="/dashboard"
							className="bg-apple-blue inline-flex items-center rounded-lg px-4 py-2 text-white transition-colors duration-150 hover:bg-blue-600"
						>
							Go to Dashboard
						</Link>
					</div>
				</div>
			</div>
		)
	}

	const { date, time } = formatDateTime(interview.scheduledStart)

	return (
		<div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
			<div className="mx-auto max-w-2xl px-4">
				{/* Success Header */}
				<div className="mb-8 text-center">
					<div className="bg-apple-green/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
						<CheckCircle className="text-apple-green h-10 w-10" />
					</div>
					<h1 className="mb-2 text-3xl font-semibold text-black dark:text-white">
						Interview Scheduled!
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Your interview has been successfully scheduled. You'll receive a confirmation email
						shortly.
					</p>
				</div>

				{/* Interview Details Card */}
				<div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
					<h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
						Interview Details
					</h2>

					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<Calendar className="text-apple-blue mt-0.5 h-5 w-5" />
							<div>
								<h3 className="font-medium text-black dark:text-white">{interview.jobTitle}</h3>
								<p className="text-gray-600 dark:text-gray-400">{interview.organizationName}</p>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<Clock className="text-apple-blue h-5 w-5" />
							<div>
								<p className="font-medium text-black dark:text-white">{date}</p>
								<p className="text-gray-600 dark:text-gray-400">{time}</p>
							</div>
						</div>

						{interview.meetingLink && (
							<div className="flex items-center gap-3">
								<Video className="text-apple-blue h-5 w-5" />
								<div>
									<p className="font-medium text-black dark:text-white">Video Meeting</p>
									<a
										href={interview.meetingLink}
										target="_blank"
										rel="noopener noreferrer"
										className="text-apple-blue transition-colors duration-150 hover:text-blue-600"
									>
										Join meeting link
									</a>
								</div>
							</div>
						)}

						<div className="flex items-center gap-3">
							<Mail className="text-apple-blue h-5 w-5" />
							<div>
								<p className="font-medium text-black dark:text-white">Confirmation Email</p>
								<p className="text-gray-600 dark:text-gray-400">
									Sent to {interview.candidateEmail}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Action Buttons */}
				<div className="mb-6 flex flex-col gap-3 sm:flex-row">
					<button
						onClick={addToCalendar}
						className="bg-apple-blue flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-white transition-colors duration-150 hover:bg-blue-600"
					>
						<Calendar className="h-4 w-4" />
						Add to Calendar
					</button>

					{interview.meetingLink && (
						<a
							href={interview.meetingLink}
							target="_blank"
							rel="noopener noreferrer"
							className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-black transition-colors duration-150 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
						>
							<Video className="h-4 w-4" />
							Test Meeting Link
						</a>
					)}
				</div>

				{/* Next Steps */}
				<div className="rounded-xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20">
					<h3 className="mb-3 text-lg font-semibold text-blue-900 dark:text-blue-100">
						What's Next?
					</h3>
					<ul className="space-y-2 text-blue-800 dark:text-blue-200">
						<li className="flex items-start gap-2">
							<span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></span>
							<span>You'll receive a confirmation email with all the details</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></span>
							<span>Add the interview to your calendar using the button above</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></span>
							<span>Prepare for your interview by reviewing the job description</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-600"></span>
							<span>Test your video setup before the interview</span>
						</li>
					</ul>
				</div>

				{/* Footer */}
				<div className="mt-8 text-center">
					<Link
						href="/dashboard"
						className="text-apple-blue inline-flex items-center px-4 py-2 transition-colors duration-150 hover:text-blue-600"
					>
						← Back to Dashboard
					</Link>
				</div>
			</div>
		</div>
	)
}
