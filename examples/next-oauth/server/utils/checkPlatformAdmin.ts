import {
  isPlatformAdminRole,
  normalizeSystemRole
} from '@shared/auth/systemRole';
import { FeTables } from '@config/feTables';
import { createAdminClient } from '@shared/supabase/server';
import {
  getPlatformAdminCache,
  resolvePlatformAdminFromDb,
  setPlatformAdminCache
} from '@server/utils/platformAdminCache';

/**
 * 按 `fe_users.role_id` → `fe_roles.key` 判定是否平台管理员（无 IOC，供 middleware）。
 */
export async function checkPlatformAdmin(userId: string): Promise<boolean> {
  const cached = getPlatformAdminCache(userId);
  if (cached !== undefined) {
    return cached;
  }

  return resolvePlatformAdminFromDb(userId, async (id) => {
    try {
      const supabase = createAdminClient();
      const userResult = await supabase
        .from(FeTables.users)
        .select('role_id')
        .eq('id', id)
        .maybeSingle();
      if (userResult.error || !userResult.data) {
        return false;
      }
      const roleId = (userResult.data as { role_id?: string }).role_id;
      if (!roleId) {
        return false;
      }
      const roleResult = await supabase
        .from(FeTables.roles)
        .select('key')
        .eq('id', roleId)
        .maybeSingle();
      if (roleResult.error) {
        return false;
      }
      const key = (roleResult.data as { key?: string } | null)?.key;
      const value = isPlatformAdminRole(normalizeSystemRole(key));
      setPlatformAdminCache(id, value);
      return value;
    } catch {
      return false;
    }
  });
}
