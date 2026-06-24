# Vestry — Project Spec


## What it is
An AI-powered personal wardrobe assistant. Users manage their closet,
build outfits, discover trends, and shop intentionally.


## Who it's for
Fashion-aware women aged 20-38 who overbuy because they lack clarity
on what they own and what works together.


## Phase 1 scope — build this, nothing else
1. Closet inventory — search-to-add + manual fallback + custom categories
2. Outfit builder — mix and match from closet items, save with occasion tag
3. Gap analysis — ranked list of most-needed items based on saved outfits
4. Girl math engine — cost-per-wear, wear streaks, versatility score
5. Trend radar — static weekly display only, no AI matching yet


## What done looks like per feature
- Closet: tap + → search → select result → fields auto-fill → assign
  category → Save. Manual form if no result found.
- Outfit builder: select items → name outfit → add occasion tag → Save
- Gap analysis: sorted list of item types missing from saved outfits
- Girl math: every item shows cost-per-wear. Every outfit shows
  versatility score and times worn.
- Trend radar: display trending items by category, updated weekly


## NOT building in Phase 1
Smart shop, platform comparison, size intelligence, consumer
psychology, Inspo/share-sheet, social features, AR, direct checkout


## Tech stack
- Framework: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Backend + Database: Supabase
- Auth: Supabase Auth
- AI: Claude API — Haiku for cheap calls, Sonnet for reasoning
- Storage: Supabase Storage for item photos
- Hosting: Vercel (free tier)


## User interactions
Add item: tap + → type name → search results appear → tap result →
fields auto-fill (name, brand, category, colour) → user edits if needed
→ assign/create category → tap Save


Add category: tap + next to Categories → type name → confirm


Build outfit: Outfits tab → tap + → tap items to select → name outfit
→ add occasion tag → tap Save
