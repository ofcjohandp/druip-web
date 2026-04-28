-- Add full_name to profiles for tutor display
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
