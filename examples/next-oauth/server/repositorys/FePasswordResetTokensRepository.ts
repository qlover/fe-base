import { createHash, randomBytes } from 'node:crypto';
import { SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { FeTables } from '@config/feTables';

/** `fe_password_reset_tokens` 表行。 */
export type FePasswordResetTokenRow = {
  id: string;
  user_id: string;
  email: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_ip: string | null;
  created_at: string;
};

/** 生成发给用户的明文令牌（32 字节随机，base64url）。 */
export function generatePasswordResetToken(): string {
  return randomBytes(32).toString('base64url');
}

/** 令牌哈希（SHA-256 hex）；库里只存哈希。 */
export function hashPasswordResetToken(token: string): string {
  return createHash('sha256').update(token.trim()).digest('hex');
}

/**
 * `fe_password_reset_tokens` 数据访问：写入、按哈希查询、单次消费与批量作废。
 */
@injectable()
export class FePasswordResetTokensRepository {
  constructor(
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>
  ) {}

  /** 写入一条新令牌（仅存哈希）。 */
  public async insert(input: {
    userId: string;
    email: string;
    tokenHash: string;
    expiresAt: string;
    createdIp?: string | null;
  }): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase.from(FeTables.passwordResetTokens).insert({
      user_id: input.userId,
      email: input.email,
      token_hash: input.tokenHash,
      expires_at: input.expiresAt,
      created_ip: input.createdIp ?? null
    });
    this.supabaseBridge.throwIfError(result);
  }

  /** 按令牌哈希查询。 */
  public async findByHash(
    tokenHash: string
  ): Promise<FePasswordResetTokenRow | null> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.passwordResetTokens)
      .select('*')
      .eq('token_hash', tokenHash)
      .maybeSingle();
    this.supabaseBridge.throwIfError(result);
    return (result.data as FePasswordResetTokenRow | null) ?? null;
  }

  /** 原子消费未使用的令牌；已被使用则返回 false。 */
  public async markUsed(id: string): Promise<boolean> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.passwordResetTokens)
      .update({ used_at: new Date().toISOString() })
      .eq('id', id)
      .is('used_at', null)
      .select('id');
    this.supabaseBridge.throwIfError(result);
    return ((result.data as unknown[] | null) ?? []).length > 0;
  }

  /** 作废某用户所有未使用的令牌（重置成功后调用）。 */
  public async invalidateUnusedForUser(userId: string): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.passwordResetTokens)
      .update({ used_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('used_at', null);
    this.supabaseBridge.throwIfError(result);
  }
}
