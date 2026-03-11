-- =============================================================================
-- Zabatly Database Schema — PostgreSQL on VPS
-- Run this against your self-hosted PostgreSQL instance.
-- =============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users (custom auth — no Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT        UNIQUE NOT NULL,
  name          TEXT,
  avatar_url    TEXT,
  language      TEXT        DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  password_hash TEXT        NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT        UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used       BOOLEAN     DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan             TEXT        NOT NULL CHECK (plan IN ('free', 'basic', 'premium')),
  status           TEXT        NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')),
  started_at       TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ,
  boards_used      INT         DEFAULT 0,
  redesigns_used   INT         DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Mood Boards
CREATE TABLE IF NOT EXISTS moodboards (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title                 TEXT        DEFAULT 'Untitled Board',
  room_type             TEXT,
  style                 TEXT,
  color_preference      TEXT,
  prompt                TEXT,
  generated_images      JSONB       DEFAULT '[]'::jsonb,
  color_palette         JSONB       DEFAULT '[]'::jsonb,
  materials             JSONB       DEFAULT '[]'::jsonb,
  furniture_suggestions JSONB       DEFAULT '[]'::jsonb,
  canvas_data           JSONB,
  is_watermarked        BOOLEAN     DEFAULT TRUE,
  share_token           TEXT        UNIQUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- Room Redesigns
CREATE TABLE IF NOT EXISTS redesigns (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_image_url  TEXT        NOT NULL,
  style               TEXT,
  result_images       JSONB       DEFAULT '[]'::jsonb,
  is_watermarked      BOOLEAN     DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          REFERENCES users(id) ON DELETE SET NULL,
  plan             TEXT          NOT NULL,
  amount           DECIMAL(10,2) NOT NULL,
  method           TEXT          NOT NULL CHECK (method IN ('instapay', 'vodafone_cash')),
  transaction_id   TEXT          UNIQUE,
  screenshot_url   TEXT          NOT NULL,
  ocr_result       JSONB,
  status           TEXT          NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'manual_review')),
  rejection_reason TEXT,
  verified_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ   DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id      ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status        ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_moodboards_user_id          ON moodboards(user_id);
CREATE INDEX IF NOT EXISTS idx_moodboards_created_at       ON moodboards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_redesigns_user_id           ON redesigns(user_id);
CREATE INDEX IF NOT EXISTS idx_redesigns_created_at        ON redesigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id            ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id     ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status             ON payments(status);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user  ON password_reset_tokens(user_id);

-- =============================================================================
-- STORED PROCEDURES for usage tracking (avoids race conditions)
-- =============================================================================

CREATE OR REPLACE FUNCTION increment_boards_used(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET boards_used = boards_used + 1
  WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_redesigns_used(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET redesigns_used = redesigns_used + 1
  WHERE user_id = p_user_id AND status = 'active';
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS — auto-update updated_at timestamps
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER moodboards_updated_at
  BEFORE UPDATE ON moodboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================================
-- MIGRATION: If upgrading from the Supabase schema, run these:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL DEFAULT '';
-- =============================================================================
