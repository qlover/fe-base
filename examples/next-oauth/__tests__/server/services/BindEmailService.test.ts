import { ExecutorError } from '@qlover/fe-corekit/executor';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { oauthUpstreamProviders } from '@config/common';
import {
  API_BIND_EMAIL_ALREADY_BOUND,
  API_BIND_EMAIL_PHONE_CONFLICT,
  API_BIND_EMAIL_UNSUPPORTED,
  API_OTP_CODE_INVALID
} from '@config/i18n-identifier/api';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import type { UserServiceInterface } from '@server/interfaces/UserServiceInterface';
import type { FeUserRow } from '@server/repositorys/FeUsersRepository';
import type { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import type { OAuthWrapperRepository } from '@server/repositorys/OAuthWrapperRepository';
import type { SupabaseSessionMintService } from '@server/services/SupabaseSessionMintService';
import type { UserSchema } from '@qlover/next-kit/common';
import type { SupabaseRepo } from '@qlover/next-kit/server';
import type { LoggerInterface } from '@qlover/logger';

const verifyOtp = vi.fn();
const updateUserById = vi.fn();
const deleteUser = vi.fn();
const signInWithOtp = vi.fn();

vi.mock('@shared/supabase/server', () => ({
  createEphemeralAuthClient: () => ({
    auth: {
      signInWithOtp,
      verifyOtp
    }
  })
}));

const { BindEmailService } = await import('@server/services/BindEmailService');

const PHONE_USER: FeUserRow = {
  id: 'phone-user',
  email: '13800138000@phone.next-oauth.local',
  display_name: '用户****8000',
  phone: '+8613800138000',
  role_id: 'role-user',
  status: 'active',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z'
};

const EMAIL_USER: FeUserRow = {
  id: 'email-user',
  email: 'a@example.com',
  display_name: 'Alice',
  phone: null,
  role_id: 'role-user',
  status: 'active',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z'
};

const SESSION_USER = {
  id: 'phone-user',
  role: 1,
  email: 'a@example.com',
  name: '用户****8000',
  credential_token: 'tok',
  created_at: '2026-01-01T00:00:00.000Z'
} as UserSchema;

function createService(options?: {
  upstream?: string;
  findByEmail?: FeUserRow | null;
  current?: FeUserRow;
}): {
  service: InstanceType<typeof BindEmailService>;
  feUsers: {
    findById: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    updateEmailAndPhone: ReturnType<typeof vi.fn>;
    deleteById: ReturnType<typeof vi.fn>;
    getSystemRoleKey: ReturnType<typeof vi.fn>;
    setSystemRole: ReturnType<typeof vi.fn>;
  };
  oauthRepo: {
    reassignClientOwner: ReturnType<typeof vi.fn>;
    reassignRefreshTokensUserId: ReturnType<typeof vi.fn>;
    deleteUserCredentials: ReturnType<typeof vi.fn>;
    reassignConsentGrantsUserId: ReturnType<typeof vi.fn>;
    reassignUserLinks: ReturnType<typeof vi.fn>;
  };
} {
  const feUsers = {
    findById: vi.fn().mockResolvedValue(options?.current ?? PHONE_USER),
    findByEmail: vi
      .fn()
      .mockResolvedValue(
        options?.findByEmail === undefined ? null : options.findByEmail
      ),
    updateEmailAndPhone: vi.fn().mockImplementation(async (params) => ({
      ...(options?.current ?? PHONE_USER),
      ...params,
      email: params.email ?? (options?.current ?? PHONE_USER).email
    })),
    deleteById: vi.fn().mockResolvedValue(undefined),
    getSystemRoleKey: vi.fn().mockResolvedValue('user'),
    setSystemRole: vi.fn().mockResolvedValue(EMAIL_USER)
  };

  const oauthRepo = {
    reassignClientOwner: vi.fn().mockResolvedValue(undefined),
    reassignRefreshTokensUserId: vi.fn().mockResolvedValue(undefined),
    deleteUserCredentials: vi.fn().mockResolvedValue(undefined),
    reassignConsentGrantsUserId: vi.fn().mockResolvedValue(undefined),
    reassignUserLinks: vi.fn().mockResolvedValue(undefined)
  };

  const supabaseBridge = {
    getAdminSupabase: () => ({
      auth: {
        admin: {
          updateUserById,
          deleteUser
        }
      }
    }),
    throwIfError: (result: { error?: unknown }) => {
      if (result?.error) {
        throw result.error;
      }
    }
  };

  const oauthProvider: OAuthWrapperProviderInterface = {
    loginWithSession: vi.fn().mockResolvedValue(undefined)
  } as unknown as OAuthWrapperProviderInterface;

  const sessionMint = {
    mintSessionForAuthUser: vi.fn().mockResolvedValue({
      access_token: 'a',
      refresh_token: 'r',
      user: { id: 'phone-user' }
    })
  };

  const userService = {
    getSessionUser: vi.fn().mockResolvedValue(SESSION_USER)
  };

  const service = new BindEmailService(
    { info: vi.fn(), warn: vi.fn(), error: vi.fn() } as unknown as LoggerInterface,
    {
      oauthUpstreamProvider:
        options?.upstream ?? oauthUpstreamProviders.supabase
    } as SeedServerConfigInterface,
    supabaseBridge as unknown as SupabaseRepo<unknown>,
    feUsers as unknown as FeUsersRepository,
    oauthRepo as unknown as OAuthWrapperRepository,
    oauthProvider,
    sessionMint as unknown as SupabaseSessionMintService,
    userService as unknown as UserServiceInterface
  );

  return { service, feUsers, oauthRepo };
}

describe('BindEmailService.send', () => {
  beforeEach(() => {
    signInWithOtp.mockReset().mockResolvedValue({ data: {}, error: null });
    verifyOtp.mockReset();
    updateUserById.mockReset().mockResolvedValue({ data: {}, error: null });
    deleteUser.mockReset().mockResolvedValue({ data: {}, error: null });
  });

  it('rejects when upstream is not Supabase', async () => {
    const { service } = createService({
      upstream: oauthUpstreamProviders.brainUser
    });
    const error = await service
      .send({ currentUserId: 'phone-user', email: 'a@example.com' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_BIND_EMAIL_UNSUPPORTED);
  });

  it('rejects when the account already has another business email', async () => {
    const { service } = createService({
      current: { ...PHONE_USER, email: 'old@example.com' }
    });
    const error = await service
      .send({ currentUserId: 'phone-user', email: 'new@example.com' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_BIND_EMAIL_ALREADY_BOUND);
    expect(signInWithOtp).not.toHaveBeenCalled();
  });

  it('sends OTP when the account has no business email', async () => {
    const { service } = createService();
    const result = await service.send({
      currentUserId: 'phone-user',
      email: 'a@example.com'
    });
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'a@example.com',
      options: { shouldCreateUser: true }
    });
    expect(result.expired).toBeGreaterThan(0);
  });
});

describe('BindEmailService.verify', () => {
  beforeEach(() => {
    signInWithOtp.mockReset();
    verifyOtp.mockReset().mockResolvedValue({
      data: { user: { id: 'phone-user' } },
      error: null
    });
    updateUserById.mockReset().mockResolvedValue({ data: {}, error: null });
    deleteUser.mockReset().mockResolvedValue({ data: {}, error: null });
  });

  it('binds email to the current phone user when the address is free', async () => {
    const { service, feUsers } = createService({ findByEmail: null });
    const result = await service.verify({
      currentUserId: 'phone-user',
      email: 'a@example.com',
      token: '123456'
    });

    expect(result.merged).toBe(false);
    expect(feUsers.updateEmailAndPhone).toHaveBeenCalledWith({
      userId: 'phone-user',
      email: 'a@example.com'
    });
    expect(result.user.email).toBe('a@example.com');
  });

  it('rejects merge when the email account already has a different phone', async () => {
    verifyOtp.mockResolvedValue({
      data: { user: { id: 'email-user' } },
      error: null
    });
    const { service, oauthRepo } = createService({
      findByEmail: {
        ...EMAIL_USER,
        phone: '+8613900139000'
      }
    });

    const error = await service
      .verify({
        currentUserId: 'phone-user',
        email: 'a@example.com',
        token: '123456'
      })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_BIND_EMAIL_PHONE_CONFLICT);
    expect(oauthRepo.reassignClientOwner).not.toHaveBeenCalled();
  });

  it('merges into the existing email account when OTP belongs to that user', async () => {
    verifyOtp.mockResolvedValue({
      data: { user: { id: 'email-user' } },
      error: null
    });
    const { service, feUsers, oauthRepo } = createService({
      findByEmail: EMAIL_USER
    });

    const result = await service.verify({
      currentUserId: 'phone-user',
      email: 'a@example.com',
      token: '123456'
    });

    expect(result.merged).toBe(true);
    expect(oauthRepo.reassignClientOwner).toHaveBeenCalledWith(
      'phone-user',
      'email-user'
    );
    expect(feUsers.deleteById).toHaveBeenCalledWith('phone-user');
    expect(deleteUser).toHaveBeenCalledWith('phone-user');
  });

  it('rejects invalid OTP', async () => {
    verifyOtp.mockResolvedValue({
      data: { user: null },
      error: { message: 'bad' }
    });
    const { service } = createService();
    const error = await service
      .verify({
        currentUserId: 'phone-user',
        email: 'a@example.com',
        token: '000000'
      })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_OTP_CODE_INVALID);
  });
});
