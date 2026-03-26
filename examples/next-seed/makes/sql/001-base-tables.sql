-- Base tables: login audit log with user-scoped RLS (Supabase / Postgres)

create table public.login_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  logged_at timestamptz not null default now(),
  user_agent text,
  ip_address text
);

comment on table public.login_logs is 'Client-recorded login events; rows scoped by user_id via RLS.';

create index idx_login_logs_user_id on public.login_logs (user_id);
create index idx_login_logs_logged_at on public.login_logs (logged_at desc);

alter table public.login_logs enable row level security;

-- Users may read only their own login log rows
create policy "login_logs_select_own" on public.login_logs
  for select
  using (auth.uid() = user_id);

-- Users may insert only rows attributed to themselves
create policy "login_logs_insert_own" on public.login_logs
  for insert
  with check (auth.uid() = user_id);

-- No update/delete policies: append-only audit trail (service role bypasses RLS if needed)
