---
phase: 08-rich-classroom-content
plan: P01
type: execute
wave: 2
depends_on:
  - 08-P00
files_modified:
  - src/features/classroom/useClassroomCards.ts
  - src/features/classroom/AddCardBottomSheet.tsx
  - src/features/classroom/CardListItem.tsx
  - src/features/classroom/__tests__/useClassroomCards.test.ts
autonomous: true
requirements:
  - RICH-01
  - RICH-03
  - RICH-05

must_haves:
  truths:
    - "Tutor can select 'Flashcard' from the AddCardBottomSheet type picker"
    - "Selecting Flashcard shows a form with a Front field and a Back field"
    - "Saving the flashcard form creates a DB row with card_type='flashcard', content=front, title=back"
    - "The flashcard card renders correctly in the tutor CardListItem with a recognisable icon"
    - "Tutor can delete a flashcard card — it disappears immediately (optimistic UI already in useDeleteCard)"
  artifacts:
    - path: "src/features/classroom/useClassroomCards.ts"
      provides: "useCreateFlashcard mutation export"
      exports: ["useCreateFlashcard"]
    - path: "src/features/classroom/AddCardBottomSheet.tsx"
      provides: "Flashcard FormMode + front/back TextInput form"
      contains: "formMode === 'flashcard'"
    - path: "src/features/classroom/CardListItem.tsx"
      provides: "flashcard card_type icon branch"
      contains: "'flashcard'"
  key_links:
    - from: "AddCardBottomSheet.tsx"
      to: "useCreateFlashcard"
      via: "createFlashcard.mutateAsync({ front, back })"
      pattern: "createFlashcard\\.mutateAsync"
    - from: "useCreateFlashcard"
      to: "classroom_cards"
      via: "supabase.from('classroom_cards').insert"
      pattern: "card_type: 'flashcard'"
---

<objective>
Give tutors the ability to add flashcards to a section. This plan adds the `useCreateFlashcard` mutation hook, extends `AddCardBottomSheet` with a 'flashcard' FormMode and a two-field front/back form, and updates `CardListItem` to show a flashcard icon for the new type.

Purpose: RICH-01 and RICH-03 require tutor-side flashcard creation. Nothing else in Phase 8 blocks this plan — it only needs P00 for the DB constraint and packages.
Output: Working tutor flashcard creation flow; tests passing for the new hook.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/08-rich-classroom-content/08-P00-SUMMARY.md

@src/features/classroom/useClassroomCards.ts
@src/features/classroom/AddCardBottomSheet.tsx
@src/features/classroom/CardListItem.tsx
@src/features/classroom/__tests__/useClassroomCards.test.ts
</context>

<interfaces>
<!-- Existing hook pattern to follow exactly (useCreateTextCard, lines 62-82 of useClassroomCards.ts) -->
```typescript
export function useCreateTextCard(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const cards = queryClient.getQueryData<CardRow[]>(['classroom-cards', sectionId]) ?? [];
      const sort_order = computeNextSortOrder(cards);
      const { data, error } = await supabase
        .from('classroom_cards')
        .insert({ section_id: sectionId, card_type: 'text', content, sort_order })
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

<!-- AddCardBottomSheet existing FormMode + form pattern (the flashcard form follows the same structure as the 'link' form) -->
```typescript
type FormMode = 'text' | 'link' | null;  // extend to: 'text' | 'link' | 'flashcard' | null

// New state to add:
const [flashFront, setFlashFront] = useState('');
const [flashBack, setFlashBack] = useState('');

// Reset in handleClose() and handleCancelForm()
setFlashFront('');
setFlashBack('');
```
</interfaces>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: useCreateFlashcard hook + FLASH-01 test</name>
  <files>
    src/features/classroom/useClassroomCards.ts,
    src/features/classroom/__tests__/useClassroomCards.test.ts
  </files>
  <behavior>
    - useCreateFlashcard({ front: 'What is ATP?', back: 'Adenosine triphosphate' }) → inserts row with card_type='flashcard', content='What is ATP?', title='Adenosine triphosphate', storage_path=null
    - On success, invalidates ['classroom-cards', sectionId] query key
    - Throws if front or back is empty string (guard in mutationFn)
  </behavior>
  <action>
Add `useCreateFlashcard` as a new named export at the bottom of `src/features/classroom/useClassroomCards.ts`, after `useCreateLinkCard`:

```typescript
/**
 * Mutation: create a flashcard.
 * Field mapping (RICH-01): content = front face, title = back face.
 * storage_path is NULL — flashcards have no file attachment.
 */
export function useCreateFlashcard(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ front, back }: { front: string; back: string }) => {
      if (!front.trim() || !back.trim()) throw new Error('front and back are required');

      const cards =
        queryClient.getQueryData<CardRow[]>(['classroom-cards', sectionId]) ?? [];
      const sort_order = computeNextSortOrder(cards);

      const { data, error } = await supabase
        .from('classroom_cards')
        .insert({
          section_id: sectionId,
          card_type: 'flashcard',
          content: front,   // front face
          title: back,      // back face (column repurposed — see RESEARCH.md Q3)
          storage_path: null,
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

Replace the FLASH-01 `it.todo` in `useClassroomCards.test.ts` with a real test that mocks `supabase.from().insert().select().single()` and asserts the insert payload contains `card_type: 'flashcard'`, `content: front`, `title: back`. Follow the existing test setup pattern already established for CARD-01 through CARD-05 stubs (use the same mock structure once those are implemented, or write a minimal inline mock now).
  </action>
  <verify>
    <automated>npx jest --testPathPattern="useClassroomCards" --passWithNoTests</automated>
  </verify>
  <done>
    - useCreateFlashcard is exported from useClassroomCards.ts
    - FLASH-01 test passes (not todo)
    - npx tsc --noEmit reports no new errors
  </done>
</task>

<task type="auto">
  <name>Task 2: AddCardBottomSheet flashcard form + CardListItem icon</name>
  <files>
    src/features/classroom/AddCardBottomSheet.tsx,
    src/features/classroom/CardListItem.tsx
  </files>
  <action>
**AddCardBottomSheet.tsx changes (per RICH-03):**

1. Import the new hook:
```typescript
import { useCreateTextCard, useCreateLinkCard, useCreateFileCard, useCreateFlashcard } from './useClassroomCards';
```

2. Extend the FormMode type:
```typescript
type FormMode = 'text' | 'link' | 'flashcard' | null;
```

3. Add state:
```typescript
const [flashFront, setFlashFront] = useState('');
const [flashBack, setFlashBack] = useState('');
```

4. Instantiate hook:
```typescript
const createFlashcard = useCreateFlashcard(sectionId);
```

5. Add `isSavingFlash`:
```typescript
const isSavingFlash = createFlashcard.isPending;
```

6. Add reset to both `handleClose` and `handleCancelForm`:
```typescript
setFlashFront('');
setFlashBack('');
```

7. Add save handler:
```typescript
async function handleSaveFlashcard() {
  if (!flashFront.trim() || !flashBack.trim()) return;
  await createFlashcard.mutateAsync({ front: flashFront.trim(), back: flashBack.trim() });
  handleClose();
}
```

8. In the type selector `<View>`, add a new CardTypeOption **after** "Text note" and **before** "PDF / File":
```tsx
<CardTypeOption
  icon="layers-outline"
  title="Flashcard"
  description="Front and back flip card"
  onPress={() => setFormMode('flashcard')}
/>
```

9. Add the flashcard form branch **after** the `formMode === 'link'` block and **before** the type-selector fallback:
```tsx
) : formMode === 'flashcard' ? (
  <View>
    <TextInput
      style={styles.linkInput}
      placeholder="Front (question or term)"
      placeholderTextColor={COLORS.textMuted}
      value={flashFront}
      onChangeText={setFlashFront}
      autoFocus
      editable={!isSavingFlash}
    />
    <TextInput
      style={[styles.linkInput, styles.linkTitleInput]}
      placeholder="Back (answer or definition)"
      placeholderTextColor={COLORS.textMuted}
      value={flashBack}
      onChangeText={setFlashBack}
      editable={!isSavingFlash}
    />
    <TouchableOpacity
      style={[styles.saveButton, ((!flashFront.trim() || !flashBack.trim()) || isSavingFlash) && styles.saveButtonDisabled]}
      onPress={handleSaveFlashcard}
      disabled={!flashFront.trim() || !flashBack.trim() || isSavingFlash}
      activeOpacity={0.85}
    >
      {isSavingFlash ? (
        <ActivityIndicator size="small" color={COLORS.textOnAccent} />
      ) : (
        <Text style={styles.saveButtonText}>Save</Text>
      )}
    </TouchableOpacity>
    <TouchableOpacity style={styles.cancelLink} onPress={handleCancelForm}>
      <Text style={styles.cancelLinkText}>Cancel</Text>
    </TouchableOpacity>
  </View>
```

**CardListItem.tsx changes:**

Locate the switch or conditional that maps `card.card_type` to an Ionicons icon name. Add the 'flashcard' branch:
```typescript
case 'flashcard':
  iconName = 'layers-outline';
  break;
```
If CardListItem uses a plain `if/else if` chain rather than a switch, add the equivalent `else if (card.card_type === 'flashcard')` block. Also update any displayed title/label for flashcard cards to show `card.content` (front face) as the preview text, since `title` is repurposed as the back face.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | tail -10</automated>
  </verify>
  <done>
    - AddCardBottomSheet renders a 5th card type option "Flashcard" with icon "layers-outline"
    - Selecting Flashcard shows two TextInput fields (Front / Back) with a Save button
    - Save button disabled when either field is empty
    - Saving calls createFlashcard.mutateAsync and closes the sheet
    - handleClose and handleCancelForm both reset flashFront and flashBack to ''
    - CardListItem renders 'layers-outline' icon for card_type='flashcard'
    - npx tsc --noEmit passes
  </done>
</task>

</tasks>

<verification>
```bash
# TypeScript clean
npx tsc --noEmit

# Unit test for the new hook
npx jest --testPathPattern="useClassroomCards"

# Confirm export exists
node -e "const m = require('./src/features/classroom/useClassroomCards'); console.log(typeof m.useCreateFlashcard)"
```
</verification>

<success_criteria>
- useCreateFlashcard exported from useClassroomCards.ts with correct insert payload
- FLASH-01 test passes
- AddCardBottomSheet has 5 type options with working Flashcard form
- CardListItem handles 'flashcard' card_type without crashing
- No TypeScript errors introduced
</success_criteria>

<threat_model>
- **Column repurposing confusion**: `title` stores the back face for flashcard cards. This is intentional and documented with a comment in the mutationFn. Do NOT rename columns in this plan — that is a post-MVP migration.
- **Missing state reset**: If `flashFront`/`flashBack` are not cleared in both `handleClose` AND `handleCancelForm`, old content leaks into the next sheet open. Both functions must be updated.
- **CardListItem title display**: For flashcard cards, `card.title` is the back face. Displaying `card.title` as the card preview in the tutor list would expose the answer. Use `card.content` (front face) as the preview label instead.
</threat_model>

<output>
After completion, create `.planning/phases/08-rich-classroom-content/08-P01-SUMMARY.md`
</output>
