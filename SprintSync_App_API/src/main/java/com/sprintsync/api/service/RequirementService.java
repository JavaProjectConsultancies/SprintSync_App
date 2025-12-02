package com.sprintsync.api.service;

import com.sprintsync.api.entity.Requirement;
import com.sprintsync.api.entity.enums.RequirementStatus;
import com.sprintsync.api.repository.RequirementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service class for Requirement entity operations.
 * Handles business logic for requirement management.
 * 
 * @author Mayuresh G
 */
@Service
@SuppressWarnings("null")
public class RequirementService {

    private final RequirementRepository requirementRepository;
    private final IdGenerationService idGenerationService;

    @Autowired
    public RequirementService(RequirementRepository requirementRepository, IdGenerationService idGenerationService) {
        this.requirementRepository = requirementRepository;
        this.idGenerationService = idGenerationService;
    }

    /**
     * Create a new requirement.
     * 
     * @param requirement the requirement to create
     * @return the created requirement
     */
    public Requirement createRequirement(Requirement requirement) {
        // Generate custom ID if not provided
        if (requirement.getId() == null || requirement.getId().isEmpty()) {
            requirement.setId(idGenerationService.generateRequirementId());
        }
        return requirementRepository.save(requirement);
    }

    /**
     * Create multiple requirements.
     * 
     * @param requirements list of requirements to create
     * @return list of created requirements
     */
    public List<Requirement> createRequirements(List<Requirement> requirements) {
        // Generate IDs for requirements that don't have them
        requirements.forEach(req -> {
            if (req.getId() == null || req.getId().isEmpty()) {
                req.setId(idGenerationService.generateRequirementId());
            }
        });
        return requirementRepository.saveAll(requirements);
    }

    /**
     * Find requirement by ID.
     * 
     * @param id the requirement ID
     * @return Optional containing the requirement if found
     */
    public Optional<Requirement> findById(String id) {
        return requirementRepository.findById(id);
    }

    /**
     * Get all requirements.
     * 
     * @return list of all requirements
     */
    public List<Requirement> getAllRequirements() {
        return requirementRepository.findAll();
    }

    /**
     * Find requirements by project ID.
     * 
     * @param projectId the project ID
     * @return list of requirements for the project
     */
    public List<Requirement> findByProjectId(String projectId) {
        return requirementRepository.findByProjectId(projectId);
    }

    /**
     * Find requirements by project ID and status.
     * 
     * @param projectId the project ID
     * @param status the requirement status
     * @return list of requirements with the specified status
     */
    public List<Requirement> findByProjectIdAndStatus(String projectId, String status) {
        RequirementStatus statusEnum = RequirementStatus.fromValue(status);
        return requirementRepository.findByProjectIdAndStatus(projectId, statusEnum);
    }

    /**
     * Update an existing requirement.
     * 
     * @param requirement the requirement to update
     * @return the updated requirement
     * @throws IllegalArgumentException if requirement not found
     */
    public Requirement updateRequirement(Requirement requirement) {
        if (!requirementRepository.existsById(requirement.getId())) {
            throw new IllegalArgumentException("Requirement not found with ID: " + requirement.getId());
        }
        return requirementRepository.save(requirement);
    }

    /**
     * Delete a requirement by ID.
     * 
     * @param id the requirement ID
     * @throws IllegalArgumentException if requirement not found
     */
    public void deleteRequirement(String id) {
        if (!requirementRepository.existsById(id)) {
            throw new IllegalArgumentException("Requirement not found with ID: " + id);
        }
        requirementRepository.deleteById(id);
    }

    /**
     * Count requirements by project ID.
     * 
     * @param projectId the project ID
     * @return count of requirements for the project
     */
    public long countByProjectId(String projectId) {
        return requirementRepository.countByProjectId(projectId);
    }

    /**
     * Count requirements by project ID and status.
     * 
     * @param projectId the project ID
     * @param status the requirement status
     * @return count of requirements with the specified status
     */
    public long countByProjectIdAndStatus(String projectId, String status) {
        RequirementStatus statusEnum = RequirementStatus.fromValue(status);
        return requirementRepository.countByProjectIdAndStatus(projectId, statusEnum);
    }
}






