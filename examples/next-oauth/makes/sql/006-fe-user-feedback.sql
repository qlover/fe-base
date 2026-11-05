-- 用户反馈表 + 权限 + 概览 metrics 增加 feedback 计数（幂等）

begin;

-- ---------------------------------------------------------------------------
-- fe_user_feedback
-- ---------------------------------------------------------------------------
create table if not exists public.fe_user_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.fe_users (id) on delete cascade,
  category text not null
    check (category in ('bug', 'ux', 'feature', 'performance', 'content', 'other')),
  body text not null,
  page_url text null,
  user_agent text null,
  client_context jsonb null,
  screenshot_paths text[] null,
  status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'closed')),
  github_issue_number integer null,
  github_issue_url text null,
  github_sync_status text not null default 'skipped'
    check (github_sync_status in ('pending', 'synced', 'failed', 'skipped')),
  github_sync_error text null,
  github_synced_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.fe_user_feedback is
  '用户反馈；GitHub 同步列预留，本切片默认 skipped。';

create index if not exists idx_fe_user_feedback_user_id
  on public.fe_user_feedback (user_id);

create index if not exists idx_fe_user_feedback_created_at
  on public.fe_user_feedback (created_at desc);

create index if not exists idx_fe_user_feedback_status
  on public.fe_user_feedback (status);

alter table public.fe_user_feedback enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'fe_user_feedback'
      and policyname = 'fe_user_feedback_select_own'
  ) then
    create policy "fe_user_feedback_select_own" on public.fe_user_feedback
      for select using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'fe_user_feedback'
      and policyname = 'fe_user_feedback_insert_own'
  ) then
    create policy "fe_user_feedback_insert_own" on public.fe_user_feedback
      for insert with check (auth.uid() = user_id);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------
insert into public.fe_permissions (permission_key, type, method, path, description)
values
  ('admin_feedback_read', 'page', null, '/admin/feedback', 'View user feedback'),
  ('admin_feedback_write', 'api', 'PATCH', '/api/admin/feedback', 'Update feedback status')
on conflict (permission_key) do nothing;

insert into public.fe_role_assignments (role_id, permission_key)
select r.id, v.permission_key
from public.fe_roles r
join (values
  ('admin_feedback_read')
) as v(permission_key) on true
where r.key = 'operator'
on conflict do nothing;

insert into public.fe_role_assignments (role_id, permission_key)
select r.id, v.permission_key
from public.fe_roles r
join (values
  ('admin_feedback_read'),
  ('admin_feedback_write')
) as v(permission_key) on true
where r.key = 'admin'
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Overview metrics：追加 feedback 计数
-- ---------------------------------------------------------------------------
create or replace function public.fe_admin_overview_metrics(
  p_from timestamptz,
  p_to timestamptz
)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'signups', (
      select count(*) from public.fe_users
      where created_at >= p_from and created_at < p_to
    ),
    'activeUsers', (
      select count(distinct user_id) from public.fe_request_logs
      where user_id is not null
        and created_at >= p_from and created_at < p_to
    ),
    'feedback', (
      select count(*) from public.fe_user_feedback
      where created_at >= p_from and created_at < p_to
    )
  );
$$;

revoke all on function public.fe_admin_overview_metrics(timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.fe_admin_overview_metrics(timestamptz, timestamptz) to service_role;

commit;
