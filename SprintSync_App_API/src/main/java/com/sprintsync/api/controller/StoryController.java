package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Story;
import com.sprintsync.api.entity.enums.StoryPriority;
import com.sprintsync.api.entity.enums.StoryStatus;
import com.sprintsync.api.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * REST Controller for Story entity operations.
 * Provides endpoints for story management operations.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = "*")
public class StoryController {

    private final StoryService storyService;

    @Autowired
    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    /**
     * Create a new story.
     * 
     * @param story the story to create
     * @return ResponseEntity containing the created story
     */
    @PostMapping
    public ResponseEntity<Story> createStory(@RequestBody Story story) {
        try {
            Story createdStory = storyService.createStory(story);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStory);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get story by ID.
     * 
     * @param id the story ID
     * @return ResponseEntity containing the story if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<Story> getStoryById(@PathVariable String id) {
        Optional<Story> story = storyService.findById(id);
        return story.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all stories with pagination.
     * 
     * @param page page number (default: 0)
     * @param size page size (default: 10)
     * @param sortBy sort field (default: title)
     * @param sortDir sort direction (default: asc)
     * @return ResponseEntity containing page of stories
     */
    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<Story>> getAllStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        org.springframework.data.domain.Page<Story> stories = storyService.getAllStories(page, size, sortBy, sortDir);
        return ResponseEntity.ok(stories);
    }

    /**
     * Get all stories without pagination.
     * 
     * @return ResponseEntity containing list of all stories
     */
    @GetMapping("/all")
    public ResponseEntity<List<Story>> getAllStoriesList() {
        List<Story> stories = storyService.getAllStories();
        return ResponseEntity.ok(stories);
    }

    /**
     * Get stories by project ID.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of stories for the project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Story>> getStoriesByProject(@PathVariable String projectId) {
        List<Story> stories = storyService.findStoriesByProject(projectId);
        return ResponseEntity.ok(stories);
    }

    /**
     * Get stories by sprint ID.
     * 
     * @param sprintId the sprint ID
     * @return ResponseEntity containing list of stories in the sprint
     */
    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<List<Story>> getStoriesBySprint(@PathVariable String sprintId) {
        List<Story> stories = storyService.findStoriesBySprint(sprintId);
        return ResponseEntity.ok(stories);
    }

    /**
     * Get stories by epic ID.
     * 
     * @param epicId the epic ID
     * @return ResponseEntity containing list of stories in the epic
     */
    @GetMapping("/epic/{epicId}")
    public ResponseEntity<List<Story>> getStoriesByEpic(@PathVariable String epicId) {
        List<Story> stories = storyService.findStoriesByEpic(epicId);
        return ResponseEntity.ok(stories);
    }

    /**
     * Get stories by release ID.
     * 
     * @param releaseId the release ID
     * @return ResponseEntity containing list of stories in the release
     */
    @GetMapping("/release/{releaseId}")
    public ResponseEntity<List<Story>> getStoriesByRelease(@PathVariable String releaseId) {
        List<Story> stories = storyService.findStoriesByRelease(releaseId);
        return ResponseEntity.ok(stories);
    }

    /**
     * Get stories by status.
     * 
     * @param status the story status
     * @return ResponseEntity containing list of stories with the status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Story>> getStoriesByStatus(@PathVariable StoryStatus status) {
        List<Story> stories = storyService.findStoriesByStatus(status);
        return ResponseEntity.ok(stories);
    }

    /**
     * Get stories by priority.
     * 
     * @param priority the story priority
     * @return ResponseEntity containing list of stories with the priority
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Story>> getStoriesByPriority(@PathVariable StoryPriority priority) {
        List<Story> stories = storyService.findStoriesByPriority(priority);
        return ResponseEntity.ok(stories);
    }

    /**
     * Get stories by assignee ID.
     * 
     * @param assigneeId the assignee ID
     * @return ResponseEntity containing list of stories assigned to the user
     */
    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<Story>> getStoriesByAssignee(@PathVariable String assigneeId) {
        List<Story> stories = storyService.findStoriesByAssignee(assigneeId);
        return ResponseEntity.ok(stories);
    }

    /**
     * Search stories by title.
     * 
     * @param title the title to search for
     * @return ResponseEntity containing list of stories with matching titles
     */
    @GetMapping("/search")
    public ResponseEntity<List<Story>> searchStoriesByTitle(@RequestParam String title) {
        List<Story> stories = storyService.searchStoriesByTitle(title);
        return ResponseEntity.ok(stories);
    }

    /**
     * Get unassigned stories.
     * 
     * @return ResponseEntity containing list of unassigned stories
     */
    @GetMapping("/unassigned")
    public ResponseEntity<List<Story>> getUnassignedStories() {
        List<Story> stories = storyService.findUnassignedStories();
        return ResponseEntity.ok(stories);
    }

    /**
     * Get stories exceeding estimated hours.
     * 
     * @return ResponseEntity containing list of stories exceeding estimated hours
     */
    @GetMapping("/exceeding-hours")
    public ResponseEntity<List<Story>> getStoriesExceedingEstimatedHours() {
        List<Story> stories = storyService.findStoriesExceedingEstimatedHours();
        return ResponseEntity.ok(stories);
    }

    /**
     * Get stories by multiple criteria.
     * 
     * @param projectId the project ID (optional)
     * @param sprintId the sprint ID (optional)
     * @param epicId the epic ID (optional)
     * @param status the story status (optional)
     * @param priority the story priority (optional)
     * @param assigneeId the assignee ID (optional)
     * @return ResponseEntity containing list of stories matching the criteria
     */
    @GetMapping("/criteria")
    public ResponseEntity<List<Story>> getStoriesByCriteria(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String sprintId,
            @RequestParam(required = false) String epicId,
            @RequestParam(required = false) StoryStatus status,
            @RequestParam(required = false) StoryPriority priority,
            @RequestParam(required = false) String assigneeId) {
        
        List<Story> stories = storyService.findStoriesByCriteria(projectId, sprintId, epicId, status, priority, assigneeId);
        return ResponseEntity.ok(stories);
    }

    /**
     * Update an existing story.
     * 
     * @param id the story ID
     * @param storyDetails the updated story details
     * @return ResponseEntity containing the updated story
     */
    @PutMapping("/{id}")
    public ResponseEntity<Story> updateStory(@PathVariable String id, @RequestBody Story storyDetails) {
        try {
            storyDetails.setId(id);
            Story updatedStory = storyService.updateStory(storyDetails);
            return ResponseEntity.ok(updatedStory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update story status.
     * 
     * @param id the story ID
     * @param status the new status
     * @return ResponseEntity containing the updated story
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Story> updateStoryStatus(@PathVariable String id, @RequestParam StoryStatus status) {
        try {
            Story updatedStory = storyService.updateStoryStatus(id, status);
            return ResponseEntity.ok(updatedStory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Assign story to user.
     * 
     * @param id the story ID
     * @param assigneeId the assignee ID
     * @return ResponseEntity containing the updated story
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<Story> assignStory(@PathVariable String id, @RequestParam String assigneeId) {
        try {
            Story updatedStory = storyService.assignStory(id, assigneeId);
            return ResponseEntity.ok(updatedStory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Move story to sprint.
     * 
     * @param id the story ID
     * @param sprintId the sprint ID
     * @return ResponseEntity containing the updated story
     */
    @PatchMapping("/{id}/move-to-sprint")
    public ResponseEntity<Story> moveStoryToSprint(@PathVariable String id, @RequestParam String sprintId) {
        try {
            Story updatedStory = storyService.moveStoryToSprint(id, sprintId);
            return ResponseEntity.ok(updatedStory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a story by ID.
     * 
     * @param id the story ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(@PathVariable String id) {
        try {
            storyService.deleteStory(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get stories without sprint assignment.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of stories without sprint
     */
    @GetMapping("/project/{projectId}/without-sprint")
    public ResponseEntity<List<Story>> getStoriesWithoutSprint(@PathVariable String projectId) {
        List<Story> stories = storyService.findStoriesWithoutSprint(projectId);
        return ResponseEntity.ok(stories);
    }

    /**
     * Get stories ordered by index for a sprint.
     * 
     * @param sprintId the sprint ID
     * @return ResponseEntity containing list of stories ordered by index
     */
    @GetMapping("/sprint/{sprintId}/ordered")
    public ResponseEntity<List<Story>> getStoriesBySprintOrdered(@PathVariable String sprintId) {
        List<Story> stories = storyService.getStoriesBySprintOrdered(sprintId);
        return ResponseEntity.ok(stories);
    }

    /**
     * Get story statistics for a project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing story statistics
     */
    @GetMapping("/project/{projectId}/stats")
    public ResponseEntity<String> getStoryStatistics(@PathVariable String projectId) {
        String stats = storyService.getStoryStatistics(projectId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get sprint statistics.
     * 
     * @param sprintId the sprint ID
     * @return ResponseEntity containing sprint statistics
     */
    @GetMapping("/sprint/{sprintId}/stats")
    public ResponseEntity<String> getSprintStatistics(@PathVariable String sprintId) {
        String stats = storyService.getSprintStatistics(sprintId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Create a new story from a previous sprint story with new ID and copy only overdue, in-progress, and incomplete tasks.
     * 
     * @param sourceStoryId the source story ID to duplicate (from previous sprint)
     * @param targetSprintId the target sprint ID to assign the new story to
     * @param userId the user ID performing the action (for activity logging)
     * @return ResponseEntity containing the newly created story
     */
    @PostMapping("/from-sprint")
    public ResponseEntity<Story> createStoryFromPreviousSprint(
            @RequestParam String sourceStoryId,
            @RequestParam String targetSprintId,
            @RequestParam String userId) {
        try {
            Story createdStory = storyService.createStoryFromPreviousSprint(sourceStoryId, targetSprintId, userId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdStory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}



