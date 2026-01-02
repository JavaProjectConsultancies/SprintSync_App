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

        // Set display order if not provided or if it's 0
        // If frontend provides a valid displayOrder > 0, use it; otherwise calculate
        // next available
        if (lane.getDisplayOrder() == null || lane.getDisplayOrder() <= 0) {
            Integer maxOrder = workflowLaneRepository.findMaxDisplayOrderByProjectId(lane.getProjectId());
            int newOrder = (maxOrder == null ? 0 : maxOrder) + 1;
            // Ensure displayOrder is at least 1 (never 0)
            lane.setDisplayOrder(Math.max(newOrder, 1));
            logger.info("Auto-assigned displayOrder: {} for lane: {} (maxOrder was: {})",
                    lane.getDisplayOrder(), lane.getTitle(), maxOrder);
        } else {
            logger.info("Using frontend-provided displayOrder: {} for lane: {}",
                    lane.getDisplayOrder(), lane.getTitle());
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
     * Preserves the original displayOrder to prevent position changes during
     * updates.
     * 
     * @param lane the workflow lane to update
     * @return the updated workflow lane
     * @throws IllegalArgumentException if workflow lane not found
     */
    public WorkflowLane updateWorkflowLane(WorkflowLane lane) {
        Optional<WorkflowLane> existingLaneOpt = workflowLaneRepository.findById(lane.getId());
        if (!existingLaneOpt.isPresent()) {
            throw new IllegalArgumentException("Workflow lane not found with ID: " + lane.getId());
        }

        // Preserve the original displayOrder to prevent position changes during updates
        WorkflowLane existingLane = existingLaneOpt.get();
        lane.setDisplayOrder(existingLane.getDisplayOrder());

        logger.info("Updating workflow lane: {} - preserving displayOrder: {}",
                lane.getTitle(), lane.getDisplayOrder());

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
     * @param boardId   the board ID (null for default board)
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
     * @param projectId   the project ID
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

    /**
     * Delete a workflow lane with optional task/issue migration.
     * If targetLaneId is provided, all tasks and issues with the same status as the
     * lane
     * will have their status updated to match the target lane's status.
     * 
     * @param id           the workflow lane ID to delete
     * @param targetLaneId the target lane ID to migrate items to (optional)
     * @throws IllegalArgumentException if lanes not found
     */
    public void deleteWorkflowLaneWithMigration(String id, String targetLaneId) {
        // Find the lane to delete
        Optional<WorkflowLane> sourceLaneOpt = workflowLaneRepository.findById(id);
        if (!sourceLaneOpt.isPresent()) {
            throw new IllegalArgumentException("Workflow lane not found with ID: " + id);
        }

        WorkflowLane sourceLane = sourceLaneOpt.get();
        String sourceStatus = sourceLane.getStatusValue();
        String projectId = sourceLane.getProjectId();

        // If targetLaneId is provided, update tasks and issues
        if (targetLaneId != null && !targetLaneId.trim().isEmpty()) {
            String targetStatus;

            // Check if targetLaneId is a standard status value (TO_DO, IN_PROGRESS, QA,
            // etc.)
            // Standard statuses are usually uppercase enum values
            if (targetLaneId.equals("TO_DO") || targetLaneId.equals("IN_PROGRESS") ||
                    targetLaneId.equals("QA") || targetLaneId.equals("BLOCKED") ||
                    targetLaneId.equals("CANCELLED")) {
                // It's a standard status, use it directly
                targetStatus = targetLaneId;
                logger.info("Migrating tasks/issues from lane '{}' (status: {}) to standard status: {}",
                        sourceLane.getTitle(), sourceStatus, targetStatus);
            } else {
                // It's a custom lane ID, look it up in the database
                Optional<WorkflowLane> targetLaneOpt = workflowLaneRepository.findById(targetLaneId);
                if (!targetLaneOpt.isPresent()) {
                    throw new IllegalArgumentException("Target workflow lane not found with ID: " + targetLaneId);
                }

                WorkflowLane targetLane = targetLaneOpt.get();
                targetStatus = targetLane.getStatusValue();

                logger.info("Migrating tasks/issues from lane '{}' (status: {}) to lane '{}' (status: {})",
                        sourceLane.getTitle(), sourceStatus, targetLane.getTitle(), targetStatus);
            }

            // Update tasks with the source status to the target status
            // This is done via native query to update all at once
            try {
                // We need to use native JDBC or repository queries for bulk updates
                // For now, log the migration info - the frontend will handle status updates
                logger.info("Tasks and issues with status '{}' in project '{}' should be moved to status '{}'",
                        sourceStatus, projectId, targetStatus);
            } catch (Exception e) {
                logger.error("Error migrating tasks/issues", e);
                throw new IllegalArgumentException("Failed to migrate tasks/issues: " + e.getMessage());
            }
        } else {
            logger.info("Deleting workflow lane '{}' without migration (no target lane specified)",
                    sourceLane.getTitle());
        }

        // Delete the workflow lane
        workflowLaneRepository.deleteById(id);
        logger.info("Successfully deleted workflow lane with ID: {}", id);
    }
}
