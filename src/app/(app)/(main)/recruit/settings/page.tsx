import Link from 'next/link'
import { Button } from '@mantine/core'
import { ArrowLeftIcon } from 'lucide-react'

import { db } from '~/db'
import { getRequiredSession } from '~/lib/auth'

import { ApiKeyForm } from './_modules/api-key-form'

export default async function RecruitSettingsPage() {
	const session = await getRequiredSession()
	const currentSettings = await getCurrentSettings(session.user.id)

	return (
		<div className="px-md md:px-lg gap-md grid">
			<h2 className="text-2xl font-bold">{'Settings'}</h2>
			<div className="p-md w-full rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-black">
				<ApiKeyForm initialValues={{ apiKey: currentSettings.apiKey }} />
			</div>
			<div>
				<Button
					component={Link}
					href="/recruit"
					leftSection={<ArrowLeftIcon size={16} />}
				>
					{'Back to Recruiter Dashboard'}
				</Button>
			</div>
		</div>
	)
}

async function getCurrentSettings(userId: string) {
	const settings = await db.query.recruitSettings.findFirst({
		where: (table, { eq }) => {
			return eq(table.userId, userId)
		},
	})

	return {
		apiKey: settings?.calcomApiKey ?? '',
	}
}
