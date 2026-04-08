---
phase: 07-student-onboarding
plan: P01
type: execute
wave: 1
depends_on:
  - P00
files_modified:
  - src/features/onboarding/useSubjectTags.ts
  - src/features/onboarding/useStudentProfile.ts
  - src/features/onboarding/useUpsertStudentProfile.ts
  - src/features/onboarding/useStudentSubjectTags.ts
  - src/features/auth/useAuthStore.ts
  - src/features/student/useAllClassrooms.ts
autonomous: true
requirements:
  - ONBD-01
  - ONBD-05
  - ONBD-08

must_haves:
  truths:
    - "useSubjectTags returns all tags from the subject_tags table ordered by name"
    - "useStudentProfile returns null (not error) for new users with no student_profiles row"
    - "useUpsertStudentProfile creates a row on first call and updates on subsequent calls"
    - "useStudentSubjectTags saves and retrieves student tag selections from the junction table"
    - "useAuthStore exposes pendingStudentOnboarding flag that blocks routing to tabs"
    - "useAllClassrooms filters by student subject tags when tag IDs are provided"
    - "useAllClassrooms returns all classrooms when tag IDs are empty or undefined"
  artifacts:
    - path: "src/features/onboarding/useSubjectTags.ts"
      provides: "TanStack Query hook for reading subject_tags"
      exports: ["useSubjectTags"]
    - path: "src/features/onboarding/useStudentProfile.ts"
      provides: "TanStack Query hook for reading student_profiles with maybeSingle"
      exports: ["useStudentProfile"]
    - path: "src/features/onboarding/useUpsertStudentProfile.ts"
      provides: "TanStack mutation hook for creating/updating student_profiles"
      exports: ["useUpsertStudentProfile"]
    - path: "src/features/onboarding/useStudentSubjectTags.ts"
      provides: "Hooks for reading and saving student subject tag selections"
      exports: ["useStudentSubjectTags", "useSaveStudentSubjectTags"]
    - path: "src/features/auth/useAuthStore.ts"
      provides: "pendingStudentOnboarding flag and setPendingStudentOnboarding action"
      contains: "pendingStudentOnboarding"
    - path: "src/features/student/useAllClassrooms.ts"
      provides: "Tag-filtered classroom query"
      contains: "classroom_subject_tags"
  key_links:
    - from: "src/features/onboarding/useStudentProfile.ts"
      to: "student_profiles table"
      via: "supabase.from('student_profiles').select().eq('id', userId).maybeSingle()"
      pattern: "maybeSingle"
    - from: "src/features/student/useAllClassrooms.ts"
      to: "classroom_subject_tags table"
      via: "supabase.from('classrooms').select('*, classroom_subject_tags!inner(tag_id)').in()"
      pattern: "classroom_subject_tags!inner"
    - from: "src/features/auth/useAuthStore.ts"
      to: "src/app/_layout.tsx"
      via: "pendingStudentOnboarding flag consumed by root guard"
      pattern: "pendingStudentOnboarding"
---

<objective>
Create all TanStack Query hooks and Zustand store updates needed for the student onboarding flow.

Purpose: The UI screens (Plan P02) need data hooks to read/write student profiles, subject tags, and tag selections. The auth store needs a pendingStudentOnboarding flag to gate routing. The marketplace needs tag-filtered classroom queries for ONBD-08.

Output: 4 new hook files in src/features/onboarding/, updated useAuthStore, updated useAllClassrooms.
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

<interfaces>
From src/features/auth/useAuthStore.ts:
```typescript
interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isOnline: boolean;
  pendingTutorOnboarding: boolean;
  pendingUserId: string | null;
  // ... setters for each
}
export const useAuthStore = create<AuthState>((set) => ({...}));
export function initializeAuthListener() {...}
```

From src/features/student/useAllClassrooms.ts:
```typescript
export type ClassroomWithTutor = ClassroomRow & {
  tutors: { user_id: string; profiles: { email: string } };
};
export function useAllClassrooms() {
  // queries classrooms with tutors!inner(user_id, profiles!inner(email))
  // .eq('is_published', true)
}
```

From src/features/study/useProfile.ts (TanStack Query pattern):
```typescript
export function useProfile() {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => { ... supabase.from('profiles')... },
    enabled: !!userId,
  });
}
```

From src/types/database.ts (new types from P00):
```typescript
export type HelpType = 'understanding' | 'test-prep' | 'assignments' | 'exam-prep' | 'practical-skills';
// Tables: subject_tags, classroom_subject_tags, student_profiles, student_subject_tags
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create onboarding query hooks (useSubjectTags, useStudentProfile, useUpsertStudentProfile, useStudentSubjectTags)</name>
  <files>
    src/features/onboarding/useSubjectTags.ts
    src/features/onboarding/useStudentProfile.ts
    src/features/onboarding/useUpsertStudentProfile.ts
    src/features/onboarding/useStudentSubjectTags.ts
  </files>
  <read_first>
    - src/features/study/useProfile.ts -- TanStack Query hook pattern (useQuery with supabase)
    - src/features/student/useSubscribe.ts -- useMutation pattern with invalidateQueries
    - src/features/student/useAllClassrooms.ts -- query key naming convention
    - src/types/database.ts -- confirm student_profiles and subject_tags types exist (from P00)
  </read_first>
  <action>
**1. Create src/features/onboarding/useSubjectTags.ts**

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useSubjectTags() {
  return useQuery({
    queryKey: ['subject_tags'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subject_tags')
        .select('id, name, slug')
        .order('name')
        .throwOnError();
      return data ?? [];
    },
  });
}
```

**2. Create src/features/onboarding/useStudentProfile.ts**

CRITICAL: Use `.maybeSingle()` NOT `.single()` — new users have no student_profiles row. `.single()` throws PGRST116 when no row exists.

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useStudentProfile() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['student_profile', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', userId!)
        .maybeSingle()
        .throwOnError();
      return data; // null if no row exists (new user)
    },
    enabled: !!userId,
  });
}
```

**3. Create src/features/onboarding/useUpsertStudentProfile.ts**

Uses Supabase upsert with onConflict: 'id'. Each onboarding screen calls this with only its own fields — progressive accumulation.

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Database } from '@/types/database';

type StudentProfileInsert = Database['public']['Tables']['student_profiles']['Insert'];

export function useUpsertStudentProfile() {
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async (fields: Partial<Omit<StudentProfileInsert, 'id'>>) => {
      if (!userId) throw new Error('Not authenticated');
      const { data } = await supabase
        .from('student_profiles')
        .upsert(
          { id: userId, ...fields, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        )
        .select()
        .single()
        .throwOnError();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student_profile', userId] });
    },
  });
}
```

**4. Create src/features/onboarding/useStudentSubjectTags.ts**

Two hooks: one for reading current selections, one for saving (delete all + insert new).

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useStudentSubjectTags() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['student_subject_tags', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_subject_tags')
        .select('tag_id')
        .eq('student_id', userId!)
        .throwOnError();
      return (data ?? []).map((row) => row.tag_id);
    },
    enabled: !!userId,
  });
}

export function useSaveStudentSubjectTags() {
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async (tagIds: string[]) => {
      if (!userId) throw new Error('Not authenticated');
      // Delete all existing tags, then insert new selections
      await supabase
        .from('student_subject_tags')
        .delete()
        .eq('student_id', userId)
        .throwOnError();

      if (tagIds.length > 0) {
        await supabase
          .from('student_subject_tags')
          .insert(tagIds.map((tag_id) => ({ student_id: userId, tag_id })))
          .throwOnError();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student_subject_tags', userId] });
    },
  });
}
```

Create the `src/features/onboarding/` directory if it does not exist.
  </action>
  <verify>
    <automated>ls "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/onboarding/useSubjectTags.ts" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/onboarding/useStudentProfile.ts" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/onboarding/useUpsertStudentProfile.ts" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/onboarding/useStudentSubjectTags.ts" 2>&1</automated>
    Expect: All 4 files listed with no "No such file" errors.

    <automated>grep -c "maybeSingle" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/onboarding/useStudentProfile.ts"</automated>
    Expect: 1
  </verify>
  <done>
    - 4 hook files exist in src/features/onboarding/
    - useStudentProfile uses .maybeSingle() (not .single())
    - useUpsertStudentProfile uses upsert with onConflict: 'id'
    - useSaveStudentSubjectTags does delete + insert pattern
    - All hooks follow established TanStack Query patterns
  </done>
</task>

<task type="auto">
  <name>Task 2: Update useAuthStore with pendingStudentOnboarding + update useAllClassrooms with tag filtering</name>
  <files>
    src/features/auth/useAuthStore.ts
    src/features/student/useAllClassrooms.ts
  </files>
  <read_first>
    - src/features/auth/useAuthStore.ts -- current state shape, initializeAuthListener
    - src/features/student/useAllClassrooms.ts -- current query structure
  </read_first>
  <action>
**1. Update src/features/auth/useAuthStore.ts**

Add to AuthState interface:
```typescript
pendingStudentOnboarding: boolean;
setPendingStudentOnboarding: (pending: boolean) => void;
```

Add to the create() initial state:
```typescript
pendingStudentOnboarding: false,
setPendingStudentOnboarding: (pendingStudentOnboarding) => set({ pendingStudentOnboarding }),
```

Update `initializeAuthListener()` to check student onboarding status after successful auth. Inside the `else` block (after `return supabase.auth.getSession()...`), AFTER setting the session, add a check:

```typescript
// After setting session, check student onboarding status
// Only for non-tutors — tutors skip student onboarding entirely
.then(async () => {
  const store = useAuthStore.getState();
  if (!store.session) return;
  const userId = store.session.user.id;

  // Check if user is a tutor — tutors bypass student onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_tutor')
    .eq('id', userId)
    .single();

  if (profile?.is_tutor) return;

  // Check student onboarding completion
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('onboarding_complete')
    .eq('id', userId)
    .maybeSingle();

  // null (no row) or onboarding_complete = false means onboarding pending
  if (!studentProfile || !studentProfile.onboarding_complete) {
    store.setPendingStudentOnboarding(true);
  }
});
```

CRITICAL: Keep `isLoading = true` until this check resolves. Move the `.finally(() => setLoading(false))` to AFTER the student onboarding check, not before. This prevents the root guard from flashing the home screen before the onboarding check completes (Pitfall 2 from RESEARCH.md).

The full flow should be:
1. getUser() -> if valid user, getSession()
2. setSession(session)
3. Check is_tutor -> if not tutor, check student_profiles.onboarding_complete
4. Set pendingStudentOnboarding if needed
5. THEN setLoading(false) in .finally()

ALSO update the `onAuthStateChange` handler: when it fires with a valid user on `SIGNED_IN`, it must NOT call `setLoading(false)` immediately. Instead it should run the same is_tutor → student_profiles check before calling `setLoading(false)`. This covers the returning-user cold-start path. Without this, `isLoading` becomes false before `pendingStudentOnboarding` is resolved, causing a race condition in the root guard for returning students.

**2. Update src/features/student/useAllClassrooms.ts**

Add an optional `tagIds` parameter for tag-based filtering (ONBD-08). When tagIds are provided and non-empty, filter classrooms via the classroom_subject_tags junction.

CRITICAL: When tagIds is empty or undefined, skip the tag filter entirely — return ALL classrooms. Passing an empty array to .in() returns zero rows (Pitfall 5 from RESEARCH.md).

```typescript
export function useAllClassrooms(tagIds?: string[]) {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;
  const hasTagFilter = tagIds && tagIds.length > 0;

  return useQuery({
    queryKey: ['classrooms', tagIds ?? []],
    queryFn: async (): Promise<ClassroomWithTutor[]> => {
      let query = supabase
        .from('classrooms')
        .select('*, tutors!inner(user_id, profiles!inner(email))')
        .eq('is_published', true);

      if (hasTagFilter) {
        // Get classroom IDs that have matching tags
        const { data: taggedClassrooms } = await supabase
          .from('classroom_subject_tags')
          .select('classroom_id')
          .in('tag_id', tagIds)
          .throwOnError();

        const classroomIds = [...new Set((taggedClassrooms ?? []).map((r) => r.classroom_id))];
        if (classroomIds.length === 0) return [];
        query = query.in('id', classroomIds);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClassroomWithTutor[];
    },
    enabled: !!userId,
  });
}
```

NOTE: Using a two-step query (fetch matching classroom IDs, then filter) instead of the `!inner` join approach because the existing select already uses `tutors!inner` — nesting multiple `!inner` joins can cause PostgREST issues. The two-step approach is clearer and avoids ambiguous join paths.
  </action>
  <verify>
    <automated>grep -c "pendingStudentOnboarding" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/auth/useAuthStore.ts"</automated>
    Expect: At least 4 (interface, initial state, setter, usage in initializeAuthListener)

    <automated>grep -c "classroom_subject_tags" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/student/useAllClassrooms.ts"</automated>
    Expect: At least 1

    <automated>grep -c "tagIds" "/Users/johanduplessis/Desktop/Claude Code/Druip/src/features/student/useAllClassrooms.ts"</automated>
    Expect: At least 3
  </verify>
  <done>
    - useAuthStore has pendingStudentOnboarding flag + setter + check in initializeAuthListener
    - initializeAuthListener checks student_profiles.onboarding_complete for non-tutors
    - isLoading stays true until onboarding check resolves (no flash)
    - useAllClassrooms accepts optional tagIds parameter
    - Empty/undefined tagIds returns all classrooms (no empty .in() pitfall)
    - Tag filtering uses two-step query via classroom_subject_tags junction
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client -> useUpsertStudentProfile | Mutation writes to student_profiles; RLS enforces id = auth.uid() |
| client -> useSaveStudentSubjectTags | Mutation writes to student_subject_tags; RLS enforces student_id = auth.uid() |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-07-05 | Tampering | useUpsertStudentProfile | mitigate | RLS at DB layer; mutation always sets id = userId from session (not user input) |
| T-07-06 | Tampering | useSaveStudentSubjectTags | mitigate | RLS at DB layer; delete + insert scoped to student_id = userId from session |
| T-07-07 | Information Disclosure | useStudentProfile | mitigate | RLS ensures .eq('id', userId) only returns own row |
| T-07-08 | Elevation of Privilege | initializeAuthListener | accept | is_tutor check uses server-side profile fetch; client cannot fake tutor status to skip onboarding |
</threat_model>

<verification>
After both tasks:
1. 4 new files in src/features/onboarding/ (hooks)
2. useAuthStore has pendingStudentOnboarding (grep count >= 4)
3. useAllClassrooms accepts tagIds parameter
4. `npx jest --testPathPattern="features/(onboarding|student)" --passWithNoTests` exits 0
</verification>

<success_criteria>
- All 4 onboarding hooks exist and follow established TanStack Query patterns
- useStudentProfile uses maybeSingle (not single)
- useAuthStore blocks routing until student onboarding check completes
- useAllClassrooms filters by tags when provided, returns all when empty
- No flash of home screen for incomplete-onboarding users
</success_criteria>

<output>
After completion, create `.planning/phases/07-student-onboarding/07-P01-SUMMARY.md`
</output>
