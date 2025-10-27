package com.sprintsync.api.service;

import com.sprintsync.api.entity.Subtask;
import com.sprintsync.api.repository.SubtaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for Subtask management operations.
 * Provides business logic for Subtask entities.
 * 
 * @author Mayuresh G
 */
@Service
public class SubtaskService {

    @Autowired
    private SubtaskRepository subtaskRepository;

    @Autowired
    private IdGenerationService idGenerationService;

    /**
     * Get all subtasks with pagination
     */
    public Page<Subtask> getAllSubtasks(Pageable pageable) {
        return subtaskRepository.findAll(pageable);
    }

    /**
     * Get subtask by ID
     */
    public Subtask getSubtaskById(String id) {
        return subtaskRepository.findById(id).orElse(null);
    }

    /**
     * Create a new subtask
     */
    public Subtask createSubtask(Subtask subtask) {
        if (subtask.getId() == null) {
            subtask.setId(idGenerationService.generateSubtaskId());
        }
        subtask.setCreatedAt(LocalDateTime.now());
        subtask.setUpdatedAt(LocalDateTime.now());
        return subtaskRepository.save(subtask);
    }

    /**
     * Update an existing subtask
     */
    public Subtask updateSubtask(Subtask subtask) {
        if (subtaskRepository.existsById(subtask.getId())) {
            subtask.setUpdatedAt(LocalDateTime.now());
            return subtaskRepository.save(subtask);
        }
        return null;
    }

    /**
     * Delete a subtask
     */
    public boolean deleteSubtask(String id) {
        if (subtaskRepository.existsById(id)) {
            subtaskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get subtasks by task ID
     */
    public List<Subtask> getSubtasksByTaskId(String taskId) {
        return subtaskRepository.findByTaskId(taskId);
    }

    /**
     * Get subtasks by assignee ID
     */
    public List<Subtask> getSubtasksByAssigneeId(String assigneeId) {
        return subtaskRepository.findByAssigneeId(assigneeId);
    }

    /**
     * Get subtasks by completion status
     */
    public List<Subtask> getSubtasksByCompletionStatus(boolean isCompleted) {
        return subtaskRepository.findByIsCompleted(isCompleted);
    }

    /**
     * Update subtask completion status (using isCompleted field)
     */
    public Subtask updateSubtaskCompletion(String id, boolean isCompleted) {
        Optional<Subtask> optionalSubtask = subtaskRepository.findById(id);
        if (optionalSubtask.isPresent()) {
            Subtask subtask = optionalSubtask.get();
            subtask.setIsCompleted(isCompleted);
            subtask.setUpdatedAt(LocalDateTime.now());
            return subtaskRepository.save(subtask);
        }
        return null;
    }

    /**
     * Assign subtask to user
     */
    public Subtask assignSubtask(String id, String assigneeId) {
        Optional<Subtask> optionalSubtask = subtaskRepository.findById(id);
        if (optionalSubtask.isPresent()) {
            Subtask subtask = optionalSubtask.get();
            subtask.setAssigneeId(assigneeId);
            subtask.setUpdatedAt(LocalDateTime.now());
            return subtaskRepository.save(subtask);
        }
        return null;
    }

    /**
     * Update subtask actual hours (for effort logging)
     */
    public Subtask updateSubtaskActualHours(String id, java.math.BigDecimal actualHours) {
        Optional<Subtask> optionalSubtask = subtaskRepository.findById(id);
        if (optionalSubtask.isPresent()) {
            Subtask subtask = optionalSubtask.get();
            subtask.setActualHours(actualHours);
            subtask.setUpdatedAt(LocalDateTime.now());
            return subtaskRepository.save(subtask);
        }
        return null;
    }

    /**
     * Get subtask statistics
     */
    public Map<String, Object> getSubtaskStatistics() {
        List<Subtask> allSubtasks = subtaskRepository.findAll();
        
        Map<String, Object> statistics = new HashMap<>();
        statistics.put("totalSubtasks", allSubtasks.size());
        
        Map<String, Long> completionCount = allSubtasks.stream()
            .collect(Collectors.groupingBy(subtask -> subtask.getIsCompleted() ? "completed" : "pending", Collectors.counting()));
        statistics.put("completionCount", completionCount);
        
        // Unassigned subtasks
        long unassignedSubtasks = allSubtasks.stream()
            .filter(subtask -> subtask.getAssigneeId() == null || subtask.getAssigneeId().isEmpty())
            .count();
        statistics.put("unassignedSubtasks", unassignedSubtasks);
        
        // Overdue subtasks
        long overdueSubtasks = allSubtasks.stream()
            .filter(subtask -> subtask.getDueDate() != null && subtask.getDueDate().isBefore(LocalDateTime.now().toLocalDate()))
            .filter(subtask -> !subtask.getIsCompleted())
            .count();
        statistics.put("overdueSubtasks", overdueSubtasks);
        
        return statistics;
    }

    /**
     * Get subtask progress by task
     */
    public Map<String, Object> getSubtaskProgressByTask(String taskId) {
        List<Subtask> subtasks = getSubtasksByTaskId(taskId);
        
        Map<String, Object> progress = new HashMap<>();
        progress.put("totalSubtasks", subtasks.size());
        
        if (subtasks.isEmpty()) {
            progress.put("completionPercentage", 0.0);
            progress.put("statusCount", new HashMap<>());
            return progress;
        }
        
        Map<String, Long> completionCount = subtasks.stream()
            .collect(Collectors.groupingBy(subtask -> subtask.getIsCompleted() ? "completed" : "pending", Collectors.counting()));
        progress.put("completionCount", completionCount);
        
        long completedSubtasks = completionCount.getOrDefault("completed", 0L);
        double completionPercentage = (double) completedSubtasks / subtasks.size() * 100;
        progress.put("completionPercentage", Math.round(completionPercentage * 100.0) / 100.0);
        
        return progress;
    }

    /**
     * Search subtasks by title or description
     */
    public List<Subtask> searchSubtasks(String query) {
        return subtaskRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }

    /**
     * Bulk update subtask status
     */
    public List<Subtask> bulkUpdateSubtaskCompletion(List<String> subtaskIds, Boolean isCompleted) {
        List<Subtask> updatedSubtasks = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (String subtaskId : subtaskIds) {
            Optional<Subtask> optionalSubtask = subtaskRepository.findById(subtaskId);
            if (optionalSubtask.isPresent()) {
                Subtask subtask = optionalSubtask.get();
                subtask.setIsCompleted(isCompleted);
                subtask.setUpdatedAt(now);
                updatedSubtasks.add(subtaskRepository.save(subtask));
            }
        }
        
        return updatedSubtasks;
    }

    /**
     * Get subtasks by priority
     */
    public List<Subtask> getSubtasksByPriority(String priority) {
        // Note: Subtask entity doesn't have priority field in current database schema
        return Collections.emptyList();
    }

    /**
     * Get subtasks by story ID
     */
    public List<Subtask> getSubtasksByStoryId(String storyId) {
        // Note: Subtask entity doesn't have storyId field - subtasks are related to stories through tasks
        // This would need to be implemented by finding tasks by storyId first, then subtasks by taskId
        return Collections.emptyList();
    }

    /**
     * Get subtasks by sprint ID
     */
    public List<Subtask> getSubtasksBySprintId(String sprintId) {
        // Note: Subtask entity doesn't have sprintId field - subtasks are related to sprints through tasks and stories
        // This would need to be implemented by finding tasks by sprintId first, then subtasks by taskId
        return Collections.emptyList();
    }

    /**
     * Get subtasks by project ID
     */
    public List<Subtask> getSubtasksByProjectId(String projectId) {
        // Note: Subtask entity doesn't have projectId field - subtasks are related to projects through tasks and stories
        // This would need to be implemented by finding stories by projectId first, then tasks by storyId, then subtasks by taskId
        return Collections.emptyList();
    }

    /**
     * Get unassigned subtasks
     */
    public List<Subtask> getUnassignedSubtasks() {
        return subtaskRepository.findUnassignedSubtasks();
    }

    /**
     * Get subtasks due soon
     */
    public List<Subtask> getSubtasksDueSoon(int days) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueSoon = now.plusDays(days);
        
        return subtaskRepository.findAll().stream()
            .filter(subtask -> subtask.getDueDate() != null)
            .filter(subtask -> subtask.getDueDate().isAfter(now.toLocalDate()) && subtask.getDueDate().isBefore(dueSoon.toLocalDate()))
            .filter(subtask -> !subtask.getIsCompleted())
            .collect(Collectors.toList());
    }

    /**
     * Get overdue subtasks
     */
    public List<Subtask> getOverdueSubtasks() {
        LocalDateTime now = LocalDateTime.now();
        return subtaskRepository.findAll().stream()
            .filter(subtask -> subtask.getDueDate() != null && subtask.getDueDate().isBefore(now.toLocalDate()))
            .filter(subtask -> !subtask.getIsCompleted())
            .collect(Collectors.toList());
    }

    /**
     * Get subtasks by effort range
     */
    public List<Subtask> getSubtasksByEffortRange(Integer minEffort, Integer maxEffort) {
        // Note: Subtask entity doesn't have estimatedEffort field in current database schema
        return Collections.emptyList();
    }

    /**
     * Get subtasks with time tracking
     */
    public List<Subtask> getSubtasksWithTimeTracking() {
        // Note: Subtask entity doesn't have time tracking fields in current database schema
        return Collections.emptyList();
    }

    /**
     * Get subtask dependencies (placeholder - dependencies field not in database)
     */
    public List<Subtask> getSubtaskDependencies(String id) {
        // Dependencies field not available in current database schema
        return Collections.emptyList();
    }

    /**
     * Add dependency to subtask (placeholder - dependencies field not in database)
     */
    public Subtask addSubtaskDependency(String id, String dependencyId) {
        // Dependencies field not available in current database schema
        return null;
    }

    /**
     * Remove dependency from subtask
     */
    public Subtask removeSubtaskDependency(String id, String dependencyId) {
        // Dependencies field not available in current database schema
        return null;
    }

    /**
     * Get subtask count by status
     */
    public long getSubtaskCountByCompletion(Boolean isCompleted) {
        return subtaskRepository.countByIsCompleted(isCompleted);
    }

    /**
     * Get subtask count by priority
     */
    public long getSubtaskCountByPriority(String priority) {
        // Note: Subtask entity doesn't have priority field in current database schema
        return 0;
    }

    /**
     * Get subtask count by assignee
     */
    public long getSubtaskCountByAssignee(String assigneeId) {
        return subtaskRepository.countByAssigneeId(assigneeId);
    }

    /**
     * Get subtask count by task
     */
    public long getSubtaskCountByTask(String taskId) {
        return subtaskRepository.countByTaskId(taskId);
    }

    /**
     * Get recently created subtasks
     */
    public List<Subtask> getRecentSubtasks(int limit) {
        return subtaskRepository.findAll()
            .stream()
            .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
            .limit(limit)
            .collect(Collectors.toList());
    }

    /**
     * Get subtasks by epic ID
     */
    public List<Subtask> getSubtasksByEpicId(String epicId) {
        // Note: Subtask entity doesn't have epicId field - subtasks are related to epics through tasks and stories
        // This would need to be implemented by finding stories by epicId first, then tasks by storyId, then subtasks by taskId
        return Collections.emptyList();
    }

    /**
     * Get subtasks by release ID
     */
    public List<Subtask> getSubtasksByReleaseId(String releaseId) {
        // Note: Subtask entity doesn't have releaseId field - subtasks are related to releases through tasks and stories
        // This would need to be implemented by finding stories by releaseId first, then tasks by storyId, then subtasks by taskId
        return Collections.emptyList();
    }
}
