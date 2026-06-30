# Vestry — Status

## Current milestone
Phase 1 — Closet inventory complete. Needs auth screens before the app is usable end-to-end.

## What's done
- Supabase schema (6 tables, RLS, trigger, 3 views, trend seeds) ✓
- `lib/supabase/client.ts` + `server.ts` — typed Supabase clients ✓
- `types/database.ts` — full Database generic with Relationships fields ✓
- `proxy.ts` — Next.js 16 auth gate ✓
- `app/(main)/layout.tsx` + `BottomNav` — 4-tab shell ✓
- `app/(main)/closet/page.tsx` — server-side data fetch from `item_stats` view ✓
- `ClosetView` — 2-col grid, category filter, FAB, optimistic item add ✓
- `AddItemDrawer` — 2-step flow: Brave Search → auto-fill form → save ✓
- `ItemCard` — image, name, brand, cost-per-wear display ✓
- `hooks/useAddItem` — Supabase insert with optimistic update ✓
- `app/api/search/route.ts` — Brave Search proxy ✓

## Blocked on
Auth screens (`/auth/login`, `/auth/signup`) — proxy.ts redirects unauthenticated users there but the pages don't exist yet

## Next steps
1. Add `BRAVE_API_KEY` to `.env.local`
2. Build `feature/auth` — login + signup screens using Supabase Auth
3. Build `feature/outfit-builder` — outfit creation screen
4. Build `feature/gap-analysis` — gap analysis screen
5. Build `feature/trends` — trend radar screen
