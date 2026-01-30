import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'Hello World',
    hash: req.nextUrl.hash,
    url: req.url,
    href: req.nextUrl.href
  });
}
