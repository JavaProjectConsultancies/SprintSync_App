package com.sprintsync.api.service;

import com.sprintsync.api.entity.Story;
import com.sprintsync.api.entity.Task;
import com.sprintsync.api.entity.enums.StoryPriority;
import com.sprintsync.api.entity.enums.StoryStatus;
import com.sprintsync.api.entity.enums.TaskStatus;
import com.sprintsync.api.repository.StoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Service class for Story entity operations.
 * Provides business logic for story management operations.
 * 
 * @author Mayuresh G
 */
@Service
@Transactional

@SuppressWarnings("null")
public class StoryService {

    private final StoryRepository storyRepository;
    private final IdGenerationService idGenerationService;
    private NotificationService notificationService;
    private TaskService taskService;
    private ActivityLogService activityLogService;

    @Autowired
    public StoryService(StoryRepository storyRepository, IdGenerationService idGenerationService) {
        this.storyRepository = storyRepository;
        this.idGenerationService = idGenerationService;
    }

    @Autowired
    public void setNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Autowired
    public void setTaskService(TaskService taskService) {
        this.taskService = taskService;
    }

    @Autowired
    public void setActivityLogService(ActivityLogService activityLogService) {
        this.activityLogService = activityLogService;
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
     * Enriches stories with parent story information if parentId is set.
     * 
     * @param projectId the project ID
     * @return list of stories for the specified project with parent story details
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesByProject(String projectId) {
        List<Story> stories = storyRepository.findByProjectId(projectId);
        // Enrich stories with parent story details
        enrichStoriesWithParentDetails(stories);
        return stories;
    }

    /**
     * Find stories by sprint ID.
     * Enriches stories with parent story information if parentId is set.
     * 
     * @param sprintId the sprint ID
     * @return list of stories in the specified sprint with parent story details
     */
    @Transactional(readOnly = true)
    public List<Story> findStoriesBySprint(String sprintId) {
        List<Story> stories = storyRepository.findBySprintId(sprintId);
        // Enrich stories with parent story details
        enrichStoriesWithParentDetails(stories);
        return stories;
    }

    /**
     * Enrich stories with parent story details.
     * This helps the frontend display parent story information correctly.
     * Checks both stories and backlog_stories tables for parent story.
     * 
     * @param stories list of stories to enrich
     */
    private void enrichStoriesWithParentDetails(List<Story> stories) {
        // First, try to find parent stories in the stories table
        for (Story story : stories) {
            if (story.getParentId() != null && !story.getParentId().isEmpty()) {
                try {
                    Optional<Story> parentStoryOpt = storyRepository.findById(story.getParentId());
                    if (parentStoryOpt.isPresent()) {
                        Story parentStory = parentStoryOpt.get();
                        story.setParentStory(parentStory);
                        story.setParentStoryTitle(parentStory.getTitle());
                    }
                    // If not found in stories table, parent might be in backlog - handled separately if needed
                } catch (Exception e) {
                    // Log error but don't fail the request
                    System.err.println("Error fetching parent story for story " + story.getId() + ": " + e.getMessage());
                }
            }
        }
        
        // For stories where parent was not found in stories table, check backlog_stories
        // Note: This requires BacklogStoryRepository to be injected if needed
        // For now, parent stories in backlog will show null title, which frontend can handle
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
            String oldSprintId = story.getSprintId();
            story.setSprintId(sprintId);
            Story savedStory = storyRepository.save(story);
            
            // Verify the sprintId was set correctly
            if (savedStory.getSprintId() == null || !savedStory.getSprintId().equals(sprintId)) {
                throw new IllegalStateException(
                    String.format("Failed to update sprintId for story %s. Expected: %s, Got: %s", 
                        id, sprintId, savedStory.getSprintId()));
            }
            
            // Log the change for debugging
            System.out.println(String.format(
                "Story %s moved from sprint %s to sprint %s. Story sprintId is now: %s",
                id, oldSprintId != null ? oldSprintId : "null", sprintId, savedStory.getSprintId()));
            
            return savedStory;
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

    /**
     * Create a new story from a previous sprint story with new ID and copy only overdue, in-progress, and incomplete tasks.
     * This method duplicates a story from a previous sprint to a new sprint with a new story ID.
     * 
     * @param sourceStoryId the source story ID to duplicate (from previous sprint)
     * @param targetSprintId the target sprint ID to assign the new story to
     * @param userId the user ID performing the action (for activity logging)
     * @return the newly created story with copied tasks
     * @throws IllegalArgumentException if story not found
     */
    @Transactional
    public Story createStoryFromPreviousSprint(String sourceStoryId, String targetSprintId, String userId) {
        // Get the original story from previous sprint
        Optional<Story> sourceStoryOpt = storyRepository.findById(sourceStoryId);
        if (sourceStoryOpt.isEmpty()) {
            throw new IllegalArgumentException("Source story not found with ID: " + sourceStoryId);
        }
        
        Story sourceStory = sourceStoryOpt.get();
        
        // Create a new story with new ID
        Story newStory = new Story();
        newStory.setId(idGenerationService.generateStoryId());
        newStory.setProjectId(sourceStory.getProjectId());
        newStory.setSprintId(targetSprintId);

        // Set parentId so that all pulled copies reference the original/root story
        // For the first sprint's stories, parentId will be null.
        // When pulling to a new sprint:
        // - If the source story already has a parentId, reuse it (keep the root reference)
        // - Otherwise, use the source story's id as the parentId for the new story
        if (sourceStory.getParentId() != null) {
            newStory.setParentId(sourceStory.getParentId());
        } else {
            newStory.setParentId(sourceStory.getId());
        }

        newStory.setTitle(sourceStory.getTitle());
        newStory.setDescription(sourceStory.getDescription());
        newStory.setAcceptanceCriteria(sourceStory.getAcceptanceCriteria() != null ? 
            new ArrayList<>(sourceStory.getAcceptanceCriteria()) : new ArrayList<>());
        newStory.setStatus(StoryStatus.TODO); // Reset status to TODO when story is pulled to new sprint
        newStory.setPriority(sourceStory.getPriority());
        newStory.setStoryPoints(sourceStory.getStoryPoints());
        newStory.setAssigneeId(sourceStory.getAssigneeId());
        newStory.setReporterId(sourceStory.getReporterId());
        newStory.setEpicId(sourceStory.getEpicId());
        newStory.setReleaseId(sourceStory.getReleaseId());
        newStory.setLabels(sourceStory.getLabels() != null ? 
            new ArrayList<>(sourceStory.getLabels()) : new ArrayList<>());
        newStory.setOrderIndex(sourceStory.getOrderIndex());
        newStory.setEstimatedHours(sourceStory.getEstimatedHours());
        newStory.setActualHours(BigDecimal.ZERO); // Reset actual hours for new story
        
        // Save the new story
        Story savedStory = storyRepository.save(newStory);
        
        // Get all tasks from the source story
        List<Task> sourceTasks = taskService.getTasksByStoryId(sourceStoryId);
        
        // Filter tasks: only overdue, in-progress, and incomplete (not done) tasks
        LocalDate today = LocalDate.now();
        List<Task> tasksToCopy = new ArrayList<>();
        String sourceSprintId = sourceStory.getSprintId();
        
        for (Task sourceTask : sourceTasks) {
            boolean isOverdue = sourceTask.getDueDate() != null && 
                               sourceTask.getDueDate().isBefore(today);
            boolean isInProgress = sourceTask.getStatus() == TaskStatus.IN_PROGRESS;
            boolean isIncomplete = sourceTask.getStatus() != TaskStatus.DONE && 
                                  sourceTask.getStatus() != TaskStatus.CANCELLED;
            
            // Copy task if it's overdue, in-progress, or incomplete
            if (isOverdue || isInProgress || isIncomplete) {
                Task newTask = new Task();
                // ID will be generated by TaskService.createTask() if null
                newTask.setStoryId(savedStory.getId());
                newTask.setTitle(sourceTask.getTitle());
                newTask.setDescription(sourceTask.getDescription());
                newTask.setStatus(sourceTask.getStatus());
                newTask.setPriority(sourceTask.getPriority());
                newTask.setAssigneeId(sourceTask.getAssigneeId());
                newTask.setReporterId(sourceTask.getReporterId());
                newTask.setEstimatedHours(sourceTask.getEstimatedHours());
                newTask.setActualHours(sourceTask.getActualHours());
                newTask.setOrderIndex(sourceTask.getOrderIndex());
                newTask.setDueDate(sourceTask.getDueDate());
                newTask.setLabels(sourceTask.getLabels() != null ? 
                    new ArrayList<>(sourceTask.getLabels()) : new ArrayList<>());
                newTask.setIsPulledFromBacklog(true); // Mark as pulled (from previous sprint)
                newTask.setTaskNumber(sourceTask.getTaskNumber());
                
                // Create the task
                Task savedTask = taskService.createTask(newTask);
                tasksToCopy.add(savedTask);
                
                // Log task creation activity
                if (activityLogService != null && userId != null) {
                    Map<String, Object> taskDetails = new HashMap<>();
                    taskDetails.put("taskId", savedTask.getId());
                    taskDetails.put("title", savedTask.getTitle());
                    taskDetails.put("status", savedTask.getStatus().getValue());
                    taskDetails.put("storyId", savedStory.getId());
                    taskDetails.put("targetSprintId", targetSprintId);
                    taskDetails.put("sourceSprintId", sourceSprintId);
                    taskDetails.put("estimatedHours", savedTask.getEstimatedHours());
                    taskDetails.put("actualHours", savedTask.getActualHours());
                    taskDetails.put("dueDate", savedTask.getDueDate());
                    taskDetails.put("isPulledFromBacklog", true);
                    taskDetails.put("originalTaskId", sourceTask.getId());
                    taskDetails.put("column", savedTask.getStatus().getValue());
                    taskDetails.put("createdAt", LocalDateTime.now());
                    
                    activityLogService.logActivity(
                        userId,
                        "task",
                        savedTask.getId(),
                        "pulled_to_sprint",
                        String.format("Task '%s' pulled from previous sprint '%s' to sprint '%s'. Status: %s, Column: %s, Estimated: %s, Actual: %s, Due Date: %s",
                            savedTask.getTitle(),
                            sourceSprintId != null ? sourceSprintId : "N/A",
                            targetSprintId,
                            savedTask.getStatus().getValue(),
                            savedTask.getStatus().getValue(),
                            savedTask.getEstimatedHours() != null ? savedTask.getEstimatedHours().toString() : "N/A",
                            savedTask.getActualHours() != null ? savedTask.getActualHours().toString() : "0",
                            savedTask.getDueDate() != null ? savedTask.getDueDate().toString() : "N/A"),
                        null,
                        taskDetails
                    );
                }
            }
        }
        
        // Log story creation activity
        if (activityLogService != null && userId != null) {
            Map<String, Object> storyDetails = new HashMap<>();
            storyDetails.put("storyId", savedStory.getId());
            storyDetails.put("title", savedStory.getTitle());
            storyDetails.put("targetSprintId", targetSprintId);
            storyDetails.put("sourceSprintId", sourceSprintId);
            storyDetails.put("originalStoryId", sourceStoryId);
            storyDetails.put("tasksCopied", tasksToCopy.size());
            storyDetails.put("createdAt", LocalDateTime.now());
            
            Map<String, Object> oldStoryDetails = new HashMap<>();
            oldStoryDetails.put("storyId", sourceStory.getId());
            oldStoryDetails.put("title", sourceStory.getTitle());
            oldStoryDetails.put("sprintId", sourceStory.getSprintId());
            oldStoryDetails.put("status", sourceStory.getStatus().getValue());
            
            activityLogService.logActivity(
                userId,
                "story",
                savedStory.getId(),
                "pulled_to_sprint",
                String.format("Story '%s' pulled from sprint '%s' to sprint '%s'. Copied %d tasks (overdue, in-progress, and incomplete).",
                    savedStory.getTitle(),
                    sourceSprintId != null ? sourceSprintId : "N/A",
                    targetSprintId,
                    tasksToCopy.size()),
                oldStoryDetails,
                storyDetails
            );
        }
        
        return savedStory;
    }
    
}






