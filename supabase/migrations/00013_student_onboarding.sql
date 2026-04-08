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
