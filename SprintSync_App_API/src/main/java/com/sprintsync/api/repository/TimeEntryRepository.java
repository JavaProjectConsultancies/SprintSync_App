package com.sprintsync.api.repository;

import com.sprintsync.api.entity.TimeEntry;
import com.sprintsync.api.entity.enums.TimeEntryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Repository interface for TimeEntry entity operations.
 * Provides CRUD operations and custom query methods for time tracking.
 * 
 * @author Mayuresh G
 */
@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, String> {

    /**
     * Find time entries by user ID.
     * 
     * @param userId the user ID
     * @return list of time entries for the specified user
     */
    List<TimeEntry> findByUserId(String userId);

    /**
     * Find time entries by project ID.
     * 
     * @param projectId the project ID
     * @return list of time entries for the specified project
     */
    List<TimeEntry> findByProjectId(String projectId);

    /**
     * Find time entries by story ID.
     * 
     * @param storyId the story ID
     * @return list of time entries for the specified story
     */
    List<TimeEntry> findByStoryId(String storyId);

    /**
     * Find time entries by task ID.
     * 
     * @param taskId the task ID
     * @return list of time entries for the specified task
     */
    List<TimeEntry> findByTaskId(String taskId);

    /**
     * Find time entries by entry type.
     * 
     * @param entryType the entry type
     * @return list of time entries of the specified type
     */
    List<TimeEntry> findByEntryType(TimeEntryType entryType);

    /**
     * Find time entries by work date.
     * 
     * @param workDate the work date
     * @return list of time entries for the specified date
     */
    List<TimeEntry> findByWorkDate(LocalDate workDate);

    /**
     * Find time entries by user ID with pagination.
     * 
     * @param userId the user ID
     * @param pageable pagination information
     * @return page of time entries for the specified user
     */
    Page<TimeEntry> findByUserId(String userId, Pageable pageable);

    /**
     * Find time entries by project ID with pagination.
     * 
     * @param projectId the project ID
     * @param pageable pagination information
     * @return page of time entries for the specified project
     */
    Page<TimeEntry> findByProjectId(String projectId, Pageable pageable);

    /**
     * Find time entries by date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of time entries within the date range
     */
    @Query("SELECT t FROM TimeEntry t WHERE t.workDate BETWEEN :startDate AND :endDate")
    List<TimeEntry> findByWorkDateBetween(@Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    /**
     * Find time entries by user ID and date range.
     * 
     * @param userId the user ID
     * @param startDate the start date
     * @param endDate the end date
     * @return list of time entries for the user within the date range
     */
    @Query("SELECT t FROM TimeEntry t WHERE t.userId = :userId AND t.workDate BETWEEN :startDate AND :endDate")
    List<TimeEntry> findByUserIdAndWorkDateBetween(@Param("userId") String userId,
                                                   @Param("startDate") LocalDate startDate,
                                                   @Param("endDate") LocalDate endDate);

    /**
     * Find billable time entries.
     * 
     * @param isBillable the billable status
     * @return list of billable/non-billable time entries
     */
    List<TimeEntry> findByIsBillable(Boolean isBillable);

    /**
     * Find time entries by multiple criteria.
     * 
     * @param userId the user ID (optional)
     * @param projectId the project ID (optional)
     * @param entryType the entry type (optional)
     * @param startDate the start date (optional)
     * @param endDate the end date (optional)
     * @param isBillable the billable status (optional)
     * @return list of time entries matching the criteria
     */
    @Query("SELECT t FROM TimeEntry t WHERE " +
           "(:userId IS NULL OR t.userId = :userId) AND " +
           "(:projectId IS NULL OR t.projectId = :projectId) AND " +
           "(:entryType IS NULL OR t.entryType = :entryType) AND " +
           "(:startDate IS NULL OR t.workDate >= :startDate) AND " +
           "(:endDate IS NULL OR t.workDate <= :endDate) AND " +
           "(:isBillable IS NULL OR t.isBillable = :isBillable)")
    List<TimeEntry> findTimeEntriesByCriteria(@Param("userId") String userId,
                                             @Param("projectId") String projectId,
                                             @Param("entryType") TimeEntryType entryType,
                                             @Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate,
                                             @Param("isBillable") Boolean isBillable);

    /**
     * Calculate total hours worked by user.
     * 
     * @param userId the user ID
     * @return sum of hours worked by the user
     */
    @Query("SELECT COALESCE(SUM(t.hoursWorked), 0) FROM TimeEntry t WHERE t.userId = :userId")
    BigDecimal sumHoursWorkedByUserId(@Param("userId") String userId);

    /**
     * Calculate total hours worked by project.
     * 
     * @param projectId the project ID
     * @return sum of hours worked on the project
     */
    @Query("SELECT COALESCE(SUM(t.hoursWorked), 0) FROM TimeEntry t WHERE t.projectId = :projectId")
    BigDecimal sumHoursWorkedByProjectId(@Param("projectId") String projectId);

    /**
     * Calculate total hours worked by story.
     * 
     * @param storyId the story ID
     * @return sum of hours worked on the story
     */
    @Query("SELECT COALESCE(SUM(t.hoursWorked), 0) FROM TimeEntry t WHERE t.storyId = :storyId")
    BigDecimal sumHoursWorkedByStoryId(@Param("storyId") String storyId);

    /**
     * Calculate total hours worked by task.
     * 
     * @param taskId the task ID
     * @return sum of hours worked on the task
     */
    @Query("SELECT COALESCE(SUM(t.hoursWorked), 0) FROM TimeEntry t WHERE t.taskId = :taskId")
    BigDecimal sumHoursWorkedByTaskId(@Param("taskId") String taskId);

    /**
     * Calculate total billable hours by user.
     * 
     * @param userId the user ID
     * @return sum of billable hours worked by the user
     */
    @Query("SELECT COALESCE(SUM(t.hoursWorked), 0) FROM TimeEntry t WHERE t.userId = :userId AND t.isBillable = true")
    BigDecimal sumBillableHoursByUserId(@Param("userId") String userId);

    /**
     * Calculate total billable hours by project.
     * 
     * @param projectId the project ID
     * @return sum of billable hours worked on the project
     */
    @Query("SELECT COALESCE(SUM(t.hoursWorked), 0) FROM TimeEntry t WHERE t.projectId = :projectId AND t.isBillable = true")
    BigDecimal sumBillableHoursByProjectId(@Param("projectId") String projectId);

    /**
     * Count time entries by user ID.
     * 
     * @param userId the user ID
     * @return count of time entries for the user
     */
    long countByUserId(String userId);

    /**
     * Count time entries by project ID.
     * 
     * @param projectId the project ID
     * @return count of time entries for the project
     */
    long countByProjectId(String projectId);

    /**
     * Find time entries by user ID and entry type.
     * 
     * @param userId the user ID
     * @param entryType the entry type
     * @return list of time entries for the user of the specified type
     */
    List<TimeEntry> findByUserIdAndEntryType(String userId, TimeEntryType entryType);

    /**
     * Find recent time entries for a user.
     * 
     * @param userId the user ID
     * @param limit the number of entries to return
     * @return list of recent time entries for the user
     */
    @Query("SELECT t FROM TimeEntry t WHERE t.userId = :userId ORDER BY t.workDate DESC, t.createdAt DESC")
    List<TimeEntry> findRecentTimeEntriesByUserId(@Param("userId") String userId, Pageable pageable);

    /**
     * Find time entries by user ID and date.
     * 
     * @param userId the user ID
     * @param workDate the work date
     * @return list of time entries for the user on the specified date
     */
    List<TimeEntry> findByUserIdAndWorkDate(String userId, LocalDate workDate);

    /**
     * Calculate daily hours worked by user.
     * 
     * @param userId the user ID
     * @param workDate the work date
     * @return sum of hours worked by the user on the specified date
     */
    @Query("SELECT COALESCE(SUM(t.hoursWorked), 0) FROM TimeEntry t WHERE t.userId = :userId AND t.workDate = :workDate")
    BigDecimal sumDailyHoursByUserIdAndDate(@Param("userId") String userId, @Param("workDate") LocalDate workDate);
}
