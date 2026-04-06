# Phase 4: Classroom Builder - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

A tutor can build the full content structure of their classroom — named sections in any order, with material cards (text note, PDF, image, link) inside each section. The tutor manages sections and cards from a dedicated "Manage Classroom" screen.

Entry point: Profile tab "My Classroom" card. Exit point: tutor has a classroom with at least one section and one card, fully browsable from the management view.

No student discovery, no subscriptions, no DMs — those are Phases 5 and 6. This phase is tutor content creation only.

</domain>

<decisions>
## Implementation Decisions

### Classroom Manager Screen
- **D-01:** Tapping "My Classroom" in the Profile tab navigates to a new dedicated "Manage Classroom" screen (new route: `/(tabs)/manage-classroom` or similar). This screen lists the classroom's sections and their cards.
- **D-02:** The "Manage Classroom" screen has a settings icon (gear/cog) in the header that navigates to the existing `/(tabs)/classroom-settings` screen (name, bio, price, subjects). Clean separation: content management vs. classroom metadata.
- **D-03:** Profile tab code currently routes `router.push('/(tabs)/classroom-settings')` — this must be updated to push to the new manage-classroom route instead.

### Section Management
- **D-04:** Sections are listed vertically. Each section shows its name, a card count or card list below it, and action controls (rename, delete, reorder).
- **D-05:** Section reordering uses up/down arrow icon buttons on each section row. No drag-and-drop library required. Tapping ↑ or ↓ swaps the section with its neighbour and immediately saves the new `sort_order` to Supabase.
- **D-06:** Rename: tap the section name to edit it inline (TextInput replaces the label on tap). Confirm with return key or blur. No separate rename modal.
- **D-07:** Delete: destructive action — show a confirmation before deleting. Deleting a section also deletes all cards inside it (cascade). One-tap with confirm, not a swipe gesture.

### Card Management
- **D-08:** Each section has a "+" button (or "Add card" text button) at the bottom of its card list. Tapping it opens a bottom sheet with four options: Text note, PDF, Image, Link.
- **D-09:** Bottom sheet uses `RADII.modal` (24px) styling, consistent with the established modal pattern.
- **D-10:** Text note card: tutor types content into a multiline TextInput. Stored as plain text in `content` column. No rich text / markdown for v1.0.
- **D-11:** Link card: tutor pastes a URL and optionally adds a display title. Stored as URL + title in the card row.
- **D-12:** PDF and image cards use Supabase Storage with signed URLs. Tutors pick a file from their device (expo-document-picker for PDFs, expo-image-picker for images). Files upload to a Supabase Storage bucket (`classroom-assets`). Card stores the storage path; the app generates a short-lived signed URL at read time. This prevents link-sharing between non-subscribers.
- **D-13:** Card deletion: each card has a delete button (trash icon). Single tap with confirmation. No swipe-to-delete.
- **D-14:** Cards display as a compact list inside each section — card type icon + content preview (title for link, first ~60 chars for text, filename for PDF/image). No full content view in the management screen.

### Supabase Schema
- **D-15:** New table `classroom_sections`: `id`, `classroom_id` (FK → classrooms), `name`, `sort_order` (integer), `created_at`, `updated_at`. RLS: tutor can CRUD their own sections only.
- **D-16:** New table `classroom_cards`: `id`, `section_id` (FK → classroom_sections), `card_type` (enum: `text` | `pdf` | `image` | `link`), `content` (text, nullable — text note content or link URL), `title` (text, nullable — link display title or file name), `storage_path` (text, nullable — Supabase Storage path for PDF/image), `sort_order` (integer), `created_at`, `updated_at`. RLS: tutor can CRUD cards in their own classroom only.
- **D-17:** Supabase Storage bucket `classroom-assets` — private bucket. RLS policy: authenticated user can upload if they are the tutor for the classroom. Read access: signed URL generation server-side or via Supabase's `createSignedUrl` API.
- **D-18:** `src/types/database.ts` must be updated to add `ClassroomSection` and `ClassroomCard` row/insert/update types (manual stub until generated types).

### Data Fetching Pattern
- **D-19:** TanStack Query fetches sections and their cards together for a classroom (join query or two queries). Query key: `['classroom-sections', classroomId]`. Mutations for create/rename/delete/reorder sections and create/delete cards.
- **D-20:** Optimistic updates for reorder and delete — feel instant on the UI without waiting for Supabase round-trip.

### Claude's Discretion
- Exact layout of section header row (section name left, action buttons right)
- Loading and error states for file uploads (progress indicator style)
- Empty state for a classroom with no sections ("Add your first section")
- Empty state for a section with no cards ("Add your first card")
- Exact bottom sheet card-type option layout (icon + label + short description)
- Sort order integer strategy (increment by 1000 to allow easy insertion vs. reindex on every move)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §Classroom Sections — CLASS-01, CLASS-02, CLASS-03
- `.planning/REQUIREMENTS.md` §Material Cards — CARD-01, CARD-02, CARD-03, CARD-04, CARD-05
- `.planning/ROADMAP.md` §Phase 4 — Phase goal, success criteria, dependency on Phase 3

### Codebase Files to Read Before Implementing
- `src/app/(tabs)/profile.tsx` — MODIFY: update `router.push` target from `classroom-settings` to `manage-classroom`
- `src/app/(tabs)/classroom-settings.tsx` — Read to understand existing form pattern; will be linked from manage-classroom header
- `src/features/tutor/useClassroom.ts` — Read to understand TanStack Query + Supabase pattern for tutor data
- `src/features/ui/theme.ts` — All new components MUST use these tokens (no hardcoded values)
- `src/features/ui/Card.tsx` — May be reusable for section and card list items
- `src/types/database.ts` — ADD classroom_sections and classroom_cards types here

### Phase 3 Context (locked navigation and tutor decisions)
- `.planning/phases/03-tutor-onboarding/03-CONTEXT.md` — D-11 to D-12 (tutor nav and Profile tab conditional rendering), D-09 (classroom settings screen pattern)

### Project Stack Reference
- `CLAUDE.md` §Technology Stack — Expo SDK, Supabase React Native patterns, Supabase Storage, expo-document-picker, expo-image-picker

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/features/ui/theme.ts` — All design tokens ready. `RADII.modal = 24` for bottom sheet. `COLORS.surface` for card backgrounds.
- `src/features/ui/Card.tsx` — Existing card component with shadow and rounded corners. Reuse for section rows and card list items.
- `src/features/ui/Button.tsx` — Existing button component. Reuse for CTA buttons in empty states.
- `src/features/tutor/useClassroom.ts` — TanStack Query pattern for tutor-scoped Supabase queries. Copy this pattern for `useClassroomSections` and `useClassroomCards` hooks.
- `src/features/tutor/SubjectTagInput.tsx` — Tag chip pattern. Not directly reusable but shows how interactive lists are built.
- `src/app/(tabs)/classroom-settings.tsx` — Form pattern (TextInput, ScrollView, CTA button). Reuse for card content forms.

### Established Patterns
- Thin screen files in `src/app/` — all business logic and query hooks in `src/features/tutor/`
- TanStack Query for all Supabase fetches — `useQuery` + `useMutation` with `queryClient.invalidateQueries`
- `useAuthStore` to get `session.user.id` for all user-scoped queries
- RLS: policies on `classrooms` use tutor join pattern — new tables follow the same pattern
- `Database` type from `src/types/database.ts` used for all table row types — add new tables here

### Integration Points
- `src/app/(tabs)/profile.tsx` — Update `router.push` target to new manage-classroom route
- New screen: `src/app/(tabs)/manage-classroom.tsx` — Classroom content management (sections + cards)
- New feature folder: `src/features/classroom/` — sections query hooks, card mutation hooks, upload utilities
- `src/types/database.ts` — Add `ClassroomSection` and `ClassroomCard` types
- Supabase: new tables `classroom_sections` + `classroom_cards`, new storage bucket `classroom-assets`

</code_context>

<specifics>
## Specific Ideas

- Content piracy concern: signed URLs are the chosen mitigation. PDF/image cards should never expose a raw public URL — always generate a signed URL with short expiry (e.g. 1 hour) when rendering the card.
- The "Manage Classroom" screen is the tutor's primary workspace in v1.0. It should feel calm and organised — not a cluttered CMS. Sections as clear blocks, cards as compact items inside each block.

</specifics>

<deferred>
## Deferred Ideas

- Screenshot prevention / DRM — platform limitation, not buildable for MVP
- Card reordering within a section — not in Phase 4 scope (sections reorder; cards within a section are add/delete only for v1.0)
- Rich text / markdown for text note cards — v1.1 if tutors request it
- Video cards — high complexity, deferred
- Duplicate section / card — deferred
- Bulk card upload — deferred

</deferred>

---

*Phase: 04-classroom-builder*
*Context gathered: 2026-04-06*
