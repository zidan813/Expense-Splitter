
# Database Fix Required for Guest Members

To enable "Guest Members" (users without an account), you must remove the strict link between group members and registered users.

Please run the following SQL command in your Supabase SQL Editor:

```sql
-- Allow non-registered users in groups (for Guest feature)
ALTER TABLE group_members 
DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;

-- Optional: If you want to differentiate guests clearly, 
-- you might want to add a metadata column, but removing the FK is enough for the MVP.
```

## Why is this needed?
The current database setup enforces that every group member MUST exist in the `auth.users` table. Guest members are virtual and do not have an account, so the database rejects them. Running the command above removes this restriction.
