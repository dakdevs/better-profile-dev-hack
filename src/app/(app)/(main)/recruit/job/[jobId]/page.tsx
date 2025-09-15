import { notFound } from 'next/navigation'

import { db } from '~/db'
import { getRequiredSession } from '~/lib/auth'

export default async function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
	const session = await getRequiredSession()
	const { jobId } = await params
	const job = await getJobById(session.user.id, jobId)

	if (!job) {
		return notFound()
	}

	return (
		<div className="px-md md:px-lg gap-md flex size-full flex-col">
			<h1>{job.title}</h1>
			<p>{job.rawDescription}</p>
		</div>
	)
}

async function getJobById(userId: string, jobId: string) {
	return db.query.jobPostings.findFirst({
		where: (table, { eq, and }) => {
			return and(eq(table.id, jobId), eq(table.userId, userId))
		},
	})
}
