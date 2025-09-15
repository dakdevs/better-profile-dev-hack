import Link from 'next/link'
import { Button } from '@mantine/core'
import { CogIcon, PlusIcon } from 'lucide-react'

import { db } from '~/db'
import { getRequiredSession } from '~/lib/auth'

export default async function RecruitPage() {
	const session = await getRequiredSession()
	const jobs = await getJobsByRecruiterUserId(session.user.id)

	return (
		<div className="px-md md:px-lg gap-md flex size-full flex-col">
			<div className="gap-md flex items-center justify-between">
				<div>
					<Button
						component={Link}
						variant="outline"
						href="/recruit/add-job"
						leftSection={<PlusIcon size={16} />}
					>
						{'Add Job'}
					</Button>
				</div>
				<Button
					component={Link}
					href="/recruit/settings"
					leftSection={<CogIcon size={16} />}
				>
					{'Settings'}
				</Button>
			</div>
			{jobs.length === 0 ? (
				<div className="py-2xl gap-sm flex w-full flex-col items-center justify-center rounded-md border border-dashed border-gray-200 bg-white text-center dark:border-gray-700 dark:bg-black">
					<h3 className="text-lg font-bold">{'No jobs found'}</h3>
					<p className="mb-2 text-sm text-gray-500">
						{'Add your first job posting to get started.'}
					</p>
					<Button
						component={Link}
						href="/recruit/add-job"
						leftSection={<PlusIcon size={16} />}
					>
						{'Add Job'}
					</Button>
				</div>
			) : (
				<div className="gap-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{jobs.map((job) => {
						return (
							<Link
								key={job.id}
								href={`/recruit/job/${job.id}`}
								className="p-md gap-md flex w-full flex-col rounded-md border border-gray-200 bg-white transition-transform hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-black"
							>
								<h3 className="text-lg font-bold">{job.title}</h3>
								<p className="text-sm text-gray-500">{job.createdAt.toLocaleDateString()}</p>
							</Link>
						)
					})}
				</div>
			)}
		</div>
	)
}

async function getJobsByRecruiterUserId(userId: string) {
	return db.query.jobPostings.findMany({
		where: (table, { eq }) => {
			return eq(table.userId, userId)
		},
		orderBy: (table, { desc }) => {
			return desc(table.createdAt)
		},
	})
}
