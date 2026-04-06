-- Phase 1: Content hierarchy (CONT-01, CONT-02, CONT-03, CONT-04, CONT-05)
-- Module -> Topic -> Lesson -> Section -> Question

-- Enums
CREATE TYPE lesson_type_enum AS ENUM ('standard', 'practice', 'challenge');

-- Modules (top level)
CREATE TABLE modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Topics (belong to a module)
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  requires_topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lessons (belong to a topic)
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  lesson_type lesson_type_enum NOT NULL DEFAULT 'standard',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sections (belong to a lesson)
CREATE TABLE sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Questions (belong to a section)
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_option_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for foreign keys (used by RLS and joins)
CREATE INDEX idx_topics_module_id ON topics(module_id);
CREATE INDEX idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX idx_sections_lesson_id ON sections(lesson_id);
CREATE INDEX idx_questions_section_id ON questions(section_id);

-- Indexes for ordering
CREATE INDEX idx_topics_order ON topics(module_id, "order");
CREATE INDEX idx_lessons_order ON lessons(topic_id, "order");
CREATE INDEX idx_sections_order ON sections(lesson_id, "order");
CREATE INDEX idx_questions_order ON questions(section_id, "order");

-- Indexes for is_published filtering (used in RLS policies)
CREATE INDEX idx_modules_published ON modules(is_published) WHERE is_published = true;
CREATE INDEX idx_topics_published ON topics(is_published) WHERE is_published = true;
CREATE INDEX idx_lessons_published ON lessons(is_published) WHERE is_published = true;
CREATE INDEX idx_sections_published ON sections(is_published) WHERE is_published = true;
CREATE INDEX idx_questions_published ON questions(is_published) WHERE is_published = true;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_modules_updated_at BEFORE UPDATE ON modules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_topics_updated_at BEFORE UPDATE ON topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
