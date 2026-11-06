import { RequirePermissionPlugin as KitRequirePermissionPlugin } from '@qlover/next-kit/server';
import type { AppPermissionKey } from '@shared/auth/permissionKeys';
import type { NextOAuthServerIocMap } from '@server/BootstrapServer';
import { PermissionGuardService } from '@server/services/PermissionGuardService';

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
export class RequirePermissionPlugin extends KitRequirePermissionPlugin<NextOAuthServerIocMap> {
  constructor(permissionKey: AppPermissionKey) {
    super(permissionKey, (IOC) => IOC(PermissionGuardService));
  }
}
