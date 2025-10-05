package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Task;
import com.sprintsync.api.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Task entity operations.
 * Extends JpaRepository to provide CRUD operations and custom queries.
 * 
 * @author Mayuresh G
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    /**
     * Find tasks by story ID
     */
    List<Task> findByStoryId(String storyId);

    /**
     * Find tasks by assignee ID
     */
    List<Task> findByAssigneeId(String assigneeId);

    /**
     * Find tasks by status
     */
    List<Task> findByStatus(TaskStatus status);

    /**
     * Find tasks by priority
     */
    List<Task> findByPriority(String priority);

    /**
     * Find tasks by sprint ID
     */
    // Note: Task entity doesn't have sprintId field - tasks are related to sprints through stories
    // Use findByStoryId instead and filter through stories

    /**
     * Find tasks by project ID
     */
    // Note: Task entity doesn't have projectId field - tasks are related to projects through stories
    // Use findByStoryId instead and filter through stories

    /**
     * Find tasks by epic ID
     */
    // Note: Task entity doesn't have epicId field - tasks are related to epics through stories

    /**
     * Find tasks by release ID
     */
    // Note: Task entity doesn't have releaseId field - tasks are related to releases through stories

    /**
     * Search tasks by title containing text (case insensitive)
     */
    List<Task> findByTitleContainingIgnoreCase(String title);

    /**
     * Search tasks by description containing text (case insensitive)
     */
    List<Task> findByDescriptionContainingIgnoreCase(String description);

    /**
     * Search tasks by title or description containing text (case insensitive)
     */
    List<Task> findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String title, String description);

    /**
     * Find tasks created between dates
     */
    List<Task> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find tasks updated between dates
     */
    List<Task> findByUpdatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find tasks by due date before specified date
     */
    List<Task> findByDueDateBefore(LocalDateTime date);

    /**
     * Find tasks by due date after specified date
     */
    List<Task> findByDueDateAfter(LocalDateTime date);

    /**
     * Find tasks by due date between dates
     */
    List<Task> findByDueDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find overdue tasks (due date before now and status not completed)
     */
    @Query("SELECT t FROM Task t WHERE t.dueDate < :now AND t.status != 'COMPLETED'")
    List<Task> findOverdueTasks(@Param("now") LocalDateTime now);

    /**
     * Find tasks due soon (due date within specified days)
     */
    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :now AND :dueSoon AND t.status != 'COMPLETED'")
    List<Task> findTasksDueSoon(@Param("now") LocalDateTime now, @Param("dueSoon") LocalDateTime dueSoon);

    /**
     * Count tasks by status
     */
    long countByStatus(TaskStatus status);

    /**
     * Count tasks by priority
     */
    long countByPriority(String priority);

    /**
     * Count tasks by assignee
     */
    long countByAssigneeId(String assigneeId);

    /**
     * Count tasks by story
     */
    long countByStoryId(String storyId);

    /**
     * Count tasks by sprint
     */
    // Note: Task entity doesn't have sprintId field - tasks are related to sprints through stories

    /**
     * Count tasks by project
     */
    // Note: Task entity doesn't have projectId field - tasks are related to projects through stories

    /**
     * Find tasks with high priority
     */
    @Query("SELECT t FROM Task t WHERE t.priority IN ('HIGH', 'CRITICAL')")
    List<Task> findHighPriorityTasks();

    /**
     * Find tasks assigned to user with specific status
     */
    List<Task> findByAssigneeIdAndStatus(String assigneeId, TaskStatus status);

    /**
     * Find tasks in story with specific status
     */
    List<Task> findByStoryIdAndStatus(String storyId, TaskStatus status);

    /**
     * Find tasks in sprint with specific status
     */
    // Note: Task entity doesn't have sprintId field - tasks are related to sprints through stories

    /**
     * Find tasks by multiple statuses
     */
    List<Task> findByStatusIn(List<TaskStatus> statuses);

    /**
     * Find tasks by multiple priorities
     */
    List<Task> findByPriorityIn(List<String> priorities);

    /**
     * Find tasks created by user
     */
    // Note: Task entity doesn't have createdBy field in current database schema

    /**
     * Find tasks updated by user
     */
    // Note: Task entity doesn't have updatedBy field in current database schema

    /**
     * Find tasks with estimated effort between values
     */
    // Note: Task entity has estimatedHours (BigDecimal), not estimatedEffort (Integer)
    // This would need to be implemented with a custom query

    /**
     * Find tasks with actual effort between values
     */
    // Note: Task entity has actualHours (BigDecimal), not actualEffort (Integer)
    // This would need to be implemented with a custom query

    /**
     * Find tasks without assignee
     */
    @Query("SELECT t FROM Task t WHERE t.assigneeId IS NULL")
    List<Task> findUnassignedTasks();

    /**
     * Find tasks without due date
     */
    @Query("SELECT t FROM Task t WHERE t.dueDate IS NULL")
    List<Task> findTasksWithoutDueDate();

    /**
     * Find tasks with tags containing specific tag
     */
    // Note: Task entity doesn't have tags field in current database schema

    /**
     * Get task statistics by project
     */
    // Note: Task entity doesn't have projectId field - tasks are related to projects through stories
    // This query would need to be rewritten to join with stories table

    /**
     * Get task statistics by sprint
     */
    // Note: Task entity doesn't have sprintId field - tasks are related to sprints through stories
    // This query would need to be rewritten to join with stories table

    /**
     * Get task statistics by story
     */
    @Query("SELECT t.status, COUNT(t) FROM Task t WHERE t.storyId = :storyId GROUP BY t.status")
    List<Object[]> getTaskStatusCountByStory(@Param("storyId") String storyId);

    /**
     * Find tasks with effort tracking
     */
    @Query("SELECT t FROM Task t WHERE t.estimatedHours IS NOT NULL OR t.actualHours IS NOT NULL")
    List<Task> findTasksWithEffortTracking();

    /**
     * Find tasks by effort variance (actual vs estimated)
     */
    @Query("SELECT t FROM Task t WHERE t.estimatedHours IS NOT NULL AND t.actualHours IS NOT NULL AND ABS(t.actualHours - t.estimatedHours) > :variance")
    List<Task> findTasksByEffortVariance(@Param("variance") Integer variance);

    /**
     * Find tasks by completion percentage
     */
    // Note: Task entity doesn't have completionPercentage field in current database schema

    /**
     * Find recently updated tasks
     */
    @Query("SELECT t FROM Task t WHERE t.updatedAt >= :since ORDER BY t.updatedAt DESC")
    List<Task> findRecentlyUpdatedTasks(@Param("since") LocalDateTime since);

    /**
     * Find tasks by complexity level
     */
    // Note: Task entity doesn't have complexity field in current database schema

    /**
     * Find tasks by risk level
     */
    // Note: Task entity doesn't have riskLevel field in current database schema

    /**
     * Find blocked tasks
     */
    @Query("SELECT t FROM Task t WHERE t.status = 'BLOCKED'")
    List<Task> findBlockedTasks();

    /**
     * Find tasks with dependencies
     */
    // Note: Task entity doesn't have dependencies field in current database schema

    /**
     * Find tasks by time spent
     */
    @Query("SELECT t FROM Task t WHERE t.actualHours >= :minTime ORDER BY t.actualHours DESC")
    List<Task> findTasksByTimeSpent(@Param("minTime") Integer minTime);
}
