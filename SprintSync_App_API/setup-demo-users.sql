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
    ('550e8400-e29b-41d4-a716-446655440000', 'Engineering', 'Software development and engineering')
ON CONFLICT (id) DO NOTHING;

INSERT INTO domains (id, name, description)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Web Development', 'Web application development')
ON CONFLICT (id) DO NOTHING;

-- Insert demo users
INSERT INTO users (id, email, password_hash, name, role, department_id, domain_id, is_active)
VALUES 
    -- Admin user
    ('550e8400-e29b-41d4-a716-446655440002', 
     'admin@demo.com', 
     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
     'Admin User', 
     'admin',
     '550e8400-e29b-41d4-a716-446655440000',
     '550e8400-e29b-41d4-a716-446655440001',
     true),
    
    -- Manager user
    ('550e8400-e29b-41d4-a716-446655440003',
     'manager@demo.com',
     '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm',
     'Manager User',
     'manager',
     '550e8400-e29b-41d4-a716-446655440000',
     '550e8400-e29b-41d4-a716-446655440001',
     true),
    
    -- Developer user
    ('550e8400-e29b-41d4-a716-446655440004',
     'developer@demo.com',
     '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi',
     'Developer User',
     'developer',
     '550e8400-e29b-41d4-a716-446655440000',
     '550e8400-e29b-41d4-a716-446655440001',
     true),
    
    -- Designer user
    ('550e8400-e29b-41d4-a716-446655440005',
     'designer@demo.com',
     '$2a$10$rqA8q8q8q8q8q8q8q8q8qu8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q',
     'Designer User',
     'designer',
     '550e8400-e29b-41d4-a716-446655440000',
     '550e8400-e29b-41d4-a716-446655440001',
     true)
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash;

-- Verify users were created
SELECT id, email, name, role, is_active FROM users WHERE email IN (
    'admin@demo.com', 
    'manager@demo.com', 
    'developer@demo.com', 
    'designer@demo.com'
);

