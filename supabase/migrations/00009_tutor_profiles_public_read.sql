-- Allow any authenticated user to read profiles of published classroom tutors.
-- Required for useAllClassrooms and useClassroomDetail joins:
-- classrooms → tutors → profiles (to show tutor email on discovery/detail screens).
-- Without this, the profiles RLS (id = auth.uid()) blocks students from reading tutor profiles.

CREATE POLICY "Authenticated users can read tutor profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT user_id FROM tutors
    )
  );
