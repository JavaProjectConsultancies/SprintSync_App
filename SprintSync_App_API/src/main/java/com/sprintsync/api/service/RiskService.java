package com.sprintsync.api.service;

import com.sprintsync.api.entity.Risk;
import com.sprintsync.api.entity.enums.RiskStatus;
import com.sprintsync.api.repository.RiskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Service class for Risk entity operations.
 * Handles business logic for risk management.
 * 
 * @author Mayuresh G
 */
@Service
@SuppressWarnings("null")
public class RiskService {

    private final RiskRepository riskRepository;

    @Autowired
    public RiskService(RiskRepository riskRepository) {
        this.riskRepository = riskRepository;
    }

    /**
     * Create a new risk.
     * 
     * @param risk the risk to create
     * @return the created risk
     */
    public Risk createRisk(Risk risk) {
        return riskRepository.save(risk);
    }

    /**
     * Create multiple risks.
     * 
     * @param risks list of risks to create
     * @return list of created risks
     */
    public List<Risk> createRisks(List<Risk> risks) {
        return riskRepository.saveAll(risks);
    }

    /**
     * Find risk by ID.
     * 
     * @param id the risk ID
     * @return Optional containing the risk if found
     */
    public Optional<Risk> findById(String id) {
        return riskRepository.findById(id);
    }

    /**
     * Get all risks.
     * 
     * @return list of all risks
     */
    public List<Risk> getAllRisks() {
        return riskRepository.findAll();
    }

    /**
     * Find risks by project ID.
     * 
     * @param projectId the project ID
     * @return list of risks for the project
     */
    public List<Risk> findByProjectId(String projectId) {
        return riskRepository.findByProjectId(projectId);
    }

    /**
     * Find risks by project ID and status.
     * 
     * @param projectId the project ID
     * @param status the risk status
     * @return list of risks with the specified status
     */
    public List<Risk> findByProjectIdAndStatus(String projectId, String status) {
        RiskStatus statusEnum = RiskStatus.fromValue(status);
        return riskRepository.findByProjectIdAndStatus(projectId, statusEnum);
    }

    /**
     * Update an existing risk.
     * 
     * @param risk the risk to update
     * @return the updated risk
     * @throws IllegalArgumentException if risk not found
     */
    public Risk updateRisk(Risk risk) {
        if (!riskRepository.existsById(risk.getId())) {
            throw new IllegalArgumentException("Risk not found with ID: " + risk.getId());
        }
        return riskRepository.save(risk);
    }

    /**
     * Delete a risk by ID.
     * 
     * @param id the risk ID
     * @throws IllegalArgumentException if risk not found
     */
    public void deleteRisk(String id) {
        if (!riskRepository.existsById(id)) {
            throw new IllegalArgumentException("Risk not found with ID: " + id);
        }
        riskRepository.deleteById(id);
    }

    /**
     * Count risks by project ID.
     * 
     * @param projectId the project ID
     * @return count of risks for the project
     */
    public long countByProjectId(String projectId) {
        return riskRepository.countByProjectId(projectId);
    }

    /**
     * Count risks by project ID and status.
     * 
     * @param projectId the project ID
     * @param status the risk status
     * @return count of risks with the specified status
     */
    public long countByProjectIdAndStatus(String projectId, String status) {
        RiskStatus statusEnum = RiskStatus.fromValue(status);
        return riskRepository.countByProjectIdAndStatus(projectId, statusEnum);
    }
}






