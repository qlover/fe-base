import {
  isPlatformAdminRole,
  type SystemRoleType
} from '@shared/auth/systemRole';

const CACHE_TTL_MS = 30_000;

type CacheEntry = {
  value: boolean;
  systemRole?: SystemRoleType;
  expires: number;
};

const cache = new Map<string, CacheEntry>();

export function getPlatformAdminCache(userId: string): boolean | undefined {
  const entry = cache.get(userId);
  if (!entry) {
    return undefined;
  }
  if (entry.expires <= Date.now()) {
    cache.delete(userId);
    return undefined;
  }
  return entry.value;
}

export function setPlatformAdminCache(
  userId: string,
  isPlatformAdmin: boolean,
  systemRole?: SystemRoleType
): void {
  const prev = cache.get(userId);
  cache.set(userId, {
    value: isPlatformAdmin,
    systemRole: systemRole ?? prev?.systemRole,
    expires: Date.now() + CACHE_TTL_MS
  });
}

/**
 * Middleware 安全的平台管理员查询（无 IOC）。
 */
export async function resolvePlatformAdminFromDb(
  userId: string,
  lookup: (id: string) => Promise<boolean>
): Promise<boolean> {
  const cached = getPlatformAdminCache(userId);
  if (cached !== undefined) {
    return cached;
  }
  const value = await lookup(userId);
  setPlatformAdminCache(userId, value);
  return value;
}

export function invalidatePlatformAdminCache(userId?: string): void {
  if (userId) {
    cache.delete(userId);
    return;
  }
  cache.clear();
}

export function setSystemRoleCache(
  userId: string,
  systemRole: SystemRoleType
): void {
  cache.set(userId, {
    value: isPlatformAdminRole(systemRole),
    systemRole,
    expires: Date.now() + CACHE_TTL_MS
  });
}
