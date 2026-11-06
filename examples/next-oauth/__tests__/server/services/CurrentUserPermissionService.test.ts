import { ExecutorError } from '@qlover/fe-corekit/executor';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PermissionKey } from '@shared/auth/permissionKeys';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import { CurrentUserPermissionService } from '@server/services/CurrentUserPermissionService';
import { PermissionGuardService } from '@server/services/PermissionGuardService';
import type { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import type { OAuthUserService } from '@server/services/OAuthUserService';
import type { RolePermissionService } from '@server/services/RolePermissionService';

vi.mock('@shared/auth/systemRole', async () => {
  const actual = await vi.importActual<
    typeof import('@shared/auth/systemRole')
  >('@shared/auth/systemRole');
  return {
    ...actual,
    hasSystemPermission: vi.fn(
      (role: string, key: string) =>
        role === 'admin' && key === PermissionKey.admin_users_read
    ),
    sessionHasSystemPermission: vi.fn(() => false)
  };
});

describe('CurrentUserPermissionService.createChecker', () => {
  let ensureLoaded: ReturnType<typeof vi.fn>;
  let getUser: ReturnType<typeof vi.fn>;
  let getSessionUser: ReturnType<typeof vi.fn>;
  let getSystemRoleKey: ReturnType<typeof vi.fn>;
  let service: CurrentUserPermissionService;

  beforeEach(() => {
    ensureLoaded = vi.fn().mockResolvedValue(undefined);
    getUser = vi.fn();
    getSessionUser = vi.fn().mockResolvedValue(null);
    getSystemRoleKey = vi.fn();
    const guard = new PermissionGuardService(
      { ensureLoaded } as unknown as RolePermissionService,
      { getUser, getSessionUser } as unknown as OAuthUserService,
      { getSystemRoleKey } as unknown as FeUsersRepository
    );
    service = new CurrentUserPermissionService(guard);
  });

  it('rejects when unauthenticated', async () => {
    getUser.mockResolvedValue(null);

    const error = await service.createChecker().catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ExecutorError);
    expect((error as ExecutorError).id).toBe(API_NOT_AUTHORIZED);
  });

  it('checks against the database role', async () => {
    getUser.mockResolvedValue({ id: 'user-1', role: 'user' });
    getSystemRoleKey.mockResolvedValue('admin');

    const can = await service.createChecker();

    expect(can(PermissionKey.admin_users_read)).toBe(true);
    expect(can(PermissionKey.admin_roles_write)).toBe(false);
  });
});
