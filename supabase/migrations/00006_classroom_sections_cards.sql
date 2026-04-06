-- Phase 4: Classroom sections and cards tables (CLASS-01, CLASS-02, CLASS-03, CARD-01 through CARD-05)

-- Table 1: classroom_sections (D-15)
CREATE TABLE classroom_sections (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id  UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  sort_order    INTEGER NOT NULL DEFAULT 1000,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE classroom_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor can read own sections"
  ON classroom_sections FOR SELECT
  USING (classroom_id IN (SELECT id FROM classrooms WHERE tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid()))));

CREATE POLICY "tutor can insert own sections"
  ON classroom_sections FOR INSERT
  WITH CHECK (classroom_id IN (SELECT id FROM classrooms WHERE tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid()))));

CREATE POLICY "tutor can update own sections"
  ON classroom_sections FOR UPDATE
  USING (classroom_id IN (SELECT id FROM classrooms WHERE tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid()))));

CREATE POLICY "tutor can delete own sections"
  ON classroom_sections FOR DELETE
  USING (classroom_id IN (SELECT id FROM classrooms WHERE tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid()))));

-- Table 2: classroom_cards (D-16)
CREATE TABLE classroom_cards (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id    UUID NOT NULL REFERENCES classroom_sections(id) ON DELETE CASCADE,
  card_type     TEXT NOT NULL CHECK (card_type IN ('text', 'pdf', 'image', 'link')),
  content       TEXT,
  title         TEXT,
  storage_path  TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 1000,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE classroom_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tutor can read own cards"
  ON classroom_cards FOR SELECT
  USING (section_id IN (SELECT id FROM classroom_sections WHERE classroom_id IN (SELECT id FROM classrooms WHERE tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())))));

CREATE POLICY "tutor can insert own cards"
  ON classroom_cards FOR INSERT
  WITH CHECK (section_id IN (SELECT id FROM classroom_sections WHERE classroom_id IN (SELECT id FROM classrooms WHERE tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())))));

CREATE POLICY "tutor can update own cards"
  ON classroom_cards FOR UPDATE
  USING (section_id IN (SELECT id FROM classroom_sections WHERE classroom_id IN (SELECT id FROM classrooms WHERE tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())))));

CREATE POLICY "tutor can delete own cards"
  ON classroom_cards FOR DELETE
  USING (section_id IN (SELECT id FROM classroom_sections WHERE classroom_id IN (SELECT id FROM classrooms WHERE tutor_id IN (SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())))));
