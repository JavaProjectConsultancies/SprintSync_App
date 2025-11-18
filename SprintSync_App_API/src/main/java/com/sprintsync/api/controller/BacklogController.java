package com.sprintsync.api.controller;

import com.sprintsync.api.entity.BacklogStory;
import com.sprintsync.api.entity.BacklogTask;
import com.sprintsync.api.entity.BacklogSubtask;
import com.sprintsync.api.entity.Story;
import com.sprintsync.api.service.BacklogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Backlog operations.
 * Handles moving stories to backlog when sprints end and cloning stories from backlog to new sprints.
 * 
 * @author SprintSync Team
 */
@RestController
@RequestMapping("/api/backlog")
@CrossOrigin(origins = "*")
public class BacklogController {

    @Autowired
    private BacklogService backlogService;

    /**
     * Move incomplete stories and tasks from a sprint to backlog when sprint ends.
     * 
     * @param sprintId the sprint ID that has ended
     * @return ResponseEntity containing list of backlog stories created
     */
    @PostMapping("/move-from-sprint/{sprintId}")
    public ResponseEntity<List<BacklogStory>> moveSprintToBacklog(@PathVariable String sprintId) {
        try {
            List<BacklogStory> backlogStories = backlogService.moveSprintToBacklog(sprintId);
            return ResponseEntity.status(HttpStatus.CREATED).body(backlogStories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all backlog stories for a project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of backlog stories
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<BacklogStory>> getBacklogStoriesByProject(@PathVariable String projectId) {
        try {
            List<BacklogStory> backlogStories = backlogService.getBacklogStoriesByProject(projectId);
            return ResponseEntity.ok(backlogStories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get a backlog story by ID.
     * 
     * @param backlogStoryId the backlog story ID
     * @return ResponseEntity containing the backlog story
     */
    @GetMapping("/stories/{backlogStoryId}")
    public ResponseEntity<BacklogStory> getBacklogStoryById(@PathVariable String backlogStoryId) {
        try {
            BacklogStory backlogStory = backlogService.getBacklogStoryById(backlogStoryId);
            return ResponseEntity.ok(backlogStory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all backlog tasks for a backlog story.
     * 
     * @param backlogStoryId the backlog story ID
     * @return ResponseEntity containing list of backlog tasks
     */
    @GetMapping("/stories/{backlogStoryId}/tasks")
    public ResponseEntity<List<BacklogTask>> getBacklogTasksByStory(@PathVariable String backlogStoryId) {
        try {
            List<BacklogTask> backlogTasks = backlogService.getBacklogTasksByStory(backlogStoryId);
            return ResponseEntity.ok(backlogTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all backlog subtasks for a backlog task.
     * 
     * @param backlogTaskId the backlog task ID
     * @return ResponseEntity containing list of backlog subtasks
     */
    @GetMapping("/tasks/{backlogTaskId}/subtasks")
    public ResponseEntity<List<BacklogSubtask>> getBacklogSubtasksByTask(@PathVariable String backlogTaskId) {
        try {
            List<BacklogSubtask> backlogSubtasks = backlogService.getBacklogSubtasksByTask(backlogTaskId);
            return ResponseEntity.ok(backlogSubtasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Clone a story from backlog to a new sprint with new IDs.
     * The original backlog story and tasks remain unchanged.
     * 
     * @param backlogStoryId the backlog story ID to clone
     * @param request body containing targetSprintId
     * @return ResponseEntity containing the newly created story
     */
    @PostMapping("/stories/{backlogStoryId}/clone-to-sprint")
    public ResponseEntity<Story> cloneStoryFromBacklog(
            @PathVariable String backlogStoryId,
            @RequestBody Map<String, String> request) {
        try {
            String targetSprintId = request.get("targetSprintId");
            if (targetSprintId == null || targetSprintId.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            Story clonedStory = backlogService.cloneStoryFromBacklog(backlogStoryId, targetSprintId);
            return ResponseEntity.status(HttpStatus.CREATED).body(clonedStory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Clone multiple stories from backlog to a new sprint.
     * 
     * @param request body containing targetSprintId and backlogStoryIds list
     * @return ResponseEntity containing list of newly created stories
     */
    @PostMapping("/clone-multiple-to-sprint")
    public ResponseEntity<List<Story>> cloneStoriesFromBacklog(@RequestBody Map<String, Object> request) {
        try {
            String targetSprintId = (String) request.get("targetSprintId");
            @SuppressWarnings("unchecked")
            List<String> backlogStoryIds = (List<String>) request.get("backlogStoryIds");
            
            if (targetSprintId == null || targetSprintId.isEmpty() || backlogStoryIds == null || backlogStoryIds.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            List<Story> clonedStories = backlogService.cloneStoriesFromBacklog(backlogStoryIds, targetSprintId);
            return ResponseEntity.status(HttpStatus.CREATED).body(clonedStories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

