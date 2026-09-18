-- next-oauth locales CMS: fe_locales table + admin_locales_* permissions.
-- Incremental: safe to re-run (IF NOT EXISTS / ON CONFLICT DO NOTHING).
-- Keep permission_key in sync with shared/auth/permissionKeys.ts

-- ---------------------------------------------------------------------------
-- 1) Locale dictionary table (aligned with @qlover/next-kit localesSchema)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.fe_locales (
  id BIGSERIAL PRIMARY KEY,
  value TEXT NOT NULL,
  en TEXT NOT NULL DEFAULT '',
  zh TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  namespace TEXT NOT NULL DEFAULT 'common',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fe_locales_value_unique UNIQUE (value)
);

COMMENT ON TABLE public.fe_locales IS
  'Runtime i18n dictionary rows. Edited via Admin /admin/locales when useApiLocales=true.';

COMMENT ON COLUMN public.fe_locales.value IS
  'i18n key (namespace:key), unique.';

COMMENT ON COLUMN public.fe_locales.en IS
  'English translation.';

COMMENT ON COLUMN public.fe_locales.zh IS
  'Chinese translation.';

COMMENT ON COLUMN public.fe_locales.description IS
  'Optional note; often seeded from fallback locale text.';

COMMENT ON COLUMN public.fe_locales.namespace IS
  'Namespace prefix derived from value (e.g. common, api, admin_locales).';

CREATE INDEX IF NOT EXISTS idx_fe_locales_namespace
  ON public.fe_locales (namespace);

CREATE INDEX IF NOT EXISTS idx_fe_locales_updated_at
  ON public.fe_locales (updated_at DESC);

ALTER TABLE public.fe_locales ENABLE ROW LEVEL SECURITY;

-- No RLS policies: only service_role (admin client) reads/writes from server.

-- ---------------------------------------------------------------------------
-- 2) Permission catalog + role assignments
-- ---------------------------------------------------------------------------

INSERT INTO public.fe_permissions (permission_key, type, method, path, description)
VALUES
  ('admin_locales_read', 'api', 'get', '/api/admin/locales', 'List locale dictionary rows'),
  ('admin_locales_write', 'api', 'post', '/api/admin/locales', 'Create / update / import locales')
ON CONFLICT (permission_key) DO NOTHING;

INSERT INTO public.fe_role_assignments (role_id, permission_key)
SELECT r.id, v.permission_key
FROM public.fe_roles r
JOIN (VALUES
  ('admin_locales_read')
) AS v(permission_key) ON TRUE
WHERE r.key = 'operator'
ON CONFLICT (role_id, permission_key) DO NOTHING;

INSERT INTO public.fe_role_assignments (role_id, permission_key)
SELECT r.id, v.permission_key
FROM public.fe_roles r
JOIN (VALUES
  ('admin_locales_read'),
  ('admin_locales_write')
) AS v(permission_key) ON TRUE
WHERE r.key = 'admin'
ON CONFLICT (role_id, permission_key) DO NOTHING;
