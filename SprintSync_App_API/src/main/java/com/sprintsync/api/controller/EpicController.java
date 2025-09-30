package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Epic;
import com.sprintsync.api.entity.enums.EpicStatus;
import com.sprintsync.api.entity.enums.Priority;
import com.sprintsync.api.service.EpicService;
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
 * REST Controller for Epic entity operations.
 * Provides HTTP endpoints for epic management.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/epics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class EpicController {

    private final EpicService epicService;

    @Autowired
    public EpicController(EpicService epicService) {
        this.epicService = epicService;
    }

    /**
     * Create a new epic.
     * 
     * @param epic the epic to create
     * @return ResponseEntity containing the created epic
     */
    @PostMapping
    public ResponseEntity<?> createEpic(@Valid @RequestBody Epic epic) {
        try {
            Epic createdEpic = epicService.createEpic(epic);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEpic);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create epic: " + e.getMessage()));
        }
    }

    /**
     * Get epic by ID.
     * 
     * @param id the epic ID
     * @return ResponseEntity containing the epic if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getEpicById(@PathVariable String id) {
        try {
            return epicService.findById(id)
                    .map(epic -> ResponseEntity.ok(epic))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epic: " + e.getMessage()));
        }
    }

    /**
     * Update an existing epic.
     * 
     * @param id the epic ID
     * @param epic the updated epic data
     * @return ResponseEntity containing the updated epic
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEpic(@PathVariable String id, @Valid @RequestBody Epic epic) {
        try {
            epic.setId(id); // Ensure the ID matches the path variable
            Epic updatedEpic = epicService.updateEpic(epic);
            return ResponseEntity.ok(updatedEpic);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update epic: " + e.getMessage()));
        }
    }

    /**
     * Delete an epic by ID.
     * 
     * @param id the epic ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEpic(@PathVariable String id) {
        try {
            epicService.deleteEpic(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete epic: " + e.getMessage()));
        }
    }

    /**
     * Get all epics.
     * 
     * @return ResponseEntity containing list of all epics
     */
    @GetMapping
    public ResponseEntity<?> getAllEpics() {
        try {
            List<Epic> epics = epicService.getAllEpics();
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics: " + e.getMessage()));
        }
    }

    /**
     * Get all epics with pagination.
     * 
     * @param pageable pagination parameters
     * @return ResponseEntity containing page of epics
     */
    @GetMapping("/paginated")
    public ResponseEntity<?> getAllEpicsPaginated(Pageable pageable) {
        try {
            Page<Epic> epics = epicService.getAllEpics(pageable);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics: " + e.getMessage()));
        }
    }

    /**
     * Get epics by project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of epics in the specified project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getEpicsByProject(@PathVariable String projectId) {
        try {
            List<Epic> epics = epicService.findEpicsByProject(projectId);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by project: " + e.getMessage()));
        }
    }

    /**
     * Get epics by project with pagination.
     * 
     * @param projectId the project ID
     * @param pageable pagination parameters
     * @return ResponseEntity containing page of epics in the specified project
     */
    @GetMapping("/project/{projectId}/paginated")
    public ResponseEntity<?> getEpicsByProjectPaginated(@PathVariable String projectId, Pageable pageable) {
        try {
            Page<Epic> epics = epicService.findEpicsByProject(projectId, pageable);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by project: " + e.getMessage()));
        }
    }

    /**
     * Get epics by status.
     * 
     * @param status the epic status
     * @return ResponseEntity containing list of epics with the specified status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getEpicsByStatus(@PathVariable EpicStatus status) {
        try {
            List<Epic> epics = epicService.findEpicsByStatus(status);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by status: " + e.getMessage()));
        }
    }

    /**
     * Get epics by status with pagination.
     * 
     * @param status the epic status
     * @param pageable pagination parameters
     * @return ResponseEntity containing page of epics with the specified status
     */
    @GetMapping("/status/{status}/paginated")
    public ResponseEntity<?> getEpicsByStatusPaginated(@PathVariable EpicStatus status, Pageable pageable) {
        try {
            Page<Epic> epics = epicService.findEpicsByStatus(status, pageable);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by status: " + e.getMessage()));
        }
    }

    /**
     * Get epics by priority.
     * 
     * @param priority the epic priority
     * @return ResponseEntity containing list of epics with the specified priority
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<?> getEpicsByPriority(@PathVariable Priority priority) {
        try {
            List<Epic> epics = epicService.findEpicsByPriority(priority);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by priority: " + e.getMessage()));
        }
    }

    /**
     * Get epics by assignee.
     * 
     * @param assigneeId the assignee ID
     * @return ResponseEntity containing list of epics assigned to the specified user
     */
    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<?> getEpicsByAssignee(@PathVariable String assigneeId) {
        try {
            List<Epic> epics = epicService.findEpicsByAssignee(assigneeId);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by assignee: " + e.getMessage()));
        }
    }

    /**
     * Get epics by owner.
     * 
     * @param ownerId the owner ID
     * @return ResponseEntity containing list of epics owned by the specified user
     */
    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<?> getEpicsByOwner(@PathVariable String ownerId) {
        try {
            List<Epic> epics = epicService.findEpicsByOwner(ownerId);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by owner: " + e.getMessage()));
        }
    }

    /**
     * Search epics by title.
     * 
     * @param title the title to search for
     * @return ResponseEntity containing list of epics with titles containing the search term
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchEpicsByTitle(@RequestParam String title) {
        try {
            List<Epic> epics = epicService.searchEpicsByTitle(title);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to search epics: " + e.getMessage()));
        }
    }

    /**
     * Get epics by theme.
     * 
     * @param theme the epic theme
     * @return ResponseEntity containing list of epics with the specified theme
     */
    @GetMapping("/theme/{theme}")
    public ResponseEntity<?> getEpicsByTheme(@PathVariable String theme) {
        try {
            List<Epic> epics = epicService.findEpicsByTheme(theme);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by theme: " + e.getMessage()));
        }
    }

    /**
     * Get epics by multiple criteria.
     * 
     * @param projectId the project ID (optional)
     * @param status the epic status (optional)
     * @param priority the epic priority (optional)
     * @param assigneeId the assignee ID (optional)
     * @return ResponseEntity containing list of epics matching the criteria
     */
    @GetMapping("/criteria")
    public ResponseEntity<?> getEpicsByCriteria(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) EpicStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String assigneeId) {
        try {
            List<Epic> epics = epicService.findEpicsByCriteria(projectId, status, priority, assigneeId);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by criteria: " + e.getMessage()));
        }
    }

    /**
     * Get active epics by project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of active epics in the specified project
     */
    @GetMapping("/project/{projectId}/active")
    public ResponseEntity<?> getActiveEpicsByProject(@PathVariable String projectId) {
        try {
            List<Epic> epics = epicService.findActiveEpicsByProject(projectId);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve active epics by project: " + e.getMessage()));
        }
    }

    /**
     * Get epics by assignee and status.
     * 
     * @param assigneeId the assignee ID
     * @param status the epic status
     * @return ResponseEntity containing list of epics assigned to user with specified status
     */
    @GetMapping("/assignee/{assigneeId}/status/{status}")
    public ResponseEntity<?> getEpicsByAssigneeAndStatus(@PathVariable String assigneeId, @PathVariable EpicStatus status) {
        try {
            List<Epic> epics = epicService.findEpicsByAssigneeAndStatus(assigneeId, status);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by assignee and status: " + e.getMessage()));
        }
    }

    /**
     * Get epics by date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return ResponseEntity containing list of epics within the specified date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<?> getEpicsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        try {
            List<Epic> epics = epicService.findEpicsByDateRange(startDate, endDate);
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epics by date range: " + e.getMessage()));
        }
    }

    /**
     * Get epic count by status in project.
     * 
     * @param projectId the project ID
     * @param status the epic status
     * @return ResponseEntity containing count of epics with the specified status in project
     */
    @GetMapping("/count/project/{projectId}/status/{status}")
    public ResponseEntity<?> getEpicCountByProjectIdAndStatus(@PathVariable String projectId, @PathVariable EpicStatus status) {
        try {
            long count = epicService.countEpicsByProjectIdAndStatus(projectId, status);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to count epics: " + e.getMessage()));
        }
    }

    /**
     * Get overdue epics.
     * 
     * @return ResponseEntity containing list of overdue epics
     */
    @GetMapping("/overdue")
    public ResponseEntity<?> getOverdueEpics() {
        try {
            List<Epic> epics = epicService.findOverdueEpics();
            return ResponseEntity.ok(epics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve overdue epics: " + e.getMessage()));
        }
    }

    /**
     * Get total story points by project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing total story points for the project
     */
    @GetMapping("/project/{projectId}/total-story-points")
    public ResponseEntity<?> getTotalStoryPointsByProject(@PathVariable String projectId) {
        try {
            Long totalStoryPoints = epicService.getTotalStoryPointsByProject(projectId);
            return ResponseEntity.ok(Map.of("totalStoryPoints", totalStoryPoints));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve total story points: " + e.getMessage()));
        }
    }

    /**
     * Get completed story points by project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing total completed story points for the project
     */
    @GetMapping("/project/{projectId}/completed-story-points")
    public ResponseEntity<?> getCompletedStoryPointsByProject(@PathVariable String projectId) {
        try {
            Long completedStoryPoints = epicService.getCompletedStoryPointsByProject(projectId);
            return ResponseEntity.ok(Map.of("completedStoryPoints", completedStoryPoints));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve completed story points: " + e.getMessage()));
        }
    }

    /**
     * Update epic status.
     * 
     * @param id the epic ID
     * @param status the new status
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateEpicStatus(@PathVariable String id, @RequestParam EpicStatus status) {
        try {
            epicService.updateEpicStatus(id, status);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update epic status: " + e.getMessage()));
        }
    }

    /**
     * Update epic progress.
     * 
     * @param id the epic ID
     * @param progress the new progress percentage (0-100)
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/progress")
    public ResponseEntity<?> updateEpicProgress(@PathVariable String id, @RequestParam Integer progress) {
        try {
            epicService.updateEpicProgress(id, progress);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update epic progress: " + e.getMessage()));
        }
    }

    /**
     * Assign epic to user.
     * 
     * @param id the epic ID
     * @param assigneeId the assignee ID
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assignEpic(@PathVariable String id, @RequestParam String assigneeId) {
        try {
            epicService.assignEpic(id, assigneeId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to assign epic: " + e.getMessage()));
        }
    }

    /**
     * Update epic story points.
     * 
     * @param id the epic ID
     * @param storyPoints the new story points
     * @param completedStoryPoints the completed story points
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/story-points")
    public ResponseEntity<?> updateEpicStoryPoints(@PathVariable String id, 
                                                  @RequestParam Integer storyPoints, 
                                                  @RequestParam Integer completedStoryPoints) {
        try {
            epicService.updateEpicStoryPoints(id, storyPoints, completedStoryPoints);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update epic story points: " + e.getMessage()));
        }
    }

    /**
     * Get epic statistics for a project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing epic statistics
     */
    @GetMapping("/project/{projectId}/statistics")
    public ResponseEntity<?> getEpicStatistics(@PathVariable String projectId) {
        try {
            Map<String, Object> stats = epicService.getEpicStatistics(projectId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve epic statistics: " + e.getMessage()));
        }
    }
}
