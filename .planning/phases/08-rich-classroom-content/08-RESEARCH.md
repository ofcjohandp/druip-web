# Phase 8: Rich Classroom Content - Research

**Researched:** 2026-04-08
**Domain:** React Native PDF viewing, flip card animation, Supabase Storage, card schema extension
**Confidence:** HIGH

## Summary

Phase 8 adds two new card types — `flashcard` (front/back flip) and `pdf` (upload + in-app viewer) — to the existing classroom content system. The good news: the schema already supports `pdf` via the CHECK constraint in `00006_classroom_sections_cards.sql`, and `flashcard` requires only adding it to the constraint in a new migration. The upload pipeline (`uploadClassroomFile` + `useCreateFileCard`) already handles PDF uploads end-to-end.

The main open question is the PDF viewer. The project uses Expo SDK 54 with `newArchEnabled: true` (confirmed in `app.config.js`). `react-native-pdf` requires native modules and is incompatible with a managed/development-build-only setup without prebuild. The correct path is `react-native-webview` (already blessed by Expo, included in Expo Go) used as a PDF wrapper. For flashcard flip animation, `react-native-reanimated` v4 is the right choice — SDK 54 with New Architecture enabled is precisely the required environment for Reanimated v4.

The `AddCardBottomSheet` already has a "PDF / File" option that calls `handlePickPdf`. Phase 8 adds a "Flashcard" option with front/back text fields, and the student `classroom-detail.tsx` needs a new expandable section with card renderers for each type.

**Primary recommendation:** Install `react-native-webview` + `react-native-reanimated` + `react-native-worklets` via `npx expo install`. Use Reanimated v4 `useSharedValue` / `useAnimatedStyle` / `interpolate` / `withTiming` for the flip animation. Render PDFs by passing the signed URL directly to a `WebView source={{ uri: signedUrl }}` component — no third-party PDF library needed.

---

## Project Constraints (from CLAUDE.md)

- Stack: React Native / Expo + Supabase — decided, not up for debate during MVP
- No custom fonts — system fonts only (SF Pro / Roboto)
- All colours, spacing, and radii MUST use tokens from `src/features/ui/theme.ts`
- `src/app/` files are thin route shells only — business logic goes in `src/features/`
- Supabase client: single init point at `src/lib/supabase.ts`
- Install all Expo-ecosystem packages with `npx expo install`, not `npm install`
- `newArchEnabled: true` in `app.config.js` — New Architecture is active

---

## Q1: PDF Viewer for Expo SDK 54 Managed Workflow

### Options Evaluated

| Option | Native Code? | Expo Go? | New Arch? | Status |
|--------|-------------|----------|-----------|--------|
| `react-native-pdf` | Yes — requires native build | No | Unclear | Incompatible with managed workflow without prebuild. Last stable 7.0.4. |
| `@react-native-documents/viewer` | Yes — requires `expo prebuild --clean` | No | Unclear | Requires development build workflow change. Version 4.0.0. |
| `react-native-webview` + direct URI | No native compilation for managed | Yes | Yes | **Recommended.** Included in Expo Go. `npx expo install react-native-webview`. Version 13.16.1. |
| `rn-pdf-reader-js` | No (uses WebView internally) | Yes | Unknown | Last published July 2020. Targets RN 0.59-0.60 / Expo SDK 33-36. **Do not use — abandoned.** |
| `pdf-viewer-expo` | No (PDF.js in WebView) | Yes | Unknown | 5 commits, last Oct 2025. Too new/unmaintained. Adds unnecessary abstraction over WebView. |

### Recommended Approach: `react-native-webview` with signed URL

The signed URL from `getSignedUrl(storagePath)` (already implemented in `uploadClassroomFile.ts`) is a plain HTTPS URL. A WebView can load it directly as `source={{ uri: signedUrl }}`:

- iOS renders PDFs natively inside WebView via WKWebView — no additional work
- Android renders PDFs via the Chromium PDF plugin built into the system WebView — works on Android 5+
- No custom native code required — stays in managed workflow

```typescript
// Source: react-native-webview docs + existing getSignedUrl pattern
import { WebView } from 'react-native-webview';

// In a full-screen modal or dedicated screen:
<WebView
  source={{ uri: signedUrl }}
  style={{ flex: 1 }}
  startInLoadingState
  renderLoading={() => <ActivityIndicator color={COLORS.accent} />}
/>
```

### Gotchas

1. **Signed URL expiry:** The existing `getSignedUrl` returns a 1-hour expiry URL (3600 seconds, per `uploadClassroomFile.ts`). If a student leaves the screen open for >1 hour, the WebView will show a 403. Accept this for MVP — regenerate URL on re-focus if needed later.

2. **Android WebView PDF support:** The built-in system WebView on Android 5+ supports PDFs. On very old Android (API < 21), it may not. Given the target (South African university students with modern phones), this is acceptable.

3. **`copyToCacheDirectory` in expo-document-picker:** Already set to `true` by default (Expo SDK 14 behaviour), which means `asset.uri` is always a readable `file://` URI. The existing `uploadClassroomFile.ts` uses `fetch(fileUri)` → `blob()` which works with this URI. No change needed for the upload path.

4. **Do NOT use `react-native-pdf`** — it requires `expo prebuild` and adds a native dependency that breaks the clean managed workflow for no benefit when WebView works.

### Installation

```bash
npx expo install react-native-webview
```

---

## Q2: Flashcard Flip Animation

### What's Already Installed

`react-native-reanimated` is **not** in `package.json` yet. However:

- `newArchEnabled: true` is set in `app.config.js` — New Architecture is active
- Expo SDK 54 with RN 0.81 supports Reanimated v4 (the `latest` tag on npm)
- Reanimated v4 requires New Architecture — this project satisfies that requirement
- The Babel plugin for Reanimated is automatically handled by `babel-preset-expo` — no manual `babel.config.js` edit needed

### Options

| Approach | Install cost | Performance | Dev effort |
|----------|-------------|-------------|-----------|
| `react-native-reanimated` v4 | 2 packages (`reanimated` + `worklets`) | Native thread, 60fps | Low — 30 lines |
| Core `Animated` API | Zero | JS thread, may drop frames | Medium — 50 lines, more verbose |
| `react-native-flip-card` | 1 package, but unmaintained | Unknown | Low |
| `react-native-card-flip` | 1 package, last updated 2020 | Unknown | Low |

**Recommendation: `react-native-reanimated` v4.** It is the only animation library with official Expo docs and an active maintenance track that matches the project's New Architecture setup. The flip animation is well-documented in official Reanimated examples. Installing it now also benefits any future animations.

### Installation

```bash
npx expo install react-native-reanimated react-native-worklets
```

No `babel.config.js` changes needed — `babel-preset-expo` handles it automatically. Do NOT add `react-native-worklets/plugin` to Babel config (this causes a duplicate plugin error in SDK 54).

### Flip Card Pattern

```typescript
// Source: https://docs.swmansion.com/react-native-reanimated/examples/flipCard/
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

export function FlashCard({ front, back }: { front: string; back: string }) {
  const isFlipped = useSharedValue(false);

  const frontStyle = useAnimatedStyle(() => {
    const rotation = interpolate(Number(isFlipped.value), [0, 1], [0, 180]);
    return {
      transform: [{ rotateY: withTiming(`${rotation}deg`, { duration: 400 }) }],
      backfaceVisibility: 'hidden',
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotation = interpolate(Number(isFlipped.value), [0, 1], [180, 360]);
    return {
      transform: [{ rotateY: withTiming(`${rotation}deg`, { duration: 400 }) }],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
    };
  });

  return (
    <TouchableOpacity onPress={() => { isFlipped.value = !isFlipped.value; }}>
      <View style={{ position: 'relative' }}>
        <Animated.View style={[styles.card, frontStyle]}>
          <Text>{front}</Text>
        </Animated.View>
        <Animated.View style={[styles.card, backStyle]}>
          <Text>{back}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}
```

**Android gotcha:** Always include `{ perspective: 1000 }` in the transform array on Android — `rotateY` without perspective may not render. Add it as the first transform: `transform: [{ perspective: 1000 }, { rotateY: ... }]`.

---

## Q3: Database Schema — Adding 'flashcard' Type

### Current State

From `00006_classroom_sections_cards.sql`:

```sql
card_type TEXT NOT NULL CHECK (card_type IN ('text', 'pdf', 'image', 'link'))
```

`pdf` already exists in the CHECK constraint. Only `flashcard` needs to be added.

The `classroom_cards` table has:
- `content TEXT` — usable for flashcard front face
- `title TEXT` — usable for flashcard back face (repurpose semantics)
- `storage_path TEXT` — not used by flashcard type

### Migration Strategy

A new migration `00016_add_flashcard_card_type.sql` that drops and recreates the CHECK constraint:

```sql
-- Phase 8: Add flashcard card_type (FLASH-01)

ALTER TABLE classroom_cards
  DROP CONSTRAINT IF EXISTS classroom_cards_card_type_check;

ALTER TABLE classroom_cards
  ADD CONSTRAINT classroom_cards_card_type_check
  CHECK (card_type IN ('text', 'pdf', 'image', 'link', 'flashcard'));
```

### Field Mapping for flashcard type

| DB column | flashcard meaning |
|-----------|------------------|
| `card_type` | `'flashcard'` |
| `content` | Front face text |
| `title` | Back face text |
| `storage_path` | NULL (not used) |

This reuses existing columns without schema changes beyond the CHECK constraint. No existing `text`, `pdf`, `image`, or `link` cards are affected.

### TypeScript type update

The `CardType` union in `useClassroomCards.ts` (line 8-9) needs `'flashcard'` added:

```typescript
type CardType = 'text' | 'pdf' | 'image' | 'link' | 'flashcard';
```

The Supabase generated types in `src/types/database.ts` will also need regeneration after applying the migration: `supabase gen types typescript --project-id <id> > src/types/database.ts`.

---

## Q4: PDF Upload to Supabase Storage

### Current State — Already Fully Implemented

The upload path is complete and working:

1. **`expo-document-picker`** (already in `package.json` at `~14.0.8`) — `getDocumentAsync({ type: 'application/pdf' })` returns `result.assets[0]` with `{ uri, name, mimeType }`
2. **`uploadClassroomFile.ts`** — takes `(classroomId, fileUri, fileName, mimeType)`, calls `fetch(fileUri)` → `.blob()`, uploads to `classroom-assets` private bucket, returns storage path
3. **`useCreateFileCard`** in `useClassroomCards.ts` — calls `uploadClassroomFile` then inserts DB row with `card_type: 'pdf'`, `title: fileName`, `storage_path`
4. **`AddCardBottomSheet.tsx`** — already has `handlePickPdf()` that calls `DocumentPicker.getDocumentAsync` and then `createFileCard.mutateAsync`

**Phase 8 adds zero new upload logic.** The PDF upload flow is already production-ready. The only addition is the in-app viewer for the student side.

### Pattern for Signed URL Display (student side)

```typescript
// Existing getSignedUrl from uploadClassroomFile.ts
const { data: cards } = useClassroomCards(sectionId);
// cards with card_type === 'pdf' already have signedUrl attached (see useClassroomCards.ts line 30-45)

// In the student card renderer:
if (card.card_type === 'pdf' && card.signedUrl) {
  router.push(`/pdf-viewer?url=${encodeURIComponent(card.signedUrl)}&title=${encodeURIComponent(card.title ?? '')}`);
}
```

The `signedUrl` is already attached by `useClassroomCards` for any `pdf` card with a `storage_path`. No new query logic needed.

---

## Q5: AddCardBottomSheet Changes for Flashcard Type

### Current State

`AddCardBottomSheet.tsx` has:
- `FormMode = 'text' | 'link' | null`
- Type picker with 4 options: Text note, PDF / File, Image, Link
- Text form and Link form inline in the sheet
- PDF and Image open file pickers directly (no inline form)

### What Needs to Change

1. **Extend `FormMode`** to include `'flashcard'`:
   ```typescript
   type FormMode = 'text' | 'link' | 'flashcard' | null;
   ```

2. **Add a new `CardTypeOption`** in the type picker (after "Text note"):
   ```tsx
   <CardTypeOption
     icon="layers-outline"
     title="Flashcard"
     description="Front and back flip card"
     onPress={() => setFormMode('flashcard')}
   />
   ```

3. **Add flashcard form state:**
   ```typescript
   const [flashFront, setFlashFront] = useState('');
   const [flashBack, setFlashBack] = useState('');
   ```

4. **Add `useCreateFlashcard` mutation hook** (new export in `useClassroomCards.ts`):
   ```typescript
   export function useCreateFlashcard(sectionId: string) {
     // inserts: card_type: 'flashcard', content: front, title: back
   }
   ```

5. **Add flashcard form branch** in the sheet render (alongside `formMode === 'text'` and `formMode === 'link'`): two TextInput fields (front / back) + Save button.

6. **Reset flashcard state** in `handleClose` and `handleCancelForm`.

### No Changes to CardTypeOption Component

`CardTypeOption.tsx` is generic and needs no modification — just pass a new icon name (`'layers-outline'` from Ionicons).

### Student Side: New Card Renderers Needed

`classroom-detail.tsx` currently shows only section names for subscribed students with no card content. Phase 8 needs:

- A `useClassroomCards(sectionId)` call per section (pattern already in `manage-classroom.tsx` via `SectionWithCards`)
- A student-facing `StudentCardRenderer` component that switches on `card_type`:
  - `'text'` → `<Text>` display
  - `'link'` → `<TouchableOpacity>` that opens `Linking.openURL(card.content)`
  - `'image'` → `<Image source={{ uri: card.signedUrl }}>`
  - `'pdf'` → `<TouchableOpacity>` that navigates to a full-screen PDF viewer screen
  - `'flashcard'` → inline `<FlashCard front={card.content} back={card.title}>` component

A new screen `src/app/(tabs)/pdf-viewer.tsx` (or a modal) will host the `<WebView>` for PDF rendering.

---

## Standard Stack

### Core (already installed)
| Package | Version | Purpose |
|---------|---------|---------|
| `expo-document-picker` | `~14.0.8` | Pick PDF from device — already in package.json |
| `expo-image-picker` | `~17.0.10` | Pick images — already in package.json |
| `@supabase/supabase-js` | `^2.101.1` | Storage upload + signed URLs — already in package.json |
| `@tanstack/react-query` | `^5.96.2` | Mutation hooks — already in package.json |

### New Installs Required
| Package | Install Version | Purpose | Install Command |
|---------|----------------|---------|-----------------|
| `react-native-webview` | `13.16.1` (latest) | PDF display in WebView | `npx expo install react-native-webview` |
| `react-native-reanimated` | `4.3.0` (latest) | Flip card animation | `npx expo install react-native-reanimated react-native-worklets` |
| `react-native-worklets` | `0.8.1` (latest) | Peer dep of Reanimated v4 | Installed together with reanimated |

### Verified npm Versions (checked 2026-04-08)
- `react-native-webview`: `13.16.1`
- `react-native-reanimated`: `4.3.0`
- `react-native-worklets`: `0.8.1`
- `react-native-pdf`: `7.0.4` (do not use — native only)

---

## Architecture Patterns

### New Files Required

```
src/
├── features/classroom/
│   ├── FlashCard.tsx              # Reanimated flip card component (new)
│   ├── StudentCardRenderer.tsx    # Switches on card_type for student view (new)
│   └── useClassroomCards.ts       # Add useCreateFlashcard export (extend existing)
├── app/(tabs)/
│   └── pdf-viewer.tsx             # Full-screen WebView PDF viewer screen (new)
supabase/migrations/
│   └── 00016_add_flashcard_card_type.sql  # Extend CHECK constraint (new)
```

### Existing Files Modified

```
src/features/classroom/AddCardBottomSheet.tsx  — add 'flashcard' FormMode + form branch
src/features/classroom/CardListItem.tsx        — add flashcard icon case
src/app/(tabs)/classroom-detail.tsx            — add card rendering per section for subscribers
src/types/database.ts                          — regenerate after migration
```

### Pattern: PDF Viewer Screen

```typescript
// src/app/(tabs)/pdf-viewer.tsx
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';

export default function PdfViewerScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* header with back button + title */}
      <WebView
        source={{ uri: decodeURIComponent(url) }}
        style={{ flex: 1 }}
        startInLoadingState
        renderLoading={() => <ActivityIndicator color={COLORS.accent} />}
      />
    </SafeAreaView>
  );
}
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF rendering | Custom PDF parser or canvas renderer | `react-native-webview` with signed URL | iOS WKWebView + Android Chromium render PDFs natively inside WebView |
| Flip animation | Manual `Animated.Value` + `rotateY` interpolation | `react-native-reanimated` v4 | Native thread, 60fps, well-tested pattern; Animated API requires more code and runs on JS thread |
| File upload | Custom `XMLHttpRequest` upload logic | Existing `uploadClassroomFile.ts` | Already written, tested, handles Blob conversion and storage path scoping |
| Type picker UI | Custom modal from scratch | Extend existing `CardTypeOption` in `AddCardBottomSheet` | Pattern already established — just add a new `CardTypeOption` row |

---

## Common Pitfalls

### Pitfall 1: Installing reanimated with npm instead of npx expo install
**What goes wrong:** Version mismatch — npm picks `^4.3.0` but Expo SDK 54 peer resolution may pin differently. `react-native-worklets` peer dep fails to resolve.
**How to avoid:** Always use `npx expo install react-native-reanimated react-native-worklets` — Expo resolves compatible peer versions automatically.
**Warning signs:** Metro bundler error "worklets version mismatch" at startup.

### Pitfall 2: Adding reanimated/plugin to babel.config.js manually
**What goes wrong:** "Duplicate plugin/preset detected" error in SDK 54. `babel-preset-expo` already includes the Reanimated Babel plugin when the package is installed.
**How to avoid:** Do not touch `babel.config.js`. No manual plugin registration.

### Pitfall 3: Passing fileUri directly to Supabase Storage upload
**What goes wrong:** `supabase.storage.from('...').upload(path, fileUri)` passes a string, not binary data — results in a corrupted file in Storage.
**How to avoid:** Already handled in `uploadClassroomFile.ts` via `fetch(fileUri).then(r => r.blob())`. Do not bypass this pattern for flashcard creation (flashcard has no file, so this pitfall is N/A for flashcard).
**Note:** The existing code is correct — this is documented for awareness only.

### Pitfall 4: Using getPublicUrl for classroom-assets
**What goes wrong:** `classroom-assets` is a private bucket. `getPublicUrl` returns a URL that 403s. Students cannot view PDFs.
**How to avoid:** Always use `getSignedUrl(storagePath)` from `uploadClassroomFile.ts`. Already enforced by `useClassroomCards.ts`.

### Pitfall 5: Mutating `isFlipped.value` inside `useAnimatedStyle` worklet
**What goes wrong:** Shared value mutations inside animated style worklets cause infinite loops.
**How to avoid:** Only read `isFlipped.value` inside `useAnimatedStyle`. Toggle it from `onPress` outside the worklet: `isFlipped.value = !isFlipped.value`.

### Pitfall 6: Missing { perspective: 1000 } on Android for rotateY
**What goes wrong:** On Android, `rotateY` transforms without `perspective` may render as flat/invisible.
**How to avoid:** Always include `{ perspective: 1000 }` as the first item in the transform array.

### Pitfall 7: Extending the CHECK constraint without a migration
**What goes wrong:** Attempting to insert `card_type: 'flashcard'` into the existing DB fails with a constraint violation. The `useCreateFlashcard` mutation errors.
**How to avoid:** Apply `00016_add_flashcard_card_type.sql` before writing any flashcard insertion code.

---

## Code Examples

### Create Flashcard Card (new hook)

```typescript
// Source: existing useCreateTextCard pattern in useClassroomCards.ts
export function useCreateFlashcard(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ front, back }: { front: string; back: string }) => {
      const cards =
        queryClient.getQueryData<CardRow[]>(['classroom-cards', sectionId]) ?? [];
      const sort_order = computeNextSortOrder(cards);

      const { data, error } = await supabase
        .from('classroom_cards')
        .insert({
          section_id: sectionId,
          card_type: 'flashcard',
          content: front,  // front face
          title: back,     // back face (repurposed)
          sort_order,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-cards', sectionId] });
    },
  });
}
```

### FlashCard Component Skeleton

```typescript
// src/features/classroom/FlashCard.tsx
// Source: https://docs.swmansion.com/react-native-reanimated/examples/flipCard/
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolate
} from 'react-native-reanimated';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADII } from '@/features/ui/theme';

export function FlashCard({ front, back }: { front: string; back: string }) {
  const isFlipped = useSharedValue(false);

  const frontAnim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: withTiming(`${interpolate(Number(isFlipped.value), [0,1], [0,180])}deg`, { duration: 400 }) },
    ],
    backfaceVisibility: 'hidden',
  }));

  const backAnim = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: withTiming(`${interpolate(Number(isFlipped.value), [0,1], [180,360])}deg`, { duration: 400 }) },
    ],
    backfaceVisibility: 'hidden',
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  }));

  return (
    <TouchableOpacity onPress={() => { isFlipped.value = !isFlipped.value; }} activeOpacity={0.9}>
      <View style={styles.container}>
        <Animated.View style={[styles.face, frontAnim]}>
          <Text style={styles.text}>{front}</Text>
          <Text style={styles.hint}>Tap to flip</Text>
        </Animated.View>
        <Animated.View style={[styles.face, styles.backFace, backAnim]}>
          <Text style={styles.text}>{back}</Text>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 160, position: 'relative' },
  face: {
    backgroundColor: COLORS.surface,
    borderRadius: RADII.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backFace: { backgroundColor: COLORS.accent },
  text: { fontSize: 18, color: COLORS.text, textAlign: 'center' },
  hint: { fontSize: 12, color: COLORS.textMuted, marginTop: SPACING.sm },
});
```

### Migration File

```sql
-- supabase/migrations/00016_add_flashcard_card_type.sql
-- Phase 8: Add flashcard card type (FLASH-01)

ALTER TABLE classroom_cards
  DROP CONSTRAINT IF EXISTS classroom_cards_card_type_check;

ALTER TABLE classroom_cards
  ADD CONSTRAINT classroom_cards_card_type_check
  CHECK (card_type IN ('text', 'pdf', 'image', 'link', 'flashcard'));
```

---

## Environment Availability

| Dependency | Required By | Available | Version | Notes |
|------------|------------|-----------|---------|-------|
| `expo-document-picker` | PDF pick from device | Yes | `~14.0.8` | Already in package.json |
| `expo-image-picker` | Image card picking | Yes | `~17.0.10` | Already in package.json |
| `react-native-webview` | PDF in-app viewer | Not yet | — | Install: `npx expo install react-native-webview` |
| `react-native-reanimated` | Flip card animation | Not yet | — | Install: `npx expo install react-native-reanimated react-native-worklets` |
| `react-native-worklets` | Peer dep of Reanimated v4 | Not yet | — | Installed together with reanimated |
| Supabase `classroom-assets` bucket | PDF storage | Yes | — | Private bucket, already exists per Phase 7 |

**Missing dependencies with no fallback:**
- `react-native-webview` — required for PDF viewer; no managed-workflow alternative
- `react-native-reanimated` + `react-native-worklets` — required for flip card; no equivalent native-thread alternative without adding a package

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest + jest-expo |
| Config file | Inferred from `jest-expo` preset in devDependencies |
| Quick run command | `npx jest --testPathPattern=classroom` |
| Full suite command | `npx jest` |

### Phase Requirements → Test Map

| Req | Behavior | Test Type | Command |
|-----|----------|-----------|---------|
| FLASH-01 | `useCreateFlashcard` inserts with card_type='flashcard', content=front, title=back | unit | `npx jest --testPathPattern=useClassroomCards` |
| FLASH-02 | `FlashCard` renders front face initially, shows back face after tap | unit | `npx jest --testPathPattern=FlashCard` |
| PDF-01 | PDF card in student view passes signedUrl to PDF viewer route | unit/integration | `npx jest --testPathPattern=StudentCardRenderer` |
| PDF-02 | `uploadClassroomFile` upload path unchanged — existing CARD-02 test | unit | `npx jest --testPathPattern=uploadClassroomFile` |

### Wave 0 Gaps

- [ ] `src/features/classroom/__tests__/FlashCard.test.tsx` — FLASH-02 (component not yet created)
- [ ] `src/features/classroom/__tests__/StudentCardRenderer.test.tsx` — PDF-01 (component not yet created)
- [ ] Extend `src/features/classroom/__tests__/useClassroomCards.test.ts` — add FLASH-01 test (currently `it.todo`)

---

## Open Questions

1. **Student card expansion UX in `classroom-detail.tsx`**
   - What we know: Currently shows only section names for subscribed students; no cards are rendered
   - What's unclear: Should cards expand inline under each section, or should tapping a section navigate to a dedicated section-detail screen?
   - Recommendation: Inline expansion (same pattern as `SectionWithCards` in `manage-classroom.tsx`) is simpler for MVP. Add a `SectionWithStudentCards` component mirroring the tutor pattern.

2. **Flashcard field naming in DB**
   - What we know: `content` = front, `title` = back is a column repurposing
   - What's unclear: This could confuse future developers
   - Recommendation: Accept the repurposing for MVP. Add a code comment in `useCreateFlashcard`. A proper `front_text`/`back_text` column split is a post-MVP migration.

3. **Signed URL refresh for long WebView sessions**
   - What we know: Signed URLs expire in 1 hour
   - What's unclear: Whether students will keep a PDF open >1 hour
   - Recommendation: Accept the 1-hour limit for MVP. On `AppState` change to `active`, the query will refetch and a fresh URL will be available for the next tap.

---

## Sources

### Primary (HIGH confidence)
- Code inspection: `supabase/migrations/00006_classroom_sections_cards.sql` — confirmed schema has `pdf` but not `flashcard`
- Code inspection: `src/features/classroom/uploadClassroomFile.ts` — upload + signed URL pattern confirmed complete
- Code inspection: `src/features/classroom/AddCardBottomSheet.tsx` — existing form modes confirmed
- Code inspection: `app.config.js` — `newArchEnabled: true` confirmed
- Code inspection: `package.json` — no reanimated or webview installed
- npm registry: `npm view react-native-webview version` → `13.16.1`
- npm registry: `npm view react-native-reanimated dist-tags` → `latest: 4.3.0`
- npm registry: `npm view react-native-worklets version` → `0.8.1`
- [Expo SDK 54 Changelog](https://expo.dev/changelog/sdk-54) — New Arch optional in SDK 54, final SDK to support legacy arch
- [react-native-reanimated Flip Card example](https://docs.swmansion.com/react-native-reanimated/examples/flipCard/) — official pattern, HIGH confidence

### Secondary (MEDIUM confidence)
- [Expo WebView docs](https://docs.expo.dev/versions/latest/sdk/webview/) — included in Expo Go, `npx expo install react-native-webview`
- [Expo Reanimated docs](https://docs.expo.dev/versions/latest/sdk/reanimated/) — `npx expo install react-native-reanimated react-native-worklets`, no babel.config.js change needed
- [react-native-documents/viewer install docs](https://react-native-documents.github.io/docs/install) — confirmed requires `expo prebuild --clean`

### Tertiary (LOW confidence)
- [pdf-viewer-expo GitHub](https://github.com/abdelouali/pdf-viewer-expo) — 5 commits, last Oct 2025, not recommended
- [rn-pdf-reader-js GitHub](https://github.com/xcarpentier/rn-pdf-reader-js) — confirmed abandoned (last release 2020, targets RN 0.59-0.60)

---

## Metadata

**Confidence breakdown:**
- Schema migration: HIGH — schema inspected directly, PostgreSQL ALTER TABLE syntax is stable
- Upload pipeline: HIGH — code inspected directly, no changes needed
- PDF viewer approach: HIGH — WebView is the only managed-workflow option; signed URL direct load is well-established
- Reanimated flip animation: HIGH — official Reanimated docs + confirmed New Architecture enabled
- AddCardBottomSheet changes: HIGH — code inspected directly, change scope is clear

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (stable libraries; npm versions checked today)
