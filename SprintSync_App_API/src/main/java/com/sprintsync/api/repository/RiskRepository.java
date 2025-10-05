package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Risk;
import com.sprintsync.api.entity.enums.RiskStatus;
import com.sprintsync.api.entity.enums.RiskProbability;
import com.sprintsync.api.entity.enums.RiskImpact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskRepository extends JpaRepository<Risk, String> {
    
    /**
     * Find all risks for a specific project
     */
    List<Risk> findByProjectId(String projectId);
    
    /**
     * Find risks by project ID and status
     */
    List<Risk> findByProjectIdAndStatus(String projectId, RiskStatus status);
    
    /**
     * Find risks by project ID and probability
     */
    List<Risk> findByProjectIdAndProbability(String projectId, RiskProbability probability);
    
    /**
     * Find risks by project ID and impact
     */
    List<Risk> findByProjectIdAndImpact(String projectId, RiskImpact impact);
    
    /**
     * Count risks by project ID and status
     */
    @Query("SELECT COUNT(r) FROM Risk r WHERE r.projectId = :projectId AND r.status = :status")
    long countByProjectIdAndStatus(@Param("projectId") String projectId, @Param("status") RiskStatus status);
    
    /**
     * Find high-priority risks (high probability or high impact)
     */
    @Query("SELECT r FROM Risk r WHERE r.projectId = :projectId AND (r.probability = 'HIGH' OR r.impact = 'HIGH') ORDER BY r.createdAt DESC")
    List<Risk> findHighPriorityRisksByProjectId(@Param("projectId") String projectId);
}
