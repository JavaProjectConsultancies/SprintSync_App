package com.sprintsync.api.controller;

import com.sprintsync.api.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for Search operations.
 * Provides endpoints for advanced search functionality across entities.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private SearchService searchService;

    /**
     * Global search across all entities
     */
    @GetMapping("/global")
    public ResponseEntity<Map<String, Object>> globalSearch(@RequestParam String query) {
        try {
            Map<String, Object> results = searchService.globalSearch(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search projects
     */
    @GetMapping("/projects")
    public ResponseEntity<Map<String, Object>> searchProjects(@RequestParam String query) {
        try {
            Map<String, Object> results = searchService.searchProjects(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search sprints
     */
    @GetMapping("/sprints")
    public ResponseEntity<Map<String, Object>> searchSprints(@RequestParam String query) {
        try {
            Map<String, Object> results = searchService.searchSprints(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search stories
     */
    @GetMapping("/stories")
    public ResponseEntity<Map<String, Object>> searchStories(@RequestParam String query) {
        try {
            Map<String, Object> results = searchService.searchStories(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search tasks
     */
    @GetMapping("/tasks")
    public ResponseEntity<Map<String, Object>> searchTasks(@RequestParam String query) {
        try {
            Map<String, Object> results = searchService.searchTasks(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search subtasks
     */
    @GetMapping("/subtasks")
    public ResponseEntity<Map<String, Object>> searchSubtasks(@RequestParam String query) {
        try {
            Map<String, Object> results = searchService.searchSubtasks(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search users
     */
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> searchUsers(@RequestParam String query) {
        try {
            Map<String, Object> results = searchService.searchUsers(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Advanced search with filters
     */
    @PostMapping("/advanced")
    public ResponseEntity<Map<String, Object>> advancedSearch(@RequestBody Map<String, Object> searchCriteria) {
        try {
            Map<String, Object> results = searchService.advancedSearch(searchCriteria);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Search by tags
     */
    @GetMapping("/tags")
    public ResponseEntity<Map<String, Object>> searchByTags(@RequestParam String tags) {
        try {
            Map<String, Object> results = searchService.searchByTags(tags);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<Map<String, Object>> searchByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(required = false) String entityType) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            Map<String, Object> results = searchService.searchByDateRange(start, end, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Search by status
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> searchByStatus(
            @RequestParam String status,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByStatus(status, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by priority
     */
    @GetMapping("/priority")
    public ResponseEntity<Map<String, Object>> searchByPriority(
            @RequestParam String priority,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByPriority(priority, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by assignee
     */
    @GetMapping("/assignee")
    public ResponseEntity<Map<String, Object>> searchByAssignee(
            @RequestParam String assigneeId,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByAssignee(assigneeId, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by project
     */
    @GetMapping("/project")
    public ResponseEntity<Map<String, Object>> searchByProject(
            @RequestParam String projectId,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByProject(projectId, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by sprint
     */
    @GetMapping("/sprint")
    public ResponseEntity<Map<String, Object>> searchBySprint(
            @RequestParam String sprintId,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchBySprint(sprintId, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by story
     */
    @GetMapping("/story")
    public ResponseEntity<Map<String, Object>> searchByStory(
            @RequestParam String storyId,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByStory(storyId, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by epic
     */
    @GetMapping("/epic")
    public ResponseEntity<Map<String, Object>> searchByEpic(
            @RequestParam String epicId,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByEpic(epicId, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by release
     */
    @GetMapping("/release")
    public ResponseEntity<Map<String, Object>> searchByRelease(
            @RequestParam String releaseId,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByRelease(releaseId, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by team
     */
    @GetMapping("/team")
    public ResponseEntity<Map<String, Object>> searchByTeam(
            @RequestParam String teamId,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByTeam(teamId, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by department
     */
    @GetMapping("/department")
    public ResponseEntity<Map<String, Object>> searchByDepartment(
            @RequestParam String departmentId,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByDepartment(departmentId, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by domain
     */
    @GetMapping("/domain")
    public ResponseEntity<Map<String, Object>> searchByDomain(
            @RequestParam String domainId,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByDomain(domainId, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by effort range
     */
    @GetMapping("/effort")
    public ResponseEntity<Map<String, Object>> searchByEffortRange(
            @RequestParam(required = false) Integer minEffort,
            @RequestParam(required = false) Integer maxEffort,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByEffortRange(minEffort, maxEffort, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by completion percentage
     */
    @GetMapping("/completion")
    public ResponseEntity<Map<String, Object>> searchByCompletionPercentage(
            @RequestParam Integer minPercentage,
            @RequestParam(required = false) Integer maxPercentage,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByCompletionPercentage(minPercentage, maxPercentage, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by time spent
     */
    @GetMapping("/time-spent")
    public ResponseEntity<Map<String, Object>> searchByTimeSpent(
            @RequestParam(required = false) Integer minTime,
            @RequestParam(required = false) Integer maxTime,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByTimeSpent(minTime, maxTime, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by complexity
     */
    @GetMapping("/complexity")
    public ResponseEntity<Map<String, Object>> searchByComplexity(
            @RequestParam String complexity,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByComplexity(complexity, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by risk level
     */
    @GetMapping("/risk")
    public ResponseEntity<Map<String, Object>> searchByRiskLevel(
            @RequestParam String riskLevel,
            @RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchByRiskLevel(riskLevel, entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search by dependencies
     */
    @GetMapping("/dependencies")
    public ResponseEntity<Map<String, Object>> searchByDependencies(@RequestParam String entityType) {
        try {
            Map<String, Object> results = searchService.searchByDependencies(entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search blocked items
     */
    @GetMapping("/blocked")
    public ResponseEntity<Map<String, Object>> searchBlockedItems(@RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchBlockedItems(entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search overdue items
     */
    @GetMapping("/overdue")
    public ResponseEntity<Map<String, Object>> searchOverdueItems(@RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchOverdueItems(entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Search unassigned items
     */
    @GetMapping("/unassigned")
    public ResponseEntity<Map<String, Object>> searchUnassignedItems(@RequestParam(required = false) String entityType) {
        try {
            Map<String, Object> results = searchService.searchUnassignedItems(entityType);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get search suggestions
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSearchSuggestions(@RequestParam String query) {
        try {
            List<String> suggestions = searchService.getSearchSuggestions(query);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get search history for user
     */
    @GetMapping("/history")
    public ResponseEntity<List<String>> getSearchHistory(@RequestParam String userId) {
        try {
            List<String> history = searchService.getSearchHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Save search query to history
     */
    @PostMapping("/history")
    public ResponseEntity<Void> saveSearchQuery(@RequestParam String userId, @RequestParam String query) {
        try {
            searchService.saveSearchQuery(userId, query);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Clear search history for user
     */
    @DeleteMapping("/history")
    public ResponseEntity<Void> clearSearchHistory(@RequestParam String userId) {
        try {
            searchService.clearSearchHistory(userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
