package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Epic;
import com.sprintsync.api.entity.enums.EpicStatus;
import com.sprintsync.api.entity.enums.Priority;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
// import java.util.String; // Removed - using String IDs

/**
 * Repository interface for Epic entity operations.
 * Provides CRUD operations and custom query methods for epic management.
 * 
 * @author Mayuresh G
 */
@Repository
public interface EpicRepository extends JpaRepository<Epic, String> {

    /**
     * Find epics by project.
     * 
     * @param projectId the project ID
     * @return list of epics in the specified project
     */
    List<Epic> findByProjectId(String projectId);

    /**
     * Find epics by status.
     * 
     * @param status the epic status
     * @return list of epics with the specified status
     */
    List<Epic> findByStatus(EpicStatus status);

    /**
     * Find epics by priority.
     * 
     * @param priority the epic priority
     * @return list of epics with the specified priority
     */
    List<Epic> findByPriority(Priority priority);

    /**
     * Find epics by assignee.
     * 
     * @param assigneeId the assignee ID
     * @return list of epics assigned to the specified user
     */
    List<Epic> findByAssigneeId(String assigneeId);

    /**
     * Find epics by owner.
     * 
     * @param owner the owner ID
     * @return list of epics owned by the specified user
     */
    List<Epic> findByOwner(String owner);

    /**
     * Find epics by project with pagination.
     * 
     * @param projectId the project ID
     * @param pageable pagination information
     * @return page of epics in the specified project
     */
    Page<Epic> findByProjectId(String projectId, Pageable pageable);

    /**
     * Find epics by status with pagination.
     * 
     * @param status the epic status
     * @param pageable pagination information
     * @return page of epics with the specified status
     */
    Page<Epic> findByStatus(EpicStatus status, Pageable pageable);

    /**
     * Find epics by title containing (case-insensitive).
     * 
     * @param title the title to search for
     * @return list of epics with titles containing the search term
     */
    List<Epic> findByTitleContainingIgnoreCase(String title);

    /**
     * Find epics by theme.
     * 
     * @param theme the epic theme
     * @return list of epics with the specified theme
     */
    List<Epic> findByTheme(String theme);

    /**
     * Find epics starting after a specific date.
     * 
     * @param startDate the start date
     * @return list of epics starting after the specified date
     */
    List<Epic> findByStartDateAfter(LocalDate startDate);

    /**
     * Find epics ending before a specific date.
     * 
     * @param endDate the end date
     * @return list of epics ending before the specified date
     */
    List<Epic> findByEndDateBefore(LocalDate endDate);

    /**
     * Find epics with progress greater than or equal to specified value.
     * 
     * @param progress the minimum progress percentage
     * @return list of epics with progress >= specified value
     */
    List<Epic> findByProgressGreaterThanEqual(Integer progress);

    /**
     * Find epics with story points greater than or equal to specified value.
     * 
     * @param storyPoints the minimum story points
     * @return list of epics with story points >= specified value
     */
    List<Epic> findByStoryPointsGreaterThanEqual(Integer storyPoints);

    /**
     * Custom query to find epics by multiple criteria.
     * 
     * @param projectId the project ID
     * @param status the epic status
     * @param priority the epic priority
     * @param assigneeId the assignee ID
     * @return list of epics matching all criteria
     */
    @Query("SELECT e FROM Epic e WHERE " +
           "(:projectId IS NULL OR e.projectId = :projectId) AND " +
           "(:status IS NULL OR e.status = :status) AND " +
           "(:priority IS NULL OR e.priority = :priority) AND " +
           "(:assigneeId IS NULL OR e.assigneeId = :assigneeId)")
    List<Epic> findEpicsByCriteria(@Param("projectId") String projectId,
                                  @Param("status") EpicStatus status,
                                  @Param("priority") Priority priority,
                                  @Param("assigneeId") String assigneeId);

    /**
     * Custom query to find active epics by project.
     * 
     * @param projectId the project ID
     * @return list of active epics in the specified project
     */
    @Query("SELECT e FROM Epic e WHERE e.projectId = :projectId AND e.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Epic> findActiveEpicsByProject(@Param("projectId") String projectId);

    /**
     * Custom query to find epics by assignee with status.
     * 
     * @param assigneeId the assignee ID
     * @param status the epic status
     * @return list of epics assigned to user with specified status
     */
    @Query("SELECT e FROM Epic e WHERE e.assigneeId = :assigneeId AND e.status = :status")
    List<Epic> findEpicsByAssigneeAndStatus(@Param("assigneeId") String assigneeId,
                                           @Param("status") EpicStatus status);

    /**
     * Custom query to find epics by date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of epics within the specified date range
     */
    @Query("SELECT e FROM Epic e WHERE " +
           "e.startDate <= :endDate AND " +
           "(e.endDate IS NULL OR e.endDate >= :startDate)")
    List<Epic> findEpicsByDateRange(@Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);

    /**
     * Custom query to count epics by status in project.
     * 
     * @param projectId the project ID
     * @param status the epic status
     * @return count of epics with the specified status in project
     */
    @Query("SELECT COUNT(e) FROM Epic e WHERE e.projectId = :projectId AND e.status = :status")
    long countByProjectIdAndStatus(@Param("projectId") String projectId,
                                  @Param("status") EpicStatus status);

    /**
     * Custom query to find overdue epics.
     * 
     * @param currentDate the current date
     * @return list of overdue epics
     */
    @Query("SELECT e FROM Epic e WHERE " +
           "e.endDate < :currentDate AND " +
           "e.status NOT IN ('COMPLETED', 'CANCELLED')")
    List<Epic> findOverdueEpics(@Param("currentDate") LocalDate currentDate);

    /**
     * Custom query to calculate total story points by project.
     * 
     * @param projectId the project ID
     * @return total story points for the project
     */
    @Query("SELECT COALESCE(SUM(e.storyPoints), 0) FROM Epic e WHERE e.projectId = :projectId")
    Long getTotalStoryPointsByProject(@Param("projectId") String projectId);

    /**
     * Custom query to calculate completed story points by project.
     * 
     * @param projectId the project ID
     * @return total completed story points for the project
     */
    @Query("SELECT COALESCE(SUM(e.completedStoryPoints), 0) FROM Epic e WHERE e.projectId = :projectId")
    Long getCompletedStoryPointsByProject(@Param("projectId") String projectId);
}
