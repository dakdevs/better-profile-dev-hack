// ~/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '~/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the request is for the dashboard
  if (pathname.startsWith('/dashboard')) {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    // If no session, redirect to login
    if (!session) {
      const loginUrl = new URL('/', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If user is authenticated and on the root page, redirect to dashboard
  if (pathname === '/') {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (session?.user) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/dashboard/:path*']
}