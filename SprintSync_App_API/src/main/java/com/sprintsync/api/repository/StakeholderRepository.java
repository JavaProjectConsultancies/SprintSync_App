package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Stakeholder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StakeholderRepository extends JpaRepository<Stakeholder, String> {
    
    /**
     * Find all stakeholders for a specific project
     */
    List<Stakeholder> findByProjectId(String projectId);
    
    /**
     * Find stakeholders by project ID and role
     */
    List<Stakeholder> findByProjectIdAndRole(String projectId, String role);
    
    /**
     * Count stakeholders by project ID
     */
    long countByProjectId(String projectId);
}
