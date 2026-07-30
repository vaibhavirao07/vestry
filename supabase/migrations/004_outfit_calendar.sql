-- ============================================================
-- Vestry — Outfit Calendar Schema
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Add columns to outfits table for calendar functionality
ALTER TABLE outfits
ADD COLUMN photo_url text,
ADD COLUMN worn_date date;

-- Index for efficient calendar queries (fetch all outfits for a month)
CREATE INDEX idx_outfits_user_worn_date ON outfits(user_id, worn_date);
