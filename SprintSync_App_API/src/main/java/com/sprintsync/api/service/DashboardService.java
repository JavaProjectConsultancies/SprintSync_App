package com.sprintsync.api.service;

import com.sprintsync.api.entity.*;
import com.sprintsync.api.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for Dashboard operations.
 * Provides business logic for dashboard data and analytics.
 * 
 * @author Mayuresh G
 */
@Service
public class DashboardService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private SubtaskRepository subtaskRepository;

    @Autowired
    private UserRepository userRepository;


    /**
     * Get overall dashboard statistics
     */
    public Map<String, Object> getDashboardStatistics() {
        Map<String, Object> statistics = new HashMap<>();
        
        // Basic counts
        statistics.put("totalProjects", projectRepository.count());
        statistics.put("totalSprints", sprintRepository.count());
        statistics.put("totalStories", storyRepository.count());
        statistics.put("totalTasks", taskRepository.count());
        statistics.put("totalSubtasks", subtaskRepository.count());
        statistics.put("totalUsers", userRepository.count());
        
        // Active counts
        statistics.put("activeProjects", projectRepository.countByStatus(com.sprintsync.api.entity.enums.ProjectStatus.ACTIVE));
        statistics.put("activeSprints", sprintRepository.countByStatus(com.sprintsync.api.entity.enums.SprintStatus.ACTIVE));
        
        // Completed counts
        statistics.put("completedSprints", sprintRepository.countByStatus(com.sprintsync.api.entity.enums.SprintStatus.COMPLETED));
        statistics.put("completedStories", storyRepository.countByStatus(com.sprintsync.api.entity.enums.StoryStatus.DONE));
        statistics.put("completedTasks", taskRepository.countByStatus(com.sprintsync.api.entity.enums.TaskStatus.DONE));
        
        // Overdue counts
        statistics.put("overdueTasks", taskRepository.findOverdueTasks(LocalDateTime.now()).size());
        statistics.put("overdueSubtasks", subtaskRepository.findAll().stream()
            .filter(subtask -> subtask.getDueDate() != null && subtask.getDueDate().isBefore(LocalDateTime.now().toLocalDate()))
            .filter(subtask -> !subtask.getIsCompleted())
            .count());
        
        return statistics;
    }

    /**
     * Get dashboard statistics for a specific project
     */
    public Map<String, Object> getProjectDashboardStatistics(String projectId) {
        Map<String, Object> statistics = new HashMap<>();
        
        // Project-specific counts
        statistics.put("projectSprints", sprintRepository.countByProjectId(projectId));
        statistics.put("projectStories", storyRepository.countByProjectId(projectId));
        statistics.put("projectTasks", 0); // Note: Task entity doesn't have projectId field
        statistics.put("projectSubtasks", 0); // Note: Subtask entity doesn't have projectId field
        
        // Active counts for project
        statistics.put("activeProjectSprints", sprintRepository.findByProjectId(projectId).stream()
            .filter(sprint -> sprint.getStatus() == com.sprintsync.api.entity.enums.SprintStatus.ACTIVE)
            .count());
        statistics.put("completedProjectSprints", sprintRepository.findByProjectId(projectId).stream()
            .filter(sprint -> sprint.getStatus() == com.sprintsync.api.entity.enums.SprintStatus.COMPLETED)
            .count());
        
        // Completed counts for project
        statistics.put("completedProjectStories", storyRepository.findByProjectId(projectId).stream()
            .filter(story -> story.getStatus() == com.sprintsync.api.entity.enums.StoryStatus.DONE)
            .count());
        // Note: Task entity doesn't have projectId field - tasks are related to projects through stories
        statistics.put("completedProjectTasks", 0);
        
        return statistics;
    }

    /**
     * Get dashboard statistics for a specific user
     */
    public Map<String, Object> getUserDashboardStatistics(String userId) {
        Map<String, Object> statistics = new HashMap<>();
        
        // User-specific counts
        statistics.put("assignedTasks", taskRepository.countByAssigneeId(userId));
        statistics.put("assignedSubtasks", subtaskRepository.countByAssigneeId(userId));
        statistics.put("assignedStories", storyRepository.findByAssigneeId(userId).size());
        
        // User's completed work
        statistics.put("completedTasks", taskRepository.findByAssigneeId(userId).stream()
            .filter(task -> task.getStatus() == com.sprintsync.api.entity.enums.TaskStatus.DONE)
            .count());
        statistics.put("completedSubtasks", subtaskRepository.findByAssigneeId(userId).stream()
            .filter(subtask -> subtask.getIsCompleted())
            .count());
        statistics.put("completedStories", storyRepository.findByAssigneeId(userId).stream()
            .filter(story -> story.getStatus() == com.sprintsync.api.entity.enums.StoryStatus.DONE)
            .count());
        
        return statistics;
    }

    /**
     * Get recent activities
     */
    public Map<String, Object> getRecentActivities() {
        Map<String, Object> activities = new HashMap<>();
        
        // Recent tasks
        List<Task> recentTasks = taskRepository.findRecentlyUpdatedTasks(LocalDateTime.now().minusDays(7));
        activities.put("recentTasks", recentTasks.stream().limit(10).collect(Collectors.toList()));
        
        // Recent stories
        List<Story> recentStories = storyRepository.findAll().stream()
            .filter(story -> story.getUpdatedAt().isAfter(LocalDateTime.now().minusDays(7)))
            .collect(Collectors.toList());
        activities.put("recentStories", recentStories.stream().limit(10).collect(Collectors.toList()));
        
        // Recent sprints
        List<Sprint> recentSprints = sprintRepository.findRecentlyUpdatedSprints();
        activities.put("recentSprints", recentSprints.stream().limit(5).collect(Collectors.toList()));
        
        return activities;
    }

    /**
     * Get recent activities for a specific project
     */
    public Map<String, Object> getProjectRecentActivities(String projectId) {
        Map<String, Object> activities = new HashMap<>();
        
        // Recent tasks for project
        // Note: Task entity doesn't have projectId field - tasks are related to projects through stories
        List<Task> recentTasks = Collections.emptyList();
        activities.put("recentTasks", recentTasks);
        
        // Recent stories for project
        List<Story> recentStories = storyRepository.findByProjectId(projectId).stream()
            .filter(story -> story.getUpdatedAt().isAfter(LocalDateTime.now().minusDays(7)))
            .sorted((s1, s2) -> s2.getUpdatedAt().compareTo(s1.getUpdatedAt()))
            .limit(10)
            .collect(Collectors.toList());
        activities.put("recentStories", recentStories);
        
        return activities;
    }

    /**
     * Get recent activities for a specific user
     */
    public Map<String, Object> getUserRecentActivities(String userId) {
        Map<String, Object> activities = new HashMap<>();
        
        // Recent tasks assigned to user
        List<Task> recentTasks = taskRepository.findByAssigneeId(userId).stream()
            .filter(task -> task.getUpdatedAt().isAfter(LocalDateTime.now().minusDays(7)))
            .sorted((t1, t2) -> t2.getUpdatedAt().compareTo(t1.getUpdatedAt()))
            .limit(10)
            .collect(Collectors.toList());
        activities.put("recentTasks", recentTasks);
        
        // Recent subtasks assigned to user
        List<Subtask> recentSubtasks = subtaskRepository.findByAssigneeId(userId).stream()
            .filter(subtask -> subtask.getUpdatedAt().isAfter(LocalDateTime.now().minusDays(7)))
            .sorted((s1, s2) -> s2.getUpdatedAt().compareTo(s1.getUpdatedAt()))
            .limit(10)
            .collect(Collectors.toList());
        activities.put("recentSubtasks", recentSubtasks);
        
        return activities;
    }

    /**
     * Get sprint progress overview
     */
    public Map<String, Object> getSprintProgressOverview() {
        Map<String, Object> progress = new HashMap<>();
        
        List<Sprint> activeSprints = sprintRepository.findByStatus(com.sprintsync.api.entity.enums.SprintStatus.ACTIVE);
        progress.put("activeSprints", activeSprints.size());
        
        List<Sprint> planningSprints = sprintRepository.findByStatus(com.sprintsync.api.entity.enums.SprintStatus.PLANNING);
        progress.put("planningSprints", planningSprints.size());
        
        List<Sprint> completedSprints = sprintRepository.findByStatus(com.sprintsync.api.entity.enums.SprintStatus.COMPLETED);
        progress.put("completedSprints", completedSprints.size());
        
        // Calculate average completion percentage for active sprints
        // Note: Sprint entity doesn't have completionPercentage field in current database schema
        progress.put("averageCompletion", 0.0);
        
        return progress;
    }

    /**
     * Get sprint progress for a specific project
     */
    public Map<String, Object> getProjectSprintProgress(String projectId) {
        Map<String, Object> progress = new HashMap<>();
        
        List<Sprint> projectSprints = sprintRepository.findByProjectId(projectId);
        
        Map<com.sprintsync.api.entity.enums.SprintStatus, Long> statusCount = projectSprints.stream()
            .collect(Collectors.groupingBy(Sprint::getStatus, Collectors.counting()));
        progress.put("statusCount", statusCount);
        
        List<Sprint> activeSprints = projectSprints.stream()
            .filter(sprint -> sprint.getStatus() == com.sprintsync.api.entity.enums.SprintStatus.ACTIVE)
            .collect(Collectors.toList());
        progress.put("activeSprints", activeSprints);
        
        return progress;
    }

    /**
     * Get team performance metrics
     */
    public Map<String, Object> getTeamPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // Team velocity (average story points completed per sprint)
        List<Sprint> completedSprints = sprintRepository.findByStatus(com.sprintsync.api.entity.enums.SprintStatus.COMPLETED);
        if (!completedSprints.isEmpty()) {
            double avgVelocity = completedSprints.stream()
                .filter(sprint -> sprint.getVelocityPoints() != null)
                .mapToDouble(Sprint::getVelocityPoints)
                .average()
                .orElse(0.0);
            metrics.put("averageVelocity", Math.round(avgVelocity * 100.0) / 100.0);
        } else {
            metrics.put("averageVelocity", 0.0);
        }
        
        // Task completion rate
        long totalTasks = taskRepository.count();
        long completedTasks = taskRepository.countByStatus(com.sprintsync.api.entity.enums.TaskStatus.DONE);
        double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks * 100 : 0.0;
        metrics.put("taskCompletionRate", Math.round(completionRate * 100.0) / 100.0);
        
        // Story completion rate
        long totalStories = storyRepository.count();
        long completedStories = storyRepository.countByStatus(com.sprintsync.api.entity.enums.StoryStatus.DONE);
        double storyCompletionRate = totalStories > 0 ? (double) completedStories / totalStories * 100 : 0.0;
        metrics.put("storyCompletionRate", Math.round(storyCompletionRate * 100.0) / 100.0);
        
        return metrics;
    }

    /**
     * Get team performance metrics for a specific project
     */
    public Map<String, Object> getProjectTeamPerformance(String projectId) {
        Map<String, Object> metrics = new HashMap<>();
        
        // Project-specific velocity
        List<Sprint> projectSprints = sprintRepository.findByProjectId(projectId);
        List<Sprint> completedProjectSprints = projectSprints.stream()
            .filter(sprint -> sprint.getStatus() == com.sprintsync.api.entity.enums.SprintStatus.COMPLETED)
            .collect(Collectors.toList());
        
        if (!completedProjectSprints.isEmpty()) {
            double avgVelocity = completedProjectSprints.stream()
                .filter(sprint -> sprint.getVelocityPoints() != null)
                .mapToDouble(Sprint::getVelocityPoints)
                .average()
                .orElse(0.0);
            metrics.put("averageVelocity", Math.round(avgVelocity * 100.0) / 100.0);
        } else {
            metrics.put("averageVelocity", 0.0);
        }
        
        // Project-specific completion rates
        List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
        long completedProjectTasks = projectTasks.stream()
            .filter(task -> task.getStatus() == com.sprintsync.api.entity.enums.TaskStatus.DONE)
            .count();
        double projectTaskCompletionRate = !projectTasks.isEmpty() ? (double) completedProjectTasks / projectTasks.size() * 100 : 0.0;
        metrics.put("taskCompletionRate", Math.round(projectTaskCompletionRate * 100.0) / 100.0);
        
        return metrics;
    }

    /**
     * Get velocity trends
     */
    public Map<String, Object> getVelocityTrends() {
        Map<String, Object> trends = new HashMap<>();
        
        List<Sprint> completedSprints = sprintRepository.findByStatus(com.sprintsync.api.entity.enums.SprintStatus.COMPLETED);
        List<Map<String, Object>> velocityData = completedSprints.stream()
            .filter(sprint -> sprint.getVelocityPoints() != null)
            .sorted(Comparator.comparing(Sprint::getEndDate))
            .map(sprint -> {
                Map<String, Object> dataPoint = new HashMap<>();
                dataPoint.put("sprintId", sprint.getId());
                dataPoint.put("sprintName", sprint.getName());
                dataPoint.put("velocity", sprint.getVelocityPoints());
                dataPoint.put("endDate", sprint.getEndDate());
                return dataPoint;
            })
            .collect(Collectors.toList());
        
        trends.put("velocityData", velocityData);
        
        // Calculate trend (increasing, decreasing, or stable)
        if (velocityData.size() >= 2) {
            double firstVelocity = (Double) velocityData.get(0).get("velocity");
            double lastVelocity = (Double) velocityData.get(velocityData.size() - 1).get("velocity");
            String trend = firstVelocity < lastVelocity ? "increasing" : 
                          firstVelocity > lastVelocity ? "decreasing" : "stable";
            trends.put("trend", trend);
        } else {
            trends.put("trend", "insufficient_data");
        }
        
        return trends;
    }

    /**
     * Get velocity trends for a specific project
     */
    public Map<String, Object> getProjectVelocityTrends(String projectId) {
        Map<String, Object> trends = new HashMap<>();
        
        List<Sprint> projectSprints = sprintRepository.findByProjectId(projectId);
        List<Map<String, Object>> velocityData = projectSprints.stream()
            .filter(sprint -> sprint.getStatus() == com.sprintsync.api.entity.enums.SprintStatus.COMPLETED)
            .filter(sprint -> sprint.getVelocityPoints() != null)
            .sorted(Comparator.comparing(Sprint::getEndDate))
            .map(sprint -> {
                Map<String, Object> dataPoint = new HashMap<>();
                dataPoint.put("sprintId", sprint.getId());
                dataPoint.put("sprintName", sprint.getName());
                dataPoint.put("velocity", sprint.getVelocityPoints());
                dataPoint.put("endDate", sprint.getEndDate());
                return dataPoint;
            })
            .collect(Collectors.toList());
        
        trends.put("velocityData", velocityData);
        
        return trends;
    }

    /**
     * Get burndown chart data
     */
    public Map<String, Object> getBurndownChartData() {
        Map<String, Object> burndown = new HashMap<>();
        
        List<Sprint> activeSprints = sprintRepository.findByStatus(com.sprintsync.api.entity.enums.SprintStatus.ACTIVE);
        if (!activeSprints.isEmpty()) {
            Sprint currentSprint = activeSprints.get(0); // Get first active sprint
            burndown.put("currentSprint", currentSprint);
            
            // Generate burndown data points
            List<Map<String, Object>> dataPoints = new ArrayList<>();
            if (currentSprint.getStartDate() != null && currentSprint.getEndDate() != null) {
                LocalDate current = currentSprint.getStartDate();
                LocalDate end = currentSprint.getEndDate();
                int totalDays = (int) current.until(end).getDays();
                int totalWork = currentSprint.getCapacityHours() != null ? currentSprint.getCapacityHours() : 100;
                
                for (int day = 0; day <= totalDays; day++) {
                    Map<String, Object> point = new HashMap<>();
                    point.put("day", day);
                    point.put("date", current.plusDays(day));
                    point.put("remainingWork", Math.max(0, totalWork - (day * totalWork / totalDays)));
                    dataPoints.add(point);
                }
            }
            
            burndown.put("dataPoints", dataPoints);
        }
        
        return burndown;
    }

    /**
     * Get burndown chart data for a specific sprint
     */
    public Map<String, Object> getSprintBurndownChartData(String sprintId) {
        Map<String, Object> burndown = new HashMap<>();
        
        Optional<Sprint> optionalSprint = sprintRepository.findById(sprintId);
        if (optionalSprint.isPresent()) {
            Sprint sprint = optionalSprint.get();
            burndown.put("sprint", sprint);
            
            // Generate burndown data points
            List<Map<String, Object>> dataPoints = new ArrayList<>();
            if (sprint.getStartDate() != null && sprint.getEndDate() != null) {
                LocalDate current = sprint.getStartDate();
                LocalDate end = sprint.getEndDate();
                int totalDays = (int) current.until(end).getDays();
                int totalWork = sprint.getCapacityHours() != null ? sprint.getCapacityHours() : 100;
                
                for (int day = 0; day <= totalDays; day++) {
                    Map<String, Object> point = new HashMap<>();
                    point.put("day", day);
                    point.put("date", current.plusDays(day));
                    point.put("remainingWork", Math.max(0, totalWork - (day * totalWork / totalDays)));
                    dataPoints.add(point);
                }
            }
            
            burndown.put("dataPoints", dataPoints);
        }
        
        return burndown;
    }

    /**
     * Get task distribution
     */
    public Map<String, Object> getTaskDistribution() {
        Map<String, Object> distribution = new HashMap<>();
        
        List<Task> allTasks = taskRepository.findAll();
        Map<com.sprintsync.api.entity.enums.TaskStatus, Long> statusDistribution = allTasks.stream()
            .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
        distribution.put("statusDistribution", statusDistribution);
        
        Map<String, Long> priorityDistribution = allTasks.stream()
            .collect(Collectors.groupingBy(task -> task.getPriority().getValue(), Collectors.counting()));
        distribution.put("priorityDistribution", priorityDistribution);
        
        return distribution;
    }

    /**
     * Get task distribution for a specific project
     */
    public Map<String, Object> getProjectTaskDistribution(String projectId) {
        Map<String, Object> distribution = new HashMap<>();
        
        List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
        Map<com.sprintsync.api.entity.enums.TaskStatus, Long> statusDistribution = projectTasks.stream()
            .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
        distribution.put("statusDistribution", statusDistribution);
        
        Map<String, Long> priorityDistribution = projectTasks.stream()
            .collect(Collectors.groupingBy(task -> task.getPriority().getValue(), Collectors.counting()));
        distribution.put("priorityDistribution", priorityDistribution);
        
        return distribution;
    }

    /**
     * Get priority distribution
     */
    public Map<String, Object> getPriorityDistribution() {
        Map<String, Object> distribution = new HashMap<>();
        
        // Task priority distribution
        Map<String, Long> taskPriorityDistribution = taskRepository.findAll().stream()
            .collect(Collectors.groupingBy(task -> task.getPriority().getValue(), Collectors.counting()));
        distribution.put("taskPriorityDistribution", taskPriorityDistribution);
        
        // Story priority distribution
        Map<String, Long> storyPriorityDistribution = storyRepository.findAll().stream()
            .collect(Collectors.groupingBy(story -> story.getPriority().getValue(), Collectors.counting()));
        distribution.put("storyPriorityDistribution", storyPriorityDistribution);
        
        return distribution;
    }

    /**
     * Get priority distribution for a specific project
     */
    public Map<String, Object> getProjectPriorityDistribution(String projectId) {
        Map<String, Object> distribution = new HashMap<>();
        
        // Project task priority distribution
        // Note: Task entity doesn't have projectId field
        Map<String, Long> taskPriorityDistribution = Collections.emptyMap();
        distribution.put("taskPriorityDistribution", taskPriorityDistribution);
        
        // Project story priority distribution
        Map<String, Long> storyPriorityDistribution = storyRepository.findByProjectId(projectId).stream()
            .collect(Collectors.groupingBy(story -> story.getPriority().getValue(), Collectors.counting()));
        distribution.put("storyPriorityDistribution", storyPriorityDistribution);
        
        return distribution;
    }

    /**
     * Get overdue items
     */
    public Map<String, Object> getOverdueItems() {
        Map<String, Object> overdueItems = new HashMap<>();
        
        List<Task> overdueTasks = taskRepository.findOverdueTasks(LocalDateTime.now());
        overdueItems.put("overdueTasks", overdueTasks);
        
        List<Subtask> overdueSubtasks = subtaskRepository.findAll().stream()
            .filter(subtask -> subtask.getDueDate() != null && subtask.getDueDate().isBefore(LocalDateTime.now().toLocalDate()))
            .filter(subtask -> !subtask.getIsCompleted())
            .collect(Collectors.toList());
        overdueItems.put("overdueSubtasks", overdueSubtasks);
        
        overdueItems.put("totalOverdue", overdueTasks.size() + overdueSubtasks.size());
        
        return overdueItems;
    }

    /**
     * Get overdue items for a specific project
     */
    public Map<String, Object> getProjectOverdueItems(String projectId) {
        Map<String, Object> overdueItems = new HashMap<>();
        
        // Note: Task entity doesn't have projectId field
        List<Task> projectOverdueTasks = Collections.emptyList();
        overdueItems.put("overdueTasks", projectOverdueTasks);
        
        List<Subtask> projectOverdueSubtasks = Collections.emptyList(); // Note: Subtask entity doesn't have projectId field
        overdueItems.put("overdueSubtasks", projectOverdueSubtasks);
        
        overdueItems.put("totalOverdue", projectOverdueTasks.size() + projectOverdueSubtasks.size());
        
        return overdueItems;
    }

    /**
     * Get upcoming deadlines
     */
    public Map<String, Object> getUpcomingDeadlines() {
        Map<String, Object> deadlines = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextWeek = now.plusDays(7);
        
        List<Task> upcomingTasks = taskRepository.findByDueDateBetween(now, nextWeek);
        deadlines.put("upcomingTasks", upcomingTasks);
        
        List<Subtask> upcomingSubtasks = subtaskRepository.findByDueDateBetween(now, nextWeek);
        deadlines.put("upcomingSubtasks", upcomingSubtasks);
        
        return deadlines;
    }

    /**
     * Get upcoming deadlines for a specific project
     */
    public Map<String, Object> getProjectUpcomingDeadlines(String projectId) {
        Map<String, Object> deadlines = new HashMap<>();
        
        // Note: Task entity doesn't have projectId field
        List<Task> upcomingTasks = Collections.emptyList();
        deadlines.put("upcomingTasks", upcomingTasks);
        
        List<Subtask> upcomingSubtasks = Collections.emptyList(); // Note: Subtask entity doesn't have projectId field
        deadlines.put("upcomingSubtasks", upcomingSubtasks);
        
        return deadlines;
    }

    /**
     * Get team allocation overview
     */
    public Map<String, Object> getTeamAllocationOverview() {
        Map<String, Object> allocation = new HashMap<>();
        
        List<User> allUsers = userRepository.findAll();
        allocation.put("totalUsers", allUsers.size());
        
        // Calculate allocation per user
        List<Map<String, Object>> userAllocations = allUsers.stream()
            .map(user -> {
                Map<String, Object> userAllocation = new HashMap<>();
                userAllocation.put("userId", user.getId());
                userAllocation.put("userName", user.getName());
                userAllocation.put("assignedTasks", taskRepository.countByAssigneeId(user.getId()));
                userAllocation.put("assignedSubtasks", subtaskRepository.countByAssigneeId(user.getId()));
                userAllocation.put("assignedStories", storyRepository.findByAssigneeId(user.getId()).size());
                return userAllocation;
            })
            .collect(Collectors.toList());
        
        allocation.put("userAllocations", userAllocations);
        
        return allocation;
    }

    /**
     * Get team allocation for a specific project
     */
    public Map<String, Object> getProjectTeamAllocation(String projectId) {
        Map<String, Object> allocation = new HashMap<>();
        
        // Get users assigned to project tasks
        List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
        Set<String> assignedUserIds = projectTasks.stream()
            .filter(task -> task.getAssigneeId() != null)
            .map(Task::getAssigneeId)
            .collect(Collectors.toSet());
        
        List<Map<String, Object>> userAllocations = assignedUserIds.stream()
            .map(userId -> {
                Optional<User> user = userRepository.findById(userId);
                Map<String, Object> userAllocation = new HashMap<>();
                userAllocation.put("userId", userId);
                userAllocation.put("userName", user.map(User::getName).orElse("Unknown"));
                
                long userProjectTasks = projectTasks.stream()
                    .filter(task -> userId.equals(task.getAssigneeId()))
                    .count();
                userAllocation.put("assignedTasks", userProjectTasks);
                
                return userAllocation;
            })
            .collect(Collectors.toList());
        
        allocation.put("userAllocations", userAllocations);
        
        return allocation;
    }

    /**
     * Get project health metrics
     */
    public Map<String, Object> getProjectHealthMetrics() {
        Map<String, Object> health = new HashMap<>();
        
        List<Project> allProjects = projectRepository.findAll();
        List<Map<String, Object>> projectHealths = allProjects.stream()
            .map(project -> {
                Map<String, Object> projectHealth = new HashMap<>();
                projectHealth.put("projectId", project.getId());
                projectHealth.put("projectName", project.getName());
                
                // Calculate health score based on various metrics
                List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
                long overdueTasks = projectTasks.stream()
                    .filter(task -> task.getDueDate() != null && task.getDueDate().isBefore(LocalDateTime.now().toLocalDate()))
                    .filter(task -> task.getStatus() != com.sprintsync.api.entity.enums.TaskStatus.DONE)
                    .count();
                
                double overduePercentage = !projectTasks.isEmpty() ? (double) overdueTasks / projectTasks.size() * 100 : 0;
                projectHealth.put("overduePercentage", Math.round(overduePercentage * 100.0) / 100.0);
                
                // Health score (100 - overdue percentage)
                double healthScore = Math.max(0, 100 - overduePercentage);
                projectHealth.put("healthScore", Math.round(healthScore * 100.0) / 100.0);
                
                return projectHealth;
            })
            .collect(Collectors.toList());
        
        health.put("projectHealths", projectHealths);
        
        return health;
    }

    /**
     * Get project health metrics for a specific project
     */
    public Map<String, Object> getSpecificProjectHealth(String projectId) {
        Map<String, Object> health = new HashMap<>();
        
        Optional<Project> optionalProject = projectRepository.findById(projectId);
        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
            health.put("projectId", project.getId());
            health.put("projectName", project.getName());
            
            List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
            long overdueTasks = projectTasks.stream()
                .filter(task -> task.getDueDate() != null && task.getDueDate().isBefore(LocalDateTime.now().toLocalDate()))
                .filter(task -> task.getStatus() != com.sprintsync.api.entity.enums.TaskStatus.DONE)
                .count();
            
            double overduePercentage = !projectTasks.isEmpty() ? (double) overdueTasks / projectTasks.size() * 100 : 0;
            health.put("overduePercentage", Math.round(overduePercentage * 100.0) / 100.0);
            
            double healthScore = Math.max(0, 100 - overduePercentage);
            health.put("healthScore", Math.round(healthScore * 100.0) / 100.0);
            
            health.put("totalTasks", projectTasks.size());
            health.put("overdueTasks", overdueTasks);
        }
        
        return health;
    }

    /**
     * Get custom date range statistics
     */
    public Map<String, Object> getDateRangeStatistics(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> statistics = new HashMap<>();
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Tasks created in date range
        List<Task> tasksCreated = taskRepository.findByCreatedAtBetween(startDateTime, endDateTime);
        statistics.put("tasksCreated", tasksCreated.size());
        
        // Tasks completed in date range
        List<Task> tasksCompleted = tasksCreated.stream()
            .filter(task -> task.getStatus() == com.sprintsync.api.entity.enums.TaskStatus.DONE)
            .collect(Collectors.toList());
        statistics.put("tasksCompleted", tasksCompleted.size());
        
        // Stories created in date range
        List<Story> storiesCreated = storyRepository.findAll().stream()
            .filter(story -> story.getCreatedAt().isAfter(startDateTime) && story.getCreatedAt().isBefore(endDateTime))
            .collect(Collectors.toList());
        statistics.put("storiesCreated", storiesCreated.size());
        
        // Stories completed in date range
        List<Story> storiesCompleted = storiesCreated.stream()
            .filter(story -> story.getStatus() == com.sprintsync.api.entity.enums.StoryStatus.DONE)
            .collect(Collectors.toList());
        statistics.put("storiesCompleted", storiesCompleted.size());
        
        return statistics;
    }

    /**
     * Get custom date range statistics for a specific project
     */
    public Map<String, Object> getProjectDateRangeStatistics(String projectId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> statistics = new HashMap<>();
        
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        // Project tasks created in date range
        List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
        List<Task> tasksCreated = projectTasks.stream()
            .filter(task -> task.getCreatedAt().isAfter(startDateTime) && task.getCreatedAt().isBefore(endDateTime))
            .collect(Collectors.toList());
        statistics.put("tasksCreated", tasksCreated.size());
        
        // Project tasks completed in date range
        List<Task> tasksCompleted = projectTasks.stream()
            .filter(task -> task.getStatus() == com.sprintsync.api.entity.enums.TaskStatus.DONE)
            .filter(task -> task.getUpdatedAt().isAfter(startDateTime) && task.getUpdatedAt().isBefore(endDateTime))
            .collect(Collectors.toList());
        statistics.put("tasksCompleted", tasksCompleted.size());
        
        return statistics;
    }
}
