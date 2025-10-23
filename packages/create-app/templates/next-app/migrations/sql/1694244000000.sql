CREATE TABLE IF NOT EXISTS fe_users (
  id BIGSERIAL PRIMARY KEY,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL,
  credential_token TEXT,
  email_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS next_app_locales (
  id BIGSERIAL PRIMARY KEY,
  value TEXT NOT NULL,
  en TEXT NOT NULL,
  zh TEXT NOT NULL,
  description TEXT,
  namesapce TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);