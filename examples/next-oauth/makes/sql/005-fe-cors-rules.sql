-- next-oauth: CORS is rules-only (origin × path × methods).
-- Drop leftover flat / methods-only site settings keys.

INSERT INTO public.fe_site_settings (key, value, description, is_sensitive) VALUES
  (
    'api.cors_rules',
    '[{"origin":"http://localhost:3100","path":"*","methods":["*"]}]'::jsonb,
    'CORS 规则：origin × path × methods。三项均支持 *。示例见 Admin 站点设置。',
    false
  )
ON CONFLICT (key) DO NOTHING;

DELETE FROM public.fe_site_settings
WHERE key IN ('api.cors_origins', 'api.cors_methods');
