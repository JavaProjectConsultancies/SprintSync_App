-- Migration: Update domains to only have 'development' and 'management'
-- This script:
-- 1. Creates the two required domains if they don't exist
-- 2. Updates all users to assign them to the correct domains
-- 3. Deletes all other domains

-- Step 1: Get or create the 'development' domain
DO $$
DECLARE
    dev_domain_id VARCHAR;
    mgmt_domain_id VARCHAR;
    admin_user_id VARCHAR;
    dev_user_count INTEGER;
    max_domain_id INTEGER;
BEGIN
    -- Get or create 'development' domain
    SELECT id INTO dev_domain_id FROM domains WHERE LOWER(name) = 'development';
    IF dev_domain_id IS NULL THEN
        -- Find the highest domain ID number to generate next ID
        SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 'DOMN(\d+)') AS INTEGER)), 0) INTO max_domain_id FROM domains;
        dev_domain_id := 'DOMN' || LPAD((max_domain_id + 1)::TEXT, 15, '0');
        
        INSERT INTO domains (id, name, description, created_at, updated_at)
        VALUES (dev_domain_id, 'development', 'Development and Engineering Domain', NOW(), NOW());
    END IF;

    -- Get or create 'management' domain
    SELECT id INTO mgmt_domain_id FROM domains WHERE LOWER(name) = 'management';
    IF mgmt_domain_id IS NULL THEN
        -- Find the highest domain ID number to generate next ID
        SELECT COALESCE(MAX(CAST(SUBSTRING(id FROM 'DOMN(\d+)') AS INTEGER)), 0) INTO max_domain_id FROM domains;
        mgmt_domain_id := 'DOMN' || LPAD((max_domain_id + 1)::TEXT, 15, '0');
        
        INSERT INTO domains (id, name, description, created_at, updated_at)
        VALUES (mgmt_domain_id, 'management', 'Management and Administration Domain', NOW(), NOW());
    END IF;

    -- Step 2: Update users
    -- First, find the admin user (if exists)
    SELECT id INTO admin_user_id FROM users WHERE LOWER(role::text) = 'admin' LIMIT 1;
    
    -- Count existing development users (non-admin)
    SELECT COUNT(*) INTO dev_user_count FROM users WHERE LOWER(role::text) != 'admin' AND domain_id IS NOT NULL;
    
    -- Update admin user to management domain
    IF admin_user_id IS NOT NULL THEN
        UPDATE users 
        SET domain_id = mgmt_domain_id, updated_at = NOW()
        WHERE LOWER(role::text) = 'admin';
    END IF;
    
    -- Update first 3 non-admin users to development domain
    -- If there are fewer than 3 users, update all of them
    UPDATE users 
    SET domain_id = dev_domain_id, updated_at = NOW()
    WHERE LOWER(role::text) != 'admin' 
    AND id IN (
        SELECT id FROM users 
        WHERE LOWER(role::text) != 'admin' 
        ORDER BY created_at ASC 
        LIMIT 3
    );
    
    -- Update any remaining users (beyond the first 3) to development domain as well
    UPDATE users 
    SET domain_id = dev_domain_id, updated_at = NOW()
    WHERE LOWER(role::text) != 'admin' 
    AND (domain_id IS NULL OR domain_id != dev_domain_id);
    
    -- Step 3: Set domain_id to NULL for users that reference domains we're about to delete
    -- (This prevents foreign key constraint violations)
    UPDATE users 
    SET domain_id = NULL, updated_at = NOW()
    WHERE domain_id NOT IN (dev_domain_id, mgmt_domain_id);
    
    -- Step 4: Delete all domains except 'development' and 'management'
    DELETE FROM domains 
    WHERE LOWER(name) NOT IN ('development', 'management');
    
    -- Step 5: Re-assign users that had NULL domain_id
    -- Assign admin to management
    UPDATE users 
    SET domain_id = mgmt_domain_id, updated_at = NOW()
    WHERE LOWER(role::text) = 'admin' AND domain_id IS NULL;
    
    -- Assign non-admin users to development (up to 3 total)
    UPDATE users 
    SET domain_id = dev_domain_id, updated_at = NOW()
    WHERE LOWER(role::text) != 'admin' 
    AND domain_id IS NULL
    AND id IN (
        SELECT id FROM users 
        WHERE LOWER(role::text) != 'admin' 
        ORDER BY created_at ASC 
        LIMIT 3
    );
    
    RAISE NOTICE 'Migration completed successfully';
    RAISE NOTICE 'Development domain ID: %', dev_domain_id;
    RAISE NOTICE 'Management domain ID: %', mgmt_domain_id;
END $$;

-- Verify the migration
SELECT 
    d.name as domain_name,
    COUNT(u.id) as user_count,
    STRING_AGG(u.name, ', ') as users
FROM domains d
LEFT JOIN users u ON u.domain_id = d.id
GROUP BY d.id, d.name
ORDER BY d.name;

