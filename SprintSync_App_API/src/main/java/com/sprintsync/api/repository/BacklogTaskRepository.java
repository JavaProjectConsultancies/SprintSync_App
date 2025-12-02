package com.sprintsync.api.repository;

import com.sprintsync.api.entity.BacklogTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for BacklogTask entity operations.
 * 
 * @author SprintSync Team
 */
@Repository
public interface BacklogTaskRepository extends JpaRepository<BacklogTask, String> {

    /**
     * Find backlog tasks by backlog story ID.
     */
    List<BacklogTask> findByBacklogStoryId(String backlogStoryId);

    /**
     * Find backlog tasks by original task ID.
     */
    List<BacklogTask> findByOriginalTaskId(String originalTaskId);
}

