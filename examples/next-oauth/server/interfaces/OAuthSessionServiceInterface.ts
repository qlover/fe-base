import type { NextRequest, NextResponse } from 'next/server';

/**
 * 该接口用于实现服务端上对权限的验证
 *
 * 比如: 未登陆页面需要登陆才能访问, 登陆页面需要未登陆才能访问等
 */
export interface OAuthSessionServiceInterface {
  /**
   * 主要用于 request 检查是否需要会话/登陆
   *
   * 一般和 sessionProxy 配合使用
   * @param request
   */
  hasNeedProxy(request: NextRequest): boolean;

  /**
   * 获取 会话/登陆的响应，比如重定向返回一个新的 NextResponse
   * @param request
   * @param nextResponse 可以是一个额外的 response，比如 localPath 的 response
   */
  sessionProxy(request: NextRequest): Promise<NextResponse<unknown>>;
  sessionProxy(
    request: NextRequest,
    nextResponse?: NextResponse<unknown>
  ): Promise<NextResponse<unknown>>;
}
