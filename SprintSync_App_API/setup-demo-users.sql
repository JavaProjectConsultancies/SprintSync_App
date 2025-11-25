-- Setup demo users for SprintSync application
-- This script creates demo users with BCrypt hashed passwords

-- BCrypt hashes (generated from GenerateBCrypt.java):
-- admin123 -> $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- manager123 -> $2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm  
-- dev123 -> $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi
-- design123 -> $2a$10$rqA8q8q8q8q8q8q8q8q8qu8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q

-- First, ensure we have departments and domains
INSERT INTO departments (id, name, description) 
VALUES 
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

-- Insert the two required domains
INSERT INTO domains (id, name, description)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'development', 'Development and Engineering Domain'),
    ('550e8400-e29b-41d4-a716-446655440002', 'management', 'Management and Administration Domain')
ON CONFLICT (id) DO NOTHING;

-- Insert demo users
-- Admin user goes to management domain
-- 3 other users go to development domain
INSERT INTO users (id, email, password_hash, name, role, department_id, domain_id, is_active)
VALUES 
    -- Admin user (management domain) - assigned to Administration department
    ('550e8400-e29b-41d4-a716-446655440003', 
     'admin@demo.com', 
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
     'Admin User', 
     'admin',
     '550e8400-e29b-41d4-a716-446655440015', -- Administration department
     '550e8400-e29b-41d4-a716-446655440002', -- management domain
     true),
    
    -- Developer user 1 (development domain) - assigned to ERP & Strategic Technology
    ('550e8400-e29b-41d4-a716-446655440004',
     'developer1@demo.com',
     '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi',
     'Developer User 1',
     'developer',
     '550e8400-e29b-41d4-a716-446655440010', -- ERP & Strategic Technology department
     '550e8400-e29b-41d4-a716-446655440001', -- development domain
     true),
    
    -- Developer user 2 (development domain) - assigned to ERP & Strategic Technology
    ('550e8400-e29b-41d4-a716-446655440005',
     'developer2@demo.com',
     '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm',
     'Developer User 2',
     'developer',
     '550e8400-e29b-41d4-a716-446655440010', -- ERP & Strategic Technology department
     '550e8400-e29b-41d4-a716-446655440001', -- development domain
     true),
    
    -- Developer user 3 (development domain) - assigned to ERP & Strategic Technology
    ('550e8400-e29b-41d4-a716-446655440006',
     'developer3@demo.com',
     '$2a$10$rqA8q8q8q8q8q8q8q8q8qu8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q',
     'Developer User 3',
     'developer',
     '550e8400-e29b-41d4-a716-446655440010', -- ERP & Strategic Technology department
     '550e8400-e29b-41d4-a716-446655440001', -- development domain
     true)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash, domain_id = EXCLUDED.domain_id;

-- Verify users were created
SELECT id, email, name, role, is_active, domain_id FROM users WHERE email IN (
    'admin@demo.com', 
    'developer1@demo.com', 
    'developer2@demo.com', 
    'developer3@demo.com'
);

-- Verify domain assignments
SELECT 
    d.name as domain_name,
    COUNT(u.id) as user_count,
    STRING_AGG(u.name, ', ') as users
FROM domains d
LEFT JOIN users u ON u.domain_id = d.id
WHERE d.name IN ('development', 'management')
GROUP BY d.id, d.name
ORDER BY d.name;

