# Vestry — Status

## Current milestone
✅ Phase 1 complete — all 5 features built and working.

## Phase 1 — Done
- Supabase schema (6 tables, RLS, trigger, 3 views, trend seeds) ✓
- Typed Supabase clients (`lib/supabase/client.ts` + `server.ts`) ✓
- `types/database.ts` — full Database generic ✓
- `proxy.ts` — Next.js 16 auth gate (bypassed for dev; re-enable before launch) ✓
- Root layout + 4-tab BottomNav (Closet / Outfits / Gaps / Trends) ✓
- **Closet inventory** — Channel3 search-to-add, item grid, category filter, cost-per-wear ✓
- **Outfit builder** — create outfits, occasion tags, item picker, detail view ✓
- **Wear logging** — Mark as worn CTA, `wear_logs` insert, optimistic count update ✓
- **Gap analysis** — ranked by `gap_score`, proportional bars, High/Medium/Low badges ✓
- **Trend radar** — SS25 seeds grouped by category ✓

## Must fix before Phase 2
1. **Auth redirect bug** — `proxy.ts` redirect is commented out; re-enable the auth gate block and remove the TEMPORARY bypass from all page.tsx files and hooks.
2. **Channel3 fashion filter** — `category_ids: ['xoN']` was tested but returned empty results. Investigate correct filter param with Channel3 support before re-adding.

## Phase 2 — Planned features
> Do not build until explicitly asked.

- **Smart shop** — personalised shopping recommendations based on gap analysis + wear data
- **Platform comparison** — compare same item across retailers (price, stock, sizing)
- **Size intelligence** — track what sizes fit across brands; surface sizing notes on search results
- **Consumer psychology** — impulse-buy guardrails, cost-per-wear projections before purchase
- **Inspo module** — save outfit inspiration images; match to items already in closet
