---
phase: 07-student-onboarding
plan: P00
type: execute
wave: 0
depends_on: []
files_modified:
  - supabase/migrations/00012_student_onboarding.sql
  - src/types/database.ts
  - src/features/onboarding/__tests__/useStudentProfile.test.ts
  - src/features/onboarding/__tests__/useSubjectTags.test.ts
  - src/features/onboarding/__tests__/useStudentSubjectTags.test.ts
  - src/features/student/__tests__/useAllClassrooms.test.ts
autonomous: true
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
    - "subject_tags, classroom_subject_tags, student_profiles, and student_subject_tags tables exist in Supabase with correct columns and RLS policies"
    - "Existing classrooms.subjects TEXT[] data is migrated into subject_tags + classroom_subject_tags junction"
    - "TypeScript types for all four new tables exist in database.ts"
    - "Wave 0 test stub files exist and npx jest recognises them as valid test suites"
  artifacts:
    - path: "supabase/migrations/00012_student_onboarding.sql"
      provides: "4 new tables + RLS + data migration from classrooms.subjects"
      contains: "CREATE TABLE subject_tags"
    - path: "src/types/database.ts"
      provides: "TypeScript types for subject_tags, classroom_subject_tags, student_profiles, student_subject_tags"
      contains: "student_profiles"
    - path: "src/features/onboarding/__tests__/useStudentProfile.test.ts"
      provides: "Wave 0 test stubs for profile hooks"
      contains: "it.todo"
    - path: "src/features/onboarding/__tests__/useSubjectTags.test.ts"
      provides: "Wave 0 test stubs for subject tags hook"
      contains: "it.todo"
  key_links:
    - from: "supabase/migrations/00012_student_onboarding.sql"
      to: "Supabase remote database"
      via: "supabase db push"
      pattern: "student_profiles"
    - from: "src/types/database.ts"
      to: "src/features/onboarding/ hooks"
      via: "Database['public']['Tables']['student_profiles']"
      pattern: "student_profiles"
---

<objective>
Create the data foundation for Phase 7: Supabase migration (4 new tables + data migration), TypeScript types, and Wave 0 test stubs.

Purpose: Every subsequent plan depends on student_profiles, subject_tags, and junction tables being live and correctly typed. The classrooms.subjects TEXT[] data must be migrated to the normalised classroom_subject_tags junction before tag-filtered queries can work (ONBD-08).

Output: Migration file (pushed), updated database.ts, test stub files.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/07-student-onboarding/07-RESEARCH.md

Key decisions:
- student_profiles is a separate table (1-to-1 FK to profiles.id) — mirrors Phase 3 tutors table split
- subject_tags shared between tutors and students
- classroom_subject_tags junction replaces classrooms.subjects TEXT[] for filtering
- RLS pattern: (SELECT auth.uid()) subquery — established in all prior migrations
- Wave 0 test stubs use it.todo() with no imports/mocks (Phase 4 decision)

<interfaces>
From supabase/migrations/00005_tutor_tables.sql (RLS pattern reference):
```sql
CREATE POLICY "tutor can manage own record"
  ON tutors FOR ALL
  USING (user_id = (SELECT auth.uid()));
```

From src/types/database.ts (type pattern reference):
```typescript
export type SubscriptionStatus = 'active' | 'cancelled';
// Tables follow Row/Insert/Update/Relationships pattern
```

From src/features/tutor/__tests__/useCreateClassroom.test.ts (it.todo pattern):
```typescript
describe('useCreateClassroom', () => {
  it.todo('creates a classroom row');
});
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Write and push migration 00012_student_onboarding.sql</name>
  <files>supabase/migrations/00012_student_onboarding.sql</files>
  <read_first>
    - supabase/migrations/00005_tutor_tables.sql -- RLS pattern with (SELECT auth.uid()) and FK to profiles(id)
    - supabase/migrations/00006_classroom_sections_cards.sql -- junction table and CHECK constraint patterns
    - supabase/migrations/00007_subscriptions.sql -- latest RLS policy style reference
  </read_first>
  <action>
Create `supabase/migrations/00012_student_onboarding.sql` with EXACTLY this content:

```sql
-- Phase 7: Student Onboarding (ONBD-01 through ONBD-08)
-- Creates subject_tags, classroom_subject_tags, student_profiles, student_subject_tags
-- Migrates existing classrooms.subjects TEXT[] into normalised tag junction

-- 1. subject_tags: shared tag library for tutors and students
CREATE TABLE subject_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE subject_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone authenticated can read subject_tags"
  ON subject_tags FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 2. classroom_subject_tags: classroom -> tag junction (replaces classrooms.subjects TEXT[])
CREATE TABLE classroom_subject_tags (
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  tag_id       UUID NOT NULL REFERENCES subject_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (classroom_id, tag_id)
);

ALTER TABLE classroom_subject_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated users can read classroom_subject_tags"
  ON classroom_subject_tags FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "tutor can manage own classroom tags"
  ON classroom_subject_tags FOR ALL
  USING (classroom_id IN (
    SELECT id FROM classrooms WHERE tutor_id IN (
      SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())
    )
  ));

-- 3. student_profiles: student-specific onboarding data (1-to-1 with profiles)
CREATE TABLE student_profiles (
  id                  UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  first_name          TEXT,
  last_name           TEXT,
  photo_url           TEXT,
  university          TEXT,
  campus              TEXT,
  degree              TEXT,
  year_of_study       INTEGER CHECK (year_of_study BETWEEN 1 AND 8),
  help_types          TEXT[] NOT NULL DEFAULT '{}',
  upcoming_test_date  DATE,
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student can read own profile"
  ON student_profiles FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "student can insert own profile"
  ON student_profiles FOR INSERT
  WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "student can update own profile"
  ON student_profiles FOR UPDATE
  USING (id = (SELECT auth.uid()));

-- 4. student_subject_tags: student -> tag junction
CREATE TABLE student_subject_tags (
  student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES subject_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (student_id, tag_id)
);

ALTER TABLE student_subject_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student can manage own subject tags"
  ON student_subject_tags FOR ALL
  USING (student_id = (SELECT auth.uid()));

-- 5. Trigger: auto-update updated_at on student_profiles
-- update_updated_at_column() function already exists from prior migrations
CREATE TRIGGER set_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Data migration: extract existing classrooms.subjects TEXT[] into normalised tags
-- Insert distinct subjects as tags (slug = lower + replace spaces with hyphens)
INSERT INTO subject_tags (name, slug)
SELECT DISTINCT unnest(subjects) AS name,
       lower(regexp_replace(unnest(subjects), '\s+', '-', 'g')) AS slug
FROM classrooms
WHERE subjects IS NOT NULL AND array_length(subjects, 1) > 0
ON CONFLICT (slug) DO NOTHING;

-- Populate classroom_subject_tags from existing classrooms.subjects
INSERT INTO classroom_subject_tags (classroom_id, tag_id)
SELECT c.id, st.id
FROM classrooms c,
     unnest(c.subjects) AS subj
JOIN subject_tags st ON st.slug = lower(regexp_replace(subj, '\s+', '-', 'g'))
WHERE c.subjects IS NOT NULL AND array_length(c.subjects, 1) > 0
ON CONFLICT DO NOTHING;

-- NOTE: classrooms.subjects TEXT[] column is left in place for backward compatibility.
-- It will be deprecated in a future phase. The source of truth is now classroom_subject_tags.
```

After writing the file, push the migration:
```
supabase db push
```

If `supabase db push` fails or prompts interactively, flag for manual push.

IMPORTANT: The migration must run in order. Confirm the migration number 00012 does not conflict with existing files in supabase/migrations/.
  </action>
  <verify>
    <automated>grep -c "CREATE TABLE subject_tags" "/Users/johanduplessis/Desktop/Claude Code/Druip/supabase/migrations/00012_student_onboarding.sql" && grep -c "CREATE TABLE student_profiles" "/Users/johanduplessis/Desktop/Claude Code/Druip/supabase/migrations/00012_student_onboarding.sql"</automated>
    Expect output: 1 and 1

    After db push: `supabase db push` exits 0 with no error output.
  </verify>
  <done>
    - File exists at supabase/migrations/00012_student_onboarding.sql
    - Contains CREATE TABLE for subject_tags, classroom_subject_tags, student_profiles, student_subject_tags
    - Contains RLS policies for all 4 tables
    - Contains data migration from classrooms.subjects into subject_tags + classroom_subject_tags
    - supabase db push completes without error
  </done>
</task>

<task type="auto">
  <name>Task 2: Add TypeScript types for new tables + Wave 0 test stubs</name>
  <files>
    src/types/database.ts
    src/features/onboarding/__tests__/useStudentProfile.test.ts
    src/features/onboarding/__tests__/useSubjectTags.test.ts
    src/features/onboarding/__tests__/useStudentSubjectTags.test.ts
    src/features/student/__tests__/useAllClassrooms.test.ts
  </files>
  <read_first>
    - src/types/database.ts -- read full file; ADD to it, do NOT overwrite existing types
    - src/features/tutor/__tests__/useCreateClassroom.test.ts -- exact it.todo() pattern to replicate
    - src/features/student/__tests__/useAllClassrooms.test.ts -- check if file exists; if so, ADD new todo stubs for tag filtering
  </read_first>
  <action>
**1. Update src/types/database.ts**

Add `HelpType` type alias after `SubscriptionStatus`:
```typescript
export type HelpType = 'understanding' | 'test-prep' | 'assignments' | 'exam-prep' | 'practical-skills';
```

Add these four table entries inside `Database['public']['Tables']`, AFTER the `subscriptions` entry and BEFORE `user_lesson_progress`:

```typescript
      subject_tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
        };
        Update: Partial<{ name: string; slug: string }>;
        Relationships: [];
      };
      classroom_subject_tags: {
        Row: {
          classroom_id: string;
          tag_id: string;
        };
        Insert: {
          classroom_id: string;
          tag_id: string;
        };
        Update: Partial<{ classroom_id: string; tag_id: string }>;
        Relationships: [];
      };
      student_profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          photo_url: string | null;
          university: string | null;
          campus: string | null;
          degree: string | null;
          year_of_study: number | null;
          help_types: string[];
          upcoming_test_date: string | null;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name?: string | null;
          last_name?: string | null;
          photo_url?: string | null;
          university?: string | null;
          campus?: string | null;
          degree?: string | null;
          year_of_study?: number | null;
          help_types?: string[];
          upcoming_test_date?: string | null;
          onboarding_complete?: boolean;
        };
        Update: Partial<Database['public']['Tables']['student_profiles']['Insert']>;
        Relationships: [];
      };
      student_subject_tags: {
        Row: {
          student_id: string;
          tag_id: string;
        };
        Insert: {
          student_id: string;
          tag_id: string;
        };
        Update: Partial<{ student_id: string; tag_id: string }>;
        Relationships: [];
      };
```

**2. Create src/features/onboarding/__tests__/useStudentProfile.test.ts**
```typescript
describe('useStudentProfile', () => {
  it.todo('returns null for a new user with no student_profiles row');
  it.todo('returns the student profile when it exists');
  it.todo('pendingStudentOnboarding is true when profile is null');
  it.todo('pendingStudentOnboarding is true when onboarding_complete is false');
  it.todo('pendingStudentOnboarding is false when onboarding_complete is true');
});

describe('useUpsertStudentProfile', () => {
  it.todo('creates a new student_profiles row on first save');
  it.todo('updates existing row on subsequent saves');
  it.todo('sets onboarding_complete to true on final step');
});
```

**3. Create src/features/onboarding/__tests__/useSubjectTags.test.ts**
```typescript
describe('useSubjectTags', () => {
  it.todo('returns all subject tags ordered by name');
  it.todo('returns empty array when no tags exist');
});
```

**4. Create src/features/onboarding/__tests__/useStudentSubjectTags.test.ts**
```typescript
describe('useStudentSubjectTags', () => {
  it.todo('returns tag IDs for the current student');
  it.todo('saves selected tag IDs to student_subject_tags junction');
  it.todo('replaces all existing tags on save (delete + insert)');
});
```

**5. Update src/features/student/__tests__/useAllClassrooms.test.ts**

If the file already exists, ADD these todo stubs to the existing describe block:
```typescript
  it.todo('filters classrooms by student subject tag IDs when provided');
  it.todo('returns all classrooms when no tag IDs are provided');
  it.todo('returns all classrooms when tag IDs array is empty');
```

If the file does not exist, create it with all existing + new stubs.

Create the `src/features/onboarding/__tests__/` directory if it does not exist.
  </action>
  <verify>
    <automated>npx jest --testPathPattern="features/(onboarding|student)" --passWithNoTests 2>&1 | tail -5</automated>
    Expect: All test suites recognised, no failures. Todo stubs count as passing.

    Also verify types:
    <automated>grep "student_profiles" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/types/database.ts" | head -3</automated>
    Expect: At least 2 matches (table entry + Insert self-reference).
  </verify>
  <done>
    - src/types/database.ts exports HelpType and has table types for subject_tags, classroom_subject_tags, student_profiles, student_subject_tags
    - 3 new test stub files exist under src/features/onboarding/__tests__/
    - src/features/student/__tests__/useAllClassrooms.test.ts has tag filtering todo stubs
    - npx jest exits 0 with all suites recognised
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client -> student_profiles | Student writes own profile data; RLS ensures id = auth.uid() |
| client -> student_subject_tags | Student writes own tag selections; RLS ensures student_id = auth.uid() |
| client -> subject_tags | Read-only for all authenticated users |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-01 | Tampering | student_profiles | mitigate | RLS policy: id = (SELECT auth.uid()) on INSERT/UPDATE prevents writing other students' profiles |
| T-07-02 | Information Disclosure | student_profiles | mitigate | RLS policy: id = (SELECT auth.uid()) on SELECT prevents reading other students' profiles |
| T-07-03 | Tampering | student_subject_tags | mitigate | RLS policy: student_id = (SELECT auth.uid()) on ALL prevents modifying other students' tags |
| T-07-04 | Spoofing | subject_tags | accept | Read-only table; no write policies for students. Tutor tag management via classroom_subject_tags only. |
</threat_model>

<verification>
After both tasks:
1. `supabase/migrations/00012_student_onboarding.sql` exists with 4 CREATE TABLE statements
2. `supabase db push` completed successfully
3. `grep "student_profiles" src/types/database.ts` returns matches
4. `npx jest --testPathPattern="features/(onboarding|student)"` exits 0
</verification>

<success_criteria>
- 4 new tables live in Supabase: subject_tags, classroom_subject_tags, student_profiles, student_subject_tags
- All tables have correct RLS policies
- Existing classrooms.subjects data migrated to normalised tags
- TypeScript types for all 4 tables in database.ts
- Wave 0 test stubs parseable by jest
</success_criteria>

<output>
After completion, create `.planning/phases/07-student-onboarding/07-P00-SUMMARY.md`
</output>
