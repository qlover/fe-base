import type { UserScopedResettableInterface } from '@interfaces/UserScopedResettableInterface';
import type { UserServiceInterface } from '@interfaces/UserServiceInterface';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

/**
 * 用户作用域重置插件：订阅用户状态，已登录用户变为未登录（退出 / 会话失效）
 * 或切换为另一个用户时，重置所有登记的用户作用域状态。
 *
 * 需重置的对象在组装点（BootstrapClient）登记，本类只负责判定时机。
 */
export class UserScopeResetService implements BootstrapExecutorPlugin {
  public readonly pluginName = 'UserScopeResetService';

  protected lastUserId: string | null = null;
  protected unsubscribe: (() => void) | null = null;

  /**
   * @param userService - 用户状态来源
   * @param resettables - 用户作用域状态 / 缓存
   */
  constructor(
    protected readonly userService: UserServiceInterface,
    protected readonly resettables: readonly UserScopedResettableInterface[]
  ) {}

  /**
   * @override
   */
  public onBefore(): void {
    if (this.unsubscribe != null) {
      return;
    }
    this.lastUserId = this.resolveUserId();
    this.unsubscribe = this.userService
      .getStore()
      .getStore()
      .subscribe(() => this.syncWithUser());
  }

  /**
   * 停止订阅（测试 / 卸载用）。
   */
  public stop(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  protected syncWithUser(): void {
    const currentUserId = this.resolveUserId();
    if (currentUserId === this.lastUserId) {
      return;
    }
    const previousUserId = this.lastUserId;
    this.lastUserId = currentUserId;
    if (previousUserId != null) {
      this.resetAll();
    }
  }

  protected resetAll(): void {
    for (const resettable of this.resettables) {
      resettable.resetUserScope();
    }
  }

  protected resolveUserId(): string | null {
    if (!this.userService.isAuthenticated()) {
      return null;
    }
    const id = this.userService.getUser()?.id;
    return typeof id === 'string' && id ? id : null;
  }
}
