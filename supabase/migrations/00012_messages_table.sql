-- Phase 6: Direct Messaging — messages table (MSG-01, MSG-02, MSG-03)
-- T-01/T-02: RLS enforces that only subscribers and classroom tutors can read/insert messages.
-- T-03: tutors SELECT USING(true) (migration 00011) breaks the messages→classrooms→tutors recursion chain.

CREATE TABLE messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  sender_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- T-01/T-02: Subscriber can read messages in classrooms they subscribe to
CREATE POLICY "subscriber can read classroom messages"
  ON messages FOR SELECT
  USING (
    sender_id = (SELECT auth.uid())
    OR classroom_id IN (
      SELECT classroom_id FROM subscriptions
      WHERE student_id = (SELECT auth.uid()) AND status = 'active'
    )
  );

-- T-02: Subscriber can send messages only in classrooms they subscribe to
CREATE POLICY "subscriber can insert classroom messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND classroom_id IN (
      SELECT classroom_id FROM subscriptions
      WHERE student_id = (SELECT auth.uid()) AND status = 'active'
    )
  );

-- T-01: Tutor can read messages in their own classrooms
CREATE POLICY "tutor can read own classroom messages"
  ON messages FOR SELECT
  USING (
    classroom_id IN (
      SELECT id FROM classrooms
      WHERE tutor_id IN (
        SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())
      )
    )
  );

-- T-02: Tutor can send messages in their own classrooms
CREATE POLICY "tutor can insert own classroom messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = (SELECT auth.uid())
    AND classroom_id IN (
      SELECT id FROM classrooms
      WHERE tutor_id IN (
        SELECT id FROM tutors WHERE user_id = (SELECT auth.uid())
      )
    )
  );
