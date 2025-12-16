-- =============================================================================
-- SprintSync Complete Database Setup Script
-- =============================================================================
-- This script creates the complete database schema with all required tables,
-- enums, and sample data for initial deployment.
-- 
-- Run this script on a fresh PostgreSQL database before deploying the application.
-- Database: PostgreSQL 14+
-- =============================================================================

-- =============================================================================
-- SECTION 1: CREATE ENUMS
-- =============================================================================

-- User Role Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'manager', 'developer');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Experience Level Enum
DO $$ BEGIN
    CREATE TYPE experience_level AS ENUM ('E1', 'E2', 'M1', 'M2', 'M3', 'L1', 'L2', 'L3', 'S1');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Project Status Enum
DO $$ BEGIN
    CREATE TYPE project_status AS ENUM ('planning', 'active', 'paused', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Priority Enum
DO $$ BEGIN
    CREATE TYPE priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Task Status Enum
DO $$ BEGIN
    CREATE TYPE task_status AS ENUM ('open', 'in_progress', 'in_review', 'testing', 'completed', 'blocked', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Sprint Status Enum
DO $$ BEGIN
    CREATE TYPE sprint_status AS ENUM ('planned', 'active', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Story Status Enum
DO $$ BEGIN
    CREATE TYPE story_status AS ENUM ('backlog', 'ready', 'in_progress', 'in_review', 'testing', 'done', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Epic Status Enum
DO $$ BEGIN
    CREATE TYPE epic_status AS ENUM ('planned', 'in_progress', 'completed', 'on_hold');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Release Status Enum
DO $$ BEGIN
    CREATE TYPE release_status AS ENUM ('planned', 'in_progress', 'released', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Requirement Status Enum
DO $$ BEGIN
    CREATE TYPE requirement_status AS ENUM ('draft', 'approved', 'in-development', 'completed', 'pending');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Risk Status Enum
DO $$ BEGIN
    CREATE TYPE risk_status AS ENUM ('identified', 'mitigated', 'closed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Time Entry Type Enum
DO $$ BEGIN
    CREATE TYPE time_entry_type AS ENUM ('development', 'testing', 'design', 'review', 'meeting', 'research', 'documentation', 'bug_fix', 'refactoring', 'deployment', 'training', 'administrative');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- SECTION 2: CREATE TABLES
-- =============================================================================

-- Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Domains Table
CREATE TABLE IF NOT EXISTS domains (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department_id VARCHAR(255) REFERENCES departments(id),
    domain_id VARCHAR(255) REFERENCES domains(id),
    avatar_url VARCHAR(500),
    experience experience_level,
    hourly_rate DECIMAL(10, 2),
    ctc DECIMAL(15, 2),
    availability_percentage INTEGER DEFAULT 100,
    skills JSONB,
    reporting_manager VARCHAR(100),
    date_of_joining DATE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pending Registrations Table
CREATE TABLE IF NOT EXISTS pending_registrations (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    department_id VARCHAR(255) REFERENCES departments(id),
    domain_id VARCHAR(255) REFERENCES domains(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status project_status DEFAULT 'planning',
    priority priority DEFAULT 'medium',
    start_date DATE,
    end_date DATE,
    actual_end_date DATE,
    department_id VARCHAR(255) REFERENCES departments(id),
    domain_id VARCHAR(255) REFERENCES domains(id),
    manager_id VARCHAR(255) REFERENCES users(id),
    budget DECIMAL(15, 2),
    actual_cost DECIMAL(15, 2),
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Team Members Table
CREATE TABLE IF NOT EXISTS project_team_members (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(100),
    allocation_percentage INTEGER DEFAULT 100,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, user_id)
);

-- Epics Table
CREATE TABLE IF NOT EXISTS epics (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    summary TEXT,
    status epic_status DEFAULT 'planned',
    priority priority DEFAULT 'medium',
    owner VARCHAR(255),
    start_date DATE,
    end_date DATE,
    progress INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Releases Table
CREATE TABLE IF NOT EXISTS releases (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    version VARCHAR(50),
    status release_status DEFAULT 'planned',
    planned_date DATE,
    actual_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sprints Table
CREATE TABLE IF NOT EXISTS sprints (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    goal TEXT,
    status sprint_status DEFAULT 'planned',
    start_date DATE,
    end_date DATE,
    velocity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stories Table
CREATE TABLE IF NOT EXISTS stories (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    epic_id VARCHAR(255) REFERENCES epics(id) ON DELETE SET NULL,
    sprint_id VARCHAR(255) REFERENCES sprints(id) ON DELETE SET NULL,
    release_id VARCHAR(255) REFERENCES releases(id) ON DELETE SET NULL,
    parent_id VARCHAR(255) REFERENCES stories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    acceptance_criteria TEXT,
    status story_status DEFAULT 'backlog',
    priority priority DEFAULT 'medium',
    story_points INTEGER,
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    assignee_id VARCHAR(255) REFERENCES users(id),
    reporter_id VARCHAR(255) REFERENCES users(id),
    due_date DATE,
    labels JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(255) PRIMARY KEY,
    story_id VARCHAR(255) NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    task_number INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'open',
    priority priority DEFAULT 'medium',
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    assignee_id VARCHAR(255) REFERENCES users(id),
    due_date DATE,
    labels JSONB,
    is_overdue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subtasks Table
CREATE TABLE IF NOT EXISTS subtasks (
    id VARCHAR(255) PRIMARY KEY,
    task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE CASCADE,
    issue_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    assignee_id VARCHAR(255) REFERENCES users(id),
    due_date DATE,
    bug_type VARCHAR(50),
    severity VARCHAR(50),
    category VARCHAR(100),
    labels JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issues Table
CREATE TABLE IF NOT EXISTS issues (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    story_id VARCHAR(255) REFERENCES stories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'open',
    priority priority DEFAULT 'medium',
    bug_type VARCHAR(50),
    severity VARCHAR(50),
    assignee_id VARCHAR(255) REFERENCES users(id),
    reporter_id VARCHAR(255) REFERENCES users(id),
    due_date DATE,
    estimated_hours DECIMAL(10, 2),
    actual_hours DECIMAL(10, 2),
    labels JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Time Entries Table
CREATE TABLE IF NOT EXISTS time_entries (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id),
    task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE SET NULL,
    story_id VARCHAR(255) REFERENCES stories(id) ON DELETE SET NULL,
    project_id VARCHAR(255) REFERENCES projects(id) ON DELETE SET NULL,
    entry_type time_entry_type DEFAULT 'development',
    hours DECIMAL(10, 2) NOT NULL,
    description TEXT,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    project_id VARCHAR(255) REFERENCES projects(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
    id VARCHAR(255) PRIMARY KEY,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by VARCHAR(255) REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quality Gates Table
CREATE TABLE IF NOT EXISTS quality_gates (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria JSONB,
    is_passed BOOLEAN DEFAULT FALSE,
    checked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Requirements Table
CREATE TABLE IF NOT EXISTS requirements (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status requirement_status DEFAULT 'draft',
    priority priority DEFAULT 'medium',
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stakeholders Table
CREATE TABLE IF NOT EXISTS stakeholders (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    email VARCHAR(255),
    responsibilities TEXT,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workflow Lanes Table
CREATE TABLE IF NOT EXISTS workflow_lanes (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    position INTEGER DEFAULT 0,
    color VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Boards Table
CREATE TABLE IF NOT EXISTS boards (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    board_type VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backlog Stories Table
CREATE TABLE IF NOT EXISTS backlog_stories (
    id VARCHAR(255) PRIMARY KEY,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    original_story_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority priority DEFAULT 'medium',
    story_points INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backlog Tasks Table
CREATE TABLE IF NOT EXISTS backlog_tasks (
    id VARCHAR(255) PRIMARY KEY,
    backlog_story_id VARCHAR(255) NOT NULL REFERENCES backlog_stories(id) ON DELETE CASCADE,
    original_task_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'open',
    priority priority DEFAULT 'medium',
    estimated_hours DECIMAL(10, 2),
    task_number INTEGER,
    due_date DATE,
    labels JSONB,
    is_overdue BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Backlog Subtasks Table
CREATE TABLE IF NOT EXISTS backlog_subtasks (
    id VARCHAR(255) PRIMARY KEY,
    backlog_task_id VARCHAR(255) NOT NULL REFERENCES backlog_tasks(id) ON DELETE CASCADE,
    original_subtask_id VARCHAR(255),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    estimated_hours DECIMAL(10, 2),
    assignee_id VARCHAR(255),
    due_date DATE,
    bug_type VARCHAR(50),
    severity VARCHAR(50),
    category VARCHAR(100),
    labels JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- SECTION 3: INSERT SAMPLE DATA
-- =============================================================================

-- Insert Departments
INSERT INTO departments (id, name, description, is_active) VALUES
('DEPT001', 'Engineering', 'Software Engineering Department', true),
('DEPT002', 'Design', 'UI/UX Design Department', true),
('DEPT003', 'Quality Assurance', 'QA and Testing Department', true),
('DEPT004', 'Product Management', 'Product Management Department', true),
('DEPT005', 'DevOps', 'DevOps and Infrastructure Department', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Domains
INSERT INTO domains (id, name, description, is_active) VALUES
('DOM001', 'Frontend', 'Frontend Development Domain', true),
('DOM002', 'Backend', 'Backend Development Domain', true)
ON CONFLICT (id) DO NOTHING;

-- Insert Admin User (Password: admin123)
-- Note: Password is BCrypt hashed - 'admin123' -> '$2a$10$...'
INSERT INTO users (id, email, password_hash, name, role, department_id, domain_id, is_active, experience, availability_percentage) VALUES
('USR001', 'admin@sprintsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4L0x8G6QhGk6E5cKjgPZc.lSMZfO', 'Admin User', 'admin', 'DEPT001', 'DOM002', true, 'L2', 100),
('USR002', 'manager@sprintsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4L0x8G6QhGk6E5cKjgPZc.lSMZfO', 'Project Manager', 'manager', 'DEPT004', 'DOM002', true, 'M2', 100),
('USR003', 'developer@sprintsync.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4L0x8G6QhGk6E5cKjgPZc.lSMZfO', 'Developer User', 'developer', 'DEPT001', 'DOM001', true, 'E2', 100)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SECTION 4: CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_domain ON users(domain_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_department ON projects(department_id);
CREATE INDEX IF NOT EXISTS idx_stories_project ON stories(project_id);
CREATE INDEX IF NOT EXISTS idx_stories_sprint ON stories(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_story ON tasks(story_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =============================================================================
-- SECTION 5: GRANT PERMISSIONS (if needed)
-- =============================================================================

-- Uncomment and modify these if you need to grant permissions to specific users
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================
-- 
-- Default Login Credentials:
-- ---------------------------
-- Admin:     admin@sprintsync.com     / admin123
-- Manager:   manager@sprintsync.com   / admin123  
-- Developer: developer@sprintsync.com / admin123
--
-- Note: All passwords are set to 'admin123' (BCrypt hashed)
-- Change these passwords immediately in a production environment!
-- =============================================================================
