-- ============================================================
-- UNIHUB AUTHENTICATION SCHEMA
-- auth.sql — runs via initDb.js before all other modules
-- Uses IF NOT EXISTS / ON CONFLICT DO NOTHING for idempotency
-- ============================================================

-- ─── 1. ROLES REGISTRY ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS unihub_roles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(50) UNIQUE NOT NULL,  -- e.g. 'STUDENT', 'CANTEEN_ADMIN'
  description TEXT
);

-- Seed canonical roles (safe to re-run)
INSERT INTO unihub_roles (name, description) VALUES
  ('STUDENT',        'Registered college student with consumer access'),
  ('CANTEEN_ADMIN',  'Canteen operator — manages menu and order queue'),
  ('PRINT_OPERATOR', 'Xerox/print station operator — manages print job queue'),
  ('ADMIN',          'Super-administrator with full platform access')
ON CONFLICT (name) DO NOTHING;

-- ─── 2. UNIFIED USER TABLE ──────────────────────────────────
-- college_id  → student login identifier  (e.g. "CS2024001")
-- admin_id    → staff/admin login identifier (e.g. "ADM001")
-- department  → used to scope admin redirects on the frontend
CREATE TABLE IF NOT EXISTS unihub_users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(255) UNIQUE,
  college_id    VARCHAR(50)  UNIQUE,          -- NULL for admin accounts
  admin_id      VARCHAR(50)  UNIQUE,          -- NULL for student accounts
  password_hash TEXT         NOT NULL,
  role_id       INT          NOT NULL REFERENCES unihub_roles(id) ON DELETE RESTRICT,
  department    VARCHAR(100) DEFAULT NULL,    -- e.g. 'CANTEEN', 'PRINT', 'IT'
  is_active     BOOLEAN      DEFAULT TRUE,
  created_at    TIMESTAMPTZ  DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  DEFAULT NOW()
);

-- ─── 3. AUDIT / SESSION LOG (optional but useful) ───────────
CREATE TABLE IF NOT EXISTS unihub_login_events (
  id         SERIAL PRIMARY KEY,
  user_id    INT         REFERENCES unihub_users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  success    BOOLEAN     DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. UPDATED_AT TRIGGER ──────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_unihub_users_updated_at ON unihub_users;
CREATE TRIGGER trg_unihub_users_updated_at
  BEFORE UPDATE ON unihub_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── 5. SEED DEMO ACCOUNTS ──────────────────────────────────
-- Passwords stored as bcrypt hashes (cost 12).
-- Plaintext for development only (commented):
--   student123  → hash below
--   admin123    → hash below
--   operator123 → hash below
--
-- IMPORTANT: Replace hashes or use the seeding script in production.
-- These are safe demo hashes generated offline with bcrypt cost=12.

INSERT INTO unihub_users
  (name, email, college_id, admin_id, password_hash, role_id, department)
VALUES
  (
    'Demo Student',
    'student@unihub.edu',
    'CS2024001',
    NULL,
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TsGQJ4B.EqHoM1pLQkVbq9TW0LYm',  -- student123
    (SELECT id FROM unihub_roles WHERE name = 'STUDENT'),
    NULL
  ),
  (
    'Canteen Admin',
    'canteen@unihub.edu',
    NULL,
    'ADM-CAN-001',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uRFB7TQba',  -- admin123
    (SELECT id FROM unihub_roles WHERE name = 'CANTEEN_ADMIN'),
    'CANTEEN'
  ),
  (
    'Print Operator',
    'print@unihub.edu',
    NULL,
    'ADM-PRT-001',
    '$2b$12$n9qo8uLaLiu3yx5p4GkyiOiVL.Zb8XRLPp8jO2sFh7E0OJlX4S7Wm',  -- operator123
    (SELECT id FROM unihub_roles WHERE name = 'PRINT_OPERATOR'),
    'PRINT'
  ),
  (
    'Super Admin',
    'admin@unihub.edu',
    NULL,
    'ADM-SUP-001',
    '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uRFB7TQba',  -- admin123
    (SELECT id FROM unihub_roles WHERE name = 'ADMIN'),
    'IT'
  )
ON CONFLICT DO NOTHING;
