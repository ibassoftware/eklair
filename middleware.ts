import { NextRequest, NextResponse } from 'next/server'
import { validateSession, getSessionToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  const publicRoutes = ['/login', '/support']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Allow auth API routes
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Get session token from cookies
  const token = getSessionToken(request.cookies)

  // Validate session
  const isAuthenticated = token ? await validateSession(token) : false

  // Redirect logic
  if (!isAuthenticated && !isPublicRoute) {
    // Not authenticated, trying to access protected route
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthenticated && pathname === '/login') {
    // Already authenticated, trying to access login page
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
