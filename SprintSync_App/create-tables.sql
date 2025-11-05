-- SprintSync Database Tables Creation Script
-- Run this script to create all required tables for the SprintSync application
-- Compatible with PostgreSQL 12+

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUMS (Data Types)
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
CREATE TYPE epic_status AS ENUM ('backlog', 'planning', 'in-progress', 'review', 'completed', 'cancelled');
CREATE TYPE release_status AS ENUM ('planning', 'development', 'testing', 'staging', 'ready-for-release', 'released', 'cancelled');
CREATE TYPE quality_gate_status AS ENUM ('pending', 'passed', 'failed');

-- =============================================
-- CORE TABLES
-- =============================================

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domains table
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
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

-- Projects table
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

-- Project team assignments
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

-- Sprints table
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

-- Epics table
CREATE TABLE epics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    summary TEXT,
    priority project_priority DEFAULT 'medium',
    status epic_status DEFAULT 'backlog',
    assignee_id UUID REFERENCES users(id),
    owner UUID REFERENCES users(id) NOT NULL,
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    story_points INTEGER DEFAULT 0,
    completed_story_points INTEGER DEFAULT 0,
    linked_milestones JSONB DEFAULT '[]',
    linked_stories JSONB DEFAULT '[]',
    labels JSONB DEFAULT '[]',
    components JSONB DEFAULT '[]',
    theme VARCHAR(255),
    business_value TEXT,
    acceptance_criteria JSONB DEFAULT '[]',
    risks JSONB DEFAULT '[]',
    dependencies JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Releases table
CREATE TABLE releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    status release_status DEFAULT 'planning',
    release_date DATE,
    target_date DATE,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    linked_epics JSONB DEFAULT '[]',
    linked_stories JSONB DEFAULT '[]',
    linked_sprints JSONB DEFAULT '[]',
    release_notes TEXT,
    risks JSONB DEFAULT '[]',
    dependencies JSONB DEFAULT '[]',
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Quality gates table
CREATE TABLE quality_gates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    release_id UUID REFERENCES releases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status quality_gate_status DEFAULT 'pending',
    required BOOLEAN DEFAULT true,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sprint_id UUID REFERENCES sprints(id) ON DELETE SET NULL,
    epic_id UUID REFERENCES epics(id) ON DELETE SET NULL,
    release_id UUID REFERENCES releases(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    acceptance_criteria JSONB DEFAULT '[]',
    status story_status DEFAULT 'backlog',
    priority story_priority DEFAULT 'medium',
    story_points INTEGER CHECK (story_points >= 0),
    assignee_id UUID REFERENCES users(id),
    reporter_id UUID REFERENCES users(id),
    labels JSONB DEFAULT '[]',
    order_index INTEGER DEFAULT 0,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
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

-- Subtasks table (Simplified for cleaner workflow)
CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT false,              -- Simple completion tracking
    assignee_id UUID REFERENCES users(id),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    due_date DATE,
    bug_type VARCHAR(50),                            -- Bug categorization (functional, ui, performance, security, integration)
    severity VARCHAR(20),                            -- Bug severity (low, medium, high, critical)
    category VARCHAR(50),                            -- Subtask category (Development, Documentation, Idle, Learning, Meeting, Support, Testing, Training)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table
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

-- Requirements table
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

-- Time entries table
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

-- Stakeholders table
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

-- Risks table
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

-- Available integrations table
CREATE TABLE available_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type integration_type,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project integrations table
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

-- Notifications table
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

-- AI insights table
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

-- Reports table
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

-- Todos table
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

-- Comments table
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

-- Attachments table
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

-- Activity logs table
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
-- INDEXES FOR PERFORMANCE
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
CREATE INDEX idx_stories_epic ON stories(epic_id);
CREATE INDEX idx_stories_release ON stories(release_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_assignee ON stories(assignee_id);

-- Task indexes
CREATE INDEX idx_tasks_story ON tasks(story_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);

-- Subtask indexes
CREATE INDEX idx_subtasks_task ON subtasks(task_id);
CREATE INDEX idx_subtasks_assignee ON subtasks(assignee_id);
CREATE INDEX idx_subtasks_completed ON subtasks(is_completed);
CREATE INDEX idx_subtasks_bug_type ON subtasks(bug_type);
CREATE INDEX idx_subtasks_severity ON subtasks(severity);

-- Epic indexes
CREATE INDEX idx_epics_project ON epics(project_id);
CREATE INDEX idx_epics_status ON epics(status);
CREATE INDEX idx_epics_owner ON epics(owner);
CREATE INDEX idx_epics_assignee ON epics(assignee_id);

-- Release indexes
CREATE INDEX idx_releases_project ON releases(project_id);
CREATE INDEX idx_releases_status ON releases(status);
CREATE INDEX idx_releases_created_by ON releases(created_by);
CREATE INDEX idx_releases_target_date ON releases(target_date);

-- Quality gate indexes
CREATE INDEX idx_quality_gates_release ON quality_gates(release_id);
CREATE INDEX idx_quality_gates_status ON quality_gates(status);

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
-- BASIC INITIAL DATA
-- =============================================

-- Insert departments
INSERT INTO departments (name, description) VALUES
('VNIT', 'Technology and Innovation Department'),
('Dinshaw', 'Financial Services Department'),
('Hospy', 'Healthcare Solutions Department'),
('Pharma', 'Pharmaceutical Research Department');

-- Insert domains
INSERT INTO domains (name, description) VALUES
('Angular', 'Frontend Development with Angular Framework'),
('Java', 'Backend Development with Java Technologies'),
('Maui', 'Cross-platform Mobile Development'),
('Testing', 'Quality Assurance and Testing'),
('Implementation', 'System Implementation and Deployment'),
('Database', 'Database Design and Management'),
('Marketing', 'Digital Marketing and Brand Management'),
('HR', 'Human Resources and Talent Management');

-- Insert available integrations
INSERT INTO available_integrations (name, type, description) VALUES
('GitHub', 'version_control', 'Link commits and PRs to tasks'),
('GitLab', 'version_control', 'Repository management and CI/CD'),
('Slack', 'communication', 'Team notifications and updates'),
('Microsoft Teams', 'communication', 'Collaboration and meetings'),
('Google Drive', 'storage', 'Document and file sharing'),
('OneDrive', 'storage', 'Microsoft cloud storage'),
('Jira', 'project_management', 'Issue tracking and project management'),
('Confluence', 'documentation', 'Team documentation and wikis');

-- =============================================
-- TABLE COMMENTS
-- =============================================

COMMENT ON TABLE users IS 'Application users with role-based access control';
COMMENT ON TABLE projects IS 'Main project entities with agile methodology support';
COMMENT ON TABLE sprints IS 'Sprint/iteration management for agile development';
COMMENT ON TABLE stories IS 'User stories within projects and sprints';
COMMENT ON TABLE tasks IS 'Tasks within user stories';
COMMENT ON TABLE subtasks IS 'Subtasks with enhanced bug tracking capabilities';
COMMENT ON TABLE time_entries IS 'Time tracking for productivity monitoring';
COMMENT ON TABLE ai_insights IS 'AI-generated insights and recommendations';
COMMENT ON TABLE notifications IS 'Real-time notification system';
COMMENT ON TABLE activity_logs IS 'Audit trail for all system changes';

-- =============================================
-- ENHANCED TRIGGERS FOR BUG WORKFLOW
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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

-- Function to automatically update task progress based on subtask completion
CREATE OR REPLACE FUNCTION update_task_progress_from_subtasks()
RETURNS TRIGGER AS $$
DECLARE
    total_subtasks INTEGER;
    completed_subtasks INTEGER;
    task_should_be_done BOOLEAN := false;
BEGIN
    -- Get subtask completion counts for the parent task
    SELECT 
        COUNT(*),
        COUNT(CASE WHEN is_completed = true THEN 1 END)
    INTO total_subtasks, completed_subtasks
    FROM subtasks 
    WHERE task_id = COALESCE(NEW.task_id, OLD.task_id);
    
    -- If all subtasks are completed and task is in progress, suggest moving to qa_review
    -- (This is informational - the task assignee still controls the status)
    IF total_subtasks > 0 AND completed_subtasks = total_subtasks THEN
        -- Create notification for task assignee that all subtasks are complete
        INSERT INTO notifications (user_id, type, priority, title, message, related_entity_type, related_entity_id)
        SELECT 
            t.assignee_id,
            'task',
            'normal',
            'All Subtasks Completed',
            'All subtasks for task "' || t.title || '" have been completed. Consider moving to QA review.',
            'task',
            t.id
        FROM tasks t 
        WHERE t.id = COALESCE(NEW.task_id, OLD.task_id)
            AND t.assignee_id IS NOT NULL
            AND t.status = 'in_progress';  -- Only notify if task is in progress
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_progress_from_subtasks_trigger
    AFTER INSERT OR UPDATE OR DELETE ON subtasks
    FOR EACH ROW EXECUTE FUNCTION update_task_progress_from_subtasks();

-- Function for task status change notifications (enhanced for bug workflow)
CREATE OR REPLACE FUNCTION notify_task_status_change()
RETURNS TRIGGER AS $$
DECLARE
    story_title TEXT;
    project_id UUID;
BEGIN
    -- Get context information
    SELECT s.title, s.project_id INTO story_title, project_id
    FROM stories s WHERE s.id = NEW.story_id;
    
    -- Notify when moved to QA review
    IF OLD.status != 'qa_review' AND NEW.status = 'qa_review' THEN
        -- Notify QA team members
        INSERT INTO notifications (user_id, type, priority, title, message, related_entity_type, related_entity_id)
        SELECT 
            u.id,
            'task',
            'normal',
            'Task Ready for QA Review',
            'Task "' || NEW.title || '" in story "' || story_title || '" is ready for QA review',
            'task',
            NEW.id
        FROM users u 
        JOIN project_team_members ptm ON u.id = ptm.user_id
        WHERE ptm.project_id = project_id 
            AND ptm.left_at IS NULL
            AND u.domain_id = (SELECT id FROM domains WHERE name = 'Testing')
            AND u.is_active = true;
    END IF;
    
    -- Notify when QA completes review
    IF OLD.status = 'qa_review' AND NEW.status = 'done' THEN
        -- Notify assignee (developer)
        IF NEW.assignee_id IS NOT NULL THEN
            INSERT INTO notifications (user_id, type, priority, title, message, related_entity_type, related_entity_id)
            VALUES (
                NEW.assignee_id,
                'task', 
                'normal',
                'Task Approved by QA',
                'Your task "' || NEW.title || '" has been approved by QA and marked as complete',
                'task',
                NEW.id
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_status_notification_trigger
    AFTER UPDATE ON tasks
    FOR EACH ROW 
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION notify_task_status_change();

-- =============================================
-- MIGRATION SQL FOR EXISTING DATABASES
-- =============================================

-- Add category column to subtasks table if it doesn't exist
ALTER TABLE subtasks ADD COLUMN IF NOT EXISTS category VARCHAR(50);
