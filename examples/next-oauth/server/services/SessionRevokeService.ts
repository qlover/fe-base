import { SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { SessionRevokeServiceInterface } from '@server/interfaces/SessionRevokeServiceInterface';
import { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import { OAuthWrapperRepository } from '@server/repositorys/OAuthWrapperRepository';
import { SupabaseSessionMintService } from '@server/services/SupabaseSessionMintService';
import { setSessionsRevokedCache } from '@server/utils/sessionRevocation';
import type { LoggerInterface } from '@qlover/logger';

/**
 * 让用户在所有设备上退出：浏览器会话 JWT、第三方 OAuth refresh token、
 * Supabase refresh token 一并失效。
 */
@injectable()
export class SessionRevokeService implements SessionRevokeServiceInterface {
  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>,
    @inject(FeUsersRepository)
    protected readonly feUsersRepository: FeUsersRepository,
    @inject(OAuthWrapperRepository)
    protected readonly oauthRepository: OAuthWrapperRepository,
    @inject(SupabaseSessionMintService)
    protected readonly sessionMint: SupabaseSessionMintService
  ) {}

  /**
   * @override
   */
  public async revokeAll(params: {
    readonly userId: string;
    readonly email?: string | null;
  }): Promise<void> {
    const { userId } = params;
    const now = new Date();

    await this.feUsersRepository.setSessionsRevokedAt(
      userId,
      now.toISOString()
    );
    setSessionsRevokedCache(userId, now.getTime());

    await this.oauthRepository.revokeRefreshTokensByUserId(userId);
    await this.oauthRepository.upsertUserCredentials(userId, {
      provider_refresh_token: null,
      provider_session_token: null
    });

    await this.revokeSupabaseSessions(userId, params.email);

    this.logger.info('SessionRevokeService: all sessions revoked', { userId });
  }

  /**
   * GoTrue 的 global 登出需要用户 access_token：铸造一个临时会话再以
   * `global` 作用域登出。尽力而为，失败只告警。
   */
  protected async revokeSupabaseSessions(
    userId: string,
    email?: string | null
  ): Promise<void> {
    const mintEmail = email?.trim();
    if (!mintEmail) {
      return;
    }
    try {
      const session = await this.sessionMint.mintSessionForAuthUser({
        userId,
        email: mintEmail
      });
      const admin = this.supabaseBridge.getAdminSupabase();
      const result = await admin.auth.admin.signOut(
        session.access_token,
        'global'
      );
      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      this.logger.warn('Supabase global sign-out failed', { userId, error });
    }
  }
}
