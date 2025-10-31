package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Requirement;
import com.sprintsync.api.entity.enums.RequirementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequirementRepository extends JpaRepository<Requirement, String> {
    
    /**
     * Find all requirements for a specific project
     */
    List<Requirement> findByProjectId(String projectId);
    
    /**
     * Find requirements by project ID and status
     */
    List<Requirement> findByProjectIdAndStatus(String projectId, RequirementStatus status);
    
    /**
     * Find requirements by project ID and priority
     */
    List<Requirement> findByProjectIdAndPriority(String projectId, com.sprintsync.api.entity.enums.Priority priority);
    
    /**
     * Count requirements by project ID and status
     */
    @Query("SELECT COUNT(r) FROM Requirement r WHERE r.projectId = :projectId AND r.status = :status")
    long countByProjectIdAndStatus(@Param("projectId") String projectId, @Param("status") RequirementStatus status);
    
    /**
     * Find requirements by project ID ordered by priority and created date
     */
    @Query("SELECT r FROM Requirement r WHERE r.projectId = :projectId ORDER BY r.priority DESC, r.createdAt ASC")
    List<Requirement> findByProjectIdOrderByPriorityAndCreatedAt(@Param("projectId") String projectId);
    
    /**
     * Count requirements by project ID
     */
    @Query("SELECT COUNT(r) FROM Requirement r WHERE r.projectId = :projectId")
    long countByProjectId(@Param("projectId") String projectId);
}
