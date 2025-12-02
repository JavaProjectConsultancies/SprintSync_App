package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Release;
import com.sprintsync.api.entity.enums.ReleaseStatus;
import com.sprintsync.api.service.ReleaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
// import java.util.String; // Removed - using String IDs

/**
 * REST Controller for Release entity operations.
 * Provides HTTP endpoints for release management.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/releases")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ReleaseController {

    private final ReleaseService releaseService;

    @Autowired
    public ReleaseController(ReleaseService releaseService) {
        this.releaseService = releaseService;
    }

    /**
     * Create a new release.
     * 
     * @param release the release to create
     * @return ResponseEntity containing the created release
     */
    @PostMapping
    public ResponseEntity<?> createRelease(@Valid @RequestBody Release release) {
        try {
            Release createdRelease = releaseService.createRelease(release);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRelease);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create release: " + e.getMessage()));
        }
    }

    /**
     * Get release by ID.
     * 
     * @param id the release ID
     * @return ResponseEntity containing the release if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getReleaseById(@PathVariable String id) {
        try {
            return releaseService.findById(id)
                    .map(release -> ResponseEntity.ok(release))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve release: " + e.getMessage()));
        }
    }

    /**
     * Get release by project and version.
     * 
     * @param projectId the project ID
     * @param version the version
     * @return ResponseEntity containing the release if found
     */
    @GetMapping("/project/{projectId}/version/{version}")
    public ResponseEntity<?> getReleaseByProjectAndVersion(@PathVariable String projectId, @PathVariable String version) {
        try {
            return releaseService.findByProjectAndVersion(projectId, version)
                    .map(release -> ResponseEntity.ok(release))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve release: " + e.getMessage()));
        }
    }

    /**
     * Update an existing release.
     * 
     * @param id the release ID
     * @param release the updated release data
     * @return ResponseEntity containing the updated release
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRelease(@PathVariable String id, @Valid @RequestBody Release release) {
        try {
            release.setId(id); // Ensure the ID matches the path variable
            Release updatedRelease = releaseService.updateRelease(release);
            return ResponseEntity.ok(updatedRelease);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update release: " + e.getMessage()));
        }
    }

    /**
     * Delete a release by ID.
     * 
     * @param id the release ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRelease(@PathVariable String id) {
        try {
            releaseService.deleteRelease(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete release: " + e.getMessage()));
        }
    }

    /**
     * Get all releases.
     * 
     * @return ResponseEntity containing list of all releases
     */
    @GetMapping
    public ResponseEntity<?> getAllReleases() {
        try {
            List<Release> releases = releaseService.getAllReleases();
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases: " + e.getMessage()));
        }
    }

    /**
     * Get all releases with pagination.
     * 
     * @param pageable pagination parameters
     * @return ResponseEntity containing page of releases
     */
    @GetMapping("/paginated")
    public ResponseEntity<?> getAllReleasesPaginated(Pageable pageable) {
        try {
            Page<Release> releases = releaseService.getAllReleases(pageable);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases: " + e.getMessage()));
        }
    }

    /**
     * Get releases by project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of releases in the specified project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getReleasesByProject(@PathVariable String projectId) {
        try {
            List<Release> releases = releaseService.findReleasesByProject(projectId);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases by project: " + e.getMessage()));
        }
    }

    /**
     * Get releases by project with pagination.
     * 
     * @param projectId the project ID
     * @param pageable pagination parameters
     * @return ResponseEntity containing page of releases in the specified project
     */
    @GetMapping("/project/{projectId}/paginated")
    public ResponseEntity<?> getReleasesByProjectPaginated(@PathVariable String projectId, Pageable pageable) {
        try {
            Page<Release> releases = releaseService.findReleasesByProject(projectId, pageable);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases by project: " + e.getMessage()));
        }
    }

    /**
     * Get releases by status.
     * 
     * @param status the release status
     * @return ResponseEntity containing list of releases with the specified status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getReleasesByStatus(@PathVariable ReleaseStatus status) {
        try {
            List<Release> releases = releaseService.findReleasesByStatus(status);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases by status: " + e.getMessage()));
        }
    }

    /**
     * Get releases by status with pagination.
     * 
     * @param status the release status
     * @param pageable pagination parameters
     * @return ResponseEntity containing page of releases with the specified status
     */
    @GetMapping("/status/{status}/paginated")
    public ResponseEntity<?> getReleasesByStatusPaginated(@PathVariable ReleaseStatus status, Pageable pageable) {
        try {
            Page<Release> releases = releaseService.findReleasesByStatus(status, pageable);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases by status: " + e.getMessage()));
        }
    }

    /**
     * Get releases by creator.
     * 
     * @param createdBy the creator ID
     * @return ResponseEntity containing list of releases created by the specified user
     */
    @GetMapping("/creator/{createdBy}")
    public ResponseEntity<?> getReleasesByCreator(@PathVariable String createdBy) {
        try {
            List<Release> releases = releaseService.findReleasesByCreator(createdBy);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases by creator: " + e.getMessage()));
        }
    }

    /**
     * Search releases by name.
     * 
     * @param name the name to search for
     * @return ResponseEntity containing list of releases with names containing the search term
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchReleasesByName(@RequestParam String name) {
        try {
            List<Release> releases = releaseService.searchReleasesByName(name);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search releases: " + e.getMessage()));
        }
    }

    /**
     * Search releases by version.
     * 
     * @param version the version to search for
     * @return ResponseEntity containing list of releases with versions containing the search term
     */
    @GetMapping("/search/version")
    public ResponseEntity<?> searchReleasesByVersion(@RequestParam String version) {
        try {
            List<Release> releases = releaseService.searchReleasesByVersion(version);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search releases by version: " + e.getMessage()));
        }
    }

    /**
     * Get releases by multiple criteria.
     * 
     * @param projectId the project ID (optional)
     * @param status the release status (optional)
     * @param createdBy the creator ID (optional)
     * @return ResponseEntity containing list of releases matching the criteria
     */
    @GetMapping("/criteria")
    public ResponseEntity<?> getReleasesByCriteria(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) ReleaseStatus status,
            @RequestParam(required = false) String createdBy) {
        try {
            List<Release> releases = releaseService.findReleasesByCriteria(projectId, status, createdBy);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases by criteria: " + e.getMessage()));
        }
    }

    /**
     * Get active releases by project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of active releases in the specified project
     */
    @GetMapping("/project/{projectId}/active")
    public ResponseEntity<?> getActiveReleasesByProject(@PathVariable String projectId) {
        try {
            List<Release> releases = releaseService.findActiveReleasesByProject(projectId);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve active releases by project: " + e.getMessage()));
        }
    }

    /**
     * Get releases by date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return ResponseEntity containing list of releases within the specified date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<?> getReleasesByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        try {
            List<Release> releases = releaseService.findReleasesByDateRange(startDate, endDate);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases by date range: " + e.getMessage()));
        }
    }

    /**
     * Get releases by target date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return ResponseEntity containing list of releases with target date within the specified range
     */
    @GetMapping("/target-date-range")
    public ResponseEntity<?> getReleasesByTargetDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        try {
            List<Release> releases = releaseService.findReleasesByTargetDateRange(startDate, endDate);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases by target date range: " + e.getMessage()));
        }
    }

    /**
     * Get release count by status in project.
     * 
     * @param projectId the project ID
     * @param status the release status
     * @return ResponseEntity containing count of releases with the specified status in project
     */
    @GetMapping("/count/project/{projectId}/status/{status}")
    public ResponseEntity<?> getReleaseCountByProjectIdAndStatus(@PathVariable String projectId, @PathVariable ReleaseStatus status) {
        try {
            long count = releaseService.countReleasesByProjectIdAndStatus(projectId, status);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to count releases: " + e.getMessage()));
        }
    }

    /**
     * Get upcoming releases.
     * 
     * @param daysAhead number of days to look ahead (default 30)
     * @return ResponseEntity containing list of upcoming releases
     */
    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingReleases(@RequestParam(defaultValue = "30") Integer daysAhead) {
        try {
            List<Release> releases = releaseService.findUpcomingReleases(daysAhead);
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve upcoming releases: " + e.getMessage()));
        }
    }

    /**
     * Get overdue releases.
     * 
     * @return ResponseEntity containing list of overdue releases
     */
    @GetMapping("/overdue")
    public ResponseEntity<?> getOverdueReleases() {
        try {
            List<Release> releases = releaseService.findOverdueReleases();
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve overdue releases: " + e.getMessage()));
        }
    }

    /**
     * Get releases ready for deployment.
     * 
     * @return ResponseEntity containing list of releases ready for deployment
     */
    @GetMapping("/ready-for-deployment")
    public ResponseEntity<?> getReleasesReadyForDeployment() {
        try {
            List<Release> releases = releaseService.findReleasesReadyForDeployment();
            return ResponseEntity.ok(releases);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve releases ready for deployment: " + e.getMessage()));
        }
    }

    /**
     * Get latest release for a project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing the latest release if found
     */
    @GetMapping("/project/{projectId}/latest")
    public ResponseEntity<?> getLatestReleaseByProject(@PathVariable String projectId) {
        try {
            return releaseService.getLatestReleaseByProject(projectId)
                    .map(release -> ResponseEntity.ok(release))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve latest release: " + e.getMessage()));
        }
    }

    /**
     * Update release status.
     * 
     * @param id the release ID
     * @param status the new status
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateReleaseStatus(@PathVariable String id, @RequestParam ReleaseStatus status) {
        try {
            releaseService.updateReleaseStatus(id, status);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update release status: " + e.getMessage()));
        }
    }

    /**
     * Update release progress.
     * 
     * @param id the release ID
     * @param progress the new progress percentage (0-100)
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/progress")
    public ResponseEntity<?> updateReleaseProgress(@PathVariable String id, @RequestParam Integer progress) {
        try {
            releaseService.updateReleaseProgress(id, progress);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update release progress: " + e.getMessage()));
        }
    }

    /**
     * Set release date.
     * 
     * @param id the release ID
     * @param releaseDate the release date
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/release-date")
    public ResponseEntity<?> setReleaseDate(@PathVariable String id, @RequestParam LocalDate releaseDate) {
        try {
            releaseService.setReleaseDate(id, releaseDate);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to set release date: " + e.getMessage()));
        }
    }

    /**
     * Set target date.
     * 
     * @param id the release ID
     * @param targetDate the target date
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/target-date")
    public ResponseEntity<?> setTargetDate(@PathVariable String id, @RequestParam LocalDate targetDate) {
        try {
            releaseService.setTargetDate(id, targetDate);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to set target date: " + e.getMessage()));
        }
    }

    /**
     * Check if version exists for a project.
     * 
     * @param projectId the project ID
     * @param version the version
     * @return ResponseEntity containing boolean indicating if version exists
     */
    @GetMapping("/exists/project/{projectId}/version/{version}")
    public ResponseEntity<?> checkVersionExistsForProject(@PathVariable String projectId, @PathVariable String version) {
        try {
            boolean exists = releaseService.versionExistsForProject(projectId, version);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check version existence: " + e.getMessage()));
        }
    }

    /**
     * Get release statistics for a project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing release statistics
     */
    @GetMapping("/project/{projectId}/statistics")
    public ResponseEntity<?> getReleaseStatistics(@PathVariable String projectId) {
        try {
            Map<String, Object> stats = releaseService.getReleaseStatistics(projectId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve release statistics: " + e.getMessage()));
        }
    }

    /**
     * Create multiple releases for a project in batch.
     * 
     * @param projectId the project ID
     * @param releases list of releases to create
     * @return ResponseEntity containing list of created releases
     */
    @PostMapping("/project/{projectId}/batch")
    public ResponseEntity<?> createReleasesBatch(@PathVariable String projectId, @Valid @RequestBody List<Release> releases) {
        try {
            List<Release> createdReleases = releaseService.createReleasesBatch(projectId, releases);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReleases);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create releases batch: " + e.getMessage()));
        }
    }
}



