# SprintSync Database - Complete Table Structure Reference

## 📋 Table Summary
| Category | Tables | Purpose |
|----------|--------|---------|
| **Core User Management** | departments, domains, users | User organization and authentication |
| **Project Management** | projects, project_team_members | Project lifecycle and team assignments |
| **Agile Development** | sprints, stories, tasks, subtasks | Scrum/Kanban workflow management |
| **Project Tracking** | milestones, requirements, risks, stakeholders | Project governance and tracking |
| **Time & Analytics** | time_entries, ai_insights, reports | Productivity tracking and insights |
| **Collaboration** | comments, attachments, notifications | Team communication and file sharing |
| **System Support** | available_integrations, project_integrations, todos, activity_logs | System features and audit trails |

---

## 🏗️ Detailed Table Structures

### **1. CORE USER MANAGEMENT**

#### **departments**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique department identifier |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Department name (VNIT, Dinshaw, Hospy, Pharma) |
| description | TEXT | | Department description |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Sample Data:**
```sql
VNIT - Technology and Innovation Department
Dinshaw - Financial Services Department  
Hospy - Healthcare Solutions Department
Pharma - Pharmaceutical Research Department
```

#### **domains**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique domain identifier |
| name | VARCHAR(50) | NOT NULL, UNIQUE | Domain/skill area name |
| description | TEXT | | Domain description |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Sample Data:**
```sql
Angular - Frontend Development with Angular Framework
Java - Backend Development with Java Technologies
Maui - Cross-platform Mobile Development
Testing - Quality Assurance and Testing
Implementation - System Implementation and Deployment
Database - Database Design and Management
Marketing - Digital Marketing and Brand Management
HR - Human Resources and Talent Management
```

#### **users**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User email address |
| password_hash | VARCHAR(255) | NOT NULL | Hashed password |
| name | VARCHAR(255) | NOT NULL | Full name |
| role | user_role | NOT NULL | User role (admin, manager, developer, designer) |
| department_id | UUID | REFERENCES departments(id) | Department assignment |
| domain_id | UUID | REFERENCES domains(id) | Primary domain/skill area |
| avatar_url | TEXT | | Profile picture URL |
| experience | experience_level | DEFAULT 'mid' | Experience level (junior, mid, senior, lead) |
| hourly_rate | DECIMAL(10,2) | | Billing rate per hour |
| availability_percentage | INTEGER | DEFAULT 100, CHECK (0-100) | Availability for work assignments |
| skills | JSONB | DEFAULT '[]' | Array of skills/technologies |
| is_active | BOOLEAN | DEFAULT true | Account status |
| last_login | TIMESTAMP WITH TIME ZONE | | Last login timestamp |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last profile update |

**Indexes:**
- `idx_users_email` ON (email)
- `idx_users_role` ON (role)
- `idx_users_department` ON (department_id)
- `idx_users_domain` ON (domain_id)
- `idx_users_active` ON (is_active)

---

### **2. PROJECT MANAGEMENT**

#### **projects**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique project identifier |
| name | VARCHAR(255) | NOT NULL | Project name |
| description | TEXT | | Project description |
| status | project_status | DEFAULT 'planning' | Current status (planning, active, paused, completed, cancelled) |
| priority | project_priority | DEFAULT 'medium' | Priority level (low, medium, high, critical) |
| methodology | project_methodology | DEFAULT 'scrum' | Development methodology (scrum, kanban, waterfall) |
| template | project_template | | Project template type (web-app, mobile-app, api-service, data-analytics) |
| department_id | UUID | REFERENCES departments(id) | Owning department |
| manager_id | UUID | REFERENCES users(id) | Project manager |
| start_date | DATE | | Project start date |
| end_date | DATE | | Project end date |
| budget | DECIMAL(15,2) | | Total project budget |
| spent | DECIMAL(15,2) | DEFAULT 0 | Amount spent so far |
| progress_percentage | INTEGER | DEFAULT 0, CHECK (0-100) | Overall completion percentage |
| scope | TEXT | | Project scope description |
| success_criteria | JSONB | DEFAULT '[]' | Success criteria array |
| objectives | JSONB | DEFAULT '[]' | Project objectives array |
| is_active | BOOLEAN | DEFAULT true | Project status |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Project creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_projects_status` ON (status)
- `idx_projects_manager` ON (manager_id)
- `idx_projects_department` ON (department_id)
- `idx_projects_active` ON (is_active)

#### **project_team_members**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique assignment identifier |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Project reference |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | User reference |
| role | VARCHAR(100) | | Role in project (e.g., "Frontend Developer") |
| is_team_lead | BOOLEAN | DEFAULT false | Team leadership flag |
| allocation_percentage | INTEGER | DEFAULT 100, CHECK (0-100) | Percentage of time allocated to project |
| joined_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Assignment start date |
| left_at | TIMESTAMP WITH TIME ZONE | | Assignment end date (NULL if active) |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |

**Constraints:**
- UNIQUE(project_id, user_id) - One active assignment per user per project

**Indexes:**
- `idx_project_team_project` ON (project_id)
- `idx_project_team_user` ON (user_id)

---

### **3. AGILE DEVELOPMENT**

#### **sprints**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique sprint identifier |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Parent project |
| name | VARCHAR(255) | NOT NULL | Sprint name (e.g., "Sprint 1 - Foundation") |
| goal | TEXT | | Sprint goal description |
| status | sprint_status | DEFAULT 'planning' | Sprint status (planning, active, completed, cancelled) |
| start_date | DATE | | Sprint start date |
| end_date | DATE | | Sprint end date |
| capacity_hours | INTEGER | | Total team capacity in hours |
| velocity_points | INTEGER | DEFAULT 0 | Story points completed |
| is_active | BOOLEAN | DEFAULT true | Sprint status |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Sprint creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_sprints_project` ON (project_id)
- `idx_sprints_status` ON (status)
- `idx_sprints_active` ON (is_active)

#### **stories**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique story identifier |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Parent project |
| sprint_id | UUID | REFERENCES sprints(id) ON DELETE SET NULL | Assigned sprint (optional) |
| title | VARCHAR(255) | NOT NULL | Story title |
| description | TEXT | | Story description |
| acceptance_criteria | JSONB | DEFAULT '[]' | Acceptance criteria array |
| status | story_status | DEFAULT 'backlog' | Story status (backlog, to_do, in_progress, qa_review, done) |
| priority | story_priority | DEFAULT 'medium' | Story priority (low, medium, high, critical) |
| story_points | INTEGER | CHECK (>= 0) | Effort estimation in story points |
| assignee_id | UUID | REFERENCES users(id) | Assigned developer |
| reporter_id | UUID | REFERENCES users(id) | Story reporter |
| epic | VARCHAR(255) | | Epic/feature group name |
| labels | JSONB | DEFAULT '[]' | Story labels/tags |
| order_index | INTEGER | DEFAULT 0 | Display order |
| estimated_hours | DECIMAL(5,2) | | Estimated effort in hours |
| actual_hours | DECIMAL(5,2) | DEFAULT 0 | Actual time spent |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Story creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_stories_project` ON (project_id)
- `idx_stories_sprint` ON (sprint_id)
- `idx_stories_status` ON (status)
- `idx_stories_assignee` ON (assignee_id)

#### **tasks**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique task identifier |
| story_id | UUID | REFERENCES stories(id) ON DELETE CASCADE | Parent story |
| title | VARCHAR(255) | NOT NULL | Task title |
| description | TEXT | | Task description |
| status | task_status | DEFAULT 'to_do' | Task status (to_do, in_progress, qa_review, done) |
| priority | task_priority | DEFAULT 'medium' | Task priority (low, medium, high, critical) |
| assignee_id | UUID | REFERENCES users(id) | Assigned developer |
| reporter_id | UUID | REFERENCES users(id) | Task reporter |
| estimated_hours | DECIMAL(5,2) | | Estimated effort in hours |
| actual_hours | DECIMAL(5,2) | DEFAULT 0 | Actual time spent |
| order_index | INTEGER | DEFAULT 0 | Display order |
| due_date | DATE | | Task due date |
| labels | JSONB | DEFAULT '[]' | Task labels/tags |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Task creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_tasks_story` ON (story_id)
- `idx_tasks_status` ON (status)
- `idx_tasks_assignee` ON (assignee_id)

#### **subtasks (Simplified Design)**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique subtask identifier |
| task_id | UUID | REFERENCES tasks(id) ON DELETE CASCADE | Parent task |
| title | VARCHAR(255) | NOT NULL | Subtask title |
| description | TEXT | | Subtask description |
| is_completed | BOOLEAN | DEFAULT false | **Simple completion tracking** (true/false only) |
| assignee_id | UUID | REFERENCES users(id) | Assigned developer |
| estimated_hours | DECIMAL(5,2) | | Estimated effort in hours |
| actual_hours | DECIMAL(5,2) | DEFAULT 0 | Actual time spent |
| order_index | INTEGER | DEFAULT 0 | Display order |
| due_date | DATE | | Subtask due date |
| bug_type | VARCHAR(50) | | **Bug categorization** (functional, ui, performance, security, integration) |
| severity | VARCHAR(20) | | **Bug severity level** (low, medium, high, critical) |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Subtask creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_subtasks_task` ON (task_id)
- `idx_subtasks_assignee` ON (assignee_id)
- `idx_subtasks_completed` ON (is_completed) - **For completion filtering**
- `idx_subtasks_bug_type` ON (bug_type) - **For bug categorization**
- `idx_subtasks_severity` ON (severity) - **For priority-based queries**

**Automated Triggers:**
- `update_task_progress_from_subtasks_trigger` - Notifies task assignee when all subtasks are completed
- `update_subtasks_updated_at` - Updates timestamp on modifications

**Design Benefits:**
- ✅ **Simpler workflow** - Task status drives main workflow, subtasks are simple checklists
- ✅ **Clear ownership** - Task assignee controls task status, subtask assignees mark completion
- ✅ **No status conflicts** - Single source of truth for workflow status
- ✅ **Better UX** - Kanban shows task status, subtasks show simple checkboxes

---

### **4. PROJECT TRACKING**

#### **milestones**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique milestone identifier |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Parent project |
| title | VARCHAR(255) | NOT NULL | Milestone title |
| description | TEXT | | Milestone description |
| status | milestone_status | DEFAULT 'upcoming' | Status (upcoming, in_progress, completed, delayed) |
| due_date | DATE | | Target completion date |
| completion_date | DATE | | Actual completion date |
| progress_percentage | INTEGER | DEFAULT 0, CHECK (0-100) | Completion percentage |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Milestone creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

#### **requirements**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique requirement identifier |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Parent project |
| title | VARCHAR(255) | NOT NULL | Requirement title |
| description | TEXT | | Requirement description |
| type | requirement_type | | Type (functional, non-functional, technical) |
| status | requirement_status | DEFAULT 'draft' | Status (draft, approved, in-development, completed) |
| priority | project_priority | DEFAULT 'medium' | Priority level |
| module | VARCHAR(100) | | System module/component |
| acceptance_criteria | JSONB | DEFAULT '[]' | Acceptance criteria array |
| effort_points | INTEGER | DEFAULT 0 | Effort estimation |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Requirement creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

#### **risks**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique risk identifier |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Parent project |
| title | VARCHAR(255) | NOT NULL | Risk title |
| description | TEXT | | Risk description |
| probability | risk_probability | DEFAULT 'medium' | Probability (low, medium, high) |
| impact | risk_impact | DEFAULT 'medium' | Impact level (low, medium, high) |
| mitigation | TEXT | | Mitigation strategy |
| status | risk_status | DEFAULT 'identified' | Status (identified, mitigated, closed) |
| owner_id | UUID | REFERENCES users(id) | Risk owner |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Risk creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

#### **stakeholders**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique stakeholder identifier |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Parent project |
| name | VARCHAR(255) | NOT NULL | Stakeholder name |
| role | VARCHAR(100) | | Stakeholder role |
| email | VARCHAR(255) | | Contact email |
| responsibilities | JSONB | DEFAULT '[]' | Responsibilities array |
| avatar_url | TEXT | | Profile picture URL |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Record creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

---

### **5. TIME TRACKING & ANALYTICS**

#### **time_entries**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique time entry identifier |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | User who logged time |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Project reference |
| story_id | UUID | REFERENCES stories(id) ON DELETE SET NULL | Story reference (optional) |
| task_id | UUID | REFERENCES tasks(id) ON DELETE SET NULL | Task reference (optional) |
| subtask_id | UUID | REFERENCES subtasks(id) ON DELETE SET NULL | Subtask reference (optional) |
| description | TEXT | | Work description |
| entry_type | time_entry_type | DEFAULT 'development' | Type (development, testing, design, meeting, research, documentation, review) |
| hours_worked | DECIMAL(5,2) | NOT NULL, CHECK (> 0) | Hours worked |
| work_date | DATE | NOT NULL | Date of work |
| start_time | TIME | | Work start time |
| end_time | TIME | | Work end time |
| is_billable | BOOLEAN | DEFAULT true | Billable hours flag |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Entry creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_time_entries_user` ON (user_id)
- `idx_time_entries_project` ON (project_id)
- `idx_time_entries_date` ON (work_date)

#### **ai_insights**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique insight identifier |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Parent project |
| type | ai_insight_type | | Insight type (productivity, risk_assessment, resource_optimization, timeline_prediction, quality_metrics) |
| title | VARCHAR(255) | NOT NULL | Insight title |
| description | TEXT | | Insight description |
| metrics | JSONB | DEFAULT '{}' | Metrics object |
| recommendations | JSONB | DEFAULT '[]' | Recommendations array |
| confidence_score | DECIMAL(3,2) | CHECK (0.00-1.00) | AI confidence level |
| is_active | BOOLEAN | DEFAULT true | Insight status |
| generated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Generation timestamp |
| expires_at | TIMESTAMP WITH TIME ZONE | | Expiration timestamp |

#### **reports**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique report identifier |
| project_id | UUID | REFERENCES projects(id) ON DELETE CASCADE | Parent project |
| created_by | UUID | REFERENCES users(id) | Report creator |
| name | VARCHAR(255) | NOT NULL | Report name |
| type | report_type | | Report type (sprint_burndown, velocity_chart, team_productivity, project_overview, time_analysis, custom) |
| description | TEXT | | Report description |
| configuration | JSONB | DEFAULT '{}' | Report configuration |
| data | JSONB | DEFAULT '{}' | Report data |
| is_shared | BOOLEAN | DEFAULT false | Sharing flag |
| scheduled_frequency | VARCHAR(20) | | Schedule (daily, weekly, monthly) |
| last_generated | TIMESTAMP WITH TIME ZONE | | Last generation timestamp |
| next_generation | TIMESTAMP WITH TIME ZONE | | Next scheduled generation |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Report creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

---

### **6. COLLABORATION FEATURES**

#### **notifications**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique notification identifier |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Recipient user |
| type | notification_type | DEFAULT 'system' | Type (system, project, task, mention, reminder, ai_insight) |
| priority | notification_priority | DEFAULT 'normal' | Priority (low, normal, high, urgent) |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | | Notification message |
| related_entity_type | VARCHAR(50) | | Related entity type (project, story, task) |
| related_entity_id | UUID | | Related entity ID |
| action_url | TEXT | | Action URL |
| is_read | BOOLEAN | DEFAULT false | Read status |
| is_archived | BOOLEAN | DEFAULT false | Archive status |
| expires_at | TIMESTAMP WITH TIME ZONE | | Expiration timestamp |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Notification creation timestamp |

**Indexes:**
- `idx_notifications_user` ON (user_id)
- `idx_notifications_read` ON (is_read)
- `idx_notifications_type` ON (type)

#### **comments**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique comment identifier |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Comment author |
| entity_type | VARCHAR(50) | NOT NULL | Entity type (project, story, task, subtask) |
| entity_id | UUID | NOT NULL | Entity identifier |
| content | TEXT | NOT NULL | Comment content |
| parent_comment_id | UUID | REFERENCES comments(id) ON DELETE CASCADE | Parent comment (for replies) |
| is_edited | BOOLEAN | DEFAULT false | Edit flag |
| edited_at | TIMESTAMP WITH TIME ZONE | | Edit timestamp |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Comment creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_comments_entity` ON (entity_type, entity_id)
- `idx_comments_user` ON (user_id)

#### **attachments**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique attachment identifier |
| uploaded_by | UUID | REFERENCES users(id) | Uploader user |
| entity_type | VARCHAR(50) | NOT NULL | Entity type (project, story, task, comment) |
| entity_id | UUID | NOT NULL | Entity identifier |
| file_name | VARCHAR(255) | NOT NULL | Original file name |
| file_size | BIGINT | | File size in bytes |
| file_type | VARCHAR(100) | | MIME type |
| file_url | TEXT | NOT NULL | File storage URL |
| thumbnail_url | TEXT | | Thumbnail URL |
| is_public | BOOLEAN | DEFAULT false | Public access flag |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Upload timestamp |

---

### **7. SYSTEM SUPPORT**

#### **todos**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique todo identifier |
| user_id | UUID | REFERENCES users(id) ON DELETE CASCADE | Todo owner |
| title | VARCHAR(255) | NOT NULL | Todo title |
| description | TEXT | | Todo description |
| priority | todo_priority | DEFAULT 'medium' | Priority (low, medium, high) |
| status | todo_status | DEFAULT 'pending' | Status (pending, in_progress, completed) |
| due_date | DATE | | Due date |
| reminder_date | TIMESTAMP WITH TIME ZONE | | Reminder timestamp |
| tags | JSONB | DEFAULT '[]' | Tags array |
| related_project_id | UUID | REFERENCES projects(id) ON DELETE SET NULL | Related project |
| related_story_id | UUID | REFERENCES stories(id) ON DELETE SET NULL | Related story |
| related_task_id | UUID | REFERENCES tasks(id) ON DELETE SET NULL | Related task |
| order_index | INTEGER | DEFAULT 0 | Display order |
| completed_at | TIMESTAMP WITH TIME ZONE | | Completion timestamp |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Todo creation timestamp |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Last update timestamp |

#### **activity_logs**
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique log identifier |
| user_id | UUID | REFERENCES users(id) | User who performed action |
| entity_type | VARCHAR(50) | NOT NULL | Entity type |
| entity_id | UUID | NOT NULL | Entity identifier |
| action | VARCHAR(100) | NOT NULL | Action performed (created, updated, deleted) |
| old_values | JSONB | | Previous values |
| new_values | JSONB | | New values |
| description | TEXT | | Action description |
| ip_address | INET | | User IP address |
| user_agent | TEXT | | User agent string |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT NOW() | Log timestamp |

**Indexes:**
- `idx_activity_logs_entity` ON (entity_type, entity_id)
- `idx_activity_logs_user` ON (user_id)
- `idx_activity_logs_created` ON (created_at)

#### **available_integrations & project_integrations**
System integration tables for connecting with external tools like GitHub, Slack, Jira, etc.

---

## 🔐 Security & Performance Notes

### **Row Level Security (RLS)**
- Enabled on: users, projects, project_team_members, stories, tasks, time_entries, notifications
- Policies ensure users only see data they have access to based on their role and project assignments

### **Performance Optimizations**
- **20+ indexes** on frequently queried columns
- **Composite indexes** for complex queries
- **JSONB GIN indexes** for JSON field searches (can be added as needed)

### **Data Integrity**
- **Foreign key constraints** maintain referential integrity
- **Check constraints** validate data ranges (percentages, scores)
- **Unique constraints** prevent duplicates where needed
- **Cascading deletes** handle related data cleanup
