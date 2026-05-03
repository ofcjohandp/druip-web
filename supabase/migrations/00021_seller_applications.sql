CREATE TABLE seller_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_url text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  reviewer_notes text,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE seller_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_application_select" ON seller_applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_own_application_insert" ON seller_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_own_application_update" ON seller_applications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
