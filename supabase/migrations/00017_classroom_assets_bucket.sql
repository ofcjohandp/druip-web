-- Phase 8: Create classroom-assets storage bucket for PDF and image uploads

INSERT INTO storage.buckets (id, name, public)
VALUES ('classroom-assets', 'classroom-assets', false)
ON CONFLICT (id) DO NOTHING;

-- Tutors can upload files scoped to their classroom (path: {classroomId}/...)
CREATE POLICY "tutor can upload classroom assets"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'classroom-assets'
    AND EXISTS (
      SELECT 1 FROM public.classrooms c
      JOIN public.tutors t ON t.id = c.tutor_id
      WHERE t.user_id = (SELECT auth.uid())
        AND c.id::text = (storage.foldername(name))[1]
    )
  );

-- Tutors can update/replace files in their classroom
CREATE POLICY "tutor can update classroom assets"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'classroom-assets'
    AND EXISTS (
      SELECT 1 FROM public.classrooms c
      JOIN public.tutors t ON t.id = c.tutor_id
      WHERE t.user_id = (SELECT auth.uid())
        AND c.id::text = (storage.foldername(name))[1]
    )
  );

-- Tutors can delete files in their classroom
CREATE POLICY "tutor can delete classroom assets"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'classroom-assets'
    AND EXISTS (
      SELECT 1 FROM public.classrooms c
      JOIN public.tutors t ON t.id = c.tutor_id
      WHERE t.user_id = (SELECT auth.uid())
        AND c.id::text = (storage.foldername(name))[1]
    )
  );

-- Subscribed students can read files from classrooms they're subscribed to
CREATE POLICY "subscribed student can read classroom assets"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'classroom-assets'
    AND (
      -- tutor can always read their own classroom assets
      EXISTS (
        SELECT 1 FROM public.classrooms c
        JOIN public.tutors t ON t.id = c.tutor_id
        WHERE t.user_id = (SELECT auth.uid())
          AND c.id::text = (storage.foldername(name))[1]
      )
      OR
      -- subscribed student can read
      EXISTS (
        SELECT 1 FROM public.subscriptions s
        WHERE s.student_id = (SELECT auth.uid())
          AND s.classroom_id::text = (storage.foldername(name))[1]
          AND s.status = 'active'
      )
    )
  );
