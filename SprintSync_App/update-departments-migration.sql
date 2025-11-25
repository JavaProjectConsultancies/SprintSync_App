-- Migration Script: Update Departments
-- This script updates departments to the new structure:
-- 1. ERP & Strategic Technology
-- 2. HIMS & Pharma ZIP
-- 3. Pharma Old
-- 4. Infrastructure Management
-- 5. Implementation
-- 6. Administration

-- Step 1: Create new departments with 32-char IDs (UUIDs without hyphens) for users.department_id compatibility
-- Also keep UUID versions for projects table
INSERT INTO departments (id, name, description) VALUES
    -- 32-char versions (for users.department_id VARCHAR(32))
    ('550e8400e29b41d4a716446655440010', 'ERP & Strategic Technology', 'ERP systems and strategic technology initiatives'),
    ('550e8400e29b41d4a716446655440011', 'HIMS & Pharma ZIP', 'Hospital Information Management Systems and Pharma ZIP solutions'),
    ('550e8400e29b41d4a716446655440012', 'Pharma Old', 'Legacy pharmaceutical systems and applications'),
    ('550e8400e29b41d4a716446655440013', 'Infrastructure Management', 'IT infrastructure and system management'),
    ('550e8400e29b41d4a716446655440014', 'Implementation', 'Project implementation and deployment services'),
    ('550e8400e29b41d4a716446655440015', 'Administration', 'Administrative and management services')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Also ensure UUID versions exist (for projects table which uses UUID)
INSERT INTO departments (id, name, description) VALUES
    ('550e8400-e29b-41d4-a716-446655440010', 'ERP & Strategic Technology', 'ERP systems and strategic technology initiatives'),
    ('550e8400-e29b-41d4-a716-446655440011', 'HIMS & Pharma ZIP', 'Hospital Information Management Systems and Pharma ZIP solutions'),
    ('550e8400-e29b-41d4-a716-446655440012', 'Pharma Old', 'Legacy pharmaceutical systems and applications'),
    ('550e8400-e29b-41d4-a716-446655440013', 'Infrastructure Management', 'IT infrastructure and system management'),
    ('550e8400-e29b-41d4-a716-446655440014', 'Implementation', 'Project implementation and deployment services'),
    ('550e8400-e29b-41d4-a716-446655440015', 'Administration', 'Administrative and management services')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Step 2: Update users with old departments to new departments
-- Use the 32-char department IDs
UPDATE users 
SET department_id = '550e8400e29b41d4a716446655440010'
WHERE (department_id IN (
    SELECT id::text FROM departments WHERE name IN ('VNIT', 'Dinshaw', 'Hospy', 'Pharma', 'Engineering')
) OR department_id LIKE 'DEPT%' OR department_id IS NULL)
AND role = 'developer';

-- Update admin users to Administration department
UPDATE users 
SET department_id = '550e8400e29b41d4a716446655440015'
WHERE (department_id IN (
    SELECT id::text FROM departments WHERE name IN ('VNIT', 'Dinshaw', 'Hospy', 'Pharma', 'Engineering')
) OR department_id LIKE 'DEPT%' OR department_id IS NULL)
AND role = 'admin';

-- Update manager users to Implementation department
UPDATE users 
SET department_id = '550e8400e29b41d4a716446655440014'
WHERE (department_id IN (
    SELECT id::text FROM departments WHERE name IN ('VNIT', 'Dinshaw', 'Hospy', 'Pharma', 'Engineering')
) OR department_id LIKE 'DEPT%' OR department_id IS NULL)
AND role = 'manager';

-- Step 3: Update projects with old departments to a default (ERP & Strategic Technology)
-- Projects table uses UUID, so use the UUID version
UPDATE projects 
SET department_id = '550e8400-e29b-41d4-a716-446655440010'::uuid
WHERE department_id IN (
    SELECT id FROM departments WHERE name IN ('VNIT', 'Dinshaw', 'Hospy', 'Pharma', 'Engineering')
)
OR department_id::text LIKE 'DEPT%'
OR department_id IS NULL;

-- Step 4: Now safe to delete old departments (all references updated)
-- Only delete old named departments, keep DEPT IDs that might be used
DELETE FROM departments 
WHERE name IN ('VNIT', 'Dinshaw', 'Hospy', 'Pharma', 'Engineering', 'Product', 'Design', 'Quality Assurance', 'Marketing');

-- Step 5: Ensure all existing users have proper department assignments
-- Update developers to ERP & Strategic Technology if they don't have a valid department
UPDATE users 
SET department_id = '550e8400e29b41d4a716446655440010'
WHERE role = 'developer' 
AND (department_id IS NULL OR department_id NOT IN (
    SELECT id::text FROM departments WHERE name IN (
        'ERP & Strategic Technology',
        'HIMS & Pharma ZIP',
        'Pharma Old',
        'Infrastructure Management',
        'Implementation',
        'Administration'
    )
));

-- Update admins to Administration if they don't have a valid department
UPDATE users 
SET department_id = '550e8400e29b41d4a716446655440015'
WHERE role = 'admin' 
AND (department_id IS NULL OR department_id NOT IN (
    SELECT id::text FROM departments WHERE name IN (
        'ERP & Strategic Technology',
        'HIMS & Pharma ZIP',
        'Pharma Old',
        'Infrastructure Management',
        'Implementation',
        'Administration'
    )
));

-- Update managers to Implementation if they don't have a valid department
UPDATE users 
SET department_id = '550e8400e29b41d4a716446655440014'
WHERE role = 'manager' 
AND (department_id IS NULL OR department_id NOT IN (
    SELECT id::text FROM departments WHERE name IN (
        'ERP & Strategic Technology',
        'HIMS & Pharma ZIP',
        'Pharma Old',
        'Infrastructure Management',
        'Implementation',
        'Administration'
    )
));

-- Step 6: Verify the changes
SELECT 
    d.name as department_name,
    d.description,
    COUNT(DISTINCT u.id) as user_count,
    COUNT(DISTINCT p.id) as project_count
FROM departments d
LEFT JOIN users u ON u.department_id = d.id
LEFT JOIN projects p ON p.department_id = d.id
GROUP BY d.id, d.name, d.description
ORDER BY d.name;

