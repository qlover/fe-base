import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { SupabaseRepo } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { FeTables } from '@config/feTables';
import type {
  FePhoneOtpRow,
  PhoneOtpAdminItem,
  PhoneOtpProviderName,
  PhoneOtpStatus
} from '@schemas/PhoneOtpSchema';

export function hashPhoneOtpCode(code: string): string {
  return createHash('sha256').update(code.trim()).digest('hex');
}

export function generatePhoneOtpCode(length = 6): string {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, '0');
}

export function safeEqualOtp(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a.trim());
  const right = new TextEncoder().encode(b.trim());
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}

function mapAdminItem(row: FePhoneOtpRow): PhoneOtpAdminItem {
  return {
    id: row.id,
    phone: row.phone,
    code: row.code_plain,
    provider: row.provider,
    status: row.status,
    attempts: row.attempts,
    maxAttempts: row.max_attempts,
    expiresAt: row.expires_at,
    verifiedAt: row.verified_at ?? null,
    createdIp: row.created_ip ?? null,
    createdAt: row.created_at
  };
}

@injectable()
export class FePhoneOtpsRepository {
  constructor(
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>
  ) {}

  public async insert(input: {
    phone: string;
    codeHash: string;
    codePlain: string | null;
    provider: PhoneOtpProviderName;
    expiresAt: string;
    createdIp?: string | null;
    maxAttempts?: number;
  }): Promise<FePhoneOtpRow> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.phoneOtps)
      .insert({
        phone: input.phone,
        code_hash: input.codeHash,
        code_plain: input.codePlain,
        provider: input.provider,
        status: 'pending',
        expires_at: input.expiresAt,
        created_ip: input.createdIp ?? null,
        max_attempts: input.maxAttempts ?? 5
      })
      .select('*')
      .single();
    this.supabaseBridge.throwIfError(result);
    return result.data as FePhoneOtpRow;
  }

  public async revokePendingByPhone(phone: string): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.phoneOtps)
      .update({ status: 'revoked' satisfies PhoneOtpStatus })
      .eq('phone', phone)
      .eq('status', 'pending');
    this.supabaseBridge.throwIfError(result);
  }

  public async findLatestPending(phone: string): Promise<FePhoneOtpRow | null> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.phoneOtps)
      .select('*')
      .eq('phone', phone)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    this.supabaseBridge.throwIfError(result);
    return (result.data as FePhoneOtpRow | null) ?? null;
  }

  public async findLatestSendAt(phone: string): Promise<string | null> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.phoneOtps)
      .select('created_at')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    this.supabaseBridge.throwIfError(result);
    return (result.data as { created_at: string } | null)?.created_at ?? null;
  }

  public async markVerified(id: string): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.phoneOtps)
      .update({
        status: 'verified' satisfies PhoneOtpStatus,
        verified_at: new Date().toISOString()
      })
      .eq('id', id);
    this.supabaseBridge.throwIfError(result);
  }

  public async markExpired(id: string): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.phoneOtps)
      .update({ status: 'expired' satisfies PhoneOtpStatus })
      .eq('id', id);
    this.supabaseBridge.throwIfError(result);
  }

  public async incrementAttempts(
    id: string,
    attempts: number,
    maxAttempts = 5
  ): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const nextStatus: PhoneOtpStatus | undefined =
      attempts >= maxAttempts ? 'revoked' : undefined;
    const result = await supabase
      .from(FeTables.phoneOtps)
      .update({
        attempts,
        ...(nextStatus ? { status: nextStatus } : {})
      })
      .eq('id', id);
    this.supabaseBridge.throwIfError(result);
  }

  public async listRecent(params: {
    limit?: number;
    phone?: string;
  }): Promise<PhoneOtpAdminItem[]> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const limit = Math.min(Math.max(params.limit ?? 80, 1), 200);
    let query = supabase
      .from(FeTables.phoneOtps)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    const phone = params.phone?.trim();
    if (phone) {
      query = query.ilike('phone', `%${phone}%`);
    }
    const result = await query;
    this.supabaseBridge.throwIfError(result);
    return ((result.data ?? []) as FePhoneOtpRow[]).map(mapAdminItem);
  }
}
