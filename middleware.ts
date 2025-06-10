import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = [
  '/',                  // Landing page
  '/api/(.*)?',         // API routes
  '/images/(.*)?',      // Public images
  '/_next/(.*)?',       // Next.js internals
  '/favicon.ico',       // Favicon
]

// Define app routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/subscriptions',
  '/settings',
  '/notifications',
  '/crypto-bots',
  '/stock-bots',
  '/forex-bots',
  '/mint-nft',
  '/community',
  '/aio-creators',
  '/copy-trading',
  '/dapps',
  '/metago-academy',
  '/marketplace',
]

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route.includes('(.*)?')) {
      const baseRoute = route.replace('(.*)?', '')
      return pathname.startsWith(baseRoute)
    }
    return pathname === route
  })
}

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // For protected routes, we'll handle authentication on the client side
  // since we can't access wallet state in middleware
  if (isProtectedRoute(pathname)) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
