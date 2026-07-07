-- ============================================================
-- Vestry — Phase 2: Size Intelligence (profiles + brand sizes)
-- Run this in the Supabase SQL Editor (once, top to bottom)
-- ============================================================


-- ============================================================
-- TABLES
-- ============================================================

-- all measurements stored in inches / lbs (UI offers a cm/kg toggle and converts)
CREATE TABLE profiles (
  user_id     uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  height      numeric(5,1),   -- inches
  weight      numeric(5,1),   -- lbs
  bust        numeric(4,1),   -- inches
  waist       numeric(4,1),   -- inches
  hips        numeric(4,1),   -- inches
  shoe_size   numeric(3,1),   -- US women's
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- garment is 'tops' | 'bottoms' | 'shoes' — size label is free text ("M", "28", "8.5")
CREATE TABLE brand_sizes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand       text        NOT NULL,
  garment     text        NOT NULL DEFAULT 'tops' CHECK (garment IN ('tops', 'bottoms', 'shoes')),
  size        text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, brand, garment)
);

CREATE INDEX idx_brand_sizes_user_id ON brand_sizes(user_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_sizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own profile" ON profiles
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "own brand sizes" ON brand_sizes
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
