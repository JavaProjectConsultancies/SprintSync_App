-- SprintSync Database Schema Update Script
-- Change UUID columns to VARCHAR for custom ID structure
-- Run this script to update existing database structure

-- =============================================
-- ALTER TABLES TO USE VARCHAR INSTEAD OF UUID
-- =============================================

-- Drop foreign key constraints first
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_department_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_domain_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_department_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_manager_id_fkey;
ALTER TABLE project_team_members DROP CONSTRAINT IF EXISTS project_team_members_project_id_fkey;
ALTER TABLE project_team_members DROP CONSTRAINT IF EXISTS project_team_members_user_id_fkey;
ALTER TABLE sprints DROP CONSTRAINT IF EXISTS sprints_project_id_fkey;
ALTER TABLE epics DROP CONSTRAINT IF EXISTS epics_project_id_fkey;
ALTER TABLE epics DROP CONSTRAINT IF EXISTS epics_assignee_id_fkey;
ALTER TABLE epics DROP CONSTRAINT IF EXISTS epics_owner_fkey;
ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_project_id_fkey;
ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_created_by_fkey;
ALTER TABLE quality_gates DROP CONSTRAINT IF EXISTS quality_gates_release_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_project_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_sprint_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_epic_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_release_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_assignee_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_reporter_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_story_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_reporter_id_fkey;
ALTER TABLE subtasks DROP CONSTRAINT IF EXISTS subtasks_task_id_fkey;
ALTER TABLE subtasks DROP CONSTRAINT IF EXISTS subtasks_assignee_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_user_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_project_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_story_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_task_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_subtask_id_fkey;
ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_project_id_fkey;
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_parent_comment_id_fkey;
ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_user_id_fkey;
ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_related_project_id_fkey;
ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_related_story_id_fkey;
ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_related_task_id_fkey;

-- =============================================
-- CHANGE PRIMARY KEY COLUMNS TO VARCHAR
-- =============================================

-- Departments table
ALTER TABLE departments ALTER COLUMN id TYPE VARCHAR(20);

-- Domains table  
ALTER TABLE domains ALTER COLUMN id TYPE VARCHAR(20);

-- Users table
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE users ALTER COLUMN department_id TYPE VARCHAR(20);
ALTER TABLE users ALTER COLUMN domain_id TYPE VARCHAR(20);

-- Projects table
ALTER TABLE projects ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE projects ALTER COLUMN department_id TYPE VARCHAR(20);
ALTER TABLE projects ALTER COLUMN manager_id TYPE VARCHAR(20);

-- Project team members table
ALTER TABLE project_team_members ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE project_team_members ALTER COLUMN project_id TYPE VARCHAR(20);
ALTER TABLE project_team_members ALTER COLUMN user_id TYPE VARCHAR(20);

-- Sprints table
ALTER TABLE sprints ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE sprints ALTER COLUMN project_id TYPE VARCHAR(20);

-- Epics table
ALTER TABLE epics ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE epics ALTER COLUMN project_id TYPE VARCHAR(20);
ALTER TABLE epics ALTER COLUMN assignee_id TYPE VARCHAR(20);
ALTER TABLE epics ALTER COLUMN owner TYPE VARCHAR(20);

-- Releases table
ALTER TABLE releases ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE releases ALTER COLUMN project_id TYPE VARCHAR(20);
ALTER TABLE releases ALTER COLUMN created_by TYPE VARCHAR(20);

-- Quality gates table
ALTER TABLE quality_gates ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE quality_gates ALTER COLUMN release_id TYPE VARCHAR(20);

-- Stories table
ALTER TABLE stories ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE stories ALTER COLUMN project_id TYPE VARCHAR(20);
ALTER TABLE stories ALTER COLUMN sprint_id TYPE VARCHAR(20);
ALTER TABLE stories ALTER COLUMN epic_id TYPE VARCHAR(20);
ALTER TABLE stories ALTER COLUMN release_id TYPE VARCHAR(20);
ALTER TABLE stories ALTER COLUMN assignee_id TYPE VARCHAR(20);
ALTER TABLE stories ALTER COLUMN reporter_id TYPE VARCHAR(20);

-- Tasks table
ALTER TABLE tasks ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE tasks ALTER COLUMN story_id TYPE VARCHAR(20);
ALTER TABLE tasks ALTER COLUMN assignee_id TYPE VARCHAR(20);
ALTER TABLE tasks ALTER COLUMN reporter_id TYPE VARCHAR(20);

-- Subtasks table
ALTER TABLE subtasks ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE subtasks ALTER COLUMN task_id TYPE VARCHAR(20);
ALTER TABLE subtasks ALTER COLUMN assignee_id TYPE VARCHAR(20);

-- Time entries table
ALTER TABLE time_entries ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE time_entries ALTER COLUMN user_id TYPE VARCHAR(20);
ALTER TABLE time_entries ALTER COLUMN project_id TYPE VARCHAR(20);
ALTER TABLE time_entries ALTER COLUMN story_id TYPE VARCHAR(20);
ALTER TABLE time_entries ALTER COLUMN task_id TYPE VARCHAR(20);
ALTER TABLE time_entries ALTER COLUMN subtask_id TYPE VARCHAR(20);

-- Milestones table
ALTER TABLE milestones ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE milestones ALTER COLUMN project_id TYPE VARCHAR(20);

-- Notifications table
ALTER TABLE notifications ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE notifications ALTER COLUMN user_id TYPE VARCHAR(20);
ALTER TABLE notifications ALTER COLUMN related_entity_id TYPE VARCHAR(20);

-- Comments table
ALTER TABLE comments ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE comments ALTER COLUMN user_id TYPE VARCHAR(20);
ALTER TABLE comments ALTER COLUMN entity_id TYPE VARCHAR(20);
ALTER TABLE comments ALTER COLUMN parent_comment_id TYPE VARCHAR(20);

-- Todos table
ALTER TABLE todos ALTER COLUMN id TYPE VARCHAR(20);
ALTER TABLE todos ALTER COLUMN user_id TYPE VARCHAR(20);
ALTER TABLE todos ALTER COLUMN related_project_id TYPE VARCHAR(20);
ALTER TABLE todos ALTER COLUMN related_story_id TYPE VARCHAR(20);
ALTER TABLE todos ALTER COLUMN related_task_id TYPE VARCHAR(20);

-- =============================================
-- RECREATE FOREIGN KEY CONSTRAINTS
-- =============================================

-- Users table foreign keys
ALTER TABLE users ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE users ADD CONSTRAINT users_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES domains(id);

-- Projects table foreign keys
ALTER TABLE projects ADD CONSTRAINT projects_department_id_fkey FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE projects ADD CONSTRAINT projects_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES users(id);

-- Project team members table foreign keys
ALTER TABLE project_team_members ADD CONSTRAINT project_team_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE project_team_members ADD CONSTRAINT project_team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Sprints table foreign keys
ALTER TABLE sprints ADD CONSTRAINT sprints_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Epics table foreign keys
ALTER TABLE epics ADD CONSTRAINT epics_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE epics ADD CONSTRAINT epics_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES users(id);
ALTER TABLE epics ADD CONSTRAINT epics_owner_fkey FOREIGN KEY (owner) REFERENCES users(id);

-- Releases table foreign keys
ALTER TABLE releases ADD CONSTRAINT releases_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE releases ADD CONSTRAINT releases_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);

-- Quality gates table foreign keys
ALTER TABLE quality_gates ADD CONSTRAINT quality_gates_release_id_fkey FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE;

-- Stories table foreign keys
ALTER TABLE stories ADD CONSTRAINT stories_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE stories ADD CONSTRAINT stories_sprint_id_fkey FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL;
ALTER TABLE stories ADD CONSTRAINT stories_epic_id_fkey FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE SET NULL;
ALTER TABLE stories ADD CONSTRAINT stories_release_id_fkey FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE SET NULL;
ALTER TABLE stories ADD CONSTRAINT stories_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES users(id);
ALTER TABLE stories ADD CONSTRAINT stories_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES users(id);

-- Tasks table foreign keys
ALTER TABLE tasks ADD CONSTRAINT tasks_story_id_fkey FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES users(id);
ALTER TABLE tasks ADD CONSTRAINT tasks_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES users(id);

-- Subtasks table foreign keys
ALTER TABLE subtasks ADD CONSTRAINT subtasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE;
ALTER TABLE subtasks ADD CONSTRAINT subtasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES users(id);

-- Time entries table foreign keys
ALTER TABLE time_entries ADD CONSTRAINT time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_story_id_fkey FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE SET NULL;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_subtask_id_fkey FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE SET NULL;

-- Milestones table foreign keys
ALTER TABLE milestones ADD CONSTRAINT milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Notifications table foreign keys
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Comments table foreign keys
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE;

-- Todos table foreign keys
ALTER TABLE todos ADD CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE todos ADD CONSTRAINT todos_related_project_id_fkey FOREIGN KEY (related_project_id) REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE todos ADD CONSTRAINT todos_related_story_id_fkey FOREIGN KEY (related_story_id) REFERENCES stories(id) ON DELETE SET NULL;
ALTER TABLE todos ADD CONSTRAINT todos_related_task_id_fkey FOREIGN KEY (related_task_id) REFERENCES tasks(id) ON DELETE SET NULL;

COMMIT;
