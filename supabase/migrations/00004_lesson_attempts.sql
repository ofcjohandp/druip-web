-- Phase 2: lesson_attempts table (STUDY-01, D-11, CONT-06)

-- Lesson attempt status enum
CREATE TYPE lesson_attempt_status_enum AS ENUM ('in_progress', 'completed');

-- Lesson attempts table
CREATE TABLE lesson_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  status lesson_attempt_status_enum NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for RLS-referenced columns and common query patterns
CREATE INDEX idx_lesson_attempts_user_id ON lesson_attempts(user_id);
CREATE INDEX idx_lesson_attempts_lesson_id ON lesson_attempts(lesson_id);
CREATE INDEX idx_lesson_attempts_user_lesson ON lesson_attempts(user_id, lesson_id);

-- Apply updated_at trigger (reuses function from 00001_content_schema.sql)
CREATE TRIGGER set_lesson_attempts_updated_at
  BEFORE UPDATE ON lesson_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE lesson_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies: (SELECT auth.uid()) subquery pattern for performance (D-24)
CREATE POLICY "Users can read own lesson attempts"
  ON lesson_attempts FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own lesson attempts"
  ON lesson_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- CONT-06: Prevent publishing questions without explanations
-- Explanation is required for learning — students need to know WHY an answer is correct
ALTER TABLE questions
  ADD CONSTRAINT questions_explanation_required_when_published
  CHECK (is_published = FALSE OR explanation IS NOT NULL);
