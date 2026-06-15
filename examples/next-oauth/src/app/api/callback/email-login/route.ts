/**
 * ─── Email OTP / Magic Link — 建立应用 Session ───
 *
 * POST /api/callback/email-login
 *
 * 调用方：前端 /auth/email-otp-callback 页面（client component）。
 * 前端已通过 supabase.auth.setSession() 设置了 Supabase auth cookie，
 * 本接口在此基础上建立应用级 OAuth wrapper session cookie，
 * 使得后续请求能被应用识别为已登录状态。
 *
 * 请求体：
 *   { access_token, refresh_token, expires_in, token_type }
 *
 * 流程：
 *   1. 从请求体中取出 Supabase tokens
 *   2. 调用 provider.loginWithSession()：
 *      a. 用 refresh_token 刷新 Supabase session（同时获取最新 user info）
 *      b. 生成应用 session payload 并写入 cookie
 *      c. 持久化 user credentials 到数据库
 *   3. 返回 { success: true }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { I } from '@config/ioc-identifiter';
import { BootstrapServer } from '@server/BootstrapServer';
import type { OAuthWrapperProviderInterface } from '@server/interfaces/OAuthWrapperProviderInterface';
import type { Session } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON' },
      { status: 400 }
    );
  }

  const accessToken = body.access_token as string | undefined;
  const refreshToken = body.refresh_token as string | undefined;

  if (!accessToken || !refreshToken) {
    return NextResponse.json(
      {
        success: false,
        message: 'access_token and refresh_token are required'
      },
      { status: 400 }
    );
  }

  try {
    const server = new BootstrapServer();
    const provider = server.getIOC(
      I.OAuthWrapperProviderInterface
    ) as OAuthWrapperProviderInterface;

    if (!provider.loginWithSession) {
      return NextResponse.json(
        {
          success: false,
          message: 'Current provider does not support session establishment'
        },
        { status: 501 }
      );
    }

    await provider.loginWithSession({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: parseInt(String(body.expires_in ?? '3600'), 10),
      token_type: String(body.token_type ?? 'bearer'),
      user: null
    } as unknown as Session);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
