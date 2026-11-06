import { createAdminClient } from '@shared/supabase/server';
import { FeTables } from '@config/feTables';
import type { OAuthSessionPayload } from '@qlover/oauth-wrapper';

/**
 * 会话撤销查询（进程内缓存）。
 *
 * 复用方：`OAuthSessionService`（middleware / getSession，无法走 IOC）
 * 与 `SessionRevokeService`（写入后刷新缓存）。
 */

/** 进程内缓存时长；其它实例最迟在该窗口内感知到撤销。 */
const CACHE_TTL_MS = 30_000;

type CacheEntryType = {
  readonly revokedAtMs: number | null;
  readonly expires: number;
};

const cache = new Map<string, CacheEntryType>();

/** 写入（或刷新）某用户的撤销时间缓存。 */
export function setSessionsRevokedCache(
  userId: string,
  revokedAtMs: number | null
): void {
  cache.set(userId, { revokedAtMs, expires: Date.now() + CACHE_TTL_MS });
}

/**
 * 读取 `fe_users.sessions_revoked_at`（毫秒时间戳）。
 * 查询失败（例如尚未执行迁移加列）时放行，返回 null。
 */
export async function getSessionsRevokedAtMs(
  userId: string
): Promise<number | null> {
  const cached = cache.get(userId);
  if (cached && cached.expires > Date.now()) {
    return cached.revokedAtMs;
  }

  let raw: string | null | undefined;
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(FeTables.users)
      .select('sessions_revoked_at')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return null;
    }
    raw = (data as { sessions_revoked_at?: string | null } | null)
      ?.sessions_revoked_at;
  } catch {
    // 缺少 Supabase 环境变量等配置问题：放行，由其它链路报错。
    return null;
  }
  const parsed = raw ? Date.parse(raw) : Number.NaN;
  const revokedAtMs = Number.isFinite(parsed) ? parsed : null;
  setSessionsRevokedCache(userId, revokedAtMs);
  return revokedAtMs;
}

/** 会话 JWT 的签发时间早于用户最近一次「撤销所有会话」时返回 true。 */
export async function isSessionPayloadRevoked(
  payload: OAuthSessionPayload
): Promise<boolean> {
  const withMeta = payload as OAuthSessionPayload & {
    iat?: number;
    user?: { id?: string };
  };
  const userId = String(withMeta.userId ?? withMeta.user?.id ?? '');
  if (!userId || typeof withMeta.iat !== 'number') {
    return false;
  }
  const revokedAtMs = await getSessionsRevokedAtMs(userId);
  return revokedAtMs !== null && withMeta.iat * 1000 < revokedAtMs;
}
