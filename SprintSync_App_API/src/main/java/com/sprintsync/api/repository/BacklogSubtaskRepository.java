package com.sprintsync.api.repository;

import com.sprintsync.api.entity.BacklogSubtask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for BacklogSubtask entity operations.
 * 
 * @author SprintSync Team
 */
@Repository
public interface BacklogSubtaskRepository extends JpaRepository<BacklogSubtask, String> {

    /**
     * Find backlog subtasks by backlog task ID.
     */
    List<BacklogSubtask> findByBacklogTaskId(String backlogTaskId);

    /**
     * Find backlog subtasks by original subtask ID.
     */
    List<BacklogSubtask> findByOriginalSubtaskId(String originalSubtaskId);
}

