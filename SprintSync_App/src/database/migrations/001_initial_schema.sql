-- Migration 001: Initial SprintSync Schema
-- Created: 2024-03-22
-- Description: Initial database schema with all core tables and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schema
CREATE SCHEMA IF NOT EXISTS sprintsync;

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'manager', 'developer', 'designer');
CREATE TYPE experience_level AS ENUM ('junior', 'mid', 'senior', 'lead');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE project_methodology AS ENUM ('scrum', 'kanban', 'waterfall');
CREATE TYPE project_template AS ENUM ('web-app', 'mobile-app', 'api-service', 'data-analytics');
CREATE TYPE sprint_status AS ENUM ('planning', 'active', 'completed', 'cancelled');
CREATE TYPE story_status AS ENUM ('backlog', 'to_do', 'in_progress', 'qa_review', 'done');
CREATE TYPE story_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE task_status AS ENUM ('to_do', 'in_progress', 'qa_review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE milestone_status AS ENUM ('upcoming', 'in_progress', 'completed', 'delayed');
CREATE TYPE requirement_type AS ENUM ('functional', 'non-functional', 'technical');
CREATE TYPE requirement_status AS ENUM ('draft', 'approved', 'in-development', 'completed');
CREATE TYPE time_entry_type AS ENUM ('development', 'testing', 'design', 'meeting', 'research', 'documentation', 'review');
CREATE TYPE risk_probability AS ENUM ('low', 'medium', 'high');
CREATE TYPE risk_impact AS ENUM ('low', 'medium', 'high');
CREATE TYPE risk_status AS ENUM ('identified', 'mitigated', 'closed');
CREATE TYPE integration_type AS ENUM ('version_control', 'communication', 'storage', 'project_management', 'documentation');
CREATE TYPE notification_type AS ENUM ('system', 'project', 'task', 'mention', 'reminder', 'ai_insight');
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE ai_insight_type AS ENUM ('productivity', 'risk_assessment', 'resource_optimization', 'timeline_prediction', 'quality_metrics');
CREATE TYPE report_type AS ENUM ('sprint_burndown', 'velocity_chart', 'team_productivity', 'project_overview', 'time_analysis', 'custom');
CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE todo_status AS ENUM ('pending', 'in_progress', 'completed');

-- =============================================
-- CORE TABLES
-- =============================================

-- Departments
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domains
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department_id UUID REFERENCES departments(id),
    domain_id UUID REFERENCES domains(id),
    avatar_url TEXT,
    experience experience_level DEFAULT 'mid',
    hourly_rate DECIMAL(10,2),
    availability_percentage INTEGER DEFAULT 100 CHECK (availability_percentage >= 0 AND availability_percentage <= 100),
    skills JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    priority project_priority DEFAULT 'medium',
    methodology project_methodology DEFAULT 'scrum',
    template project_template,
    department_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES users(id),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(15,2),
    spent DECIMAL(15,2) DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    scope TEXT,
    success_criteria JSONB DEFAULT '[]',
    objectives JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Team Members
CREATE TABLE project_team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100),
    is_team_lead BOOLEAN DEFAULT false,
    allocation_percentage INTEGER DEFAULT 100 CHECK (allocation_percentage >= 0 AND allocation_percentage <= 100),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Sprints
CREATE TABLE sprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    status sprint_status DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    capacity_hours INTEGER,
    velocity_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    acceptance_criteria JSONB DEFAULT '[]',
    status story_status DEFAULT 'backlog',
    priority story_priority DEFAULT 'medium',
    story_points INTEGER CHECK (story_points >= 0),
    assignee_id UUID REFERENCES users(id),
    reporter_id UUID REFERENCES users(id),
    epic VARCHAR(255),
    labels JSONB DEFAULT '[]',
    order_index INTEGER DEFAULT 0,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'to_do',
    priority task_priority DEFAULT 'medium',
    assignee_id UUID REFERENCES users(id),
    reporter_id UUID REFERENCES users(id),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    due_date DATE,
    labels JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subtasks
CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT false,
    assignee_id UUID REFERENCES users(id),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    due_date DATE,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status milestone_status DEFAULT 'upcoming',
    due_date DATE,
    completion_date DATE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Requirements
CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type requirement_type,
    status requirement_status DEFAULT 'draft',
    priority project_priority DEFAULT 'medium',
    module VARCHAR(100),
    acceptance_criteria JSONB DEFAULT '[]',
    effort_points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time Entries
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    subtask_id UUID REFERENCES subtasks(id) ON DELETE SET NULL,
    description TEXT,
    entry_type time_entry_type DEFAULT 'development',
    hours_worked DECIMAL(5,2) NOT NULL CHECK (hours_worked > 0),
    work_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_billable BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stakeholders
CREATE TABLE stakeholders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(255),
    responsibilities JSONB DEFAULT '[]',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risks
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    probability risk_probability DEFAULT 'medium',
    impact risk_impact DEFAULT 'medium',
    mitigation TEXT,
    status risk_status DEFAULT 'identified',
    owner_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Available Integrations
CREATE TABLE available_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type integration_type,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Integrations
CREATE TABLE project_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES available_integrations(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, integration_id)
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type DEFAULT 'system',
    priority notification_priority DEFAULT 'normal',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Insights
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type ai_insight_type,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    metrics JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    is_active BOOLEAN DEFAULT true,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type report_type,
    description TEXT,
    configuration JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    is_shared BOOLEAN DEFAULT false,
    scheduled_frequency VARCHAR(20),
    last_generated TIMESTAMP WITH TIME ZONE,
    next_generation TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Todos
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority todo_priority DEFAULT 'medium',
    status todo_status DEFAULT 'pending',
    due_date DATE,
    reminder_date TIMESTAMP WITH TIME ZONE,
    tags JSONB DEFAULT '[]',
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    related_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    order_index INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_domain ON users(domain_id);
CREATE INDEX idx_users_active ON users(is_active);

-- Project indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_projects_department ON projects(department_id);
CREATE INDEX idx_projects_active ON projects(is_active);

-- Team member indexes
CREATE INDEX idx_project_team_project ON project_team_members(project_id);
CREATE INDEX idx_project_team_user ON project_team_members(user_id);

-- Sprint indexes
CREATE INDEX idx_sprints_project ON sprints(project_id);
CREATE INDEX idx_sprints_status ON sprints(status);
CREATE INDEX idx_sprints_active ON sprints(is_active);

-- Story indexes
CREATE INDEX idx_stories_project ON stories(project_id);
CREATE INDEX idx_stories_sprint ON stories(sprint_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_assignee ON stories(assignee_id);

-- Task indexes
CREATE INDEX idx_tasks_story ON tasks(story_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);

-- Subtask indexes
CREATE INDEX idx_subtasks_task ON subtasks(task_id);
CREATE INDEX idx_subtasks_assignee ON subtasks(assignee_id);

-- Time entry indexes
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_time_entries_date ON time_entries(work_date);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Comment indexes
CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_user ON comments(user_id);

-- Activity log indexes
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON sprints FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON requirements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON stakeholders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_integrations_updated_at BEFORE UPDATE ON project_integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update project progress
CREATE OR REPLACE FUNCTION update_project_progress()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE projects 
    SET progress_percentage = (
        SELECT CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND(COUNT(*) FILTER (WHERE status = 'done') * 100.0 / COUNT(*))
        END
        FROM stories 
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update project progress when stories change
CREATE TRIGGER update_project_progress_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON stories 
    FOR EACH ROW EXECUTE FUNCTION update_project_progress();

-- =============================================
-- VIEWS
-- =============================================

-- Project team details view
CREATE VIEW project_team_details AS
SELECT 
    ptm.*,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role,
    u.experience,
    u.avatar_url,
    d.name as department_name,
    dom.name as domain_name
FROM project_team_members ptm
JOIN users u ON ptm.user_id = u.id
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN domains dom ON u.domain_id = dom.id
WHERE ptm.left_at IS NULL;

-- Sprint burndown view
CREATE VIEW sprint_burndown AS
SELECT 
    s.id as sprint_id,
    s.name as sprint_name,
    s.start_date,
    s.end_date,
    COUNT(st.id) as total_stories,
    COUNT(st.id) FILTER (WHERE st.status = 'done') as completed_stories,
    SUM(st.story_points) as total_points,
    SUM(st.story_points) FILTER (WHERE st.status = 'done') as completed_points
FROM sprints s
LEFT JOIN stories st ON s.id = st.sprint_id
GROUP BY s.id, s.name, s.start_date, s.end_date;

-- User workload view
CREATE VIEW user_workload AS
SELECT 
    u.id as user_id,
    u.name,
    u.role,
    COUNT(DISTINCT ptm.project_id) as active_projects,
    COUNT(DISTINCT st.id) as assigned_stories,
    COUNT(DISTINCT t.id) as assigned_tasks,
    SUM(te.hours_worked) as total_hours_this_month
FROM users u
LEFT JOIN project_team_members ptm ON u.id = ptm.user_id AND ptm.left_at IS NULL
LEFT JOIN stories st ON u.id = st.assignee_id AND st.status != 'done'
LEFT JOIN tasks t ON u.id = t.assignee_id AND t.status != 'done'
LEFT JOIN time_entries te ON u.id = te.user_id AND te.work_date >= DATE_TRUNC('month', CURRENT_DATE)
WHERE u.is_active = true
GROUP BY u.id, u.name, u.role;

-- Project health view
CREATE VIEW project_health AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.status,
    p.progress_percentage,
    COUNT(DISTINCT s.id) as total_sprints,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') as completed_sprints,
    COUNT(DISTINCT st.id) as total_stories,
    COUNT(DISTINCT st.id) FILTER (WHERE st.status = 'done') as completed_stories,
    AVG(CASE WHEN s.status = 'completed' THEN s.velocity_points END) as avg_velocity,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'identified') as open_risks
FROM projects p
LEFT JOIN sprints s ON p.id = s.project_id
LEFT JOIN stories st ON p.id = st.project_id
LEFT JOIN risks r ON p.id = r.project_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.status, p.progress_percentage;

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON DATABASE sprintsync IS 'SprintSync - Comprehensive Agile Project Management Database';
COMMENT ON TABLE users IS 'Application users with role-based access control';
COMMENT ON TABLE projects IS 'Main project entities with agile methodology support';
COMMENT ON TABLE sprints IS 'Sprint/iteration management for agile development';
COMMENT ON TABLE stories IS 'User stories within projects and sprints';
COMMENT ON TABLE tasks IS 'Tasks within user stories';
COMMENT ON TABLE time_entries IS 'Time tracking for productivity monitoring';
COMMENT ON TABLE ai_insights IS 'AI-generated insights and recommendations';
COMMENT ON TABLE notifications IS 'Real-time notification system';
COMMENT ON TABLE activity_logs IS 'Audit trail for all system changes';