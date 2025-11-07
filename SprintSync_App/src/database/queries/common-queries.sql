-- SprintSync Common Database Queries
-- Frequently used queries for the application

-- =============================================
-- USER AND AUTHENTICATION QUERIES
-- =============================================

-- Get user by email for authentication
SELECT 
    id, email, password_hash, name, role, 
    department_id, domain_id, avatar_url, 
    experience, hourly_rate, availability_percentage, 
    skills, is_active, last_login
FROM users 
WHERE email = $1 AND is_active = true;

-- Get user with department and domain details
SELECT 
    u.*, 
    d.name as department_name,
    dom.name as domain_name
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN domains dom ON u.domain_id = dom.id
WHERE u.id = $1;

-- Get all active users with their assignments
SELECT 
    u.id, u.name, u.email, u.role, u.experience,
    d.name as department_name,
    dom.name as domain_name,
    COUNT(DISTINCT ptm.project_id) as active_projects,
    ARRAY_AGG(DISTINCT 'proj-' || ptm.project_id) FILTER (WHERE ptm.project_id IS NOT NULL) as assigned_projects
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN domains dom ON u.domain_id = dom.id
LEFT JOIN project_team_members ptm ON u.id = ptm.user_id AND ptm.left_at IS NULL
WHERE u.is_active = true
GROUP BY u.id, u.name, u.email, u.role, u.experience, d.name, dom.name
ORDER BY u.name;

-- =============================================
-- PROJECT QUERIES
-- =============================================

-- Get all projects with manager and team info
SELECT 
    p.*,
    u.name as manager_name,
    d.name as department_name,
    COUNT(DISTINCT ptm.user_id) as team_size,
    COUNT(DISTINCT s.id) as total_sprints,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') as completed_sprints
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN project_team_members ptm ON p.id = ptm.project_id AND ptm.left_at IS NULL
LEFT JOIN sprints s ON p.id = s.project_id
WHERE p.is_active = true
GROUP BY p.id, u.name, d.name
ORDER BY p.created_at DESC;

-- Get projects for a specific user (role-based)
-- For managers: projects they manage
SELECT p.* FROM projects p WHERE p.manager_id = $1 AND p.is_active = true;

-- For developers/designers: projects they're assigned to
SELECT DISTINCT p.*
FROM projects p
JOIN project_team_members ptm ON p.id = ptm.project_id
WHERE ptm.user_id = $1 AND ptm.left_at IS NULL AND p.is_active = true;

-- Get project details with team members
SELECT 
    p.*,
    u.name as manager_name,
    d.name as department_name,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'user_id', ptm.user_id,
            'name', tu.name,
            'role', ptm.role,
            'email', tu.email,
            'avatar_url', tu.avatar_url,
            'allocation_percentage', ptm.allocation_percentage,
            'is_team_lead', ptm.is_team_lead
        )
    ) FILTER (WHERE ptm.user_id IS NOT NULL) as team_members
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN departments d ON p.department_id = d.id
LEFT JOIN project_team_members ptm ON p.id = ptm.project_id AND ptm.left_at IS NULL
LEFT JOIN users tu ON ptm.user_id = tu.id
WHERE p.id = $1
GROUP BY p.id, u.name, d.name;

-- =============================================
-- SPRINT AND AGILE QUERIES
-- =============================================

-- Get active sprint for a project
SELECT * FROM sprints 
WHERE project_id = $1 AND status = 'active' 
ORDER BY start_date DESC LIMIT 1;

-- Get sprint with stories and tasks
SELECT 
    s.*,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', st.id,
            'title', st.title,
            'status', st.status,
            'story_points', st.story_points,
            'assignee_name', au.name,
            'tasks_count', task_counts.task_count,
            'completed_tasks', task_counts.completed_tasks
        )
    ) FILTER (WHERE st.id IS NOT NULL) as stories
FROM sprints s
LEFT JOIN stories st ON s.id = st.sprint_id
LEFT JOIN users au ON st.assignee_id = au.id
LEFT JOIN (
    SELECT 
        story_id,
        COUNT(*) as task_count,
        COUNT(*) FILTER (WHERE status = 'done') as completed_tasks
    FROM tasks
    GROUP BY story_id
) task_counts ON st.id = task_counts.story_id
WHERE s.id = $1
GROUP BY s.id;

-- Get burndown data for sprint
SELECT 
    work_date,
    SUM(hours_worked) as daily_hours,
    COUNT(DISTINCT te.story_id) as stories_worked_on
FROM time_entries te
JOIN stories s ON te.story_id = s.id
WHERE s.sprint_id = $1
GROUP BY work_date
ORDER BY work_date;

-- =============================================
-- STORY AND TASK QUERIES
-- =============================================

-- Get stories for project kanban board
SELECT 
    s.*,
    u.name as assignee_name,
    u.avatar_url as assignee_avatar,
    ru.name as reporter_name,
    COUNT(t.id) as task_count,
    COUNT(t.id) FILTER (WHERE t.status = 'done') as completed_tasks
FROM stories s
LEFT JOIN users u ON s.assignee_id = u.id
LEFT JOIN users ru ON s.reporter_id = ru.id
LEFT JOIN tasks t ON s.id = t.story_id
WHERE s.project_id = $1
GROUP BY s.id, u.name, u.avatar_url, ru.name
ORDER BY s.order_index, s.created_at;

-- Get tasks for a story
SELECT 
    t.*,
    u.name as assignee_name,
    u.avatar_url as assignee_avatar,
    COUNT(st.id) as subtask_count,
    COUNT(st.id) FILTER (WHERE st.is_completed = true) as completed_subtasks
FROM tasks t
LEFT JOIN users u ON t.assignee_id = u.id
LEFT JOIN subtasks st ON t.id = st.task_id
WHERE t.story_id = $1
GROUP BY t.id, u.name, u.avatar_url
ORDER BY t.order_index, t.created_at;

-- Get task details with subtasks
SELECT 
    t.*,
    u.name as assignee_name,
    ru.name as reporter_name,
    JSON_AGG(
        JSON_BUILD_OBJECT(
            'id', st.id,
            'title', st.title,
            'is_completed', st.is_completed,
            'assignee_name', stu.name,
            'estimated_hours', st.estimated_hours,
            'actual_hours', st.actual_hours
        )
    ) FILTER (WHERE st.id IS NOT NULL) as subtasks
FROM tasks t
LEFT JOIN users u ON t.assignee_id = u.id
LEFT JOIN users ru ON t.reporter_id = ru.id
LEFT JOIN subtasks st ON t.id = st.task_id
LEFT JOIN users stu ON st.assignee_id = stu.id
WHERE t.id = $1
GROUP BY t.id, u.name, ru.name;

-- =============================================
-- TIME TRACKING QUERIES
-- =============================================

-- Get time entries for user (with pagination)
SELECT 
    te.*,
    p.name as project_name,
    s.title as story_title,
    t.title as task_title
FROM time_entries te
LEFT JOIN projects p ON te.project_id = p.id
LEFT JOIN stories s ON te.story_id = s.id
LEFT JOIN tasks t ON te.task_id = t.id
WHERE te.user_id = $1
ORDER BY te.work_date DESC, te.created_at DESC
LIMIT $2 OFFSET $3;

-- Get daily time summary for user
SELECT 
    work_date,
    SUM(hours_worked) as total_hours,
    COUNT(DISTINCT project_id) as projects_worked,
    ARRAY_AGG(DISTINCT entry_type) as entry_types
FROM time_entries 
WHERE user_id = $1 
    AND work_date >= $2 
    AND work_date <= $3
GROUP BY work_date
ORDER BY work_date DESC;

-- Get project time breakdown
SELECT 
    p.name as project_name,
    u.name as user_name,
    te.entry_type,
    SUM(te.hours_worked) as total_hours,
    COUNT(*) as entry_count
FROM time_entries te
JOIN projects p ON te.project_id = p.id
JOIN users u ON te.user_id = u.id
WHERE te.work_date >= $1 AND te.work_date <= $2
GROUP BY p.name, u.name, te.entry_type
ORDER BY p.name, u.name, te.entry_type;

-- =============================================
-- TEAM AND RESOURCE QUERIES
-- =============================================

-- Get team allocation summary
SELECT 
    u.id,
    u.name,
    u.role,
    u.experience,
    u.availability_percentage,
    d.name as department_name,
    dom.name as domain_name,
    COALESCE(SUM(ptm.allocation_percentage), 0) as total_allocation,
    COUNT(ptm.project_id) as active_projects,
    ARRAY_AGG(
        JSON_BUILD_OBJECT(
            'project_id', p.id,
            'project_name', p.name,
            'allocation', ptm.allocation_percentage,
            'role', ptm.role
        )
    ) FILTER (WHERE ptm.project_id IS NOT NULL) as project_assignments
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN domains dom ON u.domain_id = dom.id
LEFT JOIN project_team_members ptm ON u.id = ptm.user_id AND ptm.left_at IS NULL
LEFT JOIN projects p ON ptm.project_id = p.id AND p.is_active = true
WHERE u.is_active = true
GROUP BY u.id, u.name, u.role, u.experience, u.availability_percentage, d.name, dom.name
ORDER BY u.name;

-- Get available team members for project assignment
SELECT 
    u.id,
    u.name,
    u.role,
    u.experience,
    u.availability_percentage,
    d.name as department_name,
    dom.name as domain_name,
    COALESCE(current_allocation.total_allocation, 0) as current_allocation
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN domains dom ON u.domain_id = dom.id
LEFT JOIN (
    SELECT 
        user_id,
        SUM(allocation_percentage) as total_allocation
    FROM project_team_members ptm
    JOIN projects p ON ptm.project_id = p.id
    WHERE ptm.left_at IS NULL AND p.is_active = true
    GROUP BY user_id
) current_allocation ON u.id = current_allocation.user_id
WHERE u.is_active = true 
    AND u.role IN ('developer', 'qa')
    AND COALESCE(current_allocation.total_allocation, 0) < 100
ORDER BY current_allocation.total_allocation ASC, u.name;

-- =============================================
-- NOTIFICATION QUERIES
-- =============================================

-- Get unread notifications for user
SELECT 
    n.*,
    CASE 
        WHEN n.related_entity_type = 'project' THEN p.name
        WHEN n.related_entity_type = 'story' THEN s.title
        WHEN n.related_entity_type = 'task' THEN t.title
        ELSE NULL
    END as related_entity_name
FROM notifications n
LEFT JOIN projects p ON n.related_entity_type = 'project' AND n.related_entity_id = p.id
LEFT JOIN stories s ON n.related_entity_type = 'story' AND n.related_entity_id = s.id
LEFT JOIN tasks t ON n.related_entity_type = 'task' AND n.related_entity_id = t.id
WHERE n.user_id = $1 
    AND n.is_read = false 
    AND n.is_archived = false
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
ORDER BY n.priority DESC, n.created_at DESC
LIMIT $2;

-- Mark notifications as read
UPDATE notifications 
SET is_read = true, updated_at = NOW()
WHERE user_id = $1 AND id = ANY($2);

-- =============================================
-- AI INSIGHTS QUERIES
-- =============================================

-- Get active AI insights for project
SELECT * FROM ai_insights 
WHERE project_id = $1 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY confidence_score DESC, generated_at DESC;

-- Get AI insights by type
SELECT * FROM ai_insights 
WHERE type = $1 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
ORDER BY confidence_score DESC, generated_at DESC
LIMIT $2;

-- =============================================
-- REPORTING QUERIES
-- =============================================

-- Project velocity report
WITH sprint_velocities AS (
    SELECT 
        s.project_id,
        s.id as sprint_id,
        s.name as sprint_name,
        s.start_date,
        s.end_date,
        s.velocity_points,
        COALESCE(SUM(st.story_points) FILTER (WHERE st.status = 'done'), 0) as completed_points
    FROM sprints s
    LEFT JOIN stories st ON s.id = st.sprint_id
    WHERE s.project_id = $1 AND s.status = 'completed'
    GROUP BY s.id
    ORDER BY s.start_date
)
SELECT 
    *,
    AVG(completed_points) OVER (ORDER BY start_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as rolling_avg_velocity
FROM sprint_velocities;

-- Team productivity report
SELECT 
    u.name,
    u.role,
    COUNT(DISTINCT te.project_id) as projects_worked,
    SUM(te.hours_worked) as total_hours,
    AVG(te.hours_worked) as avg_daily_hours,
    COUNT(DISTINCT te.work_date) as days_worked,
    SUM(te.hours_worked) FILTER (WHERE te.entry_type = 'development') as development_hours,
    SUM(te.hours_worked) FILTER (WHERE te.entry_type = 'meeting') as meeting_hours
FROM users u
JOIN time_entries te ON u.id = te.user_id
WHERE te.work_date >= $1 AND te.work_date <= $2
GROUP BY u.id, u.name, u.role
ORDER BY total_hours DESC;

-- Project health dashboard
SELECT 
    p.id,
    p.name,
    p.status,
    p.priority,
    p.progress_percentage,
    p.budget,
    p.spent,
    ROUND((p.spent / NULLIF(p.budget, 0)) * 100, 2) as budget_utilization,
    COUNT(DISTINCT ptm.user_id) as team_size,
    COUNT(DISTINCT s.id) as total_sprints,
    COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'completed') as completed_sprints,
    COUNT(DISTINCT st.id) as total_stories,
    COUNT(DISTINCT st.id) FILTER (WHERE st.status = 'done') as completed_stories,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'identified') as open_risks,
    CASE 
        WHEN p.end_date < CURRENT_DATE AND p.status != 'completed' THEN 'overdue'
        WHEN p.end_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'on_track'
    END as timeline_status
FROM projects p
LEFT JOIN project_team_members ptm ON p.id = ptm.project_id AND ptm.left_at IS NULL
LEFT JOIN sprints s ON p.id = s.project_id
LEFT JOIN stories st ON p.id = st.project_id
LEFT JOIN risks r ON p.id = r.project_id
WHERE p.is_active = true
GROUP BY p.id;

-- =============================================
-- SEARCH QUERIES
-- =============================================

-- Global search across projects, stories, and tasks
(
    SELECT 'project' as type, id, name as title, description, created_at
    FROM projects 
    WHERE (name ILIKE $1 OR description ILIKE $1) AND is_active = true
)
UNION ALL
(
    SELECT 'story' as type, id, title, description, created_at
    FROM stories 
    WHERE title ILIKE $1 OR description ILIKE $1
)
UNION ALL
(
    SELECT 'task' as type, id, title, description, created_at
    FROM tasks 
    WHERE title ILIKE $1 OR description ILIKE $1
)
ORDER BY created_at DESC
LIMIT $2;

-- =============================================
-- MAINTENANCE QUERIES
-- =============================================

-- Clean up old notifications
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '30 days' 
    AND is_read = true 
    AND is_archived = true;

-- Archive old activity logs
UPDATE activity_logs 
SET description = description || ' [ARCHIVED]'
WHERE created_at < NOW() - INTERVAL '1 year';

-- Update project progress based on stories
UPDATE projects 
SET progress_percentage = (
    SELECT CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND(COUNT(*) FILTER (WHERE status = 'done') * 100.0 / COUNT(*))
    END
    FROM stories 
    WHERE project_id = projects.id
)
WHERE is_active = true;