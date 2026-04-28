---
phase: 04-classroom-builder
plan: "03"
subsystem: classroom-cards
tags: [cards, storage, upload, bottom-sheet, optimistic-update]
dependency_graph:
  requires: [04-01, 04-02]
  provides: [card-crud, file-upload, card-ui, classroom-builder-complete]
  affects: [manage-classroom-screen]
tech_stack:
  added:
    - expo-document-picker (PDF file selection)
    - expo-image-picker (image gallery selection)
    - Supabase Storage classroom-assets bucket (private, signed URLs)
  patterns:
    - TanStack Query optimistic delete (onMutate/onError/onSettled)
    - fetch→Blob conversion before Supabase Storage upload
    - SectionWithCards wrapper component to avoid hooks-in-map
    - React Native Modal for bottom sheet (no third-party library)
    - formMode state for inline text/link forms inside bottom sheet
key_files:
  created:
    - src/features/classroom/uploadClassroomFile.ts
    - src/features/classroom/useClassroomCards.ts
    - src/features/classroom/CardTypeOption.tsx
    - src/features/classroom/CardListItem.tsx
    - src/features/classroom/AddCardBottomSheet.tsx
  modified:
    - src/app/(tabs)/manage-classroom.tsx
decisions:
  - "SectionWithCards inner component wraps SectionRow + useClassroomCards/useDeleteCard to avoid calling hooks inside .map()"
  - "AddCardBottomSheet handles pickers and mutations internally — no onSelectType callback to parent"
  - "uploadClassroomFile uses fetch→blob because Supabase Storage cannot accept fileUri strings directly"
  - "getSignedUrl uses 3600s expiry (1 hour) — private bucket, never getPublicUrl"
  - "Storage file removed before DB row delete in useDeleteCard to prevent orphaned files"
metrics:
  duration: ~20min
  completed: "2026-04-06"
  tasks_completed: 4
  files_created: 5
  files_modified: 1
---

# Phase 4 Plan 3: Card Management Layer Summary

**One-liner:** Card CRUD with Supabase Storage uploads, signed URL reads, optimistic delete, and bottom sheet UI for text/link/PDF/image creation wired into ManageClassroom.

## What Was Built

### uploadClassroomFile.ts
- `uploadClassroomFile(classroomId, fileUri, fileName, mimeType)`: converts URI to Blob via `fetch()`, builds path as `{classroomId}/{Date.now()}-{fileName}`, uploads to `classroom-assets` private bucket, returns storage path (not URL)
- `getSignedUrl(storagePath)`: calls `createSignedUrl` with 3600s expiry — never `getPublicUrl`

### useClassroomCards.ts
- `useClassroomCards(sectionId)`: fetches cards ordered by `sort_order`, auto-generates signed URLs for `pdf`/`image` cards, attaches as `signedUrl` property
- `useCreateTextCard(sectionId)`: inserts text card with computed `sort_order` (max + 1000)
- `useCreateLinkCard(sectionId)`: inserts link card with `content=url`, `title=displayTitle`
- `useCreateFileCard(sectionId)`: uploads file first via `uploadClassroomFile`, then inserts card row with `storage_path`
- `useDeleteCard(sectionId)`: optimistic delete with `onMutate`/`onError`/`onSettled`; removes Storage file before deleting DB row for cards with `storage_path`

### CardTypeOption.tsx
Accessible row with Ionicons icon (`COLORS.accent`), title (16px), description (14px `COLORS.textMuted`), 44px touch target, `accessibilityRole="button"`.

### CardListItem.tsx
Compact row with type icon (`textMuted`), content preview (text: 60 chars, link: title or URL, pdf/image: filename), trash icon delete button with `accessibilityLabel="Remove card"`, `Alert.alert` confirmation ("Remove card?" / "Keep Card" / "Remove Card"), 1px `COLORS.border` bottom border.

### AddCardBottomSheet.tsx
React Native `Modal` (transparent, animationType="slide"), backdrop with `TouchableWithoutFeedback` dismiss, `borderTopLeftRadius/RightRadius: RADII.modal`, drag handle. Four `CardTypeOption` rows. `formMode` state toggles between type selection and inline text/link forms inside the sheet. PDF/image close sheet first then open picker. All mutations called directly — no callback to parent.

### manage-classroom.tsx (updated)
Added `SectionWithCards` wrapper component that combines `SectionRow` + `useClassroomCards` + `useDeleteCard` to avoid calling hooks inside `.map()`. Renders `CardListItem` children for each section. `AddCardBottomSheet` rendered once at screen level, driven by `activeSheetSectionId` state.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan 02 files were missing**
- **Found during:** Task 1 pre-check
- **Issue:** `useClassroomSections.ts`, `SectionRow.tsx`, and `manage-classroom.tsx` had never been created (Plan 02 was not executed before this session)
- **Fix:** Executed all Plan 02 tasks first: created `useClassroomSections.ts` (5 hooks with optimistic rollback), `SectionRow.tsx` (inline rename, reorder arrows, delete confirmation, Add card ghost button), `manage-classroom.tsx` (full screen with empty/loading/error states), and updated `profile.tsx` route to `manage-classroom`
- **Commit:** f9ca194

**2. [Rule 1 - Bug] Dead variable in SectionWithCards**
- **Found during:** Task 3 post-implementation review
- **Issue:** `const createFileCard_pending = false` was never used — dead code
- **Fix:** Removed the variable
- **Commit:** 270c26a

**3. [Rule 2 - Design] SectionRow extended with onMoveUp/onMoveDown props**
- **Found during:** Plan 02 execution
- **Issue:** Plan spec said SectionRow calls `reorderMutation.mutate` directly, but SectionRow only has its own section data — it cannot access adjacent sections needed for the sort_order swap
- **Fix:** Added optional `onMoveUp?: () => void` and `onMoveDown?: () => void` props. ManageClassroom passes closures that capture the adjacent section data. `useReorderSections` is called in ManageClassroomScreen where all sections are available

## Known Stubs

None. All card types are fully wired:
- Text cards: content stored in `classroom_cards.content`
- Link cards: URL in `content`, optional title in `title`
- PDF/image cards: file uploaded to Supabase Storage, path in `storage_path`, signed URL generated at read time
- Card deletion: optimistic removal + Storage cleanup

## Self-Check: PASSED

Files verified on disk:
- [x] src/features/classroom/uploadClassroomFile.ts
- [x] src/features/classroom/useClassroomCards.ts
- [x] src/features/classroom/CardTypeOption.tsx
- [x] src/features/classroom/CardListItem.tsx
- [x] src/features/classroom/AddCardBottomSheet.tsx
- [x] src/app/(tabs)/manage-classroom.tsx
- [x] src/features/classroom/useClassroomSections.ts (Plan 02 deviation)
- [x] src/features/classroom/SectionRow.tsx (Plan 02 deviation)

Commits verified:
- [x] f9ca194 — feat(04-02): section management layer
- [x] 82d2b6e — feat(04-03): upload utility and card CRUD hooks
- [x] a655bb4 — feat(04-03): card UI components and ManageClassroom wiring
- [x] 270c26a — fix(04-03): remove dead variable
