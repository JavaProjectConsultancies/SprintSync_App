package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import org.springframework.data.jpa.repository.Query;
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Department entity.
 * Provides data access methods for department management.
 * 
 * @author Mayuresh G
 */
@Repository
public interface DepartmentRepository extends JpaRepository<Department, String> {
    
    /**
     * Find department by name (case-insensitive)
     * @param name the department name
     * @return Optional containing the department if found
     */
    Optional<Department> findByNameIgnoreCase(String name);
    
    /**
     * Check if department exists by name
     * @param name the department name
     * @return true if department exists
     */
    boolean existsByNameIgnoreCase(String name);
    
    /**
     * Find department by name containing (case-insensitive)
     * @param name the partial department name
     * @return list of departments matching the criteria
     */
    List<Department> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find departments by description containing (case-insensitive)
     * @param description the partial description
     * @return list of departments matching the criteria
     */
    List<Department> findByDescriptionContainingIgnoreCase(String description);
    
    /**
     * Find departments by name or description containing (case-insensitive)
     * @param name the partial name
     * @param description the partial description
     * @return list of departments matching the criteria
     */
    List<Department> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
    
    // TODO: Add is_active column to database and uncomment these methods
    // /**
    //  * Find active departments
    //  * @return list of active departments
    //  */
    // List<Department> findByIsActiveTrue();
    
    // /**
    //  * Find inactive departments
    //  * @return list of inactive departments
    //  */
    // List<Department> findByIsActiveFalse();
    
    // /**
    //  * Count departments by active status
    //  * @param isActive the active status
    //  * @return count of departments
    //  */
    // long countByIsActive(boolean isActive);
<<<<<<< HEAD

    /**
     * Find the maximum ID in the departments table.
     * Used for generating the next available department ID.
     * 
     * @return the maximum ID as an optional string
     */
    @Query("SELECT MAX(d.id) FROM Department d")
    Optional<String> findMaxId();
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
}
