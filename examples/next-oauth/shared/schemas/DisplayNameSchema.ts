import { z } from 'zod';

/**
 * 显示名：1–32 个 Unicode 字母 / 数字 / 下划线（与 PAM 一致）。
 * 不允许空格、标点（`_` 除外）或其它符号。
 */
export const DISPLAY_NAME_PATTERN = /^[\p{L}\p{N}_]{1,32}$/u;

export function isValidDisplayName(value: string): boolean {
  return DISPLAY_NAME_PATTERN.test(value);
}

/** POST /api/user/display-name 请求体。 */
export const displayNameUpdateSchema = z.object({
  display_name: z
    .string()
    .min(1)
    .max(32)
    .regex(DISPLAY_NAME_PATTERN, { message: 'Invalid display name' })
});

export type DisplayNameUpdateInputType = z.infer<
  typeof displayNameUpdateSchema
>;
