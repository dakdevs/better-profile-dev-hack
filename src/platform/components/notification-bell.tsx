'use client'

import { useEffect, useState } from 'react'

import { InterviewNotification } from '~/types/interview-management'

interface NotificationBellProps {
	className?: string
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
	const [unreadCount, setUnreadCount] = useState(0)
	const [isOpen, setIsOpen] = useState(false)
	const [notifications, setNotifications] = useState<InterviewNotification[]>([])
	const [loading, setLoading] = useState(false)

	// Fetch unread count
	const fetchUnreadCount = async () => {
		try {
			const response = await fetch('/api/notifications/unread-count')
			if (response.ok) {
				const data = await response.json()
				setUnreadCount(data.data.count)
			}
		} catch (error) {
			console.error('Failed to fetch unread count:', error)
		}
	}

	// Fetch recent notifications
	const fetchNotifications = async () => {
		if (loading) return

		setLoading(true)
		try {
			const response = await fetch('/api/notifications?limit=10')
			if (response.ok) {
				const data = await response.json()
				setNotifications(data.data || [])
			}
		} catch (error) {
			console.error('Failed to fetch notifications:', error)
		} finally {
			setLoading(false)
		}
	}

	// Mark notifications as read
	const markAsRead = async (notificationIds: string[]) => {
		try {
			const response = await fetch('/api/notifications/mark-read', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ notificationIds }),
			})

			if (response.ok) {
				// Update local state
				setNotifications((prev) =>
					prev.map((n) => (notificationIds.includes(n.id) ? { ...n, read: true } : n)),
				)
				// Refresh unread count
				fetchUnreadCount()
			}
		} catch (error) {
			console.error('Failed to mark notifications as read:', error)
		}
	}

	// Initial load
	useEffect(() => {
		fetchUnreadCount()
	}, [])

	// Load notifications when dropdown opens
	useEffect(() => {
		if (isOpen && notifications.length === 0) {
			fetchNotifications()
		}
	}, [isOpen])

	// Auto-refresh unread count every 30 seconds
	useEffect(() => {
		const interval = setInterval(fetchUnreadCount, 30000)
		return () => clearInterval(interval)
	}, [])

	const handleBellClick = () => {
		setIsOpen(!isOpen)
	}

	const handleNotificationClick = (notification: InterviewNotification) => {
		if (!notification.read) {
			markAsRead([notification.id])
		}
		// TODO: Navigate to relevant page based on notification type
	}

	const formatTimeAgo = (date: Date) => {
		const now = new Date()
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

		if (diffInMinutes < 1) return 'Just now'
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`

		const diffInHours = Math.floor(diffInMinutes / 60)
		if (diffInHours < 24) return `${diffInHours}h ago`

		const diffInDays = Math.floor(diffInHours / 24)
		if (diffInDays < 7) return `${diffInDays}d ago`

		return date.toLocaleDateString()
	}

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case 'interview_scheduled':
			case 'interview_confirmed':
				return '📅'
			case 'interview_cancelled':
				return '❌'
			case 'interview_rescheduled':
				return '🔄'
			case 'availability_updated':
				return '⏰'
			case 'job_posted':
				return '💼'
			case 'candidate_matched':
			case 'application_received':
				return '👤'
			default:
				return '🔔'
		}
	}

	return (
		<div className={`relative ${className}`}>
			{/* Bell Button */}
			<button
				onClick={handleBellClick}
				className="focus-visible:outline-apple-blue relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-gray-600 transition-colors duration-150 ease-out outline-none hover:bg-gray-50 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-gray-400 hover:dark:bg-gray-900 hover:dark:text-white"
				aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
			>
				{/* Bell Icon */}
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
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>

				{/* Unread Badge */}
				{unreadCount > 0 && (
					<span className="bg-apple-red absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-xs font-semibold text-white">
						{unreadCount > 99 ? '99+' : unreadCount}
					</span>
				)}
			</button>

			{/* Dropdown */}
			{isOpen && (
				<>
					{/* Backdrop */}
					<div
						className="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
					/>

					{/* Dropdown Content */}
					<div className="absolute top-full right-0 z-50 mt-2 max-h-96 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-black">
						{/* Header */}
						<div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-semibold text-black dark:text-white">Notifications</h3>
								{unreadCount > 0 && (
									<button
										onClick={() => {
											const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
											if (unreadIds.length > 0) {
												markAsRead(unreadIds)
											}
										}}
										className="text-apple-blue text-sm transition-colors duration-150 hover:text-blue-600"
									>
										Mark all read
									</button>
								)}
							</div>
						</div>

						{/* Notifications List */}
						<div className="max-h-80 overflow-y-auto">
							{loading ? (
								<div className="p-4 text-center">
									<div className="border-t-apple-blue mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-200"></div>
									<p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading...</p>
								</div>
							) : notifications.length === 0 ? (
								<div className="p-6 text-center">
									<div className="mb-2 text-4xl">🔔</div>
									<p className="text-gray-600 dark:text-gray-400">No notifications yet</p>
								</div>
							) : (
								<div className="divide-y divide-gray-200 dark:divide-gray-700">
									{notifications.map((notification) => (
										<button
											key={notification.id}
											onClick={() => handleNotificationClick(notification)}
											className={`w-full px-4 py-3 text-left transition-colors duration-150 hover:bg-gray-50 hover:dark:bg-gray-900 ${
												!notification.read ? 'bg-apple-blue/5 dark:bg-apple-blue/10' : ''
											}`}
										>
											<div className="flex items-start gap-3">
												{/* Icon */}
												<div className="mt-0.5 flex-shrink-0 text-lg">
													{getNotificationIcon(notification.type)}
												</div>

												{/* Content */}
												<div className="min-w-0 flex-1">
													<div className="flex items-start justify-between gap-2">
														<h4
															className={`text-sm font-medium ${
																!notification.read
																	? 'text-black dark:text-white'
																	: 'text-gray-800 dark:text-gray-200'
															}`}
														>
															{notification.title}
														</h4>
														{!notification.read && (
															<div className="bg-apple-blue mt-1 h-2 w-2 flex-shrink-0 rounded-full"></div>
														)}
													</div>
													<p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
														{notification.message}
													</p>
													<p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
														{formatTimeAgo(new Date(notification.createdAt))}
													</p>
												</div>
											</div>
										</button>
									))}
								</div>
							)}
						</div>

						{/* Footer */}
						{notifications.length > 0 && (
							<div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
								<button
									onClick={() => {
										setIsOpen(false)
										// TODO: Navigate to full notifications page
									}}
									className="text-apple-blue w-full text-center text-sm transition-colors duration-150 hover:text-blue-600"
								>
									View all notifications
								</button>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}
