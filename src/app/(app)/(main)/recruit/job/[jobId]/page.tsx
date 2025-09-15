import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Button } from '@mantine/core'
import { ArrowLeftIcon } from 'lucide-react'

import { db } from '~/db'
import { getRequiredSession } from '~/lib/auth'

export default async function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
	const session = await getRequiredSession()
	const { jobId } = await params
	const job = await getJobById(session.user.id, jobId)

	if (!job) {
		return notFound()
	}

	const requiredSkills = coerceNamedSkills(job.requiredSkills)
	const preferredSkills = coerceNamedSkills(job.preferredSkills)
	const extractedSkills = coerceExtractedSkills(job.extractedSkills)

	const experienceLabel = job.experienceLevel
		? job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)
		: 'Unspecified'

	const salaryMin = normalizeCurrency(job.salaryMin)
	const salaryMax = normalizeCurrency(job.salaryMax)

	return (
		<div className="px-md md:px-lg gap-md flex size-full flex-col">
			<div className="gap-md flex items-start justify-between">
				<div className="gap-sm flex flex-col">
					<h1 className="text-2xl font-bold md:text-3xl">{job.title}</h1>
					<div className="gap-sm flex flex-wrap items-center text-sm text-gray-500">
						<span>
							{'Posted '}
							{job.createdAt.toLocaleDateString()}
						</span>
						<span className="text-gray-300">{'•'}</span>
						<span>
							{'Experience: '}
							{experienceLabel}
						</span>
						{salaryMin || salaryMax ? (
							<>
								<span className="text-gray-300">{'•'}</span>
								<span>
									{'Salary: '}
									{formatSalaryRange(salaryMin, salaryMax)}
								</span>
							</>
						) : null}
					</div>
				</div>
				<Button
					component={Link}
					href="/recruit"
					leftSection={<ArrowLeftIcon size={16} />}
				>
					{'Back'}
				</Button>
			</div>

			<div className="gap-md grid grid-cols-1 md:grid-cols-3">
				<div className="p-md gap-sm col-span-2 flex flex-col rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-black">
					<h2 className="text-lg font-semibold">{'Job Description'}</h2>
					<p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">
						{job.rawDescription}
					</p>
				</div>

				<div className="gap-md flex flex-col">
					<div className="p-md gap-sm flex flex-col rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-black">
						<h3 className="text-md font-semibold">{'Required Skills'}</h3>
						{requiredSkills.length === 0 ? (
							<p className="text-sm text-gray-500">{'None specified'}</p>
						) : (
							<div className="flex flex-wrap gap-2">
								{requiredSkills.map((s) => (
									<span
										key={s.name}
										className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
									>
										{s.name}
									</span>
								))}
							</div>
						)}
					</div>

					<div className="p-md gap-sm flex flex-col rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-black">
						<h3 className="text-md font-semibold">{'Preferred Skills'}</h3>
						{preferredSkills.length === 0 ? (
							<p className="text-sm text-gray-500">{'None specified'}</p>
						) : (
							<div className="flex flex-wrap gap-2">
								{preferredSkills.map((s) => (
									<span
										key={s.name}
										className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
									>
										{s.name}
									</span>
								))}
							</div>
						)}
					</div>

					<div className="p-md gap-sm flex flex-col rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-black">
						<h3 className="text-md font-semibold">{'Extracted Skills'}</h3>
						{extractedSkills.length === 0 ? (
							<p className="text-sm text-gray-500">{'None extracted'}</p>
						) : (
							<div className="flex flex-wrap gap-2">
								{extractedSkills.map((s) => (
									<span
										key={`${s.name}-${String(s.confidence ?? 0)}`}
										className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
									>
										{s.name}
										{s.confidence != null ? (
											<span className="ml-1 text-[10px] text-gray-500">
												{Math.round(s.confidence * 100)}
												{'%'}
											</span>
										) : null}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="p-md gap-xs flex flex-col rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-black">
				<h2 className="text-lg font-semibold">{'Metadata'}</h2>
				<div className="gap-sm grid grid-cols-1 text-sm md:grid-cols-3">
					<div>
						<p className="text-gray-500">{'Job ID'}</p>
						<p className="font-mono text-gray-900 dark:text-gray-100">{job.id}</p>
					</div>
					<div>
						<p className="text-gray-500">{'Created'}</p>
						<p>{job.createdAt.toLocaleString()}</p>
					</div>
					<div>
						<p className="text-gray-500">{'Updated'}</p>
						<p>{job.updatedAt.toLocaleString()}</p>
					</div>
				</div>
			</div>
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

type NamedSkill = { name: string }
type ExtractedSkill = { name: string; confidence?: number }

function coerceNamedSkills(value: unknown): NamedSkill[] {
	if (!Array.isArray(value)) return []
	const items: NamedSkill[] = []
	for (const item of value) {
		if (item && typeof item === 'object') {
			const name = (item as Record<string, unknown>).name
			if (typeof name === 'string' && name.length > 0) {
				items.push({ name })
			}
		}
	}

	return items
}

function coerceExtractedSkills(value: unknown): ExtractedSkill[] {
	if (!Array.isArray(value)) return []
	const items: ExtractedSkill[] = []
	for (const item of value) {
		if (item && typeof item === 'object') {
			const record = item as Record<string, unknown>
			const name = record.name
			const confidence = record.confidence
			if (typeof name === 'string' && name.length > 0) {
				items.push({ name, confidence: typeof confidence === 'number' ? confidence : undefined })
			}
		}
	}

	return items
}

function normalizeCurrency(value: unknown): number | undefined {
	if (value == null) return undefined
	if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
	if (typeof value === 'string') {
		const parsed = Number.parseFloat(value)

		return Number.isFinite(parsed) ? parsed : undefined
	}

	return undefined
}

function formatSalaryRange(min?: number, max?: number): string {
	const formatter = new Intl.NumberFormat(undefined, {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0,
	})
	if (min != null && max != null) {
		return `${formatter.format(min)} - ${formatter.format(max)}`
	}
	if (min != null) {
		return `${formatter.format(min)}+`
	}
	if (max != null) {
		return `Up to ${formatter.format(max)}`
	}

	return 'Unspecified'
}
