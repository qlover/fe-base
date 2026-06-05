import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutorError } from '@qlover/fe-corekit';
import type { EncryptorInterface } from '@qlover/fe-corekit';
import { OAuthRfcCodes } from '@qlover/oauth-wrapper/core';
import type {
  OAuthSessionInterface,
  OAuthSessionPayload
} from '../src/core/interfaces/OAuthSessionInterface';
import type {
  OAuthUserCredentials,
  OAuthUserProfile
} from '../src/server/services/OAuthAbstractProvider';
import type { OAuthWrapperRepositoryInterface } from '../src/core/interfaces/OAuthWrapperRepositoryInterface';
import { OAuthWrapperService } from '../src/server/services/OAuthWrapperService';
import { OAuthWrapperError } from '../src/server/utils/OAuthWrapperError';
import { createMockOAuthClient } from './helpers/mockOAuthClient';
import { TEST_CODE_CHALLENGE } from './helpers/pkceFixtures';
import type { LoginParams } from '@qlover/corekit-bridge/core';

class MockEncryptor implements EncryptorInterface<string, string> {
  public encrypt(value: string): string {
    return `enc:${value}`;
  }

  public decrypt(value: string): string {
    return value.replace(/^enc:/, '');
  }
}

class MockOAuthRepo implements Partial<OAuthWrapperRepositoryInterface> {
  public client = createMockOAuthClient();

  public findClientById = vi.fn(async () => this.client);

  public create = vi.fn(async () => undefined);
}

class MockOAuthSession implements OAuthSessionInterface<OAuthSessionPayload> {
  public hasSession(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  public setSession(_payload: OAuthSessionPayload): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public session: OAuthSessionPayload | null = {
    userId: '42',
    email: '',
    name: '',
    providerSessionToken: ''
  };

  public getSession = vi.fn(async () => this.session);

  public clearSession = vi.fn(async () => {
    this.session = null;
  });
}

class TestOAuthWrapperService extends OAuthWrapperService<OAuthSessionPayload> {
  public providerLogin = vi.fn<
    [LoginParams],
    Promise<OAuthUserCredentials>
  >();
  public providerExchangeAccessToken = vi.fn();
  public providerGetUserInfo = vi.fn();
  public providerGetUserInfoByAccessToken = vi.fn(async () => ({
    id: 42,
    email: 'user@example.com',
    name: 'Test User'
  })) as ReturnType<
    typeof vi.fn<[string], Promise<OAuthUserProfile>>
  >;

  constructor(
    session: OAuthSessionInterface<OAuthSessionPayload>,
    repo: OAuthWrapperRepositoryInterface
  ) {
    super(session, new MockEncryptor(), repo);
  }
}

describe('OAuthWrapperService', () => {
  let repo: MockOAuthRepo;
  let session: MockOAuthSession;
  let service: TestOAuthWrapperService;

  beforeEach(() => {
    repo = new MockOAuthRepo();
    session = new MockOAuthSession();
    service = new TestOAuthWrapperService(
      session,
      repo as unknown as OAuthWrapperRepositoryInterface
    );
  });

  describe('resolveAuthorizePage', () => {
    it('returns authorize page data for valid public client requests', async () => {
      const result = await service.resolveAuthorizePage({
        client_id: 'test-client',
        redirect_uri: 'https://app.example/callback',
        scope: 'openid profile',
        state: 'state-1',
        code_challenge: TEST_CODE_CHALLENGE,
        code_challenge_method: 'S256'
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data.clientId).toBe('test-client');
        expect(result.data.scopes).toEqual(['openid', 'profile']);
        expect(result.data.confidential).toBe(false);
      }
    });

    it('rejects unknown clients', async () => {
      // @ts-expect-error
      repo.findClientById.mockResolvedValueOnce(null);

      const result = await service.resolveAuthorizePage({
        client_id: 'missing',
        redirect_uri: 'https://app.example/callback',
        code_challenge: TEST_CODE_CHALLENGE,
        code_challenge_method: 'S256'
      });

      expect(result).toEqual({
        ok: false,
        error: {
          errorKey: OAuthRfcCodes.UNAUTHORIZED_CLIENT,
          message: 'Unknown client_id.'
        }
      });
    });

    it('rejects unsupported scopes', async () => {
      const result = await service.resolveAuthorizePage({
        client_id: 'test-client',
        redirect_uri: 'https://app.example/callback',
        scope: 'admin',
        code_challenge: TEST_CODE_CHALLENGE,
        code_challenge_method: 'S256'
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.errorKey).toBe(OAuthRfcCodes.INVALID_SCOPE);
      }
    });
  });

  describe('processConsent', () => {
    const consentBody = {
      action: 'allow' as const,
      client_id: 'test-client',
      redirect_uri: 'https://app.example/callback',
      scope: 'openid profile email',
      state: 'state-1',
      code_challenge: TEST_CODE_CHALLENGE,
      code_challenge_method: 'S256' as const
    };

    it('creates an authorization code on allow', async () => {
      const result = await service.processConsent(consentBody);

      expect(repo.create).toHaveBeenCalledTimes(1);
      expect(result.redirectUrl).toContain('https://app.example/callback?');
      expect(result.redirectUrl).toContain('code=');
      expect(result.redirectUrl).toContain('state=state-1');
    });

    it('returns access_denied redirect on deny', async () => {
      const result = await service.processConsent({
        ...consentBody,
        action: 'deny'
      });

      expect(result.redirectUrl).toContain('error=access_denied');
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('throws when session is missing', async () => {
      session.session = null;

      await expect(service.processConsent(consentBody)).rejects.toBeInstanceOf(
        ExecutorError
      );
    });
  });

  describe('getUserInfo', () => {
    it('maps provider profile to OIDC userinfo claims', async () => {
      const userinfo = await service.getUserInfoWithAccessToken('access-token');

      expect(userinfo).toEqual({
        sub: '42',
        email: 'user@example.com',
        name: 'Test User'
      });
    });

    it('throws OAuthWrapperError when provider lookup fails', async () => {
      service.providerGetUserInfoByAccessToken.mockRejectedValueOnce(
        new Error('invalid token')
      );

      await expect(
        service.getUserInfoWithAccessToken('bad-token')
      ).rejects.toBeInstanceOf(OAuthWrapperError);
    });
  });
});
