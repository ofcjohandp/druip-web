# Phase 2: Study Flow - Context

**Gathered:** 2026-04-06
**Status:** Ready for planning

<domain>
## Phase Boundary

A student can navigate from the Study tab into a lesson, move through questions one at a time with immediate color/icon feedback, see explanations for wrong answers, and land on a lesson-complete screen showing XP earned and streak status.

Entry point: Study tab (currently a placeholder screen). Exit point: lesson-complete screen with CTA back to the Study tab.

No readiness scoring, no notes, no streaks backend — those are Phase 3 and 4. This phase wires the quiz engine to real Supabase data and writes lesson attempts to the database.

</domain>

<decisions>
## Implementation Decisions

### Study Tab Entry & Navigation
- **D-01:** Study tab shows a scrollable list of topic cards. Tap a topic → navigates to a lesson list screen for that topic. Tap a lesson → starts the lesson (quiz engine).
- **D-02:** Topic cards display: topic name + readiness tier label (Not Started / Learning / Practicing / Ready) + lesson count (e.g. "3 of 8 lessons done"). No progress bar on topic cards — tier label is the primary readiness signal.
- **D-03:** Locked lessons (sequential unlock via `lessons.order`) are visible in the lesson list but grayed out with a lock icon. Tapping a locked lesson shows no navigation — visual dead end is sufficient for MVP.
- **D-04:** The first lesson in each topic is always unlocked (CONT-04). Completed lessons show a checkmark state. The current (next unlocked) lesson is visually prominent — full opacity, accent border or subtle highlight.

### Feedback Panel
- **D-05:** Feedback appears as a slide-up panel from the bottom of the screen (not inline within the question card). This separates the "answer zone" (top) from the "feedback zone" (bottom) clearly.
- **D-06:** Correct answers: panel shows brief positive reinforcement text (1 line) + "Continue" button. No auto-advance.
- **D-07:** Wrong answers: panel shows "Correct answer: [option text]" + explanation text (CONT-06 guarantee) + "Continue" button. Never auto-advance on wrong (STUDY-06).

### Correct Answer Celebration
- **D-08:** Correct answer visual feedback: green background + checkmark icon on the selected option (within 150ms, STUDY-04). No animation beyond the color change for Phase 2 — keep it fast and frictionless.

### Lesson-Complete Screen
- **D-09:** Full-screen (not a modal/sheet). Shows: XP earned, score summary ("12 of 15 correct"), streak status (current streak count from `profiles.streak_count`). Single primary CTA: "Continue" → returns to the lesson list for the same topic.
- **D-10:** Tone: calm celebration — not confetti explosions. Consistent with the "calmer, clearer, more in control" core value.

### Data Layer
- **D-11:** `lesson_attempts` table does not exist in the current schema — it must be added as part of this phase. Columns: `id`, `user_id`, `lesson_id`, `score`, `total_questions`, `status` (enum: `in_progress` | `completed`), `started_at`, `completed_at`.
- **D-12:** On lesson complete, write a `lesson_attempts` row with `status: completed`. Also upsert `user_lesson_progress` with `completed: true`, `score`, `completed_at` (PROG-07 trigger handles readiness recalc — but the trigger is Phase 3; for Phase 2 just write the rows).
- **D-13:** Quiz session state lives in Zustand (not React state). Store: `lessonId`, `questions[]`, `currentIndex`, `answers[]`, `score`, `isLocked`. Cleared on lesson exit.
- **D-14:** Questions are fetched via TanStack Query keyed by `lessonId`. Fetch all questions for the lesson upfront (no lazy loading per question).

### Claude's Discretion
- Exact slide-up panel animation (spring vs timing, height)
- Positive reinforcement copy for correct answers ("Nice!" / "Correct!" etc.)
- Study tab screen component names and file paths (follow `src/features/{feature}/` pattern)
- Lesson list screen layout detail beyond what's specified above
- Loading and empty states for topic list and lesson list
- `hitSlop` values for touch targets (STUDY-08)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Requirements
- `.planning/REQUIREMENTS.md` §Study Flow — STUDY-01 through STUDY-09 (full study flow spec)
- `.planning/REQUIREMENTS.md` §Content Structure — CONT-06 (explanation required before publish)
- `.planning/ROADMAP.md` §Phase 2 — Phase goal, success criteria, 4-plan breakdown

### Codebase Patterns to Reuse
- `src/features/onboarding/SampleLessonEngine.tsx` — REFERENCE IMPLEMENTATION for the quiz engine. Phase 2 builds the real version using this as a pattern. State shape, option rendering, lock logic, and feedback panel structure are all established here.
- `src/features/ui/theme.ts` — Single source of truth for COLORS, RADII, SPACING. All new components MUST import from here (D-10 to D-14 from Phase 1 context).
- `src/features/ui/WindowedFlatList.tsx` — Use for topic list and lesson list. Do NOT use for the active question card (single card render only).
- `src/lib/supabase.ts` — Supabase client. Use typed as `Database` from `src/types/database.ts`.
- `src/types/database.ts` — Current type stubs. Phase 2 adds `lesson_attempts` table type here.

### Phase 1 Context (locked decisions)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Visual identity decisions (D-10 to D-17), auth/session decisions (D-18 to D-20), schema decisions (D-21 to D-25)

### Project Stack Reference
- `CLAUDE.md` §Technology Stack — TanStack Query v5, Zustand, Expo Router, Supabase client gotchas

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SampleLessonEngine` — complete quiz loop already implemented for onboarding. The real lesson engine reuses this exact pattern: useState → Zustand, hardcoded questions → TanStack Query, local complete callback → Supabase write + nav to lesson-complete screen.
- `theme.ts` — all visual tokens ready. No new tokens needed for this phase.
- `WindowedFlatList` — pre-configured for topic and lesson lists.
- `profiles` table — has `streak_count`, `total_xp` columns for reading on lesson-complete screen.
- `user_lesson_progress` table — exists, writable for tracking lesson completion.

### Established Patterns
- Screen files in `src/app/` are thin route wrappers — business logic lives in `src/features/`.
- Feature grouping: `src/features/{feature}/` contains the store, query hooks, and feature-specific components.
- Supabase typed with `Database` type — `supabase` client already exported from `src/lib/supabase.ts`.
- Auth state via `useAuthStore` from `src/features/auth/useAuthStore.ts`.

### Integration Points
- `src/app/(tabs)/study.tsx` — currently a placeholder. Phase 2 replaces this with the topic list.
- New screens needed: `src/app/(tabs)/study/[topicId].tsx` (lesson list), `src/app/lesson/[lessonId].tsx` (quiz engine), `src/app/lesson-complete.tsx` (results screen).
- `lesson_attempts` table must be added to both Supabase migration AND `src/types/database.ts`.
- Zustand store for quiz session: new file in `src/features/study/useStudySessionStore.ts`.
- TanStack Query hooks for lessons/questions: `src/features/study/useLessonQuestions.ts`.

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed tightly within phase scope.

</deferred>

---

*Phase: 02-study-flow*
*Context gathered: 2026-04-06*
