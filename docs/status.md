# Vestry — Status

## Current milestone
Phase 2 in progress — Smart Shop (Module 9), Platform Comparison (Module 7) and Size Intelligence (Module 8) complete.

## Phase 1 — Done
- Supabase schema (6 tables, RLS, trigger, 3 views, trend seeds) ✓
- Typed Supabase clients (`lib/supabase/client.ts` + `server.ts`) ✓
- `types/database.ts` — full Database generic ✓
- `proxy.ts` — Next.js 16 auth gate (bypassed for dev; re-enable before launch) ✓
- Root layout + 5-tab BottomNav (Closet / Outfits / Gaps / Trends / Shop) ✓
- **Closet inventory** — Channel3 search-to-add, item grid, category filter, cost-per-wear ✓
- **Outfit builder** — create outfits, occasion tags, item picker, detail view ✓
- **Wear logging** — Mark as worn CTA, `wear_logs` insert, optimistic count update ✓
- **Gap analysis** — ranked by `gap_score`, proportional bars, High/Medium/Low badges ✓
- **Trend radar** — SS25 seeds grouped by category ✓

## Phase 2 — In progress

### Completed
- **Smart Shop (Module 9)** — natural language search, Claude Haiku intent parse + scoring, Channel3 product grid, 5-col Pinterest layout, compatibility % badge, est. cost-per-wear ✓
- **Platform Comparison (Module 7)** — tap card opens detail sheet; Where to Buy list (up to 5 offers sorted by price); Best price / Fastest / Best returns badges; static merchant lookup for 18 US + UAE retailers; single-offer products open direct URL ✓
- **Size Intelligence (Module 8)** — `/profile` screen (measurements with unit toggle + known brand sizes per garment); pure-logic size engine (universal ladder + per-brand fit offsets for 27 brands, no AI); size badge on Smart Shop cards; "Your Size" recommendation with reasoning in the detail sheet ✓

### Planned (not started)
- **Consumer psychology** — impulse-buy guardrails, cost-per-wear projections before purchase (revise with image-based similarity in Phase 3)
- **Inspo module** — save outfit inspiration images; match to items already in closet

## Must fix before shipping
0. **Run migration 002** — `supabase/migrations/002_profiles.sql` must be run in the Supabase SQL editor or the `/profile` screen and size recommendations return nothing.
1. **Auth redirect bug** — `proxy.ts` redirect is commented out; re-enable auth gate and remove all TEMPORARY bypass comments from page.tsx files and hooks.
2. **Channel3 multi-offer** — most products return only 1 offer from Channel3, so Platform Comparison rarely activates. Check Channel3 docs for a parameter to request multiple retailer offers per product.
3. **Consumer psychology nudges** — removed after false-positive issues with text-based style similarity. Revisit in Phase 3 with image embeddings.

## Session notes (2026-07-06)
- Built Size Intelligence on `feat/size-intelligence`: migration 002 (`profiles` + `brand_sizes`), `lib/sizeCharts.ts` (7-step ladder + 27 brand fit entries), `lib/sizes.ts` (direct → cross-brand → measurements recommendation cascade), `/profile` screen with unit toggle, ProfileLink icon in all 5 headers, size badge + "Your Size" sheet section in Smart Shop
- Engine verified with a script: direct match, runs-small/large conversions (tops + shoes half-sizes), waist-based bottoms, unknown-brand fallback, empty profile → no badge
- Measurements stored in inches/lbs; cm/kg is a display-only toggle

## Session notes (2026-07-01)
- Built Smart Shop: `/shop` route, Claude Haiku 2-step pipeline (intent parse → Channel3 → compatibility scoring), 5-col product grid, `lib/claude.ts` wrapper, `types/shop.ts`
- Built Platform Comparison: `ProductDetailSheet` bottom sheet, `PlatformRow`, `lib/merchants.ts` (18 retailers), offers extracted from Channel3 response, sorted by price, best-value badges
- Attempted consumer psychology nudges (4 rules + Claude style similarity) — removed due to false positives; text similarity too imprecise without image data
- Fixed: `CLAUDE_API_KEY` vs `ANTHROPIC_API_KEY` env var mismatch
- Fixed: `max_offers: 5` parameter broke Channel3 — removed
- Single-offer products now navigate directly to URL (skip comparison sheet)
- Unknown merchants show "Check site" / "Returns vary" instead of blank
- All work on `feat/smart-shop` branch
