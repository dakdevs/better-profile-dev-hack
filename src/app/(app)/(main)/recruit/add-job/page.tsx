import Link from 'next/link'
import { Button } from '@mantine/core'
import { ArrowLeftIcon } from 'lucide-react'

import { AddJobByUrlForm } from './_modules/add-job-by-url'

export default function AddJobPage() {
	return (
		<div className="px-md md:px-lg gap-md grid">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold">{'Add Job'}</h2>
				<Button
					component={Link}
					href="/recruit"
					leftSection={<ArrowLeftIcon size={16} />}
				>
					{'Back'}
				</Button>
			</div>
			<div className="p-md w-full rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-black">
				<AddJobByUrlForm />
			</div>
		</div>
	)
}
