import { UserRole, type UserRoleType } from '@qlover/next-kit/common';
import { buildIlikeOrString } from '@qlover/next-kit/common';
import { SupabaseRepo } from '@qlover/next-kit/server';
import {
  PlatformRoleKey,
  type PlatformRoleKeyType
} from '@shared/auth/roleKeys';
import {
  normalizeSystemRole,
  type SystemRoleType
} from '@shared/auth/systemRole';
import { inject, injectable } from '@shared/container';
import { normalizePhoneE164 } from '@shared/utils/phoneUserIdentity';
import { FeTables } from '@config/feTables';

/**
 * Phone lookup candidates: E.164 and legacy digits-only rows from older dumps.
 */
function phoneLookupCandidates(phone: string): string[] {
  const e164 = normalizePhoneE164(phone);
  const digits = (e164 || phone).replace(/\D/g, '');
  return Array.from(
    new Set(
      [e164, digits, digits ? `+${digits}` : '', phone.trim()].filter(
        (value) => value.length > 0
      )
    )
  );
}

function normalizeStoredPhone(phone: string | null | undefined): string | null {
  if (phone == null) {
    return null;
  }
  const trimmed = phone.trim();
  if (!trimmed) {
    return null;
  }
  return normalizePhoneE164(trimmed) || trimmed;
}

export type FeUserRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  phone: string | null;
  role_id: string;
  status: 'active' | 'suspended';
  /** 早于该时间签发的会话 JWT 视为失效（重置密码后写入）。 */
  sessions_revoked_at?: string | null;
  created_at: string;
  updated_at: string;
};

export type FeUserUpsertInput = {
  readonly id: string;
  readonly email?: string | null;
  readonly displayName?: string | null;
  readonly phone?: string | null;
  /** Seed role on first insert only (never overwrites existing role_id). */
  readonly defaultRoleKey?: PlatformRoleKeyType;
};

@injectable()
export class FeUsersRepository {
  constructor(
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>
  ) {}

  public async findById(id: string): Promise<FeUserRow | null> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.users)
      .select('*')
      .eq('id', id)
      .maybeSingle();
    this.supabaseBridge.throwIfError(result);
    return (result.data as FeUserRow | null) ?? null;
  }

  /** 按业务邮箱（小写归一）查询资料行。 */
  public async findByEmail(email: string): Promise<FeUserRow | null> {
    const normalized = normalizeEmail(email);
    if (!normalized) {
      return null;
    }
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.users)
      .select('*')
      .eq('email', normalized)
      .maybeSingle();
    this.supabaseBridge.throwIfError(result);
    return (result.data as FeUserRow | null) ?? null;
  }

  /** 写入「撤销所有会话」时间点（ISO）。 */
  public async setSessionsRevokedAt(
    userId: string,
    revokedAtIso: string
  ): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.users)
      .update({ sessions_revoked_at: revokedAtIso })
      .eq('id', userId);
    this.supabaseBridge.throwIfError(result);
  }

  /**
   * 自助修改显示名（窄更新，不改其它资料字段）。
   *
   * @param userId - 用户 id
   * @param displayName - 已通过 DisplayNameSchema 校验的展示名
   */
  public async updateDisplayName(
    userId: string,
    displayName: string
  ): Promise<FeUserRow> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.users)
      .update({
        display_name: displayName,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('*')
      .single();
    this.supabaseBridge.throwIfError(result);
    return result.data as FeUserRow;
  }

  public async findByPhone(phone: string): Promise<FeUserRow | null> {
    const candidates = phoneLookupCandidates(phone);
    if (candidates.length === 0) {
      return null;
    }
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.users)
      .select('*')
      .in('phone', candidates)
      .limit(2);
    this.supabaseBridge.throwIfError(result);
    const rows = (result.data as FeUserRow[] | null) ?? [];
    if (rows.length === 0) {
      return null;
    }
    const e164 = normalizePhoneE164(phone);
    const preferred =
      rows.find((row) => row.phone === e164) ??
      rows.find((row) => row.phone?.startsWith('+')) ??
      rows[0];
    return preferred;
  }

  public async getSystemRoleKey(
    userId: string
  ): Promise<SystemRoleType | null> {
    const profile = await this.findById(userId);
    if (!profile?.role_id) {
      return null;
    }
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.roles)
      .select('key')
      .eq('id', profile.role_id)
      .maybeSingle();
    this.supabaseBridge.throwIfError(result);
    const key = (result.data as { key: string } | null)?.key;
    return key ? normalizeSystemRole(key) : null;
  }

  public async requireRoleIdByKey(key: PlatformRoleKeyType): Promise<string> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.roles)
      .select('id')
      .eq('key', key)
      .maybeSingle();
    this.supabaseBridge.throwIfError(result);
    const id = (result.data as { id: string } | null)?.id;
    if (!id) {
      throw new Error(`Unknown fe_roles.key: ${key}`);
    }
    return id;
  }

  /**
   * Upsert profile fields; never clears an existing role_id.
   * First insert defaults to `user` (or {@link FeUserUpsertInput.defaultRoleKey}).
   */
  public async ensureProfile(input: FeUserUpsertInput): Promise<FeUserRow> {
    const existing = await this.findById(input.id);
    const supabase = this.supabaseBridge.getAdminSupabase();

    if (existing) {
      const nextEmail =
        input.email !== undefined
          ? normalizeEmail(input.email)
          : existing.email;
      const nextDisplayName =
        input.displayName !== undefined
          ? input.displayName
          : existing.display_name;
      const nextPhone =
        input.phone !== undefined
          ? normalizeStoredPhone(input.phone)
          : normalizeStoredPhone(existing.phone);

      const result = await supabase
        .from(FeTables.users)
        .update({
          email: nextEmail,
          display_name: nextDisplayName,
          phone: nextPhone,
          updated_at: new Date().toISOString()
        })
        .eq('id', input.id)
        .select('*')
        .single();
      this.supabaseBridge.throwIfError(result);
      return result.data as FeUserRow;
    }

    const roleKey = input.defaultRoleKey ?? PlatformRoleKey.User;
    const roleId = await this.requireRoleIdByKey(roleKey);

    const result = await supabase
      .from(FeTables.users)
      .insert({
        id: input.id,
        email: normalizeEmail(input.email ?? null),
        display_name: input.displayName ?? null,
        phone: normalizeStoredPhone(input.phone),
        role_id: roleId,
        status: 'active'
      })
      .select('*')
      .single();
    this.supabaseBridge.throwIfError(result);
    return result.data as FeUserRow;
  }

  public async setSystemRole(
    userId: string,
    systemRole: SystemRoleType
  ): Promise<FeUserRow> {
    const roleId = await this.requireRoleIdByKey(
      normalizeSystemRole(systemRole)
    );
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.users)
      .update({
        role_id: roleId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('*')
      .single();
    this.supabaseBridge.throwIfError(result);
    return result.data as FeUserRow;
  }

  /**
   * 窄更新邮箱 / 手机 / 显示名（绑邮箱与合并账户用）。
   * 传入的字段才写入；`undefined` 表示不动。
   */
  public async updateEmailAndPhone(params: {
    readonly userId: string;
    readonly email?: string | null;
    readonly phone?: string | null;
    readonly displayName?: string | null;
  }): Promise<FeUserRow> {
    const patch: Record<string, string | null> = {
      updated_at: new Date().toISOString()
    };
    if (params.email !== undefined) {
      patch.email = normalizeEmail(params.email);
    }
    if (params.phone !== undefined) {
      patch.phone = params.phone;
    }
    if (params.displayName !== undefined) {
      patch.display_name = params.displayName;
    }
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.users)
      .update(patch)
      .eq('id', params.userId)
      .select('*')
      .single();
    this.supabaseBridge.throwIfError(result);
    return result.data as FeUserRow;
  }

  /** 删除 `fe_users` 行（合并后清理手机号侧资料）。 */
  public async deleteById(userId: string): Promise<void> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const result = await supabase
      .from(FeTables.users)
      .delete()
      .eq('id', userId);
    this.supabaseBridge.throwIfError(result);
  }

  /**
   * Admin user list from `fe_users` (+ role key). Optional text filter on
   * email / display_name / phone.
   */
  public async searchForAdmin(params: {
    query?: string;
    limit?: number;
    offset?: number;
  }): Promise<
    Array<{
      id: string;
      email: string | null;
      phone: string | null;
      displayName: string | null;
      systemRole: SystemRoleType;
      status: 'active' | 'suspended';
      createdAt: string;
    }>
  > {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 50);
    const offset = Math.max(params.offset ?? 0, 0);
    const q = params.query?.trim() ?? '';

    const supabase = this.supabaseBridge.getAdminSupabase();
    let builder = supabase
      .from(FeTables.users)
      .select('id, email, phone, display_name, role_id, status, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (q.length > 0) {
      builder = builder.or(
        buildIlikeOrString({
          columns: ['email', 'display_name', 'phone'],
          query: q
        })
      );
    }

    const result = await builder;
    this.supabaseBridge.throwIfError(result);
    const rows = (result.data ?? []) as Array<{
      id: string;
      email: string | null;
      phone: string | null;
      display_name: string | null;
      role_id: string;
      status: string;
      created_at: string;
    }>;

    if (rows.length === 0) {
      return [];
    }

    const roleIds = [...new Set(rows.map((row) => row.role_id))];
    const rolesResult = await supabase
      .from(FeTables.roles)
      .select('id, key')
      .in('id', roleIds);
    this.supabaseBridge.throwIfError(rolesResult);
    const keyById = new Map(
      ((rolesResult.data ?? []) as Array<{ id: string; key: string }>).map(
        (row) => [row.id, row.key]
      )
    );

    return rows.map((row) => ({
      id: row.id,
      email: row.email,
      phone: row.phone,
      displayName: row.display_name,
      systemRole: normalizeSystemRole(keyById.get(row.role_id)),
      status: row.status === 'suspended' ? 'suspended' : 'active',
      createdAt: row.created_at
    }));
  }
}

/** Map next-kit UserRole → default platform key for first fe_users insert. */
export function defaultPlatformRoleFromUserRole(
  role: UserRoleType
): PlatformRoleKeyType {
  return role === UserRole.ADMIN ? PlatformRoleKey.Admin : PlatformRoleKey.User;
}

function normalizeEmail(email: string | null | undefined): string | null {
  if (email == null) return null;
  const trimmed = email.trim();
  return trimmed.length > 0 ? trimmed.toLowerCase() : null;
}
