import { describe, expect, it } from 'vitest';
import {
  needsSessionGate,
  resolveApiPathname
} from '@/impls/appApi/AppApiSessionGatePlugin';

describe('AppApiSessionGatePlugin helpers', () => {
  it('resolveApiPathname strips origin and query', () => {
    expect(resolveApiPathname('https://example.com/api/user/session?x=1')).toBe(
      '/api/user/session'
    );
    expect(resolveApiPathname('/api/user/login?a=b')).toBe('/api/user/login');
  });

  it('needsSessionGate exempts auth/session/locales paths', () => {
    expect(needsSessionGate('/api/user/login')).toBe(false);
    expect(needsSessionGate('/api/user/session')).toBe(false);
    expect(needsSessionGate('/api/user/otp/login')).toBe(false);
    expect(needsSessionGate('/api/locales/json')).toBe(false);
    expect(needsSessionGate('/api/callback/email-login')).toBe(false);
  });

  it('needsSessionGate requires gate for other /api paths', () => {
    expect(needsSessionGate('/api/user/profile')).toBe(true);
    expect(needsSessionGate('/not-api')).toBe(false);
  });
});
