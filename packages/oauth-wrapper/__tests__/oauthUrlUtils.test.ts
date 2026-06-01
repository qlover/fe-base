import { describe, expect, it } from 'vitest';
import {
  buildAuthorizeSearchParams,
  buildOAuthAuthorizeUrl,
  buildOAuthLocaleHeaders,
  buildOAuthRedirectUri,
  formatOAuthAuthorizeUrl,
  mergeOAuthAuthorizationConfig
} from '../src/client/oauthUrlUtils';

describe('oauthUrlUtils', () => {
  describe('buildAuthorizeSearchParams', () => {
    it('builds standard authorization query params', () => {
      const params = buildAuthorizeSearchParams({
        clientId: 'client-1',
        redirectUri: 'https://app.example/oauth/callback',
        scope: 'openid profile',
        state: 'state-1',
        codeChallenge: 'challenge-1'
      });

      expect(Object.fromEntries(params.entries())).toEqual({
        response_type: 'code',
        client_id: 'client-1',
        redirect_uri: 'https://app.example/oauth/callback',
        scope: 'openid profile',
        state: 'state-1',
        code_challenge: 'challenge-1',
        code_challenge_method: 'S256'
      });
    });
  });

  describe('mergeOAuthAuthorizationConfig', () => {
    it('merges params over base config', () => {
      const merged = mergeOAuthAuthorizationConfig(
        { scope: 'openid' },
        {
          serverUrl: 'https://auth.example/',
          clientId: 'client-1'
        }
      );

      expect(merged).toEqual({
        serverUrl: 'https://auth.example',
        clientId: 'client-1',
        scope: 'openid',
        redirectPath: 'oauth/callback'
      });
    });

    it('returns null when required fields are missing', () => {
      expect(mergeOAuthAuthorizationConfig({}, null)).toBeNull();
      expect(
        mergeOAuthAuthorizationConfig(
          { clientId: 'client-1' },
          { serverUrl: '', clientId: '' }
        )
      ).toBeNull();
    });
  });

  describe('buildOAuthRedirectUri', () => {
    it('builds callback URL from origin and redirect path', () => {
      const url = buildOAuthRedirectUri('oauth/callback', {
        origin: 'https://app.example/'
      });

      expect(url).toBe('https://app.example/oauth/callback');
    });

    it('inserts locale in path when localeIn is path', () => {
      const url = buildOAuthRedirectUri('oauth/callback', {
        origin: 'https://app.example',
        locale: 'zh',
        localeIn: 'path'
      });

      expect(url).toBe('https://app.example/zh/oauth/callback');
    });

    it('appends locale as query param when localeIn is query', () => {
      const url = buildOAuthRedirectUri('oauth/callback', {
        origin: 'https://app.example',
        locale: 'zh',
        localeIn: 'query',
        localeQueryParam: 'lang'
      });

      expect(url).toBe('https://app.example/oauth/callback?lang=zh');
    });
  });

  describe('formatOAuthAuthorizeUrl', () => {
    it('builds authorize endpoint URL with query string', () => {
      const params = new URLSearchParams({ client_id: 'client-1' });
      const url = formatOAuthAuthorizeUrl(
        'https://auth.example/',
        '/oauth/authorize',
        params
      );

      expect(url).toBe(
        'https://auth.example/oauth/authorize?client_id=client-1'
      );
    });

    it('inserts locale into authorize path', () => {
      const params = new URLSearchParams({ client_id: 'client-1' });
      const url = formatOAuthAuthorizeUrl(
        'https://auth.example',
        '/oauth/authorize',
        params,
        { locale: 'en', localeIn: 'path' }
      );

      expect(url).toBe(
        'https://auth.example/en/oauth/authorize?client_id=client-1'
      );
    });
  });

  describe('buildOAuthAuthorizeUrl', () => {
    it('builds a full authorize URL with PKCE params', () => {
      const url = buildOAuthAuthorizeUrl({
        config: {
          serverUrl: 'https://auth.example',
          clientId: 'client-1',
          scope: 'openid profile email',
          redirectPath: 'oauth/callback'
        },
        authorizePath: '/oauth/authorize',
        state: 'state-1',
        codeChallenge: 'challenge-1',
        origin: 'https://app.example'
      });

      const parsed = new URL(url);
      expect(parsed.origin + parsed.pathname).toBe(
        'https://auth.example/oauth/authorize'
      );
      expect(parsed.searchParams.get('client_id')).toBe('client-1');
      expect(parsed.searchParams.get('redirect_uri')).toBe(
        'https://app.example/oauth/callback'
      );
      expect(parsed.searchParams.get('code_challenge')).toBe('challenge-1');
    });
  });

  describe('buildOAuthLocaleHeaders', () => {
    it('returns Accept-Language header when localeIn is header', () => {
      expect(
        buildOAuthLocaleHeaders({ locale: 'zh', localeIn: 'header' })
      ).toEqual({ 'Accept-Language': 'zh' });
    });

    it('returns empty object for non-header locale modes', () => {
      expect(
        buildOAuthLocaleHeaders({ locale: 'zh', localeIn: 'path' })
      ).toEqual({});
    });
  });
});
