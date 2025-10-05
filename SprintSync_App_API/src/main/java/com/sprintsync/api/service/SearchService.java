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
 * Service class for Search operations.
 * Provides business logic for advanced search functionality.
 * 
 * @author Mayuresh G
 */
@Service
public class SearchService {

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

    @Autowired
    private EpicRepository epicRepository;

    @Autowired
    private ReleaseRepository releaseRepository;


    // In-memory storage for search history (in production, use Redis or database)
    private Map<String, List<String>> searchHistory = new HashMap<>();

    /**
     * Global search across all entities
     */
    public Map<String, Object> globalSearch(String query) {
        Map<String, Object> results = new HashMap<>();
        
        // Search projects
        List<Project> projects = projectRepository.findAll().stream()
            .filter(project -> project.getName().toLowerCase().contains(query.toLowerCase()) || 
                              (project.getDescription() != null && project.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("projects", projects);
        
        // Search sprints
        List<Sprint> sprints = sprintRepository.findAll().stream()
            .filter(sprint -> sprint.getName().toLowerCase().contains(query.toLowerCase()))
            .collect(Collectors.toList());
        results.put("sprints", sprints);
        
        // Search stories
        List<Story> stories = storyRepository.findAll().stream()
            .filter(story -> story.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                             (story.getDescription() != null && story.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("stories", stories);
        
        // Search tasks
        List<Task> tasks = taskRepository.findAll().stream()
            .filter(task -> task.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                            (task.getDescription() != null && task.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("tasks", tasks);
        
        // Search subtasks
        List<Subtask> subtasks = subtaskRepository.findAll().stream()
            .filter(task -> task.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                            (task.getDescription() != null && task.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("subtasks", subtasks);
        
        // Search users
        List<User> users = userRepository.findAll().stream()
            .filter(user -> user.getName().toLowerCase().contains(query.toLowerCase()) || 
                            (user.getEmail() != null && user.getEmail().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("users", users);
        
        // Search epics
        List<Epic> epics = epicRepository.findAll().stream()
            .filter(epic -> epic.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                            (epic.getDescription() != null && epic.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("epics", epics);
        
        // Search releases
        List<Release> releases = releaseRepository.findAll().stream()
            .filter(release -> release.getName().toLowerCase().contains(query.toLowerCase()) || 
                               (release.getDescription() != null && release.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("releases", releases);
        
        // Calculate total results
        int totalResults = projects.size() + sprints.size() + stories.size() + tasks.size() + 
                          subtasks.size() + users.size() + epics.size() + releases.size();
        results.put("totalResults", totalResults);
        
        return results;
    }

    /**
     * Search projects
     */
    public Map<String, Object> searchProjects(String query) {
        Map<String, Object> results = new HashMap<>();
        
        List<Project> projects = projectRepository.findAll().stream()
            .filter(project -> project.getName().toLowerCase().contains(query.toLowerCase()) || 
                              (project.getDescription() != null && project.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("projects", projects);
        results.put("totalResults", projects.size());
        
        return results;
    }

    /**
     * Search sprints
     */
    public Map<String, Object> searchSprints(String query) {
        Map<String, Object> results = new HashMap<>();
        
        List<Sprint> sprints = sprintRepository.findAll().stream()
            .filter(sprint -> sprint.getName().toLowerCase().contains(query.toLowerCase()))
            .collect(Collectors.toList());
        results.put("sprints", sprints);
        results.put("totalResults", sprints.size());
        
        return results;
    }

    /**
     * Search stories
     */
    public Map<String, Object> searchStories(String query) {
        Map<String, Object> results = new HashMap<>();
        
        List<Story> stories = storyRepository.findAll().stream()
            .filter(story -> story.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                             (story.getDescription() != null && story.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("stories", stories);
        results.put("totalResults", stories.size());
        
        return results;
    }

    /**
     * Search tasks
     */
    public Map<String, Object> searchTasks(String query) {
        Map<String, Object> results = new HashMap<>();
        
        List<Task> tasks = taskRepository.findAll().stream()
            .filter(task -> task.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                            (task.getDescription() != null && task.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("tasks", tasks);
        results.put("totalResults", tasks.size());
        
        return results;
    }

    /**
     * Search subtasks
     */
    public Map<String, Object> searchSubtasks(String query) {
        Map<String, Object> results = new HashMap<>();
        
        List<Subtask> subtasks = subtaskRepository.findAll().stream()
            .filter(task -> task.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                            (task.getDescription() != null && task.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("subtasks", subtasks);
        results.put("totalResults", subtasks.size());
        
        return results;
    }

    /**
     * Search users
     */
    public Map<String, Object> searchUsers(String query) {
        Map<String, Object> results = new HashMap<>();
        
        List<User> users = userRepository.findAll().stream()
            .filter(user -> user.getName().toLowerCase().contains(query.toLowerCase()) || 
                            (user.getEmail() != null && user.getEmail().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
        results.put("users", users);
        results.put("totalResults", users.size());
        
        return results;
    }

    /**
     * Advanced search with filters
     */
    public Map<String, Object> advancedSearch(Map<String, Object> searchCriteria) {
        Map<String, Object> results = new HashMap<>();
        
        String entityType = (String) searchCriteria.get("entityType");
        String query = (String) searchCriteria.get("query");
        
        if ("project".equals(entityType)) {
            List<Project> projects = projectRepository.findAll().stream()
            .filter(project -> project.getName().toLowerCase().contains(query.toLowerCase()) || 
                              (project.getDescription() != null && project.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
            results.put("projects", projects);
        } else if ("sprint".equals(entityType)) {
            List<Sprint> sprints = sprintRepository.findAll().stream()
            .filter(sprint -> sprint.getName().toLowerCase().contains(query.toLowerCase()))
            .collect(Collectors.toList());
            results.put("sprints", sprints);
        } else if ("story".equals(entityType)) {
            List<Story> stories = storyRepository.findAll().stream()
            .filter(story -> story.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                             (story.getDescription() != null && story.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
            results.put("stories", stories);
        } else if ("task".equals(entityType)) {
            List<Task> tasks = taskRepository.findAll().stream()
            .filter(task -> task.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                            (task.getDescription() != null && task.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
            results.put("tasks", tasks);
        } else if ("subtask".equals(entityType)) {
            List<Subtask> subtasks = subtaskRepository.findAll().stream()
            .filter(task -> task.getTitle().toLowerCase().contains(query.toLowerCase()) || 
                            (task.getDescription() != null && task.getDescription().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
            results.put("subtasks", subtasks);
        } else if ("user".equals(entityType)) {
            List<User> users = userRepository.findAll().stream()
            .filter(user -> user.getName().toLowerCase().contains(query.toLowerCase()) || 
                            (user.getEmail() != null && user.getEmail().toLowerCase().contains(query.toLowerCase())))
            .collect(Collectors.toList());
            results.put("users", users);
        } else {
            // Global search if no entity type specified
            return globalSearch(query);
        }
        
        return results;
    }

    /**
     * Search by tags
     */
    public Map<String, Object> searchByTags(String tags) {
        Map<String, Object> results = new HashMap<>();
        
        // Note: Task and Subtask entities don't have tags field in current database schema
        // Tag search functionality not available with current schema
        List<Task> tasksWithTags = new ArrayList<>();
        List<Subtask> subtasksWithTags = new ArrayList<>();
        
        results.put("tasks", tasksWithTags);
        results.put("subtasks", subtasksWithTags);
        results.put("totalResults", tasksWithTags.size() + subtasksWithTags.size());
        
        return results;
    }

    /**
     * Search by date range
     */
    public Map<String, Object> searchByDateRange(LocalDate startDate, LocalDate endDate, String entityType) {
        Map<String, Object> results = new HashMap<>();
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        if (entityType == null || "project".equals(entityType)) {
            List<Project> projects = projectRepository.findAll().stream()
                .filter(project -> project.getCreatedAt().isAfter(startDateTime) && project.getCreatedAt().isBefore(endDateTime))
                .collect(Collectors.toList());
            results.put("projects", projects);
        }
        
        if (entityType == null || "sprint".equals(entityType)) {
            List<Sprint> sprints = sprintRepository.findByCreatedAtBetween(startDateTime, endDateTime);
            results.put("sprints", sprints);
        }
        
        if (entityType == null || "story".equals(entityType)) {
            List<Story> stories = storyRepository.findAll().stream()
                .filter(story -> story.getCreatedAt().isAfter(startDateTime) && story.getCreatedAt().isBefore(endDateTime))
                .collect(Collectors.toList());
            results.put("stories", stories);
        }
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = taskRepository.findByCreatedAtBetween(startDateTime, endDateTime);
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = subtaskRepository.findByCreatedAtBetween(startDateTime, endDateTime);
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by status
     */
    public Map<String, Object> searchByStatus(String status, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "sprint".equals(entityType)) {
            try {
                com.sprintsync.api.entity.enums.SprintStatus sprintStatus = 
                    com.sprintsync.api.entity.enums.SprintStatus.valueOf(status.toUpperCase());
                List<Sprint> sprints = sprintRepository.findByStatus(sprintStatus);
                results.put("sprints", sprints);
            } catch (IllegalArgumentException e) {
                // Invalid status for sprints
            }
        }
        
        if (entityType == null || "story".equals(entityType)) {
            try {
                com.sprintsync.api.entity.enums.StoryStatus storyStatus = 
                    com.sprintsync.api.entity.enums.StoryStatus.valueOf(status.toUpperCase());
                List<Story> stories = storyRepository.findByStatus(storyStatus);
                results.put("stories", stories);
            } catch (IllegalArgumentException e) {
                // Invalid status for stories
            }
        }
        
        if (entityType == null || "task".equals(entityType)) {
            try {
                com.sprintsync.api.entity.enums.TaskStatus taskStatus = 
                    com.sprintsync.api.entity.enums.TaskStatus.valueOf(status.toUpperCase());
                List<Task> tasks = taskRepository.findByStatus(taskStatus);
                results.put("tasks", tasks);
            } catch (IllegalArgumentException e) {
                // Invalid status for tasks
            }
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have status field
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by priority
     */
    public Map<String, Object> searchByPriority(String priority, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "story".equals(entityType)) {
            try {
                com.sprintsync.api.entity.enums.StoryPriority storyPriority = 
                    com.sprintsync.api.entity.enums.StoryPriority.valueOf(priority.toUpperCase());
                List<Story> stories = storyRepository.findByPriority(storyPriority);
                results.put("stories", stories);
            } catch (IllegalArgumentException e) {
                // Invalid priority for stories
            }
        }
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = taskRepository.findByPriority(priority);
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have priority field
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by assignee
     */
    public Map<String, Object> searchByAssignee(String assigneeId, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "story".equals(entityType)) {
            List<Story> stories = storyRepository.findByAssigneeId(assigneeId);
            results.put("stories", stories);
        }
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = taskRepository.findByAssigneeId(assigneeId);
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = subtaskRepository.findByAssigneeId(assigneeId);
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by project
     */
    public Map<String, Object> searchByProject(String projectId, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "sprint".equals(entityType)) {
            List<Sprint> sprints = sprintRepository.findByProjectId(projectId);
            results.put("sprints", sprints);
        }
        
        if (entityType == null || "story".equals(entityType)) {
            List<Story> stories = storyRepository.findByProjectId(projectId);
            results.put("stories", stories);
        }
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have projectId field
            results.put("subtasks", subtasks);
        }
        
        if (entityType == null || "epic".equals(entityType)) {
            List<Epic> epics = epicRepository.findByProjectId(projectId);
            results.put("epics", epics);
        }
        
        if (entityType == null || "release".equals(entityType)) {
            List<Release> releases = releaseRepository.findByProjectId(projectId);
            results.put("releases", releases);
        }
        
        return results;
    }

    /**
     * Search by sprint
     */
    public Map<String, Object> searchBySprint(String sprintId, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "story".equals(entityType)) {
            List<Story> stories = storyRepository.findBySprintId(sprintId);
            results.put("stories", stories);
        }
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = Collections.emptyList(); // Note: Task entity doesn't have sprintId field;
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have sprintId field
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by story
     */
    public Map<String, Object> searchByStory(String storyId, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = taskRepository.findByStoryId(storyId);
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have storyId field
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by epic
     */
    public Map<String, Object> searchByEpic(String epicId, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "story".equals(entityType)) {
            List<Story> stories = storyRepository.findByEpicId(epicId);
            results.put("stories", stories);
        }
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = Collections.emptyList(); // Note: Task entity doesn't have epicId field
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have epicId field
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by release
     */
    public Map<String, Object> searchByRelease(String releaseId, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "story".equals(entityType)) {
            List<Story> stories = storyRepository.findByReleaseId(releaseId);
            results.put("stories", stories);
        }
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = Collections.emptyList(); // Note: Task entity doesn't have releaseId field
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have releaseId field
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by team
     */
    public Map<String, Object> searchByTeam(String teamId, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        // This would require team relationships in entities
        // For now, return empty results
        results.put("message", "Team search not implemented yet");
        
        return results;
    }

    /**
     * Search by department
     */
    public Map<String, Object> searchByDepartment(String departmentId, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "user".equals(entityType)) {
            List<User> users = userRepository.findByDepartmentId(departmentId);
            results.put("users", users);
        }
        
        return results;
    }

    /**
     * Search by domain
     */
    public Map<String, Object> searchByDomain(String domainId, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "user".equals(entityType)) {
            List<User> users = userRepository.findByDomainId(domainId);
            results.put("users", users);
        }
        
        return results;
    }

    /**
     * Search by effort range
     */
    public Map<String, Object> searchByEffortRange(Integer minEffort, Integer maxEffort, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "task".equals(entityType)) {
            // Note: Task entity doesn't have estimatedEffort field in current database schema
            List<Task> tasks = taskRepository.findAll();
            results.put("tasks", tasks);
            results.put("note", "Task effort filtering not available - estimatedEffort field not present in current schema");
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks;
            if (minEffort != null && maxEffort != null) {
                subtasks = Collections.emptyList(); // Note: Subtask entity has estimatedHours (BigDecimal), not estimatedEffort (Integer)
            } else if (minEffort != null) {
                subtasks = Collections.emptyList(); // Note: Subtask entity has estimatedHours (BigDecimal), not estimatedEffort (Integer)
            } else if (maxEffort != null) {
                subtasks = Collections.emptyList(); // Note: Subtask entity has estimatedHours (BigDecimal), not estimatedEffort (Integer)
            } else {
                subtasks = subtaskRepository.findAll();
            }
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by completion percentage
     */
    public Map<String, Object> searchByCompletionPercentage(Integer minPercentage, Integer maxPercentage, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "sprint".equals(entityType)) {
            List<Sprint> sprints;
            if (minPercentage != null && maxPercentage != null) {
                sprints = Collections.emptyList(); // Note: Sprint entity doesn't have completionPercentage field
            } else if (minPercentage != null) {
                sprints = Collections.emptyList(); // Note: Sprint entity doesn't have completionPercentage field
            } else {
                sprints = sprintRepository.findAll();
            }
            results.put("sprints", sprints);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks;
            if (minPercentage != null && maxPercentage != null) {
                subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have completionPercentage field
            } else if (minPercentage != null) {
                subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have completionPercentage field
            } else {
                subtasks = subtaskRepository.findAll();
            }
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by time spent
     */
    public Map<String, Object> searchByTimeSpent(Integer minTime, Integer maxTime, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks;
            if (minTime != null) {
                tasks = taskRepository.findTasksByTimeSpent(minTime);
            } else {
                tasks = taskRepository.findAll();
            }
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks;
            if (minTime != null) {
                subtasks = subtaskRepository.findSubtasksByTimeSpent(minTime);
            } else {
                subtasks = subtaskRepository.findAll();
            }
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by complexity
     */
    public Map<String, Object> searchByComplexity(String complexity, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = Collections.emptyList(); // Note: Task entity doesn't have complexity field
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have complexity field
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by risk level
     */
    public Map<String, Object> searchByRiskLevel(String riskLevel, String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = Collections.emptyList(); // Note: Task entity doesn't have riskLevel field
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have riskLevel field
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search by dependencies
     */
    public Map<String, Object> searchByDependencies(String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = Collections.emptyList(); // Note: Task entity doesn't have dependencies field
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have dependencies field
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search blocked items
     */
    public Map<String, Object> searchBlockedItems(String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = taskRepository.findBlockedTasks();
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = Collections.emptyList(); // Note: Subtask entity doesn't have status field
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search overdue items
     */
    public Map<String, Object> searchOverdueItems(String entityType) {
        Map<String, Object> results = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = taskRepository.findOverdueTasks(now);
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = subtaskRepository.findAll().stream()
                .filter(subtask -> subtask.getDueDate() != null && subtask.getDueDate().isBefore(now.toLocalDate()))
                .filter(subtask -> !subtask.getIsCompleted())
                .collect(Collectors.toList());
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Search unassigned items
     */
    public Map<String, Object> searchUnassignedItems(String entityType) {
        Map<String, Object> results = new HashMap<>();
        
        if (entityType == null || "task".equals(entityType)) {
            List<Task> tasks = taskRepository.findUnassignedTasks();
            results.put("tasks", tasks);
        }
        
        if (entityType == null || "subtask".equals(entityType)) {
            List<Subtask> subtasks = subtaskRepository.findUnassignedSubtasks();
            results.put("subtasks", subtasks);
        }
        
        return results;
    }

    /**
     * Get search suggestions
     */
    public List<String> getSearchSuggestions(String query) {
        List<String> suggestions = new ArrayList<>();
        
        // Add project names
        List<Project> projects = projectRepository.findByNameContainingIgnoreCase(query);
        suggestions.addAll(projects.stream()
            .map(Project::getName)
            .limit(5)
            .collect(Collectors.toList()));
        
        // Add sprint names
        List<Sprint> sprints = sprintRepository.findByNameContainingIgnoreCase(query);
        suggestions.addAll(sprints.stream()
            .map(Sprint::getName)
            .limit(5)
            .collect(Collectors.toList()));
        
        // Add story titles
        List<Story> stories = storyRepository.findByTitleContainingIgnoreCase(query);
        suggestions.addAll(stories.stream()
            .map(Story::getTitle)
            .limit(5)
            .collect(Collectors.toList()));
        
        // Add task titles
        List<Task> tasks = taskRepository.findByTitleContainingIgnoreCase(query);
        suggestions.addAll(tasks.stream()
            .map(Task::getTitle)
            .limit(5)
            .collect(Collectors.toList()));
        
        // Add user names
        List<User> users = userRepository.findByNameContainingIgnoreCase(query);
        suggestions.addAll(users.stream()
            .map(User::getName)
            .limit(5)
            .collect(Collectors.toList()));
        
        return suggestions.stream().distinct().limit(10).collect(Collectors.toList());
    }

    /**
     * Get search history for user
     */
    public List<String> getSearchHistory(String userId) {
        return searchHistory.getOrDefault(userId, new ArrayList<>());
    }

    /**
     * Save search query to history
     */
    public void saveSearchQuery(String userId, String query) {
        List<String> history = searchHistory.getOrDefault(userId, new ArrayList<>());
        history.add(0, query); // Add to beginning
        
        // Keep only last 20 searches
        if (history.size() > 20) {
            history = history.subList(0, 20);
        }
        
        searchHistory.put(userId, history);
    }

    /**
     * Clear search history for user
     */
    public void clearSearchHistory(String userId) {
        searchHistory.put(userId, new ArrayList<>());
    }
}
