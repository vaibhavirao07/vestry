# Vestry — Changelog

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
