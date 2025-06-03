import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',                  // Landing page
  '/sign-in/(.*)?',     // Sign in pages
  '/sign-up/(.*)?',     // Sign up pages
  '/api/(.*)?',         // API routes
  '/images/(.*)?',      // Public images
])

// Define app routes that require authentication
const isAppRoute = createRouteMatcher([
  '/dashboard(.*)?',
  '/profile(.*)?',
  '/subscriptions(.*)?',
  '/settings(.*)?',
  '/notifications(.*)?',
  '/crypto-bots(.*)?',
  '/stock-bots(.*)?',
  '/forex-bots(.*)?',
  '/mint-nft(.*)?',
  '/community(.*)?',
  '/copy-trading(.*)?',
  '/dapps(.*)?',
  '/metago-academy(.*)?',
  '/marketplace(.*)?',
])

export default clerkMiddleware({
  // Protect app routes
  afterAuth(auth, req) {
    // If the user is not signed in and the route is an app route, redirect to landing page
    if (!auth.userId && isAppRoute(req.nextUrl.pathname)) {
      return Response.redirect(new URL('/', req.url))
    }
  },
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
