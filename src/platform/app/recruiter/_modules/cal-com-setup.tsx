'use client'

import React, { useState } from 'react'

import { Button } from '~/components/ui/button'

interface CalComSetupProps {
	onSetupComplete?: () => void
	isConnected?: boolean
	calComUsername?: string
}

export function CalComSetup({
	onSetupComplete,
	isConnected = false,
	calComUsername,
}: CalComSetupProps) {
	const [apiKey, setApiKey] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const handleConnect = async () => {
		if (!apiKey.trim()) {
			setError('Please enter your Cal.com API key')
			return
		}

		setIsLoading(true)
		setError('')
		setSuccess('')

		try {
			const response = await fetch('/api/cal_com_api/connect', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					calComApiKey: apiKey,
				}),
			})

			if (!response.ok) {
				const errorData = await response.text()
				throw new Error(errorData || 'Failed to connect to Cal.com')
			}

			const data = await response.json()
			setSuccess(`Successfully connected to Cal.com as ${data.user.username}`)
			setApiKey('')

			if (onSetupComplete) {
				onSetupComplete()
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to connect to Cal.com')
		} finally {
			setIsLoading(false)
		}
	}

	const [eventTypes, setEventTypes] = useState<any[]>([])
	const [showCreateEventType, setShowCreateEventType] = useState(false)
	const [newEventType, setNewEventType] = useState({
		title: '45-Minute Candidate Interview',
		length: 45,
		description: 'Interview session for job candidates',
	})

	const loadEventTypes = async () => {
		try {
			const response = await fetch('/api/cal_com_api/event-types')
			if (response.ok) {
				const data = await response.json()
				if (data.success) {
					setEventTypes(data.eventTypes)
				}
			}
		} catch (err) {
			console.error('Failed to load event types:', err)
		}
	}

	const handleSetupEventType = async () => {
		setIsLoading(true)
		setError('')
		setSuccess('')

		try {
			const response = await fetch('/api/cal_com_api/event-types', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(newEventType),
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to create interview event type')
			}

			const data = await response.json()
			setSuccess(`Interview event type "${data.eventType.title}" created successfully!`)
			setShowCreateEventType(false)

			// Reload event types
			await loadEventTypes()

			if (onSetupComplete) {
				onSetupComplete()
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to create interview event type')
		} finally {
			setIsLoading(false)
		}
	}

	const handleSyncBookings = async () => {
		setIsLoading(true)
		setError('')
		setSuccess('')

		try {
			const response = await fetch('/api/cal_com_api/sync', {
				method: 'POST',
			})

			if (!response.ok) {
				const errorData = await response.json()
				throw new Error(errorData.error || 'Failed to sync bookings')
			}

			const data = await response.json()
			setSuccess(
				`${data.message} - ${data.stats.newInterviews} new, ${data.stats.updatedInterviews} updated`,
			)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to sync bookings')
		} finally {
			setIsLoading(false)
		}
	}

	// Load event types when connected
	React.useEffect(() => {
		if (isConnected) {
			loadEventTypes()
		}
	}, [isConnected])

	if (isConnected) {
		return (
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<div className="mb-4 flex items-center gap-3">
					<div className="bg-apple-green h-3 w-3 rounded-full"></div>
					<h3 className="text-lg font-semibold text-black dark:text-white">Cal.com Connected</h3>
				</div>

				<p className="mb-4 text-gray-600 dark:text-gray-400">
					Your Cal.com account is connected as <strong>@{calComUsername}</strong>
				</p>

				{/* Event Types Section */}
				<div className="mb-4">
					<h4 className="text-md mb-3 font-medium text-black dark:text-white">
						Interview Event Types
					</h4>

					{eventTypes.length > 0 ? (
						<div className="mb-4 space-y-2">
							{eventTypes.map((eventType) => (
								<div
									key={eventType.id}
									className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
								>
									<div>
										<h5 className="font-medium text-black dark:text-white">{eventType.title}</h5>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{eventType.length} minutes • {eventType.hidden ? 'Hidden' : 'Public'}
										</p>
									</div>
									<div className="text-sm text-gray-500 dark:text-gray-400">ID: {eventType.id}</div>
								</div>
							))}
						</div>
					) : (
						<p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
							No interview event types found. Create one to allow candidates to schedule interviews.
						</p>
					)}
				</div>

				{showCreateEventType ? (
					<div className="mb-4 space-y-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
						<h5 className="font-medium text-black dark:text-white">Create New Event Type</h5>

						<div>
							<label className="mb-1 block text-sm font-medium text-black dark:text-white">
								Title
							</label>
							<input
								type="text"
								value={newEventType.title}
								onChange={(e) => setNewEventType((prev) => ({ ...prev, title: e.target.value }))}
								className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-black dark:text-white"
								placeholder="e.g. 45-Minute Candidate Interview"
							/>
						</div>

						<div>
							<label className="mb-1 block text-sm font-medium text-black dark:text-white">
								Duration (minutes)
							</label>
							<input
								type="number"
								value={newEventType.length}
								onChange={(e) =>
									setNewEventType((prev) => ({ ...prev, length: parseInt(e.target.value) || 45 }))
								}
								className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-black dark:text-white"
								min="15"
								max="180"
							/>
						</div>

						<div>
							<label className="mb-1 block text-sm font-medium text-black dark:text-white">
								Description
							</label>
							<textarea
								value={newEventType.description}
								onChange={(e) =>
									setNewEventType((prev) => ({ ...prev, description: e.target.value }))
								}
								className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-black dark:border-gray-700 dark:bg-black dark:text-white"
								rows={3}
								placeholder="Brief description of the interview"
							/>
						</div>

						<div className="flex gap-2">
							<Button
								onClick={handleSetupEventType}
								disabled={isLoading || !newEventType.title.trim()}
								className="bg-apple-blue text-white hover:bg-blue-600"
							>
								{isLoading ? 'Creating...' : 'Create Event Type'}
							</Button>
							<Button
								onClick={() => setShowCreateEventType(false)}
								variant="secondary"
								className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
							>
								Cancel
							</Button>
						</div>
					</div>
				) : (
					<div className="flex gap-3">
						<Button
							onClick={() => setShowCreateEventType(true)}
							className="bg-apple-blue text-white hover:bg-blue-600"
						>
							Create Interview Event Type
						</Button>
						<Button
							onClick={loadEventTypes}
							variant="secondary"
							className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
						>
							Refresh
						</Button>
						<Button
							onClick={handleSyncBookings}
							variant="secondary"
							className="bg-apple-green/10 text-apple-green border-apple-green/20 hover:bg-apple-green/20 border"
						>
							Sync Bookings
						</Button>
					</div>
				)}

				{error && (
					<div className="bg-apple-red/10 border-apple-red/20 mt-4 rounded-lg border p-3">
						<p className="text-apple-red text-sm">{error}</p>
					</div>
				)}

				{success && (
					<div className="bg-apple-green/10 border-apple-green/20 mt-4 rounded-lg border p-3">
						<p className="text-apple-green text-sm">{success}</p>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
			<div className="mb-4 flex items-center gap-3">
				<div className="h-3 w-3 rounded-full bg-gray-400"></div>
				<h3 className="text-lg font-semibold text-black dark:text-white">Connect Cal.com</h3>
			</div>

			<p className="mb-6 text-gray-600 dark:text-gray-400">
				Connect your Cal.com account to allow candidates to schedule interviews with you
				automatically.
			</p>

			<div className="space-y-4">
				<div>
					<label
						htmlFor="cal-api-key"
						className="mb-2 block text-sm font-medium text-black dark:text-white"
					>
						Cal.com API Key
					</label>
					<input
						id="cal-api-key"
						type="password"
						value={apiKey}
						onChange={(e) => setApiKey(e.target.value)}
						placeholder="Enter your Cal.com API key"
						className="font-system focus:border-apple-blue min-h-[44px] w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-[17px] leading-tight text-black transition-colors duration-150 ease-out outline-none placeholder:text-gray-400 focus:shadow-[0_0_0_3px_rgba(0,122,255,0.1)] dark:border-gray-700 dark:bg-black dark:text-white dark:placeholder:text-gray-500"
					/>
					<p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
						You can find your API key in your Cal.com settings under "API Keys"
					</p>
				</div>

				<Button
					onClick={handleConnect}
					disabled={isLoading || !apiKey.trim()}
					className="bg-apple-blue w-full text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isLoading ? 'Connecting...' : 'Connect Cal.com Account'}
				</Button>
			</div>

			{error && (
				<div className="bg-apple-red/10 border-apple-red/20 mt-4 rounded-lg border p-3">
					<p className="text-apple-red text-sm">{error}</p>
				</div>
			)}

			{success && (
				<div className="bg-apple-green/10 border-apple-green/20 mt-4 rounded-lg border p-3">
					<p className="text-apple-green text-sm">{success}</p>
				</div>
			)}

			<div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
				<h4 className="mb-2 text-sm font-medium text-black dark:text-white">
					How to get your Cal.com API Key:
				</h4>
				<ol className="list-inside list-decimal space-y-1 text-sm text-gray-600 dark:text-gray-400">
					<li>Go to your Cal.com dashboard</li>
					<li>Navigate to Settings → API Keys</li>
					<li>Click "Create API Key"</li>
					<li>Copy the generated key and paste it above</li>
				</ol>
			</div>
		</div>
	)
}
