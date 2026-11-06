import { ExecutorError } from '@qlover/fe-corekit/executor';
import type { AppPermissionKey } from '@shared/auth/permissionKeys';
import type { PlatformRoleKeyType } from '@shared/auth/roleKeys';
import {
  hasSystemPermission,
  normalizeSystemRole,
  platformRoleFromUserRole,
  sessionHasSystemPermission
} from '@shared/auth/systemRole';
import { inject, injectable } from '@shared/container';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import { OAuthUserService } from '@server/services/OAuthUserService';
import { RolePermissionService } from '@server/services/RolePermissionService';
import type { UserSchema } from '@qlover/next-kit/common';
import type { PermissionGuardInterface } from '@qlover/next-kit/server';

export type PermissionCheckerType = (key: AppPermissionKey) => boolean;

type SessionUserType = UserSchema & {
  readonly system_role?: unknown;
};

/**
 * 当前用户权限门：与路由 {@link RequirePermissionPlugin} 同源规则。
 */
@injectable()
export class PermissionGuardService implements PermissionGuardInterface {
  constructor(
    @inject(RolePermissionService)
    protected readonly rolePermissionService: RolePermissionService,
    @inject(OAuthUserService)
    protected readonly oauthUserService: OAuthUserService,
    @inject(FeUsersRepository)
    protected readonly usersRepository: FeUsersRepository
  ) {}

  /**
   * @override
   */
  public async ensureReady(): Promise<void> {
    await this.rolePermissionService.ensureLoaded();
  }

  /**
   * @override
   */
  public async assertHasPermission(permissionKey: string): Promise<void> {
    const { user, role } = await this.resolveSubject();
    if (
      sessionHasSystemPermission(user, permissionKey as AppPermissionKey) ===
        true ||
      hasSystemPermission(role, permissionKey as AppPermissionKey)
    ) {
      return;
    }
    throw new ExecutorError(API_NOT_AUTHORIZED);
  }

  /**
   * 解析一次角色，返回同步 checker（多 key 响应整形用）。
   *
   * @throws ExecutorError(API_NOT_AUTHORIZED) when unauthenticated
   */
  public async createChecker(): Promise<PermissionCheckerType> {
    const { user, role } = await this.resolveSubject();
    return (key: AppPermissionKey): boolean =>
      sessionHasSystemPermission(user, key) === true ||
      hasSystemPermission(role, key);
  }

  protected async resolveSubject(): Promise<{
    readonly user: SessionUserType;
    readonly role: PlatformRoleKeyType;
  }> {
    await this.ensureReady();
    const user =
      ((await this.oauthUserService.getSessionUser()) as SessionUserType | null) ??
      ((await this.oauthUserService.getUser(false)) as SessionUserType | null);
    if (!user?.id) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }

    const fromDb = await this.usersRepository
      .getSystemRoleKey(user.id)
      .catch(() => null);

    const sessionRole =
      typeof user === 'object' && 'system_role' in user
        ? user.system_role
        : undefined;

    const role = normalizeSystemRole(
      fromDb ??
        (typeof sessionRole === 'string' ? sessionRole : undefined) ??
        platformRoleFromUserRole(user.role)
    );

    return { user, role };
  }
}
