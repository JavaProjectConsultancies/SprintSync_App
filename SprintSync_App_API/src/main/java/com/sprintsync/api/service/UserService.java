package com.sprintsync.api.service;

import com.sprintsync.api.entity.User;
import com.sprintsync.api.entity.enums.UserRole;
import com.sprintsync.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for User entity operations.
 * Provides business logic for user management operations.
 * 
 * @author Mayuresh G
 */
@Service
@Transactional

@SuppressWarnings("null")
public class UserService {

    private final UserRepository userRepository;
    private final IdGenerationService idGenerationService;

    @Autowired
    public UserService(UserRepository userRepository, IdGenerationService idGenerationService) {
        this.userRepository = userRepository;
        this.idGenerationService = idGenerationService;
    }

    /**
     * Create a new user.
     * 
     * @param user the user to create
     * @return the created user
     * @throws IllegalArgumentException if email already exists
     */
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        // Generate custom ID if not provided
        if (user.getId() == null) {
            user.setId(idGenerationService.generateUserId());
        }
        return userRepository.save(user);
    }

    /**
     * Find user by ID.
     * 
     * @param id the user ID
     * @return Optional containing the user if found
     */
    @Transactional(readOnly = true)
    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    /**
     * Find user by email.
     * 
     * @param email the email address
     * @return Optional containing the user if found
     */
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Update an existing user.
     * 
     * @param user the user to update
     * @return the updated user
     * @throws IllegalArgumentException if user not found
     */
    public User updateUser(User user) {
        if (!userRepository.existsById(user.getId())) {
            throw new IllegalArgumentException("User not found with ID: " + user.getId());
        }
        
        // Fetch existing user to merge data
        User existingUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + user.getId()));
        
        // Update only provided fields
        if (user.getName() != null) {
            existingUser.setName(user.getName());
        }
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        if (user.getPasswordHash() != null && !user.getPasswordHash().isEmpty()) {
            existingUser.setPasswordHash(user.getPasswordHash());
        }
        if (user.getRole() != null) {
            existingUser.setRole(user.getRole());
        }
        if (user.getDepartmentId() != null) {
            existingUser.setDepartmentId(user.getDepartmentId());
        }
        if (user.getDomainId() != null) {
            existingUser.setDomainId(user.getDomainId());
        }
        if (user.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(user.getAvatarUrl());
        }
        if (user.getExperience() != null) {
            existingUser.setExperience(user.getExperience());
        }
        if (user.getHourlyRate() != null) {
            existingUser.setHourlyRate(user.getHourlyRate());
        }
        if (user.getCtc() != null) {
            existingUser.setCtc(user.getCtc());
        }
        if (user.getAvailabilityPercentage() != null) {
            existingUser.setAvailabilityPercentage(user.getAvailabilityPercentage());
        }
        if (user.getSkills() != null) {
            existingUser.setSkills(user.getSkills());
        }
        if (user.getIsActive() != null) {
            existingUser.setIsActive(user.getIsActive());
        }
        
        // Update the updatedAt timestamp
        existingUser.setUpdatedAt(java.time.LocalDateTime.now());
        
        return userRepository.save(existingUser);
    }

    /**
     * Delete a user by ID.
     * 
     * @param id the user ID
     * @throws IllegalArgumentException if user not found
     */
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("User not found with ID: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Get all users.
     * 
     * @return list of all users
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Get all users with pagination.
     * 
     * @param pageable pagination information
     * @return page of users
     */
    @Transactional(readOnly = true)
    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    /**
     * Find users by role.
     * 
     * @param role the user role
     * @return list of users with the specified role
     */
    @Transactional(readOnly = true)
    public List<User> findUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    /**
     * Find users by role with pagination.
     * 
     * @param role the user role
     * @param pageable pagination information
     * @return page of users with the specified role
     */
    @Transactional(readOnly = true)
    public Page<User> findUsersByRole(UserRole role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }

    /**
     * Find users by department.
     * 
     * @param departmentId the department ID
     * @return list of users in the specified department
     */
    @Transactional(readOnly = true)
    public List<User> findUsersByDepartment(String departmentId) {
        return userRepository.findByDepartmentId(departmentId);
    }

    /**
     * Find users by department with pagination.
     * 
     * @param departmentId the department ID
     * @param pageable pagination information
     * @return page of users in the specified department
     */
    @Transactional(readOnly = true)
    public Page<User> findUsersByDepartment(String departmentId, Pageable pageable) {
        return userRepository.findByDepartmentId(departmentId, pageable);
    }

    /**
     * Find active users.
     * 
     * @return list of active users
     */
    @Transactional(readOnly = true)
    public List<User> findActiveUsers() {
        return userRepository.findByIsActive(true);
    }

    /**
     * Find users by name containing (case-insensitive).
     * 
     * @param name the name to search for
     * @return list of users with names containing the search term
     */
    @Transactional(readOnly = true)
    public List<User> searchUsersByName(String name) {
        return userRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Find users by experience level.
     * 
     * @param experience the experience level
     * @return list of users with the specified experience level
     */
    @Transactional(readOnly = true)
    public List<User> findUsersByExperience(String experience) {
        return userRepository.findByExperience(experience);
    }

    /**
     * Find available users (with availability percentage >= threshold).
     * 
     * @param availabilityThreshold the minimum availability percentage
     * @return list of available users
     */
    @Transactional(readOnly = true)
    public List<User> findAvailableUsers(Integer availabilityThreshold) {
        return userRepository.findByAvailabilityPercentageGreaterThanEqual(availabilityThreshold);
    }

    /**
     * Find users by multiple criteria.
     * 
     * @param role the user role (optional)
     * @param departmentId the department ID (optional)
     * @param isActive the active status (optional)
     * @return list of users matching the criteria
     */
    @Transactional(readOnly = true)
    public List<User> findUsersByCriteria(UserRole role, String departmentId, Boolean isActive) {
        return userRepository.findUsersByCriteria(role, departmentId, isActive);
    }

    /**
     * Find project managers.
     * 
     * @return list of project managers
     */
    @Transactional(readOnly = true)
    public List<User> findProjectManagers() {
        return userRepository.findProjectManagers();
    }

    /**
     * Find active developers.
     * 
     * @return list of active developers
     */
    @Transactional(readOnly = true)
    public List<User> findActiveDevelopers() {
        return userRepository.findActiveDevelopers();
    }

    /**
     * Count users by role.
     * 
     * @param role the user role
     * @return count of users with the specified role
     */
    @Transactional(readOnly = true)
    public long countUsersByRole(UserRole role) {
        return userRepository.countByRole(role);
    }

    /**
     * Update user's last login time.
     * 
     * @param userId the user ID
     * @throws IllegalArgumentException if user not found
     */
    public void updateLastLogin(String userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);
        } else {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
    }

    /**
     * Activate or deactivate a user.
     * 
     * @param userId the user ID
     * @param isActive the active status
     * @throws IllegalArgumentException if user not found
     */
    public void setUserActiveStatus(String userId, Boolean isActive) {
        Optional<User> userOptional = userRepository.findById(userId);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setIsActive(isActive);
            userRepository.save(user);
        } else {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }
    }

    /**
     * Check if email exists.
     * 
     * @param email the email address
     * @return true if email exists, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    /**
     * Validate user credentials (basic validation).
     * 
     * @param email the email address
     * @param passwordHash the password hash
     * @return Optional containing the user if credentials are valid
     */
    @Transactional(readOnly = true)
    public Optional<User> validateCredentials(String email, String passwordHash) {
        return userRepository.findByEmail(email)
                .filter(user -> user.getPasswordHash().equals(passwordHash) && user.getIsActive());
    }
}






