import { ExecutorError } from '@qlover/fe-corekit/executor';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  API_DISPLAY_NAME_INVALID,
  API_NOT_AUTHORIZED
} from '@config/i18n-identifier/api';
import {
  displayNameUpdateSchema,
  isValidDisplayName
} from '@schemas/DisplayNameSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { UserServiceInterface } from '@server/interfaces/UserServiceInterface';
import type { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import type { UserSchema } from '@qlover/next-kit/common';

const patchSessionUser = vi.fn();

vi.mock('@server/services/OAuthSessionService', () => ({
  OAuthSessionService: class OAuthSessionService {
    public patchSessionUser = patchSessionUser;
  }
}));

const { UserProfileService } =
  await import('@server/services/UserProfileService');

const SESSION_USER = {
  id: 'user-1',
  role: 1,
  email: 'a@example.com',
  name: 'old_name',
  credential_token: 'tok',
  created_at: '2026-01-01T00:00:00.000Z'
} as UserSchema;

describe('UserProfileService.updateDisplayName', () => {
  let repo: { updateDisplayName: ReturnType<typeof vi.fn> };
  let userService: { getSessionUser: ReturnType<typeof vi.fn> };
  let service: InstanceType<typeof UserProfileService>;

  beforeEach(() => {
    patchSessionUser.mockReset().mockResolvedValue(true);
    repo = {
      updateDisplayName: vi.fn().mockResolvedValue({
        id: 'user-1',
        display_name: '新名字'
      })
    };
    userService = {
      getSessionUser: vi.fn().mockResolvedValue(SESSION_USER)
    };
    service = new UserProfileService(
      {
        sessionSecret: 'test-secret',
        oauthSessionKey: 'fe_session',
        isProduction: false
      } as SeedServerConfigInterface,
      userService as unknown as UserServiceInterface,
      repo as unknown as FeUsersRepository
    );
  });

  it('writes fe_users then patches session name and returns updated user', async () => {
    const result = await service.updateDisplayName('user-1', '新名字');

    expect(repo.updateDisplayName).toHaveBeenCalledWith('user-1', '新名字');
    expect(patchSessionUser).toHaveBeenCalledWith({ name: '新名字' });
    expect(result.name).toBe('新名字');
    expect(result.id).toBe('user-1');
  });

  it('rejects invalid display names before touching repo', async () => {
    const error = await service
      .updateDisplayName('user-1', 'bad name')
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_DISPLAY_NAME_INVALID);
    expect(repo.updateDisplayName).not.toHaveBeenCalled();
    expect(patchSessionUser).not.toHaveBeenCalled();
  });

  it('rejects when session user disappears after write', async () => {
    userService.getSessionUser.mockResolvedValue(null);

    const error = await service
      .updateDisplayName('user-1', 'ok_name')
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_NOT_AUTHORIZED);
    expect(repo.updateDisplayName).toHaveBeenCalled();
  });
});

describe('DisplayNameSchema', () => {
  it('accepts PAM-compatible names', () => {
    expect(isValidDisplayName('小橙')).toBe(true);
    expect(isValidDisplayName('user_01')).toBe(true);
    expect(displayNameUpdateSchema.parse({ display_name: 'Alice' })).toEqual({
      display_name: 'Alice'
    });
  });

  it('rejects spaces, punctuation, empty and overlong values', () => {
    expect(isValidDisplayName('')).toBe(false);
    expect(isValidDisplayName('bad name')).toBe(false);
    expect(isValidDisplayName('a@b')).toBe(false);
    expect(isValidDisplayName('a'.repeat(33))).toBe(false);
    expect(
      displayNameUpdateSchema.safeParse({ display_name: 'x y' }).success
    ).toBe(false);
  });
});
