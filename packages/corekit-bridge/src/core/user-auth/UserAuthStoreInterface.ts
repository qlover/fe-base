export enum LOGIN_STATUS {
  LOADING = 'loading',
  SUCCESS = 'success',
  FAILED = 'failed'
}

export interface UserAuthStoreInterface<User> {
  setToken(token: string): void;
  getToken(): string | null;
  getLoginStatus(): LOGIN_STATUS | null;

  /**
   * 设置用户信息
   */
  setUserInfo(params: User): void;
  /**
   * 获取用户信息
   */
  getUserInfo(): User | null;

  /**
   * 重置
   */
  reset(): void;

  /**
   * 开始认证
   */
  startAuth(): void;

  /**
   * 认证成功
   */
  authSuccess(): void;

  /**
   * 认证失败
   */
  authFailed(error?: unknown): void;
}
