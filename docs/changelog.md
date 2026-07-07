# Vestry — Changelog

## [Unreleased] — feat/inspo

### Added
- `supabase/migrations/003_inspo.sql` — `inspo_posts` table (garments as jsonb, palette text[], RLS) + public `inspo` Storage bucket with per-user upload/delete policies — **run in Supabase SQL editor before using the feature**
- `types/inspo.ts` — `InspoGarment`, `InspoAnalysis`, `ClosetItemLite`; `types/database.ts` extended with `inspo_posts`
- `lib/claude.ts` — `callHaikuVision()` (base64 image + text → Claude Haiku vision)
- `app/api/inspo/route.ts` — POST: resolves a pasted URL to an image (TikTok oEmbed → og:image scrape; Instagram usually blocked → suggests screenshot) or accepts an uploaded image, runs Claude vision analysis (aesthetic, occasion, palette, garments), then a strict closet-matching call (same specific garment type + colour required; hallucinated names rejected against the real closet list)
- `app/(main)/inspo/page.tsx` + `components/inspo/` — 2-col mood board grid (`InspoCard` with "N of M owned" count), `AddInspoDrawer` (paste URL / upload → analysing spinner → structured preview → save), `InspoDetailSheet` (image, aesthetic/occasion/palette chips, garment checklist with ✓ owned / ✗ missing + "Find it →" links, delete)
- `hooks/useAddInspo.ts` — Storage upload to `inspo/<user_id>/<uuid>`, `inspo_posts` insert, delete with best-effort storage cleanup
- `components/ui/BottomNav.tsx` — 6th "Inspo" tab (sparkles icon)
- Smart Shop deep-link: `/shop?q=...` auto-runs the search on mount (`initialQuery` prop on `ShopView`) — missing inspo garments link straight into Smart Shop

## [Unreleased] — feat/size-intelligence

### Added
- `supabase/migrations/002_profiles.sql` — `profiles` (measurements in inches/lbs + US shoe size) and `brand_sizes` (brand + garment + size, unique per user/brand/garment) tables with RLS — **run in Supabase SQL editor before using the feature**
- `types/profile.ts` — `Garment`, `SizeProfile`, `SizeRecommendation` types; `types/database.ts` extended with `profiles` + `brand_sizes`
- `lib/sizeCharts.ts` — universal 7-step size ladder (XXS–XXL with US numeric, bust/waist/hips ranges) + fit data (runs small / true / large per garment) for 27 brands
- `lib/sizes.ts` — pure-logic recommendation engine: direct saved size → cross-brand conversion via ladder + fit offsets → measurements fallback; garment detected from product-name keywords (tops / bottoms / shoes)
- `app/(main)/profile/page.tsx` + `components/profile/ProfileView.tsx` — measurements form with in/lbs ↔ cm/kg toggle (stored imperial), brand-sizes editor (add with brand datalist + garment select, delete)
- `hooks/useProfile.ts` — `saveMeasurements` (upsert), `addBrandSize` (upsert on user/brand/garment), `removeBrandSize`
- `components/ui/ProfileLink.tsx` — person icon linking to `/profile`, added to all 5 page headers
- Smart Shop: size badge on result cards (bottom-left of image), "Your Size" section in `ProductDetailSheet` with recommendation + reasoning, or a link to Profile when no data

## [Unreleased] — feat/smart-shop

### Added
- `app/(main)/shop/page.tsx` — Smart Shop screen; fetches closet + gap data server-side, builds `ClosetSummary`
- `app/api/shop/route.ts` — POST handler: Claude intent parse → Channel3 search → Claude scoring pipeline
- `lib/claude.ts` — `callHaiku(system, user, maxTokens?)` wrapper around `@anthropic-ai/sdk`
- `lib/merchants.ts` — static lookup for 18 US + UAE retailers (name, return days, delivery, delivery_min)
- `types/shop.ts` — `ParsedIntent`, `ShopResult`, `ShopOffer`, `ClosetSummary` types
- `components/shop/ShopView.tsx` — search bar, example query chips, 5-col product grid, loading skeleton
- `components/shop/ShopResultCard.tsx` — square card with compatibility % badge, price, est. CPW; opens sheet if 2+ offers, else navigates directly
- `components/shop/ProductDetailSheet.tsx` — bottom sheet (matches BuildOutfitDrawer); product summary + Where to Buy list + best-value badges
- `components/shop/PlatformRow.tsx` — retailer row: name, badges (Best price / Fastest / Best returns), delivery, returns, Buy link; "Check site" / "Returns vary" for unknown merchants
- `components/ui/BottomNav.tsx` — added 5th Shop tab (shopping bag icon)
- `@anthropic-ai/sdk` added to dependencies

### Attempted and reverted
- Consumer psychology nudges (4 rules: duplicate, unworn, mismatch, impulse + Claude style similarity check) — removed after repeated false positives. Text-based style similarity not precise enough without image embeddings. Will revisit in Phase 3.

## [Unreleased] — feature/closet-inventory

### Added
- `lib/supabase/client.ts` / `server.ts` — browser + server Supabase clients typed against Database
- `types/database.ts` — hand-written Database generic matching the schema (includes `Relationships: []` per Supabase v2 requirement)
- `proxy.ts` — Next.js 16 auth gate; unauthenticated users redirected to `/auth/login`
- `app/(main)/layout.tsx` — authenticated shell with `BottomNav` and `h-dvh` layout
- `components/ui/BottomNav.tsx` — 4-tab nav (Closet / Outfits / Gaps / Trends), active state via `usePathname`
- `app/(main)/closet/page.tsx` — Server Component; fetches `item_stats` view + categories in parallel
- `components/closet/ClosetView.tsx` — client component; 2-col grid, category filter, FAB, optimistic item insert
- `components/closet/CategoryFilter.tsx` — horizontally scrollable category pills
- `components/closet/ItemCard.tsx` — item tile with image, name, brand, cost-per-wear (∞ when null)
- `components/closet/AddItemDrawer.tsx` — slide-up bottom sheet; Channel3 search (debounced 400 ms), auto-fill/manual form
- `components/closet/ItemForm.tsx` — controlled form (name, brand, colour, price, category *, notes)
- `hooks/useAddItem.ts` — Supabase `items.insert` with optimistic return for instant UI update
- `app/api/search/route.ts` — Channel3 API proxy; returns `{ name, brand, image_url, source_url, price }`
- `next.config.ts` updated — wildcard HTTPS `remotePatterns` for external product images
- `app/globals.css` updated — Tailwind v4 `@theme` with brand tokens (`surface`, `accent`, `ink`)

## [0.1.0] — feature/supabase-schema

### Added
- `supabase/migrations/001_initial_schema.sql` — full Phase 1 schema:
  - **categories**: user-owned, unique per user, seeded with 7 defaults on signup
  - **items**: closet items with Channel3 search fields (name, brand, colour, image_url, source_url, price)
  - **outfits**: saved outfits with free-text `occasion`
  - **outfit_items**: junction table linking outfits ↔ items
  - **wear_logs**: outfit-level wear tracking by date
  - **trends**: global static table, 15 SS25 seeds included
  - RLS policies on every table
  - `handle_new_user()` trigger fires on `auth.users` INSERT to seed default categories
  - `item_stats` view: versatility score, times worn, cost-per-wear per item
  - `outfit_stats` view: times worn per outfit
  - `gap_analysis` view: gap score (outfit appearances ÷ item count) per category
  - All views use `security_invoker = true` so RLS is respected
