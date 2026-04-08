-- Phase 3: Tutor onboarding tables (TUTR-01, TUTR-02, TUTR-03, TUTR-04)

-- Add is_tutor flag to profiles (denormalised for fast conditional rendering)
ALTER TABLE profiles ADD COLUMN is_tutor BOOLEAN NOT NULL DEFAULT false;

-- Tutors table (tutor-specific identity, separate from profiles for extensibility)
CREATE TABLE tutors (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor can read own row"
  ON tutors FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "tutor can insert own row"
  ON tutors FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Classrooms table (one classroom per tutor for v1.0)
CREATE TABLE classrooms (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id     UUID NOT NULL REFERENCES tutors(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  subjects     TEXT[] NOT NULL DEFAULT '{}',
  bio          TEXT,
  price_cents  INTEGER NOT NULL DEFAULT 18000,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor can read own classroom"
  ON classrooms FOR SELECT
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "tutor can insert own classroom"
  ON classrooms FOR INSERT
  WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "tutor can update own classroom"
  ON classrooms FOR UPDATE
  USING (tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())));
