-- ==============================================
-- COMPLETE DATABASE RESTORATION SCRIPT
-- ==============================================
-- Instructions: Run this script in your Supabase SQL editor to restore the complete database

-- ==============================================
-- 1. DROP EXISTING POLICIES (Clean Slate)
-- ==============================================

-- Drop all existing policies before restoration
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop policies on all tables
    FOR r IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON ' || r.schemaname || '.' || r.tablename || ';';
    END LOOP;
END $$;

-- ==============================================
-- 2. DISABLE RLS TEMPORARILY
-- ==============================================

ALTER TABLE IF EXISTS public.stations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.station_registration_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.station_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.email_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.pending_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ev_diagnostic_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.phev_diagnostic_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ice_diagnostic_records DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- 3. DROP AND RECREATE FUNCTIONS
-- ==============================================

-- Drop existing functions
DROP FUNCTION IF EXISTS public.get_user_station_id(uuid);
DROP FUNCTION IF EXISTS public.is_station_admin_for_station(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_super_admin(uuid);
DROP FUNCTION IF EXISTS public.get_user_station(uuid);
DROP FUNCTION IF EXISTS public.can_manage_station_roles(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_technician_for_station(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_front_desk_for_station(uuid, uuid);
DROP FUNCTION IF EXISTS public.is_admin(uuid);
DROP FUNCTION IF EXISTS public.is_station_admin(uuid);
DROP FUNCTION IF EXISTS public.generate_token();
DROP FUNCTION IF EXISTS public.create_station_invitation(uuid, text);
DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.get_user_roles(uuid);

-- ==============================================
-- 4. RESTORE FUNCTIONS (Run backup-functions.sql content here)
-- ==============================================

-- Copy and paste the entire backup-functions.sql content here

-- ==============================================
-- 5. ENABLE RLS AND RESTORE POLICIES
-- ==============================================

-- Enable RLS
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_registration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.station_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ev_diagnostic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phev_diagnostic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ice_diagnostic_records ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- 6. RESTORE ALL RLS POLICIES (Run backup-rls-policies.sql content here)
-- ==============================================

-- Copy and paste the entire backup-rls-policies.sql content here

-- ==============================================
-- 7. VERIFICATION QUERIES
-- ==============================================

-- Verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;

-- Verify policies count
SELECT schemaname, tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- Verify functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ==============================================
-- 8. VALIDATION SCRIPT
-- ==============================================

-- Test key functions
SELECT 
    'has_role function' as test,
    CASE WHEN public.has_role IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status;

SELECT 
    'get_user_station_id function' as test,
    CASE WHEN public.get_user_station_id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Test enum type
SELECT enumlabel 
FROM pg_enum 
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
WHERE pg_type.typname = 'app_role'
ORDER BY enumsortorder;