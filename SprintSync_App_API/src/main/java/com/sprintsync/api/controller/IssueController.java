package com.sprintsync.api.controller;

import com.sprintsync.api.entity.Issue;
import com.sprintsync.api.entity.enums.TaskStatus;
import com.sprintsync.api.service.IssueService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Issue management operations.
 * Provides endpoints for CRUD operations on Issue entities.
 * 
 * @author SprintSync Team
 */
@RestController
@RequestMapping("/api/issues")
@CrossOrigin(origins = "*")
public class IssueController {

    @Autowired
    private IssueService issueService;

    /**
     * Get all issues with pagination
     */
    @GetMapping
    public ResponseEntity<Page<Issue>> getAllIssues(Pageable pageable) {
        try {
            Page<Issue> issues = issueService.getAllIssues(pageable);
            return ResponseEntity.ok(issues);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all issues without pagination
     */
    @GetMapping("/all")
    public ResponseEntity<List<Issue>> getAllIssuesList() {
        try {
            List<Issue> issues = issueService.getAllIssues();
            return ResponseEntity.ok(issues);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get issue by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Issue> getIssueById(@PathVariable String id) {
        try {
            Issue issue = issueService.getIssueById(id);
            if (issue != null) {
                return ResponseEntity.ok(issue);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a new issue
     */
    @PostMapping
    public ResponseEntity<Issue> createIssue(@Valid @RequestBody Issue issue) {
        try {
            Issue createdIssue = issueService.createIssue(issue);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdIssue);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update an existing issue
     */
    @PutMapping("/{id}")
    public ResponseEntity<Issue> updateIssue(@PathVariable String id, @Valid @RequestBody Issue issue) {
        try {
            issue.setId(id);
            Issue updatedIssue = issueService.updateIssue(issue);
            if (updatedIssue != null) {
                return ResponseEntity.ok(updatedIssue);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Delete an issue
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIssue(@PathVariable String id) {
        try {
            boolean deleted = issueService.deleteIssue(id);
            if (deleted) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get issues by story ID
     */
    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<Issue>> getIssuesByStory(@PathVariable String storyId) {
        try {
            List<Issue> issues = issueService.getIssuesByStoryId(storyId);
            return ResponseEntity.ok(issues);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get issues by assignee ID
     */
    @GetMapping("/assignee/{assigneeId}")
    public ResponseEntity<List<Issue>> getIssuesByAssignee(@PathVariable String assigneeId) {
        try {
            List<Issue> issues = issueService.getIssuesByAssigneeId(assigneeId);
            return ResponseEntity.ok(issues);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get issues by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Issue>> getIssuesByStatus(@PathVariable TaskStatus status) {
        try {
            List<Issue> issues = issueService.getIssuesByStatus(status);
            return ResponseEntity.ok(issues);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update issue status
     * Supports both TaskStatus enum values and custom lane status strings
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Issue> updateIssueStatus(@PathVariable String id,
            @RequestBody Map<String, Object> statusUpdate) {
        try {
            Object statusObj = statusUpdate.get("status");
            Issue updatedIssue;

            if (statusObj instanceof String) {
                // Handle custom lane status strings or enum string values
                String statusValue = (String) statusObj;
                updatedIssue = issueService.updateIssueStatus(id, statusValue);
            } else if (statusObj instanceof TaskStatus) {
                // Handle TaskStatus enum
                TaskStatus status = (TaskStatus) statusObj;
                updatedIssue = issueService.updateIssueStatus(id, status);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            if (updatedIssue != null) {
                return ResponseEntity.ok(updatedIssue);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update issue assignee
     */
    @PatchMapping("/{id}/assignee")
    public ResponseEntity<Issue> updateIssueAssignee(@PathVariable String id,
            @RequestBody Map<String, Object> update) {
        try {
            String assigneeId = (String) update.get("assigneeId");
            if (assigneeId == null) {
                return ResponseEntity.badRequest().build();
            }
            Issue updatedIssue = issueService.updateIssueAssignee(id, assigneeId);
            if (updatedIssue != null) {
                return ResponseEntity.ok(updatedIssue);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update issue estimated hours (for manager controls)
     */
    @PatchMapping("/{id}/estimated-hours")
    public ResponseEntity<Issue> updateIssueEstimatedHours(@PathVariable String id,
            @RequestBody Map<String, Object> update) {
        try {
            Object estimatedHoursObj = update.get("estimatedHours");
            java.math.BigDecimal estimatedHours;

            // Convert to BigDecimal, handling both Integer and Double types
            if (estimatedHoursObj instanceof Integer) {
                estimatedHours = java.math.BigDecimal.valueOf((Integer) estimatedHoursObj);
            } else if (estimatedHoursObj instanceof Double) {
                estimatedHours = java.math.BigDecimal.valueOf((Double) estimatedHoursObj);
            } else if (estimatedHoursObj instanceof java.math.BigDecimal) {
                estimatedHours = (java.math.BigDecimal) estimatedHoursObj;
            } else {
                return ResponseEntity.badRequest().build();
            }

            Issue updatedIssue = issueService.updateIssueEstimatedHours(id, estimatedHours);
            if (updatedIssue != null) {
                return ResponseEntity.ok(updatedIssue);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Update issue actual hours (for effort logging)
     */
    @PatchMapping("/{id}/actual-hours")
    public ResponseEntity<Issue> updateIssueActualHours(@PathVariable String id,
            @RequestBody Map<String, Object> update) {
        try {
            Object actualHoursObj = update.get("actualHours");
            java.math.BigDecimal actualHours;

            // Convert to BigDecimal, handling both Integer and Double types
            if (actualHoursObj instanceof Integer) {
                actualHours = java.math.BigDecimal.valueOf((Integer) actualHoursObj);
            } else if (actualHoursObj instanceof Double) {
                actualHours = java.math.BigDecimal.valueOf((Double) actualHoursObj);
            } else if (actualHoursObj instanceof java.math.BigDecimal) {
                actualHours = (java.math.BigDecimal) actualHoursObj;
            } else {
                return ResponseEntity.badRequest().build();
            }

            Issue updatedIssue = issueService.updateIssueActualHours(id, actualHours);
            if (updatedIssue != null) {
                return ResponseEntity.ok(updatedIssue);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}
