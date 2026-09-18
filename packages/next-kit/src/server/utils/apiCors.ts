import { NextResponse, type NextRequest } from 'next/server';

const DEFAULT_ALLOWED_HEADERS = 'Content-Type, Authorization';

/**
 * One CORS allow rule: origin × API path × HTTP methods.
 * Use `*` on any field to match all values for that dimension.
 */
export type ApiCorsRule = {
  /** Exact Origin (e.g. `http://localhost:3100`) or `*`. */
  readonly origin: string;
  /** Exact pathname (e.g. `/oauth/token`), prefix (`/oauth/*`), or `*`. */
  readonly path: string;
  /** Allowed methods for this rule, or `['*']` for any method. */
  readonly methods: readonly string[];
};

export type ApiCorsConfig = {
  /**
   * Legacy flat origin allowlist. Used only when `apiCorsRules` is empty.
   * Each origin is treated as `origin → * → defaultMethods`.
   */
  readonly apiCorsAllowedOrigins: readonly string[];
  /** Default methods for legacy origins / rules that omit methods. */
  readonly apiCorsAllowedMethods: readonly string[];
  /** Preferred: explicit origin × path × method rules. */
  readonly apiCorsRules?: readonly ApiCorsRule[];
};

export type ApiCorsHeaderOptions = {
  readonly credentials?: boolean;
  /** Request pathname used for rule matching (e.g. `/oauth/token`). */
  readonly path?: string;
};

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed || trimmed === '*') {
    return '*';
  }
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

function normalizeMethods(methods: readonly string[]): string[] {
  return methods.map((method) => method.trim().toUpperCase()).filter(Boolean);
}

function isPathAllowed(pathname: string, rulePath: string): boolean {
  const expected = normalizePath(rulePath);
  if (expected === '*') {
    return true;
  }
  const actual = normalizePath(pathname);
  if (expected.endsWith('/*')) {
    const prefix = expected.slice(0, -1);
    return actual === prefix.slice(0, -1) || actual.startsWith(prefix);
  }
  return actual === expected;
}

function isOriginAllowedByRule(origin: string, ruleOrigin: string): boolean {
  return ruleOrigin.trim() === '*' || ruleOrigin.trim() === origin;
}

function isMethodAllowedByRule(
  method: string,
  ruleMethods: readonly string[]
): boolean {
  const normalized = normalizeMethods(ruleMethods);
  if (normalized.length === 0) {
    return false;
  }
  if (normalized.includes('*')) {
    return true;
  }
  return normalized.includes(method.toUpperCase());
}

function resolveRules(config: ApiCorsConfig): ApiCorsRule[] {
  if (config.apiCorsRules && config.apiCorsRules.length > 0) {
    return [...config.apiCorsRules];
  }

  const defaultMethods =
    config.apiCorsAllowedMethods.length > 0
      ? config.apiCorsAllowedMethods
      : ['GET', 'POST', 'OPTIONS'];

  return config.apiCorsAllowedOrigins.map((origin) => ({
    origin,
    path: '*',
    methods: defaultMethods
  }));
}

/**
 * Prefer an exact-origin match over `*`, then first matching path.
 */
export function findMatchingCorsRule(
  origin: string,
  pathname: string,
  config: ApiCorsConfig,
  method?: string
): ApiCorsRule | undefined {
  const rules = resolveRules(config);
  if (rules.length === 0) {
    return undefined;
  }

  const candidates = rules.filter(
    (rule) =>
      isOriginAllowedByRule(origin, rule.origin) &&
      isPathAllowed(pathname, rule.path) &&
      (method === undefined || isMethodAllowedByRule(method, rule.methods))
  );

  if (candidates.length === 0) {
    return undefined;
  }

  return (
    candidates.find((rule) => rule.origin.trim() !== '*') ?? candidates[0]
  );
}

export function isApiCorsEnabled(config: ApiCorsConfig): boolean {
  if (config.apiCorsRules && config.apiCorsRules.length > 0) {
    return true;
  }
  return config.apiCorsAllowedOrigins.length > 0;
}

export function buildApiCorsHeaders(
  req: NextRequest,
  config: ApiCorsConfig,
  options?: ApiCorsHeaderOptions
): HeadersInit | undefined {
  if (!isApiCorsEnabled(config)) {
    return undefined;
  }

  const origin = req.headers.get('origin');
  if (!origin) {
    return undefined;
  }

  const pathname =
    options?.path?.trim() ||
    (() => {
      try {
        return new URL(req.url).pathname;
      } catch {
        return '/';
      }
    })();

  const rule = findMatchingCorsRule(origin, pathname, config);
  if (!rule) {
    return undefined;
  }

  const methods = normalizeMethods(rule.methods);
  const allowMethods = methods.includes('*')
    ? config.apiCorsAllowedMethods.length > 0
      ? [...config.apiCorsAllowedMethods]
      : ['GET', 'POST', 'OPTIONS']
    : methods;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': allowMethods.join(', '),
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
  options?: ApiCorsHeaderOptions
): NextResponse {
  const origin = req.headers.get('origin');
  const requestMethod = req.headers.get('access-control-request-method');
  const pathname =
    options?.path?.trim() ||
    (() => {
      try {
        return new URL(req.url).pathname;
      } catch {
        return '/';
      }
    })();

  if (!origin || !isApiCorsEnabled(config)) {
    return new NextResponse(null, { status: 204 });
  }

  const rule = findMatchingCorsRule(
    origin,
    pathname,
    config,
    requestMethod ?? undefined
  );
  if (!rule) {
    return new NextResponse(null, { status: 204 });
  }

  const headers = buildApiCorsHeaders(req, config, options);
  if (!headers) {
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
