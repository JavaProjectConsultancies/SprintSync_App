package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
import org.springframework.data.jpa.repository.Query;
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Domain entity.
 * Provides data access methods for domain management.
 * 
 * @author Mayuresh G
 */
@Repository
public interface DomainRepository extends JpaRepository<Domain, String> {
    
    /**
     * Find domain by name (case-insensitive)
     * @param name the domain name
     * @return Optional containing the domain if found
     */
    Optional<Domain> findByNameIgnoreCase(String name);
    
    /**
     * Check if domain exists by name
     * @param name the domain name
     * @return true if domain exists
     */
    boolean existsByNameIgnoreCase(String name);
    
    /**
     * Find domain by name containing (case-insensitive)
     * @param name the partial domain name
     * @return list of domains matching the criteria
     */
    List<Domain> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find domains by description containing (case-insensitive)
     * @param description the partial description
     * @return list of domains matching the criteria
     */
    List<Domain> findByDescriptionContainingIgnoreCase(String description);
    
    /**
     * Find domains by name or description containing (case-insensitive)
     * @param name the partial name
     * @param description the partial description
     * @return list of domains matching the criteria
     */
    List<Domain> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String description);
    
    // TODO: Add is_active column to database and uncomment these methods
    // /**
    //  * Find active domains
    //  * @return list of active domains
    //  */
    // List<Domain> findByIsActiveTrue();
    
    // /**
    //  * Find inactive domains
    //  * @return list of inactive domains
    //  */
    // List<Domain> findByIsActiveFalse();
    
    // /**
    //  * Count domains by active status
    //  * @param isActive the active status
    //  * @return count of domains
    //  */
    // long countByIsActive(boolean isActive);
<<<<<<< HEAD

    /**
     * Find the maximum ID in the domains table.
     * Used for generating the next available domain ID.
     * 
     * @return the maximum ID as an optional string
     */
    @Query("SELECT MAX(d.id) FROM Domain d")
    Optional<String> findMaxId();
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
}
