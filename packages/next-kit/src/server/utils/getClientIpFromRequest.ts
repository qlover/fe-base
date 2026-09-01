import type { NextRequest } from 'next/server';

/**
 * Best-effort client IP for rate limiting behind reverse proxies.
 */
export function getClientIpFromRequest(request: NextRequest | Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  return 'unknown';
}
