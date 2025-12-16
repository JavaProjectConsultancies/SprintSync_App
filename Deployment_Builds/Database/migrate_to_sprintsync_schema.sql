-- =====================================================
-- SprintSync Schema Migration Script
-- Rename schema from 'public' to 'sprintsync'
-- =====================================================
-- 
-- IMPORTANT: Run this script against your Aiven PostgreSQL database
-- BEFORE starting the application with the new configuration.
--
-- Steps to execute:
-- 1. Connect to your database using DBeaver or psql
-- 2. Run this script
-- 3. Restart your Spring Boot application
-- =====================================================

-- Step 1: Create the new schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS sprintsync;

-- Step 2: Move all tables from 'public' to 'sprintsync' schema
-- This preserves all data and constraints

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Move all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%')
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.tablename) || ' SET SCHEMA sprintsync';
        RAISE NOTICE 'Moved table: %', r.tablename;
    END LOOP;
END $$;

-- Step 3: Move all sequences
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public')
    LOOP
        EXECUTE 'ALTER SEQUENCE public.' || quote_ident(r.sequence_name) || ' SET SCHEMA sprintsync';
        RAISE NOTICE 'Moved sequence: %', r.sequence_name;
    END LOOP;
END $$;

-- Step 4: Move all views
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT table_name FROM information_schema.views WHERE table_schema = 'public')
    LOOP
        EXECUTE 'ALTER VIEW public.' || quote_ident(r.table_name) || ' SET SCHEMA sprintsync';
        RAISE NOTICE 'Moved view: %', r.table_name;
    END LOOP;
END $$;

-- Step 5: Move all functions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
    )
    LOOP
        BEGIN
            EXECUTE 'ALTER FUNCTION public.' || quote_ident(r.proname) || '(' || r.args || ') SET SCHEMA sprintsync';
            RAISE NOTICE 'Moved function: %', r.proname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not move function %: %', r.proname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 6: Move all types/enums
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT t.typname
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typtype = 'e'
    )
    LOOP
        BEGIN
            EXECUTE 'ALTER TYPE public.' || quote_ident(r.typname) || ' SET SCHEMA sprintsync';
            RAISE NOTICE 'Moved enum type: %', r.typname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not move type %: %', r.typname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 7: Grant permissions on new schema
GRANT ALL PRIVILEGES ON SCHEMA sprintsync TO avnadmin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA sprintsync TO avnadmin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA sprintsync TO avnadmin;
GRANT USAGE ON SCHEMA sprintsync TO avnadmin;

-- Step 8: Set default search path to include sprintsync
ALTER DATABASE defaultdb SET search_path TO sprintsync, public;

-- Verify the migration
SELECT 
    schemaname, 
    COUNT(*) as table_count 
FROM pg_tables 
WHERE schemaname IN ('public', 'sprintsync')
GROUP BY schemaname;

-- Show all tables in sprintsync schema
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'sprintsync'
ORDER BY tablename;

-- =====================================================
-- Migration Complete!
-- Your tables are now in the 'sprintsync' schema.
-- The Spring Boot application is configured to use this schema.
-- =====================================================
