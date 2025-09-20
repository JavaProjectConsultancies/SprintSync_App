# Available Integrations Table - Usage & Implementation Guide

## 📋 Table Overview

The `available_integrations` table serves as a **master catalog** of all external tools and services that can be integrated with SprintSync projects. It acts as a **registry** of supported integrations that projects can enable and configure.

---

## 🏗️ Table Structure

```sql
CREATE TABLE available_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,        -- Integration name (e.g., "GitHub", "Slack")
    type integration_type,                    -- Category of integration
    description TEXT,                         -- What this integration does
    icon_url TEXT,                           -- Icon for UI display
    is_active BOOLEAN DEFAULT true,          -- Admin can enable/disable globally
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Integration Types (Enum)**
```sql
CREATE TYPE integration_type AS ENUM (
    'version_control',      -- GitHub, GitLab, Bitbucket
    'communication',        -- Slack, Microsoft Teams, Discord
    'storage',             -- Google Drive, OneDrive, Dropbox
    'project_management',   -- Jira, Trello, Asana
    'documentation'        -- Confluence, Notion, GitBook
);
```

---

## 🔗 Relationship with Projects

The `available_integrations` table works in conjunction with `project_integrations` to enable a **many-to-many** relationship between projects and integrations:

```sql
-- Project-specific integration configurations
CREATE TABLE project_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    integration_id UUID REFERENCES available_integrations(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,          -- Project can enable/disable
    configuration JSONB DEFAULT '{}',        -- Integration-specific settings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, integration_id)       -- One config per project per integration
);
```

---

## 📊 Data Flow & Usage Patterns

### **1. System Initialization**
```sql
-- Pre-populated integrations during database setup
INSERT INTO available_integrations (name, type, description) VALUES
('GitHub', 'version_control', 'Link commits and PRs to tasks'),
('GitLab', 'version_control', 'Repository management and CI/CD'),
('Slack', 'communication', 'Team notifications and updates'),
('Microsoft Teams', 'communication', 'Collaboration and meetings'),
('Google Drive', 'storage', 'Document and file sharing'),
('OneDrive', 'storage', 'Microsoft cloud storage'),
('Jira', 'project_management', 'Issue tracking and project management'),
('Confluence', 'documentation', 'Team documentation and wikis');
```

### **2. Admin Management**
```sql
-- Admin adds new integration to the catalog
INSERT INTO available_integrations (name, type, description, icon_url) 
VALUES ('Notion', 'documentation', 'All-in-one workspace for notes and docs', '/icons/notion.svg');

-- Admin disables an integration globally
UPDATE available_integrations SET is_active = false WHERE name = 'Jira';

-- View all available integrations
SELECT * FROM available_integrations WHERE is_active = true ORDER BY type, name;
```

### **3. Project Integration Setup**
```sql
-- Project manager enables GitHub integration for their project
INSERT INTO project_integrations (project_id, integration_id, configuration) 
SELECT 
    '00000000-0000-0000-0000-100000000001',  -- project_id
    id,                                       -- integration_id
    '{"repo_url": "https://github.com/company/project", "webhook_secret": "abc123"}'
FROM available_integrations 
WHERE name = 'GitHub';

-- Project manager configures Slack notifications
INSERT INTO project_integrations (project_id, integration_id, configuration) 
SELECT 
    '00000000-0000-0000-0000-100000000001',  -- project_id
    id,                                       -- integration_id
    '{"webhook_url": "https://hooks.slack.com/...", "channel": "#project-updates"}'
FROM available_integrations 
WHERE name = 'Slack';
```

---

## 🎯 Real-World Use Cases

### **1. Integration Marketplace UI**
```sql
-- Get all available integrations for project setup UI
SELECT 
    ai.id,
    ai.name,
    ai.type,
    ai.description,
    ai.icon_url,
    CASE 
        WHEN pi.id IS NOT NULL THEN true 
        ELSE false 
    END as is_enabled_for_project
FROM available_integrations ai
LEFT JOIN project_integrations pi ON ai.id = pi.integration_id 
    AND pi.project_id = ? 
    AND pi.is_enabled = true
WHERE ai.is_active = true
ORDER BY ai.type, ai.name;
```

### **2. Project Integration Dashboard**
```sql
-- Get enabled integrations for a specific project
SELECT 
    ai.name,
    ai.type,
    ai.description,
    ai.icon_url,
    pi.is_enabled,
    pi.configuration,
    pi.updated_at as last_configured
FROM project_integrations pi
JOIN available_integrations ai ON pi.integration_id = ai.id
WHERE pi.project_id = ? AND pi.is_enabled = true
ORDER BY ai.type, ai.name;
```

### **3. Integration Health Check**
```sql
-- Check which projects are using each integration
SELECT 
    ai.name as integration_name,
    ai.type,
    COUNT(pi.id) as projects_using,
    COUNT(CASE WHEN pi.is_enabled = true THEN 1 END) as active_projects
FROM available_integrations ai
LEFT JOIN project_integrations pi ON ai.id = pi.integration_id
WHERE ai.is_active = true
GROUP BY ai.id, ai.name, ai.type
ORDER BY projects_using DESC;
```

---

## ⚙️ Configuration Examples

### **GitHub Integration Configuration**
```json
{
    "repo_url": "https://github.com/company/sprintsync-project",
    "access_token": "ghp_xxxxxxxxxxxxxxxxxxxx",
    "webhook_secret": "webhook_secret_key",
    "auto_link_commits": true,
    "auto_close_tasks": true,
    "branch_patterns": ["feature/*", "bugfix/*"],
    "pr_template": "Closes #{{task_id}}"
}
```

### **Slack Integration Configuration**
```json
{
    "webhook_url": "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
    "channel": "#project-updates",
    "notifications": {
        "task_completed": true,
        "sprint_started": true,
        "milestone_reached": true,
        "risk_identified": false
    },
    "mention_assignee": true,
    "daily_standup_reminder": "09:00"
}
```

### **Google Drive Integration Configuration**
```json
{
    "folder_id": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "service_account_key": "path/to/service-account.json",
    "auto_sync_attachments": true,
    "folder_structure": {
        "documents": "Project Documents",
        "designs": "Design Assets",
        "reports": "Reports & Analytics"
    }
}
```

---

## 🔧 Implementation Patterns

### **1. Integration Factory Pattern**
```typescript
interface IntegrationConfig {
    id: string;
    name: string;
    type: IntegrationType;
    configuration: Record<string, any>;
}

class IntegrationFactory {
    static createIntegration(config: IntegrationConfig): Integration {
        switch (config.type) {
            case 'version_control':
                return new GitHubIntegration(config);
            case 'communication':
                return new SlackIntegration(config);
            case 'storage':
                return new GoogleDriveIntegration(config);
            default:
                throw new Error(`Unsupported integration type: ${config.type}`);
        }
    }
}
```

### **2. Integration Event Handlers**
```typescript
// When a task is completed, notify all enabled communication integrations
async function onTaskCompleted(taskId: string, projectId: string) {
    const integrations = await getEnabledIntegrations(projectId, 'communication');
    
    for (const integration of integrations) {
        const handler = IntegrationFactory.createIntegration(integration);
        await handler.notifyTaskCompleted(taskId);
    }
}
```

### **3. Webhook Processing**
```typescript
// Process incoming webhooks from integrations
app.post('/webhooks/:integrationId', async (req, res) => {
    const { integrationId } = req.params;
    
    // Find which project this integration belongs to
    const projectIntegration = await db.query(`
        SELECT pi.project_id, ai.name, ai.type, pi.configuration
        FROM project_integrations pi
        JOIN available_integrations ai ON pi.integration_id = ai.id
        WHERE pi.integration_id = $1 AND pi.is_enabled = true
    `, [integrationId]);
    
    if (projectIntegration) {
        const handler = IntegrationFactory.createIntegration(projectIntegration);
        await handler.processWebhook(req.body);
    }
});
```

---

## 🚀 Advanced Usage Scenarios

### **1. Conditional Integration Availability**
```sql
-- Some integrations might only be available for certain project types
ALTER TABLE available_integrations 
ADD COLUMN supported_project_templates JSONB DEFAULT '[]';

-- Update to specify which project types support this integration
UPDATE available_integrations 
SET supported_project_templates = '["web-app", "mobile-app"]'
WHERE name = 'GitHub';

-- Query integrations available for a specific project
SELECT ai.*
FROM available_integrations ai
WHERE ai.is_active = true
AND (
    ai.supported_project_templates = '[]' OR 
    ai.supported_project_templates @> (
        SELECT to_jsonb(template) 
        FROM projects 
        WHERE id = ?
    )
);
```

### **2. Integration Dependencies**
```sql
-- Some integrations might depend on others
ALTER TABLE available_integrations 
ADD COLUMN depends_on_integration_ids JSONB DEFAULT '[]';

-- GitHub Actions might depend on GitHub
UPDATE available_integrations 
SET depends_on_integration_ids = (
    SELECT jsonb_build_array(id) 
    FROM available_integrations 
    WHERE name = 'GitHub'
)
WHERE name = 'GitHub Actions';
```

### **3. Integration Metrics & Analytics**
```sql
-- Track integration usage and performance
CREATE TABLE integration_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_integration_id UUID REFERENCES project_integrations(id) ON DELETE CASCADE,
    metric_type VARCHAR(50),  -- 'api_calls', 'webhooks_received', 'errors'
    metric_value INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track integration health
SELECT 
    ai.name,
    COUNT(im.id) as total_metrics,
    COUNT(CASE WHEN im.metric_type = 'errors' THEN 1 END) as error_count,
    AVG(CASE WHEN im.metric_type = 'api_calls' THEN im.metric_value END) as avg_api_calls
FROM available_integrations ai
JOIN project_integrations pi ON ai.id = pi.integration_id
LEFT JOIN integration_metrics im ON pi.id = im.project_integration_id
WHERE im.recorded_at >= NOW() - INTERVAL '7 days'
GROUP BY ai.id, ai.name;
```

---

## 🔐 Security Considerations

### **1. Sensitive Configuration Storage**
```sql
-- Store sensitive data like API keys encrypted
ALTER TABLE project_integrations 
ADD COLUMN encrypted_configuration BYTEA;

-- Application layer handles encryption/decryption
-- Never store plaintext API keys in configuration JSONB
```

### **2. Integration Permissions**
```sql
-- Track which user configured each integration
ALTER TABLE project_integrations 
ADD COLUMN configured_by UUID REFERENCES users(id);

-- Only project managers can configure integrations
CREATE POLICY integration_config_policy ON project_integrations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects p 
            WHERE p.id = project_id 
            AND p.manager_id = current_setting('app.current_user_id')::uuid
        )
    );
```

---

## 📈 Benefits of This Architecture

### **1. Scalability**
- **Easy to add new integrations** without changing core schema
- **Centralized management** of all available integrations
- **Project-specific configurations** without affecting other projects

### **2. Flexibility**
- **JSONB configuration** allows different settings per integration type
- **Enable/disable at multiple levels** (global, project-specific)
- **Version control** of integration configurations

### **3. Maintainability**
- **Clear separation** between available integrations and project usage
- **Audit trail** of when integrations were configured
- **Easy cleanup** when integrations are removed

This architecture makes SprintSync highly extensible and allows teams to connect with their existing tool ecosystem seamlessly! 🎯
