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
