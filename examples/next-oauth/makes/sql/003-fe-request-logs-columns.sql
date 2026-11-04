-- Columnize frequently queried request-log fields (keep payload for extras).
begin;

alter table public.fe_request_logs
  add column if not exists http_method text,
  add column if not exists http_path text,
  add column if not exists http_status integer,
  add column if not exists duration_ms integer,
  add column if not exists ip_address text,
  add column if not exists error_code text,
  add column if not exists reason_code text;

update public.fe_request_logs
set
  http_method = coalesce(http_method, nullif(payload->>'http_method', '')),
  http_path = coalesce(
    http_path,
    nullif(record_type, ''),
    nullif(payload->>'http_path', '')
  ),
  http_status = coalesce(
    http_status,
    case
      when payload ? 'http_status'
        and (payload->>'http_status') ~ '^[0-9]+$'
      then (payload->>'http_status')::integer
      else null
    end
  ),
  duration_ms = coalesce(
    duration_ms,
    case
      when payload ? 'duration_ms'
        and (payload->>'duration_ms') ~ '^[0-9]+$'
      then (payload->>'duration_ms')::integer
      else null
    end
  ),
  ip_address = coalesce(ip_address, nullif(payload->>'ip_address', '')),
  error_code = coalesce(error_code, nullif(payload->>'error_code', '')),
  reason_code = coalesce(reason_code, nullif(payload->>'reason_code', ''))
where payload is not null;

create index if not exists idx_fe_request_logs_error_code
  on public.fe_request_logs (error_code)
  where error_code is not null;

create index if not exists idx_fe_request_logs_http_status
  on public.fe_request_logs (http_status)
  where http_status is not null;

commit;
