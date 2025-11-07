package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Board entity operations.
 * Provides CRUD operations and custom query methods for board management.
 * 
 * @author SprintSync Team
 */
@Repository
public interface BoardRepository extends JpaRepository<Board, String> {

    /**
     * Find all boards by project ID, ordered by creation date.
     * 
     * @param projectId the project ID
     * @return list of boards for the specified project
     */
    List<Board> findByProjectIdOrderByCreatedAtAsc(String projectId);

    /**
     * Find the default board for a project.
     * 
     * @param projectId the project ID
     * @return the default board if found
     */
    Optional<Board> findByProjectIdAndIsDefaultTrue(String projectId);

    /**
     * Count boards by project ID.
     * 
     * @param projectId the project ID
     * @return count of boards for the specified project
     */
    long countByProjectId(String projectId);
}

