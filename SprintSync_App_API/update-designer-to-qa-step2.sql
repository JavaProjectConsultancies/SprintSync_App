-- Step 2: Update existing users with 'designer' role to 'qa' (if not already done)
UPDATE users 
SET role = 'qa'::user_role 
WHERE role = 'designer'::user_role;

-- Step 3: Create a new enum without 'designer' (PostgreSQL doesn't allow removing enum values directly)
CREATE TYPE user_role_new AS ENUM ('admin', 'manager', 'developer', 'qa');

-- Step 4: Update ALL tables that use user_role enum to use the new enum

-- Update users table
ALTER TABLE users 
  ALTER COLUMN role TYPE user_role_new 
  USING CASE 
    WHEN role::text = 'designer' THEN 'qa'::user_role_new
    WHEN role::text = 'qa' THEN 'qa'::user_role_new
    WHEN role::text = 'admin' THEN 'admin'::user_role_new
    WHEN role::text = 'manager' THEN 'manager'::user_role_new
    WHEN role::text = 'developer' THEN 'developer'::user_role_new
    ELSE 'developer'::user_role_new  -- Default fallback
  END;

-- Update pending_registrations table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_registrations') THEN
        ALTER TABLE pending_registrations 
          ALTER COLUMN role TYPE user_role_new 
          USING CASE 
            WHEN role::text = 'designer' THEN 'qa'::user_role_new
            WHEN role::text = 'qa' THEN 'qa'::user_role_new
            WHEN role::text = 'admin' THEN 'admin'::user_role_new
            WHEN role::text = 'manager' THEN 'manager'::user_role_new
            WHEN role::text = 'developer' THEN 'developer'::user_role_new
            ELSE 'developer'::user_role_new
          END;
    END IF;
END $$;

-- Step 5: Drop the old enum (only after all dependencies are updated)
DROP TYPE user_role CASCADE;

-- Step 6: Rename the new enum to the original name
ALTER TYPE user_role_new RENAME TO user_role;

-- Step 7: Verify the changes
SELECT 
  role, 
  COUNT(*) as user_count 
FROM users 
GROUP BY role 
ORDER BY role;

-- Verification: Check if any users still have 'designer' role (should return 0 rows)
SELECT * FROM users WHERE role::text = 'designer';

