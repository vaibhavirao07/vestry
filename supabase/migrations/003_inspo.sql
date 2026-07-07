-- ============================================================
-- Vestry — Phase 2: Inspo mood board (Module 10)
-- Run this in the Supabase SQL Editor (once, top to bottom)
-- ============================================================


-- ============================================================
-- TABLE
-- ============================================================

-- garments jsonb: [{ name, category, colour, descriptors[], brand_guess, owned_item_name }]
-- owned_item_name is resolved against the closet at save time and stored denormalised
CREATE TABLE inspo_posts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_url  text,               -- null for direct image uploads
  image_url   text        NOT NULL,
  aesthetic   text,
  occasion    text,
  palette     text[]      NOT NULL DEFAULT '{}',
  garments    jsonb       NOT NULL DEFAULT '[]',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_inspo_posts_user_id ON inspo_posts(user_id);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE inspo_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own inspo posts" ON inspo_posts
  FOR ALL
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- STORAGE — bucket for uploaded inspo images
-- Files are stored under <user_id>/<uuid>.<ext>
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('inspo', 'inspo', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "inspo images publicly readable" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'inspo');

CREATE POLICY "users upload own inspo images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'inspo' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "users delete own inspo images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'inspo' AND auth.uid()::text = (storage.foldername(name))[1]);
