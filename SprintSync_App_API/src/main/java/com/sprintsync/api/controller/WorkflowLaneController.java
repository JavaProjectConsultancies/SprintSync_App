package com.sprintsync.api.controller;

import com.sprintsync.api.entity.WorkflowLane;
import com.sprintsync.api.service.WorkflowLaneService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for WorkflowLane entity operations.
 * Provides endpoints for workflow lane management operations.
 * 
 * @author SprintSync Team
 */
@RestController
@RequestMapping("/api/workflow-lanes")
@CrossOrigin(origins = "*")
public class WorkflowLaneController {

    private static final Logger logger = LoggerFactory.getLogger(WorkflowLaneController.class);
    private final WorkflowLaneService workflowLaneService;

    @Autowired
    public WorkflowLaneController(WorkflowLaneService workflowLaneService) {
        this.workflowLaneService = workflowLaneService;
    }

    /**
     * Create a new workflow lane.
     * 
     * @param lane the workflow lane to create
     * @return ResponseEntity containing the created workflow lane
     */
    @PostMapping
    public ResponseEntity<?> createWorkflowLane(@Valid @RequestBody WorkflowLane lane) {
        try {
            logger.info("Creating workflow lane for project: {}", lane.getProjectId());
            WorkflowLane createdLane = workflowLaneService.createWorkflowLane(lane);
            logger.info("Successfully created workflow lane with ID: {}", createdLane.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(createdLane);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid request for creating workflow lane: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "status", HttpStatus.BAD_REQUEST.value()));
        } catch (Exception e) {
            logger.error("Error creating workflow lane", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to create workflow lane: " + e.getMessage(), 
                                 "status", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }

    /**
     * Get workflow lane by ID.
     * 
     * @param id the workflow lane ID
     * @return ResponseEntity containing the workflow lane if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkflowLane> getWorkflowLaneById(@PathVariable String id) {
        Optional<WorkflowLane> lane = workflowLaneService.findById(id);
        return lane.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all workflow lanes for a project (default board).
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of workflow lanes for the project (default board)
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<WorkflowLane>> getWorkflowLanesByProject(@PathVariable String projectId) {
        List<WorkflowLane> lanes = workflowLaneService.getWorkflowLanesByProject(projectId);
        return ResponseEntity.ok(lanes);
    }

    /**
     * Get all workflow lanes for a project and board.
     * 
     * @param projectId the project ID
     * @param boardId the board ID (null for default board)
     * @return ResponseEntity containing list of workflow lanes for the project and board
     */
    @GetMapping("/project/{projectId}/board/{boardId}")
    public ResponseEntity<List<WorkflowLane>> getWorkflowLanesByProjectAndBoard(
            @PathVariable String projectId, 
            @PathVariable(required = false) String boardId) {
        List<WorkflowLane> lanes = workflowLaneService.getWorkflowLanesByProjectAndBoard(projectId, boardId);
        return ResponseEntity.ok(lanes);
    }

    /**
     * Get all workflow lanes.
     * 
     * @return ResponseEntity containing list of all workflow lanes
     */
    @GetMapping
    public ResponseEntity<List<WorkflowLane>> getAllWorkflowLanes() {
        List<WorkflowLane> lanes = workflowLaneService.getAllWorkflowLanes();
        return ResponseEntity.ok(lanes);
    }

    /**
     * Update an existing workflow lane.
     * 
     * @param id the workflow lane ID
     * @param lane the updated workflow lane
     * @return ResponseEntity containing the updated workflow lane
     */
    @PutMapping("/{id}")
    public ResponseEntity<WorkflowLane> updateWorkflowLane(@PathVariable String id, @RequestBody WorkflowLane lane) {
        try {
            lane.setId(id);
            WorkflowLane updatedLane = workflowLaneService.updateWorkflowLane(lane);
            return ResponseEntity.ok(updatedLane);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a workflow lane by ID.
     * 
     * @param id the workflow lane ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflowLane(@PathVariable String id) {
        try {
            workflowLaneService.deleteWorkflowLane(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update display order of workflow lanes.
     * 
     * @param laneIds list of lane IDs in the desired order
     * @return ResponseEntity with no content if successful
     */
    @PutMapping("/reorder")
    public ResponseEntity<Void> updateDisplayOrder(@RequestBody List<String> laneIds) {
        try {
            workflowLaneService.updateDisplayOrder(laneIds);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}




