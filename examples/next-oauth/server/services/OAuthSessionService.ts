import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { hasSessionPath, redirectToPath } from '@config/route';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { OAuthSessionServiceInterface } from '@server/interfaces/OAuthSessionServiceInterface';
import { isSessionPayloadRevoked } from '@server/utils/sessionRevocation';
import type { UserSchema } from '@qlover/next-kit/common';
import type {
  OAuthSessionInterface,
  OAuthSessionPayload
} from '@qlover/oauth-wrapper';
import type { NextRequest } from 'next/server';

/** Cookie fields for attaching a session to a {@link NextResponse}. */
export type SessionCookieFieldsType = {
  readonly name: string;
  readonly value: string;
  readonly httpOnly: boolean;
  readonly secure: boolean;
  readonly sameSite: 'lax';
  readonly path: string;
  readonly maxAge: number;
};

/**
 * 该文件用于页面访问权限控制
 *
 * 访问权限控制逻辑：
 * - 当访问需要登陆时的页面时，如果用户没有登陆则会跳转到登陆页面
 * - 这是在 supabase 上一层的抽象，它和 supabase 没有关系，supabase 只是一种实现，
 *   它本身可能会在 cookies 中保存数据, 但那是调用 supabase api sdk 的能力和鉴权无关, 不要混淆
 *   如果使用 supabase 登陆需要设置 serverConfig.oauthSessionKey 的值
 */
export class OAuthSessionService
  implements
    OAuthSessionServiceInterface,
    OAuthSessionInterface<OAuthSessionPayload, UserSchema>
{
  protected secure: boolean;
  protected sessionSecret: string;
  protected sessionKey: string;
  constructor(config: SeedServerConfigInterface) {
    if (!config.sessionSecret || !config.oauthSessionKey) {
      throw new Error(
        'Session secret or session key is not set, You can set process.env.SESSION_SECRET and process.env.OAUTH_SESSION_KEY to fix this error'
      );
    }
    this.sessionSecret = config.sessionSecret;
    this.sessionKey = config.oauthSessionKey;
    this.secure = config.isProduction;
  }

  protected parseJWT(raw: string, secret: string): OAuthSessionPayload | null {
    if (!raw || !secret) {
      return null;
    }
    try {
      return jwt.verify(raw, secret) as OAuthSessionPayload;
    } catch {
      return null;
    }
  }

  protected generateJWT(payload: OAuthSessionPayload): string {
    const token = jwt.sign(payload, this.sessionSecret, { expiresIn: '7d' });
    return token;
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

    // 已被「撤销所有会话」（如重置密码）作废的 session：清 cookie 后去登录
    if (await isSessionPayloadRevoked(payload)) {
      const response = NextResponse.redirect(redirectToPath(request));
      response.cookies.delete(this.sessionKey);
      return response;
    }

    // 4. 验证通过，返回正常响应
    return nextResponse ?? NextResponse.next({ request });
  }

  /**
   * Build session cookie fields for attaching to a {@link NextResponse}
   * (e.g. OAuth redirects). Prefer this over `cookies().set` + redirect —
   * Next may drop the cookie jar on a freshly constructed redirect response.
   */
  public buildSessionCookie(
    payload: OAuthSessionPayload
  ): SessionCookieFieldsType {
    return {
      name: this.sessionKey,
      value: this.generateJWT(payload),
      httpOnly: true,
      secure: this.secure,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    };
  }

  /**
   * @override
   */
  public async setSession(payload: OAuthSessionPayload): Promise<void> {
    const cookie = this.buildSessionCookie(payload);
    const cookieStore = await cookies();
    cookieStore.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      path: cookie.path,
      maxAge: cookie.maxAge
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
  public async getSession(): Promise<OAuthSessionPayload | null> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(this.sessionKey)?.value;

    if (!raw) {
      return null;
    }

    const payload = this.parseJWT(raw, this.sessionSecret);
    if (!payload) {
      return null;
    }

    // 签发时间早于 fe_users.sessions_revoked_at 的会话视为失效。
    return (await isSessionPayloadRevoked(payload)) ? null : payload;
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
