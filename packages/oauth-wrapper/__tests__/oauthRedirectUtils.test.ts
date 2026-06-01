import { describe, expect, it } from 'vitest';
import {
  buildOAuthRedirectUrl,
  parseScopeList
} from '../src/server/utils/oauthRedirectUtils';

describe('oauthRedirectUtils', () => {
  describe('buildOAuthRedirectUrl', () => {
    it('appends OAuth redirect parameters', () => {
      const url = buildOAuthRedirectUrl('https://app.example/callback', {
        code: 'abc123',
        state: 'xyz'
      });

      expect(url).toBe('https://app.example/callback?code=abc123&state=xyz');
    });

    it('skips empty and undefined params', () => {
      const url = buildOAuthRedirectUrl('https://app.example/callback', {
        code: 'abc123',
        state: undefined,
        error_description: ''
      });

      expect(url).toBe('https://app.example/callback?code=abc123');
    });

    it('preserves existing query params on redirect URI', () => {
      const url = buildOAuthRedirectUrl(
        'https://app.example/callback?foo=bar',
        { code: 'abc123' }
      );

      expect(url).toBe('https://app.example/callback?foo=bar&code=abc123');
    });
  });

  describe('parseScopeList', () => {
    it('returns default scopes when scope is missing', () => {
      expect(parseScopeList(undefined)).toEqual(['openid', 'profile', 'email']);
    });

    it('returns default scopes for blank scope', () => {
      expect(parseScopeList('   ')).toEqual(['openid', 'profile', 'email']);
    });

    it('splits space-delimited scopes', () => {
      expect(parseScopeList('openid profile')).toEqual(['openid', 'profile']);
    });
  });
});
