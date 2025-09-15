'use client'

import { useEffect, useState } from 'react'

interface UserSkill {
	id: string
	skillName: string
	mentionCount: number
	proficiencyScore: number
	averageConfidence: number
	averageEngagement: string
	firstMentioned: string
	lastMentioned: string
}

interface InterviewSession {
	id: string
	sessionType: string
	title: string
	messageCount: number
	averageEngagement: string
	overallScore: number
	status: string
	startedAt: string
}

interface UserProfileData {
	user: {
		id: string
		name: string
		email: string
	}
	skills: {
		stats: {
			totalSkills: number
			averageProficiency: number
			topSkill: string
			totalMentions: number
			skillsAbove80: number
		}
		list: UserSkill[]
	}
	sessions: {
		stats: {
			totalSessions: number
			completedSessions: number
			activeSessions: number
			averageScore: number
			totalMessages: number
		}
		list: InterviewSession[]
	}
}

export function UserProfileDemo() {
	const [profileData, setProfileData] = useState<UserProfileData | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const fetchUserProfile = async (userId: string) => {
		setLoading(true)
		setError(null)

		try {
			const response = await fetch(`/api/user-profile?userId=${userId}`)
			const result = await response.json()

			if (result.success) {
				setProfileData(result.data)
			} else {
				setError(result.error || 'Failed to fetch user profile')
			}
		} catch (err) {
			setError('Network error occurred')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		// Load test user profile on component mount
		fetchUserProfile('test-user-123')
	}, [])

	if (loading) {
		return (
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<div className="animate-pulse">
					<div className="mb-4 h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
					<div className="space-y-2">
						<div className="h-3 rounded bg-gray-200 dark:bg-gray-700"></div>
						<div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
				<p className="text-red-600 dark:text-red-400">Error: {error}</p>
			</div>
		)
	}

	if (!profileData) {
		return (
			<div className="rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
				<p className="text-gray-600 dark:text-gray-400">No profile data available</p>
			</div>
		)
	}

	return (
		<div className="space-y-6">
			{/* User Info */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<h2 className="mb-4 text-xl font-semibold text-black dark:text-white">User Profile</h2>
				<div className="space-y-2">
					<p className="text-gray-600 dark:text-gray-400">
						<span className="font-medium">Name:</span> {profileData.user.name}
					</p>
					<p className="text-gray-600 dark:text-gray-400">
						<span className="font-medium">Email:</span> {profileData.user.email}
					</p>
					<p className="text-gray-600 dark:text-gray-400">
						<span className="font-medium">ID:</span> {profileData.user.id}
					</p>
				</div>
			</div>

			{/* Skills Section */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
					Skills ({profileData.skills.stats.totalSkills})
				</h2>

				{/* Skills Stats */}
				<div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
					<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<p className="text-sm text-gray-600 dark:text-gray-400">Average Proficiency</p>
						<p className="text-lg font-semibold text-black dark:text-white">
							{profileData.skills.stats.averageProficiency}%
						</p>
					</div>
					<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<p className="text-sm text-gray-600 dark:text-gray-400">Top Skill</p>
						<p className="text-lg font-semibold text-black capitalize dark:text-white">
							{profileData.skills.stats.topSkill}
						</p>
					</div>
					<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<p className="text-sm text-gray-600 dark:text-gray-400">Total Mentions</p>
						<p className="text-lg font-semibold text-black dark:text-white">
							{profileData.skills.stats.totalMentions}
						</p>
					</div>
					<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<p className="text-sm text-gray-600 dark:text-gray-400">Expert Level (80+)</p>
						<p className="text-lg font-semibold text-black dark:text-white">
							{profileData.skills.stats.skillsAbove80}
						</p>
					</div>
				</div>

				{/* Skills List */}
				<div className="space-y-3">
					{profileData.skills.list.map((skill) => (
						<div
							key={skill.id}
							className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
						>
							<div className="flex-1">
								<h3 className="font-medium text-black capitalize dark:text-white">
									{skill.skillName}
								</h3>
								<p className="text-sm text-gray-600 dark:text-gray-400">
									Mentioned {skill.mentionCount} time{skill.mentionCount !== 1 ? 's' : ''} •
									Confidence: {(skill.averageConfidence * 100).toFixed(0)}% • Engagement:{' '}
									{skill.averageEngagement}
								</p>
							</div>
							<div className="text-right">
								<div className="text-lg font-semibold text-black dark:text-white">
									{skill.proficiencyScore}%
								</div>
								<div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
									<div
										className="bg-apple-blue h-full rounded-full transition-all duration-300"
										style={{ width: `${skill.proficiencyScore}%` }}
									/>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Sessions Section */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
					Interview Sessions ({profileData.sessions.stats.totalSessions})
				</h2>

				{/* Session Stats */}
				<div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
					<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
						<p className="text-lg font-semibold text-black dark:text-white">
							{profileData.sessions.stats.completedSessions}
						</p>
					</div>
					<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
						<p className="text-lg font-semibold text-black dark:text-white">
							{profileData.sessions.stats.activeSessions}
						</p>
					</div>
					<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
						<p className="text-lg font-semibold text-black dark:text-white">
							{profileData.sessions.stats.averageScore}%
						</p>
					</div>
					<div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
						<p className="text-sm text-gray-600 dark:text-gray-400">Total Messages</p>
						<p className="text-lg font-semibold text-black dark:text-white">
							{profileData.sessions.stats.totalMessages}
						</p>
					</div>
				</div>

				{/* Sessions List */}
				<div className="space-y-3">
					{profileData.sessions.list.map((session) => (
						<div
							key={session.id}
							className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
						>
							<div className="mb-2 flex items-start justify-between">
								<div>
									<h3 className="font-medium text-black dark:text-white">{session.title}</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{session.sessionType} • {session.messageCount} messages
									</p>
								</div>
								<div className="text-right">
									<span
										className={`rounded-full px-2 py-1 text-xs ${
											session.status === 'active'
												? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
												: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
										}`}
									>
										{session.status}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
								<span>Score: {session.overallScore}%</span>
								<span>Engagement: {session.averageEngagement}</span>
								<span>Started: {new Date(session.startedAt).toLocaleDateString()}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
