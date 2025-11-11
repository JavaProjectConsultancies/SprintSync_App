package com.sprintsync.api.service;

import com.sprintsync.api.entity.Domain;
import com.sprintsync.api.repository.DomainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Domain entity operations.
 * Provides business logic for domain management.
 * 
 * @author Mayuresh G
 */
@Service
public class DomainService {

    private final DomainRepository domainRepository;

    @Autowired
    public DomainService(DomainRepository domainRepository) {
        this.domainRepository = domainRepository;
    }

    /**
     * Create a new domain.
     * 
     * @param domain the domain to create
     * @return the created domain
     * @throws IllegalArgumentException if domain data is invalid
     */
    public Domain createDomain(Domain domain) {
        if (domain == null) {
            throw new IllegalArgumentException("Domain cannot be null");
        }
        if (domain.getName() == null || domain.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Domain name is required");
        }

        // Check if domain with same name already exists
        if (domainRepository.findByNameContainingIgnoreCase(domain.getName()).stream()
            .anyMatch(d -> d.getName().equalsIgnoreCase(domain.getName()))) {
            throw new IllegalArgumentException("Domain with this name already exists");
        }

        domain.setCreatedAt(LocalDateTime.now());
        domain.setUpdatedAt(LocalDateTime.now());
        
        // Set default values if not provided
        if (domain.getIsActive() == null) {
            domain.setIsActive(true);
        }

        return domainRepository.save(domain);
    }

    /**
     * Find domain by ID.
     * 
     * @param id the domain ID
     * @return Optional containing the domain if found
     */
    public Optional<Domain> findById(String id) {
        return domainRepository.findById(id);
    }

    /**
     * Get all domains with pagination.
     * 
     * @param pageable pagination information
     * @return page of domains
     */
    public Page<Domain> getAllDomains(Pageable pageable) {
        return domainRepository.findAll(pageable);
    }

    /**
     * Get all domains without pagination.
     * 
     * @return list of all domains
     */
    public List<Domain> getAllDomains() {
        return domainRepository.findAll();
    }

    /**
     * Find active domains.
     * 
     * @return list of active domains
     */
    public List<Domain> findActiveDomains() {
        return domainRepository.findAll().stream()
            .filter(d -> d.getIsActive() != null && d.getIsActive())
            .toList();
    }

    /**
     * Search domains by name.
     * 
     * @param name the name to search for
     * @return list of domains with matching names
     */
    public List<Domain> searchDomainsByName(String name) {
        return domainRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Update an existing domain.
     * 
     * @param domain the domain with updated information
     * @return the updated domain
     * @throws IllegalArgumentException if domain is not found or data is invalid
     */
    public Domain updateDomain(Domain domain) {
        if (domain == null || domain.getId() == null) {
            throw new IllegalArgumentException("Domain and ID are required");
        }

        Optional<Domain> existingDomain = domainRepository.findById(domain.getId());
        if (existingDomain.isEmpty()) {
            throw new IllegalArgumentException("Domain not found with ID: " + domain.getId());
        }

        Domain existing = existingDomain.get();
        
        // Update fields if provided
        if (domain.getName() != null && !domain.getName().trim().isEmpty()) {
            // Check if another domain with same name exists
            if (domainRepository.findByNameContainingIgnoreCase(domain.getName()).stream()
                .anyMatch(d -> d.getName().equalsIgnoreCase(domain.getName()) && !d.getId().equals(domain.getId()))) {
                throw new IllegalArgumentException("Domain with this name already exists");
            }
            existing.setName(domain.getName());
        }
        
        if (domain.getDescription() != null) {
            existing.setDescription(domain.getDescription());
        }
        
        if (domain.getIsActive() != null) {
            existing.setIsActive(domain.getIsActive());
        }

        existing.setUpdatedAt(LocalDateTime.now());
        return domainRepository.save(existing);
    }

    /**
     * Delete a domain by ID.
     * 
     * @param id the domain ID
     * @throws IllegalArgumentException if domain is not found
     */
    public void deleteDomain(String id) {
        if (id == null || id.trim().isEmpty()) {
            throw new IllegalArgumentException("Domain ID is required");
        }

        Optional<Domain> domain = domainRepository.findById(id);
        if (domain.isEmpty()) {
            throw new IllegalArgumentException("Domain not found with ID: " + id);
        }

        domainRepository.deleteById(id);
    }

    /**
     * Set domain active status.
     * 
     * @param id the domain ID
     * @param isActive the active status
     * @throws IllegalArgumentException if domain is not found
     */
    // TODO: Add is_active column to database and uncomment this method
    // public void setDomainActiveStatus(String id, boolean isActive) {
    //     if (id == null || id.trim().isEmpty()) {
    //         throw new IllegalArgumentException("Domain ID is required");
    //     }

    //     Optional<Domain> domain = domainRepository.findById(id);
    //     if (domain.isEmpty()) {
    //         throw new IllegalArgumentException("Domain not found with ID: " + id);
    //     }

    //     Domain existing = domain.get();
    //     existing.setIsActive(isActive);
    //     existing.setUpdatedAt(LocalDateTime.now());
    //     domainRepository.save(existing);
    // }

    /**
     * Check if domain exists by name.
     * 
     * @param name the domain name
     * @return true if domain exists, false otherwise
     */
    public boolean existsByName(String name) {
        return domainRepository.findByNameContainingIgnoreCase(name).stream()
            .anyMatch(d -> d.getName().equalsIgnoreCase(name));
    }

    /**
     * Count domains by active status.
     * 
     * @param isActive the active status
     * @return count of domains
     */
    // TODO: Add is_active column to database and uncomment this method
    // public long countByIsActive(boolean isActive) {
    //     return domainRepository.countByIsActive(isActive);
    // }
}
