import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutorError } from '@qlover/fe-corekit';
import type { EncryptorInterface } from '@qlover/fe-corekit';
import { OAuthRfcCodes } from '@qlover/oauth-wrapper/core';
import type {
  OAuthSessionInterface,
  OAuthSessionPayload,
  WithUserSession
} from '../src/core/interfaces/OAuthSessionInterface';
import type { OAuthWrapperRepositoryInterface } from '../src/core/interfaces/OAuthWrapperRepositoryInterface';
import type { OAuthConsentGrantRow } from '../src/core/schema/OAuthAuthorizeSchema';
import type {
  OAuthIdentityStore,
  OAuthLocalUserDraft
} from '../src/core/localUser';
import { OAuthWrapperService } from '../src/server/services/OAuthWrapperService';
import { OAuthWrapperError } from '../src/server/utils/OAuthWrapperError';
import { createMockOAuthClient } from './helpers/mockOAuthClient';
import { TEST_CODE_CHALLENGE } from './helpers/pkceFixtures';

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

  public upsertUserCredentials = vi.fn(async () => undefined);
}

const PAST = new Date(Date.now() - 60_000).toISOString();

function grantRow(
  overrides: Partial<OAuthConsentGrantRow> = {}
): OAuthConsentGrantRow {
  return {
    user_id: '42',
    client_id: 'test-client',
    device_id: 'device-1',
    scopes: [],
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    ...overrides
  };
}

type TestUser = Record<string, unknown>;
class MockOAuthSession implements OAuthSessionInterface<
  OAuthSessionPayload,
  TestUser
> {
  public hasSession(): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  public setSession(_payload: OAuthSessionPayload): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public session: OAuthSessionPayload | null = {
    userId: '42',
    providerRefreshToken: ''
  };

  public getSession = vi.fn(async () => this.session);

  public clearSession = vi.fn(async () => {
    this.session = null;
  });
}

class TestOAuthWrapperService extends OAuthWrapperService<
  TestUser,
  OAuthSessionPayload
> {
  public identityStore: OAuthIdentityStore | null = null;
  public localUserDraft: OAuthLocalUserDraft | null = null;

  // TODO: test refresh user
  public refreshUser(_params?: {
    refresh_token: string;
  }): Promise<WithUserSession<OAuthSessionPayload, TestUser>> {
    throw new Error('Method not implemented.');
  }
  public providerLogin = vi.fn();
  public providerExchangeAccessToken = vi.fn();
  public providerGetUserInfo = vi.fn();
  public providerGetUserInfoByAccessToken = vi.fn(async () => ({
    id: 42,
    email: 'user@example.com',
    name: 'Test User'
  }));

  constructor(
    session: OAuthSessionInterface<OAuthSessionPayload, TestUser>,
    repo: OAuthWrapperRepositoryInterface
  ) {
    super(session, new MockEncryptor(), repo);
  }

  protected getIdentityStore(): OAuthIdentityStore | null {
    return this.identityStore;
  }

  protected toLocalUserDraft(
    upstream: TestUser
  ): OAuthLocalUserDraft | Promise<OAuthLocalUserDraft> {
    if (this.localUserDraft) {
      return this.localUserDraft;
    }
    return super.toLocalUserDraft(upstream);
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

    it('remembers consent per device, merging active scopes', async () => {
      const findConsentGrant = vi.fn(async () =>
        grantRow({ scopes: ['offline'] })
      );
      const upsertConsentGrant = vi.fn(async () => undefined);
      Object.assign(repo, { findConsentGrant, upsertConsentGrant });

      await service.processConsent(
        { ...consentBody, trust: true },
        { deviceId: 'device-1', userAgent: 'UA' }
      );

      expect(findConsentGrant).toHaveBeenCalledWith(
        '42',
        'test-client',
        'device-1'
      );
      expect(upsertConsentGrant).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: '42',
          client_id: 'test-client',
          device_id: 'device-1',
          scopes: ['offline', 'openid', 'profile', 'email'],
          user_agent: 'UA',
          expires_at: expect.any(String)
        })
      );
      expect(repo.create).toHaveBeenCalledTimes(1);
    });

    it('drops scopes from an expired grant when re-trusting', async () => {
      const upsertConsentGrant = vi.fn(async () => undefined);
      Object.assign(repo, {
        findConsentGrant: vi.fn(async () =>
          grantRow({ scopes: ['offline'], expires_at: PAST })
        ),
        upsertConsentGrant
      });

      await service.processConsent(
        { ...consentBody, trust: true },
        { deviceId: 'device-1' }
      );

      expect(upsertConsentGrant).toHaveBeenCalledWith(
        expect.objectContaining({ scopes: ['openid', 'profile', 'email'] })
      );
    });

    it('does not remember consent without trust or without a device', async () => {
      const upsertConsentGrant = vi.fn(async () => undefined);
      Object.assign(repo, { upsertConsentGrant });

      await service.processConsent(consentBody, { deviceId: 'device-1' });
      await service.processConsent({ ...consentBody, trust: true });

      expect(upsertConsentGrant).not.toHaveBeenCalled();
      expect(repo.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('tryAutoConsent', () => {
    const pageData = {
      clientId: 'test-client',
      clientName: 'Test',
      clientUri: null,
      logoUri: null,
      redirectUri: 'https://app.example/callback',
      scopes: ['openid', 'profile'],
      state: 'state-1',
      responseType: 'code' as const,
      codeChallenge: TEST_CODE_CHALLENGE,
      codeChallengeMethod: 'S256' as const,
      confidential: false
    };

    const device = { deviceId: 'device-1' };

    it('returns null when repository has no grant support', async () => {
      await expect(service.tryAutoConsent(pageData, device)).resolves.toBeNull();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('issues a code and touches the grant when trust covers the request', async () => {
      const findConsentGrant = vi.fn(async () =>
        grantRow({ scopes: ['openid', 'profile', 'email'] })
      );
      const touchConsentGrant = vi.fn(async () => undefined);
      Object.assign(repo, { findConsentGrant, touchConsentGrant });

      const result = await service.tryAutoConsent(pageData, device);

      expect(findConsentGrant).toHaveBeenCalledWith(
        '42',
        'test-client',
        'device-1'
      );
      expect(result?.redirectUrl).toContain('code=');
      expect(result?.redirectUrl).toContain('state=state-1');
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: '42', client_id: 'test-client' })
      );
      expect(touchConsentGrant).toHaveBeenCalledWith(
        '42',
        'test-client',
        'device-1'
      );
    });

    it('returns null without a device id', async () => {
      const findConsentGrant = vi.fn();
      Object.assign(repo, { findConsentGrant });

      await expect(service.tryAutoConsent(pageData)).resolves.toBeNull();
      expect(findConsentGrant).not.toHaveBeenCalled();
    });

    it('returns null when the grant has expired', async () => {
      Object.assign(repo, {
        findConsentGrant: vi.fn(async () =>
          grantRow({ scopes: ['openid', 'profile'], expires_at: PAST })
        )
      });

      await expect(service.tryAutoConsent(pageData, device)).resolves.toBeNull();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('returns null when request asks for scopes not yet trusted', async () => {
      Object.assign(repo, {
        findConsentGrant: vi.fn(async () => grantRow({ scopes: ['openid'] }))
      });

      await expect(service.tryAutoConsent(pageData, device)).resolves.toBeNull();
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('returns null without a session', async () => {
      session.session = null;
      Object.assign(repo, { findConsentGrant: vi.fn() });

      await expect(service.tryAutoConsent(pageData, device)).resolves.toBeNull();
    });
  });

  describe('getUserInfo', () => {
    it('maps provider profile through local identity (passthrough without store)', async () => {
      const userinfo = await service.getUserInfoWithAccessToken('access-token');

      expect(userinfo).toEqual({
        id: '42',
        email: 'user@example.com',
        name: 'Test User',
        external_user_id: '42',
        provider: 'oauth'
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

  describe('login + identity store', () => {
    it('writes session with local UUID when identity store is set', async () => {
      const store: OAuthIdentityStore = {
        findAuthUserIdByExternalId: vi.fn(async () => null),
        findByEmail: vi.fn(async () => null),
        createUser: vi.fn(async () => 'uuid-local'),
        upsertLink: vi.fn(async () => undefined),
        refreshMetadata: vi.fn(async () => undefined)
      };
      service.identityStore = store;
      service.localUserDraft = {
        provider: 'brain',
        externalUserId: '42',
        email: 'user@example.com',
        name: 'Test User'
      };
      service.providerLogin.mockResolvedValue({
        userId: '',
        providerRefreshToken: 'brain-session',
        user: { id: 42 }
      });
      service.providerGetUserInfo.mockResolvedValue({
        id: 42,
        email: 'user@example.com',
        name: 'Test User'
      });
      session.setSession = vi.fn(async (payload) => {
        session.session = payload;
      });

      const result = await service.login({
        email: 'user@example.com',
        password: 'secret'
      });

      expect(result.userId).toBe('uuid-local');
      expect(store.createUser).toHaveBeenCalled();
      expect(session.setSession).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'uuid-local' })
      );
      expect(repo.upsertUserCredentials).toHaveBeenCalledWith(
        'uuid-local',
        expect.objectContaining({
          provider_session_token: 'brain-session'
        })
      );
    });
  });
});
