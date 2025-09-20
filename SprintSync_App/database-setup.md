# SprintSync Database Setup Guide

## Prerequisites

### 1. Install PostgreSQL
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql` or use PostgreSQL.app
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

### 2. Start PostgreSQL Service
```bash
# Windows (if installed as service)
net start postgresql

# macOS with Homebrew
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

## Database Creation

### 1. Connect to PostgreSQL
```bash
# Connect as postgres user
psql -U postgres

# Or if you created a user during installation
psql -U your_username
```

### 2. Create Database and User
```sql
-- Create database
CREATE DATABASE sprintsync;

-- Create user with password
CREATE USER sprintsync_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE sprintsync TO sprintsync_user;

-- Connect to the new database
\c sprintsync;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO sprintsync_user;
```

### 3. Run Schema Migration
```bash
# From your project root directory
psql -U sprintsync_user -d sprintsync -f SprintSync_App/src/database/migrations/001_initial_schema.sql
```

### 4. Insert Sample Data
```bash
# Insert sample data for testing
psql -U sprintsync_user -d sprintsync -f SprintSync_App/src/database/sample-data.sql
```

## Environment Configuration

### 1. Create Environment File
Create `.env` file in your project root:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sprintsync
DB_USER=sprintsync_user
DB_PASSWORD=your_secure_password
DB_SSL=false

# Application Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration (for authentication)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Other configurations
CORS_ORIGIN=http://localhost:3000
```

### 2. Install Database Dependencies
```bash
# Install PostgreSQL client for Node.js
npm install pg @types/pg

# Install environment variables handler
npm install dotenv

# Install connection pooling (recommended)
npm install pg-pool
```

## Database Connection Setup

### 1. Create Database Connection File
Create `SprintSync_App/src/config/database.ts`:

```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sprintsync',
  user: process.env.DB_USER || 'sprintsync_user',
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true',
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

### 2. Test Database Connection
Create `SprintSync_App/test-db-connection.js`:

```javascript
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sprintsync',
  user: process.env.DB_USER || 'sprintsync_user',
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    
    // Test query
    const result = await client.query('SELECT COUNT(*) as user_count FROM users');
    console.log(`📊 Found ${result.rows[0].user_count} users in database`);
    
    client.release();
    await pool.end();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
}

testConnection();
```

## Cloud Database Options

### 1. Supabase (Recommended for rapid development)
- Free tier available
- Built-in authentication and real-time features
- PostgreSQL compatible

### 2. Railway
- Simple deployment
- PostgreSQL with automatic backups

### 3. Neon
- Serverless PostgreSQL
- Generous free tier

### 4. AWS RDS
- Production-grade
- Automated backups and scaling

## Verification Steps

### 1. Check Tables Created
```sql
-- Connect to your database and run:
\dt

-- Should show all 20+ tables including:
-- users, projects, sprints, stories, tasks, etc.
```

### 2. Verify Sample Data
```sql
-- Check users
SELECT name, role, department_id FROM users LIMIT 5;

-- Check projects
SELECT name, status, manager_id FROM projects LIMIT 5;

-- Check departments
SELECT * FROM departments;
```

### 3. Test Application Queries
```sql
-- Test a complex query from common-queries.sql
SELECT 
    u.name, 
    u.role, 
    d.name as department_name,
    COUNT(DISTINCT ptm.project_id) as active_projects
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN project_team_members ptm ON u.id = ptm.user_id AND ptm.left_at IS NULL
WHERE u.is_active = true
GROUP BY u.id, u.name, u.role, d.name
LIMIT 10;
```

## Next Steps

1. **Test the database connection** with the provided script
2. **Integrate with your React application** using the database configuration
3. **Set up API endpoints** to interact with the database
4. **Configure authentication** using the users table
5. **Test core functionality** like project creation, user assignment, etc.

## Troubleshooting

### Common Issues:
1. **Connection refused**: Check if PostgreSQL is running
2. **Authentication failed**: Verify username/password
3. **Permission denied**: Ensure user has proper privileges
4. **Tables not found**: Run the migration script again

### Useful Commands:
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Connect to database
psql -U sprintsync_user -d sprintsync

# List databases
\l

# List tables
\dt

# Describe table structure
\d table_name
```
