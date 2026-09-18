/**
 * Flat platform role keys (template).
 * Maps to next-kit UserRole: ADMIN → admin, USER → user.
 */

export const RoleKind = {
  Platform: 'platform'
} as const;

export type RoleKindType = (typeof RoleKind)[keyof typeof RoleKind];

export const PlatformRoleKey = {
  User: 'user',
  Operator: 'operator',
  Admin: 'admin'
} as const;

export type PlatformRoleKeyType =
  (typeof PlatformRoleKey)[keyof typeof PlatformRoleKey];

export function isPlatformRoleKey(
  value: unknown
): value is PlatformRoleKeyType {
  return (
    value === PlatformRoleKey.User ||
    value === PlatformRoleKey.Operator ||
    value === PlatformRoleKey.Admin
  );
}

/** Stable seed UUIDs for in-memory roles (never hardcode in product DB logic). */
export const PLATFORM_ROLE_SEED_IDS = {
  [PlatformRoleKey.User]: '00000000-0000-4000-8000-000000000001',
  [PlatformRoleKey.Operator]: '00000000-0000-4000-8000-000000000002',
  [PlatformRoleKey.Admin]: '00000000-0000-4000-8000-000000000003'
} as const;
