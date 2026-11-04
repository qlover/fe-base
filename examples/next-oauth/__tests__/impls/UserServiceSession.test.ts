import { describe, expect, it, vi } from 'vitest';
import { UserService } from '@/impls/UserService';
import type { UserServiceGatewayInterface } from '@interfaces/UserServiceInterface';

const SESSION_USER = {
  id: 'user-1',
  role: 1 as const,
  email: 'a@example.com',
  credential_token: '',
  created_at: '2026-01-01T00:00:00Z',
  system_role: 'admin',
  permissions: ['admin_roles_write']
};

function createService(gateway: Partial<UserServiceGatewayInterface>) {
  return new UserService(gateway as UserServiceGatewayInterface);
}

describe('UserService session gating', () => {
  it('starts a single session restore when business requests arrive first', async () => {
    const refreshUserInfo = vi
      .fn()
      .mockResolvedValue({ data: SESSION_USER, error: null });
    const service = createService({ refreshUserInfo });

    const [a, b] = await Promise.all([
      service.awaitSessionReady(),
      service.awaitSessionReady()
    ]);
    await service.refreshUser();

    expect(a).toBe(true);
    expect(b).toBe(true);
    expect(refreshUserInfo).toHaveBeenCalledTimes(1);
  });

  it('reports not ready once the restore settles without a user', async () => {
    const refreshUserInfo = vi.fn().mockRejectedValue(new Error('no session'));
    const service = createService({ refreshUserInfo });

    expect(await service.awaitSessionReady()).toBe(false);
    expect(await service.awaitSessionReady()).toBe(false);
    expect(refreshUserInfo).toHaveBeenCalledTimes(1);
  });

  it('applySessionUser fills capabilities store', () => {
    const service = createService({ refreshUserInfo: vi.fn() });
    service.applySessionUser(SESSION_USER);

    expect(service.isAuthenticated()).toBe(true);
    const caps = service.getCapabilitiesStore().getState();
    expect(caps.permissions).toEqual(['admin_roles_write']);
    expect(caps.platformAdmin).toBe(true);
  });

  it('expireSession clears user and capabilities', () => {
    const service = createService({ refreshUserInfo: vi.fn() });
    service.applySessionUser(SESSION_USER);
    service.expireSession();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getCapabilitiesStore().getState().permissions).toEqual([]);
  });
});
