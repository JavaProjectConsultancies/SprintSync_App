package com.sprintsync.api.repository;

import com.sprintsync.api.entity.QualityGate;
import com.sprintsync.api.entity.enums.QualityGateStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
// import java.util.String; // Removed - using String IDs

/**
 * Repository interface for QualityGate entity operations.
 * Provides CRUD operations and custom query methods for quality gate management.
 * 
 * @author Mayuresh G
 */
@Repository
public interface QualityGateRepository extends JpaRepository<QualityGate, String> {

    /**
     * Find quality gates by release.
     * 
     * @param releaseId the release ID
     * @return list of quality gates for the specified release
     */
    List<QualityGate> findByReleaseId(String releaseId);

    /**
     * Find quality gates by status.
     * 
     * @param status the quality gate status
     * @return list of quality gates with the specified status
     */
    List<QualityGate> findByStatus(QualityGateStatus status);

    /**
     * Find quality gates by required status.
     * 
     * @param required the required status
     * @return list of quality gates with the specified required status
     */
    List<QualityGate> findByRequired(Boolean required);

    /**
     * Find quality gates by release with pagination.
     * 
     * @param releaseId the release ID
     * @param pageable pagination information
     * @return page of quality gates for the specified release
     */
    Page<QualityGate> findByReleaseId(String releaseId, Pageable pageable);

    /**
     * Find quality gates by status with pagination.
     * 
     * @param status the quality gate status
     * @param pageable pagination information
     * @return page of quality gates with the specified status
     */
    Page<QualityGate> findByStatus(QualityGateStatus status, Pageable pageable);

    /**
     * Find quality gates by name containing (case-insensitive).
     * 
     * @param name the name to search for
     * @return list of quality gates with names containing the search term
     */
    List<QualityGate> findByNameContainingIgnoreCase(String name);

    /**
     * Find quality gates completed after a specific date.
     * 
     * @param completedAt the completion date
     * @return list of quality gates completed after the specified date
     */
    List<QualityGate> findByCompletedAtAfter(LocalDateTime completedAt);

    /**
     * Find quality gates completed before a specific date.
     * 
     * @param completedAt the completion date
     * @return list of quality gates completed before the specified date
     */
    List<QualityGate> findByCompletedAtBefore(LocalDateTime completedAt);

    /**
     * Custom query to find quality gates by multiple criteria.
     * 
     * @param releaseId the release ID
     * @param status the quality gate status
     * @param required the required status
     * @return list of quality gates matching all criteria
     */
    @Query("SELECT qg FROM QualityGate qg WHERE " +
           "(:releaseId IS NULL OR qg.releaseId = :releaseId) AND " +
           "(:status IS NULL OR qg.status = :status) AND " +
           "(:required IS NULL OR qg.required = :required)")
    List<QualityGate> findQualityGatesByCriteria(@Param("releaseId") String releaseId,
                                                 @Param("status") QualityGateStatus status,
                                                 @Param("required") Boolean required);

    /**
     * Custom query to find pending quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return list of pending quality gates for the specified release
     */
    @Query("SELECT qg FROM QualityGate qg WHERE qg.releaseId = :releaseId AND qg.status = 'PENDING'")
    List<QualityGate> findPendingQualityGatesByRelease(@Param("releaseId") String releaseId);

    /**
     * Custom query to find failed quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return list of failed quality gates for the specified release
     */
    @Query("SELECT qg FROM QualityGate qg WHERE qg.releaseId = :releaseId AND qg.status = 'FAILED'")
    List<QualityGate> findFailedQualityGatesByRelease(@Param("releaseId") String releaseId);

    /**
     * Custom query to find passed quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return list of passed quality gates for the specified release
     */
    @Query("SELECT qg FROM QualityGate qg WHERE qg.releaseId = :releaseId AND qg.status = 'PASSED'")
    List<QualityGate> findPassedQualityGatesByRelease(@Param("releaseId") String releaseId);

    /**
     * Custom query to count quality gates by status for a release.
     * 
     * @param releaseId the release ID
     * @param status the quality gate status
     * @return count of quality gates with the specified status for the release
     */
    @Query("SELECT COUNT(qg) FROM QualityGate qg WHERE qg.releaseId = :releaseId AND qg.status = :status")
    long countByReleaseIdAndStatus(@Param("releaseId") String releaseId,
                                  @Param("status") QualityGateStatus status);

    /**
     * Custom query to count required quality gates by status for a release.
     * 
     * @param releaseId the release ID
     * @param status the quality gate status
     * @return count of required quality gates with the specified status for the release
     */
    @Query("SELECT COUNT(qg) FROM QualityGate qg WHERE qg.releaseId = :releaseId AND qg.status = :status AND qg.required = true")
    long countRequiredByReleaseIdAndStatus(@Param("releaseId") String releaseId,
                                          @Param("status") QualityGateStatus status);

    /**
     * Custom query to find all required quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return list of all required quality gates for the specified release
     */
    @Query("SELECT qg FROM QualityGate qg WHERE qg.releaseId = :releaseId AND qg.required = true")
    List<QualityGate> findRequiredQualityGatesByRelease(@Param("releaseId") String releaseId);

    /**
     * Custom query to check if all required quality gates are passed for a release.
     * 
     * @param releaseId the release ID
     * @return true if all required quality gates are passed, false otherwise
     */
    @Query("SELECT COUNT(qg) = 0 FROM QualityGate qg WHERE qg.releaseId = :releaseId AND qg.required = true AND qg.status != 'PASSED'")
    boolean areAllRequiredQualityGatesPassed(@Param("releaseId") String releaseId);

    /**
     * Custom query to find quality gates completed in date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of quality gates completed within the specified date range
     */
    @Query("SELECT qg FROM QualityGate qg WHERE " +
           "qg.completedAt BETWEEN :startDate AND :endDate AND " +
           "qg.status = 'PASSED'")
    List<QualityGate> findCompletedQualityGatesByDateRange(@Param("startDate") LocalDateTime startDate,
                                                          @Param("endDate") LocalDateTime endDate);

    /**
     * Custom query to find quality gates that are blocking release.
     * 
     * @param releaseId the release ID
     * @return list of quality gates that are blocking the release
     */
    @Query("SELECT qg FROM QualityGate qg WHERE " +
           "qg.releaseId = :releaseId AND " +
           "qg.required = true AND " +
           "qg.status IN ('PENDING', 'FAILED')")
    List<QualityGate> findBlockingQualityGatesByRelease(@Param("releaseId") String releaseId);
}
