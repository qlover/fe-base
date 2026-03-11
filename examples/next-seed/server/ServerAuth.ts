import { ExecutorError } from '@qlover/fe-corekit';
import { cookies } from 'next/headers';
import { inject, injectable } from '@shared/container';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { UserSchema } from '@schemas/UserSchema';
import { SupabaseBridge } from './SupabaseBridge';
import type { ServerAuthInterface } from './interfaces/ServerAuthInterface';
import type { SeedServerConfigInterface } from '@qlover/corekit-bridge/bootstrap';

@injectable()
export class ServerAuth implements ServerAuthInterface {
  protected userTokenKey: string;
  constructor(
    @inject(I.AppConfig) protected server: SeedServerConfigInterface,
    @inject(SupabaseBridge) protected supabase: SupabaseBridge
  ) {
    this.userTokenKey = server.userTokenKey;
  }

  /**
   * @override
   */
  public async setAuth(credential_token: string): Promise<void> {
    const cookieStore = await cookies();

    cookieStore.set(this.userTokenKey, credential_token);
  }

  /**
   * @override
   */
  public async hasAuth(): Promise<boolean> {
    const supabase = await this.supabase.getSupabase();

    const { data } = await supabase.auth.getClaims();

    return !!data?.claims;
  }

  /**
   * @override
   */
  public async getAuth(): Promise<string> {
    const cookieStore = await cookies();
    return cookieStore.get(this.userTokenKey)?.value || '';
  }

  /**
   * @override
   */
  public async clear(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(this.userTokenKey);
  }

  /**
   * @override
   */
  public async throwIfNotAuth(): Promise<void> {
    const hasAuth = await this.hasAuth();

    if (!hasAuth) {
      throw new ExecutorError(API_NOT_AUTHORIZED, 'Not authorized');
    }
  }

  /**
   * @override
   */
  public async getUser(): Promise<UserSchema | null> {
    const supabase = await this.supabase.getSupabase();

    const { data } = await supabase.auth.getUser();

    return data.user ? this.supabase.toUserSchema(data.user) : null;
  }
}
