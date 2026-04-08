-- Add optional request correlation id to existing deployments (idempotent).

alter table public.request_logs
  add column if not exists request_id uuid;

comment on column public.request_logs.request_id is 'Optional correlation id for an API/request lifecycle (e.g. AppApiResult.requestId); auth-only rows may be null.';

create index if not exists idx_request_logs_request_id on public.request_logs (request_id);
