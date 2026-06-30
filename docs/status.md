# Vestry — Status

## Current milestone
Phase 1 — Closet inventory built and working. Search-to-add blocked on Serper API key. Outfit builder next.

## What's done
- Supabase schema (6 tables, RLS, trigger, 3 views, trend seeds) ✓
- `lib/supabase/client.ts` + `server.ts` — typed Supabase clients ✓
- `types/database.ts` — full Database generic with Relationships fields ✓
- `proxy.ts` — Next.js 16 auth gate ✓
- `app/(main)/layout.tsx` + `BottomNav` — 4-tab shell ✓
- `app/(main)/closet/page.tsx` — server-side data fetch from `item_stats` view ✓
- `ClosetView` — 2-col grid, category filter, FAB, optimistic item add ✓
- `AddItemDrawer` — 2-step flow: search → auto-fill form → save ✓
- `ItemCard` — image, name, brand, cost-per-wear display ✓
- `hooks/useAddItem` — Supabase insert with optimistic update ✓
- `app/api/search/route.ts` — Serper shopping search proxy ✓
- Default categories seeded for test user (`8c0e85d4-ec0e-48eb-8f28-25331d35c0a9`) ✓

## Current state

### Auth
**Temporarily bypassed for testing — NOT production-ready.**
`proxy.ts` redirect-to-login is commented out; `closet/page.tsx` skips the auth check.
Must be re-enabled before launch.

### Closet inventory
Working. Categories seeded correctly for test user; dropdown populates; items can be added manually.

### Search-to-add
**Blocked.** `SERPER_API_KEY` in `.env.local` returns `403 Unauthorized` from both
`/shopping` and `/search` endpoints. Route code is correct — the key itself is invalid/over-quota.

Debugging steps taken:
- Confirmed route reads `SERPER_API_KEY` (correct env var name) ✓
- Direct curl to Serper returns `{"message":"Unauthorized.","statusCode":403}` ✓
- Local `/api/search?q=hollister` returns `{"results":[]}` (empty because `!res.ok` branch fires) ✓

**Next action:** replace key in `.env.local` with a valid key from serper.dev, then verify with:
```
curl -s -X POST https://google.serper.dev/shopping \
  -H "X-API-KEY: <new-key>" \
  -H "Content-Type: application/json" \
  -d '{"q": "hollister jeans", "num": 2}'
```
Expected: JSON with `shoppingResults` array. If 200, search is unblocked.

### Outfit builder
Plan approved, not yet built. Branch: `feature/outfit-builder` (not created yet).

## Next session
1. Verify new Serper key works via curl test above.
2. If search unblocked → smoke-test search-to-add flow end-to-end.
3. If search debugging takes too long → move on to outfit builder and return to search after.
4. Re-enable auth gate before any production deploy.

## One Supabase dashboard setting
Authentication → Settings → disable **"Enable email confirmations"** for instant post-signup redirect to /closet.
