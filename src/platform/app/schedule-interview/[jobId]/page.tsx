import { notFound } from 'next/navigation'
import { eq } from 'drizzle-orm'

import { InterviewScheduler } from '~/components/interview-scheduler'
import { db } from '~/db'
import { jobPostings, recruiterProfiles } from '~/db/schema'

interface ScheduleInterviewPageProps {
	params: {
		jobId: string
	}
}

export default async function ScheduleInterviewPage({ params }: ScheduleInterviewPageProps) {
	// Fetch job posting details
	const jobPosting = await db
		.select({
			id: jobPostings.id,
			title: jobPostings.title,
			recruiterId: jobPostings.recruiterId,
			location: jobPostings.location,
			employmentType: jobPostings.employmentType,
			experienceLevel: jobPostings.experienceLevel,
		})
		.from(jobPostings)
		.where(eq(jobPostings.id, params.jobId))
		.limit(1)

	if (jobPosting.length === 0) {
		notFound()
	}

	const job = jobPosting[0]

	// Fetch recruiter profile to get Cal.com event type
	const recruiterProfile = await db
		.select({
			id: recruiterProfiles.id,
			organizationName: recruiterProfiles.organizationName,
			calComConnected: recruiterProfiles.calComConnected,
			calComEventTypeId: recruiterProfiles.calComEventTypeId,
			calComUsername: recruiterProfiles.calComUsername,
		})
		.from(recruiterProfiles)
		.where(eq(recruiterProfiles.id, job.recruiterId))
		.limit(1)

	if (recruiterProfile.length === 0 || !recruiterProfile[0].calComConnected) {
		return (
			<div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
				<div className="mx-auto max-w-2xl px-4">
					<div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-black">
						<div className="bg-apple-orange/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
							<svg
								className="text-apple-orange h-8 w-8"
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
							Interview Scheduling Unavailable
						</h1>
						<p className="mb-6 text-gray-600 dark:text-gray-400">
							The recruiter for this position hasn't set up interview scheduling yet. Please contact
							them directly to schedule an interview.
						</p>
						<div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
							<h3 className="mb-2 font-medium text-black dark:text-white">Job Details:</h3>
							<p className="text-gray-600 dark:text-gray-400">
								<strong>{job.title}</strong> at {recruiterProfile[0]?.organizationName}
							</p>
							<p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
								{job.location} • {job.employmentType} • {job.experienceLevel}
							</p>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const recruiter = recruiterProfile[0]

	return (
		<div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-950">
			<div className="mx-auto max-w-4xl px-4">
				{/* Header */}
				<div className="mb-8 text-center">
					<h1 className="mb-2 text-3xl font-semibold text-black dark:text-white">
						Schedule Interview
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Book a time to discuss the <strong>{job.title}</strong> position at{' '}
						{recruiter.organizationName}
					</p>
				</div>

				{/* Job Details Card */}
				<div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
					<h2 className="mb-4 text-xl font-semibold text-black dark:text-white">
						Position Details
					</h2>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
						<div>
							<h3 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
								Job Title
							</h3>
							<p className="text-black dark:text-white">{job.title}</p>
						</div>
						<div>
							<h3 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Company</h3>
							<p className="text-black dark:text-white">{recruiter.organizationName}</p>
						</div>
						<div>
							<h3 className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
								Location
							</h3>
							<p className="text-black dark:text-white">{job.location}</p>
						</div>
					</div>
				</div>

				{/* Interview Scheduler */}
				<InterviewScheduler
					jobPostingId={job.id}
					recruiterId={recruiter.id}
					eventTypeId={recruiter.calComEventTypeId || undefined}
					onScheduled={(result) => {
						// Redirect to success page or show success message
						window.location.href = `/interview-scheduled?id=${result.interview.id}`
					}}
					onCancel={() => {
						// Go back to job listing or previous page
						window.history.back()
					}}
				/>

				{/* Footer */}
				<div className="mt-8 text-center">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Having trouble scheduling? Contact the recruiter directly or{' '}
						<a
							href="/support"
							className="text-apple-blue transition-colors duration-150 hover:text-blue-600"
						>
							get help
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}
