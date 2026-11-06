/**
 * 多列 ILIKE OR 查询串（PostgREST `.or()`）。
 *
 * 纯字符串拼装，可在 Node / Edge / 浏览器使用。
 */

export type IlikeOrParamsType = {
  readonly columns: readonly string[];
  readonly query: string;
};

/**
 * 转义 ILIKE 通配符并加引号，避免 `%` / `_` / `,` / `"` 破坏 `.or()` 解析。
 */
export function escapeIlikePattern(raw: string): string {
  const escaped = raw
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
  const pattern = `%${escaped}%`;
  return `"${pattern.replace(/"/g, '\\"')}"`;
}

/**
 * 生成 `col.ilike."%kw%",...`。
 *
 * @param params - 列名与关键字；空列名会被过滤
 */
export function buildIlikeOrString(params: IlikeOrParamsType): string {
  const pattern = escapeIlikePattern(params.query);
  return params.columns
    .filter((col) => typeof col === 'string' && col.length > 0)
    .map((col) => `${col}.ilike.${pattern}`)
    .join(',');
}
