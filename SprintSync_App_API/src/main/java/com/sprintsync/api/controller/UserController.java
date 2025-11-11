package com.sprintsync.api.controller;

import com.sprintsync.api.entity.User;
import com.sprintsync.api.entity.enums.UserRole;
import com.sprintsync.api.entity.enums.ExperienceLevel;
import com.sprintsync.api.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Optional;

/**
 * REST Controller for User entity operations.
 * Provides endpoints for user management operations.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Create a new user.
     * 
     * @param user the user to create
     * @return ResponseEntity containing the created user
     */
    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get user by ID.
     * 
     * @param id the user ID
     * @return ResponseEntity containing the user if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        Optional<User> user = userService.findById(id);
        return user.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get user by email.
     * 
     * @param email the email address
     * @return ResponseEntity containing the user if found
     */
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        Optional<User> user = userService.findByEmail(email);
        return user.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all users with pagination.
     * 
     * @param page page number (default: 0)
     * @param size page size (default: 10)
     * @param sortBy sort field (default: name)
     * @param sortDir sort direction (default: asc)
     * @return ResponseEntity containing page of users
     */
    @GetMapping
    public ResponseEntity<?> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                       Sort.by(sortBy).descending() : 
                       Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<User> users = userService.getAllUsers(pageable);
            
            // Clear password hashes before returning
            users.getContent().forEach(user -> user.setPasswordHash(null));
            
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error fetching users with pagination: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error fetching users: " + e.getMessage()
            ));
        }
    }

    /**
     * Get all users without pagination.
     * 
     * @return ResponseEntity containing list of all users
     */
    @GetMapping("/all")
    public ResponseEntity<List<User>> getAllUsersList() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get users by role.
     * 
     * @param role the user role
     * @return ResponseEntity containing list of users with the specified role
     */
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable UserRole role) {
        List<User> users = userService.findUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    /**
     * Get users by department.
     * 
     * @param departmentId the department ID
     * @return ResponseEntity containing list of users in the department
     */
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<User>> getUsersByDepartment(@PathVariable String departmentId) {
        List<User> users = userService.findUsersByDepartment(departmentId);
        return ResponseEntity.ok(users);
    }

    /**
     * Get active users.
     * 
     * @return ResponseEntity containing list of active users
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size) {
        try {
            List<User> users = userService.findActiveUsers();

            users.sort((user1, user2) -> {
                String name1 = user1.getName() != null ? user1.getName() : "";
                String name2 = user2.getName() != null ? user2.getName() : "";
                return name1.compareToIgnoreCase(name2);
            });
            
            // Clear password hashes before returning
            users.forEach(user -> user.setPasswordHash(null));
            
            // Apply pagination manually if needed
            int start = page * size;
            int end = Math.min(start + size, users.size());
            List<User> paginatedUsers = start < users.size() ? 
                users.subList(start, end) : new ArrayList<>();
            
            return ResponseEntity.ok(paginatedUsers);
        } catch (Exception e) {
            System.err.println("Error fetching active users: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "message", "Error fetching active users: " + e.getMessage()
            ));
        }
    }

    /**
     * Search users by name.
     * 
     * @param name the name to search for
     * @return ResponseEntity containing list of users with matching names
     */
    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsersByName(@RequestParam String name) {
        List<User> users = userService.searchUsersByName(name);
        return ResponseEntity.ok(users);
    }

    /**
     * Get project managers.
     * 
     * @return ResponseEntity containing list of project managers
     */
    @GetMapping("/managers")
    public ResponseEntity<List<User>> getProjectManagers() {
        List<User> users = userService.findProjectManagers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get active developers.
     * 
     * @return ResponseEntity containing list of active developers
     */
    @GetMapping("/developers")
    public ResponseEntity<List<User>> getActiveDevelopers() {
        List<User> users = userService.findActiveDevelopers();
        return ResponseEntity.ok(users);
    }

    /**
     * Update an existing user.
     * 
     * @param id the user ID
     * @param userDetails the updated user details
     * @return ResponseEntity containing the updated user
     */
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        try {
            // Set the ID to ensure we're updating the correct user
            userDetails.setId(id);
            User updatedUser = userService.updateUser(userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a user by ID.
     * 
     * @param id the user ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update user's last login time.
     * 
     * @param id the user ID
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/last-login")
    public ResponseEntity<Void> updateLastLogin(@PathVariable String id) {
        try {
            userService.updateLastLogin(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Activate or deactivate a user.
     * 
     * @param id the user ID
     * @param isActive the active status
     * @return ResponseEntity with no content if successful
     */
    @PatchMapping("/{id}/active")
    public ResponseEntity<Void> setUserActiveStatus(@PathVariable String id, @RequestParam boolean isActive) {
        try {
            userService.setUserActiveStatus(id, isActive);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Check if email exists.
     * 
     * @param email the email address
     * @return ResponseEntity containing boolean result
     */
    @GetMapping("/exists/{email}")
    public ResponseEntity<Boolean> emailExists(@PathVariable String email) {
        boolean exists = userService.emailExists(email);
        return ResponseEntity.ok(exists);
    }

    /**
     * Get user statistics.
     * 
     * @return ResponseEntity containing user statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<String> getUserStats() {
        long totalUsers = userService.getAllUsers().size();
        long activeUsers = userService.findActiveUsers().size();
        long managers = userService.countUsersByRole(UserRole.manager);
        long developers = userService.countUsersByRole(UserRole.developer);
        
        String stats = String.format("Total Users: %d, Active Users: %d, Managers: %d, Developers: %d", 
                                   totalUsers, activeUsers, managers, developers);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get all available experience levels.
     * 
     * @return ResponseEntity containing list of experience levels
     */
    @GetMapping("/experience-levels")
    public ResponseEntity<ExperienceLevel[]> getExperienceLevels() {
        return ResponseEntity.ok(ExperienceLevel.values());
    }

    /**
     * Get user statistics.
     * 
     * @return ResponseEntity containing user statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getUserStatistics() {
        try {
            long totalUsers = userService.getAllUsers().size();
            long activeUsers = userService.findActiveUsers().size();
            
            // Count roles manually to avoid potential issues
            long managers = userService.getAllUsers().stream()
                .filter(user -> user.getRole() == UserRole.manager)
                .count();
            long developers = userService.getAllUsers().stream()
                .filter(user -> user.getRole() == UserRole.developer)
                .count();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("managers", managers);
            stats.put("developers", developers);
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
