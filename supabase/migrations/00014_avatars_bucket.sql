-- Phase 7: Create avatars storage bucket for student profile photos

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "user can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to update their own avatar
CREATE POLICY "user can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read (bucket is public, but explicit policy for clarity)
CREATE POLICY "anyone can read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
