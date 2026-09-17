-- Migrate pam_users → fe_users (same Supabase project).
-- Prerequisite: 001-fe-schema.sql already applied.
--
-- role_id: pam_roles.key → fe_roles.key (user|operator|admin).
-- Verify: SELECT id, key FROM public.fe_roles ORDER BY key;
--
-- Safe to re-run. Syncs role_id from pam on every run.

do $$
begin
  if (select count(*) from public.fe_roles where key in ('user', 'operator', 'admin')) < 3 then
    raise exception 'fe_roles missing user/operator/admin — run 001-fe-schema.sql first';
  end if;
  if to_regclass('public.pam_users') is null then
    raise exception 'public.pam_users not found';
  end if;
end $$;

insert into public.fe_users (
  id,
  email,
  display_name,
  phone,
  role_id,
  status,
  created_at,
  updated_at
)
select
  pu.id,
  nullif(btrim(pu.email), ''),
  pu.display_name,
  nullif(btrim(pu.phone), ''),
  coalesce(
    (
      select fr.id
      from public.pam_roles pr
      join public.fe_roles fr on fr.key = pr.key and fr.kind = 'platform'
      where pr.id = pu.role_id
      limit 1
    ),
    (
      select fr.id
      from public.fe_roles fr
      where fr.key = 'admin'
        and coalesce(pu.is_platform_admin, false) = true
      limit 1
    ),
    (select fr.id from public.fe_roles fr where fr.key = 'user' limit 1)
  ),
  case
    when pu.status in ('active', 'suspended') then pu.status
    else 'active'
  end,
  coalesce(pu.created_at, now()),
  coalesce(pu.updated_at, now())
from public.pam_users pu
where exists (select 1 from auth.users au where au.id = pu.id)
on conflict (id) do update
set
  email = excluded.email,
  display_name = excluded.display_name,
  phone = excluded.phone,
  status = excluded.status,
  role_id = excluded.role_id,
  updated_at = now();

-- Quick check for a specific user:
-- select fu.email, fr.key, fr.id as role_id
-- from public.fe_users fu
-- join public.fe_roles fr on fr.id = fu.role_id
-- where fu.id = '308c658e-a3c8-4684-89d4-9c62111344f7';
