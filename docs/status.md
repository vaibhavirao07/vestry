# Vestry — Status

## Current milestone
Phase 1 — schema written, awaiting Supabase run.

## What's done
- Reviewed SPEC.md and CLAUDE.md
- Answered 8 open design questions (wear logging, occasions, gap analysis, etc.)
- Created branch `feature/supabase-schema`
- Wrote `supabase/migrations/001_initial_schema.sql`:
  - 6 tables: categories, items, outfits, outfit_items, wear_logs, trends
  - RLS enabled on all tables with per-user policies
  - Trigger: seeds 7 default categories on new user signup
  - 3 views: item_stats, outfit_stats, gap_analysis
  - 15 SS25 trend seeds

## Next steps
1. Run `supabase/migrations/001_initial_schema.sql` in the Supabase SQL Editor
2. Create `item-images` storage bucket in Supabase dashboard (public read)
3. Add `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Scaffold `/lib/supabase.ts` client + `/types/database.ts`
5. Start Closet inventory feature (branch: `feature/closet-inventory`)
