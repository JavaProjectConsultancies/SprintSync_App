package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Requirement;
import com.sprintsync.api.service.RequirementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Requirement entity operations.
 * Provides endpoints for requirement management operations.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/requirements")
@CrossOrigin(origins = "*")
public class RequirementController {

    private final RequirementService requirementService;

    @Autowired
    public RequirementController(RequirementService requirementService) {
        this.requirementService = requirementService;
    }

    /**
     * Create a new requirement.
     * 
     * @param requirement the requirement to create
     * @return ResponseEntity containing the created requirement
     */
    @PostMapping
    public ResponseEntity<Requirement> createRequirement(@RequestBody Requirement requirement) {
        try {
            Requirement createdRequirement = requirementService.createRequirement(requirement);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequirement);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get requirement by ID.
     * 
     * @param id the requirement ID
     * @return ResponseEntity containing the requirement if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Requirement> getRequirementById(@PathVariable String id) {
        Optional<Requirement> requirement = requirementService.findById(id);
        return requirement.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all requirements.
     * 
     * @return ResponseEntity containing list of all requirements
     */
    @GetMapping
    public ResponseEntity<List<Requirement>> getAllRequirements() {
        List<Requirement> requirements = requirementService.getAllRequirements();
        return ResponseEntity.ok(requirements);
    }

    /**
     * Get requirements by project ID.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of requirements for the project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Requirement>> getRequirementsByProjectId(@PathVariable String projectId) {
        List<Requirement> requirements = requirementService.findByProjectId(projectId);
        return ResponseEntity.ok(requirements);
    }

    /**
     * Get requirements by project ID and status.
     * 
     * @param projectId the project ID
     * @param status the requirement status
     * @return ResponseEntity containing list of requirements with the specified status
     */
    @GetMapping("/project/{projectId}/status/{status}")
    public ResponseEntity<List<Requirement>> getRequirementsByProjectIdAndStatus(
            @PathVariable String projectId, @PathVariable String status) {
        List<Requirement> requirements = requirementService.findByProjectIdAndStatus(projectId, status);
        return ResponseEntity.ok(requirements);
    }

    /**
     * Update an existing requirement.
     * 
     * @param id the requirement ID
     * @param requirementDetails the updated requirement details
     * @return ResponseEntity containing the updated requirement
     */
    @PutMapping("/{id}")
    public ResponseEntity<Requirement> updateRequirement(@PathVariable String id, @RequestBody Requirement requirementDetails) {
        try {
            requirementDetails.setId(id);
            Requirement updatedRequirement = requirementService.updateRequirement(requirementDetails);
            return ResponseEntity.ok(updatedRequirement);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a requirement by ID.
     * 
     * @param id the requirement ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequirement(@PathVariable String id) {
        try {
            requirementService.deleteRequirement(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create multiple requirements for a project.
     * 
     * @param projectId the project ID
     * @param requirements list of requirements to create
     * @return ResponseEntity containing list of created requirements
     */
    @PostMapping("/project/{projectId}/batch")
    public ResponseEntity<List<Requirement>> createRequirementsForProject(
            @PathVariable String projectId, @RequestBody List<Requirement> requirements) {
        try {
            // Set project ID for all requirements
            requirements.forEach(req -> req.setProjectId(projectId));
            List<Requirement> createdRequirements = requirementService.createRequirements(requirements);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequirements);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
