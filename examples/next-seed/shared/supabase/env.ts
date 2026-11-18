/**
 * Supabase 连接环境变量（应用内读取，不经 next-kit 中转）。
 * 与 `.env.template` 中 `SUPABASE_URL` / `SUPABASE_ANON_KEY` 对齐。
 */
export const SUPABASE_URL = process.env.SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
