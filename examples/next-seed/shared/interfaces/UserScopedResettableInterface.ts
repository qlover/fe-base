/**
 * 内存中持有「当前用户」数据的状态 / 缓存。
 *
 * 用户退出、会话失效或切换账号时由 {@link UserScopeResetService} 统一调用，
 * 避免下一个账号看到上一个账号的残留数据。
 */
export interface UserScopedResettableInterface {
  /**
   * 清空与当前用户相关的内存数据，恢复初始状态（与设备相关的偏好不在此列）。
   */
  resetUserScope(): void;
}
