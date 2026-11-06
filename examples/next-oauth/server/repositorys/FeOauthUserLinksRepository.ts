import { SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { FeTables } from '@config/feTables';

export type FeOauthUserLinkRow = {
  readonly auth_user_id: string;
  readonly provider: string;
  readonly external_user_id: string;
  readonly extra: Record<string, unknown> | null;
  readonly created_at: string;
  readonly updated_at: string;
};

/**
 * `fe_oauth_user_links`：上游 IdP 用户与本地 auth.users 的映射。
 */
@injectable()
export class FeOauthUserLinksRepository {
  constructor(
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>
  ) {}

  /**
   * 按本地 auth 用户 id 列出关联行。
   *
   * @param authUserId - `auth.users.id`
   */
  public async listByAuthUserId(
    authUserId: string
  ): Promise<FeOauthUserLinkRow[]> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.oauthUserLinks)
      .select(
        'auth_user_id, provider, external_user_id, extra, created_at, updated_at'
      )
      .eq('auth_user_id', authUserId)
      .order('created_at', { ascending: true });
    this.supabaseBridge.throwIfError(result);
    return ((result.data ?? []) as FeOauthUserLinkRow[]).map((row) => ({
      auth_user_id: row.auth_user_id,
      provider: row.provider,
      external_user_id: row.external_user_id,
      extra:
        row.extra && typeof row.extra === 'object'
          ? (row.extra as Record<string, unknown>)
          : null,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));
  }
}
