# Migration 00021 - seller_applications table

## What this table is for

The `seller_applications` table stores seller approval applications submitted by students who want to sell notes on Druip. Each row records: the applicant's user ID, a URL to their portfolio report, the current review status (pending / approved / denied), optional reviewer notes, and the review timestamp.

**Why this is needed:** The seller-approval gate added in Phase 7c reads and writes this table. When a student taps "Apply to sell", the app inserts a row here. The admin gate checks this table to show pending/approved/denied status. Without this table the apply-to-sell flow will error in production with a "relation does not exist" error.

---

## Steps to apply in production

1. Open the Supabase Dashboard: https://supabase.com/dashboard/project/vpmrgidheamgerimkaox
2. In the left sidebar, click **SQL Editor**
3. Click **New query**
4. Copy the full SQL block below and paste it into the editor
5. Click **Run** (or press Cmd/Ctrl + Enter)

---

## SQL

```sql
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
```

---

## Verification

After running the SQL, open a new query in the SQL Editor and run:

```sql
select * from seller_applications limit 1;
```

Expected result: an empty result set with column headers visible (id, user_id, report_url, status, reviewer_notes, reviewed_at, created_at). If you see a "relation does not exist" error, the migration did not run successfully.

---

## Note on idempotency

This migration uses a plain `CREATE TABLE` (not `CREATE TABLE IF NOT EXISTS`). If you run it and get the error:

> `ERROR: relation "seller_applications" already exists`

That means the table is already present in production and no action is needed. The apply-to-sell flow will work correctly.
