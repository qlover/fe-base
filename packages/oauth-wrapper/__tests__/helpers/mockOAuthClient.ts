import type { OAuthClientRow } from '../../src/core/schema/OAuthAuthorizeSchema';

export function createMockOAuthClient(
  overrides: Partial<OAuthClientRow> = {}
): OAuthClientRow {
  return {
    id: 1,
    client_id: 'test-client',
    client_secret_hash: null,
    client_name: 'Test App',
    client_uri: 'https://app.example',
    logo_uri: null,
    redirect_uris: ['https://app.example/callback'],
    grant_types: ['authorization_code', 'refresh_token'],
    scopes: ['openid', 'profile', 'email'],
    confidential: false,
    owner_user_id: 1,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides
  };
}
