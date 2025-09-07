import { Avatar } from '@mantine/core'

import { useSession } from '~/lib/auth-client'

export default function ChatAvatar() {
	const auth = useSession()

	return <Avatar src={auth.data?.user.image} />
}
