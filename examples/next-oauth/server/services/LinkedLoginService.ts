import { SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import {
  linkedLoginProviderSchema,
  type LinkedLoginProviderType,
  type LinkedLoginType
} from '@schemas/LinkedLoginSchema';
import type { LinkedLoginServiceInterface } from '@server/interfaces/LinkedLoginServiceInterface';
import {
  FeOauthUserLinksRepository,
  type FeOauthUserLinkRow
} from '@server/repositorys/FeOauthUserLinksRepository';
import type { UserIdentity } from '@supabase/supabase-js';

function pickIdentityAccount(identity: UserIdentity): string | null {
  const data = identity.identity_data ?? {};
  for (const key of ['user_name', 'preferred_username', 'email', 'name']) {
    const value = data[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function pickLinkAccount(row: FeOauthUserLinkRow): string | null {
  const extra = row.extra ?? {};
  for (const key of ['account', 'user_name', 'preferred_username', 'email', 'name']) {
    const value = extra[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  const external = row.external_user_id?.trim();
  return external || null;
}

function pickLinkEnv(row: FeOauthUserLinkRow): string | null {
  const env = row.extra?.env;
  return typeof env === 'string' && env.trim() ? env.trim() : null;
}

/**
 * 列出第三方登录：Auth identities（github/google）+ fe_oauth_user_links（brain 等）。
 */
@injectable()
export class LinkedLoginService implements LinkedLoginServiceInterface {
  constructor(
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>,
    @inject(FeOauthUserLinksRepository)
    protected readonly linksRepository: FeOauthUserLinksRepository
  ) {}

  /**
   * @override
   */
  public async listForUser(userId: string): Promise<LinkedLoginType[]> {
    const [linkRows, authIdentities] = await Promise.all([
      this.linksRepository.listByAuthUserId(userId),
      this.listAuthIdentities(userId)
    ]);

    const fromLinks = this.mapLinkRows(linkRows);
    const fromAuth = this.mapAuthIdentities(authIdentities);

    return this.mergeUnique([...fromLinks, ...fromAuth]);
  }

  protected mapLinkRows(rows: FeOauthUserLinkRow[]): LinkedLoginType[] {
    const items: LinkedLoginType[] = [];
    for (const row of rows) {
      const parsed = linkedLoginProviderSchema.safeParse(row.provider);
      if (!parsed.success) {
        continue;
      }
      items.push({
        provider: parsed.data,
        account: pickLinkAccount(row),
        env: pickLinkEnv(row),
        linked_at: row.created_at ?? null,
        last_login_at: row.updated_at ?? null
      });
    }
    return items;
  }

  protected mapAuthIdentities(identities: UserIdentity[]): LinkedLoginType[] {
    const items: LinkedLoginType[] = [];
    for (const identity of identities) {
      const parsed = linkedLoginProviderSchema.safeParse(identity.provider);
      // Auth 侧不展示 brain（由 links 表承担）；过滤 email/phone 等非社交。
      if (!parsed.success || parsed.data === 'brain') {
        continue;
      }
      items.push({
        provider: parsed.data,
        account: pickIdentityAccount(identity),
        env: null,
        linked_at: identity.created_at ?? null,
        last_login_at: identity.last_sign_in_at ?? null
      });
    }
    return items;
  }

  /**
   * 同 provider + account + env 只保留一条（links 优先于 Auth，因已排在前面）。
   */
  protected mergeUnique(items: LinkedLoginType[]): LinkedLoginType[] {
    const seen = new Set<string>();
    const result: LinkedLoginType[] = [];
    for (const item of items) {
      const key = this.identityKey(item.provider, item.account, item.env);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(item);
    }
    return result;
  }

  protected identityKey(
    provider: LinkedLoginProviderType,
    account: string | null,
    env: string | null
  ): string {
    return `${provider}\0${env ?? ''}\0${account ?? ''}`;
  }

  protected async listAuthIdentities(userId: string): Promise<UserIdentity[]> {
    try {
      const admin = this.supabaseBridge.getAdminSupabase();
      const result = await admin.auth.admin.getUserById(userId);
      if (result.error || !result.data.user) {
        return [];
      }
      return result.data.user.identities ?? [];
    } catch {
      // 非 Supabase 环境或缺配置：仅依赖 links。
      return [];
    }
  }
}
