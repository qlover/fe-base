-- Wrap auth.uid() in (select …) so Postgres can init the plan once per
-- statement (Supabase advisor: auth_rls_initplan). Safe to re-run.

alter policy "fe_request_logs_select_own" on public.fe_request_logs
  using (user_id is not null and (select auth.uid()) = user_id);

alter policy "fe_request_logs_insert_self_or_anon" on public.fe_request_logs
  with check (user_id is null or (select auth.uid()) = user_id);
