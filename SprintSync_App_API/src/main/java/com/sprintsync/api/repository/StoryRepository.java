package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Story;
import com.sprintsync.api.entity.enums.StoryPriority;
import com.sprintsync.api.entity.enums.StoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository interface for Story entity operations.
 * Provides CRUD operations and custom query methods for story management.
 * 
 * @author Mayuresh G
 */
@Repository
public interface StoryRepository extends JpaRepository<Story, String> {

    /**
     * Find stories by project ID.
     * 
     * @param projectId the project ID
     * @return list of stories for the specified project
     */
    List<Story> findByProjectId(String projectId);

    /**
     * Find stories by sprint ID.
     * 
     * @param sprintId the sprint ID
     * @return list of stories in the specified sprint
     */
    List<Story> findBySprintId(String sprintId);

    /**
     * Find stories by epic ID.
     * 
     * @param epicId the epic ID
     * @return list of stories belonging to the specified epic
     */
    List<Story> findByEpicId(String epicId);

    /**
     * Find stories by release ID.
     * 
     * @param releaseId the release ID
     * @return list of stories included in the specified release
     */
    List<Story> findByReleaseId(String releaseId);

    /**
     * Find stories by status.
     * 
     * @param status the story status
     * @return list of stories with the specified status
     */
    List<Story> findByStatus(StoryStatus status);

    /**
     * Find stories by priority.
     * 
     * @param priority the story priority
     * @return list of stories with the specified priority
     */
    List<Story> findByPriority(StoryPriority priority);

    /**
     * Find stories by assignee ID.
     * 
     * @param assigneeId the assignee ID
     * @return list of stories assigned to the specified user
     */
    List<Story> findByAssigneeId(String assigneeId);

    /**
     * Find stories by reporter ID.
     * 
     * @param reporterId the reporter ID
     * @return list of stories reported by the specified user
     */
    List<Story> findByReporterId(String reporterId);

    /**
     * Find stories by project ID with pagination.
     * 
     * @param projectId the project ID
     * @param pageable pagination information
     * @return page of stories for the specified project
     */
    Page<Story> findByProjectId(String projectId, Pageable pageable);

    /**
     * Find stories by sprint ID with pagination.
     * 
     * @param sprintId the sprint ID
     * @param pageable pagination information
     * @return page of stories in the specified sprint
     */
    Page<Story> findBySprintId(String sprintId, Pageable pageable);

    /**
     * Find stories by status with pagination.
     * 
     * @param status the story status
     * @param pageable pagination information
     * @return page of stories with the specified status
     */
    Page<Story> findByStatus(StoryStatus status, Pageable pageable);

    /**
     * Search stories by title (case-insensitive).
     * 
     * @param title the title to search for
     * @return list of stories with titles containing the search term
     */
    List<Story> findByTitleContainingIgnoreCase(String title);

    /**
     * Find stories with story points greater than or equal to specified value.
     * 
     * @param storyPoints the minimum story points
     * @return list of stories with story points >= specified value
     */
    List<Story> findByStoryPointsGreaterThanEqual(Integer storyPoints);

    /**
     * Find stories with actual hours greater than estimated hours.
     * 
     * @return list of stories exceeding estimated hours
     */
    @Query("SELECT s FROM Story s WHERE s.actualHours > s.estimatedHours")
    List<Story> findStoriesExceedingEstimatedHours();

    /**
     * Find stories with no assignee.
     * 
     * @return list of unassigned stories
     */
    @Query("SELECT s FROM Story s WHERE s.assigneeId IS NULL")
    List<Story> findUnassignedStories();

    /**
     * Find stories by multiple criteria.
     * 
     * @param projectId the project ID (optional)
     * @param sprintId the sprint ID (optional)
     * @param epicId the epic ID (optional)
     * @param status the story status (optional)
     * @param priority the story priority (optional)
     * @param assigneeId the assignee ID (optional)
     * @return list of stories matching the criteria
     */
    @Query("SELECT s FROM Story s WHERE " +
           "(:projectId IS NULL OR s.projectId = :projectId) AND " +
           "(:sprintId IS NULL OR s.sprintId = :sprintId) AND " +
           "(:epicId IS NULL OR s.epicId = :epicId) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:priority IS NULL OR s.priority = :priority) AND " +
           "(:assigneeId IS NULL OR s.assigneeId = :assigneeId)")
    List<Story> findStoriesByCriteria(@Param("projectId") String projectId,
                                     @Param("sprintId") String sprintId,
                                     @Param("epicId") String epicId,
                                     @Param("status") StoryStatus status,
                                     @Param("priority") StoryPriority priority,
                                     @Param("assigneeId") String assigneeId);

    /**
     * Count stories by status.
     * 
     * @param status the story status
     * @return count of stories with the specified status
     */
    long countByStatus(StoryStatus status);

    /**
     * Count stories by priority.
     * 
     * @param priority the story priority
     * @return count of stories with the specified priority
     */
    long countByPriority(StoryPriority priority);

    /**
     * Count stories by project ID.
     * 
     * @param projectId the project ID
     * @return count of stories for the specified project
     */
    long countByProjectId(String projectId);

    /**
     * Count stories by sprint ID.
     * 
     * @param sprintId the sprint ID
     * @return count of stories in the specified sprint
     */
    long countBySprintId(String sprintId);

    /**
     * Calculate total story points by project ID.
     * 
     * @param projectId the project ID
     * @return sum of story points for the specified project
     */
    @Query("SELECT COALESCE(SUM(s.storyPoints), 0) FROM Story s WHERE s.projectId = :projectId")
    Integer sumStoryPointsByProjectId(@Param("projectId") String projectId);

    /**
     * Calculate total story points by sprint ID.
     * 
     * @param sprintId the sprint ID
     * @return sum of story points for the specified sprint
     */
    @Query("SELECT COALESCE(SUM(s.storyPoints), 0) FROM Story s WHERE s.sprintId = :sprintId")
    Integer sumStoryPointsBySprintId(@Param("sprintId") String sprintId);

    /**
     * Calculate total actual hours by project ID.
     * 
     * @param projectId the project ID
     * @return sum of actual hours for the specified project
     */
    @Query("SELECT COALESCE(SUM(s.actualHours), 0) FROM Story s WHERE s.projectId = :projectId")
    BigDecimal sumActualHoursByProjectId(@Param("projectId") String projectId);

    /**
     * Calculate total estimated hours by project ID.
     * 
     * @param projectId the project ID
     * @return sum of estimated hours for the specified project
     */
    @Query("SELECT COALESCE(SUM(s.estimatedHours), 0) FROM Story s WHERE s.projectId = :projectId")
    BigDecimal sumEstimatedHoursByProjectId(@Param("projectId") String projectId);

    /**
     * Find stories ordered by order index for a specific sprint.
     * 
     * @param sprintId the sprint ID
     * @return list of stories ordered by order index
     */
    @Query("SELECT s FROM Story s WHERE s.sprintId = :sprintId ORDER BY s.orderIndex ASC")
    List<Story> findStoriesBySprintOrderedByIndex(@Param("sprintId") String sprintId);

    /**
     * Find stories with no sprint assignment.
     * 
     * @param projectId the project ID
     * @return list of stories not assigned to any sprint
     */
    @Query("SELECT s FROM Story s WHERE s.projectId = :projectId AND s.sprintId IS NULL")
    List<Story> findStoriesWithoutSprint(@Param("projectId") String projectId);
}
