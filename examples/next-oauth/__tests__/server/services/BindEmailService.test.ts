import { ExecutorError } from '@qlover/fe-corekit/executor';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { oauthUpstreamProviders } from '@config/common';
import {
  API_BIND_EMAIL_ALREADY_BOUND,
  API_BIND_EMAIL_NO_PHONE,
  API_BIND_EMAIL_TAKEN,
  API_BIND_EMAIL_UNSUPPORTED,
  API_OTP_CODE_INVALID
} from '@config/i18n-identifier/api';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import type { UserServiceInterface } from '@server/interfaces/UserServiceInterface';
import type { FeUserRow } from '@server/repositorys/FeUsersRepository';
import type { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import type { PhoneOtpService } from '@server/services/PhoneOtpService';
import type { SupabaseSessionMintService } from '@server/services/SupabaseSessionMintService';
import type { LoggerInterface } from '@qlover/logger';
import type { UserSchema } from '@qlover/next-kit/common';
import type { SupabaseRepo } from '@qlover/next-kit/server';

const updateUserById = vi.fn();
const deleteUser = vi.fn();
const listUsers = vi.fn();
const maybeSingle = vi.fn();
const sendPhoneOtp = vi.fn();
const consumePhoneOtp = vi.fn();

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
  profiles?: Record<string, FeUserRow | null>;
}): {
  service: InstanceType<typeof BindEmailService>;
  feUsers: {
    findById: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    updateEmailAndPhone: ReturnType<typeof vi.fn>;
  };
} {
  const current = options?.current ?? PHONE_USER;
  const feUsers = {
    findById: vi.fn().mockImplementation(async (id: string) => {
      if (options?.profiles && id in options.profiles) {
        return options.profiles[id];
      }
      if (id === current.id) {
        return current;
      }
      return null;
    }),
    findByEmail: vi
      .fn()
      .mockResolvedValue(
        options?.findByEmail === undefined ? null : options.findByEmail
      ),
    updateEmailAndPhone: vi.fn().mockImplementation(async (params) => ({
      ...current,
      ...params,
      email: params.email ?? current.email
    }))
  };

  const supabaseBridge = {
    getAdminSupabase: () => ({
      auth: {
        admin: {
          updateUserById,
          deleteUser,
          listUsers
        }
      },
      schema: () => ({
        from: () => ({
          select: () => ({
            eq: () => ({
              maybeSingle
            })
          })
        })
      })
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

  const phoneOtp = {
    send: sendPhoneOtp,
    consume: consumePhoneOtp
  };

  const service = new BindEmailService(
    {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    } as unknown as LoggerInterface,
    {
      oauthUpstreamProvider:
        options?.upstream ?? oauthUpstreamProviders.supabase
    } as SeedServerConfigInterface,
    supabaseBridge as unknown as SupabaseRepo<unknown>,
    feUsers as unknown as FeUsersRepository,
    oauthProvider,
    sessionMint as unknown as SupabaseSessionMintService,
    userService as unknown as UserServiceInterface,
    phoneOtp as unknown as PhoneOtpService
  );

  return { service, feUsers };
}

describe('BindEmailService.send', () => {
  beforeEach(() => {
    sendPhoneOtp.mockReset().mockResolvedValue({ expired: 1 });
    consumePhoneOtp.mockReset().mockResolvedValue(undefined);
    updateUserById.mockReset().mockResolvedValue({ data: {}, error: null });
    deleteUser.mockReset().mockResolvedValue({ data: {}, error: null });
    maybeSingle.mockReset().mockResolvedValue({ data: null, error: null });
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
    expect(sendPhoneOtp).not.toHaveBeenCalled();
  });

  it('rejects when the account has no phone', async () => {
    const { service } = createService({
      current: { ...PHONE_USER, phone: null }
    });
    const error = await service
      .send({ currentUserId: 'phone-user', email: 'a@example.com' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_BIND_EMAIL_NO_PHONE);
  });

  it('rejects when the email belongs to another account', async () => {
    const { service } = createService({ findByEmail: EMAIL_USER });
    const error = await service
      .send({ currentUserId: 'phone-user', email: 'a@example.com' })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_BIND_EMAIL_TAKEN);
    expect(sendPhoneOtp).not.toHaveBeenCalled();
  });

  it('sends a phone OTP for the current account', async () => {
    const { service } = createService();
    const result = await service.send({
      currentUserId: 'phone-user',
      email: 'a@example.com',
      clientIp: '127.0.0.1'
    });
    expect(sendPhoneOtp).toHaveBeenCalledWith({
      phone: '+8613800138000',
      clientIp: '127.0.0.1'
    });
    expect(result.expired).toBe(1);
  });
});

describe('BindEmailService.verify', () => {
  beforeEach(() => {
    sendPhoneOtp.mockReset();
    consumePhoneOtp.mockReset().mockResolvedValue(undefined);
    updateUserById.mockReset().mockResolvedValue({ data: {}, error: null });
    deleteUser.mockReset().mockResolvedValue({ data: {}, error: null });
    listUsers
      .mockReset()
      .mockResolvedValue({ data: { users: [] }, error: null });
    maybeSingle.mockReset().mockResolvedValue({ data: null, error: null });
  });

  it('binds the email after the phone code is consumed', async () => {
    const { service, feUsers } = createService({ findByEmail: null });
    const result = await service.verify({
      currentUserId: 'phone-user',
      email: 'a@example.com',
      token: '123456'
    });

    expect(consumePhoneOtp).toHaveBeenCalledWith({
      phone: '+8613800138000',
      token: '123456'
    });
    expect(result.merged).toBe(false);
    expect(feUsers.updateEmailAndPhone).toHaveBeenCalledWith({
      userId: 'phone-user',
      email: 'a@example.com'
    });
    expect(updateUserById).toHaveBeenCalledWith('phone-user', {
      email: 'a@example.com',
      email_confirm: true
    });
    expect(result.user.email).toBe('a@example.com');
  });

  it('rejects when another account already uses the email', async () => {
    const { service, feUsers } = createService({ findByEmail: EMAIL_USER });
    const error = await service
      .verify({
        currentUserId: 'phone-user',
        email: 'a@example.com',
        token: '123456'
      })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_BIND_EMAIL_TAKEN);
    expect(consumePhoneOtp).not.toHaveBeenCalled();
    expect(feUsers.updateEmailAndPhone).not.toHaveBeenCalled();
  });

  it('releases a leftover auth user that has no profile', async () => {
    maybeSingle.mockResolvedValue({ data: { id: 'leftover-id' }, error: null });
    const { service } = createService({
      profiles: { 'leftover-id': null }
    });

    await service.verify({
      currentUserId: 'phone-user',
      email: 'a@example.com',
      token: '123456'
    });

    expect(updateUserById).toHaveBeenCalledWith(
      'leftover-id',
      expect.objectContaining({ email_confirm: true })
    );
    expect(deleteUser).toHaveBeenCalledWith('leftover-id');
    expect(updateUserById).toHaveBeenCalledWith('phone-user', {
      email: 'a@example.com',
      email_confirm: true
    });
  });

  it('falls back to listUsers when auth schema lookup fails', async () => {
    maybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'Invalid schema: auth' }
    });
    listUsers.mockResolvedValue({
      data: {
        users: [{ id: 'leftover-id', email: 'a@example.com' }]
      },
      error: null
    });
    const { service } = createService({
      profiles: { 'leftover-id': null }
    });

    await service.verify({
      currentUserId: 'phone-user',
      email: 'a@example.com',
      token: '123456'
    });

    expect(listUsers).toHaveBeenCalled();
    expect(updateUserById).toHaveBeenCalledWith(
      'leftover-id',
      expect.objectContaining({ email_confirm: true })
    );
    expect(deleteUser).toHaveBeenCalledWith('leftover-id');
  });

  it('maps duplicate-email auth error to bind_email_taken', async () => {
    updateUserById.mockResolvedValue({
      data: null,
      error: {
        message: 'A user with this email address has already been registered'
      }
    });
    const { service } = createService({ findByEmail: null });
    const error = await service
      .verify({
        currentUserId: 'phone-user',
        email: 'a@example.com',
        token: '123456'
      })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_BIND_EMAIL_TAKEN);
  });

  it('rejects invalid OTP', async () => {
    consumePhoneOtp.mockRejectedValue(new ExecutorError(API_OTP_CODE_INVALID));
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
