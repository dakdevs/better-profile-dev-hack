import { serverConfig } from '~/config/server-config'

const CAL_COM_CLIENT_ID = serverConfig.calcom.clientId

export const createManagedUser = async ({
	name,
	email,
	timezone,
}: {
	name: string
	email: string
	timezone: string
}) => {
	console.log('Creating managed user', {
		email,
		timezone,
	})

	const response = await fetch(`https://api.cal.com/v2/oauth-clients/${CAL_COM_CLIENT_ID}/users`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-cal-client-id': serverConfig.calcom.clientId,
			'x-cal-secret-key': serverConfig.calcom.clientSecret,
		},
		body: JSON.stringify({
			email,
			name,
			timeZone: timezone,
		}),
	})

	if (!response.ok) {
		const errorResponse = (await response.json()) as Record<string, unknown>
		console.error('Failed to create managed user', JSON.stringify(errorResponse, null, 2))

		throw new Error('Failed to create managed user')
	}

	const responseData = (await response.json()) as {
		status: string
		data: {
			user: {
				id: string
				email: string
				username: string
				name: string
				bio: string | null
				timeZone: string
				weekStart: string
				createdDate: string
				timeFormat: number
				defaultScheduleId: number
				locale: string | null
				avatarUrl: string
			}
			accessToken: string
			accessTokenExpiresAt: number
			refreshToken: string
			refreshTokenExpiresAt: number
		}
	}

	console.log(JSON.stringify(responseData, null, 2))

	return responseData
}
