-- Admin 概览统计函数（幂等 migrate）
-- 说明：注册 / 活跃（request_logs 去重 user_id）/ 失败分组无法经 PostgREST 高效表达，
--       收成只读 SQL 函数；仅 service_role 可执行。

begin;

-- ---------------------------------------------------------------------------
-- 1) 核心指标：[p_from, p_to) 区间计数
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
    )
  );
$$;

-- ---------------------------------------------------------------------------
-- 2) 活跃趋势：按小时 / 天分桶（p_tz 时区），空桶补 0
-- ---------------------------------------------------------------------------
create or replace function public.fe_admin_overview_trend(
  p_from timestamptz,
  p_to timestamptz,
  p_bucket text,
  p_tz text
)
returns table (bucket timestamp, active_users bigint, signups bigint)
language sql
stable
security definer
set search_path = public
as $$
  with series as (
    select generate_series(
      date_trunc(p_bucket, p_from at time zone p_tz),
      date_trunc(p_bucket, (p_to - interval '1 millisecond') at time zone p_tz),
      ('1 ' || p_bucket)::interval
    ) as bucket
  ),
  activity as (
    select
      user_id,
      date_trunc(p_bucket, created_at at time zone p_tz) as bucket
    from public.fe_request_logs
    where user_id is not null
      and created_at >= p_from and created_at < p_to
  ),
  signup as (
    select date_trunc(p_bucket, created_at at time zone p_tz) as bucket
    from public.fe_users
    where created_at >= p_from and created_at < p_to
  )
  select
    s.bucket,
    (select count(distinct a.user_id) from activity a where a.bucket = s.bucket),
    (select count(*) from signup g where g.bucket = s.bucket)
  from series s
  order by s.bucket;
$$;

-- ---------------------------------------------------------------------------
-- 3) 失败请求：按类别 + 事件类型汇总
-- ---------------------------------------------------------------------------
create or replace function public.fe_admin_overview_failures(
  p_since timestamptz,
  p_limit integer
)
returns table (
  event_category text,
  event_type text,
  failures bigint,
  last_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select event_category, event_type, count(*) as failures, max(created_at) as last_at
  from public.fe_request_logs
  where success = false and created_at >= p_since
  group by event_category, event_type
  order by failures desc, last_at desc
  limit greatest(p_limit, 1);
$$;

revoke all on function public.fe_admin_overview_metrics(timestamptz, timestamptz) from public, anon, authenticated;
revoke all on function public.fe_admin_overview_trend(timestamptz, timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.fe_admin_overview_failures(timestamptz, integer) from public, anon, authenticated;
grant execute on function public.fe_admin_overview_metrics(timestamptz, timestamptz) to service_role;
grant execute on function public.fe_admin_overview_trend(timestamptz, timestamptz, text, text) to service_role;
grant execute on function public.fe_admin_overview_failures(timestamptz, integer) to service_role;

commit;
