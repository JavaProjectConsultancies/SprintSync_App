package com.sprintsync.api.service;

import com.sprintsync.api.entity.QualityGate;
import com.sprintsync.api.entity.enums.QualityGateStatus;
import com.sprintsync.api.repository.QualityGateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
// import java.util.String; // Removed - using String IDs

/**
 * Service class for QualityGate entity operations.
 * Provides business logic for quality gate management operations.
 * 
 * @author Mayuresh G
 */
@Service
@Transactional
public class QualityGateService {

    private final QualityGateRepository qualityGateRepository;

    @Autowired
    public QualityGateService(QualityGateRepository qualityGateRepository) {
        this.qualityGateRepository = qualityGateRepository;
    }

    /**
     * Create a new quality gate.
     * 
     * @param qualityGate the quality gate to create
     * @return the created quality gate
     */
    public QualityGate createQualityGate(QualityGate qualityGate) {
        // Set default values if not provided
        if (qualityGate.getRequired() == null) {
            qualityGate.setRequired(true);
        }
        return qualityGateRepository.save(qualityGate);
    }

    /**
     * Find quality gate by ID.
     * 
     * @param id the quality gate ID
     * @return Optional containing the quality gate if found
     */
    @Transactional(readOnly = true)
    public Optional<QualityGate> findById(String id) {
        return qualityGateRepository.findById(id);
    }

    /**
     * Update an existing quality gate.
     * 
     * @param qualityGate the quality gate to update
     * @return the updated quality gate
     * @throws IllegalArgumentException if quality gate not found
     */
    public QualityGate updateQualityGate(QualityGate qualityGate) {
        if (!qualityGateRepository.existsById(qualityGate.getId())) {
            throw new IllegalArgumentException("Quality gate not found with ID: " + qualityGate.getId());
        }
        return qualityGateRepository.save(qualityGate);
    }

    /**
     * Delete a quality gate by ID.
     * 
     * @param id the quality gate ID
     * @throws IllegalArgumentException if quality gate not found
     */
    public void deleteQualityGate(String id) {
        if (!qualityGateRepository.existsById(id)) {
            throw new IllegalArgumentException("Quality gate not found with ID: " + id);
        }
        qualityGateRepository.deleteById(id);
    }

    /**
     * Get all quality gates.
     * 
     * @return list of all quality gates
     */
    @Transactional(readOnly = true)
    public List<QualityGate> getAllQualityGates() {
        return qualityGateRepository.findAll();
    }

    /**
     * Get all quality gates with pagination.
     * 
     * @param pageable pagination information
     * @return page of quality gates
     */
    @Transactional(readOnly = true)
    public Page<QualityGate> getAllQualityGates(Pageable pageable) {
        return qualityGateRepository.findAll(pageable);
    }

    /**
     * Find quality gates by release.
     * 
     * @param releaseId the release ID
     * @return list of quality gates for the specified release
     */
    @Transactional(readOnly = true)
    public List<QualityGate> findQualityGatesByRelease(String releaseId) {
        return qualityGateRepository.findByReleaseId(releaseId);
    }

    /**
     * Find quality gates by release with pagination.
     * 
     * @param releaseId the release ID
     * @param pageable pagination information
     * @return page of quality gates for the specified release
     */
    @Transactional(readOnly = true)
    public Page<QualityGate> findQualityGatesByRelease(String releaseId, Pageable pageable) {
        return qualityGateRepository.findByReleaseId(releaseId, pageable);
    }

    /**
     * Find quality gates by status.
     * 
     * @param status the quality gate status
     * @return list of quality gates with the specified status
     */
    @Transactional(readOnly = true)
    public List<QualityGate> findQualityGatesByStatus(QualityGateStatus status) {
        return qualityGateRepository.findByStatus(status);
    }

    /**
     * Find quality gates by status with pagination.
     * 
     * @param status the quality gate status
     * @param pageable pagination information
     * @return page of quality gates with the specified status
     */
    @Transactional(readOnly = true)
    public Page<QualityGate> findQualityGatesByStatus(QualityGateStatus status, Pageable pageable) {
        return qualityGateRepository.findByStatus(status, pageable);
    }

    /**
     * Find quality gates by required status.
     * 
     * @param required the required status
     * @return list of quality gates with the specified required status
     */
    @Transactional(readOnly = true)
    public List<QualityGate> findQualityGatesByRequired(Boolean required) {
        return qualityGateRepository.findByRequired(required);
    }

    /**
     * Search quality gates by name.
     * 
     * @param name the name to search for
     * @return list of quality gates with names containing the search term
     */
    @Transactional(readOnly = true)
    public List<QualityGate> searchQualityGatesByName(String name) {
        return qualityGateRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Find quality gates by multiple criteria.
     * 
     * @param releaseId the release ID (optional)
     * @param status the quality gate status (optional)
     * @param required the required status (optional)
     * @return list of quality gates matching the criteria
     */
    @Transactional(readOnly = true)
    public List<QualityGate> findQualityGatesByCriteria(String releaseId, QualityGateStatus status, Boolean required) {
        return qualityGateRepository.findQualityGatesByCriteria(releaseId, status, required);
    }

    /**
     * Find pending quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return list of pending quality gates for the specified release
     */
    @Transactional(readOnly = true)
    public List<QualityGate> findPendingQualityGatesByRelease(String releaseId) {
        return qualityGateRepository.findPendingQualityGatesByRelease(releaseId);
    }

    /**
     * Find failed quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return list of failed quality gates for the specified release
     */
    @Transactional(readOnly = true)
    public List<QualityGate> findFailedQualityGatesByRelease(String releaseId) {
        return qualityGateRepository.findFailedQualityGatesByRelease(releaseId);
    }

    /**
     * Find passed quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return list of passed quality gates for the specified release
     */
    @Transactional(readOnly = true)
    public List<QualityGate> findPassedQualityGatesByRelease(String releaseId) {
        return qualityGateRepository.findPassedQualityGatesByRelease(releaseId);
    }

    /**
     * Find all required quality gates for a release.
     * 
     * @param releaseId the release ID
     * @return list of all required quality gates for the specified release
     */
    @Transactional(readOnly = true)
    public List<QualityGate> findRequiredQualityGatesByRelease(String releaseId) {
        return qualityGateRepository.findRequiredQualityGatesByRelease(releaseId);
    }

    /**
     * Count quality gates by status for a release.
     * 
     * @param releaseId the release ID
     * @param status the quality gate status
     * @return count of quality gates with the specified status for the release
     */
    @Transactional(readOnly = true)
    public long countQualityGatesByReleaseIdAndStatus(String releaseId, QualityGateStatus status) {
        return qualityGateRepository.countByReleaseIdAndStatus(releaseId, status);
    }

    /**
     * Count required quality gates by status for a release.
     * 
     * @param releaseId the release ID
     * @param status the quality gate status
     * @return count of required quality gates with the specified status for the release
     */
    @Transactional(readOnly = true)
    public long countRequiredQualityGatesByReleaseIdAndStatus(String releaseId, QualityGateStatus status) {
        return qualityGateRepository.countRequiredByReleaseIdAndStatus(releaseId, status);
    }

    /**
     * Check if all required quality gates are passed for a release.
     * 
     * @param releaseId the release ID
     * @return true if all required quality gates are passed, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean areAllRequiredQualityGatesPassed(String releaseId) {
        return qualityGateRepository.areAllRequiredQualityGatesPassed(releaseId);
    }

    /**
     * Find quality gates completed in date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of quality gates completed within the specified date range
     */
    @Transactional(readOnly = true)
    public List<QualityGate> findCompletedQualityGatesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return qualityGateRepository.findCompletedQualityGatesByDateRange(startDate, endDate);
    }

    /**
     * Find quality gates that are blocking release.
     * 
     * @param releaseId the release ID
     * @return list of quality gates that are blocking the release
     */
    @Transactional(readOnly = true)
    public List<QualityGate> findBlockingQualityGatesByRelease(String releaseId) {
        return qualityGateRepository.findBlockingQualityGatesByRelease(releaseId);
    }

    /**
     * Update quality gate status.
     * 
     * @param qualityGateId the quality gate ID
     * @param status the new status
     * @throws IllegalArgumentException if quality gate not found
     */
    public void updateQualityGateStatus(String qualityGateId, QualityGateStatus status) {
        Optional<QualityGate> qualityGateOptional = qualityGateRepository.findById(qualityGateId);
        if (qualityGateOptional.isPresent()) {
            QualityGate qualityGate = qualityGateOptional.get();
            qualityGate.setStatus(status);
            
            // Set completion date if status is passed or failed
            if (status == QualityGateStatus.PASSED || status == QualityGateStatus.FAILED) {
                qualityGate.setCompletedAt(LocalDateTime.now());
            }
            
            qualityGateRepository.save(qualityGate);
        } else {
            throw new IllegalArgumentException("Quality gate not found with ID: " + qualityGateId);
        }
    }

    /**
     * Pass a quality gate.
     * 
     * @param qualityGateId the quality gate ID
     * @throws IllegalArgumentException if quality gate not found
     */
    public void passQualityGate(String qualityGateId) {
        updateQualityGateStatus(qualityGateId, QualityGateStatus.PASSED);
    }

    /**
     * Fail a quality gate.
     * 
     * @param qualityGateId the quality gate ID
     * @throws IllegalArgumentException if quality gate not found
     */
    public void failQualityGate(String qualityGateId) {
        updateQualityGateStatus(qualityGateId, QualityGateStatus.FAILED);
    }

    /**
     * Reset a quality gate to pending.
     * 
     * @param qualityGateId the quality gate ID
     * @throws IllegalArgumentException if quality gate not found
     */
    public void resetQualityGate(String qualityGateId) {
        Optional<QualityGate> qualityGateOptional = qualityGateRepository.findById(qualityGateId);
        if (qualityGateOptional.isPresent()) {
            QualityGate qualityGate = qualityGateOptional.get();
            qualityGate.setStatus(QualityGateStatus.PENDING);
            qualityGate.setCompletedAt(null);
            qualityGateRepository.save(qualityGate);
        } else {
            throw new IllegalArgumentException("Quality gate not found with ID: " + qualityGateId);
        }
    }

    /**
     * Set quality gate as required or optional.
     * 
     * @param qualityGateId the quality gate ID
     * @param required the required status
     * @throws IllegalArgumentException if quality gate not found
     */
    public void setQualityGateRequired(String qualityGateId, Boolean required) {
        Optional<QualityGate> qualityGateOptional = qualityGateRepository.findById(qualityGateId);
        if (qualityGateOptional.isPresent()) {
            QualityGate qualityGate = qualityGateOptional.get();
            qualityGate.setRequired(required);
            qualityGateRepository.save(qualityGate);
        } else {
            throw new IllegalArgumentException("Quality gate not found with ID: " + qualityGateId);
        }
    }

    /**
     * Get quality gate statistics for a release.
     * 
     * @param releaseId the release ID
     * @return map containing quality gate statistics
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getQualityGateStatistics(String releaseId) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        stats.put("totalQualityGates", qualityGateRepository.countByReleaseIdAndStatus(releaseId, null));
        stats.put("pendingQualityGates", qualityGateRepository.countByReleaseIdAndStatus(releaseId, QualityGateStatus.PENDING));
        stats.put("passedQualityGates", qualityGateRepository.countByReleaseIdAndStatus(releaseId, QualityGateStatus.PASSED));
        stats.put("failedQualityGates", qualityGateRepository.countByReleaseIdAndStatus(releaseId, QualityGateStatus.FAILED));
        stats.put("requiredQualityGates", qualityGateRepository.countRequiredByReleaseIdAndStatus(releaseId, null));
        stats.put("requiredPendingQualityGates", qualityGateRepository.countRequiredByReleaseIdAndStatus(releaseId, QualityGateStatus.PENDING));
        stats.put("requiredPassedQualityGates", qualityGateRepository.countRequiredByReleaseIdAndStatus(releaseId, QualityGateStatus.PASSED));
        stats.put("requiredFailedQualityGates", qualityGateRepository.countRequiredByReleaseIdAndStatus(releaseId, QualityGateStatus.FAILED));
        stats.put("allRequiredPassed", qualityGateRepository.areAllRequiredQualityGatesPassed(releaseId));
        stats.put("blockingQualityGates", qualityGateRepository.findBlockingQualityGatesByRelease(releaseId).size());
        
        return stats;
    }
}
