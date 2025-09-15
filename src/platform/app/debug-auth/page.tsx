'use client'

import { useEffect, useState } from 'react'

import { useCSRFToken } from '~/hooks/use-csrf-token'

export default function DebugAuthPage() {
	const [authStatus, setAuthStatus] = useState<any>(null)
	const [profileStatus, setProfileStatus] = useState<any>(null)
	const [loading, setLoading] = useState(true)

	const csrfToken = useCSRFToken()

	useEffect(() => {
		const checkAuth = async () => {
			try {
				// Check authentication by trying to access a protected endpoint
				const authResponse = await fetch('/api/recruiter/profile')
				const authData = await authResponse.json()

				setAuthStatus({
					status: authResponse.status,
					ok: authResponse.ok,
					data: authData,
				})

				if (authResponse.status === 404) {
					setProfileStatus('Profile not found - needs to be created')
				} else if (authResponse.ok) {
					setProfileStatus('Profile exists')
				} else {
					setProfileStatus(`Error: ${authData.error}`)
				}
			} catch (error) {
				setAuthStatus({
					error: error instanceof Error ? error.message : 'Unknown error',
				})
			} finally {
				setLoading(false)
			}
		}

		checkAuth()
	}, [])

	if (loading) {
		return <div className="p-6">Loading auth status...</div>
	}

	return (
		<div className="mx-auto max-w-2xl space-y-6 p-6">
			<h1 className="text-2xl font-semibold">Authentication Debug</h1>

			<div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-black">
				<div>
					<h2 className="mb-2 text-lg font-medium">CSRF Token</h2>
					<div className="rounded bg-gray-100 p-3 font-mono text-sm break-all dark:bg-gray-800">
						{csrfToken || 'Not available'}
					</div>
				</div>

				<div>
					<h2 className="mb-2 text-lg font-medium">Authentication Status</h2>
					<pre className="overflow-auto rounded bg-gray-100 p-3 text-sm dark:bg-gray-800">
						{JSON.stringify(authStatus, null, 2)}
					</pre>
				</div>

				<div>
					<h2 className="mb-2 text-lg font-medium">Profile Status</h2>
					<div className="rounded bg-gray-100 p-3 text-sm dark:bg-gray-800">{profileStatus}</div>
				</div>

				<div className="pt-4">
					<h2 className="mb-2 text-lg font-medium">Quick Actions</h2>
					<div className="flex gap-2">
						<a
							href="/recruiter/profile"
							className="bg-apple-blue rounded-lg px-4 py-2 text-sm text-white hover:bg-blue-600"
						>
							Go to Profile
						</a>
						<a
							href="/test-csrf"
							className="rounded-lg bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
						>
							Test CSRF
						</a>
					</div>
				</div>
			</div>
		</div>
	)
}
