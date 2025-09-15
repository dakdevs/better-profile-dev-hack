import Link from 'next/link'
import { Button } from '@mantine/core'
import { CogIcon, PlusIcon } from 'lucide-react'

export default async function RecruitPage() {
	return (
		<div className="px-md md:px-lg gap-md flex size-full flex-col">
			<div className="gap-md flex">
				<Button
					component={Link}
					variant="outline"
					href="/recruit/add-job"
					leftSection={<PlusIcon size={16} />}
				>
					Add Job
				</Button>
				<Button
					component={Link}
					href="/recruit/settings"
					leftSection={<CogIcon size={16} />}
				>
					Settings
				</Button>
			</div>
		</div>
	)
}
