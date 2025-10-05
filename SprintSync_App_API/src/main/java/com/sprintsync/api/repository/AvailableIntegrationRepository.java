package com.sprintsync.api.repository;

import com.sprintsync.api.entity.AvailableIntegration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailableIntegrationRepository extends JpaRepository<AvailableIntegration, String> {
    
    /**
     * Find all active integrations
     */
    List<AvailableIntegration> findByIsActiveTrue();
    
    /**
     * Find integrations by type
     */
    List<AvailableIntegration> findByType(AvailableIntegration.IntegrationType type);
    
    /**
     * Find active integrations by type
     */
    List<AvailableIntegration> findByTypeAndIsActiveTrue(AvailableIntegration.IntegrationType type);
    
    /**
     * Find integration by name
     */
    AvailableIntegration findByName(String name);
}
