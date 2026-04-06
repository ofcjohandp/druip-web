---
phase: 04-classroom-builder
plan: "01"
subsystem: database
tags: [supabase, migration, rls, typescript, expo-packages]

requires:
  - phase: 04-00
    provides: classroom test stubs and phase scaffolding

provides:
  - classroom_sections table in Supabase with RLS
  - classroom_cards table in Supabase with RLS
  - CardType TypeScript union type
  - expo-document-picker package installed
  - expo-image-picker package installed
  - classroom-assets private storage bucket in Supabase

affects: [04-02, 04-03, 04-04]

tech-stack:
  added: [expo-document-picker ~14.0.8, expo-image-picker ~17.0.10]
  patterns:
    - RLS nested subquery chain auth.uid() through tutors table
    - TEXT CHECK constraint for enums instead of Postgres enum type
    - sort_order INTEGER DEFAULT 1000 gap strategy for ordering

key-files:
  created:
    - supabase/migrations/00006_classroom_sections_cards.sql
  modified:
    - src/types/database.ts
    - package.json
    - package-lock.json

key-decisions:
  - "Used TEXT + CHECK constraint for card_type instead of Postgres enum to avoid migration complexity"
  - "sort_order uses INTEGER DEFAULT 1000 gap strategy — room for insertion without full reindex"
  - "RLS policies use nested subquery chain through tutors table to auth.uid() — same pattern as Phase 3"
  - "npm install --legacy-peer-deps used for packages due to pre-existing react-dom/react peer conflict"

patterns-established:
  - "RLS pattern: nested subquery chain (auth.uid() -> tutors -> classrooms -> classroom_sections -> classroom_cards)"
  - "Private storage bucket classroom-assets accessed via createSignedUrl only"

requirements-completed: [CLASS-01, CLASS-02, CLASS-03, CARD-01, CARD-02, CARD-03, CARD-04, CARD-05]

duration: ~20min
completed: 2026-04-06
---

# Phase 4 Plan 01: Database Foundation Summary

**classroom_sections and classroom_cards tables live in Supabase with 8 RLS policies, CardType union type, expo file-picker packages, and private classroom-assets storage bucket**

## Performance

- **Duration:** ~20 min
- **Completed:** 2026-04-06
- **Tasks:** 3 (2 auto + 1 human-action checkpoint)
- **Files modified:** 4

## Accomplishments

- `classroom_sections` and `classroom_cards` tables created and pushed to live Supabase project
- Full RLS: 8 policies total (4 per table: SELECT, INSERT, UPDATE, DELETE) using auth.uid() nested subquery chain
- TypeScript types added to `src/types/database.ts` — CardType, classroom_sections, classroom_cards all importable
- `expo-document-picker` and `expo-image-picker` installed at SDK-compatible versions
- Private `classroom-assets` storage bucket created in Supabase (reads via signed URL only)

## Task Commits

1. **Task 1: Create Supabase migration** - `6de428d` (feat)
2. **Task 2: Update TypeScript types and install Expo packages** - `4648644` (feat)
3. **Task 3: Push Supabase schema and create storage bucket** — Human action (migration applied to live DB by user; no code commit)

**Partial plan metadata:** `3cfb8fc` (docs: partial summary pre-Task-3)

## Files Created/Modified

- `supabase/migrations/00006_classroom_sections_cards.sql` — Migration creating both tables with RLS
- `src/types/database.ts` — Added CardType, classroom_sections, classroom_cards types
- `package.json` — Added expo-document-picker and expo-image-picker
- `package-lock.json` — Updated lockfile

## Decisions Made

- **TEXT CHECK over Postgres enum for card_type**: Avoids migration complexity of adding/removing enum values later; CHECK constraint achieves the same validation with simpler migration path.
- **sort_order INTEGER DEFAULT 1000**: Gap strategy allows insertion between items without reindexing all rows. Card reorder deferred to post-MVP.
- **RLS subquery chain depth**: classroom_cards uses the deepest chain (auth.uid() -> tutors -> classrooms -> classroom_sections). Keeps authorization in the database, not application layer — consistent with Phase 3 pattern.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] npx expo install failed due to pre-existing peer dependency conflict**
- **Found during:** Task 2 (package installation)
- **Issue:** `react-dom@19.2.4` requires `react@^19.2.4` but project has `react@19.1.0` — pre-existing conflict unrelated to the packages being installed
- **Fix:** Used `npm install --legacy-peer-deps` instead of `npx expo install`. Both packages installed at SDK-compatible versions (14.0.8 and 17.0.10).
- **Files modified:** package.json, package-lock.json
- **Committed in:** 4648644 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (blocking — package installation method)
**Impact on plan:** Installation workaround only; package versions are correct. No scope changes.

## Issues Encountered

None beyond the npm/expo install peer conflict documented above.

## User Setup Required

Task 3 required two manual steps that cannot be automated:

1. **Migration push** — `npx supabase db push` applied `00006_classroom_sections_cards.sql` to the live Supabase project. Completed by user.
2. **Storage bucket** — `classroom-assets` private bucket created via Supabase Dashboard. Completed by user.

Both confirmed complete by user response "done".

## Known Stubs

None — this plan creates only database schema, types, and packages. No UI components or data-fetching code.

## Next Phase Readiness

- Database foundation complete — `classroom_sections` and `classroom_cards` exist in live Supabase with full RLS
- TypeScript types ready for use in 04-02 (Section management UI)
- expo-document-picker and expo-image-picker ready for 04-03/04-04 (card creation)
- classroom-assets storage bucket ready for file upload flows
- No blockers for 04-02

## Self-Check: PASSED

- [x] supabase/migrations/00006_classroom_sections_cards.sql exists
- [x] src/types/database.ts contains classroom_sections, classroom_cards, CardType
- [x] package.json contains expo-document-picker and expo-image-picker
- [x] Commits 6de428d and 4648644 verified in git log
- [x] Migration pushed to live Supabase (user confirmed)
- [x] classroom-assets private storage bucket created (user confirmed)

---
*Phase: 04-classroom-builder*
*Completed: 2026-04-06*
