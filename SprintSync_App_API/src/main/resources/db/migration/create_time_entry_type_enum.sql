-- Create time_entry_type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE time_entry_type AS ENUM (
        'development',
        'testing', 
        'design',
        'review',
        'meeting',
        'research',
        'documentation',
        'bug_fix',
        'refactoring',
        'deployment',
        'training',
        'administrative'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Ensure the time_entries table exists with proper column type
CREATE TABLE IF NOT EXISTS time_entries (
    id VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(255) NOT NULL,
    project_id VARCHAR(255),
    story_id VARCHAR(255),
    task_id VARCHAR(255),
    subtask_id VARCHAR(255),
    description TEXT NOT NULL,
    entry_type time_entry_type NOT NULL,
    hours_worked DECIMAL(5,2) NOT NULL,
    work_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_billable BOOLEAN DEFAULT TRUE
);

-- If the column already exists but has wrong type, alter it
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'time_entries' 
        AND column_name = 'entry_type' 
        AND data_type != 'USER-DEFINED'
    ) THEN
        ALTER TABLE time_entries 
        ALTER COLUMN entry_type TYPE time_entry_type 
        USING entry_type::text::time_entry_type;
    END IF;
END $$;
