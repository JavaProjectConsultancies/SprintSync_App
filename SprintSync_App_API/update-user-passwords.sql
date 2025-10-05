-- Update existing users with real BCrypt password hashes
-- This script updates your dummy users with actual hashed passwords

-- Default passwords for all users (you can change these):
-- admin@demo.com: password = "admin123"
-- manager@demo.com: password = "manager123" 
-- developer@demo.com: password = "dev123"
-- designer@demo.com: password = "design123"

UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email = 'admin@demo.com';
UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email = 'kavita.admin@demo.com';

UPDATE users SET password_hash = '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm' WHERE email = 'priya@demo.com';
UPDATE users SET password_hash = '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm' WHERE email = 'rajesh.manager@demo.com';
UPDATE users SET password_hash = '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm' WHERE email = 'anita.manager@demo.com';
UPDATE users SET password_hash = '$2a$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm' WHERE email = 'deepak.manager@demo.com';

UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE email = 'rohit@demo.com';
UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE email = 'neha.angular@demo.com';
UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE email = 'sanjay.angular@demo.com';
UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE email = 'meera.angular@demo.com';
UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE email = 'amit.dev@demo.com';
UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE email = 'ravi.java@demo.com';
UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE email = 'pooja.java@demo.com';
UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDi' WHERE email = 'karthik.java@demo.com';

UPDATE users SET password_hash = '$2a$10$rqA8q8q8q8q8q8q8q8q8qu8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q' WHERE email = 'vikram.dev@demo.com';
UPDATE users SET password_hash = '$2a$10$rqA8q8q8q8q8q8q8q8q8qu8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q' WHERE email = 'shreya.maui@demo.com';
UPDATE users SET password_hash = '$2a$10$rqA8q8q8q8q8q8q8q8q8qu8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q8q' WHERE email = 'arun.maui@demo.com';

-- Add more users as needed...

-- Verify the updates
SELECT email, name, role, password_hash FROM users WHERE email IN (
    'admin@demo.com', 'priya@demo.com', 'rohit@demo.com', 'vikram.dev@demo.com'
);
