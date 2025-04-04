import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the route requires authentication
  const protectedRoutes = [
    '/movies/', // This will match all routes under /movies/ including movie details
    '/profile/',
  ]
  
  // Check if the current path matches any of the protected routes
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  // If the route is protected and the user is not authenticated,
  // redirect to the login page with the original URL as the redirect parameter
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }
  
  return res
}

// Only run this middleware on routes that need to be protected
export const config = {
  matcher: [
    '/movies/:path*',
    '/profile/:path*',
  ],
} 