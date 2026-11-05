-- 反馈截图 Storage + GitHub 站点设置种子 + issue 编号索引（幂等）

begin;

-- ---------------------------------------------------------------------------
-- Storage bucket（私有；service role 上传）
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fe-user-feedback',
  'fe-user-feedback',
  false,
  1572864,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create index if not exists idx_fe_user_feedback_github_issue_number
  on public.fe_user_feedback (github_issue_number)
  where github_issue_number is not null;

-- ---------------------------------------------------------------------------
-- GitHub 反馈同步相关站点设置
-- ---------------------------------------------------------------------------
insert into public.fe_site_settings (key, value, description, is_sensitive) values
  (
    'github.feedback_sync_enabled',
    'false'::jsonb,
    '预留：开启后可在提交反馈时自动建 Issue（模板默认不自动调用，仅 Admin 手动创建）。',
    false
  ),
  (
    'github.app_id',
    '""'::jsonb,
    'GitHub App 设置页顶部的 App ID（数字）。',
    false
  ),
  (
    'github.app_installation_id',
    '""'::jsonb,
    'App 安装到仓库后地址栏 /installations/ 后面的数字。',
    false
  ),
  (
    'github.app_private_key',
    '""'::jsonb,
    'GitHub App 私钥（.pem 全文）。必须配置 ENCRYPTION_KEY，加密存储，界面不回显。',
    true
  ),
  (
    'github.feedback_repo',
    '""'::jsonb,
    '反馈 Issue 目标仓库，格式 owner/repo。',
    false
  ),
  (
    'github.webhook_secret',
    '""'::jsonb,
    'GitHub App Webhook Secret。用于校验 /api/webhooks/github 签名。',
    true
  )
on conflict (key) do nothing;

commit;
