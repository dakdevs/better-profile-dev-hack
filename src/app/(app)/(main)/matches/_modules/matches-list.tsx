import Link from 'next/link'

import { Button } from '~/components/ui/button'

import MatchCard from './match-card'

type Skill = { name: string; proficiencyScore?: number; category?: string }

type Props = {
	matches: {
		job: { id: string; title: string }
		match: {
			score: number
			matchingSkills: Skill[]
			skillGaps: Skill[]
			overallFit: 'excellent' | 'good' | 'fair' | 'poor'
		}
	}[]
}

export default function MatchesList({ matches }: Props) {
	if (matches.length === 0) {
		return (
			<div className="w-full">
				<div className="gap-md py-md flex w-full flex-col items-center justify-center rounded-lg bg-neutral-50">
					<p className="text-sm font-medium text-neutral-500">
						{'There are no matches for you yet.'}
					</p>
					<Button asChild>
						<Link href="/interview">{'Interview'}</Link>
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
			{matches.map((m) => (
				<MatchCard
					key={m.job.id}
					data={m}
				/>
			))}
		</div>
	)
}
