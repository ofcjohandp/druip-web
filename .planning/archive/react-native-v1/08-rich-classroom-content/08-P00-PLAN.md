---
phase: 08-rich-classroom-content
plan: P00
type: execute
wave: 1
depends_on: []
files_modified:
  - supabase/migrations/00016_add_flashcard_card_type.sql
  - src/features/classroom/useClassroomCards.ts
  - src/features/classroom/__tests__/useClassroomCards.test.ts
  - src/features/classroom/__tests__/FlashCard.test.tsx
  - src/features/classroom/__tests__/StudentCardRenderer.test.tsx
autonomous: true
requirements:
  - RICH-01
  - RICH-02
  - RICH-03
  - RICH-04
  - RICH-05

must_haves:
  truths:
    - "Inserting a card with card_type='flashcard' into classroom_cards does not violate the CHECK constraint"
    - "react-native-webview is installed and importable in the project"
    - "react-native-reanimated and react-native-worklets are installed"
    - "The CardType union in useClassroomCards.ts includes 'flashcard'"
    - "Test stubs exist for FlashCard, StudentCardRenderer, and the new useCreateFlashcard hook"
  artifacts:
    - path: "supabase/migrations/00016_add_flashcard_card_type.sql"
      provides: "CHECK constraint extended to include 'flashcard'"
      contains: "card_type IN ('text', 'pdf', 'image', 'link', 'flashcard')"
    - path: "src/features/classroom/__tests__/FlashCard.test.tsx"
      provides: "Wave 0 test stubs for FLASH-02"
      contains: "it.todo"
    - path: "src/features/classroom/__tests__/StudentCardRenderer.test.tsx"
      provides: "Wave 0 test stubs for PDF-01"
      contains: "it.todo"
  key_links:
    - from: "useClassroomCards.ts"
      to: "classroom_cards DB table"
      via: "CardType literal union"
      pattern: "'text' \\| 'pdf' \\| 'image' \\| 'link' \\| 'flashcard'"
---

<objective>
Establish the foundation that every Phase 8 plan depends on: extend the database schema to accept 'flashcard' cards, install the two new packages (react-native-webview, react-native-reanimated + react-native-worklets), update the TypeScript CardType union, and drop Wave 0 test stubs so later plans can write real tests against named test cases.

Purpose: Plans P01, P02, and P03 cannot run until the DB constraint allows 'flashcard' inserts and the animation/viewer libraries are on disk.
Output: Migration file, package installs, updated CardType union, three test stub files.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md

@src/features/classroom/useClassroomCards.ts
@supabase/migrations/00006_classroom_sections_cards.sql
@src/features/classroom/__tests__/useClassroomCards.test.ts
</context>

<interfaces>
<!-- Existing CardType definition (useClassroomCards.ts lines 7-9) — must add 'flashcard' -->
```typescript
type CardType = Database['public']['Enums']['lesson_type'] extends never
  ? 'text' | 'pdf' | 'image' | 'link'
  : 'text' | 'pdf' | 'image' | 'link';
```

<!-- After this plan the type must read: -->
```typescript
type CardType = 'text' | 'pdf' | 'image' | 'link' | 'flashcard';
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Migration 00016 + install packages</name>
  <files>supabase/migrations/00016_add_flashcard_card_type.sql</files>
  <action>
1. Create `supabase/migrations/00016_add_flashcard_card_type.sql` with this exact content:

```sql
-- Phase 8: Add flashcard card_type (RICH-01, RICH-03)
-- Extends the CHECK constraint to accept 'flashcard' without touching existing rows.

ALTER TABLE classroom_cards
  DROP CONSTRAINT IF EXISTS classroom_cards_card_type_check;

ALTER TABLE classroom_cards
  ADD CONSTRAINT classroom_cards_card_type_check
  CHECK (card_type IN ('text', 'pdf', 'image', 'link', 'flashcard'));
```

2. Apply the migration to the remote Supabase project:
```bash
npx supabase db push
```
If `supabase` CLI is not linked, run `npx supabase link --project-ref <id>` first (the project ref is in `.env` or `app.config.js`). If CI/remote push is unavailable, note the migration is staged for manual apply.

3. Install new packages using `npx expo install` (never npm) so Expo resolves compatible peer versions:
```bash
npx expo install react-native-webview
npx expo install react-native-reanimated react-native-worklets
```

Do NOT edit `babel.config.js` after installing reanimated — `babel-preset-expo` handles the Babel plugin automatically. Adding `react-native-worklets/plugin` to Babel config manually causes a duplicate plugin error in SDK 54.
  </action>
  <verify>
    <automated>
      node -e "require('./node_modules/react-native-webview/package.json')" && echo "webview ok"
      node -e "require('./node_modules/react-native-reanimated/package.json')" && echo "reanimated ok"
      node -e "require('./node_modules/react-native-worklets/package.json')" && echo "worklets ok"
      ls supabase/migrations/00016_add_flashcard_card_type.sql
    </automated>
  </verify>
  <done>Migration file exists with correct SQL. All three packages present in node_modules.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Update CardType union + Wave 0 test stubs</name>
  <files>
    src/features/classroom/useClassroomCards.ts,
    src/features/classroom/__tests__/useClassroomCards.test.ts,
    src/features/classroom/__tests__/FlashCard.test.tsx,
    src/features/classroom/__tests__/StudentCardRenderer.test.tsx
  </files>
  <behavior>
    - CardType includes 'flashcard' literal (TypeScript compile check)
    - useClassroomCards.test.ts: it.todo stub for FLASH-01 (useCreateFlashcard inserts with card_type='flashcard', content=front, title=back)
    - FlashCard.test.tsx: it.todo stubs for FLASH-02a (renders front face on mount) and FLASH-02b (renders back face after press)
    - StudentCardRenderer.test.tsx: it.todo stubs for PDF-01 (pdf card navigates to pdf-viewer route with encoded signedUrl) and FLASH-03 (flashcard type renders FlashCard component)
  </behavior>
  <action>
1. In `src/features/classroom/useClassroomCards.ts` replace lines 7-9:
```typescript
// Before:
type CardType = Database['public']['Enums']['lesson_type'] extends never
  ? 'text' | 'pdf' | 'image' | 'link'
  : 'text' | 'pdf' | 'image' | 'link';

// After (RICH-01, RICH-03):
type CardType = 'text' | 'pdf' | 'image' | 'link' | 'flashcard';
```

2. Add to `src/features/classroom/__tests__/useClassroomCards.test.ts` (append inside the describe block):
```typescript
  it.todo('FLASH-01: useCreateFlashcard inserts with card_type flashcard, content=front, title=back');
```

3. Create `src/features/classroom/__tests__/FlashCard.test.tsx`:
```typescript
describe('FlashCard', () => {
  it.todo('FLASH-02a: renders front face text on initial mount');
  it.todo('FLASH-02b: renders back face text after user taps the card');
});
```

4. Create `src/features/classroom/__tests__/StudentCardRenderer.test.tsx`:
```typescript
describe('StudentCardRenderer', () => {
  it.todo('PDF-01: pdf card with signedUrl navigates to /(tabs)/pdf-viewer with encoded url param');
  it.todo('FLASH-03: flashcard card renders FlashCard component with front and back props');
  it.todo('TEXT-01: text card renders card content as plain text');
  it.todo('LINK-01: link card calls Linking.openURL with card content');
});
```
  </action>
  <verify>
    <automated>npx jest --testPathPattern="useClassroomCards|FlashCard|StudentCardRenderer" --listTests</automated>
  </verify>
  <done>
    - `CardType` in useClassroomCards.ts is the simple literal union including 'flashcard' — not the conditional mapped type.
    - Three test files exist with named it.todo stubs.
    - `npx tsc --noEmit` passes (or shows no new errors beyond pre-existing ones).
  </done>
</task>

</tasks>

<verification>
```bash
# Migration file exists
ls supabase/migrations/00016_add_flashcard_card_type.sql

# Packages installed
node -e "require('./node_modules/react-native-webview/package.json'); require('./node_modules/react-native-reanimated/package.json'); require('./node_modules/react-native-worklets/package.json'); console.log('all packages ok')"

# Test stubs present
npx jest --testPathPattern="FlashCard|StudentCardRenderer|useClassroomCards" --listTests

# TypeScript compiles (no new errors)
npx tsc --noEmit 2>&1 | tail -5
```
</verification>

<success_criteria>
- Migration 00016 exists with the correct CHECK constraint including 'flashcard'
- react-native-webview, react-native-reanimated, react-native-worklets in node_modules
- babel.config.js is UNCHANGED (no manual plugin additions)
- CardType union in useClassroomCards.ts is: `'text' | 'pdf' | 'image' | 'link' | 'flashcard'`
- Three test stub files exist in __tests__/ with descriptive it.todo entries
</success_criteria>

<threat_model>
- **Duplicate babel plugin**: Do NOT add `react-native-worklets/plugin` to babel.config.js. SDK 54 / babel-preset-expo handles it. Manual addition = Metro startup crash.
- **npm vs npx expo install**: Always use `npx expo install` for reanimated + webview to get Expo-compatible peer resolution.
- **Migration number conflict**: Verify no `00016_*.sql` already exists before writing. If it does, use `00017_`.
- **CardType conditional type**: The original definition uses a conditional type mapped from `Database`. After the migration, Supabase-generated types will still show the old enum. Replace with a plain literal union so TypeScript is always in sync until `supabase gen types` is re-run post-migration.
</threat_model>

<output>
After completion, create `.planning/phases/08-rich-classroom-content/08-P00-SUMMARY.md`
</output>
