CREATE TABLE IF NOT EXISTS fe_tpl_migrations (
  id BIGSERIAL PRIMARY KEY,
  migration_name TEXT NOT NULL,
  sql_executed TEXT NOT NULL,
  executed_by TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'success',
  error_message TEXT
);