import Link from 'next/link'
import { Button } from '@mantine/core'

export default function MatchesPage() {
	return (
		<div className="w-full">
			<div className="gap-md py-md flex w-full flex-col items-center justify-center rounded-lg bg-neutral-50">
				<p className="text-sm font-medium text-neutral-500">There are no matches for you yet.</p>
				<Button
					variant="filled"
					color="#1e3a8a"
					radius="md"
					component={Link}
					href="/interview"
				>
					Interview
				</Button>
			</div>
		</div>
	)
}
