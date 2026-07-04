-- Drop legacy lost & found tables
DROP TABLE IF EXISTS lost_found_posts CASCADE;
DROP TABLE IF EXISTS campus_locations CASCADE;

-- Create campus locations table
CREATE TABLE campus_locations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(128) UNIQUE NOT NULL
);

-- Create lost & found posts table (including image column)
CREATE TABLE lost_found_posts (
  id SERIAL PRIMARY KEY,
  category VARCHAR(16) NOT NULL, -- 'Lost' or 'Found'
  item_name VARCHAR(180) NOT NULL,
  description TEXT NOT NULL,
  location_id INTEGER NOT NULL REFERENCES campus_locations(id) ON DELETE CASCADE,
  contact_email VARCHAR(180) NOT NULL,
  contact_phone VARCHAR(40),
  contact_info TEXT, -- combined or optional additional info
  image TEXT, -- Base64 data string or external URL
  status VARCHAR(64) NOT NULL DEFAULT 'Available', -- 'Available', 'Claim pending', 'Claimed', 'Ready for pickup'
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '14 days',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed campus locations
INSERT INTO campus_locations(name) VALUES 
('Library Commons'),
('Student Center'),
('Chemistry Building'),
('Engineering Quad'),
('Campus Canteen'),
('Sports Complex'),
('Other Area')
ON CONFLICT (name) DO NOTHING;

-- Seed lost & found posts with high-quality placeholder image links
INSERT INTO lost_found_posts(category, item_name, description, location_id, contact_email, contact_phone, contact_info, image, status, posted_at, expires_at, created_at)
VALUES 
('Found', 'Blue commuter backpack', 'Black and blue backpack with a silver water bottle sleeve and campus ID badge attached.', 1, 'backpack-owner@campus.edu', '+18005551234', 'Email or text. Located in Library Room 204.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80', 'Available', NOW() - INTERVAL '2 days', NOW() + INTERVAL '12 days', NOW() - INTERVAL '2 days'),
('Lost', 'Silver key ring', 'Metal key ring with three keys, one red plastic tag, and a handwritten name label inside.', 3, 'chemkeys@campus.edu', '+18005559876', 'Call if found. Reward offered.', 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500&q=80', 'Claim pending', NOW() - INTERVAL '5 days', NOW() + INTERVAL '9 days', NOW() - INTERVAL '5 days'),
('Found', 'Student ID wallet', 'Brown leather wallet with student ID, library card, and a few receipts inside.', 2, 'id-wallet@campus.edu', '+18005553421', 'Can pick up at front desk.', 'https://images.unsplash.com/photo-1627124089633-8fc6d5d05aa2?w=500&q=80', 'Ready for pickup', NOW() - INTERVAL '1 day', NOW() + INTERVAL '13 days', NOW() - INTERVAL '1 day'),
('Lost', 'Noise-cancelling earphones', 'Black over-ear earphones in a branded carrying pouch with a zipper pull.', 4, 'earphones-owner@campus.edu', '+18005555678', 'Lost near the benches.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80', 'Available', NOW() - INTERVAL '10 days', NOW() + INTERVAL '4 days', NOW() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;
