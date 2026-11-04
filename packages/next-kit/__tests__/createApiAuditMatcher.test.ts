import { describe, expect, it } from 'vitest';
import { createApiAuditMatcher } from '../src/server/utils/createApiAuditMatcher';

describe('createApiAuditMatcher', () => {
  const match = createApiAuditMatcher([
    { method: 'POST', path: '/api/user/register' },
    { method: ['PUT', 'DELETE'], path: /^\/api\/clients\/[^/]+$/ }
  ]);

  it('matches exact method and path', () => {
    expect(match('POST', '/api/user/register')).toBe(true);
    expect(match('GET', '/api/user/register')).toBe(false);
  });

  it('matches method list and path regex', () => {
    expect(match('PUT', '/api/clients/abc')).toBe(true);
    expect(match('DELETE', '/api/clients/abc')).toBe(true);
    expect(match('POST', '/api/clients/abc')).toBe(false);
    expect(match('PUT', '/api/clients/abc/rotate-secret')).toBe(false);
  });

  it('denies by default', () => {
    expect(match('GET', '/api/user/session')).toBe(false);
  });
});
