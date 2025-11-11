package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Repository interface for Subtask entity operations.
 * Extends JpaRepository to provide CRUD operations and custom queries.
 * 
 * @author Mayuresh G
 */
@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, String> {

    /**
     * Find subtasks by task ID
     */
    List<Subtask> findByTaskId(String taskId);

    /**
     * Find subtasks by issue ID
     */
    List<Subtask> findByIssueId(String issueId);

    /**
     * Find subtasks by assignee ID
     */
    List<Subtask> findByAssigneeId(String assigneeId);

    /**
     * Find subtasks by completion status
     */
    List<Subtask> findByIsCompleted(Boolean isCompleted);
    long countByIsCompleted(Boolean isCompleted);

    /**
     * Find subtasks by status
     */
    // Note: Subtask entity doesn't have status field - use findByIsCompleted instead

    /**
     * Find subtasks by priority
     */
    // Note: Subtask entity doesn't have priority field in current database schema

    /**
     * Find subtasks by story ID
     */
    // Note: Subtask entity doesn't have storyId field - subtasks are related to stories through tasks

    /**
     * Find subtasks by sprint ID
     */
    // Note: Subtask entity doesn't have sprintId field - subtasks are related to sprints through tasks and stories

    /**
     * Find subtasks by project ID
     */
    // Note: Subtask entity doesn't have projectId field - subtasks are related to projects through tasks and stories

    /**
     * Find subtasks by epic ID
     */
    // Note: Subtask entity doesn't have epicId field - subtasks are related to epics through tasks and stories

    /**
     * Find subtasks by release ID
     */
    // Note: Subtask entity doesn't have releaseId field - subtasks are related to releases through tasks and stories

    /**
     * Search subtasks by title containing text (case insensitive)
     */
    List<Subtask> findByTitleContainingIgnoreCase(String title);

    /**
     * Search subtasks by description containing text (case insensitive)
     */
    List<Subtask> findByDescriptionContainingIgnoreCase(String description);

    /**
     * Search subtasks by title or description containing text (case insensitive)
     */
    List<Subtask> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    /**
     * Find subtasks created between dates
     */
    List<Subtask> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find subtasks updated between dates
     */
    List<Subtask> findByUpdatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find subtasks by due date before specified date
     */
    List<Subtask> findByDueDateBefore(LocalDate date);

    /**
     * Find subtasks by due date after specified date
     */
    List<Subtask> findByDueDateAfter(LocalDate date);

    /**
     * Find subtasks by due date between dates
     */
    List<Subtask> findByDueDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Find overdue subtasks (due date before today and not completed)
     */
    @Query("SELECT s FROM Subtask s WHERE s.dueDate IS NOT NULL AND s.dueDate < :today AND s.isCompleted = false")
    List<Subtask> findOverdueSubtasks(@Param("today") LocalDate today);

    /**
     * Count overdue subtasks (due date before today and not completed)
     */
    @Query("SELECT COUNT(s) FROM Subtask s WHERE s.dueDate IS NOT NULL AND s.dueDate < :today AND s.isCompleted = false")
    long countOverdueSubtasks(@Param("today") LocalDate today);

    /**
     * Find subtasks without assignee
     */
    @Query("SELECT s FROM Subtask s WHERE s.assigneeId IS NULL")
    List<Subtask> findUnassignedSubtasks();

    /**
     * Find subtasks without due date
     */
    @Query("SELECT s FROM Subtask s WHERE s.dueDate IS NULL")
    List<Subtask> findSubtasksWithoutDueDate();

    /**
     * Find subtasks by estimated effort between values
     */
    // Note: Subtask entity has estimatedHours (BigDecimal), not estimatedEffort (Integer)

    /**
     * Find subtasks by estimated effort greater than or equal to
     */
    // Note: Subtask entity has estimatedHours (BigDecimal), not estimatedEffort (Integer)

    /**
     * Find subtasks by estimated effort less than or equal to
     */
    // Note: Subtask entity has estimatedHours (BigDecimal), not estimatedEffort (Integer)

    /**
     * Find subtasks by actual effort between values
     */
    // Note: Subtask entity has actualHours (BigDecimal), not actualEffort (Integer)

    /**
     * Find subtasks with time tracking
     */
    @Query("SELECT s FROM Subtask s WHERE s.estimatedHours IS NOT NULL OR s.actualHours IS NOT NULL")
    List<Subtask> findSubtasksWithTimeTracking();

    /**
     * Find subtasks by effort variance (actual vs estimated)
     */
    @Query("SELECT s FROM Subtask s WHERE s.estimatedHours IS NOT NULL AND s.actualHours IS NOT NULL AND ABS(s.actualHours - s.estimatedHours) > :variance")
    List<Subtask> findSubtasksByEffortVariance(@Param("variance") Integer variance);

    /**
     * Count subtasks by status
     */
    // Note: Subtask entity doesn't have status field - use countByIsCompleted instead

    /**
     * Count subtasks by priority
     */
    // Note: Subtask entity doesn't have priority field in current database schema

    /**
     * Count subtasks by assignee
     */
    long countByAssigneeId(String assigneeId);

    /**
     * Count subtasks by assignee and completion status
     */
    long countByAssigneeIdAndIsCompleted(String assigneeId, Boolean isCompleted);

    /**
     * Count subtasks for the given assignees
     */
    @Query("SELECT s.assigneeId, COUNT(s) FROM Subtask s WHERE s.assigneeId IN :assigneeIds GROUP BY s.assigneeId")
    List<Object[]> countSubtasksByAssigneeIds(@Param("assigneeIds") Collection<String> assigneeIds);

    /**
     * Count subtasks by task
     */
    long countByTaskId(String taskId);

    /**
     * Count subtasks by story
     */
    // Note: Subtask entity doesn't have storyId field - subtasks are related to stories through tasks

    /**
     * Count subtasks by sprint
     */
    // Note: Subtask entity doesn't have sprintId field - subtasks are related to sprints through tasks and stories

    /**
     * Count subtasks by project
     */
    // Note: Subtask entity doesn't have projectId field - subtasks are related to projects through tasks and stories

    /**
     * Find subtasks with high priority
     */
    // Note: Subtask entity doesn't have priority field in current database schema

    /**
     * Find subtasks assigned to user with specific status
     */
    // Note: Subtask entity doesn't have status field - use findByAssigneeIdAndIsCompleted instead

    /**
     * Find subtasks in task with specific status
     */
    // Note: Subtask entity doesn't have status field - use findByTaskIdAndIsCompleted instead

    /**
     * Find subtasks in story with specific status
     */
    // Note: Subtask entity doesn't have status field - use findByStoryIdAndIsCompleted instead

    /**
     * Find subtasks in sprint with specific status
     */
    // Note: Subtask entity doesn't have sprintId field - subtasks are related to sprints through tasks and stories

    /**
     * Find subtasks by multiple statuses
     */
    // Note: Subtask entity doesn't have status field - use findByIsCompleted instead

    /**
     * Find subtasks by multiple priorities
     */
    // Note: Subtask entity doesn't have priority field in current database schema

    /**
     * Find subtasks created by user
     */
    // Note: Subtask entity doesn't have createdBy field in current database schema

    /**
     * Find subtasks updated by user
     */
    // Note: Subtask entity doesn't have updatedBy field in current database schema

    /**
     * Find subtasks with tags containing specific tag
     */
    // Note: Subtask entity doesn't have tags field in current database schema

    /**
     * Find subtasks with dependencies
     */
    // Note: Subtask entity doesn't have dependencies field in current database schema

    /**
     * Find subtasks by complexity level
     */
    // Note: Subtask entity doesn't have complexity field in current database schema

    /**
     * Find subtasks by risk level
     */
    // Note: Subtask entity doesn't have riskLevel field in current database schema

    /**
     * Find blocked subtasks
     */
    // Note: Subtask entity doesn't have status field - use findByIsCompleted instead

    /**
     * Find subtasks by completion percentage
     */
    // Note: Subtask entity doesn't have completionPercentage field in current database schema

    /**
     * Find subtasks by completion percentage range
     */
    // Note: Subtask entity doesn't have completionPercentage field in current database schema

    /**
     * Find recently updated subtasks
     */
    @Query("SELECT s FROM Subtask s WHERE s.updatedAt >= :since ORDER BY s.updatedAt DESC")
    List<Subtask> findRecentlyUpdatedSubtasks(@Param("since") LocalDateTime since);

    /**
     * Find recent subtasks updated after the given timestamp (limited to 10)
     */
    List<Subtask> findTop10ByUpdatedAtAfterOrderByUpdatedAtDesc(LocalDateTime since);

    /**
     * Find recent subtasks for an assignee (limited to 10)
     */
    List<Subtask> findTop10ByAssigneeIdOrderByUpdatedAtDesc(String assigneeId);

    /**
     * Find recent subtasks for an assignee updated after the given timestamp (limited to 10)
     */
    List<Subtask> findTop10ByAssigneeIdAndUpdatedAtAfterOrderByUpdatedAtDesc(String assigneeId, LocalDateTime since);

    /**
     * Find subtasks by time spent
     */
    @Query("SELECT s FROM Subtask s WHERE s.actualHours >= :minTime ORDER BY s.actualHours DESC")
    List<Subtask> findSubtasksByTimeSpent(@Param("minTime") Integer minTime);

    /**
     * Find subtasks by time spent range
     */
    @Query("SELECT s FROM Subtask s WHERE s.actualHours BETWEEN :minTime AND :maxTime")
    List<Subtask> findSubtasksByTimeSpentBetween(@Param("minTime") Integer minTime, @Param("maxTime") Integer maxTime);

    /**
     * Get subtask statistics by task
     */
    // Note: Subtask entity doesn't have status field - use isCompleted instead

    /**
     * Get subtask statistics by story
     */
    // Note: Subtask entity doesn't have status field - use isCompleted instead

    /**
     * Get subtask statistics by sprint
     */
    // Note: Subtask entity doesn't have status field - use isCompleted instead

    /**
     * Get subtask statistics by project
     */
    // Note: Subtask entity doesn't have status field - use isCompleted instead

    /**
     * Find subtasks by epic and status
     */
    // Note: Subtask entity doesn't have epicId field - subtasks are related to epics through tasks and stories

    /**
     * Find subtasks by release and status
     */
    // Note: Subtask entity doesn't have releaseId field - subtasks are related to releases through tasks and stories

    /**
     * Find subtasks by project and status
     */
    // Note: Subtask entity doesn't have status field - use isCompleted instead

    /**
     * Find subtasks by assignee and priority
     */
    // Note: Subtask entity doesn't have priority field - use findByAssigneeId instead

    /**
     * Find subtasks by task and priority
     */
    // Note: Subtask entity doesn't have priority field - use findByTaskId instead

    /**
     * Find subtasks by story and priority
     */
    // Note: Subtask entity doesn't have priority field - use findByStoryId instead

    /**
     * Find subtasks by sprint and priority
     */
    // Note: Subtask entity doesn't have sprintId field - subtasks are related to sprints through tasks and stories

    /**
     * Find subtasks by epic and priority
     */
    // Note: Subtask entity doesn't have epicId field - subtasks are related to epics through tasks and stories

    /**
     * Find subtasks by release and priority
     */
    // Note: Subtask entity doesn't have releaseId field - subtasks are related to releases through tasks and stories

    /**
     * Find subtasks by project and priority
     */
    // Note: Subtask entity doesn't have priority field in current database schema

    /**
     * Find subtasks by multiple tasks
     */
    List<Subtask> findByTaskIdIn(List<String> taskIds);

    /**
     * Find subtasks by multiple stories
     */
    // Note: Subtask entity doesn't have storyId field - subtasks are related to stories through tasks

    /**
     * Find subtasks by multiple sprints
     */
    // Note: Subtask entity doesn't have sprintId field - subtasks are related to sprints through tasks and stories

    /**
     * Find subtasks by multiple projects
     */
    // Note: Subtask entity doesn't have projectId field - subtasks are related to projects through tasks and stories

    /**
     * Find subtasks by multiple epics
     */
    // Note: Subtask entity doesn't have epicId field - subtasks are related to epics through tasks and stories

    /**
     * Find subtasks by multiple releases
     */
    // Note: Subtask entity doesn't have releaseId field - subtasks are related to releases through tasks and stories

    /**
     * Find subtasks by multiple assignees
     */
    List<Subtask> findByAssigneeIdIn(List<String> assigneeIds);

    /**
     * Find subtasks by team ID
     */
    // Note: Subtask entity doesn't have teamId field in current database schema

    /**
     * Find subtasks by team and status
     */
    // Note: Subtask entity doesn't have status field - use isCompleted instead

    /**
     * Find subtasks by team and priority
     */
    // Note: Subtask entity doesn't have priority field in current database schema
}
