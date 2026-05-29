import { type NextRequest, NextResponse } from 'next/server';
import { ROUTE_LOGIN } from '@config/route';

/**
 * Legacy Supabase email-verification callback — no longer used.
 * Redirects to the login page.
 */
export async function GET(_request: NextRequest) {
  return NextResponse.redirect(new URL(ROUTE_LOGIN, _request.url));
}
