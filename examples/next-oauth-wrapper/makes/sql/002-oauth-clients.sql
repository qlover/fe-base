-- Next OAuth Wrapper middleware schema (full recreate — safe to re-run in dev)
-- Drops existing n_oauth_wrapper__* tables (and legacy oauth_* names) then creates fresh objects.
-- OAuth tables below optionally enable RLS (see end of file). Without RLS, server can use SUPABASE_ANON_KEY; with RLS and no anon policies, use service role or add policies.

-- ---------------------------------------------------------------------------
-- Drop (children first, then clients; includes legacy unprefixed table names)
-- ---------------------------------------------------------------------------

drop table if exists public.n_oauth_wrapper__authorization_codes cascade;
drop table if exists public.n_oauth_wrapper__refresh_tokens cascade;
drop table if exists public.n_oauth_wrapper__user_credentials cascade;
drop table if exists public.n_oauth_wrapper__clients cascade;

-- ---------------------------------------------------------------------------
-- n_oauth_wrapper__clients — registered third-party OAuth 2.0 applications
-- ---------------------------------------------------------------------------

create table public.n_oauth_wrapper__clients (
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
  owner_user_id integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_n_oauth_wrapper__clients_owner on public.n_oauth_wrapper__clients (owner_user_id);

comment on table public.n_oauth_wrapper__clients is 'Registered OAuth 2.0 clients for Next OAuth Wrapper middleware.';

alter table public.n_oauth_wrapper__clients enable row level security;

-- ---------------------------------------------------------------------------
-- n_oauth_wrapper__authorization_codes — one-time authorization codes (5 min TTL)
-- ---------------------------------------------------------------------------

create table public.n_oauth_wrapper__authorization_codes (
  code text primary key,
  client_id text not null references public.n_oauth_wrapper__clients (client_id) on delete cascade,
  user_id integer not null,
  redirect_uri text not null,
  scope text,
  code_challenge text,
  code_challenge_method text,
  expires_at timestamptz not null,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

comment on column public.n_oauth_wrapper__authorization_codes.code_challenge is 'PKCE code_challenge (RFC 7636), stored at authorization time.';
comment on column public.n_oauth_wrapper__authorization_codes.code_challenge_method is 'PKCE method; only S256 is supported.';
comment on column public.n_oauth_wrapper__clients.client_secret_hash is 'Null for public clients (PKCE-only, no client_secret).';

create index idx_n_oauth_wrapper__auth_codes_client on public.n_oauth_wrapper__authorization_codes (client_id);
create index idx_n_oauth_wrapper__auth_codes_expires on public.n_oauth_wrapper__authorization_codes (expires_at);

alter table public.n_oauth_wrapper__authorization_codes enable row level security;

-- ---------------------------------------------------------------------------
-- n_oauth_wrapper__refresh_tokens — middleware refresh_token → client/user mapping
-- ---------------------------------------------------------------------------

create table public.n_oauth_wrapper__refresh_tokens (
  id serial primary key,
  refresh_token text not null unique,
  client_id text not null references public.n_oauth_wrapper__clients (client_id) on delete cascade,
  user_id integer not null,
  expires_at timestamptz not null,
  revoked boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_n_oauth_wrapper__refresh_tokens_client_user on public.n_oauth_wrapper__refresh_tokens (client_id, user_id);

comment on column public.n_oauth_wrapper__refresh_tokens.refresh_token is 'Hashed middleware refresh_token issued to the third-party client.';

alter table public.n_oauth_wrapper__refresh_tokens enable row level security;

-- ---------------------------------------------------------------------------
-- n_oauth_wrapper__user_credentials — long-lived upstream provider tokens per user_id
-- ---------------------------------------------------------------------------

create table public.n_oauth_wrapper__user_credentials (
  user_id integer primary key,
  provider_refresh_token text,
  provider_session_token text,
  updated_at timestamptz not null default now()
);

comment on column public.n_oauth_wrapper__user_credentials.provider_refresh_token is 'Encrypted upstream provider refresh_token for long-lived user credentials.';

alter table public.n_oauth_wrapper__user_credentials enable row level security;
