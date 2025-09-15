'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
	Briefcase,
	Calendar,
	CheckCircle,
	Clock,
	Filter,
	MoreHorizontal,
	Plus,
	Search,
	TrendingUp,
	Users,
} from 'lucide-react'

import { CandidateMatch, InterviewSession, JobPosting } from '~/types/interview-management'

interface RecruiterDashboardProps {
	userId: string
}

interface DashboardStats {
	activeJobs: number
	totalApplications: number
	scheduledInterviews: number
	hiredCandidates: number
}

interface RecentActivity {
	id: string
	type: 'application' | 'interview' | 'job_posted' | 'candidate_hired'
	title: string
	description: string
	timestamp: Date
	jobId?: string
	candidateId?: string
}

export function RecruiterDashboard({ userId }: RecruiterDashboardProps) {
	const [stats, setStats] = useState<DashboardStats>({
		activeJobs: 0,
		totalApplications: 0,
		scheduledInterviews: 0,
		hiredCandidates: 0,
	})
	const [recentJobs, setRecentJobs] = useState<JobPosting[]>([])
	const [upcomingInterviews, setUpcomingInterviews] = useState<InterviewSession[]>([])
	const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [isRefreshingFromJobPost, setIsRefreshingFromJobPost] = useState(false)

	useEffect(() => {
		fetchDashboardData()
	}, [userId])

	// Check for refresh parameter in URL
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const urlParams = new URLSearchParams(window.location.search)
			const refreshParam = urlParams.get('refresh')
			if (refreshParam) {
				console.log('[RECRUITER-DASHBOARD] Refresh parameter detected, forcing data refresh')
				setIsRefreshingFromJobPost(true)
				fetchDashboardData(true).finally(() => {
					setIsRefreshingFromJobPost(false)
				})
				// Clean up the URL without the refresh parameter
				const newUrl = window.location.pathname
				window.history.replaceState({}, '', newUrl)
			}
		}
	}, [])

	// Listen for focus events to refresh data when returning to the page
	useEffect(() => {
		const handleFocus = () => {
			console.log('[RECRUITER-DASHBOARD] Window focused, refreshing dashboard data')
			fetchDashboardData(true) // Force refresh when returning to page
		}

		const handleVisibilityChange = () => {
			if (!document.hidden) {
				console.log('[RECRUITER-DASHBOARD] Page became visible, refreshing dashboard data')
				fetchDashboardData(true) // Force refresh when page becomes visible
			}
		}

		window.addEventListener('focus', handleFocus)
		document.addEventListener('visibilitychange', handleVisibilityChange)

		return () => {
			window.removeEventListener('focus', handleFocus)
			document.removeEventListener('visibilitychange', handleVisibilityChange)
		}
	}, [])

	const fetchDashboardData = async (forceRefresh = false) => {
		console.log('[RECRUITER-DASHBOARD] ===== FETCH DASHBOARD DATA CALLED =====')
		console.log('[RECRUITER-DASHBOARD] forceRefresh:', forceRefresh)
		try {
			console.log(
				'[RECRUITER-DASHBOARD] Starting dashboard data fetch, forceRefresh:',
				forceRefresh,
			)
			setLoading(true)
			setError(null)

			// Fetch data with individual error handling
			console.log('[RECRUITER-DASHBOARD] Making API calls to jobs, interviews, and stats endpoints')

			let jobsData = { success: true, data: { jobs: [] } }
			let interviewsData = { success: true, data: [] }
			let statsData = {
				success: true,
				data: { activeJobs: 0, totalApplications: 0, scheduledInterviews: 0, hiredCandidates: 0 },
			}

			// Fetch jobs
			try {
				const refreshParam = forceRefresh ? '&refresh=true' : ''
				const timestamp = forceRefresh ? `&t=${Date.now()}` : ''
				const jobsUrl = `/api/recruiter/jobs?limit=5${refreshParam}${timestamp}`
				console.log('[RECRUITER-DASHBOARD] Fetching jobs from:', jobsUrl)

				const jobsResponse = await fetch(jobsUrl)
				console.log('[RECRUITER-DASHBOARD] Jobs response status:', jobsResponse.status)
				console.log(
					'[RECRUITER-DASHBOARD] Jobs response headers:',
					Object.fromEntries(jobsResponse.headers.entries()),
				)

				if (jobsResponse.status === 403 || jobsResponse.status === 404) {
					// User doesn't have a recruiter profile
					const errorData = await jobsResponse.json()
					if (errorData.error?.includes('Recruiter profile')) {
						setError('profile_required')
						return
					}
				}

				if (jobsResponse.ok) {
					const contentType = jobsResponse.headers.get('content-type')
					if (contentType && contentType.includes('application/json')) {
						jobsData = await jobsResponse.json()
						console.log(
							'[RECRUITER-DASHBOARD] Jobs API response:',
							JSON.stringify(jobsData, null, 2),
						)
						console.log('[RECRUITER-DASHBOARD] Jobs data structure:', {
							success: jobsData.success,
							dataType: typeof jobsData.data,
							dataKeys: jobsData.data ? Object.keys(jobsData.data) : 'null',
							jobsArray: jobsData.data?.jobs ? jobsData.data.jobs.length : 'no jobs array',
							firstJob: jobsData.data?.jobs?.[0]
								? Object.keys(jobsData.data.jobs[0])
								: 'no first job',
						})
					} else {
						console.log('[RECRUITER-DASHBOARD] Jobs API returned non-JSON response')
						throw new Error('Jobs API returned non-JSON response')
					}
				} else {
					const errorText = await jobsResponse.text()
					console.log('[RECRUITER-DASHBOARD] Jobs API error response:', errorText)
					throw new Error(`Jobs API returned ${jobsResponse.status}: ${errorText}`)
				}
			} catch (error) {
				console.error('[RECRUITER-DASHBOARD] Jobs API failed:', error)
				// Continue with empty data
			}

			// Fetch interviews
			try {
				const interviewsResponse = await fetch('/api/interviews?userType=recruiter&limit=5')
				if (interviewsResponse.ok) {
					const contentType = interviewsResponse.headers.get('content-type')
					if (contentType && contentType.includes('application/json')) {
						interviewsData = await interviewsResponse.json()
					} else {
						console.log('[RECRUITER-DASHBOARD] Interviews API returned non-JSON response')
						throw new Error('Interviews API returned non-JSON response')
					}
				} else {
					throw new Error(`Interviews API returned ${interviewsResponse.status}`)
				}
			} catch (error) {
				console.log('[RECRUITER-DASHBOARD] Interviews API failed:', error)
				// Continue with empty data
			}

			// Fetch stats
			try {
				const refreshParam = forceRefresh ? '?refresh=true' : ''
				const statsResponse = await fetch(`/api/recruiter/jobs/stats${refreshParam}`)

				if (statsResponse.status === 403 || statsResponse.status === 404) {
					// User doesn't have a recruiter profile
					const errorData = await statsResponse.json()
					if (errorData.error?.includes('Recruiter profile')) {
						setError('profile_required')
						return
					}
				}

				if (statsResponse.ok) {
					const contentType = statsResponse.headers.get('content-type')
					if (contentType && contentType.includes('application/json')) {
						statsData = await statsResponse.json()
					} else {
						console.log('[RECRUITER-DASHBOARD] Stats API returned non-JSON response')
						throw new Error('Stats API returned non-JSON response')
					}
				} else {
					throw new Error(`Stats API returned ${statsResponse.status}`)
				}
			} catch (error) {
				console.log('[RECRUITER-DASHBOARD] Stats API failed:', error)
				// Continue with empty data
			}

			console.log('[RECRUITER-DASHBOARD] API data fetched:', {
				jobsSuccess: jobsData.success,
				interviewsSuccess: interviewsData.success,
				statsSuccess: statsData.success,
			})

			// Set data even if some APIs failed
			console.log('[RECRUITER-DASHBOARD] Setting dashboard data')
			console.log('[RECRUITER-DASHBOARD] Jobs data structure check:', {
				success: jobsData.success,
				hasData: !!jobsData.data,
				dataIsArray: Array.isArray(jobsData.data),
				hasJobsProperty: jobsData.data && 'jobs' in jobsData.data,
				dataKeys: jobsData.data ? Object.keys(jobsData.data) : 'no data',
				dataType: typeof jobsData.data,
				fullJobsData: JSON.stringify(jobsData, null, 2),
			})

			// Handle the API response structure - simplified and more robust
			let jobsArray: JobPosting[] = []

			try {
				if (jobsData.success && jobsData.data) {
					// Try different possible response structures
					if (Array.isArray(jobsData.data)) {
						// Direct array
						jobsArray = jobsData.data
					} else if (jobsData.data.data && Array.isArray(jobsData.data.data)) {
						// Nested data array
						jobsArray = jobsData.data.data
					} else if (jobsData.data.jobs && Array.isArray(jobsData.data.jobs)) {
						// Jobs property
						jobsArray = jobsData.data.jobs
					} else if (jobsData.data.id) {
						// Single job object
						jobsArray = [jobsData.data]
					}
				}

				// Ensure we always have an array
				if (!Array.isArray(jobsArray)) {
					console.warn('[RECRUITER-DASHBOARD] Jobs data is not an array, defaulting to empty array')
					jobsArray = []
				}

				console.log('[RECRUITER-DASHBOARD] Processed jobs array, length:', jobsArray.length)
			} catch (error) {
				console.error('[RECRUITER-DASHBOARD] Error processing jobs data:', error)
				jobsArray = []
			}

			console.log('[RECRUITER-DASHBOARD] Setting recentJobs to array of length:', jobsArray.length)
			if (jobsArray.length > 0) {
				console.log(
					'[RECRUITER-DASHBOARD] First job in array:',
					JSON.stringify(jobsArray[0], null, 2),
				)
				console.log(
					'[RECRUITER-DASHBOARD] All job titles:',
					jobsArray.map((j) => j.title),
				)
			}
			setRecentJobs(jobsArray)

			// Add a small delay to ensure state is updated, then log the result
			setTimeout(() => {
				console.log(
					'[RECRUITER-DASHBOARD] State should be updated now. Current recentJobs length:',
					jobsArray.length,
				)
			}, 50)

			// Force a re-render by logging the state change
			setTimeout(() => {
				console.log(
					'[RECRUITER-DASHBOARD] State updated - recentJobs length should now be:',
					jobsArray.length,
				)
			}, 100)

			// Filter for upcoming interviews
			const upcoming = interviewsData.success
				? (interviewsData.data || []).filter(
						(interview: InterviewSession) =>
							new Date(interview.scheduledStart) > new Date()
							&& ['scheduled', 'confirmed', 'rescheduled'].includes(interview.status),
					)
				: []
			setUpcomingInterviews(upcoming)

			setStats(statsData.success ? statsData.data || stats : stats)

			// Generate recent activity from jobs and interviews
			const activities: RecentActivity[] = []

			// Add recent job postings
			if (jobsArray.length > 0) {
				jobsArray.slice(0, 3).forEach((job: JobPosting) => {
					activities.push({
						id: `job-${job.id}`,
						type: 'job_posted',
						title: 'Job posting published',
						description: `${job.title} position is now live`,
						timestamp: new Date(job.createdAt),
						jobId: job.id,
					})
				})
			}

			// Add recent interviews
			upcoming.slice(0, 2).forEach((interview: InterviewSession) => {
				activities.push({
					id: `interview-${interview.id}`,
					type: 'interview',
					title: 'Interview scheduled',
					description: `${interview.interviewType} interview scheduled`,
					timestamp: new Date(interview.createdAt),
				})
			})

			// Sort by timestamp
			activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
			setRecentActivity(activities.slice(0, 5))
		} catch (err) {
			console.error('[RECRUITER-DASHBOARD] Error fetching dashboard data:', err)
			setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
		} finally {
			setLoading(false)
		}
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

	const getActivityIcon = (type: RecentActivity['type']) => {
		switch (type) {
			case 'application':
				return <Users className="text-apple-blue h-4 w-4" />
			case 'interview':
				return <Calendar className="text-apple-green h-4 w-4" />
			case 'job_posted':
				return <Briefcase className="text-apple-orange h-4 w-4" />
			case 'candidate_hired':
				return <CheckCircle className="text-apple-purple h-4 w-4" />
			default:
				return <Clock className="h-4 w-4 text-gray-400" />
		}
	}

	const getJobStatusBadge = (status: string) => {
		const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'

		switch (status) {
			case 'active':
				return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400`
			case 'paused':
				return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400`
			case 'closed':
				return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400`
			default:
				return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400`
		}
	}

	if (loading) {
		return (
			<div className="space-y-8">
				<div className="animate-pulse">
					<div className="mb-4 h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
					<div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700"
							></div>
						))}
					</div>
					<div className="grid gap-6 lg:grid-cols-2">
						<div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
						<div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
					</div>
				</div>
			</div>
		)
	}

	if (error === 'profile_required') {
		return (
			<div className="space-y-8">
				<div>
					<h1 className="mb-2 text-3xl font-semibold text-black dark:text-white">
						Welcome to Recruiter Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Get started by creating your recruiter profile
					</p>
				</div>

				<div className="bg-apple-blue/10 border-apple-blue/20 rounded-xl border p-8 text-center">
					<div className="bg-apple-blue/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
						<Briefcase className="text-apple-blue h-8 w-8" />
					</div>

					<h2 className="mb-2 text-xl font-semibold text-black dark:text-white">
						Create Your Recruiter Profile
					</h2>

					<p className="mx-auto mb-6 max-w-md text-gray-600 dark:text-gray-400">
						To start posting jobs and managing candidates, you need to set up your recruiter profile
						first.
					</p>

					<div className="flex flex-col justify-center gap-3 sm:flex-row">
						<Link
							href="/recruiter/profile"
							className="bg-apple-blue inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-white transition-colors duration-150 hover:bg-blue-600"
						>
							<Plus className="h-4 w-4" />
							Create Profile
						</Link>

						<button
							onClick={() => fetchDashboardData(true)}
							className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
						>
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
							Refresh
						</button>
					</div>
				</div>
			</div>
		)
	}

	if (error) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
				<h3 className="mb-2 text-lg font-semibold text-red-800 dark:text-red-400">
					Error Loading Dashboard
				</h3>
				<p className="mb-4 text-red-700 dark:text-red-300">{error}</p>
				<button
					onClick={() => fetchDashboardData(true)}
					className="rounded-lg bg-red-600 px-4 py-2 text-white transition-colors duration-150 hover:bg-red-700"
				>
					Try Again
				</button>
			</div>
		)
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="mb-2 text-3xl font-semibold text-black dark:text-white">
						Recruiter Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Manage your job postings, interviews, and candidate applications
					</p>
					{isRefreshingFromJobPost && (
						<div className="text-apple-green mt-2 flex items-center gap-2 text-sm">
							<svg
								className="h-4 w-4 animate-spin"
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
							Refreshing dashboard with your new job posting...
						</div>
					)}
				</div>

				<div className="flex items-center gap-3">
					<button
						onClick={async () => {
							try {
								const debugResponse = await fetch('/api/debug/jobs')
								const debugData = await debugResponse.json()
								console.log('[RECRUITER-DASHBOARD] Debug data:', debugData)
								alert(
									`Debug: ${debugData.data?.totalJobs || 0} jobs, ${debugData.data?.totalRecruiters || 0} recruiters in DB`,
								)
							} catch (error) {
								console.error('[RECRUITER-DASHBOARD] Debug failed:', error)
							}
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-orange-200 px-3 py-2 text-orange-600 transition-colors duration-150 hover:bg-orange-50 hover:text-orange-800 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/20 dark:hover:text-orange-200"
						title="Debug database"
					>
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
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Debug DB
					</button>

					<button
						onClick={async () => {
							try {
								const response = await fetch('/api/debug/create-mock-candidates', {
									method: 'POST',
								})
								const data = await response.json()
								console.log('[RECRUITER-DASHBOARD] Mock candidates data:', data)
								if (data.success) {
									alert(
										`Successfully created ${data.data.summary.totalCandidates} mock candidates with ${data.data.summary.totalSkills} skills!\n\nAverage skills per candidate: ${data.data.summary.averageSkillsPerCandidate}\n\nThese candidates are now available for job matching.`,
									)
									// Refresh dashboard data
									fetchDashboardData(true)
								} else {
									alert(`Failed to create mock candidates: ${data.error}`)
								}
							} catch (error) {
								console.error('[RECRUITER-DASHBOARD] Create mock candidates failed:', error)
								alert('Failed to create mock candidates - check console')
							}
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-green-600 transition-colors duration-150 hover:bg-green-50 hover:text-green-800 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-200"
						title="Create 25 realistic mock candidates with diverse skills"
					>
						<Users className="h-4 w-4" />
						Create 25 Mock Candidates
					</button>

					<button
						onClick={async () => {
							if (
								!confirm(
									'This will remove all test candidates (Alice, Bob, Carol, David, Eva) and their skills from the database. Are you sure?',
								)
							) {
								return
							}

							try {
								const response = await fetch('/api/debug/clear-test-data', { method: 'POST' })
								const data = await response.json()
								console.log('[RECRUITER-DASHBOARD] Clear test data result:', data)

								if (data.success) {
									alert(
										`Test Data Cleared:\\n- Removed Users: ${data.data.removedUsers}\\n- Removed Skills: ${data.data.removedSkills}\\n- Removed Mentions: ${data.data.removedMentions}\\n\\nThe system now shows only real users from AI interviews.`,
									)
									// Refresh dashboard data
									fetchDashboardData(true)
								} else {
									alert(`Failed to clear test data: ${data.error}`)
								}
							} catch (error) {
								console.error('[RECRUITER-DASHBOARD] Clear test data failed:', error)
								alert('Clear test data failed - check console')
							}
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-red-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-200"
						title="Remove test candidates from database"
					>
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
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						Clear Test Data
					</button>

					<button
						onClick={async () => {
							if (
								!confirm(
									'This will remove all 25 mock candidates and their skills from the database. Are you sure?',
								)
							) {
								return
							}

							try {
								const response = await fetch('/api/debug/clear-mock-candidates', { method: 'POST' })
								const data = await response.json()
								console.log('[RECRUITER-DASHBOARD] Clear mock candidates result:', data)

								if (data.success) {
									alert(
										`Mock Candidates Cleared!\n\n- Removed Users: ${data.data.removedUsers}\n- Removed Skills: ${data.data.removedSkills}\n\nThe database now only contains real users.`,
									)
									// Refresh dashboard data
									fetchDashboardData(true)
								} else {
									alert(`Failed to clear mock candidates: ${data.error}`)
								}
							} catch (error) {
								console.error('[RECRUITER-DASHBOARD] Clear mock candidates failed:', error)
								alert('Clear mock candidates failed - check console')
							}
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-red-600 transition-colors duration-150 hover:bg-red-50 hover:text-red-800 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-200"
						title="Remove all mock candidates from database"
					>
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
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
						Clear Mock Candidates
					</button>

					<button
						onClick={async () => {
							try {
								const response = await fetch('/api/debug/check-real-users')
								const data = await response.json()
								console.log('[RECRUITER-DASHBOARD] Real users data:', data)

								if (data.success) {
									const summary = data.data.summary
									alert(
										`Real Database Users:\\n- Total Users: ${summary.totalUsers}\\n- Users with Skills: ${summary.usersWithSkills}\\n- Total Skills: ${summary.totalUserSkills}\\n- Unique Skills: ${summary.uniqueSkills}\\n\\nCheck console for detailed data.`,
									)
								} else {
									alert(`Failed to check real users: ${data.error}`)
								}
							} catch (error) {
								console.error('[RECRUITER-DASHBOARD] Check real users failed:', error)
								alert('Check real users failed - check console')
							}
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-blue-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-200"
						title="Check real users and skills in database"
					>
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
								d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>
						</svg>
						Check Real Users
					</button>

					<button
						onClick={async () => {
							try {
								const response = await fetch('/api/debug/candidate-query-test')
								const data = await response.json()
								console.log('[RECRUITER-DASHBOARD] Candidate query test:', data)

								if (data.success) {
									const summary = data.data.summary
									const candidates = data.data.candidates
									alert(
										`Candidate Query Test:\\n- Total Users: ${summary.totalUsers}\\n- User Skills: ${summary.totalUserSkills}\\n- Unique Candidates: ${summary.uniqueCandidates}\\n\\nCandidates: ${candidates.map((c) => `${c.name} (${c.skillCount} skills)`).join(', ')}\\n\\nCheck console for detailed data.`,
									)
								} else {
									alert(`Candidate query test failed: ${data.error}`)
								}
							} catch (error) {
								console.error('[RECRUITER-DASHBOARD] Candidate query test failed:', error)
								alert('Candidate query test failed - check console')
							}
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-2 text-indigo-600 transition-colors duration-150 hover:bg-indigo-50 hover:text-indigo-800 dark:border-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-200"
						title="Test candidate database queries"
					>
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
								d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 01-2 2m-6 9l2 2 4-4"
							/>
						</svg>
						Test Queries
					</button>

					<button
						onClick={async () => {
							try {
								const response = await fetch('/api/debug/clear-cache', { method: 'POST' })
								const data = await response.json()
								console.log('[RECRUITER-DASHBOARD] Clear cache result:', data)

								if (data.success) {
									alert(
										`Cache Cleared Successfully!\\n\\nAll cached data has been cleared. Try refreshing candidate searches now.`,
									)
									// Refresh dashboard data
									fetchDashboardData(true)
								} else {
									alert(`Failed to clear cache: ${data.error}`)
								}
							} catch (error) {
								console.error('[RECRUITER-DASHBOARD] Clear cache failed:', error)
								alert('Clear cache failed - check console')
							}
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-yellow-200 px-3 py-2 text-yellow-600 transition-colors duration-150 hover:bg-yellow-50 hover:text-yellow-800 dark:border-yellow-700 dark:text-yellow-400 dark:hover:bg-yellow-900/20 dark:hover:text-yellow-200"
						title="Clear all caches to refresh data"
					>
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
						Clear Cache
					</button>

					<button
						onClick={async () => {
							try {
								// Get the first job ID from recentJobs
								if (recentJobs.length === 0) {
									alert('No jobs found. Please create a job first.')
									return
								}

								const jobId = recentJobs[0].id
								const response = await fetch(`/api/debug/candidate-matching?jobId=${jobId}&limit=5`)
								const data = await response.json()
								console.log('[RECRUITER-DASHBOARD] Candidate matching test:', data)

								if (data.success) {
									const summary = data.data.summary
									alert(
										`Candidate Matching Test:\n- Job: ${data.data.job.title}\n- Candidates: ${summary.totalCandidates}\n- Avg Match: ${summary.averageMatchScore}%\n- Top Match: ${summary.topMatchScore}%`,
									)
								} else {
									alert(`Candidate matching test failed: ${data.error}`)
								}
							} catch (error) {
								console.error('[RECRUITER-DASHBOARD] Candidate matching test failed:', error)
								alert('Candidate matching test failed - check console')
							}
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-purple-200 px-3 py-2 text-purple-600 transition-colors duration-150 hover:bg-purple-50 hover:text-purple-800 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 dark:hover:text-purple-200"
						title="Test candidate matching for first job"
					>
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
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						Test Matching
					</button>

					<button
						onClick={async () => {
							try {
								const testResponse = await fetch('/api/debug/test-flow', { method: 'POST' })
								const testData = await testResponse.json()
								console.log('[RECRUITER-DASHBOARD] Test flow data:', testData)
								if (testData.success) {
									alert(
										`Test Flow: Created job ${testData.data.summary.jobCreated ? '✓' : '✗'}, Retrieved ${testData.data.summary.totalJobsFound} jobs`,
									)
									// Refresh dashboard after test
									fetchDashboardData(true)
								} else {
									alert(`Test Flow Failed: ${testData.error}`)
								}
							} catch (error) {
								console.error('[RECRUITER-DASHBOARD] Test flow failed:', error)
								alert('Test flow failed - check console')
							}
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-purple-200 px-3 py-2 text-purple-600 transition-colors duration-150 hover:bg-purple-50 hover:text-purple-800 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20 dark:hover:text-purple-200"
						title="Test job creation and retrieval flow"
					>
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
								d="M13 10V3L4 14h7v7l9-11h-7z"
							/>
						</svg>
						Test Flow
					</button>

					<button
						onClick={() => {
							console.log('[RECRUITER-DASHBOARD] Current state check:')
							console.log('- recentJobs:', recentJobs)
							console.log('- recentJobs.length:', recentJobs.length)
							console.log('- stats:', stats)
							console.log('- loading:', loading)
							console.log('- error:', error)
							alert(
								`State: ${recentJobs.length} jobs, ${stats.activeJobs} active, loading: ${loading}`,
							)
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-green-200 px-3 py-2 text-green-600 transition-colors duration-150 hover:bg-green-50 hover:text-green-800 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20 dark:hover:text-green-200"
						title="Check current component state"
					>
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
								d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
							/>
						</svg>
						State
					</button>

					<button
						onClick={async () => {
							console.log('[RECRUITER-DASHBOARD] Direct API test starting...')
							try {
								const response = await fetch(
									`/api/recruiter/jobs?limit=5&refresh=true&t=${Date.now()}`,
								)
								console.log('[RECRUITER-DASHBOARD] Direct API response status:', response.status)
								console.log(
									'[RECRUITER-DASHBOARD] Direct API response headers:',
									Object.fromEntries(response.headers.entries()),
								)

								if (response.ok) {
									const data = await response.json()
									console.log(
										'[RECRUITER-DASHBOARD] Direct API response data:',
										JSON.stringify(data, null, 2),
									)
									alert(
										`Direct API: ${response.status}, Success: ${data.success}, Jobs: ${data.data?.length || 0}`,
									)
								} else {
									const errorText = await response.text()
									console.log('[RECRUITER-DASHBOARD] Direct API error:', errorText)
									alert(`Direct API Error: ${response.status} - ${errorText}`)
								}
							} catch (error) {
								console.error('[RECRUITER-DASHBOARD] Direct API test failed:', error)
								alert(`Direct API Test Failed: ${error}`)
							}
						}}
						className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-blue-600 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-800 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-200"
						title="Test API directly"
					>
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
								d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
							/>
						</svg>
						API Test
					</button>

					<button
						onClick={() => fetchDashboardData(true)}
						disabled={loading}
						className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
						title="Refresh dashboard data"
					>
						<svg
							className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
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
						{loading ? 'Refreshing...' : 'Refresh'}
					</button>

					<Link
						href="/recruiter/post-job"
						className="bg-apple-blue inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors duration-150 hover:bg-blue-600"
					>
						<Plus className="h-4 w-4" />
						Post New Job
					</Link>
				</div>
			</div>

			{/* Stats Overview */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-4">
				<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
							<p className="text-2xl font-semibold text-black dark:text-white">
								{stats.activeJobs}
							</p>
						</div>
						<div className="bg-apple-blue/10 flex h-10 w-10 items-center justify-center rounded-lg">
							<Briefcase className="text-apple-blue h-5 w-5" />
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Applications</p>
							<p className="text-2xl font-semibold text-black dark:text-white">
								{stats.totalApplications}
							</p>
						</div>
						<div className="bg-apple-green/10 flex h-10 w-10 items-center justify-center rounded-lg">
							<Users className="text-apple-green h-5 w-5" />
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Interviews</p>
							<p className="text-2xl font-semibold text-black dark:text-white">
								{stats.scheduledInterviews}
							</p>
						</div>
						<div className="bg-apple-orange/10 flex h-10 w-10 items-center justify-center rounded-lg">
							<Calendar className="text-apple-orange h-5 w-5" />
						</div>
					</div>
				</div>

				<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400">Hired</p>
							<p className="text-2xl font-semibold text-black dark:text-white">
								{stats.hiredCandidates}
							</p>
						</div>
						<div className="bg-apple-purple/10 flex h-10 w-10 items-center justify-center rounded-lg">
							<CheckCircle className="text-apple-purple h-5 w-5" />
						</div>
					</div>
				</div>
			</div>

			{/* Main Content Grid */}
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Recent Jobs */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
					<div className="mb-6 flex items-center justify-between">
						<h2 className="text-xl font-semibold text-black dark:text-white">
							Recent Job Postings ({recentJobs.length})
						</h2>
						<Link
							href="/recruiter/jobs"
							className="text-apple-blue text-sm hover:underline"
						>
							View All
						</Link>
					</div>

					{(() => {
						console.log('[RECRUITER-DASHBOARD] RENDER: recentJobs.length =', recentJobs.length)
						console.log('[RECRUITER-DASHBOARD] RENDER: recentJobs =', recentJobs)
						return recentJobs.length === 0
					})() ? (
						<div className="py-8 text-center">
							<Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-400" />
							<p className="mb-4 text-gray-600 dark:text-gray-400">
								No job postings yet (Debug: {recentJobs.length} jobs in state)
							</p>
							<Link
								href="/recruiter/post-job"
								className="bg-apple-blue inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white transition-colors duration-150 hover:bg-blue-600"
							>
								<Plus className="h-4 w-4" />
								Post Your First Job
							</Link>
						</div>
					) : (
						<div className="space-y-4">
							{Array.isArray(recentJobs)
								&& recentJobs.map((job) => (
									<div
										key={job.id}
										className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
									>
										<div className="min-w-0 flex-1">
											<div className="mb-1 flex items-center gap-2">
												<h3 className="truncate font-medium text-black dark:text-white">
													{job.title}
												</h3>
												<span className={getJobStatusBadge(job.status)}>
													{job.status.charAt(0).toUpperCase() + job.status.slice(1)}
												</span>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400">
												{job.location || 'Remote'} • Posted {formatTimeAgo(new Date(job.createdAt))}
											</p>
										</div>
										<div className="ml-4 flex items-center gap-2">
											<Link
												href={`/recruiter/jobs/${job.id}/candidates`}
												className="bg-apple-blue rounded-lg px-3 py-1 text-sm text-white transition-colors hover:bg-blue-600"
											>
												View Candidates
											</Link>
											<button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
												<MoreHorizontal className="h-4 w-4" />
											</button>
										</div>
									</div>
								))}
						</div>
					)}
				</div>

				{/* Upcoming Interviews */}
				<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
					<div className="mb-6 flex items-center justify-between">
						<h2 className="text-xl font-semibold text-black dark:text-white">
							Upcoming Interviews
						</h2>
						<Link
							href="/recruiter/interviews"
							className="text-apple-blue text-sm hover:underline"
						>
							View All
						</Link>
					</div>

					{upcomingInterviews.length === 0 ? (
						<div className="py-8 text-center">
							<Calendar className="mx-auto mb-3 h-12 w-12 text-gray-400" />
							<p className="text-gray-600 dark:text-gray-400">No upcoming interviews</p>
						</div>
					) : (
						<div className="space-y-4">
							{upcomingInterviews.map((interview) => (
								<div
									key={interview.id}
									className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
								>
									<div className="flex items-center gap-3">
										<div className="bg-apple-green/10 flex h-8 w-8 items-center justify-center rounded-full">
											<Calendar className="text-apple-green h-4 w-4" />
										</div>
										<div>
											<div className="font-medium text-black dark:text-white">
												{interview.interviewType.charAt(0).toUpperCase()
													+ interview.interviewType.slice(1)}{' '}
												Interview
											</div>
											<div className="text-sm text-gray-600 dark:text-gray-400">
												{new Intl.DateTimeFormat('en-US', {
													dateStyle: 'medium',
													timeStyle: 'short',
												}).format(new Date(interview.scheduledStart))}
											</div>
										</div>
									</div>
									<span
										className={`rounded-full px-2 py-1 text-xs font-medium ${
											interview.status === 'confirmed'
												? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
												: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
										}`}
									>
										{interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{/* Recent Activity */}
			<div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<h2 className="mb-6 text-xl font-semibold text-black dark:text-white">Recent Activity</h2>

				{recentActivity.length === 0 ? (
					<div className="py-8 text-center">
						<TrendingUp className="mx-auto mb-3 h-12 w-12 text-gray-400" />
						<p className="text-gray-600 dark:text-gray-400">No recent activity</p>
					</div>
				) : (
					<div className="space-y-4">
						{recentActivity.map((activity) => (
							<div
								key={activity.id}
								className="flex items-center justify-between rounded-lg bg-gray-50 p-4 dark:bg-gray-900"
							>
								<div className="flex items-center gap-3">
									<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
										{getActivityIcon(activity.type)}
									</div>
									<div>
										<p className="font-medium text-black dark:text-white">{activity.title}</p>
										<p className="text-sm text-gray-600 dark:text-gray-400">
											{activity.description}
										</p>
									</div>
								</div>
								<span className="text-sm text-gray-500 dark:text-gray-400">
									{formatTimeAgo(activity.timestamp)}
								</span>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Link
					href="/recruiter/post-job"
					className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-black"
				>
					<div className="mb-4 flex items-center gap-4">
						<div className="bg-apple-blue/10 group-hover:bg-apple-blue/20 flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200">
							<Plus className="text-apple-blue h-6 w-6" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-black dark:text-white">Post New Job</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">Create a job listing</p>
						</div>
					</div>
				</Link>

				<Link
					href="/recruiter/jobs"
					className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-black"
				>
					<div className="mb-4 flex items-center gap-4">
						<div className="bg-apple-green/10 group-hover:bg-apple-green/20 flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200">
							<Search className="text-apple-green h-6 w-6" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-black dark:text-white">
								Browse Candidates
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">Find qualified candidates</p>
						</div>
					</div>
				</Link>

				<Link
					href="/recruiter/interviews"
					className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-black"
				>
					<div className="mb-4 flex items-center gap-4">
						<div className="bg-apple-orange/10 group-hover:bg-apple-orange/20 flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200">
							<Calendar className="text-apple-orange h-6 w-6" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-black dark:text-white">
								Schedule Interviews
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">Manage interview calendar</p>
						</div>
					</div>
				</Link>

				<Link
					href="/recruiter/profile"
					className="group rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-black"
				>
					<div className="mb-4 flex items-center gap-4">
						<div className="bg-apple-purple/10 group-hover:bg-apple-purple/20 flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200">
							<Users className="text-apple-purple h-6 w-6" />
						</div>
						<div>
							<h3 className="text-lg font-semibold text-black dark:text-white">
								Recruiter Profile
							</h3>
							<p className="text-sm text-gray-600 dark:text-gray-400">Update your information</p>
						</div>
					</div>
				</Link>
			</div>
		</div>
	)
}
