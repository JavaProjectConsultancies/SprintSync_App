-- SprintSync Database Schema
-- Comprehensive agile project management application with AI insights

-- =============================================
-- CORE SYSTEM TABLES
-- =============================================

-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domains table
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'developer', 'designer');

-- Experience levels enum
CREATE TYPE experience_level AS ENUM ('junior', 'mid', 'senior', 'lead');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- =============================================
-- PROJECT MANAGEMENT TABLES
-- =============================================

-- Project status enum
CREATE TYPE project_status AS ENUM ('planning', 'active', 'paused', 'completed', 'cancelled');

-- Project priority enum
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Project methodology enum
CREATE TYPE project_methodology AS ENUM ('scrum', 'kanban', 'waterfall');

-- Project template enum
CREATE TYPE project_template AS ENUM ('web-app', 'mobile-app', 'api-service', 'data-analytics');

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- =============================================
-- AGILE METHODOLOGY TABLES
-- =============================================

-- Sprint status enum
CREATE TYPE sprint_status AS ENUM ('planning', 'active', 'completed', 'cancelled');

-- Sprints/Scrums table
CREATE TABLE sprints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Story status enum
CREATE TYPE story_status AS ENUM ('backlog', 'to_do', 'in_progress', 'qa_review', 'done');

-- Story priority enum
CREATE TYPE story_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Stories table
CREATE TABLE stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Task status enum
CREATE TYPE task_status AS ENUM ('to_do', 'in_progress', 'qa_review', 'done');

-- Task priority enum
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Subtasks table
CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- =============================================
-- MILESTONE AND REQUIREMENT TABLES
-- =============================================

-- Milestone status enum
CREATE TYPE milestone_status AS ENUM ('upcoming', 'in_progress', 'completed', 'delayed');

-- Milestones table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Requirement type enum
CREATE TYPE requirement_type AS ENUM ('functional', 'non-functional', 'technical');

-- Requirement status enum
CREATE TYPE requirement_status AS ENUM ('draft', 'approved', 'in-development', 'completed');

-- Requirements table
CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- =============================================
-- TIME TRACKING TABLES
-- =============================================

-- Time entry type enum
CREATE TYPE time_entry_type AS ENUM ('development', 'testing', 'design', 'meeting', 'research', 'documentation', 'review');

-- Time entries table
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- =============================================
-- STAKEHOLDER AND RISK MANAGEMENT
-- =============================================

-- Stakeholders table
CREATE TABLE stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(255),
    responsibilities JSONB DEFAULT '[]',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk probability enum
CREATE TYPE risk_probability AS ENUM ('low', 'medium', 'high');

-- Risk impact enum
CREATE TYPE risk_impact AS ENUM ('low', 'medium', 'high');

-- Risk status enum
CREATE TYPE risk_status AS ENUM ('identified', 'mitigated', 'closed');

-- Risks table
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- =============================================
-- INTEGRATIONS AND EXTERNAL TOOLS
-- =============================================

-- Integration type enum
CREATE TYPE integration_type AS ENUM ('version_control', 'communication', 'storage', 'project_management', 'documentation');

-- Available integrations table
CREATE TABLE available_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    type integration_type,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project integrations table
CREATE TABLE project_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES available_integrations(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, integration_id)
);

-- =============================================
-- NOTIFICATION SYSTEM
-- =============================================

-- Notification type enum
CREATE TYPE notification_type AS ENUM ('system', 'project', 'task', 'mention', 'reminder', 'ai_insight');

-- Notification priority enum
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type DEFAULT 'system',
    priority notification_priority DEFAULT 'normal',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_entity_type VARCHAR(50), -- 'project', 'story', 'task', etc.
    related_entity_id UUID,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AI INSIGHTS AND ANALYTICS
-- =============================================

-- AI insight type enum
CREATE TYPE ai_insight_type AS ENUM ('productivity', 'risk_assessment', 'resource_optimization', 'timeline_prediction', 'quality_metrics');

-- AI insights table
CREATE TABLE ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- =============================================
-- REPORTING AND ANALYTICS
-- =============================================

-- Report type enum
CREATE TYPE report_type AS ENUM ('sprint_burndown', 'velocity_chart', 'team_productivity', 'project_overview', 'time_analysis', 'custom');

-- Reports table
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type report_type,
    description TEXT,
    configuration JSONB DEFAULT '{}',
    data JSONB DEFAULT '{}',
    is_shared BOOLEAN DEFAULT false,
    scheduled_frequency VARCHAR(20), -- 'daily', 'weekly', 'monthly', null for one-time
    last_generated TIMESTAMP WITH TIME ZONE,
    next_generation TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TODO SYSTEM (Personal Task Management)
-- =============================================

-- Todo priority enum
CREATE TYPE todo_priority AS ENUM ('low', 'medium', 'high');

-- Todo status enum
CREATE TYPE todo_status AS ENUM ('pending', 'in_progress', 'completed');

-- Todos table
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- =============================================
-- COMMENT AND COLLABORATION SYSTEM
-- =============================================

-- Comments table for collaborative features
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'story', 'task', 'subtask'
    entity_id UUID NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ATTACHMENT SYSTEM
-- =============================================

-- File attachments table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploaded_by UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL, -- 'project', 'story', 'task', 'comment'
    entity_id UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- AUDIT AND ACTIVITY LOG
-- =============================================

-- Activity log for tracking changes
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL, -- 'created', 'updated', 'deleted', 'assigned', etc.
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
-- INITIAL DATA INSERTS
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

-- Function to automatically update project progress based on story completion
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

-- Function to create activity log entries
CREATE OR REPLACE FUNCTION create_activity_log()
RETURNS TRIGGER AS $$
DECLARE
    action_type VARCHAR(100);
    entity_type VARCHAR(50);
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type := 'created';
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'updated';
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'deleted';
    END IF;
    
    -- Determine entity type from table name
    entity_type := TG_TABLE_NAME;
    
    -- Insert activity log
    INSERT INTO activity_logs (
        entity_type,
        entity_id,
        action,
        old_values,
        new_values,
        description
    ) VALUES (
        entity_type,
        COALESCE(NEW.id, OLD.id),
        action_type,
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
        action_type || ' ' || entity_type
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create activity log triggers for main entities
CREATE TRIGGER activity_log_projects AFTER INSERT OR UPDATE OR DELETE ON projects FOR EACH ROW EXECUTE FUNCTION create_activity_log();
CREATE TRIGGER activity_log_stories AFTER INSERT OR UPDATE OR DELETE ON stories FOR EACH ROW EXECUTE FUNCTION create_activity_log();
CREATE TRIGGER activity_log_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks FOR EACH ROW EXECUTE FUNCTION create_activity_log();
CREATE TRIGGER activity_log_sprints AFTER INSERT OR UPDATE OR DELETE ON sprints FOR EACH ROW EXECUTE FUNCTION create_activity_log();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- View for project team with user details
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

-- View for sprint burndown data
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

-- View for user workload analysis
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

-- View for project health metrics
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
-- SECURITY POLICIES (Row Level Security)
-- =============================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (to be customized based on authentication system)
-- Users can see their own data and admins can see all
CREATE POLICY user_policy ON users
    FOR ALL
    USING (id = current_setting('app.current_user_id')::uuid OR 
           EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::uuid AND role = 'admin'));

-- Project access based on team membership or role
CREATE POLICY project_access_policy ON projects
    FOR ALL
    USING (
        -- Admins see all
        EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::uuid AND role = 'admin') OR
        -- Managers see their projects
        manager_id = current_setting('app.current_user_id')::uuid OR
        -- Team members see their assigned projects
        EXISTS (SELECT 1 FROM project_team_members 
                WHERE project_id = id 
                AND user_id = current_setting('app.current_user_id')::uuid 
                AND left_at IS NULL)
    );

-- Comments for documentation
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