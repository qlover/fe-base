/**
 * 后台锚点直达：元素 id 即锚点，地址为 `<path>?<query>#<anchor>`。
 */

/**
 * @param path - 不含语言前缀的站内路径
 * @param anchor - 锚点 id；为空时不带 hash
 * @param query - 附加查询参数
 */
export function buildAdminAnchorHref(
  path: string,
  anchor?: string,
  query?: Readonly<Record<string, string | undefined>>
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value) {
      params.set(key, value);
    }
  }
  const search = params.toString();
  const hash = anchor ? `#${encodeURIComponent(anchor)}` : '';
  return `${path}${search ? `?${search}` : ''}${hash}`;
}

/**
 * @returns 地址栏 hash 对应的锚点（已解码）；无 hash 时为空串
 */
export function readAdminAnchor(hash: string): string {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
