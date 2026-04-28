---
phase: 05-student-discovery-and-subscriptions
plan: P04
type: execute
wave: 3
depends_on:
  - 05-P03
files_modified: []
autonomous: false

requirements:
  - DISC-01
  - DISC-02
  - DISC-03
  - DISC-04
  - SUB-01
  - SUB-02
  - SUB-03

must_haves:
  truths:
    - "Student can browse all available classrooms on the Home tab"
    - "Student can tap a classroom and see the detail page"
    - "Non-subscriber sees locked sections and Subscribe CTA with price"
    - "Tapping Subscribe navigates to the confirmation screen"
    - "Confirming subscription records it in Supabase and returns to detail showing unlocked content"
    - "Subscribed classrooms appear in 'Your Classrooms' section at top of Home tab"
    - "Full jest suite is green"
  artifacts:
    - path: "src/app/(tabs)/index.tsx"
      provides: "Home/Discovery screen — functional"
      contains: "useAllClassrooms"
    - path: "src/app/(tabs)/classroom-detail.tsx"
      provides: "Detail + locked/unlocked content"
      contains: "isSubscribed"
    - path: "src/app/(tabs)/subscribe-confirm.tsx"
      provides: "Confirmation screen — calm copy, no payment"
      contains: "useSubscribe"
    - path: "supabase/migrations/00007_subscriptions.sql"
      provides: "Live subscriptions table + RLS"
      contains: "CREATE TABLE subscriptions"
  key_links:
    - from: "Home tab"
      to: "classroom-detail screen"
      via: "ClassroomCard tap → router.push"
      pattern: "classroom-detail"
    - from: "classroom-detail screen"
      to: "subscribe-confirm screen"
      via: "Subscribe CTA → router.push"
      pattern: "subscribe-confirm"
    - from: "subscribe-confirm screen"
      to: "Supabase subscriptions table"
      via: "useSubscribe.mutate → supabase.from('subscriptions').insert"
      pattern: "subscriptions"
---

<objective>
End-to-end human verification of the complete student discovery and subscription flow.

Purpose: Automated tests confirm unit behavior but cannot confirm the real app flow end-to-end — real Supabase connection, real navigation, visual correctness. This checkpoint validates all 7 Phase 5 requirements are met before the phase is closed.

Output: User confirms flow works or files issues for gap closure.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-student-discovery-and-subscriptions/05-CONTEXT.md
@.planning/phases/05-student-discovery-and-subscriptions/05-P03-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Final automated checks before human verification</name>
  <files></files>
  <read_first>
    - src/app/(tabs)/index.tsx — confirm it imports useAllClassrooms and ClassroomCard
    - src/app/(tabs)/classroom-detail.tsx — confirm isSubscribed logic is present
    - src/app/(tabs)/subscribe-confirm.tsx — confirm useSubscribe and "Maybe later" copy
  </read_first>
  <action>
Run the following checks in order. Stop and fix any failures before proceeding to the human checkpoint.

1. Full jest suite:
   ```
   npx jest
   ```
   Expected: 0 failures, all suites pass.

2. TypeScript check (if tsc is configured):
   ```
   npx tsc --noEmit 2>&1 | head -20
   ```
   Expected: 0 errors. If errors exist, fix them — do not proceed with TypeScript errors.

3. Verify no hardcoded hex colors in new files:
   ```
   grep -rn "#[0-9A-Fa-f]\{6\}" src/features/student/ src/app/\(tabs\)/classroom-detail.tsx src/app/\(tabs\)/subscribe-confirm.tsx
   ```
   Expected: 0 matches.

4. Verify exact copy strings are present:
   ```
   grep "Maybe later" src/app/(tabs)/subscribe-confirm.tsx
   grep "You'll get full access" src/app/(tabs)/subscribe-confirm.tsx
   grep "Subscribe · R" src/app/(tabs)/classroom-detail.tsx
   ```
   Expected: 1 match each.

5. Verify subscriptions migration was pushed:
   ```
   grep "CREATE TABLE subscriptions" supabase/migrations/00007_subscriptions.sql
   ```
   Expected: 1 match.

If all checks pass, proceed to the human checkpoint task.
  </action>
  <verify>
    <automated>npx jest 2>&1 | tail -3</automated>
    Expect: "Test Suites: N passed, N total" with 0 failures.
  </verify>
  <done>
    - npx jest exits 0 with 0 failures
    - tsc --noEmit exits 0 with 0 errors
    - No hardcoded hex colors in new files
    - Exact copy strings present
    - Migration file contains CREATE TABLE subscriptions
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>
Complete student discovery and subscription flow:
- Home tab (index.tsx): shows all published classrooms as ClassroomCard list; "Your Classrooms" section at top when subscribed; loading/error/empty states
- Classroom detail (classroom-detail.tsx): tutor info, subjects, bio, price, sections list; locked sections with lock icon for non-subscribers; Subscribe CTA showing price
- Subscribe confirm (subscribe-confirm.tsx): classroom name, price, calm copy, Subscribe + "Maybe later" buttons; subscription written to Supabase on confirm
- Subscriptions schema: table live in Supabase with RLS
  </what-built>
  <how-to-verify>
Run the app: `npx expo start` or `npx expo run:ios`

**Flow 1 — Discovery (DISC-01):**
1. Log in as a student account (not a tutor)
2. Open the Home tab
3. Confirm: at least one classroom appears in the "Browse Classrooms" list
4. Confirm: each card shows classroom name, tutor identifier, subjects, bio excerpt, and price

**Flow 2 — Detail page (DISC-02, DISC-03, DISC-04):**
5. Tap any ClassroomCard
6. Confirm: classroom detail page opens with tutor info, subjects, bio, price
7. Confirm: sections are listed with lock icons (non-subscriber state)
8. Confirm: Subscribe button shows "Subscribe · R{price}/month" with the correct price

**Flow 3 — Subscribe (SUB-01, SUB-02):**
9. Tap the Subscribe CTA
10. Confirm: confirmation screen opens with classroom name, price, and the exact copy "You'll get full access to all sections and materials in this classroom."
11. Confirm: "Maybe later" button navigates back without subscribing
12. Tap "Subscribe" on the confirmation screen
13. Confirm: subscription is recorded (check Supabase subscriptions table if needed)
14. Confirm: you are returned to the classroom detail page
15. Confirm: sections now appear WITHOUT lock icons (subscribed state)
16. Confirm: Subscribe CTA is replaced by "You're subscribed" with a checkmark

**Flow 4 — Your Classrooms (SUB-03):**
17. Navigate back to the Home tab
18. Confirm: the subscribed classroom now appears in the "Your Classrooms" section at the top
19. Confirm: it does NOT also appear in the "Browse Classrooms" list below

**Visual check:**
20. Confirm all screens use consistent warm background (#FFFFFF), surface cards (#FAFAF8), and coral accent (#FF6B6B) for the Subscribe button — no jarring colors

If any flow fails, describe exactly what went wrong and what you expected.
  </how-to-verify>
  <resume-signal>Type "approved" if all flows work, or describe the specific issue(s) to trigger gap closure</resume-signal>
</task>

</tasks>

<verification>
Phase 5 is complete when:
1. All 5 requirement IDs (DISC-01 through DISC-04, SUB-01 through SUB-03) pass human verification above
2. npx jest exits 0 with full suite green
3. No TypeScript errors
4. Subscription writes survive a hard app reload (open app, navigate to detail, section names are still unlocked)
</verification>

<success_criteria>
Human confirms:
- DISC-01: Browse classrooms visible on Home tab
- DISC-02: Detail page shows tutor info, subjects, bio, price, section names
- DISC-03: Non-subscriber sees locked sections
- DISC-04: Subscribe CTA shows "Subscribe · R{price}/month"
- SUB-01: Confirmation screen shows classroom name, price, calm copy, Subscribe + "Maybe later"
- SUB-02: Subscribing unlocks all sections
- SUB-03: Subscribed classrooms appear in "Your Classrooms" section at top of Home tab
</success_criteria>

<output>
After completion, create `.planning/phases/05-student-discovery-and-subscriptions/05-P04-SUMMARY.md`
</output>
