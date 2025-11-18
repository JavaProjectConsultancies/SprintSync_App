package com.sprintsync.api.repository;

import com.sprintsync.api.entity.BacklogStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository interface for BacklogStory entity operations.
 * 
 * @author SprintSync Team
 */
@Repository
public interface BacklogStoryRepository extends JpaRepository<BacklogStory, String> {

    /**
     * Find backlog stories by project ID.
     */
    List<BacklogStory> findByProjectId(String projectId);

    /**
     * Find backlog stories by original sprint ID.
     */
    List<BacklogStory> findByOriginalSprintId(String sprintId);

    /**
     * Find backlog stories by original story ID.
     */
    List<BacklogStory> findByOriginalStoryId(String storyId);

    /**
     * Find backlog stories by created from sprint ID.
     */
    List<BacklogStory> findByCreatedFromSprintId(String sprintId);
}

