package com.sprintsync.api.service;

import com.sprintsync.api.entity.Epic;
import com.sprintsync.api.entity.enums.EpicStatus;
import com.sprintsync.api.entity.enums.Priority;
import com.sprintsync.api.repository.EpicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
// import java.util.String; // Removed - using String IDs

/**
 * Service class for Epic entity operations.
 * Provides business logic for epic management operations.
 * 
 * @author Mayuresh G
 */
@Service
@Transactional
public class EpicService {

    private final EpicRepository epicRepository;

    @Autowired
    public EpicService(EpicRepository epicRepository) {
        this.epicRepository = epicRepository;
    }

    /**
     * Create a new epic.
     * 
     * @param epic the epic to create
     * @return the created epic
     */
    public Epic createEpic(Epic epic) {
        // Set default values if not provided
        if (epic.getProgress() == null) {
            epic.setProgress(0);
        }
        if (epic.getStoryPoints() == null) {
            epic.setStoryPoints(0);
        }
        if (epic.getCompletedStoryPoints() == null) {
            epic.setCompletedStoryPoints(0);
        }
        return epicRepository.save(epic);
    }

    /**
     * Find epic by ID.
     * 
     * @param id the epic ID
     * @return Optional containing the epic if found
     */
    @Transactional(readOnly = true)
    public Optional<Epic> findById(String id) {
        return epicRepository.findById(id);
    }

    /**
     * Update an existing epic.
     * 
     * @param epic the epic to update
     * @return the updated epic
     * @throws IllegalArgumentException if epic not found
     */
    public Epic updateEpic(Epic epic) {
        if (!epicRepository.existsById(epic.getId())) {
            throw new IllegalArgumentException("Epic not found with ID: " + epic.getId());
        }
        return epicRepository.save(epic);
    }

    /**
     * Delete an epic by ID.
     * 
     * @param id the epic ID
     * @throws IllegalArgumentException if epic not found
     */
    public void deleteEpic(String id) {
        if (!epicRepository.existsById(id)) {
            throw new IllegalArgumentException("Epic not found with ID: " + id);
        }
        epicRepository.deleteById(id);
    }

    /**
     * Get all epics.
     * 
     * @return list of all epics
     */
    @Transactional(readOnly = true)
    public List<Epic> getAllEpics() {
        return epicRepository.findAll();
    }

    /**
     * Get all epics with pagination.
     * 
     * @param pageable pagination information
     * @return page of epics
     */
    @Transactional(readOnly = true)
    public Page<Epic> getAllEpics(Pageable pageable) {
        return epicRepository.findAll(pageable);
    }

    /**
     * Find epics by project.
     * 
     * @param projectId the project ID
     * @return list of epics in the specified project
     */
    @Transactional(readOnly = true)
    public List<Epic> findEpicsByProject(String projectId) {
        return epicRepository.findByProjectId(projectId);
    }

    /**
     * Find epics by project with pagination.
     * 
     * @param projectId the project ID
     * @param pageable pagination information
     * @return page of epics in the specified project
     */
    @Transactional(readOnly = true)
    public Page<Epic> findEpicsByProject(String projectId, Pageable pageable) {
        return epicRepository.findByProjectId(projectId, pageable);
    }

    /**
     * Find epics by status.
     * 
     * @param status the epic status
     * @return list of epics with the specified status
     */
    @Transactional(readOnly = true)
    public List<Epic> findEpicsByStatus(EpicStatus status) {
        return epicRepository.findByStatus(status);
    }

    /**
     * Find epics by status with pagination.
     * 
     * @param status the epic status
     * @param pageable pagination information
     * @return page of epics with the specified status
     */
    @Transactional(readOnly = true)
    public Page<Epic> findEpicsByStatus(EpicStatus status, Pageable pageable) {
        return epicRepository.findByStatus(status, pageable);
    }

    /**
     * Find epics by priority.
     * 
     * @param priority the epic priority
     * @return list of epics with the specified priority
     */
    @Transactional(readOnly = true)
    public List<Epic> findEpicsByPriority(Priority priority) {
        return epicRepository.findByPriority(priority);
    }

    /**
     * Find epics by assignee.
     * 
     * @param assigneeId the assignee ID
     * @return list of epics assigned to the specified user
     */
    @Transactional(readOnly = true)
    public List<Epic> findEpicsByAssignee(String assigneeId) {
        return epicRepository.findByAssigneeId(assigneeId);
    }

    /**
     * Find epics by owner.
     * 
     * @param ownerId the owner ID
     * @return list of epics owned by the specified user
     */
    @Transactional(readOnly = true)
    public List<Epic> findEpicsByOwner(String ownerId) {
        return epicRepository.findByOwner(ownerId);
    }

    /**
     * Search epics by title.
     * 
     * @param title the title to search for
     * @return list of epics with titles containing the search term
     */
    @Transactional(readOnly = true)
    public List<Epic> searchEpicsByTitle(String title) {
        return epicRepository.findByTitleContainingIgnoreCase(title);
    }

    /**
     * Find epics by theme.
     * 
     * @param theme the epic theme
     * @return list of epics with the specified theme
     */
    @Transactional(readOnly = true)
    public List<Epic> findEpicsByTheme(String theme) {
        return epicRepository.findByTheme(theme);
    }

    /**
     * Find epics by multiple criteria.
     * 
     * @param projectId the project ID (optional)
     * @param status the epic status (optional)
     * @param priority the epic priority (optional)
     * @param assigneeId the assignee ID (optional)
     * @return list of epics matching the criteria
     */
    @Transactional(readOnly = true)
    public List<Epic> findEpicsByCriteria(String projectId, EpicStatus status, Priority priority, String assigneeId) {
        return epicRepository.findEpicsByCriteria(projectId, status, priority, assigneeId);
    }

    /**
     * Find active epics by project.
     * 
     * @param projectId the project ID
     * @return list of active epics in the specified project
     */
    @Transactional(readOnly = true)
    public List<Epic> findActiveEpicsByProject(String projectId) {
        return epicRepository.findActiveEpicsByProject(projectId);
    }

    /**
     * Find epics by assignee and status.
     * 
     * @param assigneeId the assignee ID
     * @param status the epic status
     * @return list of epics assigned to user with specified status
     */
    @Transactional(readOnly = true)
    public List<Epic> findEpicsByAssigneeAndStatus(String assigneeId, EpicStatus status) {
        return epicRepository.findEpicsByAssigneeAndStatus(assigneeId, status);
    }

    /**
     * Find epics by date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of epics within the specified date range
     */
    @Transactional(readOnly = true)
    public List<Epic> findEpicsByDateRange(LocalDate startDate, LocalDate endDate) {
        return epicRepository.findEpicsByDateRange(startDate, endDate);
    }

    /**
     * Count epics by status in project.
     * 
     * @param projectId the project ID
     * @param status the epic status
     * @return count of epics with the specified status in project
     */
    @Transactional(readOnly = true)
    public long countEpicsByProjectIdAndStatus(String projectId, EpicStatus status) {
        return epicRepository.countByProjectIdAndStatus(projectId, status);
    }

    /**
     * Find overdue epics.
     * 
     * @return list of overdue epics
     */
    @Transactional(readOnly = true)
    public List<Epic> findOverdueEpics() {
        return epicRepository.findOverdueEpics(LocalDate.now());
    }

    /**
     * Get total story points by project.
     * 
     * @param projectId the project ID
     * @return total story points for the project
     */
    @Transactional(readOnly = true)
    public Long getTotalStoryPointsByProject(String projectId) {
        return epicRepository.getTotalStoryPointsByProject(projectId);
    }

    /**
     * Get completed story points by project.
     * 
     * @param projectId the project ID
     * @return total completed story points for the project
     */
    @Transactional(readOnly = true)
    public Long getCompletedStoryPointsByProject(String projectId) {
        return epicRepository.getCompletedStoryPointsByProject(projectId);
    }

    /**
     * Update epic status.
     * 
     * @param epicId the epic ID
     * @param status the new status
     * @throws IllegalArgumentException if epic not found
     */
    public void updateEpicStatus(String epicId, EpicStatus status) {
        Optional<Epic> epicOptional = epicRepository.findById(epicId);
        if (epicOptional.isPresent()) {
            Epic epic = epicOptional.get();
            epic.setStatus(status);
            
            // Set completion date if status is completed
            if (status == EpicStatus.COMPLETED) {
                epic.setCompletedAt(LocalDateTime.now());
                
            }
            
            epicRepository.save(epic);
        } else {
            throw new IllegalArgumentException("Epic not found with ID: " + epicId);
        }
    }

    /**
     * Update epic progress.
     * 
     * @param epicId the epic ID
     * @param progress the new progress percentage (0-100)
     * @throws IllegalArgumentException if epic not found or invalid progress
     */
    public void updateEpicProgress(String epicId, Integer progress) {
        if (progress < 0 || progress > 100) {
            throw new IllegalArgumentException("Progress must be between 0 and 100");
        }
        
        Optional<Epic> epicOptional = epicRepository.findById(epicId);
        if (epicOptional.isPresent()) {
            Epic epic = epicOptional.get();
            epic.setProgress(progress);
            epicRepository.save(epic);
        } else {
            throw new IllegalArgumentException("Epic not found with ID: " + epicId);
        }
    }

    /**
     * Assign epic to user.
     * 
     * @param epicId the epic ID
     * @param assigneeId the assignee ID
     * @throws IllegalArgumentException if epic not found
     */
    public void assignEpic(String epicId, String assigneeId) {
        Optional<Epic> epicOptional = epicRepository.findById(epicId);
        if (epicOptional.isPresent()) {
            Epic epic = epicOptional.get();
            epic.setAssigneeId(assigneeId);
            epicRepository.save(epic);
        } else {
            throw new IllegalArgumentException("Epic not found with ID: " + epicId);
        }
    }

    /**
     * Update epic story points.
     * 
     * @param epicId the epic ID
     * @param storyPoints the new story points
     * @param completedStoryPoints the completed story points
     * @throws IllegalArgumentException if epic not found or invalid points
     */
    public void updateEpicStoryPoints(String epicId, Integer storyPoints, Integer completedStoryPoints) {
        if (storyPoints < 0 || completedStoryPoints < 0 || completedStoryPoints > storyPoints) {
            throw new IllegalArgumentException("Invalid story points values");
        }
        
        Optional<Epic> epicOptional = epicRepository.findById(epicId);
        if (epicOptional.isPresent()) {
            Epic epic = epicOptional.get();
            epic.setStoryPoints(storyPoints);
            epic.setCompletedStoryPoints(completedStoryPoints);
            
            // Update progress based on story points
            if (storyPoints > 0) {
                int progress = (completedStoryPoints * 100) / storyPoints;
                epic.setProgress(progress);
            }
            
            epicRepository.save(epic);
        } else {
            throw new IllegalArgumentException("Epic not found with ID: " + epicId);
        }
    }

    /**
     * Get epic statistics for a project.
     * 
     * @param projectId the project ID
     * @return map containing epic statistics
     */
    @Transactional(readOnly = true)
    public java.util.Map<String, Object> getEpicStatistics(String projectId) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        
        stats.put("totalEpics", epicRepository.countByProjectIdAndStatus(projectId, null));
        stats.put("backlogEpics", epicRepository.countByProjectIdAndStatus(projectId, EpicStatus.BACKLOG));
        stats.put("inProgressEpics", epicRepository.countByProjectIdAndStatus(projectId, EpicStatus.IN_PROGRESS));
        stats.put("completedEpics", epicRepository.countByProjectIdAndStatus(projectId, EpicStatus.COMPLETED));
        stats.put("totalStoryPoints", epicRepository.getTotalStoryPointsByProject(projectId));
        stats.put("completedStoryPoints", epicRepository.getCompletedStoryPointsByProject(projectId));
        stats.put("overdueEpics", epicRepository.findOverdueEpics(LocalDate.now()).size());
        
        return stats;
    }

    /**
     * Create multiple epics for a project in batch.
     * 
     * @param projectId the project ID
     * @param epics list of epics to create
     * @return list of created epics
     */
    public List<Epic> createEpicsBatch(String projectId, List<Epic> epics) {
        if (epics == null || epics.isEmpty()) {
            throw new IllegalArgumentException("Epics list cannot be null or empty");
        }

        // Set project ID and default values for each epic
        for (Epic epic : epics) {
            epic.setProjectId(projectId);
            if (epic.getProgress() == null) {
                epic.setProgress(0);
            }
            if (epic.getStoryPoints() == null) {
                epic.setStoryPoints(0);
            }
            if (epic.getCompletedStoryPoints() == null) {
                epic.setCompletedStoryPoints(0);
            }
            if (epic.getStatus() == null) {
                epic.setStatus(EpicStatus.DRAFT);
            }
            if (epic.getPriority() == null) {
                epic.setPriority(Priority.MEDIUM);
            }
        }

        return epicRepository.saveAll(epics);
    }
}
