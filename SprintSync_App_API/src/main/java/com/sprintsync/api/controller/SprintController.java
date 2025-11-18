package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Sprint;
import com.sprintsync.api.entity.enums.SprintStatus;
import com.sprintsync.api.service.SprintService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Sprint management operations.
 * Provides endpoints for CRUD operations on Sprint entities.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/sprints")
@CrossOrigin(origins = "*")
public class SprintController {

    @Autowired
    private SprintService sprintService;

    /**
     * Get all sprints with pagination
     */
    @GetMapping
    public ResponseEntity<Page<Sprint>> getAllSprints(Pageable pageable) {
        try {
            Page<Sprint> sprints = sprintService.getAllSprints(pageable);
            return ResponseEntity.ok(sprints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprint by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Sprint> getSprintById(@PathVariable String id) {
        try {
            Sprint sprint = sprintService.getSprintById(id);
            if (sprint != null) {
                return ResponseEntity.ok(sprint);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new sprint
     */
    @PostMapping
    public ResponseEntity<Sprint> createSprint(@Valid @RequestBody Sprint sprint) {
        try {
            Sprint createdSprint = sprintService.createSprint(sprint);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdSprint);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update an existing sprint
     */
    @PutMapping("/{id}")
    public ResponseEntity<Sprint> updateSprint(@PathVariable String id, @Valid @RequestBody Sprint sprint) {
        try {
            sprint.setId(id);
            Sprint updatedSprint = sprintService.updateSprint(sprint);
            if (updatedSprint != null) {
                return ResponseEntity.ok(updatedSprint);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Delete a sprint
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSprint(@PathVariable String id) {
        try {
            boolean deleted = sprintService.deleteSprint(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprints by project ID
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Sprint>> getSprintsByProjectId(@PathVariable String projectId) {
        try {
            List<Sprint> sprints = sprintService.getSprintsByProjectId(projectId);
            return ResponseEntity.ok(sprints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprints by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Sprint>> getSprintsByStatus(@PathVariable SprintStatus status) {
        try {
            List<Sprint> sprints = sprintService.getSprintsByStatus(status);
            return ResponseEntity.ok(sprints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get active sprints
     */
    @GetMapping("/active")
    public ResponseEntity<List<Sprint>> getActiveSprints() {
        try {
            List<Sprint> activeSprints = sprintService.getActiveSprints();
            return ResponseEntity.ok(activeSprints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get current sprint for a project
     */
    @GetMapping("/current/project/{projectId}")
    public ResponseEntity<Sprint> getCurrentSprint(@PathVariable String projectId) {
        try {
            Sprint currentSprint = sprintService.getCurrentSprint(projectId);
            if (currentSprint != null) {
                return ResponseEntity.ok(currentSprint);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update sprint status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Sprint> updateSprintStatus(@PathVariable String id, @RequestBody Map<String, SprintStatus> statusUpdate) {
        try {
            SprintStatus newStatus = statusUpdate.get("status");
            Sprint updatedSprint = sprintService.updateSprintStatus(id, newStatus);
            if (updatedSprint != null) {
                return ResponseEntity.ok(updatedSprint);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Start a sprint
     */
    @PostMapping("/{id}/start")
    public ResponseEntity<Sprint> startSprint(@PathVariable String id) {
        try {
            Sprint startedSprint = sprintService.startSprint(id);
            if (startedSprint != null) {
                return ResponseEntity.ok(startedSprint);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Complete a sprint
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<Sprint> completeSprint(@PathVariable String id) {
        try {
            Sprint completedSprint = sprintService.completeSprint(id);
            if (completedSprint != null) {
                return ResponseEntity.ok(completedSprint);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get sprint statistics
     */
    @GetMapping("/{id}/statistics")
    public ResponseEntity<Map<String, Object>> getSprintStatistics(@PathVariable String id) {
        try {
            Map<String, Object> statistics = sprintService.getSprintStatistics(id);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprint velocity
     */
    @GetMapping("/{id}/velocity")
    public ResponseEntity<Map<String, Object>> getSprintVelocity(@PathVariable String id) {
        try {
            Map<String, Object> velocity = sprintService.getSprintVelocity(id);
            return ResponseEntity.ok(velocity);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprint burndown data
     */
    @GetMapping("/{id}/burndown")
    public ResponseEntity<Map<String, Object>> getSprintBurndown(@PathVariable String id) {
        try {
            Map<String, Object> burndown = sprintService.getSprintBurndown(id);
            return ResponseEntity.ok(burndown);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprints in date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<Sprint>> getSprintsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<Sprint> sprints = sprintService.getSprintsInDateRange(startDate, endDate);
            return ResponseEntity.ok(sprints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get upcoming sprints
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<Sprint>> getUpcomingSprints() {
        try {
            List<Sprint> upcomingSprints = sprintService.getUpcomingSprints();
            return ResponseEntity.ok(upcomingSprints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get completed sprints
     */
    @GetMapping("/completed")
    public ResponseEntity<List<Sprint>> getCompletedSprints() {
        try {
            List<Sprint> completedSprints = sprintService.getCompletedSprints();
            return ResponseEntity.ok(completedSprints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search sprints by name
     */
    @GetMapping("/search")
    public ResponseEntity<List<Sprint>> searchSprints(@RequestParam String query) {
        try {
            List<Sprint> sprints = sprintService.searchSprints(query);
            return ResponseEntity.ok(sprints);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprint capacity
     */
    @GetMapping("/{id}/capacity")
    public ResponseEntity<Map<String, Object>> getSprintCapacity(@PathVariable String id) {
        try {
            Map<String, Object> capacity = sprintService.getSprintCapacity(id);
            return ResponseEntity.ok(capacity);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprint progress
     */
    @GetMapping("/{id}/progress")
    public ResponseEntity<Map<String, Object>> getSprintProgress(@PathVariable String id) {
        try {
            Map<String, Object> progress = sprintService.getSprintProgress(id);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprint team allocation
     */
    @GetMapping("/{id}/team-allocation")
    public ResponseEntity<Map<String, Object>> getSprintTeamAllocation(@PathVariable String id) {
        try {
            Map<String, Object> teamAllocation = sprintService.getSprintTeamAllocation(id);
            return ResponseEntity.ok(teamAllocation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Copy sprint
     */
    @PostMapping("/{id}/copy")
    public ResponseEntity<Sprint> copySprint(@PathVariable String id, @RequestBody Map<String, String> copyRequest) {
        try {
            String newSprintName = copyRequest.get("name");
            Sprint copiedSprint = sprintService.copySprint(id, newSprintName);
            if (copiedSprint != null) {
                return ResponseEntity.status(HttpStatus.CREATED).body(copiedSprint);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get sprint retrospective data
     */
    @GetMapping("/{id}/retrospective")
    public ResponseEntity<Map<String, Object>> getSprintRetrospective(@PathVariable String id) {
        try {
            Map<String, Object> retrospective = sprintService.getSprintRetrospective(id);
            return ResponseEntity.ok(retrospective);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}



