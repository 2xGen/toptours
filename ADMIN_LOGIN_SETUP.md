# Admin Dashboard Login Setup

## Quick Setup

1. **Run the SQL script** in Supabase to create the admin settings table:
   ```sql
   -- Run: scripts/create-admin-settings-table.sql
   ```

2. **Set your admin password** in Supabase:
   - Go to Supabase Dashboard → Table Editor → `admin_settings`
   - Find the row with `setting_key = 'admin_password'`
   - Update `setting_value` to your desired password
   - Or run this SQL:
   ```sql
   UPDATE admin_settings 
   SET setting_value = 'your-password-here' 
   WHERE setting_key = 'admin_password';
   ```

3. **Access the admin dashboard**:
   - Navigate to `/admin-matthijs`
   - Enter your password
   - You'll stay logged in for the browser session

## How It Works

- **Password stored in Supabase**: The password is stored in the `admin_settings` table
- **Simple authentication**: No complex auth system - just password matching
- **Session-based**: Login persists for the browser session (cleared when browser closes)
- **Secure**: Password is checked server-side via API endpoint

## Changing the Password

To change your admin password, update the `setting_value` in the `admin_settings` table:

```sql
UPDATE admin_settings 
SET setting_value = 'new-password-here',
    updated_at = NOW()
WHERE setting_key = 'admin_password';
```

## Security Notes

- The password is currently stored as plain text in the database
- For production, consider hashing the password (e.g., using bcrypt)
- The login session is stored in `sessionStorage` (cleared when browser closes)
- API endpoints are protected (though simplified for now)

