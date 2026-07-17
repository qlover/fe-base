import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { hasSessionPath, redirectToPath } from '@config/route';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { SessionPayload } from '../interfaces/AuthTypes';
import type { SessionServiceInterface } from '../interfaces/SessionServiceInterface';
import type { NextRequest } from 'next/server';

/**
 * 该文件用于页面访问权限控制
 *
 * 访问权限控制逻辑：
 * - 当访问需要登陆时的页面时，如果用户没有登陆则会跳转到登陆页面
 * - 这是在 supabase 上一层的抽象，它和 supabase 没有关系，supabase 只是一种实现，
 *   它本身可能会在 cookies 中保存数据, 但那是调用 supabase api sdk 的能力和鉴权无关, 不要混淆
 *   如果使用 supabase 登陆需要设置 serverConfig.sessionKey 的值
 */
export class SessionService implements SessionServiceInterface {
  protected secure: boolean;
  protected sessionSecret: string;
  protected sessionKey: string;

  constructor(config: SeedServerConfigInterface) {
    if (!config.sessionSecret || !config.sessionKey) {
      throw new Error(
        'Session secret or session key is not set, You can set process.env.SESSION_SECRET and process.env.OAUTH_SESSION_KEY to fix this error'
      );
    }
    this.sessionSecret = config.sessionSecret;
    this.sessionKey = config.sessionKey;
    this.secure = config.isProduction;
  }

  protected parseJWT(raw: string, secret: string): SessionPayload | null {
    if (!raw || !secret) {
      return null;
    }
    try {
      return jwt.verify(raw, secret) as SessionPayload;
    } catch {
      return null;
    }
  }

  /**
   * @override
   */
  public hasNeedProxy(request: NextRequest): boolean {
    const pathname = request.nextUrl.pathname;
    return hasSessionPath(pathname);
  }
  /**
   * @override
   */
  public async sessionProxy(
    request: NextRequest,
    nextResponse?: NextResponse<unknown>
  ): Promise<NextResponse<unknown>> {
    // 如果环境没有准备则直接重定向
    if (!this.sessionSecret || !this.sessionKey) {
      return NextResponse.redirect(redirectToPath(request));
    }

    // 1. 从 Cookie 中读取 session 值
    const sessionToken = request.cookies.get(this.sessionKey)?.value;

    if (!sessionToken) {
      return NextResponse.redirect(redirectToPath(request));
    }

    // 2. 验证 session
    const payload = this.parseJWT(sessionToken, this.sessionSecret);

    // 3. 如果无效，重定向到登录页（并携带当前路径）
    if (!payload) {
      return NextResponse.redirect(redirectToPath(request));
    }

    // 4. 验证通过，返回正常响应
    return nextResponse ?? NextResponse.next({ request });
  }

  /**
   * @override
   */
  public async setSession(payload: SessionPayload): Promise<void> {
    const token = jwt.sign(payload, this.sessionSecret, { expiresIn: '7d' });
    const cookieStore = await cookies();
    cookieStore.set(this.sessionKey, token, {
      httpOnly: true,
      secure: this.secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    });
  }

  /**
   * @override
   */
  public async hasSession(): Promise<boolean> {
    return (await this.getSession()) != null;
  }

  /**
   * @override
   */
  public async getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(this.sessionKey)?.value;

    if (!raw) {
      return null;
    }

    return this.parseJWT(raw, this.sessionSecret);
  }

  /**
   * @override
   */
  public async clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(this.sessionKey);
  }

  /**
   * Lightweight session check for middleware (e.g. guest-only auth pages).
   * Only verifies the app-session JWT cookie is present and parseable.
   *
   * @override
   */
  public hasSessionFromRequest(request: NextRequest): boolean {
    const raw = request.cookies.get(this.sessionKey)?.value;
    if (!raw) {
      return false;
    }
    return this.parseJWT(raw, this.sessionSecret) != null;
  }
}
