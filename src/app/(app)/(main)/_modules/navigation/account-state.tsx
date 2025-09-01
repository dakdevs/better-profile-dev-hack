import { Avatar } from '@mantine/core'

import { getSession } from '~/lib/auth'

import HideOnCollapse from './hide-on-collapse'

export default async function AccountState() {
	const auth = await getSession()

	return (
		<div className="pb-sm pt-md px-sm gap-md flex items-center border-t border-neutral-200">
			<Avatar
				size="md"
				src={auth?.user.image}
			/>
			<HideOnCollapse>{auth?.user.name}</HideOnCollapse>
		</div>
	)
}
