import { NextResponse, type NextRequest } from 'next/server';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';

const DEFAULT_ALLOWED_HEADERS = 'Content-Type, Authorization';

type ApiCorsConfig = Pick<
  SeedServerConfigInterface,
  'apiCorsAllowedOrigins' | 'apiCorsAllowedMethods'
>;

function isOriginAllowed(
  origin: string,
  allowedOrigins: readonly string[]
): boolean {
  return allowedOrigins.includes(origin);
}

function isMethodAllowed(
  method: string,
  allowedMethods: readonly string[]
): boolean {
  return allowedMethods.includes(method.toUpperCase());
}

export function isApiCorsEnabled(config: ApiCorsConfig): boolean {
  return config.apiCorsAllowedOrigins.length > 0;
}

export function buildApiCorsHeaders(
  req: NextRequest,
  config: ApiCorsConfig,
  options?: { credentials?: boolean }
): HeadersInit | undefined {
  if (!isApiCorsEnabled(config)) {
    return undefined;
  }

  const origin = req.headers.get('origin');
  if (!origin || !isOriginAllowed(origin, config.apiCorsAllowedOrigins)) {
    return undefined;
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': config.apiCorsAllowedMethods.join(', '),
    'Access-Control-Allow-Headers': DEFAULT_ALLOWED_HEADERS,
    ...(options?.credentials
      ? { 'Access-Control-Allow-Credentials': 'true' }
      : {}),
    Vary: 'Origin'
  };
}

export function apiCorsPreflightResponse(
  req: NextRequest,
  config: ApiCorsConfig,
  options?: { credentials?: boolean }
): NextResponse {
  const headers = buildApiCorsHeaders(req, config, options);
  if (!headers) {
    return new NextResponse(null, { status: 204 });
  }

  const requestMethod = req.headers.get('access-control-request-method');
  if (
    requestMethod &&
    !isMethodAllowed(requestMethod, config.apiCorsAllowedMethods)
  ) {
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...headers,
      'Access-Control-Max-Age': '86400'
    }
  });
}
