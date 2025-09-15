'use client'

import { useEffect, useState } from 'react'

import { NotificationPreferences, NotificationType } from '~/types/interview-management'

interface NotificationPreferencesProps {
	className?: string
}

export function NotificationPreferencesComponent({ className = '' }: NotificationPreferencesProps) {
	const [preferences, setPreferences] = useState<NotificationPreferences>({
		email: true,
		inApp: true,
		types: [],
	})
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState(false)

	const notificationTypeLabels: Record<NotificationType, { label: string; description: string }> = {
		interview_scheduled: {
			label: 'Interview Scheduled',
			description: 'When an interview is scheduled with you',
		},
		interview_confirmed: {
			label: 'Interview Confirmed',
			description: 'When an interview is confirmed by both parties',
		},
		interview_cancelled: {
			label: 'Interview Cancelled',
			description: 'When an interview is cancelled',
		},
		interview_rescheduled: {
			label: 'Interview Rescheduled',
			description: 'When an interview time is changed',
		},
		availability_updated: {
			label: 'Availability Updated',
			description: 'When your availability is successfully updated',
		},
		job_posted: {
			label: 'Job Posted',
			description: 'When you successfully post a new job (recruiters only)',
		},
		candidate_matched: {
			label: 'Candidate Matched',
			description: 'When a candidate matches your job requirements (recruiters only)',
		},
		application_received: {
			label: 'Application Received',
			description: 'When you receive a new job application (recruiters only)',
		},
	}

	// Fetch current preferences
	const fetchPreferences = async () => {
		try {
			setLoading(true)
			setError(null)

			const response = await fetch('/api/notifications/preferences')

			if (!response.ok) {
				throw new Error('Failed to fetch preferences')
			}

			const data = await response.json()
			setPreferences(data.data)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load preferences')
		} finally {
			setLoading(false)
		}
	}

	// Save preferences
	const savePreferences = async () => {
		try {
			setSaving(true)
			setError(null)
			setSuccess(false)

			const response = await fetch('/api/notifications/preferences', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ preferences }),
			})

			if (!response.ok) {
				throw new Error('Failed to save preferences')
			}

			setSuccess(true)
			setTimeout(() => setSuccess(false), 3000)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to save preferences')
		} finally {
			setSaving(false)
		}
	}

	// Initial load
	useEffect(() => {
		fetchPreferences()
	}, [])

	const handleDeliveryMethodChange = (method: 'email' | 'inApp', enabled: boolean) => {
		setPreferences((prev) => ({
			...prev,
			[method]: enabled,
		}))
	}

	const handleTypeToggle = (type: NotificationType, enabled: boolean) => {
		setPreferences((prev) => ({
			...prev,
			types: enabled ? [...prev.types, type] : prev.types.filter((t) => t !== type),
		}))
	}

	const handleSelectAll = () => {
		const allTypes = Object.keys(notificationTypeLabels) as NotificationType[]
		setPreferences((prev) => ({
			...prev,
			types: allTypes,
		}))
	}

	const handleDeselectAll = () => {
		setPreferences((prev) => ({
			...prev,
			types: [],
		}))
	}

	if (loading) {
		return (
			<div
				className={`rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black ${className}`}
			>
				<div className="text-center">
					<div className="border-t-apple-blue mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-200"></div>
					<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading preferences...</p>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div
				className={`rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black ${className}`}
			>
				<div className="text-center">
					<div className="text-apple-red mb-4 text-4xl">⚠️</div>
					<h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
						Failed to Load Preferences
					</h3>
					<p className="mb-4 text-gray-600 dark:text-gray-400">{error}</p>
					<button
						onClick={fetchPreferences}
						className="bg-apple-blue rounded-lg px-4 py-2 text-white transition-colors duration-150 hover:bg-blue-600"
					>
						Try Again
					</button>
				</div>
			</div>
		)
	}

	return (
		<div
			className={`overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-black ${className}`}
		>
			{/* Header */}
			<div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
				<h2 className="text-xl font-semibold text-black dark:text-white">
					Notification Preferences
				</h2>
				<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
					Choose how and when you want to receive notifications
				</p>
			</div>

			<div className="space-y-6 p-6">
				{/* Delivery Methods */}
				<div>
					<h3 className="mb-4 text-lg font-medium text-black dark:text-white">Delivery Methods</h3>
					<div className="space-y-3">
						<label className="flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								checked={preferences.email}
								onChange={(e) => handleDeliveryMethodChange('email', e.target.checked)}
								className="text-apple-blue focus:ring-apple-blue h-4 w-4 rounded border-gray-300 bg-gray-100 focus:ring-2"
							/>
							<div>
								<div className="text-sm font-medium text-black dark:text-white">
									Email Notifications
								</div>
								<div className="text-xs text-gray-600 dark:text-gray-400">
									Receive notifications via email
								</div>
							</div>
						</label>

						<label className="flex cursor-pointer items-center gap-3">
							<input
								type="checkbox"
								checked={preferences.inApp}
								onChange={(e) => handleDeliveryMethodChange('inApp', e.target.checked)}
								className="text-apple-blue focus:ring-apple-blue h-4 w-4 rounded border-gray-300 bg-gray-100 focus:ring-2"
							/>
							<div>
								<div className="text-sm font-medium text-black dark:text-white">
									In-App Notifications
								</div>
								<div className="text-xs text-gray-600 dark:text-gray-400">
									Show notifications in the app
								</div>
							</div>
						</label>
					</div>
				</div>

				{/* Notification Types */}
				<div>
					<div className="mb-4 flex items-center justify-between">
						<h3 className="text-lg font-medium text-black dark:text-white">Notification Types</h3>
						<div className="flex gap-2">
							<button
								onClick={handleSelectAll}
								className="text-apple-blue text-xs transition-colors duration-150 hover:text-blue-600"
							>
								Select All
							</button>
							<span className="text-xs text-gray-400">|</span>
							<button
								onClick={handleDeselectAll}
								className="text-apple-blue text-xs transition-colors duration-150 hover:text-blue-600"
							>
								Deselect All
							</button>
						</div>
					</div>

					<div className="space-y-3">
						{Object.entries(notificationTypeLabels).map(([type, { label, description }]) => (
							<label
								key={type}
								className="flex cursor-pointer items-start gap-3"
							>
								<input
									type="checkbox"
									checked={preferences.types.includes(type as NotificationType)}
									onChange={(e) => handleTypeToggle(type as NotificationType, e.target.checked)}
									className="text-apple-blue focus:ring-apple-blue mt-0.5 h-4 w-4 rounded border-gray-300 bg-gray-100 focus:ring-2"
								/>
								<div className="flex-1">
									<div className="text-sm font-medium text-black dark:text-white">{label}</div>
									<div className="text-xs text-gray-600 dark:text-gray-400">{description}</div>
								</div>
							</label>
						))}
					</div>
				</div>

				{/* Save Button */}
				<div className="flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-700">
					<div className="flex items-center gap-2">
						{success && (
							<div className="text-apple-green flex items-center gap-2">
								<svg
									className="h-4 w-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="text-sm">Preferences saved!</span>
							</div>
						)}
						{error && <div className="text-apple-red text-sm">{error}</div>}
					</div>

					<button
						onClick={savePreferences}
						disabled={saving}
						className="bg-apple-blue flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors duration-150 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{saving && (
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
						)}
						{saving ? 'Saving...' : 'Save Preferences'}
					</button>
				</div>
			</div>
		</div>
	)
}
