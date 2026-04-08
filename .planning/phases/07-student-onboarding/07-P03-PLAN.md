---
phase: 07-student-onboarding
plan: P03
type: execute
wave: 3
depends_on:
  - P02
files_modified: []
autonomous: false
requirements:
  - ONBD-01
  - ONBD-02
  - ONBD-03
  - ONBD-04
  - ONBD-05
  - ONBD-06
  - ONBD-07
  - ONBD-08

must_haves:
  truths:
    - "All 8 ONBD requirements pass end-to-end verification on device or simulator"
    - "Tutor sign-up flow is unaffected by student onboarding changes"
    - "Returning completed-onboarding student bypasses flow and sees marketplace"
  artifacts: []
  key_links: []
---

<objective>
End-to-end verification checkpoint for all ONBD requirements. Verify the complete student onboarding flow works on device/simulator and that tutor flow is unaffected.

Purpose: Catch integration issues that unit tests cannot — navigation race conditions, RLS policy gaps, photo upload failures, date picker platform differences, tag filtering correctness.

Output: Verified phase or list of issues to fix.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/07-student-onboarding/07-RESEARCH.md
@.planning/phases/07-student-onboarding/07-P00-SUMMARY.md
@.planning/phases/07-student-onboarding/07-P01-SUMMARY.md
@.planning/phases/07-student-onboarding/07-P02-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Run automated checks</name>
  <files></files>
  <action>
Run the following automated verification checks:

**1. Jest test suite passes:**
```bash
npx jest --passWithNoTests 2>&1 | tail -20
```
Expect: All suites pass, no failures.

**2. TypeScript compilation (no type errors):**
```bash
npx tsc --noEmit 2>&1 | tail -20
```
Expect: No errors. If tsc is not configured, skip.

**3. Verify migration file exists and has all 4 tables:**
```bash
grep -c "CREATE TABLE" supabase/migrations/00013_student_onboarding.sql
```
Expect: 4

**4. Verify all onboarding screens exist:**
```bash
ls src/app/\(auth\)/onboarding/step-*.tsx | wc -l
```
Expect: 6

**5. Verify root guard has student onboarding check:**
```bash
grep "pendingStudentOnboarding" src/app/_layout.tsx | wc -l
```
Expect: >= 3

**6. Verify sign-up redirects to onboarding (not goal-selection):**
```bash
grep "onboarding/step-1" src/app/\(auth\)/sign-up.tsx
```
Expect: 1 match

**7. Verify onboarding_complete is set to true in final screen:**
```bash
grep "onboarding_complete" src/app/\(auth\)/onboarding/step-6-test-date.tsx
```
Expect: At least 1 match with `true`

**8. Verify useAllClassrooms supports tag filtering:**
```bash
grep "tagIds" src/features/student/useAllClassrooms.ts | wc -l
```
Expect: >= 3

**9. Verify no broken imports — start Expo bundler briefly:**
```bash
npx expo export --platform ios --output-dir /tmp/druip-export-check 2>&1 | tail -10
```
If export succeeds, the bundle is valid. If it fails, note the error.

If any check fails, fix the issue before proceeding to the human verification checkpoint.
  </action>
  <verify>
    <automated>npx jest --passWithNoTests 2>&1 | tail -5</automated>
  </verify>
  <done>
    - All jest tests pass
    - All 6 onboarding screens exist
    - Root guard, sign-up redirect, and final screen completion all verified
    - useAllClassrooms tag filtering verified
    - Bundle compiles without import errors
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Complete 6-step student onboarding flow with profile setup, university/campus selection, degree/year, subject tag multi-select, help type multi-select, optional test date, root navigation guard, and tag-filtered marketplace.</what-built>
  <how-to-verify>
**Test 1: New student onboarding flow (ONBD-01 through ONBD-07)**

1. Start the dev server: `npx expo start`
2. Open the app on device/simulator
3. Create a NEW account (non-tutor — leave "I want to teach" toggle OFF)
4. After sign-up, you should land on Step 1 (not goal-selection, not home tabs)
5. Step 1: Enter a first name and surname. Optionally tap the photo circle to pick an image. Tap Continue.
6. Step 2: Select a university from the list. Its campuses should appear. Select a campus. Tap Continue.
7. Step 3: Type a degree name. Select a year (1-6). Tap Continue.
8. Step 4: You should see subject tag bubbles loaded from the database. Select at least 1. Tap Continue.
9. Step 5: You should see help type bubbles. Select at least 1. Tap Continue.
10. Step 6: You can optionally pick a test date or skip. Tap Finish (or Skip).
11. You should land on the Home/Discovery tab (marketplace).

**Test 2: Returning student bypasses onboarding (ONBD-08 partial)**

12. Close and reopen the app (or force-refresh the session).
13. You should land directly on the marketplace — NOT see onboarding again.

**Test 3: Tag-filtered marketplace (ONBD-08)**

14. On the marketplace, check that classrooms shown have tags matching what you selected in Step 4. If no classrooms match your tags, all classrooms should still display (graceful fallback).

**Test 4: Tutor flow unaffected**

15. Sign out. Create a NEW account with "I want to teach" toggle ON.
16. You should go through the tutor onboarding (create-classroom), NOT the student onboarding.
17. After creating a classroom, you should land on the tutor profile tab.

**What to watch for:**
- No flash of the home screen before onboarding loads (Pitfall 2)
- No navigation back-flash between goal-selection and onboarding (Pitfall 1)
- Tag bubbles render correctly (not empty list)
- Date picker opens properly on your platform (iOS vs Android may differ)
- Progress dots advance correctly (1/6 through 6/6)
  </how-to-verify>
  <resume-signal>Type "approved" if all 4 tests pass, or describe any issues found.</resume-signal>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| E2E test | Verifies client-server integration; RLS policies tested implicitly |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-13 | Information Disclosure | E2E verification | accept | Test uses real Supabase instance; test accounts created during verification are disposable |
</threat_model>

<verification>
Phase 7 is complete when:
1. All automated checks pass (Task 1)
2. Human verifies all 4 test scenarios pass on device/simulator (Task 2)
3. No regressions in existing tutor flow
</verification>

<success_criteria>
- ONBD-01: New student sees onboarding (not marketplace) after sign-up
- ONBD-02: Step 1 saves name + optional photo
- ONBD-03: Step 2 saves university + campus from list
- ONBD-04: Step 3 saves degree + year
- ONBD-05: Step 4 shows subject tags from DB, saves selections
- ONBD-06: Step 5 shows help types, saves selections
- ONBD-07: Step 6 has optional date picker, skippable
- ONBD-08: Marketplace filters by student's selected tags after onboarding
- Returning completed student bypasses onboarding
- Tutor flow is completely unaffected
</success_criteria>

<output>
After completion, create `.planning/phases/07-student-onboarding/07-P03-SUMMARY.md`
</output>
