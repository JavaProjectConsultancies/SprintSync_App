# SprintSync Database - Enhanced Diagram with References & Data Flow

## 🔄 Data Flow Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          SPRINTSYNC DATA FLOW ARCHITECTURE                      │
└─────────────────────────────────────────────────────────────────────────────────┘

                    ┌─── ORGANIZATIONAL STRUCTURE ───┐
                    │                                │
            ┌─────────────┐              ┌─────────────┐
            │departments  │              │   domains   │
            │             │              │             │
            │• VNIT       │              │• Angular    │
            │• Dinshaw    │              │• Java       │
            │• Hospy      │              │• Maui       │
            │• Pharma     │              │• Testing    │
            └─────────────┘              └─────────────┘
                    │                              │
                    └──────────┬───────────────────┘
                               │
                    ┌─────────────────────────┐
                    │         users           │
                    │                         │
                    │ Authentication & RBAC   │
                    │ • admin                 │
                    │ • manager               │
                    │ • developer             │
                    │ • designer              │
                    └─────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────────┐
                    │       projects          │
                    │                         │
                    │ Central Hub for:        │
                    │ • Team Management       │
                    │ • Resource Allocation   │
                    │ • Progress Tracking     │
                    │ • Financial Control     │
                    └─────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   sprints   │    │   milestones    │    │project_team_    │
│             │    │                 │    │members          │
│Agile Cycles │    │Key Deliverables │    │                 │
│• Planning   │    │• MVP Release    │    │Team Assignment  │
│• Active     │    │• Beta Launch    │    │• Roles          │
│• Completed  │    │• Go-Live        │    │• Allocation %   │
└─────────────┘    └─────────────────┘    │• Team Leads     │
        │                                 └─────────────────┘
        │
        ▼
┌─────────────────────────┐
│        stories          │
│                         │
│ Work Items & Features   │
│ • Backlog Management    │
│ • Sprint Assignment     │
│ • Story Points          │
│ • Acceptance Criteria   │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│         tasks           │
│                         │
│ Implementation Units    │
│ • Development Work      │
│ • Time Estimation       │
│ • Status Tracking       │
└─────────────────────────┘
        │
        ▼
┌─────────────────────────┐
│       subtasks          │
│                         │
│ Granular Work Items     │
│ • Detailed Breakdown    │
│ • Individual Actions    │
│ • Completion Tracking   │
└─────────────────────────┘
```

---

## 📊 Detailed Table Relationships & Foreign Keys

### **1. Core Entity Relationships**

```sql
-- ORGANIZATIONAL HIERARCHY
departments (id) ←──── users (department_id)
domains (id) ←──── users (domain_id)

-- PROJECT OWNERSHIP & MANAGEMENT
users (id) ←──── projects (manager_id)
departments (id) ←──── projects (department_id)

-- TEAM ASSIGNMENTS (Many-to-Many)
projects (id) ←──── project_team_members (project_id)
users (id) ←──── project_team_members (user_id)
UNIQUE CONSTRAINT: (project_id, user_id) -- One assignment per user per project

-- AGILE HIERARCHY (One-to-Many Chain)
projects (id) ←──── sprints (project_id) [CASCADE DELETE]
projects (id) ←──── stories (project_id) [CASCADE DELETE]
sprints (id) ←──── stories (sprint_id) [SET NULL] -- Stories can exist without sprints
stories (id) ←──── tasks (story_id) [CASCADE DELETE]
tasks (id) ←──── subtasks (task_id) [CASCADE DELETE]

-- WORK ASSIGNMENTS
users (id) ←──── stories (assignee_id)
users (id) ←──── stories (reporter_id)
users (id) ←──── tasks (assignee_id)
users (id) ←──── tasks (reporter_id)
users (id) ←──── subtasks (assignee_id)
```

### **2. Supporting Entity Relationships**

```sql
-- PROJECT TRACKING
projects (id) ←──── milestones (project_id) [CASCADE DELETE]
projects (id) ←──── requirements (project_id) [CASCADE DELETE]
projects (id) ←──── risks (project_id) [CASCADE DELETE]
projects (id) ←──── stakeholders (project_id) [CASCADE DELETE]
users (id) ←──── risks (owner_id)

-- TIME TRACKING (Multi-level linking)
users (id) ←──── time_entries (user_id) [CASCADE DELETE]
projects (id) ←──── time_entries (project_id) [CASCADE DELETE]
stories (id) ←──── time_entries (story_id) [SET NULL]
tasks (id) ←──── time_entries (task_id) [SET NULL]
subtasks (id) ←──── time_entries (subtask_id) [SET NULL]

-- ANALYTICS & INSIGHTS
projects (id) ←──── ai_insights (project_id) [CASCADE DELETE]
projects (id) ←──── reports (project_id) [CASCADE DELETE]
users (id) ←──── reports (created_by)

-- NOTIFICATIONS
users (id) ←──── notifications (user_id) [CASCADE DELETE]
-- Polymorphic relationship via entity_type + entity_id

-- COLLABORATION (Polymorphic)
users (id) ←──── comments (user_id) [CASCADE DELETE]
comments (id) ←──── comments (parent_comment_id) [CASCADE DELETE] -- Threading
users (id) ←──── attachments (uploaded_by)
-- Both use entity_type + entity_id for polymorphic linking

-- PERSONAL MANAGEMENT
users (id) ←──── todos (user_id) [CASCADE DELETE]
projects (id) ←──── todos (related_project_id) [SET NULL]
stories (id) ←──── todos (related_story_id) [SET NULL]
tasks (id) ←──── todos (related_task_id) [SET NULL]

-- INTEGRATIONS
available_integrations (id) ←──── project_integrations (integration_id) [CASCADE DELETE]
projects (id) ←──── project_integrations (project_id) [CASCADE DELETE]
UNIQUE CONSTRAINT: (project_id, integration_id)

-- AUDIT TRAIL
users (id) ←──── activity_logs (user_id)
-- Polymorphic relationship via entity_type + entity_id
```

---

## 🔄 Data Flow Patterns

### **1. User Registration & Authentication Flow**

```
1. User Registration
   ┌─────────────────┐
   │ 1. Create User  │ → INSERT INTO users (email, password_hash, name, role)
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ 2. Assign Dept  │ → UPDATE users SET department_id = ?
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ 3. Assign Domain│ → UPDATE users SET domain_id = ?
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ 4. Set Skills   │ → UPDATE users SET skills = '["Angular", "TypeScript"]'
   └─────────────────┘

2. Login Authentication
   SELECT id, email, password_hash, role, is_active 
   FROM users 
   WHERE email = ? AND is_active = true
```

### **2. Project Creation & Team Assignment Flow**

```
1. Project Creation (Manager/Admin)
   ┌─────────────────┐
   │ 1. Create Proj  │ → INSERT INTO projects (name, manager_id, department_id, ...)
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ 2. Add Manager  │ → INSERT INTO project_team_members 
   │    to Team      │    (project_id, user_id, role='Manager', is_team_lead=true)
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ 3. Assign Team  │ → INSERT INTO project_team_members 
   │    Members      │    (project_id, user_id, role, allocation_percentage)
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ 4. Set Initial  │ → INSERT INTO milestones, requirements, etc.
   │    Milestones   │
   └─────────────────┘

2. Team Member Query (Role-based Access)
   -- For Managers: See managed projects
   SELECT p.* FROM projects p WHERE p.manager_id = ? AND p.is_active = true;
   
   -- For Developers: See assigned projects
   SELECT DISTINCT p.* FROM projects p 
   JOIN project_team_members ptm ON p.id = ptm.project_id 
   WHERE ptm.user_id = ? AND ptm.left_at IS NULL AND p.is_active = true;
```

### **3. Agile Development Flow**

```
1. Sprint Planning
   ┌─────────────────┐
   │ 1. Create Sprint│ → INSERT INTO sprints (project_id, name, start_date, end_date)
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ 2. Move Stories │ → UPDATE stories SET sprint_id = ? WHERE id IN (...)
   │    from Backlog │
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ 3. Estimate     │ → UPDATE stories SET story_points = ?, estimated_hours = ?
   │    Story Points │
   └─────────────────┘

2. Story Development Lifecycle
   stories.status: 'backlog' → 'to_do' → 'in_progress' → 'qa_review' → 'done'
   
   -- Auto-update project progress when story status changes (TRIGGER)
   UPDATE projects 
   SET progress_percentage = (
       SELECT ROUND(COUNT(*) FILTER (WHERE status = 'done') * 100.0 / COUNT(*))
       FROM stories WHERE project_id = NEW.project_id
   ) WHERE id = NEW.project_id;

3. Task Breakdown
   ┌─────────────────┐
   │ 1. Create Tasks │ → INSERT INTO tasks (story_id, title, assignee_id, ...)
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ 2. Break into   │ → INSERT INTO subtasks (task_id, title, assignee_id, ...)
   │    Subtasks     │
   └─────────────────┘
```

### **4. Time Tracking Flow**

```
1. Time Entry (Multi-level)
   ┌─────────────────┐
   │ Developer logs  │ → INSERT INTO time_entries (
   │ time on task    │    user_id, project_id, task_id, 
   └─────────────────┘    hours_worked, work_date, entry_type)
           │
           ▼
   ┌─────────────────┐
   │ Update actual   │ → UPDATE tasks SET actual_hours = 
   │ hours on task   │    (SELECT SUM(hours_worked) FROM time_entries WHERE task_id = ?)
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ Roll up to      │ → UPDATE stories SET actual_hours = 
   │ story level     │    (SELECT SUM(actual_hours) FROM tasks WHERE story_id = ?)
   └─────────────────┘

2. Productivity Analytics
   -- User workload analysis
   SELECT u.name, COUNT(DISTINCT ptm.project_id) as active_projects,
          SUM(te.hours_worked) as total_hours_this_month
   FROM users u
   LEFT JOIN project_team_members ptm ON u.id = ptm.user_id AND ptm.left_at IS NULL
   LEFT JOIN time_entries te ON u.id = te.user_id 
       AND te.work_date >= DATE_TRUNC('month', CURRENT_DATE)
   GROUP BY u.id, u.name;
```

### **5. Collaboration & Communication Flow**

```
1. Notification System
   ┌─────────────────┐
   │ Event Trigger   │ → Story assigned, Task completed, Deadline approaching
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ Create          │ → INSERT INTO notifications (
   │ Notification    │    user_id, type, title, message, 
   └─────────────────┘    related_entity_type, related_entity_id)
           │
           ▼
   ┌─────────────────┐
   │ User receives   │ → SELECT * FROM notifications 
   │ notification    │    WHERE user_id = ? AND is_read = false
   └─────────────────┘

2. Comments & Collaboration
   ┌─────────────────┐
   │ User comments   │ → INSERT INTO comments (
   │ on story/task   │    user_id, entity_type='story', entity_id, content)
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ Mention another │ → INSERT INTO notifications (
   │ team member     │    user_id=mentioned_user, type='mention', ...)
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ Reply to        │ → INSERT INTO comments (
   │ comment         │    parent_comment_id, ...)
   └─────────────────┘

3. File Attachments
   ┌─────────────────┐
   │ Upload file     │ → INSERT INTO attachments (
   │ to story/task   │    uploaded_by, entity_type, entity_id, 
   └─────────────────┘    file_name, file_url, file_size)
```

### **6. AI Insights & Analytics Flow**

```
1. AI Insight Generation
   ┌─────────────────┐
   │ Analyze project │ → Collect data: velocity, burndown, team productivity
   │ metrics         │
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ Generate AI     │ → INSERT INTO ai_insights (
   │ recommendations │    project_id, type='productivity', 
   └─────────────────┘    metrics='{"velocity": 28.5}', recommendations, confidence_score)
           │
           ▼
   ┌─────────────────┐
   │ Notify project  │ → INSERT INTO notifications (
   │ manager         │    user_id=manager_id, type='ai_insight', ...)
   └─────────────────┘

2. Report Generation
   ┌─────────────────┐
   │ Schedule report │ → SELECT * FROM reports 
   │ generation      │    WHERE next_generation <= NOW()
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ Collect data    │ → Complex queries across multiple tables
   │ from multiple   │    (stories, tasks, time_entries, etc.)
   └─────────────────┘
           │
           ▼
   ┌─────────────────┐
   │ Store report    │ → UPDATE reports SET data = ?, last_generated = NOW()
   │ data            │
   └─────────────────┘
```

### **7. Audit Trail & Activity Logging**

```
1. Automatic Activity Logging (TRIGGERS)
   ┌─────────────────┐
   │ User creates/   │ → TRIGGER: INSERT INTO activity_logs (
   │ updates entity  │    user_id, entity_type, entity_id, action,
   └─────────────────┘    old_values, new_values, description)
           │
           ▼
   ┌─────────────────┐
   │ Store change    │ → JSON diff of old vs new values
   │ history         │
   └─────────────────┘

2. Activity Timeline Query
   SELECT al.*, u.name as user_name 
   FROM activity_logs al
   JOIN users u ON al.user_id = u.id
   WHERE al.entity_type = 'project' AND al.entity_id = ?
   ORDER BY al.created_at DESC;
```

---

## 🔐 Security & Access Control Flow

### **Row Level Security (RLS) Implementation**

```sql
-- Users can only see their own data and admins see all
CREATE POLICY user_policy ON users
    FOR ALL USING (
        id = current_setting('app.current_user_id')::uuid OR 
        EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::uuid AND role = 'admin')
    );

-- Project access based on team membership or role
CREATE POLICY project_access_policy ON projects
    FOR ALL USING (
        -- Admins see all
        EXISTS (SELECT 1 FROM users WHERE id = current_setting('app.current_user_id')::uuid AND role = 'admin') OR
        -- Managers see their projects
        manager_id = current_setting('app.current_user_id')::uuid OR
        -- Team members see assigned projects
        EXISTS (SELECT 1 FROM project_team_members 
                WHERE project_id = id AND user_id = current_setting('app.current_user_id')::uuid 
                AND left_at IS NULL)
    );
```

### **Role-Based Data Access Patterns**

```sql
-- Admin: Full access to all data
SELECT * FROM projects WHERE is_active = true;

-- Manager: Projects they manage + projects they're assigned to
SELECT DISTINCT p.* FROM projects p
LEFT JOIN project_team_members ptm ON p.id = ptm.project_id
WHERE (p.manager_id = ? OR (ptm.user_id = ? AND ptm.left_at IS NULL))
AND p.is_active = true;

-- Developer/Designer: Only assigned projects
SELECT DISTINCT p.* FROM projects p
JOIN project_team_members ptm ON p.id = ptm.project_id
WHERE ptm.user_id = ? AND ptm.left_at IS NULL AND p.is_active = true;
```

---

## ⚡ Performance Optimization Patterns

### **Critical Query Patterns & Indexes**

```sql
-- 1. Project Dashboard (Most Common Query)
SELECT p.*, u.name as manager_name, COUNT(ptm.user_id) as team_size
FROM projects p
LEFT JOIN users u ON p.manager_id = u.id
LEFT JOIN project_team_members ptm ON p.id = ptm.project_id AND ptm.left_at IS NULL
WHERE p.is_active = true
GROUP BY p.id, u.name;

-- Indexes: idx_projects_active, idx_projects_manager, idx_project_team_project

-- 2. Sprint Burndown (Performance Critical)
SELECT work_date, SUM(hours_worked) as daily_hours
FROM time_entries te
JOIN stories s ON te.story_id = s.id
WHERE s.sprint_id = ?
GROUP BY work_date
ORDER BY work_date;

-- Indexes: idx_time_entries_date, idx_stories_sprint

-- 3. User Workload Analysis
SELECT u.name, COUNT(DISTINCT ptm.project_id) as active_projects,
       SUM(te.hours_worked) as total_hours
FROM users u
LEFT JOIN project_team_members ptm ON u.id = ptm.user_id AND ptm.left_at IS NULL
LEFT JOIN time_entries te ON u.id = te.user_id AND te.work_date >= ?
WHERE u.is_active = true
GROUP BY u.id, u.name;

-- Indexes: idx_users_active, idx_project_team_user, idx_time_entries_user, idx_time_entries_date
```

This enhanced diagram provides a complete view of how data flows through your SprintSync application, including all foreign key relationships, cascade behaviors, and real-world usage patterns! 🎯
