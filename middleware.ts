import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory store for rate limiting
// NOTE: In Vercel Edge Runtime, this memory is ephemeral per isolate. 
// It provides basic protection but for robust multi-region protection, Upstash Redis is recommended.
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

export function middleware(request: NextRequest) {
  // Apply only to /api/auth/* routes
  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    // Get client IP
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown-ip';
    
    const isAllowed = checkRateLimit(ip);
    
    if (!isAllowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too Many Requests - Rate limit exceeded. Try again in 15 minutes.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/:path*'],
};
