export interface LoginResponseData {
  token?: string;
  [key: string]: unknown;
}

export interface UserAuthApiInterface<User> {
  /**
   * 登录
   * @param params 登录参数
   * @returns 登录响应数据
   */
  login(params: unknown): Promise<LoginResponseData>;

  /**
   * 注册
   * @param params 注册参数
   * @returns 注册响应数据
   */
  register(params: unknown): Promise<unknown>;

  /**
   * 登出
   */
  logout(): Promise<void>;

  /**
   * 获取用户信息
   * @param params 获取用户信息参数
   * @returns 用户信息
   */
  getUserInfo(params: unknown): Promise<User>;
}
