/**
 * 基础会话载荷，包含 OAuth 核心所需的最少字段。
 * 子类可以扩展此类型，添加任意额外字段（如 avatar, phone, roles 等）。
 */
export interface OAuthSessionPayload {
  /**
   * 用户唯一标识
   */
  userId: string;
  /**
   * 外部提供方的会话 token
   */
  providerRefreshToken: string;
}

export type WithUserSession<
  SessionPayload extends OAuthSessionPayload,
  User
> = SessionPayload & {
  /**
   * 可以额外携带一个用户信息
   */
  user?: User;
};

/**
 * 会话管理接口，泛型参数必须满足 OAuthSessionPayload 约束。
 * 实现类可以返回更具体的子类型（包含额外字段）。
 */
export interface OAuthSessionInterface<
  Payload extends OAuthSessionPayload,
  User
> {
  getSession(): Promise<Payload | null>;
  hasSession(): Promise<boolean>;
  setSession(payload: WithUserSession<Payload, User>): Promise<void>;
  clearSession(): Promise<void>;
}
