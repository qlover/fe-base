import { ExecutorError } from '@qlover/fe-corekit/executor';
import type { AppPermissionKey } from '@shared/auth/permissionKeys';
import {
  hasSystemPermission,
  normalizeSystemRole,
  platformRoleFromUserRole,
  sessionHasSystemPermission
} from '@shared/auth/systemRole';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import type { NextOAuthServerIocMap } from '@server/BootstrapServer';
import { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import { OAuthUserService } from '@server/services/OAuthUserService';
import { RolePermissionService } from '@server/services/RolePermissionService';
import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '@qlover/next-kit/server';

/**
 * Route-layer gate: inject an immutable permission_key (platform only).
 *
 * Source of truth: `fe_users.role_id` → `fe_roles.key` → permission maps.
 * Cookie `UserSchema.role` is only a last-resort fallback.
 *
 * @example
 * ```ts
 * .use(new ServerAuthPlugin())
 * .use(new RequirePermissionPlugin(PermissionKey.admin_roles_read))
 * ```
 */
export class RequirePermissionPlugin implements BootstrapServerPlugin<NextOAuthServerIocMap> {
  public readonly pluginName = 'RequirePermissionPlugin';

  constructor(private readonly permissionKey: AppPermissionKey) {}

  /**
   * @override
   */
  public async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext<NextOAuthServerIocMap>): Promise<void> {
    await IOC(RolePermissionService).ensureLoaded();

    const oauth = IOC(OAuthUserService);
    const user = (await oauth.getSessionUser()) ?? (await oauth.getUser(false));
    if (!user?.id) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }

    // Rich session (permissions / system_role) may allow early.
    if (sessionHasSystemPermission(user, this.permissionKey) === true) {
      return;
    }

    const fromDb = await IOC(FeUsersRepository)
      .getSystemRoleKey(user.id)
      .catch(() => null);

    const sessionRole =
      user && typeof user === 'object' && 'system_role' in user
        ? (user as { system_role?: unknown }).system_role
        : undefined;

    const role = normalizeSystemRole(
      fromDb ??
        (typeof sessionRole === 'string' ? sessionRole : undefined) ??
        platformRoleFromUserRole(user.role)
    );

    if (!hasSystemPermission(role, this.permissionKey)) {
      throw new ExecutorError(API_NOT_AUTHORIZED);
    }
  }
}
