-- Update story status values to match new enum
-- Change from old values (to_do, backlog, etc.) to new values (TODO, BACKLOG, etc.)

-- Update stories table status column to lowercase values
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
SELECT DISTINCT status FROM stories;
