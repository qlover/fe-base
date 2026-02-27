import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@shared/supabase/server';

/**
 * @swagger
 * /api/callback:
 *   get:
 *     tags:
 *       - Auth
 *     summary: OAuth / auth callback
 *     description: |
 *       Handles auth provider callback (e.g. email verification). Exchanges `code` for session via Supabase.
 *       Redirects to `/` on success (email confirmed), `/auth/verify-email` when email not yet confirmed,
 *       `/auth/error` on failure, or `/auth/login` when no `code` is provided.
 *     parameters:
 *       - in: query
 *         name: code
 *         required: false
 *         schema:
 *           type: string
 *         description: One-time code from auth provider to exchange for session.
 *     responses:
 *       302:
 *         description: Redirect to success, verify-email, error, or login page.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    console.log('api/callback code', code);
    try {
      const supabase = await createClient();
      // 使用 code 交换 session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('验证失败:', error.message);
        // 重定向到错误页面
        return NextResponse.redirect(
          new URL('/auth/error?error=verification_failed', request.url)
        );
      }

      // 获取用户信息
      const {
        data: { user }
      } = await supabase.auth.getUser();

      // 检查邮箱是否已验证
      if (user && user.email_confirmed_at) {
        console.log('✅ 邮箱已验证成功');
        // 重定向到成功页面
        return NextResponse.redirect(new URL('/', request.url));
      } else {
        console.log('⏳ 邮箱验证中...');
        // 重定向到验证提醒页面
        return NextResponse.redirect(
          new URL('/auth/verify-email', request.url)
        );
      }
    } catch (error) {
      console.error('回调处理错误:', error);
      return NextResponse.redirect(new URL('/auth/error', request.url));
    }
  }

  // 如果没有 code 参
  // 数，重定向到登录页
  return NextResponse.redirect(new URL('/auth/login', request.url));
}
