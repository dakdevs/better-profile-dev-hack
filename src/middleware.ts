import { cache } from 'react'
import { headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { betterFetch } from '@better-fetch/fetch'

import type { auth } from './lib/auth'

type Session = typeof auth.$Infer.Session

const PROTECTED_PATHS = ['/profile', '/account']
const isProtectedPath = (url: URL) => PROTECTED_PATHS.some((path) => url.pathname.startsWith(path))

export async function middleware(request: NextRequest) {
	if (isProtectedPath(request.nextUrl)) {
		const headersList = await headers()

		const session = await getSession({
			origin: request.nextUrl.origin,
			cookie: headersList.get('cookie'),
		})

		if (!session) {
			return NextResponse.redirect(new URL('/login', request.url))
		}
	}

	return NextResponse.next()
}

const getSession = cache(async function ({
	origin,
	cookie,
}: {
	origin: string
	cookie: string | null
}) {
	const { data: session } = await betterFetch<Session>('/api/auth/get-session', {
		baseURL: origin,
		headers: {
			cookie: cookie ?? '',
		},
	})

	return session
})

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public files
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
	],
}
