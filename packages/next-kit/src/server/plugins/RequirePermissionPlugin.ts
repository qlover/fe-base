import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '../interfaces/BootstrapServerInterface';
import type { PermissionGuardInterface } from '../interfaces/PermissionGuardInterface';

export type RequirePermissionResolveGuardType<
  IOCIdentifierMap extends Record<PropertyKey, unknown>
> = (
  IOC: BootstrapServerContext<IOCIdentifierMap>['parameters']['IOC']
) => PermissionGuardInterface;

/**
 * 路由层权限门：注入不可变 permission key，委托 {@link PermissionGuardInterface}。
 *
 * @example
 * ```ts
 * .use(new RequirePermissionPlugin('admin.roles.read', (IOC) => IOC(MyGuard)))
 * ```
 */
export class RequirePermissionPlugin<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
> implements BootstrapServerPlugin<IOCIdentifierMap>
{
  public readonly pluginName = 'RequirePermissionPlugin';

  constructor(
    protected readonly permissionKey: string,
    protected readonly resolveGuard: RequirePermissionResolveGuardType<IOCIdentifierMap>
  ) {}

  /**
   * @override
   */
  public async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext<IOCIdentifierMap>): Promise<void> {
    const guard = this.resolveGuard(IOC);
    await guard.ensureReady();
    await guard.assertHasPermission(this.permissionKey);
  }
}
