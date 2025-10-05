package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Milestone entity operations
 */
@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, String> {
    
    /**
     * Find all milestones for a specific project
     * @param projectId the project ID
     * @return list of milestones
     */
    List<Milestone> findByProjectId(String projectId);
    
    /**
     * Find milestones by status
     * @param status the milestone status
     * @return list of milestones
     */
    List<Milestone> findByStatus(String status);
    
    /**
     * Count milestones by project
     * @param projectId the project ID
     * @return count of milestones
     */
    long countByProjectId(String projectId);
}
