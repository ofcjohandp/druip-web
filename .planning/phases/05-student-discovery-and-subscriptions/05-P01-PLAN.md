---
phase: 05-student-discovery-and-subscriptions
plan: P01
type: execute
wave: 1
depends_on:
  - 05-P00
files_modified:
  - src/features/student/useAllClassrooms.ts
  - src/features/student/useClassroomDetail.ts
  - src/features/student/useMySubscriptions.ts
  - src/features/student/useSubscribe.ts
autonomous: true
requirements:
  - DISC-01
  - DISC-02
  - DISC-03
  - DISC-04
  - SUB-02
  - SUB-03

must_haves:
  truths:
    - "`useAllClassrooms` returns all published classrooms with tutor email, subjects, price, bio"
    - "`useClassroomDetail` returns a single classroom with its sections"
    - "`useMySubscriptions` returns the current user's subscriptions array"
    - "`useSubscribe` inserts a subscription and invalidates both query caches"
  artifacts:
    - path: "src/features/student/useAllClassrooms.ts"
      provides: "Discovery list data — query key ['classrooms']"
      exports: ["useAllClassrooms"]
    - path: "src/features/student/useClassroomDetail.ts"
      provides: "Classroom detail + sections — query key ['classroom-detail', id]"
      exports: ["useClassroomDetail"]
    - path: "src/features/student/useMySubscriptions.ts"
      provides: "Current user subscriptions — query key ['subscriptions', userId]"
      exports: ["useMySubscriptions"]
    - path: "src/features/student/useSubscribe.ts"
      provides: "Subscription mutation"
      exports: ["useSubscribe"]
  key_links:
    - from: "src/features/student/useAllClassrooms.ts"
      to: "Supabase classrooms table"
      via: "supabase.from('classrooms').select with is_published=true"
      pattern: "is_published.*true"
    - from: "src/features/student/useSubscribe.ts"
      to: "TanStack Query cache"
      via: "queryClient.invalidateQueries"
      pattern: "invalidateQueries"
---

<objective>
Implement the four TanStack Query hooks that power all student-facing data in Phase 5.

Purpose: Screens built in P03 import these hooks directly. No screen should contain raw Supabase calls. Hooks follow the established pattern from useClassroom.ts and useClassroomSections.ts.

Output: Four hook files in src/features/student/ that screens can import.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/phases/05-student-discovery-and-subscriptions/05-CONTEXT.md
@.planning/phases/05-student-discovery-and-subscriptions/05-RESEARCH.md
@.planning/phases/05-student-discovery-and-subscriptions/05-P00-SUMMARY.md

<interfaces>
<!-- From src/features/tutor/useClassroom.ts — reference pattern -->
```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Database } from '@/types/database';

export function useClassroom() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;
  return useQuery({
    queryKey: ['classroom', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, tutors!inner(user_id)')
        .eq('tutors.user_id', userId!)
        .single();
      if (error) throw error;
      return data as ClassroomRow;
    },
    enabled: !!userId,
  });
}
```

<!-- From src/types/database.ts — types available after P00 -->
```typescript
export type SubscriptionStatus = 'active' | 'cancelled';

// Database['public']['Tables']['subscriptions']['Row']:
// { id: string; student_id: string; classroom_id: string; subscribed_at: string; status: SubscriptionStatus; }
// Database['public']['Tables']['classrooms']['Row']:
// { id, tutor_id, name, subjects: string[], bio: string|null, price_cents: number, is_published: boolean, ... }
// Database['public']['Tables']['classroom_sections']['Row']:
// { id, classroom_id, name, sort_order: number, created_at, updated_at }
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: useAllClassrooms + useClassroomDetail + useMySubscriptions</name>
  <files>
    src/features/student/useAllClassrooms.ts
    src/features/student/useClassroomDetail.ts
    src/features/student/useMySubscriptions.ts
    src/features/student/__tests__/useAllClassrooms.test.ts
    src/features/student/__tests__/useClassroomDetail.test.ts
    src/features/student/__tests__/useMySubscriptions.test.ts
  </files>
  <read_first>
    - src/features/tutor/useClassroom.ts — exact TanStack Query + Supabase pattern to replicate
    - src/features/classroom/useClassroomSections.ts — pattern for section queries
    - src/features/auth/useAuthStore.ts — how to read session.user.id
    - src/types/database.ts — classrooms, classroom_sections, subscriptions Row types
    - src/features/student/__tests__/useAllClassrooms.test.ts — existing stubs to fill
    - src/features/student/__tests__/useClassroomDetail.test.ts — existing stubs to fill
    - src/features/student/__tests__/useMySubscriptions.test.ts — existing stubs to fill
  </read_first>
  <behavior>
    useAllClassrooms:
    - Returns array of published classrooms with tutor email, subjects, price_cents, bio, name
    - Query key: ['classrooms']
    - Only fetches when userId is available (authenticated)

    useClassroomDetail:
    - Returns single classroom with its classroom_sections array, ordered by sort_order asc
    - Query key: ['classroom-detail', classroomId]
    - enabled: !!classroomId (does not fire when classroomId is undefined or empty string)

    useMySubscriptions:
    - Returns array of subscription rows for current user (student_id = auth.uid())
    - Query key: ['subscriptions', userId]
    - enabled: !!userId
  </behavior>
  <action>
**src/features/student/useAllClassrooms.ts** — per D-14:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Database } from '@/types/database';

type ClassroomRow = Database['public']['Tables']['classrooms']['Row'];

export type ClassroomWithTutor = ClassroomRow & {
  tutors: { user_id: string; profiles: { email: string } };
};

export function useAllClassrooms() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['classrooms'],
    queryFn: async (): Promise<ClassroomWithTutor[]> => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, tutors!inner(user_id, profiles!inner(email))')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClassroomWithTutor[];
    },
    enabled: !!userId,
  });
}
```

NOTE: If the join `tutors!inner(user_id, profiles!inner(email))` fails at runtime (returns null), inspect the actual foreign key relationship names in Supabase. Fallback: use `.select('*, tutors!inner(user_id)')` and omit tutor name display until FK is confirmed.

**src/features/student/useClassroomDetail.ts** — per D-15:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ClassroomRow = Database['public']['Tables']['classrooms']['Row'];
type SectionRow = Database['public']['Tables']['classroom_sections']['Row'];

export type ClassroomDetail = ClassroomRow & {
  classroom_sections: SectionRow[];
};

export function useClassroomDetail(classroomId: string | undefined) {
  return useQuery({
    queryKey: ['classroom-detail', classroomId],
    queryFn: async (): Promise<ClassroomDetail> => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, classroom_sections(*)')
        .eq('id', classroomId!)
        .order('sort_order', { referencedTable: 'classroom_sections', ascending: true })
        .single();
      if (error) throw error;
      return data as ClassroomDetail;
    },
    enabled: !!classroomId,
  });
}
```

**src/features/student/useMySubscriptions.ts** — per D-16:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Database } from '@/types/database';

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];

export function useMySubscriptions() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['subscriptions', userId],
    queryFn: async (): Promise<SubscriptionRow[]> => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('student_id', userId!);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!userId,
  });
}
```

Update the three test stub files — replace `it.todo()` stubs with filled implementations following the same mock-free, it.todo pattern from Phase 4. Leave stubs as-is if the test framework would require complex mocking — do not write broken tests to fill coverage.
  </action>
  <verify>
    <automated>npx jest --testPathPattern="features/student/(useAllClassrooms|useClassroomDetail|useMySubscriptions)" 2>&1 | tail -8</automated>
    Expect: all 3 suites pass (todo items count as passing, no failures).

    <automated>grep -l "useAllClassrooms\|useClassroomDetail\|useMySubscriptions" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/student/"*.ts 2>/dev/null | wc -l</automated>
    Expect: 3
  </verify>
  <done>
    - 3 hook files exist under src/features/student/
    - Each exports its named function
    - Each uses the correct query key per D-14, D-15, D-16
    - npx jest on student pattern exits 0
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: useSubscribe mutation</name>
  <files>
    src/features/student/useSubscribe.ts
    src/features/student/__tests__/useSubscribe.test.ts
  </files>
  <read_first>
    - src/features/classroom/useCreateSection.ts — useMutation + queryClient.invalidateQueries pattern
    - src/types/database.ts — subscriptions Insert type
    - src/features/student/__tests__/useSubscribe.test.ts — existing stubs to fill
  </read_first>
  <behavior>
    useSubscribe:
    - mutationFn: inserts { student_id: userId, classroom_id: classroomId, status: 'active' } into subscriptions
    - onSuccess: invalidates ['subscriptions', userId] AND ['classroom-detail', classroomId] per D-17
    - Returns TanStack Query mutation object — consumers check isPending to disable button
  </behavior>
  <action>
**src/features/student/useSubscribe.ts** — per D-17:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useSubscribe() {
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async ({ classroomId }: { classroomId: string }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({ student_id: userId!, classroom_id: classroomId, status: 'active' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { classroomId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] });
      queryClient.invalidateQueries({ queryKey: ['classroom-detail', classroomId] });
    },
  });
}
```
  </action>
  <verify>
    <automated>npx jest --testPathPattern="features/student/useSubscribe" 2>&1 | tail -5</automated>
    Expect: 1 suite passes.

    <automated>grep "invalidateQueries" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/student/useSubscribe.ts" | wc -l</automated>
    Expect: 2 (one per D-17 invalidation)
  </verify>
  <done>
    - src/features/student/useSubscribe.ts exists and exports useSubscribe
    - Calls queryClient.invalidateQueries twice on success (subscriptions + classroom-detail)
    - npx jest on useSubscribe pattern exits 0
  </done>
</task>

</tasks>

<verification>
After both tasks:
1. `ls src/features/student/*.ts` returns 4 files (useAllClassrooms, useClassroomDetail, useMySubscriptions, useSubscribe)
2. `npx jest --testPathPattern="features/student"` exits 0 with 4 suites
3. Each hook file uses the correct query key from D-14, D-15, D-16, D-17
4. useSubscribe calls invalidateQueries for both ['subscriptions', userId] and ['classroom-detail', classroomId]
</verification>

<success_criteria>
- All 4 hooks implemented with correct query keys per CONTEXT.md decisions
- useSubscribe invalidates both query caches on success
- npx jest --testPathPattern="features/student" passes
- No raw Supabase calls outside of hook files — screens will import from here only
</success_criteria>

<output>
After completion, create `.planning/phases/05-student-discovery-and-subscriptions/05-P01-SUMMARY.md`
</output>
