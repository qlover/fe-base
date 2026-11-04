import { ExecutorError } from '@qlover/fe-corekit/executor';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  API_PASSWORD_RESET_DISABLED,
  API_PASSWORD_RESET_RATE_LIMITED,
  API_PASSWORD_RESET_TOKEN_INVALID
} from '@config/i18n-identifier/api';
import type { PasswordChangedNotifyServiceInterface } from '@server/interfaces/PasswordChangedNotifyServiceInterface';
import type { SessionRevokeServiceInterface } from '@server/interfaces/SessionRevokeServiceInterface';
import type { FeMailLogsRepository } from '@server/repositorys/FeMailLogsRepository';
import { hashPasswordResetToken } from '@server/repositorys/FePasswordResetTokensRepository';
import type { FePasswordResetTokensRepository } from '@server/repositorys/FePasswordResetTokensRepository';
import type { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import type { MailServiceInterface } from '@server/services/mail/MailServiceInterface';
import type { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';
import { PasswordResetService } from '@server/services/PasswordResetService';
import type { SiteSettingsService } from '@server/services/SiteSettingsService';
import type { LoggerInterface } from '@qlover/logger';
import type { SupabaseRepo } from '@qlover/next-kit/server';

const META = {
  locale: 'zh' as const,
  clientIp: '1.2.3.4',
  userAgent: 'vitest'
};

/** 基于 Map 的内存 KV，仅实现 PasswordResetService 用到的两个方法。 */
function createMemoryKv(): MemoryKvCacheService {
  const store = new Map<string, unknown>();
  return {
    getItem: vi.fn(async (key: string) => store.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: unknown) => {
      store.set(key, value);
    })
  } as unknown as MemoryKvCacheService;
}

function createFixture(options: { enabled?: boolean } = {}) {
  const adminApi = {
    getUserById: vi.fn(async () => ({
      error: null,
      data: { user: { email: 'Alice@Example.com' } }
    })),
    updateUserById: vi.fn(async () => ({ error: null, data: {} }))
  };
  const supabaseBridge = {
    getAdminSupabase: () => ({ auth: { admin: adminApi } }),
    throwIfError: vi.fn()
  } as unknown as SupabaseRepo<unknown>;

  const siteSettings = {
    getPublicConfig: vi.fn(async () => ({
      auth: { passwordResetEnabled: options.enabled ?? true }
    }))
  } as unknown as SiteSettingsService;

  const mailService = {
    sendSafely: vi.fn(async () => undefined),
    getSiteName: vi.fn(async () => 'Test Site')
  } as unknown as MailServiceInterface;

  const feUsersRepository = {
    findByEmail: vi.fn(async () => ({ id: 'user-1', status: 'active' }))
  } as unknown as FeUsersRepository;

  const tokensRepository = {
    insert: vi.fn(async () => undefined),
    findByHash: vi.fn(async () => null),
    markUsed: vi.fn(async () => true),
    invalidateUnusedForUser: vi.fn(async () => undefined)
  } as unknown as FePasswordResetTokensRepository;

  const mailLogsRepository = {
    countRecentByEmail: vi.fn(async () => 0)
  } as unknown as FeMailLogsRepository;

  const sessionRevoke: SessionRevokeServiceInterface = {
    revokeAll: vi.fn(async () => undefined)
  };
  const passwordChangedNotify: PasswordChangedNotifyServiceInterface = {
    notify: vi.fn(async () => undefined)
  };

  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  } as unknown as LoggerInterface;

  const service = new PasswordResetService(
    logger,
    { siteUrl: 'https://example.com' } as never,
    supabaseBridge,
    { encrypt: (value: string) => value, decrypt: (value: string) => value },
    siteSettings,
    mailService,
    feUsersRepository,
    tokensRepository,
    mailLogsRepository,
    sessionRevoke,
    passwordChangedNotify,
    createMemoryKv()
  );

  return {
    service,
    adminApi,
    mailService,
    feUsersRepository,
    tokensRepository,
    mailLogsRepository,
    sessionRevoke,
    passwordChangedNotify
  };
}

describe('PasswordResetService.requestReset', () => {
  let fixture: ReturnType<typeof createFixture>;

  beforeEach(() => {
    fixture = createFixture();
  });

  it('rejects when the feature is disabled', async () => {
    fixture = createFixture({ enabled: false });

    const error = await fixture.service
      .requestReset({ email: 'alice@example.com', ...META })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_PASSWORD_RESET_DISABLED);
  });

  it('stores only the token hash and mails the raw token link', async () => {
    await fixture.service.requestReset({
      email: 'alice@example.com',
      ...META
    });

    expect(fixture.tokensRepository.insert).toHaveBeenCalledTimes(1);
    const inserted = vi.mocked(fixture.tokensRepository.insert).mock
      .calls[0][0];
    expect(inserted.userId).toBe('user-1');
    expect(inserted.email).toBe('alice@example.com');

    const sent = vi.mocked(fixture.mailService.sendSafely).mock.calls[0][0];
    expect(sent.template).toBe('password_reset');
    const link =
      /https:\/\/example\.com\/zh\/auth\/reset-password\?token=([\w-]+)/.exec(
        sent.mail.text
      );
    expect(link).not.toBeNull();
    const rawToken = link![1];
    expect(inserted.tokenHash).toBe(hashPasswordResetToken(rawToken));
    expect(inserted.tokenHash).not.toBe(rawToken);
  });

  it('silently ignores unknown or inactive accounts', async () => {
    vi.mocked(fixture.feUsersRepository.findByEmail).mockResolvedValueOnce(
      null
    );

    await expect(
      fixture.service.requestReset({ email: 'nobody@example.com', ...META })
    ).resolves.toBeUndefined();

    expect(fixture.tokensRepository.insert).not.toHaveBeenCalled();
    expect(fixture.mailService.sendSafely).not.toHaveBeenCalled();
  });

  it('silently stops after 5 reset mails per email within an hour', async () => {
    vi.mocked(fixture.mailLogsRepository.countRecentByEmail).mockResolvedValue(
      5
    );

    await expect(
      fixture.service.requestReset({ email: 'alice@example.com', ...META })
    ).resolves.toBeUndefined();

    expect(fixture.tokensRepository.insert).not.toHaveBeenCalled();
    expect(fixture.mailService.sendSafely).not.toHaveBeenCalled();
  });

  it('enforces a per-IP cooldown between requests', async () => {
    await fixture.service.requestReset({ email: 'alice@example.com', ...META });

    const error = await fixture.service
      .requestReset({ email: 'alice@example.com', ...META })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_PASSWORD_RESET_RATE_LIMITED);
  });
});

describe('PasswordResetService.resetPassword', () => {
  const RAW_TOKEN = 'raw-token';
  const usableRow = {
    id: 'token-1',
    user_id: 'user-1',
    email: 'alice@example.com',
    token_hash: hashPasswordResetToken(RAW_TOKEN),
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
    used_at: null
  };
  let fixture: ReturnType<typeof createFixture>;

  beforeEach(() => {
    fixture = createFixture();
  });

  it('updates the password, revokes every session and notifies', async () => {
    vi.mocked(fixture.tokensRepository.findByHash).mockResolvedValue(
      usableRow as never
    );

    await fixture.service.resetPassword({
      token: RAW_TOKEN,
      newPassword: 'new-secret-1',
      ...META
    });

    expect(fixture.tokensRepository.findByHash).toHaveBeenCalledWith(
      hashPasswordResetToken(RAW_TOKEN)
    );
    expect(fixture.adminApi.updateUserById).toHaveBeenCalledWith('user-1', {
      password: 'new-secret-1'
    });
    expect(fixture.sessionRevoke.revokeAll).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'alice@example.com'
    });
    expect(fixture.passwordChangedNotify.notify).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['unknown token', null],
    ['used token', { ...usableRow, used_at: new Date().toISOString() }],
    [
      'expired token',
      { ...usableRow, expires_at: new Date(Date.now() - 1000).toISOString() }
    ]
  ])('rejects %s without touching the password', async (_name, row) => {
    vi.mocked(fixture.tokensRepository.findByHash).mockResolvedValue(
      row as never
    );

    const error = await fixture.service
      .resetPassword({ token: RAW_TOKEN, newPassword: 'new-secret-1', ...META })
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_PASSWORD_RESET_TOKEN_INVALID);
    expect(fixture.adminApi.updateUserById).not.toHaveBeenCalled();
    expect(fixture.sessionRevoke.revokeAll).not.toHaveBeenCalled();
  });

  it('rejects a concurrent second consumer of the same token', async () => {
    vi.mocked(fixture.tokensRepository.findByHash).mockResolvedValue(
      usableRow as never
    );
    vi.mocked(fixture.tokensRepository.markUsed).mockResolvedValue(false);

    const error = await fixture.service
      .resetPassword({ token: RAW_TOKEN, newPassword: 'new-secret-1', ...META })
      .catch((e: unknown) => e);

    expect((error as ExecutorError).id).toBe(API_PASSWORD_RESET_TOKEN_INVALID);
    expect(fixture.adminApi.updateUserById).not.toHaveBeenCalled();
  });
});
