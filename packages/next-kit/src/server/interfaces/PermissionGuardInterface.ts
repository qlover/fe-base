/**
 * 路由/服务端权限门：断言当前主体是否拥有某 permission key。
 * 未授权时由实现抛出业务错误（如 ExecutorError）。
 */
export interface PermissionGuardInterface {
  /**
   * 确保权限目录等已就绪（可 no-op）。
   */
  ensureReady(): Promise<void>;

  /**
   * 断言拥有 `permissionKey`；未登录或不具备时抛错。
   */
  assertHasPermission(permissionKey: string): Promise<void>;
}
