package com.sprintsync.api.service;

import com.sprintsync.api.entity.PendingRegistration;
import com.sprintsync.api.entity.User;
import com.sprintsync.api.entity.enums.UserRole;
import com.sprintsync.api.repository.PendingRegistrationRepository;
import com.sprintsync.api.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Service for managing pending user registrations.
 * 
 * @author SprintSync Team
 */
@Service
public class PendingRegistrationService {

    private static final Logger logger = LoggerFactory.getLogger(PendingRegistrationService.class);

    @Autowired
    private PendingRegistrationRepository pendingRegistrationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private IdGenerationService idGenerationService;

    /**
     * Create a new pending registration.
     */
    public PendingRegistration createPendingRegistration(String name, String email, String password, UserRole role, String departmentId, String domainId) {
        try {
            // Check if email already exists in users or pending registrations
            if (userRepository.existsByEmail(email)) {
                throw new RuntimeException("User with email " + email + " already exists");
            }
            
            if (pendingRegistrationRepository.existsByEmail(email)) {
                throw new RuntimeException("Registration request for email " + email + " already exists");
            }

            PendingRegistration pendingRegistration = new PendingRegistration();
            // Generate 32-character ID (UUID without dashes) to match users table format
            pendingRegistration.setId(UUID.randomUUID().toString().replace("-", ""));
            pendingRegistration.setName(name);
            pendingRegistration.setEmail(email);
            pendingRegistration.setPasswordHash(passwordEncoder.encode(password));
            pendingRegistration.setRole(role);
            pendingRegistration.setDepartmentId(departmentId);
            pendingRegistration.setDomainId(domainId);
            pendingRegistration.setCreatedAt(LocalDateTime.now());
            pendingRegistration.setUpdatedAt(LocalDateTime.now());

            PendingRegistration saved = pendingRegistrationRepository.save(pendingRegistration);
            logger.info("Pending registration created for email: {}", email);
            return saved;
        } catch (Exception e) {
            logger.error("Error creating pending registration for email: {} - {}", email, e.getMessage());
            throw new RuntimeException("Failed to create pending registration: " + e.getMessage());
        }
    }

    /**
     * Get all pending registrations.
     */
    public List<PendingRegistration> getAllPendingRegistrations() {
        return pendingRegistrationRepository.findAll();
    }

    /**
     * Get pending registration by ID.
     */
    public Optional<PendingRegistration> getPendingRegistrationById(String id) {
        return pendingRegistrationRepository.findById(id);
    }

    /**
     * Get pending registration by email.
     */
    public Optional<PendingRegistration> getPendingRegistrationByEmail(String email) {
        return pendingRegistrationRepository.findByEmail(email);
    }

    /**
     * Delete pending registration (cancel request).
     */
    @Transactional
    public void deletePendingRegistration(String id) {
        try {
            pendingRegistrationRepository.deleteById(id);
            logger.info("Pending registration deleted: {}", id);
        } catch (Exception e) {
            logger.error("Error deleting pending registration: {} - {}", id, e.getMessage());
            throw new RuntimeException("Failed to delete pending registration: " + e.getMessage());
        }
    }

    /**
     * Convert pending registration to user and delete pending registration.
     */
    @Transactional
    public User approveAndCreateUser(String pendingRegistrationId) {
        try {
            PendingRegistration pendingRegistration = pendingRegistrationRepository.findById(pendingRegistrationId)
                .orElseThrow(() -> new RuntimeException("Pending registration not found: " + pendingRegistrationId));

            // Create user from pending registration
            User user = new User();
            // Generate user ID using IdGenerationService to match users table format
            user.setId(idGenerationService.generateUserId());
            user.setName(pendingRegistration.getName());
            user.setEmail(pendingRegistration.getEmail());
            user.setPasswordHash(pendingRegistration.getPasswordHash());
            user.setRole(pendingRegistration.getRole());
            user.setDepartmentId(pendingRegistration.getDepartmentId());
            user.setDomainId(pendingRegistration.getDomainId());
            user.setIsActive(true);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            // Check if user already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                throw new RuntimeException("User with email " + user.getEmail() + " already exists");
            }

            User savedUser = userRepository.save(user);

            // Delete pending registration
            pendingRegistrationRepository.deleteById(pendingRegistrationId);

            logger.info("User created from pending registration: {}", savedUser.getEmail());
            return savedUser;
        } catch (Exception e) {
            logger.error("Error approving pending registration: {} - {}", pendingRegistrationId, e.getMessage());
            throw new RuntimeException("Failed to approve pending registration: " + e.getMessage());
        }
    }
}

