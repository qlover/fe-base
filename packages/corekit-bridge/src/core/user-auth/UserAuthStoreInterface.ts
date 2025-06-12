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
   * 切换登录状态
   */
  changeLoginStatus(status: LOGIN_STATUS): void;

  /**
   * 重置
   */
  reset(): void;
}
