package com.sprintsync.api.service;

import com.sprintsync.api.entity.WorkflowLane;
import com.sprintsync.api.repository.WorkflowLaneRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service class for WorkflowLane entity operations.
 * Provides business logic for workflow lane management operations.
 * 
 * @author SprintSync Team
 */
@Service
@Transactional

@SuppressWarnings("null")
public class WorkflowLaneService {

    private static final Logger logger = LoggerFactory.getLogger(WorkflowLaneService.class);
    private final WorkflowLaneRepository workflowLaneRepository;

    @Autowired
    public WorkflowLaneService(WorkflowLaneRepository workflowLaneRepository) {
        this.workflowLaneRepository = workflowLaneRepository;
    }

    /**
     * Create a new workflow lane.
     * 
     * @param lane the workflow lane to create
     * @return the created workflow lane
     * @throws IllegalArgumentException if required fields are missing or invalid
     */
    public WorkflowLane createWorkflowLane(WorkflowLane lane) {
        // Validate required fields
        if (lane.getProjectId() == null || lane.getProjectId().trim().isEmpty()) {
            throw new IllegalArgumentException("Project ID is required");
        }
        
        if (lane.getTitle() == null || lane.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Lane title is required");
        }

        // Generate custom ID if not provided
        if (lane.getId() == null || lane.getId().trim().isEmpty()) {
            lane.setId("WFLN" + UUID.randomUUID().toString().replace("-", ""));
        }

        // Set default color if not provided
        if (lane.getColor() == null || lane.getColor().trim().isEmpty()) {
            lane.setColor("#3B82F6");
        }

        // Set default WIP limit enabled if not provided
        if (lane.getWipLimitEnabled() == null) {
            lane.setWipLimitEnabled(false);
        }

        // Set display order if not provided (only if explicitly null or 0)
        // Don't override if frontend explicitly set a displayOrder
        // Only set default if displayOrder is null or 0 (not if it's a valid number)
        if (lane.getDisplayOrder() == null || lane.getDisplayOrder() == 0) {
            Integer maxOrder = workflowLaneRepository.findMaxDisplayOrderByProjectId(lane.getProjectId());
            lane.setDisplayOrder((maxOrder == null ? 0 : maxOrder) + 1);
            logger.debug("Set default displayOrder: {} for lane: {}", lane.getDisplayOrder(), lane.getTitle());
        } else {
            logger.debug("Using provided displayOrder: {} for lane: {}", lane.getDisplayOrder(), lane.getTitle());
        }

        // Generate status value if not provided
        if (lane.getStatusValue() == null || lane.getStatusValue().trim().isEmpty()) {
            lane.setStatusValue("custom_lane_" + UUID.randomUUID().toString().substring(0, 8));
        }

        try {
            logger.debug("Saving workflow lane: projectId={}, title={}, statusValue={}", 
                    lane.getProjectId(), lane.getTitle(), lane.getStatusValue());
            WorkflowLane savedLane = workflowLaneRepository.save(lane);
            logger.info("Successfully saved workflow lane with ID: {}", savedLane.getId());
            return savedLane;
        } catch (Exception e) {
            logger.error("Error saving workflow lane", e);
            throw new IllegalArgumentException("Failed to save workflow lane: " + e.getMessage(), e);
        }
    }

    /**
     * Find workflow lane by ID.
     * 
     * @param id the workflow lane ID
     * @return Optional containing the workflow lane if found
     */
    @Transactional(readOnly = true)
    public Optional<WorkflowLane> findById(String id) {
        return workflowLaneRepository.findById(id);
    }

    /**
     * Update an existing workflow lane.
     * 
     * @param lane the workflow lane to update
     * @return the updated workflow lane
     * @throws IllegalArgumentException if workflow lane not found
     */
    public WorkflowLane updateWorkflowLane(WorkflowLane lane) {
        if (!workflowLaneRepository.existsById(lane.getId())) {
            throw new IllegalArgumentException("Workflow lane not found with ID: " + lane.getId());
        }
        return workflowLaneRepository.save(lane);
    }

    /**
     * Delete a workflow lane by ID.
     * 
     * @param id the workflow lane ID
     * @throws IllegalArgumentException if workflow lane not found
     */
    public void deleteWorkflowLane(String id) {
        if (!workflowLaneRepository.existsById(id)) {
            throw new IllegalArgumentException("Workflow lane not found with ID: " + id);
        }
        workflowLaneRepository.deleteById(id);
    }

    /**
     * Get all workflow lanes for a project, ordered by display order.
     * Returns lanes for the default board (boardId is null).
     * 
     * @param projectId the project ID
     * @return list of workflow lanes for the project (default board)
     */
    @Transactional(readOnly = true)
    public List<WorkflowLane> getWorkflowLanesByProject(String projectId) {
        return workflowLaneRepository.findByProjectIdAndDefaultBoardOrderByDisplayOrderAsc(projectId);
    }

    /**
     * Get workflow lanes for a project and board, ordered by display order.
     * 
     * @param projectId the project ID
     * @param boardId the board ID (null for default board)
     * @return list of workflow lanes for the project and board
     */
    @Transactional(readOnly = true)
    public List<WorkflowLane> getWorkflowLanesByProjectAndBoard(String projectId, String boardId) {
        return workflowLaneRepository.findByProjectIdAndBoardIdOrderByDisplayOrderAsc(projectId, boardId);
    }

    /**
     * Get all workflow lanes.
     * 
     * @return list of all workflow lanes
     */
    @Transactional(readOnly = true)
    public List<WorkflowLane> getAllWorkflowLanes() {
        return workflowLaneRepository.findAll();
    }

    /**
     * Find workflow lane by status value and project ID.
     * 
     * @param statusValue the status value
     * @param projectId the project ID
     * @return the workflow lane if found
     */
    @Transactional(readOnly = true)
    public WorkflowLane findByStatusValueAndProjectId(String statusValue, String projectId) {
        return workflowLaneRepository.findByStatusValueAndProjectId(statusValue, projectId);
    }

    /**
     * Update display order of workflow lanes.
     * 
     * @param laneIds list of lane IDs in the desired order
     * @throws IllegalArgumentException if any lane not found
     */
    public void updateDisplayOrder(List<String> laneIds) {
        for (int i = 0; i < laneIds.size(); i++) {
            Optional<WorkflowLane> laneOpt = workflowLaneRepository.findById(laneIds.get(i));
            if (laneOpt.isPresent()) {
                WorkflowLane lane = laneOpt.get();
                lane.setDisplayOrder(i + 1);
                workflowLaneRepository.save(lane);
            } else {
                throw new IllegalArgumentException("Workflow lane not found with ID: " + laneIds.get(i));
            }
        }
    }
}







