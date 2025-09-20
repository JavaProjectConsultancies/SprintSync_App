# Risks, Requirements & Todos Tables - Usage Guide

## 📋 Overview

These three tables serve different but complementary purposes in project management:

- **`risks`** - Project risk management and mitigation tracking
- **`requirements`** - Functional and technical requirements documentation  
- **`todos`** - Personal task management for individual users

---

## 🚨 RISKS Table

### **Purpose**
Track and manage project risks with probability, impact assessment, and mitigation strategies.

### **Table Structure**
```sql
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,  -- Parent project
    title VARCHAR(255) NOT NULL,                                -- Risk title
    description TEXT,                                           -- Risk description
    probability risk_probability DEFAULT 'medium',             -- low, medium, high
    impact risk_impact DEFAULT 'medium',                       -- low, medium, high
    mitigation TEXT,                                           -- Mitigation strategy
    status risk_status DEFAULT 'identified',                   -- identified, mitigated, closed
    owner_id UUID REFERENCES users(id),                       -- Risk owner/responsible person
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Risk Management Workflow**
```
1. IDENTIFIED → Risk discovered and documented
2. MITIGATED → Mitigation plan implemented
3. CLOSED → Risk no longer relevant or resolved
```

### **Usage Examples**

#### **1. Risk Assessment Matrix**
```sql
-- Get risk assessment overview for a project
SELECT 
    title,
    probability,
    impact,
    status,
    u.name as owner_name,
    CASE 
        WHEN probability = 'high' AND impact = 'high' THEN 'CRITICAL'
        WHEN probability = 'high' AND impact = 'medium' THEN 'HIGH'
        WHEN probability = 'medium' AND impact = 'high' THEN 'HIGH'
        WHEN probability = 'medium' AND impact = 'medium' THEN 'MEDIUM'
        ELSE 'LOW'
    END as risk_level
FROM risks r
LEFT JOIN users u ON r.owner_id = u.id
WHERE r.project_id = ? AND r.status != 'closed'
ORDER BY 
    CASE 
        WHEN probability = 'high' AND impact = 'high' THEN 1
        WHEN probability = 'high' AND impact = 'medium' THEN 2
        WHEN probability = 'medium' AND impact = 'high' THEN 2
        ELSE 3
    END;
```

#### **2. Risk Dashboard**
```sql
-- Risk summary for project dashboard
SELECT 
    COUNT(*) as total_risks,
    COUNT(CASE WHEN status = 'identified' THEN 1 END) as open_risks,
    COUNT(CASE WHEN status = 'mitigated' THEN 1 END) as mitigated_risks,
    COUNT(CASE WHEN probability = 'high' AND impact = 'high' THEN 1 END) as critical_risks
FROM risks 
WHERE project_id = ?;
```

#### **3. Sample Risk Data**
```sql
INSERT INTO risks (project_id, title, description, probability, impact, mitigation, owner_id) VALUES
('project-uuid', 'Third-party API Changes', 
 'Payment gateway or shipping APIs may change during development', 
 'medium', 'high', 
 'Maintain backup payment processors and flexible API adapters',
 'user-uuid'),

('project-uuid', 'Key Developer Unavailability', 
 'Lead developer may become unavailable during critical phase', 
 'low', 'high', 
 'Cross-train team members and document critical processes',
 'manager-uuid'),

('project-uuid', 'Performance Issues', 
 'High traffic may cause performance bottlenecks', 
 'high', 'medium', 
 'Implement comprehensive performance testing and monitoring',
 'tech-lead-uuid');
```

---

## 📋 REQUIREMENTS Table

### **Purpose**
Document and track functional, non-functional, and technical requirements for projects.

### **Table Structure**
```sql
CREATE TABLE requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,  -- Parent project
    title VARCHAR(255) NOT NULL,                                -- Requirement title
    description TEXT,                                           -- Detailed description
    type requirement_type,                                      -- functional, non-functional, technical
    status requirement_status DEFAULT 'draft',                 -- draft, approved, in-development, completed
    priority project_priority DEFAULT 'medium',                -- low, medium, high, critical
    module VARCHAR(100),                                        -- System module/component
    acceptance_criteria JSONB DEFAULT '[]',                    -- Acceptance criteria array
    effort_points INTEGER DEFAULT 0,                           -- Effort estimation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Requirement Types**
- **`functional`** - What the system should do (features, user interactions)
- **`non-functional`** - How the system should perform (performance, security, usability)
- **`technical`** - Technical constraints and specifications

### **Requirement Lifecycle**
```
1. DRAFT → Initial requirement documentation
2. APPROVED → Stakeholder approval received
3. IN-DEVELOPMENT → Being implemented in stories/tasks
4. COMPLETED → Requirement fully implemented and tested
```

### **Usage Examples**

#### **1. Requirements Traceability Matrix**
```sql
-- Track requirement implementation status
SELECT 
    r.title,
    r.type,
    r.priority,
    r.status,
    r.module,
    r.effort_points,
    COUNT(s.id) as related_stories,
    COUNT(CASE WHEN s.status = 'done' THEN 1 END) as completed_stories
FROM requirements r
LEFT JOIN stories s ON s.epic = r.module  -- Link by module/epic
WHERE r.project_id = ?
GROUP BY r.id, r.title, r.type, r.priority, r.status, r.module, r.effort_points
ORDER BY r.priority DESC, r.created_at;
```

#### **2. Requirements Coverage Analysis**
```sql
-- Check requirements coverage by type
SELECT 
    type,
    COUNT(*) as total_requirements,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requirements,
    ROUND(COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*), 2) as completion_percentage
FROM requirements 
WHERE project_id = ?
GROUP BY type;
```

#### **3. Sample Requirements Data**
```sql
INSERT INTO requirements (project_id, title, description, type, status, priority, module, acceptance_criteria, effort_points) VALUES
-- Functional Requirements
('project-uuid', 'User Authentication', 
 'Users must be able to register, login, and manage their accounts', 
 'functional', 'approved', 'critical', 'Authentication',
 '["User can register with email/password", "User can login securely", "User can reset password", "Account lockout after failed attempts"]',
 13),

('project-uuid', 'Shopping Cart Management', 
 'Users can add, remove, and modify items in their shopping cart', 
 'functional', 'in-development', 'high', 'E-commerce',
 '["Add items to cart", "Remove items from cart", "Update quantities", "Calculate totals", "Persist cart across sessions"]',
 8),

-- Non-functional Requirements  
('project-uuid', 'Performance Requirements', 
 'System must handle expected load with acceptable response times', 
 'non-functional', 'approved', 'high', 'Performance',
 '["Page load time < 2 seconds", "Support 1000 concurrent users", "99.9% uptime", "Database queries < 100ms"]',
 21),

('project-uuid', 'Security Requirements', 
 'System must protect user data and prevent unauthorized access', 
 'non-functional', 'approved', 'critical', 'Security',
 '["HTTPS encryption", "SQL injection protection", "XSS prevention", "GDPR compliance", "Regular security audits"]',
 34),

-- Technical Requirements
('project-uuid', 'Technology Stack', 
 'Define the technical architecture and technology choices', 
 'technical', 'approved', 'critical', 'Architecture',
 '["React frontend", "Node.js backend", "PostgreSQL database", "Docker deployment", "AWS hosting"]',
 5);
```

---

## ✅ TODOS Table

### **Purpose**
Personal task management system for individual users, with optional linking to project entities.

### **Table Structure**
```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,       -- Todo owner
    title VARCHAR(255) NOT NULL,                               -- Todo title
    description TEXT,                                          -- Todo description
    priority todo_priority DEFAULT 'medium',                  -- low, medium, high
    status todo_status DEFAULT 'pending',                     -- pending, in_progress, completed
    due_date DATE,                                            -- Due date
    reminder_date TIMESTAMP WITH TIME ZONE,                   -- Reminder timestamp
    tags JSONB DEFAULT '[]',                                  -- Flexible tagging
    related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,  -- Optional project link
    related_story_id UUID REFERENCES stories(id) ON DELETE SET NULL,     -- Optional story link  
    related_task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,        -- Optional task link
    order_index INTEGER DEFAULT 0,                            -- Display order
    completed_at TIMESTAMP WITH TIME ZONE,                    -- Completion timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Todo Lifecycle**
```
1. PENDING → Todo created, not started
2. IN_PROGRESS → User is actively working on it
3. COMPLETED → Todo finished, completed_at timestamp set
```

### **Usage Examples**

#### **1. Personal Todo Dashboard**
```sql
-- Get user's active todos with project context
SELECT 
    t.*,
    p.name as project_name,
    s.title as story_title,
    tk.title as task_title,
    CASE 
        WHEN t.due_date < CURRENT_DATE THEN 'overdue'
        WHEN t.due_date = CURRENT_DATE THEN 'due_today'
        WHEN t.due_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'due_soon'
        ELSE 'upcoming'
    END as urgency_status
FROM todos t
LEFT JOIN projects p ON t.related_project_id = p.id
LEFT JOIN stories s ON t.related_story_id = s.id
LEFT JOIN tasks tk ON t.related_task_id = tk.id
WHERE t.user_id = ? AND t.status != 'completed'
ORDER BY 
    CASE t.priority 
        WHEN 'high' THEN 1 
        WHEN 'medium' THEN 2 
        WHEN 'low' THEN 3 
    END,
    t.due_date NULLS LAST,
    t.order_index;
```

#### **2. Project-Related Todos**
```sql
-- Get todos related to a specific project
SELECT 
    t.*,
    u.name as user_name,
    CASE 
        WHEN t.related_story_id IS NOT NULL THEN 'Story: ' || s.title
        WHEN t.related_task_id IS NOT NULL THEN 'Task: ' || tk.title
        ELSE 'General Project'
    END as context
FROM todos t
JOIN users u ON t.user_id = u.id
LEFT JOIN stories s ON t.related_story_id = s.id
LEFT JOIN tasks tk ON t.related_task_id = tk.id
WHERE t.related_project_id = ? AND t.status != 'completed'
ORDER BY u.name, t.priority DESC;
```

#### **3. Todo Analytics**
```sql
-- User productivity metrics
SELECT 
    u.name,
    COUNT(*) as total_todos,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_todos,
    COUNT(CASE WHEN t.status = 'completed' AND t.completed_at >= DATE_TRUNC('month', CURRENT_DATE) THEN 1 END) as completed_this_month,
    AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/3600) as avg_completion_hours
FROM todos t
JOIN users u ON t.user_id = u.id
WHERE t.created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '3 months'
GROUP BY u.id, u.name
ORDER BY completed_this_month DESC;
```

#### **4. Sample Todo Data**
```sql
INSERT INTO todos (user_id, title, description, priority, status, due_date, tags, related_project_id, related_story_id) VALUES
-- Development todos
('developer-uuid', 'Complete bundle optimization', 
 'Finish implementing code splitting and lazy loading', 
 'high', 'in_progress', '2024-03-25', 
 '["development", "performance"]',
 'project-uuid', 'story-uuid'),

('developer-uuid', 'Review security testing plan', 
 'Review and provide feedback on security testing approach', 
 'medium', 'pending', '2024-03-22', 
 '["security", "review"]',
 'project-uuid', 'story-uuid'),

-- Manager todos  
('manager-uuid', 'Prepare sprint review presentation', 
 'Create presentation for upcoming sprint review meeting', 
 'high', 'pending', '2024-03-24', 
 '["management", "presentation"]',
 'project-uuid', null),

('manager-uuid', 'Review budget allocations', 
 'Review Q2 budget allocations for all managed projects', 
 'medium', 'pending', '2024-03-28', 
 '["budget", "planning"]',
 null, null),

-- Personal todos
('user-uuid', 'Update technical documentation', 
 'Update API documentation with latest changes', 
 'low', 'pending', '2024-03-30', 
 '["documentation"]',
 null, null);
```

---

## 🔄 Integration & Relationships

### **Cross-Table Relationships**

#### **1. Risk → Requirement Linking**
```sql
-- Link risks to specific requirements they might impact
ALTER TABLE risks ADD COLUMN related_requirement_ids JSONB DEFAULT '[]';

-- Query risks that might impact specific requirements
SELECT r.*, req.title as requirement_title
FROM risks r
JOIN requirements req ON req.project_id = r.project_id
WHERE r.project_id = ? 
AND (
    r.description ILIKE '%' || req.module || '%' OR
    req.id::text = ANY(SELECT jsonb_array_elements_text(r.related_requirement_ids))
);
```

#### **2. Requirement → Story Traceability**
```sql
-- Track which stories implement which requirements
SELECT 
    req.title as requirement,
    req.type,
    req.status as req_status,
    s.title as story_title,
    s.status as story_status,
    s.story_points
FROM requirements req
LEFT JOIN stories s ON s.epic = req.module  -- Link by module/epic name
WHERE req.project_id = ?
ORDER BY req.priority DESC, req.title;
```

#### **3. Todo → Work Item Integration**
```sql
-- Automatically create todos when tasks are assigned
CREATE OR REPLACE FUNCTION create_todo_for_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.assignee_id IS NOT NULL AND (OLD.assignee_id IS NULL OR OLD.assignee_id != NEW.assignee_id) THEN
        INSERT INTO todos (user_id, title, description, priority, related_project_id, related_story_id, related_task_id)
        SELECT 
            NEW.assignee_id,
            'Complete task: ' || NEW.title,
            NEW.description,
            CASE NEW.priority 
                WHEN 'critical' THEN 'high'
                WHEN 'high' THEN 'high'  
                WHEN 'medium' THEN 'medium'
                ELSE 'low'
            END,
            s.project_id,
            NEW.story_id,
            NEW.id
        FROM stories s 
        WHERE s.id = NEW.story_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_assignment_todo_trigger
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION create_todo_for_task_assignment();
```

---

## 📊 Reporting & Analytics

### **1. Risk Heat Map**
```sql
-- Risk assessment heat map data
SELECT 
    probability,
    impact,
    COUNT(*) as risk_count,
    string_agg(title, ', ') as risk_titles
FROM risks 
WHERE project_id = ? AND status != 'closed'
GROUP BY probability, impact
ORDER BY 
    CASE probability WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC,
    CASE impact WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC;
```

### **2. Requirements Progress**
```sql
-- Requirements completion dashboard
SELECT 
    module,
    COUNT(*) as total_requirements,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
    COUNT(CASE WHEN status = 'in-development' THEN 1 END) as in_development,
    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
    SUM(effort_points) as total_effort,
    SUM(CASE WHEN status = 'completed' THEN effort_points ELSE 0 END) as completed_effort
FROM requirements 
WHERE project_id = ?
GROUP BY module
ORDER BY total_effort DESC;
```

### **3. Personal Productivity**
```sql
-- User todo completion trends
SELECT 
    DATE_TRUNC('week', completed_at) as week,
    COUNT(*) as todos_completed,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/86400) as avg_days_to_complete
FROM todos 
WHERE user_id = ? 
AND completed_at >= CURRENT_DATE - INTERVAL '12 weeks'
AND status = 'completed'
GROUP BY DATE_TRUNC('week', completed_at)
ORDER BY week;
```

---

## 🎯 Best Practices

### **1. Risk Management**
- **Regular risk reviews** - Schedule weekly/monthly risk assessments
- **Risk ownership** - Always assign a risk owner for accountability
- **Impact quantification** - Use consistent criteria for probability/impact scoring
- **Mitigation tracking** - Document and track mitigation plan progress

### **2. Requirements Management**
- **Clear acceptance criteria** - Use JSONB to store detailed, testable criteria
- **Traceability** - Link requirements to stories/tasks through modules/epics
- **Version control** - Track requirement changes through activity_logs
- **Stakeholder approval** - Formal approval process before development

### **3. Todo Management**
- **Context linking** - Link todos to project work items for better organization
- **Priority discipline** - Use priority levels consistently across the team
- **Regular cleanup** - Archive completed todos periodically
- **Team visibility** - Share project-related todos with team members

This architecture provides comprehensive project governance while maintaining individual productivity tracking! 🎯
