package com.sprintsync.api.service;

import com.sprintsync.api.entity.*;
import com.sprintsync.api.entity.enums.StoryStatus;
import com.sprintsync.api.entity.enums.TaskStatus;
import com.sprintsync.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Service class for managing project backlog.
 * Handles moving incomplete stories and tasks to backlog when sprints end,
 * and cloning stories from backlog to new sprints with new IDs.
 * 
 * @author SprintSync Team
 */
@Service
@Transactional
public class BacklogService {

    @Autowired
    private BacklogStoryRepository backlogStoryRepository;

    @Autowired
    private BacklogTaskRepository backlogTaskRepository;

    @Autowired
    private BacklogSubtaskRepository backlogSubtaskRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private SubtaskRepository subtaskRepository;

    @Autowired
    private IdGenerationService idGenerationService;

    @Autowired
    private TaskService taskService;

    @Autowired
    private SubtaskService subtaskService;

    /**
     * Move incomplete stories and tasks from a sprint to backlog when sprint ends.
     * Only stories with incomplete (not done) tasks or overdue tasks are moved.
     * 
     * @param sprintId the sprint ID that has ended
     * @return list of backlog stories created
     */
    @Transactional
    public List<BacklogStory> moveSprintToBacklog(String sprintId) {
        List<BacklogStory> createdBacklogStories = new ArrayList<>();
        
        // Get all stories from the sprint
        List<Story> sprintStories = storyRepository.findBySprintId(sprintId);
        
        LocalDate today = LocalDate.now();
        
        for (Story story : sprintStories) {
            // Get all tasks for this story
            List<Task> storyTasks = taskRepository.findByStoryId(story.getId());
            
            // Filter incomplete tasks: not done, in-progress, or overdue
            List<Task> incompleteTasks = new ArrayList<>();
            
            for (Task task : storyTasks) {
                boolean isOverdue = task.getDueDate() != null && task.getDueDate().isBefore(today);
                boolean isIncomplete = task.getStatus() != TaskStatus.DONE && 
                                       task.getStatus() != TaskStatus.CANCELLED;
                
                if (isIncomplete || isOverdue) {
                    incompleteTasks.add(task);
                }
            }
            
            // Only move story to backlog if it has incomplete tasks
            if (!incompleteTasks.isEmpty()) {
                // Create backlog story
                BacklogStory backlogStory = new BacklogStory();
                backlogStory.setId(idGenerationService.generateStoryId());
                backlogStory.setProjectId(story.getProjectId());
                backlogStory.setOriginalStoryId(story.getId());
                backlogStory.setOriginalSprintId(sprintId);
                backlogStory.setTitle(story.getTitle());
                backlogStory.setDescription(story.getDescription());
                backlogStory.setAcceptanceCriteria(story.getAcceptanceCriteria() != null ? 
                    new ArrayList<>(story.getAcceptanceCriteria()) : new ArrayList<>());
                backlogStory.setStatus(StoryStatus.BACKLOG);
                backlogStory.setPriority(story.getPriority());
                backlogStory.setStoryPoints(story.getStoryPoints());
                backlogStory.setAssigneeId(story.getAssigneeId());
                backlogStory.setReporterId(story.getReporterId());
                backlogStory.setEpicId(story.getEpicId());
                backlogStory.setReleaseId(story.getReleaseId());
                backlogStory.setLabels(story.getLabels() != null ? 
                    new ArrayList<>(story.getLabels()) : new ArrayList<>());
                backlogStory.setOrderIndex(story.getOrderIndex());
                backlogStory.setEstimatedHours(story.getEstimatedHours());
                backlogStory.setActualHours(story.getActualHours());
                backlogStory.setCreatedFromSprintId(sprintId);
                backlogStory.setCreatedAt(LocalDateTime.now());
                backlogStory.setUpdatedAt(LocalDateTime.now());
                
                BacklogStory savedBacklogStory = backlogStoryRepository.save(backlogStory);
                
                // Create backlog tasks for incomplete tasks
                for (Task task : incompleteTasks) {
                    BacklogTask backlogTask = new BacklogTask();
                    backlogTask.setId(idGenerationService.generateTaskId());
                    backlogTask.setBacklogStoryId(savedBacklogStory.getId());
                    backlogTask.setOriginalTaskId(task.getId());
                    backlogTask.setTitle(task.getTitle());
                    backlogTask.setDescription(task.getDescription());
                    backlogTask.setStatus(task.getStatus());
                    backlogTask.setPriority(task.getPriority());
                    backlogTask.setAssigneeId(task.getAssigneeId());
                    backlogTask.setReporterId(task.getReporterId());
                    backlogTask.setEstimatedHours(task.getEstimatedHours());
                    backlogTask.setActualHours(task.getActualHours());
                    backlogTask.setOrderIndex(task.getOrderIndex());
                    backlogTask.setTaskNumber(task.getTaskNumber());
                    backlogTask.setDueDate(task.getDueDate());
                    backlogTask.setLabels(task.getLabels() != null ? 
                        new ArrayList<>(task.getLabels()) : new ArrayList<>());
                    backlogTask.setIsOverdue(task.getDueDate() != null && 
                                            task.getDueDate().isBefore(today));
                    backlogTask.setCreatedAt(LocalDateTime.now());
                    backlogTask.setUpdatedAt(LocalDateTime.now());
                    
                    BacklogTask savedBacklogTask = backlogTaskRepository.save(backlogTask);
                    
                    // Copy subtasks for this task
                    List<Subtask> subtasks = subtaskRepository.findByTaskId(task.getId());
                    for (Subtask subtask : subtasks) {
                        // Only copy incomplete subtasks
                        if (!subtask.getIsCompleted()) {
                            BacklogSubtask backlogSubtask = new BacklogSubtask();
                            backlogSubtask.setId(idGenerationService.generateSubtaskId());
                            backlogSubtask.setBacklogTaskId(savedBacklogTask.getId());
                            backlogSubtask.setOriginalSubtaskId(subtask.getId());
                            backlogSubtask.setTitle(subtask.getTitle());
                            backlogSubtask.setDescription(subtask.getDescription());
                            backlogSubtask.setIsCompleted(false);
                            backlogSubtask.setAssigneeId(subtask.getAssigneeId());
                            backlogSubtask.setEstimatedHours(subtask.getEstimatedHours());
                            backlogSubtask.setActualHours(subtask.getActualHours());
                            backlogSubtask.setOrderIndex(subtask.getOrderIndex());
                            backlogSubtask.setDueDate(subtask.getDueDate());
                            backlogSubtask.setBugType(subtask.getBugType());
                            backlogSubtask.setSeverity(subtask.getSeverity());
                            backlogSubtask.setCategory(subtask.getCategory());
                            backlogSubtask.setLabels(subtask.getLabels() != null ? 
                                new ArrayList<>(subtask.getLabels()) : new ArrayList<>());
                            backlogSubtask.setCreatedAt(LocalDateTime.now());
                            backlogSubtask.setUpdatedAt(LocalDateTime.now());
                            
                            backlogSubtaskRepository.save(backlogSubtask);
                        }
                    }
                }
                
                createdBacklogStories.add(savedBacklogStory);
            }
        }
        
        return createdBacklogStories;
    }

    /**
     * Clone a story from backlog to a new sprint with new IDs.
     * This creates new Story, Task, and Subtask entities with new IDs.
     * The original backlog story and tasks remain unchanged.
     * 
     * @param backlogStoryId the backlog story ID to clone
     * @param targetSprintId the target sprint ID
     * @return the newly created story with all tasks and subtasks
     */
    @Transactional
    public Story cloneStoryFromBacklog(String backlogStoryId, String targetSprintId) {
        // Get the backlog story
        BacklogStory backlogStory = backlogStoryRepository.findById(backlogStoryId)
            .orElseThrow(() -> new IllegalArgumentException("Backlog story not found with ID: " + backlogStoryId));
        
        // Create new story with new ID
        Story newStory = new Story();
        newStory.setId(idGenerationService.generateStoryId());
        newStory.setProjectId(backlogStory.getProjectId());
        newStory.setSprintId(targetSprintId);
        
        // Set parentId to reference the original story if it exists
        String parentId = backlogStory.getOriginalStoryId();
        if (parentId != null && !parentId.isEmpty()) {
            newStory.setParentId(parentId);
        } else {
            // If no original story, use the backlog story itself as parent reference
            String backlogId = backlogStory.getId();
            if (backlogId != null && !backlogId.isEmpty()) {
                newStory.setParentId(backlogId);
            }
        }
        
        newStory.setTitle(backlogStory.getTitle());
        newStory.setDescription(backlogStory.getDescription());
        newStory.setAcceptanceCriteria(backlogStory.getAcceptanceCriteria() != null ? 
            new ArrayList<>(backlogStory.getAcceptanceCriteria()) : new ArrayList<>());
        newStory.setStatus(StoryStatus.TODO); // Reset to TODO when cloned to new sprint
        newStory.setPriority(backlogStory.getPriority());
        newStory.setStoryPoints(backlogStory.getStoryPoints());
        newStory.setAssigneeId(backlogStory.getAssigneeId());
        newStory.setReporterId(backlogStory.getReporterId());
        newStory.setEpicId(backlogStory.getEpicId());
        newStory.setReleaseId(backlogStory.getReleaseId());
        newStory.setLabels(backlogStory.getLabels() != null ? 
            new ArrayList<>(backlogStory.getLabels()) : new ArrayList<>());
        newStory.setOrderIndex(backlogStory.getOrderIndex());
        newStory.setEstimatedHours(backlogStory.getEstimatedHours());
        newStory.setActualHours(BigDecimal.ZERO); // Reset actual hours
        
        Story savedStory = storyRepository.save(newStory);
        
        // Get all backlog tasks for this backlog story
        List<BacklogTask> backlogTasks = backlogTaskRepository.findByBacklogStoryId(backlogStoryId);
        
        // Clone all tasks with new IDs
        for (BacklogTask backlogTask : backlogTasks) {
            Task newTask = new Task();
            newTask.setId(idGenerationService.generateTaskId());
            newTask.setStoryId(savedStory.getId());
            newTask.setTitle(backlogTask.getTitle());
            newTask.setDescription(backlogTask.getDescription());
            newTask.setStatus(backlogTask.getStatus());
            newTask.setPriority(backlogTask.getPriority());
            newTask.setAssigneeId(backlogTask.getAssigneeId());
            newTask.setReporterId(backlogTask.getReporterId());
            newTask.setEstimatedHours(backlogTask.getEstimatedHours());
            newTask.setActualHours(backlogTask.getActualHours());
            newTask.setOrderIndex(backlogTask.getOrderIndex());
            newTask.setTaskNumber(backlogTask.getTaskNumber());
            newTask.setDueDate(backlogTask.getDueDate());
            newTask.setLabels(backlogTask.getLabels() != null ? 
                new ArrayList<>(backlogTask.getLabels()) : new ArrayList<>());
            newTask.setIsPulledFromBacklog(true);
            
            Task savedTask = taskService.createTask(newTask);
            
            // Get all backlog subtasks for this backlog task
            List<BacklogSubtask> backlogSubtasks = backlogSubtaskRepository.findByBacklogTaskId(backlogTask.getId());
            
            // Clone all subtasks with new IDs
            for (BacklogSubtask backlogSubtask : backlogSubtasks) {
                Subtask newSubtask = new Subtask();
                newSubtask.setId(idGenerationService.generateSubtaskId());
                newSubtask.setTaskId(savedTask.getId());
                newSubtask.setTitle(backlogSubtask.getTitle());
                newSubtask.setDescription(backlogSubtask.getDescription());
                newSubtask.setIsCompleted(backlogSubtask.getIsCompleted());
                newSubtask.setAssigneeId(backlogSubtask.getAssigneeId());
                newSubtask.setEstimatedHours(backlogSubtask.getEstimatedHours());
                newSubtask.setActualHours(backlogSubtask.getActualHours());
                newSubtask.setOrderIndex(backlogSubtask.getOrderIndex());
                newSubtask.setDueDate(backlogSubtask.getDueDate());
                newSubtask.setBugType(backlogSubtask.getBugType());
                newSubtask.setSeverity(backlogSubtask.getSeverity());
                newSubtask.setCategory(backlogSubtask.getCategory());
                List<String> subtaskLabels = backlogSubtask.getLabels();
                newSubtask.setLabels(subtaskLabels != null ? 
                    new ArrayList<>(subtaskLabels) : new ArrayList<>());
                
                subtaskService.createSubtask(newSubtask);
            }
        }
        
        return savedStory;
    }

    /**
     * Clone multiple stories from backlog to a new sprint.
     * 
     * @param backlogStoryIds list of backlog story IDs to clone
     * @param targetSprintId the target sprint ID
     * @return list of newly created stories
     */
    @Transactional
    public List<Story> cloneStoriesFromBacklog(List<String> backlogStoryIds, String targetSprintId) {
        List<Story> clonedStories = new ArrayList<>();
        
        for (String backlogStoryId : backlogStoryIds) {
            try {
                Story clonedStory = cloneStoryFromBacklog(backlogStoryId, targetSprintId);
                clonedStories.add(clonedStory);
            } catch (Exception e) {
                // Log error but continue with other stories
                System.err.println("Error cloning backlog story " + backlogStoryId + ": " + e.getMessage());
            }
        }
        
        return clonedStories;
    }

    /**
     * Get all backlog stories for a project.
     * 
     * @param projectId the project ID
     * @return list of backlog stories
     */
    @Transactional(readOnly = true)
    public List<BacklogStory> getBacklogStoriesByProject(String projectId) {
        return backlogStoryRepository.findByProjectId(projectId);
    }

    /**
     * Get a backlog story by ID.
     * 
     * @param backlogStoryId the backlog story ID
     * @return the backlog story
     */
    @Transactional(readOnly = true)
    public BacklogStory getBacklogStoryById(String backlogStoryId) {
        return backlogStoryRepository.findById(backlogStoryId)
            .orElseThrow(() -> new IllegalArgumentException("Backlog story not found with ID: " + backlogStoryId));
    }

    /**
     * Get all backlog tasks for a backlog story.
     * 
     * @param backlogStoryId the backlog story ID
     * @return list of backlog tasks
     */
    @Transactional(readOnly = true)
    public List<BacklogTask> getBacklogTasksByStory(String backlogStoryId) {
        return backlogTaskRepository.findByBacklogStoryId(backlogStoryId);
    }

    /**
     * Get all backlog subtasks for a backlog task.
     * 
     * @param backlogTaskId the backlog task ID
     * @return list of backlog subtasks
     */
    @Transactional(readOnly = true)
    public List<BacklogSubtask> getBacklogSubtasksByTask(String backlogTaskId) {
        return backlogSubtaskRepository.findByBacklogTaskId(backlogTaskId);
    }
}

