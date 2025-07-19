-- ==============================================
-- CONFIGURATION AND MIGRATIONS BACKUP
-- ==============================================

-- ==============================================
-- SUPABASE CONFIG.TOML BACKUP
-- ==============================================

/*
project_id = "drqkmdkagyrkdkfhfuwz"

[auth]
enabled = true
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 3600

[functions.validate-station]
verify_jwt = false
*/

-- ==============================================
-- MIGRATION FILES SUMMARY
-- ==============================================

/*
EXISTING MIGRATION FILES:
- 20250622034832-0e502661-05be-4a0f-97d3-7f0043908c1c.sql
- 20250622034920-d376cda1-fcf9-4e96-af99-873dd6984f09.sql
- 20250622053123-8936cf36-566a-4e2a-84d7-d1e381457d86.sql
- 20250622053205-2a123cb9-ddda-4132-9fb5-677ba25b8645.sql
- 20250622074901-5473385c-3559-4c0f-a682-02d936f7fde4.sql
- 20250628135036-a693c9a0-c23c-4313-b294-3743c6779b48.sql
- 20250629125756-9c1d8b50-b515-4e55-be72-097bdecdf436.sql
- 20250703103843-1a55fa10-49c4-42ea-98b5-9186753b52b6.sql
- 20250704115602-dca9e032-4424-438e-ac53-6e9a39a22404.sql
- 20250705142053-5f04c3f0-6613-4918-90ae-03c3ab758da9.sql
- 20250704123500-add-profile-trigger.sql
- 20250705141253-ca570a27-cbb1-47b7-ac4d-7b565ff6f974.sql
- 20250703115519-0111de31-383f-4e98-a508-7068a5a700f6.sql
- 20250629131226-bb631b4d-9468-484a-9671-0f8004e93562.sql
- 20250706125250-f19be046-d07c-4a24-9b9b-6c311aaf035c.sql
- 20250624100609-b4b893e0-d50e-4ac2-b04d-ab0841b4e754.sql
- 20250630115128-773ded9c-1794-481b-bb6c-6458881e360a.sql
- 20250630122943-f735ddea-ce05-44c3-b9c5-7b23191fcd5e.sql
- 20250622050900-5f1c9875-8d6b-487f-b62c-7eb8f25aa2ee.sql
- 20250622045843-1fc203e4-0044-4b44-a03b-a4c1c1fd6c7a.sql
*/

-- ==============================================
-- EDGE FUNCTIONS BACKUP
-- ==============================================

/*
EXISTING EDGE FUNCTIONS:
1. approve-station-registration/index.ts
2. validate-station/index.ts
3. _shared/cors.ts

These functions are deployed automatically.
Remember to backup the function code from supabase/functions/ directory.
*/

-- ==============================================
-- SECRETS BACKUP (Names Only)
-- ==============================================

/*
EXISTING SECRETS:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- SUPABASE_DB_URL

Note: Secret values are not included for security reasons.
You'll need to manually note down and restore these values.
*/

-- ==============================================
-- DATABASE STATISTICS
-- ==============================================

-- Table count and sizes
SELECT 
    schemaname,
    tablename,
    attname as column_name,
    typname as data_type
FROM pg_attribute 
JOIN pg_class ON pg_attribute.attrelid = pg_class.oid 
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid 
JOIN pg_type ON pg_attribute.atttypid = pg_type.oid
WHERE pg_namespace.nspname = 'public'
AND pg_attribute.attnum > 0
AND NOT pg_attribute.attisdropped
ORDER BY tablename, attname;

-- RLS Policy count by table
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC;

-- Function count
SELECT 
    routine_schema,
    COUNT(*) as function_count
FROM information_schema.routines
WHERE routine_schema = 'public'
GROUP BY routine_schema;