-- =============================================================================
-- 事务邮件 + 忘记/重置密码（增量脚本，可重复执行）
--
-- 001-fe-schema.sql 仅用于全新安装（会 drop 表）；已有库请执行本文件。
-- 内容：
--   1) fe_mail_logs：事务邮件审计（memory | resend）
--   2) fe_password_reset_tokens：重置链接（仅存 SHA-256 哈希，单次使用）
--   3) fe_users.sessions_revoked_at：撤销所有会话（iat 早于该时间的会话 JWT 失效）
--   4) 权限 admin_mail_test / admin_mail_logs_read 及角色分配
-- 站点设置 mail.* 由应用按代码定义自动补种，无需在此插入。
-- 与 shared/config/feTables.ts、shared/auth/permissionKeys.ts 保持同步。
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) 邮件发送日志
-- ---------------------------------------------------------------------------

create table if not exists public.fe_mail_logs (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  subject text not null,
  template text not null
    check (template in ('test', 'password_reset', 'password_changed')),
  provider text not null check (provider in ('memory', 'resend')),
  status text not null check (status in ('sent', 'failed')),
  provider_message_id text,
  error text,
  body_text text,
  user_id uuid references auth.users (id) on delete set null,
  created_ip text,
  created_at timestamptz not null default now()
);

comment on table public.fe_mail_logs is
  'Transactional mail audit (memory | resend). Admin /admin/mail-logs reads this.';
comment on column public.fe_mail_logs.body_text is
  'Plain-text body, only stored for memory provider (dev/test). Null for real providers.';

create index if not exists idx_fe_mail_logs_created
  on public.fe_mail_logs (created_at desc);

create index if not exists idx_fe_mail_logs_email_template_created
  on public.fe_mail_logs (to_email, template, created_at desc);

alter table public.fe_mail_logs enable row level security;

-- ---------------------------------------------------------------------------
-- 2) 密码重置令牌
-- ---------------------------------------------------------------------------

create table if not exists public.fe_password_reset_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_ip text,
  created_at timestamptz not null default now()
);

comment on table public.fe_password_reset_tokens is
  'Forgot-password reset links. Single use; unused tokens are invalidated after a successful reset.';

create index if not exists idx_fe_password_reset_tokens_user_created
  on public.fe_password_reset_tokens (user_id, created_at desc);

alter table public.fe_password_reset_tokens enable row level security;

-- ---------------------------------------------------------------------------
-- 3) 撤销全部会话
-- ---------------------------------------------------------------------------

alter table public.fe_users
  add column if not exists sessions_revoked_at timestamptz;

comment on column public.fe_users.sessions_revoked_at is
  'Session JWTs with iat before this time are rejected (set after password reset).';

-- ---------------------------------------------------------------------------
-- 4) 权限与角色分配
-- ---------------------------------------------------------------------------

insert into public.fe_permissions (permission_key, type, method, path, description)
values
  ('admin_mail_logs_read', 'page', null, '/admin/mail-logs', 'List mail send logs'),
  ('admin_mail_test', 'api', 'POST', '/api/admin/mail/test', 'Send test email')
on conflict (permission_key) do nothing;

insert into public.fe_role_assignments (role_id, permission_key)
select r.id, v.permission_key
from public.fe_roles r
join (values
  ('admin_mail_logs_read')
) as v(permission_key) on true
where r.key = 'operator'
on conflict do nothing;

insert into public.fe_role_assignments (role_id, permission_key)
select r.id, v.permission_key
from public.fe_roles r
join (values
  ('admin_mail_logs_read'),
  ('admin_mail_test')
) as v(permission_key) on true
where r.key = 'admin'
on conflict do nothing;
