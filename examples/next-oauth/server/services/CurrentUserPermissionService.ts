import type { AppPermissionKey } from '@shared/auth/permissionKeys';
import { inject, injectable } from '@shared/container';
import {
  PermissionGuardService,
  type PermissionCheckerType
} from '@server/services/PermissionGuardService';

export type { PermissionCheckerType };

/**
 * 当前用户多 key 校验入口；委托 {@link PermissionGuardService}。
 */
@injectable()
export class CurrentUserPermissionService {
  constructor(
    @inject(PermissionGuardService)
    protected readonly permissionGuard: PermissionGuardService
  ) {}

  /**
   * Resolve the role once, then return a sync checker.
   *
   * @throws ExecutorError(API_NOT_AUTHORIZED) when unauthenticated
   */
  public async createChecker(): Promise<PermissionCheckerType> {
    return this.permissionGuard.createChecker();
  }

  /**
   * 单 key 断言（与路由门同源）。
   */
  public async assertHasPermission(key: AppPermissionKey): Promise<void> {
    await this.permissionGuard.assertHasPermission(key);
  }
}
