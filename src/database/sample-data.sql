-- SprintSync Sample Data
-- This file contains sample data for testing and development

-- =============================================
-- SAMPLE USERS (aligned with AuthContext data)
-- =============================================

-- First, get department and domain IDs for reference
-- (In a real scenario, these would be retrieved from the inserted data)

-- Sample user data aligned with AuthContext.tsx
INSERT INTO users (id, email, password_hash, name, role, department_id, domain_id, experience, hourly_rate, availability_percentage, skills) VALUES
-- Admins
('00000000-0000-0000-0000-000000000001', 'admin@demo.com', '$2b$10$example_hash', 'Arjun Sharma', 'admin', 
 (SELECT id FROM departments WHERE name = 'IT'), 
 (SELECT id FROM domains WHERE name = 'System Administration'), 
 'senior', 150.00, 100, '["System Administration", "DevOps", "Security"]'),

('00000000-0000-0000-0000-000000000002', 'kavita.admin@demo.com', '$2b$10$example_hash', 'Kavita Singh', 'admin', 
 (SELECT id FROM departments WHERE name = 'IT'), 
 (SELECT id FROM domains WHERE name = 'Database'), 
 'senior', 140.00, 100, '["Database Management", "Data Architecture", "Performance Tuning"]'),

-- Managers
('00000000-0000-0000-0000-000000000003', 'priya@demo.com', '$2b$10$example_hash', 'Priya Mehta', 'manager', 
 (SELECT id FROM departments WHERE name = 'VNIT'), 
 (SELECT id FROM domains WHERE name = 'Implementation'), 
 'senior', 120.00, 100, '["Project Management", "Agile", "Team Leadership"]'),

('00000000-0000-0000-0000-000000000004', 'rajesh.manager@demo.com', '$2b$10$example_hash', 'Rajesh Gupta', 'manager', 
 (SELECT id FROM departments WHERE name = 'Dinshaw'), 
 (SELECT id FROM domains WHERE name = 'Java'), 
 'senior', 125.00, 100, '["Java Development", "Project Management", "Architecture"]'),

('00000000-0000-0000-0000-000000000005', 'anita.manager@demo.com', '$2b$10$example_hash', 'Anita Verma', 'manager', 
 (SELECT id FROM departments WHERE name = 'Hospy'), 
 (SELECT id FROM domains WHERE name = 'Angular'), 
 'senior', 115.00, 100, '["Angular Development", "Team Management", "Healthcare Systems"]'),

('00000000-0000-0000-0000-000000000006', 'deepak.manager@demo.com', '$2b$10$example_hash', 'Deepak Joshi', 'manager', 
 (SELECT id FROM departments WHERE name = 'Pharma'), 
 (SELECT id FROM domains WHERE name = 'Testing'), 
 'senior', 110.00, 100, '["Quality Assurance", "Test Management", "Pharmaceutical Compliance"]'),

-- Angular Developers
('00000000-0000-0000-0000-000000000007', 'rohit@demo.com', '$2b$10$example_hash', 'Rohit Kumar', 'developer', 
 (SELECT id FROM departments WHERE name = 'VNIT'), 
 (SELECT id FROM domains WHERE name = 'Angular'), 
 'mid', 75.00, 100, '["Angular", "TypeScript", "RxJS", "NgRx"]'),

('00000000-0000-0000-0000-000000000008', 'neha.angular@demo.com', '$2b$10$example_hash', 'Neha Agarwal', 'developer', 
 (SELECT id FROM departments WHERE name = 'Hospy'), 
 (SELECT id FROM domains WHERE name = 'Angular'), 
 'mid', 70.00, 100, '["Angular", "HTML5", "CSS3", "Bootstrap"]'),

('00000000-0000-0000-0000-000000000009', 'sanjay.angular@demo.com', '$2b$10$example_hash', 'Sanjay Reddy', 'developer', 
 (SELECT id FROM departments WHERE name = 'Dinshaw'), 
 (SELECT id FROM domains WHERE name = 'Angular'), 
 'senior', 85.00, 100, '["Angular", "Node.js", "Express", "MongoDB"]'),

('00000000-0000-0000-0000-00000000000a', 'meera.angular@demo.com', '$2b$10$example_hash', 'Meera Iyer', 'developer', 
 (SELECT id FROM departments WHERE name = 'Pharma'), 
 (SELECT id FROM domains WHERE name = 'Angular'), 
 'senior', 80.00, 100, '["Angular", "Material Design", "PWA", "Testing"]'),

-- Java Developers
('00000000-0000-0000-0000-00000000000b', 'amit.dev@demo.com', '$2b$10$example_hash', 'Amit Patel', 'developer', 
 (SELECT id FROM departments WHERE name = 'Dinshaw'), 
 (SELECT id FROM domains WHERE name = 'Java'), 
 'senior', 90.00, 100, '["Java", "Spring Boot", "Microservices", "REST APIs"]'),

('00000000-0000-0000-0000-00000000000c', 'ravi.java@demo.com', '$2b$10$example_hash', 'Ravi Sharma', 'developer', 
 (SELECT id FROM departments WHERE name = 'VNIT'), 
 (SELECT id FROM domains WHERE name = 'Java'), 
 'mid', 75.00, 100, '["Java", "Spring", "Hibernate", "MySQL"]'),

('00000000-0000-0000-0000-00000000000d', 'pooja.java@demo.com', '$2b$10$example_hash', 'Pooja Yadav', 'developer', 
 (SELECT id FROM departments WHERE name = 'Hospy'), 
 (SELECT id FROM domains WHERE name = 'Java'), 
 'mid', 70.00, 100, '["Java", "Spring Security", "JPA", "PostgreSQL"]'),

('00000000-0000-0000-0000-00000000000e', 'karthik.java@demo.com', '$2b$10$example_hash', 'Karthik Nair', 'developer', 
 (SELECT id FROM departments WHERE name = 'Pharma'), 
 (SELECT id FROM domains WHERE name = 'Java'), 
 'senior', 85.00, 100, '["Java", "Spring Cloud", "Docker", "Kubernetes"]'),

-- Maui Developers
('00000000-0000-0000-0000-00000000000f', 'vikram.dev@demo.com', '$2b$10$example_hash', 'Vikram Singh', 'developer', 
 (SELECT id FROM departments WHERE name = 'Hospy'), 
 (SELECT id FROM domains WHERE name = 'Maui'), 
 'mid', 80.00, 100, '["MAUI", "C#", "Xamarin", "Mobile Development"]'),

('00000000-0000-0000-0000-000000000010', 'shreya.maui@demo.com', '$2b$10$example_hash', 'Shreya Kapoor', 'developer', 
 (SELECT id FROM departments WHERE name = 'VNIT'), 
 (SELECT id FROM domains WHERE name = 'Maui'), 
 'junior', 60.00, 100, '["MAUI", ".NET", "SQLite", "Azure"]'),

('00000000-0000-0000-0000-000000000011', 'arun.maui@demo.com', '$2b$10$example_hash', 'Arun Ghosh', 'developer', 
 (SELECT id FROM departments WHERE name = 'Dinshaw'), 
 (SELECT id FROM domains WHERE name = 'Maui'), 
 'mid', 75.00, 100, '["MAUI", "Blazor", "SignalR", "Entity Framework"]'),

('00000000-0000-0000-0000-000000000012', 'divya.maui@demo.com', '$2b$10$example_hash', 'Divya Menon', 'developer', 
 (SELECT id FROM departments WHERE name = 'Pharma'), 
 (SELECT id FROM domains WHERE name = 'Maui'), 
 'senior', 85.00, 100, '["MAUI", "Cross-platform", "API Integration", "Mobile Security"]'),

-- Testing Engineers
('00000000-0000-0000-0000-000000000013', 'ravi.test@demo.com', '$2b$10$example_hash', 'Ravi Shankar', 'developer', 
 (SELECT id FROM departments WHERE name = 'Pharma'), 
 (SELECT id FROM domains WHERE name = 'Testing'), 
 'senior', 80.00, 100, '["Manual Testing", "Automation", "Selenium", "Performance Testing"]'),

('00000000-0000-0000-0000-000000000014', 'sunita.test@demo.com', '$2b$10$example_hash', 'Sunita Gupta', 'developer', 
 (SELECT id FROM departments WHERE name = 'VNIT'), 
 (SELECT id FROM domains WHERE name = 'Testing'), 
 'mid', 65.00, 100, '["QA", "Test Planning", "Bug Tracking", "Regression Testing"]'),

('00000000-0000-0000-0000-000000000015', 'manoj.test@demo.com', '$2b$10$example_hash', 'Manoj Kumar', 'developer', 
 (SELECT id FROM departments WHERE name = 'Dinshaw'), 
 (SELECT id FROM domains WHERE name = 'Testing'), 
 'mid', 70.00, 100, '["API Testing", "Postman", "JMeter", "CI/CD Testing"]'),

('00000000-0000-0000-0000-000000000016', 'lakshmi.test@demo.com', '$2b$10$example_hash', 'Lakshmi Pillai', 'developer', 
 (SELECT id FROM departments WHERE name = 'Hospy'), 
 (SELECT id FROM domains WHERE name = 'Testing'), 
 'senior', 75.00, 100, '["Test Strategy", "Healthcare Testing", "Compliance", "Security Testing"]'),

-- Implementation Engineers
('00000000-0000-0000-0000-000000000017', 'suresh.impl@demo.com', '$2b$10$example_hash', 'Suresh Bhat', 'developer', 
 (SELECT id FROM departments WHERE name = 'Dinshaw'), 
 (SELECT id FROM domains WHERE name = 'Implementation'), 
 'senior', 85.00, 100, '["System Implementation", "DevOps", "Cloud Migration", "Monitoring"]'),

('00000000-0000-0000-0000-000000000018', 'rekha.impl@demo.com', '$2b$10$example_hash', 'Rekha Jain', 'developer', 
 (SELECT id FROM departments WHERE name = 'VNIT'), 
 (SELECT id FROM domains WHERE name = 'Implementation'), 
 'mid', 70.00, 100, '["Deployment", "Configuration", "Documentation", "Training"]'),

('00000000-0000-0000-0000-000000000019', 'ashok.impl@demo.com', '$2b$10$example_hash', 'Ashok Reddy', 'developer', 
 (SELECT id FROM departments WHERE name = 'Hospy'), 
 (SELECT id FROM domains WHERE name = 'Implementation'), 
 'mid', 75.00, 100, '["Healthcare Implementation", "Integration", "Data Migration", "Support"]'),

('00000000-0000-0000-0000-00000000001a', 'geetha.impl@demo.com', '$2b$10$example_hash', 'Geetha Krishnan', 'developer', 
 (SELECT id FROM departments WHERE name = 'Pharma'), 
 (SELECT id FROM domains WHERE name = 'Implementation'), 
 'senior', 80.00, 100, '["Pharmaceutical Systems", "Compliance", "Validation", "GxP"]'),

-- Database Engineers
('00000000-0000-0000-0000-00000000001b', 'vinod.db@demo.com', '$2b$10$example_hash', 'Vinod Agarwal', 'developer', 
 (SELECT id FROM departments WHERE name = 'VNIT'), 
 (SELECT id FROM domains WHERE name = 'Database'), 
 'senior', 85.00, 100, '["PostgreSQL", "Database Design", "Performance Tuning", "Backup Strategies"]'),

('00000000-0000-0000-0000-00000000001c', 'radha.db@demo.com', '$2b$10$example_hash', 'Radha Sharma', 'developer', 
 (SELECT id FROM departments WHERE name = 'Dinshaw'), 
 (SELECT id FROM domains WHERE name = 'Database'), 
 'mid', 75.00, 100, '["MySQL", "Data Modeling", "ETL", "Business Intelligence"]'),

('00000000-0000-0000-0000-00000000001d', 'ramesh.db@demo.com', '$2b$10$example_hash', 'Ramesh Rao', 'developer', 
 (SELECT id FROM departments WHERE name = 'Hospy'), 
 (SELECT id FROM domains WHERE name = 'Database'), 
 'senior', 80.00, 100, '["Oracle", "Healthcare Data", "HIPAA Compliance", "Data Security"]'),

('00000000-0000-0000-0000-00000000001e', 'nandini.db@demo.com', '$2b$10$example_hash', 'Nandini Joshi', 'developer', 
 (SELECT id FROM departments WHERE name = 'Pharma'), 
 (SELECT id FROM domains WHERE name = 'Database'), 
 'mid', 70.00, 100, '["SQL Server", "Clinical Data", "Regulatory Compliance", "Data Integrity"]'),

-- Marketing Professionals (Designers)
('00000000-0000-0000-0000-00000000001f', 'sneha@demo.com', '$2b$10$example_hash', 'Sneha Patel', 'designer', 
 (SELECT id FROM departments WHERE name = 'VNIT'), 
 (SELECT id FROM domains WHERE name = 'Marketing'), 
 'mid', 65.00, 100, '["UI/UX Design", "Adobe Creative Suite", "Figma", "User Research"]'),

('00000000-0000-0000-0000-000000000020', 'aarti.marketing@demo.com', '$2b$10$example_hash', 'Aarti Jain', 'designer', 
 (SELECT id FROM departments WHERE name = 'Dinshaw'), 
 (SELECT id FROM domains WHERE name = 'Marketing'), 
 'senior', 75.00, 100, '["Brand Design", "Digital Marketing", "Content Strategy", "Analytics"]'),

('00000000-0000-0000-0000-000000000021', 'kiran.marketing@demo.com', '$2b$10$example_hash', 'Kiran Nair', 'designer', 
 (SELECT id FROM departments WHERE name = 'Hospy'), 
 (SELECT id FROM domains WHERE name = 'Marketing'), 
 'mid', 60.00, 100, '["Healthcare Marketing", "Patient Experience Design", "Accessibility", "Compliance"]'),

('00000000-0000-0000-0000-000000000022', 'deepika.marketing@demo.com', '$2b$10$example_hash', 'Deepika Shetty', 'designer', 
 (SELECT id FROM departments WHERE name = 'Pharma'), 
 (SELECT id FROM domains WHERE name = 'Marketing'), 
 'senior', 70.00, 100, '["Pharmaceutical Marketing", "Medical Design", "Regulatory Graphics", "Scientific Visualization"]'),

-- HR Professionals (Designers)
('00000000-0000-0000-0000-000000000025', 'sonia.hr@demo.com', '$2b$10$example_hash', 'Sonia Kapoor', 'designer', 
 (SELECT id FROM departments WHERE name = 'Pharma'), 
 (SELECT id FROM domains WHERE name = 'HR'), 
 'senior', 75.00, 100, '["HR Systems Design", "Employee Experience", "Workflow Design", "Training Materials"]'),

('00000000-0000-0000-0000-000000000026', 'manisha.hr@demo.com', '$2b$10$example_hash', 'Manisha Gupta', 'designer', 
 (SELECT id FROM departments WHERE name = 'VNIT'), 
 (SELECT id FROM domains WHERE name = 'HR'), 
 'mid', 60.00, 100, '["HR Process Design", "Onboarding Experience", "Policy Documentation", "Internal Communications"]'),

('00000000-0000-0000-0000-000000000027', 'neelam.hr@demo.com', '$2b$10$example_hash', 'Neelam Singh', 'designer', 
 (SELECT id FROM departments WHERE name = 'Dinshaw'), 
 (SELECT id FROM domains WHERE name = 'HR'), 
 'mid', 65.00, 100, '["Talent Acquisition Design", "Performance Management", "Learning Experience", "HR Analytics"]'),

('00000000-0000-0000-0000-000000000028', 'shweta.hr@demo.com', '$2b$10$example_hash', 'Shweta Reddy', 'designer', 
 (SELECT id FROM departments WHERE name = 'Hospy'), 
 (SELECT id FROM domains WHERE name = 'HR'), 
 'senior', 70.00, 100, '["Healthcare HR", "Compliance Training", "Safety Protocols", "Staff Management Systems"]');

-- =============================================
-- SAMPLE PROJECTS (aligned with ProjectsPage data)
-- =============================================

INSERT INTO projects (id, name, description, status, priority, methodology, template, department_id, manager_id, start_date, end_date, budget, spent, progress_percentage, scope, success_criteria, objectives) VALUES

('00000000-0000-0000-0000-100000000001', 'E-Commerce Platform - VNIT', 'Modern online shopping experience with AI recommendations', 'active', 'high', 'scrum', 'web-app',
 (SELECT id FROM departments WHERE name = 'VNIT'),
 '00000000-0000-0000-0000-000000000003', -- Priya Mehta
 '2024-01-15', '2024-03-15', 2500000.00, 2125000.00, 85,
 'Develop a responsive web application with user authentication, data management, and AI integration.',
 '["User satisfaction rating above 4.5", "Page load time under 2 seconds", "99.9% uptime", "Mobile responsive design"]',
 '["Increase online sales by 30%", "Improve user engagement", "Implement AI recommendations", "Achieve scalable architecture"]'),

('00000000-0000-0000-0000-100000000002', 'Mobile Banking App - Dinshaw', 'Secure and user-friendly banking solution', 'planning', 'medium', 'kanban', 'mobile-app',
 (SELECT id FROM departments WHERE name = 'Dinshaw'),
 '00000000-0000-0000-0000-000000000003', -- Priya Mehta
 '2024-03-01', '2024-06-01', 4000000.00, 600000.00, 15,
 'Create a mobile application with offline capability, push notifications, and native performance.',
 '["Bank security compliance", "Biometric authentication", "Offline transaction capability", "Cross-platform compatibility"]',
 '["Modernize banking services", "Improve customer accessibility", "Reduce branch visits by 40%", "Enhance security measures"]'),

('00000000-0000-0000-0000-100000000003', 'AI Chat Support - VNIT', 'Intelligent customer support automation', 'completed', 'low', 'scrum', 'api-service',
 (SELECT id FROM departments WHERE name = 'VNIT'),
 '00000000-0000-0000-0000-000000000004', -- Rajesh Gupta
 '2023-10-01', '2024-01-15', 1500000.00, 1450000.00, 100,
 'Build scalable API service with authentication, rate limiting, and comprehensive documentation.',
 '["Response time under 2 seconds", "95% query resolution rate", "24/7 availability", "Multi-language support"]',
 '["Reduce customer service costs", "Improve response times", "Handle 1000+ concurrent users", "Integrate with existing systems"]'),

('00000000-0000-0000-0000-100000000004', 'Hospital Management System - Hospy', 'Comprehensive healthcare management platform', 'active', 'high', 'scrum', 'web-app',
 (SELECT id FROM departments WHERE name = 'Hospy'),
 '00000000-0000-0000-0000-000000000004', -- Rajesh Gupta
 '2024-02-01', '2024-05-01', 3500000.00, 2100000.00, 60,
 'Develop a responsive web application with user authentication, data management, and API integration.',
 '["HIPAA compliance", "Patient data security", "Integration with existing systems", "Staff training completion"]',
 '["Digitize patient records", "Improve operational efficiency", "Enhance patient care", "Reduce administrative costs"]'),

('00000000-0000-0000-0000-100000000005', 'Pharmaceutical Inventory - Pharma', 'Drug inventory and supply chain management', 'active', 'medium', 'kanban', 'web-app',
 (SELECT id FROM departments WHERE name = 'Pharma'),
 '00000000-0000-0000-0000-000000000005', -- Anita Verma
 '2024-01-20', '2024-04-20', 2000000.00, 900000.00, 45,
 'Develop a responsive web application with user authentication, data management, and API integration.',
 '["FDA compliance", "Real-time inventory tracking", "Supply chain visibility", "Quality control integration"]',
 '["Optimize inventory levels", "Reduce waste by 20%", "Improve supply chain efficiency", "Ensure regulatory compliance"]'),

('00000000-0000-0000-0000-100000000006', 'Learning Management System - VNIT', 'Online education platform with video streaming', 'planning', 'medium', 'scrum', 'web-app',
 (SELECT id FROM departments WHERE name = 'VNIT'),
 '00000000-0000-0000-0000-000000000005', -- Anita Verma
 '2024-04-01', '2024-07-01', 3000000.00, 300000.00, 10,
 'Develop a responsive web application with user authentication, data management, and API integration.',
 '["Support 5000+ concurrent users", "Mobile accessibility", "Content management system", "Assessment tools"]',
 '["Modernize education delivery", "Improve student engagement", "Enable remote learning", "Track learning analytics"]'),

('00000000-0000-0000-0000-100000000007', 'Financial Analytics - Dinshaw', 'Business intelligence and financial reporting', 'active', 'high', 'scrum', 'data-analytics',
 (SELECT id FROM departments WHERE name = 'Dinshaw'),
 '00000000-0000-0000-0000-000000000006', -- Deepak Joshi
 '2023-11-01', '2024-02-01', 1800000.00, 1350000.00, 75,
 'Develop analytics platform with data visualization, reporting, and real-time insights.',
 '["Real-time data processing", "Advanced visualization", "Regulatory reporting", "Data accuracy 99.9%"]',
 '["Improve decision making", "Automate reporting", "Reduce manual effort by 60%", "Enhance data insights"]'),

('00000000-0000-0000-0000-100000000008', 'Patient Portal - Hospy', 'Patient appointment and health records portal', 'completed', 'medium', 'kanban', 'web-app',
 (SELECT id FROM departments WHERE name = 'Hospy'),
 '00000000-0000-0000-0000-000000000006', -- Deepak Joshi
 '2023-09-01', '2023-12-01', 2200000.00, 2150000.00, 100,
 'Develop a responsive web application with user authentication, data management, and API integration.',
 '["Patient satisfaction above 4.0", "Appointment booking efficiency", "Secure health record access", "Mobile compatibility"]',
 '["Improve patient experience", "Reduce administrative burden", "Enable self-service", "Enhance communication"]');

-- =============================================
-- PROJECT TEAM ASSIGNMENTS
-- =============================================

-- Project 1: E-Commerce Platform - VNIT (7 members)
INSERT INTO project_team_members (project_id, user_id, role, is_team_lead, allocation_percentage) VALUES
('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000007', 'Angular Developer', true, 100),  -- Rohit Kumar
('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-00000000001f', 'Designer', false, 80),             -- Sneha Patel
('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000014', 'Tester', false, 60),               -- Sunita Gupta
('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000018', 'Implementation', false, 50),        -- Rekha Jain
('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-00000000001b', 'Database', false, 70),              -- Vinod Agarwal
('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000026', 'HR', false, 30),                   -- Manisha Gupta
('00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-000000000003', 'Manager', false, 80);               -- Priya Mehta

-- Project 2: Mobile Banking App - Dinshaw (7 members)
INSERT INTO project_team_members (project_id, user_id, role, is_team_lead, allocation_percentage) VALUES
('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000009', 'Angular Developer', true, 100),   -- Sanjay Reddy
('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-00000000000b', 'Java Developer', false, 100),      -- Amit Patel
('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000011', 'Maui Developer', false, 80),       -- Arun Ghosh
('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-00000000001f', 'Designer', false, 60),             -- Sneha Patel
('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000014', 'Tester', false, 70),               -- Sunita Gupta
('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000017', 'Implementation', false, 50),       -- Suresh Bhat
('00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-000000000003', 'Manager', false, 60);              -- Priya Mehta

-- Project 3: AI Chat Support - VNIT (7 members)
INSERT INTO project_team_members (project_id, user_id, role, is_team_lead, allocation_percentage) VALUES
('00000000-0000-0000-0000-100000000003', '00000000-0000-0000-0000-000000000007', 'Angular Developer', true, 80),    -- Rohit Kumar
('00000000-0000-0000-0000-100000000003', '00000000-0000-0000-0000-00000000000c', 'Java Developer', false, 100),      -- Ravi Sharma
('00000000-0000-0000-0000-100000000003', '00000000-0000-0000-0000-00000000000f', 'Maui Developer', false, 60),       -- Vikram Singh
('00000000-0000-0000-0000-100000000003', '00000000-0000-0000-0000-000000000015', 'Tester', false, 80),               -- Manoj Kumar
('00000000-0000-0000-0000-100000000003', '00000000-0000-0000-0000-00000000001a', 'Implementation', false, 70),       -- Geetha Krishnan
('00000000-0000-0000-0000-100000000003', '00000000-0000-0000-0000-000000000026', 'HR', false, 40),                   -- Manisha Gupta
('00000000-0000-0000-0000-100000000003', '00000000-0000-0000-0000-000000000004', 'Manager', false, 70);              -- Rajesh Gupta

-- Project 4: Hospital Management System - Hospy (7 members)
INSERT INTO project_team_members (project_id, user_id, role, is_team_lead, allocation_percentage) VALUES
('00000000-0000-0000-0000-100000000004', '00000000-0000-0000-0000-000000000009', 'Angular Developer', true, 80),    -- Sanjay Reddy
('00000000-0000-0000-0000-100000000004', '00000000-0000-0000-0000-00000000000b', 'Java Developer', false, 80),       -- Amit Patel
('00000000-0000-0000-0000-100000000004', '00000000-0000-0000-0000-000000000012', 'Maui Developer', false, 90),       -- Divya Menon
('00000000-0000-0000-0000-100000000004', '00000000-0000-0000-0000-000000000013', 'Tester', false, 70),               -- Ravi Shankar
('00000000-0000-0000-0000-100000000004', '00000000-0000-0000-0000-000000000018', 'Implementation', false, 60),       -- Rekha Jain
('00000000-0000-0000-0000-100000000004', '00000000-0000-0000-0000-000000000020', 'Marketing', false, 50),            -- Aarti Jain
('00000000-0000-0000-0000-100000000004', '00000000-0000-0000-0000-000000000004', 'Manager', false, 90);              -- Rajesh Gupta

-- Project 5: Pharmaceutical Inventory - Pharma (7 members)
INSERT INTO project_team_members (project_id, user_id, role, is_team_lead, allocation_percentage) VALUES
('00000000-0000-0000-0000-100000000005', '00000000-0000-0000-0000-000000000008', 'Angular Developer', true, 90),    -- Neha Agarwal
('00000000-0000-0000-0000-100000000005', '00000000-0000-0000-0000-00000000000d', 'Java Developer', false, 80),       -- Pooja Yadav
('00000000-0000-0000-0000-100000000005', '00000000-0000-0000-0000-000000000010', 'Maui Developer', false, 70),       -- Shreya Kapoor
('00000000-0000-0000-0000-100000000005', '00000000-0000-0000-0000-000000000015', 'Tester', false, 60),               -- Manoj Kumar
('00000000-0000-0000-0000-100000000005', '00000000-0000-0000-0000-000000000019', 'Implementation', false, 80),       -- Ashok Reddy
('00000000-0000-0000-0000-100000000005', '00000000-0000-0000-0000-000000000021', 'Marketing', false, 70),            -- Kiran Nair
('00000000-0000-0000-0000-100000000005', '00000000-0000-0000-0000-000000000005', 'Manager', false, 100);             -- Anita Verma

-- Project 6: Learning Management System - VNIT (7 members)
INSERT INTO project_team_members (project_id, user_id, role, is_team_lead, allocation_percentage) VALUES
('00000000-0000-0000-0000-100000000006', '00000000-0000-0000-0000-000000000008', 'Angular Developer', true, 70),    -- Neha Agarwal
('00000000-0000-0000-0000-100000000006', '00000000-0000-0000-0000-00000000000e', 'Java Developer', false, 90),       -- Karthik Nair
('00000000-0000-0000-0000-100000000006', '00000000-0000-0000-0000-00000000000f', 'Maui Developer', false, 80),       -- Vikram Singh
('00000000-0000-0000-0000-100000000006', '00000000-0000-0000-0000-000000000016', 'Tester', false, 70),               -- Lakshmi Pillai
('00000000-0000-0000-0000-100000000006', '00000000-0000-0000-0000-00000000001a', 'Implementation', false, 60),       -- Geetha Krishnan
('00000000-0000-0000-0000-100000000006', '00000000-0000-0000-0000-000000000021', 'Marketing', false, 50),            -- Kiran Nair
('00000000-0000-0000-0000-100000000006', '00000000-0000-0000-0000-000000000005', 'Manager', false, 80);              -- Anita Verma

-- Project 7: Financial Analytics - Dinshaw (7 members)
INSERT INTO project_team_members (project_id, user_id, role, is_team_lead, allocation_percentage) VALUES
('00000000-0000-0000-0000-100000000007', '00000000-0000-0000-0000-00000000000a', 'Angular Developer', true, 100),   -- Meera Iyer
('00000000-0000-0000-0000-100000000007', '00000000-0000-0000-0000-00000000000d', 'Java Developer', false, 70),       -- Pooja Yadav
('00000000-0000-0000-0000-100000000007', '00000000-0000-0000-0000-000000000011', 'Maui Developer', false, 60),       -- Arun Ghosh
('00000000-0000-0000-0000-100000000007', '00000000-0000-0000-0000-000000000013', 'Tester', false, 50),               -- Ravi Shankar
('00000000-0000-0000-0000-100000000007', '00000000-0000-0000-0000-000000000019', 'Implementation', false, 60),       -- Ashok Reddy
('00000000-0000-0000-0000-100000000007', '00000000-0000-0000-0000-000000000022', 'Marketing', false, 80),            -- Deepika Shetty
('00000000-0000-0000-0000-100000000007', '00000000-0000-0000-0000-000000000006', 'Manager', false, 90);              -- Deepak Joshi

-- Project 8: Patient Portal - Hospy (7 members)
INSERT INTO project_team_members (project_id, user_id, role, is_team_lead, allocation_percentage) VALUES
('00000000-0000-0000-0000-100000000008', '00000000-0000-0000-0000-00000000000a', 'Angular Developer', true, 80),    -- Meera Iyer
('00000000-0000-0000-0000-100000000008', '00000000-0000-0000-0000-00000000000e', 'Java Developer', false, 70),       -- Karthik Nair
('00000000-0000-0000-0000-100000000008', '00000000-0000-0000-0000-000000000012', 'Maui Developer', false, 60),       -- Divya Menon
('00000000-0000-0000-0000-100000000008', '00000000-0000-0000-0000-000000000016', 'Tester', false, 80),               -- Lakshmi Pillai
('00000000-0000-0000-0000-100000000008', '00000000-0000-0000-0000-000000000017', 'Implementation', false, 70),       -- Suresh Bhat
('00000000-0000-0000-0000-100000000008', '00000000-0000-0000-0000-00000000001e', 'Database', false, 90),             -- Nandini Joshi
('00000000-0000-0000-0000-100000000008', '00000000-0000-0000-0000-000000000006', 'Manager', false, 60);              -- Deepak Joshi

-- =============================================
-- SAMPLE SPRINTS
-- =============================================

-- Sprints for Project 1: E-Commerce Platform
INSERT INTO sprints (id, project_id, name, goal, status, start_date, end_date, capacity_hours, velocity_points) VALUES
('00000000-0000-0000-0000-200000000001', '00000000-0000-0000-0000-100000000001', 'Sprint 1 - Foundation', 'Set up project infrastructure and basic authentication', 'completed', '2024-01-15', '2024-01-29', 280, 32),
('00000000-0000-0000-0000-200000000002', '00000000-0000-0000-0000-100000000001', 'Sprint 2 - Product Catalog', 'Implement product catalog and search functionality', 'completed', '2024-01-30', '2024-02-13', 280, 28),
('00000000-0000-0000-0000-200000000003', '00000000-0000-0000-0000-100000000001', 'Sprint 3 - Shopping Cart', 'Build shopping cart and checkout process', 'completed', '2024-02-14', '2024-02-28', 280, 30),
('00000000-0000-0000-0000-200000000004', '00000000-0000-0000-0000-100000000001', 'Sprint 4 - AI Recommendations', 'Integrate AI recommendation engine', 'completed', '2024-03-01', '2024-03-15', 280, 25),
('00000000-0000-0000-0000-200000000005', '00000000-0000-0000-0000-100000000001', 'Sprint 5 - Performance & Testing', 'Optimize performance and comprehensive testing', 'active', '2024-03-16', '2024-03-30', 280, 0);

-- Sprints for Project 2: Mobile Banking App
INSERT INTO sprints (id, project_id, name, goal, status, start_date, end_date, capacity_hours, velocity_points) VALUES
('00000000-0000-0000-0000-200000000006', '00000000-0000-0000-0000-100000000002', 'Sprint 1 - Planning & Setup', 'Project setup and requirement analysis', 'completed', '2024-03-01', '2024-03-15', 320, 15);

-- Sprints for Project 3: AI Chat Support (Completed)
INSERT INTO sprints (id, project_id, name, goal, status, start_date, end_date, capacity_hours, velocity_points) VALUES
('00000000-0000-0000-0000-200000000007', '00000000-0000-0000-0000-100000000003', 'Sprint 1 - Core API', 'Build basic chat API and NLP integration', 'completed', '2023-10-01', '2023-10-15', 280, 35),
('00000000-0000-0000-0000-200000000008', '00000000-0000-0000-0000-100000000003', 'Sprint 2 - AI Training', 'Train AI models with company data', 'completed', '2023-10-16', '2023-10-30', 280, 30),
('00000000-0000-0000-0000-200000000009', '00000000-0000-0000-0000-100000000003', 'Sprint 3 - Integration', 'Integrate with existing systems', 'completed', '2023-11-01', '2023-11-15', 280, 28),
('00000000-0000-0000-0000-20000000000a', '00000000-0000-0000-0000-100000000003', 'Sprint 4 - UI & Testing', 'Build user interface and testing', 'completed', '2023-11-16', '2023-11-30', 280, 25),
('00000000-0000-0000-0000-20000000000b', '00000000-0000-0000-0000-100000000003', 'Sprint 5 - Optimization', 'Performance optimization and documentation', 'completed', '2023-12-01', '2023-12-15', 280, 22),
('00000000-0000-0000-0000-20000000000c', '00000000-0000-0000-0000-100000000003', 'Sprint 6 - Deployment', 'Production deployment and monitoring', 'completed', '2023-12-16', '2024-01-15', 280, 20);

-- =============================================
-- SAMPLE STORIES
-- =============================================

-- Stories for E-Commerce Platform Sprint 1
INSERT INTO stories (id, project_id, sprint_id, title, description, status, priority, story_points, assignee_id, reporter_id, epic) VALUES
('00000000-0000-0000-0000-300000000001', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-200000000001', 'User Authentication Setup', 'As a user, I want to register and login securely', 'done', 'critical', 8, '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'Authentication'),
('00000000-0000-0000-0000-300000000002', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-200000000001', 'Project Infrastructure', 'Set up CI/CD pipeline and development environment', 'done', 'high', 13, '00000000-0000-0000-0000-00000000001b', '00000000-0000-0000-0000-000000000003', 'Infrastructure'),
('00000000-0000-0000-0000-300000000003', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-200000000001', 'Basic UI Framework', 'Create responsive layout and component library', 'done', 'medium', 5, '00000000-0000-0000-0000-00000000001f', '00000000-0000-0000-0000-000000000003', 'UI/UX'),
('00000000-0000-0000-0000-300000000004', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-200000000001', 'Database Design', 'Design and implement core database schema', 'done', 'high', 8, '00000000-0000-0000-0000-00000000001b', '00000000-0000-0000-0000-000000000003', 'Infrastructure');

-- Stories for E-Commerce Platform Sprint 5 (Active)
INSERT INTO stories (id, project_id, sprint_id, title, description, status, priority, story_points, assignee_id, reporter_id, epic) VALUES
('00000000-0000-0000-0000-300000000005', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-200000000005', 'Performance Optimization', 'Optimize page load times and database queries', 'in_progress', 'high', 8, '00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'Performance'),
('00000000-0000-0000-0000-300000000006', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-200000000005', 'Security Testing', 'Comprehensive security testing and vulnerability assessment', 'to_do', 'critical', 13, '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000003', 'Security'),
('00000000-0000-0000-0000-300000000007', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-200000000005', 'User Acceptance Testing', 'End-to-end user testing and feedback incorporation', 'to_do', 'medium', 5, '00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000003', 'Testing');

-- Stories for Mobile Banking App
INSERT INTO stories (id, project_id, sprint_id, title, description, status, priority, story_points, assignee_id, reporter_id, epic) VALUES
('00000000-0000-0000-0000-300000000008', '00000000-0000-0000-0000-100000000002', '00000000-0000-0000-0000-200000000006', 'Security Requirements Analysis', 'Define banking security requirements and compliance needs', 'done', 'critical', 8, '00000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000003', 'Security'),
('00000000-0000-0000-0000-300000000009', '00000000-0000-0000-0000-100000000002', null, 'Biometric Authentication', 'Implement fingerprint and face recognition login', 'backlog', 'high', 13, null, '00000000-0000-0000-0000-000000000003', 'Authentication'),
('00000000-0000-0000-0000-30000000000a', '00000000-0000-0000-0000-100000000002', null, 'Account Dashboard', 'Create main account overview and balance display', 'backlog', 'medium', 8, null, '00000000-0000-0000-0000-000000000003', 'Core Features');

-- =============================================
-- SAMPLE TASKS
-- =============================================

-- Tasks for Performance Optimization Story
INSERT INTO tasks (id, story_id, title, description, status, priority, assignee_id, estimated_hours, order_index) VALUES
('00000000-0000-0000-0000-400000000001', '00000000-0000-0000-0000-300000000005', 'Database Query Optimization', 'Optimize slow database queries identified in profiling', 'in_progress', 'high', '00000000-0000-0000-0000-00000000001b', 16.0, 1),
('00000000-0000-0000-0000-400000000002', '00000000-0000-0000-0000-300000000005', 'Frontend Bundle Optimization', 'Reduce JavaScript bundle size and implement lazy loading', 'to_do', 'medium', '00000000-0000-0000-0000-000000000007', 12.0, 2),
('00000000-0000-0000-0000-400000000003', '00000000-0000-0000-0000-300000000005', 'Image Optimization', 'Implement WebP format and responsive images', 'to_do', 'medium', '00000000-0000-0000-0000-00000000001f', 8.0, 3),
('00000000-0000-0000-0000-400000000004', '00000000-0000-0000-0000-300000000005', 'Caching Implementation', 'Add Redis caching for frequently accessed data', 'to_do', 'high', '00000000-0000-0000-0000-00000000001b', 20.0, 4);

-- Tasks for Security Testing Story
INSERT INTO tasks (id, story_id, title, description, status, priority, assignee_id, estimated_hours, order_index) VALUES
('00000000-0000-0000-0000-400000000005', '00000000-0000-0000-0000-300000000006', 'Penetration Testing', 'Conduct comprehensive penetration testing', 'to_do', 'critical', '00000000-0000-0000-0000-000000000014', 24.0, 1),
('00000000-0000-0000-0000-400000000006', '00000000-0000-0000-0000-300000000006', 'OWASP Compliance Check', 'Verify compliance with OWASP security standards', 'to_do', 'critical', '00000000-0000-0000-0000-000000000014', 16.0, 2),
('00000000-0000-0000-0000-400000000007', '00000000-0000-0000-0000-300000000006', 'Security Documentation', 'Document security measures and incident response', 'to_do', 'medium', '00000000-0000-0000-0000-000000000018', 8.0, 3);

-- =============================================
-- SAMPLE SUBTASKS
-- =============================================

-- Subtasks for Database Query Optimization
INSERT INTO subtasks (id, task_id, title, description, is_completed, assignee_id, estimated_hours, order_index) VALUES
('00000000-0000-0000-0000-500000000001', '00000000-0000-0000-0000-400000000001', 'Identify Slow Queries', 'Use query profiler to identify performance bottlenecks', true, '00000000-0000-0000-0000-00000000001b', 4.0, 1),
('00000000-0000-0000-0000-500000000002', '00000000-0000-0000-0000-400000000001', 'Add Database Indexes', 'Create appropriate indexes for frequently queried columns', false, '00000000-0000-0000-0000-00000000001b', 6.0, 2),
('00000000-0000-0000-0000-500000000003', '00000000-0000-0000-0000-400000000001', 'Query Refactoring', 'Rewrite complex queries for better performance', false, '00000000-0000-0000-0000-00000000001b', 6.0, 3);

-- =============================================
-- SAMPLE TIME ENTRIES
-- =============================================

-- Time entries for recent work
INSERT INTO time_entries (user_id, project_id, story_id, task_id, description, entry_type, hours_worked, work_date, start_time, end_time) VALUES
-- Rohit Kumar's time entries
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-300000000005', '00000000-0000-0000-0000-400000000002', 'Working on bundle optimization and code splitting', 'development', 8.0, '2024-03-20', '09:00', '17:00'),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-300000000005', '00000000-0000-0000-0000-400000000002', 'Implementing lazy loading for components', 'development', 6.5, '2024-03-21', '09:30', '16:00'),
('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-100000000001', null, null, 'Daily standup and sprint planning', 'meeting', 1.0, '2024-03-21', '16:00', '17:00'),

-- Vinod Agarwal's time entries (Database work)
('00000000-0000-0000-0000-00000000001b', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-300000000005', '00000000-0000-0000-0000-400000000001', 'Database query profiling and analysis', 'development', 4.0, '2024-03-20', '09:00', '13:00'),
('00000000-0000-0000-0000-00000000001b', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-300000000005', '00000000-0000-0000-0000-400000000001', 'Creating database indexes for optimization', 'development', 6.0, '2024-03-21', '10:00', '16:00'),

-- Sunita Gupta's time entries (Testing)
('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-300000000007', null, 'Preparing test cases for user acceptance testing', 'testing', 7.0, '2024-03-20', '09:00', '16:00'),
('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-300000000006', null, 'Security testing research and tool setup', 'testing', 5.5, '2024-03-21', '09:30', '15:00');

-- =============================================
-- SAMPLE MILESTONES
-- =============================================

INSERT INTO milestones (id, project_id, title, description, status, due_date, progress_percentage) VALUES
('00000000-0000-0000-0000-600000000001', '00000000-0000-0000-0000-100000000001', 'MVP Release', 'Minimum viable product with core e-commerce features', 'completed', '2024-02-28', 100),
('00000000-0000-0000-0000-600000000002', '00000000-0000-0000-0000-100000000001', 'Beta Launch', 'Public beta with limited user group', 'in_progress', '2024-03-25', 85),
('00000000-0000-0000-0000-600000000003', '00000000-0000-0000-0000-100000000001', 'Production Release', 'Full production deployment', 'upcoming', '2024-04-15', 0),

('00000000-0000-0000-0000-600000000004', '00000000-0000-0000-0000-100000000002', 'Security Approval', 'Banking security compliance approval', 'upcoming', '2024-04-30', 15),
('00000000-0000-0000-0000-600000000005', '00000000-0000-0000-0000-100000000002', 'Beta Testing', 'Internal beta testing with bank staff', 'upcoming', '2024-05-15', 0),

('00000000-0000-0000-0000-600000000006', '00000000-0000-0000-0000-100000000004', 'HIPAA Compliance', 'Healthcare data compliance certification', 'in_progress', '2024-04-01', 60),
('00000000-0000-0000-0000-600000000007', '00000000-0000-0000-0000-100000000004', 'Staff Training', 'Hospital staff training completion', 'upcoming', '2024-04-20', 0);

-- =============================================
-- SAMPLE STAKEHOLDERS
-- =============================================

INSERT INTO stakeholders (project_id, name, role, email, responsibilities) VALUES
('00000000-0000-0000-0000-100000000001', 'Dr. Sarah Johnson', 'Product Owner', 'sarah.johnson@vnit.com', '["Product vision", "Requirements prioritization", "User acceptance"]'),
('00000000-0000-0000-0000-100000000001', 'Mark Chen', 'Business Analyst', 'mark.chen@vnit.com', '["Business requirements", "Process analysis", "Stakeholder communication"]'),
('00000000-0000-0000-0000-100000000001', 'Lisa Rodriguez', 'UX Designer', 'lisa.rodriguez@vnit.com', '["User experience design", "Usability testing", "Design system"]'),

('00000000-0000-0000-0000-100000000002', 'James Wilson', 'Banking Compliance Officer', 'james.wilson@dinshaw.com', '["Regulatory compliance", "Security requirements", "Audit coordination"]'),
('00000000-0000-0000-0000-100000000002', 'Emily Davis', 'Customer Experience Manager', 'emily.davis@dinshaw.com', '["Customer requirements", "User feedback", "Service design"]'),

('00000000-0000-0000-0000-100000000004', 'Dr. Michael Thompson', 'Chief Medical Officer', 'michael.thompson@hospy.com', '["Clinical requirements", "Workflow validation", "Staff training"]'),
('00000000-0000-0000-0000-100000000004', 'Jennifer Lee', 'Hospital Administrator', 'jennifer.lee@hospy.com', '["Operational requirements", "Budget approval", "Implementation coordination"]');

-- =============================================
-- SAMPLE RISKS
-- =============================================

INSERT INTO risks (project_id, title, description, probability, impact, mitigation, status, owner_id) VALUES
('00000000-0000-0000-0000-100000000001', 'Third-party API Changes', 'Payment gateway or shipping APIs may change during development', 'medium', 'high', 'Maintain backup payment processors and flexible API adapters', 'identified', '00000000-0000-0000-0000-000000000007'),
('00000000-0000-0000-0000-100000000001', 'Performance Issues', 'High traffic may cause performance bottlenecks', 'high', 'medium', 'Implement comprehensive performance testing and monitoring', 'mitigated', '00000000-0000-0000-0000-00000000001b'),

('00000000-0000-0000-0000-100000000002', 'Regulatory Changes', 'Banking regulations may change during development', 'low', 'high', 'Regular compliance reviews and flexible architecture', 'identified', '00000000-0000-0000-0000-000000000009'),
('00000000-0000-0000-0000-100000000002', 'Security Vulnerabilities', 'Mobile banking requires highest security standards', 'medium', 'high', 'Regular security audits and penetration testing', 'identified', '00000000-0000-0000-0000-00000000000b'),

('00000000-0000-0000-0000-100000000004', 'Staff Resistance', 'Hospital staff may resist new technology adoption', 'high', 'medium', 'Comprehensive training program and change management', 'identified', '00000000-0000-0000-0000-000000000019'),
('00000000-0000-0000-0000-100000000004', 'Data Migration Issues', 'Legacy system data migration complexity', 'medium', 'high', 'Thorough data mapping and migration testing', 'mitigated', '00000000-0000-0000-0000-00000000001d');

-- =============================================
-- SAMPLE NOTIFICATIONS
-- =============================================

INSERT INTO notifications (user_id, type, priority, title, message, related_entity_type, related_entity_id, action_url, is_read) VALUES
-- Notifications for Rohit Kumar
('00000000-0000-0000-0000-000000000007', 'task', 'normal', 'New task assigned', 'You have been assigned to "Frontend Bundle Optimization"', 'task', '00000000-0000-0000-0000-400000000002', '/projects/1/tasks/2', false),
('00000000-0000-0000-0000-000000000007', 'project', 'high', 'Sprint deadline approaching', 'Sprint 5 deadline is in 3 days', 'sprint', '00000000-0000-0000-0000-200000000005', '/projects/1/sprints/5', false),
('00000000-0000-0000-0000-000000000007', 'ai_insight', 'normal', 'Performance optimization suggestion', 'AI suggests optimizing image loading for better performance', 'project', '00000000-0000-0000-0000-100000000001', '/ai-insights/perf-1', true),

-- Notifications for Priya Mehta (Manager)
('00000000-0000-0000-0000-000000000003', 'project', 'high', 'Budget threshold reached', 'E-Commerce Platform has reached 85% of allocated budget', 'project', '00000000-0000-0000-0000-100000000001', '/projects/1', false),
('00000000-0000-0000-0000-000000000003', 'system', 'urgent', 'Weekly report ready', 'Your weekly project report is ready for review', 'report', null, '/reports/weekly', false),
('00000000-0000-0000-0000-000000000003', 'ai_insight', 'high', 'Risk assessment update', 'New risk identified in Mobile Banking App project', 'project', '00000000-0000-0000-0000-100000000002', '/ai-insights/risk-1', true),

-- Notifications for Sunita Gupta (Tester)
('00000000-0000-0000-0000-000000000014', 'task', 'high', 'Testing phase starting', 'Security testing phase is ready to begin', 'story', '00000000-0000-0000-0000-300000000006', '/projects/1/stories/6', false),
('00000000-0000-0000-0000-000000000014', 'mention', 'normal', 'Mentioned in comment', 'Rohit Kumar mentioned you in a comment', 'task', '00000000-0000-0000-0000-400000000002', '/projects/1/tasks/2', true);

-- =============================================
-- SAMPLE AI INSIGHTS
-- =============================================

INSERT INTO ai_insights (project_id, type, title, description, metrics, recommendations, confidence_score, generated_at) VALUES
('00000000-0000-0000-0000-100000000001', 'productivity', 'Team Productivity Analysis', 'Current sprint velocity is above average with strong performance indicators', 
 '{"velocity": 28.5, "planned_velocity": 25, "completion_rate": 0.92, "bug_rate": 0.08}',
 '["Continue current sprint planning approach", "Consider increasing story points for next sprint", "Maintain current team composition"]',
 0.87, NOW() - INTERVAL '2 hours'),

('00000000-0000-0000-0000-100000000001', 'timeline_prediction', 'Project Timeline Forecast', 'Based on current velocity, project completion is on track for planned deadline',
 '{"estimated_completion": "2024-04-12", "confidence_interval": "2024-04-10 to 2024-04-15", "risk_factors": ["performance_testing_duration"]}',
 '["Schedule additional time for performance testing", "Consider parallel testing tracks", "Prepare early deployment strategy"]',
 0.92, NOW() - INTERVAL '1 day'),

('00000000-0000-0000-0000-100000000002', 'risk_assessment', 'Security Compliance Risk', 'Banking regulations compliance requires additional attention and resources',
 '{"compliance_score": 0.75, "critical_areas": ["data_encryption", "audit_logging"], "estimated_effort": 120}',
 '["Allocate senior security developer", "Conduct early compliance review", "Implement continuous security testing"]',
 0.88, NOW() - INTERVAL '6 hours'),

('00000000-0000-0000-0000-100000000004', 'resource_optimization', 'Team Allocation Suggestion', 'Database specialist is over-allocated across multiple projects',
 '{"utilization_rate": 1.35, "projects_count": 3, "recommended_allocation": 0.9}',
 '["Redistribute database tasks", "Consider hiring additional database developer", "Implement database automation tools"]',
 0.85, NOW() - INTERVAL '3 hours');

-- =============================================
-- SAMPLE COMMENTS
-- =============================================

INSERT INTO comments (user_id, entity_type, entity_id, content, created_at) VALUES
('00000000-0000-0000-0000-000000000007', 'task', '00000000-0000-0000-0000-400000000002', 'Started working on the bundle optimization. Initial analysis shows we can reduce bundle size by ~40% with code splitting.', NOW() - INTERVAL '4 hours'),
('00000000-0000-0000-0000-00000000001b', 'task', '00000000-0000-0000-0000-400000000001', 'Database profiling complete. Found 3 major bottlenecks that need immediate attention. @Sunita Gupta please verify the performance improvements after the fixes.', NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-000000000014', 'task', '00000000-0000-0000-0000-400000000001', 'Will test the database optimizations as soon as the changes are deployed to staging environment.', NOW() - INTERVAL '1 hour'),
('00000000-0000-0000-0000-000000000003', 'story', '00000000-0000-0000-0000-300000000005', 'Great progress on performance optimization! Please ensure we document all changes for the production deployment checklist.', NOW() - INTERVAL '30 minutes');

-- =============================================
-- SAMPLE TODO ITEMS
-- =============================================

INSERT INTO todos (user_id, title, description, priority, status, due_date, related_project_id, related_story_id) VALUES
('00000000-0000-0000-0000-000000000007', 'Complete bundle optimization', 'Finish implementing code splitting and lazy loading', 'high', 'in_progress', '2024-03-25', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-300000000005'),
('00000000-0000-0000-0000-000000000007', 'Review security testing plan', 'Review and provide feedback on security testing approach', 'medium', 'pending', '2024-03-22', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-300000000006'),
('00000000-0000-0000-0000-000000000007', 'Update technical documentation', 'Update API documentation with latest changes', 'low', 'pending', '2024-03-30', null, null),

('00000000-0000-0000-0000-000000000003', 'Prepare sprint review presentation', 'Create presentation for upcoming sprint review meeting', 'high', 'pending', '2024-03-24', '00000000-0000-0000-0000-100000000001', null),
('00000000-0000-0000-0000-000000000003', 'Review budget allocations', 'Review Q2 budget allocations for all managed projects', 'medium', 'pending', '2024-03-28', null, null),
('00000000-0000-0000-0000-000000000003', 'Schedule team 1-on-1s', 'Schedule quarterly 1-on-1 meetings with team members', 'medium', 'completed', '2024-03-20', null, null),

('00000000-0000-0000-0000-000000000014', 'Set up automated testing', 'Configure automated testing pipeline for security tests', 'high', 'pending', '2024-03-26', '00000000-0000-0000-0000-100000000001', '00000000-0000-0000-0000-300000000006'),
('00000000-0000-0000-0000-000000000014', 'Research new testing tools', 'Evaluate new security testing tools for better coverage', 'low', 'pending', '2024-04-05', null, null);

-- =============================================
-- SAMPLE ACTIVITY LOGS (Recent activities)
-- =============================================

INSERT INTO activity_logs (user_id, entity_type, entity_id, action, description, created_at) VALUES
('00000000-0000-0000-0000-000000000007', 'task', '00000000-0000-0000-0000-400000000002', 'updated', 'Changed status from "to_do" to "in_progress"', NOW() - INTERVAL '5 hours'),
('00000000-0000-0000-0000-00000000001b', 'subtask', '00000000-0000-0000-0000-500000000001', 'updated', 'Marked subtask as completed', NOW() - INTERVAL '3 hours'),
('00000000-0000-0000-0000-000000000014', 'story', '00000000-0000-0000-0000-300000000007', 'created', 'Created new story for user acceptance testing', NOW() - INTERVAL '1 day'),
('00000000-0000-0000-0000-000000000003', 'project', '00000000-0000-0000-0000-100000000001', 'updated', 'Updated project progress to 85%', NOW() - INTERVAL '2 hours'),
('00000000-0000-0000-0000-00000000001f', 'comment', '00000000-0000-0000-0000-400000000003', 'created', 'Added comment on image optimization task', NOW() - INTERVAL '1 hour');

-- =============================================
-- UPDATE PROJECT ASSIGNMENTS FOR CONSISTENCY
-- =============================================

-- Update users table with proper assigned projects (matching AuthContext data)
UPDATE users SET 
    -- This would be handled by the application logic
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT user_id FROM project_team_members WHERE left_at IS NULL
);

-- Verify data consistency
DO $$
BEGIN
    -- Check that all project managers are actually assigned to their projects
    IF EXISTS (
        SELECT 1 FROM projects p 
        LEFT JOIN project_team_members ptm ON p.id = ptm.project_id AND p.manager_id = ptm.user_id
        WHERE ptm.id IS NULL
    ) THEN
        -- Add managers to their project teams if not already there
        INSERT INTO project_team_members (project_id, user_id, role, is_team_lead, allocation_percentage)
        SELECT p.id, p.manager_id, 'Manager', false, 
               CASE WHEN p.status = 'active' THEN 80 ELSE 50 END
        FROM projects p 
        LEFT JOIN project_team_members ptm ON p.id = ptm.project_id AND p.manager_id = ptm.user_id
        WHERE ptm.id IS NULL;
    END IF;
END $$;