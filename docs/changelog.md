# Vestry — Changelog

## [Unreleased] — feature/supabase-schema

### Added
- `supabase/migrations/001_initial_schema.sql` — full Phase 1 schema:
  - **categories**: user-owned, unique per user, seeded with 7 defaults on signup
  - **items**: closet items with Brave Search fields (name, brand, colour, image_url, source_url, price)
  - **outfits**: saved outfits with free-text `occasion` (UI suggests fixed enum)
  - **outfit_items**: junction table linking outfits ↔ items
  - **wear_logs**: outfit-level wear tracking by date
  - **trends**: global static table, 15 SS25 seeds included
  - RLS policies on every table; `outfit_items` policies join to parent outfit
  - `handle_new_user()` trigger fires on `auth.users` INSERT to seed default categories
  - `item_stats` view: versatility score, times worn, cost-per-wear per item
  - `outfit_stats` view: times worn per outfit
  - `gap_analysis` view: gap score (outfit appearances ÷ item count) per category
  - All views use `security_invoker = true` so RLS is respected
