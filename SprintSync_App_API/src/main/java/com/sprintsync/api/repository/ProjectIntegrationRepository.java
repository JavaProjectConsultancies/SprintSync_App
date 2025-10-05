package com.sprintsync.api.repository;

import com.sprintsync.api.entity.ProjectIntegration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectIntegrationRepository extends JpaRepository<ProjectIntegration, String> {
    
    /**
     * Find all integrations for a specific project
     */
    List<ProjectIntegration> findByProjectId(String projectId);
    
    /**
     * Find enabled integrations for a specific project
     */
    List<ProjectIntegration> findByProjectIdAndIsEnabled(String projectId, Boolean isEnabled);
    
    /**
     * Find integration by project ID and integration ID
     */
    ProjectIntegration findByProjectIdAndIntegrationId(String projectId, String integrationId);
    
    /**
     * Count integrations by project ID
     */
    long countByProjectId(String projectId);
    
    /**
     * Count enabled integrations by project ID
     */
    @Query("SELECT COUNT(pi) FROM ProjectIntegration pi WHERE pi.projectId = :projectId AND pi.isEnabled = true")
    long countEnabledByProjectId(@Param("projectId") String projectId);
}
