-- Standardizing precision for effort hours to (12, 2) in the sprintsync schema
SET search_path TO sprintsync;

ALTER TABLE tasks ALTER COLUMN actual_hours TYPE numeric(12,2);
ALTER TABLE tasks ALTER COLUMN estimated_hours TYPE numeric(12,2);

ALTER TABLE stories ALTER COLUMN actual_hours TYPE numeric(12,2);
ALTER TABLE stories ALTER COLUMN estimated_hours TYPE numeric(12,2);

ALTER TABLE issues ALTER COLUMN actual_hours TYPE numeric(12,2);
ALTER TABLE issues ALTER COLUMN estimated_hours TYPE numeric(12,2);

ALTER TABLE time_entries ALTER COLUMN hours_worked TYPE numeric(12,2);

ALTER TABLE subtasks ALTER COLUMN actual_hours TYPE numeric(12,2);
ALTER TABLE subtasks ALTER COLUMN estimated_hours TYPE numeric(12,2);

-- Backlog tables
ALTER TABLE backlog_tasks ALTER COLUMN actual_hours TYPE numeric(12,2);
ALTER TABLE backlog_tasks ALTER COLUMN estimated_hours TYPE numeric(12,2);

ALTER TABLE backlog_stories ALTER COLUMN actual_hours TYPE numeric(12,2);
-- estimated_hours does not exist in backlog_stories database table yet

ALTER TABLE backlog_subtasks ALTER COLUMN actual_hours TYPE numeric(12,2);
ALTER TABLE backlog_subtasks ALTER COLUMN estimated_hours TYPE numeric(12,2);
