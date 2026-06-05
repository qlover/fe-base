import { createHash } from 'crypto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { EncryptorInterface } from '@qlover/fe-corekit';
import { OAuthRfcCodes } from '../src/core';
import type { OAuthAuthorizationCodeRow } from '../src/core/schema/OAuthAuthorizeSchema';
import type { OAuthRefreshTokenRow } from '../src/core/schema/OAuthClientSchema';
import type { ExchangeProviderAccessToken } from '../src/server/services/OAuthTokenService';
import type { OAuthWrapperRepositoryInterface } from '../src/core/interfaces/OAuthWrapperRepositoryInterface';
import { OAuthTokenService } from '../src/server/services/OAuthTokenService';
import { OAuthWrapperError } from '../src/server/utils/OAuthWrapperError';
import { createMockOAuthClient } from './helpers/mockOAuthClient';
import {
  TEST_CODE_CHALLENGE,
  TEST_CODE_VERIFIER
} from './helpers/pkceFixtures';

function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

class MockEncryptor implements EncryptorInterface<string, string> {
  public encrypt(value: string): string {
    return `enc:${value}`;
  }

  public decrypt(value: string): string {
    return value.replace(/^enc:/, '');
  }
}

class MockOAuthTokenRepo implements Partial<OAuthWrapperRepositoryInterface> {
  public client = createMockOAuthClient({ confidential: true });
  public authCode: OAuthAuthorizationCodeRow | null = null;
  public refreshTokens = new Map<string, OAuthRefreshTokenRow>();

  public verifyClientCredentials = vi.fn(async () => this.client);

  public consumeCode = vi.fn(async () => this.authCode);

  public getUserCredentials = vi.fn(async () => ({
    user_id: '42',
    provider_session_token: 'provider-session',
    provider_refresh_token: null,
    updated_at: '2026-01-01T00:00:00.000Z'
  }));

  public createRefreshToken = vi.fn(async (input) => {
    this.refreshTokens.set(input.refresh_token, {
      id: '1',
      refresh_token: input.refresh_token,
      client_id: input.client_id,
      user_id: input.user_id,
      expires_at: input.expires_at,
      revoked: false,
      created_at: '2026-01-01T00:00:00.000Z'
    });
  });

  public findByTokenHash = vi.fn(async (tokenHash: string) => {
    return this.refreshTokens.get(tokenHash) ?? null;
  });

  public revokeByTokenHash = vi.fn(async (tokenHash: string) => {
    const token = this.refreshTokens.get(tokenHash);
    if (token) {
      this.refreshTokens.set(tokenHash, { ...token, revoked: true });
    }
  });

  public upsertUserCredentials = vi.fn(async () => undefined);
}

describe('OAuthTokenService', () => {
  let repo: MockOAuthTokenRepo;
  let exchangeProviderAccessToken: ExchangeProviderAccessToken;
  let service: OAuthTokenService;

  beforeEach(() => {
    repo = new MockOAuthTokenRepo();
    exchangeProviderAccessToken = vi.fn(async () => ({
      access_token: 'provider-access-token',
      expires_in: 3600,
      refresh_token: 'provider-refresh-token'
    }));
    service = new OAuthTokenService(
      new MockEncryptor(),
      exchangeProviderAccessToken,
      repo as unknown as OAuthWrapperRepositoryInterface
    );
    repo.authCode = {
      code: 'auth-code',
      client_id: 'test-client',
      user_id: '42',
      redirect_uri: 'https://app.example/callback',
      scope: 'openid profile',
      code_challenge: TEST_CODE_CHALLENGE,
      code_challenge_method: 'S256',
      expires_at: new Date(Date.now() + 60_000).toISOString(),
      used: false,
      created_at: '2026-01-01T00:00:00.000Z'
    };
  });

  describe('exchangeToken authorization_code', () => {
    it('exchanges a valid authorization code with PKCE', async () => {
      const response = await service.exchangeToken({
        grant_type: 'authorization_code',
        code: 'auth-code',
        redirect_uri: 'https://app.example/callback',
        client_id: 'test-client',
        code_verifier: TEST_CODE_VERIFIER
      });

      expect(response.access_token).toBe('provider-access-token');
      expect(response.token_type).toBe('Bearer');
      expect(response.refresh_token).toBeTruthy();
      expect(repo.consumeCode).toHaveBeenCalledWith('auth-code');
    });

    it('requires client_secret when PKCE is not used', async () => {
      repo.authCode = {
        ...repo.authCode!,
        code_challenge: null,
        code_challenge_method: null
      };

      await expect(
        service.exchangeToken({
          grant_type: 'authorization_code',
          code: 'auth-code',
          redirect_uri: 'https://app.example/callback',
          client_id: 'test-client'
        })
      ).rejects.toMatchObject({
        id: OAuthRfcCodes.INVALID_CLIENT,
        status: 401
      });
    });

    it('rejects invalid authorization codes', async () => {
      repo.consumeCode.mockResolvedValueOnce(null);

      await expect(
        service.exchangeToken({
          grant_type: 'authorization_code',
          code: 'missing',
          redirect_uri: 'https://app.example/callback',
          client_id: 'test-client',
          code_verifier: TEST_CODE_VERIFIER
        })
      ).rejects.toBeInstanceOf(OAuthWrapperError);
    });

    it('rejects redirect_uri mismatch', async () => {
      await expect(
        service.exchangeToken({
          grant_type: 'authorization_code',
          code: 'auth-code',
          redirect_uri: 'https://evil.example/callback',
          client_id: 'test-client',
          code_verifier: TEST_CODE_VERIFIER
        })
      ).rejects.toMatchObject({
        id: OAuthRfcCodes.INVALID_GRANT
      });
    });
  });

  describe('exchangeToken refresh_token', () => {
    it('rotates refresh tokens and returns new provider access token', async () => {
      const plainRefresh = 'refresh-token-plain';
      const tokenHash = hashOpaqueToken(plainRefresh);
      repo.refreshTokens.set(tokenHash, {
        id: '1',
        refresh_token: tokenHash,
        client_id: 'test-client',
        user_id: '42',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        revoked: false,
        created_at: '2026-01-01T00:00:00.000Z'
      });

      const response = await service.exchangeToken({
        grant_type: 'refresh_token',
        refresh_token: plainRefresh,
        client_id: 'test-client',
        client_secret: 'secret'
      });

      expect(response.access_token).toBe('provider-access-token');
      expect(response.refresh_token).toBeTruthy();
      expect(repo.revokeByTokenHash).toHaveBeenCalledWith(tokenHash);
    });
  });

  describe('revokeToken', () => {
    it('revokes a matching refresh token', async () => {
      const plainRefresh = 'refresh-token-plain';
      const tokenHash = hashOpaqueToken(plainRefresh);
      repo.refreshTokens.set(tokenHash, {
        id: '1',
        refresh_token: tokenHash,
        client_id: 'test-client',
        user_id: '42',
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        revoked: false,
        created_at: '2026-01-01T00:00:00.000Z'
      });

      await service.revokeToken({
        token: plainRefresh,
        client_id: 'test-client',
        client_secret: 'secret'
      });

      expect(repo.revokeByTokenHash).toHaveBeenCalledWith(tokenHash);
    });

    it('ignores unknown tokens idempotently', async () => {
      await expect(
        service.revokeToken({
          token: 'unknown-token',
          client_id: 'test-client',
          client_secret: 'secret'
        })
      ).resolves.toBeUndefined();
    });
  });
});
