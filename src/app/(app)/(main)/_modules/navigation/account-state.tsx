import { Avatar } from '@mantine/core'

import { getSession } from '~/lib/auth'

export default async function AccountState() {
	const auth = await getSession()

	return (
		<div className="pb-sm pt-md px-md gap-md flex items-center border-t border-neutral-200">
			<Avatar
				size="md"
				src={auth?.user.image}
			/>
			{auth?.user.name}
		</div>
	)
}
