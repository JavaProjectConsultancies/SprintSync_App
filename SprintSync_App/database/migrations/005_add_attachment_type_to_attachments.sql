-- Migration: Add attachment_type column to attachments table
-- This allows distinguishing between file uploads and URL links

-- Add attachment_type column (defaults to 'file' for existing records)
ALTER TABLE attachments 
ADD COLUMN IF NOT EXISTS attachment_type VARCHAR(20) DEFAULT 'file' CHECK (attachment_type IN ('file', 'url'));

-- Update existing records to have 'file' type
UPDATE attachments SET attachment_type = 'file' WHERE attachment_type IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE attachments 
ALTER COLUMN attachment_type SET NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_attachments_type ON attachments(attachment_type);

