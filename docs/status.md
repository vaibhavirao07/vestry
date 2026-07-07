# Vestry — Status

## Current milestone
Phase 2 feature-complete — Smart Shop (9), Platform Comparison (7), Size Intelligence (8) and Inspo (10) built.

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
- **Inspo (Module 10, web v1)** — `/inspo` mood board (6th nav tab); paste URL or upload screenshot → Claude Haiku vision extracts garments/aesthetic/occasion/palette → strict closet cross-reference (specific garment type + colour must match) → saved card; detail sheet shows ✓ owned / ✗ missing with "Find it →" deep-links into Smart Shop (`/shop?q=...` auto-search); native share sheet deferred to the mobile app ✓

### Planned (not started)
- **Consumer psychology** — impulse-buy guardrails, cost-per-wear projections before purchase (revise with image-based similarity in Phase 3)

## Must fix before shipping
0. **Run migrations 002 + 003** — `supabase/migrations/002_profiles.sql` and `003_inspo.sql` must be run in the Supabase SQL editor (003 also creates the `inspo` storage bucket) or /profile, size recommendations and Inspo saving return nothing.
1. **Auth redirect bug** — `proxy.ts` redirect is commented out; re-enable auth gate and remove all TEMPORARY bypass comments from page.tsx files and hooks.
2. **Channel3 multi-offer** — most products return only 1 offer from Channel3, so Platform Comparison rarely activates. Check Channel3 docs for a parameter to request multiple retailer offers per product.
3. **Consumer psychology nudges** — removed after false-positive issues with text-based style similarity. Revisit in Phase 3 with image embeddings.

## Session notes (2026-07-06, later)
- Built Inspo on `feat/inspo`: migration 003 (`inspo_posts` + `inspo` storage bucket), `/api/inspo` (URL resolve → Haiku vision → strict closet match), mood board UI (grid, add drawer, detail sheet), 6th nav tab, `/shop?q=` deep-link
- Verified live against the dev server: upload flow extracts garments/palette correctly; tightened the match prompt after a boots-vs-sneakers false positive (same broad category no longer sufficient — specific garment type + colour required, verified fixed); URL flow resolves og:image and returns image bytes for storage upload; bad links return a graceful "upload a screenshot" 422
- Instagram URLs blocked without API access (known limitation) — UI suggests screenshot upload; native share sheet needs the mobile app (Phase 3)

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
