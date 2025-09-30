package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Release;
import com.sprintsync.api.entity.enums.ReleaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
// import java.util.String; // Removed - using String IDs

/**
 * Repository interface for Release entity operations.
 * Provides CRUD operations and custom query methods for release management.
 * 
 * @author Mayuresh G
 */
@Repository
public interface ReleaseRepository extends JpaRepository<Release, String> {

    /**
     * Find releases by project.
     * 
     * @param projectId the project ID
     * @return list of releases in the specified project
     */
    List<Release> findByProjectId(String projectId);

    /**
     * Find releases by status.
     * 
     * @param status the release status
     * @return list of releases with the specified status
     */
    List<Release> findByStatus(ReleaseStatus status);

    /**
     * Find releases by creator.
     * 
     * @param createdBy the creator ID
     * @return list of releases created by the specified user
     */
    List<Release> findByCreatedBy(String createdBy);

    /**
     * Find release by project and version.
     * 
     * @param projectId the project ID
     * @param version the version
     * @return Optional containing the release if found
     */
    Optional<Release> findByProjectIdAndVersion(String projectId, String version);

    /**
     * Find releases by project with pagination.
     * 
     * @param projectId the project ID
     * @param pageable pagination information
     * @return page of releases in the specified project
     */
    Page<Release> findByProjectId(String projectId, Pageable pageable);

    /**
     * Find releases by status with pagination.
     * 
     * @param status the release status
     * @param pageable pagination information
     * @return page of releases with the specified status
     */
    Page<Release> findByStatus(ReleaseStatus status, Pageable pageable);

    /**
     * Find releases by name containing (case-insensitive).
     * 
     * @param name the name to search for
     * @return list of releases with names containing the search term
     */
    List<Release> findByNameContainingIgnoreCase(String name);

    /**
     * Find releases by version containing (case-insensitive).
     * 
     * @param version the version to search for
     * @return list of releases with versions containing the search term
     */
    List<Release> findByVersionContainingIgnoreCase(String version);

    /**
     * Find releases with release date after a specific date.
     * 
     * @param releaseDate the release date
     * @return list of releases with release date after the specified date
     */
    List<Release> findByReleaseDateAfter(LocalDate releaseDate);

    /**
     * Find releases with target date before a specific date.
     * 
     * @param targetDate the target date
     * @return list of releases with target date before the specified date
     */
    List<Release> findByTargetDateBefore(LocalDate targetDate);

    /**
     * Find releases with progress greater than or equal to specified value.
     * 
     * @param progress the minimum progress percentage
     * @return list of releases with progress >= specified value
     */
    List<Release> findByProgressGreaterThanEqual(Integer progress);

    /**
     * Check if version exists for a project.
     * 
     * @param projectId the project ID
     * @param version the version
     * @return true if version exists for the project, false otherwise
     */
    boolean existsByProjectIdAndVersion(String projectId, String version);

    /**
     * Custom query to find releases by multiple criteria.
     * 
     * @param projectId the project ID
     * @param status the release status
     * @param createdBy the creator ID
     * @return list of releases matching all criteria
     */
    @Query("SELECT r FROM Release r WHERE " +
           "(:projectId IS NULL OR r.projectId = :projectId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:createdBy IS NULL OR r.createdBy = :createdBy)")
    List<Release> findReleasesByCriteria(@Param("projectId") String projectId,
                                        @Param("status") ReleaseStatus status,
                                        @Param("createdBy") String createdBy);

    /**
     * Custom query to find active releases by project.
     * 
     * @param projectId the project ID
     * @return list of active releases in the specified project
     */
    @Query("SELECT r FROM Release r WHERE r.projectId = :projectId AND r.status NOT IN ('RELEASED', 'CANCELLED')")
    List<Release> findActiveReleasesByProject(@Param("projectId") String projectId);

    /**
     * Custom query to find releases by date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of releases within the specified date range
     */
    @Query("SELECT r FROM Release r WHERE " +
           "r.releaseDate <= :endDate AND " +
           "(r.releaseDate IS NULL OR r.releaseDate >= :startDate)")
    List<Release> findReleasesByDateRange(@Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    /**
     * Custom query to find releases by target date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of releases with target date within the specified range
     */
    @Query("SELECT r FROM Release r WHERE " +
           "r.targetDate <= :endDate AND " +
           "(r.targetDate IS NULL OR r.targetDate >= :startDate)")
    List<Release> findReleasesByTargetDateRange(@Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    /**
     * Custom query to count releases by status in project.
     * 
     * @param projectId the project ID
     * @param status the release status
     * @return count of releases with the specified status in project
     */
    @Query("SELECT COUNT(r) FROM Release r WHERE r.projectId = :projectId AND r.status = :status")
    long countByProjectIdAndStatus(@Param("projectId") String projectId,
                                  @Param("status") ReleaseStatus status);

    /**
     * Custom query to find upcoming releases.
     * 
     * @param currentDate the current date
     * @param futureDate the future date
     * @return list of upcoming releases
     */
    @Query("SELECT r FROM Release r WHERE " +
           "r.targetDate BETWEEN :currentDate AND :futureDate AND " +
           "r.status NOT IN ('RELEASED', 'CANCELLED')")
    List<Release> findUpcomingReleases(@Param("currentDate") LocalDate currentDate,
                                      @Param("futureDate") LocalDate futureDate);

    /**
     * Custom query to find overdue releases.
     * 
     * @param currentDate the current date
     * @return list of overdue releases
     */
    @Query("SELECT r FROM Release r WHERE " +
           "r.targetDate < :currentDate AND " +
           "r.status NOT IN ('RELEASED', 'CANCELLED')")
    List<Release> findOverdueReleases(@Param("currentDate") LocalDate currentDate);

    /**
     * Custom query to find releases ready for deployment.
     * 
     * @return list of releases ready for deployment
     */
    @Query("SELECT r FROM Release r WHERE r.status = 'READY_FOR_RELEASE'")
    List<Release> findReleasesReadyForDeployment();

    /**
     * Custom query to get latest release for a project.
     * 
     * @param projectId the project ID
     * @return Optional containing the latest release
     */
    @Query("SELECT r FROM Release r WHERE r.projectId = :projectId ORDER BY r.createdAt DESC")
    Optional<Release> findLatestReleaseByProject(@Param("projectId") String projectId);
}
