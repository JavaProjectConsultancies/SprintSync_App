package com.sprintsync.api.service;

import com.sprintsync.api.entity.Sprint;
import com.sprintsync.api.entity.enums.SprintStatus;
import com.sprintsync.api.repository.SprintRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for Sprint management operations.
 * Provides business logic for Sprint entities.
 * 
 * @author Mayuresh G
 */
@Service
public class SprintService {

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private IdGenerationService idGenerationService;

    /**
     * Get all sprints with pagination
     */
    public Page<Sprint> getAllSprints(Pageable pageable) {
        return sprintRepository.findAll(pageable);
    }

    /**
     * Get sprint by ID
     */
    public Sprint getSprintById(String id) {
        return sprintRepository.findById(id).orElse(null);
    }

    /**
     * Create a new sprint
     */
    public Sprint createSprint(Sprint sprint) {
        if (sprint.getId() == null) {
            sprint.setId(idGenerationService.generateSprintId());
        }
        sprint.setCreatedAt(LocalDateTime.now());
        sprint.setUpdatedAt(LocalDateTime.now());
        
        // Set default status if not provided
        if (sprint.getStatus() == null) {
            sprint.setStatus(SprintStatus.PLANNING);
        }
        
        return sprintRepository.save(sprint);
    }

    /**
     * Update an existing sprint
     */
    public Sprint updateSprint(Sprint sprint) {
        if (sprintRepository.existsById(sprint.getId())) {
            sprint.setUpdatedAt(LocalDateTime.now());
            return sprintRepository.save(sprint);
        }
        return null;
    }

    /**
     * Delete a sprint
     */
    public boolean deleteSprint(String id) {
        if (sprintRepository.existsById(id)) {
            sprintRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get sprints by project ID
     */
    public List<Sprint> getSprintsByProjectId(String projectId) {
        return sprintRepository.findByProjectId(projectId);
    }

    /**
     * Get sprints by status
     */
    public List<Sprint> getSprintsByStatus(SprintStatus status) {
        return sprintRepository.findByStatus(status);
    }

    /**
     * Get active sprints
     */
    public List<Sprint> getActiveSprints() {
        return sprintRepository.findByStatus(SprintStatus.ACTIVE);
    }

    /**
     * Get current sprint for a project
     */
    public Sprint getCurrentSprint(String projectId) {
        return sprintRepository.findCurrentSprintByProjectId(projectId).orElse(null);
    }

    /**
     * Update sprint status
     */
    public Sprint updateSprintStatus(String id, SprintStatus status) {
        Optional<Sprint> optionalSprint = sprintRepository.findById(id);
        if (optionalSprint.isPresent()) {
            Sprint sprint = optionalSprint.get();
            sprint.setStatus(status);
            sprint.setUpdatedAt(LocalDateTime.now());
            
            // Set start/end dates based on status
            if (status == SprintStatus.ACTIVE && sprint.getStartDate() == null) {
                sprint.setStartDate(LocalDate.now());
            } else if (status == SprintStatus.COMPLETED && sprint.getEndDate() == null) {
                sprint.setEndDate(LocalDate.now());
            }
            
            return sprintRepository.save(sprint);
        }
        return null;
    }

    /**
     * Start a sprint
     */
    public Sprint startSprint(String id) {
        return updateSprintStatus(id, SprintStatus.ACTIVE);
    }

    /**
     * Complete a sprint
     */
    public Sprint completeSprint(String id) {
        return updateSprintStatus(id, SprintStatus.COMPLETED);
    }

    /**
     * Get sprint statistics
     */
    public Map<String, Object> getSprintStatistics(String id) {
        Sprint sprint = getSprintById(id);
        if (sprint == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> statistics = new HashMap<>();
        statistics.put("sprintId", id);
        statistics.put("sprintName", sprint.getName());
        statistics.put("status", sprint.getStatus());
        statistics.put("startDate", sprint.getStartDate());
        statistics.put("endDate", sprint.getEndDate());
        
        // Calculate sprint duration
        if (sprint.getStartDate() != null && sprint.getEndDate() != null) {
            long days = sprint.getStartDate().until(sprint.getEndDate()).getDays();
            statistics.put("duration", days);
        }
        
        // Add more statistics as needed
        statistics.put("capacity", sprint.getCapacityHours());
        statistics.put("goal", sprint.getGoal());
        
        return statistics;
    }

    /**
     * Get sprint velocity
     */
    public Map<String, Object> getSprintVelocity(String id) {
        Sprint sprint = getSprintById(id);
        if (sprint == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> velocity = new HashMap<>();
        velocity.put("sprintId", id);
        velocity.put("sprintName", sprint.getName());
        
        // Calculate velocity based on completed stories/tasks
        // This would typically involve querying related entities
        velocity.put("plannedVelocity", sprint.getVelocityPoints());
        velocity.put("actualVelocity", sprint.getVelocityPoints() != null ? sprint.getVelocityPoints() : 0);
        velocity.put("velocityDifference", 0);
        
        return velocity;
    }

    /**
     * Get sprint burndown data
     */
    public Map<String, Object> getSprintBurndown(String id) {
        Sprint sprint = getSprintById(id);
        if (sprint == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> burndown = new HashMap<>();
        burndown.put("sprintId", id);
        burndown.put("sprintName", sprint.getName());
        burndown.put("startDate", sprint.getStartDate());
        burndown.put("endDate", sprint.getEndDate());
        
        // Generate burndown chart data points
        List<Map<String, Object>> dataPoints = new ArrayList<>();
        if (sprint.getStartDate() != null && sprint.getEndDate() != null) {
            LocalDate current = sprint.getStartDate();
            LocalDate end = sprint.getEndDate();
            int totalDays = (int) current.until(end).getDays();
            int remainingWork = sprint.getCapacityHours() != null ? sprint.getCapacityHours() : 0;
            
            for (int day = 0; day <= totalDays; day++) {
                Map<String, Object> point = new HashMap<>();
                point.put("day", day);
                point.put("date", current.plusDays(day));
                point.put("remainingWork", Math.max(0, remainingWork - (day * remainingWork / totalDays)));
                dataPoints.add(point);
            }
        }
        
        burndown.put("dataPoints", dataPoints);
        return burndown;
    }

    /**
     * Get sprints in date range
     */
    public List<Sprint> getSprintsInDateRange(LocalDate startDate, LocalDate endDate) {
        return sprintRepository.findByStartDateBetweenOrEndDateBetween(startDate, endDate, startDate, endDate);
    }

    /**
     * Get upcoming sprints
     */
    public List<Sprint> getUpcomingSprints() {
        LocalDate today = LocalDate.now();
        return sprintRepository.findByStartDateAfterAndStatus(today, SprintStatus.PLANNING);
    }

    /**
     * Get completed sprints
     */
    public List<Sprint> getCompletedSprints() {
        return sprintRepository.findByStatus(SprintStatus.COMPLETED);
    }

    /**
     * Search sprints by name
     */
    public List<Sprint> searchSprints(String query) {
        return sprintRepository.findByNameContainingIgnoreCase(query);
    }

    /**
     * Get sprint capacity
     */
    public Map<String, Object> getSprintCapacity(String id) {
        Sprint sprint = getSprintById(id);
        if (sprint == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> capacity = new HashMap<>();
        capacity.put("sprintId", id);
        capacity.put("sprintName", sprint.getName());
        capacity.put("totalCapacity", sprint.getCapacityHours());
        capacity.put("allocatedCapacity", 0); // To be calculated from assigned work
        capacity.put("remainingCapacity", sprint.getCapacityHours());
        capacity.put("utilizationPercentage", 0.0);
        
        return capacity;
    }

    /**
     * Get sprint progress
     */
    public Map<String, Object> getSprintProgress(String id) {
        Sprint sprint = getSprintById(id);
        if (sprint == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> progress = new HashMap<>();
        progress.put("sprintId", id);
        progress.put("sprintName", sprint.getName());
        progress.put("status", sprint.getStatus());
        
        // Calculate progress percentage based on time elapsed
        if (sprint.getStartDate() != null && sprint.getEndDate() != null) {
            LocalDate today = LocalDate.now();
            if (today.isAfter(sprint.getStartDate()) && today.isBefore(sprint.getEndDate())) {
                long totalDays = sprint.getStartDate().until(sprint.getEndDate()).getDays();
                long elapsedDays = sprint.getStartDate().until(today).getDays();
                double progressPercentage = (double) elapsedDays / totalDays * 100;
                progress.put("progressPercentage", Math.round(progressPercentage * 100.0) / 100.0);
            } else if (today.isAfter(sprint.getEndDate())) {
                progress.put("progressPercentage", 100.0);
            } else {
                progress.put("progressPercentage", 0.0);
            }
        }
        
        return progress;
    }

    /**
     * Get sprint team allocation
     */
    public Map<String, Object> getSprintTeamAllocation(String id) {
        Sprint sprint = getSprintById(id);
        if (sprint == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> teamAllocation = new HashMap<>();
        teamAllocation.put("sprintId", id);
        teamAllocation.put("sprintName", sprint.getName());
        
        // This would typically involve querying team members and their allocations
        teamAllocation.put("teamMembers", new ArrayList<>());
        teamAllocation.put("totalAllocation", 0);
        
        return teamAllocation;
    }

    /**
     * Copy sprint
     */
    public Sprint copySprint(String id, String newSprintName) {
        Sprint originalSprint = getSprintById(id);
        if (originalSprint == null) {
            return null;
        }

        Sprint newSprint = new Sprint();
        newSprint.setName(newSprintName != null ? newSprintName : originalSprint.getName() + " (Copy)");
        newSprint.setProjectId(originalSprint.getProjectId());
        newSprint.setCapacityHours(originalSprint.getCapacityHours());
        newSprint.setGoal(originalSprint.getGoal());
        newSprint.setStatus(SprintStatus.PLANNING);
        
        // Set dates for next sprint cycle
        if (originalSprint.getStartDate() != null && originalSprint.getEndDate() != null) {
            long duration = originalSprint.getStartDate().until(originalSprint.getEndDate()).getDays();
            LocalDate nextStartDate = originalSprint.getEndDate().plusDays(1);
            newSprint.setStartDate(nextStartDate);
            newSprint.setEndDate(nextStartDate.plusDays(duration));
        }
        
        return createSprint(newSprint);
    }

    /**
     * Get sprint retrospective data
     */
    public Map<String, Object> getSprintRetrospective(String id) {
        Sprint sprint = getSprintById(id);
        if (sprint == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> retrospective = new HashMap<>();
        retrospective.put("sprintId", id);
        retrospective.put("sprintName", sprint.getName());
        retrospective.put("status", sprint.getStatus());
        retrospective.put("startDate", sprint.getStartDate());
        retrospective.put("endDate", sprint.getEndDate());
        
        // Add retrospective questions and answers
        retrospective.put("whatWentWell", new ArrayList<>());
        retrospective.put("whatWentWrong", new ArrayList<>());
        retrospective.put("whatToImprove", new ArrayList<>());
        retrospective.put("actionItems", new ArrayList<>());
        
        return retrospective;
    }

    /**
     * Get sprint count by status
     */
    public long getSprintCountByStatus(SprintStatus status) {
        return sprintRepository.countByStatus(status);
    }

    /**
     * Get sprint count by project
     */
    public long getSprintCountByProject(String projectId) {
        return sprintRepository.countByProjectId(projectId);
    }

    /**
     * Get recent sprints
     */
    public List<Sprint> getRecentSprints(int limit) {
        return sprintRepository.findAll()
            .stream()
            .sorted((s1, s2) -> s2.getCreatedAt().compareTo(s1.getCreatedAt()))
            .limit(limit)
            .collect(Collectors.toList());
    }
}
