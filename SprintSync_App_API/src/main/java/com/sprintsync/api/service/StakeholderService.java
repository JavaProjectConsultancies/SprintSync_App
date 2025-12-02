package com.sprintsync.api.service;

import com.sprintsync.api.entity.Stakeholder;
import com.sprintsync.api.repository.StakeholderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service class for Stakeholder entity operations.
 * Handles business logic for stakeholder management.
 * 
 * @author Mayuresh G
 */
@Service
@SuppressWarnings("null")
public class StakeholderService {

    private final StakeholderRepository stakeholderRepository;

    @Autowired
    public StakeholderService(StakeholderRepository stakeholderRepository) {
        this.stakeholderRepository = stakeholderRepository;
    }

    /**
     * Create a new stakeholder.
     * 
     * @param stakeholder the stakeholder to create
     * @return the created stakeholder
     */
    public Stakeholder createStakeholder(Stakeholder stakeholder) {
        return stakeholderRepository.save(stakeholder);
    }

    /**
     * Create multiple stakeholders.
     * 
     * @param stakeholders list of stakeholders to create
     * @return list of created stakeholders
     */
    public List<Stakeholder> createStakeholders(List<Stakeholder> stakeholders) {
        return stakeholderRepository.saveAll(stakeholders);
    }

    /**
     * Find stakeholder by ID.
     * 
     * @param id the stakeholder ID
     * @return Optional containing the stakeholder if found
     */
    public Optional<Stakeholder> findById(String id) {
        return stakeholderRepository.findById(id);
    }

    /**
     * Get all stakeholders.
     * 
     * @return list of all stakeholders
     */
    public List<Stakeholder> getAllStakeholders() {
        return stakeholderRepository.findAll();
    }

    /**
     * Find stakeholders by project ID.
     * 
     * @param projectId the project ID
     * @return list of stakeholders for the project
     */
    public List<Stakeholder> findByProjectId(String projectId) {
        return stakeholderRepository.findByProjectId(projectId);
    }

    /**
     * Update an existing stakeholder.
     * 
     * @param stakeholder the stakeholder to update
     * @return the updated stakeholder
     * @throws IllegalArgumentException if stakeholder not found
     */
    public Stakeholder updateStakeholder(Stakeholder stakeholder) {
        if (!stakeholderRepository.existsById(stakeholder.getId())) {
            throw new IllegalArgumentException("Stakeholder not found with ID: " + stakeholder.getId());
        }
        return stakeholderRepository.save(stakeholder);
    }

    /**
     * Delete a stakeholder by ID.
     * 
     * @param id the stakeholder ID
     * @throws IllegalArgumentException if stakeholder not found
     */
    public void deleteStakeholder(String id) {
        if (!stakeholderRepository.existsById(id)) {
            throw new IllegalArgumentException("Stakeholder not found with ID: " + id);
        }
        stakeholderRepository.deleteById(id);
    }

    /**
     * Count stakeholders by project ID.
     * 
     * @param projectId the project ID
     * @return count of stakeholders for the project
     */
    public long countByProjectId(String projectId) {
        return stakeholderRepository.countByProjectId(projectId);
    }
}






