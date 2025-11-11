package com.sprintsync.api.controller;

import com.sprintsync.api.entity.PendingRegistration;
import com.sprintsync.api.entity.User;
import com.sprintsync.api.service.PendingRegistrationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for managing pending user registrations.
 * 
 * @author SprintSync Team
 */
@RestController
@RequestMapping("/api/pending-registrations")
@CrossOrigin(origins = "*")
public class PendingRegistrationController {

    private static final Logger logger = LoggerFactory.getLogger(PendingRegistrationController.class);

    @Autowired
    private PendingRegistrationService pendingRegistrationService;

    /**
     * Get all pending registrations.
     * GET /api/pending-registrations
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllPendingRegistrations() {
        try {
            List<PendingRegistration> pendingRegistrations = pendingRegistrationService.getAllPendingRegistrations();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pending registrations retrieved successfully");
            response.put("data", pendingRegistrations);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving pending registrations: {}", e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve pending registrations: " + e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get pending registration by ID.
     * GET /api/pending-registrations/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getPendingRegistrationById(@PathVariable String id) {
        try {
            PendingRegistration pendingRegistration = pendingRegistrationService.getPendingRegistrationById(id)
                .orElseThrow(() -> new RuntimeException("Pending registration not found: " + id));
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pending registration retrieved successfully");
            response.put("data", pendingRegistration);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error retrieving pending registration: {} - {}", id, e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Delete pending registration (cancel request).
     * DELETE /api/pending-registrations/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deletePendingRegistration(@PathVariable String id) {
        try {
            pendingRegistrationService.deletePendingRegistration(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pending registration deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error deleting pending registration: {} - {}", id, e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Approve pending registration and create user.
     * POST /api/pending-registrations/{id}/approve
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Map<String, Object>> approvePendingRegistration(@PathVariable String id) {
        try {
            User user = pendingRegistrationService.approveAndCreateUser(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Pending registration approved and user created successfully");
            response.put("data", user);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error approving pending registration: {} - {}", id, e.getMessage());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            response.put("data", null);
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }
}

