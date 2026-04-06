-- Add FK from tutors.user_id to profiles.id so Supabase can resolve
-- the tutors → profiles join in useAllClassrooms / useClassroomDetail.
-- Without this, PostgREST returns PGRST200 (no relationship found).

ALTER TABLE tutors
  ADD CONSTRAINT tutors_user_id_profiles_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
