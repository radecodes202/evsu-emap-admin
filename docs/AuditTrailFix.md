# Audit Trail Fix (Supabase)

If audit logs are not appearing, RLS is likely blocking inserts. Add the insert policy below in the Supabase SQL editor, then test again.

## SQL to run (Supabase SQL Editor)
```sql
-- Enable insert for audit logs (anon key)
CREATE POLICY IF NOT EXISTS "Public insert audit_logs"
ON audit_logs
FOR INSERT
WITH CHECK (true);
```

The full migration file `database-audit-trail-feedback.sql` already contains this policy; rerun it if needed.

## Steps to verify
1) Run the policy SQL above.
2) Perform an action (create/update/delete building/route/room/feedback/user).
3) Refresh Audit Trail page to confirm new entry.
4) Check browser console for warnings: "Audit log failed" → indicates DB error/permission issue.

## Notes
- App uses the anon key from the browser, so RLS must allow INSERT on `audit_logs`.
- If you prefer tighter control, replace `WITH CHECK (true)` with a condition (e.g., restrict by role or email domain).

