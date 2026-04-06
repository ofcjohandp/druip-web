-- Drop the recursive tutors policy (migration 00010) and replace with a simple
-- USING (true) for authenticated users. The previous policy queried classrooms,
-- which queries tutors via its own RLS policy → infinite recursion (42P17).
-- Tutor rows only contain id, user_id, and timestamps — nothing sensitive.

DROP POLICY IF EXISTS "Authenticated users can read tutors of published classrooms" ON tutors;

CREATE POLICY "Authenticated users can read all tutors"
  ON tutors FOR SELECT
  TO authenticated
  USING (true);
