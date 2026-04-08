---
phase: 05-student-discovery-and-subscriptions
plan: P00
type: execute
wave: 0
depends_on: []
files_modified:
  - supabase/migrations/00007_subscriptions.sql
  - src/types/database.ts
  - src/features/student/__tests__/useAllClassrooms.test.ts
  - src/features/student/__tests__/useClassroomDetail.test.ts
  - src/features/student/__tests__/useMySubscriptions.test.ts
  - src/features/student/__tests__/useSubscribe.test.ts
autonomous: true
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
    - "`subscriptions` table exists in Supabase with correct columns and RLS policies"
    - "Any authenticated user can SELECT published classrooms (RLS policy added)"
    - "`SubscriptionStatus` type and `subscriptions` table types exist in database.ts"
    - "Four Wave 0 test stub files exist and `npx jest` recognises them as valid test suites"
  artifacts:
    - path: "supabase/migrations/00007_subscriptions.sql"
      provides: "subscriptions table + RLS + classrooms public SELECT policy"
      contains: "CREATE TABLE subscriptions"
    - path: "src/types/database.ts"
      provides: "TypeScript types for subscriptions table"
      contains: "SubscriptionStatus"
    - path: "src/features/student/__tests__/useAllClassrooms.test.ts"
      provides: "Wave 0 test stubs for DISC-01"
      contains: "it.todo"
    - path: "src/features/student/__tests__/useSubscribe.test.ts"
      provides: "Wave 0 test stubs for SUB-02"
      contains: "it.todo"
  key_links:
    - from: "supabase/migrations/00007_subscriptions.sql"
      to: "Supabase remote database"
      via: "supabase db push"
      pattern: "subscriptions"
    - from: "src/types/database.ts"
      to: "src/features/student/ hooks"
      via: "Database['public']['Tables']['subscriptions']"
      pattern: "subscriptions"
---

<objective>
Create the data foundation for Phase 5: Supabase migration, TypeScript types, and Wave 0 test stubs.

Purpose: Every subsequent plan in this phase depends on the `subscriptions` table being live and correctly typed. The classrooms public SELECT policy must exist before any discovery UI can function. Test stubs let jest validate test infrastructure before hook implementation.

Output: Migration file, pushed schema, updated database.ts, four test stub files.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/05-student-discovery-and-subscriptions/05-CONTEXT.md
@.planning/phases/05-student-discovery-and-subscriptions/05-RESEARCH.md

Key decisions from CONTEXT.md:
- D-12: subscriptions table schema (id, student_id, classroom_id, subscribed_at, status)
- D-13: classrooms needs public SELECT policy for authenticated users on published rows
- RLS pattern: (SELECT auth.uid()) subquery — see 00006_classroom_sections_cards.sql for reference
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write and push migration 00007_subscriptions.sql</name>
  <files>supabase/migrations/00007_subscriptions.sql</files>
  <read_first>
    - supabase/migrations/00006_classroom_sections_cards.sql — RLS policy pattern with (SELECT auth.uid()) subquery
    - supabase/migrations/00005_tutor_tables.sql — FK pattern for profiles.id and tutors.id references
    - src/types/database.ts — confirm classrooms.tutor_id FK chain for the tutor read policy
  </read_first>
  <action>
Create `supabase/migrations/00007_subscriptions.sql` with EXACTLY this content:

```sql
-- Phase 5: Student subscriptions (DISC-01, DISC-02, DISC-03, DISC-04, SUB-01, SUB-02, SUB-03)

-- 1. Allow any authenticated user to browse published classrooms (DISC-01)
-- CRITICAL: Without this policy, useAllClassrooms returns [] with no error (silent RLS failure)
-- The existing tutor-scoped SELECT policy remains — Postgres applies OR logic across FOR SELECT policies
CREATE POLICY "authenticated users can browse published classrooms"
  ON classrooms FOR SELECT
  USING (is_published = true AND auth.uid() IS NOT NULL);

-- Also allow authenticated users to SELECT sections of published classrooms (DISC-02)
CREATE POLICY "authenticated users can read sections of published classrooms"
  ON classroom_sections FOR SELECT
  USING (classroom_id IN (
    SELECT id FROM classrooms WHERE is_published = true AND auth.uid() IS NOT NULL
  ));

-- Also allow authenticated users to SELECT cards of published classrooms (SUB-02 — subscribed view)
CREATE POLICY "authenticated users can read cards of published classrooms"
  ON classroom_cards FOR SELECT
  USING (section_id IN (
    SELECT id FROM classroom_sections WHERE classroom_id IN (
      SELECT id FROM classrooms WHERE is_published = true AND auth.uid() IS NOT NULL
    )
  ));

-- 2. New subscriptions table (D-12)
CREATE TABLE subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  classroom_id  UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  UNIQUE(student_id, classroom_id)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Student reads their own subscriptions (SUB-03)
CREATE POLICY "student can read own subscriptions"
  ON subscriptions FOR SELECT
  USING (student_id = (SELECT auth.uid()));

-- Student creates their own subscriptions (SUB-01)
CREATE POLICY "student can create own subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (student_id = (SELECT auth.uid()));

-- Tutor reads subscriptions to their classrooms
CREATE POLICY "tutor can read classroom subscriptions"
  ON subscriptions FOR SELECT
  USING (classroom_id IN (
    SELECT id FROM classrooms WHERE tutor_id IN (
      SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())
    )
  ));
```

After writing the file, push the migration:
```
SUPABASE_ACCESS_TOKEN must be set in env. Run: supabase db push
```

If `supabase db push` prompts interactively and cannot be suppressed, stop and flag for manual push with `autonomous: false`.
  </action>
  <verify>
    <automated>grep -c "CREATE TABLE subscriptions" "/Users/johanduplessis/Desktop/Claude Code/Druip/supabase/migrations/00007_subscriptions.sql"</automated>
    Expect output: 1

    After db push: `supabase db push` exits 0 with no error output.
  </verify>
  <done>
    - File exists at supabase/migrations/00007_subscriptions.sql
    - Contains CREATE TABLE subscriptions, 3 RLS policies on subscriptions, 1 policy on classrooms, 1 policy on classroom_sections, 1 policy on classroom_cards
    - `supabase db push` completes without error
  </done>
</task>

<task type="auto">
  <name>Task 2: Add subscriptions types to database.ts + Wave 0 test stubs</name>
  <files>
    src/types/database.ts
    src/features/student/__tests__/useAllClassrooms.test.ts
    src/features/student/__tests__/useClassroomDetail.test.ts
    src/features/student/__tests__/useMySubscriptions.test.ts
    src/features/student/__tests__/useSubscribe.test.ts
  </files>
  <read_first>
    - src/types/database.ts — read the full file first; ADD to it, do NOT overwrite
    - src/features/tutor/__tests__/useCreateClassroom.test.ts — exact it.todo() pattern to replicate
  </read_first>
  <action>
**1. Update src/types/database.ts**

Add `SubscriptionStatus` type after the existing type aliases at the top (after `CardType`):
```typescript
export type SubscriptionStatus = 'active' | 'cancelled';
```

Add `subscriptions` table entry inside `Database['public']['Tables']`, AFTER the `classroom_cards` entry and BEFORE `user_lesson_progress`:
```typescript
      subscriptions: {
        Row: {
          id: string;
          student_id: string;
          classroom_id: string;
          subscribed_at: string;
          status: SubscriptionStatus;
        };
        Insert: {
          student_id: string;
          classroom_id: string;
          status?: SubscriptionStatus;
        };
        Update: Partial<{ status: SubscriptionStatus }>;
        Relationships: [];
      };
```

Add `subscription_status: SubscriptionStatus` to the `Enums` block at the bottom.

**2. Create src/features/student/__tests__/useAllClassrooms.test.ts**
```typescript
describe('useAllClassrooms', () => {
  it.todo('returns all published classrooms');
  it.todo('returns tutor email for each classroom');
  it.todo('returns empty array when no published classrooms exist');
});
```

**3. Create src/features/student/__tests__/useClassroomDetail.test.ts**
```typescript
describe('useClassroomDetail', () => {
  it.todo('returns classroom with sections when given a valid id');
  it.todo('formats price_cents as R{amount}/month (18000 → R180/month)');
  it.todo('returns undefined when classroomId is undefined (hook disabled)');
});
```

**4. Create src/features/student/__tests__/useMySubscriptions.test.ts**
```typescript
describe('useMySubscriptions', () => {
  it.todo('returns subscriptions for the current user');
  it.todo('returns empty array when user has no subscriptions');
  it.todo('isSubscribed is true when subscriptions contains matching classroomId + active status');
});
```

**5. Create src/features/student/__tests__/useSubscribe.test.ts**
```typescript
describe('useSubscribe', () => {
  it.todo('inserts a subscription row with student_id and classroom_id');
  it.todo('invalidates subscriptions query on success');
  it.todo('invalidates classroom-detail query on success');
  it.todo('subscription button is disabled while mutation isPending');
});
```

Create the `src/features/student/__tests__/` directory if it does not exist.
  </action>
  <verify>
    <automated>npx jest --testPathPattern="features/student" --passWithNoTests 2>&1 | tail -5</automated>
    Expect: "Test Suites: 4 passed" and "Tests: 0 todo, 0 passed" (or similar — all suites recognised, no failures).

    Also verify types:
    <automated>grep "SubscriptionStatus" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/types/database.ts"</automated>
    Expect: 3 matches (type alias, Row field, Enums entry).
  </verify>
  <done>
    - src/types/database.ts exports SubscriptionStatus and subscriptions table types
    - 4 test stub files exist under src/features/student/__tests__/
    - `npx jest --testPathPattern="features/student"` exits 0 with all 4 suites passing (todo stubs count as passing)
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. `supabase/migrations/00007_subscriptions.sql` exists and contains CREATE TABLE subscriptions
2. `grep "SubscriptionStatus" src/types/database.ts` returns 3 lines
3. `grep "subscriptions:" src/types/database.ts` returns 1 match
4. `npx jest --testPathPattern="features/student"` exits 0 with 4 test suites recognized
5. `supabase db push` has been run successfully (migration is live in remote DB)
</verification>

<success_criteria>
- subscriptions table is live in Supabase with correct columns and all 5 RLS policies
- classrooms table has public SELECT policy for authenticated users on published rows
- classroom_sections and classroom_cards have read policies for authenticated users on published classrooms
- TypeScript types for subscriptions are in database.ts
- 4 test stub files are parseable by jest
</success_criteria>

<output>
After completion, create `.planning/phases/05-student-discovery-and-subscriptions/05-P00-SUMMARY.md`
</output>
