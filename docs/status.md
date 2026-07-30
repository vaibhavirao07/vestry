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
0. **Run migrations 002, 003, 004** — `supabase/migrations/002_profiles.sql`, `003_inspo.sql`, and `004_outfit_calendar.sql` must be run in the Supabase SQL editor (003 creates the `inspo` storage bucket, 004 adds worn_date + photo_url columns to outfits table)
1. **Channel3 multi-offer** — most products return only 1 offer from Channel3, so Platform Comparison rarely activates. Check Channel3 docs for a parameter to request multiple retailer offers per product.
2. **Consumer psychology nudges** — removed after false-positive issues with text-based style similarity. Revisit in Phase 3 with image embeddings.

## Session notes (2026-07-30)
- Redesigned Outfits tab as personal style calendar with mood board collages (replaced photo upload feature)
- Built components: `OutfitCalendar` (monthly grid Mon-Sun), `MoodBoardCollage` (reusable renderer), `DayPickerSheet` (category-sorted item picker), `OutfitDaySheet` (full view + inline edit)
- Collage layout: organic scattered arrangement with random rotations (-8° to +8°), varying sizes (60–120px), overlapping with z-index stagger, +N badge for overflow (max 8 items displayed)
- Mood board features: edit inline (tap filled cell → modify items → save), delete with confirmation, today's date highlighted with purple border, blocks future dates
- Auto-generate outfit names from date ("July 23"), create one wear_log per selected item (accurate item stats), support editing existing outfits to change items
- API routes: GET /api/outfits?year=YYYY&month=MM (fetch month with items), POST (create outfit + wear logs), PATCH (update items + wear logs), DELETE (cascade delete)
- Fixed: API response format to use outfit_id instead of id, column name worn_at in wear_logs inserts
- Added debugging console logs to track outfit save/render

## Session notes (2026-07-23)
- Fixed auth system: enabled proxy.ts auth gate, fixed Tailwind CSS font variable issue in @theme inline, fixed static assets exclusion from auth redirect
- Added sign out button to `/profile` screen (destructive red style, calls supabase.auth.signOut() and redirects to /auth/login)
- Closet UX improvements: grid changed from 2-col to 6-col with compact square cards (image + 1-line name/brand), gap reduced for tighter spacing
- Built closet item detail sheet: tap item card → bottom sheet with image/name/brand/category, cost per wear, times worn count, outfit list (lazy-loaded from API), Edit button (opens drawer pre-filled), Delete button (browser confirm dialog)
- Search quality fixes: increased results from 8 to 20, filter out suspiciously low prices (<$5), show "No price available" label instead of blank
- Brand detection in search: detect first 1-2 words as known brand, restructure query to prioritize brand (e.g., "cotton on ribbed pink" → "Cotton On ribbed pink women") to improve Channel3 matching; 22 brands supported
- All work merged to main and pushed

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
