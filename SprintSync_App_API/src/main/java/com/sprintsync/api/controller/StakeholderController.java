package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Stakeholder;
import com.sprintsync.api.service.StakeholderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Stakeholder entity operations.
 * Provides endpoints for stakeholder management operations.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/stakeholders")
@CrossOrigin(origins = "*")
public class StakeholderController {

    private final StakeholderService stakeholderService;

    @Autowired
    public StakeholderController(StakeholderService stakeholderService) {
        this.stakeholderService = stakeholderService;
    }

    /**
     * Create a new stakeholder.
     * 
     * @param stakeholder the stakeholder to create
     * @return ResponseEntity containing the created stakeholder
     */
    @PostMapping
    public ResponseEntity<Stakeholder> createStakeholder(@RequestBody Stakeholder stakeholder) {
        try {
            Stakeholder createdStakeholder = stakeholderService.createStakeholder(stakeholder);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStakeholder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get stakeholder by ID.
     * 
     * @param id the stakeholder ID
     * @return ResponseEntity containing the stakeholder if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Stakeholder> getStakeholderById(@PathVariable String id) {
        Optional<Stakeholder> stakeholder = stakeholderService.findById(id);
        return stakeholder.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all stakeholders.
     * 
     * @return ResponseEntity containing list of all stakeholders
     */
    @GetMapping
    public ResponseEntity<List<Stakeholder>> getAllStakeholders() {
        List<Stakeholder> stakeholders = stakeholderService.getAllStakeholders();
        return ResponseEntity.ok(stakeholders);
    }

    /**
     * Get stakeholders by project ID.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of stakeholders for the project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Stakeholder>> getStakeholdersByProjectId(@PathVariable String projectId) {
        List<Stakeholder> stakeholders = stakeholderService.findByProjectId(projectId);
        return ResponseEntity.ok(stakeholders);
    }

    /**
     * Update an existing stakeholder.
     * 
     * @param id the stakeholder ID
     * @param stakeholderDetails the updated stakeholder details
     * @return ResponseEntity containing the updated stakeholder
     */
    @PutMapping("/{id}")
    public ResponseEntity<Stakeholder> updateStakeholder(@PathVariable String id, @RequestBody Stakeholder stakeholderDetails) {
        try {
            stakeholderDetails.setId(id);
            Stakeholder updatedStakeholder = stakeholderService.updateStakeholder(stakeholderDetails);
            return ResponseEntity.ok(updatedStakeholder);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a stakeholder by ID.
     * 
     * @param id the stakeholder ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStakeholder(@PathVariable String id) {
        try {
            stakeholderService.deleteStakeholder(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create multiple stakeholders for a project.
     * 
     * @param projectId the project ID
     * @param stakeholders list of stakeholders to create
     * @return ResponseEntity containing list of created stakeholders
     */
    @PostMapping("/project/{projectId}/batch")
    public ResponseEntity<List<Stakeholder>> createStakeholdersForProject(
            @PathVariable String projectId, @RequestBody List<Stakeholder> stakeholders) {
        try {
            // Set project ID for all stakeholders
            stakeholders.forEach(stakeholder -> stakeholder.setProjectId(projectId));
            List<Stakeholder> createdStakeholders = stakeholderService.createStakeholders(stakeholders);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStakeholders);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
