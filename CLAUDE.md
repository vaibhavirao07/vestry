# Vestry — Cursor Rules


## Project
Vestry is a Next.js 14 wardrobe app. Always read SPEC.md
before starting any task.


## Stack rules
- Next.js 14 App Router — use the /app directory, not /pages
- Tailwind CSS for ALL styling — no inline styles, no CSS modules
- Supabase JS v2 for database and auth
- TypeScript everywhere — no plain .js files
- Folder structure:
    /app          → screens and routes
    /components   → reusable UI components
    /lib          → supabase client, helpers, utils
    /hooks        → custom React hooks
    /types        → TypeScript type definitions


## Design rules
- Background: off-white #FAFAF8
- Accent: deep purple #7C5CBF
- Text: dark #1A1A2E
- Clean, minimal — no heavy gradients, no drop shadows
- All spacing in multiples of 4


## Behaviour rules
- ALWAYS show a plan and ask clarifying questions before writing code
- NEVER push directly to main branch
- NEVER delete or reset the Supabase database
- NEVER write API keys into code — always use .env.local
- Create a new git branch for every feature


## After every completed feature
- Update docs/changelog.md with what was built
- Update docs/status.md with current milestone and next steps
- Commit with message format: feat: [feature name]


## Phase constraint
Phase 1 only. Do not build or suggest anything from Phase 2
unless explicitly asked.
