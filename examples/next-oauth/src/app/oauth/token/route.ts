import { ROUTE_OAUTH_TOKEN } from '@config/route';
import { OAuthWrapperController } from '@server/controllers/OAuthWrapperController';
import { NextApiServer } from '@server/NextApiServer';
import { ServerConfig } from '@server/ServerConfig';
import {
  apiCorsPreflightResponse,
  buildApiCorsHeaders
} from '@server/utils/apiCors';
import type { NextRequest } from 'next/server';

const corsConfig = new ServerConfig();

/**
 * Parses OAuth token POST body (application/x-www-form-urlencoded or multipart).
 * Merges optional HTTP Basic client credentials.
 */
export async function parseOAuthTokenRequest(
  req: NextRequest
): Promise<Record<string, string>> {
  const contentType = req.headers.get('content-type') ?? '';
  let fields: Record<string, string> = {};

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    fields = Object.fromEntries(new URLSearchParams(text));
  } else if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    for (const [key, value] of form.entries()) {
      if (typeof value === 'string') {
        fields[key] = value;
      }
    }
  } else if (contentType.includes('application/json')) {
    const json = (await req.json()) as Record<string, unknown>;
    for (const [key, value] of Object.entries(json)) {
      if (typeof value === 'string') {
        fields[key] = value;
      }
    }
  } else {
    const text = await req.text();
    if (text.trim()) {
      fields = Object.fromEntries(new URLSearchParams(text));
    }
  }

  const basic = parseBasicAuth(req.headers.get('authorization'));
  if (basic.clientId && !fields.client_id) {
    fields.client_id = basic.clientId;
  }
  if (basic.clientSecret && !fields.client_secret) {
    fields.client_secret = basic.clientSecret;
  }

  return fields;
}

function parseBasicAuth(header: string | null): {
  clientId?: string;
  clientSecret?: string;
} {
  if (!header?.startsWith('Basic ')) {
    return {};
  }

  try {
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator === -1) {
      return { clientId: decoded };
    }
    return {
      clientId: decoded.slice(0, separator),
      clientSecret: decoded.slice(separator + 1)
    };
  } catch {
    return {};
  }
}

/**
 * CORS preflight for cross-origin OAuth token requests.
 */
export async function OPTIONS(req: NextRequest) {
  return apiCorsPreflightResponse(req, corsConfig);
}

/**
 * OAuth 2.0 token endpoint (RFC 6749).
 *
 * Supports `grant_type=authorization_code` and `grant_type=refresh_token`.
 * Client authentication via HTTP Basic or form body parameters.
 */
export async function POST(req: NextRequest) {
  const corsHeaders = buildApiCorsHeaders(req, corsConfig);

  return await new NextApiServer({
    name: ROUTE_OAUTH_TOKEN,
    nextRequest: req,
    event_category: 'oauth-wrapper'
  }).runWithJson(
    async ({ parameters: { IOC } }) =>
      IOC(OAuthWrapperController).exchangeToken(
        await parseOAuthTokenRequest(req)
      ),
    corsHeaders
      ? { successHeaders: corsHeaders, errorHeaders: corsHeaders }
      : undefined
  );
}
