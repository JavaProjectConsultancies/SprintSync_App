# Time Entries Table - Usage & Implementation Guide

## 📊 Overview

The `time_entries` table is the **core time tracking system** in SprintSync, enabling detailed productivity monitoring, project costing, billing, and performance analytics across all levels of work hierarchy.

---

## 🏗️ Table Structure

```sql
CREATE TABLE time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,        -- Who logged the time
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- Project context (required)
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,   -- Story context (optional)
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,      -- Task context (optional)  
    subtask_id UUID REFERENCES subtasks(id) ON DELETE SET NULL,-- Subtask context (optional)
    description TEXT,                                           -- Work description
    entry_type time_entry_type DEFAULT 'development',          -- Type of work performed
    hours_worked DECIMAL(5,2) NOT NULL CHECK (hours_worked > 0), -- Time spent (required)
    work_date DATE NOT NULL,                                    -- Date work was performed
    start_time TIME,                                           -- Start time (optional)
    end_time TIME,                                             -- End time (optional)
    is_billable BOOLEAN DEFAULT true,                         -- Billable hours flag
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),        -- Entry creation time
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()         -- Last modification time
);
```

### **Entry Types (Enum)**
```sql
CREATE TYPE time_entry_type AS ENUM (
    'development',      -- Coding, implementation work
    'testing',          -- QA, testing, bug fixing
    'design',           -- UI/UX design, mockups
    'meeting',          -- Meetings, standups, reviews
    'research',         -- Research, investigation, learning
    'documentation',    -- Writing docs, comments, specs
    'review'            -- Code review, design review
);
```

---

## 🎯 Multi-Level Time Tracking

### **Hierarchical Linking**
Time entries can be linked to **any level** of the work hierarchy:

```
Project Level    → General project work (meetings, planning)
├── Story Level  → Story-specific work (feature development)
├── Task Level   → Task-specific work (specific implementation)
└── Subtask Level → Granular work tracking (detailed tasks)
```

### **Linking Examples**
```sql
-- Project-level time entry (general work)
INSERT INTO time_entries (user_id, project_id, description, entry_type, hours_worked, work_date)
VALUES ('user-uuid', 'project-uuid', 'Daily standup and sprint planning', 'meeting', 1.0, '2024-03-21');

-- Story-level time entry (feature work)
INSERT INTO time_entries (user_id, project_id, story_id, description, entry_type, hours_worked, work_date)
VALUES ('user-uuid', 'project-uuid', 'story-uuid', 'Implementing user authentication flow', 'development', 6.5, '2024-03-21');

-- Task-level time entry (specific implementation)
INSERT INTO time_entries (user_id, project_id, story_id, task_id, description, entry_type, hours_worked, work_date)
VALUES ('user-uuid', 'project-uuid', 'story-uuid', 'task-uuid', 'Frontend bundle optimization and code splitting', 'development', 8.0, '2024-03-20');

-- Subtask-level time entry (granular work)
INSERT INTO time_entries (user_id, project_id, story_id, task_id, subtask_id, description, entry_type, hours_worked, work_date)
VALUES ('user-uuid', 'project-uuid', 'story-uuid', 'task-uuid', 'subtask-uuid', 'Database query profiling and analysis', 'development', 4.0, '2024-03-20');
```

---

## 📈 Time Tracking Workflows

### **1. Daily Time Logging**
```sql
-- Developer logs daily work across multiple tasks
INSERT INTO time_entries (user_id, project_id, story_id, task_id, description, entry_type, hours_worked, work_date, start_time, end_time, is_billable) VALUES
-- Morning development work
('dev-uuid', 'proj-uuid', 'story-1', 'task-1', 'Implementing login validation', 'development', 3.5, '2024-03-21', '09:00', '12:30', true),
-- Afternoon meeting
('dev-uuid', 'proj-uuid', null, null, 'Sprint retrospective meeting', 'meeting', 1.0, '2024-03-21', '13:30', '14:30', true),
-- Code review
('dev-uuid', 'proj-uuid', 'story-2', 'task-2', 'Reviewing payment integration PR', 'review', 1.5, '2024-03-21', '15:00', '16:30', true),
-- Documentation
('dev-uuid', 'proj-uuid', 'story-1', null, 'Updating API documentation', 'documentation', 2.0, '2024-03-21', '16:30', '18:30', true);
```

### **2. Automatic Time Rollup (Triggers)**
```sql
-- Automatically update actual_hours when time is logged
CREATE OR REPLACE FUNCTION update_actual_hours()
RETURNS TRIGGER AS $$
BEGIN
    -- Update task actual hours
    IF NEW.task_id IS NOT NULL THEN
        UPDATE tasks 
        SET actual_hours = (
            SELECT COALESCE(SUM(hours_worked), 0) 
            FROM time_entries 
            WHERE task_id = NEW.task_id
        )
        WHERE id = NEW.task_id;
    END IF;
    
    -- Update story actual hours
    IF NEW.story_id IS NOT NULL THEN
        UPDATE stories 
        SET actual_hours = (
            SELECT COALESCE(SUM(hours_worked), 0) 
            FROM time_entries 
            WHERE story_id = NEW.story_id
        )
        WHERE id = NEW.story_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER time_entry_rollup_trigger
    AFTER INSERT OR UPDATE OR DELETE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_actual_hours();
```

---

## 📊 Time Tracking Analytics

### **1. User Time Summary**
```sql
-- Daily time summary for a user
SELECT 
    work_date,
    SUM(hours_worked) as total_hours,
    COUNT(DISTINCT project_id) as projects_worked,
    COUNT(DISTINCT entry_type) as activity_types,
    SUM(CASE WHEN is_billable THEN hours_worked ELSE 0 END) as billable_hours,
    ARRAY_AGG(DISTINCT entry_type ORDER BY entry_type) as entry_types
FROM time_entries 
WHERE user_id = ? 
    AND work_date >= ? 
    AND work_date <= ?
GROUP BY work_date
ORDER BY work_date DESC;
```

### **2. Project Time Breakdown**
```sql
-- Project time analysis with team breakdown
SELECT 
    p.name as project_name,
    u.name as user_name,
    u.role,
    te.entry_type,
    SUM(te.hours_worked) as total_hours,
    SUM(CASE WHEN te.is_billable THEN te.hours_worked ELSE 0 END) as billable_hours,
    COUNT(*) as entry_count,
    AVG(te.hours_worked) as avg_entry_hours
FROM time_entries te
JOIN projects p ON te.project_id = p.id
JOIN users u ON te.user_id = u.id
WHERE te.work_date >= ? AND te.work_date <= ?
    AND p.id = ?  -- Optional: filter by project
GROUP BY p.name, u.name, u.role, te.entry_type
ORDER BY p.name, total_hours DESC;
```

### **3. Sprint Burndown Data**
```sql
-- Sprint burndown chart data
SELECT 
    te.work_date,
    SUM(te.hours_worked) as daily_hours,
    COUNT(DISTINCT te.story_id) as stories_worked_on,
    COUNT(DISTINCT te.user_id) as team_members_active,
    SUM(CASE WHEN te.entry_type = 'development' THEN te.hours_worked ELSE 0 END) as development_hours,
    SUM(CASE WHEN te.entry_type = 'testing' THEN te.hours_worked ELSE 0 END) as testing_hours
FROM time_entries te
JOIN stories s ON te.story_id = s.id
WHERE s.sprint_id = ?
GROUP BY te.work_date
ORDER BY te.work_date;
```

### **4. Team Productivity Metrics**
```sql
-- Team productivity analysis
SELECT 
    u.name,
    u.role,
    u.experience,
    COUNT(DISTINCT te.project_id) as projects_worked,
    SUM(te.hours_worked) as total_hours,
    AVG(te.hours_worked) as avg_daily_hours,
    COUNT(DISTINCT te.work_date) as days_worked,
    SUM(te.hours_worked) / COUNT(DISTINCT te.work_date) as hours_per_day,
    SUM(CASE WHEN te.entry_type = 'development' THEN te.hours_worked ELSE 0 END) as development_hours,
    SUM(CASE WHEN te.entry_type = 'meeting' THEN te.hours_worked ELSE 0 END) as meeting_hours,
    ROUND(
        SUM(CASE WHEN te.entry_type = 'development' THEN te.hours_worked ELSE 0 END) * 100.0 / 
        SUM(te.hours_worked), 2
    ) as development_percentage
FROM users u
JOIN time_entries te ON u.id = te.user_id
WHERE te.work_date >= ? AND te.work_date <= ?
GROUP BY u.id, u.name, u.role, u.experience
ORDER BY total_hours DESC;
```

---

## 💰 Billing & Cost Analysis

### **1. Project Cost Calculation**
```sql
-- Calculate project costs based on hourly rates
SELECT 
    p.name as project_name,
    p.budget,
    SUM(te.hours_worked * u.hourly_rate) as actual_cost,
    SUM(CASE WHEN te.is_billable THEN te.hours_worked * u.hourly_rate ELSE 0 END) as billable_cost,
    p.budget - SUM(te.hours_worked * u.hourly_rate) as budget_remaining,
    ROUND((SUM(te.hours_worked * u.hourly_rate) / p.budget) * 100, 2) as budget_utilization_percent
FROM projects p
JOIN time_entries te ON p.id = te.project_id
JOIN users u ON te.user_id = u.id
WHERE p.id = ?
GROUP BY p.id, p.name, p.budget;
```

### **2. Billable Hours Report**
```sql
-- Client billing report
SELECT 
    p.name as project_name,
    u.name as user_name,
    u.role,
    u.hourly_rate,
    DATE_TRUNC('week', te.work_date) as week_starting,
    SUM(CASE WHEN te.is_billable THEN te.hours_worked ELSE 0 END) as billable_hours,
    SUM(CASE WHEN NOT te.is_billable THEN te.hours_worked ELSE 0 END) as non_billable_hours,
    SUM(CASE WHEN te.is_billable THEN te.hours_worked * u.hourly_rate ELSE 0 END) as billable_amount
FROM time_entries te
JOIN users u ON te.user_id = u.id
JOIN projects p ON te.project_id = p.id
WHERE te.work_date >= ? AND te.work_date <= ?
    AND p.id = ?  -- Optional: filter by project
GROUP BY p.name, u.name, u.role, u.hourly_rate, DATE_TRUNC('week', te.work_date)
ORDER BY week_starting DESC, billable_amount DESC;
```

### **3. Resource Utilization**
```sql
-- Team resource utilization analysis
SELECT 
    u.name,
    u.availability_percentage,
    COUNT(DISTINCT te.work_date) as days_worked,
    SUM(te.hours_worked) as total_hours_logged,
    AVG(te.hours_worked) as avg_hours_per_entry,
    SUM(te.hours_worked) / COUNT(DISTINCT te.work_date) as avg_hours_per_day,
    ROUND(
        (SUM(te.hours_worked) / COUNT(DISTINCT te.work_date)) / 8.0 * 100, 2
    ) as daily_utilization_percent,
    ROUND(
        (SUM(te.hours_worked) / (COUNT(DISTINCT te.work_date) * 8.0)) * 
        (100.0 / u.availability_percentage) * 100, 2
    ) as adjusted_utilization_percent
FROM users u
JOIN time_entries te ON u.id = te.user_id
WHERE te.work_date >= DATE_TRUNC('month', CURRENT_DATE)
    AND u.is_active = true
GROUP BY u.id, u.name, u.availability_percentage
ORDER BY total_hours_logged DESC;
```

---

## 🔍 Advanced Queries & Reports

### **1. Time Distribution Analysis**
```sql
-- Analyze time distribution across entry types
SELECT 
    entry_type,
    COUNT(*) as entry_count,
    SUM(hours_worked) as total_hours,
    AVG(hours_worked) as avg_hours_per_entry,
    MIN(hours_worked) as min_hours,
    MAX(hours_worked) as max_hours,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY hours_worked) as median_hours
FROM time_entries
WHERE work_date >= ? AND work_date <= ?
    AND project_id = ?  -- Optional: filter by project
GROUP BY entry_type
ORDER BY total_hours DESC;
```

### **2. Productivity Trends**
```sql
-- Weekly productivity trends for a user
SELECT 
    DATE_TRUNC('week', work_date) as week_starting,
    COUNT(*) as entries_logged,
    SUM(hours_worked) as total_hours,
    COUNT(DISTINCT project_id) as projects_worked,
    AVG(hours_worked) as avg_entry_size,
    SUM(CASE WHEN entry_type = 'development' THEN hours_worked ELSE 0 END) as dev_hours,
    SUM(CASE WHEN entry_type = 'meeting' THEN hours_worked ELSE 0 END) as meeting_hours
FROM time_entries
WHERE user_id = ?
    AND work_date >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', work_date)
ORDER BY week_starting DESC;
```

### **3. Story/Task Completion Analysis**
```sql
-- Analyze estimated vs actual time for completed work
SELECT 
    s.title as story_title,
    t.title as task_title,
    t.estimated_hours,
    SUM(te.hours_worked) as actual_hours,
    t.estimated_hours - SUM(te.hours_worked) as variance_hours,
    CASE 
        WHEN t.estimated_hours > 0 THEN 
            ROUND(((SUM(te.hours_worked) - t.estimated_hours) / t.estimated_hours) * 100, 2)
        ELSE NULL 
    END as variance_percentage,
    COUNT(te.id) as time_entries_count,
    MIN(te.work_date) as first_work_date,
    MAX(te.work_date) as last_work_date
FROM tasks t
LEFT JOIN time_entries te ON t.id = te.task_id
LEFT JOIN stories s ON t.story_id = s.id
WHERE t.status = 'done'
    AND s.project_id = ?
GROUP BY s.title, t.title, t.estimated_hours, t.id
HAVING SUM(te.hours_worked) > 0
ORDER BY variance_percentage DESC;
```

---

## ⚡ Performance Optimizations

### **Critical Indexes**
```sql
-- Essential indexes for time_entries table
CREATE INDEX idx_time_entries_user ON time_entries(user_id);
CREATE INDEX idx_time_entries_project ON time_entries(project_id);
CREATE INDEX idx_time_entries_date ON time_entries(work_date);
CREATE INDEX idx_time_entries_story ON time_entries(story_id);
CREATE INDEX idx_time_entries_task ON time_entries(task_id);
CREATE INDEX idx_time_entries_subtask ON time_entries(subtask_id);

-- Composite indexes for common queries
CREATE INDEX idx_time_entries_user_date ON time_entries(user_id, work_date);
CREATE INDEX idx_time_entries_project_date ON time_entries(project_id, work_date);
CREATE INDEX idx_time_entries_billable ON time_entries(is_billable, work_date);
```

### **Query Optimization Tips**
```sql
-- Use date ranges efficiently
SELECT * FROM time_entries 
WHERE work_date >= '2024-03-01' AND work_date <= '2024-03-31'
    AND user_id = ?;

-- Leverage composite indexes
SELECT SUM(hours_worked) 
FROM time_entries 
WHERE user_id = ? AND work_date >= CURRENT_DATE - INTERVAL '7 days';

-- Use appropriate aggregation levels
-- For monthly reports, aggregate by week first, then sum
WITH weekly_data AS (
    SELECT 
        DATE_TRUNC('week', work_date) as week,
        SUM(hours_worked) as weekly_hours
    FROM time_entries 
    WHERE user_id = ? AND work_date >= DATE_TRUNC('month', CURRENT_DATE)
    GROUP BY DATE_TRUNC('week', work_date)
)
SELECT SUM(weekly_hours) as monthly_total FROM weekly_data;
```

---

## 🔧 Integration Patterns

### **1. Time Tracking Widget**
```typescript
interface TimeEntry {
    id: string;
    userId: string;
    projectId: string;
    storyId?: string;
    taskId?: string;
    subtaskId?: string;
    description: string;
    entryType: 'development' | 'testing' | 'design' | 'meeting' | 'research' | 'documentation' | 'review';
    hoursWorked: number;
    workDate: string;
    startTime?: string;
    endTime?: string;
    isBillable: boolean;
}

class TimeTracker {
    async logTime(entry: Omit<TimeEntry, 'id'>): Promise<TimeEntry> {
        // Validate entry
        if (entry.hoursWorked <= 0) {
            throw new Error('Hours worked must be greater than 0');
        }
        
        // Save to database
        const result = await db.query(`
            INSERT INTO time_entries (user_id, project_id, story_id, task_id, subtask_id, 
                                    description, entry_type, hours_worked, work_date, 
                                    start_time, end_time, is_billable)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        `, [entry.userId, entry.projectId, entry.storyId, entry.taskId, 
            entry.subtaskId, entry.description, entry.entryType, 
            entry.hoursWorked, entry.workDate, entry.startTime, 
            entry.endTime, entry.isBillable]);
        
        return result.rows[0];
    }
}
```

### **2. Timer Integration**
```typescript
class TimerService {
    private activeTimers: Map<string, { startTime: Date, entry: Partial<TimeEntry> }> = new Map();
    
    startTimer(userId: string, entry: Partial<TimeEntry>): void {
        this.activeTimers.set(userId, {
            startTime: new Date(),
            entry
        });
    }
    
    async stopTimer(userId: string, description: string): Promise<TimeEntry> {
        const timer = this.activeTimers.get(userId);
        if (!timer) {
            throw new Error('No active timer found');
        }
        
        const endTime = new Date();
        const hoursWorked = (endTime.getTime() - timer.startTime.getTime()) / (1000 * 60 * 60);
        
        const entry = {
            ...timer.entry,
            userId,
            description,
            hoursWorked: Math.round(hoursWorked * 4) / 4, // Round to 15-minute intervals
            workDate: timer.startTime.toISOString().split('T')[0],
            startTime: timer.startTime.toTimeString().split(' ')[0],
            endTime: endTime.toTimeString().split(' ')[0]
        };
        
        this.activeTimers.delete(userId);
        return await new TimeTracker().logTime(entry as TimeEntry);
    }
}
```

---

## 🎯 Best Practices

### **1. Data Quality**
- **Required fields**: Always require user_id, project_id, hours_worked, work_date
- **Reasonable limits**: Set max hours per entry (e.g., 24 hours)
- **Date validation**: Ensure work_date is not in the future
- **Time validation**: If start_time and end_time provided, validate consistency

### **2. User Experience**
- **Quick entry**: Allow rapid time logging with minimal clicks
- **Context preservation**: Remember last project/story/task for user
- **Bulk operations**: Support copying entries across dates
- **Mobile friendly**: Optimize for mobile time entry

### **3. Reporting & Analytics**
- **Regular aggregation**: Pre-calculate common metrics
- **Flexible filtering**: Support multiple filter combinations
- **Export capabilities**: CSV/Excel export for external analysis
- **Real-time updates**: Update dashboards as entries are logged

### **4. Privacy & Security**
- **User isolation**: Users can only see their own entries (unless admin/manager)
- **Project access**: Respect project team membership for visibility
- **Audit trails**: Track changes to time entries
- **Data retention**: Define policies for historical data

The `time_entries` table is the foundation for comprehensive project analytics, accurate billing, and team productivity insights in SprintSync! ⏰📊
