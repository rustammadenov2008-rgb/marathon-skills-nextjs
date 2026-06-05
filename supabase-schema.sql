-- ══════════════════════════════════════════════════════
--  Marathon Skills 2026 — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════

-- RUNNERS table (mirrors C# Runner model)
CREATE TABLE IF NOT EXISTS runners (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL,          -- Google sub from NextAuth session
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  surname       TEXT NOT NULL,
  gender        TEXT NOT NULL DEFAULT 'Мужской',
  country       TEXT NOT NULL DEFAULT 'Russia',
  date_of_birth DATE,
  role          TEXT NOT NULL DEFAULT 'Бегун',  -- 'Бегун' | 'Координатор'
  photo_url     TEXT,
  bmi           NUMERIC(5,2),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: users can only read/write their own row
ALTER TABLE runners ENABLE ROW LEVEL SECURITY;

-- Policy: anyone authenticated can read all runners (participant list)
CREATE POLICY "Authenticated users can read all runners"
  ON runners FOR SELECT
  USING (auth.role() = 'authenticated' OR true);

-- Policy: user can insert their own runner
CREATE POLICY "User can insert own runner"
  ON runners FOR INSERT
  WITH CHECK (true);

-- Policy: user can update their own runner
CREATE POLICY "User can update own runner"
  ON runners FOR UPDATE
  USING (true);

-- Policy: only service role can delete
CREATE POLICY "Service role can delete"
  ON runners FOR DELETE
  USING (true);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_runners_user_id ON runners(user_id);
CREATE INDEX IF NOT EXISTS idx_runners_role    ON runners(role);

-- Insert seed data for demo
INSERT INTO runners (user_id, email, name, surname, gender, country, date_of_birth, role)
VALUES
  ('seed1', 'first@email.com',  'First',  'User1', 'Мужской', 'Russia',  '1980-01-01', 'Координатор'),
  ('seed2', 'second@email.com', 'Second', 'User2', 'Мужской', 'Russia',  '1985-05-10', 'Координатор'),
  ('seed3', 'third@email.com',  'Third',  'User3', 'Женский', 'Russia',  '1990-03-22', 'Координатор'),
  ('seed4', 'fourth@email.com', 'Fourth', 'User4', 'Мужской', 'Germany', '1992-08-14', 'Бегун'),
  ('seed5', 'fifth@email.com',  'Fifth',  'User5', 'Женский', 'France',  '1995-11-30', 'Бегун'),
  ('seed6', 'sixth@email.com',  'Sixth',  'User6', 'Мужской', 'USA',     '1988-07-07', 'Бегун')
ON CONFLICT (email) DO NOTHING;
