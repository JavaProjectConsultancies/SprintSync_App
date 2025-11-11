package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Task;
import com.sprintsync.api.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
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
     * Count tasks created between dates
     */
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Count tasks created between dates with the given status
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.createdAt BETWEEN :startDate AND :endDate AND t.status = :status")
    long countByCreatedAtBetweenAndStatus(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate,
                                         @Param("status") TaskStatus status);

    /**
     * Find tasks updated between dates
     */
    List<Task> findByUpdatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Find tasks by due date before specified date
     */
    List<Task> findByDueDateBefore(LocalDate date);

    /**
     * Find tasks by due date after specified date
     */
    List<Task> findByDueDateAfter(LocalDate date);

    /**
     * Find tasks by due date between dates
     */
    List<Task> findByDueDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Find overdue tasks (due date before now and status not completed)
     */
    @Query("SELECT t FROM Task t WHERE t.dueDate IS NOT NULL AND t.dueDate < :today AND t.status <> :completedStatus")
    List<Task> findOverdueTasks(@Param("today") LocalDate today, @Param("completedStatus") TaskStatus completedStatus);

    /**
     * Count overdue tasks (due date before now and status not completed)
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.dueDate IS NOT NULL AND t.dueDate < :today AND t.status <> :completedStatus")
    long countOverdueTasks(@Param("today") LocalDate today, @Param("completedStatus") TaskStatus completedStatus);

    /**
     * Find tasks due soon (due date within specified days)
     */
    @Query("SELECT t FROM Task t WHERE t.dueDate BETWEEN :today AND :dueSoon AND t.status <> :completedStatus")
    List<Task> findTasksDueSoon(@Param("today") LocalDate today,
                                @Param("dueSoon") LocalDate dueSoon,
                                @Param("completedStatus") TaskStatus completedStatus);

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
     * Count tasks by assignee and status
     */
    long countByAssigneeIdAndStatus(String assigneeId, TaskStatus status);

    /**
     * Count tasks by story
     */
    long countByStoryId(String storyId);

    /**
     * Count tasks across multiple stories.
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.storyId IN :storyIds")
    long countByStoryIds(@Param("storyIds") Collection<String> storyIds);

    /**
     * Count tasks with a given status across multiple stories.
     */
    @Query("SELECT COUNT(t) FROM Task t WHERE t.storyId IN :storyIds AND t.status = :status")
    long countByStoryIdsAndStatus(@Param("storyIds") Collection<String> storyIds, @Param("status") TaskStatus status);

    /**
     * Count tasks grouped by status without loading entities
     */
    @Query("SELECT t.status, COUNT(t) FROM Task t GROUP BY t.status")
    List<Object[]> countTasksByStatus();

    /**
     * Count tasks grouped by priority without loading entities
     */
    @Query("SELECT t.priority, COUNT(t) FROM Task t GROUP BY t.priority")
    List<Object[]> countTasksByPriority();

    /**
     * Count tasks for the given assignees
     */
    @Query("SELECT t.assigneeId, COUNT(t) FROM Task t WHERE t.assigneeId IN :assigneeIds GROUP BY t.assigneeId")
    List<Object[]> countTasksByAssigneeIds(@Param("assigneeIds") Collection<String> assigneeIds);

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
     * Find recent tasks updated after the given timestamp (limited to 10)
     */
    List<Task> findTop10ByUpdatedAtAfterOrderByUpdatedAtDesc(LocalDateTime since);

    /**
     * Find recent tasks for an assignee (limited to 10)
     */
    List<Task> findTop10ByAssigneeIdOrderByUpdatedAtDesc(String assigneeId);

    /**
     * Find recent tasks for an assignee updated after the given timestamp (limited to 10)
     */
    List<Task> findTop10ByAssigneeIdAndUpdatedAtAfterOrderByUpdatedAtDesc(String assigneeId, LocalDateTime since);

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

    /**
     * Update task status directly using native query (for custom lane statuses)
     */
    @Query(value = "UPDATE tasks SET status = :statusValue, updated_at = NOW() WHERE id = :taskId", nativeQuery = true)
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    void updateTaskStatusDirectly(@Param("taskId") String taskId, @Param("statusValue") String statusValue);
    
    /**
     * Find task with raw status value (for custom lane statuses)
     * This query returns the raw status string from the database
     */
    @Query(value = "SELECT status FROM tasks WHERE id = :taskId", nativeQuery = true)
    String findStatusById(@Param("taskId") String taskId);
    
    /**
     * Find all tasks with raw status values (for custom lane statuses)
     * This returns tasks with their raw status strings from the database
     */
    @Query(value = "SELECT t.*, t.status as raw_status FROM tasks t WHERE t.story_id = :storyId", nativeQuery = true)
    List<Object[]> findTasksWithRawStatusByStoryId(@Param("storyId") String storyId);
    
    /**
     * Find the maximum task number for a given story
     * Used to assign sequential task numbers when creating new tasks
     */
    @Query("SELECT COALESCE(MAX(t.taskNumber), 0) FROM Task t WHERE t.storyId = :storyId")
    Integer findMaxTaskNumberByStoryId(@Param("storyId") String storyId);
}
