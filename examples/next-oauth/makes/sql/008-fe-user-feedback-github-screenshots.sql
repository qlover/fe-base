-- 反馈截图 → GitHub 同步计数与 raw URL（幂等）

begin;

alter table public.fe_user_feedback
  add column if not exists github_screenshot_count integer not null default 0;

alter table public.fe_user_feedback
  add column if not exists github_screenshot_urls text[];

comment on column public.fe_user_feedback.github_screenshot_count is
  '已成功挂到 GitHub Issue 评论的截图计数（CAS 用；本地清理后归零）';

comment on column public.fe_user_feedback.github_screenshot_urls is
  '截图已上传到 GitHub 后保留的 raw URL（本地 Storage 清理后仍可补挂评论）';

commit;
