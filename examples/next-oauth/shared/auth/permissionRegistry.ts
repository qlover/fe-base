/**
 * In-memory role_key → permission_key maps.
 * Hydrated from SupabaseRolesRepository (`fe_*` tables).
 */

import { DEFAULT_SYSTEM_ROLE_PERMISSIONS } from './permissionDefaults';

type StringMap = Record<string, readonly string[]>;

let roleMaps: StringMap | null = null;

export function setPermissionMaps(input: { roles: StringMap }): void {
  roleMaps = { ...input.roles };
}

export function clearPermissionMaps(): void {
  roleMaps = null;
}

export function arePermissionMapsLoaded(): boolean {
  return roleMaps != null;
}

export function resolveRolePermissions(roleKey: string): readonly string[] {
  if (roleMaps?.[roleKey]) {
    return roleMaps[roleKey];
  }
  return DEFAULT_SYSTEM_ROLE_PERMISSIONS[roleKey] ?? [];
}

export function resolveSystemPermissions(role: string): readonly string[] {
  return resolveRolePermissions(role);
}

export function defaultRoleMaps(): Record<string, string[]> {
  const maps: Record<string, string[]> = {};
  for (const [key, keys] of Object.entries(DEFAULT_SYSTEM_ROLE_PERMISSIONS)) {
    maps[key] = [...keys];
  }
  return maps;
}
