-- Migration: Add new domains (Support, IMS, QA, General) and capitalize existing domain names
-- This script:
-- 1. Capitalizes existing domain names (development -> Development, management -> Management)
-- 2. Adds new domains: Support, IMS, QA, General

-- Step 1: Capitalize existing domain names
UPDATE domains SET name = 'Development', updated_at = NOW() WHERE LOWER(name) = 'development';
UPDATE domains SET name = 'Management', updated_at = NOW() WHERE LOWER(name) = 'management';

-- Step 2: Add new domains if they don't exist
DO $$
DECLARE
    max_domain_id INTEGER;
    new_domain_id VARCHAR;
BEGIN
    -- Add 'Support' domain if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM domains WHERE LOWER(name) = 'support') THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 'DOMN(\d+)') AS INTEGER)), 0) INTO max_domain_id FROM domains;
        new_domain_id := 'DOMN' || LPAD((max_domain_id + 1)::TEXT, 15, '0');
        INSERT INTO domains (id, name, description, created_at, updated_at)
        VALUES (new_domain_id, 'Support', 'Technical Support and Customer Service Domain', NOW(), NOW());
        RAISE NOTICE 'Created Support domain with ID: %', new_domain_id;
    END IF;

    -- Add 'IMS' domain if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM domains WHERE LOWER(name) = 'ims') THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 'DOMN(\d+)') AS INTEGER)), 0) INTO max_domain_id FROM domains;
        new_domain_id := 'DOMN' || LPAD((max_domain_id + 1)::TEXT, 15, '0');
        INSERT INTO domains (id, name, description, created_at, updated_at)
        VALUES (new_domain_id, 'IMS', 'Information Management System Domain', NOW(), NOW());
        RAISE NOTICE 'Created IMS domain with ID: %', new_domain_id;
    END IF;

    -- Add 'QA' domain if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM domains WHERE LOWER(name) = 'qa') THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 'DOMN(\d+)') AS INTEGER)), 0) INTO max_domain_id FROM domains;
        new_domain_id := 'DOMN' || LPAD((max_domain_id + 1)::TEXT, 15, '0');
        INSERT INTO domains (id, name, description, created_at, updated_at)
        VALUES (new_domain_id, 'QA', 'Quality Assurance and Testing Domain', NOW(), NOW());
        RAISE NOTICE 'Created QA domain with ID: %', new_domain_id;
    END IF;

    -- Add 'General' domain if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM domains WHERE LOWER(name) = 'general') THEN
        SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 'DOMN(\d+)') AS INTEGER)), 0) INTO max_domain_id FROM domains;
        new_domain_id := 'DOMN' || LPAD((max_domain_id + 1)::TEXT, 15, '0');
        INSERT INTO domains (id, name, description, created_at, updated_at)
        VALUES (new_domain_id, 'General', 'General Purpose Domain', NOW(), NOW());
        RAISE NOTICE 'Created General domain with ID: %', new_domain_id;
    END IF;

    RAISE NOTICE 'Domain migration completed successfully';
END $$;

-- Verify the migration
SELECT id, name, description, created_at FROM domains ORDER BY name;
