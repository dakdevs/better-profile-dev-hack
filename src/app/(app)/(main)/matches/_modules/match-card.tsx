import Link from 'next/link'

import { Button } from '~/components/ui/button'
import { cn } from '~/utils/cn'

type Skill = { name: string; proficiencyScore?: number; category?: string }
type Props = {
	data: {
		job: { id: string; title: string }
		match: {
			score: number
			matchingSkills: Skill[]
			skillGaps: Skill[]
			overallFit: 'excellent' | 'good' | 'fair' | 'poor'
		}
	}
}

function badgeColor(score: number) {
	if (score >= 80) return 'bg-green-600/10 text-green-700'
	if (score >= 60) return 'bg-emerald-600/10 text-emerald-700'
	if (score >= 40) return 'bg-amber-600/10 text-amber-700'

	return 'bg-red-600/10 text-red-700'
}

export default function MatchCard({ data }: Props) {
	const { job, match } = data

	return (
		<div className="rounded-lg border bg-white p-4 shadow-xs">
			<div className="flex items-start justify-between">
				<div>
					<h3 className="text-base font-semibold text-neutral-900">{job.title}</h3>
					<p
						className={cn(
							'mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
							badgeColor(match.score),
						)}
					>
						{match.overallFit.toUpperCase()}
						{' • '}
						{match.score}
						{'% match'}
					</p>
				</div>
				<Button
					asChild
					size="sm"
					variant="outline"
				>
					<Link href={`/recruit/job/${job.id}`}>{'View'}</Link>
				</Button>
			</div>

			<div className="mt-4">
				<p className="text-xs font-medium text-neutral-500">{'Matching skills'}</p>
				<div className="mt-1 flex flex-wrap gap-1.5">
					{match.matchingSkills.slice(0, 8).map((s) => (
						<span
							key={`${job.id}-ms-${s.name}`}
							className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700"
						>
							{s.name}
						</span>
					))}
					{match.matchingSkills.length > 8 ? (
						<span className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">
							{'+'}
							{match.matchingSkills.length - 8} {'more'}
						</span>
					) : null}
				</div>
			</div>

			{match.skillGaps.length > 0 ? (
				<div className="mt-3">
					<p className="text-xs font-medium text-neutral-500">{'Gaps to improve'}</p>
					<div className="mt-1 flex flex-wrap gap-1.5">
						{match.skillGaps.slice(0, 6).map((s) => (
							<span
								key={`${job.id}-gap-${s.name}`}
								className="rounded-md bg-rose-50 px-2 py-0.5 text-xs text-rose-700"
							>
								{s.name}
							</span>
						))}
						{match.skillGaps.length > 6 ? (
							<span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs text-rose-700">
								{'+'}
								{match.skillGaps.length - 6} {'more'}
							</span>
						) : null}
					</div>
				</div>
			) : null}
		</div>
	)
}
