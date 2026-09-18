-- next-oauth site settings: fe_site_settings + admin_site_settings_* permissions.
-- Incremental: safe to re-run (IF NOT EXISTS / ON CONFLICT DO NOTHING).
-- Keep permission_key in sync with shared/auth/permissionKeys.ts

-- ---------------------------------------------------------------------------
-- 1) Site settings table (aligned with PAM pam_site_settings)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.fe_site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.fe_site_settings IS
  'Runtime site settings. Seeded on migration; edit via Admin /admin/settings.';

COMMENT ON COLUMN public.fe_site_settings.key IS
  'Dotted setting key, e.g. auth.phone_login_enabled, api.cors_rules.';

COMMENT ON COLUMN public.fe_site_settings.value IS
  'JSON value (string, boolean, string[], etc.). Sensitive values may be encrypted at rest.';

COMMENT ON COLUMN public.fe_site_settings.description IS
  'Human-readable description for operators / Admin UI.';

COMMENT ON COLUMN public.fe_site_settings.is_sensitive IS
  'True when value is sensitive; never exposed via public-config API.';

COMMENT ON COLUMN public.fe_site_settings.updated_at IS
  'Last update time.';

CREATE INDEX IF NOT EXISTS idx_fe_site_settings_updated_at
  ON public.fe_site_settings (updated_at DESC);

ALTER TABLE public.fe_site_settings ENABLE ROW LEVEL SECURITY;

-- No RLS policies: only service_role (admin client) reads/writes from server.

-- ---------------------------------------------------------------------------
-- 2) Default rows (idempotent). Default CORS includes react-seed DX origin.
-- ---------------------------------------------------------------------------

INSERT INTO public.fe_site_settings (key, value, description, is_sensitive) VALUES
  (
    'auth.phone_login_enabled',
    'true'::jsonb,
    '是否在登录页展示「手机号」Tab。需在 Supabase Auth 中启用 Phone。',
    false
  ),
  (
    'auth.github_oauth_enabled',
    'true'::jsonb,
    '是否在登录页展示 GitHub OAuth 按钮。需在 Supabase Auth 中启用 GitHub 提供商。',
    false
  ),
  (
    'auth.google_oauth_enabled',
    'false'::jsonb,
    '是否在登录页展示 Google OAuth 按钮。需在 Supabase Auth 中启用 Google 提供商。',
    false
  ),
  (
    'openai.api_key',
    '""'::jsonb,
    'OpenAI 或兼容网关（Cerebras、自建代理等）的 API 密钥。有 ENCRYPTION_KEY 时加密存储，界面不回显明文。',
    true
  ),
  (
    'openai.base_url',
    '""'::jsonb,
    'Chat Completions 兼容接口根地址。示例：https://api.openai.com/v1',
    false
  ),
  (
    'api.cors_rules',
    '[{"origin":"http://localhost:3100","path":"*","methods":["*"]}]'::jsonb,
    'CORS 规则：origin × path × methods。三项均支持 *。默认放行 react-seed 本地来源全部接口。',
    false
  )
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3) Permission catalog + role assignments
-- ---------------------------------------------------------------------------

INSERT INTO public.fe_permissions (permission_key, type, method, path, description)
VALUES
  ('admin_site_settings_read', 'api', 'get', '/api/admin/site-settings', 'Read site settings'),
  ('admin_site_settings_write', 'api', 'patch', '/api/admin/site-settings', 'Update site settings')
ON CONFLICT (permission_key) DO NOTHING;

INSERT INTO public.fe_role_assignments (role_id, permission_key)
SELECT r.id, v.permission_key
FROM public.fe_roles r
JOIN (VALUES
  ('admin_site_settings_read')
) AS v(permission_key) ON TRUE
WHERE r.key = 'operator'
ON CONFLICT (role_id, permission_key) DO NOTHING;

INSERT INTO public.fe_role_assignments (role_id, permission_key)
SELECT r.id, v.permission_key
FROM public.fe_roles r
JOIN (VALUES
  ('admin_site_settings_read'),
  ('admin_site_settings_write')
) AS v(permission_key) ON TRUE
WHERE r.key = 'admin'
ON CONFLICT (role_id, permission_key) DO NOTHING;
