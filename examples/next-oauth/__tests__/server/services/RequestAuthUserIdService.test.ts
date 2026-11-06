import { ExecutorError } from '@qlover/fe-corekit/executor';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import type { OAuthUserService } from '@server/services/OAuthUserService';
import { RequestAuthUserIdService } from '@server/services/RequestAuthUserIdService';

describe('RequestAuthUserIdService', () => {
  let getUser: ReturnType<typeof vi.fn>;
  let service: RequestAuthUserIdService;

  beforeEach(() => {
    getUser = vi.fn();
    service = new RequestAuthUserIdService({
      getUser
    } as unknown as OAuthUserService);
  });

  it('returns the authenticated user id', async () => {
    getUser.mockResolvedValue({ id: 'user-1' });

    await expect(service.requireUserId()).resolves.toBe('user-1');
  });

  it('rejects when there is no user', async () => {
    getUser.mockResolvedValue(null);

    const error = await service.requireUserId().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_NOT_AUTHORIZED);
  });
});
