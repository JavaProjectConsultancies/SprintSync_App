package com.sprintsync.api.service;

import com.sprintsync.api.entity.Story;
import com.sprintsync.api.entity.enums.StoryPriority;
import com.sprintsync.api.entity.enums.StoryStatus;
import com.sprintsync.api.repository.StoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Story entity operations.
 * Provides business logic for story management operations.
 * 
 * @author Mayuresh G
 */
@Service
@Transactional
public class StoryService {

    private final StoryRepository storyRepository;
    private final IdGenerationService idGenerationService;
    private NotificationService notificationService;

    @Autowired
    public StoryService(StoryRepository storyRepository, IdGenerationService idGenerationService) {
        this.storyRepository = storyRepository;
        this.idGenerationService = idGenerationService;
    }

    @Autowired
    public void setNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Create a new story.
     * 
     * @param story the story to create
     * @return the created story
     */
    public Story createStory(Story story) {
        // Generate custom ID if not provided
        if (story.getId() == null) {
            story.setId(idGenerationService.generateStoryId());
        }
        return storyRepository.save(story);
    }

    /**
     * Find story by ID.
     * 
     * @param id the story ID
     * @return Optional containing the story if found
     */
    @Transactional(readOnly = true)
    public Optional<Story> findById(String id) {
        return storyRepository.findById(id);
    }

    /**
     * Update an existing story.
     * 
     * @param story the story to update
     * @return the updated story
     * @throws IllegalArgumentException if story not found
     */
    public Story updateStory(Story story) {
        if (!storyRepository.existsById(story.getId())) {
            throw new IllegalArgumentException("Story not found with ID: " + story.getId());
        }
        return storyRepository.save(story);
    }

    /**
     * Delete a story by ID.
     * 
     * @param id the story ID
     * @throws IllegalArgumentException if story not found
     */
    public void deleteStory(String id) {
        if (!storyRepository.existsById(id)) {
            throw new IllegalArgumentException("Story not found with ID: " + id);
        }
        storyRepository.deleteById(id);
    }

    /**
     * Get all stories.
     * 
     * @return list of all stories
     */
    @Transactional(readOnly = true)
    public List<Story> getAllStories() {
        return storyRepository.findAll();
    }

    /**
     * Get all stories with pagination.
     * 
     * @param page page number (0-indexed)
     * @param size page size
     * @param sortBy sort field
     * @param sortDir sort direction
     * @return page of stories
     */
    @Transactional(readOnly = true)
    public Page<Story> getAllStories(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return storyRepository.findAll(pageable);
    }

    /**
     * Find stories by project ID.
     * 
     * @param projectId the project ID
     * @return list of stories for the specified project
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesByProject(String projectId) {
        return storyRepository.findByProjectId(projectId);
    }

    /**
     * Find stories by sprint ID.
     * 
     * @param sprintId the sprint ID
     * @return list of stories in the specified sprint
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesBySprint(String sprintId) {
        return storyRepository.findBySprintId(sprintId);
    }

    /**
     * Find stories by epic ID.
     * 
     * @param epicId the epic ID
     * @return list of stories belonging to the specified epic
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesByEpic(String epicId) {
        return storyRepository.findByEpicId(epicId);
    }

    /**
     * Find stories by release ID.
     * 
     * @param releaseId the release ID
     * @return list of stories included in the specified release
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesByRelease(String releaseId) {
        return storyRepository.findByReleaseId(releaseId);
    }

    /**
     * Find stories by status.
     * 
     * @param status the story status
     * @return list of stories with the specified status
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesByStatus(StoryStatus status) {
        return storyRepository.findByStatus(status);
    }

    /**
     * Find stories by priority.
     * 
     * @param priority the story priority
     * @return list of stories with the specified priority
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesByPriority(StoryPriority priority) {
        return storyRepository.findByPriority(priority);
    }

    /**
     * Find stories by assignee ID.
     * 
     * @param assigneeId the assignee ID
     * @return list of stories assigned to the specified user
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesByAssignee(String assigneeId) {
        return storyRepository.findByAssigneeId(assigneeId);
    }

    /**
     * Search stories by title.
     * 
     * @param title the title to search for
     * @return list of stories with matching titles
     */
    @Transactional(readOnly = true)
    public List<Story> searchStoriesByTitle(String title) {
        return storyRepository.findByTitleContainingIgnoreCase(title);
    }

    /**
     * Find unassigned stories.
     * 
     * @return list of stories with no assignee
     */
    @Transactional(readOnly = true)
    public List<Story> findUnassignedStories() {
        return storyRepository.findUnassignedStories();
    }

    /**
     * Find stories exceeding estimated hours.
     * 
     * @return list of stories that have exceeded estimated hours
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesExceedingEstimatedHours() {
        return storyRepository.findStoriesExceedingEstimatedHours();
    }

    /**
     * Find stories by multiple criteria.
     * 
     * @param projectId the project ID (optional)
     * @param sprintId the sprint ID (optional)
     * @param epicId the epic ID (optional)
     * @param status the story status (optional)
     * @param priority the story priority (optional)
     * @param assigneeId the assignee ID (optional)
     * @return list of stories matching the criteria
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesByCriteria(String projectId, String sprintId, String epicId, 
                                           StoryStatus status, StoryPriority priority, String assigneeId) {
        return storyRepository.findStoriesByCriteria(projectId, sprintId, epicId, status, priority, assigneeId);
    }

    /**
     * Update story status.
     * 
     * @param id the story ID
     * @param status the new status
     * @return the updated story
     * @throws IllegalArgumentException if story not found
     */
    public Story updateStoryStatus(String id, StoryStatus status) {
        Optional<Story> storyOptional = storyRepository.findById(id);
        if (storyOptional.isPresent()) {
            Story story = storyOptional.get();
            story.setStatus(status);
            return storyRepository.save(story);
        } else {
            throw new IllegalArgumentException("Story not found with ID: " + id);
        }
    }

    /**
     * Assign story to user.
     * 
     * @param id the story ID
     * @param assigneeId the assignee ID
     * @return the updated story
     * @throws IllegalArgumentException if story not found
     */
    public Story assignStory(String id, String assigneeId) {
        Optional<Story> storyOptional = storyRepository.findById(id);
        if (storyOptional.isPresent()) {
            Story story = storyOptional.get();
            story.setAssigneeId(assigneeId);
            Story savedStory = storyRepository.save(story);
            
            // Create notification for the assigned user
            if (assigneeId != null && !assigneeId.isEmpty() && notificationService != null) {
                try {
                    String title = "New Story Assignment";
                    String message = "You have been assigned to story: " + story.getTitle();
                    notificationService.createNotification(
                        assigneeId,
                        title,
                        message,
                        "task",
                        "story",
                        story.getId()
                    );
                } catch (Exception e) {
                    // Log error but don't fail the assignment
                    System.err.println("Failed to create notification for story assignment: " + e.getMessage());
                }
            }
            
            return savedStory;
        } else {
            throw new IllegalArgumentException("Story not found with ID: " + id);
        }
    }

    /**
     * Move story to sprint.
     * 
     * @param id the story ID
     * @param sprintId the sprint ID
     * @return the updated story
     * @throws IllegalArgumentException if story not found
     */
    public Story moveStoryToSprint(String id, String sprintId) {
        Optional<Story> storyOptional = storyRepository.findById(id);
        if (storyOptional.isPresent()) {
            Story story = storyOptional.get();
            story.setSprintId(sprintId);
            return storyRepository.save(story);
        } else {
            throw new IllegalArgumentException("Story not found with ID: " + id);
        }
    }

    /**
     * Get story statistics for a project.
     * 
     * @param projectId the project ID
     * @return story statistics
     */
    @Transactional(readOnly = true)
    public String getStoryStatistics(String projectId) {
        long totalStories = storyRepository.countByProjectId(projectId);
        long doneStories = storyRepository.countByStatus(StoryStatus.DONE);
        long inProgressStories = storyRepository.countByStatus(StoryStatus.IN_PROGRESS);
        long backlogStories = storyRepository.countByStatus(StoryStatus.BACKLOG);
        
        Integer totalStoryPoints = storyRepository.sumStoryPointsByProjectId(projectId);
        BigDecimal totalEstimatedHours = storyRepository.sumEstimatedHoursByProjectId(projectId);
        BigDecimal totalActualHours = storyRepository.sumActualHoursByProjectId(projectId);
        
        return String.format("Total Stories: %d, Done: %d, In Progress: %d, Backlog: %d, " +
                           "Total Story Points: %d, Estimated Hours: %.2f, Actual Hours: %.2f",
                           totalStories, doneStories, inProgressStories, backlogStories,
                           totalStoryPoints != null ? totalStoryPoints : 0,
                           totalEstimatedHours != null ? totalEstimatedHours : BigDecimal.ZERO,
                           totalActualHours != null ? totalActualHours : BigDecimal.ZERO);
    }

    /**
     * Get sprint statistics.
     * 
     * @param sprintId the sprint ID
     * @return sprint statistics
     */
    @Transactional(readOnly = true)
    public String getSprintStatistics(String sprintId) {
        long totalStories = storyRepository.countBySprintId(sprintId);
        Integer totalStoryPoints = storyRepository.sumStoryPointsBySprintId(sprintId);
        
        return String.format("Total Stories: %d, Total Story Points: %d",
                           totalStories, totalStoryPoints != null ? totalStoryPoints : 0);
    }

    /**
     * Find stories without sprint assignment.
     * 
     * @param projectId the project ID
     * @return list of stories not assigned to any sprint
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesWithoutSprint(String projectId) {
        return storyRepository.findStoriesWithoutSprint(projectId);
    }

    /**
     * Get stories ordered by index for a sprint.
     * 
     * @param sprintId the sprint ID
     * @return list of stories ordered by order index
     */
    @Transactional(readOnly = true)
    public List<Story> getStoriesBySprintOrdered(String sprintId) {
        return storyRepository.findStoriesBySprintOrderedByIndex(sprintId);
    }
}
