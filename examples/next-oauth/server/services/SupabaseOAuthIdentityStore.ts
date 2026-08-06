import { SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import { oauthLocalUserConfig } from '@config/oauthLocalUser';
import type { LoggerInterface } from '@qlover/logger';
import type {
  OAuthIdentityEmailUser,
  OAuthIdentityStore,
  OAuthLocalUserDraft
} from '@qlover/oauth-wrapper';
import type { User } from '@supabase/supabase-js';

type AuthUserRow = {
  id: string;
  email: string | null;
  raw_app_meta_data?: Record<string, unknown> | null;
};

/**
 * Supabase-backed CRUD for oauth-wrapper local identity linking.
 * Orchestration (find-or-create) lives in OAuthWrapperService.ensureLocalUser.
 */
@injectable()
export class SupabaseOAuthIdentityStore implements OAuthIdentityStore {
  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(SupabaseRepo)
    protected readonly supabaseRepo: SupabaseRepo<unknown>
  ) {}

  /**
   * @override
   */
  public async findAuthUserIdByExternalId(
    provider: string,
    externalUserId: string
  ): Promise<string | null> {
    const supabase = await this.supabaseRepo.getAdminSupabase();
    const { data, error } = await supabase
      .from(oauthLocalUserConfig.linksTable)
      .select('auth_user_id')
      .eq('provider', provider)
      .eq('external_user_id', externalUserId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Failed to lookup ${oauthLocalUserConfig.linksTable}: ${error.message}`
      );
    }

    return data?.auth_user_id ? String(data.auth_user_id) : null;
  }

  /**
   * @override
   */
  public async findByEmail(
    email: string
  ): Promise<OAuthIdentityEmailUser | null> {
    const user = await this.findAuthUserByEmail(email);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      externalUserId: this.readExternalUserId(user) ?? null
    };
  }

  /**
   * @override
   */
  public async createUser(
    draft: OAuthLocalUserDraft & { email: string; name: string }
  ): Promise<string> {
    const supabase = await this.supabaseRepo.getAdminSupabase();
    const phone = draft.phone?.trim() || undefined;

    const { data, error } = await supabase.auth.admin.createUser({
      email: draft.email,
      email_confirm: true,
      phone,
      phone_confirm: Boolean(phone),
      app_metadata: {
        provider: draft.provider,
        external_user_id: draft.externalUserId
      },
      user_metadata: {
        name: draft.name,
        ...(draft.extra ? { extra: draft.extra } : {})
      }
    });

    if (error || !data.user) {
      if (error?.message?.toLowerCase().includes('already')) {
        const existing = await this.findAuthUserByEmail(draft.email);
        if (existing) {
          const existingExternalId = this.readExternalUserId(
            existing,
            draft.provider
          );
          if (
            existingExternalId &&
            existingExternalId !== draft.externalUserId
          ) {
            throw new Error(
              `Email ${draft.email} is already linked to a different ${draft.provider} user`
            );
          }
          return existing.id;
        }
      }
      throw (
        error ?? new Error('Failed to create auth.users for external login')
      );
    }

    return data.user.id;
  }

  /**
   * @override
   */
  public async upsertLink(
    authUserId: string,
    draft: OAuthLocalUserDraft & { name: string }
  ): Promise<void> {
    const supabase = await this.supabaseRepo.getAdminSupabase();
    const { error } = await supabase
      .from(oauthLocalUserConfig.linksTable)
      .upsert(
        {
          auth_user_id: authUserId,
          provider: draft.provider,
          external_user_id: draft.externalUserId,
          extra: draft.extra ?? null,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'auth_user_id' }
      );

    if (error) {
      throw new Error(
        `Failed to upsert ${oauthLocalUserConfig.linksTable}: ${error.message}`
      );
    }
  }

  /**
   * @override
   */
  public async refreshMetadata(
    authUserId: string,
    draft: OAuthLocalUserDraft & { name: string; email: string | null }
  ): Promise<void> {
    const supabase = await this.supabaseRepo.getAdminSupabase();
    const { error } = await supabase.auth.admin.updateUserById(authUserId, {
      app_metadata: {
        provider: draft.provider,
        external_user_id: draft.externalUserId
      },
      user_metadata: {
        name: draft.name,
        ...(draft.email ? { email: draft.email } : {}),
        ...(draft.extra ? { extra: draft.extra } : {})
      }
    });

    if (error) {
      this.logger.warn('Failed to refresh auth.users metadata', {
        authUserId,
        error: error.message
      });
    }
  }

  protected readExternalUserId(
    user: User | AuthUserRow,
    provider?: string
  ): string | undefined {
    const meta =
      'app_metadata' in user && user.app_metadata
        ? user.app_metadata
        : ((user as AuthUserRow).raw_app_meta_data ?? {});
    if (
      provider &&
      meta.provider != null &&
      String(meta.provider) !== provider
    ) {
      return undefined;
    }
    const value = meta.external_user_id ?? meta.brain_user_id;
    return value != null ? String(value) : undefined;
  }

  protected async findAuthUserByEmail(email: string): Promise<User | null> {
    const supabase = await this.supabaseRepo.getAdminSupabase();

    const { data, error } = await supabase
      .schema('auth')
      .from('users')
      .select('id, email, raw_app_meta_data')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      this.logger.warn(
        'auth.users email lookup via schema failed, falling back to listUsers',
        { error: error.message }
      );
      return this.findAuthUserByEmailViaList(email);
    }

    if (!data) {
      return null;
    }

    const row = data as AuthUserRow;
    return {
      id: row.id,
      email: row.email ?? email,
      app_metadata: row.raw_app_meta_data ?? {}
    } as User;
  }

  protected async findAuthUserByEmailViaList(
    email: string
  ): Promise<User | null> {
    const supabase = await this.supabaseRepo.getAdminSupabase();
    const normalized = email.toLowerCase();
    let page = 1;
    const perPage = 200;

    for (;;) {
      const { data, error } = await supabase.auth.admin.listUsers({
        page,
        perPage
      });
      if (error) {
        throw new Error(`listUsers failed: ${error.message}`);
      }
      const users = data.users ?? [];
      const match = users.find(
        (user) => user.email?.toLowerCase() === normalized
      );
      if (match) {
        return match;
      }
      if (users.length < perPage) {
        return null;
      }
      page += 1;
    }
  }
}
