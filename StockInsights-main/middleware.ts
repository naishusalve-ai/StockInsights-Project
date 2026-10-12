import { NextResponse } from "next/server"
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

// Public routes (no auth)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/terms",
  "/privacy",
  "/api/stocks", // Basic stock quotes are public
  "/api/webhooks(.*)", // Webhook endpoints
  "/api/cron(.*)", // Cron endpoints (have their own auth)
])

// Rate limiting for API routes (in-memory, use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100 // 100 requests per minute for authenticated users

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const key = ip
  
  const current = rateLimitMap.get(key)
  
  if (!current || current.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 }
  }
  
  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 }
  }
  
  current.count++
  rateLimitMap.set(key, current)
  
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - current.count }
}

// Clean up rate limit map periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap.entries()) {
    if (value.resetAt < now) {
      rateLimitMap.delete(key)
    }
  }
}, 60000)

export default clerkMiddleware(async (auth, req) => {
  const url = new URL(req.url)
  
  // Add security headers to all responses
  const response = NextResponse.next()
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // CSP Header (adjust as needed for your CDNs)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev wss://*.clerk.com; frame-ancestors 'none';"
    )
  }
  
  // Rate limiting for API routes
  if (url.pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    const rateLimit = checkRateLimit(ip)
    
    response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
    response.headers.set('X-RateLimit-Reset', '60')
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': '60'
          }
        }
      )
    }
  }
  
  // Allow public routes through
  if (isPublicRoute(req)) return response

  try {
    // For protected routes, redirect to sign-in if not authenticated
    const { userId } = await auth()
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url)
      // Preserve the intended URL for post-login redirect
      const returnUrl = req.url
      signInUrl.searchParams.set("redirect_url", returnUrl)
      return NextResponse.redirect(signInUrl)
    }
    
    // User is authenticated, allow the request to proceed
    return response
  } catch (error) {
    console.error("Auth error:", error)
    // If there's an error, redirect to sign-in as a fallback
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }
})

// Match all paths that should be protected
const protectedPaths = [
  "/portfolio(.*)",
  "/dashboard(.*)",
  "/analysis(.*)",
  "/api/portfolio(.*)",
  "/api/auth(.*)",
]

export const config = {
  matcher: [
    // Match all paths except static files and public assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
