import { OAuthAuthorizeQuerySchema } from '@qlover/oauth-wrapper';
import { z } from 'zod';
import { inject, injectable } from '@shared/container';
import { URLParamsKeys } from '@config/common';
import { I } from '@config/ioc-identifiter';
import { ROUTE_HOME, ROUTE_LOGIN, ROUTE_OAUTH_CONSENT } from '@config/route';
import { UserSchema } from '@schemas/UserSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import {
  OAuthAuthorizationCallbackResult,
  OAuthProviderInterface
} from '@server/interfaces/OAuthProviderInterface';
import { SupabaseBridge } from '@server/repositorys/SupabaseBridge';
import { ServerConfig } from '@server/ServerConfig';
import { VerifyLoginParams } from '@server/services/OAuthService';
import type { LoggerInterface } from '@qlover/logger';

const authKey = 'authorization_id' as const;

/**
 * 该情况是没有任何登录，授权的时候，supabase 返回的一个授权id
 *
 * 这个时候需要使用这个id
 */
const authorizationCallbackQuerySchema = z.object({
  /**
   * supabase 可能是32位长度
   */
  [authKey]: z.string().length(32)
});

/**
 * 该情况是已经登录，授权的时候直接返回 code 和 state
 *
 * 这个时候需要使用这个id
 */
const authorizationCodeCallbackQuerySchema = z.object({
  code: z.string(),
  state: z.string()
});

export type AuthorizationCodeCallbackQueryType = z.infer<
  typeof authorizationCodeCallbackQuerySchema
>;

/**
 * Supabase server oauth2.0 服务提供者
 *
 * IMPORTANT: 需要特别注意的地方
 * - pkce 的 OAuth Apps client配置的 redirect_uri 需要包含 Authorization Path 的回调，不然会重定向无效
 */
@injectable()
export class SupabaseServerOAuthProvider implements OAuthProviderInterface {
  @inject(I.Logger)
  protected logger!: LoggerInterface;

  @inject(ServerConfig)
  protected config!: SeedServerConfigInterface;

  @inject(SupabaseBridge)
  protected supabaseBridge!: SupabaseBridge;

  protected authorizeEndpoint = '/auth/v1/oauth/authorize';

  /**
   * @override
   */
  public async getUser(): Promise<UserSchema | null> {
    const supabase = await this.supabaseBridge.getSupabase();
    const result = await supabase.auth.getSession();

    if (!result.data || !result.data.session) {
      return null;
    }

    const session = result.data.session;
    const user = session!.user;

    return this.supabaseBridge.toUserSchema(user, session?.access_token);
  }

  /**
   * @override
   */
  public async verifyLogin(params: VerifyLoginParams): Promise<UserSchema> {
    const supabase = await this.supabaseBridge.getSupabase();

    const result = await supabase.auth.signInWithPassword(params);

    this.supabaseBridge.throwIfError(result);

    return this.supabaseBridge.toUserSchema(result.data.user!);
  }

  /**
   * @override
   */
  public async authorizePKCE(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<{ redirectAuthorizeUrl: string | URL }> {
    const parseResult = OAuthAuthorizeQuerySchema.safeParse(rawQuery);

    if (!parseResult.success) {
      throw new Error('Invalid authorization request parameters.');
    }

    const query = parseResult.data;

    // IMPORTANT: 保存原始重定向url，然后修改为自己的
    query.redirect_uri = new URL(
      ROUTE_OAUTH_CONSENT,
      this.config.siteUrl
    ).toString();

    this.logger.debug('SupabseServerOAuth authorizePKCE query', query);

    const supabseURL = this.supabaseBridge.getBaseURL();

    const redirectAuthorizeUrl = new URL(this.authorizeEndpoint, supabseURL);

    Object.entries(query).forEach(([key, value]) => {
      redirectAuthorizeUrl.searchParams.set(key, value);
    });

    return Promise.resolve({ redirectAuthorizeUrl });
  }

  /**
   * @override
   */
  public async authorizePKCECallback(
    rawQuery: Record<string, string | string[] | undefined>
  ): Promise<OAuthAuthorizationCallbackResult> {
    const parseResult = authorizationCallbackQuerySchema.safeParse(rawQuery);

    if (parseResult.success) {
      return this.pkceCallbackWithAuthorizationId(parseResult.data[authKey]);
    }

    const parseCodeResult =
      authorizationCodeCallbackQuerySchema.safeParse(rawQuery);
    if (parseCodeResult.success) {
      return this.pkceCallbackWithAuthorizationCode(parseCodeResult.data);
    }

    throw new Error('Invalid authorization request parameters.');
  }

  /**
   * 直接返回成功跳转页面
   */
  protected async pkceCallbackWithAuthorizationCode(
    query: AuthorizationCodeCallbackQueryType
  ): Promise<OAuthAuthorizationCallbackResult> {
    const { code } = query;
    // // 2. 【关键】验证 state 防 CSRF 攻击
    // const savedState = req.session.oauthState; // 从用户 session 中获取保存的 state
    // if (!savedState || savedState !== callbackState) {
    //   console.error('State mismatch: potential CSRF attack');
    //   return res.status(400).send('Invalid state parameter');
    // }

    const supabase = await this.supabaseBridge.getSupabase();
    // const codeVerifier = req.session.codeVerifier; // 从 session 中获取保存的 code_verifier

    // 4. 交换 token
    const sessionResult = await supabase.auth.exchangeCodeForSession(code);
    // 或直接使用 fetch 方案
    // const tokenResponse = await fetch('...', { method: 'POST', ... })

    this.supabaseBridge.throwIfError(sessionResult);

    // 5. 获取用户信息（可选，可通过 data.user 直接获得）
    const session = sessionResult.data.session!;

    const userResult = await supabase.auth.getUser(session.access_token);

    this.supabaseBridge.throwIfError(userResult);

    // 6. 处理成功，设置服务器 session，重定向到应用主页等
    const user = userResult.data.user!;
    this.logger.debug('pkce callback with authorization code user is', user);

    return {
      redirect_url: ROUTE_HOME
    };
  }

  /**
   * 返回授权，拒绝等信息
   * @param authorizationId
   * @returns
   */
  protected async pkceCallbackWithAuthorizationId(
    authorizationId: string
  ): Promise<OAuthAuthorizationCallbackResult> {
    const supabase = await this.supabaseBridge.getSupabase();
    // 检查是否登录，如果没有则重定向登陆页面，然后再重定向回来
    const userResult = await supabase.auth.getUser();

    if (userResult.data.user == null) {
      const loginURL = new URL(ROUTE_LOGIN, this.config.siteUrl);

      loginURL.searchParams.set(
        URLParamsKeys.returnTo[1],
        encodeURIComponent(
          `${ROUTE_OAUTH_CONSENT}?${authKey}=${authorizationId}`
        )
      );

      this.logger.debug(
        'authorizePKCECallback no login, redirect to',
        loginURL
      );

      return {
        redirect_url: loginURL.toString()
      };
    }

    const result =
      await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

    this.supabaseBridge.throwIfError(result);

    if (result.data == null) {
      throw new Error('Authorization details not found.');
    }

    return result.data;
  }

  /**
   * @override
   */
  public async clearSession(): Promise<void> {
    const supabase = await this.supabaseBridge.getSupabase();
    await supabase.auth.signOut();
  }
}
