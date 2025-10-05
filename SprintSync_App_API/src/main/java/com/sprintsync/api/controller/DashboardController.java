package com.sprintsync.api.controller;

import com.sprintsync.api.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * REST Controller for Dashboard operations.
 * Provides endpoints for dashboard data and analytics.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * Get overall dashboard statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        try {
            Map<String, Object> statistics = dashboardService.getDashboardStatistics();
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get dashboard statistics for a specific project
     */
    @GetMapping("/statistics/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectDashboardStatistics(@PathVariable String projectId) {
        try {
            Map<String, Object> statistics = dashboardService.getProjectDashboardStatistics(projectId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get dashboard statistics for a specific user
     */
    @GetMapping("/statistics/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserDashboardStatistics(@PathVariable String userId) {
        try {
            Map<String, Object> statistics = dashboardService.getUserDashboardStatistics(userId);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get recent activities
     */
    @GetMapping("/activities")
    public ResponseEntity<Map<String, Object>> getRecentActivities() {
        try {
            Map<String, Object> activities = dashboardService.getRecentActivities();
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get recent activities for a specific project
     */
    @GetMapping("/activities/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectRecentActivities(@PathVariable String projectId) {
        try {
            Map<String, Object> activities = dashboardService.getProjectRecentActivities(projectId);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get recent activities for a specific user
     */
    @GetMapping("/activities/user/{userId}")
    public ResponseEntity<Map<String, Object>> getUserRecentActivities(@PathVariable String userId) {
        try {
            Map<String, Object> activities = dashboardService.getUserRecentActivities(userId);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprint progress overview
     */
    @GetMapping("/sprint-progress")
    public ResponseEntity<Map<String, Object>> getSprintProgressOverview() {
        try {
            Map<String, Object> progress = dashboardService.getSprintProgressOverview();
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get sprint progress for a specific project
     */
    @GetMapping("/sprint-progress/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectSprintProgress(@PathVariable String projectId) {
        try {
            Map<String, Object> progress = dashboardService.getProjectSprintProgress(projectId);
            return ResponseEntity.ok(progress);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get team performance metrics
     */
    @GetMapping("/team-performance")
    public ResponseEntity<Map<String, Object>> getTeamPerformanceMetrics() {
        try {
            Map<String, Object> metrics = dashboardService.getTeamPerformanceMetrics();
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get team performance metrics for a specific project
     */
    @GetMapping("/team-performance/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectTeamPerformance(@PathVariable String projectId) {
        try {
            Map<String, Object> metrics = dashboardService.getProjectTeamPerformance(projectId);
            return ResponseEntity.ok(metrics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get velocity trends
     */
    @GetMapping("/velocity-trends")
    public ResponseEntity<Map<String, Object>> getVelocityTrends() {
        try {
            Map<String, Object> trends = dashboardService.getVelocityTrends();
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get velocity trends for a specific project
     */
    @GetMapping("/velocity-trends/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectVelocityTrends(@PathVariable String projectId) {
        try {
            Map<String, Object> trends = dashboardService.getProjectVelocityTrends(projectId);
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get burndown chart data
     */
    @GetMapping("/burndown")
    public ResponseEntity<Map<String, Object>> getBurndownChartData() {
        try {
            Map<String, Object> burndown = dashboardService.getBurndownChartData();
            return ResponseEntity.ok(burndown);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get burndown chart data for a specific sprint
     */
    @GetMapping("/burndown/sprint/{sprintId}")
    public ResponseEntity<Map<String, Object>> getSprintBurndownChartData(@PathVariable String sprintId) {
        try {
            Map<String, Object> burndown = dashboardService.getSprintBurndownChartData(sprintId);
            return ResponseEntity.ok(burndown);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get task distribution
     */
    @GetMapping("/task-distribution")
    public ResponseEntity<Map<String, Object>> getTaskDistribution() {
        try {
            Map<String, Object> distribution = dashboardService.getTaskDistribution();
            return ResponseEntity.ok(distribution);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get task distribution for a specific project
     */
    @GetMapping("/task-distribution/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectTaskDistribution(@PathVariable String projectId) {
        try {
            Map<String, Object> distribution = dashboardService.getProjectTaskDistribution(projectId);
            return ResponseEntity.ok(distribution);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get priority distribution
     */
    @GetMapping("/priority-distribution")
    public ResponseEntity<Map<String, Object>> getPriorityDistribution() {
        try {
            Map<String, Object> distribution = dashboardService.getPriorityDistribution();
            return ResponseEntity.ok(distribution);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get priority distribution for a specific project
     */
    @GetMapping("/priority-distribution/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectPriorityDistribution(@PathVariable String projectId) {
        try {
            Map<String, Object> distribution = dashboardService.getProjectPriorityDistribution(projectId);
            return ResponseEntity.ok(distribution);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get overdue items
     */
    @GetMapping("/overdue")
    public ResponseEntity<Map<String, Object>> getOverdueItems() {
        try {
            Map<String, Object> overdueItems = dashboardService.getOverdueItems();
            return ResponseEntity.ok(overdueItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get overdue items for a specific project
     */
    @GetMapping("/overdue/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectOverdueItems(@PathVariable String projectId) {
        try {
            Map<String, Object> overdueItems = dashboardService.getProjectOverdueItems(projectId);
            return ResponseEntity.ok(overdueItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get upcoming deadlines
     */
    @GetMapping("/upcoming-deadlines")
    public ResponseEntity<Map<String, Object>> getUpcomingDeadlines() {
        try {
            Map<String, Object> deadlines = dashboardService.getUpcomingDeadlines();
            return ResponseEntity.ok(deadlines);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get upcoming deadlines for a specific project
     */
    @GetMapping("/upcoming-deadlines/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectUpcomingDeadlines(@PathVariable String projectId) {
        try {
            Map<String, Object> deadlines = dashboardService.getProjectUpcomingDeadlines(projectId);
            return ResponseEntity.ok(deadlines);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get team allocation overview
     */
    @GetMapping("/team-allocation")
    public ResponseEntity<Map<String, Object>> getTeamAllocationOverview() {
        try {
            Map<String, Object> allocation = dashboardService.getTeamAllocationOverview();
            return ResponseEntity.ok(allocation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get team allocation for a specific project
     */
    @GetMapping("/team-allocation/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectTeamAllocation(@PathVariable String projectId) {
        try {
            Map<String, Object> allocation = dashboardService.getProjectTeamAllocation(projectId);
            return ResponseEntity.ok(allocation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get project health metrics
     */
    @GetMapping("/project-health")
    public ResponseEntity<Map<String, Object>> getProjectHealthMetrics() {
        try {
            Map<String, Object> health = dashboardService.getProjectHealthMetrics();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get project health metrics for a specific project
     */
    @GetMapping("/project-health/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getSpecificProjectHealth(@PathVariable String projectId) {
        try {
            Map<String, Object> health = dashboardService.getSpecificProjectHealth(projectId);
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get custom date range statistics
     */
    @GetMapping("/statistics/date-range")
    public ResponseEntity<Map<String, Object>> getDateRangeStatistics(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            Map<String, Object> statistics = dashboardService.getDateRangeStatistics(start, end);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get custom date range statistics for a specific project
     */
    @GetMapping("/statistics/date-range/project/{projectId}")
    public ResponseEntity<Map<String, Object>> getProjectDateRangeStatistics(
            @PathVariable String projectId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            Map<String, Object> statistics = dashboardService.getProjectDateRangeStatistics(projectId, start, end);
            return ResponseEntity.ok(statistics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
