package com.sprintsync.api.service;

import com.sprintsync.api.entity.Release;
import com.sprintsync.api.entity.enums.ReleaseStatus;
import com.sprintsync.api.repository.ReleaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
// import java.util.String; // Removed - using String IDs

/**
 * Service class for Release entity operations.
 * Provides business logic for release management operations.
 * 
 * @author Mayuresh G
 */
@Service
@Transactional
public class ReleaseService {

    private final ReleaseRepository releaseRepository;

    @Autowired
    public ReleaseService(ReleaseRepository releaseRepository) {
        this.releaseRepository = releaseRepository;
    }

    /**
     * Create a new release.
     * 
     * @param release the release to create
     * @return the created release
     * @throws IllegalArgumentException if version already exists for project
     */
    public Release createRelease(Release release) {
        // Check if version already exists for the project
        if (releaseRepository.existsByProjectIdAndVersion(release.getProjectId(), release.getVersion())) {
            throw new IllegalArgumentException("Version " + release.getVersion() + " already exists for this project");
        }
        
        // Set default values if not provided
        if (release.getProgress() == null) {
            release.setProgress(0);
        }
        
        return releaseRepository.save(release);
    }

    /**
     * Find release by ID.
     * 
     * @param id the release ID
     * @return Optional containing the release if found
     */
    @Transactional(readOnly = true)
    public Optional<Release> findById(String id) {
        return releaseRepository.findById(id);
    }

    /**
     * Find release by project and version.
     * 
     * @param projectId the project ID
     * @param version the version
     * @return Optional containing the release if found
     */
    @Transactional(readOnly = true)
    public Optional<Release> findByProjectAndVersion(String projectId, String version) {
        return releaseRepository.findByProjectIdAndVersion(projectId, version);
    }

    /**
     * Update an existing release.
     * 
     * @param release the release to update
     * @return the updated release
     * @throws IllegalArgumentException if release not found
     */
    public Release updateRelease(Release release) {
        if (!releaseRepository.existsById(release.getId())) {
            throw new IllegalArgumentException("Release not found with ID: " + release.getId());
        }
        return releaseRepository.save(release);
    }

    /**
     * Delete a release by ID.
     * 
     * @param id the release ID
     * @throws IllegalArgumentException if release not found
     */
    public void deleteRelease(String id) {
        if (!releaseRepository.existsById(id)) {
            throw new IllegalArgumentException("Release not found with ID: " + id);
        }
        releaseRepository.deleteById(id);
    }

    /**
     * Get all releases.
     * 
     * @return list of all releases
     */
    @Transactional(readOnly = true)
    public List<Release> getAllReleases() {
        return releaseRepository.findAll();
    }

    /**
     * Get all releases with pagination.
     * 
     * @param pageable pagination information
     * @return page of releases
     */
    @Transactional(readOnly = true)
    public Page<Release> getAllReleases(Pageable pageable) {
        return releaseRepository.findAll(pageable);
    }

    /**
     * Find releases by project.
     * 
     * @param projectId the project ID
     * @return list of releases in the specified project
     */
    @Transactional(readOnly = true)
    public List<Release> findReleasesByProject(String projectId) {
        return releaseRepository.findByProjectId(projectId);
    }

    /**
     * Find releases by project with pagination.
     * 
     * @param projectId the project ID
     * @param pageable pagination information
     * @return page of releases in the specified project
     */
    @Transactional(readOnly = true)
    public Page<Release> findReleasesByProject(String projectId, Pageable pageable) {
        return releaseRepository.findByProjectId(projectId, pageable);
    }

    /**
     * Find releases by status.
     * 
     * @param status the release status
     * @return list of releases with the specified status
     */
    @Transactional(readOnly = true)
    public List<Release> findReleasesByStatus(ReleaseStatus status) {
        return releaseRepository.findByStatus(status);
    }

    /**
     * Find releases by status with pagination.
     * 
     * @param status the release status
     * @param pageable pagination information
     * @return page of releases with the specified status
     */
    @Transactional(readOnly = true)
    public Page<Release> findReleasesByStatus(ReleaseStatus status, Pageable pageable) {
        return releaseRepository.findByStatus(status, pageable);
    }

    /**
     * Find releases by creator.
     * 
     * @param createdBy the creator ID
     * @return list of releases created by the specified user
     */
    @Transactional(readOnly = true)
    public List<Release> findReleasesByCreator(String createdBy) {
        return releaseRepository.findByCreatedBy(createdBy);
    }

    /**
     * Search releases by name.
     * 
     * @param name the name to search for
     * @return list of releases with names containing the search term
     */
    @Transactional(readOnly = true)
    public List<Release> searchReleasesByName(String name) {
        return releaseRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Search releases by version.
     * 
     * @param version the version to search for
     * @return list of releases with versions containing the search term
     */
    @Transactional(readOnly = true)
    public List<Release> searchReleasesByVersion(String version) {
        return releaseRepository.findByVersionContainingIgnoreCase(version);
    }

    /**
     * Find releases by multiple criteria.
     * 
     * @param projectId the project ID (optional)
     * @param status the release status (optional)
     * @param createdBy the creator ID (optional)
     * @return list of releases matching the criteria
     */
    @Transactional(readOnly = true)
    public List<Release> findReleasesByCriteria(String projectId, ReleaseStatus status, String createdBy) {
        return releaseRepository.findReleasesByCriteria(projectId, status, createdBy);
    }

    /**
     * Find active releases by project.
     * 
     * @param projectId the project ID
     * @return list of active releases in the specified project
     */
    @Transactional(readOnly = true)
    public List<Release> findActiveReleasesByProject(String projectId) {
        return releaseRepository.findActiveReleasesByProject(projectId);
    }

    /**
     * Find releases by date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of releases within the specified date range
     */
    @Transactional(readOnly = true)
    public List<Release> findReleasesByDateRange(LocalDate startDate, LocalDate endDate) {
        return releaseRepository.findReleasesByDateRange(startDate, endDate);
    }

    /**
     * Find releases by target date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of releases with target date within the specified range
     */
    @Transactional(readOnly = true)
    public List<Release> findReleasesByTargetDateRange(LocalDate startDate, LocalDate endDate) {
        return releaseRepository.findReleasesByTargetDateRange(startDate, endDate);
    }

    /**
     * Count releases by status in project.
     * 
     * @param projectId the project ID
     * @param status the release status
     * @return count of releases with the specified status in project
     */
    @Transactional(readOnly = true)
    public long countReleasesByProjectIdAndStatus(String projectId, ReleaseStatus status) {
        return releaseRepository.countByProjectIdAndStatus(projectId, status);
    }

    /**
     * Find upcoming releases.
     * 
     * @param daysAhead number of days to look ahead (default 30)
     * @return list of upcoming releases
     */
    @Transactional(readOnly = true)
    public List<Release> findUpcomingReleases(Integer daysAhead) {
        if (daysAhead == null) {
            daysAhead = 30; // Default 30 days
        }
        LocalDate currentDate = LocalDate.now();
        LocalDate futureDate = currentDate.plusDays(daysAhead);
        return releaseRepository.findUpcomingReleases(currentDate, futureDate);
    }

    /**
     * Find overdue releases.
     * 
     * @return list of overdue releases
     */
    @Transactional(readOnly = true)
    public List<Release> findOverdueReleases() {
        return releaseRepository.findOverdueReleases(LocalDate.now());
    }

    /**
     * Find releases ready for deployment.
     * 
     * @return list of releases ready for deployment
     */
    @Transactional(readOnly = true)
    public List<Release> findReleasesReadyForDeployment() {
        return releaseRepository.findReleasesReadyForDeployment();
    }

    /**
     * Get latest release for a project.
     * 
     * @param projectId the project ID
     * @return Optional containing the latest release
     */
    @Transactional(readOnly = true)
    public Optional<Release> getLatestReleaseByProject(String projectId) {
        return releaseRepository.findLatestReleaseByProject(projectId);
    }

    /**
     * Update release status.
     * 
     * @param releaseId the release ID
     * @param status the new status
     * @throws IllegalArgumentException if release not found
     */
    public void updateReleaseStatus(String releaseId, ReleaseStatus status) {
        Optional<Release> releaseOptional = releaseRepository.findById(releaseId);
        if (releaseOptional.isPresent()) {
            Release release = releaseOptional.get();
            release.setStatus(status);
            
            // Set completion date if status is released
            if (status == ReleaseStatus.RELEASED) {
                release.setCompletedAt(LocalDate.now());
                release.setReleaseDate(LocalDate.now());
            }
            
            releaseRepository.save(release);
        } else {
            throw new IllegalArgumentException("Release not found with ID: " + releaseId);
        }
    }

    /**
     * Update release progress.
     * 
     * @param releaseId the release ID
     * @param progress the new progress percentage (0-100)
     * @throws IllegalArgumentException if release not found or invalid progress
     */
    public void updateReleaseProgress(String releaseId, Integer progress) {
        if (progress < 0 || progress > 100) {
            throw new IllegalArgumentException("Progress must be between 0 and 100");
        }
        
        Optional<Release> releaseOptional = releaseRepository.findById(releaseId);
        if (releaseOptional.isPresent()) {
            Release release = releaseOptional.get();
            release.setProgress(progress);
            releaseRepository.save(release);
        } else {
            throw new IllegalArgumentException("Release not found with ID: " + releaseId);
        }
    }

    /**
     * Set release date.
     * 
     * @param releaseId the release ID
     * @param releaseDate the release date
     * @throws IllegalArgumentException if release not found
     */
    public void setReleaseDate(String releaseId, LocalDate releaseDate) {
        Optional<Release> releaseOptional = releaseRepository.findById(releaseId);
        if (releaseOptional.isPresent()) {
            Release release = releaseOptional.get();
            release.setReleaseDate(releaseDate);
            releaseRepository.save(release);
        } else {
            throw new IllegalArgumentException("Release not found with ID: " + releaseId);
        }
    }

    /**
     * Set target date.
     * 
     * @param releaseId the release ID
     * @param targetDate the target date
     * @throws IllegalArgumentException if release not found
     */
    public void setTargetDate(String releaseId, LocalDate targetDate) {
        Optional<Release> releaseOptional = releaseRepository.findById(releaseId);
        if (releaseOptional.isPresent()) {
            Release release = releaseOptional.get();
            release.setTargetDate(targetDate);
            releaseRepository.save(release);
        } else {
            throw new IllegalArgumentException("Release not found with ID: " + releaseId);
        }
    }

    /**
     * Check if version exists for a project.
     * 
     * @param projectId the project ID
     * @param version the version
     * @return true if version exists for the project, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean versionExistsForProject(String projectId, String version) {
        return releaseRepository.existsByProjectIdAndVersion(projectId, version);
    }

    /**
     * Get release statistics for a project.
     * 
     * @param projectId the project ID
     * @return map containing release statistics
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getReleaseStatistics(String projectId) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        stats.put("totalReleases", releaseRepository.countByProjectIdAndStatus(projectId, null));
        stats.put("planningReleases", releaseRepository.countByProjectIdAndStatus(projectId, ReleaseStatus.PLANNING));
        stats.put("developmentReleases", releaseRepository.countByProjectIdAndStatus(projectId, ReleaseStatus.DEVELOPMENT));
        stats.put("testingReleases", releaseRepository.countByProjectIdAndStatus(projectId, ReleaseStatus.TESTING));
        stats.put("stagingReleases", releaseRepository.countByProjectIdAndStatus(projectId, ReleaseStatus.STAGING));
        stats.put("readyForRelease", releaseRepository.countByProjectIdAndStatus(projectId, ReleaseStatus.READY_FOR_RELEASE));
        stats.put("releasedReleases", releaseRepository.countByProjectIdAndStatus(projectId, ReleaseStatus.RELEASED));
        stats.put("cancelledReleases", releaseRepository.countByProjectIdAndStatus(projectId, ReleaseStatus.CANCELLED));
        stats.put("upcomingReleases", findUpcomingReleases(30).size());
        stats.put("overdueReleases", findOverdueReleases().size());
        
        return stats;
    }

    /**
     * Create multiple releases for a project in batch.
     * 
     * @param projectId the project ID
     * @param releases list of releases to create
     * @return list of created releases
     */
    public List<Release> createReleasesBatch(String projectId, List<Release> releases) {
        if (releases == null || releases.isEmpty()) {
            throw new IllegalArgumentException("Releases list cannot be null or empty");
        }

        // Set project ID and default values for each release
        for (Release release : releases) {
            release.setProjectId(projectId);
            if (release.getProgress() == null) {
                release.setProgress(0);
            }
            if (release.getStatus() == null) {
                release.setStatus(ReleaseStatus.PLANNING);
            }
        }

        return releaseRepository.saveAll(releases);
    }
}
