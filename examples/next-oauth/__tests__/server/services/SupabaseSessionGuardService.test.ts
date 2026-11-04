import { ExecutorError } from '@qlover/fe-corekit/executor';
import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { LoggerInterface } from '@qlover/logger';
import type { SupabaseRepo } from '@qlover/next-kit/server';

const getSession = vi.fn();
const setSession = vi.fn();
const clearSession = vi.fn();

vi.mock('@qlover/next-kit/server', () => ({
  SupabaseRepo: class SupabaseRepo {}
}));
vi.mock('@server/services/OAuthSessionService', () => ({
  OAuthSessionService: class OAuthSessionService {
    public getSession = getSession;
    public setSession = setSession;
    public clearSession = clearSession;
  }
}));

const { SupabaseSessionGuardService } =
  await import('@server/services/SupabaseSessionGuardService');

const USER_ID = 'user-1';

function accessToken(sub: string): string {
  return jwt.sign({ sub }, 'test-secret', { expiresIn: '1h' });
}

function supabaseSession(sub: string, refreshToken: string) {
  return {
    access_token: accessToken(sub),
    refresh_token: refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + 3600
  };
}

describe('SupabaseSessionGuardService.ensureForCurrentUser', () => {
  let auth: {
    getSession: ReturnType<typeof vi.fn>;
    refreshSession: ReturnType<typeof vi.fn>;
  };
  let guard: InstanceType<typeof SupabaseSessionGuardService>;

  beforeEach(() => {
    getSession.mockReset();
    setSession.mockReset().mockResolvedValue(undefined);
    clearSession.mockReset().mockResolvedValue(undefined);
    auth = { getSession: vi.fn(), refreshSession: vi.fn() };
    const repo = {
      getSupabase: vi.fn().mockResolvedValue({ auth })
    } as unknown as SupabaseRepo<unknown>;
    const logger = { warn: vi.fn() } as unknown as LoggerInterface;
    guard = new SupabaseSessionGuardService(
      {} as SeedServerConfigInterface,
      repo,
      logger
    );
  });

  it('does nothing without an app session', async () => {
    getSession.mockResolvedValue(null);

    await guard.ensureForCurrentUser();

    expect(auth.getSession).not.toHaveBeenCalled();
  });

  it('keeps the app session when the cookie session is in sync', async () => {
    const live = supabaseSession(USER_ID, 'rt-1');
    getSession.mockResolvedValue({
      userId: USER_ID,
      providerRefreshToken: 'rt-1',
      user: { id: USER_ID, credential_token: live.access_token }
    });
    auth.getSession.mockResolvedValue({ data: { session: live }, error: null });

    await guard.ensureForCurrentUser();

    expect(auth.refreshSession).not.toHaveBeenCalled();
    expect(setSession).not.toHaveBeenCalled();
  });

  it('syncs a rotated cookie refresh token back to the app session', async () => {
    const live = supabaseSession(USER_ID, 'rt-2');
    getSession.mockResolvedValue({
      userId: USER_ID,
      providerRefreshToken: 'rt-1',
      user: { id: USER_ID, credential_token: 'old' },
      iat: 1,
      exp: 2
    });
    auth.getSession.mockResolvedValue({ data: { session: live }, error: null });

    await guard.ensureForCurrentUser();

    expect(auth.refreshSession).not.toHaveBeenCalled();
    expect(setSession).toHaveBeenCalledWith({
      userId: USER_ID,
      providerRefreshToken: 'rt-2',
      user: { id: USER_ID, credential_token: live.access_token }
    });
  });

  it('recovers with the app refresh token when the cookie session is gone', async () => {
    const recovered = supabaseSession(USER_ID, 'rt-3');
    getSession.mockResolvedValue({
      userId: USER_ID,
      providerRefreshToken: 'rt-1',
      user: { id: USER_ID, credential_token: 'old' }
    });
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    auth.refreshSession.mockResolvedValue({
      data: { session: recovered },
      error: null
    });

    await guard.ensureForCurrentUser();

    expect(auth.refreshSession).toHaveBeenCalledWith({ refresh_token: 'rt-1' });
    expect(setSession).toHaveBeenCalledWith(
      expect.objectContaining({ providerRefreshToken: 'rt-3' })
    );
  });

  it('ignores a cookie session that belongs to another user', async () => {
    getSession.mockResolvedValue({
      userId: USER_ID,
      providerRefreshToken: 'rt-1',
      user: { id: USER_ID, credential_token: 'old' }
    });
    auth.getSession.mockResolvedValue({
      data: { session: supabaseSession('someone-else', 'rt-x') },
      error: null
    });
    auth.refreshSession.mockResolvedValue({
      data: { session: supabaseSession(USER_ID, 'rt-3') },
      error: null
    });

    await guard.ensureForCurrentUser();

    expect(auth.refreshSession).toHaveBeenCalledWith({ refresh_token: 'rt-1' });
  });

  it('clears the app session and rejects when recovery fails', async () => {
    getSession.mockResolvedValue({
      userId: USER_ID,
      providerRefreshToken: 'rt-1',
      user: { id: USER_ID, credential_token: 'old' }
    });
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    auth.refreshSession.mockResolvedValue({
      data: { session: null },
      error: { code: 'refresh_token_already_used' }
    });

    const error = await guard.ensureForCurrentUser().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_NOT_AUTHORIZED);
    expect(clearSession).toHaveBeenCalled();
    expect(setSession).not.toHaveBeenCalled();
  });
});

describe('SupabaseSessionGuardService.resolveLiveRefreshToken', () => {
  let auth: {
    getSession: ReturnType<typeof vi.fn>;
    refreshSession: ReturnType<typeof vi.fn>;
  };
  let guard: InstanceType<typeof SupabaseSessionGuardService>;

  beforeEach(() => {
    getSession.mockReset();
    setSession.mockReset().mockResolvedValue(undefined);
    clearSession.mockReset().mockResolvedValue(undefined);
    auth = { getSession: vi.fn(), refreshSession: vi.fn() };
    const repo = {
      getSupabase: vi.fn().mockResolvedValue({ auth })
    } as unknown as SupabaseRepo<unknown>;
    const logger = { warn: vi.fn() } as unknown as LoggerInterface;
    guard = new SupabaseSessionGuardService(
      {} as SeedServerConfigInterface,
      repo,
      logger
    );
  });

  it('prefers the cookie refresh token when the session matches', async () => {
    const live = supabaseSession(USER_ID, 'rt-live');
    auth.getSession.mockResolvedValue({ data: { session: live }, error: null });

    const token = await guard.resolveLiveRefreshToken(USER_ID, 'rt-fallback');

    expect(token).toBe('rt-live');
  });

  it('falls back when the cookie session is missing', async () => {
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null });

    const token = await guard.resolveLiveRefreshToken(USER_ID, 'rt-fallback');

    expect(token).toBe('rt-fallback');
  });
});
