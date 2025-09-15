'use client'

import { useEffect, useState } from 'react'

interface GoogleCalendarStatus {
	isConnected: boolean
	calendarId?: string
	lastSync?: string
	error?: string
}

export function CalendarIntegration() {
	// All hooks must be declared at the top level
	const [status, setStatus] = useState<GoogleCalendarStatus>({ isConnected: false })
	const [isLoading, setIsLoading] = useState(true)
	const [isSyncing, setIsSyncing] = useState(false)
	const [calComStatus, setCalComStatus] = useState<{ connected: boolean; username?: string }>({
		connected: false,
	})
	const [isLoadingCalCom, setIsLoadingCalCom] = useState(true)

	const checkCalComStatus = async () => {
		setIsLoadingCalCom(true)
		try {
			const response = await fetch('/api/recruiter/profile')
			if (response.ok) {
				const data = await response.json()
				if (data.success && data.data) {
					setCalComStatus({
						connected: data.data.calComConnected || false,
						username: data.data.calComUsername,
					})
				}
			}
		} catch (error) {
			console.error('Error checking Cal.com status:', error)
		} finally {
			setIsLoadingCalCom(false)
		}
	}

	const checkGoogleCalendarStatus = async () => {
		setIsLoading(true)
		try {
			const response = await fetch('/api/recruiter/calendar/status')
			if (response.ok) {
				const data = await response.json()
				setStatus(data)
			}
		} catch (error) {
			console.error('Error checking calendar status:', error)
			setStatus({ isConnected: false, error: 'Failed to check calendar status' })
		} finally {
			setIsLoading(false)
		}
	}

	// useEffect hook to load both statuses
	useEffect(() => {
		checkGoogleCalendarStatus()
		checkCalComStatus()
	}, [])

	const connectGoogleCalendar = async () => {
		try {
			const response = await fetch('/api/recruiter/calendar/connect', {
				method: 'POST',
			})

			if (response.ok) {
				const data = await response.json()
				if (data.authUrl) {
					window.location.href = data.authUrl
				}
			} else {
				throw new Error('Failed to initiate Google Calendar connection')
			}
		} catch (error) {
			console.error('Error connecting to Google Calendar:', error)
			setStatus((prev) => ({ ...prev, error: 'Failed to connect to Google Calendar' }))
		}
	}

	const disconnectGoogleCalendar = async () => {
		try {
			const response = await fetch('/api/recruiter/calendar/disconnect', {
				method: 'POST',
			})

			if (response.ok) {
				setStatus({ isConnected: false })
			} else {
				throw new Error('Failed to disconnect Google Calendar')
			}
		} catch (error) {
			console.error('Error disconnecting Google Calendar:', error)
			setStatus((prev) => ({ ...prev, error: 'Failed to disconnect Google Calendar' }))
		}
	}

	const syncCalendar = async () => {
		setIsSyncing(true)
		try {
			const response = await fetch('/api/recruiter/calendar/sync', {
				method: 'POST',
			})

			if (response.ok) {
				const data = await response.json()
				setStatus((prev) => ({ ...prev, lastSync: new Date().toISOString() }))
				// Optionally show success message
			} else {
				throw new Error('Failed to sync calendar')
			}
		} catch (error) {
			console.error('Error syncing calendar:', error)
			setStatus((prev) => ({ ...prev, error: 'Failed to sync calendar' }))
		} finally {
			setIsSyncing(false)
		}
	}

	const syncCalComBookings = async () => {
		setIsSyncing(true)
		try {
			const response = await fetch('/api/cal_com_api/sync', {
				method: 'POST',
			})

			if (response.ok) {
				const data = await response.json()
				// Show success message or update UI
				console.log('Cal.com sync result:', data)
			} else {
				throw new Error('Failed to sync Cal.com bookings')
			}
		} catch (error) {
			console.error('Error syncing Cal.com bookings:', error)
		} finally {
			setIsSyncing(false)
		}
	}

	if (isLoading || isLoadingCalCom) {
		return (
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<div className="animate-pulse space-y-4">
					<div className="h-6 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
					<div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
					<div className="h-10 rounded bg-gray-200 dark:bg-gray-700"></div>
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* Cal.com Integration */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<div className="mb-4 flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
						<svg
							className="h-5 w-5 text-white"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-4 0V3m0 4h4m0 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4" />
						</svg>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-black dark:text-white">
							Cal.com Integration
						</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{calComStatus.connected ? `Connected as @${calComStatus.username}` : 'Not connected'}
						</p>
					</div>
				</div>

				{calComStatus.connected ? (
					<div className="space-y-4">
						<div className="bg-apple-green/10 border-apple-green/20 rounded-lg border p-3">
							<div className="mb-2 flex items-center gap-2">
								<svg
									className="text-apple-green h-4 w-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="text-apple-green text-sm font-medium">Cal.com Connected</span>
							</div>
							<p className="text-xs text-gray-600 dark:text-gray-400">
								Bookings from Cal.com will appear in your calendar automatically
							</p>
						</div>

						<div className="flex gap-2">
							<button
								onClick={syncCalComBookings}
								disabled={isSyncing}
								className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-2 font-medium text-white transition-all duration-150 ease-out hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isSyncing ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
										Syncing...
									</>
								) : (
									<>
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
										Sync Cal.com
									</>
								)}
							</button>
							<a
								href="/recruiter/profile"
								className="rounded-lg px-4 py-2 text-gray-600 transition-colors duration-150 hover:bg-purple-50 hover:text-purple-600 dark:text-gray-400 dark:hover:bg-purple-900/20"
							>
								Settings
							</a>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Connect your Cal.com account to automatically sync interview bookings and manage your
							availability.
						</p>

						<a
							href="/recruiter/profile"
							className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-all duration-150 ease-out hover:bg-purple-700"
						>
							<svg
								className="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M8 7V3a2 2 0 012-2h6a2 2 0 012 2v4m-4 0V3m0 4h4m0 0v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h4" />
							</svg>
							Connect Cal.com
						</a>
					</div>
				)}
			</div>

			{/* Google Calendar Integration */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<div className="mb-4 flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-red-500">
						<svg
							className="h-5 w-5 text-white"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
						</svg>
					</div>
					<div>
						<h3 className="text-lg font-semibold text-black dark:text-white">Google Calendar</h3>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{status.isConnected ? 'Connected' : 'Not connected'}
						</p>
					</div>
				</div>

				{status.error && (
					<div className="bg-apple-red/10 border-apple-red/20 mb-4 rounded-lg border p-3">
						<p className="text-apple-red text-sm">{status.error}</p>
					</div>
				)}

				{status.isConnected ? (
					<div className="space-y-4">
						<div className="bg-apple-green/10 border-apple-green/20 rounded-lg border p-3">
							<div className="mb-2 flex items-center gap-2">
								<svg
									className="text-apple-green h-4 w-4"
									fill="currentColor"
									viewBox="0 0 20 20"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clipRule="evenodd"
									/>
								</svg>
								<span className="text-apple-green text-sm font-medium">
									Connected to Google Calendar
								</span>
							</div>
							{status.calendarId && (
								<p className="text-xs text-gray-600 dark:text-gray-400">
									Calendar ID: {status.calendarId}
								</p>
							)}
							{status.lastSync && (
								<p className="text-xs text-gray-600 dark:text-gray-400">
									Last synced: {new Date(status.lastSync).toLocaleString()}
								</p>
							)}
						</div>

						<div className="flex gap-2">
							<button
								onClick={syncCalendar}
								disabled={isSyncing}
								className="bg-apple-blue inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-all duration-150 ease-out hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
							>
								{isSyncing ? (
									<>
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
										Syncing...
									</>
								) : (
									<>
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
										Sync Now
									</>
								)}
							</button>
							<button
								onClick={disconnectGoogleCalendar}
								className="hover:text-apple-red hover:bg-apple-red/10 rounded-lg px-4 py-2 text-gray-600 transition-colors duration-150 dark:text-gray-400"
							>
								Disconnect
							</button>
						</div>
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Connect your Google Calendar to automatically sync interview appointments and manage
							your schedule.
						</p>

						<button
							onClick={connectGoogleCalendar}
							className="bg-apple-blue inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium text-white transition-all duration-150 ease-out hover:bg-blue-600"
						>
							<svg
								className="h-5 w-5"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
							</svg>
							Connect Google Calendar
						</button>
					</div>
				)}
			</div>

			{/* Calendar Settings */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<h3 className="mb-4 text-lg font-semibold text-black dark:text-white">Calendar Settings</h3>

				<div className="space-y-4">
					<div>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								defaultChecked
								className="text-apple-blue focus:ring-apple-blue h-4 w-4 rounded border-gray-300 bg-white focus:ring-2"
							/>
							<span className="text-sm text-black dark:text-white">
								Auto-sync interview appointments
							</span>
						</label>
						<p className="ml-6 text-xs text-gray-600 dark:text-gray-400">
							Automatically create calendar events when interviews are scheduled
						</p>
					</div>

					<div>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								defaultChecked
								className="text-apple-blue focus:ring-apple-blue h-4 w-4 rounded border-gray-300 bg-white focus:ring-2"
							/>
							<span className="text-sm text-black dark:text-white">
								Send calendar invites to candidates
							</span>
						</label>
						<p className="ml-6 text-xs text-gray-600 dark:text-gray-400">
							Include candidates in calendar invitations
						</p>
					</div>

					<div>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="text-apple-blue focus:ring-apple-blue h-4 w-4 rounded border-gray-300 bg-white focus:ring-2"
							/>
							<span className="text-sm text-black dark:text-white">
								Block personal calendar events
							</span>
						</label>
						<p className="ml-6 text-xs text-gray-600 dark:text-gray-400">
							Prevent interview scheduling during personal events
						</p>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<h3 className="mb-4 text-lg font-semibold text-black dark:text-white">Quick Actions</h3>

				<div className="space-y-2">
					<button className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
						View all upcoming interviews
					</button>
					<button className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
						Schedule new interview
					</button>
					<button className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
						Update availability
					</button>
					<button className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800">
						Export calendar
					</button>
				</div>
			</div>
		</div>
	)
}
