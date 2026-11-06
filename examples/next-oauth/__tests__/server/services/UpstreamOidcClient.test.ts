import { afterEach, describe, expect, it, vi } from 'vitest';
import { UpstreamOidcClient } from '@server/services/UpstreamOidcClient';

describe('UpstreamOidcClient', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('isConfigured requires serverUrl and clientId', () => {
    vi.stubEnv('OAUTH_UPSTREAM_OIDC_SERVER_URL', '');
    vi.stubEnv('OAUTH_UPSTREAM_OIDC_CLIENT_ID', '');
    const empty = new UpstreamOidcClient();
    expect(empty.isConfigured()).toBe(false);

    vi.stubEnv('OAUTH_UPSTREAM_OIDC_SERVER_URL', 'https://idp.example');
    vi.stubEnv('OAUTH_UPSTREAM_OIDC_CLIENT_ID', 'client-1');
    const ready = new UpstreamOidcClient();
    expect(ready.isConfigured()).toBe(true);
  });

  it('buildAuthorizeStart returns authorize URL with PKCE params', async () => {
    vi.stubEnv('OAUTH_UPSTREAM_OIDC_SERVER_URL', 'https://idp.example');
    vi.stubEnv('OAUTH_UPSTREAM_OIDC_CLIENT_ID', 'client-1');
    const client = new UpstreamOidcClient();
    const started = await client.buildAuthorizeStart({
      redirectUri: 'https://app.example/api/callback/upstream-oauth'
    });
    expect(started.authorizeUrl).toContain(
      'https://idp.example/oauth/authorize'
    );
    expect(started.authorizeUrl).toContain('client_id=client-1');
    expect(started.authorizeUrl).toContain('code_challenge=');
    expect(started.authorizeUrl).toContain('code_challenge_method=S256');
    expect(started.state.length).toBeGreaterThan(8);
    expect(started.codeVerifier.length).toBeGreaterThan(40);
  });

  it('exchangeAuthorizationCode posts form body', async () => {
    vi.stubEnv('OAUTH_UPSTREAM_OIDC_SERVER_URL', 'https://idp.example');
    vi.stubEnv('OAUTH_UPSTREAM_OIDC_CLIENT_ID', 'client-1');
    vi.stubEnv('OAUTH_UPSTREAM_OIDC_CLIENT_SECRET', 'secret');
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          access_token: 'at',
          refresh_token: 'rt',
          token_type: 'Bearer',
          expires_in: 3600
        })
    });
    vi.stubGlobal('fetch', fetchMock);

    const client = new UpstreamOidcClient();
    const tokens = await client.exchangeAuthorizationCode({
      code: 'abc',
      codeVerifier: 'verifier',
      redirectUri: 'https://app.example/cb'
    });
    expect(tokens.access_token).toBe('at');
    expect(tokens.refresh_token).toBe('rt');
    expect(fetchMock).toHaveBeenCalledOnce();
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(init.body)).toContain('grant_type=authorization_code');
    expect(String(init.body)).toContain('code_verifier=verifier');
    expect(String(init.body)).toContain('client_secret=secret');
  });
});
