package com.sprintsync.api.controller;

import com.sprintsync.api.entity.QualityGate;
import com.sprintsync.api.entity.enums.QualityGateStatus;
import com.sprintsync.api.service.QualityGateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
// import java.util.String; // Removed - using String IDs

/**
 * REST Controller for QualityGate entity operations.
 * Provides HTTP endpoints for quality gate management.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/quality-gates")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class QualityGateController {

    private final QualityGateService qualityGateService;

    @Autowired
    public QualityGateController(QualityGateService qualityGateService) {
        this.qualityGateService = qualityGateService;
    }

    /**
     * Create a new quality gate.
     * 
     * @param qualityGate the quality gate to create
     * @return ResponseEntity containing the created quality gate
     */
    @PostMapping
    public ResponseEntity<?> createQualityGate(@Valid @RequestBody QualityGate qualityGate) {
        try {
            QualityGate createdQualityGate = qualityGateService.createQualityGate(qualityGate);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdQualityGate);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create quality gate: " + e.getMessage()));
        }
    }

    /**
     * Get quality gate by ID.
     * 
     * @param id the quality gate ID
     * @return ResponseEntity containing the quality gate if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQualityGateById(@PathVariable String id) {
        try {
            return qualityGateService.findById(id)
                    .map(qualityGate -> ResponseEntity.ok(qualityGate))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve quality gate: " + e.getMessage()));
        }
    }

    /**
     * Update an existing quality gate.
     * 
     * @param id the quality gate ID
     * @param qualityGate the updated quality gate data
     * @return ResponseEntity containing the updated quality gate
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateQualityGate(@PathVariable String id, @Valid @RequestBody QualityGate qualityGate) {
        try {
            qualityGate.setId(id); // Ensure the ID matches the path variable
            QualityGate updatedQualityGate = qualityGateService.updateQualityGate(qualityGate);
            return ResponseEntity.ok(updatedQualityGate);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update quality gate: " + e.getMessage()));
        }
    }

    /**
     * Delete a quality gate by ID.
     * 
     * @param id the quality gate ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteQualityGate(@PathVariable String id) {
        try {
            qualityGateService.deleteQualityGate(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete quality gate: " + e.getMessage()));
        }
    }

    /**
     * Get all quality gates.
     * 
     * @return ResponseEntity containing list of all quality gates
     */
    @GetMapping
    public ResponseEntity<?> getAllQualityGates() {
        try {
            List<QualityGate> qualityGates = qualityGateService.getAllQualityGates();
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve quality gates: " + e.getMessage()));
        }
    }

    /**
     * Get all quality gates with pagination.
     * 
     * @param pageable pagination parameters
     * @return ResponseEntity containing page of quality gates
     */
    @GetMapping("/paginated")
    public ResponseEntity<?> getAllQualityGatesPaginated(Pageable pageable) {
        try {
            Page<QualityGate> qualityGates = qualityGateService.getAllQualityGates(pageable);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve quality gates: " + e.getMessage()));
        }
    }

    /**
     * Get quality gates by release.
     * 
     * @param releaseId the release ID
     * @return ResponseEntity containing list of quality gates for the specified release
     */
    @GetMapping("/release/{releaseId}")
    public ResponseEntity<?> getQualityGatesByRelease(@PathVariable String releaseId) {
        try {
            List<QualityGate> qualityGates = qualityGateService.findQualityGatesByRelease(releaseId);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve quality gates by release: " + e.getMessage()));
        }
    }

    /**
     * Get quality gates by release with pagination.
     * 
     * @param releaseId the release ID
     * @param pageable pagination parameters
     * @return ResponseEntity containing page of quality gates for the specified release
     */
    @GetMapping("/release/{releaseId}/paginated")
    public ResponseEntity<?> getQualityGatesByReleasePaginated(@PathVariable String releaseId, Pageable pageable) {
        try {
            Page<QualityGate> qualityGates = qualityGateService.findQualityGatesByRelease(releaseId, pageable);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve quality gates by release: " + e.getMessage()));
        }
    }

    /**
     * Get quality gates by status.
     * 
     * @param status the quality gate status
     * @return ResponseEntity containing list of quality gates with the specified status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getQualityGatesByStatus(@PathVariable QualityGateStatus status) {
        try {
            List<QualityGate> qualityGates = qualityGateService.findQualityGatesByStatus(status);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve quality gates by status: " + e.getMessage()));
        }
    }

    /**
     * Get quality gates by status with pagination.
     * 
     * @param status the quality gate status
     * @param pageable pagination parameters
     * @return ResponseEntity containing page of quality gates with the specified status
     */
    @GetMapping("/status/{status}/paginated")
    public ResponseEntity<?> getQualityGatesByStatusPaginated(@PathVariable QualityGateStatus status, Pageable pageable) {
        try {
            Page<QualityGate> qualityGates = qualityGateService.findQualityGatesByStatus(status, pageable);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve quality gates by status: " + e.getMessage()));
        }
    }

    /**
     * Get quality gates by required status.
     * 
     * @param required the required status
     * @return ResponseEntity containing list of quality gates with the specified required status
     */
    @GetMapping("/required/{required}")
    public ResponseEntity<?> getQualityGatesByRequired(@PathVariable Boolean required) {
        try {
            List<QualityGate> qualityGates = qualityGateService.findQualityGatesByRequired(required);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve quality gates by required status: " + e.getMessage()));
        }
    }

    /**
     * Search quality gates by name.
     * 
     * @param name the name to search for
     * @return ResponseEntity containing list of quality gates with names containing the search term
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchQualityGatesByName(@RequestParam String name) {
        try {
            List<QualityGate> qualityGates = qualityGateService.searchQualityGatesByName(name);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search quality gates: " + e.getMessage()));
        }
    }

    /**
     * Get quality gates by multiple criteria.
     * 
     * @param releaseId the release ID (optional)
     * @param status the quality gate status (optional)
     * @param required the required status (optional)
     * @return ResponseEntity containing list of quality gates matching the criteria
     */
    @GetMapping("/criteria")
    public ResponseEntity<?> getQualityGatesByCriteria(
            @RequestParam(required = false) String releaseId,
            @RequestParam(required = false) QualityGateStatus status,
            @RequestParam(required = false) Boolean required) {
        try {
            List<QualityGate> qualityGates = qualityGateService.findQualityGatesByCriteria(releaseId, status, required);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve quality gates by criteria: " + e.getMessage()));
        }
    }

    /**
     * Get pending quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return ResponseEntity containing list of pending quality gates for the specified release
     */
    @GetMapping("/release/{releaseId}/pending")
    public ResponseEntity<?> getPendingQualityGatesByRelease(@PathVariable String releaseId) {
        try {
            List<QualityGate> qualityGates = qualityGateService.findPendingQualityGatesByRelease(releaseId);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve pending quality gates: " + e.getMessage()));
        }
    }

    /**
     * Get failed quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return ResponseEntity containing list of failed quality gates for the specified release
     */
    @GetMapping("/release/{releaseId}/failed")
    public ResponseEntity<?> getFailedQualityGatesByRelease(@PathVariable String releaseId) {
        try {
            List<QualityGate> qualityGates = qualityGateService.findFailedQualityGatesByRelease(releaseId);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve failed quality gates: " + e.getMessage()));
        }
    }

    /**
     * Get passed quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return ResponseEntity containing list of passed quality gates for the specified release
     */
    @GetMapping("/release/{releaseId}/passed")
    public ResponseEntity<?> getPassedQualityGatesByRelease(@PathVariable String releaseId) {
        try {
            List<QualityGate> qualityGates = qualityGateService.findPassedQualityGatesByRelease(releaseId);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve passed quality gates: " + e.getMessage()));
        }
    }

    /**
     * Get all required quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return ResponseEntity containing list of all required quality gates for the specified release
     */
    @GetMapping("/release/{releaseId}/required")
    public ResponseEntity<?> getRequiredQualityGatesByRelease(@PathVariable String releaseId) {
        try {
            List<QualityGate> qualityGates = qualityGateService.findRequiredQualityGatesByRelease(releaseId);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve required quality gates: " + e.getMessage()));
        }
    }

    /**
     * Get quality gate count by status for a release.
     * 
     * @param releaseId the release ID
     * @param status the quality gate status
     * @return ResponseEntity containing count of quality gates with the specified status for the release
     */
    @GetMapping("/count/release/{releaseId}/status/{status}")
    public ResponseEntity<?> getQualityGateCountByReleaseIdAndStatus(@PathVariable String releaseId, @PathVariable QualityGateStatus status) {
        try {
            long count = qualityGateService.countQualityGatesByReleaseIdAndStatus(releaseId, status);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to count quality gates: " + e.getMessage()));
        }
    }

    /**
     * Check if all required quality gates are passed for a release.
     * 
     * @param releaseId the release ID
     * @return ResponseEntity containing boolean indicating if all required quality gates are passed
     */
    @GetMapping("/release/{releaseId}/all-required-passed")
    public ResponseEntity<?> areAllRequiredQualityGatesPassed(@PathVariable String releaseId) {
        try {
            boolean allPassed = qualityGateService.areAllRequiredQualityGatesPassed(releaseId);
            return ResponseEntity.ok(Map.of("allRequiredPassed", allPassed));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check quality gate status: " + e.getMessage()));
        }
    }

    /**
     * Get quality gates completed in date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return ResponseEntity containing list of quality gates completed within the specified date range
     */
    @GetMapping("/completed/date-range")
    public ResponseEntity<?> getCompletedQualityGatesByDateRange(
            @RequestParam LocalDateTime startDate,
            @RequestParam LocalDateTime endDate) {
        try {
            List<QualityGate> qualityGates = qualityGateService.findCompletedQualityGatesByDateRange(startDate, endDate);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve completed quality gates by date range: " + e.getMessage()));
        }
    }

    /**
     * Get quality gates that are blocking release.
     * 
     * @param releaseId the release ID
     * @return ResponseEntity containing list of quality gates that are blocking the release
     */
    @GetMapping("/release/{releaseId}/blocking")
    public ResponseEntity<?> getBlockingQualityGatesByRelease(@PathVariable String releaseId) {
        try {
            List<QualityGate> qualityGates = qualityGateService.findBlockingQualityGatesByRelease(releaseId);
            return ResponseEntity.ok(qualityGates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve blocking quality gates: " + e.getMessage()));
        }
    }

    /**
     * Update quality gate status.
     * 
     * @param id the quality gate ID
     * @param status the new status
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateQualityGateStatus(@PathVariable String id, @RequestParam QualityGateStatus status) {
        try {
            qualityGateService.updateQualityGateStatus(id, status);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update quality gate status: " + e.getMessage()));
        }
    }

    /**
     * Pass a quality gate.
     * 
     * @param id the quality gate ID
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/pass")
    public ResponseEntity<?> passQualityGate(@PathVariable String id) {
        try {
            qualityGateService.passQualityGate(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to pass quality gate: " + e.getMessage()));
        }
    }

    /**
     * Fail a quality gate.
     * 
     * @param id the quality gate ID
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/fail")
    public ResponseEntity<?> failQualityGate(@PathVariable String id) {
        try {
            qualityGateService.failQualityGate(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fail quality gate: " + e.getMessage()));
        }
    }

    /**
     * Reset a quality gate to pending.
     * 
     * @param id the quality gate ID
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/reset")
    public ResponseEntity<?> resetQualityGate(@PathVariable String id) {
        try {
            qualityGateService.resetQualityGate(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reset quality gate: " + e.getMessage()));
        }
    }

    /**
     * Set quality gate as required or optional.
     * 
     * @param id the quality gate ID
     * @param required the required status
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/required")
    public ResponseEntity<?> setQualityGateRequired(@PathVariable String id, @RequestParam Boolean required) {
        try {
            qualityGateService.setQualityGateRequired(id, required);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update quality gate required status: " + e.getMessage()));
        }
    }

    /**
     * Get quality gate statistics for a release.
     * 
     * @param releaseId the release ID
     * @return ResponseEntity containing quality gate statistics
     */
    @GetMapping("/release/{releaseId}/statistics")
    public ResponseEntity<?> getQualityGateStatistics(@PathVariable String releaseId) {
        try {
            Map<String, Object> stats = qualityGateService.getQualityGateStatistics(releaseId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve quality gate statistics: " + e.getMessage()));
        }
    }
}
