package com.sprintsync.api.repository;

import com.sprintsync.api.entity.WorkflowLane;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for WorkflowLane entity operations.
 * Provides CRUD operations and custom query methods for workflow lane management.
 * 
 * @author SprintSync Team
 */
@Repository
public interface WorkflowLaneRepository extends JpaRepository<WorkflowLane, String> {

    /**
     * Find workflow lanes by project ID, ordered by display order.
     * 
     * @param projectId the project ID
     * @return list of workflow lanes for the specified project, ordered by display order
     */
    List<WorkflowLane> findByProjectIdOrderByDisplayOrderAsc(String projectId);

    /**
     * Find workflow lanes by project ID.
     * 
     * @param projectId the project ID
     * @return list of workflow lanes for the specified project
     */
    List<WorkflowLane> findByProjectId(String projectId);

    /**
     * Find workflow lane by status value and project ID.
     * 
     * @param statusValue the status value
     * @param projectId the project ID
     * @return the workflow lane if found
     */
    WorkflowLane findByStatusValueAndProjectId(String statusValue, String projectId);

    /**
     * Count workflow lanes by project ID.
     * 
     * @param projectId the project ID
     * @return count of workflow lanes for the specified project
     */
    long countByProjectId(String projectId);

    /**
     * Find the maximum display order for a project.
     * Uses a custom query to find the maximum display order.
     * 
     * @param projectId the project ID
     * @return the maximum display order value, or null if no lanes exist
     */
    @org.springframework.data.jpa.repository.Query("SELECT MAX(wl.displayOrder) FROM WorkflowLane wl WHERE wl.projectId = :projectId")
    Integer findMaxDisplayOrderByProjectId(@org.springframework.data.repository.query.Param("projectId") String projectId);
}

