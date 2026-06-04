import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { LoggerInterface } from '@qlover/logger';
import { SupabaseBridge } from '@server/repositorys/SupabaseBridge';
import { UserSchema } from '@schemas/UserSchema';

export type VerifyLoginParams = {
  email: string;
  password: string;
};

/**
 * Demo app login: provider credentials → session cookie → persisted provider tokens.
 */
@injectable()
export class OAuthService {
  @inject(I.Logger)
  protected logger!: LoggerInterface;

  @inject(I.AppConfig)
  protected config!: SeedServerConfigInterface;

  @inject(SupabaseBridge)
  protected supabaseBridge!: SupabaseBridge;

  constructor() {}

  public async verifyLogin(params: VerifyLoginParams): Promise<UserSchema> {
    const supabase = await this.supabaseBridge.getSupabase();

    const result = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password
    });

    this.supabaseBridge.throwIfError(result);

    return this.supabaseBridge.toUserSchema(result.data.user!);
  }
}
