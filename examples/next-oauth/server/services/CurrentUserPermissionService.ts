import { ExecutorError } from '@qlover/fe-corekit/executor';
import type { AppPermissionKey } from '@shared/auth/permissionKeys';
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

export type PermissionCheckerType = (key: AppPermissionKey) => boolean;

/**
 * Current-user permission checks (same rules as
 * {@link RequirePermissionPlugin}), for endpoints that need to evaluate
 * multiple keys while shaping a response.
 */
@injectable()
export class CurrentUserPermissionService {
  constructor(
    @inject(RolePermissionService)
    protected readonly rolePermissionService: RolePermissionService,
    @inject(OAuthUserService)
    protected readonly oauthUserService: OAuthUserService,
    @inject(FeUsersRepository)
    protected readonly usersRepository: FeUsersRepository
  ) {}

  /**
   * Resolve the role once, then return a sync checker.
   *
   * @throws ExecutorError(API_NOT_AUTHORIZED) when unauthenticated
   */
  public async createChecker(): Promise<PermissionCheckerType> {
    await this.rolePermissionService.ensureLoaded();
    const user = await this.oauthUserService.getUser(false);
    if (!user?.id) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }

    const fromDb = await this.usersRepository
      .getSystemRoleKey(user.id)
      .catch(() => null);
    const sessionRole =
      typeof user === 'object' && 'system_role' in user
        ? (user as { system_role?: unknown }).system_role
        : undefined;
    const role = normalizeSystemRole(
      fromDb ??
        (typeof sessionRole === 'string' ? sessionRole : undefined) ??
        platformRoleFromUserRole(user.role)
    );

    return (key: AppPermissionKey): boolean =>
      sessionHasSystemPermission(user, key) === true ||
      hasSystemPermission(role, key);
  }
}
