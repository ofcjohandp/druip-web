# Phase 4: Classroom Builder - Research

**Researched:** 2026-04-06
**Domain:** React Native / Expo — Supabase Storage, file pickers, TanStack Query mutations, bottom sheet UI
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Classroom Manager Screen**
- D-01: Profile tab "My Classroom" navigates to new `/(tabs)/manage-classroom` route
- D-02: Gear icon in manage-classroom header navigates to `/(tabs)/classroom-settings`
- D-03: `profile.tsx` must update `router.push` target from `classroom-settings` to `manage-classroom`

**Section Management**
- D-04: Sections listed vertically with name, card count/list, action controls (rename, delete, reorder)
- D-05: Reordering uses ↑/↓ arrow icon buttons — no drag-and-drop library. Tapping swaps neighbour and saves `sort_order` to Supabase immediately
- D-06: Rename is inline — TextInput replaces label on tap; confirm with return/blur; no separate modal
- D-07: Delete shows confirmation before deleting; cascade deletes all cards; single tap with confirm, not swipe

**Card Management**
- D-08: "+" or "Add card" button at bottom of each section's card list opens a bottom sheet with four options: Text note, PDF, Image, Link
- D-09: Bottom sheet uses `RADII.modal` (24px) styling
- D-10: Text note stored as plain text in `content` column — no rich text/markdown for v1.0
- D-11: Link card stores URL + optional display title
- D-12: PDF and image use Supabase Storage with signed URLs. `expo-document-picker` for PDFs, `expo-image-picker` for images. Bucket: `classroom-assets`. Card stores storage path; signed URL generated at read time
- D-13: Card deletion — trash icon, single tap with confirmation, no swipe-to-delete
- D-14: Cards display as compact list — card type icon + content preview (title for link, ~60 chars for text, filename for PDF/image)

**Supabase Schema**
- D-15: New table `classroom_sections`: `id`, `classroom_id` (FK → classrooms), `name`, `sort_order` (int), `created_at`, `updated_at`. RLS: tutor can CRUD own sections only
- D-16: New table `classroom_cards`: `id`, `section_id` (FK → classroom_sections), `card_type` (enum: `text|pdf|image|link`), `content` (text nullable), `title` (text nullable), `storage_path` (text nullable), `sort_order` (int), `created_at`, `updated_at`. RLS: tutor can CRUD cards in own classroom only
- D-17: Supabase Storage bucket `classroom-assets` — private. Authenticated tutor can upload. Read via `createSignedUrl`
- D-18: `src/types/database.ts` must add `ClassroomSection` and `ClassroomCard` row/insert/update types (manual stub)

**Data Fetching Pattern**
- D-19: TanStack Query fetches sections + cards for a classroom. Query key: `['classroom-sections', classroomId]`. Mutations for create/rename/delete/reorder sections and create/delete cards
- D-20: Optimistic updates for reorder and delete — feel instant without waiting for Supabase round-trip

### Claude's Discretion
- Exact layout of section header row (section name left, action buttons right)
- Loading and error states for file uploads (progress indicator style)
- Empty state for classroom with no sections ("Add your first section")
- Empty state for section with no cards ("Add your first card")
- Exact bottom sheet card-type option layout (icon + label + short description)
- Sort order integer strategy (increment by 1000 vs. reindex on every move)

### Deferred Ideas (OUT OF SCOPE)
- Screenshot prevention / DRM — platform limitation, not buildable for MVP
- Card reordering within a section — sections reorder; cards within a section are add/delete only for v1.0
- Rich text / markdown for text note cards — v1.1 if tutors request it
- Video cards — high complexity, deferred
- Duplicate section / card — deferred
- Bulk card upload — deferred
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CLASS-01 | Tutor can create named sections within their classroom | `useClassroomSections` mutation + `classroom_sections` insert |
| CLASS-02 | Tutor can rename and delete sections | Inline rename via TextInput swap + `Alert.alert` confirmation delete mutation |
| CLASS-03 | Tutor can reorder sections within their classroom | ↑/↓ swap + optimistic `sort_order` update mutation |
| CARD-01 | Tutor can add a text note card to a section | Bottom sheet → text input form → `classroom_cards` insert with `card_type: 'text'` |
| CARD-02 | Tutor can upload a PDF or file as a card | `expo-document-picker` + Supabase Storage upload + card insert with `storage_path` |
| CARD-03 | Tutor can upload an image as a card | `expo-image-picker` + Supabase Storage upload + card insert with `storage_path` |
| CARD-04 | Tutor can add an external link card | Bottom sheet → URL + title form → `classroom_cards` insert with `card_type: 'link'` |
| CARD-05 | Tutor can delete any card from a section | Trash icon + `Alert.alert` confirmation + optimistic removal mutation |
</phase_requirements>

---

## Summary

Phase 4 adds the tutor's primary workspace: a Manage Classroom screen where sections are created, reordered, and filled with content cards. The technical domain splits into three areas: (1) Supabase schema and RLS for two new tables, (2) file picking and upload to Supabase Storage, and (3) React Native UI patterns for the section list, inline rename, bottom sheet, and optimistic mutations.

The project already has all the architectural patterns needed — `useClassroom.ts` is the exact template for new hooks, `classroom-settings.tsx` is the exact template for form screens, and `Card.tsx`/`Button.tsx` cover the reusable UI layer. No new architectural decisions are required. The only new runtime dependencies are `expo-document-picker` and `expo-image-picker`, which are NOT yet installed.

The sort order strategy (increment by 1000) is the recommended approach over reindexing. It avoids updating every row on every reorder and supports future insertion between items without renumbering. The bottom sheet can be implemented with React Native's built-in `Modal` component — no third-party sheet library is required given the simple four-option layout.

**Primary recommendation:** Follow `useClassroom.ts` + `useUpdateClassroom.ts` as the hook template; use `classroom-settings.tsx` as the screen template; install `expo-document-picker` and `expo-image-picker` with `npx expo install` (not npm install) before writing any file-pick logic.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @supabase/supabase-js | 2.101.1 (installed) | DB queries, Storage upload, signed URL generation | Already in project; Storage API is part of the same client |
| @tanstack/react-query | 5.96.2 (installed) | `useQuery` for sections/cards fetch; `useMutation` for all writes | Established pattern in the project |
| expo-document-picker | 55.0.11 (NOT installed) | File picker for PDFs | Expo SDK 54-compatible; peer dep: expo: '*' |
| expo-image-picker | 55.0.16 (NOT installed) | Image picker from camera roll | Expo SDK 54-compatible; peer dep: expo: '*' |
| react-native Modal | built-in | Bottom sheet overlay | No third-party dependency needed for simple four-option sheet |
| Ionicons (@expo/vector-icons) | installed | Icons for card types, section actions, gear | Already established in Phase 3 |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | 5.0.12 (installed) | `useAuthStore` for `session.user.id` in all hooks | Required in every query/mutation hook |
| react-native Alert | built-in | Confirmation dialogs for delete actions | D-07, D-13 — no third-party needed |
| react-native ActivityIndicator | built-in | Upload progress indicator | Simpler than a third-party progress bar |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Native Modal for bottom sheet | @gorhom/bottom-sheet | @gorhom requires native build step (bare workflow); Modal works in managed Expo workflow without ejecting |
| sort_order increment by 1000 | reindex all rows on every move | Reindex touches every row; increment-by-1000 only updates the two swapped rows |
| expo-image-picker | react-native-image-picker | expo-image-picker is the Expo-managed equivalent with no native config needed |

**Installation (required before implementation):**
```bash
npx expo install expo-document-picker expo-image-picker
```

Use `npx expo install` (not `npm install`) — it resolves to the peer-compatible version for Expo SDK 54. (See CLAUDE.md `react-native-safe-area-context version conflict` gotcha.)

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/(tabs)/
│   └── manage-classroom.tsx    # thin screen — imports from features/classroom/
├── features/classroom/
│   ├── useClassroomSections.ts # query + mutations for sections
│   ├── useClassroomCards.ts    # query + mutations for cards
│   ├── uploadClassroomFile.ts  # Supabase Storage upload utility
│   ├── SectionRow.tsx          # section header + card list + add-card button
│   ├── CardListItem.tsx        # compact card row with type icon + preview
│   ├── AddCardBottomSheet.tsx  # Modal-based bottom sheet with four card types
│   └── CardTypeOption.tsx      # single row inside bottom sheet
└── types/database.ts           # ADD ClassroomSection + ClassroomCard types
```

### Pattern 1: Query Hook (copy of useClassroom.ts)

```typescript
// Source: src/features/tutor/useClassroom.ts — established pattern
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useClassroomSections(classroomId: string | undefined) {
  return useQuery({
    queryKey: ['classroom-sections', classroomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classroom_sections')
        .select('*')
        .eq('classroom_id', classroomId!)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!classroomId,
  });
}
```

### Pattern 2: Mutation with Optimistic Update

```typescript
// Source: TanStack Query v5 docs — optimistic updates pattern
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useReorderSections(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    onMutate: async ({ fromIndex, toIndex }) => {
      await queryClient.cancelQueries({ queryKey: ['classroom-sections', classroomId] });
      const previous = queryClient.getQueryData(['classroom-sections', classroomId]);
      queryClient.setQueryData(['classroom-sections', classroomId], (old: Section[]) => {
        const next = [...old];
        [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
        return next;
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(['classroom-sections', classroomId], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-sections', classroomId] });
    },
    mutationFn: async ({ sectionA, sectionB }) => {
      // swap sort_order values between two sections
      await supabase.from('classroom_sections').update({ sort_order: sectionB.sort_order }).eq('id', sectionA.id);
      await supabase.from('classroom_sections').update({ sort_order: sectionA.sort_order }).eq('id', sectionB.id);
    },
  });
}
```

### Pattern 3: Supabase Storage Upload

```typescript
// Source: Supabase JS docs — storage.from().upload()
import { supabase } from '@/lib/supabase';

export async function uploadClassroomFile(
  classroomId: string,
  fileUri: string,
  fileName: string,
  mimeType: string
): Promise<string> {
  // React Native requires reading the file as a Blob or using fetch
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const storagePath = `${classroomId}/${Date.now()}-${fileName}`;
  const { error } = await supabase.storage
    .from('classroom-assets')
    .upload(storagePath, blob, { contentType: mimeType });

  if (error) throw error;
  return storagePath;
}
```

### Pattern 4: Signed URL Generation at Read Time

```typescript
// Source: Supabase JS docs — storage.from().createSignedUrl()
const { data, error } = await supabase.storage
  .from('classroom-assets')
  .createSignedUrl(storagePath, 3600); // 1-hour expiry per D-17
if (error) throw error;
return data.signedUrl;
```

### Pattern 5: Inline Rename (TextInput swap)

```typescript
// Pattern established in D-06
const [isEditing, setIsEditing] = useState(false);
const [draftName, setDraftName] = useState(section.name);

// In render:
{isEditing ? (
  <TextInput
    value={draftName}
    onChangeText={setDraftName}
    onBlur={() => { confirmRename(); setIsEditing(false); }}
    onSubmitEditing={() => { confirmRename(); setIsEditing(false); }}
    autoFocus
  />
) : (
  <TouchableOpacity onPress={() => setIsEditing(true)}>
    <Text>{section.name}</Text>
  </TouchableOpacity>
)}
```

### Pattern 6: Bottom Sheet via React Native Modal

```typescript
// Using built-in Modal instead of third-party (managed Expo workflow safe)
<Modal
  visible={sheetOpen}
  transparent
  animationType="slide"
  onRequestClose={() => setSheetOpen(false)}
>
  <TouchableWithoutFeedback onPress={() => setSheetOpen(false)}>
    <View style={styles.overlay} />
  </TouchableWithoutFeedback>
  <View style={[styles.sheet, { borderTopLeftRadius: RADII.modal, borderTopRightRadius: RADII.modal }]}>
    {/* four CardTypeOption rows */}
  </View>
</Modal>
```

### Sort Order Strategy

Use increment-by-1000: first section gets `sort_order: 1000`, second `2000`, etc. When reordering, swap the `sort_order` values of the two neighbours. This means only two rows update per swap, and the value space allows future insertion between sections without renumbering.

On creation of a new section: `sort_order = (maxExistingOrder + 1000)`.

### Anti-Patterns to Avoid

- **Using `npm install` for Expo packages:** Must use `npx expo install` for `expo-document-picker` and `expo-image-picker` to get peer-compatible versions.
- **Exposing raw Storage URLs:** PDF/image card rows must NEVER expose a public URL. Always call `createSignedUrl` at render time or in the query hook. The bucket is private (D-17).
- **Fetching sections and cards in two separate screens:** Both belong under `['classroom-sections', classroomId]` query for consistency and single-invalidation.
- **Hardcoded values in new components:** All spacing, colors, and radii must come from `src/features/ui/theme.ts`. No exceptions per CLAUDE.md.
- **Reindexing sort_order across all rows:** Only update the two swapped rows. Reindexing all rows on every move is N updates instead of 2.
- **Async calls inside Zustand selector callbacks:** Use `useAuthStore.getState()` for one-off reads inside `mutationFn` (not in hooks). This is the established pattern in `useCreateClassroom.ts`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File picking UI | Custom file browser | `expo-document-picker` / `expo-image-picker` | Handles permissions, OS native picker, sandbox access, returns typed result |
| Storage upload | Raw fetch to S3 | `supabase.storage.from().upload()` | Handles multipart, retry, auth headers automatically |
| Signed URL generation | Custom token endpoint | `supabase.storage.from().createSignedUrl()` | Built into supabase-js client; handles signing and expiry |
| Bottom sheet | Custom gesture-based drawer | React Native `Modal` with `animationType="slide"` | Managed Expo workflow cannot use native gesture libraries without ejecting |
| Confirmation dialogs | Custom modal component | React Native `Alert.alert` | Native OS dialog — matches platform conventions, no layout needed |
| Optimistic UI | setTimeout + refetch | TanStack Query `onMutate` / `onError` / `onSettled` | Built-in rollback on error, cancels in-flight queries automatically |

**Key insight:** Supabase Storage handles the hardest part of file upload (auth, multipart, signed URLs). expo-document-picker and expo-image-picker handle the hardest part of file selection (permissions, OS pickers). Never build custom versions of either.

---

## Common Pitfalls

### Pitfall 1: Using `npm install` instead of `npx expo install` for Expo packages

**What goes wrong:** Version mismatch between `expo-image-picker` / `expo-document-picker` and the Expo SDK version causes build failures or native module crashes at runtime.
**Why it happens:** npm resolves to latest package version; `npx expo install` resolves to the peer-compatible version for SDK 54.
**How to avoid:** Always use `npx expo install expo-document-picker expo-image-picker`.
**Warning signs:** Metro bundler error mentioning incompatible native module or missing native method.

### Pitfall 2: Supabase Storage — React Native Blob upload

**What goes wrong:** Uploading a file URI directly as a string to `supabase.storage.upload()` silently uploads 0 bytes or throws a type error.
**Why it happens:** Supabase Storage expects a `Blob`, `ArrayBuffer`, or `File`. React Native returns a local `file://` URI from pickers, which is not automatically a Blob.
**How to avoid:** Convert the URI to a Blob using `fetch(uri).then(r => r.blob())` before passing to `upload()`. This works in React Native's environment.
**Warning signs:** Upload "succeeds" but the file in Supabase Storage dashboard is 0 bytes.

### Pitfall 3: Signed URL expiry during session

**What goes wrong:** A tutor opens the classroom, the signed URL is generated, they leave the app open for over 1 hour, then the card renders a broken image/PDF.
**Why it happens:** Signed URLs have a TTL. After expiry, the URL returns 403.
**How to avoid:** Keep TTL at 3600 seconds (1 hour) for MVP. In a future phase, generate signed URLs on demand (in a query hook) rather than storing them. For Phase 4 (tutor view only), this is low risk — tutors won't sit on the screen for an hour.
**Warning signs:** Card image shows broken icon or PDF link returns 403 after extended use.

### Pitfall 4: Optimistic update rollback not wired

**What goes wrong:** Reorder or delete mutation fails but the UI stays in the "after" state, showing incorrect data.
**Why it happens:** Developers wire `onMutate` for optimistic set but forget `onError` rollback to `context.previous`.
**How to avoid:** Always implement all three: `onMutate` (set optimistic + save previous), `onError` (restore previous), `onSettled` (invalidate query).
**Warning signs:** Deleted section reappears on next navigation but NOT on the current screen.

### Pitfall 5: RLS blocking cross-table card queries

**What goes wrong:** Query for cards in a section returns 0 rows even when data exists. No error — RLS denies silently and returns empty array.
**Why it happens:** The RLS policy for `classroom_cards` must join through `classroom_sections` to `classrooms` to `tutors` to verify the auth.uid() match. A simple `eq('section_id', x)` policy on `classroom_cards` is insufficient — it doesn't verify ownership.
**How to avoid:** Write the RLS SELECT policy on `classroom_cards` as a subquery: `section_id IN (SELECT id FROM classroom_sections WHERE classroom_id IN (SELECT id FROM classrooms WHERE tutor_id IN (SELECT id FROM tutors WHERE user_id = auth.uid())))`.
**Warning signs:** Query returns empty array despite records existing in the table.

### Pitfall 6: Inline TextInput auto-focus on Android vs iOS

**What goes wrong:** `autoFocus` on the inline rename TextInput works on iOS but not on Android (common React Native issue).
**Why it happens:** Android delays focus until the next render cycle.
**How to avoid:** Use a `ref` on the TextInput and call `ref.current?.focus()` inside a `setTimeout(fn, 100)` within a `useEffect` triggered by `isEditing` state change.
**Warning signs:** The TextInput appears but keyboard does not open on Android.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| node | Build tooling | Yes | 25.8.1 | — |
| expo-document-picker | CARD-02 (PDF upload) | No | — | Must install before implementing |
| expo-image-picker | CARD-03 (Image upload) | No | — | Must install before implementing |
| Supabase project | All DB + Storage ops | Yes | 2.101.1 client | — |
| @supabase/supabase-js | All queries | Yes | 2.101.1 (installed) | — |
| @tanstack/react-query | Data fetching | Yes | 5.96.2 (installed) | — |
| Ionicons | Card type icons, action icons | Yes | via @expo/vector-icons (installed) | — |

**Missing dependencies with no fallback:**
- `expo-document-picker` — blocks CARD-02. Wave 0 must install via `npx expo install expo-document-picker`
- `expo-image-picker` — blocks CARD-03. Wave 0 must install via `npx expo install expo-image-picker`

**Missing dependencies with fallback:**
- None beyond the above.

**Supabase Storage bucket `classroom-assets`:** Must be created in the Supabase dashboard (or via migration) before file upload works. This is a one-time setup step, not a code task. It is a blocking dependency for CARD-02 and CARD-03.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | jest + jest-expo |
| Config file | package.json `"test": "jest"` |
| Quick run command | `npx jest --testPathPattern=classroom` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLASS-01 | Section created and appears in list | unit (mutation mock) | `npx jest --testPathPattern=useClassroomSections` | No — Wave 0 |
| CLASS-02 | Rename saves; delete shows confirm then removes | unit (mutation mock) | `npx jest --testPathPattern=SectionRow` | No — Wave 0 |
| CLASS-03 | Reorder swaps sort_order; optimistic reverts on error | unit (mutation mock) | `npx jest --testPathPattern=useClassroomSections` | No — Wave 0 |
| CARD-01 | Text card inserted with correct content | unit (mutation mock) | `npx jest --testPathPattern=useClassroomCards` | No — Wave 0 |
| CARD-02 | PDF upload calls Storage; card row has storage_path | unit (mock fetch + storage) | `npx jest --testPathPattern=uploadClassroomFile` | No — Wave 0 |
| CARD-03 | Image upload calls Storage; card row has storage_path | unit (mock fetch + storage) | `npx jest --testPathPattern=uploadClassroomFile` | No — Wave 0 |
| CARD-04 | Link card inserted with url + title | unit (mutation mock) | `npx jest --testPathPattern=useClassroomCards` | No — Wave 0 |
| CARD-05 | Delete shows confirm; optimistic removal; reverts on error | unit (mutation mock) | `npx jest --testPathPattern=useClassroomCards` | No — Wave 0 |

### Sampling Rate

- **Per task commit:** `npx jest --testPathPattern=classroom --passWithNoTests`
- **Per wave merge:** `npx jest`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/features/classroom/__tests__/useClassroomSections.test.ts` — covers CLASS-01, CLASS-02, CLASS-03
- [ ] `src/features/classroom/__tests__/useClassroomCards.test.ts` — covers CARD-01, CARD-04, CARD-05
- [ ] `src/features/classroom/__tests__/uploadClassroomFile.test.ts` — covers CARD-02, CARD-03
- [ ] Install `expo-document-picker` and `expo-image-picker` via `npx expo install`

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AsyncStorage for session | expo-sqlite localStorage | Phase 1 (established) | Must not change — offline session loss bug in AsyncStorage |
| Custom file upload fetch | supabase-js `storage.from().upload()` | supabase-js v2 | Handles auth, multipart automatically |
| Global `invalidateQueries()` | Targeted `queryKey` invalidation | TanStack Query v5 | Must pass `{ queryKey: [...] }` object — not a string |

**Deprecated/outdated:**
- `queryClient.invalidateQueries('classroom-sections')` (string form): TanStack Query v5 requires object form `{ queryKey: ['classroom-sections', classroomId] }`. The string form was v4 syntax. Using old syntax silently fails to invalidate.

---

## Open Questions

1. **`classroom-assets` bucket creation**
   - What we know: Supabase Storage bucket must be created before upload works. The bucket name `classroom-assets` is decided (D-17).
   - What's unclear: Whether a Supabase migration SQL file can create the bucket, or if it must be done manually in the dashboard.
   - Recommendation: Create the bucket manually in the Supabase dashboard as part of Wave 0 setup. Document this in the plan as a manual prerequisite step with verification.

2. **`expo-document-picker` permissions on Android**
   - What we know: On Android 33+, `READ_EXTERNAL_STORAGE` is deprecated; document picker uses `READ_MEDIA_*` permissions.
   - What's unclear: Whether managed Expo SDK 54 handles this automatically via the document picker plugin.
   - Recommendation: Add `expo-document-picker` to `app.json` plugins if required. Test on Android after install. The managed workflow should handle permissions transparently.

3. **Sort order gap on section creation when list is empty**
   - What we know: First section should get `sort_order: 1000`. On subsequent creates, `sort_order = max + 1000`.
   - What's unclear: Whether to query the max before insert or compute it client-side from the cached query data.
   - Recommendation: Compute from the TanStack Query cached data client-side (`Math.max(...sections.map(s => s.sort_order), 0) + 1000`). Avoids an extra round-trip.

---

## Sources

### Primary (HIGH confidence)

- Project codebase — `src/features/tutor/useClassroom.ts`, `useCreateClassroom.ts`, `classroom-settings.tsx`, `Card.tsx`, `Button.tsx`, `theme.ts`, `database.ts` — direct read of established patterns
- `package.json` — confirmed installed packages and versions
- `04-CONTEXT.md` — locked decisions from discuss phase
- `04-UI-SPEC.md` — approved UI contract

### Secondary (MEDIUM confidence)

- npm registry — `expo-document-picker@55.0.11`, `expo-image-picker@55.0.16` version confirmation
- CLAUDE.md §Technology Stack — Supabase Storage gotchas, `npx expo install` requirement, known issues table
- TanStack Query v5 docs pattern — optimistic updates (`onMutate`/`onError`/`onSettled`) — standard documented pattern

### Tertiary (LOW confidence)

- Android permissions for `expo-document-picker` on API 33+ — not verified against live device; flagged in Open Questions

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages confirmed via npm registry and installed package.json
- Architecture: HIGH — patterns copied from existing working codebase files
- Pitfalls: HIGH for Blob upload, RLS, optimistic rollback (documented Supabase/RN issues); MEDIUM for Android document picker permissions (not device-tested)
- Storage bucket setup: MEDIUM — procedure confirmed by Supabase docs pattern, not tested for this project

**Research date:** 2026-04-06
**Valid until:** 2026-05-06 (stable ecosystem — Expo SDK and Supabase-js are pinned)
