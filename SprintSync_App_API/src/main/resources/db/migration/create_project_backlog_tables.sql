-- Migration: Create Project Backlog Tables
-- Description: Creates tables to store backlog stories, tasks, and subtasks
--              When a sprint ends, incomplete stories and tasks are moved to backlog.
--              Stories can be cloned from backlog to new sprints with new IDs.

-- =============================================
-- PROJECT BACKLOG TABLES
-- =============================================

-- Backlog Stories table
-- Stores all stories from completed/ended sprints that have incomplete tasks
CREATE TABLE backlog_stories (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::VARCHAR,
    project_id VARCHAR(255) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    original_story_id VARCHAR(255) REFERENCES stories(id) ON DELETE SET NULL,
    original_sprint_id VARCHAR(255) REFERENCES sprints(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    acceptance_criteria JSONB DEFAULT '[]',
    status story_status DEFAULT 'backlog',
    priority story_priority DEFAULT 'medium',
    story_points INTEGER CHECK (story_points >= 0),
    assignee_id VARCHAR(255) REFERENCES users(id),
    reporter_id VARCHAR(255) REFERENCES users(id),
    epic_id VARCHAR(255),
    release_id VARCHAR(255),
    labels JSONB DEFAULT '[]',
    order_index INTEGER DEFAULT 0,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    created_from_sprint_id VARCHAR(255) REFERENCES sprints(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique backlog story ID per project
    CONSTRAINT uk_backlog_story_project UNIQUE (id, project_id)
);

-- Backlog Tasks table
-- Stores all tasks associated with backlog stories
CREATE TABLE backlog_tasks (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::VARCHAR,
    backlog_story_id VARCHAR(255) NOT NULL REFERENCES backlog_stories(id) ON DELETE CASCADE,
    original_task_id VARCHAR(255) REFERENCES tasks(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status task_status DEFAULT 'to_do',
    priority task_priority DEFAULT 'medium',
    assignee_id VARCHAR(255) REFERENCES users(id),
    reporter_id VARCHAR(255) REFERENCES users(id),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    task_number INTEGER,
    due_date DATE,
    labels JSONB DEFAULT '[]',
    is_overdue BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backlog Subtasks table
-- Stores all subtasks associated with backlog tasks
CREATE TABLE backlog_subtasks (
    id VARCHAR(255) PRIMARY KEY DEFAULT uuid_generate_v4()::VARCHAR,
    backlog_task_id VARCHAR(255) NOT NULL REFERENCES backlog_tasks(id) ON DELETE CASCADE,
    original_subtask_id VARCHAR(255) REFERENCES subtasks(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT false,
    assignee_id VARCHAR(255) REFERENCES users(id),
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2) DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    due_date DATE,
    bug_type VARCHAR(50),
    severity VARCHAR(20),
    category VARCHAR(50),
    labels JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Backlog Stories indexes
CREATE INDEX idx_backlog_stories_project ON backlog_stories(project_id);
CREATE INDEX idx_backlog_stories_original_story ON backlog_stories(original_story_id);
CREATE INDEX idx_backlog_stories_original_sprint ON backlog_stories(original_sprint_id);
CREATE INDEX idx_backlog_stories_status ON backlog_stories(status);
CREATE INDEX idx_backlog_stories_created_from_sprint ON backlog_stories(created_from_sprint_id);

-- Backlog Tasks indexes
CREATE INDEX idx_backlog_tasks_story ON backlog_tasks(backlog_story_id);
CREATE INDEX idx_backlog_tasks_original_task ON backlog_tasks(original_task_id);
CREATE INDEX idx_backlog_tasks_status ON backlog_tasks(status);
CREATE INDEX idx_backlog_tasks_overdue ON backlog_tasks(is_overdue);

-- Backlog Subtasks indexes
CREATE INDEX idx_backlog_subtasks_task ON backlog_subtasks(backlog_task_id);
CREATE INDEX idx_backlog_subtasks_original_subtask ON backlog_subtasks(original_subtask_id);
CREATE INDEX idx_backlog_subtasks_completed ON backlog_subtasks(is_completed);

