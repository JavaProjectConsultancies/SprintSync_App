package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Domain;
import com.sprintsync.api.service.DomainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Domain entity operations.
 * Provides endpoints for domain management operations.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/domains")
@CrossOrigin(origins = "*")

public class DomainController {

    private final DomainService domainService;

    @Autowired
    public DomainController(DomainService domainService) {
        this.domainService = domainService;
    }

    /**
     * Create a new domain.
     * 
     * @param domain the domain to create
     * @return ResponseEntity containing the created domain
     */
    @PostMapping
    public ResponseEntity<Domain> createDomain(@RequestBody Domain domain) {
        try {
            Domain createdDomain = domainService.createDomain(domain);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdDomain);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get domain by ID.
     * 
     * @param id the domain ID
     * @return ResponseEntity containing the domain if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Domain> getDomainById(@PathVariable String id) {
        Optional<Domain> domain = domainService.findById(id);
        return domain.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all domains with pagination.
     * 
     * @param page page number (default: 0)
     * @param size page size (default: 10)
     * @param sortBy sort field (default: name)
     * @param sortDir sort direction (default: asc)
     * @return ResponseEntity containing page of domains
     */
    @GetMapping
    public ResponseEntity<Page<Domain>> getAllDomains(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Domain> domains = domainService.getAllDomains(pageable);
        return ResponseEntity.ok(domains);
    }

    /**
     * Get all domains without pagination.
     * 
     * @return ResponseEntity containing list of all domains
     */
    @GetMapping("/all")
    public ResponseEntity<List<Domain>> getAllDomainsList() {
        List<Domain> domains = domainService.getAllDomains();
        return ResponseEntity.ok(domains);
    }

    /**
     * Get active domains.
     * 
     * @return ResponseEntity containing list of active domains
     */
    @GetMapping("/active")
    public ResponseEntity<List<Domain>> getActiveDomains() {
        List<Domain> domains = domainService.findActiveDomains();
        return ResponseEntity.ok(domains);
    }

    /**
     * Search domains by name.
     * 
     * @param name the name to search for
     * @return ResponseEntity containing list of domains with matching names
     */
    @GetMapping("/search")
    public ResponseEntity<List<Domain>> searchDomainsByName(@RequestParam String name) {
        List<Domain> domains = domainService.searchDomainsByName(name);
        return ResponseEntity.ok(domains);
    }

    /**
     * Update an existing domain.
     * 
     * @param id the domain ID
     * @param domainDetails the updated domain details
     * @return ResponseEntity containing the updated domain
     */
    @PutMapping("/{id}")
    public ResponseEntity<Domain> updateDomain(@PathVariable String id, @RequestBody Domain domainDetails) {
        try {
            // Set the ID to ensure we're updating the correct domain
            domainDetails.setId(id);
            Domain updatedDomain = domainService.updateDomain(domainDetails);
            return ResponseEntity.ok(updatedDomain);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a domain by ID.
     * 
     * @param id the domain ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDomain(@PathVariable String id) {
        try {
            domainService.deleteDomain(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Activate or deactivate a domain.
     * 
     * @param id the domain ID
     * @param isActive the active status
     * @return ResponseEntity with no content if successful
     */
    // TODO: Add is_active column to database and uncomment this method
    // @PatchMapping("/{id}/active")
    // public ResponseEntity<Void> setDomainActiveStatus(@PathVariable String id, @RequestParam boolean isActive) {
    //     try {
    //         domainService.setDomainActiveStatus(id, isActive);
    //         return ResponseEntity.ok().build();
    //     } catch (IllegalArgumentException e) {
    //         return ResponseEntity.notFound().build();
    //     }
    // }

    /**
     * Get domain statistics.
     * 
     * @return ResponseEntity containing domain statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<String> getDomainStats() {
        long totalDomains = domainService.getAllDomains().size();
        long activeDomains = domainService.findActiveDomains().size();
        
        String stats = String.format("Total Domains: %d, Active Domains: %d", 
                                   totalDomains, activeDomains);
        return ResponseEntity.ok(stats);
    }
}




