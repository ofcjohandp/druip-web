-- Fix: seller_applications UPDATE policy had no WITH CHECK on status,
-- allowing any authenticated user to self-approve by calling Supabase directly.
-- New policy: users can update their own row, but the resulting status must
-- remain 'pending' — prevents escalation to 'approved' or 'denied'.
-- Admin approvals use the service role key which bypasses RLS entirely.

DROP POLICY IF EXISTS "users_own_application_update" ON seller_applications;

CREATE POLICY "users_own_application_update" ON seller_applications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'pending');
