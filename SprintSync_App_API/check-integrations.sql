-- Check if available_integrations table exists and has data
SELECT 'available_integrations table check:' as info;

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'available_integrations'
) as table_exists;

-- Check if table has data
SELECT COUNT(*) as available_integrations_count FROM available_integrations;

-- Show available integrations
SELECT id, name, type, description FROM available_integrations LIMIT 10;

-- Check project_integrations table
SELECT 'project_integrations table check:' as info;

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'project_integrations'
) as table_exists;

-- Check if table has data
SELECT COUNT(*) as project_integrations_count FROM project_integrations;

-- Show project integrations for PROJ0000000000003
SELECT id, project_id, integration_id, is_enabled FROM project_integrations 
WHERE project_id = 'PROJ0000000000003';
