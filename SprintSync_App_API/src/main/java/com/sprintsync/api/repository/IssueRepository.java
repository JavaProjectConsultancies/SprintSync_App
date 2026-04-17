package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Issue;
import com.sprintsync.api.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Issue entity operations.
 * Extends JpaRepository to provide CRUD operations and custom queries.
 * 
 * @author SprintSync Team
 */
@Repository
public interface IssueRepository extends JpaRepository<Issue, String> {

    /**
     * Find issues by story ID
     */
    List<Issue> findByStoryId(String storyId);

    /**
     * Find issues by multiple story IDs
     */
    List<Issue> findByStoryIdIn(java.util.Collection<String> storyIds);

    /**
     * Find issues by assignee ID
     */
    List<Issue> findByAssigneeId(String assigneeId);

    /**
     * Find issues by status
     */
    List<Issue> findByStatus(TaskStatus status);

    /**
     * Find issues by priority
     */
    List<Issue> findByPriority(String priority);

    /**
     * Search issues by title containing text (case insensitive)
     */
    List<Issue> findByTitleContainingIgnoreCase(String title);

    /**
     * Search issues by description containing text (case insensitive)
     */
    List<Issue> findByDescriptionContainingIgnoreCase(String description);

    /**
     * Find issues created between dates
     */
    List<Issue> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find issues by due date before specified date
     */
    List<Issue> findByDueDateBefore(LocalDateTime date);

    /**
     * Find issues by due date after specified date
     */
    List<Issue> findByDueDateAfter(LocalDateTime date);

    /**
     * Find issues by due date between dates
     */
    List<Issue> findByDueDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find overdue issues
     */
    @Query("SELECT i FROM Issue i WHERE i.dueDate < :now AND i.status != 'DONE'")
    List<Issue> findOverdueIssues(@Param("now") LocalDateTime now);

    /**
     * Count issues by status
     */
    long countByStatus(TaskStatus status);

    /**
     * Count issues by story
     */
    long countByStoryId(String storyId);

    /**
     * Find issues assigned to user with specific status
     */
    List<Issue> findByAssigneeIdAndStatus(String assigneeId, TaskStatus status);

    /**
     * Find issues in story with specific status
     */
    List<Issue> findByStoryIdAndStatus(String storyId, TaskStatus status);

    /**
     * Find unassigned issues
     */
    @Query("SELECT i FROM Issue i WHERE i.assigneeId IS NULL")
    List<Issue> findUnassignedIssues();

    /**
     * Find the maximum issue number for a given story
     */
    @Query("SELECT COALESCE(MAX(i.issueNumber), 0) FROM Issue i WHERE i.storyId = :storyId")
    Integer findMaxIssueNumberByStoryId(@Param("storyId") String storyId);

    /**
     * Find issue with raw status value (for custom lane statuses)
     */
    @Query(value = "SELECT status FROM issues WHERE id = :issueId", nativeQuery = true)
    String findStatusById(@Param("issueId") String issueId);

    /**
     * Update issue status directly using native query (for custom lane statuses)
     */
    @Query(value = "UPDATE issues SET status = :statusValue, updated_at = NOW() WHERE id = :issueId", nativeQuery = true)
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void updateIssueStatusDirectly(@Param("issueId") String issueId, @Param("statusValue") String statusValue);

    /**
     * Calculate total hours worked by issue.
     * 
     * @param issueId the issue ID
     * @return sum of hours worked on the issue
     */
    @Query("SELECT COALESCE(SUM(t.hoursWorked), 0) FROM TimeEntry t WHERE t.issueId = :issueId")
    java.math.BigDecimal sumHoursWorkedByIssueId(@Param("issueId") String issueId);

    /**
     * Fetch bug report data with joined information from related tables.
     * This query retrieves issues along with their story, sprint, project, and user
     * information.
     */
    @Query(value = """
            SELECT
                i.id as defectCode,
                i.title as defectName,
                COALESCE(
                    CASE
                        WHEN i.labels::text LIKE '%bug%' OR i.labels::text LIKE '%defect%' THEN 'Bug'
                        ELSE 'Issue'
                    END,
                    'Issue'
                ) as type,
                i.story_id as parentCode,
                s.id as storyCode,
                s.title as storyName,
                NULL as linkedToTask,
                COALESCE(u_assignee.name, 'Unassigned') as assignedTo,
                i.assignee_id as assignedToId,
                i.status as workflowLane,
                i.priority as priority,
                CASE
                    WHEN i.priority = 'critical' THEN 'Critical'
                    WHEN i.priority = 'high' THEN 'Major'
                    WHEN i.priority = 'medium' THEN 'Moderate'
                    WHEN i.priority = 'low' THEN 'Minor'
                    ELSE 'Minor'
                END as severity,
                COALESCE(
                    CASE
                        WHEN i.labels::text LIKE '%ui%' OR i.labels::text LIKE '%frontend%' THEN 'UI'
                        WHEN i.labels::text LIKE '%backend%' OR i.labels::text LIKE '%api%' THEN 'Backend'
                        WHEN i.labels::text LIKE '%database%' OR i.labels::text LIKE '%db%' THEN 'Database'
                        ELSE 'General'
                    END,
                    'General'
                ) as defectCategory,
                CASE
                    WHEN i.status = 'done' OR i.status = 'closed' THEN 'Resolved'
                    WHEN i.status = 'in_progress' OR i.status = 'in_review' THEN 'In Progress'
                    WHEN i.status = 'to_do' OR i.status = 'backlog' THEN 'Open'
                    ELSE 'Open'
                END as resolution,
                COALESCE(u_reporter.name, 'Unknown') as reportedBy,
                i.reporter_id as reportedById,
                TO_CHAR(i.created_at, 'YYYY-MM-DD') as createdDate,
                COALESCE(r.version, 'Not Assigned') as release,
                COALESCE(spr.name, 'Backlog') as sprint,
                COALESCE(p.name, 'Unknown') as board
            FROM issues i
            LEFT JOIN stories s ON i.story_id = s.id
            LEFT JOIN sprints spr ON s.sprint_id = spr.id
            LEFT JOIN projects p ON s.project_id = p.id
            LEFT JOIN releases r ON s.release_id = r.id
            LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
            LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
            ORDER BY i.created_at DESC
            """, nativeQuery = true)
    List<Object[]> findBugReportData();

    /**
     * Fetch bug report data filtered by project name.
     * Note: Filters by name (not ID) to match frontend filtering logic
     */
    @Query(value = """
            SELECT
                i.id as defectCode,
                i.title as defectName,
                COALESCE(
                    CASE
                        WHEN i.labels::text LIKE '%bug%' OR i.labels::text LIKE '%defect%' THEN 'Bug'
                        ELSE 'Issue'
                    END,
                    'Issue'
                ) as type,
                i.story_id as parentCode,
                s.id as storyCode,
                s.title as storyName,
                NULL as linkedToTask,
                COALESCE(u_assignee.name, 'Unassigned') as assignedTo,
                i.assignee_id as assignedToId,
                i.status as workflowLane,
                i.priority as priority,
                CASE
                    WHEN i.priority = 'critical' THEN 'Critical'
                    WHEN i.priority = 'high' THEN 'Major'
                    WHEN i.priority = 'medium' THEN 'Moderate'
                    WHEN i.priority = 'low' THEN 'Minor'
                    ELSE 'Minor'
                END as severity,
                COALESCE(
                    CASE
                        WHEN i.labels::text LIKE '%ui%' OR i.labels::text LIKE '%frontend%' THEN 'UI'
                        WHEN i.labels::text LIKE '%backend%' OR i.labels::text LIKE '%api%' THEN 'Backend'
                        WHEN i.labels::text LIKE '%database%' OR i.labels::text LIKE '%db%' THEN 'Database'
                        ELSE 'General'
                    END,
                    'General'
                ) as defectCategory,
                CASE
                    WHEN i.status = 'done' OR i.status = 'closed' THEN 'Resolved'
                    WHEN i.status = 'in_progress' OR i.status = 'in_review' THEN 'In Progress'
                    WHEN i.status = 'to_do' OR i.status = 'backlog' THEN 'Open'
                    ELSE 'Open'
                END as resolution,
                COALESCE(u_reporter.name, 'Unknown') as reportedBy,
                i.reporter_id as reportedById,
                TO_CHAR(i.created_at, 'YYYY-MM-DD') as createdDate,
                COALESCE(r.version, 'Not Assigned') as release,
                COALESCE(spr.name, 'Backlog') as sprint,
                COALESCE(p.name, 'Unknown') as board
            FROM issues i
            LEFT JOIN stories s ON i.story_id = s.id
            LEFT JOIN projects p ON s.project_id = p.id
            LEFT JOIN sprints spr ON s.sprint_id = spr.id
            LEFT JOIN releases r ON s.release_id = r.id
            LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
            LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
            WHERE p.name = :projectName
            ORDER BY i.created_at DESC
            """, nativeQuery = true)
    List<Object[]> findBugReportDataByProject(@Param("projectName") String projectName);

    /**
     * Fetch bug report data filtered by both project name and sprint name.
     * Note: Filters by names (not IDs) to match frontend filtering logic
     */
    @Query(value = """
            SELECT
                i.id as defectCode,
                i.title as defectName,
                COALESCE(
                    CASE
                        WHEN i.labels::text LIKE '%bug%' OR i.labels::text LIKE '%defect%' THEN 'Bug'
                        ELSE 'Issue'
                    END,
                    'Issue'
                ) as type,
                i.story_id as parentCode,
                s.id as storyCode,
                s.title as storyName,
                NULL as linkedToTask,
                COALESCE(u_assignee.name, 'Unassigned') as assignedTo,
                i.assignee_id as assignedToId,
                i.status as workflowLane,
                i.priority as priority,
                CASE
                    WHEN i.priority = 'critical' THEN 'Critical'
                    WHEN i.priority = 'high' THEN 'Major'
                    WHEN i.priority = 'medium' THEN 'Moderate'
                    WHEN i.priority = 'low' THEN 'Minor'
                    ELSE 'Minor'
                END as severity,
                COALESCE(
                    CASE
                        WHEN i.labels::text LIKE '%ui%' OR i.labels::text LIKE '%frontend%' THEN 'UI'
                        WHEN i.labels::text LIKE '%backend%' OR i.labels::text LIKE '%api%' THEN 'Backend'
                        WHEN i.labels::text LIKE '%database%' OR i.labels::text LIKE '%db%' THEN 'Database'
                        ELSE 'General'
                    END,
                    'General'
                ) as defectCategory,
                CASE
                    WHEN i.status = 'done' OR i.status = 'closed' THEN 'Resolved'
                    WHEN i.status = 'in_progress' OR i.status = 'in_review' THEN 'In Progress'
                    WHEN i.status = 'to_do' OR i.status = 'backlog' THEN 'Open'
                    ELSE 'Open'
                END as resolution,
                COALESCE(u_reporter.name, 'Unknown') as reportedBy,
                i.reporter_id as reportedById,
                TO_CHAR(i.created_at, 'YYYY-MM-DD') as createdDate,
                COALESCE(r.version, 'Not Assigned') as release,
                COALESCE(spr.name, 'Backlog') as sprint,
                COALESCE(p.name, 'Unknown') as board
            FROM issues i
            LEFT JOIN stories s ON i.story_id = s.id
            LEFT JOIN sprints spr ON s.sprint_id = spr.id
            LEFT JOIN projects p ON s.project_id = p.id
            LEFT JOIN releases r ON s.release_id = r.id
            LEFT JOIN users u_assignee ON i.assignee_id = u_assignee.id
            LEFT JOIN users u_reporter ON i.reporter_id = u_reporter.id
            WHERE (:projectName IS NULL OR p.name = :projectName)
              AND (:sprintName IS NULL OR spr.name = :sprintName)
            ORDER BY i.created_at DESC
            """, nativeQuery = true)
    List<Object[]> findBugReportDataByProjectAndSprint(@Param("projectName") String projectName,
            @Param("sprintName") String sprintName);
    /**
     * Calculate total subtask actual hours for an issue
     */
    @Query("SELECT COALESCE(SUM(s.actualHours), 0) FROM Subtask s WHERE s.issueId = :issueId")
    java.math.BigDecimal sumSubtaskHoursByIssueId(@Param("issueId") String issueId);
}
