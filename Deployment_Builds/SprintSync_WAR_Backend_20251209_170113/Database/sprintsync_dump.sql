--
-- PostgreSQL database dump
--

\restrict jb5TvlOpKHpTmy2VQyrWjfkDucB3jbLGCaX22Z58S0832bQXa0AwUBGJbyeEdS2

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.workflow_lanes DROP CONSTRAINT IF EXISTS workflow_lanes_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.workflow_lanes DROP CONSTRAINT IF EXISTS workflow_lanes_board_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_domain_id_fkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS todos_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS todos_related_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS todos_related_story_id_fkey;
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS todos_related_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_entries DROP CONSTRAINT IF EXISTS time_entries_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_entries DROP CONSTRAINT IF EXISTS time_entries_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_entries DROP CONSTRAINT IF EXISTS time_entries_subtask_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_entries DROP CONSTRAINT IF EXISTS time_entries_story_id_fkey;
ALTER TABLE IF EXISTS ONLY public.time_entries DROP CONSTRAINT IF EXISTS time_entries_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_story_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_reporter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.subtasks DROP CONSTRAINT IF EXISTS subtasks_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.subtasks DROP CONSTRAINT IF EXISTS subtasks_assignee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stories DROP CONSTRAINT IF EXISTS stories_sprint_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stories DROP CONSTRAINT IF EXISTS stories_reporter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stories DROP CONSTRAINT IF EXISTS stories_release_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stories DROP CONSTRAINT IF EXISTS stories_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stories DROP CONSTRAINT IF EXISTS stories_epic_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stories DROP CONSTRAINT IF EXISTS stories_assignee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stakeholders DROP CONSTRAINT IF EXISTS stakeholders_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sprints DROP CONSTRAINT IF EXISTS sprints_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.risks DROP CONSTRAINT IF EXISTS risks_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.risks DROP CONSTRAINT IF EXISTS risks_owner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.requirements DROP CONSTRAINT IF EXISTS requirements_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reports DROP CONSTRAINT IF EXISTS reports_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reports DROP CONSTRAINT IF EXISTS reports_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.releases DROP CONSTRAINT IF EXISTS releases_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.releases DROP CONSTRAINT IF EXISTS releases_created_by_fkey;
ALTER TABLE IF EXISTS ONLY public.quality_gates DROP CONSTRAINT IF EXISTS quality_gates_release_id_fkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_team_members DROP CONSTRAINT IF EXISTS project_team_members_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_team_members DROP CONSTRAINT IF EXISTS project_team_members_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_integrations DROP CONSTRAINT IF EXISTS project_integrations_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.project_integrations DROP CONSTRAINT IF EXISTS project_integrations_integration_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pending_registrations DROP CONSTRAINT IF EXISTS pending_registrations_domain_id_fkey;
ALTER TABLE IF EXISTS ONLY public.pending_registrations DROP CONSTRAINT IF EXISTS pending_registrations_department_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.milestones DROP CONSTRAINT IF EXISTS milestones_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.issues DROP CONSTRAINT IF EXISTS issues_story_id_fkey;
ALTER TABLE IF EXISTS ONLY public.issues DROP CONSTRAINT IF EXISTS issues_reporter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.issues DROP CONSTRAINT IF EXISTS issues_assignee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.subtasks DROP CONSTRAINT IF EXISTS fk_subtasks_issue_id;
ALTER TABLE IF EXISTS ONLY public.epics DROP CONSTRAINT IF EXISTS epics_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.epics DROP CONSTRAINT IF EXISTS epics_owner_fkey;
ALTER TABLE IF EXISTS ONLY public.epics DROP CONSTRAINT IF EXISTS epics_assignee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_parent_comment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.boards DROP CONSTRAINT IF EXISTS boards_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_tasks DROP CONSTRAINT IF EXISTS backlog_tasks_reporter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_tasks DROP CONSTRAINT IF EXISTS backlog_tasks_original_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_tasks DROP CONSTRAINT IF EXISTS backlog_tasks_backlog_story_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_tasks DROP CONSTRAINT IF EXISTS backlog_tasks_assignee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_subtasks DROP CONSTRAINT IF EXISTS backlog_subtasks_original_subtask_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_subtasks DROP CONSTRAINT IF EXISTS backlog_subtasks_backlog_task_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_subtasks DROP CONSTRAINT IF EXISTS backlog_subtasks_assignee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_stories DROP CONSTRAINT IF EXISTS backlog_stories_reporter_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_stories DROP CONSTRAINT IF EXISTS backlog_stories_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_stories DROP CONSTRAINT IF EXISTS backlog_stories_original_story_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_stories DROP CONSTRAINT IF EXISTS backlog_stories_original_sprint_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_stories DROP CONSTRAINT IF EXISTS backlog_stories_created_from_sprint_id_fkey;
ALTER TABLE IF EXISTS ONLY public.backlog_stories DROP CONSTRAINT IF EXISTS backlog_stories_assignee_id_fkey;
ALTER TABLE IF EXISTS ONLY public.attachments DROP CONSTRAINT IF EXISTS attachments_uploaded_by_fkey;
ALTER TABLE IF EXISTS ONLY public.ai_insights DROP CONSTRAINT IF EXISTS ai_insights_project_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_todos_updated_at ON public.todos;
DROP TRIGGER IF EXISTS update_time_entries_updated_at ON public.time_entries;
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS update_task_progress_from_subtasks_trigger ON public.subtasks;
DROP TRIGGER IF EXISTS update_subtasks_updated_at ON public.subtasks;
DROP TRIGGER IF EXISTS update_stories_updated_at ON public.stories;
DROP TRIGGER IF EXISTS update_stakeholders_updated_at ON public.stakeholders;
DROP TRIGGER IF EXISTS update_sprints_updated_at ON public.sprints;
DROP TRIGGER IF EXISTS update_risks_updated_at ON public.risks;
DROP TRIGGER IF EXISTS update_requirements_updated_at ON public.requirements;
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS update_project_integrations_updated_at ON public.project_integrations;
DROP TRIGGER IF EXISTS update_milestones_updated_at ON public.milestones;
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
DROP TRIGGER IF EXISTS time_entry_rollup_trigger ON public.time_entries;
DROP TRIGGER IF EXISTS time_entry_notification_trigger ON public.time_entries;
DROP TRIGGER IF EXISTS task_status_notification_trigger ON public.tasks;
DROP TRIGGER IF EXISTS notifications_updated_at_trigger ON public.notifications;
DROP INDEX IF EXISTS public.unique_project_board_lane_order_idx;
DROP INDEX IF EXISTS public.unique_project_board_lane_order;
DROP INDEX IF EXISTS public.idx_workflow_lanes_project_id;
DROP INDEX IF EXISTS public.idx_workflow_lanes_project_board;
DROP INDEX IF EXISTS public.idx_workflow_lanes_display_order;
DROP INDEX IF EXISTS public.idx_workflow_lanes_board_id;
DROP INDEX IF EXISTS public.idx_users_role;
DROP INDEX IF EXISTS public.idx_users_email;
DROP INDEX IF EXISTS public.idx_users_domain;
DROP INDEX IF EXISTS public.idx_users_department;
DROP INDEX IF EXISTS public.idx_users_active;
DROP INDEX IF EXISTS public.idx_time_entries_user;
DROP INDEX IF EXISTS public.idx_time_entries_task_id;
DROP INDEX IF EXISTS public.idx_time_entries_story_id;
DROP INDEX IF EXISTS public.idx_time_entries_project;
DROP INDEX IF EXISTS public.idx_time_entries_date;
DROP INDEX IF EXISTS public.idx_tasks_story_task_number;
DROP INDEX IF EXISTS public.idx_tasks_story;
DROP INDEX IF EXISTS public.idx_tasks_status;
DROP INDEX IF EXISTS public.idx_tasks_is_pulled_from_backlog;
DROP INDEX IF EXISTS public.idx_tasks_assignee;
DROP INDEX IF EXISTS public.idx_subtasks_task;
DROP INDEX IF EXISTS public.idx_subtasks_severity;
DROP INDEX IF EXISTS public.idx_subtasks_issue_id;
DROP INDEX IF EXISTS public.idx_subtasks_completed;
DROP INDEX IF EXISTS public.idx_subtasks_bug_type;
DROP INDEX IF EXISTS public.idx_subtasks_assignee;
DROP INDEX IF EXISTS public.idx_stories_status;
DROP INDEX IF EXISTS public.idx_stories_sprint;
DROP INDEX IF EXISTS public.idx_stories_release;
DROP INDEX IF EXISTS public.idx_stories_project;
DROP INDEX IF EXISTS public.idx_stories_parent_id;
DROP INDEX IF EXISTS public.idx_stories_epic;
DROP INDEX IF EXISTS public.idx_stories_assignee;
DROP INDEX IF EXISTS public.idx_sprints_status;
DROP INDEX IF EXISTS public.idx_sprints_project;
DROP INDEX IF EXISTS public.idx_sprints_active;
DROP INDEX IF EXISTS public.idx_releases_target_date;
DROP INDEX IF EXISTS public.idx_releases_status;
DROP INDEX IF EXISTS public.idx_releases_project;
DROP INDEX IF EXISTS public.idx_releases_created_by;
DROP INDEX IF EXISTS public.idx_quality_gates_status;
DROP INDEX IF EXISTS public.idx_quality_gates_release;
DROP INDEX IF EXISTS public.idx_projects_status;
DROP INDEX IF EXISTS public.idx_projects_manager;
DROP INDEX IF EXISTS public.idx_projects_department;
DROP INDEX IF EXISTS public.idx_projects_active;
DROP INDEX IF EXISTS public.idx_project_team_user;
DROP INDEX IF EXISTS public.idx_project_team_project;
DROP INDEX IF EXISTS public.idx_pending_registrations_email;
DROP INDEX IF EXISTS public.idx_notifications_user;
DROP INDEX IF EXISTS public.idx_notifications_type;
DROP INDEX IF EXISTS public.idx_notifications_read;
DROP INDEX IF EXISTS public.idx_issues_story_id;
DROP INDEX IF EXISTS public.idx_issues_status;
DROP INDEX IF EXISTS public.idx_issues_priority;
DROP INDEX IF EXISTS public.idx_issues_due_date;
DROP INDEX IF EXISTS public.idx_issues_created_at;
DROP INDEX IF EXISTS public.idx_issues_assignee_id;
DROP INDEX IF EXISTS public.idx_epics_status;
DROP INDEX IF EXISTS public.idx_epics_project;
DROP INDEX IF EXISTS public.idx_epics_owner;
DROP INDEX IF EXISTS public.idx_epics_assignee;
DROP INDEX IF EXISTS public.idx_comments_user;
DROP INDEX IF EXISTS public.idx_comments_entity;
DROP INDEX IF EXISTS public.idx_boards_project_id;
DROP INDEX IF EXISTS public.idx_boards_is_default;
DROP INDEX IF EXISTS public.idx_backlog_tasks_story;
DROP INDEX IF EXISTS public.idx_backlog_tasks_status;
DROP INDEX IF EXISTS public.idx_backlog_tasks_overdue;
DROP INDEX IF EXISTS public.idx_backlog_tasks_original_task;
DROP INDEX IF EXISTS public.idx_backlog_subtasks_task;
DROP INDEX IF EXISTS public.idx_backlog_subtasks_original_subtask;
DROP INDEX IF EXISTS public.idx_backlog_subtasks_completed;
DROP INDEX IF EXISTS public.idx_backlog_stories_status;
DROP INDEX IF EXISTS public.idx_backlog_stories_project;
DROP INDEX IF EXISTS public.idx_backlog_stories_original_story;
DROP INDEX IF EXISTS public.idx_backlog_stories_original_sprint;
DROP INDEX IF EXISTS public.idx_backlog_stories_created_from_sprint;
DROP INDEX IF EXISTS public.idx_attachments_type;
DROP INDEX IF EXISTS public.idx_activity_logs_user;
DROP INDEX IF EXISTS public.idx_activity_logs_project_id;
DROP INDEX IF EXISTS public.idx_activity_logs_entity;
DROP INDEX IF EXISTS public.idx_activity_logs_created;
ALTER TABLE IF EXISTS ONLY public.workflow_lanes DROP CONSTRAINT IF EXISTS workflow_lanes_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_email_key;
ALTER TABLE IF EXISTS ONLY public.boards DROP CONSTRAINT IF EXISTS unique_project_board_name;
ALTER TABLE IF EXISTS ONLY public.backlog_stories DROP CONSTRAINT IF EXISTS uk_backlog_story_project;
ALTER TABLE IF EXISTS ONLY public.todos DROP CONSTRAINT IF EXISTS todos_pkey;
ALTER TABLE IF EXISTS ONLY public.time_entries DROP CONSTRAINT IF EXISTS time_entries_pkey;
ALTER TABLE IF EXISTS ONLY public.tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.subtasks DROP CONSTRAINT IF EXISTS subtasks_pkey;
ALTER TABLE IF EXISTS ONLY public.stories DROP CONSTRAINT IF EXISTS stories_pkey;
ALTER TABLE IF EXISTS ONLY public.stakeholders DROP CONSTRAINT IF EXISTS stakeholders_pkey;
ALTER TABLE IF EXISTS ONLY public.sprints DROP CONSTRAINT IF EXISTS sprints_pkey;
ALTER TABLE IF EXISTS ONLY public.risks DROP CONSTRAINT IF EXISTS risks_pkey;
ALTER TABLE IF EXISTS ONLY public.requirements DROP CONSTRAINT IF EXISTS requirements_pkey;
ALTER TABLE IF EXISTS ONLY public.reports DROP CONSTRAINT IF EXISTS reports_pkey;
ALTER TABLE IF EXISTS ONLY public.releases DROP CONSTRAINT IF EXISTS releases_pkey;
ALTER TABLE IF EXISTS ONLY public.quality_gates DROP CONSTRAINT IF EXISTS quality_gates_pkey;
ALTER TABLE IF EXISTS ONLY public.projects DROP CONSTRAINT IF EXISTS projects_pkey;
ALTER TABLE IF EXISTS ONLY public.project_team_members DROP CONSTRAINT IF EXISTS project_team_members_project_id_user_id_key;
ALTER TABLE IF EXISTS ONLY public.project_team_members DROP CONSTRAINT IF EXISTS project_team_members_pkey;
ALTER TABLE IF EXISTS ONLY public.project_integrations DROP CONSTRAINT IF EXISTS project_integrations_project_id_integration_id_key;
ALTER TABLE IF EXISTS ONLY public.project_integrations DROP CONSTRAINT IF EXISTS project_integrations_pkey;
ALTER TABLE IF EXISTS ONLY public.pending_registrations DROP CONSTRAINT IF EXISTS pending_registrations_pkey;
ALTER TABLE IF EXISTS ONLY public.pending_registrations DROP CONSTRAINT IF EXISTS pending_registrations_email_key;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.milestones DROP CONSTRAINT IF EXISTS milestones_pkey;
ALTER TABLE IF EXISTS ONLY public.issues DROP CONSTRAINT IF EXISTS issues_pkey;
ALTER TABLE IF EXISTS ONLY public.epics DROP CONSTRAINT IF EXISTS epics_pkey;
ALTER TABLE IF EXISTS ONLY public.domains DROP CONSTRAINT IF EXISTS domains_pkey;
ALTER TABLE IF EXISTS ONLY public.domains DROP CONSTRAINT IF EXISTS domains_name_key;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_pkey;
ALTER TABLE IF EXISTS ONLY public.departments DROP CONSTRAINT IF EXISTS departments_name_key;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS ONLY public.boards DROP CONSTRAINT IF EXISTS boards_pkey;
ALTER TABLE IF EXISTS ONLY public.backlog_tasks DROP CONSTRAINT IF EXISTS backlog_tasks_pkey;
ALTER TABLE IF EXISTS ONLY public.backlog_subtasks DROP CONSTRAINT IF EXISTS backlog_subtasks_pkey;
ALTER TABLE IF EXISTS ONLY public.backlog_stories DROP CONSTRAINT IF EXISTS backlog_stories_pkey;
ALTER TABLE IF EXISTS ONLY public.available_integrations DROP CONSTRAINT IF EXISTS available_integrations_pkey;
ALTER TABLE IF EXISTS ONLY public.available_integrations DROP CONSTRAINT IF EXISTS available_integrations_name_key;
ALTER TABLE IF EXISTS ONLY public.attachments DROP CONSTRAINT IF EXISTS attachments_pkey;
ALTER TABLE IF EXISTS ONLY public.ai_insights DROP CONSTRAINT IF EXISTS ai_insights_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_pkey;
DROP TABLE IF EXISTS public.workflow_lanes;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.todos;
DROP TABLE IF EXISTS public.time_entries;
DROP TABLE IF EXISTS public.tasks;
DROP TABLE IF EXISTS public.subtasks;
DROP TABLE IF EXISTS public.stories;
DROP TABLE IF EXISTS public.stakeholders;
DROP TABLE IF EXISTS public.sprints;
DROP TABLE IF EXISTS public.risks;
DROP TABLE IF EXISTS public.requirements;
DROP TABLE IF EXISTS public.reports;
DROP TABLE IF EXISTS public.releases;
DROP TABLE IF EXISTS public.quality_gates;
DROP TABLE IF EXISTS public.projects;
DROP TABLE IF EXISTS public.project_team_members;
DROP TABLE IF EXISTS public.project_integrations;
DROP TABLE IF EXISTS public.pending_registrations;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.milestones;
DROP TABLE IF EXISTS public.issues;
DROP TABLE IF EXISTS public.epics;
DROP TABLE IF EXISTS public.domains;
DROP TABLE IF EXISTS public.departments;
DROP TABLE IF EXISTS public.comments;
DROP TABLE IF EXISTS public.boards;
DROP TABLE IF EXISTS public.backlog_tasks;
DROP TABLE IF EXISTS public.backlog_subtasks;
DROP TABLE IF EXISTS public.backlog_stories;
DROP TABLE IF EXISTS public.available_integrations;
DROP TABLE IF EXISTS public.attachments;
DROP TABLE IF EXISTS public.ai_insights;
DROP TABLE IF EXISTS public.activity_logs;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.update_task_progress_from_subtasks();
DROP FUNCTION IF EXISTS public.update_notifications_updated_at();
DROP FUNCTION IF EXISTS public.update_actual_hours();
DROP FUNCTION IF EXISTS public.notify_time_entry_change();
DROP FUNCTION IF EXISTS public.notify_task_status_change();
DROP TYPE IF EXISTS public.user_role;
DROP TYPE IF EXISTS public.todo_status;
DROP TYPE IF EXISTS public.todo_priority;
DROP TYPE IF EXISTS public.time_entry_type;
DROP TYPE IF EXISTS public.task_status;
DROP TYPE IF EXISTS public.task_priority;
DROP TYPE IF EXISTS public.story_status;
DROP TYPE IF EXISTS public.story_priority;
DROP TYPE IF EXISTS public.sprint_status;
DROP TYPE IF EXISTS public.risk_status;
DROP TYPE IF EXISTS public.risk_probability;
DROP TYPE IF EXISTS public.risk_impact;
DROP TYPE IF EXISTS public.requirement_type;
DROP TYPE IF EXISTS public.requirement_status;
DROP TYPE IF EXISTS public.report_type;
DROP TYPE IF EXISTS public.release_status;
DROP TYPE IF EXISTS public.quality_gate_status;
DROP TYPE IF EXISTS public.project_template;
DROP TYPE IF EXISTS public.project_status;
DROP TYPE IF EXISTS public.project_priority;
DROP TYPE IF EXISTS public.project_methodology;
DROP TYPE IF EXISTS public.notification_type;
DROP TYPE IF EXISTS public.notification_priority;
DROP TYPE IF EXISTS public.milestone_status;
DROP TYPE IF EXISTS public.integration_type;
DROP TYPE IF EXISTS public.experience_level;
DROP TYPE IF EXISTS public.epic_status;
DROP TYPE IF EXISTS public.ai_insight_type;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS pgcrypto;
--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: ai_insight_type; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.ai_insight_type AS ENUM (
    'productivity',
    'risk_assessment',
    'resource_optimization',
    'timeline_prediction',
    'quality_metrics'
);


ALTER TYPE public.ai_insight_type OWNER TO avnadmin;

--
-- Name: epic_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.epic_status AS ENUM (
    'backlog',
    'planning',
    'in-progress',
    'review',
    'completed',
    'cancelled'
);


ALTER TYPE public.epic_status OWNER TO avnadmin;

--
-- Name: experience_level; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.experience_level AS ENUM (
    'junior',
    'mid',
    'senior',
    'lead',
    'E1',
    'E2',
    'M1',
    'M2',
    'M3',
    'L1',
    'L2',
    'L3',
    'S1'
);


ALTER TYPE public.experience_level OWNER TO avnadmin;

--
-- Name: integration_type; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.integration_type AS ENUM (
    'version_control',
    'communication',
    'storage',
    'project_management',
    'documentation'
);


ALTER TYPE public.integration_type OWNER TO avnadmin;

--
-- Name: milestone_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.milestone_status AS ENUM (
    'upcoming',
    'in_progress',
    'completed',
    'delayed'
);


ALTER TYPE public.milestone_status OWNER TO avnadmin;

--
-- Name: notification_priority; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.notification_priority AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


ALTER TYPE public.notification_priority OWNER TO avnadmin;

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.notification_type AS ENUM (
    'system',
    'project',
    'task',
    'mention',
    'reminder',
    'ai_insight'
);


ALTER TYPE public.notification_type OWNER TO avnadmin;

--
-- Name: project_methodology; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.project_methodology AS ENUM (
    'scrum',
    'kanban',
    'waterfall'
);


ALTER TYPE public.project_methodology OWNER TO avnadmin;

--
-- Name: project_priority; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.project_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE public.project_priority OWNER TO avnadmin;

--
-- Name: project_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.project_status AS ENUM (
    'planning',
    'active',
    'paused',
    'completed',
    'cancelled'
);


ALTER TYPE public.project_status OWNER TO avnadmin;

--
-- Name: project_template; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.project_template AS ENUM (
    'web-app',
    'mobile-app',
    'api-service',
    'data-analytics'
);


ALTER TYPE public.project_template OWNER TO avnadmin;

--
-- Name: quality_gate_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.quality_gate_status AS ENUM (
    'pending',
    'passed',
    'failed'
);


ALTER TYPE public.quality_gate_status OWNER TO avnadmin;

--
-- Name: release_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.release_status AS ENUM (
    'planning',
    'development',
    'testing',
    'staging',
    'ready-for-release',
    'released',
    'cancelled'
);


ALTER TYPE public.release_status OWNER TO avnadmin;

--
-- Name: report_type; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.report_type AS ENUM (
    'sprint_burndown',
    'velocity_chart',
    'team_productivity',
    'project_overview',
    'time_analysis',
    'custom'
);


ALTER TYPE public.report_type OWNER TO avnadmin;

--
-- Name: requirement_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.requirement_status AS ENUM (
    'draft',
    'approved',
    'in-development',
    'completed'
);


ALTER TYPE public.requirement_status OWNER TO avnadmin;

--
-- Name: requirement_type; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.requirement_type AS ENUM (
    'functional',
    'non-functional',
    'technical'
);


ALTER TYPE public.requirement_type OWNER TO avnadmin;

--
-- Name: risk_impact; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.risk_impact AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.risk_impact OWNER TO avnadmin;

--
-- Name: risk_probability; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.risk_probability AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.risk_probability OWNER TO avnadmin;

--
-- Name: risk_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.risk_status AS ENUM (
    'identified',
    'mitigated',
    'closed'
);


ALTER TYPE public.risk_status OWNER TO avnadmin;

--
-- Name: sprint_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.sprint_status AS ENUM (
    'planning',
    'active',
    'completed',
    'cancelled'
);


ALTER TYPE public.sprint_status OWNER TO avnadmin;

--
-- Name: story_priority; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.story_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE public.story_priority OWNER TO avnadmin;

--
-- Name: story_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.story_status AS ENUM (
    'backlog',
    'to_do',
    'in_progress',
    'qa_review',
    'done'
);


ALTER TYPE public.story_status OWNER TO avnadmin;

--
-- Name: task_priority; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.task_priority AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);


ALTER TYPE public.task_priority OWNER TO avnadmin;

--
-- Name: task_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.task_status AS ENUM (
    'to_do',
    'in_progress',
    'qa_review',
    'done'
);


ALTER TYPE public.task_status OWNER TO avnadmin;

--
-- Name: time_entry_type; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.time_entry_type AS ENUM (
    'development',
    'testing',
    'design',
    'meeting',
    'research',
    'documentation',
    'review'
);


ALTER TYPE public.time_entry_type OWNER TO avnadmin;

--
-- Name: todo_priority; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.todo_priority AS ENUM (
    'low',
    'medium',
    'high'
);


ALTER TYPE public.todo_priority OWNER TO avnadmin;

--
-- Name: todo_status; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.todo_status AS ENUM (
    'pending',
    'in_progress',
    'completed'
);


ALTER TYPE public.todo_status OWNER TO avnadmin;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: avnadmin
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'manager',
    'developer',
    'qa'
);


ALTER TYPE public.user_role OWNER TO avnadmin;

--
-- Name: notify_task_status_change(); Type: FUNCTION; Schema: public; Owner: avnadmin
--

CREATE FUNCTION public.notify_task_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    story_title TEXT;
    project_id_var VARCHAR(255);  -- Renamed to avoid ambiguity
BEGIN
    -- Get context information
    SELECT s.title, s.project_id INTO story_title, project_id_var
    FROM stories s WHERE s.id = NEW.story_id;
    
    -- Notify when moved to QA review
    IF OLD.status != 'QA_REVIEW' AND NEW.status = 'QA_REVIEW' THEN
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
        WHERE ptm.project_id = project_id_var  -- Use the variable instead of ambiguous reference
            AND ptm.left_at IS NULL
            AND u.domain_id = (SELECT id FROM domains WHERE name = 'Testing')
            AND u.is_active = true;
    END IF;
    
    -- Notify when QA completes review
    IF OLD.status = 'QA_REVIEW' AND NEW.status = 'DONE' THEN
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
$$;


ALTER FUNCTION public.notify_task_status_change() OWNER TO avnadmin;

--
-- Name: notify_time_entry_change(); Type: FUNCTION; Schema: public; Owner: avnadmin
--

CREATE FUNCTION public.notify_time_entry_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Simple notification function for time entry changes
    PERFORM pg_notify('time_entry_change', NEW.id::text);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_time_entry_change() OWNER TO avnadmin;

--
-- Name: update_actual_hours(); Type: FUNCTION; Schema: public; Owner: avnadmin
--

CREATE FUNCTION public.update_actual_hours() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_task_id VARCHAR(255);
    old_story_id VARCHAR(255);
    new_task_id VARCHAR(255);
    new_story_id VARCHAR(255);
BEGIN
    -- Handle DELETE operation
    IF TG_OP = 'DELETE' THEN
        old_task_id := OLD.task_id;
        old_story_id := OLD.story_id;
        
        -- Update task actual_hours
        IF old_task_id IS NOT NULL THEN
            UPDATE tasks 
            SET actual_hours = COALESCE((
                SELECT SUM(hours_worked) 
                FROM time_entries 
                WHERE task_id = old_task_id
            ), 0)
            WHERE id = old_task_id;
        END IF;
        
        -- Update story actual_hours
        IF old_story_id IS NOT NULL THEN
            UPDATE stories 
            SET actual_hours = COALESCE((
                SELECT SUM(hours_worked) 
                FROM time_entries 
                WHERE story_id = old_story_id
            ), 0)
            WHERE id = old_story_id;
        END IF;
        
        RETURN OLD;
    
    -- Handle UPDATE operation
    ELSIF TG_OP = 'UPDATE' THEN
        old_task_id := OLD.task_id;
        old_story_id := OLD.story_id;
        new_task_id := NEW.task_id;
        new_story_id := NEW.story_id;
        
        -- Handle task_id changes
        IF old_task_id IS DISTINCT FROM new_task_id THEN
            -- Update old task (remove hours from old task)
            IF old_task_id IS NOT NULL THEN
                UPDATE tasks 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE task_id = old_task_id
                ), 0)
                WHERE id = old_task_id;
            END IF;
            
            -- Update new task (add hours to new task)
            IF new_task_id IS NOT NULL THEN
                UPDATE tasks 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE task_id = new_task_id
                ), 0)
                WHERE id = new_task_id;
            END IF;
        ELSE
            -- Task ID didn't change, just recalculate (hours_worked might have changed)
            IF new_task_id IS NOT NULL THEN
                UPDATE tasks 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE task_id = new_task_id
                ), 0)
                WHERE id = new_task_id;
            END IF;
        END IF;
        
        -- Handle story_id changes
        IF old_story_id IS DISTINCT FROM new_story_id THEN
            -- Update old story (remove hours from old story)
            IF old_story_id IS NOT NULL THEN
                UPDATE stories 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE story_id = old_story_id
                ), 0)
                WHERE id = old_story_id;
            END IF;
            
            -- Update new story (add hours to new story)
            IF new_story_id IS NOT NULL THEN
                UPDATE stories 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE story_id = new_story_id
                ), 0)
                WHERE id = new_story_id;
            END IF;
        ELSE
            -- Story ID didn't change, just recalculate (hours_worked might have changed)
            IF new_story_id IS NOT NULL THEN
                UPDATE stories 
                SET actual_hours = COALESCE((
                    SELECT SUM(hours_worked) 
                    FROM time_entries 
                    WHERE story_id = new_story_id
                ), 0)
                WHERE id = new_story_id;
            END IF;
        END IF;
        
        RETURN NEW;
    
    -- Handle INSERT operation
    ELSE
        new_task_id := NEW.task_id;
        new_story_id := NEW.story_id;
        
        -- Update task actual_hours
        IF new_task_id IS NOT NULL THEN
            UPDATE tasks 
            SET actual_hours = COALESCE((
                SELECT SUM(hours_worked) 
                FROM time_entries 
                WHERE task_id = new_task_id
            ), 0)
            WHERE id = new_task_id;
        END IF;
        
        -- Update story actual_hours
        IF new_story_id IS NOT NULL THEN
            UPDATE stories 
            SET actual_hours = COALESCE((
                SELECT SUM(hours_worked) 
                FROM time_entries 
                WHERE story_id = new_story_id
            ), 0)
            WHERE id = new_story_id;
        END IF;
        
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION public.update_actual_hours() OWNER TO avnadmin;

--
-- Name: FUNCTION update_actual_hours(); Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON FUNCTION public.update_actual_hours() IS 'Automatically updates actual_hours in tasks and stories tables when time entries are inserted, updated, or deleted';


--
-- Name: update_notifications_updated_at(); Type: FUNCTION; Schema: public; Owner: avnadmin
--

CREATE FUNCTION public.update_notifications_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_notifications_updated_at() OWNER TO avnadmin;

--
-- Name: update_task_progress_from_subtasks(); Type: FUNCTION; Schema: public; Owner: avnadmin
--

CREATE FUNCTION public.update_task_progress_from_subtasks() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


ALTER FUNCTION public.update_task_progress_from_subtasks() OWNER TO avnadmin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: avnadmin
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO avnadmin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.activity_logs (
    id character varying(36) DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying(32),
    entity_type character varying(50) NOT NULL,
    entity_id character varying(36) NOT NULL,
    action character varying(100) NOT NULL,
    old_values text,
    new_values text,
    description text,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp with time zone DEFAULT now(),
    project_id character varying(255)
);


ALTER TABLE public.activity_logs OWNER TO avnadmin;

--
-- Name: TABLE activity_logs; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.activity_logs IS 'Audit trail for all system changes';


--
-- Name: ai_insights; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.ai_insights (
    id character varying(32) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(32),
    type public.ai_insight_type,
    title character varying(255) NOT NULL,
    description text,
    metrics jsonb DEFAULT '{}'::jsonb,
    recommendations jsonb DEFAULT '[]'::jsonb,
    confidence_score numeric(3,2),
    is_active boolean DEFAULT true,
    generated_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    CONSTRAINT ai_insights_confidence_score_check CHECK (((confidence_score >= (0)::numeric) AND (confidence_score <= (1)::numeric)))
);


ALTER TABLE public.ai_insights OWNER TO avnadmin;

--
-- Name: TABLE ai_insights; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.ai_insights IS 'AI-generated insights and recommendations';


--
-- Name: attachments; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.attachments (
    id character varying(36) DEFAULT public.uuid_generate_v4() NOT NULL,
    uploaded_by character varying(32),
    entity_type character varying(50) NOT NULL,
    entity_id character varying(36) NOT NULL,
    file_name character varying(255),
    file_size bigint,
    file_type character varying(100),
    file_url text,
    thumbnail_url text,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    link_url text,
    attachment_type character varying(20) DEFAULT 'file'::character varying NOT NULL,
    CONSTRAINT attachments_attachment_type_check CHECK (((attachment_type)::text = ANY (ARRAY[('file'::character varying)::text, ('url'::character varying)::text])))
);


ALTER TABLE public.attachments OWNER TO avnadmin;

--
-- Name: COLUMN attachments.link_url; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.attachments.link_url IS 'Optional external link associated with the attachment';


--
-- Name: available_integrations; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.available_integrations (
    id character varying(32) DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    type public.integration_type,
    description text,
    icon_url text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.available_integrations OWNER TO avnadmin;

--
-- Name: backlog_stories; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.backlog_stories (
    id character varying(255) DEFAULT (public.uuid_generate_v4())::character varying NOT NULL,
    project_id character varying(255) NOT NULL,
    original_story_id character varying(255),
    original_sprint_id character varying(255),
    title character varying(255) NOT NULL,
    description text,
    acceptance_criteria jsonb DEFAULT '[]'::jsonb,
    status public.story_status DEFAULT 'backlog'::public.story_status,
    priority public.story_priority DEFAULT 'medium'::public.story_priority,
    story_points integer,
    assignee_id character varying(255),
    reporter_id character varying(255),
    epic_id character varying(255),
    release_id character varying(255),
    labels jsonb DEFAULT '[]'::jsonb,
    order_index integer DEFAULT 0,
    actual_hours numeric(5,2) DEFAULT 0,
    created_from_sprint_id character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    due_date date,
    CONSTRAINT backlog_stories_story_points_check CHECK ((story_points >= 0))
);


ALTER TABLE public.backlog_stories OWNER TO avnadmin;

--
-- Name: COLUMN backlog_stories.due_date; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.backlog_stories.due_date IS 'Due date for the backlog story (replaces estimated_hours)';


--
-- Name: backlog_subtasks; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.backlog_subtasks (
    id character varying(255) DEFAULT (public.uuid_generate_v4())::character varying NOT NULL,
    backlog_task_id character varying(255) NOT NULL,
    original_subtask_id character varying(255),
    title character varying(255) NOT NULL,
    description text,
    is_completed boolean DEFAULT false,
    assignee_id character varying(255),
    estimated_hours numeric(5,2),
    actual_hours numeric(5,2) DEFAULT 0,
    order_index integer DEFAULT 0,
    due_date date,
    bug_type character varying(50),
    severity character varying(20),
    category character varying(50),
    labels jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.backlog_subtasks OWNER TO avnadmin;

--
-- Name: backlog_tasks; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.backlog_tasks (
    id character varying(255) DEFAULT (public.uuid_generate_v4())::character varying NOT NULL,
    backlog_story_id character varying(255) NOT NULL,
    original_task_id character varying(255),
    title character varying(255) NOT NULL,
    description text,
    status public.task_status DEFAULT 'to_do'::public.task_status,
    priority public.task_priority DEFAULT 'medium'::public.task_priority,
    assignee_id character varying(255),
    reporter_id character varying(255),
    estimated_hours numeric(5,2),
    actual_hours numeric(5,2) DEFAULT 0,
    order_index integer DEFAULT 0,
    task_number integer,
    due_date date,
    labels jsonb DEFAULT '[]'::jsonb,
    is_overdue boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.backlog_tasks OWNER TO avnadmin;

--
-- Name: boards; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.boards (
    id character varying(255) NOT NULL,
    project_id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.boards OWNER TO avnadmin;

--
-- Name: TABLE boards; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.boards IS 'Scrum boards for projects - allows multiple boards per project';


--
-- Name: COLUMN boards.is_default; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.boards.is_default IS 'Indicates if this is the default board for the project';


--
-- Name: comments; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.comments (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying(255),
    entity_type character varying(255) NOT NULL,
    entity_id character varying(255) NOT NULL,
    content text NOT NULL,
    parent_comment_id character varying(255),
    is_edited boolean DEFAULT false,
    edited_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.comments OWNER TO avnadmin;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.departments (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.departments OWNER TO avnadmin;

--
-- Name: domains; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.domains (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.domains OWNER TO avnadmin;

--
-- Name: epics; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.epics (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(255),
    title character varying(255) NOT NULL,
    description text,
    summary text,
    priority character varying(255) DEFAULT 'medium'::public.project_priority,
    status character varying(255) DEFAULT 'backlog'::public.epic_status,
    assignee_id character varying(255),
    owner character varying(255) NOT NULL,
    start_date date,
    end_date date,
    progress integer DEFAULT 0,
    story_points integer DEFAULT 0,
    completed_story_points integer DEFAULT 0,
    linked_milestones text DEFAULT '[]'::jsonb,
    linked_stories text DEFAULT '[]'::jsonb,
    labels text DEFAULT '[]'::jsonb,
    components text DEFAULT '[]'::jsonb,
    theme character varying(255),
    business_value text,
    acceptance_criteria text DEFAULT '[]'::jsonb,
    risks text DEFAULT '[]'::jsonb,
    dependencies text DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    CONSTRAINT epics_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


ALTER TABLE public.epics OWNER TO avnadmin;

--
-- Name: issues; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.issues (
    id character varying(36) NOT NULL,
    story_id character varying(36) NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'TO_DO'::character varying NOT NULL,
    priority character varying(20) DEFAULT 'MEDIUM'::character varying NOT NULL,
    assignee_id character varying(36),
    reporter_id character varying(36),
    estimated_hours numeric(5,2),
    actual_hours numeric(5,2) DEFAULT 0,
    order_index integer DEFAULT 0,
    issue_number integer,
    due_date date,
    labels jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.issues OWNER TO avnadmin;

--
-- Name: TABLE issues; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.issues IS 'Issues table - similar to tasks but without template functionality';


--
-- Name: COLUMN issues.id; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.issues.id IS 'Primary key - 36 character ID with ISSU prefix';


--
-- Name: COLUMN issues.story_id; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.issues.story_id IS 'Foreign key to stories table';


--
-- Name: COLUMN issues.status; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.issues.status IS 'Issue status (TO_DO, IN_PROGRESS, QA_REVIEW, DONE, BLOCKED, CANCELLED)';


--
-- Name: COLUMN issues.priority; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.issues.priority IS 'Issue priority (LOW, MEDIUM, HIGH, CRITICAL)';


--
-- Name: COLUMN issues.issue_number; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.issues.issue_number IS 'Sequential issue number within a story';


--
-- Name: milestones; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.milestones (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(255),
    title character varying(255) NOT NULL,
    description text,
    status character varying(255) DEFAULT 'upcoming'::public.milestone_status,
    due_date date,
    completion_date date,
    progress_percentage integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT milestones_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100)))
);


ALTER TABLE public.milestones OWNER TO avnadmin;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.notifications (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying(255),
    type character varying(255) DEFAULT 'system'::public.notification_type,
    priority public.notification_priority DEFAULT 'normal'::public.notification_priority,
    title character varying(255) NOT NULL,
    message text,
    related_entity_type character varying(255),
    related_entity_id character varying(255),
    action_url text,
    is_read boolean DEFAULT false,
    is_archived boolean DEFAULT false,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    read_at timestamp(6) without time zone,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO avnadmin;

--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.notifications IS 'Real-time notification system';


--
-- Name: pending_registrations; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.pending_registrations (
    id character varying(32) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    department_id character varying(255),
    domain_id character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.pending_registrations OWNER TO avnadmin;

--
-- Name: project_integrations; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.project_integrations (
    id character varying(32) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(32),
    integration_id character varying(32),
    is_enabled boolean DEFAULT true,
    configuration text DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.project_integrations OWNER TO avnadmin;

--
-- Name: project_team_members; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.project_team_members (
    id character varying(36) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(32),
    user_id character varying(32),
    role character varying(100),
    is_team_lead boolean DEFAULT false,
    allocation_percentage integer DEFAULT 100,
    joined_at timestamp with time zone DEFAULT now(),
    left_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT project_team_members_allocation_percentage_check CHECK (((allocation_percentage >= 0) AND (allocation_percentage <= 100)))
);


ALTER TABLE public.project_team_members OWNER TO avnadmin;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.projects (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    status character varying(255) DEFAULT 'planning'::public.project_status,
    priority character varying(255) DEFAULT 'medium'::public.project_priority,
    methodology character varying(255) DEFAULT 'scrum'::public.project_methodology,
    template character varying(255),
    department_id character varying(255),
    manager_id character varying(255),
    start_date date,
    end_date date,
    budget numeric(15,2),
    spent numeric(15,2) DEFAULT 0,
    progress_percentage integer DEFAULT 0,
    scope text,
    success_criteria text DEFAULT '[]'::jsonb,
    objectives text DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    project_type character varying(255) NOT NULL,
    CONSTRAINT projects_progress_percentage_check CHECK (((progress_percentage >= 0) AND (progress_percentage <= 100)))
);


ALTER TABLE public.projects OWNER TO avnadmin;

--
-- Name: TABLE projects; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.projects IS 'Main project entities with agile methodology support';


--
-- Name: COLUMN projects.project_type; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.projects.project_type IS 'Type of project (e.g., web-development, mobile-development, data-analytics)';


--
-- Name: quality_gates; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.quality_gates (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    release_id character varying(255),
    name character varying(255) NOT NULL,
    description text,
    status character varying(255) DEFAULT 'pending'::public.quality_gate_status,
    required boolean DEFAULT true,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.quality_gates OWNER TO avnadmin;

--
-- Name: releases; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.releases (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(255),
    name character varying(255) NOT NULL,
    version character varying(255) NOT NULL,
    description text,
    status character varying(255) DEFAULT 'planning'::public.release_status,
    release_date date,
    target_date date,
    progress integer DEFAULT 0,
    linked_epics text DEFAULT '[]'::jsonb,
    linked_stories text DEFAULT '[]'::jsonb,
    linked_sprints text DEFAULT '[]'::jsonb,
    release_notes text,
    risks text DEFAULT '[]'::jsonb,
    dependencies text DEFAULT '[]'::jsonb,
    created_by character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed_at date,
    CONSTRAINT releases_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


ALTER TABLE public.releases OWNER TO avnadmin;

--
-- Name: reports; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.reports (
    id character varying(32) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(32),
    created_by character varying(32),
    name character varying(255) NOT NULL,
    type public.report_type,
    description text,
    configuration jsonb DEFAULT '{}'::jsonb,
    data jsonb DEFAULT '{}'::jsonb,
    is_shared boolean DEFAULT false,
    scheduled_frequency character varying(20),
    last_generated timestamp with time zone,
    next_generation timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.reports OWNER TO avnadmin;

--
-- Name: requirements; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.requirements (
    id character varying(32) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(32),
    title character varying(255) NOT NULL,
    description text,
    type character varying(50),
    status character varying(50) DEFAULT 'draft'::public.requirement_status,
    priority character varying(50) DEFAULT 'medium'::public.project_priority,
    module character varying(100),
    acceptance_criteria text DEFAULT '[]'::jsonb,
    effort_points integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.requirements OWNER TO avnadmin;

--
-- Name: risks; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.risks (
    id character varying(32) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(32),
    title character varying(255) NOT NULL,
    description text,
    probability character varying(50) DEFAULT 'medium'::public.risk_probability,
    impact character varying(50) DEFAULT 'medium'::public.risk_impact,
    mitigation text,
    status character varying(50) DEFAULT 'identified'::public.risk_status,
    owner_id character varying(32),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.risks OWNER TO avnadmin;

--
-- Name: sprints; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.sprints (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(255),
    name character varying(255) NOT NULL,
    goal text,
    status character varying(255) DEFAULT 'planning'::public.sprint_status,
    start_date date,
    end_date date,
    capacity_hours integer,
    velocity_points integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.sprints OWNER TO avnadmin;

--
-- Name: TABLE sprints; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.sprints IS 'Sprint/iteration management for agile development';


--
-- Name: stakeholders; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.stakeholders (
    id character varying(32) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(32),
    name character varying(255) NOT NULL,
    role character varying(100),
    email character varying(255),
    responsibilities text DEFAULT '[]'::jsonb,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.stakeholders OWNER TO avnadmin;

--
-- Name: stories; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.stories (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    project_id character varying(255),
    sprint_id character varying(255),
    title character varying(255) NOT NULL,
    description text,
    acceptance_criteria text DEFAULT '[]'::jsonb,
    status character varying(255) DEFAULT 'backlog'::public.story_status,
    priority character varying(255) DEFAULT 'medium'::public.story_priority,
    story_points integer,
    assignee_id character varying(255),
    reporter_id character varying(255),
    labels text DEFAULT '[]'::jsonb,
    order_index integer DEFAULT 0,
    actual_hours numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    epic_id character varying(255),
    release_id character varying(255),
    parent_id character varying(255),
    due_date date,
    estimated_hours numeric(5,2),
    CONSTRAINT stories_story_points_check CHECK ((story_points >= 0))
);


ALTER TABLE public.stories OWNER TO avnadmin;

--
-- Name: TABLE stories; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.stories IS 'User stories within projects and sprints';


--
-- Name: COLUMN stories.due_date; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.stories.due_date IS 'Due date for the story (replaces estimated_hours)';


--
-- Name: subtasks; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.subtasks (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    task_id character varying(255),
    title character varying(255) NOT NULL,
    description text,
    is_completed boolean DEFAULT false,
    assignee_id character varying(255),
    estimated_hours numeric(5,2),
    actual_hours numeric(5,2) DEFAULT 0,
    order_index integer DEFAULT 0,
    due_date date,
    bug_type character varying(255),
    severity character varying(255),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    labels text,
    category character varying(50),
    issue_id character varying(255)
);


ALTER TABLE public.subtasks OWNER TO avnadmin;

--
-- Name: TABLE subtasks; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.subtasks IS 'Subtasks with enhanced bug tracking capabilities';


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.tasks (
    id character varying(255) DEFAULT public.uuid_generate_v4() NOT NULL,
    story_id character varying(36),
    title character varying(255) NOT NULL,
    description text,
    status character varying(50) DEFAULT 'to_do'::public.task_status,
    priority character varying(255) DEFAULT 'medium'::public.task_priority,
    assignee_id character varying(255),
    reporter_id character varying(255),
    estimated_hours numeric(5,2),
    actual_hours numeric(5,2) DEFAULT 0,
    order_index integer DEFAULT 0,
    due_date date,
    labels text DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    task_number integer DEFAULT 1 NOT NULL,
    is_pulled_from_backlog boolean DEFAULT false
);


ALTER TABLE public.tasks OWNER TO avnadmin;

--
-- Name: TABLE tasks; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.tasks IS 'Tasks within user stories';


--
-- Name: time_entries; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.time_entries (
    id character varying(36) DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying(32),
    project_id character varying(32),
    story_id character varying(36),
    task_id character varying(36),
    subtask_id character varying(36),
    description text,
    entry_type character varying(50) DEFAULT 'development'::public.time_entry_type,
    hours_worked numeric(5,2) NOT NULL,
    work_date date NOT NULL,
    start_time time without time zone,
    end_time time without time zone,
    is_billable boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT chk_entry_type CHECK (((entry_type)::text = ANY (ARRAY[('DEVELOPMENT'::character varying)::text, ('TESTING'::character varying)::text, ('DESIGN'::character varying)::text, ('REVIEW'::character varying)::text, ('MEETING'::character varying)::text, ('RESEARCH'::character varying)::text, ('DOCUMENTATION'::character varying)::text, ('BUG_FIX'::character varying)::text, ('REFACTORING'::character varying)::text, ('DEPLOYMENT'::character varying)::text, ('TRAINING'::character varying)::text, ('ADMINISTRATIVE'::character varying)::text]))),
    CONSTRAINT time_entries_hours_worked_check CHECK ((hours_worked > (0)::numeric))
);


ALTER TABLE public.time_entries OWNER TO avnadmin;

--
-- Name: TABLE time_entries; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.time_entries IS 'Time tracking for productivity monitoring';


--
-- Name: todos; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.todos (
    id character varying(36) DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id character varying(32),
    title character varying(255) NOT NULL,
    description text,
    priority public.todo_priority DEFAULT 'medium'::public.todo_priority,
    status public.todo_status DEFAULT 'pending'::public.todo_status,
    due_date date,
    reminder_date timestamp with time zone,
    tags jsonb DEFAULT '[]'::jsonb,
    related_project_id character varying(32),
    related_story_id character varying(36),
    related_task_id character varying(36),
    order_index integer DEFAULT 0,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.todos OWNER TO avnadmin;

--
-- Name: users; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.users (
    id character varying(32) DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    department_id character varying,
    domain_id character varying(32),
    avatar_url text,
    experience character varying(20) DEFAULT 'E1'::public.experience_level,
    hourly_rate numeric(10,2),
    availability_percentage integer DEFAULT 100,
    skills text DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    ctc numeric(15,2),
    reporting_manager character varying(255),
    date_of_joining date,
    CONSTRAINT users_availability_percentage_check CHECK (((availability_percentage >= 0) AND (availability_percentage <= 100)))
);


ALTER TABLE public.users OWNER TO avnadmin;

--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.users IS 'Application users with role-based access control';


--
-- Name: COLUMN users.ctc; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.users.ctc IS 'Annual Cost To Company (CTC) in the base currency';


--
-- Name: COLUMN users.reporting_manager; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.users.reporting_manager IS 'Name of the reporting manager for the user';


--
-- Name: COLUMN users.date_of_joining; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.users.date_of_joining IS 'Date when the user joined the organization';


--
-- Name: workflow_lanes; Type: TABLE; Schema: public; Owner: avnadmin
--

CREATE TABLE public.workflow_lanes (
    id character varying(255) DEFAULT (gen_random_uuid())::text NOT NULL,
    project_id character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    color character varying(50) DEFAULT '#3B82F6'::character varying NOT NULL,
    objective text,
    wip_limit_enabled boolean DEFAULT false,
    wip_limit integer,
    display_order integer DEFAULT 0 NOT NULL,
    status_value character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    board_id character varying(255)
);


ALTER TABLE public.workflow_lanes OWNER TO avnadmin;

--
-- Name: TABLE workflow_lanes; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TABLE public.workflow_lanes IS 'Custom workflow lanes/columns for Scrum boards';


--
-- Name: COLUMN workflow_lanes.status_value; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.workflow_lanes.status_value IS 'Maps to task/story status value for filtering and drag-drop operations';


--
-- Name: COLUMN workflow_lanes.board_id; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON COLUMN public.workflow_lanes.board_id IS 'Links workflow lane to a specific board (NULL means default board)';


--
-- Data for Name: activity_logs; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.activity_logs (id, user_id, entity_type, entity_id, action, old_values, new_values, description, ip_address, user_agent, created_at, project_id) FROM stdin;
ACTLd4d443224f284e259734af230cdbf0d4	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-26 06:41:07.156047+00	PROJ000000000010
ACTLdaa0a8cdf1c04989ae9ff49930c3e681	USER000000000018	task	TASKbe56aadf47fc42f7b130b403d78956f7	effort_logged	\N	{"hours":4,"description":"Conducted meetings Scrum Master, development leads, and internal users. Finalized interview schedule and gathered requirements. Schedule finalized, sessions completed, and notes consolidated into shared summary.","workDate":"2025-09-03"}	Logged 4h on task "Discoveries & Alignments"	\N	\N	2025-11-27 08:47:57.480157+00	PROJ000000000010
ACTL7281fb2b6a0b401e9024aef2116be73c	USER000000000017	task	TASKbe56aadf47fc42f7b130b403d78956f7	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 08:48:07.197143+00	PROJ000000000010
ACTL458c289228854adea0dfd58baf0f8131	USER000000000018	task	TASK92229f7d6975446f832430d63386fb0f	effort_logged	\N	{"subtaskId":"SUBTfb14ed05ff4e40cb84916ebd8dc1f945","hours":6,"description":"done with changes ","workDate":"2025-11-27"}	Logged 6h on subtask "overall module modification "	\N	\N	2025-11-27 09:29:39.603142+00	PROJ000000000010
ACTLe88886f971eb494d92a4286e4b11c1f2	USER000000000018	task	TASK92229f7d6975446f832430d63386fb0f	effort_logged	\N	{"hours":1,"description":"Done ","workDate":"2025-10-14"}	Logged 1h on task "Team Overview UI modification"	\N	\N	2025-11-27 09:30:46.505985+00	PROJ000000000010
ACTL94f79ce03fb349bf81d424510a614f49	USER000000000019	task	TASK4cbfc35a71ce4fcb8bc66b05c0335bb5	effort_logged	\N	{"hours":8,"description":"QA Logic successfully build ","workDate":"2025-11-05"}	Logged 8h on task "Add QA Logic in Scrum Board to complete task"	\N	\N	2025-12-03 10:15:22.083003+00	PROJ000000000010
ACTL9ae11eac4e0648d3b89ff51b33fb1317	USER000000000017	issue	ISSU8e7b1fb23b3e43efb18475826b2e1e89	created	\N	{"storyId":"STRYccca331fce9a4d7e83f68e2a407a54b0","title":"is","description":"is","status":"TO_DO","priority":"MEDIUM","assigneeId":"USER000000000019","reporterId":"USER000000000017","estimatedHours":4,"actualHours":0,"orderIndex":0,"dueDate":"2025-10-27","labels":[]}	Created issue "is"	\N	\N	2025-11-29 05:06:41.031416+00	PROJ000000000010
ACTL19f1bc3743b9407180466f0e6a1158cb	USER000000000017	task	TASK5c64e12aac7d4364865c1a70399a59c4	effort_logged	\N	{"hours":2,"description":"Dependency types supported, with create/edit/delete actions. Includes visualization via graphs, circular dependency prevention, impact analysis, status-change notifications, and comprehensive dependency reports.","workDate":"2025-11-27"}	Logged 2h on task "Implement Project Dependency Management"	\N	\N	2025-11-27 06:12:09.65106+00	PROJ000000000010
ACTL5d431e9d2b4843a08024bb3dfe1ade71	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-02 07:08:50.728065+00	PROJ000000000010
ACTL6c0ee486a06546bdbf041518f5560d06	USER000000000017	task	TASK4b56151bb4de44198312e31add1617d7	status_changed	{"status":"in_progress"}	{"status":"DONE"}	Changed status from in_progress to DONE	\N	\N	2025-12-05 06:53:25.557763+00	PROJ000000000010
ACTL30a1389a5e82431fab5ea3e1e895eb9b	USER000000000019	task	TASK4c372d304a5c44239eb0ae9abfd06fb7	effort_logged	\N	{"hours":2,"description":"Approve / Reject buttons in permission queue\\n\\nIf approved → activate user + assign role\\n\\nIf rejected → user account stays inactive + logged in audit history","workDate":"2025-10-20"}	Logged 2h on task "Implement Admin Approval Workflow"	\N	\N	2025-12-06 08:58:15.232943+00	PROJ000000000010
ACTL0a7ce49fb71f46fda97869b72d1a2396	USER000000000017	task	TASK8f9d60f81c4c483fa78eccc31677a97a	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 10:07:17.221465+00	PROJ000000000010
ACTL80deb5a85e244431b5d927179fb62489	USER000000000017	task	TASKbb837a5dddcd4b478826d781834f6e80	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:08.951711+00	PROJ000000000010
ACTLe6ce266d874249b297d2a3bd2b89ae91	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	effort_logged	\N	{"hours":8,"description":"method written for api integration and team data binded","workDate":"2025-09-13"}	Logged 8h on task "API Integration and binding for team listing"	\N	\N	2025-11-26 06:41:07.882023+00	PROJ000000000010
ACTL28dc0a88e59949078f151f629e0c5295	USER000000000018	task	TASKbe56aadf47fc42f7b130b403d78956f7	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 08:48:03.427619+00	PROJ000000000010
ACTL9e7981278aab4fffbbd651d6a4d6861d	USER000000000018	task	TASK92229f7d6975446f832430d63386fb0f	time_entry_updated	{"id":"TIME35656fa40aea444c848a759806c36d49","createdAt":"2025-11-27T14:59:36.00403","updatedAt":"2025-11-27T14:59:36.00403","userId":"USER000000000018","projectId":"PROJ000000000010","storyId":"STRY46cd781abc0946dc800201657d99661b","taskId":"TASK92229f7d6975446f832430d63386fb0f","subtaskId":"SUBTfb14ed05ff4e40cb84916ebd8dc1f945","description":"done with changes ","entryType":"development","hoursWorked":6,"workDate":"2025-11-27","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000018","entryType":"development","isBillable":true,"hoursWorked":6,"description":"done with changes","workDate":"2025-10-13","projectId":"PROJ000000000010","storyId":"STRY46cd781abc0946dc800201657d99661b","taskId":"TASK92229f7d6975446f832430d63386fb0f","subtaskId":"SUBTfb14ed05ff4e40cb84916ebd8dc1f945"}	Updated time entry: 6h	\N	\N	2025-11-27 09:29:59.940709+00	PROJ000000000010
ACTL743e845462fd40698b17695b0a0be1a1	USER000000000019	task	TASK7060f5fb81e1413f918f55a31fe4a3af	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 09:13:37.362119+00	PROJ000000000010
ACTL880e93236d57445ca0d4c5b8238451fe	USER000000000017	task	TASKe6683c26cf1d4ce1b158926c04f4e257	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 05:01:26.267014+00	\N
ACTLc15ae193b73342d89143564db660e484	USER000000000017	task	TASK16e067b898a44c73804a690e45b77b42	subtask_updated	{"id":"SUBTb219cfa90a2742fa868f85ff2381f81c","createdAt":"2025-11-27T11:48:01.894454","updatedAt":"2025-11-27T11:48:01.894454","taskId":"TASK16e067b898a44c73804a690e45b77b42","issueId":null,"title":"Implement Project Milestone Management and Tracking","description":"Add milestone reports showing milestone status, timeline adherence, and quality gate compliance. Include milestone templates for common project types.","isCompleted":false,"assigneeId":"USER000000000019","estimatedHours":3,"actualHours":0,"orderIndex":0,"dueDate":null,"bugType":null,"severity":null,"category":"Development","labels":[]}	{"title":"Implement Project Milestone Management and Tracking","description":"Add milestone reports showing milestone status, timeline adherence, and quality gate compliance. Include milestone templates for common project types.","assigneeId":"USER000000000017","estimatedHours":3,"category":"Development"}	Updated subtask "Implement Project Milestone Management and Tracking"	\N	\N	2025-11-27 06:19:00.757155+00	\N
ACTL9232bc933c28445c997e9fa43b75cb61	USER000000000017	issue	ISSUcbe139a318604b31a6f92a6858925b38	created	\N	{"storyId":"STRY3ee097850750483e9ac6fa99a8391fcd","title":"UI Changes","description":"minor","status":"TO_DO","priority":"MEDIUM","assigneeId":"USER000000000018","reporterId":"USER000000000017","estimatedHours":4,"actualHours":0,"orderIndex":0,"dueDate":"2025-11-14","labels":[]}	Created issue "UI Changes"	\N	\N	2025-12-06 11:37:50.051213+00	PROJ000000000010
ACTL1db7df02fbca432595f6bc8283802f23	USER000000000017	task	TASK5c64e12aac7d4364865c1a70399a59c4	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 06:12:27.000116+00	PROJ000000000010
ACTLf6ac687702834df9ad7c70420b13aab6	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"DONE"}	Changed status from done to DONE	\N	\N	2025-11-29 05:30:10.227231+00	PROJ000000000010
ACTLb5615561d49242c3a8b271ed0dd59766	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"DONE"}	Changed status from done to DONE	\N	\N	2025-11-29 05:31:28.803884+00	PROJ000000000010
ACTL0b9c480fc8a542849022aa9627d6e728	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"QA_REVIEW"}	Changed status from done to QA_REVIEW	\N	\N	2025-11-29 05:32:38.277599+00	PROJ000000000010
ACTLcefb64b0ab9349fdbda122f973afa758	USER000000000017	task	TASKe6683c26cf1d4ce1b158926c04f4e257	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 05:01:45.511606+00	\N
ACTLb6bcb7b367e049d6a71da647f8e7b7b3	USER000000000019	task	TASK481e4fdbfff94d4396bb6536c0a37aa2	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 09:09:19.431281+00	PROJ000000000010
ACTLeaa6530e9cd04e59a39f3219bba78696	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"in_progress"}	{"status":"TO_DO"}	Changed status from in_progress to TO_DO	\N	\N	2025-11-29 05:34:05.724495+00	PROJ000000000010
ACTL678223bc1a3b453989b3c831da228a31	USER000000000018	task	TASKc965f98d5da34f36993e861f688adcab	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 09:27:45.743153+00	PROJ000000000010
ACTLa460676e1ac3449e933be341cf386122	USER000000000018	task	TASKc965f98d5da34f36993e861f688adcab	effort_logged	\N	{"hours":7,"description":"Time Tracking API Integration Completed and Data Binded ","workDate":"2025-11-13"}	Logged 7h on task "API Integration and Data Binding"	\N	\N	2025-12-03 09:27:46.532351+00	PROJ000000000010
ACTL91646a4bd69e417caaee77099e1efae7	USER000000000018	task	TASK50d9595d33444477806467d4b1e992bc	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 09:29:06.470216+00	PROJ000000000010
ACTL23c21987122c4ba5b0bb353eb3dde8f3	USER000000000018	task	TASKdb9590a7ca214e7faa61d3b7576acf44	effort_logged	\N	{"hours":8,"description":"Filters added for User, Project, Sprint and Work Type ","workDate":"2025-11-21"}	Logged 8h on task "Add Validations for Required data user wise"	\N	\N	2025-12-03 09:30:28.756435+00	PROJ000000000010
ACTL814d49082e9d4725864199ccecdda1ac	USER000000000019	task	TASK21fa36b2c0ad401ab8474b412406e071	effort_logged	\N	{"subtaskId":"SUBT51e6272f805b4f389f42568ab583d8c7","hours":8,"description":"Completed","workDate":"2025-11-15"}	Logged 8h on subtask "Lane and Create Issue PopUp Added"	\N	\N	2025-12-03 10:20:04.70007+00	\N
ACTL159ab4624c564d2e92463f9ca3ae4698	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-26 06:41:17.271878+00	PROJ000000000010
ACTLcd9249449d184e63934185fbfd8a0662	USER000000000018	task	TASKbb837a5dddcd4b478826d781834f6e80	effort_logged	\N	{"hours":9,"description":"Backlog View Fixed Due Date and Assignee added and Filters applied same as backlog module page","workDate":"2025-11-17"}	Logged 9h on task "Fix the Backlog view as per backlog module page"	\N	\N	2025-12-03 09:36:05.887995+00	PROJ000000000010
ACTL9f8bfae604ab44068bb25c683727f821	USER000000000019	task	TASKa74c9d096aa843a8b7497d0a0d02f735	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 10:29:12.847992+00	\N
ACTL89b0672d8d854295b481bd759d9cbd20	USER000000000017	task	TASK1191c8ece8b94c9d995071384df8d5ae	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 09:11:41.627703+00	PROJ000000000010
ACTLfb86af596c364e6ebc5f5df32a00ad37	USER000000000017	task	TASK7633e28141b0439c9adf8379230ff6ea	subtask_created	\N	{"taskId":"TASK7633e28141b0439c9adf8379230ff6ea","title":"Rate Limitation","description":"Create a rate limiting middleware that applies different rate limits based on user roles (Admin: higher limits, Developer: standard limits). Implement token bucket algorithm for smooth rate limiting with burst capacity. ","isCompleted":false,"assigneeId":"USER000000000017","estimatedHours":3,"actualHours":0,"orderIndex":0,"category":"Learning","labels":[]}	Created subtask "Rate Limitation"	\N	\N	2025-11-27 05:07:24.197879+00	\N
ACTL551a8e034eb24b1ba1ef2b82ae4ab491	USER000000000019	task	TASK9b4c8c858df64315ada9819299ca0319	effort_logged	\N	{"hours":4,"description":"Retrospective creation and management\\nMultiple retrospective templates\\nAction item creation and tracking\\nAction item assignment and status updates\\nRetrospective history and trends\\nAction item follow-up system\\nRetrospective reports and analytics","workDate":"2025-10-15"}	Logged 4h on task "Add Sprint Retrospective and Action Items Management"	\N	\N	2025-11-27 06:35:26.150408+00	\N
ACTL6f161b7e932740328411d25cdaf31277	USER000000000018	task	TASKd685faf93a31444484c295398910d2ad	effort_logged	\N	{"hours":4,"description":"Completed IA hierarchy, reviewed with UX lead, and finalized revisions based on feedback","workDate":"2025-09-10"}	Logged 4h on task "User Experience Structure Planning"	\N	\N	2025-11-27 08:59:40.649919+00	PROJ000000000010
ACTLda2b83e2b55c42698bf2bdb3efc1663e	USER000000000018	task	TASKd685faf93a31444484c295398910d2ad	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 08:59:47.88561+00	PROJ000000000010
ACTL85a2a5f70fc340989f4272109f3fd462	USER000000000019	task	TASKa21c6e671d3a413ca470bb649b5c916f	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-06 09:21:24.01719+00	PROJ000000000010
ACTL7613dc3ca8d943129f27e5c719f5230b	USER000000000017	task	TASK7633e28141b0439c9adf8379230ff6ea	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 05:09:38.838322+00	\N
ACTL76ae71fa930a4e9fa2e9a569c8575d18	USER000000000019	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"qa_review"}	{"status":"QA_REVIEW"}	Changed status from qa_review to QA_REVIEW	\N	\N	2025-11-27 06:32:28.07589+00	\N
ACTL5e828196d43744afaea9c648412932ce	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 06:32:40.074896+00	\N
ACTLa5022ad8f15341a780fd00ae2e208b42	USER000000000017	task	TASK76154666448847849b5c12b78d7e3548	subtask_created	\N	{"taskId":"TASK76154666448847849b5c12b78d7e3548","title":"Data Binding","description":"Bind the data as per received from api","isCompleted":false,"assigneeId":"USER000000000018","estimatedHours":2,"actualHours":0,"orderIndex":0,"dueDate":"2025-11-15","category":"Development","labels":[]}	Created subtask "Data Binding"	\N	\N	2025-12-05 06:55:58.340637+00	PROJ000000000010
ACTLbc00660e3e7a4211962d0770c46ee0dc	USER000000000019	task	TASK481e4fdbfff94d4396bb6536c0a37aa2	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-06 09:08:45.49772+00	PROJ000000000010
ACTLd67012524a12487dae773b3bfce4242c	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-26 06:41:26.892873+00	PROJ000000000010
ACTLb08577f72fa74de48cf86fb903d8d943	USER000000000017	task	TASK16e067b898a44c73804a690e45b77b42	subtask_created	\N	{"taskId":"TASK16e067b898a44c73804a690e45b77b42","title":"Implement Project Milestone Management and Tracking","description":"Add milestone reports showing milestone status, timeline adherence, and quality gate compliance. Include milestone templates for common project types.","isCompleted":false,"assigneeId":"USER000000000019","estimatedHours":3,"actualHours":0,"orderIndex":0,"category":"Development","labels":[]}	Created subtask "Implement Project Milestone Management and Tracking"	\N	\N	2025-11-27 06:18:02.925043+00	\N
ACTLf935ba8018504c7c8afb978837ce82b4	USER000000000018	task	TASKd4d946d16312471f9bded60efa8311c1	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 08:51:24.623193+00	PROJ000000000010
ACTLdd661c7a6a6a4a508a4661cdeebab154	USER000000000018	task	TASK1afa8b3cc6624fb9badcd1e003eab223	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 09:53:42.229477+00	PROJ000000000010
ACTL72a07bfa43a24aa3a4d52dbb7461d0d3	USER000000000017	task	TASKdb9590a7ca214e7faa61d3b7576acf44	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:35:57.057864+00	PROJ000000000010
ACTL0c16fa96c685464a80abc9b18ce4f213	USER000000000017	task	TASK50d9595d33444477806467d4b1e992bc	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:02.167381+00	PROJ000000000010
ACTL4c03fc085551494388edf168b3b4cdf5	USER000000000017	task	TASK4cbfc35a71ce4fcb8bc66b05c0335bb5	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:17.216499+00	\N
ACTLd4b429c6acb140b79a2021268f8e3b51	USER000000000017	task	TASK1afa8b3cc6624fb9badcd1e003eab223	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:43.612219+00	PROJ000000000010
ACTL2e471755a8c74a9ab05e8085605a2e5d	USER000000000017	task	TASKa74c9d096aa843a8b7497d0a0d02f735	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:45.231318+00	\N
ACTL8542466172914ad9bc3965bbc1f45600	USER000000000019	task	TASK3328947100a14fde856fbc6ddb790c97	status_changed	{"status":"to_do"}	{"status":"TO_DO"}	Changed status from to_do to TO_DO	\N	\N	2025-12-06 08:49:41.958622+00	PROJ000000000010
ACTL767eb0ea726c47028b5739f9195547b4	USER000000000019	task	TASK5a222ec6a71c43778a1da061ebecc097	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 08:53:21.426872+00	PROJ000000000010
ACTLd9957dc0987d485ba78c8a7c385ebf4e	USER000000000017	task	TASK5a222ec6a71c43778a1da061ebecc097	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 08:53:28.774207+00	PROJ000000000010
ACTL004755a98ded46b98f9b72d3fb70c532	USER000000000019	task	TASKa21c6e671d3a413ca470bb649b5c916f	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 09:21:37.824371+00	PROJ000000000010
ACTL9bb671285ea744d699e89e25e5b85984	USER000000000017	task	TASK7633e28141b0439c9adf8379230ff6ea	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 05:09:45.348742+00	\N
ACTL679d7cd74f3848af998264dd7899c9a5	USER000000000019	task	TASK9b4c8c858df64315ada9819299ca0319	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 06:35:24.914612+00	\N
ACTL257987c866e64c799923810955440387	USER000000000018	task	TASK16dfbb81345640f099b28e2ee2768253	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 09:05:36.328163+00	PROJ000000000010
ACTL08d81f4fc56249bb938c198487d7f8e8	USER000000000018	task	TASK8636aeb128e74eb4a79ef45417c57948	effort_logged	\N	{"hours":1,"description":"e","workDate":"2025-11-27"}	Logged 1h on task "ex"	\N	\N	2025-11-27 13:12:57.377702+00	\N
ACTLa39fa2a77b9a493090d95d9d5f8ec896	USER000000000019	task	TASK1214626ea51c41b595f2845036536bb1	effort_logged	\N	{"hours":1,"description":"done","workDate":"2025-11-29"}	Logged 1h on task "User Management Integration"	\N	\N	2025-11-29 09:41:27.255415+00	\N
ACTL63dab3b91f62429591a49dd61770c849	USER000000000018	task	TASK92229f7d6975446f832430d63386fb0f	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 09:30:45.778646+00	PROJ000000000010
ACTL1afb7ab795804859bf06f8975b68fb4b	USER000000000018	task	TASK92229f7d6975446f832430d63386fb0f	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 09:30:54.111304+00	PROJ000000000010
ACTLa39412c1582a45148b7ce4c8ac157534	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"DONE"}	Changed status from done to DONE	\N	\N	2025-11-29 05:30:25.788852+00	\N
ACTL8fa69c59cdfc44cda9d3baf0a169d396	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-29 05:32:45.716684+00	\N
ACTL3b58c01dd6854168afed89069d341d15	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"done"}	{"status":"IN_PROGRESS"}	Changed status from done to IN_PROGRESS	\N	\N	2025-11-29 05:33:59.137819+00	PROJ000000000010
ACTLb262bf90920a41c3aa1623fcf632945b	USER000000000018	task	TASKc965f98d5da34f36993e861f688adcab	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 09:28:06.140465+00	PROJ000000000010
ACTL291af93cfa784370b767b134654ce067	USER000000000018	task	TASK1afa8b3cc6624fb9badcd1e003eab223	effort_logged	\N	{"hours":4,"description":"Sprint, Priority, User and status filters added in backlog","workDate":"2025-11-10"}	Logged 4h on task "Filters adding for Backlog visuals"	\N	\N	2025-12-03 09:53:42.766577+00	PROJ000000000010
ACTL2c79a5f8c3a941b0a8a2f23d152b2527	USER000000000017	task	TASKdcfe0822d73949bdbd9f678d5b4df927	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:13.170819+00	PROJ000000000010
ACTL65c5edfc99ce4896ac3237f70c20bde7	USER000000000017	task	TASKa7c2e1ee30d8419b804236bfedbc6137	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:47.480239+00	PROJ000000000010
ACTL8a7ebead60784d3189ec5a95c281dea5	USER000000000019	task	TASK3328947100a14fde856fbc6ddb790c97	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 08:50:26.753627+00	PROJ000000000010
ACTLd17f4bba05fc418884731570de9f205f	USER000000000017	task	TASKa21c6e671d3a413ca470bb649b5c916f	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 09:21:44.052991+00	PROJ000000000010
ACTL49544ba121794a89a07541259f7f5fab	USER000000000017	task	TASK1329848c841c440cae2a772218122c68	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 05:20:48.255773+00	\N
ACTL5e2c3b1953014f578960ebac19e8b378	USER000000000019	task	TASK9b4c8c858df64315ada9819299ca0319	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 06:35:32.912014+00	\N
ACTLee8feedf391f42f4a9244bc49762fd6d	USER000000000017	task	TASK872ba5cef44c4647a01d9dcba143d0d2	status_changed	{"status":"to_do"}	{"status":"IN_PROGRESS"}	Manager moved task from To Do to In Progress	\N	\N	2025-11-27 06:39:37.708825+00	\N
ACTLe282d71a33284533b9d47b17aaf3c852	USER000000000017	task	TASK872ba5cef44c4647a01d9dcba143d0d2	effort_logged	\N	{"hours":4,"description":"Team capacity calculation based on availability\\nSprint goal suggestion based on velocity\\nDrag-and-drop story assignment\\nCapacity validation and warnings\\nStory dependency visualization\\nSprint planning reports\\nIntegration with team allocation data","workDate":"2025-10-28"}	Logged 4h on task "Implement Sprint Planning and Capacity Management"	\N	\N	2025-11-27 06:40:28.801114+00	\N
ACTL515bf0ae6ee84c8281cac2a823099761	USER000000000017	task	TASK872ba5cef44c4647a01d9dcba143d0d2	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 06:40:45.694905+00	\N
ACTL47a2406904ba4699868da51cdeed1c5c	USER000000000018	task	TASK19178111ac804f58bcb8d4d7a174fdaa	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 09:08:57.952077+00	PROJ000000000010
ACTLae4a0b64f9064328a56ba69e178b134c	USER000000000017	task	TASK19178111ac804f58bcb8d4d7a174fdaa	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 09:09:17.110901+00	PROJ000000000010
ACTLebe9eef781b1453d841398cb2f354330	USER000000000018	task	TASK8636aeb128e74eb4a79ef45417c57948	status_changed	{"status":"qa_review"}	{"status":"QA_REVIEW"}	Changed status from qa_review to QA_REVIEW	\N	\N	2025-11-27 13:13:11.61487+00	\N
ACTL472e674a0c004e9c9db8dfff00635929	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"DONE"}	Changed status from done to DONE	\N	\N	2025-11-29 09:43:06.148636+00	\N
ACTL22a209916e2c452c80b2fad14159efc9	USER000000000018	task	TASKa7c2e1ee30d8419b804236bfedbc6137	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 10:02:43.703667+00	PROJ000000000010
ACTL5e2c0e642e91484181ad934d3d569831	USER000000000017	task	TASKc965f98d5da34f36993e861f688adcab	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:34.430163+00	PROJ000000000010
ACTL48e779d974084673bef8cf34cadd6a98	USER000000000017	task	TASK3328947100a14fde856fbc6ddb790c97	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 08:50:36.267687+00	PROJ000000000010
ACTL9aefbf1d98414f2f9b48f699975a4c28	USER000000000017	issue	ISSUd49cc005659e451d91b469a8bcd01a92	created	\N	{"storyId":"STRY5e23619bd5b6405ab68917882853b715","title":"example","description":"ex","status":"TO_DO","priority":"MEDIUM","assigneeId":"USER000000000019","reporterId":"USER000000000017","estimatedHours":4,"actualHours":0,"orderIndex":0,"dueDate":"2025-11-04","labels":[]}	Created issue "example"	\N	\N	2025-12-06 06:17:42.762909+00	\N
ACTLf2d0701c172e446481bcb7547cf68a7c	USER000000000018	task	TASKdb9590a7ca214e7faa61d3b7576acf44	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 09:30:27.634995+00	PROJ000000000010
ACTL154f3d48be664a12a6c17b8bc1fdd009	USER000000000018	task	TASKdb9590a7ca214e7faa61d3b7576acf44	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 09:30:36.979605+00	PROJ000000000010
ACTLe334d874172247afa019b9119420de08	USER000000000018	task	TASK50d9595d33444477806467d4b1e992bc	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 09:30:38.911289+00	PROJ000000000010
ACTL6c731599298045c282f522eb36beeb10	USER000000000019	task	TASK21fa36b2c0ad401ab8474b412406e071	subtask_created	\N	{"taskId":"TASK21fa36b2c0ad401ab8474b412406e071","title":"Pull Stories from the backlog ","description":"","isCompleted":false,"assigneeId":"USER000000000019","estimatedHours":8,"actualHours":0,"orderIndex":0,"dueDate":"2025-11-18","category":"Development","labels":[]}	Created subtask "Pull Stories from the backlog "	\N	\N	2025-12-03 10:21:15.774554+00	\N
ACTLb1236c2b4750495db1317b068cc50a1a	USER000000000017	task	TASK4b56151bb4de44198312e31add1617d7	time_entry_updated	{"id":"TIME9968c13ecc8c40c9b64f47d4cdeaefc4","createdAt":"2025-12-05T12:12:32.587837","updatedAt":"2025-12-05T12:12:32.587837","userId":"USER000000000017","projectId":"PROJ000000000010","storyId":"STRY3ee097850750483e9ac6fa99a8391fcd","taskId":"TASK4b56151bb4de44198312e31add1617d7","subtaskId":null,"description":"minor ui changes done","entryType":"development","hoursWorked":0.5,"workDate":"2025-11-19","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000017","entryType":"development","isBillable":true,"hoursWorked":0.3,"description":"minor ui changes done","workDate":"2025-11-19","projectId":"PROJ000000000010","storyId":"STRY3ee097850750483e9ac6fa99a8391fcd","taskId":"TASK4b56151bb4de44198312e31add1617d7"}	Updated time entry: 0.3h	\N	\N	2025-12-05 07:03:20.578112+00	PROJ000000000010
ACTL42d59c3e7a4a47559273594bfc144234	USER000000000019	task	TASK481e4fdbfff94d4396bb6536c0a37aa2	effort_logged	\N	{"hours":4,"description":"Shows count of tasks by Priority & Category\\n\\nStatistics auto-updates when tasks added/removed\\n\\nDistinct color labels for High/Medium/Low priority\\n\\nResponsive layout for small screens","workDate":"2025-11-04"}	Logged 4h on task "Implement Task Statistics & Breakdown Widget"	\N	\N	2025-12-06 09:08:46.661549+00	PROJ000000000010
ACTL58ae6d53e63d4b14a456d5a543319b3c	USER000000000018	task	TASKd4d946d16312471f9bded60efa8311c1	effort_logged	\N	{"hours":1.5,"description":"Studied existing tools, flow, handoffs, and team practices.\\n\\nMapped end-to-end sprint planning workflow.\\n\\nDocumented friction points and bottlenecks needing optimization.","workDate":"2025-09-05"}	Logged 1.5h on task "Sprint Planning Workflow Review"	\N	\N	2025-11-27 08:51:25.361744+00	PROJ000000000010
ACTLb62f2f79aed344efa06f352ecf80123c	USER000000000017	task	TASKd4d946d16312471f9bded60efa8311c1	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 08:51:36.136043+00	PROJ000000000010
ACTL1d887de27f4d46c09608f5a58e31c593	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"done"}	{"status":"TO_DO"}	Changed status from done to TO_DO	\N	\N	2025-11-27 12:02:11.984084+00	PROJ000000000010
ACTLba8a2b919b4b4b89a05762e23389dfa6	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"to_do"}	{"status":"DONE"}	Changed status from to_do to DONE	\N	\N	2025-11-27 12:03:40.225952+00	PROJ000000000010
ACTL15e5cf69a3e040d9bd9021ec768f7844	USER000000000018	task	TASK445ba22dfeaf45d39e2366ed4c6baf42	effort_logged	\N	{"hours":4,"description":"done","workDate":"2025-11-27"}	Logged 4h on task "example"	\N	\N	2025-11-27 12:06:23.762249+00	\N
ACTLcfb6c26bfd134d88b3cd43b94552f41e	USER000000000018	task	TASK445ba22dfeaf45d39e2366ed4c6baf42	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 12:06:38.592373+00	\N
ACTLf17ed6352f10463e8fd54ee6d70af841	USER000000000018	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"to_do"}	{"status":"TO_DO"}	Changed status from to_do to TO_DO	\N	\N	2025-11-29 05:35:07.05256+00	PROJ000000000010
ACTL64f4c7b25a5543f9b9af08dd5cee266e	USER000000000018	task	TASK50d9595d33444477806467d4b1e992bc	effort_logged	\N	{"hours":8,"description":"Modify UI in Tabular for with all the data binded properly","workDate":"2025-11-18"}	Logged 8h on task "Change UI Visual"	\N	\N	2025-12-03 09:29:07.291085+00	PROJ000000000010
ACTL0ba9ba935da3469a8906458837434803	USER000000000019	task	TASK21fa36b2c0ad401ab8474b412406e071	effort_logged	\N	{"subtaskId":"SUBTc347581d3c254a42a6fa8f40262b1a72","hours":12,"description":"Stories Pull Succesfully and being displayed on board with tasks","workDate":"2025-11-19"}	Logged 12h on subtask "Pull Stories from the backlog "	\N	\N	2025-12-03 10:22:14.792905+00	\N
ACTL27be079bd9304d178e3f3c747b8e8dd8	USER000000000019	task	TASKa74c9d096aa843a8b7497d0a0d02f735	effort_logged	\N	{"hours":7,"description":"Changes Done ad per backlog in scrum","workDate":"2025-11-07"}	Logged 7h on task "UI Component Changes and API Integration"	\N	\N	2025-12-03 10:29:09.479463+00	\N
ACTL441ec43e169d442eb34f354f4b379330	USER000000000017	issue	ISSUa6069af353b747bab533c6eebde08c71	created	\N	{"storyId":"STRY3ee097850750483e9ac6fa99a8391fcd","title":"example","description":"ex","status":"TO_DO","priority":"MEDIUM","assigneeId":"USER000000000019","reporterId":"USER000000000017","estimatedHours":4,"actualHours":0,"orderIndex":0,"dueDate":"2025-12-08","labels":[]}	Created issue "example"	\N	\N	2025-12-06 07:27:21.88831+00	\N
ACTL9eed747ed1fa42ef9cde1cbe13d8cfee	USER000000000019	task	TASKa74c9d096aa843a8b7497d0a0d02f735	effort_logged	\N	{"hours":7,"description":"Changes Done ad per backlog in scrum","workDate":"2025-11-07"}	Logged 7h on task "UI Component Changes and API Integration"	\N	\N	2025-12-03 10:29:13.709732+00	\N
ACTL155602e16e144f23a6c29de53bb4a8c2	USER000000000017	task	TASK76154666448847849b5c12b78d7e3548	effort_logged	\N	{"hours":0.3,"description":"Data binding ","workDate":"2025-11-15"}	Logged 0.3h on task "API Integration for Visual Fields"	\N	\N	2025-12-05 09:24:18.310048+00	PROJ000000000010
ACTLa7767f69071a48968db44977a96b998e	USER000000000017	task	TASK481e4fdbfff94d4396bb6536c0a37aa2	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 09:09:28.586277+00	PROJ000000000010
ACTL99921ced04ae482db9181385e0fd65a2	USER000000000019	task	TASK1191c8ece8b94c9d995071384df8d5ae	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-06 09:11:25.078942+00	PROJ000000000010
ACTL75a37a74e0f14d77b91160f6913f56f5	USER000000000019	task	TASK7060f5fb81e1413f918f55a31fe4a3af	effort_logged	\N	{"hours":3,"description":"Three tabs: All, Active, Completed\\n\\nActive tab highlighted with green background\\n\\nCounts in parentheses update dynamically\\n\\nWorks smoothly with existing task interactions","workDate":"2025-11-12"}	Logged 3h on task "Filter Tabs for All / Active / Completed Tasks"	\N	\N	2025-12-06 09:13:29.755118+00	PROJ000000000010
ACTL17f62c75b202402a904ae53f0b980764	USER000000000017	task	TASKe6683c26cf1d4ce1b158926c04f4e257	effort_logged	\N	{"hours":2,"description":"Unified search endpoint with multi-entity support, complex AND/OR filters, date/status/priority filtering, full-text search, cursor-based pagination, caching, and updated API documentation.","workDate":"2025-10-20"}	Logged 2h on task "Add Advanced Filtering and Search API Endpoints"	\N	\N	2025-11-27 05:01:26.820342+00	\N
ACTLdc1773e4124f42baaf0b5f1dd19bba7e	USER000000000017	task	TASK7633e28141b0439c9adf8379230ff6ea	effort_logged	\N	{"subtaskId":"SUBT34117bd7bafc4c51934c919631bef4ce","hours":3,"description":"Rate limiting middleware implemented with configurable limits per user role\\nToken bucket algorithm implemented for smooth throttling\\nRate limit headers included in all API responses","workDate":"2025-10-27"}	Logged 3h on subtask "Rate Limitation"	\N	\N	2025-11-27 05:08:03.583393+00	\N
ACTL7204cc7f99df481a88bb390d41992164	USER000000000017	task	TASK7633e28141b0439c9adf8379230ff6ea	effort_logged	\N	{"hours":5,"description":"Different limits for read vs write operations\\nIP-based rate limiting for unauthenticated endpoints\\nMonitoring dashboard or logs for rate limit violations\\nConfiguration file for easy adjustment of rate limits","workDate":"2025-10-21"}	Logged 5h on task "Implement API Rate Limiting and Request Throttling"	\N	\N	2025-11-27 05:08:50.016909+00	\N
ACTL10c742a61c1d4448a0d3ac0768ca6f4d	USER000000000019	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"to_do"}	{"status":"TO_DO"}	Changed status from to_do to TO_DO	\N	\N	2025-11-27 06:31:02.294496+00	\N
ACTLa5b98b68671a4778b16401c02ee504ec	USER000000000019	task	TASK5a222ec6a71c43778a1da061ebecc097	effort_logged	\N	{"hours":4,"description":"Eye icon: Opens user detail view\\n\\nPencil icon: Opens edit dialog\\n\\nLock icon: Deactivates user account\\n\\nLocked users should show inactive status in UI","workDate":"2025-10-14"}	Logged 4h on task "Action Controls (View, Edit, Lock User)"	\N	\N	2025-12-06 08:53:14.482616+00	PROJ000000000010
ACTL251572cb42d54e3695e415a397d1a9b4	USER000000000017	task	TASK7b06723b35774993a86aee0b479b6f6f	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 08:55:55.730162+00	PROJ000000000010
ACTLc9491dab258d436a9d0ae56cdf728b24	USER000000000019	task	TASKf3ef3571a7da4920b3daf550c070c4a9	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-06 09:24:02.999353+00	PROJ000000000010
ACTLd4f71c68012c41099db5d16e317a59af	USER000000000017	task	TASK1329848c841c440cae2a772218122c68	effort_logged	\N	{"hours":4,"description":"Template CRUD operations (Create, Read, Update, Delete)\\nTemplate includes all project configuration options\\nProjects can be created from templates with customization\\nTemplate versioning system implemented\\nUI for template management\\nAPI endpoints for template operations","workDate":"2025-10-22"}	Logged 4h on task "Implement Project Template System"	\N	\N	2025-11-27 05:20:48.956819+00	\N
ACTL86579fb8772e483fb344109a5fe70140	USER000000000019	task	TASK9b4c8c858df64315ada9819299ca0319	status_changed	{"status":"qa_review"}	{"status":"QA_REVIEW"}	Changed status from qa_review to QA_REVIEW	\N	\N	2025-11-27 06:35:44.26377+00	\N
ACTLb3fb309f811848a8ac907018950772b4	USER000000000018	task	TASK19178111ac804f58bcb8d4d7a174fdaa	effort_logged	\N	{"hours":4,"description":"Annotated interaction spec created with flow diagrams and behavior rules; shared with engineering for validation and final sign-off.","workDate":"2025-09-19"}	Logged 4h on task "Interaction Specs Documentation"	\N	\N	2025-11-27 09:08:59.014896+00	PROJ000000000010
ACTLf31ced891a894cba9ff2bbe823cd7063	USER000000000017	task	TASK8636aeb128e74eb4a79ef45417c57948	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 13:13:21.951061+00	\N
ACTLf377cc59a3a54c5d97e3ee51d4c38737	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"DONE"}	Changed status from done to DONE	\N	\N	2025-11-29 12:55:53.689319+00	\N
ACTLf4a7102c4bab47a58fb8ac8451d07ef1	USER000000000017	task	TASK16e067b898a44c73804a690e45b77b42	effort_logged	\N	{"subtaskId":"SUBTb219cfa90a2742fa868f85ff2381f81c","hours":3,"description":"Quality gate requirements and validation\\nMilestone dependencies and sequencing\\nProgress calculation based on associated work","workDate":"2025-10-16"}	Logged 3h on subtask "Implement Project Milestone Management and Tracking"	\N	\N	2025-11-27 06:22:23.184993+00	\N
ACTLbb00e9b120a348efb201cebe144f1a5e	USER000000000017	task	TASK16e067b898a44c73804a690e45b77b42	effort_logged	\N	{"hours":5,"description":"Implement milestone management with CRUD, status tracking, quality gate validation, dependencies, sequencing, progress calculation, notifications, reminders, reports, and templates. Enhance budget management with real-time tracking, category breakdowns, forecasting, threshold alerts, detailed reports, approval workflows, and time-tracking integration for accurate cost calculation.","workDate":"2025-10-16"}	Logged 5h on task "Add Project Budget Tracking and Forecasting"	\N	\N	2025-11-27 06:24:08.327114+00	\N
ACTL727ac873f58e4cb6818bb7d26c107eb5	USER000000000017	task	TASK16e067b898a44c73804a690e45b77b42	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 06:24:28.30436+00	\N
ACTLf8984c832ada49b5ab074eaf3b64efd4	USER000000000018	task	TASKd4d946d16312471f9bded60efa8311c1	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 08:51:31.155694+00	PROJ000000000010
ACTL639407e1998c4c3b9e90251f2eb28500	USER000000000017	task	TASK7ca28974f6d343578e878f96884c4f94	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 08:55:03.449881+00	PROJ000000000010
ACTLb662accdcd154b2e89b2405f15bafacc	USER000000000018	task	TASKd685faf93a31444484c295398910d2ad	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 08:59:39.925907+00	PROJ000000000010
ACTLd387c31b231e433a85a550ae1b55e860	USER000000000017	task	TASKd685faf93a31444484c295398910d2ad	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 08:59:52.629983+00	PROJ000000000010
ACTL6ef7193bb35b442f985993d5847c4a98	USER000000000018	task	TASK445ba22dfeaf45d39e2366ed4c6baf42	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 12:06:23.215153+00	\N
ACTLa756c9b78b53406da9d95e9fe5db88c1	USER000000000017	task	TASK445ba22dfeaf45d39e2366ed4c6baf42	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 12:07:03.69136+00	\N
ACTL3866379c913543b492f3373513df2f75	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"to_do"}	{"status":"DONE"}	Changed status from to_do to DONE	\N	\N	2025-11-29 05:36:01.393854+00	PROJ000000000010
ACTLe296f7874af84603beb2b824eb8bdac1	USER000000000018	task	TASK76154666448847849b5c12b78d7e3548	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 09:32:19.67416+00	PROJ000000000010
ACTL0f685c0c45eb4391866d29854bc70250	USER000000000017	task	TASK7633e28141b0439c9adf8379230ff6ea	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 05:08:48.956531+00	\N
ACTLac90c81a928a460bbba91cca1bafd18e	USER000000000018	task	TASKa7c2e1ee30d8419b804236bfedbc6137	effort_logged	\N	{"hours":8,"description":"Validations Applied properly","workDate":"2025-11-20"}	Logged 8h on task "Check the Mismatch data and validations"	\N	\N	2025-12-03 10:02:44.852646+00	PROJ000000000010
ACTLd28a1aeb626b4bf39d95338eff61b4a1	USER000000000018	task	TASK1afa8b3cc6624fb9badcd1e003eab223	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 10:02:55.432509+00	PROJ000000000010
ACTL3b5b3296b609442eb55ba4139b2e5fe0	USER000000000018	task	TASK76154666448847849b5c12b78d7e3548	effort_logged	\N	{"hours":8,"description":"API Integrated for fetching data from db and Minor UI Changes","workDate":"2025-11-15"}	Logged 8h on task "API Integration for Visual Fields"	\N	\N	2025-12-03 09:32:20.382702+00	PROJ000000000010
ACTL3778a63b836541b5b55aeeccf498a402	USER000000000019	task	TASK21fa36b2c0ad401ab8474b412406e071	status_changed	{"status":"to_do"}	{"status":"QA_REVIEW"}	Changed status from to_do to QA_REVIEW	\N	\N	2025-12-03 10:22:31.236245+00	\N
ACTL4bd40b584186460c94d69dba24ebd082	USER000000000017	task	TASK76154666448847849b5c12b78d7e3548	effort_logged	\N	{"hours":0.2,"description":"Minor changes","workDate":"2025-11-15"}	Logged 0.2h on task "API Integration for Visual Fields"	\N	\N	2025-12-05 09:40:07.646895+00	PROJ000000000010
ACTL492d89c336664a65898a90ea031b8152	USER000000000019	task	TASK1191c8ece8b94c9d995071384df8d5ae	effort_logged	\N	{"hours":2,"description":"Input box placeholder text: “What needs to be done?”\\n\\nDropdowns for Priority & Category included\\n\\nValidation prevents empty task creation\\n\\nAdds new task line below instantly without page refresh","workDate":"2025-11-06"}	Logged 2h on task "Add New Task Input Panel with Validation"	\N	\N	2025-12-06 09:11:25.814739+00	PROJ000000000010
ACTL380c6ee8f3f04cdaa88772fd84838e59	USER000000000017	task	TASK7060f5fb81e1413f918f55a31fe4a3af	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 09:13:45.412208+00	PROJ000000000010
ACTL368dc96674a74264a2fe774d78f4d21d	USER000000000017	task	TASK16e067b898a44c73804a690e45b77b42	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 06:24:07.520508+00	\N
ACTL98a74e3fed58425cb1b6cdec98f16fe9	USER000000000018	task	TASK7ca28974f6d343578e878f96884c4f94	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 08:54:26.593255+00	PROJ000000000010
ACTLb674d397be664c6aa39f758f0b24bf20	USER000000000017	task	TASK9b4c8c858df64315ada9819299ca0319	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 06:36:28.807821+00	\N
ACTL153f90e8905b4546ab5771fad4822893	USER000000000018	task	TASK1afa8b3cc6624fb9badcd1e003eab223	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 10:03:01.198041+00	PROJ000000000010
ACTL1bd66ca12e9149eca72b95bde1d2d046	USER000000000017	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	effort_logged	\N	{"subtaskId":"SUBTf59806621c2f4fb39f00895955ad102c","hours":1,"description":"done","workDate":"2025-12-04"}	Logged 1h on subtask "Admin Panel Integration "	\N	\N	2025-12-04 08:54:24.914398+00	\N
ACTLce5ee0d132bf42ad893cab680f2678c4	USER000000000019	task	TASK5a222ec6a71c43778a1da061ebecc097	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-06 08:53:13.882441+00	PROJ000000000010
ACTL3fb1f4a8c42a456b9c7711e95b501ec4	USER000000000019	task	TASKf3ef3571a7da4920b3daf550c070c4a9	effort_logged	\N	{"hours":7,"description":"Ability to create new Board linked to sprint\\nSystem auto-creates 5 default lanes\\nDrag issues between lanes with role validation\\nLane controls only for Admin\\nInline + Issue form inside each story","workDate":"2025-11-19"}	Logged 7h on task "Scrum Board Creation + Lanes + Role Based Drag & Drop + Issue Form Card"	\N	\N	2025-12-06 09:24:04.147432+00	PROJ000000000010
ACTL448c4e1d380b42b48dd5cb3624fbc293	USER000000000017	task	TASK1329848c841c440cae2a772218122c68	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 05:20:55.038239+00	\N
ACTLadb5a63268304da7ab5728adac96a846	USER000000000017	task	TASK872ba5cef44c4647a01d9dcba143d0d2	status_changed	{"status":"in_progress"}	{"status":"TO_DO"}	Changed status from in_progress to TO_DO	\N	\N	2025-11-27 06:39:44.261749+00	\N
ACTL5d5a6e556e30408589a6a2eeffba7e27	USER000000000017	task	TASKc36a084a1c394184a4dbef26c6c7097e	time_entry_updated	{"id":"TIMEc16b45347224406cb628ba0b122212c1","createdAt":"2025-11-24T10:23:44.044378","updatedAt":"2025-11-24T10:23:44.044378","userId":"USER000000000018","projectId":"PROJ000000000010","storyId":"STRY46cd781abc0946dc800201657d99661b","taskId":"TASKc36a084a1c394184a4dbef26c6c7097e","subtaskId":null,"description":"ui complete","entryType":"development","hoursWorked":16,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000018","entryType":"development","isBillable":true,"hoursWorked":1,"description":"ui complete","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY46cd781abc0946dc800201657d99661b","taskId":"TASKc36a084a1c394184a4dbef26c6c7097e"}	Updated time entry: 1h	\N	\N	2025-11-27 09:16:27.482748+00	\N
ACTL6c81323b42a74c8996678e224d612fcc	USER000000000018	task	TASK826baa037fac4b7183afa24ffe3b538b	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-28 04:46:44.405834+00	\N
ACTL2e19efa5924a4367bd9331c1c34b536d	USER000000000018	task	TASK7ca28974f6d343578e878f96884c4f94	effort_logged	\N	{"hours":8,"description":"Converted user requirements into structured user stories.\\nPrioritized features such as backlog refinement, velocity tracking, capacity inputs, and permissions.\\nAdded acceptance criteria and finalized feature list with stakeholder approval.","workDate":"2025-09-08"}	Logged 8h on task "Feature Definition & Prioritization Matrix"	\N	\N	2025-11-27 08:54:27.328483+00	PROJ000000000010
ACTLc7897a1584054cb49b96f4daac8cc317	USER000000000018	task	TASKd964dd94638d45a9bf22a000a7b480ca	status_changed	{"status":"to_do"}	{"status":"TO_DO"}	Changed status from to_do to TO_DO	\N	\N	2025-11-27 12:56:53.759293+00	\N
ACTLba82089bc9ac473da753a996c99a4bff	USER000000000017	task	TASKbe56aadf47fc42f7b130b403d78956f7	status_changed	{"status":"done"}	{"status":"DONE"}	Changed status from done to DONE	\N	\N	2025-11-29 05:37:33.811531+00	PROJ000000000010
ACTL03685892d5bf4d31aeb89d88d9b6db02	USER000000000018	task	TASK76154666448847849b5c12b78d7e3548	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 09:34:28.577849+00	PROJ000000000010
ACTL8b8e2e22c4904d038509777f3d9cbda6	USER000000000018	task	TASKbb837a5dddcd4b478826d781834f6e80	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 09:37:18.584321+00	PROJ000000000010
ACTL3429e0d06177486ba43a29db51f259d6	USER000000000019	task	TASKa74c9d096aa843a8b7497d0a0d02f735	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 10:29:08.174515+00	\N
ACTL26b699082d0d4279bd8077bf780a5b3f	USER000000000019	task	TASK1191c8ece8b94c9d995071384df8d5ae	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 09:11:32.828175+00	PROJ000000000010
ACTL4c5a87f1705446e483cdda9f33613c05	USER000000000017	task	TASKe6683c26cf1d4ce1b158926c04f4e257	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 05:01:50.724039+00	\N
ACTL4e2985154db2433cb77b8afaed3c278e	USER000000000017	task	TASK16e067b898a44c73804a690e45b77b42	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 06:24:35.367075+00	\N
ACTLea56575998dc42da9fc69289ae3bb420	USER000000000017	task	TASK21fa36b2c0ad401ab8474b412406e071	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:15.959656+00	\N
ACTLbbd627617d6e4acd9a6769f571356323	USER000000000017	task	TASK002556622da34f908b7261acba675e50	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 08:46:19.962786+00	PROJ000000000010
ACTL3a2f600cdec448628205bd0cc980b36f	USER000000000019	task	TASKa21c6e671d3a413ca470bb649b5c916f	effort_logged	\N	{"hours":5,"description":"Log visible on Task & Subtask\\nLog Modal contains: Date, Hours, Minutes, Description\\nLogs saved in new DB table time_logs\\nUser can edit/delete only their own logs\\nLead/Admin can modify any logs","workDate":"2025-11-18"}	Logged 5h on task "Add Log Button to Task & Subtask + Time Logging"	\N	\N	2025-12-06 09:21:25.192685+00	PROJ000000000010
ACTLc635e1b7a80f402fb11b9f709e8f4c45	USER000000000017	task	TASK9b4c8c858df64315ada9819299ca0319	status_changed	{"status":"done"}	{"status":"DONE"}	Changed status from done to DONE	\N	\N	2025-12-01 06:42:59.459864+00	\N
ACTLa4cd44e9d305447f8349dc93137aea15	USER000000000018	task	TASKa7c2e1ee30d8419b804236bfedbc6137	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 10:02:53.256695+00	PROJ000000000010
ACTL08af81c254e4430c964bfd3815ab0960	USER000000000019	task	TASK4b56151bb4de44198312e31add1617d7	status_changed	{"status":"done"}	{"status":"QA_REVIEW"}	Changed status from done to QA_REVIEW	\N	\N	2025-12-05 06:22:43.904164+00	PROJ000000000010
ACTL3db959935c394320a8967512bb934a0c	USER000000000018	task	TASK7ca28974f6d343578e878f96884c4f94	time_entry_updated	{"id":"TIME9d1c09d15c9a4af9adc68aaf3164b27b","createdAt":"2025-11-27T14:24:23.579978","updatedAt":"2025-11-27T14:24:23.579978","userId":"USER000000000018","projectId":"PROJ000000000010","storyId":"STRY46dfdcb675f640c88d6bf9ecaea8387d","taskId":"TASK7ca28974f6d343578e878f96884c4f94","subtaskId":null,"description":"Converted user requirements into structured user stories.\\nPrioritized features such as backlog refinement, velocity tracking, capacity inputs, and permissions.\\nAdded acceptance criteria and finalized feature list with stakeholder approval.","entryType":"development","hoursWorked":8,"workDate":"2025-09-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000018","entryType":"development","isBillable":true,"hoursWorked":8,"description":"Converted user requirements into structured user stories.\\nPrioritized features such as backlog refinement, velocity tracking, capacity inputs, and permissions.\\nAdded acceptance criteria and finalized feature list with approval.","workDate":"2025-09-08","projectId":"PROJ000000000010","storyId":"STRY46dfdcb675f640c88d6bf9ecaea8387d","taskId":"TASK7ca28974f6d343578e878f96884c4f94"}	Updated time entry: 8h	\N	\N	2025-11-27 08:54:43.015189+00	PROJ000000000010
ACTL1ebc4276e7ed4a6ea45aef98841ac1e4	USER000000000018	task	TASK7ca28974f6d343578e878f96884c4f94	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 08:54:55.373436+00	PROJ000000000010
ACTLeebe8ee52eb74312af21751f18664f19	USER000000000018	task	TASKd964dd94638d45a9bf22a000a7b480ca	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 12:57:07.536907+00	\N
ACTL665bc189cd2644148fe6e9ca18c323ad	USER000000000017	task	TASKb5dc49a8af64416381b946ad36616f80	status_changed	{"status":"done"}	{"status":"DONE"}	Changed status from done to DONE	\N	\N	2025-11-29 05:38:20.179283+00	\N
ACTL7e06c6e95d724a5b8b3b78424ab65fca	USER000000000018	task	TASKbb837a5dddcd4b478826d781834f6e80	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 09:36:04.787963+00	PROJ000000000010
ACTL42c6b981cd6c4e7e8e9124bb8fec8ac3	USER000000000018	task	TASKd964dd94638d45a9bf22a000a7b480ca	effort_logged	\N	{"hours":4,"description":"done ","workDate":"2025-11-27"}	Logged 4h on task "example"	\N	\N	2025-11-27 12:57:08.756026+00	\N
ACTLf50dd997a8364f6eb6fa7ae47e70f20a	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"DONE"}	Changed status from done to DONE	\N	\N	2025-11-29 05:44:55.37499+00	\N
ACTLab1f6c20434446798d57d95378c2b851	USER000000000018	task	TASKdcfe0822d73949bdbd9f678d5b4df927	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 09:52:08.379207+00	PROJ000000000010
ACTLed072830e49b449bbe7d2c593f6f17c0	USER000000000019	task	TASKa74c9d096aa843a8b7497d0a0d02f735	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 10:31:55.008551+00	\N
ACTL931252297386409cb11507f3e13f8b37	USER000000000017	task	TASK4b56151bb4de44198312e31add1617d7	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:02.960144+00	PROJ000000000010
ACTL5e4fc2300a6b43c08ef977d85bde3896	USER000000000017	task	TASKc965f98d5da34f36993e861f688adcab	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:22.155033+00	PROJ000000000010
ACTL0c2636777a1c42b792f655985334541a	USER000000000017	task	TASK12fcaddba0824c6e883c2700af22aaa7	status_changed	{"status":"in_progress"}	{"status":"DONE"}	Changed status from in_progress to DONE	\N	\N	2025-12-03 10:36:53.134936+00	\N
ACTLb4338c2fc14a4681a4ec291ffa5455cf	USER000000000019	task	TASK002556622da34f908b7261acba675e50	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-06 08:46:01.428993+00	PROJ000000000010
ACTLa4651e62e2ee4133be29436344863f37	USER000000000019	task	TASK002556622da34f908b7261acba675e50	effort_logged	\N	{"hours":4,"description":"Shows Total Users, Active Projects, System Health %, Security Alerts\\nIcons + Labels + Value must be formatted\\nValues updated dynamically through API\\nAdd User” button placed beside Refresh\\n\\nOpens a popup form to enter user details\\n\\nUser record is created as inactive by default\\n\\nForm validations included (email, required fields)","workDate":"2025-10-02"}	Logged 4h on task "Display User Statistics Overview & Add User Flow Button"	\N	\N	2025-12-06 08:46:02.757901+00	PROJ000000000010
ACTLc0d24bb0727244b7a8ea3a8532daa038	USER000000000019	task	TASK3328947100a14fde856fbc6ddb790c97	effort_logged	\N	{"hours":7,"description":"User card must show Name, Email, Role, Status, Department, Report Manager, Joined Date\\n\\nRole & Status displayed using color-coded badges\\n\\nScroll responsive layout for multiple users","workDate":"2025-10-08"}	Logged 7h on task "User List with Role, Status & Department"	\N	\N	2025-12-06 08:50:18.935043+00	PROJ000000000010
ACTLe424af731ddc4018bb74256e630b6604	USER000000000019	task	TASK7060f5fb81e1413f918f55a31fe4a3af	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-06 09:13:28.658674+00	PROJ000000000010
ACTLc404d43650094f8e8642ddddc1c6ad12	USER000000000019	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 06:32:03.419959+00	\N
ACTLef85842ef5ba41339f31cbf39d3d80fa	USER000000000019	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 06:32:14.46577+00	\N
ACTL90872770e159422cafb930a32582a33a	USER000000000019	task	TASK7b06723b35774993a86aee0b479b6f6f	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-06 08:55:33.451605+00	PROJ000000000010
ACTL60358a98304b446284888a7c402dfa6c	USER000000000019	task	TASK4c372d304a5c44239eb0ae9abfd06fb7	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 08:58:27.36521+00	PROJ000000000010
ACTL49b9a45d68d84fa4bcfaf6a56adb5530	USER000000000018	task	TASK4db416e01cae40539ea34b72a852746d	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 09:01:52.864668+00	PROJ000000000010
ACTL9382ae3d06d742068643250e31e9f11d	USER000000000018	task	TASK4db416e01cae40539ea34b72a852746d	effort_logged	\N	{"hours":7,"description":"Wireframes created in Figma, stakeholder comments incorporated, ready for high-fidelity build.","workDate":"2025-09-15"}	Logged 7h on task "Low-Fidelity Layout Exploration"	\N	\N	2025-11-27 09:01:53.427799+00	PROJ000000000010
ACTL20005575446a4a5785c27a8f217cd4bf	USER000000000018	task	TASK16dfbb81345640f099b28e2ee2768253	effort_logged	\N	{"hours":2,"description":"Desktop designs finalized; responsive screens responsive variants 80% complete","workDate":"2025-09-16"}	Logged 2h on task "High-Fidelity Prototyping"	\N	\N	2025-11-27 09:05:27.413336+00	PROJ000000000010
ACTL23bbd45931084ea6b448970eeafb18f5	USER000000000017	task	TASK16dfbb81345640f099b28e2ee2768253	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 09:05:43.667144+00	PROJ000000000010
ACTL7a8067867b434bcfaf383883f5a45739	USER000000000018	task	TASKd964dd94638d45a9bf22a000a7b480ca	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 12:57:14.812483+00	\N
ACTLe79426c6643f46a4a5e8805be3304683	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"IN_PROGRESS"}	Changed status from done to IN_PROGRESS	\N	\N	2025-11-29 06:23:35.007634+00	\N
ACTLa52d88aa5d8f42c39933503995d9c346	USER000000000018	task	TASKdcfe0822d73949bdbd9f678d5b4df927	effort_logged	\N	{"hours":4,"description":"Scrum Board freeze feature on sprint completed added ","workDate":"2025-12-03"}	Logged 4h on task "Add Freeze Board feature on sprint complete"	\N	\N	2025-12-03 09:52:09.239468+00	PROJ000000000010
ACTL65c3e09403e14b8c83f52f7b3ee7fc04	USER000000000019	task	TASK12fcaddba0824c6e883c2700af22aaa7	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 10:33:49.072405+00	\N
ACTL89b9bf7e8eab41ce90924b673fcdac12	USER000000000017	task	TASK12fcaddba0824c6e883c2700af22aaa7	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 10:37:01.638439+00	\N
ACTL59e510e137fd4c9084f1feab2e13ffc4	USER000000000017	task	TASK12fcaddba0824c6e883c2700af22aaa7	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:37:12.047741+00	\N
ACTLf9deaaaf44b94bdc95e41161b92442d7	USER000000000019	task	TASK002556622da34f908b7261acba675e50	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 08:46:11.681071+00	PROJ000000000010
ACTLf3f19eb0e5d547beb749c977f6936765	USER000000000019	task	TASK3328947100a14fde856fbc6ddb790c97	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-06 08:50:18.180231+00	PROJ000000000010
ACTL44bf7b2a01314436beb92200b9b2f2f4	USER000000000017	task	TASK4db416e01cae40539ea34b72a852746d	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 09:02:24.495007+00	PROJ000000000010
ACTLd40ed59c102a46bfa55f1f6ff0eed2cf	USER000000000018	task	TASK19178111ac804f58bcb8d4d7a174fdaa	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 09:09:10.133683+00	PROJ000000000010
ACTLaa5b433f0618468faf2aafb61195f1b1	USER000000000019	task	TASKf3ef3571a7da4920b3daf550c070c4a9	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 09:24:19.484509+00	PROJ000000000010
ACTL719759fdd8da48dc8efa1ca82ddf88e7	USER000000000018	task	TASKa9f77df696b14fc28a935b2afaa5a5e5	status_changed	{"status":"to_do"}	{"status":"TO_DO"}	Changed status from to_do to TO_DO	\N	\N	2025-11-17 11:47:49.902689+00	\N
ACTL2e081de3d20e48fd8496c792fcda4c32	USER000000000018	task	TASKa9f77df696b14fc28a935b2afaa5a5e5	subtask_created	\N	{"taskId":"TASKa9f77df696b14fc28a935b2afaa5a5e5","title":"charts and graphs ","description":"","isCompleted":false,"assigneeId":"USER000000000018","estimatedHours":2,"actualHours":0,"orderIndex":0,"labels":[]}	Created subtask "charts and graphs "	\N	\N	2025-11-17 11:48:38.376321+00	\N
ACTLf17fe4e4c5574bd5b9249cec7b15bbf5	USER000000000018	task	TASKa9f77df696b14fc28a935b2afaa5a5e5	effort_logged	\N	{"subtaskId":"SUBT1d40c82c9b194243b5b70223bfb087fb","hours":2,"description":"charts and graphs are created ","workDate":"2025-11-17"}	Logged 2h on subtask "charts and graphs "	\N	\N	2025-11-17 11:49:02.540662+00	\N
ACTL46d89f8294394d14bf3298368e2f1a0e	USER000000000018	task	TASKa9f77df696b14fc28a935b2afaa5a5e5	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-17 11:49:39.650928+00	\N
ACTL48295b6236304f30aa36d39229e6899a	USER000000000018	task	TASKa9f77df696b14fc28a935b2afaa5a5e5	effort_logged	\N	{"hours":6,"description":"modules created ","workDate":"2025-11-17"}	Logged 6h on task "Dashboard modules"	\N	\N	2025-11-17 11:49:40.779202+00	\N
ACTL3c97997a0a7c4d5291a04175125c0cc3	USER000000000018	task	TASKa9f77df696b14fc28a935b2afaa5a5e5	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-17 11:49:41.455108+00	\N
ACTL38e7a1850a4340fe95bf91e0b8c1e90e	USER000000000018	task	TASKa9f77df696b14fc28a935b2afaa5a5e5	effort_logged	\N	{"hours":6,"description":"modules created ","workDate":"2025-11-17"}	Logged 6h on task "Dashboard modules"	\N	\N	2025-11-17 11:49:42.529465+00	\N
ACTL409590c79908401a8e56953abf609b4d	USER000000000018	task	TASKa9f77df696b14fc28a935b2afaa5a5e5	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-17 11:50:09.080541+00	\N
ACTL6209f971085f47399b34805305906683	USER000000000017	task	TASKa9f77df696b14fc28a935b2afaa5a5e5	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-17 11:50:24.580566+00	\N
ACTLb0105de8c4504f9c90636e5f74525bf8	USER000000000018	task	TASKa198a81b054c4bc4bdbad2629a3d98ff	subtask_created	\N	{"taskId":"TASKa198a81b054c4bc4bdbad2629a3d98ff","title":"section allignement and api integration ","description":"","isCompleted":false,"assigneeId":"USER000000000018","estimatedHours":1,"actualHours":0,"orderIndex":0,"category":"Development","labels":[]}	Created subtask "section allignement and api integration "	\N	\N	2025-11-17 12:33:26.622234+00	\N
ACTLd5f0ef82e19e496891fe44e0e61e0090	USER000000000018	task	TASKa198a81b054c4bc4bdbad2629a3d98ff	effort_logged	\N	{"subtaskId":"SUBTbfddb1116eec4eec85504337d8c068e1","hours":1.5,"description":"section done ","workDate":"2025-11-17"}	Logged 1.5h on subtask "section allignement and api integration "	\N	\N	2025-11-17 12:34:23.522167+00	\N
ACTLe0698c3838464283999cd1fd3e744c7f	USER000000000018	task	TASKa198a81b054c4bc4bdbad2629a3d98ff	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-17 12:34:57.198273+00	\N
ACTLb68a686959db4dc2b6727d870515e792	USER000000000018	task	TASKa198a81b054c4bc4bdbad2629a3d98ff	effort_logged	\N	{"hours":2.5,"description":"work done ","workDate":"2025-11-17"}	Logged 2.5h on task "task section"	\N	\N	2025-11-17 12:34:57.920946+00	\N
ACTL55efed1da2984c42a3147dffc5821c26	USER000000000018	task	TASKa198a81b054c4bc4bdbad2629a3d98ff	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-17 12:35:11.010098+00	\N
ACTLd46e65acaf184760b9b11febf6c6b247	USER000000000017	task	TASKa198a81b054c4bc4bdbad2629a3d98ff	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-17 12:35:27.985037+00	\N
ACTLc8ef6824cf2b49ed8cee1ffe974ca356	USER000000000017	task	TASK1329848c841c440cae2a772218122c68	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 05:21:01.045135+00	\N
ACTL0a4ba986d102432b92f6b5ab29fc9059	USER000000000017	task	TASK872ba5cef44c4647a01d9dcba143d0d2	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 06:40:27.981209+00	\N
ACTLfa7b6c3a55fb45149fd977d90701b100	USER000000000017	task	TASKc36a084a1c394184a4dbef26c6c7097e	time_entry_updated	{"id":"TIMEa27dde4f225041fe83fc61e1ab98bd8a","createdAt":"2025-11-24T10:23:40.680208","updatedAt":"2025-11-24T10:23:40.680208","userId":"USER000000000018","projectId":"PROJ000000000010","storyId":"STRY46cd781abc0946dc800201657d99661b","taskId":"TASKc36a084a1c394184a4dbef26c6c7097e","subtaskId":null,"description":"ui complete","entryType":"development","hoursWorked":16,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000018","entryType":"development","isBillable":true,"hoursWorked":1,"description":"ui complete","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY46cd781abc0946dc800201657d99661b","taskId":"TASKc36a084a1c394184a4dbef26c6c7097e"}	Updated time entry: 1h	\N	\N	2025-11-27 09:17:04.060793+00	\N
ACTL6707c29132c443cfb5a9033372ad7c1e	USER000000000018	task	TASK826baa037fac4b7183afa24ffe3b538b	effort_logged	\N	{"hours":2,"description":"e","workDate":"2025-11-28"}	Logged 2h on task "ex"	\N	\N	2025-11-28 04:46:45.634294+00	\N
ACTLea7e974fdd9a4c50b55ab090e9b4636a	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"QA_REVIEW"}	Changed status from done to QA_REVIEW	\N	\N	2025-12-02 06:12:33.796373+00	\N
ACTL09a5ef400e4a4c07b00b03394488e295	USER000000000019	task	TASK4b56151bb4de44198312e31add1617d7	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 10:11:44.974462+00	PROJ000000000010
ACTLbed465f8124746f2bc9935a53df52970	USER000000000019	task	TASK4b56151bb4de44198312e31add1617d7	status_changed	{"status":"qa_review"}	{"status":"QA_REVIEW"}	Changed status from qa_review to QA_REVIEW	\N	\N	2025-12-05 06:23:48.836818+00	PROJ000000000010
ACTL889ff5477c144e4db7ad6ca047dfe78a	USER000000000018	task	TASK8636aeb128e74eb4a79ef45417c57948	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 13:12:56.491263+00	\N
ACTL1215ea33985b4fd5a206064f933ba6a2	USER000000000018	task	TASK8636aeb128e74eb4a79ef45417c57948	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 13:13:04.235964+00	\N
ACTL697d20396c404befacfeb7f38e3b6465	USER000000000017	task	TASK9b4c8c858df64315ada9819299ca0319	status_changed	{"status":"done"}	{"status":"TO_DO"}	Changed status from done to TO_DO	\N	\N	2025-11-29 06:23:46.028088+00	\N
ACTL4302998d291249cebbfa4f3788cff214	USER000000000019	task	TASK4b56151bb4de44198312e31add1617d7	status_changed	{"status":"qa_review"}	{"status":"IN_PROGRESS"}	Changed status from qa_review to IN_PROGRESS	\N	\N	2025-12-05 06:24:06.693476+00	PROJ000000000010
ACTL217f4472445d4217ba003b9f86019a49	USER000000000019	task	TASK7b06723b35774993a86aee0b479b6f6f	effort_logged	\N	{"hours":5,"description":"Pending users visible in a separate queue\\n\\nShows user email, role requested, department\\n\\nStatus should display as “Pending Approval”","workDate":"2025-10-16"}	Logged 5h on task "Add Permission Request Queue for New Users"	\N	\N	2025-12-06 08:55:34.326073+00	PROJ000000000010
ACTL0ca5c2dd1d464fb09ca6691506b356a5	USER000000000017	task	TASKf3ef3571a7da4920b3daf550c070c4a9	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 09:24:29.402435+00	PROJ000000000010
ACTLb6e2ae72e7f64208b878cfe2d481ab95	USER000000000019	task	TASK112b4792c48e4c9c9ce3323e9379e73b	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-10-02 12:28:01.685+00	\N
ACTL68be8062585040a49693355083413a99	USER000000000019	task	TASK112b4792c48e4c9c9ce3323e9379e73b	effort_logged	\N	{"hours":4,"description":"cards created with add user form.... now new user can be added by admin using form ","workDate":"2025-10-02"}	Logged 4h on task "Admin Panel Cards"	\N	\N	2025-10-02 12:28:01.685+00	\N
ACTL55de556e56da4e71b9470a6bb8c62432	USER000000000019	task	TASK112b4792c48e4c9c9ce3323e9379e73b	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-10-02 12:28:01.685+00	\N
ACTLb6c6b9d28df84e75b4e2704de70ecf6f	USER000000000019	task	TASK112b4792c48e4c9c9ce3323e9379e73b	status_changed	{"status":"qa_review"}	{"status":"QA_REVIEW"}	Changed status from qa_review to QA_REVIEW	\N	\N	2025-10-02 12:28:01.685+00	\N
ACTLad942657b4e6482d982819830d86f097	USER000000000017	task	TASK112b4792c48e4c9c9ce3323e9379e73b	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-10-02 12:28:01.685+00	\N
ACTLf38c8a657870453dbea7d5ee1cb4d4f4	USER000000000019	task	TASK1214626ea51c41b595f2845036536bb1	subtask_created	\N	{"taskId":"TASK1214626ea51c41b595f2845036536bb1","title":"form creation","description":"form creation of view button , edit button  and validating with database","isCompleted":false,"assigneeId":"USER000000000019","estimatedHours":3,"actualHours":0,"orderIndex":0,"dueDate":"2025-10-06","category":"Development","labels":[]}	Created subtask "form creation"	\N	\N	2025-10-06 12:48:52.347+00	\N
ACTLcb5ae592259641d4988a8bba31507eb4	USER000000000019	task	TASK1214626ea51c41b595f2845036536bb1	effort_logged	\N	{"subtaskId":"SUBTb151175d167d410a82eab4764d011adc","hours":3,"description":"Forms Created ","workDate":"2025-10-06"}	Logged 3h on subtask "form creation"	\N	\N	2025-10-06 12:48:52.347+00	\N
ACTL142a38b4690944a5b45a2018beb23d6d	USER000000000019	task	TASK1214626ea51c41b595f2845036536bb1	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-19 12:55:48.603525+00	\N
ACTLea62a49f352f49f4a3c8ad23801ef6aa	USER000000000019	task	TASK1214626ea51c41b595f2845036536bb1	effort_logged	\N	{"hours":5,"description":"user management validated ","workDate":"2025-10-06"}	Logged 5h on task "User Management Integration"	\N	\N	2025-11-19 12:55:49.336589+00	\N
ACTL935934ac1c324254ad5847f14902b655	USER000000000019	task	TASK1214626ea51c41b595f2845036536bb1	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-19 12:56:16.046038+00	\N
ACTL74222bbc9bb74dbd86508a57a11a354d	USER000000000017	task	TASK1214626ea51c41b595f2845036536bb1	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-19 12:56:27.632807+00	\N
ACTL332eadc78d8e4a92be060373157752d9	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	subtask_created	\N	{"taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","title":"Backend - Pending Registration Entity & Repository","description":"Create PendingRegistration entity with fields (id, name, email, passwordHash, role, departmentId, domainId, createdAt, updatedAt)","isCompleted":false,"assigneeId":"USER000000000019","estimatedHours":1,"actualHours":0,"orderIndex":0,"category":"Development","labels":[]}	Created subtask "Backend - Pending Registration Entity & Repository"	\N	\N	2025-11-20 04:53:35.371682+00	\N
ACTLe5c12a096f214f45a01df6ab516d9b0d	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"to_do"}	{"status":"TO_DO"}	Changed status from to_do to TO_DO	\N	\N	2025-11-25 04:48:38.379843+00	PROJ000000000010
ACTL2b8676a3ccd747a0bc2b25f795e5a80d	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	subtask_created	\N	{"taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","title":"Backend - Pending Registration REST API Controller,Frontend - API Service & Hooks for Pending Registrations","description":"Modify AddUserForm to accept initialData prop for pre-filling\\nPre-fill form fields from pending registration (name, email, role, department, domain)\\nAdmin fills additional details (experience, hourly rate, CTC, skills, availability, avatar)\\nHandle pendingRegistrationId prop to track which registration is being approved\\nAuto-delete pending registration after successful user creation","isCompleted":false,"assigneeId":"USER000000000019","estimatedHours":3,"actualHours":0,"orderIndex":0,"category":"Development","labels":[]}	Created subtask "Backend - Pending Registration REST API Controller,Frontend - API Service & Hooks for Pending Registrations"	\N	\N	2025-11-20 04:54:33.417779+00	\N
ACTLd088d0b4702c40478fdb205b584218a7	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	subtask_created	\N	{"taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","title":"Admin Panel Integration ","description":" Add \\"Permissions\\" tab to AdminPanelPage Integrate PendingRegistrationsTab component in permissions tab Ensure proper tab navigation and state management Refresh user list after approval","isCompleted":false,"assigneeId":"USER000000000019","estimatedHours":3,"actualHours":0,"orderIndex":0,"category":"Development","labels":[]}	Created subtask "Admin Panel Integration "	\N	\N	2025-11-20 04:55:13.785824+00	\N
ACTL4516308dd61642dcb3bdd3629b96215a	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	effort_logged	\N	{"subtaskId":"SUBTf59806621c2f4fb39f00895955ad102c","hours":3,"description":"done with admin panel integration ","workDate":"2025-10-08"}	Logged 3h on subtask "Admin Panel Integration "	\N	\N	2025-11-20 04:56:31.264872+00	\N
ACTL02541e89205f4beb97f37943c9f9fea3	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	effort_logged	\N	{"subtaskId":"SUBT5094b6d60e824b698a89d6d9afa03199","hours":1,"description":"backend api and services created ","workDate":"2025-10-08"}	Logged 1h on subtask "Backend - Pending Registration Entity & Repository"	\N	\N	2025-11-20 04:57:20.625584+00	\N
ACTL03c5b8827a6547c3af63a452601b0356	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	effort_logged	\N	{"subtaskId":"SUBT6c5d3a153ffe42adbc5fc44667aa00da","hours":3,"description":"rest Api integration and validation completed","workDate":"2025-10-08"}	Logged 3h on subtask "Backend - Pending Registration REST API Controller,Frontend - API Service & Hooks for Pending Registrations"	\N	\N	2025-11-20 04:58:04.860632+00	\N
ACTL6e8188a2a4eb4dfc93f9bcbd65a0e969	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-20 05:00:40.296167+00	\N
ACTL666f9be99e2b49bfa9bb3b188c7fb633	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	effort_logged	\N	{"hours":5,"description":"user permission section implemented and validated","workDate":"2025-10-08"}	Logged 5h on task "User Permission Section with Pending Registration Management"	\N	\N	2025-11-20 05:00:41.114808+00	\N
ACTL7dd95e3764634d32a38e4db1e637e233	USER000000000019	task	TASK4b56151bb4de44198312e31add1617d7	status_changed	{"status":"qa_review"}	{"status":"TO_DO"}	Changed status from qa_review to TO_DO	\N	\N	2025-12-05 06:23:59.866809+00	PROJ000000000010
ACTL25d56fc27a3349e492a88f7fe064b927	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	time_entry_updated	{"id":"TIMEcc19f5774c52443b86d0eaa88f03bb83","createdAt":"2025-11-20T10:26:27.067662","updatedAt":"2025-11-20T10:26:27.067662","userId":"USER000000000019","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":"SUBTf59806621c2f4fb39f00895955ad102c","description":"done with admin panel integration ","entryType":"development","hoursWorked":3,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000019","entryType":"development","isBillable":true,"hoursWorked":3,"description":"done with admin panel integration","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":"SUBTf59806621c2f4fb39f00895955ad102c"}	Updated time entry: 3h	\N	\N	2025-11-20 05:01:39.996328+00	\N
ACTLa0cd6abd5ad043f39a5bdb20dcb7f606	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	time_entry_updated	{"id":"TIME9e35ab54f3d143cb8502adfb36bf7fe6","createdAt":"2025-11-20T10:27:16.81676","updatedAt":"2025-11-20T10:27:16.81676","userId":"USER000000000019","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":"SUBT5094b6d60e824b698a89d6d9afa03199","description":"backend api and services created ","entryType":"development","hoursWorked":1,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000019","entryType":"development","isBillable":true,"hoursWorked":1,"description":"backend api and services created","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":"SUBT5094b6d60e824b698a89d6d9afa03199"}	Updated time entry: 1h	\N	\N	2025-11-20 05:01:44.911292+00	\N
ACTL8df282998e2844509158bd04a78f0991	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	time_entry_updated	{"id":"TIME73d570bad58a4afabbf6b7640213c4e2","createdAt":"2025-11-20T10:28:01.384343","updatedAt":"2025-11-20T10:28:01.384343","userId":"USER000000000019","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":"SUBT6c5d3a153ffe42adbc5fc44667aa00da","description":"rest Api integration and validation completed","entryType":"development","hoursWorked":3,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000019","entryType":"development","isBillable":true,"hoursWorked":3,"description":"rest Api integration and validation completed","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":"SUBT6c5d3a153ffe42adbc5fc44667aa00da"}	Updated time entry: 3h	\N	\N	2025-11-20 05:01:50.644629+00	\N
ACTL9d394b050e274e00a68385af066c34c3	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	time_entry_updated	{"id":"TIME679c6af4b501487b90e207e2b6744296","createdAt":"2025-11-20T10:30:36.393071","updatedAt":"2025-11-20T10:30:36.393071","userId":"USER000000000019","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":null,"description":"user permission section implemented and validated","entryType":"development","hoursWorked":5,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000019","entryType":"development","isBillable":true,"hoursWorked":5,"description":"user permission section implemented and validated","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87"}	Updated time entry: 5h	\N	\N	2025-11-20 05:01:54.425041+00	\N
ACTL6523eaadbff64910a6f1f7c98f6856a1	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-20 05:02:36.617567+00	\N
ACTLa932a6204ece48478ddfe19e1c161223	USER000000000017	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-20 05:03:27.10059+00	\N
ACTL9dca14b9c52748acb7e55c92a37387c1	USER000000000017	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	time_entry_updated	{"id":"TIME73d570bad58a4afabbf6b7640213c4e2","createdAt":"2025-11-20T10:28:01.384343","updatedAt":"2025-11-20T10:28:01.384343","userId":"USER000000000019","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":"SUBT6c5d3a153ffe42adbc5fc44667aa00da","description":"rest Api integration and validation completed","entryType":"development","hoursWorked":3,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000019","entryType":"development","isBillable":true,"hoursWorked":1,"description":"rest Api integration and validation completed","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":"SUBT6c5d3a153ffe42adbc5fc44667aa00da"}	Updated time entry: 1h	\N	\N	2025-11-20 05:12:43.113872+00	\N
ACTL1ecb86a8f4214c9eb00757eeaf30a9cb	USER000000000019	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	time_entry_updated	{"id":"TIMEcc19f5774c52443b86d0eaa88f03bb83","createdAt":"2025-11-20T10:26:27.067662","updatedAt":"2025-11-20T10:32:28.914208","userId":"USER000000000019","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":"SUBTf59806621c2f4fb39f00895955ad102c","description":"done with admin panel integration","entryType":"development","hoursWorked":3,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000019","entryType":"development","isBillable":true,"hoursWorked":1,"description":"done with admin panel integration","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY5e23619bd5b6405ab68917882853b715","taskId":"TASK7a13b861e0404e3faa65fcdc8e42ed87","subtaskId":"SUBTf59806621c2f4fb39f00895955ad102c"}	Updated time entry: 1h	\N	\N	2025-11-20 05:13:21.860078+00	\N
ACTLe18bb23d819d4032822015d925735a45	USER000000000017	task	TASK577bb13c26c64df485fb36e5f448687f	subtask_created	\N	{"taskId":"TASK577bb13c26c64df485fb36e5f448687f","title":"Create Custom Enum Types","description":"Design and implement all 25 custom PostgreSQL enum types that will be used across the database schema. These enums ensure data consistency and prevent invalid values.\\n","isCompleted":false,"assigneeId":"USER000000000017","estimatedHours":2,"actualHours":0,"orderIndex":0,"labels":[]}	Created subtask "Create Custom Enum Types"	\N	\N	2025-11-20 09:07:47.330684+00	\N
ACTLa9b44ee08096451c92438f1873570901	USER000000000017	task	TASK577bb13c26c64df485fb36e5f448687f	subtask_created	\N	{"taskId":"TASK577bb13c26c64df485fb36e5f448687f","title":"Create Core Organizational Tables Projects and Team Management Tables","description":"Design and implement the projects table and project_team_members junction table to support project management and team allocation.\\nImplement the foundational organizational tables that define the company structure and user management system.\\n","isCompleted":false,"assigneeId":"USER000000000017","estimatedHours":3,"actualHours":0,"orderIndex":0,"labels":[]}	Created subtask "Create Core Organizational Tables Projects and Team Management Tables"	\N	\N	2025-11-20 09:09:13.636121+00	\N
ACTL0264f9f0f17c45e5af9e88493e351d16	USER000000000017	task	TASK577bb13c26c64df485fb36e5f448687f	effort_logged	\N	{"subtaskId":"SUBTb204f699c68248b08b4e9b2b3ad1e40a","hours":3,"description":"Create user role enum: admin, manager, developer, designer\\n- Create experience level enum: junior, mid, senior, lead\\n- Create project status enum: planning, active, paused, completed, cancelled\\n- Create priority enum: low, medium, high, critical\\n- Create methodology enum: scrum, kanban, waterfall\\n- Create project template enum: web-app, mobile-app, api-service, data-analytics\\n- Create sprint status enum: planning, active, completed, cancelled\\n- Create epic status enum: backlog, planning, in-progress, review, completed, cancelled\\n- Create release status enum: planning, development, testing, staging, ready-for-release, released, cancelled\\n- Create story status enum: backlog, to_do, in_progress, qa_review, done","workDate":"2025-10-01"}	Logged 3h on subtask "Create Custom Enum Types"	\N	\N	2025-11-20 09:10:37.405817+00	\N
ACTLd9003c8624144e99b8b9ad427487bb16	USER000000000017	task	TASK577bb13c26c64df485fb36e5f448687f	time_entry_updated	{"id":"TIMEcbbe2d20a26f461293b6af6f81efa5f7","createdAt":"2025-11-20T14:40:33.651013","updatedAt":"2025-11-20T14:40:33.651013","userId":"USER000000000017","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK577bb13c26c64df485fb36e5f448687f","subtaskId":"SUBTb204f699c68248b08b4e9b2b3ad1e40a","description":"Create user role enum: admin, manager, developer, designer\\n- Create experience level enum: junior, mid, senior, lead\\n- Create project status enum: planning, active, paused, completed, cancelled\\n- Create priority enum: low, medium, high, critical\\n- Create methodology enum: scrum, kanban, waterfall\\n- Create project template enum: web-app, mobile-app, api-service, data-analytics\\n- Create sprint status enum: planning, active, completed, cancelled\\n- Create epic status enum: backlog, planning, in-progress, review, completed, cancelled\\n- Create release status enum: planning, development, testing, staging, ready-for-release, released, cancelled\\n- Create story status enum: backlog, to_do, in_progress, qa_review, done","entryType":"development","hoursWorked":3,"workDate":"2025-10-01","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000017","entryType":"development","isBillable":true,"hoursWorked":3,"description":"Create user role enum: admin, manager, developer, designer\\n- Create experience level enum: junior, mid, senior, lead\\n- Create project status enum: planning, active, paused, completed, cancelled\\n- Create priority enum: low, medium, high, critical\\n- Create methodology enum: scrum, kanban, waterfall\\n- Create project template enum: web-app, mobile-app, api-service, data-analytics\\n- Create sprint status enum: planning, active, completed, cancelled\\n- Create epic status enum: backlog, planning, in-progress, review, completed, cancelled\\n- Create release status enum: planning, development, testing, staging, ready-for-release, released, cancelled\\n- Create story status enum: backlog, to_do, in_progress, qa_review, done","workDate":"2025-10-01","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK577bb13c26c64df485fb36e5f448687f","subtaskId":"SUBTb204f699c68248b08b4e9b2b3ad1e40a"}	Updated time entry: 3h	\N	\N	2025-11-20 09:10:58.307286+00	\N
ACTLc5fd3016e2f54b558f867dc0a7b91bc7	USER000000000017	task	TASK577bb13c26c64df485fb36e5f448687f	effort_logged	\N	{"subtaskId":"SUBT09978e4fe7c74f16852a5fcc85e6b169","hours":3,"description":"- Create departments table with id (UUID), name (UNIQUE), description, timestamps\\n- Create domains table with id (UUID), name (UNIQUE), description, timestamps\\n- Create users table with comprehensive fields:\\n  - Primary key: id (UUID)\\n  - Authentication: email (UNIQUE), password_hash\\n  - Profile: name, avatar_url\\n  - Organization: role (enum), department_id (FK), domain_id (FK)\\n  - Professional: experience (enum), hourly_rate, availability_percentage, skills (JSONB)\\n  - Status: is_active, last_login\\n  - Timestamps: created_at, updated_at\\n- Add foreign key constraints to departments and domains\\n- Add check constraints for availability_percentage (0-100)\\n- Add indexes on email, department_id, domain_id, role, is_active\\n\\n","workDate":"2025-10-01"}	Logged 3h on subtask "Create Core Organizational Tables Projects and Team Management Tables"	\N	\N	2025-11-20 09:11:57.935935+00	\N
ACTL4421bafdd3264cc6ad1d29b0bfeb4914	USER000000000017	task	TASK33c3cf6e954e4ed5893d1886253a9dd7	effort_logged	\N	{"hours":4,"description":"Design webhook entity model\\nCreate Webhook entity, repository, and service classes\\nImplement /api/webhooks CRUD endpoints\\nImplement webhook registration endpoint with event subscription\\nCreate webhook event dispatcher service\\nAdd webhook delivery status tracking\\nAdd webhook logging and monitoring\\n","workDate":"2025-11-24"}	Logged 4h on task "Implement API Webhook System for Event Notifications"	\N	\N	2025-11-24 11:21:23.347704+00	\N
ACTLd43ba4e5f1bd49718024af1b43708b8c	USER000000000017	task	TASK577bb13c26c64df485fb36e5f448687f	time_entry_updated	{"id":"TIME4ad8a1fc64bc495290d98fea0d86bb95","createdAt":"2025-11-20T14:41:55.046461","updatedAt":"2025-11-20T14:41:55.046461","userId":"USER000000000017","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK577bb13c26c64df485fb36e5f448687f","subtaskId":"SUBT09978e4fe7c74f16852a5fcc85e6b169","description":"- Create departments table with id (UUID), name (UNIQUE), description, timestamps\\n- Create domains table with id (UUID), name (UNIQUE), description, timestamps\\n- Create users table with comprehensive fields:\\n  - Primary key: id (UUID)\\n  - Authentication: email (UNIQUE), password_hash\\n  - Profile: name, avatar_url\\n  - Organization: role (enum), department_id (FK), domain_id (FK)\\n  - Professional: experience (enum), hourly_rate, availability_percentage, skills (JSONB)\\n  - Status: is_active, last_login\\n  - Timestamps: created_at, updated_at\\n- Add foreign key constraints to departments and domains\\n- Add check constraints for availability_percentage (0-100)\\n- Add indexes on email, department_id, domain_id, role, is_active\\n\\n","entryType":"development","hoursWorked":3,"workDate":"2025-10-01","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000017","entryType":"development","isBillable":true,"hoursWorked":3,"description":"- Create departments table with id (UUID), name (UNIQUE), description, timestamps\\n- Create domains table with id (UUID), name (UNIQUE), description, timestamps\\n- Create users table with comprehensive fields:\\n  - Primary key: id (UUID)\\n  - Authentication: email (UNIQUE), password_hash\\n  - Profile: name, avatar_url\\n  - Organization: role (enum), department_id (FK), domain_id (FK)\\n  - Professional: experience (enum), hourly_rate, availability_percentage, skills (JSONB)\\n  - Status: is_active, last_login\\n  - Timestamps: created_at, updated_at\\n- Add foreign key constraints to departments and domains\\n- Add check constraints for availability_percentage (0-100)\\n- Add indexes on email, department_id, domain_id, role, is_active","workDate":"2025-10-01","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK577bb13c26c64df485fb36e5f448687f","subtaskId":"SUBT09978e4fe7c74f16852a5fcc85e6b169"}	Updated time entry: 3h	\N	\N	2025-11-20 09:12:33.137469+00	\N
ACTL71c096e3702140ca9e84a0d04ed821f2	USER000000000017	task	TASK577bb13c26c64df485fb36e5f448687f	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-20 09:14:10.948498+00	\N
ACTL3c6f7b5c3918420584f68b2bf0358f6b	USER000000000017	task	TASK577bb13c26c64df485fb36e5f448687f	effort_logged	\N	{"hours":3,"description":"- Design 25 custom PostgreSQL enum types for status, priority, roles, methodologies, etc.\\n- Create core organizational tables: departments, domains, users\\n- Create projects table with all required fields and JSONB columns\\n- Implement UUID primary keys for all tables\\n- Add created_at and updated_at timestamps with timezone support\\n- Define unique constraints and basic validation rules\\n- Create project_team_members junction table for many-to-many relationships","workDate":"2025-10-01"}	Logged 3h on task "Design and Implement Core Database Schema with Custom Enums"	\N	\N	2025-11-20 09:14:11.638467+00	\N
ACTL022604a9a5ab4987b47c647db4892256	USER000000000017	task	TASK577bb13c26c64df485fb36e5f448687f	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-20 09:14:36.487463+00	\N
ACTLe664eafae43d4afb965935d824ef1a7e	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	subtask_created	\N	{"taskId":"TASK4700f30a5dd54f7aa00d62748559c721","title":"Create Sprints, Epics, and Releases Tables","description":"Implement the high-level agile planning tables that organize work at the sprint, epic, and release levels.\\n","isCompleted":false,"assigneeId":"USER000000000017","estimatedHours":3,"actualHours":0,"orderIndex":0,"dueDate":"2025-10-06","labels":[]}	Created subtask "Create Sprints, Epics, and Releases Tables"	\N	\N	2025-11-20 10:00:15.217551+00	\N
ACTL12cf9c0b99fa42beabc0b503bd51d9a9	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	subtask_created	\N	{"taskId":"TASK4700f30a5dd54f7aa00d62748559c721","title":"Create Quality Gates and Stories Tables","description":"Implement quality gates for release validation and stories table that links epics, releases, and sprints.\\n","isCompleted":false,"assigneeId":"USER000000000017","estimatedHours":2,"actualHours":0,"orderIndex":0,"labels":[]}	Created subtask "Create Quality Gates and Stories Tables"	\N	\N	2025-11-20 10:04:14.813536+00	\N
ACTL30c72d3dfa654421aa46ce4180947a5b	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	subtask_created	\N	{"taskId":"TASK4700f30a5dd54f7aa00d62748559c721","title":"Create Tasks and Subtasks Tables with Bug Workflow Support","description":"Implement the task and subtask hierarchy with support for the simplified bug fixing workflow where QA creates subtasks and developers fix them.\\n","isCompleted":false,"assigneeId":"USER000000000017","estimatedHours":3,"actualHours":0,"orderIndex":0,"labels":[]}	Created subtask "Create Tasks and Subtasks Tables with Bug Workflow Support"	\N	\N	2025-11-20 10:04:47.391854+00	\N
ACTL993a594a9c3e49d9a1151ed6104fcc89	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	status_changed	{"status":"to_do"}	{"status":"IN_PROGRESS"}	Manager moved task from To Do to In Progress	\N	\N	2025-11-20 10:06:53.156795+00	\N
ACTLcb99bf32cbf2445d9e93fbbc111be1ea	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	effort_logged	\N	{"subtaskId":"SUBT33b344ccf8a74c5da5db05bb772a40c3","hours":3,"description":"Create Sprints Table: Includes project link, sprint info (name, goal, status), timeline, metrics (capacity & velocity), active flag, and timestamps.\\n\\nCreate Epics Table: Stores epic details, classification (priority, status), assignments, progress metrics, business fields, links to releases/stories/milestones, metadata (labels, components, risks), and timestamps.\\n\\nCreate Releases Table: Contains release details (name, version), status, timeline, progress, links to epics/stories/sprints, documentation, planning metadata, creator info, and timestamps.\\n\\nAdd all foreign keys with CASCADE DELETE: For project_id and other linking fields (assignee, owner, release, created_by).\\n\\nCreate indexes on all foreign keys and status fields: To optimize lookups, filtering, and joins across sprints, epics, and releases.","workDate":"2025-11-06"}	Logged 3h on subtask "Create Sprints, Epics, and Releases Tables"	\N	\N	2025-11-20 10:09:13.12019+00	\N
ACTLa005e56345f042b9b6f907c801c000ad	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	effort_logged	\N	{"subtaskId":"SUBT244d3a27de4240ca9d99805dd9f08f11","hours":2,"description":"Quality Gates Table\\n\\nStores release quality checks with fields: id, release_id (FK), name, description, status (enum), required, completed_at, created_at.\\n\\nStories Table – Core Structure\\n\\nContains story data with id, project_id (FK), and hierarchical links: sprint_id, epic_id, release_id (all nullable).\\n\\nStory Details & Classification\\n\\nIncludes title, description, acceptance_criteria (JSONB), status, priority, labels, and order_index.\\n\\nEstimation & Assignment Fields\\n\\nTracks story_points, estimated_hours, actual_hours, and assignment fields: assignee_id, reporter_id.\\n\\nIndexes & Constraints\\n\\nAdd indexes on all FKs, status, assignee, and order_index.\\n\\nAdd check constraints validating valid ranges for story points and hour estimates.","workDate":"2025-10-07"}	Logged 2h on subtask "Create Quality Gates and Stories Tables"	\N	\N	2025-11-20 10:11:03.252793+00	\N
ACTLe5700a7622874e369455a291e60ad037	USER000000000017	task	TASK33c3cf6e954e4ed5893d1886253a9dd7	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-24 11:21:44.695945+00	\N
ACTL0381a0d69c29432292b0d9a59e77b710	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	effort_logged	\N	{"subtaskId":"SUBT2d954a98a85c494db5e1d5fb10b78ff8","hours":3,"description":"Tasks Table:\\nStores task-level data linked to a story, including title, description, status/priority enums, estimated & actual hours, assignee/reporter, labels, ordering, due date, and timestamps.\\n\\nSubtasks Table:\\nStores subtasks linked to a parent task with simplified workflow fields: completion flag, bug details (type & severity), estimation fields, assignment, ordering, due date, and timestamps.\\n\\nRelationships & Cascades:\\nstory_id in tasks and task_id in subtasks use CASCADE DELETE ensuring dependent items are removed when the parent is deleted.\\n\\nIndexes & Constraints:\\nAdd indexes on story_id, task_id, status, assignee_id, is_completed, bug_type, and severity.\\nAdd CHECK constraints to enforce valid hour ranges (e.g., ≥0).\\n\\nBug Workflow Definition:\\nWorkflow: QA creates subtask → Developer completes subtask → Task moves to qa_review → QA verifies & closes task as done.","workDate":"2025-10-08"}	Logged 3h on subtask "Create Tasks and Subtasks Tables with Bug Workflow Support"	\N	\N	2025-11-20 10:12:15.214036+00	\N
ACTL3dce8926cabd4083a641db1849e63283	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	time_entry_updated	{"id":"TIME92809b5aab5744ca9158a62f50c069fc","createdAt":"2025-11-20T15:41:00.552009","updatedAt":"2025-11-20T15:41:00.552009","userId":"USER000000000017","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721","subtaskId":"SUBT244d3a27de4240ca9d99805dd9f08f11","description":"Quality Gates Table\\n\\nStores release quality checks with fields: id, release_id (FK), name, description, status (enum), required, completed_at, created_at.\\n\\nStories Table – Core Structure\\n\\nContains story data with id, project_id (FK), and hierarchical links: sprint_id, epic_id, release_id (all nullable).\\n\\nStory Details & Classification\\n\\nIncludes title, description, acceptance_criteria (JSONB), status, priority, labels, and order_index.\\n\\nEstimation & Assignment Fields\\n\\nTracks story_points, estimated_hours, actual_hours, and assignment fields: assignee_id, reporter_id.\\n\\nIndexes & Constraints\\n\\nAdd indexes on all FKs, status, assignee, and order_index.\\n\\nAdd check constraints validating valid ranges for story points and hour estimates.","entryType":"development","hoursWorked":2,"workDate":"2025-10-07","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000017","entryType":"development","isBillable":true,"hoursWorked":2,"description":"Quality Gates Table\\n\\nStores release quality checks with fields: id, release_id (FK), name, description, status (enum), required, completed_at, created_at.\\n\\nStories Table – Core Structure\\n\\nContains story data with id, project_id (FK), and hierarchical links: sprint_id, epic_id, release_id (all nullable).\\n\\nStory Details & Classification\\n\\nIncludes title, description, acceptance_criteria (JSONB), status, priority, labels, and order_index.\\n\\nEstimation & Assignment Fields\\n\\nTracks story_points, estimated_hours, actual_hours, and assignment fields: assignee_id, reporter_id.\\n\\nIndexes & Constraints\\n\\nAdd indexes on all FKs, status, assignee, and order_index.\\n\\nAdd check constraints validating valid ranges for story points and hour estimates.","workDate":"2025-10-07","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721","subtaskId":"SUBT244d3a27de4240ca9d99805dd9f08f11"}	Updated time entry: 2h	\N	\N	2025-11-20 10:13:19.422785+00	\N
ACTLc74a45a3bc3c48f09edca31973a17c8b	USER000000000019	task	TASK7b06723b35774993a86aee0b479b6f6f	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-06 08:55:48.285823+00	PROJ000000000010
ACTL6115058482004e94ac42d2338c6a2b8d	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	time_entry_updated	{"id":"TIMEdd9ff2d7e545452f818abb78ed6dfe0e","createdAt":"2025-11-20T15:42:11.161628","updatedAt":"2025-11-20T15:42:11.161628","userId":"USER000000000017","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721","subtaskId":"SUBT2d954a98a85c494db5e1d5fb10b78ff8","description":"Tasks Table:\\nStores task-level data linked to a story, including title, description, status/priority enums, estimated & actual hours, assignee/reporter, labels, ordering, due date, and timestamps.\\n\\nSubtasks Table:\\nStores subtasks linked to a parent task with simplified workflow fields: completion flag, bug details (type & severity), estimation fields, assignment, ordering, due date, and timestamps.\\n\\nRelationships & Cascades:\\nstory_id in tasks and task_id in subtasks use CASCADE DELETE ensuring dependent items are removed when the parent is deleted.\\n\\nIndexes & Constraints:\\nAdd indexes on story_id, task_id, status, assignee_id, is_completed, bug_type, and severity.\\nAdd CHECK constraints to enforce valid hour ranges (e.g., ≥0).\\n\\nBug Workflow Definition:\\nWorkflow: QA creates subtask → Developer completes subtask → Task moves to qa_review → QA verifies & closes task as done.","entryType":"development","hoursWorked":3,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000017","entryType":"development","isBillable":true,"hoursWorked":3,"description":"Tasks Table:\\nStores task-level data linked to a story, including title, description, status/priority enums, estimated & actual hours, assignee/reporter, labels, ordering, due date, and timestamps.\\n\\nSubtasks Table:\\nStores subtasks linked to a parent task with simplified workflow fields: completion flag, bug details (type & severity), estimation fields, assignment, ordering, due date, and timestamps.\\n\\nRelationships & Cascades:\\nstory_id in tasks and task_id in subtasks use CASCADE DELETE ensuring dependent items are removed when the parent is deleted.\\n\\nIndexes & Constraints:\\nAdd indexes on story_id, task_id, status, assignee_id, is_completed, bug_type, and severity.\\nAdd CHECK constraints to enforce valid hour ranges (e.g., ≥0).\\n\\nBug Workflow Definition:\\nWorkflow: QA creates subtask → Developer completes subtask → Task moves to qa_review → QA verifies & closes task as done.","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721","subtaskId":"SUBT2d954a98a85c494db5e1d5fb10b78ff8"}	Updated time entry: 3h	\N	\N	2025-11-20 10:13:46.260741+00	\N
ACTLcd888be4f8b44967841f83faf09a90a1	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	effort_logged	\N	{"hours":5,"description":"- Create sprints table with capacity and velocity tracking\\n- Create epics table with theme, business value, and story linking\\n- Create releases table with quality gate integration\\n- Create quality_gates table for release validation\\n- Create stories table with epic and release relationships\\n- Create tasks table with status workflow support\\n- Create subtasks table with simplified bug workflow fields\\n- Implement proper foreign key relationships with CASCADE and SET NULL rules","workDate":"2025-10-08"}	Logged 5h on task "Agile Development Schema Design Tables"	\N	\N	2025-11-20 10:15:03.009225+00	\N
ACTL54ebc77496cc4358975b4b6220f31808	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-20 10:15:11.38359+00	\N
ACTL84f21440d4dc4c8d8784c03a2fc2ab5c	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-20 10:15:19.710708+00	\N
ACTL09c5d695d2a44acab1043bf687f4d91e	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	time_entry_updated	{"id":"TIME241454dd56d64242b30a967079829fb4","createdAt":"2025-11-20T15:45:01.006471","updatedAt":"2025-11-20T15:45:01.006471","userId":"USER000000000017","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721","subtaskId":null,"description":"- Create sprints table with capacity and velocity tracking\\n- Create epics table with theme, business value, and story linking\\n- Create releases table with quality gate integration\\n- Create quality_gates table for release validation\\n- Create stories table with epic and release relationships\\n- Create tasks table with status workflow support\\n- Create subtasks table with simplified bug workflow fields\\n- Implement proper foreign key relationships with CASCADE and SET NULL rules","entryType":"development","hoursWorked":5,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000017","entryType":"development","isBillable":true,"hoursWorked":3,"description":"- Create sprints table with capacity and velocity tracking\\n- Create epics table with theme, business value, and story linking\\n- Create releases table with quality gate integration\\n- Create quality_gates table for release validation\\n- Create stories table with epic and release relationships\\n- Create tasks table with status workflow support\\n- Create subtasks table with simplified bug workflow fields\\n- Implement proper foreign key relationships with CASCADE and SET NULL rules","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721"}	Updated time entry: 3h	\N	\N	2025-11-20 10:18:39.963453+00	\N
ACTL448a0be4809d484f871e812a61c3508b	USER000000000017	task	TASKb5dc49a8af64416381b946ad36616f80	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 06:08:50.502887+00	\N
ACTLc5d71630987f4f5c93b1b1897518365a	USER000000000017	task	TASKb5dc49a8af64416381b946ad36616f80	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 06:09:19.695679+00	\N
ACTLfd95867a30bd40c48fc1632c66ff1d32	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	time_entry_updated	{"id":"TIMEb017970a832647f78671235af9531056","createdAt":"2025-11-20T15:39:09.795579","updatedAt":"2025-11-20T15:39:09.795579","userId":"USER000000000017","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721","subtaskId":"SUBT33b344ccf8a74c5da5db05bb772a40c3","description":"Create Sprints Table: Includes project link, sprint info (name, goal, status), timeline, metrics (capacity & velocity), active flag, and timestamps.\\n\\nCreate Epics Table: Stores epic details, classification (priority, status), assignments, progress metrics, business fields, links to releases/stories/milestones, metadata (labels, components, risks), and timestamps.\\n\\nCreate Releases Table: Contains release details (name, version), status, timeline, progress, links to epics/stories/sprints, documentation, planning metadata, creator info, and timestamps.\\n\\nAdd all foreign keys with CASCADE DELETE: For project_id and other linking fields (assignee, owner, release, created_by).\\n\\nCreate indexes on all foreign keys and status fields: To optimize lookups, filtering, and joins across sprints, epics, and releases.","entryType":"development","hoursWorked":3,"workDate":"2025-11-06","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000017","entryType":"development","isBillable":true,"hoursWorked":2,"description":"Create Sprints Table: Includes project link, sprint info (name, goal, status), timeline, metrics (capacity & velocity), active flag, and timestamps.\\n\\nCreate Epics Table: Stores epic details, classification (priority, status), assignments, progress metrics, business fields, links to releases/stories/milestones, metadata (labels, components, risks), and timestamps.\\n\\nCreate Releases Table: Contains release details (name, version), status, timeline, progress, links to epics/stories/sprints, documentation, planning metadata, creator info, and timestamps.\\n\\nAdd all foreign keys with CASCADE DELETE: For project_id and other linking fields (assignee, owner, release, created_by).\\n\\nCreate indexes on all foreign keys and status fields: To optimize lookups, filtering, and joins across sprints, epics, and releases.","workDate":"2025-11-06","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721","subtaskId":"SUBT33b344ccf8a74c5da5db05bb772a40c3"}	Updated time entry: 2h	\N	\N	2025-11-20 10:18:28.052014+00	\N
ACTL36d56036e16d4e33b15daf298d9b5294	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	time_entry_updated	{"id":"TIME241454dd56d64242b30a967079829fb4","createdAt":"2025-11-20T15:45:01.006471","updatedAt":"2025-11-20T15:49:29.106229","userId":"USER000000000017","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721","subtaskId":null,"description":"- Create sprints table with capacity and velocity tracking\\n- Create epics table with theme, business value, and story linking\\n- Create releases table with quality gate integration\\n- Create quality_gates table for release validation\\n- Create stories table with epic and release relationships\\n- Create tasks table with status workflow support\\n- Create subtasks table with simplified bug workflow fields\\n- Implement proper foreign key relationships with CASCADE and SET NULL rules","entryType":"development","hoursWorked":3,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000017","entryType":"development","isBillable":true,"hoursWorked":1,"description":"- Create sprints table with capacity and velocity tracking\\n- Create epics table with theme, business value, and story linking\\n- Create releases table with quality gate integration\\n- Create quality_gates table for release validation\\n- Create stories table with epic and release relationships\\n- Create tasks table with status workflow support\\n- Create subtasks table with simplified bug workflow fields\\n- Implement proper foreign key relationships with CASCADE and SET NULL rules","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721"}	Updated time entry: 1h	\N	\N	2025-11-20 10:19:10.587649+00	\N
ACTL5e376f2ce6fe46b0af5419c8291cd0ce	USER000000000017	task	TASK4c372d304a5c44239eb0ae9abfd06fb7	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 08:58:38.415505+00	PROJ000000000010
ACTLd555456bb53846f89d724c05075f0780	USER000000000017	task	TASK4700f30a5dd54f7aa00d62748559c721	time_entry_updated	{"id":"TIME241454dd56d64242b30a967079829fb4","createdAt":"2025-11-20T15:45:01.006471","updatedAt":"2025-11-20T15:49:59.724011","userId":"USER000000000017","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721","subtaskId":null,"description":"- Create sprints table with capacity and velocity tracking\\n- Create epics table with theme, business value, and story linking\\n- Create releases table with quality gate integration\\n- Create quality_gates table for release validation\\n- Create stories table with epic and release relationships\\n- Create tasks table with status workflow support\\n- Create subtasks table with simplified bug workflow fields\\n- Implement proper foreign key relationships with CASCADE and SET NULL rules","entryType":"development","hoursWorked":1,"workDate":"2025-10-08","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000017","entryType":"development","isBillable":true,"hoursWorked":1,"description":"- Create sprints table with capacity and velocity tracking\\n- Create epics table with theme, business value, and story linking\\n- Create releases table with quality gate integration\\n- Create quality_gates table for release validation\\n- Create stories table with epic and release relationships\\n- Create tasks table with status workflow support\\n- Create subtasks table with simplified bug workflow fields\\n- Implement proper foreign key relationships with CASCADE and SET NULL rules","workDate":"2025-10-08","projectId":"PROJ000000000010","storyId":"STRY277763a6252b462c84a5b8abdefd7a5c","taskId":"TASK4700f30a5dd54f7aa00d62748559c721"}	Updated time entry: 1h	\N	\N	2025-11-20 10:19:42.489562+00	\N
ACTL93d2c2c7958c4ed3820900ee03ec769b	USER000000000017	task	TASKb5dc49a8af64416381b946ad36616f80	effort_logged	\N	{"hours":5,"description":"Dashboard displays all key project health metrics Real-time data updates from project database Visual charts and graphs for trend analysis Automated health score calculation Alert system for at-risk projects Export functionality for reports Responsive design for different screen sizes","workDate":"2025-10-23"}	Logged 5h on task "Add Project Health Dashboard and Analytics"	\N	\N	2025-11-27 06:08:51.426428+00	\N
ACTL7799d2995b6d49a0a20a458400c939d4	USER000000000017	task	TASK5c64e12aac7d4364865c1a70399a59c4	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 06:12:16.931598+00	\N
ACTL22b09467103f493c821922b42eba9c3e	USER000000000017	task	TASK872ba5cef44c4647a01d9dcba143d0d2	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 06:40:37.301894+00	\N
ACTL9a247a4711004d18864c5492e216c869	USER000000000018	task	TASK92229f7d6975446f832430d63386fb0f	subtask_created	\N	{"taskId":"TASK92229f7d6975446f832430d63386fb0f","title":"UI changes","description":"","isCompleted":false,"assigneeId":"USER000000000018","estimatedHours":10,"actualHours":0,"orderIndex":0,"labels":[]}	Created subtask "UI changes"	\N	\N	2025-11-27 09:27:57.708651+00	PROJ000000000010
ACTLb730d780f37941d689e2262e45d6aa7d	USER000000000017	task	TASKc36a084a1c394184a4dbef26c6c7097e	subtask_created	\N	{"taskId":"TASKc36a084a1c394184a4dbef26c6c7097e","title":"Team Overview UI Modification","description":"Added filters for the team card visuals and Infor within","isCompleted":false,"assigneeId":"USER000000000018","estimatedHours":6,"actualHours":0,"orderIndex":0,"dueDate":"2025-10-07","category":"Development","labels":[]}	Created subtask "Team Overview UI Modification"	\N	\N	2025-11-22 13:57:13.146487+00	\N
ACTLe4c6b11b43ed454f98bd642902e5318b	USER000000000017	task	TASKc36a084a1c394184a4dbef26c6c7097e	effort_logged	\N	{"subtaskId":"SUBT305cb3ebda494bc89a9e8ac95a592a89","hours":5,"description":"Created the view successfully","workDate":"2025-10-07"}	Logged 5h on subtask "Team Overview UI Modification"	\N	\N	2025-11-22 13:57:54.968402+00	\N
ACTL44d4857b542141b3934d658049b6d459	USER000000000017	task	TASKc36a084a1c394184a4dbef26c6c7097e	effort_logged	\N	{"subtaskId":"SUBT305cb3ebda494bc89a9e8ac95a592a89","hours":5,"description":"Created the view successfully","workDate":"2025-10-07"}	Logged 5h on subtask "Team Overview UI Modification"	\N	\N	2025-11-22 13:57:56.095715+00	\N
ACTLc4e5f27ee07e46d6a3adc7b0f3bd5a60	USER000000000017	task	TASK7633e28141b0439c9adf8379230ff6ea	time_entry_updated	{"id":"TIMEdc5adbfa93794ec3960dda46d1b76f3c","createdAt":"2025-11-27T10:38:00.306046","updatedAt":"2025-11-27T10:38:00.306046","userId":"USER000000000017","projectId":"PROJ000000000010","storyId":"STRY74090a2755c9400cbad2350ed58172f7","taskId":"TASK7633e28141b0439c9adf8379230ff6ea","subtaskId":"SUBT34117bd7bafc4c51934c919631bef4ce","description":"Rate limiting middleware implemented with configurable limits per user role\\nToken bucket algorithm implemented for smooth throttling\\nRate limit headers included in all API responses","entryType":"development","hoursWorked":3,"workDate":"2025-10-27","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000017","entryType":"development","isBillable":true,"hoursWorked":3,"description":"Rate limiting middleware implemented with configurable limits per user role\\nToken bucket algorithm implemented for smooth throttling\\nRate limit headers included in all API responses","workDate":"2025-10-21","projectId":"PROJ000000000010","storyId":"STRY74090a2755c9400cbad2350ed58172f7","taskId":"TASK7633e28141b0439c9adf8379230ff6ea","subtaskId":"SUBT34117bd7bafc4c51934c919631bef4ce"}	Updated time entry: 3h	\N	\N	2025-11-27 05:09:07.498585+00	\N
ACTLe101f22dee2b4684833bc295da0ca5af	USER000000000019	task	TASKc3f835d1b1d44dab80fd8a059075a03f	effort_logged	\N	{"hours":6,"description":"Burndown chart displays ideal vs actual progress\\nDaily updates based on completed work\\nVelocity calculation and trending\\nSprint analytics and insights\\nExport functionality for reports\\nReal-time data updates\\nVisual indicators for sprint health","workDate":"2025-10-13"}	Logged 6h on task "Implement Sprint Burndown Chart and Velocity Tracking"	\N	\N	2025-11-27 06:32:04.967592+00	\N
ACTLfcd8805f54a2422c832e648859d0613c	USER000000000018	task	TASK4db416e01cae40539ea34b72a852746d	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 09:02:16.225111+00	PROJ000000000010
ACTL152a277804784ef3890b715b028d5f84	USER000000000018	task	TASK16dfbb81345640f099b28e2ee2768253	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 09:05:26.307975+00	PROJ000000000010
ACTL8cc29a6bb98e4ce1b29b6d066ba5abd3	USER000000000017	task	TASKd964dd94638d45a9bf22a000a7b480ca	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 12:58:02.511743+00	\N
ACTL81da2c92de184749993a6ce42cb9fad7	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"QA_REVIEW"}	Changed status from done to QA_REVIEW	\N	\N	2025-11-29 06:23:38.548533+00	\N
ACTL366f714674ad4bc78a1731cf2250ba15	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-29 06:23:52.474577+00	\N
ACTL940fa9d8919345a7ad97158d14406dac	USER000000000017	task	TASK9b4c8c858df64315ada9819299ca0319	status_changed	{"status":"to_do"}	{"status":"DONE"}	Changed status from to_do to DONE	\N	\N	2025-11-29 06:24:00.754721+00	\N
ACTL17a1060e2fc74c0e8b5b7189bb4f9d51	USER000000000018	task	TASKdcfe0822d73949bdbd9f678d5b4df927	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 09:52:21.061986+00	PROJ000000000010
ACTLc2458e46f74b4476acd672d2c56bb446	USER000000000019	task	TASK12fcaddba0824c6e883c2700af22aaa7	effort_logged	\N	{"hours":8,"description":"Module name changed from To Do to My Tasks and Now user can be able to see and fill the scrum tasks from here only","workDate":"2025-11-12"}	Logged 8h on task "Add scrum tasks feature and navigation"	\N	\N	2025-12-03 10:33:49.82449+00	\N
ACTL83d84936b15b43bf8ec8d7259445114f	USER000000000017	task	TASK76154666448847849b5c12b78d7e3548	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-03 10:36:05.214817+00	PROJ000000000010
ACTLf8e803e4f1304aecab4f62798db18d4e	USER000000000017	task	TASKc36a084a1c394184a4dbef26c6c7097e	effort_logged	\N	{"subtaskId":"SUBT305cb3ebda494bc89a9e8ac95a592a89","hours":5,"description":"Created the view successfully","workDate":"2025-10-07"}	Logged 5h on subtask "Team Overview UI Modification"	\N	\N	2025-11-22 13:57:56.577855+00	\N
ACTLa5adc4356f5e4afc944b83829c42336b	USER000000000017	task	TASK33c3cf6e954e4ed5893d1886253a9dd7	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-24 11:21:50.477382+00	\N
ACTLbed0ea0e5f41426ba231c46097b3310b	USER000000000017	task	TASK0fec9f2b827240eda6c4056cae67484c	status_changed	{"status":"to_do"}	{"status":"TO_DO"}	Changed status from to_do to TO_DO	\N	\N	2025-11-24 05:28:49.64065+00	PROJ000000000010
ACTLf55002fa48d54cfb88e454b298312dfc	USER000000000017	task	TASKb5dc49a8af64416381b946ad36616f80	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-27 06:09:10.062014+00	\N
ACTL47b28fba8ace4da297985a2117e38c2c	USER000000000017	task	TASKbec2bbf60c4b4f378cb324f48a7976d8	status_changed	{"status":"to_do"}	{"status":"DONE"}	Changed status from to_do to DONE	\N	\N	2025-11-27 07:06:38.666475+00	\N
ACTL44725b4455f04c4faa999b733f4c1e0b	USER000000000018	task	TASK92229f7d6975446f832430d63386fb0f	subtask_created	\N	{"taskId":"TASK92229f7d6975446f832430d63386fb0f","title":"overall module modification ","description":"","isCompleted":false,"assigneeId":"USER000000000018","estimatedHours":5,"actualHours":0,"orderIndex":0,"labels":[]}	Created subtask "overall module modification "	\N	\N	2025-11-27 09:28:29.508167+00	PROJ000000000010
ACTLd6059f76444747a6b727c80996d78767	USER000000000018	task	TASK826baa037fac4b7183afa24ffe3b538b	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-28 04:46:55.882965+00	\N
ACTLbdb1381b2de245de95bbddec9ce8d398	USER000000000017	task	TASK826baa037fac4b7183afa24ffe3b538b	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-28 04:47:09.078949+00	\N
ACTLef7dfc8e4b184dd2a00ee2008359a1f4	USER000000000017	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-02 06:12:42.273058+00	\N
ACTLe24a7b0fa1e54246ad89eabb9c3a7220	USER000000000019	task	TASK4b56151bb4de44198312e31add1617d7	effort_logged	\N	{"hours":8,"description":"UI Modified as per Admin and Data Binded Properly","workDate":"2025-12-19"}	Logged 8h on task "UI Changes along with fields"	\N	\N	2025-12-03 10:11:45.702642+00	PROJ000000000010
ACTLddacdfc5d31a4d3f8bcc7bc8ea7f548c	USER000000000019	task	TASK21fa36b2c0ad401ab8474b412406e071	subtask_created	\N	{"taskId":"TASK21fa36b2c0ad401ab8474b412406e071","title":"Lane and Create Issue PopUp Added","description":"New Lane in scrum board feature added and Similar popup as create task added for create issues","isCompleted":false,"assigneeId":"USER000000000019","estimatedHours":8,"actualHours":0,"orderIndex":0,"dueDate":"2025-11-15","category":"Development","labels":[]}	Created subtask "Lane and Create Issue PopUp Added"	\N	\N	2025-12-03 10:19:01.843205+00	\N
ACTL7bfafa0cd20a4a158fcebb41f3558a48	USER000000000017	task	TASK8f9d60f81c4c483fa78eccc31677a97a	status_changed	{"status":"to_do"}	{"status":"IN_PROGRESS"}	Manager moved task from To Do to In Progress	\N	\N	2025-12-06 10:06:21.999257+00	PROJ000000000010
ACTL8a268aaf18bb4302acb8ad4bc180dcf1	USER000000000017	task	TASK8f9d60f81c4c483fa78eccc31677a97a	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-12-06 10:08:07.109164+00	PROJ000000000010
ACTL04c89e5111df46d6b9cf08317e88f56b	USER000000000017	task	TASK5c64e12aac7d4364865c1a70399a59c4	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 06:12:08.839359+00	\N
ACTL2ea18dd558614091a0e104eb321e77d3	USER000000000018	task	TASKbe56aadf47fc42f7b130b403d78956f7	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-27 08:47:56.307864+00	PROJ000000000010
ACTLc09865d404334662b94f7586a2c1d057	USER000000000018	task	TASK92229f7d6975446f832430d63386fb0f	effort_logged	\N	{"subtaskId":"SUBTf4b4ec58b4a74bb5a2ce5e37507b33a9","hours":8,"description":"UI changes done","workDate":"2025-11-27"}	Logged 8h on subtask "UI changes"	\N	\N	2025-11-27 09:29:11.034352+00	PROJ000000000010
ACTL172792040cad4e4b9f6f0f0960c499c7	USER000000000018	task	TASK92229f7d6975446f832430d63386fb0f	time_entry_updated	{"id":"TIME31967e5b9bf5480e8ada556ccc34f8f5","createdAt":"2025-11-27T14:59:07.953535","updatedAt":"2025-11-27T14:59:07.953535","userId":"USER000000000018","projectId":"PROJ000000000010","storyId":"STRY46cd781abc0946dc800201657d99661b","taskId":"TASK92229f7d6975446f832430d63386fb0f","subtaskId":"SUBTf4b4ec58b4a74bb5a2ce5e37507b33a9","description":"UI changes done","entryType":"development","hoursWorked":8,"workDate":"2025-11-27","startTime":null,"endTime":null,"isBillable":true}	{"userId":"USER000000000018","entryType":"development","isBillable":true,"hoursWorked":8,"description":"UI changes done","workDate":"2025-10-14","projectId":"PROJ000000000010","storyId":"STRY46cd781abc0946dc800201657d99661b","taskId":"TASK92229f7d6975446f832430d63386fb0f","subtaskId":"SUBTf4b4ec58b4a74bb5a2ce5e37507b33a9"}	Updated time entry: 8h	\N	\N	2025-11-27 09:30:24.137029+00	PROJ000000000010
ACTLd115140429d54d5587eebcebae61965c	USER000000000017	task	TASK92229f7d6975446f832430d63386fb0f	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-27 09:31:00.484405+00	PROJ000000000010
ACTL82cbd8cd3b5d4e2093a17b2bf5b91f02	USER000000000017	task	TASK92229f7d6975446f832430d63386fb0f	effort_logged	\N	{"hours":1,"description":"done","workDate":"2025-11-28"}	Logged 1h on task "Team Overview UI modification"	\N	\N	2025-11-28 04:53:35.739609+00	PROJ000000000010
ACTL04b43d1a87d44b86beb1a8d2f5a5d6fa	USER000000000019	task	TASKc3f835d1b1d44dab80fd8a059075a03f	status_changed	{"status":"done"}	{"status":"QA_REVIEW"}	Changed status from done to QA_REVIEW	\N	\N	2025-12-02 07:08:18.955497+00	\N
ACTLddd1711960934b3d87f4dfaa2f1c3068	USER000000000019	task	TASK4b56151bb4de44198312e31add1617d7	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 10:14:21.251636+00	PROJ000000000010
ACTL6a84182460bf4e22a51e404f3b179781	USER000000000019	task	TASK4cbfc35a71ce4fcb8bc66b05c0335bb5	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-03 10:15:20.86456+00	\N
ACTL3de15c6502b54547971ddb7cf989934b	USER000000000019	task	TASK4cbfc35a71ce4fcb8bc66b05c0335bb5	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-12-03 10:17:02.901414+00	\N
ACTL1688f1f184b04544ae9a5d3e8a5680d4	USER000000000017	task	TASK577bb13c26c64df485fb36e5f448687f	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-20 09:14:30.900043+00	\N
ACTL91a2fbd9a1fb47a3888206019ec0b694	USER000000000017	task	TASK4b56151bb4de44198312e31add1617d7	effort_logged	\N	{"hours":0.5,"description":"minor ui changes done","workDate":"2025-11-19"}	Logged 0.5h on task "UI Changes along with fields"	\N	\N	2025-12-05 06:42:34.563906+00	PROJ000000000010
ACTLb14566ce727f4cb986c3a47e9348d8ae	USER000000000019	task	TASK4c372d304a5c44239eb0ae9abfd06fb7	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-12-06 08:58:13.984775+00	PROJ000000000010
ACTLb155b8420c644a5fa04a77b1d1a83ae3	USER000000000017	task	TASK8f9d60f81c4c483fa78eccc31677a97a	effort_logged	\N	{"hours":4,"description":"done ","workDate":"2025-12-06"}	Logged 4h on task "backlog module api"	\N	\N	2025-12-06 10:07:00.605419+00	PROJ000000000010
ACTL28385248d1df43d88b9ca34c00ec41f2	USER000000000017	task	TASK062f09bcd04f408cb772e19422b52d9c	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-24 10:26:02.807119+00	\N
ACTLd180baf575d64a4faa693c2715356162	USER000000000017	task	TASK062f09bcd04f408cb772e19422b52d9c	effort_logged	\N	{"hours":1.5,"description":"- Create indexes on all foreign key columns\\n- Create composite indexes for common query patterns (project status, user + date, etc.)\\n- Create status-based indexes for filtering active/completed items\\n- Create date-based indexes for time-series queries and reporting\\n- Create indexes on JSONB fields using GIN indexes where appropriate\\n","workDate":"2025-11-24"}	Logged 1.5h on task "Create Indexes and Performance Optimization Structures"	\N	\N	2025-11-24 10:26:03.558387+00	\N
ACTL14c99346b6c34794af64585d076fd1c4	USER000000000017	task	TASK062f09bcd04f408cb772e19422b52d9c	effort_logged	\N	{"hours":0.5,"description":"- Create database views for dashboard queries\\n- Optimize index strategy based on query patterns\\n- Document index usage and maintenance procedures","workDate":"2025-11-24"}	Logged 0.5h on task "Create Indexes and Performance Optimization Structures"	\N	\N	2025-11-24 10:30:58.701651+00	\N
ACTLcc1ba459e9e24efea8428dc8860b4d90	USER000000000017	task	TASK062f09bcd04f408cb772e19422b52d9c	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-24 10:31:17.756732+00	\N
ACTLad23930db49544dcab652709a3a880f3	USER000000000017	task	TASK062f09bcd04f408cb772e19422b52d9c	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-24 10:31:25.370322+00	\N
ACTL0bfb59deefdf4440a38934983d9054e6	USER000000000017	task	TASKbbff3e8d807440aea710486a60ac8f8c	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-24 11:15:17.614983+00	\N
ACTLef7c938920aa473bbf389cbf3ddc4c09	USER000000000017	task	TASKbbff3e8d807440aea710486a60ac8f8c	effort_logged	\N	{"hours":12,"description":"Create JWT token generation service\\nImplement /api/auth/login endpoint for user authentication\\nImplement /api/auth/refresh endpoint for token refresh\\nImplement /api/auth/logout endpoint\\nAdd JWT filter/interceptor to validate tokens on protected endpoints\\nAdd role-based authorization checks (ADMIN, MANAGER, DEVELOPER, QA)\\nSecure all existing endpoints with appropriate authentication\\nAdd password encryption/hashing for user passwords\\nCreate authentication exception handlers\\nWrite unit tests for authentication flow","workDate":"2025-11-24"}	Logged 12h on task "Implement API Authentication & JWT Token Management"	\N	\N	2025-11-24 11:15:18.763701+00	\N
ACTLb46a0ed0526b410aa1d20623bdfa4389	USER000000000017	task	TASKbbff3e8d807440aea710486a60ac8f8c	status_changed	{"status":"in_progress"}	{"status":"QA_REVIEW"}	Changed status from in_progress to QA_REVIEW	\N	\N	2025-11-24 11:15:40.166385+00	\N
ACTL3e674d2a71c64b0d938d3befcbbe7dcd	USER000000000017	task	TASKbbff3e8d807440aea710486a60ac8f8c	status_changed	{"status":"qa_review"}	{"status":"DONE"}	Changed status from qa_review to DONE	\N	\N	2025-11-24 11:15:45.506818+00	\N
ACTL892c7a3fd7fb47bea802870be9755aba	USER000000000017	task	TASK33c3cf6e954e4ed5893d1886253a9dd7	status_changed	{"status":"TO_DO"}	{"status":"IN_PROGRESS"}	Task automatically moved to IN_PROGRESS after logging effort	\N	\N	2025-11-24 11:21:22.597405+00	\N
\.


--
-- Data for Name: ai_insights; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.ai_insights (id, project_id, type, title, description, metrics, recommendations, confidence_score, is_active, generated_at, expires_at) FROM stdin;
\.


--
-- Data for Name: attachments; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.attachments (id, uploaded_by, entity_type, entity_id, file_name, file_size, file_type, file_url, thumbnail_url, is_public, created_at, link_url, attachment_type) FROM stdin;
ATTCf8793375867943e28d6891fb7227973d	USER000000000017	story	STRY277763a6252b462c84a5b8abdefd7a5c	database-structure-diagram.md	44896	application/octet-stream	data:application/octet-stream;base64,IyBTcHJpbnRTeW5jIERhdGFiYXNlIFN0cnVjdHVyZSAmIERpYWdyYW0NCg0KIyMg8J+TiiBEYXRhYmFzZSBPdmVydmlldw0KKipUb3RhbCBUYWJsZXMqKjogMjcgdGFibGVzICANCioqVG90YWwgRW51bXMqKjogMjUgY3VzdG9tIHR5cGVzICANCioqRGF0YWJhc2UgVHlwZSoqOiBQb3N0Z3JlU1FMIDEyKyAgDQoqKkZlYXR1cmVzKio6IFVVSUQgcHJpbWFyeSBrZXlzLCBKU09OQiBmaWVsZHMsIFJvdy1sZXZlbCBzZWN1cml0eSwgQXVkaXQgdHJhaWxzLCBNdWx0aS1sZXZlbCB0aW1lIHRyYWNraW5nLCBCdWcgZml4aW5nIHdvcmtmbG93cywgRXBpYyBtYW5hZ2VtZW50LCBSZWxlYXNlIHBsYW5uaW5nDQoNCiMjIPCfjq8gS2V5IEZlYXR1cmVzIEltcGxlbWVudGVkDQotIOKchSAqKk11bHRpLWxldmVsIHRpbWUgdHJhY2tpbmcqKiAocHJvamVjdCDihpIgc3Rvcnkg4oaSIHRhc2sg4oaSIHN1YnRhc2spDQotIOKchSAqKkJ1ZyBmaXhpbmcgd29ya2Zsb3cqKiAoUUEgY3JlYXRlcyBzdWJ0YXNrcyDihpIgRGV2ZWxvcGVyIGZpeGVzIOKGkiBRQSB2ZXJpZmllcykNCi0g4pyFICoqSW50ZWdyYXRpb24gbWFya2V0cGxhY2UqKiAoR2l0SHViLCBTbGFjaywgSmlyYSwgZXRjLikNCi0g4pyFICoqUmlzayAmIHJlcXVpcmVtZW50IG1hbmFnZW1lbnQqKiB3aXRoIGZ1bGwgdHJhY2VhYmlsaXR5DQotIOKchSAqKlBlcnNvbmFsIHRvZG8gbWFuYWdlbWVudCoqIHdpdGggcHJvamVjdCBsaW5raW5nDQotIOKchSAqKkNvbXByZWhlbnNpdmUgYW5hbHl0aWNzKiogYW5kIEFJIGluc2lnaHRzDQotIOKchSAqKlJlYWwtdGltZSBub3RpZmljYXRpb25zKiogYW5kIGFjdGl2aXR5IHRyYWNraW5nDQotIOKchSAqKkVwaWMgbWFuYWdlbWVudCoqIHdpdGggdGhlbWVzLCBidXNpbmVzcyB2YWx1ZSwgYW5kIHN0b3J5IGxpbmtpbmcNCi0g4pyFICoqUmVsZWFzZSBwbGFubmluZyoqIHdpdGggcXVhbGl0eSBnYXRlcyBhbmQgZGVwbG95bWVudCB0cmFja2luZw0KDQotLS0NCg0KIyMg8J+Pl++4jyBUYWJsZSBSZWxhdGlvbnNoaXAgRGlhZ3JhbQ0KDQpgYGANCuKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkA0K4pSCICAgICAgICAgICAgICAgICAgICAgICAgICAgU1BSSU5UU1lOQyBEQVRBQkFTRSBTVFJVQ1RVUkUgICAgICAgICAgICAgICAgICAgICAg4pSCDQrilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJgNCg0K4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkCAgICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJANCuKUgiAgIGRlcGFydG1lbnRzICAg4pSCICAgIOKUgiAgICAgZG9tYWlucyAgICAg4pSCICAgIOKUgmF2YWlsYWJsZV9pbnRlZ3Iu4pSCDQrilIIgICAgICAgICAgICAgICAgIOKUgiAgICDilIIgICAgICAgICAgICAgICAgIOKUgiAgICDilIIgICAgICAgICAgICAgICAgIOKUgg0K4pSCIOKAoiBpZCAoVVVJRCkgICAgIOKUgiAgICDilIIg4oCiIGlkIChVVUlEKSAgICAg4pSCICAgIOKUgiDigKIgaWQgKFVVSUQpICAgICDilIINCuKUgiDigKIgbmFtZSAgICAgICAgICDilIIgICAg4pSCIOKAoiBuYW1lICAgICAgICAgIOKUgiAgICDilIIg4oCiIG5hbWUgICAgICAgICAg4pSCDQrilIIg4oCiIGRlc2NyaXB0aW9uICAg4pSCICAgIOKUgiDigKIgZGVzY3JpcHRpb24gICDilIIgICAg4pSCIOKAoiB0eXBlICAgICAgICAgIOKUgg0K4pSCIOKAoiBjcmVhdGVkX2F0ICAgIOKUgiAgICDilIIg4oCiIGNyZWF0ZWRfYXQgICAg4pSCICAgIOKUgiDigKIgZGVzY3JpcHRpb24gICDilIINCuKUgiDigKIgdXBkYXRlZF9hdCAgICDilIIgICAg4pSCIOKAoiB1cGRhdGVkX2F0ICAgIOKUgiAgICDilIIg4oCiIGlzX2FjdGl2ZSAgICAg4pSCDQrilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmA0KICAgICAgICAg4pSCICAgICAgICAgICAgICAgICAgICAgICDilIIgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAg4pSCICAgICAgICAgICAgICAgICAgICAgICDilIIgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAg4pa8ICAgICAgICAgICAgICAgICAgICAgICDilrwgICAgICAgICAgICAgICAgICAgICAgIOKUgg0K4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQICAg4pSCDQrilIIgICAgICAgICAgICAgICAgICAgICAgICB1c2VycyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIg4oCiIGlkIChVVUlEKSBQUklNQVJZIEtFWSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgZW1haWwgKFVOSVFVRSkgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgIOKUgg0K4pSCIOKAoiBwYXNzd29yZF9oYXNoICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIg4oCiIG5hbWUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgcm9sZSAoYWRtaW58bWFuYWdlcnxkZXZlbG9wZXJ8ZGVzaWduZXIpICAgICAgICAgICAgICAgICAgIOKUgiAgIOKUgg0K4pSCIOKAoiBkZXBhcnRtZW50X2lkIOKGkiBkZXBhcnRtZW50cy5pZCAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgZG9tYWluX2lkIOKGkiBkb21haW5zLmlkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIg4oCiIGF2YXRhcl91cmwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgZXhwZXJpZW5jZSAoanVuaW9yfG1pZHxzZW5pb3J8bGVhZCkgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgIOKUgg0K4pSCIOKAoiBob3VybHlfcmF0ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIg4oCiIGF2YWlsYWJpbGl0eV9wZXJjZW50YWdlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgc2tpbGxzIChKU09OQikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgIOKUgg0K4pSCIOKAoiBpc19hY3RpdmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIg4oCiIGxhc3RfbG9naW4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgY3JlYXRlZF9hdCwgdXBkYXRlZF9hdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgIOKUgg0K4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYICAg4pSCDQogICAgICAgICDilIIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAg4pSCICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgIOKWvCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCDQrilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAgICDilIINCuKUgiAgICAgICAgICAgICAgICAgICAgICBwcm9qZWN0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgaWQgKFVVSUQpIFBSSU1BUlkgS0VZICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgIOKUgg0K4pSCIOKAoiBuYW1lICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIg4oCiIGRlc2NyaXB0aW9uICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgc3RhdHVzIChwbGFubmluZ3xhY3RpdmV8cGF1c2VkfGNvbXBsZXRlZHxjYW5jZWxsZWQpICAgICAgIOKUgiAgIOKUgg0K4pSCIOKAoiBwcmlvcml0eSAobG93fG1lZGl1bXxoaWdofGNyaXRpY2FsKSAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIg4oCiIG1ldGhvZG9sb2d5IChzY3J1bXxrYW5iYW58d2F0ZXJmYWxsKSAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgdGVtcGxhdGUgKHdlYi1hcHB8bW9iaWxlLWFwcHxhcGktc2VydmljZXxkYXRhLWFuYWx5dGljcykgIOKUgiAgIOKUgg0K4pSCIOKAoiBkZXBhcnRtZW50X2lkIOKGkiBkZXBhcnRtZW50cy5pZCAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgbWFuYWdlcl9pZCDihpIgdXNlcnMuaWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIg4oCiIHN0YXJ0X2RhdGUsIGVuZF9kYXRlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgYnVkZ2V0LCBzcGVudCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgIOKUgg0K4pSCIOKAoiBwcm9ncmVzc19wZXJjZW50YWdlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIg4oCiIHNjb3BlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgc3VjY2Vzc19jcml0ZXJpYSAoSlNPTkIpICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgIOKUgg0K4pSCIOKAoiBvYmplY3RpdmVzIChKU09OQikgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAg4pSCDQrilIIg4oCiIGlzX2FjdGl2ZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICDilIINCuKUgiDigKIgY3JlYXRlZF9hdCwgdXBkYXRlZF9hdCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgIOKUgg0K4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYICAg4pSCDQogICAg4pSCICAgICAgICAgICAgICAgICAgICDilIIgICAgICAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgICAgICAgICDilIINCiAgICDilIIgICAgICAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgICAgICAgICAg4pSCICAgICAgICAgICAgICAgICAgICDilIIgICAgICAgICAgICAgICAgICAg4pSCDQogICAg4pSCICAgICAgICAgICAgICAgICAgICDilIIgIHJlbGVhc2UgdHJlZSAgICAgIOKUgiAgICAgICAgICAgICAgICAgICAg4pSCICAgICAgICAgICAgICAgICAgIOKUgg0KICAgIOKWvCAgICAgICAgICAgICAgICAgICAg4pa8ICAgICAgICAgICAgICAgICAgICDilrwgICAgICAgICAgICAgICAgICAgIOKWvCAgICAgICAgICAgICAgICAgICDilrwNCuKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkCAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkCAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQDQrilIJwcm9qZWN0X3RlYW0g4pSCICDilIIgICBzcHJpbnRzICAg4pSCICDilIIgbWlsZXN0b25lcyAg4pSCICDilIJwcm9qZWN0X2ludGVn4pSCICDilIIgICAgZXBpY3MgICAg4pSCDQrilIJfbWVtYmVycyAgICAg4pSCICDilIIgICAgICAgICAgICAg4pSCICDilIIgICAgICAgICAgICAg4pSCICDilIJyYXRpb25zICAgICAg4pSCDQrilIIgICAgICAgICAgICAg4pSCICDilIIg4oCiIGlkIChVVUlEKSDilIIgIOKUgiDigKIgaWQgKFVVSUQpIOKUgiAg4pSCICAgICAgICAgICAgIOKUgg0K4pSCIOKAoiBpZCAoVVVJRCkg4pSCICDilIIg4oCiIHByb2plY3RfaWTilIIgIOKUgiDigKIgcHJvamVjdF9pZOKUgiAg4pSCIOKAoiBpZCAoVVVJRCkg4pSCDQrilIIg4oCiIHByb2plY3RfaWTilIIgIOKUgiDigKIgbmFtZSAgICAgIOKUgiAg4pSCIOKAoiB0aXRsZSAgICAg4pSCICDilIIg4oCiIHByb2plY3RfaWTilIINCuKUgiDigKIgdXNlcl9pZCAgIOKUgiAg4pSCIOKAoiBnb2FsICAgICAg4pSCICDilIIg4oCiIGRlc2MuICAgICDilIIgIOKUgiDigKIgaW50ZWcuX2lkIOKUguKXhOKUmCAg4pSCIOKAoiBpZCAoVVVJRCkg4pSCDQrilIIg4oCiIHJvbGUgICAgICDilIIgIOKUgiDigKIgc3RhdHVzICAgIOKUgiAg4pSCIOKAoiBzdGF0dXMgICAg4pSCICDilIIg4oCiIGlzX2VuYWJsZWTilIIgICAg4pSCIOKAoiBwcm9qZWN0X2lk4pSCDQrilIIg4oCiIGlzX2xlYWQgICDilIIgIOKUgiDigKIgc3RhcnRfZGF0ZeKUgiAg4pSCIOKAoiBkdWVfZGF0ZSAg4pSCICDilIIg4oCiIGNvbmZpZyAgICDilIIgICAg4pSCIOKAoiB0aXRsZSAgICAg4pSCDQrilIIg4oCiIGFsbG9jXyUgICDilIIgIOKUgiDigKIgZW5kX2RhdGUgIOKUgiAg4pSCIOKAoiBjb21wbGV0ZSAg4pSCICDilIIg4oCiIGNyZWF0ZWRfYXTilIIgICAg4pSCIOKAoiBzdW1tYXJ5ICAg4pSCDQrilIIg4oCiIGpvaW5lZF9hdCDilIIgIOKUgiDigKIgY2FwYWNpdHkgIOKUgiAg4pSCIOKAoiBwcm9ncmVzcyUg4pSCICDilIIg4oCiIHVwZGF0ZWRfYXTilIIgICAg4pSCIOKAoiBwcmlvcml0eSAg4pSCDQrilIIg4oCiIGxlZnRfYXQgICDilIIgIOKUgiDigKIgdmVsb2NpdHkgIOKUgiAg4pSCIOKAoiBjcmVhdGVkX2F04pSCICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggICAg4pSCIOKAoiBzdGF0dXMgICAg4pSCDQrilIIg4oCiIGNyZWF0ZWRfYXTilIIgIOKUgiDigKIgaXNfYWN0aXZlIOKUgiAg4pSCIOKAoiB1cGRhdGVkX2F04pSCICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBvd25lciAgICAg4pSCDQrilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggIOKUgiDigKIgY3JlYXRlZF9hdOKUgiAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiB0aGVtZSAgICAg4pSCDQogICAgICAgICAgICAgICAgIOKUgiDigKIgdXBkYXRlZF9hdOKUgiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBzdG9yeV9wdHMg4pSCDQogICAgICAgICAgICAgICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBwcm9ncmVzcyUg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBsaW5rZWRfc3Qu4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBjcmVhdGVkX2F04pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pa8DQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJANCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgICAgICAgIHJlbGVhc2VzICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBpZCAoVVVJRCkgUFJJTUFSWSBLRVkgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBwcm9qZWN0X2lkIOKGkiBwcm9qZWN0cy5pZCAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIG5hbWUsIHZlcnNpb24gICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIGRlc2NyaXB0aW9uICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIHN0YXR1cyAocGxhbm5pbmd8ZGV2ZWxvcCAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICAgICAgICAgIG1lbnR8dGVzdGluZ3wgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAgICAgICAgICBzdGFnaW5nfHJlYWR5fCAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgcmVsZWFzZWR8Y2FuY2VsKSAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIHJlbGVhc2VfZGF0ZSAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIHRhcmdldF9kYXRlICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIHByb2dyZXNzICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIGxpbmtlZF9lcGljcyAoSlNPTkIpICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIGxpbmtlZF9zdG9yaWVzIChKU09OQikgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIGxpbmtlZF9zcHJpbnRzIChKU09OQikgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIHJlbGVhc2Vfbm90ZXMgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIGNyZWF0ZWRfYnkg4oaSIHVzZXJzLmlkICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgY3JlYXRlZF9hdCwgdXBkYXRlZF9hdCAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKWvA0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICAgICAgcXVhbGl0eV9nYXRlcyAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgaWQgKFVVSUQpIFBSSU1BUlkgS0VZICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgcmVsZWFzZV9pZCDihpIgcmVsZWFzZXMuaWQgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBuYW1lLCBkZXNjcmlwdGlvbiAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBzdGF0dXMgKHBlbmRpbmd8cGFzc2VkfCAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAgICAgICAgICBmYWlsZWQpICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgcmVxdWlyZWQgQk9PTEVBTiAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgY29tcGxldGVkX2F0ICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmA0KICAgICAgICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgIOKWvA0KICAgICAgICAgICAgICAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkA0KICAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgICAgICAgIHN0b3JpZXMgICAgICAgICAgICAgICAgICAgIOKUgiAgIA0KICAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgIOKUgiDigKIgaWQgKFVVSUQpIFBSSU1BUlkgS0VZICAgICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAg4pSCIOKAoiBwcm9qZWN0X2lkIOKGkiBwcm9qZWN0cy5pZCAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgIOKUgiDigKIgc3ByaW50X2lkIOKGkiBzcHJpbnRzLmlkIChudWxsYWJsZSkgICAgICAgICDilIINCiAgICAgICAgICAgICAgICDilIIg4oCiIGVwaWNfaWQg4oaSIGVwaWNzLmlkIChudWxsYWJsZSkgICAgICAgICAgICAg4pSCIOKGkCBFcGljIGxpbmsNCiAgICAgICAgICAgICAgICDilIIg4oCiIHJlbGVhc2VfaWQg4oaSIHJlbGVhc2VzLmlkIChudWxsYWJsZSkgICAgICAg4pSCIOKGkCBSZWxlYXNlIGxpbmsNCiAgICAgICAgICAgICAgICDilIIg4oCiIHRpdGxlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgIOKUgiDigKIgZGVzY3JpcHRpb24gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAg4pSCIOKAoiBhY2NlcHRhbmNlX2NyaXRlcmlhIChKU09OQikgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICDilIIg4oCiIHN0YXR1cyAoYmFja2xvZ3x0b19kb3xpbl9wcm9ncmVzc3wgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgcWFfcmV2aWV3fGRvbmUpICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgIOKUgiDigKIgcHJpb3JpdHkgKGxvd3xtZWRpdW18aGlnaHxjcml0aWNhbCkgICAgICAg4pSCDQogICAgICAgICAgICAgICAg4pSCIOKAoiBzdG9yeV9wb2ludHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICDilIIg4oCiIGFzc2lnbmVlX2lkIOKGkiB1c2Vycy5pZCAgICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAg4pSCIOKAoiByZXBvcnRlcl9pZCDihpIgdXNlcnMuaWQgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgIOKUgiDigKIgbGFiZWxzIChKU09OQikgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAg4pSCIOKAoiBvcmRlcl9pbmRleCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICDilIIg4oCiIGVzdGltYXRlZF9ob3VycywgYWN0dWFsX2hvdXJzICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgIOKUgiDigKIgY3JlYXRlZF9hdCwgdXBkYXRlZF9hdCAgICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pa8DQogICAgICAgICAgICAgICAgICAgICAgICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJANCiAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgICAgIHRhc2tzICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgaWQgKFVVSUQpIFBSSU1BUlkgS0VZICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBzdG9yeV9pZCDihpIgc3Rvcmllcy5pZCAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgdGl0bGUgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBkZXNjcmlwdGlvbiAgICAgICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIHN0YXR1cyAodG9fZG98aW5fcHJvZ3Jlc3N8ICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgICAgICAgICAgcWFfcmV2aWV3fGRvbmUpICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgcHJpb3JpdHkgKGxvd3xtZWRpdW18aGlnaHwgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAgICAgICAgICAgY3JpdGljYWwpICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBhc3NpZ25lZV9pZCDihpIgdXNlcnMuaWQgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgcmVwb3J0ZXJfaWQg4oaSIHVzZXJzLmlkICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIGVzdGltYXRlZF9ob3VycywgYWN0dWFsX2hvdXJzICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgb3JkZXJfaW5kZXggICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBkdWVfZGF0ZSAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIGxhYmVscyAoSlNPTkIpICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgY3JlYXRlZF9hdCwgdXBkYXRlZF9hdCAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pa8DQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAgICAgIHN1YnRhc2tzIChTaW1wbGlmaWVkKSAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgaWQgKFVVSUQpIFBSSU1BUlkgS0VZICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgdGFza19pZCDihpIgdGFza3MuaWQgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiB0aXRsZSwgZGVzY3JpcHRpb24gICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBpc19jb21wbGV0ZWQgQk9PTEVBTiDihpAgU2ltcGxlISAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIGFzc2lnbmVlX2lkIOKGkiB1c2Vycy5pZCAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgZXN0aW1hdGVkX2hvdXJzLCBhY3R1YWxfaG91cnMgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgb3JkZXJfaW5kZXgsIGR1ZV9kYXRlICAgICAgICAgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiDigKIgYnVnX3R5cGUgVkFSQ0hBUig1MCkg4oaQIEJ1ZyBDYXQuICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCICAgKGZ1bmN0aW9uYWwsIHVpLCBwZXJmb3JtYW5jZSwgICAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgICBzZWN1cml0eSwgaW50ZWdyYXRpb24pICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIHNldmVyaXR5IFZBUkNIQVIoMjApIOKGkCBQcmlvcml0eSAgIOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgIOKUgiAgIChsb3csIG1lZGl1bSwgaGlnaCwgY3JpdGljYWwpICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIGNyZWF0ZWRfYXQsIHVwZGF0ZWRfYXQgICAgICAgICAgICDilIINCiAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIPCfkJsgU0lNUExJRklFRCBCVUcgV09SS0ZMT1c6ICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBRQSBjcmVhdGVzIHN1YnRhc2sgd2l0aCBzZXZlcml0eSAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBEZXYgbWFya3MgaXNfY29tcGxldGVkID0gdHJ1ZSAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBEZXYgbW92ZXMgVEFTSyB0byAncWFfcmV2aWV3JyAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBRQSBtb3ZlcyBUQVNLIHRvICdkb25lJyAgICAgICAgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBBdXRvLW5vdGlmaWNhdGlvbnMgZm9yIHRhc2sgc3RhdHVz4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYDQoNCuKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkA0K4pSCICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgU1VQUE9SVElORyBUQUJMRVMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIINCuKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmA0KDQrilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkCAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJANCuKUgiAgdGltZV9lbnRyaWVzICAg4pSCICDilIIgbm90aWZpY2F0aW9ucyAgIOKUgiAg4pSCICAgYWlfaW5zaWdodHMgICDilIIgIOKUgiBzdGFrZWhvbGRlcnMg4pSCDQrilIIgICAgICAgICAgICAgICAgIOKUgiAg4pSCICAgICAgICAgICAgICAgICDilIIgIOKUgiAgICAgICAgICAgICAgICAg4pSCICDilIIgICAgICAgICAgICAgIOKUgg0K4pSCIOKAoiBpZCAoVVVJRCkgICAgIOKUgiAg4pSCIOKAoiBpZCAoVVVJRCkgICAgIOKUgiAg4pSCIOKAoiBpZCAoVVVJRCkgICAgIOKUgiAg4pSCIOKAoiBpZCAoVVVJRCkgIOKUgg0K4pSCIOKAoiB1c2VyX2lkICAgICAgIOKUgiAg4pSCIOKAoiB1c2VyX2lkICAgICAgIOKUgiAg4pSCIOKAoiBwcm9qZWN0X2lkICAgIOKUgiAg4pSCIOKAoiBwcm9qZWN0X2lkIOKUgg0K4pSCIOKAoiBwcm9qZWN0X2lkICAgIOKUgiAg4pSCIOKAoiB0eXBlICAgICAgICAgIOKUgiAg4pSCIOKAoiB0eXBlICAgICAgICAgIOKUgiAg4pSCIOKAoiBuYW1lICAgICAgIOKUgg0K4pSCIOKAoiBzdG9yeV9pZCAgICAgIOKUgiAg4pSCIOKAoiBwcmlvcml0eSAgICAgIOKUgiAg4pSCIOKAoiB0aXRsZSAgICAgICAgIOKUgiAg4pSCIOKAoiByb2xlICAgICAgIOKUgg0K4pSCIOKAoiB0YXNrX2lkICAgICAgIOKUgiAg4pSCIOKAoiB0aXRsZSAgICAgICAgIOKUgiAg4pSCIOKAoiBkZXNjcmlwdGlvbiAgIOKUgiAg4pSCIOKAoiBlbWFpbCAgICAgIOKUgg0K4pSCIOKAoiBzdWJ0YXNrX2lkICAgIOKUgiAg4pSCIOKAoiBtZXNzYWdlICAgICAgIOKUgiAg4pSCIOKAoiBtZXRyaWNzICAgICAgIOKUgiAg4pSCIOKAoiByZXNwb25zaS4gIOKUgg0K4pSCIOKAoiBkZXNjcmlwdGlvbiAgIOKUgiAg4pSCIOKAoiBlbnRpdHlfdHlwZSAgIOKUgiAg4pSCIOKAoiByZWNvbW1lbmQuICAgIOKUgiAg4pSCIOKAoiBhdmF0YXJfdXJsIOKUgg0K4pSCIOKAoiBlbnRyeV90eXBlICAgIOKUgiAg4pSCIOKAoiBlbnRpdHlfaWQgICAgIOKUgiAg4pSCIOKAoiBjb25maWRlbmNlICAgIOKUgiAg4pSCIOKAoiBjcmVhdGVkX2F0IOKUgg0K4pSCIOKAoiBob3Vyc193b3JrZWQgIOKUgiAg4pSCIOKAoiBhY3Rpb25fdXJsICAgIOKUgiAg4pSCIOKAoiBpc19hY3RpdmUgICAgIOKUgiAg4pSCIOKAoiB1cGRhdGVkX2F0IOKUgg0K4pSCIOKAoiB3b3JrX2RhdGUgICAgIOKUgiAg4pSCIOKAoiBpc19yZWFkICAgICAgIOKUgiAg4pSCIOKAoiBnZW5lcmF0ZWRfYXQgIOKUgiAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYDQrilIIg4oCiIHN0YXJ0X3RpbWUgICAg4pSCICDilIIg4oCiIGlzX2FyY2hpdmVkICAg4pSCICDilIIg4oCiIGV4cGlyZXNfYXQgICAg4pSCDQrilIIg4oCiIGVuZF90aW1lICAgICAg4pSCICDilIIg4oCiIGV4cGlyZXNfYXQgICAg4pSCICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJgNCuKUgiDigKIgaXNfYmlsbGFibGUgICDilIIgIOKUgiDigKIgY3JlYXRlZF9hdCAgICDilIINCuKUgiDigKIgY3JlYXRlZF9hdCAgICDilIIgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmA0K4pSCIOKAoiB1cGRhdGVkX2F0ICAgIOKUgg0K4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYDQoNCuKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkCAg4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkA0K4pSCICAgICAgcmlza3MgICAgICDilIIgIOKUgiAgIHJlcXVpcmVtZW50cyAg4pSCICDilIIgICAgIHRvZG9zICAgICAgIOKUgiAg4pSCICAgcmVwb3J0cyAgICDilIINCuKUgiAgICAgICAgICAgICAgICAg4pSCICDilIIgICAgICAgICAgICAgICAgIOKUgiAg4pSCICAgICAgICAgICAgICAgICDilIIgIOKUgiAgICAgICAgICAgICAg4pSCDQrilIIg4oCiIGlkIChVVUlEKSAgICAg4pSCICDilIIg4oCiIGlkIChVVUlEKSAgICAg4pSCICDilIIg4oCiIGlkIChVVUlEKSAgICAg4pSCICDilIIg4oCiIGlkIChVVUlEKSAg4pSCDQrilIIg4oCiIHByb2plY3RfaWQgICAg4pSCICDilIIg4oCiIHByb2plY3RfaWQgICAg4pSCICDilIIg4oCiIHVzZXJfaWQgICAgICAg4pSCICDilIIg4oCiIHByb2plY3RfaWQg4pSCDQrilIIg4oCiIHRpdGxlICAgICAgICAg4pSCICDilIIg4oCiIHRpdGxlICAgICAgICAg4pSCICDilIIg4oCiIHRpdGxlICAgICAgICAg4pSCICDilIIg4oCiIGNyZWF0ZWRfYnkg4pSCDQrilIIg4oCiIGRlc2NyaXB0aW9uICAg4pSCICDilIIg4oCiIGRlc2NyaXB0aW9uICAg4pSCICDilIIg4oCiIGRlc2NyaXB0aW9uICAg4pSCICDilIIg4oCiIG5hbWUgICAgICAg4pSCDQrilIIg4oCiIHByb2JhYmlsaXR5ICAg4pSCICDilIIg4oCiIHR5cGUgICAgICAgICAg4pSCICDilIIg4oCiIHByaW9yaXR5ICAgICAg4pSCICDilIIg4oCiIHR5cGUgICAgICAg4pSCDQrilIIg4oCiIGltcGFjdCAgICAgICAg4pSCICDilIIg4oCiIHN0YXR1cyAgICAgICAg4pSCICDilIIg4oCiIHN0YXR1cyAgICAgICAg4pSCICDilIIg4oCiIGRlc2MuICAgICAg4pSCDQrilIIg4oCiIG1pdGlnYXRpb24gICAg4pSCICDilIIg4oCiIHByaW9yaXR5ICAgICAg4pSCICDilIIg4oCiIGR1ZV9kYXRlICAgICAg4pSCICDilIIg4oCiIGNvbmZpZyAgICAg4pSCDQrilIIg4oCiIHN0YXR1cyAgICAgICAg4pSCICDilIIg4oCiIG1vZHVsZSAgICAgICAg4pSCICDilIIg4oCiIHJlbWluZGVyX2RhdGUg4pSCICDilIIg4oCiIGRhdGEgICAgICAg4pSCDQrilIIg4oCiIG93bmVyX2lkICAgICAg4pSCICDilIIg4oCiIGFjY2VwdF9jcml0LiAg4pSCICDilIIg4oCiIHRhZ3MgICAgICAgICAg4pSCICDilIIg4oCiIGlzX3NoYXJlZCAg4pSCDQrilIIg4oCiIGNyZWF0ZWRfYXQgICAg4pSCICDilIIg4oCiIGVmZm9ydF9wb2ludHMg4pSCICDilIIg4oCiIHJlbGF0ZWRfcHJvai4g4pSCICDilIIg4oCiIHNjaGVkdWxlZCAg4pSCDQrilIIg4oCiIHVwZGF0ZWRfYXQgICAg4pSCICDilIIg4oCiIGNyZWF0ZWRfYXQgICAg4pSCICDilIIg4oCiIHJlbGF0ZWRfc3Rvcnkg4pSCICDilIIg4oCiIGxhc3RfZ2VuICAg4pSCDQrilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggIOKUgiDigKIgdXBkYXRlZF9hdCAgICDilIIgIOKUgiDigKIgcmVsYXRlZF90YXNrICDilIIgIOKUgiDigKIgbmV4dF9nZW4gICDilIINCiAgICAgICAgICAgICAgICAgICAgIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmCAg4pSCIOKAoiBvcmRlcl9pbmRleCAgIOKUgiAg4pSCIOKAoiBjcmVhdGVkX2F0IOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBjb21wbGV0ZWRfYXQgIOKUgiAg4pSCIOKAoiB1cGRhdGVkX2F0IOKUgg0KICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg4pSCIOKAoiBjcmVhdGVkX2F0ICAgIOKUgiAg4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilIIg4oCiIHVwZGF0ZWRfYXQgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJgNCg0K4pSM4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSQICDilIzilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJAgIOKUjOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUkA0K4pSCICAgIGNvbW1lbnRzICAgICDilIIgIOKUgiAgIGF0dGFjaG1lbnRzICAg4pSCICDilIIgYWN0aXZpdHlfbG9ncyAgIOKUgg0K4pSCICAgICAgICAgICAgICAgICDilIIgIOKUgiAgICAgICAgICAgICAgICAg4pSCICDilIIgICAgICAgICAgICAgICAgIOKUgg0K4pSCIOKAoiBpZCAoVVVJRCkgICAgIOKUgiAg4pSCIOKAoiBpZCAoVVVJRCkgICAgIOKUgiAg4pSCIOKAoiBpZCAoVVVJRCkgICAgIOKUgg0K4pSCIOKAoiB1c2VyX2lkICAgICAgIOKUgiAg4pSCIOKAoiB1cGxvYWRlZF9ieSAgIOKUgiAg4pSCIOKAoiB1c2VyX2lkICAgICAgIOKUgg0K4pSCIOKAoiBlbnRpdHlfdHlwZSAgIOKUgiAg4pSCIOKAoiBlbnRpdHlfdHlwZSAgIOKUgiAg4pSCIOKAoiBlbnRpdHlfdHlwZSAgIOKUgg0K4pSCIOKAoiBlbnRpdHlfaWQgICAgIOKUgiAg4pSCIOKAoiBlbnRpdHlfaWQgICAgIOKUgiAg4pSCIOKAoiBlbnRpdHlfaWQgICAgIOKUgg0K4pSCIOKAoiBjb250ZW50ICAgICAgIOKUgiAg4pSCIOKAoiBmaWxlX25hbWUgICAgIOKUgiAg4pSCIOKAoiBhY3Rpb24gICAgICAgIOKUgg0K4pSCIOKAoiBwYXJlbnRfaWQgICAgIOKUgiAg4pSCIOKAoiBmaWxlX3NpemUgICAgIOKUgiAg4pSCIOKAoiBvbGRfdmFsdWVzICAgIOKUgg0K4pSCIOKAoiBpc19lZGl0ZWQgICAgIOKUgiAg4pSCIOKAoiBmaWxlX3R5cGUgICAgIOKUgiAg4pSCIOKAoiBuZXdfdmFsdWVzICAgIOKUgg0K4pSCIOKAoiBlZGl0ZWRfYXQgICAgIOKUgiAg4pSCIOKAoiBmaWxlX3VybCAgICAgIOKUgiAg4pSCIOKAoiBkZXNjcmlwdGlvbiAgIOKUgg0K4pSCIOKAoiBjcmVhdGVkX2F0ICAgIOKUgiAg4pSCIOKAoiB0aHVtYm5haWxfdXJsIOKUgiAg4pSCIOKAoiBpcF9hZGRyZXNzICAgIOKUgg0K4pSCIOKAoiB1cGRhdGVkX2F0ICAgIOKUgiAg4pSCIOKAoiBpc19wdWJsaWMgICAgIOKUgiAg4pSCIOKAoiB1c2VyX2FnZW50ICAgIOKUgg0K4pSU4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSYICDilIIg4oCiIGNyZWF0ZWRfYXQgICAg4pSCICDilIIg4oCiIGNyZWF0ZWRfYXQgICAg4pSCDQogICAgICAgICAgICAgICAgICAgICDilJTilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilJggIOKUlOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUmA0KYGBgDQoNCi0tLQ0KDQojIyDwn5OLIFRhYmxlIERldGFpbHMNCg0KIyMjICoqMS4gQ29yZSBVc2VyICYgT3JnYW5pemF0aW9uIFRhYmxlcyoqDQoNCiMjIyMgKipkZXBhcnRtZW50cyoqDQpgYGBzcWwNCmlkICAgICAgICAgICAgICBVVUlEIFBSSU1BUlkgS0VZDQpuYW1lICAgICAgICAgICAgVkFSQ0hBUig1MCkgVU5JUVVFICAgICAtLSBWTklULCBEaW5zaGF3LCBIb3NweSwgUGhhcm1hDQpkZXNjcmlwdGlvbiAgICAgVEVYVA0KY3JlYXRlZF9hdCAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KdXBkYXRlZF9hdCAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KYGBgDQoNCiMjIyMgKipkb21haW5zKioNCmBgYHNxbA0KaWQgICAgICAgICAgICAgIFVVSUQgUFJJTUFSWSBLRVkNCm5hbWUgICAgICAgICAgICBWQVJDSEFSKDUwKSBVTklRVUUgICAgIC0tIEFuZ3VsYXIsIEphdmEsIE1hdWksIFRlc3RpbmcsIGV0Yy4NCmRlc2NyaXB0aW9uICAgICBURVhUDQpjcmVhdGVkX2F0ICAgICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQp1cGRhdGVkX2F0ICAgICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQpgYGANCg0KIyMjIyAqKnVzZXJzKioNCmBgYHNxbA0KaWQgICAgICAgICAgICAgICAgICAgICAgVVVJRCBQUklNQVJZIEtFWQ0KZW1haWwgICAgICAgICAgICAgICAgICAgVkFSQ0hBUigyNTUpIFVOSVFVRQ0KcGFzc3dvcmRfaGFzaCAgICAgICAgICAgVkFSQ0hBUigyNTUpDQpuYW1lICAgICAgICAgICAgICAgICAgICBWQVJDSEFSKDI1NSkNCnJvbGUgICAgICAgICAgICAgICAgICAgIEVOVU0oYWRtaW4sIG1hbmFnZXIsIGRldmVsb3BlciwgZGVzaWduZXIpDQpkZXBhcnRtZW50X2lkICAgICAgICAgICBVVUlEIOKGkiBkZXBhcnRtZW50cy5pZA0KZG9tYWluX2lkICAgICAgICAgICAgICAgVVVJRCDihpIgZG9tYWlucy5pZA0KYXZhdGFyX3VybCAgICAgICAgICAgICAgVEVYVA0KZXhwZXJpZW5jZSAgICAgICAgICAgICAgRU5VTShqdW5pb3IsIG1pZCwgc2VuaW9yLCBsZWFkKQ0KaG91cmx5X3JhdGUgICAgICAgICAgICAgREVDSU1BTCgxMCwyKQ0KYXZhaWxhYmlsaXR5X3BlcmNlbnRhZ2UgSU5URUdFUiAoMC0xMDApDQpza2lsbHMgICAgICAgICAgICAgICAgICBKU09OQiAgICAgICAgICAgICAgICAtLSBbIkFuZ3VsYXIiLCAiVHlwZVNjcmlwdCJdDQppc19hY3RpdmUgICAgICAgICAgICAgICBCT09MRUFODQpsYXN0X2xvZ2luICAgICAgICAgICAgICBUSU1FU1RBTVAgV0lUSCBUSU1FIFpPTkUNCmNyZWF0ZWRfYXQgICAgICAgICAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KdXBkYXRlZF9hdCAgICAgICAgICAgICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQpgYGANCg0KIyMjICoqMi4gUHJvamVjdCBNYW5hZ2VtZW50IFRhYmxlcyoqDQoNCiMjIyMgKipwcm9qZWN0cyoqDQpgYGBzcWwNCmlkICAgICAgICAgICAgICAgICAgVVVJRCBQUklNQVJZIEtFWQ0KbmFtZSAgICAgICAgICAgICAgICBWQVJDSEFSKDI1NSkNCmRlc2NyaXB0aW9uICAgICAgICAgVEVYVA0Kc3RhdHVzICAgICAgICAgICAgICBFTlVNKHBsYW5uaW5nLCBhY3RpdmUsIHBhdXNlZCwgY29tcGxldGVkLCBjYW5jZWxsZWQpDQpwcmlvcml0eSAgICAgICAgICAgIEVOVU0obG93LCBtZWRpdW0sIGhpZ2gsIGNyaXRpY2FsKQ0KbWV0aG9kb2xvZ3kgICAgICAgICBFTlVNKHNjcnVtLCBrYW5iYW4sIHdhdGVyZmFsbCkNCnRlbXBsYXRlICAgICAgICAgICAgRU5VTSh3ZWItYXBwLCBtb2JpbGUtYXBwLCBhcGktc2VydmljZSwgZGF0YS1hbmFseXRpY3MpDQpkZXBhcnRtZW50X2lkICAgICAgIFVVSUQg4oaSIGRlcGFydG1lbnRzLmlkDQptYW5hZ2VyX2lkICAgICAgICAgIFVVSUQg4oaSIHVzZXJzLmlkDQpzdGFydF9kYXRlICAgICAgICAgIERBVEUNCmVuZF9kYXRlICAgICAgICAgICAgREFURQ0KYnVkZ2V0ICAgICAgICAgICAgICBERUNJTUFMKDE1LDIpDQpzcGVudCAgICAgICAgICAgICAgIERFQ0lNQUwoMTUsMikNCnByb2dyZXNzX3BlcmNlbnRhZ2UgSU5URUdFUiAoMC0xMDApDQpzY29wZSAgICAgICAgICAgICAgIFRFWFQNCnN1Y2Nlc3NfY3JpdGVyaWEgICAgSlNPTkIgICAgICAgICAgICAgICAgLS0gWyJVc2VyIHNhdGlzZmFjdGlvbiA+IDQuNSJdDQpvYmplY3RpdmVzICAgICAgICAgIEpTT05CICAgICAgICAgICAgICAgIC0tIFsiSW5jcmVhc2Ugc2FsZXMgYnkgMzAlIl0NCmlzX2FjdGl2ZSAgICAgICAgICAgQk9PTEVBTg0KY3JlYXRlZF9hdCAgICAgICAgICBUSU1FU1RBTVAgV0lUSCBUSU1FIFpPTkUNCnVwZGF0ZWRfYXQgICAgICAgICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQpgYGANCg0KIyMjIyAqKnByb2plY3RfdGVhbV9tZW1iZXJzKioNCmBgYHNxbA0KaWQgICAgICAgICAgICAgICAgICAgICAgVVVJRCBQUklNQVJZIEtFWQ0KcHJvamVjdF9pZCAgICAgICAgICAgICAgVVVJRCDihpIgcHJvamVjdHMuaWQgKENBU0NBREUgREVMRVRFKQ0KdXNlcl9pZCAgICAgICAgICAgICAgICAgVVVJRCDihpIgdXNlcnMuaWQgKENBU0NBREUgREVMRVRFKQ0Kcm9sZSAgICAgICAgICAgICAgICAgICAgVkFSQ0hBUigxMDApICAgICAgICAgLS0gIkZyb250ZW5kIERldmVsb3BlciINCmlzX3RlYW1fbGVhZCAgICAgICAgICAgIEJPT0xFQU4NCmFsbG9jYXRpb25fcGVyY2VudGFnZSAgIElOVEVHRVIgKDAtMTAwKSAgICAgIC0tICUgb2YgdGltZSBhbGxvY2F0ZWQNCmpvaW5lZF9hdCAgICAgICAgICAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KbGVmdF9hdCAgICAgICAgICAgICAgICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQpjcmVhdGVkX2F0ICAgICAgICAgICAgICBUSU1FU1RBTVAgV0lUSCBUSU1FIFpPTkUNClVOSVFVRShwcm9qZWN0X2lkLCB1c2VyX2lkKQ0KYGBgDQoNCiMjIyAqKjMuIEFnaWxlIERldmVsb3BtZW50IFRhYmxlcyoqDQoNCiMjIyMgKipzcHJpbnRzKioNCmBgYHNxbA0KaWQgICAgICAgICAgICAgIFVVSUQgUFJJTUFSWSBLRVkNCnByb2plY3RfaWQgICAgICBVVUlEIOKGkiBwcm9qZWN0cy5pZCAoQ0FTQ0FERSBERUxFVEUpDQpuYW1lICAgICAgICAgICAgVkFSQ0hBUigyNTUpICAgICAgICAgLS0gIlNwcmludCAxIC0gRm91bmRhdGlvbiINCmdvYWwgICAgICAgICAgICBURVhUDQpzdGF0dXMgICAgICAgICAgRU5VTShwbGFubmluZywgYWN0aXZlLCBjb21wbGV0ZWQsIGNhbmNlbGxlZCkNCnN0YXJ0X2RhdGUgICAgICBEQVRFDQplbmRfZGF0ZSAgICAgICAgREFURQ0KY2FwYWNpdHlfaG91cnMgIElOVEVHRVINCnZlbG9jaXR5X3BvaW50cyBJTlRFR0VSDQppc19hY3RpdmUgICAgICAgQk9PTEVBTg0KY3JlYXRlZF9hdCAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KdXBkYXRlZF9hdCAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KYGBgDQoNCiMjIyMgKiplcGljcyoqDQpgYGBzcWwNCmlkICAgICAgICAgICAgICAgICAgICAgIFVVSUQgUFJJTUFSWSBLRVkNCnByb2plY3RfaWQgICAgICAgICAgICAgIFVVSUQg4oaSIHByb2plY3RzLmlkIChDQVNDQURFIERFTEVURSkNCnRpdGxlICAgICAgICAgICAgICAgICAgIFZBUkNIQVIoMjU1KQ0KZGVzY3JpcHRpb24gICAgICAgICAgICAgVEVYVA0Kc3VtbWFyeSAgICAgICAgICAgICAgICAgVEVYVA0KcHJpb3JpdHkgICAgICAgICAgICAgICAgRU5VTShsb3csIG1lZGl1bSwgaGlnaCwgY3JpdGljYWwpDQpzdGF0dXMgICAgICAgICAgICAgICAgICBFTlVNKGJhY2tsb2csIHBsYW5uaW5nLCBpbi1wcm9ncmVzcywgcmV2aWV3LCBjb21wbGV0ZWQsIGNhbmNlbGxlZCkNCmFzc2lnbmVlX2lkICAgICAgICAgICAgIFVVSUQg4oaSIHVzZXJzLmlkIChudWxsYWJsZSkNCm93bmVyICAgICAgICAgICAgICAgICAgIFVVSUQg4oaSIHVzZXJzLmlkDQpzdGFydF9kYXRlICAgICAgICAgICAgICBEQVRFDQplbmRfZGF0ZSAgICAgICAgICAgICAgICBEQVRFDQpwcm9ncmVzcyAgICAgICAgICAgICAgICBJTlRFR0VSICgwLTEwMCkNCnN0b3J5X3BvaW50cyAgICAgICAgICAgIElOVEVHRVINCmNvbXBsZXRlZF9zdG9yeV9wb2ludHMgIElOVEVHRVINCmxpbmtlZF9taWxlc3RvbmVzICAgICAgIEpTT05CICAgICAgICAgICAgICAgIC0tIEFycmF5IG9mIG1pbGVzdG9uZSBJRHMNCmxpbmtlZF9zdG9yaWVzICAgICAgICAgIEpTT05CICAgICAgICAgICAgICAgIC0tIEFycmF5IG9mIHN0b3J5IElEcw0KcmVsZWFzZV9pZCAgICAgICAgICAgICAgVVVJRCDihpIgcmVsZWFzZXMuaWQgKG51bGxhYmxlKQ0KbGFiZWxzICAgICAgICAgICAgICAgICAgSlNPTkIgICAgICAgICAgICAgICAgLS0gWyJhdXRoZW50aWNhdGlvbiIsICJzZWN1cml0eSJdDQpjb21wb25lbnRzICAgICAgICAgICAgICBKU09OQiAgICAgICAgICAgICAgICAtLSBbIkF1dGggU2VydmljZSIsICJVc2VyIFNlcnZpY2UiXQ0KdGhlbWUgICAgICAgICAgICAgICAgICAgVkFSQ0hBUigyNTUpICAgICAgICAgLS0gIlVzZXIgRXhwZXJpZW5jZSAmIFNlY3VyaXR5Ig0KYnVzaW5lc3NfdmFsdWUgICAgICAgICAgVEVYVA0KYWNjZXB0YW5jZV9jcml0ZXJpYSAgICAgSlNPTkIgICAgICAgICAgICAgICAgLS0gQXJyYXkgb2YgY3JpdGVyaWENCnJpc2tzICAgICAgICAgICAgICAgICAgIEpTT05CICAgICAgICAgICAgICAgIC0tIEFycmF5IG9mIHJpc2sgZGVzY3JpcHRpb25zDQpkZXBlbmRlbmNpZXMgICAgICAgICAgICBKU09OQiAgICAgICAgICAgICAgICAtLSBBcnJheSBvZiBvdGhlciBlcGljIElEcw0KY3JlYXRlZF9hdCAgICAgICAgICAgICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQp1cGRhdGVkX2F0ICAgICAgICAgICAgICBUSU1FU1RBTVAgV0lUSCBUSU1FIFpPTkUNCmNvbXBsZXRlZF9hdCAgICAgICAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORSAobnVsbGFibGUpDQpgYGANCg0KIyMjIyAqKnJlbGVhc2VzKioNCmBgYHNxbA0KaWQgICAgICAgICAgICAgICAgICBVVUlEIFBSSU1BUlkgS0VZDQpwcm9qZWN0X2lkICAgICAgICAgIFVVSUQg4oaSIHByb2plY3RzLmlkIChDQVNDQURFIERFTEVURSkNCm5hbWUgICAgICAgICAgICAgICAgVkFSQ0hBUigyNTUpDQp2ZXJzaW9uICAgICAgICAgICAgIFZBUkNIQVIoNTApICAgICAgICAgICAgIC0tICJ2Mi4wLjAiDQpkZXNjcmlwdGlvbiAgICAgICAgIFRFWFQNCnN0YXR1cyAgICAgICAgICAgICAgRU5VTShwbGFubmluZywgZGV2ZWxvcG1lbnQsIHRlc3RpbmcsIHN0YWdpbmcsIHJlYWR5LWZvci1yZWxlYXNlLCByZWxlYXNlZCwgY2FuY2VsbGVkKQ0KcmVsZWFzZV9kYXRlICAgICAgICBEQVRFDQp0YXJnZXRfZGF0ZSAgICAgICAgIERBVEUNCnByb2dyZXNzICAgICAgICAgICAgSU5URUdFUiAoMC0xMDApDQpsaW5rZWRfZXBpY3MgICAgICAgIEpTT05CICAgICAgICAgICAgICAgIC0tIEFycmF5IG9mIGVwaWMgSURzDQpsaW5rZWRfc3RvcmllcyAgICAgIEpTT05CICAgICAgICAgICAgICAgIC0tIEFycmF5IG9mIHN0b3J5IElEcw0KbGlua2VkX3NwcmludHMgICAgICBKU09OQiAgICAgICAgICAgICAgICAtLSBBcnJheSBvZiBzcHJpbnQgSURzDQpyZWxlYXNlX25vdGVzICAgICAgIFRFWFQNCnJpc2tzICAgICAgICAgICAgICAgSlNPTkIgICAgICAgICAgICAgICAgLS0gQXJyYXkgb2YgcmlzayBkZXNjcmlwdGlvbnMNCmRlcGVuZGVuY2llcyAgICAgICAgSlNPTkIgICAgICAgICAgICAgICAgLS0gQXJyYXkgb2Ygb3RoZXIgcmVsZWFzZSBJRHMNCmNyZWF0ZWRfYnkgICAgICAgICAgVVVJRCDihpIgdXNlcnMuaWQNCmNyZWF0ZWRfYXQgICAgICAgICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQp1cGRhdGVkX2F0ICAgICAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KY29tcGxldGVkX2F0ICAgICAgICBUSU1FU1RBTVAgV0lUSCBUSU1FIFpPTkUgKG51bGxhYmxlKQ0KYGBgDQoNCiMjIyMgKipxdWFsaXR5X2dhdGVzKioNCmBgYHNxbA0KaWQgICAgICAgICAgICAgIFVVSUQgUFJJTUFSWSBLRVkNCnJlbGVhc2VfaWQgICAgICBVVUlEIOKGkiByZWxlYXNlcy5pZCAoQ0FTQ0FERSBERUxFVEUpDQpuYW1lICAgICAgICAgICAgVkFSQ0hBUigyNTUpDQpkZXNjcmlwdGlvbiAgICAgVEVYVA0Kc3RhdHVzICAgICAgICAgIEVOVU0ocGVuZGluZywgcGFzc2VkLCBmYWlsZWQpDQpyZXF1aXJlZCAgICAgICAgQk9PTEVBTg0KY29tcGxldGVkX2F0ICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORSAobnVsbGFibGUpDQpjcmVhdGVkX2F0ICAgICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQpgYGANCg0KIyMjIyAqKnN0b3JpZXMqKg0KYGBgc3FsDQppZCAgICAgICAgICAgICAgICAgIFVVSUQgUFJJTUFSWSBLRVkNCnByb2plY3RfaWQgICAgICAgICAgVVVJRCDihpIgcHJvamVjdHMuaWQgKENBU0NBREUgREVMRVRFKQ0Kc3ByaW50X2lkICAgICAgICAgICBVVUlEIOKGkiBzcHJpbnRzLmlkIChTRVQgTlVMTCkNCmVwaWNfaWQgICAgICAgICAgICAgVVVJRCDihpIgZXBpY3MuaWQgKFNFVCBOVUxMKSAgICAgICAgIC0tIEVwaWMgcmVsYXRpb25zaGlwDQpyZWxlYXNlX2lkICAgICAgICAgIFVVSUQg4oaSIHJlbGVhc2VzLmlkIChTRVQgTlVMTCkgICAgICAtLSBSZWxlYXNlIHJlbGF0aW9uc2hpcA0KdGl0bGUgICAgICAgICAgICAgICBWQVJDSEFSKDI1NSkNCmRlc2NyaXB0aW9uICAgICAgICAgVEVYVA0KYWNjZXB0YW5jZV9jcml0ZXJpYSBKU09OQiAgICAgICAgICAgICAgICAtLSBbIlVzZXIgY2FuIGxvZ2luIiwgIlBhc3N3b3JkIHZhbGlkYXRpb24iXQ0Kc3RhdHVzICAgICAgICAgICAgICBFTlVNKGJhY2tsb2csIHRvX2RvLCBpbl9wcm9ncmVzcywgcWFfcmV2aWV3LCBkb25lKQ0KcHJpb3JpdHkgICAgICAgICAgICBFTlVNKGxvdywgbWVkaXVtLCBoaWdoLCBjcml0aWNhbCkNCnN0b3J5X3BvaW50cyAgICAgICAgSU5URUdFUg0KYXNzaWduZWVfaWQgICAgICAgICBVVUlEIOKGkiB1c2Vycy5pZA0KcmVwb3J0ZXJfaWQgICAgICAgICBVVUlEIOKGkiB1c2Vycy5pZA0KbGFiZWxzICAgICAgICAgICAgICBKU09OQiAgICAgICAgICAgICAgICAtLSBbImZyb250ZW5kIiwgInVyZ2VudCJdDQpvcmRlcl9pbmRleCAgICAgICAgIElOVEVHRVINCmVzdGltYXRlZF9ob3VycyAgICAgREVDSU1BTCg1LDIpDQphY3R1YWxfaG91cnMgICAgICAgIERFQ0lNQUwoNSwyKQ0KY3JlYXRlZF9hdCAgICAgICAgICBUSU1FU1RBTVAgV0lUSCBUSU1FIFpPTkUNCnVwZGF0ZWRfYXQgICAgICAgICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQpgYGANCg0KIyMjIyAqKnRhc2tzKioNCmBgYHNxbA0KaWQgICAgICAgICAgICAgIFVVSUQgUFJJTUFSWSBLRVkNCnN0b3J5X2lkICAgICAgICBVVUlEIOKGkiBzdG9yaWVzLmlkIChDQVNDQURFIERFTEVURSkNCnRpdGxlICAgICAgICAgICBWQVJDSEFSKDI1NSkNCmRlc2NyaXB0aW9uICAgICBURVhUDQpzdGF0dXMgICAgICAgICAgRU5VTSh0b19kbywgaW5fcHJvZ3Jlc3MsIHFhX3JldmlldywgZG9uZSkNCnByaW9yaXR5ICAgICAgICBFTlVNKGxvdywgbWVkaXVtLCBoaWdoLCBjcml0aWNhbCkNCmFzc2lnbmVlX2lkICAgICBVVUlEIOKGkiB1c2Vycy5pZA0KcmVwb3J0ZXJfaWQgICAgIFVVSUQg4oaSIHVzZXJzLmlkDQplc3RpbWF0ZWRfaG91cnMgREVDSU1BTCg1LDIpDQphY3R1YWxfaG91cnMgICAgREVDSU1BTCg1LDIpDQpvcmRlcl9pbmRleCAgICAgSU5URUdFUg0KZHVlX2RhdGUgICAgICAgIERBVEUNCmxhYmVscyAgICAgICAgICBKU09OQg0KY3JlYXRlZF9hdCAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KdXBkYXRlZF9hdCAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KYGBgDQoNCiMjIyMgKipzdWJ0YXNrcyoqDQpgYGBzcWwNCmlkICAgICAgICAgICAgICBVVUlEIFBSSU1BUlkgS0VZDQp0YXNrX2lkICAgICAgICAgVVVJRCDihpIgdGFza3MuaWQgKENBU0NBREUgREVMRVRFKQ0KdGl0bGUgICAgICAgICAgIFZBUkNIQVIoMjU1KQ0KZGVzY3JpcHRpb24gICAgIFRFWFQNCmlzX2NvbXBsZXRlZCAgICBCT09MRUFODQphc3NpZ25lZV9pZCAgICAgVVVJRCDihpIgdXNlcnMuaWQNCmVzdGltYXRlZF9ob3VycyBERUNJTUFMKDUsMikNCmFjdHVhbF9ob3VycyAgICBERUNJTUFMKDUsMikNCm9yZGVyX2luZGV4ICAgICBJTlRFR0VSDQpkdWVfZGF0ZSAgICAgICAgREFURQ0KY3JlYXRlZF9hdCAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KdXBkYXRlZF9hdCAgICAgIFRJTUVTVEFNUCBXSVRIIFRJTUUgWk9ORQ0KYGBgDQoNCiMjIyAqKjQuIFRpbWUgVHJhY2tpbmcgJiBBbmFseXRpY3MqKg0KDQojIyMjICoqdGltZV9lbnRyaWVzKioNCmBgYHNxbA0KaWQgICAgICAgICAgIFVVSUQgUFJJTUFSWSBLRVkNCnVzZXJfaWQgICAgICBVVUlEIOKGkiB1c2Vycy5pZCAoQ0FTQ0FERSBERUxFVEUpDQpwcm9qZWN0X2lkICAgVVVJRCDihpIgcHJvamVjdHMuaWQgKENBU0NBREUgREVMRVRFKQ0Kc3RvcnlfaWQgICAgIFVVSUQg4oaSIHN0b3JpZXMuaWQgKFNFVCBOVUxMKQ0KdGFza19pZCAgICAgIFVVSUQg4oaSIHRhc2tzLmlkIChTRVQgTlVMTCkNCnN1YnRhc2tfaWQgICBVVUlEIOKGkiBzdWJ0YXNrcy5pZCAoU0VUIE5VTEwpDQpkZXNjcmlwdGlvbiAgVEVYVA0KZW50cnlfdHlwZSAgIEVOVU0oZGV2ZWxvcG1lbnQsIHRlc3RpbmcsIGRlc2lnbiwgbWVldGluZywgcmVzZWFyY2gsIGRvY3VtZW50YXRpb24sIHJldmlldykNCmhvdXJzX3dvcmtlZCBERUNJTUFMKDUsMikNCndvcmtfZGF0ZSAgICBEQVRFDQpzdGFydF90aW1lICAgVElNRQ0KZW5kX3RpbWUgICAgIFRJTUUNCmlzX2JpbGxhYmxlICBCT09MRUFODQpjcmVhdGVkX2F0ICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQp1cGRhdGVkX2F0ICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQpgYGANCg0KIyMjIyAqKmFpX2luc2lnaHRzKioNCmBgYHNxbA0KaWQgICAgICAgICAgICAgICBVVUlEIFBSSU1BUlkgS0VZDQpwcm9qZWN0X2lkICAgICAgIFVVSUQg4oaSIHByb2plY3RzLmlkIChDQVNDQURFIERFTEVURSkNCnR5cGUgICAgICAgICAgICAgRU5VTShwcm9kdWN0aXZpdHksIHJpc2tfYXNzZXNzbWVudCwgcmVzb3VyY2Vfb3B0aW1pemF0aW9uLCB0aW1lbGluZV9wcmVkaWN0aW9uLCBxdWFsaXR5X21ldHJpY3MpDQp0aXRsZSAgICAgICAgICAgIFZBUkNIQVIoMjU1KQ0KZGVzY3JpcHRpb24gICAgICBURVhUDQptZXRyaWNzICAgICAgICAgIEpTT05CICAgICAgICAgICAgLS0geyJ2ZWxvY2l0eSI6IDI4LjUsICJjb21wbGV0aW9uX3JhdGUiOiAwLjkyfQ0KcmVjb21tZW5kYXRpb25zICBKU09OQiAgICAgICAgICAgIC0tIFsiSW5jcmVhc2Ugc3RvcnkgcG9pbnRzIiwgIkFkZCBzZW5pb3IgZGV2ZWxvcGVyIl0NCmNvbmZpZGVuY2Vfc2NvcmUgREVDSU1BTCgzLDIpICAgICAtLSAwLjAwIHRvIDEuMDANCmlzX2FjdGl2ZSAgICAgICAgQk9PTEVBTg0KZ2VuZXJhdGVkX2F0ICAgICBUSU1FU1RBTVAgV0lUSCBUSU1FIFpPTkUNCmV4cGlyZXNfYXQgICAgICAgVElNRVNUQU1QIFdJVEggVElNRSBaT05FDQpgYGANCg0KIyMjICoqNS4gU3VwcG9ydGluZyBUYWJsZXMqKg0KDQojIyMjICoqbWlsZXN0b25lcywgcmVxdWlyZW1lbnRzLCByaXNrcywgc3Rha2Vob2xkZXJzKioNCi0gU3RhbmRhcmQgcHJvamVjdCBtYW5hZ2VtZW50IGVudGl0aWVzDQotIEVhY2ggbGlua2VkIHRvIHByb2plY3RzIHdpdGggYXBwcm9wcmlhdGUgc3RhdHVzIHRyYWNraW5nDQoNCiMjIyMgKipub3RpZmljYXRpb25zKioNCi0gUmVhbC10aW1lIG5vdGlmaWNhdGlvbiBzeXN0ZW0NCi0gU3VwcG9ydHMgZGlmZmVyZW50IHR5cGVzIGFuZCBwcmlvcml0aWVzDQotIEVudGl0eSBsaW5raW5nIGZvciBjb250ZXh0dWFsIG5vdGlmaWNhdGlvbnMNCg0KIyMjIyAqKmNvbW1lbnRzLCBhdHRhY2htZW50cywgYWN0aXZpdHlfbG9ncyoqDQotIENvbGxhYm9yYXRpb24gYW5kIGF1ZGl0IHRyYWlsIGZlYXR1cmVzDQotIEdlbmVyaWMgZW50aXR5IGxpbmtpbmcgKHBvbHltb3JwaGljIHJlbGF0aW9uc2hpcHMpDQoNCiMjIyMgKip0b2RvcywgcmVwb3J0cyoqDQotIFBlcnNvbmFsIHRhc2sgbWFuYWdlbWVudCBhbmQgcmVwb3J0aW5nIGZlYXR1cmVzDQoNCi0tLQ0KDQojIyDwn5SXIEtleSBSZWxhdGlvbnNoaXBzICYgV29ya2Zsb3dzDQoNCiMjIyAqKkNvcmUgSGllcmFyY2hpY2FsIFJlbGF0aW9uc2hpcHMqKg0KMS4gKipVc2VyIOKGkiBQcm9qZWN0cyoqOiBNYW55LXRvLW1hbnkgdGhyb3VnaCBgcHJvamVjdF90ZWFtX21lbWJlcnNgDQoyLiAqKlByb2plY3RzIOKGkiBFcGljcyoqOiBPbmUtdG8tbWFueSAobGFyZ2UgZmVhdHVyZSBpbml0aWF0aXZlcykNCjMuICoqUHJvamVjdHMg4oaSIFJlbGVhc2VzKio6IE9uZS10by1tYW55IChwcm9kdWN0IGRlcGxveW1lbnQgY3ljbGVzKQ0KNC4gKipQcm9qZWN0cyDihpIgU3ByaW50cyoqOiBPbmUtdG8tbWFueSAoYWdpbGUgaXRlcmF0aW9ucykNCjUuICoqRXBpY3Mg4oaSIFN0b3JpZXMqKjogT25lLXRvLW1hbnkgKHN0b3JpZXMgZ3JvdXBlZCBieSBlcGljKQ0KNi4gKipSZWxlYXNlcyDihpIgRXBpY3MqKjogTWFueS10by1tYW55IChyZWxlYXNlcyBjb250YWluIG11bHRpcGxlIGVwaWNzKQ0KNy4gKipSZWxlYXNlcyDihpIgU3RvcmllcyoqOiBNYW55LXRvLW1hbnkgKHJlbGVhc2VzIGNvbnRhaW4gbXVsdGlwbGUgc3RvcmllcykNCjguICoqU3ByaW50cyDihpIgU3RvcmllcyoqOiBPbmUtdG8tbWFueSAoc3RvcmllcyBjYW4gZXhpc3Qgd2l0aG91dCBzcHJpbnRzKQ0KOS4gKipTdG9yaWVzIOKGkiBUYXNrcyDihpIgU3VidGFza3MqKjogSGllcmFyY2hpY2FsIG9uZS10by1tYW55IGJyZWFrZG93bg0KMTAuICoqUmVsZWFzZXMg4oaSIFF1YWxpdHkgR2F0ZXMqKjogT25lLXRvLW1hbnkgKHJlbGVhc2UgdmFsaWRhdGlvbiBzdGVwcykNCjExLiAqKlRpbWUgRW50cmllcyoqOiBNdWx0aS1sZXZlbCBsaW5raW5nIChwcm9qZWN0L3N0b3J5L3Rhc2svc3VidGFzaykNCjEyLiAqKkNvbW1lbnRzL0F0dGFjaG1lbnRzKio6IFBvbHltb3JwaGljIC0gY2FuIGF0dGFjaCB0byBhbnkgZW50aXR5DQoNCiMjIyAqKlNwZWNpYWxpemVkIFdvcmtmbG93cyoqDQoNCiMjIyMgKirwn5CbIEJ1ZyBGaXhpbmcgV29ya2Zsb3cqKg0KYGBgDQpRQSBmaW5kcyBidWcg4oaSIENyZWF0ZXMgc3VidGFzayDihpIgQXNzaWducyB0byBkZXZlbG9wZXINCkRldmVsb3BlciBmaXhlcyDihpIgTWFya3Mgc3VidGFzayBjb21wbGV0ZSDihpIgTW92ZXMgdGFzayB0byAncWFfcmV2aWV3JyAgDQpRQSB2ZXJpZmllcyDihpIgTWFya3MgdGFzayBhcyAnZG9uZScg4oaSIE5vdGlmaWVzIGRldmVsb3Blcg0KYGBgDQoNCiMjIyMgKirij7AgVGltZSBUcmFja2luZyBGbG93KioNCmBgYA0KVXNlciBsb2dzIHRpbWUg4oaSIExpbmtzIHRvIHdvcmsgaXRlbSAocHJvamVjdC9zdG9yeS90YXNrL3N1YnRhc2spDQpTeXN0ZW0gYXV0by1jYWxjdWxhdGVzIOKGkiBSb2xsdXAgaG91cnMgdG8gcGFyZW50IGxldmVscw0KQW5hbHl0aWNzIGdlbmVyYXRlZCDihpIgQnVybmRvd24gY2hhcnRzLCBwcm9kdWN0aXZpdHkgbWV0cmljcw0KYGBgDQoNCiMjIyMgKirwn5qAIEVwaWMgTWFuYWdlbWVudCBGbG93KioNCmBgYA0KUHJvZHVjdCBPd25lciBjcmVhdGVzIGVwaWMg4oaSIERlZmluZXMgdGhlbWUsIGJ1c2luZXNzIHZhbHVlLCBhY2NlcHRhbmNlIGNyaXRlcmlhDQpFcGljIGFzc2lnbmVkIHRvIG93bmVyIOKGkiBTdG9yaWVzIGxpbmtlZCB0byBlcGljIHZpYSBlcGljX2lkDQpTdG9yaWVzIGRldmVsb3BlZCDihpIgRXBpYyBwcm9ncmVzcyBjYWxjdWxhdGVkIGZyb20gc3RvcnkgY29tcGxldGlvbg0KRXBpYyBjb21wbGV0ZWQg4oaSIEFsbCBsaW5rZWQgc3RvcmllcyBtYXJrZWQgYXMgZG9uZSwgZXBpYyBzdGF0dXMgdXBkYXRlZA0KYGBgDQoNCiMjIyMgKirwn5OmIFJlbGVhc2UgUGxhbm5pbmcgRmxvdyoqDQpgYGANClJlbGVhc2UgTWFuYWdlciBjcmVhdGVzIHJlbGVhc2Ug4oaSIERlZmluZXMgdmVyc2lvbiwgdGFyZ2V0IGRhdGUsIHNjb3BlDQpFcGljcy9TdG9yaWVzIGxpbmtlZCB0byByZWxlYXNlIOKGkiBSZWxlYXNlIHByb2dyZXNzIGNhbGN1bGF0ZWQgZnJvbSBsaW5rZWQgaXRlbXMNClF1YWxpdHkgZ2F0ZXMgZGVmaW5lZCDihpIgVmFsaWRhdGlvbiBzdGVwcyBmb3IgcmVsZWFzZSByZWFkaW5lc3MNClJlbGVhc2UgdGVzdGVkIOKGkiBRdWFsaXR5IGdhdGVzIHZhbGlkYXRlZCwgcmVsZWFzZSBhcHByb3ZlZA0KUmVsZWFzZSBkZXBsb3llZCDihpIgU3RhdHVzIHVwZGF0ZWQgdG8gJ3JlbGVhc2VkJywgZGVwbG95bWVudCBub3RlcyByZWNvcmRlZA0KYGBgDQoNCiMjIyMgKirwn5SXIEludGVncmF0aW9uIEZsb3cqKg0KYGBgDQpBZG1pbiBhZGRzIGludGVncmF0aW9uIOKGkiBBdmFpbGFibGUgdG8gYWxsIHByb2plY3RzDQpQcm9qZWN0IG1hbmFnZXIgZW5hYmxlcyDihpIgQ29uZmlndXJlcyBmb3Igc3BlY2lmaWMgcHJvamVjdA0KU3lzdGVtIGNvbm5lY3RzIOKGkiBXZWJob29rcywgQVBJIGNhbGxzLCBub3RpZmljYXRpb25zDQpgYGANCg0KIyMjIyAqKvCfk4sgUmVxdWlyZW1lbnRzIFRyYWNlYWJpbGl0eSoqDQpgYGANClJlcXVpcmVtZW50cyBkZWZpbmVkIOKGkiBMaW5rZWQgdG8gc3RvcmllcyB2aWEgbW9kdWxlcy9lcGljcw0KU3RvcmllcyBpbXBsZW1lbnRlZCDihpIgVGFza3MgdHJhY2sgZGV0YWlsZWQgd29yaw0KUHJvZ3Jlc3MgdHJhY2tlZCDihpIgUmVxdWlyZW1lbnRzIGNvbXBsZXRpb24gc3RhdHVzIHVwZGF0ZWQNCmBgYA0KDQotLS0NCg0KIyMg8J+TiiBJbmRleGVzICYgUGVyZm9ybWFuY2UNCg0KLSAqKlByaW1hcnkgaW5kZXhlcyoqIG9uIGFsbCBmb3JlaWduIGtleXMNCi0gKipDb21wb3NpdGUgaW5kZXhlcyoqIGZvciBjb21tb24gcXVlcnkgcGF0dGVybnMNCi0gKipTdGF0dXMtYmFzZWQgaW5kZXhlcyoqIGZvciBmaWx0ZXJpbmcgYWN0aXZlL2NvbXBsZXRlZCBpdGVtcw0KLSAqKkRhdGUtYmFzZWQgaW5kZXhlcyoqIGZvciB0aW1lLXNlcmllcyBxdWVyaWVzDQoNCi0tLQ0KDQojIyDwn5OLIERldGFpbGVkIFRhYmxlIFVzYWdlIFBhdHRlcm5zDQoNCiMjIyAqKvCfmqggUmlzayBNYW5hZ2VtZW50IChgcmlza3NgKSoqDQotICoqUmlzayBBc3Nlc3NtZW50IE1hdHJpeCoqOiBQcm9iYWJpbGl0eSDDlyBJbXBhY3QgPSBSaXNrIExldmVsDQotICoqTGlmZWN5Y2xlKio6IElkZW50aWZpZWQg4oaSIE1pdGlnYXRlZCDihpIgQ2xvc2VkDQotICoqT3duZXIgQXNzaWdubWVudCoqOiBFYWNoIHJpc2sgaGFzIHJlc3BvbnNpYmxlIHBlcnNvbg0KLSAqKlByb2plY3QgSW1wYWN0Kio6IExpbmtzIHJpc2tzIHRvIHNwZWNpZmljIHByb2plY3QgbW9kdWxlcw0KDQojIyMgKirwn5OLIFJlcXVpcmVtZW50cyBNYW5hZ2VtZW50IChgcmVxdWlyZW1lbnRzYCkqKg0KLSAqKlR5cGVzKio6IEZ1bmN0aW9uYWwsIE5vbi1mdW5jdGlvbmFsLCBUZWNobmljYWwNCi0gKipMaWZlY3ljbGUqKjogRHJhZnQg4oaSIEFwcHJvdmVkIOKGkiBJbi1EZXZlbG9wbWVudCDihpIgQ29tcGxldGVkICANCi0gKipUcmFjZWFiaWxpdHkqKjogTGlua3MgdG8gc3RvcmllcyB2aWEgbW9kdWxlcy9lcGljcw0KLSAqKkFjY2VwdGFuY2UgQ3JpdGVyaWEqKjogSlNPTkIgYXJyYXkgb2YgdGVzdGFibGUgY3JpdGVyaWENCg0KIyMjICoq4pyFIFBlcnNvbmFsIFByb2R1Y3Rpdml0eSAoYHRvZG9zYCkqKg0KLSAqKlBlcnNvbmFsIE1hbmFnZW1lbnQqKjogSW5kaXZpZHVhbCB1c2VyIHRhc2sgbGlzdHMNCi0gKipQcm9qZWN0IExpbmtpbmcqKjogT3B0aW9uYWwgbGlua3MgdG8gcHJvamVjdHMvc3Rvcmllcy90YXNrcw0KLSAqKlNtYXJ0IE5vdGlmaWNhdGlvbnMqKjogRHVlIGRhdGUgYW5kIHJlbWluZGVyIHN5c3RlbQ0KLSAqKkFuYWx5dGljcyoqOiBDb21wbGV0aW9uIHRyZW5kcyBhbmQgcHJvZHVjdGl2aXR5IG1ldHJpY3MNCg0KIyMjICoq4o+wIFRpbWUgVHJhY2tpbmcgKGB0aW1lX2VudHJpZXNgKSoqDQotICoqTXVsdGktbGV2ZWwgTGlua2luZyoqOiBDYW4gdHJhY2sgdGltZSBhdCBhbnkgaGllcmFyY2h5IGxldmVsDQotICoqV29yayBDYXRlZ29yaWVzKio6IDcgdHlwZXMgKGRldmVsb3BtZW50LCB0ZXN0aW5nLCBkZXNpZ24sIGV0Yy4pDQotICoqQmlsbGluZyBTdXBwb3J0Kio6IEJpbGxhYmxlIHZzIG5vbi1iaWxsYWJsZSBob3Vycw0KLSAqKkF1dG8gUm9sbHVwKio6IEF1dG9tYXRpYyBjYWxjdWxhdGlvbiBvZiBhY3R1YWxfaG91cnMgaW4gcGFyZW50IGl0ZW1zDQoNCiMjIyAqKvCflJcgSW50ZWdyYXRpb24gTWFuYWdlbWVudCAoYGF2YWlsYWJsZV9pbnRlZ3JhdGlvbnNgLCBgcHJvamVjdF9pbnRlZ3JhdGlvbnNgKSoqDQotICoqTWFzdGVyIENhdGFsb2cqKjogQ2VudHJhbCByZWdpc3RyeSBvZiBzdXBwb3J0ZWQgaW50ZWdyYXRpb25zDQotICoqUHJvamVjdCBDb25maWd1cmF0aW9uKio6IFBlci1wcm9qZWN0IGludGVncmF0aW9uIHNldHRpbmdzIGluIEpTT05CDQotICoqVHlwZXMqKjogVmVyc2lvbiBjb250cm9sLCBDb21tdW5pY2F0aW9uLCBTdG9yYWdlLCBEb2N1bWVudGF0aW9uDQotICoqRXhhbXBsZXMqKjogR2l0SHViLCBTbGFjaywgSmlyYSwgR29vZ2xlIERyaXZlLCBNaWNyb3NvZnQgVGVhbXMNCg0KIyMjICoq8J+UlCBOb3RpZmljYXRpb24gU3lzdGVtIChgbm90aWZpY2F0aW9uc2ApKioNCi0gKipFdmVudC1Ecml2ZW4qKjogQXV0b21hdGljIG5vdGlmaWNhdGlvbnMgZm9yIHN0YXR1cyBjaGFuZ2VzDQotICoqUG9seW1vcnBoaWMgTGlua2luZyoqOiBDYW4gcmVmZXJlbmNlIGFueSBlbnRpdHkgdHlwZQ0KLSAqKlByaW9yaXR5IExldmVscyoqOiBMb3csIE5vcm1hbCwgSGlnaCwgVXJnZW50DQotICoqRXhwaXJhdGlvbioqOiBBdXRvbWF0aWMgY2xlYW51cCBvZiBvbGQgbm90aWZpY2F0aW9ucw0KDQojIyMgKirwn4+377iPIENvbGxhYm9yYXRpb24gKGBjb21tZW50c2AsIGBhdHRhY2htZW50c2ApKioNCi0gKipQb2x5bW9ycGhpYyBEZXNpZ24qKjogQ2FuIGF0dGFjaCB0byBhbnkgZW50aXR5IChwcm9qZWN0L3N0b3J5L3Rhc2svZXRjLikNCi0gKipUaHJlYWRlZCBDb21tZW50cyoqOiBQYXJlbnQtY2hpbGQgY29tbWVudCByZWxhdGlvbnNoaXBzDQotICoqRmlsZSBNYW5hZ2VtZW50Kio6IFNlY3VyZSBmaWxlIHN0b3JhZ2Ugd2l0aCB0aHVtYm5haWxzDQotICoqQWN0aXZpdHkgSW50ZWdyYXRpb24qKjogQWxsIGNoYW5nZXMgbG9nZ2VkIGluIGFjdGl2aXR5X2xvZ3MNCg0KLS0tDQoNCiMjIPCfk4ggQW5hbHl0aWNzICYgUmVwb3J0aW5nIENhcGFiaWxpdGllcw0KDQojIyMgKirwn5OKIFByb2plY3QgQW5hbHl0aWNzKioNCi0gKipTcHJpbnQgQnVybmRvd24qKjogUmVhbC10aW1lIHByb2dyZXNzIHRyYWNraW5nIHdpdGggdGltZV9lbnRyaWVzIGRhdGENCi0gKipWZWxvY2l0eSBDaGFydHMqKjogU3RvcnkgcG9pbnRzIGNvbXBsZXRlZCBwZXIgc3ByaW50IHdpdGggdHJlbmQgYW5hbHlzaXMNCi0gKipCdWRnZXQgVHJhY2tpbmcqKjogQWN0dWFsIGNvc3RzIHZzIGJ1ZGdldCB1c2luZyBob3VybHkgcmF0ZXMNCi0gKipQcm9ncmVzcyBDYWxjdWxhdGlvbioqOiBBdXRvbWF0aWMgcHJvamVjdCBwcm9ncmVzcyBiYXNlZCBvbiBzdG9yeSBjb21wbGV0aW9uDQotICoqVGVhbSBVdGlsaXphdGlvbioqOiBSZXNvdXJjZSBhbGxvY2F0aW9uIGFuZCBhdmFpbGFiaWxpdHkgYW5hbHlzaXMNCi0gKipFcGljIFByb2dyZXNzIFRyYWNraW5nKio6IEVwaWMgY29tcGxldGlvbiByYXRlcyBhbmQgc3RvcnkgcG9pbnQgdmVsb2NpdHkNCi0gKipSZWxlYXNlIFJvYWRtYXAqKjogUmVsZWFzZSB0aW1lbGluZSBhbmQgbWlsZXN0b25lIHRyYWNraW5nDQotICoqUXVhbGl0eSBHYXRlIEFuYWx5dGljcyoqOiBSZWxlYXNlIHJlYWRpbmVzcyBhbmQgdmFsaWRhdGlvbiBtZXRyaWNzDQoNCiMjIyAqKvCfjq8gUGVyZm9ybWFuY2UgTWV0cmljcyoqDQotICoqQnVnIEZpeCBDeWNsZSBUaW1lKio6IEZyb20gc3VidGFzayBjcmVhdGlvbiB0byB0YXNrIGNvbXBsZXRpb24NCi0gKipFc3RpbWF0aW9uIEFjY3VyYWN5Kio6IEVzdGltYXRlZCB2cyBhY3R1YWwgaG91cnMgYW5hbHlzaXMNCi0gKipSZXF1aXJlbWVudHMgQ292ZXJhZ2UqKjogSW1wbGVtZW50YXRpb24gc3RhdHVzIGJ5IHJlcXVpcmVtZW50IHR5cGUNCi0gKipSaXNrIEFzc2Vzc21lbnQqKjogSGVhdCBtYXBzIHNob3dpbmcgcHJvYmFiaWxpdHkgw5cgaW1wYWN0IG1hdHJpY2VzDQotICoqSW50ZWdyYXRpb24gSGVhbHRoKio6IEFQSSB1c2FnZSBhbmQgd2ViaG9vayBzdWNjZXNzIHJhdGVzDQotICoqRXBpYyBEZWxpdmVyeSBWZWxvY2l0eSoqOiBUaW1lIGZyb20gZXBpYyBjcmVhdGlvbiB0byBjb21wbGV0aW9uDQotICoqUmVsZWFzZSBDeWNsZSBUaW1lKio6IEF2ZXJhZ2UgdGltZSBmcm9tIHBsYW5uaW5nIHRvIGRlcGxveW1lbnQNCi0gKipRdWFsaXR5IEdhdGUgU3VjY2VzcyBSYXRlKio6IFBlcmNlbnRhZ2Ugb2YgcGFzc2VkIHZzIGZhaWxlZCBxdWFsaXR5IGdhdGVzDQoNCiMjIyAqKvCfkaUgVGVhbSBQcm9kdWN0aXZpdHkqKg0KLSAqKkluZGl2aWR1YWwgUGVyZm9ybWFuY2UqKjogSG91cnMgbG9nZ2VkLCB0YXNrcyBjb21wbGV0ZWQsIHByb2R1Y3Rpdml0eSB0cmVuZHMNCi0gKipXb3JrbG9hZCBEaXN0cmlidXRpb24qKjogQWxsb2NhdGlvbiBhY3Jvc3MgcHJvamVjdHMgYW5kIHdvcmsgdHlwZXMNCi0gKipDb2xsYWJvcmF0aW9uIE1ldHJpY3MqKjogQ29tbWVudHMsIHJldmlld3MsIGFuZCBrbm93bGVkZ2Ugc2hhcmluZw0KLSAqKlNraWxsIFV0aWxpemF0aW9uKio6IERvbWFpbiBleHBlcnRpc2UgdXNhZ2UgYWNyb3NzIHByb2plY3RzDQotICoqVG9kbyBDb21wbGV0aW9uKio6IFBlcnNvbmFsIHByb2R1Y3Rpdml0eSBhbmQgdGltZSBtYW5hZ2VtZW50DQoNCiMjIyAqKvCfpJYgQUkgSW5zaWdodHMgKGBhaV9pbnNpZ2h0c2ApKioNCi0gKipQcm9kdWN0aXZpdHkgQW5hbHlzaXMqKjogVGVhbSBwZXJmb3JtYW5jZSBwYXR0ZXJucyBhbmQgcmVjb21tZW5kYXRpb25zDQotICoqUmlzayBBc3Nlc3NtZW50Kio6IEF1dG9tYXRlZCByaXNrIGlkZW50aWZpY2F0aW9uIGFuZCBtaXRpZ2F0aW9uIHN1Z2dlc3Rpb25zDQotICoqUmVzb3VyY2UgT3B0aW1pemF0aW9uKio6IFRlYW0gYWxsb2NhdGlvbiByZWNvbW1lbmRhdGlvbnMNCi0gKipUaW1lbGluZSBQcmVkaWN0aW9uKio6IFByb2plY3QgY29tcGxldGlvbiBmb3JlY2FzdGluZw0KLSAqKlF1YWxpdHkgTWV0cmljcyoqOiBDb2RlIHJldmlldyBhbmQgdGVzdGluZyBlZmZlY3RpdmVuZXNzIGFuYWx5c2lzDQoNCi0tLQ0KDQojIyDwn5SQIFNlY3VyaXR5IEZlYXR1cmVzDQoNCi0gKipSb3cgTGV2ZWwgU2VjdXJpdHkgKFJMUykqKiBvbiBzZW5zaXRpdmUgdGFibGVzDQotICoqUm9sZS1iYXNlZCBhY2Nlc3MgY29udHJvbCoqIHRocm91Z2ggdXNlciByb2xlcyAoYWRtaW4vbWFuYWdlci9kZXZlbG9wZXIvZGVzaWduZXIpDQotICoqQXVkaXQgdHJhaWxzKiogaW4gYWN0aXZpdHlfbG9ncyB0YWJsZSB3aXRoIGZ1bGwgY2hhbmdlIGhpc3RvcnkNCi0gKipTb2Z0IGRlbGV0ZXMqKiB3aXRoIGlzX2FjdGl2ZSBmbGFncyBmb3IgZGF0YSBwcmVzZXJ2YXRpb24NCi0gKipQcm9qZWN0LWJhc2VkIGFjY2VzcyoqOiBVc2VycyBvbmx5IHNlZSBkYXRhIGZvciBhc3NpZ25lZCBwcm9qZWN0cw0KLSAqKkVuY3J5cHRlZCBjb25maWd1cmF0aW9ucyoqOiBTZW5zaXRpdmUgaW50ZWdyYXRpb24gZGF0YSBwcm90ZWN0ZWQNCg0KLS0tDQoNCiMjIPCfjq8gSW1wbGVtZW50YXRpb24gU3VtbWFyeQ0KDQojIyMgKirwn5OBIERvY3VtZW50YXRpb24gRmlsZXMgQ3JlYXRlZCoqDQoxLiAqKmBjcmVhdGUtdGFibGVzLnNxbGAqKiAtIENvbXBsZXRlIGRhdGFiYXNlIHNjaGVtYSB3aXRoIGFsbCB0YWJsZXMsIGluZGV4ZXMsIGFuZCBpbml0aWFsIGRhdGENCjIuICoqYGRhdGFiYXNlLXN0cnVjdHVyZS1kaWFncmFtLm1kYCoqIC0gVmlzdWFsIGRpYWdyYW0gYW5kIHJlbGF0aW9uc2hpcCBvdmVydmlldyAodGhpcyBmaWxlKQ0KMy4gKipgZW5oYW5jZWQtZGF0YWJhc2UtZGlhZ3JhbS5tZGAqKiAtIERldGFpbGVkIGRhdGEgZmxvdyBhbmQgZm9yZWlnbiBrZXkgcmVsYXRpb25zaGlwcw0KNC4gKipgdGFibGUtc3RydWN0dXJlLXJlZmVyZW5jZS5tZGAqKiAtIENvbXBsZXRlIHRhYmxlIGRvY3VtZW50YXRpb24gd2l0aCBhbGwgY29sdW1ucw0KNS4gKipgYXZhaWxhYmxlX2ludGVncmF0aW9uc191c2FnZS5tZGAqKiAtIEludGVncmF0aW9uIG1hcmtldHBsYWNlIGltcGxlbWVudGF0aW9uIGd1aWRlDQo2LiAqKmByaXNrcy1yZXF1aXJlbWVudHMtdG9kb3MtdXNhZ2UubWRgKiogLSBQcm9qZWN0IGdvdmVybmFuY2UgYW5kIHBlcnNvbmFsIHByb2R1Y3Rpdml0eQ0KNy4gKipgdGltZV9lbnRyaWVzX3VzYWdlLm1kYCoqIC0gTXVsdGktbGV2ZWwgdGltZSB0cmFja2luZyBhbmQgYW5hbHl0aWNzDQo4LiAqKmB0YXNrLXN0YXR1cy13b3JrZmxvdy5tZGAqKiAtIEJ1ZyBmaXhpbmcgYW5kIFFBIHdvcmtmbG93IGltcGxlbWVudGF0aW9uDQoNCiMjIyAqKvCfmoAgUmVhZHktdG8tVXNlIEZlYXR1cmVzKioNCi0g4pyFICoqQ29tcGxldGUgZGF0YWJhc2Ugc2NoZW1hKiogd2l0aCAyNyB0YWJsZXMgYW5kIDI1IGVudW1zDQotIOKchSAqKk11bHRpLWxldmVsIHRpbWUgdHJhY2tpbmcqKiBzeXN0ZW0gd2l0aCBhdXRvbWF0aWMgcm9sbHVwcw0KLSDinIUgKipCdWcgZml4aW5nIHdvcmtmbG93Kiogd2l0aCBRQS1EZXZlbG9wZXIgY29sbGFib3JhdGlvbg0KLSDinIUgKipJbnRlZ3JhdGlvbiBtYXJrZXRwbGFjZSoqIHN1cHBvcnRpbmcgOCsgZXh0ZXJuYWwgdG9vbHMNCi0g4pyFICoqUmlzayBhbmQgcmVxdWlyZW1lbnRzIG1hbmFnZW1lbnQqKiB3aXRoIGZ1bGwgdHJhY2VhYmlsaXR5DQotIOKchSAqKlBlcnNvbmFsIHByb2R1Y3Rpdml0eSoqIHN5c3RlbSB3aXRoIHByb2plY3QgbGlua2luZw0KLSDinIUgKipSZWFsLXRpbWUgbm90aWZpY2F0aW9ucyoqIGFuZCBhY3Rpdml0eSB0cmFja2luZw0KLSDinIUgKipDb21wcmVoZW5zaXZlIGFuYWx5dGljcyoqIGFuZCBBSSBpbnNpZ2h0cyBmcmFtZXdvcmsNCi0g4pyFICoqUm9sZS1iYXNlZCBzZWN1cml0eSoqIHdpdGggcm93LWxldmVsIGFjY2VzcyBjb250cm9sDQotIOKchSAqKkVwaWMgbWFuYWdlbWVudCoqIHdpdGggdGhlbWVzLCBidXNpbmVzcyB2YWx1ZSwgYW5kIHByb2dyZXNzIHRyYWNraW5nDQotIOKchSAqKlJlbGVhc2UgcGxhbm5pbmcqKiB3aXRoIHF1YWxpdHkgZ2F0ZXMgYW5kIGRlcGxveW1lbnQgd29ya2Zsb3dzDQoNCiMjIyAqKvCfk4ogRGF0YWJhc2UgU3RhdGlzdGljcyoqDQotICoqMjcgVGFibGVzKiogY292ZXJpbmcgYWxsIGFzcGVjdHMgb2YgcHJvamVjdCBtYW5hZ2VtZW50DQotICoqMjUgQ3VzdG9tIEVudW1zKiogZm9yIGRhdGEgaW50ZWdyaXR5IGFuZCBjb25zaXN0ZW5jeQ0KLSAqKjI1KyBJbmRleGVzKiogZm9yIG9wdGltYWwgcXVlcnkgcGVyZm9ybWFuY2UNCi0gKipNdWx0aXBsZSBWaWV3cyoqIGZvciBjb21tb24gZGFzaGJvYXJkIHF1ZXJpZXMNCi0gKipBdXRvbWF0ZWQgVHJpZ2dlcnMqKiBmb3IgZGF0YSBjb25zaXN0ZW5jeSBhbmQgbm90aWZpY2F0aW9ucw0KLSAqKlJvdyBMZXZlbCBTZWN1cml0eSoqIHBvbGljaWVzIGZvciBkYXRhIHByb3RlY3Rpb24NCg0KIyMjICoq8J+UpyBOZXh0IFN0ZXBzKioNCjEuICoqU2V0IHVwIFBvc3RncmVTUUwqKiBkYXRhYmFzZSBpbnN0YW5jZQ0KMi4gKipSdW4gYGNyZWF0ZS10YWJsZXMuc3FsYCoqIHRvIGNyZWF0ZSBhbGwgdGFibGVzDQozLiAqKkNvbmZpZ3VyZSBhcHBsaWNhdGlvbioqIGRhdGFiYXNlIGNvbm5lY3Rpb24NCjQuICoqSW1wbGVtZW50IEFQSSBlbmRwb2ludHMqKiB1c2luZyB0aGUgZG9jdW1lbnRlZCBxdWVyaWVzDQo1LiAqKkJ1aWxkIFVJIGNvbXBvbmVudHMqKiBiYXNlZCBvbiB0aGUgd29ya2Zsb3cgcGF0dGVybnMNCjYuICoqU2V0IHVwIGludGVncmF0aW9ucyoqIHVzaW5nIHRoZSBjb25maWd1cmF0aW9uIHBhdHRlcm5zDQo3LiAqKkRlcGxveSBhbmQgdGVzdCoqIHdpdGggdGhlIHByb3ZpZGVkIHNhbXBsZSBkYXRhDQoNCllvdXIgU3ByaW50U3luYyBkYXRhYmFzZSBpcyBub3cgKipmdWxseSBkb2N1bWVudGVkKiogYW5kICoqcmVhZHkgZm9yIGltcGxlbWVudGF0aW9uKiohIPCfjokNCg==	\N	t	2025-11-18 12:43:19.069674+00	\N	file
\.


--
-- Data for Name: available_integrations; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.available_integrations (id, name, type, description, icon_url, is_active, created_at) FROM stdin;
INTG0000000000001	GitHub	version_control	GitHub repository integration for code management and collaboration	https://github.com/favicon.ico	t	2025-10-05 10:12:23.710233+00
INTG0000000000002	GitLab	version_control	GitLab repository integration for code management and CI/CD	https://gitlab.com/favicon.ico	t	2025-10-05 10:12:23.710233+00
INTG0000000000003	Slack	communication	Slack workspace integration for team communication and notifications	https://slack.com/favicon.ico	t	2025-10-05 10:12:23.710233+00
INTG0000000000004	Microsoft Teams	communication	Microsoft Teams integration for collaboration and meetings	https://teams.microsoft.com/favicon.ico	t	2025-10-05 10:12:23.710233+00
INTG0000000000005	Google Drive	storage	Google Drive integration for document storage and sharing	https://drive.google.com/favicon.ico	t	2025-10-05 10:12:23.710233+00
INTG0000000000006	Confluence	documentation	Confluence integration for documentation and knowledge management	https://confluence.atlassian.com/favicon.ico	t	2025-10-05 10:12:23.710233+00
INTG0000000000007	Jira	project_management	Jira integration for issue tracking and project management	https://jira.atlassian.com/favicon.ico	t	2025-10-05 10:12:23.710233+00
INTG0000000000008	Trello	project_management	Trello integration for task management and project boards	https://trello.com/favicon.ico	t	2025-10-05 10:12:23.710233+00
INTG0000000000009	Notion	documentation	Notion integration for documentation and workspace management	https://notion.so/favicon.ico	t	2025-10-05 10:12:23.710233+00
\.


--
-- Data for Name: backlog_stories; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.backlog_stories (id, project_id, original_story_id, original_sprint_id, title, description, acceptance_criteria, status, priority, story_points, assignee_id, reporter_id, epic_id, release_id, labels, order_index, actual_hours, created_from_sprint_id, created_at, updated_at, due_date) FROM stdin;
\.


--
-- Data for Name: backlog_subtasks; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.backlog_subtasks (id, backlog_task_id, original_subtask_id, title, description, is_completed, assignee_id, estimated_hours, actual_hours, order_index, due_date, bug_type, severity, category, labels, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: backlog_tasks; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.backlog_tasks (id, backlog_story_id, original_task_id, title, description, status, priority, assignee_id, reporter_id, estimated_hours, actual_hours, order_index, task_number, due_date, labels, is_overdue, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: boards; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.boards (id, project_id, name, description, is_default, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.comments (id, user_id, entity_type, entity_id, content, parent_comment_id, is_edited, edited_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.departments (id, name, description, created_at, updated_at) FROM stdin;
550e8400-e29b-41d4-a716-446655440010	ERP & Strategic Technology	ERP systems and strategic technology initiatives	2025-11-25 09:06:44.318526+00	2025-11-25 09:12:02.013042+00
550e8400-e29b-41d4-a716-446655440011	HIMS & Pharma ZIP	Hospital Information Management Systems and Pharma ZIP solutions	2025-11-25 09:06:44.318526+00	2025-11-25 09:12:02.013042+00
550e8400-e29b-41d4-a716-446655440012	Pharma Old	Legacy pharmaceutical systems and applications	2025-11-25 09:06:44.318526+00	2025-11-25 09:12:02.013042+00
550e8400-e29b-41d4-a716-446655440013	Infrastructure Management	IT infrastructure and system management	2025-11-25 09:06:44.318526+00	2025-11-25 09:12:02.013042+00
550e8400-e29b-41d4-a716-446655440014	Implementation	Project implementation and deployment services	2025-11-25 09:06:44.318526+00	2025-11-25 09:12:02.013042+00
550e8400-e29b-41d4-a716-446655440015	Administration	Administrative and management services	2025-11-25 09:06:44.318526+00	2025-11-25 09:12:02.013042+00
\.


--
-- Data for Name: domains; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.domains (id, name, description, created_at, updated_at, is_active) FROM stdin;
DOMN000000000000006	development	Development and Engineering Domain	2025-11-25 06:32:55.875857+00	2025-11-25 06:32:55.875857+00	t
DOMN000000000000007	management	Management and Administration Domain	2025-11-25 06:32:55.875857+00	2025-11-25 06:32:55.875857+00	t
\.


--
-- Data for Name: epics; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.epics (id, project_id, title, description, summary, priority, status, assignee_id, owner, start_date, end_date, progress, story_points, completed_story_points, linked_milestones, linked_stories, labels, components, theme, business_value, acceptance_criteria, risks, dependencies, created_at, updated_at, completed_at) FROM stdin;
EPIC000000000003	PROJ000000000010	DB Design and API Developement	Designing DB and coding API as per requirement	Designing DB and coding API as per requirement	medium	completed	USER000000000017	USER000000000017	2025-10-01	2025-10-15	0	55	0	\N	\N	\N	\N			\N	\N	\N	2025-10-06 16:27:24.166354+00	2025-11-18 10:28:10.575802+00	\N
EPIC000000000004	PROJ000000000010	API Integration	Integrating Listing and Save API for UI created	Integrating Listing and Save API for UI created	high	completed	USER000000000017	USER000000000017	2025-10-16	2025-10-31	0	50	0	\N	\N	\N	\N			\N	\N	\N	2025-10-06 16:41:27.990677+00	2025-11-18 10:30:06.785055+00	\N
\.


--
-- Data for Name: issues; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.issues (id, story_id, title, description, status, priority, assignee_id, reporter_id, estimated_hours, actual_hours, order_index, issue_number, due_date, labels, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: milestones; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.milestones (id, project_id, title, description, status, due_date, completion_date, progress_percentage, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.notifications (id, user_id, type, priority, title, message, related_entity_type, related_entity_id, action_url, is_read, is_archived, expires_at, created_at, read_at, updated_at) FROM stdin;
NOTFf8bd5025efdb4184abcd6cd4d29f751d	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Implement Project Template System	task	TASKbad1960fa1344f188bd17053ef54d219	\N	t	f	\N	2025-11-27 05:12:45.21992+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTF0aac63890e1e41f093794dd3099fd0d5	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Feature Definition & Prioritization Matrix	task	TASK7ca28974f6d343578e878f96884c4f94	\N	f	f	\N	2025-11-27 08:53:17.430867+00	\N	2025-11-27 08:53:18.138018+00
NOTF07b9f39a031f477f97c3e9882443fec5	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Team Overview UI modification	task	TASK92229f7d6975446f832430d63386fb0f	\N	f	f	\N	2025-11-27 09:25:48.934274+00	\N	2025-11-27 09:25:49.655102+00
NOTFb393b64eef6a45fb8b4fb594dafdc69b	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Fix the Backlog view as per backlog module page	task	TASKbb837a5dddcd4b478826d781834f6e80	\N	f	f	\N	2025-12-03 09:11:43.723835+00	\N	2025-12-03 09:11:54.405541+00
NOTF6deaeef41e3243d4b7f31f7cb3b13117	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Add scrum tasks feature and navigation	task	TASK12fcaddba0824c6e883c2700af22aaa7	\N	t	f	\N	2025-12-03 09:04:57.318787+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
NOTF7583217c768c40968486560bcd2f46b9	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Implement Sprint Burndown Chart and Velocity Tracking	task	TASKc3f835d1b1d44dab80fd8a059075a03f	\N	t	f	\N	2025-11-27 06:29:59.317763+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
NOTF9a0a404de498487a924aa347454d3301	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: UI Component Changes and API Integration	task	TASKa74c9d096aa843a8b7497d0a0d02f735	\N	t	f	\N	2025-12-03 09:00:04.845403+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
NOTFf0526610dab24132944f5adb5880342d	USER000000000019	issue	normal	New Issue Assignment	You have been assigned to issue: is	issue	ISSU8e7b1fb23b3e43efb18475826b2e1e89	\N	t	f	\N	2025-11-29 05:06:40.376127+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
NOTFfa2d6ccb3de34bba978489f45fc760dc	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: User List with Role, Status & Department	task	TASK3328947100a14fde856fbc6ddb790c97	\N	f	f	\N	2025-12-06 08:49:14.408427+00	\N	2025-12-06 08:49:29.96245+00
NOTF6df93a9136214c35980f59b5530411f4	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Add New Task Input Panel with Validation	task	TASK1191c8ece8b94c9d995071384df8d5ae	\N	f	f	\N	2025-12-06 09:10:47.001357+00	\N	2025-12-06 09:11:02.560042+00
NOTF30cd293fe6404ef68800556dad897292	USER000000000018	project	normal	Project Assignment	You have been assigned to project: Sprintsync	project	PROJ000000000010	\N	t	f	\N	2025-11-17 08:42:24.074145+00	2025-11-17 11:13:37.012683	2025-11-17 11:14:21.652194+00
NOTF8f374c6ff4f548b9893ae6e648003fa4	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Implement Project Template System	task	TASK1329848c841c440cae2a772218122c68	\N	t	f	\N	2025-11-27 05:19:19.401006+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTFb478bafeaea4444da060b56fd1266edf	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: User Experience Structure Planning	task	TASKd685faf93a31444484c295398910d2ad	\N	f	f	\N	2025-11-27 08:58:27.953148+00	\N	2025-11-27 08:58:28.666875+00
NOTF5d7b46f4db844f3cb6e704692f48a21e	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: example	task	TASK445ba22dfeaf45d39e2366ed4c6baf42	\N	f	f	\N	2025-11-27 12:05:30.734039+00	\N	2025-11-27 12:05:31.598511+00
NOTFad888aed078146f3a1c4f44fd83fad18	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: API Integration and Data Binding	task	TASKc965f98d5da34f36993e861f688adcab	\N	f	f	\N	2025-12-03 06:51:25.594008+00	\N	2025-12-03 06:51:36.084236+00
NOTF7b3f1f91248a4365ae5a4555bf28e45c	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Filters adding for Backlog visuals	task	TASK1afa8b3cc6624fb9badcd1e003eab223	\N	f	f	\N	2025-12-03 09:01:16.297064+00	\N	2025-12-03 09:01:27.00168+00
NOTFdea2667bc0ca44c6900c18210a7db547	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Add Freeze Board feature on sprint complete	task	TASKdcfe0822d73949bdbd9f678d5b4df927	\N	f	f	\N	2025-12-03 09:12:50.901275+00	\N	2025-12-03 09:13:01.527038+00
NOTFfd777260aa7c4ba38695143685d60d8b	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Add Sprint Retrospective and Action Items Management	task	TASK9b4c8c858df64315ada9819299ca0319	\N	t	f	\N	2025-11-27 06:34:41.173313+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
NOTF9e67fc532f484065aacb35948a7e4abd	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Action Controls (View, Edit, Lock User)	task	TASK5a222ec6a71c43778a1da061ebecc097	\N	f	f	\N	2025-12-06 08:52:26.508587+00	\N	2025-12-06 08:52:42.065866+00
NOTF6b1442d21d1b40a6a52b6981cbb340f5	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Filter Tabs for All / Active / Completed Tasks	task	TASK7060f5fb81e1413f918f55a31fe4a3af	\N	f	f	\N	2025-12-06 09:12:40.650839+00	\N	2025-12-06 09:12:56.213875+00
NOTF0ca60082e66f4bd0869c737ca923911d	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Add Project Health Dashboard and Analytics	task	TASKb5dc49a8af64416381b946ad36616f80	\N	t	f	\N	2025-11-27 05:30:25.943684+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTFecd328a05cc84dda85b2863fa63c6f51	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Implement Sprint Planning and Capacity Management	task	TASK872ba5cef44c4647a01d9dcba143d0d2	\N	t	f	\N	2025-11-27 06:39:21.523075+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTF176d81d65d204e3caa587cc756e02367	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Low-Fidelity Layout Exploration	task	TASK4db416e01cae40539ea34b72a852746d	\N	f	f	\N	2025-11-27 09:01:11.886065+00	\N	2025-11-27 09:01:12.597154+00
NOTF9ccedbf282f14325a7193d54ce67b2bc	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: example	task	TASKd964dd94638d45a9bf22a000a7b480ca	\N	f	f	\N	2025-11-27 12:55:31.597765+00	\N	2025-11-27 12:55:32.505245+00
NOTFe6d3efc74d3140d0b200c7281f57fb8c	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Change UI Visual	task	TASK50d9595d33444477806467d4b1e992bc	\N	f	f	\N	2025-12-03 06:55:30.870895+00	\N	2025-12-03 06:55:41.388638+00
NOTF002332ce6ad0475b9e71dc7914de9d3a	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Add Validations for Required data user wise	task	TASKdb9590a7ca214e7faa61d3b7576acf44	\N	f	f	\N	2025-12-03 06:57:44.923681+00	\N	2025-12-03 06:57:55.453339+00
NOTF272bab7e780144e297a00c25d6a730fb	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Check the Mismatch data and validations	task	TASKa7c2e1ee30d8419b804236bfedbc6137	\N	f	f	\N	2025-12-03 09:02:26.303268+00	\N	2025-12-03 09:02:37.001133+00
NOTF3a622193b4a641e8b238d9e4e2a17edd	USER000000000019	issue	normal	New Issue Assignment	You have been assigned to issue: example	issue	ISSUd49cc005659e451d91b469a8bcd01a92	\N	t	f	\N	2025-12-06 06:17:42.143019+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
NOTF549eb9a3196a4d51baba11377a3870d8	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Add Permission Request Queue for New Users	task	TASK7b06723b35774993a86aee0b479b6f6f	\N	f	f	\N	2025-12-06 08:54:53.361152+00	\N	2025-12-06 08:55:08.894554+00
NOTFf74132f5a673440b848fe6ef54a5f078	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Add Log Button to Task & Subtask + Time Logging	task	TASKa21c6e671d3a413ca470bb649b5c916f	\N	f	f	\N	2025-12-06 09:20:15.533682+00	\N	2025-12-06 09:20:31.095452+00
NOTF341acfb8e4a14d129d91aa76dad80c86	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Scrum Board Creation + Lanes + Role Based Drag & Drop + Issue Form Card	task	TASKf3ef3571a7da4920b3daf550c070c4a9	\N	f	f	\N	2025-12-06 09:22:59.002621+00	\N	2025-12-06 09:23:14.594436+00
NOTFb48d42a8575c4a79a57c341f6accdc4d	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: High-Fidelity Prototyping	task	TASK16dfbb81345640f099b28e2ee2768253	\N	f	f	\N	2025-11-27 09:04:04.619814+00	\N	2025-11-27 09:04:05.347252+00
NOTF7041801f2d4c4e50a11e4e8e12ef847d	USER000000000019	project	normal	Project Assignment	You have been assigned to project: Sprintsync	project	PROJ000000000010	\N	t	f	\N	2025-11-17 08:42:45.714168+00	2025-11-17 11:13:28.375051	2025-11-17 11:14:13.151291+00
NOTFe6c7ab47fd8c46b392353e282e54bad6	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Dashboard modules	task	TASKa9f77df696b14fc28a935b2afaa5a5e5	\N	t	f	\N	2025-11-17 11:47:13.886235+00	2025-11-17 12:17:47.258601	2025-11-17 12:18:32.146879+00
59756893-8936-42c4-b390-f19f35f2459d	USER000000000017	task	normal	All Subtasks Completed	All subtasks for task "Agile Development Schema Design Tables" have been completed. Consider moving to QA review.	task	TASK4700f30a5dd54f7aa00d62748559c721	\N	t	f	\N	2025-11-20 10:11:51.538167+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
64fcd826-caee-4784-8c1a-4045aa66f1de	USER000000000017	task	normal	All Subtasks Completed	All subtasks for task "Agile Development Schema Design Tables" have been completed. Consider moving to QA review.	task	TASK4700f30a5dd54f7aa00d62748559c721	\N	t	f	\N	2025-11-20 10:13:02.324615+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTF2724422935e44c71ae58716cf6b378a3	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: task section	task	TASKa198a81b054c4bc4bdbad2629a3d98ff	\N	t	f	\N	2025-11-17 12:31:46.004094+00	2025-11-17 12:51:14.924567	2025-11-17 12:51:59.839356+00
NOTF214f3f3fd0dc4bc599f85f98699d12c0	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Implement Project Dependency Management	task	TASK5c64e12aac7d4364865c1a70399a59c4	\N	t	f	\N	2025-11-27 06:11:00.855872+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTFe47b5b3e3be640e08f5f400f66e7e0d2	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: asdas	task	TASKbec2bbf60c4b4f378cb324f48a7976d8	\N	t	f	\N	2025-11-27 07:06:32.667056+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
be5e4d44-0f62-4163-b568-aaaef4bbd153	USER000000000017	task	normal	All Subtasks Completed	All subtasks for task "Agile Development Schema Design Tables" have been completed. Consider moving to QA review.	task	TASK4700f30a5dd54f7aa00d62748559c721	\N	t	f	\N	2025-11-20 10:14:51.215676+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
6cc05414-26f2-46f5-bea3-f2bc56b57878	USER000000000019	task	normal	All Subtasks Completed	All subtasks for task "User Permission Section with Pending Registration Management" have been completed. Consider moving to QA review.	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	\N	t	f	\N	2025-11-20 05:03:13.866034+00	2025-11-20 07:19:33.492506	2025-11-20 07:20:22.937319+00
NOTFcf1d6e0f102b4a24ba8b583fc86a8d1f	USER000000000018	project	normal	Project Assignment	You have been assigned to project: Sprint Sync	project	PROJ000000000010	\N	t	f	\N	2025-11-18 09:13:38.932468+00	2025-11-18 12:51:35.581774	2025-11-18 12:52:22.148372+00
c589165a-0efe-4134-92e4-baf7479bd9a5	USER000000000017	task	normal	All Subtasks Completed	All subtasks for task "Agile Development Schema Design Tables" have been completed. Consider moving to QA review.	task	TASK4700f30a5dd54f7aa00d62748559c721	\N	t	f	\N	2025-11-20 10:10:00.799288+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTFa60fad6932604b43b3a69b4c4dc4689a	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Agile Development Schema Design Tables	task	TASK4700f30a5dd54f7aa00d62748559c721	\N	t	f	\N	2025-11-20 09:44:47.078587+00	2025-11-26 12:37:34.671401	2025-11-26 12:38:34.542409+00
NOTF0c1a1173954c43b8bc194aed534f156d	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Admin Panel Cards	task	TASK112b4792c48e4c9c9ce3323e9379e73b	\N	t	f	\N	2025-11-19 12:28:02.87148+00	2025-11-20 07:19:33.492506	2025-11-20 07:20:22.937319+00
NOTFb11d9d586b1a4d618c6f9e48822ce302	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: ex	task	TASK8636aeb128e74eb4a79ef45417c57948	\N	f	f	\N	2025-11-27 13:12:07.205162+00	\N	2025-11-27 13:12:08.156943+00
NOTF79f4a0c756fa4fcaae5f148ca680a6c4	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: User Permission Section with Pending Registration Management	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	\N	t	f	\N	2025-11-20 04:42:39.235577+00	2025-11-20 07:19:33.492506	2025-11-20 07:20:22.937319+00
NOTF0181a39c7cf34f04b095ab4ed0c64e0a	USER000000000019	project	normal	Project Assignment	You have been assigned to project: Sprint Sync	project	PROJ000000000010	\N	t	f	\N	2025-11-18 09:15:17.791002+00	2025-11-19 12:05:35.039768	2025-11-19 12:06:23.190146+00
NOTFc14fe702e1784033ad5b74c25c2d05b3	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: API Integration for Visual Fields	task	TASK76154666448847849b5c12b78d7e3548	\N	f	f	\N	2025-12-03 08:51:40.497945+00	\N	2025-12-03 08:51:51.188154+00
NOTF8f4c73174d554262b1fba80fca3bde1f	USER0000000000001	task	normal	New Task Assignment	You have been assigned to task: dfghjk	task	TASKc7ad94d6191a4ae785aae2883e57fb21	\N	t	f	\N	2025-11-20 11:39:51.773747+00	2025-12-03 08:54:12.921063	2025-12-03 08:54:23.593194+00
NOTFe32788940892411786121baab22decaf	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Implement Admin Approval Workflow	task	TASK4c372d304a5c44239eb0ae9abfd06fb7	\N	f	f	\N	2025-12-06 08:57:33.25089+00	\N	2025-12-06 08:57:48.749492+00
NOTF30ab7f8a0a23441898d48ad108af4302	USER000000000019	issue	normal	New Issue Assignment	You have been assigned to issue: example	issue	ISSUa6069af353b747bab533c6eebde08c71	\N	t	f	\N	2025-12-06 07:27:21.129378+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
NOTF858f2e5be3e8473fbb5a9e61b81b9323	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Add QA Logic in Scrum Board to complete task	task	TASK4cbfc35a71ce4fcb8bc66b05c0335bb5	\N	t	f	\N	2025-12-03 09:07:18.058476+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
NOTFc6d7f1a9a6454c0f88c9cbd1a80bbcfa	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Design and Implement Core Database Schema with Custom Enums	task	TASK577bb13c26c64df485fb36e5f448687f	\N	t	f	\N	2025-11-20 09:05:46.316658+00	2025-11-20 09:19:03.908724	2025-11-20 09:19:53.516624+00
NOTFa5b3d0581e114e1b80261bd9e0acdf8c	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: User Management Integration	task	TASK1214626ea51c41b595f2845036536bb1	\N	t	f	\N	2025-11-19 12:45:25.222153+00	2025-11-20 07:19:33.492506	2025-11-20 07:20:22.937319+00
f2b60cb9-634b-4aee-8255-e721adfcba7b	USER000000000019	task	normal	All Subtasks Completed	All subtasks for task "User Permission Section with Pending Registration Management" have been completed. Consider moving to QA review.	task	TASK7a13b861e0404e3faa65fcdc8e42ed87	\N	t	f	\N	2025-11-20 05:02:08.63487+00	2025-11-20 07:19:33.492506	2025-11-20 07:20:22.937319+00
NOTF826cbb7605a743c099abbdc8fc8b806f	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: UI Modification of Team Allocation Page	task	TASKc36a084a1c394184a4dbef26c6c7097e	\N	f	f	\N	2025-11-20 08:38:54.84295+00	\N	2025-11-20 08:39:44.401284+00
NOTFbfa2defeb29f429aa1bcf1dbbd53299e	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: API Integration and binding for team listing	task	TASK0fec9f2b827240eda6c4056cae67484c	\N	f	f	\N	2025-11-20 08:41:53.273915+00	\N	2025-11-20 08:42:42.873942+00
NOTFa2fc4973d0ea4baea1f39b49f0464742	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: backlog module api	task	TASK8f9d60f81c4c483fa78eccc31677a97a	\N	f	f	\N	2025-12-06 10:05:55.866456+00	\N	2025-12-06 10:06:11.502049+00
NOTF5ea4eccc3d8e4f47a06396a8e971042a	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Create Indexes and Performance Optimization Structures	task	TASK062f09bcd04f408cb772e19422b52d9c	\N	t	f	\N	2025-11-24 10:24:06.76379+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTF5eacf4a73f3f4bee985fa8f8e53a1059	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Implement API Rate Limiting and Request Throttling	task	TASK7633e28141b0439c9adf8379230ff6ea	\N	t	f	\N	2025-11-27 05:04:49.139139+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTF6853ead960f148dd835a28a7f2bc8f2d	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Implement API Webhook System for Event Notifications	task	TASK33c3cf6e954e4ed5893d1886253a9dd7	\N	t	f	\N	2025-11-24 11:19:29.728176+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTFa7306df8f84c4d229594bbc7aa88c837	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Implement API Authentication & JWT Token Management	task	TASKbbff3e8d807440aea710486a60ac8f8c	\N	t	f	\N	2025-11-24 11:13:24.902034+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTFccb6db67371f412eac0795a99628323a	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Add Project Budget Tracking and Forecasting	task	TASK16e067b898a44c73804a690e45b77b42	\N	t	f	\N	2025-11-27 06:16:14.663861+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTFfd4a13d74dda47a2b574478e78131a15	USER000000000017	task	normal	New Task Assignment	You have been assigned to task: Add Advanced Filtering and Search API Endpoints	task	TASKe6683c26cf1d4ce1b158926c04f4e257	\N	t	f	\N	2025-11-27 04:57:30.659178+00	2025-11-27 08:29:58.217395	2025-11-27 08:29:58.971921+00
NOTF2495cdcf700746579972414158dc75fb	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Implement Task Statistics & Breakdown Widget	task	TASK481e4fdbfff94d4396bb6536c0a37aa2	\N	f	f	\N	2025-12-06 09:08:08.582189+00	\N	2025-12-06 09:08:24.13533+00
NOTF213ab9af8e9447bb93d20e546fa6729a	USER000000000018	issue	normal	New Issue Assignment	You have been assigned to issue: UI Changes	issue	ISSUcbe139a318604b31a6f92a6858925b38	\N	f	f	\N	2025-12-06 11:37:48.86781+00	\N	2025-12-06 11:38:04.641514+00
NOTF68ba94a4251f48a389d95a1a5f1b8eb2	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Discoveries & Alignments	task	TASKbe56aadf47fc42f7b130b403d78956f7	\N	f	f	\N	2025-11-27 08:45:58.457553+00	\N	2025-11-27 08:45:59.118576+00
NOTF50b67cbd3b584f60a19b1ac49d0e70b1	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Sprint Planning Workflow Review	task	TASKd4d946d16312471f9bded60efa8311c1	\N	f	f	\N	2025-11-27 08:50:51.038789+00	\N	2025-11-27 08:50:51.756009+00
NOTF59cc5de404234c78b92f17c104e35022	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: Interaction Specs Documentation	task	TASK19178111ac804f58bcb8d4d7a174fdaa	\N	f	f	\N	2025-11-27 09:08:04.01593+00	\N	2025-11-27 09:08:04.733849+00
NOTF87739c5f31af420c80eafc6134583136	USER000000000018	task	normal	New Task Assignment	You have been assigned to task: ex	task	TASK826baa037fac4b7183afa24ffe3b538b	\N	f	f	\N	2025-11-28 04:45:51.559643+00	\N	2025-11-28 04:45:53.564103+00
NOTF02fbce72e6654b7487f3826c59c618ad	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: UI Changes along with fields	task	TASK4b56151bb4de44198312e31add1617d7	\N	t	f	\N	2025-12-03 08:52:53.315983+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
NOTF0d2211d6623d4a9381282b9c67986556	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Modify Scrum Board with required features	task	TASK21fa36b2c0ad401ab8474b412406e071	\N	t	f	\N	2025-12-03 09:09:41.266313+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
NOTF2d399b1f8908475192127af6d2fab7fc	USER000000000019	task	normal	New Task Assignment	You have been assigned to task: Display User Statistics Overview & Add User Flow Button	task	TASK002556622da34f908b7261acba675e50	\N	t	f	\N	2025-12-06 08:42:46.628576+00	2025-12-06 08:43:47.801742	2025-12-06 08:44:03.349026+00
\.


--
-- Data for Name: pending_registrations; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.pending_registrations (id, email, password_hash, name, role, department_id, domain_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: project_integrations; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.project_integrations (id, project_id, integration_id, is_enabled, configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: project_team_members; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.project_team_members (id, project_id, user_id, role, is_team_lead, allocation_percentage, joined_at, left_at, created_at) FROM stdin;
PTMB177277f0b62f4ff1ac08c06c633e1be7	PROJ000000000010	USER000000000017	manager	t	100	\N	\N	\N
PTMBb8f33fe863334544bd9fb3f33f9abdb7	PROJ000000000010	USER000000000018	developer	f	100	2025-11-18 09:13:36.852297+00	\N	2025-11-18 09:13:36.852297+00
PTMB2563db4627d2494c9967970f1c67efdf	PROJ000000000010	USER000000000019	developer	f	100	2025-11-18 09:15:16.55442+00	\N	2025-11-18 09:15:16.55442+00
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.projects (id, name, description, status, priority, methodology, template, department_id, manager_id, start_date, end_date, budget, spent, progress_percentage, scope, success_criteria, objectives, is_active, created_at, updated_at, project_type) FROM stdin;
PROJ000000000010	Sprint Sync	A Project and Scrum Management System	active	high	scrum	web-app	550e8400-e29b-41d4-a716-446655440010	USER000000000017	2025-09-01	2025-12-31	150000.00	0.00	0	Develop a responsive web application with user authentication, data management, and API integration.	\N	\N	t	2025-11-18 08:57:01.205992+00	2025-12-05 11:35:55.863441+00	web-app
\.


--
-- Data for Name: quality_gates; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.quality_gates (id, release_id, name, description, status, required, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: releases; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.releases (id, project_id, name, version, description, status, release_date, target_date, progress, linked_epics, linked_stories, linked_sprints, release_notes, risks, dependencies, created_by, created_at, updated_at, completed_at) FROM stdin;
\.


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.reports (id, project_id, created_by, name, type, description, configuration, data, is_shared, scheduled_frequency, last_generated, next_generation, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: requirements; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.requirements (id, project_id, title, description, type, status, priority, module, acceptance_criteria, effort_points, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: risks; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.risks (id, project_id, title, description, probability, impact, mitigation, status, owner_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sprints; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.sprints (id, project_id, name, goal, status, start_date, end_date, capacity_hours, velocity_points, is_active, created_at, updated_at) FROM stdin;
SPNT01155a872f104bbd89a9b5ba88fa6b7f	PROJ000000000010	Sprint1 - September	Complete whole UI with dummy data	completed	2025-09-01	2025-09-30	368	0	t	2025-11-18 11:43:54.426465+00	2025-12-02 05:13:39.626309+00
SPNT1a7dd75af536477aafd886a209d307da	PROJ000000000010	Sprint 4 - December	Testing and Bug Solving	planning	2025-12-15	2025-12-31	264	0	t	2025-12-05 10:29:58.406691+00	2025-12-05 10:29:58.406691+00
SPNTd77b79ba852a4fc992cb50a3af9f9b6d	PROJ000000000010	Sprint 3 - November	Integration and Testing	active	2025-11-01	2025-12-15	576	0	t	2025-11-18 11:55:02.874899+00	2025-12-06 11:30:39.197778+00
SPNT3664c80c252f4630a67d037f9d0c4e2e	PROJ000000000010	Sprint 2 - October	Create DB and API with Integration	completed	2025-10-01	2025-10-30	424	0	t	2025-11-18 11:48:57.142638+00	2025-12-08 05:23:12.799565+00
\.


--
-- Data for Name: stakeholders; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.stakeholders (id, project_id, name, role, email, responsibilities, avatar_url, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: stories; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.stories (id, project_id, sprint_id, title, description, acceptance_criteria, status, priority, story_points, assignee_id, reporter_id, labels, order_index, actual_hours, created_at, updated_at, epic_id, release_id, parent_id, due_date, estimated_hours) FROM stdin;
STRY3ee097850750483e9ac6fa99a8391fcd	PROJ000000000010	SPNTd77b79ba852a4fc992cb50a3af9f9b6d	Profile Module 	Profile UI and Api Integration	[]	done	medium	25	USER000000000018	USER000000000017	\N	0	16.80	2025-12-03 08:49:35.234461+00	2025-12-06 07:19:36.651459+00	\N	\N	\N	2025-11-29	\N
STRY66d9ef986484487abaabf087838e1fc6	PROJ000000000010	SPNTd77b79ba852a4fc992cb50a3af9f9b6d	Time Tracking Module	Individual time tracking as per the task 	[]	done	medium	25	USER000000000018	USER000000000017	["tabulated data"]	0	23.00	2025-12-03 06:26:32.769745+00	2025-12-06 07:19:37.200448+00	\N	\N	\N	2025-11-28	\N
STRY46cd781abc0946dc800201657d99661b	PROJ000000000010	SPNT3664c80c252f4630a67d037f9d0c4e2e	Team Allocation Module	Team Information Individual and project wise	[]	done	medium	20	USER000000000018	USER000000000017	\N	0	85.00	2025-11-19 10:28:23.109341+00	2025-12-06 07:19:37.578704+00	EPIC000000000004	\N	\N	\N	\N
STRY46dfdcb675f640c88d6bf9ecaea8387d	PROJ000000000010	SPNT01155a872f104bbd89a9b5ba88fa6b7f	Requirement Gathering	Requirements to design UI for sprint sync	["No"]	done	medium	20	USER000000000018	USER000000000017	\N	0	13.50	2025-11-18 12:32:30.430096+00	2025-12-06 07:19:38.19173+00	\N	\N	\N	\N	\N
STRYbc942875ca6b4ebf9305e849c5a9d370	PROJ000000000010	SPNTd77b79ba852a4fc992cb50a3af9f9b6d	My Task Module 	Enhance the purpose of this page including the navigation to scrum task.	[]	done	medium	25	USER000000000019	USER000000000017	\N	0	17.00	2025-12-03 06:38:12.21097+00	2025-12-06 09:13:41.410206+00	\N	\N	\N	2025-11-28	\N
STRYbb1cf31b53714459871b69997e9eb288	PROJ000000000010	SPNT01155a872f104bbd89a9b5ba88fa6b7f	UI Design	All Pages for Visuals, Features with Dummy Data	["Should follow Scrum.org"]	done	medium	30	USER000000000018	USER000000000017	\N	0	17.00	2025-11-18 12:36:11.210135+00	2025-12-06 07:19:38.600527+00	\N	\N	\N	\N	\N
STRYe1ec7c31f642442eb1564939b240f132	PROJ000000000010	SPNTd77b79ba852a4fc992cb50a3af9f9b6d	Scum Management Module	Scrum Board and Sprint Api Integration	[]	done	high	25	USER000000000017	USER000000000017	\N	0	67.00	2025-11-19 10:26:18.928899+00	2025-12-06 09:24:16.059223+00	EPIC000000000004	\N	\N	\N	\N
STRY161a4111114346a185ff773444f932c6	PROJ000000000010	SPNTd77b79ba852a4fc992cb50a3af9f9b6d	Backlog Module	Redesign and API Integration in Backlog	[]	done	medium	25	USER000000000019	USER000000000017	["Enhancement"]	0	30.00	2025-12-03 06:20:39.380006+00	2025-12-09 11:27:38.396425+00	\N	\N	\N	2025-11-29	\N
STRY74090a2755c9400cbad2350ed58172f7	PROJ000000000010	SPNT3664c80c252f4630a67d037f9d0c4e2e	API Development	All API as per requirement	["should consist proper validations"]	done	high	30	USER000000000017	USER000000000017	\N	0	26.00	2025-11-18 12:52:56.753954+00	2025-12-06 09:07:08.468314+00	EPIC000000000003	\N	\N	\N	\N
STRY5e23619bd5b6405ab68917882853b715	PROJ000000000010	SPNT3664c80c252f4630a67d037f9d0c4e2e	Admin Panel Module	User management for admin	[]	done	medium	20	USER000000000019	USER000000000017	\N	0	44.00	2025-11-19 10:29:51.606807+00	2025-12-06 08:58:26.402553+00	EPIC000000000004	\N	\N	\N	\N
STRY277763a6252b462c84a5b8abdefd7a5c	PROJ000000000010	SPNT3664c80c252f4630a67d037f9d0c4e2e	Database Designing 	All Required Tables 	[]	done	medium	10	USER000000000017	USER000000000017	\N	0	19.00	2025-11-18 12:43:18.141338+00	2025-12-06 09:07:14.101547+00	EPIC000000000003	\N	\N	\N	\N
STRYccca331fce9a4d7e83f68e2a407a54b0	PROJ000000000010	SPNT3664c80c252f4630a67d037f9d0c4e2e	Project Module	UI changes and API Integration	["Filters applied properly"]	done	high	25	USER000000000017	USER000000000017	\N	0	19.00	2025-11-19 10:24:28.70368+00	2025-12-06 09:07:15.533658+00	EPIC000000000004	\N	\N	\N	\N
\.


--
-- Data for Name: subtasks; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.subtasks (id, task_id, title, description, is_completed, assignee_id, estimated_hours, actual_hours, order_index, due_date, bug_type, severity, created_at, updated_at, labels, category, issue_id) FROM stdin;
SUBTf4b4ec58b4a74bb5a2ce5e37507b33a9	TASK92229f7d6975446f832430d63386fb0f	UI changes		f	USER000000000018	10.00	8.00	0	\N	\N	\N	2025-11-27 09:27:57.149266+00	2025-11-27 09:29:09.762272+00	[]	\N	\N
SUBT305cb3ebda494bc89a9e8ac95a592a89	\N	Team Overview UI Modification	Added filters for the team card visuals and Infor within	f	USER000000000018	6.00	0.00	0	2025-10-07	\N	\N	2025-11-22 13:57:12.70265+00	2025-11-22 14:40:28.41956+00	\N	Development	\N
SUBTa5a75e09e01741c19d1b86815f1908ab	TASK76154666448847849b5c12b78d7e3548	Data Binding	Bind the data as per received from api	f	USER000000000018	2.00	0.00	0	2025-11-15	\N	\N	2025-12-05 06:55:57.228506+00	2025-12-05 06:55:57.228506+00	[]	Development	\N
SUBT7bef715a08944327b889a241747fc921	\N	Team Overview UI Modification	Added Pickers for filters in users 	f	USER000000000018	0.00	0.00	0	2025-10-07	\N	\N	2025-11-24 04:50:34.161991+00	2025-11-24 04:59:24.33366+00	\N	Development	\N
SUBTfb14ed05ff4e40cb84916ebd8dc1f945	TASK92229f7d6975446f832430d63386fb0f	overall module modification 		f	USER000000000018	5.00	6.00	0	\N	\N	\N	2025-11-27 09:28:28.955243+00	2025-11-27 09:29:38.159975+00	[]	\N	\N
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.tasks (id, story_id, title, description, status, priority, assignee_id, reporter_id, estimated_hours, actual_hours, order_index, due_date, labels, created_at, updated_at, task_number, is_pulled_from_backlog) FROM stdin;
TASKf3ef3571a7da4920b3daf550c070c4a9	STRYe1ec7c31f642442eb1564939b240f132	Scrum Board Creation + Lanes + Role Based Drag & Drop + Issue Form Card	Create a Scrum Board with default lanes . Allow adding/removing lanes with admin restrictions. Implement drag & drop issue movement based on user roles. Each story should contain a Issue form card to add issues directly.	done	high	USER000000000019	\N	8.00	7.00	0	2025-12-19	\N	2025-12-06 09:22:58.151815+00	2025-12-06 09:24:44.608816+00	9	f
TASKa21c6e671d3a413ca470bb649b5c916f	STRYe1ec7c31f642442eb1564939b240f132	Add Log Button to Task & Subtask + Time Logging	Add a +Log button to every Task & Subtask to allow users to enter work hours, notes, and date. Logged entries should be editable with restrictions. Admin/Lead can override logs, while members can edit only their own.	done	medium	USER000000000019	\N	4.00	5.00	0	2025-12-18	\N	2025-12-06 09:20:14.549022+00	2025-12-06 09:21:59.268041+00	8	f
TASK002556622da34f908b7261acba675e50	STRY5e23619bd5b6405ab68917882853b715	Display User Statistics Overview & Add User Flow Button	Create a statistics header on the Admin Panel to show key system information including Total Users, Active Projects, System Health, and Security Alerts. These should be displayed as clickable cards with icons and values synced from the backend summary API.\nAdd an "Add User" button at the top-right corner which triggers a modal form to capture new user details such as name, email, department, and role. Form should be validated and saved as inactive until admin approval (future workflow).	done	medium	USER000000000019	\N	4.00	4.00	0	2025-10-02	\N	2025-12-06 08:42:45.538204+00	2025-12-06 08:46:35.11985+00	1	f
TASK4c372d304a5c44239eb0ae9abfd06fb7	STRY5e23619bd5b6405ab68917882853b715	Implement Admin Approval Workflow	Add functionality that allows Admin users to Approve or Reject permissions for pending new users.\nOnce approved, user role and access should be assigned automatically. If rejected, user should remain inactive.	done	low	USER000000000019	\N	2.00	2.00	0	2025-10-20	\N	2025-12-06 08:57:32.25264+00	2025-12-06 08:58:53.132034+00	5	f
TASK19178111ac804f58bcb8d4d7a174fdaa	STRYbb1cf31b53714459871b69997e9eb288	Interaction Specs Documentation	Document interaction specifics such as drag-and-drop across Scrum boards, inline editing, hover behaviors, and validation messages for development accuracy.	done	medium	USER000000000018	\N	4.00	4.00	0	2025-09-19	\N	2025-09-19 09:08:03.479+00	2025-12-03 11:09:20.709891+00	4	f
TASKc965f98d5da34f36993e861f688adcab	STRY66d9ef986484487abaabf087838e1fc6	API Integration and Data Binding	Integrate API in existing UI for time tracking page and bind data properly	done	medium	USER000000000018	\N	8.00	7.00	0	2025-11-13	\N	2025-11-13 06:51:24.977+00	2025-12-03 11:09:21.043097+00	1	f
TASKd685faf93a31444484c295398910d2ad	STRYbb1cf31b53714459871b69997e9eb288	User Experience Structure Planning	Outline the core navigation model for Scrum features including backlog, boards, burndown charts, team sections, and settings to ensure intuitive access.	done	medium	USER000000000018	\N	4.00	4.00	0	2025-09-10	\N	2025-09-10 08:58:27.325+00	2025-12-03 11:09:21.345926+00	1	f
TASK3328947100a14fde856fbc6ddb790c97	STRY5e23619bd5b6405ab68917882853b715	User List with Role, Status & Department	Display a list of users showing their avatar initials, name, email, department, joined date, reporting manager, role badge, and active/inactive status.\nRole should be highlighted using color badges (Admin / Manager / Developer). Status should show if the user is currently Active.	done	medium	USER000000000019	\N	8.00	7.00	0	2025-10-08	\N	2025-12-06 08:49:13.547045+00	2025-12-06 08:50:51.273412+00	2	f
TASK481e4fdbfff94d4396bb6536c0a37aa2	STRYbc942875ca6b4ebf9305e849c5a9d370	Implement Task Statistics & Breakdown Widget	Design and display a statistics section summarizing overall task distribution. Include separate analytics for Priority Breakdown (High, Medium, Low) and Category Breakdown (Work, Personal, Shopping, Health). Values should dynamically update based on real task data displayed on the page.	done	medium	USER000000000019	\N	4.00	4.00	0	2025-11-04	\N	2025-12-06 09:08:07.949296+00	2025-12-06 09:09:43.586548+00	1	f
TASK4db416e01cae40539ea34b72a852746d	STRYbb1cf31b53714459871b69997e9eb288	Low-Fidelity Layout Exploration	Develop basic skeletal wireframes for key modules (Scrum board, dashboards, team pages) to validate layout direction and user flow early.	done	medium	USER000000000018	\N	8.00	7.00	0	2025-09-15	\N	2025-09-15 09:01:11.061+00	2025-12-03 12:03:31.107644+00	2	f
TASK50d9595d33444477806467d4b1e992bc	STRY66d9ef986484487abaabf087838e1fc6	Change UI Visual	UI enhancement in tabular visuals and tasks wise	done	high	USER000000000018	\N	8.00	8.00	0	2025-11-18	\N	2025-11-18 06:55:30.058+00	2025-12-03 12:03:31.292887+00	2	f
TASK92229f7d6975446f832430d63386fb0f	STRY46cd781abc0946dc800201657d99661b	Team Overview UI modification	UI modification	done	medium	USER000000000018	\N	16.00	16.00	0	2025-10-14	\N	2025-10-14 09:25:48.115+00	2025-12-03 12:03:29.928522+00	3	f
TASKdb9590a7ca214e7faa61d3b7576acf44	STRY66d9ef986484487abaabf087838e1fc6	Add Validations for Required data user wise	Filter User Task And projects properly as per the user no repeat data	done	medium	USER000000000018	\N	8.00	8.00	0	2025-11-21	\N	2025-11-21 06:57:44.121+00	2025-12-03 12:03:30.727836+00	3	f
TASK0fec9f2b827240eda6c4056cae67484c	STRY46cd781abc0946dc800201657d99661b	API Integration and binding for team listing	API Integration and binding for team listing in team overview	done	medium	USER000000000018	USER000000000017	8.00	8.00	0	2025-10-13	[]	2025-10-13 08:41:52.753+00	2025-12-03 12:03:31.490467+00	2	f
TASKbe56aadf47fc42f7b130b403d78956f7	STRY46dfdcb675f640c88d6bf9ecaea8387d	Discoveries & Alignments	Meet Scrum master, and representative users to capture goals, constraints, and must-have capabilities for SprintSync’s planning module.	done	low	USER000000000018	\N	4.00	4.00	0	2025-09-03	\N	2025-09-03 08:45:57.607+00	2025-12-03 12:03:31.675396+00	1	f
TASKbb837a5dddcd4b478826d781834f6e80	STRYe1ec7c31f642442eb1564939b240f132	Fix the Backlog view as per backlog module page	The data and filters are mismatching in visuals	done	medium	USER000000000018	\N	8.00	9.00	0	2025-11-17	\N	2025-11-17 09:11:43.191+00	2025-12-03 12:03:32.262542+00	6	f
TASK1afa8b3cc6624fb9badcd1e003eab223	STRY161a4111114346a185ff773444f932c6	Filters adding for Backlog visuals	Filters for project user sprint and priority	done	medium	USER000000000018	\N	4.00	4.00	0	2025-11-10	\N	2025-11-10 09:01:15.754+00	2025-12-03 12:03:32.446775+00	2	f
TASK76154666448847849b5c12b78d7e3548	STRY3ee097850750483e9ac6fa99a8391fcd	API Integration for Visual Fields	API Integration in the Profile page fetch data as per saved in admin	done	medium	USER000000000018	\N	8.00	8.50	0	2025-11-15	\N	2025-11-15 08:51:39.935+00	2025-12-05 09:40:21.058811+00	1	f
TASKd4d946d16312471f9bded60efa8311c1	STRY46dfdcb675f640c88d6bf9ecaea8387d	Sprint Planning Workflow Review	Analyze the current sprint-planning lifecycle and identify improvement opportunities.	done	low	USER000000000018	\N	2.00	1.50	0	2025-09-05	\N	2025-09-05 08:50:50.242+00	2025-12-03 12:03:34.124729+00	2	f
TASKdcfe0822d73949bdbd9f678d5b4df927	STRYe1ec7c31f642442eb1564939b240f132	Add Freeze Board feature on sprint complete	Freeze Board feature	done	medium	USER000000000018	\N	4.00	4.00	0	2025-11-26	\N	2025-11-26 08:50:50.242+00	2025-12-03 10:36:23.431278+00	7	f
TASK16dfbb81345640f099b28e2ee2768253	STRYbb1cf31b53714459871b69997e9eb288	High-Fidelity Prototyping	Create polished desktop and responsive screens capturing brand styling, spacing rules, and interaction states for all Scrum modules.	done	medium	USER000000000018	\N	2.00	2.00	0	2025-09-16	\N	2025-09-16 09:04:03.82+00	2025-12-03 12:03:34.308807+00	3	f
TASK1191c8ece8b94c9d995071384df8d5ae	STRYbc942875ca6b4ebf9305e849c5a9d370	Add New Task Input Panel with Validation	Create an input panel allowing users to add tasks with details such as task description, priority, and category. Include text field validation and default values. The “Add Task” button should only enable when a valid title is entered.	done	low	USER000000000019	\N	2.00	2.00	0	2025-11-06	\N	2025-12-06 09:10:46.16232+00	2025-12-06 09:11:56.631927+00	2	f
TASK5a222ec6a71c43778a1da061ebecc097	STRY5e23619bd5b6405ab68917882853b715	Action Controls (View, Edit, Lock User)	Provide action buttons next to each user card for:\n\nView Profile\n\nEdit User Details\n\nLock/Disable User Account\nIcons should visually represent each action. Lock disables account but keeps user in list.	done	medium	USER000000000019	\N	4.00	4.00	0	2025-10-14	\N	2025-12-06 08:52:25.653025+00	2025-12-06 08:53:43.956148+00	3	f
TASKa7c2e1ee30d8419b804236bfedbc6137	STRY161a4111114346a185ff773444f932c6	Check the Mismatch data and validations	validations	done	medium	USER000000000018	\N	8.00	8.00	0	2025-11-20	\N	2025-11-20 09:02:25.719+00	2025-12-03 12:03:33.941283+00	3	f
TASK7b06723b35774993a86aee0b479b6f6f	STRY5e23619bd5b6405ab68917882853b715	Add Permission Request Queue for New Users	Create a permissions queue inside the Permissions section where newly registered users appear with a “Pending Approval” status.\nAdmins should be able to see user details like name, email, role requested, and department before approval.	done	high	USER000000000019	\N	4.00	5.00	0	2025-10-16	\N	2025-12-06 08:54:52.494819+00	2025-12-06 08:56:10.677172+00	4	f
TASK7ca28974f6d343578e878f96884c4f94	STRY46dfdcb675f640c88d6bf9ecaea8387d	Feature Definition & Prioritization Matrix	Convert user stories into prioritized features covering backlog curation, sprint velocity tracking, and role-based permissions with acceptance criteria.	done	medium	USER000000000018	\N	8.00	8.00	0	2025-09-08	\N	2025-09-08 08:53:16.864+00	2025-12-03 12:03:34.860055+00	3	f
TASK4b56151bb4de44198312e31add1617d7	STRY3ee097850750483e9ac6fa99a8391fcd	UI Changes along with fields	Changes for better visuals	done	medium	USER000000000019	\N	8.00	8.30	0	2025-11-19	\N	2025-11-19 08:52:52.469+00	2025-12-05 07:03:33.526443+00	2	f
TASK7060f5fb81e1413f918f55a31fe4a3af	STRYbc942875ca6b4ebf9305e849c5a9d370	Filter Tabs for All / Active / Completed Tasks	Create interactive filter tabs allowing users to view tasks by status (All / Active / Completed). Filters must instantly reorganize the list without reloading the page and highlight the active filter selection.	done	medium	USER000000000019	\N	4.00	3.00	0	2025-11-12	\N	2025-12-06 09:12:40.087917+00	2025-12-06 09:14:00.416443+00	3	f
\.


--
-- Data for Name: time_entries; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.time_entries (id, user_id, project_id, story_id, task_id, subtask_id, description, entry_type, hours_worked, work_date, start_time, end_time, is_billable, created_at, updated_at) FROM stdin;
TIMEb3b683898d3244c8a2a85875161e768e	USER000000000017	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	TASK0fec9f2b827240eda6c4056cae67484c	\N	method written for api integration and team data binded	DEVELOPMENT	8.00	2025-09-13	\N	\N	t	2025-11-26 06:41:03.831834+00	2025-11-26 06:41:03.831834+00
TIME9d1c09d15c9a4af9adc68aaf3164b27b	USER000000000018	PROJ000000000010	STRY46dfdcb675f640c88d6bf9ecaea8387d	TASK7ca28974f6d343578e878f96884c4f94	\N	Converted user requirements into structured user stories.\nPrioritized features such as backlog refinement, velocity tracking, capacity inputs, and permissions.\nAdded acceptance criteria and finalized feature list with approval.	DEVELOPMENT	8.00	2025-09-08	\N	\N	t	2025-11-27 08:54:23.579978+00	2025-11-27 08:54:43.347556+00
TIME4a6441d9be5f49b7b6ecb29861bbde0a	USER000000000018	PROJ000000000010	STRYbb1cf31b53714459871b69997e9eb288	TASKd685faf93a31444484c295398910d2ad	\N	Completed IA hierarchy, reviewed with UX lead, and finalized revisions based on feedback	DEVELOPMENT	4.00	2025-09-10	\N	\N	t	2025-11-27 08:59:37.633683+00	2025-11-27 08:59:37.633683+00
TIMEbbc6f1da17e1498d8cf36547b51ad39d	USER000000000018	PROJ000000000010	STRYbb1cf31b53714459871b69997e9eb288	TASK19178111ac804f58bcb8d4d7a174fdaa	\N	Annotated interaction spec created with flow diagrams and behavior rules; shared with engineering for validation and final sign-off.	DEVELOPMENT	4.00	2025-09-19	\N	\N	t	2025-11-27 09:08:55.244366+00	2025-11-27 09:08:55.244366+00
TIME35656fa40aea444c848a759806c36d49	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	TASK92229f7d6975446f832430d63386fb0f	SUBTfb14ed05ff4e40cb84916ebd8dc1f945	done with changes	DEVELOPMENT	6.00	2025-10-13	\N	\N	t	2025-11-27 09:29:36.00403+00	2025-11-27 09:30:00.302484+00
TIMEcebf8d385d204b5dbfe0875e08edce6d	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	\N	e	DEVELOPMENT	1.00	2025-11-27	\N	\N	t	2025-11-27 13:12:51.855468+00	2025-11-27 13:15:18.062851+00
TIME440c27d6cee74fe98ee871d3710313d0	USER000000000018	PROJ000000000010	STRY66d9ef986484487abaabf087838e1fc6	TASKc965f98d5da34f36993e861f688adcab	\N	Time Tracking API Integration Completed and Data Binded 	DEVELOPMENT	7.00	2025-11-13	\N	\N	t	2025-12-03 09:27:43.165885+00	2025-12-03 09:27:43.165885+00
TIME37f2a2b887da4dd5a264d664449027a3	USER000000000018	PROJ000000000010	STRY66d9ef986484487abaabf087838e1fc6	TASKdb9590a7ca214e7faa61d3b7576acf44	\N	Filters added for User, Project, Sprint and Work Type 	DEVELOPMENT	8.00	2025-11-21	\N	\N	t	2025-12-03 09:30:24.947391+00	2025-12-03 09:30:24.947391+00
TIME1d02707694ea4015818310d2067cbe72	USER000000000018	PROJ000000000010	STRYe1ec7c31f642442eb1564939b240f132	TASKdcfe0822d73949bdbd9f678d5b4df927	\N	Scrum Board freeze feature on sprint completed added 	DEVELOPMENT	4.00	2025-12-03	\N	\N	t	2025-12-03 09:52:04.482349+00	2025-12-03 09:52:04.482349+00
TIME5126fb802ce94be9b1cf6ed7f1c898d9	USER000000000019	PROJ000000000010	STRY3ee097850750483e9ac6fa99a8391fcd	TASK4b56151bb4de44198312e31add1617d7	\N	UI Modified as per Admin and Data Binded Properly	DEVELOPMENT	8.00	2025-12-19	\N	\N	t	2025-12-03 10:11:41.702972+00	2025-12-03 10:11:41.702972+00
TIMEe78605db9b8647a3b37e3676867df5bd	USER000000000019	PROJ000000000010	STRY161a4111114346a185ff773444f932c6	\N	\N	Changes Done ad per backlog in scrum	DEVELOPMENT	7.00	2025-11-07	\N	\N	t	2025-12-03 10:29:08.129856+00	2025-12-05 06:31:02.376217+00
TIME679c6af4b501487b90e207e2b6744296	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	\N	\N	user permission section implemented and validated	DEVELOPMENT	5.00	2025-10-08	\N	\N	t	2025-11-20 05:00:36.393071+00	2025-12-05 06:31:03.723342+00
TIMEf2e72b4ff6954519b108245e92dbc71f	USER000000000017	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	\N	\N	done	DEVELOPMENT	1.00	2025-12-04	\N	\N	t	2025-12-04 08:54:20.092694+00	2025-12-05 06:31:03.723342+00
TIME9e35ab54f3d143cb8502adfb36bf7fe6	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	\N	\N	backend api and services created	DEVELOPMENT	1.00	2025-10-08	\N	\N	t	2025-11-20 04:57:16.81676+00	2025-12-05 06:31:03.723342+00
TIME73d570bad58a4afabbf6b7640213c4e2	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	\N	\N	rest Api integration and validation completed	DEVELOPMENT	1.00	2025-10-08	\N	\N	t	2025-11-20 04:58:01.384343+00	2025-12-05 06:31:03.723342+00
TIMEcaa77540d3d547a785fdac971253a90f	USER000000000019	PROJ000000000010	STRYe1ec7c31f642442eb1564939b240f132	\N	\N	Stories Pull Succesfully and being displayed on board with tasks	DEVELOPMENT	12.00	2025-11-19	\N	\N	t	2025-12-03 10:22:11.696627+00	2025-12-05 06:31:05.762216+00
TIME9968c13ecc8c40c9b64f47d4cdeaefc4	USER000000000017	PROJ000000000010	STRY3ee097850750483e9ac6fa99a8391fcd	TASK4b56151bb4de44198312e31add1617d7	\N	minor ui changes done	DEVELOPMENT	0.30	2025-11-19	\N	\N	t	2025-12-05 06:42:32.587837+00	2025-12-05 07:03:33.526443+00
TIME23c821be4d8f45d1892133ad6aecd14f	USER000000000017	PROJ000000000010	STRY3ee097850750483e9ac6fa99a8391fcd	TASK76154666448847849b5c12b78d7e3548	\N	Data binding 	DEVELOPMENT	0.30	2025-11-15	\N	\N	t	2025-12-05 09:24:15.892722+00	2025-12-05 09:24:15.892722+00
TIMEb8a372725fb94550ac8958ddb6a8a8df	USER000000000017	PROJ000000000010	STRY3ee097850750483e9ac6fa99a8391fcd	TASK76154666448847849b5c12b78d7e3548	\N	Minor changes	DEVELOPMENT	0.20	2025-11-15	\N	\N	t	2025-12-05 09:40:05.54995+00	2025-12-05 09:40:05.54995+00
TIME4d7e417e920b42cca3533700a73da431	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	TASK002556622da34f908b7261acba675e50	\N	Shows Total Users, Active Projects, System Health %, Security Alerts\nIcons + Labels + Value must be formatted\nValues updated dynamically through API\nAdd User” button placed beside Refresh\n\nOpens a popup form to enter user details\n\nUser record is created as inactive by default\n\nForm validations included (email, required fields)	DEVELOPMENT	4.00	2025-10-02	\N	\N	t	2025-12-06 08:45:57.299871+00	2025-12-06 08:45:57.299871+00
TIME186351c1a0f74c0393a1f96cd019f195	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	TASK3328947100a14fde856fbc6ddb790c97	\N	User card must show Name, Email, Role, Status, Department, Report Manager, Joined Date\n\nRole & Status displayed using color-coded badges\n\nScroll responsive layout for multiple users	DEVELOPMENT	7.00	2025-10-08	\N	\N	t	2025-12-06 08:50:14.192801+00	2025-12-06 08:50:14.192801+00
TIMEd49b78d945fb464daa9a5314d28dec67	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	TASK5a222ec6a71c43778a1da061ebecc097	\N	Eye icon: Opens user detail view\n\nPencil icon: Opens edit dialog\n\nLock icon: Deactivates user account\n\nLocked users should show inactive status in UI	DEVELOPMENT	4.00	2025-10-14	\N	\N	t	2025-12-06 08:53:10.311069+00	2025-12-06 08:53:10.311069+00
TIME6a3d65c9e1b34fe3b0df483e99d4fbac	USER000000000017	PROJ000000000010	STRYe1ec7c31f642442eb1564939b240f132	\N	\N	Team capacity calculation based on availability\nSprint goal suggestion based on velocity\nDrag-and-drop story assignment\nCapacity validation and warnings\nStory dependency visualization\nSprint planning reports\nIntegration with team allocation data	DEVELOPMENT	4.00	2025-10-28	\N	\N	t	2025-11-27 06:40:24.488601+00	2025-12-06 09:07:12.81046+00
TIMEd07768ac858b4e8d94f0ee53b99e8a33	USER000000000017	PROJ000000000010	STRYccca331fce9a4d7e83f68e2a407a54b0	\N	\N	Dependency types supported, with create/edit/delete actions. Includes visualization via graphs, circular dependency prevention, impact analysis, status-change notifications, and comprehensive dependency reports.	DEVELOPMENT	2.00	2025-11-27	\N	\N	t	2025-11-27 06:12:04.833489+00	2025-12-06 09:07:15.533658+00
TIMEe95dd44e85704b889cc3d67b4ca4b669	USER000000000018	PROJ000000000010	STRY46dfdcb675f640c88d6bf9ecaea8387d	TASKbe56aadf47fc42f7b130b403d78956f7	\N	Conducted meetings Scrum Master, development leads, and internal users. Finalized interview schedule and gathered requirements. Schedule finalized, sessions completed, and notes consolidated into shared summary.	DEVELOPMENT	4.00	2025-09-03	\N	\N	t	2025-11-27 08:47:53.178832+00	2025-11-27 08:47:53.178832+00
TIMEc9909aece0b5408c8794a6bc9d3ebe83	USER000000000018	PROJ000000000010	STRYbb1cf31b53714459871b69997e9eb288	TASK4db416e01cae40539ea34b72a852746d	\N	Wireframes created in Figma, stakeholder comments incorporated, ready for high-fidelity build.	DEVELOPMENT	7.00	2025-09-15	\N	\N	t	2025-11-27 09:01:50.642193+00	2025-11-27 09:01:50.642193+00
TIME5d1c1507e6ae4de7898b1a2869970beb	USER000000000017	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	SUBT305cb3ebda494bc89a9e8ac95a592a89	Created the view successfully	DEVELOPMENT	6.00	2025-10-07	\N	\N	t	2025-11-22 13:57:52.62003+00	2025-11-27 09:23:34.168616+00
TIME4dc92e270b53487ebabbe0c2ee0b2b9e	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	\N	ui complete	DEVELOPMENT	16.00	2025-10-08	\N	\N	t	2025-11-24 04:53:43.127786+00	2025-11-27 09:23:34.168616+00
TIMEee40300f179843539ce8dab061dcf3d1	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	\N	ui complete	DEVELOPMENT	16.00	2025-10-08	\N	\N	t	2025-11-24 04:53:44.06029+00	2025-11-27 09:23:34.168616+00
TIMEc16b45347224406cb628ba0b122212c1	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	\N	ui complete	DEVELOPMENT	1.00	2025-10-08	\N	\N	t	2025-11-24 04:53:44.044378+00	2025-11-27 09:23:34.168616+00
TIMEa27dde4f225041fe83fc61e1ab98bd8a	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	\N	ui complete	DEVELOPMENT	1.00	2025-10-08	\N	\N	t	2025-11-24 04:53:40.680208+00	2025-11-27 09:23:34.168616+00
TIME145facb1e3824ebbab1b89010973c0bd	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	TASK92229f7d6975446f832430d63386fb0f	\N	Done 	DEVELOPMENT	1.00	2025-10-14	\N	\N	t	2025-11-27 09:30:43.266723+00	2025-11-27 09:30:43.266723+00
TIMEdf962b343eaa4deebb1269bd27cd4412	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	\N	e	DEVELOPMENT	2.00	2025-11-28	\N	\N	t	2025-11-28 04:46:40.291677+00	2025-11-28 04:47:47.157119+00
TIMEb81bc0bb9d3748b38d5a9d46af7138df	USER000000000018	PROJ000000000010	STRY66d9ef986484487abaabf087838e1fc6	TASK50d9595d33444477806467d4b1e992bc	\N	Modify UI in Tabular for with all the data binded properly	DEVELOPMENT	8.00	2025-11-18	\N	\N	t	2025-12-03 09:29:03.838255+00	2025-12-03 09:29:03.838255+00
TIME0386f7f065e14c6b834bc823a0b4f1ed	USER000000000018	PROJ000000000010	STRY161a4111114346a185ff773444f932c6	TASK1afa8b3cc6624fb9badcd1e003eab223	\N	Sprint, Priority, User and status filters added in backlog	DEVELOPMENT	4.00	2025-11-10	\N	\N	t	2025-12-03 09:53:39.709806+00	2025-12-03 09:53:39.709806+00
TIME9d01cb1f5fb6407aa69458d3aad1f524	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	\N	\N	cards created with add user form.... now new user can be added by admin using form 	DEVELOPMENT	4.00	2025-10-02	\N	\N	t	2025-11-19 12:34:30.789036+00	2025-12-05 06:31:10.862198+00
TIMEfce9287b3c3c4c619fd6f2f91a2e3997	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	\N	\N	user management validated 	DEVELOPMENT	5.00	2025-10-06	\N	\N	t	2025-11-19 12:55:45.132481+00	2025-12-05 06:31:13.66678+00
TIMEb3af9be6979447fbbe73ff15549e7257	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	\N	\N	Forms Created 	DEVELOPMENT	3.00	2025-10-06	\N	\N	t	2025-11-19 12:52:05.720744+00	2025-12-05 06:31:13.66678+00
TIME540ea10b659c4f089f26e79c8a2458a2	USER000000000019	PROJ000000000010	STRYe1ec7c31f642442eb1564939b240f132	\N	\N	QA Logic successfully build 	DEVELOPMENT	8.00	2025-11-05	\N	\N	t	2025-12-03 10:15:16.151207+00	2025-12-05 06:31:15.295567+00
TIME817ee81dc2ef4d9fb974458cdd7b45e8	USER000000000017	PROJ000000000010	STRY74090a2755c9400cbad2350ed58172f7	\N	\N	Unified search endpoint with multi-entity support, complex AND/OR filters, date/status/priority filtering, full-text search, cursor-based pagination, caching, and updated API documentation.	DEVELOPMENT	2.00	2025-10-20	\N	\N	t	2025-11-27 05:01:23.00818+00	2025-12-05 06:31:17.415703+00
TIME733108e6f42a4c659fa520009705f77a	USER000000000017	PROJ000000000010	STRYccca331fce9a4d7e83f68e2a407a54b0	\N	\N	Implement milestone management with CRUD, status tracking, quality gate validation, dependencies, sequencing, progress calculation, notifications, reminders, reports, and templates. Enhance budget management with real-time tracking, category breakdowns, forecasting, threshold alerts, detailed reports, approval workflows, and time-tracking integration for accurate cost calculation.	DEVELOPMENT	5.00	2025-10-16	\N	\N	t	2025-11-27 06:24:03.212999+00	2025-12-06 09:07:03.08829+00
TIMEbafbefaaa8c140acaa5907164b4157a1	USER000000000017	PROJ000000000010	STRYccca331fce9a4d7e83f68e2a407a54b0	\N	\N	Quality gate requirements and validation\nMilestone dependencies and sequencing\nProgress calculation based on associated work	DEVELOPMENT	3.00	2025-10-16	\N	\N	t	2025-11-27 06:22:20.304741+00	2025-12-06 09:07:03.08829+00
TIME3a55f9248a9945fa8107bbd69b92e818	USER000000000017	PROJ000000000010	STRYccca331fce9a4d7e83f68e2a407a54b0	\N	\N	Template CRUD operations (Create, Read, Update, Delete)\nTemplate includes all project configuration options\nProjects can be created from templates with customization\nTemplate versioning system implemented\nUI for template management\nAPI endpoints for template operations	DEVELOPMENT	4.00	2025-10-22	\N	\N	t	2025-11-27 05:20:45.741306+00	2025-12-06 09:07:06.150566+00
TIMEe804119370ab4fdd8e617496592401ef	USER000000000017	PROJ000000000010	STRY161a4111114346a185ff773444f932c6	\N	\N	done 	DEVELOPMENT	4.00	2025-12-06	\N	\N	t	2025-12-06 10:06:58.963332+00	2025-12-09 11:27:38.396425+00
TIMEcc147971e37b4024a0f91dea2de4dc43	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	\N	done	DEVELOPMENT	4.00	2025-11-27	\N	\N	t	2025-11-27 12:06:20.442446+00	2025-11-27 12:36:29.858918+00
TIME5a3ca272d4884a8194956ef1f00fe980	USER000000000017	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	TASK92229f7d6975446f832430d63386fb0f	\N	done	DEVELOPMENT	1.00	2025-11-28	\N	\N	t	2025-11-28 04:53:33.89086+00	2025-11-28 04:53:33.89086+00
TIME75389337d2994041969d7bc33113f600	USER000000000017	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	SUBT305cb3ebda494bc89a9e8ac95a592a89	Created the view successfully	DEVELOPMENT	5.00	2025-10-07	\N	\N	t	2025-11-22 13:57:54.406025+00	2025-11-27 09:23:34.168616+00
TIMEa698a32e3560473896749b50a2e9a96d	USER000000000017	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	SUBT305cb3ebda494bc89a9e8ac95a592a89	Created the view successfully	DEVELOPMENT	5.00	2025-10-07	\N	\N	t	2025-11-22 13:57:55.341586+00	2025-11-27 09:23:34.168616+00
TIMEf52adb7b9cbd450e951792b0eddfa0b9	USER000000000018	PROJ000000000010	STRY46dfdcb675f640c88d6bf9ecaea8387d	TASKd4d946d16312471f9bded60efa8311c1	\N	Studied existing tools, flow, handoffs, and team practices.\n\nMapped end-to-end sprint planning workflow.\n\nDocumented friction points and bottlenecks needing optimization.	DEVELOPMENT	1.50	2025-09-05	\N	\N	t	2025-11-27 08:51:22.220669+00	2025-11-27 08:51:22.220669+00
TIME11fcb5e1be164ecba9ed8979c2a1fd56	USER000000000018	PROJ000000000010	STRYbb1cf31b53714459871b69997e9eb288	TASK16dfbb81345640f099b28e2ee2768253	\N	Desktop designs finalized; responsive screens responsive variants 80% complete	DEVELOPMENT	2.00	2025-09-16	\N	\N	t	2025-11-27 09:05:23.185451+00	2025-11-27 09:05:23.185451+00
TIME31967e5b9bf5480e8ada556ccc34f8f5	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	TASK92229f7d6975446f832430d63386fb0f	SUBTf4b4ec58b4a74bb5a2ce5e37507b33a9	UI changes done	DEVELOPMENT	8.00	2025-10-14	\N	\N	t	2025-11-27 09:29:07.953535+00	2025-11-27 09:30:24.328252+00
TIME25f51432bb93487a87ca4167da8f695c	USER000000000018	PROJ000000000010	STRY46cd781abc0946dc800201657d99661b	\N	\N	done 	DEVELOPMENT	4.00	2025-11-27	\N	\N	t	2025-11-27 12:57:03.613677+00	2025-11-27 13:09:49.919052+00
TIMEeb996afd9cc841e1845bf0544035c2a9	USER000000000018	PROJ000000000010	STRY3ee097850750483e9ac6fa99a8391fcd	TASK76154666448847849b5c12b78d7e3548	\N	API Integrated for fetching data from db and Minor UI Changes	DEVELOPMENT	8.00	2025-11-15	\N	\N	t	2025-12-03 09:32:16.953147+00	2025-12-03 09:32:16.953147+00
TIME791493b8c5d44c91bef0963548c03814	USER000000000018	PROJ000000000010	STRYe1ec7c31f642442eb1564939b240f132	TASKbb837a5dddcd4b478826d781834f6e80	\N	Backlog View Fixed Due Date and Assignee added and Filters applied same as backlog module page	DEVELOPMENT	9.00	2025-11-17	\N	\N	t	2025-12-03 09:36:01.319433+00	2025-12-03 09:36:01.319433+00
TIME2bdd9209c9e34ff09c169baa6996b812	USER000000000018	PROJ000000000010	STRY161a4111114346a185ff773444f932c6	TASKa7c2e1ee30d8419b804236bfedbc6137	\N	Validations Applied properly	DEVELOPMENT	8.00	2025-11-20	\N	\N	t	2025-12-03 10:02:40.332497+00	2025-12-03 10:02:40.332497+00
TIME0138efce3730431599f8edbcf6cdd361	USER000000000019	PROJ000000000010	STRY161a4111114346a185ff773444f932c6	\N	\N	Changes Done ad per backlog in scrum	DEVELOPMENT	7.00	2025-11-07	\N	\N	t	2025-12-03 10:29:03.852782+00	2025-12-05 06:31:02.376217+00
TIMEcc19f5774c52443b86d0eaa88f03bb83	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	\N	\N	done with admin panel integration	DEVELOPMENT	1.00	2025-10-08	\N	\N	t	2025-11-20 04:56:27.067662+00	2025-12-05 06:31:03.723342+00
TIME4084ea893a3f4a60b52a47b46fbfd477	USER000000000019	PROJ000000000010	STRYe1ec7c31f642442eb1564939b240f132	\N	\N	Completed	DEVELOPMENT	8.00	2025-11-15	\N	\N	t	2025-12-03 10:20:02.070791+00	2025-12-05 06:31:05.762216+00
TIMEe34026b94d554ad5ab348183bd6e1ddb	USER000000000019	PROJ000000000010	STRYbc942875ca6b4ebf9305e849c5a9d370	\N	\N	Module name changed from To Do to My Tasks and Now user can be able to see and fill the scrum tasks from here only	DEVELOPMENT	8.00	2025-11-12	\N	\N	t	2025-12-03 10:33:45.913146+00	2025-12-05 06:31:07.413251+00
TIMEd511e25f4b0141e2858373be4e1a8852	USER000000000019	PROJ000000000010	STRYe1ec7c31f642442eb1564939b240f132	\N	\N	Burndown chart displays ideal vs actual progress\nDaily updates based on completed work\nVelocity calculation and trending\nSprint analytics and insights\nExport functionality for reports\nReal-time data updates\nVisual indicators for sprint health	DEVELOPMENT	6.00	2025-10-13	\N	\N	t	2025-11-27 06:31:57.048432+00	2025-12-05 06:31:09.080348+00
TIME34bac59a6ada4e74af0f81eda11daaa2	USER000000000019	PROJ000000000010	STRYe1ec7c31f642442eb1564939b240f132	\N	\N	Retrospective creation and management\nMultiple retrospective templates\nAction item creation and tracking\nAction item assignment and status updates\nRetrospective history and trends\nAction item follow-up system\nRetrospective reports and analytics	DEVELOPMENT	4.00	2025-10-15	\N	\N	t	2025-11-27 06:35:22.040018+00	2025-12-05 06:31:12.17746+00
TIMEaae58f6b5b83410597b671cea2bfb409	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	\N	\N	done	DEVELOPMENT	1.00	2025-11-29	\N	\N	t	2025-11-29 09:41:24.5617+00	2025-12-05 06:31:13.66678+00
TIMEe0cf916a1fe14b7fb2738a324769e51c	USER000000000017	PROJ000000000010	STRY74090a2755c9400cbad2350ed58172f7	\N	\N	Different limits for read vs write operations\nIP-based rate limiting for unauthenticated endpoints\nMonitoring dashboard or logs for rate limit violations\nConfiguration file for easy adjustment of rate limits	DEVELOPMENT	5.00	2025-10-21	\N	\N	t	2025-11-27 05:08:46.037809+00	2025-12-06 09:07:00.100392+00
TIME7421eb83fec8444e83077ea5ca7195e1	USER000000000017	PROJ000000000010	STRY74090a2755c9400cbad2350ed58172f7	\N	\N	Create JWT token generation service\nImplement /api/auth/login endpoint for user authentication\nImplement /api/auth/refresh endpoint for token refresh\nImplement /api/auth/logout endpoint\nAdd JWT filter/interceptor to validate tokens on protected endpoints\nAdd role-based authorization checks (ADMIN, MANAGER, DEVELOPER, QA)\nSecure all existing endpoints with appropriate authentication\nAdd password encryption/hashing for user passwords\nCreate authentication exception handlers\nWrite unit tests for authentication flow	DEVELOPMENT	12.00	2025-11-24	\N	\N	t	2025-11-24 11:15:15.062505+00	2025-12-06 09:07:04.595543+00
TIMEe91f3f94d9d645d187616733320d4b03	USER000000000017	PROJ000000000010	STRY277763a6252b462c84a5b8abdefd7a5c	\N	\N	- Create indexes on all foreign key columns\n- Create composite indexes for common query patterns (project status, user + date, etc.)\n- Create status-based indexes for filtering active/completed items\n- Create date-based indexes for time-series queries and reporting\n- Create indexes on JSONB fields using GIN indexes where appropriate\n	DEVELOPMENT	1.50	2025-11-24	\N	\N	t	2025-11-24 10:25:59.357702+00	2025-12-06 09:07:07.357887+00
TIMEfc06247a7449462ea5a69a88f7bae313	USER000000000017	PROJ000000000010	STRY277763a6252b462c84a5b8abdefd7a5c	\N	\N	- Create database views for dashboard queries\n- Optimize index strategy based on query patterns\n- Document index usage and maintenance procedures	DEVELOPMENT	0.50	2025-11-24	\N	\N	t	2025-11-24 10:30:56.421839+00	2025-12-06 09:07:07.357887+00
TIME379ef3538eac434b82e41e2846d82752	USER000000000017	PROJ000000000010	STRY74090a2755c9400cbad2350ed58172f7	\N	\N	Design webhook entity model\nCreate Webhook entity, repository, and service classes\nImplement /api/webhooks CRUD endpoints\nImplement webhook registration endpoint with event subscription\nCreate webhook event dispatcher service\nAdd webhook delivery status tracking\nAdd webhook logging and monitoring\n	DEVELOPMENT	4.00	2025-11-24	\N	\N	t	2025-11-24 11:21:19.15133+00	2025-12-06 09:07:08.468314+00
TIME97dcb82971d34a20aceb08405042c7fe	USER000000000017	PROJ000000000010	STRYccca331fce9a4d7e83f68e2a407a54b0	\N	\N	Dashboard displays all key project health metrics Real-time data updates from project database Visual charts and graphs for trend analysis Automated health score calculation Alert system for at-risk projects Export functionality for reports Responsive design for different screen sizes	DEVELOPMENT	5.00	2025-10-23	\N	\N	t	2025-11-27 06:08:46.419769+00	2025-12-06 09:07:09.955465+00
TIMEd5eb604d1ecd44c3930d8678c8212da9	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	TASK7b06723b35774993a86aee0b479b6f6f	\N	Pending users visible in a separate queue\n\nShows user email, role requested, department\n\nStatus should display as “Pending Approval”	DEVELOPMENT	5.00	2025-10-16	\N	\N	t	2025-12-06 08:55:29.38867+00	2025-12-06 08:55:29.38867+00
TIME385083af18d645c4937ef639220803cf	USER000000000019	PROJ000000000010	STRY5e23619bd5b6405ab68917882853b715	TASK4c372d304a5c44239eb0ae9abfd06fb7	\N	Approve / Reject buttons in permission queue\n\nIf approved → activate user + assign role\n\nIf rejected → user account stays inactive + logged in audit history	DEVELOPMENT	2.00	2025-10-20	\N	\N	t	2025-12-06 08:58:10.852928+00	2025-12-06 08:58:10.852928+00
TIMEdc5adbfa93794ec3960dda46d1b76f3c	USER000000000017	PROJ000000000010	STRY74090a2755c9400cbad2350ed58172f7	\N	\N	Rate limiting middleware implemented with configurable limits per user role\nToken bucket algorithm implemented for smooth throttling\nRate limit headers included in all API responses	DEVELOPMENT	3.00	2025-10-21	\N	\N	t	2025-11-27 05:08:00.306046+00	2025-12-06 09:07:00.100392+00
TIMEf0563cbf2d424833927bc5b6b3c7df80	USER000000000017	PROJ000000000010	STRY277763a6252b462c84a5b8abdefd7a5c	\N	\N	- Design 25 custom PostgreSQL enum types for status, priority, roles, methodologies, etc.\n- Create core organizational tables: departments, domains, users\n- Create projects table with all required fields and JSONB columns\n- Implement UUID primary keys for all tables\n- Add created_at and updated_at timestamps with timezone support\n- Define unique constraints and basic validation rules\n- Create project_team_members junction table for many-to-many relationships	DEVELOPMENT	3.00	2025-10-01	\N	\N	t	2025-11-20 09:14:08.137761+00	2025-12-06 09:07:11.390223+00
TIME4ad8a1fc64bc495290d98fea0d86bb95	USER000000000017	PROJ000000000010	STRY277763a6252b462c84a5b8abdefd7a5c	\N	\N	- Create departments table with id (UUID), name (UNIQUE), description, timestamps\n- Create domains table with id (UUID), name (UNIQUE), description, timestamps\n- Create users table with comprehensive fields:\n  - Primary key: id (UUID)\n  - Authentication: email (UNIQUE), password_hash\n  - Profile: name, avatar_url\n  - Organization: role (enum), department_id (FK), domain_id (FK)\n  - Professional: experience (enum), hourly_rate, availability_percentage, skills (JSONB)\n  - Status: is_active, last_login\n  - Timestamps: created_at, updated_at\n- Add foreign key constraints to departments and domains\n- Add check constraints for availability_percentage (0-100)\n- Add indexes on email, department_id, domain_id, role, is_active	DEVELOPMENT	3.00	2025-10-01	\N	\N	t	2025-11-20 09:11:55.046461+00	2025-12-06 09:07:11.390223+00
TIMEcbbe2d20a26f461293b6af6f81efa5f7	USER000000000017	PROJ000000000010	STRY277763a6252b462c84a5b8abdefd7a5c	\N	\N	Create user role enum: admin, manager, developer, designer\n- Create experience level enum: junior, mid, senior, lead\n- Create project status enum: planning, active, paused, completed, cancelled\n- Create priority enum: low, medium, high, critical\n- Create methodology enum: scrum, kanban, waterfall\n- Create project template enum: web-app, mobile-app, api-service, data-analytics\n- Create sprint status enum: planning, active, completed, cancelled\n- Create epic status enum: backlog, planning, in-progress, review, completed, cancelled\n- Create release status enum: planning, development, testing, staging, ready-for-release, released, cancelled\n- Create story status enum: backlog, to_do, in_progress, qa_review, done	DEVELOPMENT	3.00	2025-10-01	\N	\N	t	2025-11-20 09:10:33.651013+00	2025-12-06 09:07:11.390223+00
TIME241454dd56d64242b30a967079829fb4	USER000000000017	PROJ000000000010	STRY277763a6252b462c84a5b8abdefd7a5c	\N	\N	- Create sprints table with capacity and velocity tracking\n- Create epics table with theme, business value, and story linking\n- Create releases table with quality gate integration\n- Create quality_gates table for release validation\n- Create stories table with epic and release relationships\n- Create tasks table with status workflow support\n- Create subtasks table with simplified bug workflow fields\n- Implement proper foreign key relationships with CASCADE and SET NULL rules	DEVELOPMENT	1.00	2025-10-08	\N	\N	t	2025-11-20 10:15:01.006471+00	2025-12-06 09:07:14.101547+00
TIMEb017970a832647f78671235af9531056	USER000000000017	PROJ000000000010	STRY277763a6252b462c84a5b8abdefd7a5c	\N	\N	Create Sprints Table: Includes project link, sprint info (name, goal, status), timeline, metrics (capacity & velocity), active flag, and timestamps.\n\nCreate Epics Table: Stores epic details, classification (priority, status), assignments, progress metrics, business fields, links to releases/stories/milestones, metadata (labels, components, risks), and timestamps.\n\nCreate Releases Table: Contains release details (name, version), status, timeline, progress, links to epics/stories/sprints, documentation, planning metadata, creator info, and timestamps.\n\nAdd all foreign keys with CASCADE DELETE: For project_id and other linking fields (assignee, owner, release, created_by).\n\nCreate indexes on all foreign keys and status fields: To optimize lookups, filtering, and joins across sprints, epics, and releases.	DEVELOPMENT	2.00	2025-11-06	\N	\N	t	2025-11-20 10:09:09.795579+00	2025-12-06 09:07:14.101547+00
TIME92809b5aab5744ca9158a62f50c069fc	USER000000000017	PROJ000000000010	STRY277763a6252b462c84a5b8abdefd7a5c	\N	\N	Quality Gates Table\n\nStores release quality checks with fields: id, release_id (FK), name, description, status (enum), required, completed_at, created_at.\n\nStories Table – Core Structure\n\nContains story data with id, project_id (FK), and hierarchical links: sprint_id, epic_id, release_id (all nullable).\n\nStory Details & Classification\n\nIncludes title, description, acceptance_criteria (JSONB), status, priority, labels, and order_index.\n\nEstimation & Assignment Fields\n\nTracks story_points, estimated_hours, actual_hours, and assignment fields: assignee_id, reporter_id.\n\nIndexes & Constraints\n\nAdd indexes on all FKs, status, assignee, and order_index.\n\nAdd check constraints validating valid ranges for story points and hour estimates.	DEVELOPMENT	2.00	2025-10-07	\N	\N	t	2025-11-20 10:11:00.552009+00	2025-12-06 09:07:14.101547+00
TIMEdd9ff2d7e545452f818abb78ed6dfe0e	USER000000000017	PROJ000000000010	STRY277763a6252b462c84a5b8abdefd7a5c	\N	\N	Tasks Table:\nStores task-level data linked to a story, including title, description, status/priority enums, estimated & actual hours, assignee/reporter, labels, ordering, due date, and timestamps.\n\nSubtasks Table:\nStores subtasks linked to a parent task with simplified workflow fields: completion flag, bug details (type & severity), estimation fields, assignment, ordering, due date, and timestamps.\n\nRelationships & Cascades:\nstory_id in tasks and task_id in subtasks use CASCADE DELETE ensuring dependent items are removed when the parent is deleted.\n\nIndexes & Constraints:\nAdd indexes on story_id, task_id, status, assignee_id, is_completed, bug_type, and severity.\nAdd CHECK constraints to enforce valid hour ranges (e.g., ≥0).\n\nBug Workflow Definition:\nWorkflow: QA creates subtask → Developer completes subtask → Task moves to qa_review → QA verifies & closes task as done.	DEVELOPMENT	3.00	2025-10-08	\N	\N	t	2025-11-20 10:12:11.161628+00	2025-12-06 09:07:14.101547+00
TIMEc9b38bdde2a346ae92974d3f26c846c9	USER000000000019	PROJ000000000010	STRYbc942875ca6b4ebf9305e849c5a9d370	TASK481e4fdbfff94d4396bb6536c0a37aa2	\N	Shows count of tasks by Priority & Category\n\nStatistics auto-updates when tasks added/removed\n\nDistinct color labels for High/Medium/Low priority\n\nResponsive layout for small screens	DEVELOPMENT	4.00	2025-11-04	\N	\N	t	2025-12-06 09:08:42.324878+00	2025-12-06 09:08:42.324878+00
TIME66a19b5c8f714c41b96776d6f6787034	USER000000000019	PROJ000000000010	STRYbc942875ca6b4ebf9305e849c5a9d370	TASK1191c8ece8b94c9d995071384df8d5ae	\N	Input box placeholder text: “What needs to be done?”\n\nDropdowns for Priority & Category included\n\nValidation prevents empty task creation\n\nAdds new task line below instantly without page refresh	DEVELOPMENT	2.00	2025-11-06	\N	\N	t	2025-12-06 09:11:15.527144+00	2025-12-06 09:11:15.527144+00
TIMEb27e5f1df0904fa386aa7844cb457c0a	USER000000000019	PROJ000000000010	STRYbc942875ca6b4ebf9305e849c5a9d370	TASK7060f5fb81e1413f918f55a31fe4a3af	\N	Three tabs: All, Active, Completed\n\nActive tab highlighted with green background\n\nCounts in parentheses update dynamically\n\nWorks smoothly with existing task interactions	DEVELOPMENT	3.00	2025-11-12	\N	\N	t	2025-12-06 09:13:25.87576+00	2025-12-06 09:13:25.87576+00
TIMEb3e5a2d0014047219576883003964c94	USER000000000019	PROJ000000000010	STRYe1ec7c31f642442eb1564939b240f132	TASKa21c6e671d3a413ca470bb649b5c916f	\N	Log visible on Task & Subtask\nLog Modal contains: Date, Hours, Minutes, Description\nLogs saved in new DB table time_logs\nUser can edit/delete only their own logs\nLead/Admin can modify any logs	DEVELOPMENT	5.00	2025-11-18	\N	\N	t	2025-12-06 09:21:20.713446+00	2025-12-06 09:21:20.713446+00
TIMEcb1a37f9554547b4a8c7cefabe1be16f	USER000000000019	PROJ000000000010	STRYe1ec7c31f642442eb1564939b240f132	TASKf3ef3571a7da4920b3daf550c070c4a9	\N	Ability to create new Board linked to sprint\nSystem auto-creates 5 default lanes\nDrag issues between lanes with role validation\nLane controls only for Admin\nInline + Issue form inside each story	DEVELOPMENT	7.00	2025-11-19	\N	\N	t	2025-12-06 09:24:00.474973+00	2025-12-06 09:24:00.474973+00
\.


--
-- Data for Name: todos; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.todos (id, user_id, title, description, priority, status, due_date, reminder_date, tags, related_project_id, related_story_id, related_task_id, order_index, completed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.users (id, email, password_hash, name, role, department_id, domain_id, avatar_url, experience, hourly_rate, availability_percentage, skills, is_active, last_login, created_at, updated_at, ctc, reporting_manager, date_of_joining) FROM stdin;
USER000000000018	ssapkale@microproindia.com	$2a$10$CD8naM7Ft7g4VKhtkvhSAuZ3vWE1EiT/FIAR/.o.zqAvUcAc9vAqa	Sanika Sapkale	developer	550e8400-e29b-41d4-a716-446655440010	DOMN000000000000006	\N	E1	236.74	100	["java","react","DevOps","sql"]	t	\N	2025-11-17 06:42:53.105503+00	2025-11-26 11:21:18.24426+00	550000.00	Amit Peshkar	2024-09-01
USER000000000019	snakhate@microproindia.com	$2a$10$vq2gkpp3w3Y5e68kNxwz/uspul.5f4vbC1CgJLZ/S/XUa51ji3.DK	Sudhanshu Nakhate	developer	550e8400-e29b-41d4-a716-446655440010	DOMN000000000000006	\N	E2	250.95	100	["java","Sql","React","Springboot","Java-Script"]	t	2025-12-03 10:03:06.653084+00	2025-11-17 06:44:21.780346+00	2025-12-03 10:03:17.671339+00	580000.00	Amit Peshkar	2025-09-17
USER000000000017	mgajbhiye@microproindia.com	$2a$10$7Ui0CiT0fbaVRsPgwvj3s.lnjgxT2uq3EQecOkwchAx5p1MgxXnh6	Mayuresh Gajbhiye	manager	550e8400-e29b-41d4-a716-446655440010	DOMN000000000000006	\N	E2	284.09	100	["Java","JavaScript","SQL"]	t	2025-12-03 11:52:49.523328+00	2025-11-17 06:29:59.414327+00	2025-12-03 11:53:00.547291+00	650000.00	Amit Peshkar	2022-08-09
USER0000000000001	admin@demo.com	$2a$10$U16BFx/Ll07Akr80DE1ukuPl9AG6jKTFlFU3hBV1lQL57WUNYV32a	Admin User	admin	550e8400-e29b-41d4-a716-446655440015	DOMN000000000000007	https://example.com/avatar.png	M1	345.64	80	["administrative","communication","managing"]	t	2025-09-24 06:41:19.730842+00	2025-09-25 06:41:19.730842+00	2025-11-26 10:44:43.196112+00	780000.00	\N	\N
\.


--
-- Data for Name: workflow_lanes; Type: TABLE DATA; Schema: public; Owner: avnadmin
--

COPY public.workflow_lanes (id, project_id, title, color, objective, wip_limit_enabled, wip_limit, display_order, status_value, created_at, updated_at, board_id) FROM stdin;
\.


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: ai_insights ai_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.ai_insights
    ADD CONSTRAINT ai_insights_pkey PRIMARY KEY (id);


--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: available_integrations available_integrations_name_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.available_integrations
    ADD CONSTRAINT available_integrations_name_key UNIQUE (name);


--
-- Name: available_integrations available_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.available_integrations
    ADD CONSTRAINT available_integrations_pkey PRIMARY KEY (id);


--
-- Name: backlog_stories backlog_stories_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_stories
    ADD CONSTRAINT backlog_stories_pkey PRIMARY KEY (id);


--
-- Name: backlog_subtasks backlog_subtasks_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_subtasks
    ADD CONSTRAINT backlog_subtasks_pkey PRIMARY KEY (id);


--
-- Name: backlog_tasks backlog_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_tasks
    ADD CONSTRAINT backlog_tasks_pkey PRIMARY KEY (id);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: domains domains_name_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_name_key UNIQUE (name);


--
-- Name: domains domains_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.domains
    ADD CONSTRAINT domains_pkey PRIMARY KEY (id);


--
-- Name: epics epics_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.epics
    ADD CONSTRAINT epics_pkey PRIMARY KEY (id);


--
-- Name: issues issues_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_pkey PRIMARY KEY (id);


--
-- Name: milestones milestones_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: pending_registrations pending_registrations_email_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.pending_registrations
    ADD CONSTRAINT pending_registrations_email_key UNIQUE (email);


--
-- Name: pending_registrations pending_registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.pending_registrations
    ADD CONSTRAINT pending_registrations_pkey PRIMARY KEY (id);


--
-- Name: project_integrations project_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.project_integrations
    ADD CONSTRAINT project_integrations_pkey PRIMARY KEY (id);


--
-- Name: project_integrations project_integrations_project_id_integration_id_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.project_integrations
    ADD CONSTRAINT project_integrations_project_id_integration_id_key UNIQUE (project_id, integration_id);


--
-- Name: project_team_members project_team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.project_team_members
    ADD CONSTRAINT project_team_members_pkey PRIMARY KEY (id);


--
-- Name: project_team_members project_team_members_project_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.project_team_members
    ADD CONSTRAINT project_team_members_project_id_user_id_key UNIQUE (project_id, user_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: quality_gates quality_gates_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.quality_gates
    ADD CONSTRAINT quality_gates_pkey PRIMARY KEY (id);


--
-- Name: releases releases_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_pkey PRIMARY KEY (id);


--
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: requirements requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_pkey PRIMARY KEY (id);


--
-- Name: risks risks_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT risks_pkey PRIMARY KEY (id);


--
-- Name: sprints sprints_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.sprints
    ADD CONSTRAINT sprints_pkey PRIMARY KEY (id);


--
-- Name: stakeholders stakeholders_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.stakeholders
    ADD CONSTRAINT stakeholders_pkey PRIMARY KEY (id);


--
-- Name: stories stories_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_pkey PRIMARY KEY (id);


--
-- Name: subtasks subtasks_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: time_entries time_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_pkey PRIMARY KEY (id);


--
-- Name: todos todos_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_pkey PRIMARY KEY (id);


--
-- Name: backlog_stories uk_backlog_story_project; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_stories
    ADD CONSTRAINT uk_backlog_story_project UNIQUE (id, project_id);


--
-- Name: boards unique_project_board_name; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT unique_project_board_name UNIQUE (project_id, name);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: workflow_lanes workflow_lanes_pkey; Type: CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.workflow_lanes
    ADD CONSTRAINT workflow_lanes_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_logs_created; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_activity_logs_created ON public.activity_logs USING btree (created_at);


--
-- Name: idx_activity_logs_entity; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_activity_logs_entity ON public.activity_logs USING btree (entity_type, entity_id);


--
-- Name: idx_activity_logs_project_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_activity_logs_project_id ON public.activity_logs USING btree (project_id);


--
-- Name: idx_activity_logs_user; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_activity_logs_user ON public.activity_logs USING btree (user_id);


--
-- Name: idx_attachments_type; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_attachments_type ON public.attachments USING btree (attachment_type);


--
-- Name: idx_backlog_stories_created_from_sprint; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_stories_created_from_sprint ON public.backlog_stories USING btree (created_from_sprint_id);


--
-- Name: idx_backlog_stories_original_sprint; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_stories_original_sprint ON public.backlog_stories USING btree (original_sprint_id);


--
-- Name: idx_backlog_stories_original_story; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_stories_original_story ON public.backlog_stories USING btree (original_story_id);


--
-- Name: idx_backlog_stories_project; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_stories_project ON public.backlog_stories USING btree (project_id);


--
-- Name: idx_backlog_stories_status; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_stories_status ON public.backlog_stories USING btree (status);


--
-- Name: idx_backlog_subtasks_completed; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_subtasks_completed ON public.backlog_subtasks USING btree (is_completed);


--
-- Name: idx_backlog_subtasks_original_subtask; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_subtasks_original_subtask ON public.backlog_subtasks USING btree (original_subtask_id);


--
-- Name: idx_backlog_subtasks_task; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_subtasks_task ON public.backlog_subtasks USING btree (backlog_task_id);


--
-- Name: idx_backlog_tasks_original_task; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_tasks_original_task ON public.backlog_tasks USING btree (original_task_id);


--
-- Name: idx_backlog_tasks_overdue; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_tasks_overdue ON public.backlog_tasks USING btree (is_overdue);


--
-- Name: idx_backlog_tasks_status; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_tasks_status ON public.backlog_tasks USING btree (status);


--
-- Name: idx_backlog_tasks_story; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_backlog_tasks_story ON public.backlog_tasks USING btree (backlog_story_id);


--
-- Name: idx_boards_is_default; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_boards_is_default ON public.boards USING btree (project_id, is_default) WHERE (is_default = true);


--
-- Name: idx_boards_project_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_boards_project_id ON public.boards USING btree (project_id);


--
-- Name: idx_comments_entity; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_comments_entity ON public.comments USING btree (entity_type, entity_id);


--
-- Name: idx_comments_user; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_comments_user ON public.comments USING btree (user_id);


--
-- Name: idx_epics_assignee; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_epics_assignee ON public.epics USING btree (assignee_id);


--
-- Name: idx_epics_owner; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_epics_owner ON public.epics USING btree (owner);


--
-- Name: idx_epics_project; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_epics_project ON public.epics USING btree (project_id);


--
-- Name: idx_epics_status; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_epics_status ON public.epics USING btree (status);


--
-- Name: idx_issues_assignee_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_issues_assignee_id ON public.issues USING btree (assignee_id);


--
-- Name: idx_issues_created_at; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_issues_created_at ON public.issues USING btree (created_at);


--
-- Name: idx_issues_due_date; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_issues_due_date ON public.issues USING btree (due_date);


--
-- Name: idx_issues_priority; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_issues_priority ON public.issues USING btree (priority);


--
-- Name: idx_issues_status; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_issues_status ON public.issues USING btree (status);


--
-- Name: idx_issues_story_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_issues_story_id ON public.issues USING btree (story_id);


--
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- Name: idx_pending_registrations_email; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_pending_registrations_email ON public.pending_registrations USING btree (email);


--
-- Name: idx_project_team_project; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_project_team_project ON public.project_team_members USING btree (project_id);


--
-- Name: idx_project_team_user; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_project_team_user ON public.project_team_members USING btree (user_id);


--
-- Name: idx_projects_active; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_projects_active ON public.projects USING btree (is_active);


--
-- Name: idx_projects_department; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_projects_department ON public.projects USING btree (department_id);


--
-- Name: idx_projects_manager; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_projects_manager ON public.projects USING btree (manager_id);


--
-- Name: idx_projects_status; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_projects_status ON public.projects USING btree (status);


--
-- Name: idx_quality_gates_release; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_quality_gates_release ON public.quality_gates USING btree (release_id);


--
-- Name: idx_quality_gates_status; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_quality_gates_status ON public.quality_gates USING btree (status);


--
-- Name: idx_releases_created_by; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_releases_created_by ON public.releases USING btree (created_by);


--
-- Name: idx_releases_project; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_releases_project ON public.releases USING btree (project_id);


--
-- Name: idx_releases_status; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_releases_status ON public.releases USING btree (status);


--
-- Name: idx_releases_target_date; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_releases_target_date ON public.releases USING btree (target_date);


--
-- Name: idx_sprints_active; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_sprints_active ON public.sprints USING btree (is_active);


--
-- Name: idx_sprints_project; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_sprints_project ON public.sprints USING btree (project_id);


--
-- Name: idx_sprints_status; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_sprints_status ON public.sprints USING btree (status);


--
-- Name: idx_stories_assignee; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_stories_assignee ON public.stories USING btree (assignee_id);


--
-- Name: idx_stories_epic; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_stories_epic ON public.stories USING btree (epic_id);


--
-- Name: idx_stories_parent_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_stories_parent_id ON public.stories USING btree (parent_id);


--
-- Name: idx_stories_project; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_stories_project ON public.stories USING btree (project_id);


--
-- Name: idx_stories_release; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_stories_release ON public.stories USING btree (release_id);


--
-- Name: idx_stories_sprint; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_stories_sprint ON public.stories USING btree (sprint_id);


--
-- Name: idx_stories_status; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_stories_status ON public.stories USING btree (status);


--
-- Name: idx_subtasks_assignee; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_subtasks_assignee ON public.subtasks USING btree (assignee_id);


--
-- Name: idx_subtasks_bug_type; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_subtasks_bug_type ON public.subtasks USING btree (bug_type);


--
-- Name: idx_subtasks_completed; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_subtasks_completed ON public.subtasks USING btree (is_completed);


--
-- Name: idx_subtasks_issue_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_subtasks_issue_id ON public.subtasks USING btree (issue_id);


--
-- Name: idx_subtasks_severity; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_subtasks_severity ON public.subtasks USING btree (severity);


--
-- Name: idx_subtasks_task; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_subtasks_task ON public.subtasks USING btree (task_id);


--
-- Name: idx_tasks_assignee; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_tasks_assignee ON public.tasks USING btree (assignee_id);


--
-- Name: idx_tasks_is_pulled_from_backlog; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_tasks_is_pulled_from_backlog ON public.tasks USING btree (is_pulled_from_backlog);


--
-- Name: idx_tasks_status; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_tasks_status ON public.tasks USING btree (status);


--
-- Name: idx_tasks_story; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_tasks_story ON public.tasks USING btree (story_id);


--
-- Name: idx_tasks_story_task_number; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_tasks_story_task_number ON public.tasks USING btree (story_id, task_number);


--
-- Name: idx_time_entries_date; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_time_entries_date ON public.time_entries USING btree (work_date);


--
-- Name: idx_time_entries_project; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_time_entries_project ON public.time_entries USING btree (project_id);


--
-- Name: idx_time_entries_story_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_time_entries_story_id ON public.time_entries USING btree (story_id) WHERE (story_id IS NOT NULL);


--
-- Name: idx_time_entries_task_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_time_entries_task_id ON public.time_entries USING btree (task_id) WHERE (task_id IS NOT NULL);


--
-- Name: idx_time_entries_user; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_time_entries_user ON public.time_entries USING btree (user_id);


--
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_users_active ON public.users USING btree (is_active);


--
-- Name: idx_users_department; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_users_department ON public.users USING btree (department_id);


--
-- Name: idx_users_domain; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_users_domain ON public.users USING btree (domain_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: idx_workflow_lanes_board_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_workflow_lanes_board_id ON public.workflow_lanes USING btree (board_id);


--
-- Name: idx_workflow_lanes_display_order; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_workflow_lanes_display_order ON public.workflow_lanes USING btree (project_id, display_order);


--
-- Name: idx_workflow_lanes_project_board; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_workflow_lanes_project_board ON public.workflow_lanes USING btree (project_id, board_id);


--
-- Name: idx_workflow_lanes_project_id; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE INDEX idx_workflow_lanes_project_id ON public.workflow_lanes USING btree (project_id);


--
-- Name: unique_project_board_lane_order; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE UNIQUE INDEX unique_project_board_lane_order ON public.workflow_lanes USING btree (project_id, COALESCE(board_id, ''::character varying), display_order);


--
-- Name: unique_project_board_lane_order_idx; Type: INDEX; Schema: public; Owner: avnadmin
--

CREATE UNIQUE INDEX unique_project_board_lane_order_idx ON public.workflow_lanes USING btree (project_id, COALESCE(board_id, 'GLOBAL'::character varying), display_order);


--
-- Name: notifications notifications_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER notifications_updated_at_trigger BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.update_notifications_updated_at();


--
-- Name: tasks task_status_notification_trigger; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER task_status_notification_trigger AFTER UPDATE ON public.tasks FOR EACH ROW WHEN (((old.status)::text IS DISTINCT FROM (new.status)::text)) EXECUTE FUNCTION public.notify_task_status_change();


--
-- Name: time_entries time_entry_notification_trigger; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER time_entry_notification_trigger AFTER INSERT OR UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION public.notify_time_entry_change();


--
-- Name: time_entries time_entry_rollup_trigger; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER time_entry_rollup_trigger AFTER INSERT OR DELETE OR UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION public.update_actual_hours();


--
-- Name: TRIGGER time_entry_rollup_trigger ON time_entries; Type: COMMENT; Schema: public; Owner: avnadmin
--

COMMENT ON TRIGGER time_entry_rollup_trigger ON public.time_entries IS 'Trigger that calls update_actual_hours() function to maintain actual_hours consistency';


--
-- Name: comments update_comments_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: milestones update_milestones_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: project_integrations update_project_integrations_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_project_integrations_updated_at BEFORE UPDATE ON public.project_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: reports update_reports_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON public.reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: requirements update_requirements_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_requirements_updated_at BEFORE UPDATE ON public.requirements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: risks update_risks_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sprints update_sprints_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_sprints_updated_at BEFORE UPDATE ON public.sprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: stakeholders update_stakeholders_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_stakeholders_updated_at BEFORE UPDATE ON public.stakeholders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: stories update_stories_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON public.stories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subtasks update_subtasks_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON public.subtasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subtasks update_task_progress_from_subtasks_trigger; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_task_progress_from_subtasks_trigger AFTER INSERT OR DELETE OR UPDATE ON public.subtasks FOR EACH ROW EXECUTE FUNCTION public.update_task_progress_from_subtasks();


--
-- Name: tasks update_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: time_entries update_time_entries_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: todos update_todos_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON public.todos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: avnadmin
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_logs activity_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: ai_insights ai_insights_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.ai_insights
    ADD CONSTRAINT ai_insights_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: attachments attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.attachments
    ADD CONSTRAINT attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: backlog_stories backlog_stories_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_stories
    ADD CONSTRAINT backlog_stories_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: backlog_stories backlog_stories_created_from_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_stories
    ADD CONSTRAINT backlog_stories_created_from_sprint_id_fkey FOREIGN KEY (created_from_sprint_id) REFERENCES public.sprints(id) ON DELETE SET NULL;


--
-- Name: backlog_stories backlog_stories_original_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_stories
    ADD CONSTRAINT backlog_stories_original_sprint_id_fkey FOREIGN KEY (original_sprint_id) REFERENCES public.sprints(id) ON DELETE SET NULL;


--
-- Name: backlog_stories backlog_stories_original_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_stories
    ADD CONSTRAINT backlog_stories_original_story_id_fkey FOREIGN KEY (original_story_id) REFERENCES public.stories(id) ON DELETE SET NULL;


--
-- Name: backlog_stories backlog_stories_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_stories
    ADD CONSTRAINT backlog_stories_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: backlog_stories backlog_stories_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_stories
    ADD CONSTRAINT backlog_stories_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: backlog_subtasks backlog_subtasks_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_subtasks
    ADD CONSTRAINT backlog_subtasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: backlog_subtasks backlog_subtasks_backlog_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_subtasks
    ADD CONSTRAINT backlog_subtasks_backlog_task_id_fkey FOREIGN KEY (backlog_task_id) REFERENCES public.backlog_tasks(id) ON DELETE CASCADE;


--
-- Name: backlog_subtasks backlog_subtasks_original_subtask_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_subtasks
    ADD CONSTRAINT backlog_subtasks_original_subtask_id_fkey FOREIGN KEY (original_subtask_id) REFERENCES public.subtasks(id) ON DELETE SET NULL;


--
-- Name: backlog_tasks backlog_tasks_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_tasks
    ADD CONSTRAINT backlog_tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: backlog_tasks backlog_tasks_backlog_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_tasks
    ADD CONSTRAINT backlog_tasks_backlog_story_id_fkey FOREIGN KEY (backlog_story_id) REFERENCES public.backlog_stories(id) ON DELETE CASCADE;


--
-- Name: backlog_tasks backlog_tasks_original_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_tasks
    ADD CONSTRAINT backlog_tasks_original_task_id_fkey FOREIGN KEY (original_task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;


--
-- Name: backlog_tasks backlog_tasks_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.backlog_tasks
    ADD CONSTRAINT backlog_tasks_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: boards boards_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: epics epics_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.epics
    ADD CONSTRAINT epics_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: epics epics_owner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.epics
    ADD CONSTRAINT epics_owner_fkey FOREIGN KEY (owner) REFERENCES public.users(id);


--
-- Name: epics epics_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.epics
    ADD CONSTRAINT epics_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: subtasks fk_subtasks_issue_id; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT fk_subtasks_issue_id FOREIGN KEY (issue_id) REFERENCES public.issues(id) ON DELETE CASCADE;


--
-- Name: issues issues_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: issues issues_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: issues issues_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: milestones milestones_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.milestones
    ADD CONSTRAINT milestones_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: pending_registrations pending_registrations_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.pending_registrations
    ADD CONSTRAINT pending_registrations_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: pending_registrations pending_registrations_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.pending_registrations
    ADD CONSTRAINT pending_registrations_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domains(id);


--
-- Name: project_integrations project_integrations_integration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.project_integrations
    ADD CONSTRAINT project_integrations_integration_id_fkey FOREIGN KEY (integration_id) REFERENCES public.available_integrations(id) ON DELETE CASCADE;


--
-- Name: project_integrations project_integrations_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.project_integrations
    ADD CONSTRAINT project_integrations_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_team_members project_team_members_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.project_team_members
    ADD CONSTRAINT project_team_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_team_members project_team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.project_team_members
    ADD CONSTRAINT project_team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: projects projects_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: quality_gates quality_gates_release_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.quality_gates
    ADD CONSTRAINT quality_gates_release_id_fkey FOREIGN KEY (release_id) REFERENCES public.releases(id) ON DELETE CASCADE;


--
-- Name: releases releases_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: releases releases_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.releases
    ADD CONSTRAINT releases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: reports reports_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: reports reports_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: requirements requirements_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.requirements
    ADD CONSTRAINT requirements_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: risks risks_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT risks_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: risks risks_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.risks
    ADD CONSTRAINT risks_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: sprints sprints_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.sprints
    ADD CONSTRAINT sprints_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: stakeholders stakeholders_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.stakeholders
    ADD CONSTRAINT stakeholders_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: stories stories_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: stories stories_epic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_epic_id_fkey FOREIGN KEY (epic_id) REFERENCES public.epics(id) ON DELETE SET NULL;


--
-- Name: stories stories_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: stories stories_release_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_release_id_fkey FOREIGN KEY (release_id) REFERENCES public.releases(id) ON DELETE SET NULL;


--
-- Name: stories stories_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: stories stories_sprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.stories
    ADD CONSTRAINT stories_sprint_id_fkey FOREIGN KEY (sprint_id) REFERENCES public.sprints(id) ON DELETE SET NULL;


--
-- Name: subtasks subtasks_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: subtasks subtasks_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.subtasks
    ADD CONSTRAINT subtasks_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assignee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assignee_id_fkey FOREIGN KEY (assignee_id) REFERENCES public.users(id);


--
-- Name: tasks tasks_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id);


--
-- Name: tasks tasks_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE CASCADE;


--
-- Name: time_entries time_entries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: time_entries time_entries_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_story_id_fkey FOREIGN KEY (story_id) REFERENCES public.stories(id) ON DELETE SET NULL;


--
-- Name: time_entries time_entries_subtask_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_subtask_id_fkey FOREIGN KEY (subtask_id) REFERENCES public.subtasks(id) ON DELETE SET NULL;


--
-- Name: time_entries time_entries_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;


--
-- Name: time_entries time_entries_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.time_entries
    ADD CONSTRAINT time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: todos todos_related_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_related_project_id_fkey FOREIGN KEY (related_project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: todos todos_related_story_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_related_story_id_fkey FOREIGN KEY (related_story_id) REFERENCES public.stories(id) ON DELETE SET NULL;


--
-- Name: todos todos_related_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_related_task_id_fkey FOREIGN KEY (related_task_id) REFERENCES public.tasks(id) ON DELETE SET NULL;


--
-- Name: todos todos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.todos
    ADD CONSTRAINT todos_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: users users_domain_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_domain_id_fkey FOREIGN KEY (domain_id) REFERENCES public.domains(id);


--
-- Name: workflow_lanes workflow_lanes_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.workflow_lanes
    ADD CONSTRAINT workflow_lanes_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;


--
-- Name: workflow_lanes workflow_lanes_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: avnadmin
--

ALTER TABLE ONLY public.workflow_lanes
    ADD CONSTRAINT workflow_lanes_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict jb5TvlOpKHpTmy2VQyrWjfkDucB3jbLGCaX22Z58S0832bQXa0AwUBGJbyeEdS2

