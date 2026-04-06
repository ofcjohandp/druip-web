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
