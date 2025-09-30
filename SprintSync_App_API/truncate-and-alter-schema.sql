-- SprintSync Database Schema Update Script
-- Truncate all tables and change UUID columns to VARCHAR for custom ID structure

-- =============================================
-- TRUNCATE ALL TABLES (in correct order due to foreign keys)
-- =============================================

-- Truncate tables in reverse dependency order
TRUNCATE TABLE activity_logs CASCADE;
TRUNCATE TABLE attachments CASCADE;
TRUNCATE TABLE comments CASCADE;
TRUNCATE TABLE todos CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE ai_insights CASCADE;
TRUNCATE TABLE reports CASCADE;
TRUNCATE TABLE project_integrations CASCADE;
TRUNCATE TABLE available_integrations CASCADE;
TRUNCATE TABLE risks CASCADE;
TRUNCATE TABLE stakeholders CASCADE;
TRUNCATE TABLE time_entries CASCADE;
TRUNCATE TABLE milestones CASCADE;
TRUNCATE TABLE requirements CASCADE;
TRUNCATE TABLE subtasks CASCADE;
TRUNCATE TABLE tasks CASCADE;
TRUNCATE TABLE stories CASCADE;
TRUNCATE TABLE quality_gates CASCADE;
TRUNCATE TABLE releases CASCADE;
TRUNCATE TABLE epics CASCADE;
TRUNCATE TABLE sprints CASCADE;
TRUNCATE TABLE project_team_members CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE domains CASCADE;
TRUNCATE TABLE departments CASCADE;

-- =============================================
-- DROP ALL FOREIGN KEY CONSTRAINTS
-- =============================================

-- Users table constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_department_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_domain_id_fkey;

-- Projects table constraints
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_department_id_fkey;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_manager_id_fkey;

-- Project team members table constraints
ALTER TABLE project_team_members DROP CONSTRAINT IF EXISTS project_team_members_project_id_fkey;
ALTER TABLE project_team_members DROP CONSTRAINT IF EXISTS project_team_members_user_id_fkey;

-- Sprints table constraints
ALTER TABLE sprints DROP CONSTRAINT IF EXISTS sprints_project_id_fkey;

-- Epics table constraints
ALTER TABLE epics DROP CONSTRAINT IF EXISTS epics_project_id_fkey;
ALTER TABLE epics DROP CONSTRAINT IF EXISTS epics_assignee_id_fkey;
ALTER TABLE epics DROP CONSTRAINT IF EXISTS epics_owner_fkey;

-- Releases table constraints
ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_project_id_fkey;
ALTER TABLE releases DROP CONSTRAINT IF EXISTS releases_created_by_fkey;

-- Quality gates table constraints
ALTER TABLE quality_gates DROP CONSTRAINT IF EXISTS quality_gates_release_id_fkey;

-- Stories table constraints
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_project_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_sprint_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_epic_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_release_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_assignee_id_fkey;
ALTER TABLE stories DROP CONSTRAINT IF EXISTS stories_reporter_id_fkey;

-- Tasks table constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_story_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_reporter_id_fkey;

-- Subtasks table constraints
ALTER TABLE subtasks DROP CONSTRAINT IF EXISTS subtasks_task_id_fkey;
ALTER TABLE subtasks DROP CONSTRAINT IF EXISTS subtasks_assignee_id_fkey;

-- Requirements table constraints
ALTER TABLE requirements DROP CONSTRAINT IF EXISTS requirements_project_id_fkey;

-- Milestones table constraints
ALTER TABLE milestones DROP CONSTRAINT IF EXISTS milestones_project_id_fkey;

-- Stakeholders table constraints
ALTER TABLE stakeholders DROP CONSTRAINT IF EXISTS stakeholders_project_id_fkey;

-- Risks table constraints
ALTER TABLE risks DROP CONSTRAINT IF EXISTS risks_project_id_fkey;
ALTER TABLE risks DROP CONSTRAINT IF EXISTS risks_owner_id_fkey;

-- Available integrations table constraints
ALTER TABLE available_integrations DROP CONSTRAINT IF EXISTS available_integrations_type_fkey;

-- Project integrations table constraints
ALTER TABLE project_integrations DROP CONSTRAINT IF EXISTS project_integrations_project_id_fkey;
ALTER TABLE project_integrations DROP CONSTRAINT IF EXISTS project_integrations_integration_id_fkey;

-- Notifications table constraints
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- AI insights table constraints
ALTER TABLE ai_insights DROP CONSTRAINT IF EXISTS ai_insights_project_id_fkey;

-- Reports table constraints
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_project_id_fkey;
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_created_by_fkey;

-- Todos table constraints
ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_user_id_fkey;
ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_related_project_id_fkey;
ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_related_story_id_fkey;
ALTER TABLE todos DROP CONSTRAINT IF EXISTS todos_related_task_id_fkey;

-- Comments table constraints
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_parent_comment_id_fkey;

-- Attachments table constraints
ALTER TABLE attachments DROP CONSTRAINT IF EXISTS attachments_uploaded_by_fkey;

-- Activity logs table constraints
ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;

-- Time entries table constraints
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_user_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_project_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_story_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_task_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_subtask_id_fkey;

-- =============================================
-- ALTER ALL ID COLUMNS TO VARCHAR(32)
-- =============================================

-- Departments table
ALTER TABLE departments ALTER COLUMN id TYPE VARCHAR(32);

-- Domains table  
ALTER TABLE domains ALTER COLUMN id TYPE VARCHAR(32);

-- Users table
ALTER TABLE users ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE users ALTER COLUMN department_id TYPE VARCHAR(32);
ALTER TABLE users ALTER COLUMN domain_id TYPE VARCHAR(32);

-- Projects table
ALTER TABLE projects ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE projects ALTER COLUMN department_id TYPE VARCHAR(32);
ALTER TABLE projects ALTER COLUMN manager_id TYPE VARCHAR(32);

-- Project team members table
ALTER TABLE project_team_members ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE project_team_members ALTER COLUMN project_id TYPE VARCHAR(32);
ALTER TABLE project_team_members ALTER COLUMN user_id TYPE VARCHAR(32);

-- Sprints table
ALTER TABLE sprints ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE sprints ALTER COLUMN project_id TYPE VARCHAR(32);

-- Epics table
ALTER TABLE epics ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE epics ALTER COLUMN project_id TYPE VARCHAR(32);
ALTER TABLE epics ALTER COLUMN assignee_id TYPE VARCHAR(32);
ALTER TABLE epics ALTER COLUMN owner TYPE VARCHAR(32);

-- Releases table
ALTER TABLE releases ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE releases ALTER COLUMN project_id TYPE VARCHAR(32);
ALTER TABLE releases ALTER COLUMN created_by TYPE VARCHAR(32);

-- Quality gates table
ALTER TABLE quality_gates ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE quality_gates ALTER COLUMN release_id TYPE VARCHAR(32);

-- Stories table
ALTER TABLE stories ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE stories ALTER COLUMN project_id TYPE VARCHAR(32);
ALTER TABLE stories ALTER COLUMN sprint_id TYPE VARCHAR(32);
ALTER TABLE stories ALTER COLUMN epic_id TYPE VARCHAR(32);
ALTER TABLE stories ALTER COLUMN release_id TYPE VARCHAR(32);
ALTER TABLE stories ALTER COLUMN assignee_id TYPE VARCHAR(32);
ALTER TABLE stories ALTER COLUMN reporter_id TYPE VARCHAR(32);

-- Tasks table
ALTER TABLE tasks ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE tasks ALTER COLUMN story_id TYPE VARCHAR(32);
ALTER TABLE tasks ALTER COLUMN assignee_id TYPE VARCHAR(32);
ALTER TABLE tasks ALTER COLUMN reporter_id TYPE VARCHAR(32);

-- Subtasks table
ALTER TABLE subtasks ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE subtasks ALTER COLUMN task_id TYPE VARCHAR(32);
ALTER TABLE subtasks ALTER COLUMN assignee_id TYPE VARCHAR(32);

-- Requirements table
ALTER TABLE requirements ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE requirements ALTER COLUMN project_id TYPE VARCHAR(32);

-- Time entries table
ALTER TABLE time_entries ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE time_entries ALTER COLUMN user_id TYPE VARCHAR(32);
ALTER TABLE time_entries ALTER COLUMN project_id TYPE VARCHAR(32);
ALTER TABLE time_entries ALTER COLUMN story_id TYPE VARCHAR(32);
ALTER TABLE time_entries ALTER COLUMN task_id TYPE VARCHAR(32);
ALTER TABLE time_entries ALTER COLUMN subtask_id TYPE VARCHAR(32);

-- Milestones table
ALTER TABLE milestones ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE milestones ALTER COLUMN project_id TYPE VARCHAR(32);

-- Stakeholders table
ALTER TABLE stakeholders ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE stakeholders ALTER COLUMN project_id TYPE VARCHAR(32);

-- Risks table
ALTER TABLE risks ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE risks ALTER COLUMN project_id TYPE VARCHAR(32);
ALTER TABLE risks ALTER COLUMN owner_id TYPE VARCHAR(32);

-- Available integrations table
ALTER TABLE available_integrations ALTER COLUMN id TYPE VARCHAR(32);

-- Project integrations table
ALTER TABLE project_integrations ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE project_integrations ALTER COLUMN project_id TYPE VARCHAR(32);
ALTER TABLE project_integrations ALTER COLUMN integration_id TYPE VARCHAR(32);

-- Notifications table
ALTER TABLE notifications ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE notifications ALTER COLUMN user_id TYPE VARCHAR(32);
ALTER TABLE notifications ALTER COLUMN related_entity_id TYPE VARCHAR(32);

-- AI insights table
ALTER TABLE ai_insights ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE ai_insights ALTER COLUMN project_id TYPE VARCHAR(32);

-- Reports table
ALTER TABLE reports ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE reports ALTER COLUMN project_id TYPE VARCHAR(32);
ALTER TABLE reports ALTER COLUMN created_by TYPE VARCHAR(32);

-- Todos table
ALTER TABLE todos ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE todos ALTER COLUMN user_id TYPE VARCHAR(32);
ALTER TABLE todos ALTER COLUMN related_project_id TYPE VARCHAR(32);
ALTER TABLE todos ALTER COLUMN related_story_id TYPE VARCHAR(32);
ALTER TABLE todos ALTER COLUMN related_task_id TYPE VARCHAR(32);

-- Comments table
ALTER TABLE comments ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE comments ALTER COLUMN user_id TYPE VARCHAR(32);
ALTER TABLE comments ALTER COLUMN entity_id TYPE VARCHAR(32);
ALTER TABLE comments ALTER COLUMN parent_comment_id TYPE VARCHAR(32);

-- Attachments table
ALTER TABLE attachments ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE attachments ALTER COLUMN uploaded_by TYPE VARCHAR(32);
ALTER TABLE attachments ALTER COLUMN entity_id TYPE VARCHAR(32);

-- Activity logs table
ALTER TABLE activity_logs ALTER COLUMN id TYPE VARCHAR(32);
ALTER TABLE activity_logs ALTER COLUMN user_id TYPE VARCHAR(32);
ALTER TABLE activity_logs ALTER COLUMN entity_id TYPE VARCHAR(32);

-- =============================================
-- RECREATE ALL FOREIGN KEY CONSTRAINTS
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

-- Requirements table foreign keys
ALTER TABLE requirements ADD CONSTRAINT requirements_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Time entries table foreign keys
ALTER TABLE time_entries ADD CONSTRAINT time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_story_id_fkey FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE SET NULL;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_task_id_fkey FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL;
ALTER TABLE time_entries ADD CONSTRAINT time_entries_subtask_id_fkey FOREIGN KEY (subtask_id) REFERENCES subtasks(id) ON DELETE SET NULL;

-- Milestones table foreign keys
ALTER TABLE milestones ADD CONSTRAINT milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Stakeholders table foreign keys
ALTER TABLE stakeholders ADD CONSTRAINT stakeholders_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Risks table foreign keys
ALTER TABLE risks ADD CONSTRAINT risks_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE risks ADD CONSTRAINT risks_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES users(id);

-- Project integrations table foreign keys
ALTER TABLE project_integrations ADD CONSTRAINT project_integrations_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE project_integrations ADD CONSTRAINT project_integrations_integration_id_fkey FOREIGN KEY (integration_id) REFERENCES available_integrations(id) ON DELETE CASCADE;

-- Notifications table foreign keys
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- AI insights table foreign keys
ALTER TABLE ai_insights ADD CONSTRAINT ai_insights_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Reports table foreign keys
ALTER TABLE reports ADD CONSTRAINT reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
ALTER TABLE reports ADD CONSTRAINT reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id);

-- Todos table foreign keys
ALTER TABLE todos ADD CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE todos ADD CONSTRAINT todos_related_project_id_fkey FOREIGN KEY (related_project_id) REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE todos ADD CONSTRAINT todos_related_story_id_fkey FOREIGN KEY (related_story_id) REFERENCES stories(id) ON DELETE SET NULL;
ALTER TABLE todos ADD CONSTRAINT todos_related_task_id_fkey FOREIGN KEY (related_task_id) REFERENCES tasks(id) ON DELETE SET NULL;

-- Comments table foreign keys
ALTER TABLE comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE comments ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE;

-- Attachments table foreign keys
ALTER TABLE attachments ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES users(id);

-- Activity logs table foreign keys
ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

COMMIT;

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 'Schema updated successfully. All ID columns are now VARCHAR(32)' as status;
