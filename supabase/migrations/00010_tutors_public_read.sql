-- Allow any authenticated user to read tutors of published classrooms.
-- Required for useAllClassrooms and useClassroomDetail joins:
-- classrooms!inner → tutors!inner → profiles
-- The existing policy only allows tutors to read their own row,
-- which causes the !inner join to return [] for student accounts.

CREATE POLICY "Authenticated users can read tutors of published classrooms"
  ON tutors FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tutor_id FROM classrooms WHERE is_published = true
    )
  );
