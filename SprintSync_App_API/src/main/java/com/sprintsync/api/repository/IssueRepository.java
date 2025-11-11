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
}

