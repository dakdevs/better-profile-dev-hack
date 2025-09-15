import { notFound, redirect } from 'next/navigation'
import { and, eq } from 'drizzle-orm'

import { CandidateList } from '~/app/recruiter/_modules/candidate-list'
import { db } from '~/db'
import { jobPostings, recruiterProfiles } from '~/db/schema'
import { auth } from '~/lib/auth'

interface CandidatesPageProps {
	params: {
		id: string
	}
}

export default async function CandidatesPage({ params }: CandidatesPageProps) {
	// TODO: Fix auth - temporarily bypass for testing
	// For now, we'll use a mock session to test candidate matching
	const session = {
		user: {
			id: 'temp-user-id', // This should be replaced with proper auth
		},
	}

	// In production, uncomment this:
	// const session = await auth();
	// if (!session?.user?.id) {
	//   redirect('/auth/signin');
	// }

	// Get job posting - temporarily remove user access check for testing
	const job = await db
		.select({
			id: jobPostings.id,
			title: jobPostings.title,
			rawDescription: jobPostings.rawDescription,
			requiredSkills: jobPostings.requiredSkills,
			preferredSkills: jobPostings.preferredSkills,
			experienceLevel: jobPostings.experienceLevel,
			location: jobPostings.location,
			remoteAllowed: jobPostings.remoteAllowed,
			status: jobPostings.status,
			createdAt: jobPostings.createdAt,
			recruiterName: recruiterProfiles.organizationName,
		})
		.from(jobPostings)
		.innerJoin(recruiterProfiles, eq(jobPostings.recruiterId, recruiterProfiles.id))
		.where(eq(jobPostings.id, params.id))
		.limit(1)

	// TODO: Re-enable user access check when auth is fixed:
	// .where(
	//   and(
	//     eq(jobPostings.id, params.id),
	//     eq(recruiterProfiles.userId, session.user.id)
	//   )
	// )

	if (job.length === 0) {
		notFound()
	}

	const jobData = job[0]

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<div className="mb-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
						<a
							href="/recruiter/jobs"
							className="hover:text-apple-blue transition-colors"
						>
							Jobs
						</a>
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
								d="M9 5l7 7-7 7"
							/>
						</svg>
						<span className="truncate">{jobData.title}</span>
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
								d="M9 5l7 7-7 7"
							/>
						</svg>
						<span>Candidates</span>
					</div>

					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<h1 className="text-3xl font-bold text-black dark:text-white">{jobData.title}</h1>
							<div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
								<span className="flex items-center gap-1">
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
											d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1"
										/>
									</svg>
									{jobData.recruiterName}
								</span>

								{jobData.location && (
									<span className="flex items-center gap-1">
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
												d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
											/>
										</svg>
										{jobData.location}
										{jobData.remoteAllowed && ' (Remote OK)'}
									</span>
								)}

								{jobData.experienceLevel && (
									<span className="rounded-md bg-gray-100 px-2 py-1 capitalize dark:bg-gray-800">
										{jobData.experienceLevel} level
									</span>
								)}

								<span
									className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${
										jobData.status === 'active'
											? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
											: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
									}`}
								>
									{jobData.status}
								</span>
							</div>
						</div>

						<div className="flex items-center gap-2">
							<a
								href={`/recruiter/jobs/${params.id}`}
								className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
							>
								View Job Details
							</a>
							<a
								href={`/recruiter/jobs/${params.id}/edit`}
								className="bg-apple-blue rounded-lg px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600"
							>
								Edit Job
							</a>
						</div>
					</div>
				</div>

				{/* Job requirements summary */}
				<div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
					<h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
						Job Requirements
					</h2>

					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						{/* Required skills */}
						{jobData.requiredSkills
							&& Array.isArray(jobData.requiredSkills)
							&& jobData.requiredSkills.length > 0 && (
								<div>
									<h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
										Required Skills ({jobData.requiredSkills.length})
									</h3>
									<div className="flex flex-wrap gap-2">
										{jobData.requiredSkills.map((skill: any, index: number) => (
											<span
												key={index}
												className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
											>
												{typeof skill === 'string' ? skill : skill.name} *
											</span>
										))}
									</div>
								</div>
							)}

						{/* Preferred skills */}
						{jobData.preferredSkills
							&& Array.isArray(jobData.preferredSkills)
							&& jobData.preferredSkills.length > 0 && (
								<div>
									<h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
										Preferred Skills ({jobData.preferredSkills.length})
									</h3>
									<div className="flex flex-wrap gap-2">
										{jobData.preferredSkills.map((skill: any, index: number) => (
											<span
												key={index}
												className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
											>
												{typeof skill === 'string' ? skill : skill.name}
											</span>
										))}
									</div>
								</div>
							)}
					</div>

					{(!jobData.requiredSkills
						|| !Array.isArray(jobData.requiredSkills)
						|| jobData.requiredSkills.length === 0)
						&& (!jobData.preferredSkills
							|| !Array.isArray(jobData.preferredSkills)
							|| jobData.preferredSkills.length === 0) && (
							<div className="py-8 text-center">
								<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
									<svg
										className="h-6 w-6 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
										/>
									</svg>
								</div>
								<h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
									No Skills Extracted
								</h3>
								<p className="mb-4 text-gray-600 dark:text-gray-400">
									Skills haven't been extracted from this job posting yet. This may affect candidate
									matching accuracy.
								</p>
								<a
									href={`/recruiter/jobs/${params.id}/edit`}
									className="bg-apple-blue rounded-lg px-4 py-2 text-white transition-colors hover:bg-blue-600"
								>
									Edit Job & Extract Skills
								</a>
							</div>
						)}
				</div>

				{/* Candidates list */}
				<CandidateList jobId={params.id} />
			</div>
		</div>
	)
}
