-- ============================================================
-- Venue Booking Module — Database Schema
-- Safe to run multiple times (IF NOT EXISTS / IF NOT EXISTS).
-- Requires: PostgreSQL 9.5+ with btree_gist extension.
-- ============================================================
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
-- Enable the extension needed for EXCLUDE constraints on
-- non-btree types (date, tsrange). Idempotent.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- -----------------------------------------------------------
-- 1. VENUES TABLE
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS venues (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL UNIQUE,
    location    VARCHAR(200) NOT NULL DEFAULT '',
    capacity    INT          NOT NULL DEFAULT 50,
    type        VARCHAR(50)  NOT NULL DEFAULT 'Seminar Hall',
    status      VARCHAR(20)  NOT NULL DEFAULT 'Open',
    image_url   TEXT         NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Safe column additions for existing tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'venues' AND column_name = 'type'
    ) THEN
        ALTER TABLE venues ADD COLUMN type VARCHAR(50) NOT NULL DEFAULT 'Seminar Hall';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'venues' AND column_name = 'status'
    ) THEN
        ALTER TABLE venues ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Open';
    END IF;
END
$$;

-- -----------------------------------------------------------
-- 2. BOOKINGS TABLE
--    * status enum: PENDING -> APPROVED | REJECTED
--    * EXCLUDE constraint prevents any two APPROVED bookings
--      from overlapping on the same venue+date at the DB level.
-- -----------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS bookings (
    id          SERIAL         PRIMARY KEY,
    venue_id    INT            NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
    user_id     INT            NOT NULL,
    user_name   VARCHAR(120)   NOT NULL DEFAULT 'Unknown',
    user_role   VARCHAR(20)    NOT NULL DEFAULT 'STUDENT',
    event_name  VARCHAR(200)   NOT NULL,
    event_date  DATE           NOT NULL,
    start_time  TIME           NOT NULL,
    end_time    TIME           NOT NULL,
    status      booking_status NOT NULL DEFAULT 'PENDING',
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

-- Exclusion constraint: no two APPROVED bookings may overlap
-- on the same venue and same date.
-- We use tsrange built from (event_date + start_time, event_date + end_time).
-- The WHERE clause limits the exclusion to APPROVED rows only.
-- Wrapped in a DO block for idempotency.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'no_approved_overlap'
    ) THEN
        ALTER TABLE bookings
            ADD CONSTRAINT no_approved_overlap
            EXCLUDE USING gist (
                venue_id   WITH =,
                event_date WITH =,
                tsrange(
                    (event_date + start_time)::timestamp,
                    (event_date + end_time)::timestamp
                ) WITH &&
            )
            WHERE (status = 'APPROVED');
    END IF;
END
$$;

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_bookings_venue_date
    ON bookings (venue_id, event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_user
    ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status
    ON bookings (status);

-- -----------------------------------------------------------
-- 3. SEED DATA — Campus Venues (with type and status)
-- -----------------------------------------------------------
INSERT INTO venues (name, location, capacity, type, status) VALUES
    ('Main Seminar Hall',        'Block A — Ground Floor',  250, 'Seminar Hall',  'Open'),
    ('Department Seminar Hall',  'Block B — 2nd Floor',     120, 'Seminar Hall',  'Open'),
    ('Advanced IoT Lab',         'Block C — 3rd Floor',      40, 'Lab',           'Open'),
    ('Open Auditorium',          'Central Campus Grounds',  500, 'Seminar Hall',  'Open'),
    ('Mini Conference Room',     'Admin Block — Room 104',   20, 'Project Space', 'Open'),
    ('Robotics Research Lab',    'Block D — 1st Floor',      30, 'Lab',           'Open'),
    ('Innovation Hub',           'Library Building — 4th',   60, 'Project Space', 'Maintenance')
ON CONFLICT (name) DO NOTHING;
