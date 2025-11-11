package com.sprintsync.api.repository;

import com.sprintsync.api.entity.PendingRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository interface for PendingRegistration entity operations.
 * 
 * @author SprintSync Team
 */
@Repository
public interface PendingRegistrationRepository extends JpaRepository<PendingRegistration, String> {

    /**
     * Find pending registration by email address.
     * 
     * @param email the email address
     * @return Optional containing the pending registration if found
     */
    Optional<PendingRegistration> findByEmail(String email);

    /**
     * Check if email exists in pending registrations.
     * 
     * @param email the email address
     * @return true if email exists, false otherwise
     */
    boolean existsByEmail(String email);
}

