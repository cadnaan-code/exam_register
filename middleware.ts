import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenEdge } from './lib/jwt-edge'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get('admin_session')?.value

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify token using Edge-compatible function
    const session = verifyTokenEdge(token, JWT_SECRET)
    if (!session) {
      // Log for debugging (remove in production)
      console.log('[Middleware] Token verification failed for path:', pathname)
      // Clear invalid token and redirect to login
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete('admin_session')
      return response
    }
    
    // Token is valid, allow request to proceed
    const response = NextResponse.next()
    // Add user info to headers for debugging (optional)
    response.headers.set('X-User-Id', session.userId)
    return response
  }

  // Always show login page - don't auto-redirect if already authenticated
  // User must manually navigate or login will redirect after successful login

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
  ],
}
