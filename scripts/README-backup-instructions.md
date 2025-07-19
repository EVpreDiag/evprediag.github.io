# Supabase Database Backup Instructions

## Overview
This backup contains your complete Supabase database configuration including:
- Database schema (tables, types, functions)
- Row Level Security (RLS) policies  
- Edge functions
- Configuration files
- Migration history

## Backup Files

### Core Backup Files
1. **`backup-database.sql`** - Complete table schemas and structure
2. **`backup-functions.sql`** - All database functions and triggers
3. **`backup-rls-policies.sql`** - All Row Level Security policies
4. **`backup-restore.sql`** - Complete restoration script
5. **`backup-config-and-migrations.sql`** - Configuration and migration history

## Current Database Statistics

### Tables (10 total)
- `stations` (8 columns)
- `profiles` (7 columns) 
- `user_roles` (6 columns)
- `ev_diagnostic_records` (75+ columns)
- `phev_diagnostic_records` (80+ columns)
- `ice_diagnostic_records` (65+ columns)
- `station_registration_requests` (20+ columns)
- `station_invitations` (8 columns)
- `email_verifications` (7 columns)
- `pending_users` (12 columns)

### RLS Policies (50+ total)
- EV diagnostic records: 18 policies
- PHEV diagnostic records: 13 policies
- ICE diagnostic records: 5 policies
- Profiles: 6 policies
- User roles: 6 policies
- Other tables: 2-3 policies each

### Database Functions (14 total)
- `has_role()` - Role checking
- `get_user_station_id()` - User station lookup
- `is_super_admin()` - Admin verification
- `handle_new_user()` - User creation trigger
- Plus 10 other security and utility functions

### Edge Functions (2 total)
- `approve-station-registration`
- `validate-station`

## How to Use This Backup

### Full Restoration (Nuclear Option)
1. Open Supabase SQL Editor
2. Run `backup-restore.sql` 
3. Copy/paste contents of `backup-functions.sql` into step 4 section
4. Copy/paste contents of `backup-rls-policies.sql` into step 6 section
5. Execute the complete script
6. Verify with the validation queries at the end

### Selective Restoration

#### Restore Only Functions
```sql
-- Copy contents from backup-functions.sql
```

#### Restore Only RLS Policies
```sql
-- First disable RLS
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "policy_name" ON table_name;

-- Copy contents from backup-rls-policies.sql

-- Re-enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

#### Restore Specific Table Schema
```sql
-- Copy specific table CREATE statement from backup-database.sql
```

## Pre-Subscription Implementation Safety

### Before Making Changes
1. Create a snapshot of current data:
   ```sql
   -- Export important data
   SELECT * FROM stations;
   SELECT * FROM profiles;
   SELECT * FROM user_roles;
   ```

2. Test backup restoration on a development database first

3. Verify all functions work after restoration:
   ```sql
   SELECT public.has_role('user-id', 'super_admin'::app_role);
   ```

### During Subscription Implementation
1. Keep this backup safe and unchanged
2. Create new migration files for subscription features
3. Test rollback procedures before going live

### Post-Implementation Verification
1. Run validation queries from `backup-restore.sql`
2. Test all existing functionality still works
3. Verify RLS policies are still effective

## Security Considerations

### What's Included
✅ Database schema and structure  
✅ RLS policies and security rules  
✅ Functions and triggers  
✅ Configuration settings  

### What's NOT Included
❌ Actual user data (for security)  
❌ Secret values (API keys, etc.)  
❌ Auth provider configurations  

### Manual Backup Required
- Edge function code files (`supabase/functions/`)
- Environment variables and secrets
- Auth provider settings
- Storage bucket configurations (if any)

## Emergency Rollback Plan

If subscription implementation goes wrong:

1. **Immediate**: Disable new subscription features in UI
2. **Database**: Run selective restoration of affected tables
3. **Functions**: Restore original functions from `backup-functions.sql`  
4. **Policies**: Restore original RLS policies from `backup-rls-policies.sql`
5. **Verify**: Run validation queries to confirm restoration

## Best Practices

1. **Always test on development first**
2. **Keep this backup unchanged during implementation**
3. **Create new backups after successful changes**
4. **Document any manual changes not captured in migrations**
5. **Test restoration procedures before you need them**

## Support

If you need to restore from this backup:
1. Follow the instructions above
2. Check Supabase dashboard for any errors
3. Use the validation queries to verify success
4. Test your application functionality after restoration

---

**Created**: $(date)  
**Database**: drqkmdkagyrkdkfhfuwz  
**Purpose**: Pre-subscription implementation backup