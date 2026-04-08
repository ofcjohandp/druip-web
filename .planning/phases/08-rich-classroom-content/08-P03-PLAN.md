---
phase: 08-rich-classroom-content
plan: P03
type: execute
wave: 3
depends_on:
  - 08-P01
  - 08-P02
files_modified: []
autonomous: false
requirements:
  - RICH-01
  - RICH-02
  - RICH-03
  - RICH-04
  - RICH-05

must_haves:
  truths:
    - "A tutor can create a flashcard and see it appear in the section card list immediately"
    - "A student can flip a flashcard and see the back face"
    - "A student can tap a PDF card and read the PDF inside the app without leaving"
    - "The add-card type picker shows Flashcard as an option between Text note and PDF"
    - "A tutor can delete a flashcard and it disappears immediately"
    - "All card types render without crashing in the student classroom-detail screen"
  artifacts:
    - path: "supabase/migrations/00016_add_flashcard_card_type.sql"
      provides: "Applied migration in remote DB"
      contains: "'flashcard'"
    - path: "src/features/classroom/FlashCard.tsx"
      provides: "Working flip component"
    - path: "src/app/(tabs)/pdf-viewer.tsx"
      provides: "Full-screen PDF viewer"
    - path: "src/features/classroom/StudentCardRenderer.tsx"
      provides: "All card types rendered"
    - path: "src/features/classroom/AddCardBottomSheet.tsx"
      provides: "Flashcard creation form"
  key_links:
    - from: "AddCardBottomSheet"
      to: "classroom_cards"
      via: "useCreateFlashcard.mutateAsync"
      pattern: "card_type.*flashcard"
    - from: "classroom-detail"
      to: "FlashCard / pdf-viewer"
      via: "StudentCardRenderer dispatch"
      pattern: "StudentCardRenderer"
---

<objective>
End-to-end verification checkpoint for Phase 8. Runs automated checks first, then pauses for human confirmation of the two animated/visual behaviours (flashcard flip, PDF viewer) that cannot be asserted by Jest.

Purpose: RICH-01 through RICH-05 are all gated here. This is the final gate before Phase 8 is marked complete.
Output: Phase 8 verified complete or a list of issues to fix.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/08-rich-classroom-content/08-P01-SUMMARY.md
@.planning/phases/08-rich-classroom-content/08-P02-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Automated verification suite</name>
  <files></files>
  <action>
Run each check in sequence. Report results. Do not proceed to the human checkpoint if any automated check fails — fix the issue first.

```bash
# 1. TypeScript — no new errors
npx tsc --noEmit

# 2. All Phase 8 unit tests pass
npx jest --testPathPattern="FlashCard|StudentCardRenderer|useClassroomCards"

# 3. Migration file exists with correct content
grep -q "flashcard" supabase/migrations/00016_add_flashcard_card_type.sql && echo "migration ok"

# 4. New packages present
node -e "require('./node_modules/react-native-webview/package.json'); require('./node_modules/react-native-reanimated/package.json'); require('./node_modules/react-native-worklets/package.json'); console.log('packages ok')"

# 5. babel.config.js was NOT modified (confirm react-native-worklets/plugin is absent)
grep -v "worklets" babel.config.js && echo "babel.config.js clean"

# 6. StudentCardRenderer handles all card types
grep -q "case 'flashcard'" src/features/classroom/StudentCardRenderer.tsx && echo "flashcard case ok"
grep -q "case 'pdf'" src/features/classroom/StudentCardRenderer.tsx && echo "pdf case ok"
grep -q "case 'text'" src/features/classroom/StudentCardRenderer.tsx && echo "text case ok"

# 7. classroom-detail renders cards for subscribers
grep -q "SectionWithStudentCards" src/app/\(tabs\)/classroom-detail.tsx && echo "classroom-detail wired"

# 8. pdf-viewer screen exists
ls src/app/\(tabs\)/pdf-viewer.tsx && echo "pdf-viewer screen exists"

# 9. useCreateFlashcard is exported
node -e "
const src = require('fs').readFileSync('src/features/classroom/useClassroomCards.ts', 'utf8');
if (src.includes('export function useCreateFlashcard')) console.log('useCreateFlashcard exported');
else process.exit(1);
"

# 10. AddCardBottomSheet has flashcard FormMode
grep -q "formMode === 'flashcard'" src/features/classroom/AddCardBottomSheet.tsx && echo "flashcard form mode ok"
```
  </action>
  <verify>
    <automated>
      npx tsc --noEmit &&
      npx jest --testPathPattern="FlashCard|StudentCardRenderer|useClassroomCards" &&
      echo "ALL AUTOMATED CHECKS PASSED"
    </automated>
  </verify>
  <done>All 10 automated checks report success. No TypeScript errors. All unit tests pass.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
    Phase 8 rich classroom content:
    - Tutors can add flashcards (front/back form in AddCardBottomSheet)
    - Students can flip flashcards with a smooth animation
    - Students can tap PDF cards to open a full-screen in-app PDF viewer
    - All card types render correctly in subscribed classroom sections
    - Tutors can delete flashcard cards (existing delete flow)
  </what-built>
  <how-to-verify>
Start the app: `npx expo start`

**Scenario A — Tutor creates a flashcard (RICH-01, RICH-03)**
1. Log in as a tutor account
2. Navigate to Manage Classroom
3. Tap "Add card" on any section
4. Confirm a "Flashcard" option appears in the type picker between "Text note" and "PDF / File"
5. Tap "Flashcard" — confirm a two-field form appears with "Front" and "Back" inputs
6. Enter "What is ATP?" as Front, "Adenosine triphosphate" as Back
7. Tap Save — confirm the card appears in the section list with a layers icon
8. Tap the delete icon on the flashcard — confirm it disappears immediately (RICH-05)

**Scenario B — Student flips flashcard (RICH-01)**
1. Log in as a student account that is subscribed to the tutor's classroom
2. Open the classroom detail screen
3. Scroll to the section where the flashcard was added
4. Confirm the flashcard is visible showing the front face ("What is ATP?") with "Tap to flip" hint
5. Tap the flashcard — confirm it flips to show the back face ("Adenosine triphosphate") with a smooth rotation animation
6. Tap again — confirm it flips back to the front

**Scenario C — Student views PDF (RICH-02)**
1. As tutor: add a PDF card to a section (use any test PDF)
2. As subscribed student: open the classroom and tap the PDF card
3. Confirm a full-screen PDF viewer screen opens with a back button and the PDF title in the header
4. Confirm the PDF renders (may show loading spinner briefly on slower devices)
5. Tap the back button — confirm navigation returns to classroom-detail

**Scenario D — All card types display (RICH-04)**
1. As subscribed student, open a classroom that has text, link, image, PDF, and flashcard cards in one section
2. Confirm each renders without crashing:
   - Text: plain text is displayed
   - Link: tappable row with URL that opens in browser
   - Image: photo renders inline
   - PDF: tappable row that opens pdf-viewer
   - Flashcard: interactive flip card
  </how-to-verify>
  <resume-signal>
Type "approved" if all 4 scenarios pass.
If any scenario fails, describe which step failed and what you saw — Claude will fix and return here.
  </resume-signal>
</task>

</tasks>

<verification>
All Phase 8 RICH requirements verified when:
- RICH-01: Student flips flashcard in subscribed classroom (Scenario B)
- RICH-02: Student reads PDF in-app without leaving the app (Scenario C)
- RICH-03: Tutor add-card flow shows Flashcard option with front/back form (Scenario A)
- RICH-04: All card types render in student classroom-detail without errors (Scenario D)
- RICH-05: Tutor deletes flashcard and section updates immediately (Scenario A step 8)
</verification>

<success_criteria>
Human types "approved" after testing all 4 scenarios.
</success_criteria>

<threat_model>
- **Flip animation invisible**: If the animation doesn't play, suspect { perspective: 1000 } is missing from one of the transforms (Android-specific). Fix in FlashCard.tsx and return to this checkpoint.
- **PDF WebView 403**: If PDF shows a 403 error, the signed URL expired (>1 hour old) or getSignedUrl was not called. Check that useClassroomCards attaches signedUrl to pdf cards before reaching StudentCardRenderer.
- **SectionWithStudentCards not rendering**: If subscribed student sees section names but no cards, confirm the classroom-detail SectionWithStudentCards component is calling useClassroomCards(section.id) and that the subscription check (isSubscribed) resolves correctly.
- **pdf-viewer screen not found**: If router.push to /(tabs)/pdf-viewer results in a 404, confirm pdf-viewer.tsx is inside src/app/(tabs)/ and that the (tabs) layout _layout.tsx does not need a manual route registration (Expo Router file-based routing picks it up automatically).
</threat_model>

<output>
After human approval, create `.planning/phases/08-rich-classroom-content/08-P03-SUMMARY.md`
</output>
