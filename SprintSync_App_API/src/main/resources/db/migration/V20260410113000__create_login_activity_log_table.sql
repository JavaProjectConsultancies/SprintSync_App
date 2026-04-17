-- Create login_activity_log table to track user logins
CREATE TABLE IF NOT EXISTS login_activity_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    ip_address VARCHAR(45),
    login_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster retrieval of logs by user
CREATE INDEX IF NOT EXISTS idx_login_activity_user_id ON login_activity_logs(user_id);

-- Index for faster retrieval of logs by time
CREATE INDEX IF NOT EXISTS idx_login_activity_time ON login_activity_logs(login_time DESC);
