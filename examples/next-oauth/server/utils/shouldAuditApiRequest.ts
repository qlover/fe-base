import {
  createApiAuditMatcher,
  type ApiAuditRule
} from '@qlover/next-kit/server';

/**
 * Decide whether an HTTP API call should write a `fe_request_logs` row.
 *
 * Default is **deny** (allowlist). High-frequency reads (session / locales /
 * request-logs paging) must not flood the table. Auth login/logout already use
 * `insertWithAuth` and are intentionally omitted here to avoid duplicate rows.
 */
const AUDIT_RULES: readonly ApiAuditRule[] = [
  // Account mutations that lack insertWithAuth
  { method: 'POST', path: '/api/user/register' },
  { method: 'POST', path: '/api/user/otp/login' },
  { method: 'POST', path: '/api/user/otp/verify' },
  { method: 'POST', path: '/api/user/login/provider' },
  { method: 'POST', path: '/api/user/password' },

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
