import {
  createApiAuditMatcher,
  type ApiAuditRule
} from '@qlover/next-kit/server';

/**
 * Optional allowlist matcher (PAM-style). Kept for callers that still need
 * path-scoped audit; {@link NextApiServer.afterApiResult} now logs **all
 * API failures** and skips successes (xOranj policy).
 *
 * Auth login/logout already use `insertWithAuth` and should stay off any
 * success-path allowlist to avoid duplicate rows.
 */
const AUDIT_RULES: readonly ApiAuditRule[] = [
  // Account mutations that lack insertWithAuth
  { method: 'POST', path: '/api/user/register' },
  { method: 'POST', path: '/api/user/otp/login' },
  { method: 'POST', path: '/api/user/otp/verify' },
  { method: 'POST', path: '/api/user/login/provider' },
  { method: 'POST', path: '/api/user/password' },
  { method: 'POST', path: '/api/user/bind-email/send' },
  { method: 'POST', path: '/api/user/bind-email/verify' },
  { method: 'POST', path: '/api/user/display-name' },

  // Developer OAuth client mutations + consent
  { method: 'POST', path: '/api/clients' },
  {
    method: ['PUT', 'DELETE'],
    path: /^\/api\/clients\/[^/]+$/
  },
  {
    method: 'POST',
    path: /^\/api\/clients\/[^/]+\/rotate-secret$/
  },
  { method: 'POST', path: '/api/oauth/consent' },

  // Admin mutations
  { method: ['POST', 'PATCH', 'PUT', 'DELETE'], path: /^\/api\/admin\// }
];

/**
 * Returns true when this request should be persisted to `fe_request_logs`.
 */
export const shouldAuditApiRequest = createApiAuditMatcher(AUDIT_RULES);
