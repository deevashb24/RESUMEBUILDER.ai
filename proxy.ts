import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// --- Rate Limiting Logic ---
interface RateLimitData {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitData>();
const MAX_REQUESTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userRecord = rateLimitStore.get(ip);

  if (!userRecord || now > userRecord.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return true; // Allowed
  }

  if (userRecord.count >= MAX_REQUESTS) {
    return false; // Rate limited
  }

  userRecord.count += 1;
  return true; // Allowed
}

// --- Clerk Auth Logic ---
const isPublicRoute = createRouteMatcher([
  "/",
  "/privacy",
  "/terms",
  "/cookies",
  "/contact",
  "/refund-policy",
  "/cancellation-policy",
  "/api/webhook",
  "/api/razorpay/webhook"
]);

export default clerkMiddleware(async (auth, request: NextRequest) => {
  // 1. Rate Limiting for /api/auth routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    // Next.js removed request.ip in recent versions, rely on headers instead
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    const isAllowed = checkRateLimit(ip);
    
    if (!isAllowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests - Rate limit exceeded. Try again in 15 minutes.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. Clerk Authentication
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
