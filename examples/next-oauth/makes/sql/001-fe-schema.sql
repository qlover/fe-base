-- =============================================================================
-- next-oauth full schema (single script, safe to re-run in dev)
-- Prefix: fe_
-- Order: roles → users → request logs → oauth
-- Keep in sync with shared/config/feTables.ts + shared/auth/*
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Drop (dependents first; includes legacy table names)
-- ---------------------------------------------------------------------------

drop table if exists public.fe_role_assignments cascade;
drop table if exists public.fe_users cascade;
drop table if exists public.fe_permissions cascade;
drop table if exists public.fe_roles cascade;

drop table if exists public.fe_request_logs cascade;
drop table if exists public.request_logs cascade;

drop table if exists public.fe_oauth_authorization_codes cascade;
drop table if exists public.fe_oauth_refresh_tokens cascade;
drop table if exists public.fe_oauth_user_credentials cascade;
drop table if exists public.fe_oauth_user_links cascade;
drop table if exists public.fe_oauth_clients cascade;

-- =============================================================================
-- 1) Platform roles / permissions
-- =============================================================================

create table public.fe_roles (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  name text not null,
  kind text not null check (kind in ('platform')),
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint fe_roles_key_unique unique (key)
);

comment on table public.fe_roles is
  'Platform role templates (user|operator|admin). Bound via fe_users.role_id.';

insert into public.fe_roles (key, name, kind, description, is_system) values
  ('user', 'User', 'platform', 'Default signed-in user', true),
  ('operator', 'Operator', 'platform', 'Admin console read access', true),
  ('admin', 'Admin', 'platform', 'Full admin console access', true);

create table public.fe_permissions (
  permission_key text primary key,
  type text not null default 'api' check (type in ('api', 'page', 'feature')),
  method text check (
    method is null
    or method in ('get', 'post', 'patch', 'put', 'delete', 'GET', 'POST', 'PATCH', 'PUT', 'DELETE')
  ),
  path text,
  description text,
  created_at timestamptz not null default now(),
  constraint fe_permissions_key_format check (
    permission_key ~ '^[A-Za-z_][A-Za-z0-9_]*$'
  )
);

comment on table public.fe_permissions is
  'Permission catalog; permission_key is sole auth/i18n/UI identity (permission:{key}).';

insert into public.fe_permissions (permission_key, type, method, path, description) values
  ('admin_users_read', 'page', null, '/admin/users', 'View admin users'),
  ('admin_users_system_role', 'api', 'PATCH', '/api/admin/users', 'Change user system role'),
  ('admin_roles_read', 'page', null, '/admin/roles', 'View role assignments'),
  ('admin_roles_write', 'api', 'PATCH', '/api/admin/roles', 'Edit role assignments'),
  ('admin_permissions_read', 'page', null, '/admin/permissions', 'View permission catalog'),
  ('admin_permissions_write', 'api', 'POST', '/api/admin/permissions', 'Create or update permission catalog'),
  ('admin_request_logs_read', 'page', null, '/admin/request-logs', 'View request logs'),
  ('admin_request_logs_write', 'api', 'DELETE', '/api/user/request-logs', 'Clear request logs'),
  ('admin_otp_monitor_read', 'page', null, '/admin/otp-monitor', 'View OTP send rate-limit state'),
  ('admin_otp_monitor_write', 'api', 'POST', '/api/admin/otp-monitor', 'Clear OTP send rate-limit entries'),
  ('admin_memory_kv_read', 'page', null, '/admin/memory-kv', 'View process Memory KV cache'),
  ('admin_memory_kv_write', 'api', 'POST', '/api/admin/memory-kv', 'Purge process Memory KV cache'),
  ('admin_site_settings_read', 'page', null, '/admin', 'Access admin console');

create table public.fe_role_assignments (
  role_id uuid not null references public.fe_roles (id) on delete cascade,
  permission_key text not null references public.fe_permissions (permission_key) on delete cascade,
  primary key (role_id, permission_key)
);

create index idx_fe_role_assignments_role_id
  on public.fe_role_assignments (role_id);

comment on table public.fe_role_assignments is
  'role_id → permission_key (flat platform assignments).';

insert into public.fe_role_assignments (role_id, permission_key)
select r.id, v.permission_key
from public.fe_roles r
join (values
  ('admin_users_read'),
  ('admin_roles_read'),
  ('admin_permissions_read'),
  ('admin_request_logs_read'),
  ('admin_otp_monitor_read'),
  ('admin_memory_kv_read'),
  ('admin_site_settings_read')
) as v(permission_key) on true
where r.key = 'operator';

insert into public.fe_role_assignments (role_id, permission_key)
select r.id, v.permission_key
from public.fe_roles r
join (values
  ('admin_users_read'),
  ('admin_users_system_role'),
  ('admin_roles_read'),
  ('admin_roles_write'),
  ('admin_permissions_read'),
  ('admin_permissions_write'),
  ('admin_request_logs_read'),
  ('admin_request_logs_write'),
  ('admin_otp_monitor_read'),
  ('admin_otp_monitor_write'),
  ('admin_memory_kv_read'),
  ('admin_memory_kv_write'),
  ('admin_site_settings_read')
) as v(permission_key) on true
where r.key = 'admin';

alter table public.fe_roles enable row level security;
alter table public.fe_permissions enable row level security;
alter table public.fe_role_assignments enable row level security;

-- =============================================================================
-- 2) App user profiles (1:1 auth.users) — aligned with PAM pam_users
-- =============================================================================

create table public.fe_users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  phone text,
  role_id uuid not null references public.fe_roles (id),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.fe_users is
  'App user profile and platform role; FK to auth.users. Identity stays in auth.users.';
comment on column public.fe_users.email is
  'Business email when present. Null for phone-only profiles.';
comment on column public.fe_users.phone is
  'Optional phone (E.164 or provider format).';
comment on column public.fe_users.role_id is
  'Platform role (user|operator|admin via fe_roles.key).';
comment on column public.fe_users.status is
  'Application account status (not Supabase auth ban).';

create index idx_fe_users_role_id on public.fe_users (role_id);
create index idx_fe_users_email on public.fe_users (email);

create unique index idx_fe_users_email_unique_real
  on public.fe_users (lower(email))
  where email is not null and btrim(email) <> '';

create unique index idx_fe_users_phone_unique
  on public.fe_users (phone)
  where phone is not null and btrim(phone) <> '';

alter table public.fe_users enable row level security;

create or replace function public.fe_users_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_fe_users_updated_at on public.fe_users;
create trigger trigger_fe_users_updated_at
before update on public.fe_users
for each row execute function public.fe_users_set_updated_at();

-- Bootstrap first platform admin (edit email before running in production):
-- insert into public.fe_users (id, email, display_name, role_id)
-- select u.id, u.email, coalesce(u.raw_user_meta_data->>'name', u.email), r.id
-- from auth.users u
-- join public.fe_roles r on r.key = 'admin'
-- where u.email = 'you@example.com'
-- on conflict (id) do update
--   set role_id = excluded.role_id,
--       email = excluded.email,
--       updated_at = now();

-- =============================================================================
-- 3) Request / operation logs
-- =============================================================================

create table public.fe_request_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  event_category text not null,
  event_type text not null,
  success boolean not null default true,
  request_id uuid,
  record_type text,
  payload jsonb
);

comment on table public.fe_request_logs is
  'Append-only log for HTTP API traffic, auth actions, and other server-side events; RLS limits reads to own user_id rows.';

create index idx_fe_request_logs_user_id on public.fe_request_logs (user_id);
create index idx_fe_request_logs_created_at on public.fe_request_logs (created_at desc);
create index idx_fe_request_logs_category on public.fe_request_logs (event_category);
create index idx_fe_request_logs_event_type on public.fe_request_logs (event_type);
create index idx_fe_request_logs_request_id on public.fe_request_logs (request_id);

alter table public.fe_request_logs enable row level security;

create policy "fe_request_logs_select_own" on public.fe_request_logs
  for select
  using (user_id is not null and auth.uid() = user_id);

create policy "fe_request_logs_insert_self_or_anon" on public.fe_request_logs
  for insert
  with check (user_id is null or auth.uid() = user_id);

-- =============================================================================
-- 4) OAuth wrapper tables
-- =============================================================================

create table public.fe_oauth_clients (
  id serial primary key,
  client_id text unique not null,
  client_secret_hash text,
  client_name text not null,
  client_uri text,
  logo_uri text,
  redirect_uris text[] not null,
  grant_types text[] not null default '{authorization_code,refresh_token}',
  scopes text[] not null default '{openid,profile,email}',
  confidential boolean not null default true,
  owner_user_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_fe_oauth_clients_owner on public.fe_oauth_clients (owner_user_id);

comment on table public.fe_oauth_clients is
  'Registered OAuth 2.0 clients for Next OAuth Wrapper middleware.';
comment on column public.fe_oauth_clients.client_secret_hash is
  'Null for public clients (PKCE-only, no client_secret).';

alter table public.fe_oauth_clients enable row level security;

create table public.fe_oauth_authorization_codes (
  code text primary key,
  client_id text not null references public.fe_oauth_clients (client_id) on delete cascade,
  user_id text not null,
  redirect_uri text not null,
  scope text,
  code_challenge text,
  code_challenge_method text,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

comment on column public.fe_oauth_authorization_codes.code_challenge is
  'PKCE code_challenge (RFC 7636), stored at authorization time.';
comment on column public.fe_oauth_authorization_codes.code_challenge_method is
  'PKCE method; only S256 is supported.';

create index idx_fe_oauth_auth_codes_client
  on public.fe_oauth_authorization_codes (client_id);
create index idx_fe_oauth_auth_codes_expires
  on public.fe_oauth_authorization_codes (expires_at);

alter table public.fe_oauth_authorization_codes enable row level security;

create table public.fe_oauth_refresh_tokens (
  id serial primary key,
  refresh_token text not null unique,
  client_id text not null references public.fe_oauth_clients (client_id) on delete cascade,
  user_id text not null,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_fe_oauth_refresh_tokens_client_user
  on public.fe_oauth_refresh_tokens (client_id, user_id);

comment on column public.fe_oauth_refresh_tokens.refresh_token is
  'Hashed middleware refresh_token issued to the third-party client.';

alter table public.fe_oauth_refresh_tokens enable row level security;

create table public.fe_oauth_user_credentials (
  user_id text primary key,
  provider_refresh_token text,
  provider_session_token text,
  updated_at timestamptz not null default now()
);

comment on column public.fe_oauth_user_credentials.provider_refresh_token is
  'Encrypted upstream provider refresh_token for long-lived user credentials.';

alter table public.fe_oauth_user_credentials enable row level security;

create table public.fe_oauth_user_links (
  auth_user_id uuid primary key references auth.users (id) on delete cascade,
  provider text not null default 'brain',
  external_user_id text not null,
  extra jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_user_id)
);

create index idx_fe_oauth_user_links_external
  on public.fe_oauth_user_links (provider, external_user_id);

comment on table public.fe_oauth_user_links is
  'Maps upstream IdP user ids to local auth.users ids; optional extra profile JSON.';

alter table public.fe_oauth_user_links enable row level security;
