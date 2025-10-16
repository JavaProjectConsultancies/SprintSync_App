-- ============================================
-- FIX STORY STATUS VALUES IN DATABASE
-- Run this SQL script in your PostgreSQL database
-- ============================================

-- Update stories table status column from old values to new lowercase values
UPDATE stories 
SET status = CASE 
    WHEN status = 'to_do' THEN 'todo'
    WHEN status = 'backlog' THEN 'backlog'
    WHEN status = 'in_progress' THEN 'in_progress'
    WHEN status = 'qa_review' THEN 'review'
    WHEN status = 'done' THEN 'done'
    WHEN status = 'TODO' THEN 'todo'
    WHEN status = 'BACKLOG' THEN 'backlog'
    WHEN status = 'IN_PROGRESS' THEN 'in_progress'
    WHEN status = 'REVIEW' THEN 'review'
    WHEN status = 'DONE' THEN 'done'
    ELSE status
END
WHERE status IN ('to_do', 'backlog', 'in_progress', 'qa_review', 'done', 'TODO', 'BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE');

-- Verify the update
SELECT 'Current story status values:' as info;
SELECT DISTINCT status, COUNT(*) as count 
FROM stories 
GROUP BY status 
ORDER BY status;

-- Show affected rows
SELECT 'Updated stories:' as info;
SELECT id, title, status 
FROM stories 
WHERE status IN ('TODO', 'BACKLOG', 'IN_PROGRESS', 'REVIEW', 'DONE')
ORDER BY status, title;
