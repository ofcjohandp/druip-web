-- Phase 1: RLS policies (SEED-02, D-24)
-- Pattern: (SELECT auth.uid()) subquery for performance (avoids per-row function call)

-- Enable RLS on ALL public tables
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Content tables: authenticated users can read published content only
CREATE POLICY "Authenticated users can read published modules"
  ON modules FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can read published topics"
  ON topics FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can read published lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can read published sections"
  ON sections FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Authenticated users can read published questions"
  ON questions FOR SELECT
  TO authenticated
  USING (is_published = true);

-- Profiles: users can read and update only their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- User lesson progress: users can read, insert, update only their own rows
CREATE POLICY "Users can read own progress"
  ON user_lesson_progress FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own progress"
  ON user_lesson_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own progress"
  ON user_lesson_progress FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
