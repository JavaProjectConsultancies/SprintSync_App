-- SprintSync Database Population Script with Custom ID Structure
-- Master tables: 4-digit prefix + 12 zeros + increment (16 digits)
-- Transaction tables: 4-digit prefix + UUID without dashes

-- =============================================
-- DEPARTMENTS (Master Table - DEPT prefix)
-- =============================================
INSERT INTO departments (id, name, description, created_at, updated_at) VALUES
('DEPT0000000000001', 'Engineering', 'Software development and engineering', NOW(), NOW()),
('DEPT0000000000002', 'Product', 'Product management and strategy', NOW(), NOW()),
('DEPT0000000000003', 'Design', 'UI/UX design and user experience', NOW(), NOW()),
('DEPT0000000000004', 'Quality Assurance', 'Testing and quality control', NOW(), NOW()),
('DEPT0000000000005', 'Marketing', 'Marketing and communications', NOW(), NOW());

-- =============================================
-- DOMAINS (Master Table - DOMN prefix)
-- =============================================
INSERT INTO domains (id, name, description, created_at, updated_at) VALUES
('DOMN0000000000001', 'Web Development', 'Web applications and services', NOW(), NOW()),
('DOMN0000000000002', 'Mobile Development', 'Mobile applications', NOW(), NOW()),
('DOMN0000000000003', 'Data Analytics', 'Data processing and analytics', NOW(), NOW()),
('DOMN0000000000004', 'DevOps', 'Infrastructure and deployment', NOW(), NOW()),
('DOMN0000000000005', 'AI/ML', 'Artificial Intelligence and Machine Learning', NOW(), NOW());

-- =============================================
-- USERS (Master Table - USER prefix)
-- =============================================
INSERT INTO users (id, email, password_hash, name, role, department_id, domain_id, avatar_url, experience, hourly_rate, availability_percentage, skills, is_active, last_login, created_at, updated_at) VALUES
('USER0000000000001', 'admin@sprintsync.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjxGz7d3x3k9LQkKjYVqjxGz', 'Admin User', 'admin', 'DEPT0000000000001', 'DOMN0000000000001', null, 'senior', 120.00, 100, '["Java", "Spring Boot", "React", "PostgreSQL"]', true, NOW() - INTERVAL '1 day', NOW(), NOW()),
('USER0000000000002', 'pm@sprintsync.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjxGz7d3x3k9LQkKjYVqjxGz', 'Sarah Johnson', 'manager', 'DEPT0000000000002', 'DOMN0000000000001', null, 'senior', 100.00, 100, '["Project Management", "Agile", "Scrum"]', true, NOW() - INTERVAL '2 hours', NOW(), NOW()),
('USER0000000000003', 'dev1@sprintsync.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjxGz7d3x3k9LQkKjYVqjxGz', 'John Smith', 'developer', 'DEPT0000000000001', 'DOMN0000000000001', null, 'senior', 85.00, 100, '["Java", "Spring Boot", "Microservices"]', true, NOW() - INTERVAL '1 hour', NOW(), NOW()),
('USER0000000000004', 'dev2@sprintsync.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjxGz7d3x3k9LQkKjYVqjxGz', 'Emily Davis', 'developer', 'DEPT0000000000001', 'DOMN0000000000002', null, 'mid', 70.00, 100, '["React Native", "JavaScript", "Mobile Development"]', true, NOW() - INTERVAL '30 minutes', NOW(), NOW()),
('USER0000000000005', 'designer@sprintsync.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjxGz7d3x3k9LQkKjYVqjxGz', 'Lisa Wilson', 'designer', 'DEPT0000000000003', 'DOMN0000000000001', null, 'senior', 80.00, 100, '["Figma", "Adobe XD", "UI/UX Design"]', true, NOW() - INTERVAL '45 minutes', NOW(), NOW()),
('USER0000000000006', 'qa@sprintsync.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKyVqjxGz7d3x3k9LQkKjYVqjxGz', 'David Lee', 'developer', 'DEPT0000000000004', 'DOMN0000000000001', null, 'mid', 65.00, 100, '["Selenium", "Jest", "Manual Testing"]', true, NOW() - INTERVAL '15 minutes', NOW(), NOW());

-- =============================================
-- PROJECTS (Master Table - PROJ prefix)
-- =============================================
INSERT INTO projects (id, name, description, status, priority, methodology, template, department_id, manager_id, start_date, end_date, budget, spent, progress_percentage, scope, success_criteria, objectives, is_active, created_at, updated_at) VALUES
('PROJ0000000000001', 'E-commerce Platform', 'Modern e-commerce platform with microservices architecture', 'active', 'high', 'scrum', 'web-app', 'DEPT0000000000001', 'USER0000000000002', '2024-01-01', '2024-12-31', 500000.00, 125000.00, 25, 'Full implementation of e-commerce platform', '["User satisfaction > 90%", "Performance targets met", "Security requirements satisfied"]', '["Deliver on time", "Meet quality standards", "Stay within budget"]', true, NOW(), NOW()),
('PROJ0000000000002', 'Mobile Banking App', 'Secure mobile banking application', 'active', 'critical', 'kanban', 'mobile-app', 'DEPT0000000000001', 'USER0000000000002', '2024-02-01', '2024-08-31', 300000.00, 50000.00, 15, 'Complete mobile banking solution', '["Security compliance", "User adoption > 80%", "Performance benchmarks met"]', '["Secure implementation", "User-friendly interface", "Regulatory compliance"]', true, NOW(), NOW()),
('PROJ0000000000003', 'Data Analytics Platform', 'Enterprise data analytics and reporting platform', 'planning', 'medium', 'waterfall', 'data-analytics', 'DEPT0000000000001', 'USER0000000000002', '2024-06-01', '2025-02-28', 750000.00, 0.00, 0, 'Comprehensive data analytics solution', '["Data accuracy > 99%", "Real-time processing", "Scalable architecture"]', '["Accurate insights", "High performance", "Easy maintenance"]', true, NOW(), NOW());

-- =============================================
-- PROJECT TEAM MEMBERS (Transaction Table - PTMB prefix + UUID)
-- =============================================
INSERT INTO project_team_members (id, project_id, user_id, role, is_team_lead, allocation_percentage, joined_at, left_at, created_at) VALUES
('PTMB550e8400e29b41d4a716446655440001', 'PROJ0000000000001', 'USER0000000000002', 'Product Manager', true, 100, '2024-01-01', null, NOW()),
('PTMB550e8400e29b41d4a716446655440002', 'PROJ0000000000001', 'USER0000000000003', 'Lead Developer', true, 100, '2024-01-01', null, NOW()),
('PTMB550e8400e29b41d4a716446655440003', 'PROJ0000000000001', 'USER0000000000005', 'UI/UX Designer', false, 80, '2024-01-15', null, NOW()),
('PTMB550e8400e29b41d4a716446655440004', 'PROJ0000000000001', 'USER0000000000006', 'QA Engineer', false, 60, '2024-01-20', null, NOW()),
('PTMB550e8400e29b41d4a716446655440005', 'PROJ0000000000002', 'USER0000000000002', 'Product Manager', true, 100, '2024-02-01', null, NOW()),
('PTMB550e8400e29b41d4a716446655440006', 'PROJ0000000000002', 'USER0000000000004', 'Mobile Developer', true, 100, '2024-02-01', null, NOW());

-- =============================================
-- SPRINTS (Transaction Table - SPNT prefix + UUID)
-- =============================================
INSERT INTO sprints (id, project_id, name, goal, status, start_date, end_date, capacity_hours, velocity_points, is_active, created_at, updated_at) VALUES
('SPNT660e8400e29b41d4a716446655440001', 'PROJ0000000000001', 'Sprint 1 - Authentication', 'Complete user authentication system implementation', 'active', '2024-01-15', '2024-01-29', 160, 21, true, NOW(), NOW()),
('SPNT660e8400e29b41d4a716446655440002', 'PROJ0000000000001', 'Sprint 2 - Payment Gateway', 'Implement payment processing functionality', 'planning', '2024-01-30', '2024-02-13', 160, 34, true, NOW(), NOW()),
('SPNT660e8400e29b41d4a716446655440003', 'PROJ0000000000002', 'Sprint 1 - Mobile Auth', 'Implement mobile authentication system', 'completed', '2024-02-01', '2024-02-15', 120, 21, true, NOW(), NOW());

-- =============================================
-- EPICS (Master Table - EPIC prefix)
-- =============================================
INSERT INTO epics (id, project_id, title, description, summary, priority, status, assignee_id, owner, start_date, end_date, progress, story_points, completed_story_points, linked_milestones, linked_stories, labels, components, theme, business_value, acceptance_criteria, risks, dependencies, created_at, updated_at, completed_at) VALUES
('EPIC0000000000001', 'PROJ0000000000001', 'User Authentication System', 'Complete user authentication and authorization system', 'Implement secure user login, registration, and role-based access control', 'high', 'in-progress', 'USER0000000000003', 'USER0000000000001', '2024-01-15', '2024-03-15', 50, 21, 10, '[]', '[]', '["high", "in-progress"]', '["Authentication", "Authorization"]', 'Security', 'Critical for platform security and user management', '["All acceptance criteria met", "Code reviewed and approved", "Tests passing"]', '["Security vulnerabilities", "Performance impact"]', '["External auth service", "Database schema"]', NOW(), NOW(), null),
('EPIC0000000000002', 'PROJ0000000000001', 'Payment Processing', 'Secure payment processing system', 'Implement multiple payment gateways and secure transaction handling', 'critical', 'planning', 'USER0000000000004', 'USER0000000000002', '2024-03-01', '2024-05-01', 10, 34, 3, '[]', '[]', '["critical", "planning"]', '["Payment Gateway", "Transaction Processing"]', 'Financial', 'Essential for revenue generation and user experience', '["PCI compliance", "Transaction security", "Multiple payment methods"]', '["PCI compliance requirements", "Third-party dependencies"]', '["Payment gateway APIs", "Security certificates"]', NOW(), NOW(), null),
('EPIC0000000000003', 'PROJ0000000000002', 'Mobile Authentication', 'Biometric and PIN-based authentication for mobile app', 'Implement secure mobile authentication with biometric support', 'critical', 'backlog', 'USER0000000000004', 'USER0000000000002', '2024-04-01', '2024-06-01', 0, 21, 0, '[]', '[]', '["critical", "backlog"]', '["Biometric Auth", "PIN Security"]', 'Mobile', 'Key for mobile user engagement and accessibility', '["Biometric integration", "PIN security", "Device compatibility"]', '["Device compatibility", "Security standards"]', '["Biometric APIs", "Security libraries"]', NOW(), NOW(), null);

-- =============================================
-- RELEASES (Master Table - RELS prefix)
-- =============================================
INSERT INTO releases (id, project_id, name, version, description, status, release_date, target_date, progress, linked_epics, linked_stories, linked_sprints, release_notes, risks, dependencies, created_by, created_at, updated_at, completed_at) VALUES
('RELS0000000000001', 'PROJ0000000000001', 'E-commerce Platform v1.0', '1.0.0', 'Initial release with core e-commerce functionality', 'development', '2024-06-01', '2024-06-15', 30, '["EPIC0000000000001", "EPIC0000000000002"]', '[]', '[]', 'Initial release with user authentication and basic e-commerce features', '["Technical risks", "Resource constraints", "Timeline dependencies"]', '["External API dependencies", "Third-party service dependencies"]', 'USER0000000000001', NOW(), NOW(), null),
('RELS0000000000002', 'PROJ0000000000002', 'Mobile Banking v1.0', '1.0.0', 'Initial mobile banking application release', 'testing', '2024-05-01', '2024-05-15', 60, '["EPIC0000000000003"]', '[]', '[]', 'Initial mobile banking release with authentication and basic banking features', '["Security compliance", "Device compatibility", "Performance optimization"]', '["Banking APIs", "Security certificates"]', 'USER0000000000001', NOW(), NOW(), null),
('RELS0000000000003', 'PROJ0000000000003', 'Data Platform v1.0', '1.0.0', 'Initial data analytics platform release', 'planning', '2024-12-01', '2024-12-15', 10, '[]', '[]', '[]', 'Initial data analytics platform with basic reporting capabilities', '["Data quality", "Performance at scale", "Integration complexity"]', '["Data sources", "Analytics tools"]', 'USER0000000000001', NOW(), NOW(), null);

-- =============================================
-- QUALITY GATES (Transaction Table - QLTY prefix + UUID)
-- =============================================
INSERT INTO quality_gates (id, release_id, name, description, status, required, completed_at, created_at) VALUES
('QLTY770e8400e29b41d4a716446655440001', 'RELS0000000000001', 'Security Testing', 'Comprehensive security testing and vulnerability assessment', 'pending', true, null, NOW()),
('QLTY770e8400e29b41d4a716446655440002', 'RELS0000000000001', 'Performance Testing', 'Load testing and performance benchmarking', 'pending', true, null, NOW()),
('QLTY770e8400e29b41d4a716446655440003', 'RELS0000000000001', 'User Acceptance Testing', 'End-to-end user acceptance testing', 'pending', true, null, NOW()),
('QLTY770e8400e29b41d4a716446655440004', 'RELS0000000000001', 'Code Quality Review', 'Static code analysis and code review', 'pending', false, null, NOW()),
('QLTY770e8400e29b41d4a716446655440005', 'RELS0000000000002', 'Mobile Security Testing', 'Mobile-specific security testing', 'passed', true, NOW(), NOW()),
('QLTY770e8400e29b41d4a716446655440006', 'RELS0000000000002', 'Device Compatibility Testing', 'Testing across different mobile devices', 'pending', true, null, NOW()),
('QLTY770e8400e29b41d4a716446655440007', 'RELS0000000000002', 'Performance Testing', 'Mobile app performance testing', 'pending', true, null, NOW());

-- =============================================
-- STORIES (Transaction Table - STRY prefix + UUID)
-- =============================================
INSERT INTO stories (id, project_id, sprint_id, epic_id, release_id, title, description, acceptance_criteria, status, priority, story_points, assignee_id, reporter_id, labels, order_index, estimated_hours, actual_hours, created_at, updated_at) VALUES
('STRY880e8400e29b41d4a716446655440001', 'PROJ0000000000001', 'SPNT660e8400e29b41d4a716446655440001', 'EPIC0000000000001', 'RELS0000000000001', 'User Login', 'As a user, I want to log in to the system', '["User can enter credentials", "System validates credentials", "User is redirected to dashboard"]', 'in_progress', 'high', 5, 'USER0000000000003', 'USER0000000000002', '["authentication", "login"]', 1, 8.0, 4.0, NOW(), NOW()),
('STRY880e8400e29b41d4a716446655440002', 'PROJ0000000000001', 'SPNT660e8400e29b41d4a716446655440001', 'EPIC0000000000001', 'RELS0000000000001', 'User Registration', 'As a new user, I want to create an account', '["User can enter details", "Email verification sent", "Account is activated"]', 'to_do', 'high', 8, 'USER0000000000003', 'USER0000000000002', '["authentication", "registration"]', 2, 12.0, 0.0, NOW(), NOW()),
('STRY880e8400e29b41d4a716446655440003', 'PROJ0000000000002', 'SPNT660e8400e29b41d4a716446655440003', 'EPIC0000000000003', 'RELS0000000000002', 'Biometric Login', 'As a mobile user, I want to login using biometric authentication', '["Biometric sensor works", "Fallback to PIN available", "Secure token generation"]', 'done', 'critical', 13, 'USER0000000000004', 'USER0000000000002', '["mobile", "biometric", "security"]', 1, 20.0, 18.0, NOW(), NOW());

-- =============================================
-- TASKS (Transaction Table - TASK prefix + UUID)
-- =============================================
INSERT INTO tasks (id, story_id, title, description, status, priority, assignee_id, reporter_id, estimated_hours, actual_hours, order_index, due_date, labels, created_at, updated_at) VALUES
('TASK990e8400e29b41d4a716446655440001', 'STRY880e8400e29b41d4a716446655440001', 'Implement Login API', 'Create REST API for user login functionality', 'in_progress', 'high', 'USER0000000000003', 'USER0000000000002', 6.0, 3.0, 1, '2024-01-25', '["api", "login", "backend"]', NOW(), NOW()),
('TASK990e8400e29b41d4a716446655440002', 'STRY880e8400e29b41d4a716446655440001', 'Create Login UI', 'Design and implement login form', 'to_do', 'medium', 'USER0000000000005', 'USER0000000000002', 4.0, 0.0, 2, '2024-01-27', '["ui", "login", "frontend"]', NOW(), NOW()),
('TASK990e8400e29b41d4a716446655440003', 'STRY880e8400e29b41d4a716446655440003', 'Integrate Biometric SDK', 'Integrate mobile biometric authentication SDK', 'done', 'critical', 'USER0000000000004', 'USER0000000000002', 12.0, 10.0, 1, '2024-02-10', '["mobile", "biometric", "sdk"]', NOW(), NOW());

-- =============================================
-- SUBTASKS (Transaction Table - SUBT prefix + UUID)
-- =============================================
INSERT INTO subtasks (id, task_id, title, description, is_completed, assignee_id, estimated_hours, actual_hours, order_index, due_date, bug_type, severity, created_at, updated_at) VALUES
('SUBTaa0e8400e29b41d4a716446655440001', 'TASK990e8400e29b41d4a716446655440001', 'Create Login Controller', 'Implement Spring Boot controller for login endpoint', false, 'USER0000000000003', 2.0, 1.5, 1, '2024-01-22', null, null, NOW(), NOW()),
('SUBTaa0e8400e29b41d4a716446655440002', 'TASK990e8400e29b41d4a716446655440001', 'Add Password Validation', 'Implement password hashing and validation logic', false, 'USER0000000000003', 2.0, 1.0, 2, '2024-01-23', null, null, NOW(), NOW()),
('SUBTaa0e8400e29b41d4a716446655440003', 'TASK990e8400e29b41d4a716446655440001', 'Write Unit Tests', 'Create comprehensive unit tests for login functionality', false, 'USER0000000000006', 2.0, 0.5, 3, '2024-01-24', null, null, NOW(), NOW()),
('SUBTaa0e8400e29b41d4a716446655440004', 'TASK990e8400e29b41d4a716446655440003', 'Setup Biometric SDK', 'Configure biometric authentication SDK for iOS/Android', true, 'USER0000000000004', 4.0, 4.0, 1, '2024-02-05', null, null, NOW(), NOW()),
('SUBTaa0e8400e29b41d4a716446655440005', 'TASK990e8400e29b41d4a716446655440003', 'Implement Biometric Flow', 'Create biometric authentication user flow', true, 'USER0000000000004', 6.0, 5.0, 2, '2024-02-08', null, null, NOW(), NOW()),
('SUBTaa0e8400e29b41d4a716446655440006', 'TASK990e8400e29b41d4a716446655440003', 'Fix Biometric Bug', 'Resolve biometric authentication edge case', true, 'USER0000000000004', 2.0, 1.0, 3, '2024-02-12', 'authentication', 'medium', NOW(), NOW());

-- =============================================
-- TIME ENTRIES (Transaction Table - TIME prefix + UUID)
-- =============================================
INSERT INTO time_entries (id, user_id, project_id, story_id, task_id, subtask_id, description, entry_type, hours_worked, work_date, start_time, end_time, is_billable, created_at, updated_at) VALUES
('TIMEbb0e8400e29b41d4a716446655440001', 'USER0000000000003', 'PROJ0000000000001', 'STRY880e8400e29b41d4a716446655440001', 'TASK990e8400e29b41d4a716446655440001', 'SUBTaa0e8400e29b41d4a716446655440001', 'Implemented login controller with basic validation', 'development', 1.5, '2024-01-20', '09:00:00', '10:30:00', true, NOW(), NOW()),
('TIMEbb0e8400e29b41d4a716446655440002', 'USER0000000000003', 'PROJ0000000000001', 'STRY880e8400e29b41d4a716446655440001', 'TASK990e8400e29b41d4a716446655440001', 'SUBTaa0e8400e29b41d4a716446655440002', 'Added password hashing using BCrypt', 'development', 1.0, '2024-01-21', '09:00:00', '10:00:00', true, NOW(), NOW()),
('TIMEbb0e8400e29b41d4a716446655440003', 'USER0000000000004', 'PROJ0000000000002', 'STRY880e8400e29b41d4a716446655440003', 'TASK990e8400e29b41d4a716446655440003', 'SUBTaa0e8400e29b41d4a716446655440004', 'Configured biometric SDK for both iOS and Android platforms', 'development', 4.0, '2024-02-10', '08:00:00', '12:00:00', true, NOW(), NOW()),
('TIMEbb0e8400e29b41d4a716446655440004', 'USER0000000000004', 'PROJ0000000000002', 'STRY880e8400e29b41d4a716446655440003', 'TASK990e8400e29b41d4a716446655440003', 'SUBTaa0e8400e29b41d4a716446655440005', 'Implemented complete biometric authentication flow', 'development', 5.0, '2024-02-12', '08:00:00', '13:00:00', true, NOW(), NOW()),
('TIMEbb0e8400e29b41d4a716446655440005', 'USER0000000000006', 'PROJ0000000000001', 'STRY880e8400e29b41d4a716446655440001', 'TASK990e8400e29b41d4a716446655440001', 'SUBTaa0e8400e29b41d4a716446655440003', 'Created unit tests for login validation logic', 'testing', 0.5, '2024-01-22', '14:00:00', '14:30:00', true, NOW(), NOW());

-- =============================================
-- MILESTONES (Master Table - MILE prefix)
-- =============================================
INSERT INTO milestones (id, project_id, title, description, status, due_date, completion_date, progress_percentage, created_at, updated_at) VALUES
('MILE0000000000001', 'PROJ0000000000001', 'Authentication Complete', 'Complete implementation of user authentication system', 'in_progress', '2024-03-15', null, 60, NOW(), NOW()),
('MILE0000000000002', 'PROJ0000000000001', 'Payment Integration', 'Complete payment gateway integration', 'upcoming', '2024-05-01', null, 0, NOW(), NOW()),
('MILE0000000000003', 'PROJ0000000000002', 'Mobile MVP', 'Complete mobile banking MVP', 'completed', '2024-02-15', '2024-02-14', 100, NOW(), NOW());

-- =============================================
-- NOTIFICATIONS (Transaction Table - NOTF prefix + UUID)
-- =============================================
INSERT INTO notifications (id, user_id, type, priority, title, message, related_entity_type, related_entity_id, action_url, is_read, is_archived, expires_at, created_at) VALUES
('NOTFcc0e8400e29b41d4a716446655440001', 'USER0000000000003', 'task', 'normal', 'Task Assigned', 'You have been assigned to "Implement Login API" task', 'task', 'TASK990e8400e29b41d4a716446655440001', '/tasks/TASK990e8400e29b41d4a716446655440001', false, false, null, NOW()),
('NOTFcc0e8400e29b41d4a716446655440002', 'USER0000000000004', 'project', 'low', 'Epic Status Update', 'Epic "Mobile Authentication" has been moved to In Progress', 'epic', 'EPIC0000000000003', '/epics/EPIC0000000000003', true, false, null, NOW() - INTERVAL '2 hours'),
('NOTFcc0e8400e29b41d4a716446655440003', 'USER0000000000002', 'system', 'high', 'Sprint Review', 'Sprint 1 - Authentication is ready for review', 'sprint', 'SPNT660e8400e29b41d4a716446655440001', '/sprints/SPNT660e8400e29b41d4a716446655440001', false, false, null, NOW() - INTERVAL '1 hour');

-- =============================================
-- COMMENTS (Transaction Table - COMM prefix + UUID)
-- =============================================
INSERT INTO comments (id, user_id, entity_type, entity_id, content, parent_comment_id, is_edited, edited_at, created_at, updated_at) VALUES
('COMMdd0e8400e29b41d4a716446655440001', 'USER0000000000003', 'task', 'TASK990e8400e29b41d4a716446655440001', 'Started working on the login API. Basic structure is in place.', null, false, null, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('COMMdd0e8400e29b41d4a716446655440002', 'USER0000000000002', 'task', 'TASK990e8400e29b41d4a716446655440001', 'Great progress! Make sure to add proper error handling.', null, false, null, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),
('COMMdd0e8400e29b41d4a716446655440003', 'USER0000000000004', 'story', 'STRY880e8400e29b41d4a716446655440003', 'Biometric authentication is working perfectly on both iOS and Android!', null, false, null, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes');

-- =============================================
-- TODOS (Transaction Table - TODO prefix + UUID)
-- =============================================
INSERT INTO todos (id, user_id, title, description, priority, status, due_date, reminder_date, tags, related_project_id, related_story_id, related_task_id, order_index, completed_at, created_at, updated_at) VALUES
('TODOee0e8400e29b41d4a716446655440001', 'USER0000000000003', 'Review Login API Code', 'Review the login API implementation for security best practices', 'high', 'pending', '2024-01-25', null, '["code-review", "security"]', 'PROJ0000000000001', 'STRY880e8400e29b41d4a716446655440001', 'TASK990e8400e29b41d4a716446655440001', 1, null, NOW(), NOW()),
('TODOee0e8400e29b41d4a716446655440002', 'USER0000000000004', 'Test Biometric on Different Devices', 'Test biometric authentication on various mobile devices', 'medium', 'in_progress', '2024-02-20', null, '["testing", "mobile"]', 'PROJ0000000000002', 'STRY880e8400e29b41d4a716446655440003', 'TASK990e8400e29b41d4a716446655440003', 1, null, NOW(), NOW()),
('TODOee0e8400e29b41d4a716446655440003', 'USER0000000000002', 'Plan Sprint 2', 'Plan the next sprint focusing on payment processing', 'high', 'pending', '2024-01-30', null, '["planning", "sprint"]', 'PROJ0000000000001', null, null, 1, null, NOW(), NOW()),
('TODOee0e8400e29b41d4a716446655440004', 'USER0000000000005', 'Create Design System', 'Create a comprehensive design system for the e-commerce platform', 'medium', 'completed', '2024-01-15', null, '["design", "ui"]', 'PROJ0000000000001', null, null, 1, '2024-01-14', NOW(), NOW());

COMMIT;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================
SELECT 'Departments' as table_name, COUNT(*) as record_count FROM departments
UNION ALL
SELECT 'Domains', COUNT(*) FROM domains
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Projects', COUNT(*) FROM projects
UNION ALL
SELECT 'Project Team Members', COUNT(*) FROM project_team_members
UNION ALL
SELECT 'Sprints', COUNT(*) FROM sprints
UNION ALL
SELECT 'Epics', COUNT(*) FROM epics
UNION ALL
SELECT 'Releases', COUNT(*) FROM releases
UNION ALL
SELECT 'Quality Gates', COUNT(*) FROM quality_gates
UNION ALL
SELECT 'Stories', COUNT(*) FROM stories
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Subtasks', COUNT(*) FROM subtasks
UNION ALL
SELECT 'Time Entries', COUNT(*) FROM time_entries
UNION ALL
SELECT 'Milestones', COUNT(*) FROM milestones
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Comments', COUNT(*) FROM comments
UNION ALL
SELECT 'Todos', COUNT(*) FROM todos
ORDER BY table_name;
