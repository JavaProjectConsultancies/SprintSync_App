package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Sprint;
import com.sprintsync.api.entity.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Sprint entity operations.
 * Extends JpaRepository to provide CRUD operations and custom queries.
 * 
 * @author Mayuresh G
 */
@Repository
public interface SprintRepository extends JpaRepository<Sprint, String> {

    /**
     * Find sprints by project ID
     */
    List<Sprint> findByProjectId(String projectId);

    /**
     * Find sprints by status
     */
    List<Sprint> findByStatus(SprintStatus status);

    /**
     * Find current active sprint for a project
     */
    @Query("SELECT s FROM Sprint s WHERE s.projectId = :projectId AND s.status = 'ACTIVE' AND s.startDate <= CURRENT_DATE AND (s.endDate IS NULL OR s.endDate >= CURRENT_DATE)")
    Optional<Sprint> findCurrentSprintByProjectId(@Param("projectId") String projectId);

    /**
     * Find sprints by name containing text (case insensitive)
     */
    List<Sprint> findByNameContainingIgnoreCase(String name);

    // Note: Sprint entity has goal field, not description field

    /**
     * Find sprints by start date
     */
    List<Sprint> findByStartDate(LocalDate startDate);

    /**
     * Find sprints by end date
     */
    List<Sprint> findByEndDate(LocalDate endDate);

    /**
     * Find sprints by start date between dates
     */
    List<Sprint> findByStartDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Find sprints by end date between dates
     */
    List<Sprint> findByEndDateBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Find sprints by start date after specified date
     */
    List<Sprint> findByStartDateAfter(LocalDate date);

    /**
     * Find sprints by start date before specified date
     */
    List<Sprint> findByStartDateBefore(LocalDate date);

    /**
     * Find sprints by end date after specified date
     */
    List<Sprint> findByEndDateAfter(LocalDate date);

    /**
     * Find sprints by end date before specified date
     */
    List<Sprint> findByEndDateBefore(LocalDate date);

    /**
     * Find sprints with overlapping date ranges
     */
    @Query("SELECT s FROM Sprint s WHERE s.projectId = :projectId AND ((s.startDate BETWEEN :startDate AND :endDate) OR (s.endDate BETWEEN :startDate AND :endDate) OR (s.startDate <= :startDate AND s.endDate >= :endDate))")
    List<Sprint> findByStartDateBetweenOrEndDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("startDate") LocalDate startDate2, @Param("endDate") LocalDate endDate2);

    /**
     * Find upcoming sprints (start date after today and status planning)
     */
    List<Sprint> findByStartDateAfterAndStatus(LocalDate date, SprintStatus status);

    /**
     * Find sprints by capacity range
     */

     // Note: Sprint entity has capacityHours field, not capacity field

    /**
     * Find sprints by capacity greater than or equal to
     */
    // Note: Sprint entity has capacityHours field, not capacity field

    /**
     * Find sprints by capacity less than or equal to
     */
    // Note: Sprint entity has capacityHours field, not capacity field

    /**
     * Find sprints created by user
     */
    // Note: Sprint entity doesn't have createdBy field in current database schema

    /**
     * Find sprints updated by user
     */
    // Note: Sprint entity doesn't have updatedBy field in current database schema

    /**
     * Find sprints created between dates
     */
    List<Sprint> findByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

    /**
     * Find sprints updated between dates
     */
    List<Sprint> findByUpdatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

    /**
     * Count sprints by status
     */
    long countByStatus(SprintStatus status);

    /**
     * Count sprints by project
     */
    long countByProjectId(String projectId);

    /**
     * Count sprints by created by user
     */
    // Note: Sprint entity doesn't have createdBy field in current database schema

    /**
     * Find sprints by multiple statuses
     */
    List<Sprint> findByStatusIn(List<SprintStatus> statuses);

    /**
     * Find sprints by multiple projects
     */
    List<Sprint> findByProjectIdIn(List<String> projectIds);

    /**
     * Find sprints with goals containing text
     */
    List<Sprint> findByGoalContainingIgnoreCase(String goal);

    /**
     * Find sprints without goals
     */
    @Query("SELECT s FROM Sprint s WHERE s.goal IS NULL OR s.goal = ''")
    List<Sprint> findSprintsWithoutGoal();

    /**
     * Find sprints without capacity
     */
    @Query("SELECT s FROM Sprint s WHERE s.capacityHours IS NULL")
    List<Sprint> findSprintsWithoutCapacity();

    /**
     * Find sprints by velocity range
     */
    @Query("SELECT s FROM Sprint s WHERE s.velocityPoints BETWEEN :minVelocity AND :maxVelocity")
    List<Sprint> findByVelocityBetween(@Param("minVelocity") Integer minVelocity, @Param("maxVelocity") Integer maxVelocity);

    /**
     * Find sprints by completion percentage
     */
    // Note: Sprint entity doesn't have completionPercentage field in current database schema

    /**
     * Find sprints by completion percentage range
     */
    // Note: Sprint entity doesn't have completionPercentage field in current database schema

    /**
     * Find recently created sprints
     */
    @Query("SELECT s FROM Sprint s ORDER BY s.createdAt DESC")
    List<Sprint> findRecentSprints();

    /**
     * Find recently updated sprints
     */
    @Query("SELECT s FROM Sprint s ORDER BY s.updatedAt DESC")
    List<Sprint> findRecentlyUpdatedSprints();

    /**
     * Find sprints starting today
     */
    @Query("SELECT s FROM Sprint s WHERE s.startDate = CURRENT_DATE")
    List<Sprint> findSprintsStartingToday();

    /**
     * Find sprints ending today
     */
    @Query("SELECT s FROM Sprint s WHERE s.endDate = CURRENT_DATE")
    List<Sprint> findSprintsEndingToday();

    /**
     * Find sprints starting within specified days
     */
    @Query("SELECT s FROM Sprint s WHERE s.startDate BETWEEN CURRENT_DATE AND :futureDate")
    List<Sprint> findSprintsStartingSoon(@Param("futureDate") LocalDate futureDate);

    /**
     * Find sprints ending within specified days
     */
    @Query("SELECT s FROM Sprint s WHERE s.endDate BETWEEN CURRENT_DATE AND :futureDate")
    List<Sprint> findSprintsEndingSoon(@Param("futureDate") LocalDate futureDate);

    /**
     * Find sprints by team ID
     */
    // Note: Sprint entity doesn't have teamId field in current database schema

    /**
     * Find sprints by release ID
     */
    // Note: Sprint entity doesn't have releaseId field in current database schema

    /**
     * Find active sprints for multiple projects
     */
    @Query("SELECT s FROM Sprint s WHERE s.projectId IN :projectIds AND s.status = 'ACTIVE'")
    List<Sprint> findActiveSprintsByProjects(@Param("projectIds") List<String> projectIds);

    /**
     * Find sprints by sprint number
     */
    // Note: Sprint entity doesn't have sprintNumber field in current database schema

    /**
     * Find next sprint number for a project
     */
    // Note: Sprint entity doesn't have sprintNumber field in current database schema

    /**
     * Find sprints with high velocity
     */
    @Query("SELECT s FROM Sprint s WHERE s.velocityPoints > :threshold ORDER BY s.velocityPoints DESC")
    List<Sprint> findHighVelocitySprints(@Param("threshold") Integer threshold);

    /**
     * Find sprints with low velocity
     */
    @Query("SELECT s FROM Sprint s WHERE s.velocityPoints < :threshold ORDER BY s.velocityPoints ASC")
    List<Sprint> findLowVelocitySprints(@Param("threshold") Integer threshold);

    /**
     * Find sprints by retrospective status
     */
    // Note: Sprint entity doesn't have retrospectiveCompleted field in current database schema

    /**
     * Find sprints with retrospective notes
     */
    // Note: Sprint entity doesn't have retrospectiveNotes field in current database schema

    /**
     * Find sprints by planning status
     */
    // Note: Sprint entity doesn't have planningCompleted field in current database schema

    /**
     * Find sprints by review status
     */
    // Note: Sprint entity doesn't have reviewCompleted field in current database schema

    /**
     * Get sprint statistics by project
     */
    @Query("SELECT s.status, COUNT(s) FROM Sprint s WHERE s.projectId = :projectId GROUP BY s.status")
    List<Object[]> getSprintStatusCountByProject(@Param("projectId") String projectId);

    /**
     * Get sprint velocity statistics by project
     */
    @Query("SELECT AVG(s.velocityPoints), MIN(s.velocityPoints), MAX(s.velocityPoints) FROM Sprint s WHERE s.projectId = :projectId AND s.velocityPoints IS NOT NULL")
    List<Object[]> getSprintVelocityStatsByProject(@Param("projectId") String projectId);

    /**
     * Find sprints with overlapping date ranges for a project
     */
    @Query("SELECT s FROM Sprint s WHERE s.projectId = :projectId AND s.id != :excludeId AND ((s.startDate <= :endDate AND s.endDate >= :startDate))")
    List<Sprint> findOverlappingSprints(@Param("projectId") String projectId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, @Param("excludeId") String excludeId);

    /**
     * Find sprints by tags containing specific tag
     */
    // Note: Sprint entity doesn't have tags field in current database schema
}
