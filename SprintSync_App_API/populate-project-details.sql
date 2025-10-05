-- Populate project details for PROJ0000000000003 (Data Analytics Platform)

-- Add milestones for the project
INSERT INTO milestones (project_id, title, description, due_date, status, progress_percentage) VALUES
('PROJ0000000000003', 'Data Architecture Design', 'Design the overall data architecture and schema', '2024-07-15', 'completed', 100),
('PROJ0000000000003', 'Core Analytics Engine', 'Develop the main analytics processing engine', '2024-08-30', 'in-progress', 75),
('PROJ0000000000003', 'Dashboard Development', 'Build interactive dashboards and visualization components', '2024-10-15', 'upcoming', 25),
('PROJ0000000000003', 'API Integration', 'Integrate with external data sources and APIs', '2024-09-30', 'upcoming', 10),
('PROJ0000000000003', 'Performance Optimization', 'Optimize system performance and scalability', '2024-11-30', 'upcoming', 0),
('PROJ0000000000003', 'Security Implementation', 'Implement security measures and compliance features', '2024-12-15', 'upcoming', 0);

-- Add requirements for the project
INSERT INTO requirements (project_id, title, description, type, status, priority, module, acceptance_criteria, effort_points) VALUES
('PROJ0000000000003', 'User Authentication System', 'Implement secure user authentication with JWT tokens and role-based access control', 'functional', 'completed', 'high', 'Security', '["User can login with email/password", "JWT tokens are generated", "Role-based access control works"]', 8),
('PROJ0000000000003', 'Data Visualization Dashboard', 'Create interactive charts and graphs for data analytics and reporting', 'functional', 'in-development', 'high', 'UI/UX', '["Dashboard displays real-time data", "Charts are interactive", "Multiple chart types supported"]', 13),
('PROJ0000000000003', 'Real-time Data Processing', 'Implement streaming data processing for real-time analytics', 'technical', 'pending', 'medium', 'Backend', '["Data is processed in real-time", "Streaming pipeline handles high volume", "Low latency processing"]', 21),
('PROJ0000000000003', 'Database Optimization', 'Optimize database queries and implement caching for better performance', 'non-functional', 'pending', 'medium', 'Performance', '["Query response time < 100ms", "Caching reduces DB load", "Database scales horizontally"]', 5),
('PROJ0000000000003', 'API Documentation', 'Create comprehensive API documentation with examples', 'functional', 'pending', 'low', 'Documentation', '["All endpoints documented", "Examples provided", "Interactive API explorer"]', 3);

-- Add stakeholders for the project
INSERT INTO stakeholders (project_id, name, role, email, responsibilities, avatar_url) VALUES
('PROJ0000000000003', 'Dr. Rajesh Kumar', 'Project Sponsor', 'rajesh.kumar@company.com', '["Project funding approval", "Strategic direction", "Stakeholder communication"]', null),
('PROJ0000000000003', 'Priya Sharma', 'Business Analyst', 'priya.sharma@company.com', '["Requirements gathering", "User story creation", "Acceptance criteria definition"]', null),
('PROJ0000000000003', 'Amit Patel', 'Data Scientist', 'amit.patel@company.com', '["Data analysis", "Algorithm design", "ML model development"]', null),
('PROJ0000000000003', 'Neha Singh', 'Quality Assurance Lead', 'neha.singh@company.com', '["Test planning", "Quality assurance", "Bug tracking"]', null),
('PROJ0000000000003', 'Vikram Joshi', 'DevOps Engineer', 'vikram.joshi@company.com', '["Infrastructure setup", "CI/CD pipeline", "Deployment automation"]', null);

-- Add risks for the project
INSERT INTO risks (project_id, title, description, probability, impact, mitigation, status, owner_id) VALUES
('PROJ0000000000003', 'Data Privacy Compliance', 'Risk of non-compliance with GDPR and local data protection regulations', 'medium', 'high', 'Implement data encryption, audit trails, and privacy controls. Conduct regular compliance reviews.', 'identified', 'USER0000000000002'),
('PROJ0000000000003', 'Third-party API Dependencies', 'Reliance on external APIs for data sources may cause service disruptions', 'high', 'medium', 'Implement fallback mechanisms and alternative data sources. Monitor API health and set up alerts.', 'identified', 'USER0000000000003'),
('PROJ0000000000003', 'Scalability Challenges', 'System may not handle increased data volume as business grows', 'medium', 'high', 'Design for horizontal scaling, implement caching strategies, and conduct load testing.', 'identified', 'USER0000000000005'),
('PROJ0000000000003', 'Technical Skill Gap', 'Team may lack expertise in advanced analytics technologies', 'low', 'medium', 'Provide training sessions and hire external consultants for specialized knowledge.', 'mitigated', 'USER0000000000002'),
('PROJ0000000000003', 'Performance Bottlenecks', 'Large datasets may cause performance issues in analytics processing', 'medium', 'medium', 'Implement data partitioning, indexing strategies, and query optimization techniques.', 'identified', 'USER0000000000003');

-- Add project integrations (link to available integrations)
INSERT INTO project_integrations (project_id, integration_id, is_enabled, configuration) VALUES
('PROJ0000000000003', (SELECT id FROM available_integrations WHERE name = 'GitHub'), true, '{"repository": "company/analytics-platform", "webhook_enabled": true}'),
('PROJ0000000000003', (SELECT id FROM available_integrations WHERE name = 'Slack'), true, '{"channel": "#analytics-project", "notifications_enabled": true}'),
('PROJ0000000000003', (SELECT id FROM available_integrations WHERE name = 'Google Drive'), true, '{"folder_id": "1ABC123DEF456", "sync_enabled": true}'),
('PROJ0000000000003', (SELECT id FROM available_integrations WHERE name = 'Confluence'), false, '{"space_key": "ANALYTICS", "auto_sync": false}'),
('PROJ0000000000003', (SELECT id FROM available_integrations WHERE name = 'Microsoft Teams'), true, '{"team_id": "analytics-team", "channel_id": "general"}');

-- Add more project integrations for other projects to demonstrate the system
INSERT INTO project_integrations (project_id, integration_id, is_enabled, configuration) VALUES
('PROJ0000000000001', (SELECT id FROM available_integrations WHERE name = 'GitHub'), true, '{"repository": "company/ecommerce-platform", "webhook_enabled": true}'),
('PROJ0000000000001', (SELECT id FROM available_integrations WHERE name = 'Slack'), true, '{"channel": "#ecommerce-project", "notifications_enabled": true}'),
('PROJ0000000000002', (SELECT id FROM available_integrations WHERE name = 'GitLab'), true, '{"repository": "company/mobile-app", "ci_enabled": true}'),
('PROJ0000000000002', (SELECT id FROM available_integrations WHERE name = 'Microsoft Teams'), true, '{"team_id": "mobile-team", "channel_id": "development"}');
