package com.sprintsync.api.repository;

import com.sprintsync.api.entity.User;
import com.sprintsync.api.entity.enums.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity operations.
 * Provides CRUD operations and custom query methods for user management.
 * 
 * @author Mayuresh G
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /**
     * Find user by email address.
     * 
     * @param email the email address
     * @return Optional containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Find users by role.
     * 
     * @param role the user role
     * @return list of users with the specified role
     */
    List<User> findByRole(UserRole role);

    /**
     * Find users by department.
     * 
     * @param departmentId the department ID
     * @return list of users in the specified department
     */
    List<User> findByDepartmentId(String departmentId);

    /**
     * Find users by domain.
     * 
     * @param domainId the domain ID
     * @return list of users in the specified domain
     */
    List<User> findByDomainId(String domainId);

    /**
     * Find active users.
     * 
     * @param isActive the active status
     * @return list of active users
     */
    List<User> findByIsActive(Boolean isActive);

    /**
     * Find users by role with pagination.
     * 
     * @param role the user role
     * @param pageable pagination information
     * @return page of users with the specified role
     */
    Page<User> findByRole(UserRole role, Pageable pageable);

    /**
     * Find users by department with pagination.
     * 
     * @param departmentId the department ID
     * @param pageable pagination information
     * @return page of users in the specified department
     */
    Page<User> findByDepartmentId(String departmentId, Pageable pageable);

    /**
     * Check if email exists.
     * 
     * @param email the email address
     * @return true if email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find users by name containing (case-insensitive).
     * 
     * @param name the name to search for
     * @return list of users with names containing the search term
     */
    List<User> findByNameContainingIgnoreCase(String name);

    /**
     * Find users by experience level.
     * 
     * @param experience the experience level
     * @return list of users with the specified experience level
     */
    List<User> findByExperience(String experience);

    /**
     * Find users with availability percentage greater than or equal to specified value.
     * 
     * @param availabilityPercentage the minimum availability percentage
     * @return list of available users
     */
    List<User> findByAvailabilityPercentageGreaterThanEqual(Integer availabilityPercentage);

    /**
     * Custom query to find users by multiple criteria.
     * 
     * @param role the user role
     * @param departmentId the department ID
     * @param isActive the active status
     * @return list of users matching all criteria
     */
    @Query("SELECT u FROM User u WHERE " +
           "(:role IS NULL OR u.role = :role) AND " +
           "(:departmentId IS NULL OR u.departmentId = :departmentId) AND " +
           "(:isActive IS NULL OR u.isActive = :isActive)")
    List<User> findUsersByCriteria(@Param("role") UserRole role,
                                  @Param("departmentId") String departmentId,
                                  @Param("isActive") Boolean isActive);

    /**
     * Custom query to find project managers.
     * 
     * @return list of users with manager role
     */
    @Query("SELECT u FROM User u WHERE u.role = 'MANAGER' AND u.isActive = true")
    List<User> findProjectManagers();

    /**
     * Custom query to find developers.
     * 
     * @return list of active developers
     */
    @Query("SELECT u FROM User u WHERE u.role = 'DEVELOPER' AND u.isActive = true")
    List<User> findActiveDevelopers();

    /**
     * Custom query to count users by role.
     * 
     * @param role the user role
     * @return count of users with the specified role
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role AND u.isActive = true")
    long countByRole(@Param("role") UserRole role);
}
