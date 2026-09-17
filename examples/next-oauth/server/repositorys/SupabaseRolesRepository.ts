import { SupabaseRepo } from '@qlover/next-kit/server';
import { RoleKind } from '@shared/auth/roleKeys';
import { inject, injectable } from '@shared/container';
import { FeTables } from '@config/feTables';
import type {
  AdminPermissionItem,
  AdminRoleItem,
  AdminRolesResponse
} from '@schemas/RoleSchema';

type FePermissionRow = {
  permission_key: string;
  type: string;
  method: string | null;
  path: string | null;
  description: string | null;
};

type FeRoleRow = {
  id: string;
  key: string;
  name: string;
  kind: string;
  description: string | null;
  is_system: boolean;
};

type FeAssignmentRow = {
  role_id: string;
  permission_key: string;
};

/**
 * Supabase-backed platform roles repository (`fe_roles` / `fe_permissions` /
 * `fe_role_assignments`).
 */
@injectable()
export class SupabaseRolesRepository {
  constructor(
    @inject(SupabaseRepo)
    protected readonly supabaseBridge: SupabaseRepo<unknown>
  ) {}

  public async getAssignmentMaps(): Promise<Record<string, string[]>> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const rolesResult = await supabase.from(FeTables.roles).select('id, key');
    this.supabaseBridge.throwIfError(rolesResult);

    const roles = (rolesResult.data ?? []) as Array<{
      id: string;
      key: string;
    }>;
    const idToKey = new Map(roles.map((r) => [r.id, r.key]));

    const assignResult = await supabase
      .from(FeTables.roleAssignments)
      .select('role_id, permission_key');
    this.supabaseBridge.throwIfError(assignResult);

    const maps: Record<string, string[]> = {};
    for (const role of roles) {
      maps[role.key] = [];
    }
    for (const row of (assignResult.data ?? []) as FeAssignmentRow[]) {
      const key = idToKey.get(row.role_id);
      if (!key) continue;
      if (!maps[key]) maps[key] = [];
      maps[key].push(row.permission_key);
    }
    for (const key of Object.keys(maps)) {
      maps[key] = [...new Set(maps[key])].sort();
    }
    return maps;
  }

  public async listView(): Promise<AdminRolesResponse> {
    const supabase = this.supabaseBridge.getAdminSupabase();

    const catalogResult = await supabase
      .from(FeTables.permissions)
      .select('permission_key, type, method, path, description')
      .order('permission_key', { ascending: true });
    this.supabaseBridge.throwIfError(catalogResult);

    const rolesResult = await supabase
      .from(FeTables.roles)
      .select('id, key, name, kind, description, is_system')
      .eq('kind', RoleKind.Platform)
      .order('key', { ascending: true });
    this.supabaseBridge.throwIfError(rolesResult);

    const assignResult = await supabase
      .from(FeTables.roleAssignments)
      .select('role_id, permission_key');
    this.supabaseBridge.throwIfError(assignResult);

    const byRoleId = new Map<string, string[]>();
    for (const row of (assignResult.data ?? []) as FeAssignmentRow[]) {
      const list = byRoleId.get(row.role_id) ?? [];
      list.push(row.permission_key);
      byRoleId.set(row.role_id, list);
    }

    const catalog: AdminPermissionItem[] = (
      (catalogResult.data ?? []) as FePermissionRow[]
    ).map((row) => ({
      permissionKey: row.permission_key,
      type: row.type,
      method: row.method,
      path: row.path,
      description: row.description
    }));

    const roles: AdminRoleItem[] = (
      (rolesResult.data ?? []) as FeRoleRow[]
    ).map((row) => ({
      id: row.id,
      key: row.key,
      name: row.name,
      kind: RoleKind.Platform,
      description: row.description,
      isSystem: row.is_system,
      permissionKeys: [...(byRoleId.get(row.id) ?? [])].sort()
    }));

    return { catalog, roles };
  }

  public async replaceAssignments(
    roleId: string,
    permissionKeys: string[]
  ): Promise<AdminRolesResponse> {
    const supabase = this.supabaseBridge.getAdminSupabase();
    const uniqueKeys = [...new Set(permissionKeys)].sort();

    const roleResult = await supabase
      .from(FeTables.roles)
      .select('id')
      .eq('id', roleId)
      .maybeSingle();
    this.supabaseBridge.throwIfError(roleResult);
    if (!roleResult.data) {
      throw new Error(`Unknown role id: ${roleId}`);
    }

    const deleteResult = await supabase
      .from(FeTables.roleAssignments)
      .delete()
      .eq('role_id', roleId);
    this.supabaseBridge.throwIfError(deleteResult);

    if (uniqueKeys.length > 0) {
      const insertResult = await supabase.from(FeTables.roleAssignments).insert(
        uniqueKeys.map((permission_key) => ({
          role_id: roleId,
          permission_key
        }))
      );
      this.supabaseBridge.throwIfError(insertResult);
    }

    return this.listView();
  }
}
