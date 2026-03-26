package com.sprintsync.api.service;

import com.sprintsync.api.entity.Issue;
import com.sprintsync.api.entity.enums.TaskStatus;
import com.sprintsync.api.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Issue management operations.
 * Provides business logic for Issue entities.
 * Similar to TaskService but for Issues.
 * 
 * @author SprintSync Team
 */
@Service
@SuppressWarnings("null")
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private IdGenerationService idGenerationService;

    @Autowired
    private NotificationService notificationService;

    @Autowired(required = false)
    private com.sprintsync.api.service.ActivityLogService activityLogService;

    /**
     * Get all issues with pagination
     */
    public Page<Issue> getAllIssues(Pageable pageable) {
        return issueRepository.findAll(pageable);
    }

    /**
     * Get all issues without pagination
     */
    public List<Issue> getAllIssues() {
        return issueRepository.findAll();
    }

    /**
     * Get issue by ID
     */
    public Issue getIssueById(String id) {
        Issue issue = issueRepository.findById(id).orElse(null);
        if (issue != null) {
            try {
                String rawStatus = issueRepository.findStatusById(id);
                if (rawStatus != null) {
                    if (rawStatus.startsWith("custom_lane_")) {
                        issue.setRawStatus(rawStatus);
                    } else {
                        try {
                            TaskStatus enumStatus = TaskStatus.fromValue(rawStatus);
                            if (!enumStatus.equals(issue.getStatus())) {
                                issue.setRawStatus(rawStatus);
                            }
                        } catch (IllegalArgumentException e) {
                            issue.setRawStatus(rawStatus);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error getting raw status for issue " + id + ": " + e.getMessage());
            }
        }
        return issue;
    }

    /**
     * Create a new issue
     */
    public Issue createIssue(Issue issue) {
        // Validate that storyId is provided and not empty
        if (issue.getStoryId() == null || issue.getStoryId().trim().isEmpty()) {
            throw new IllegalArgumentException("Issue must be linked to a story. Story ID is required.");
        }

        if (issue.getId() == null) {
            // Generate issue ID similar to task ID
            issue.setId(idGenerationService.generateIssueId());
        }

        // Auto-assign issue number
        if ((issue.getIssueNumber() == null || issue.getIssueNumber() == 0) && issue.getStoryId() != null) {
            Integer maxIssueNumber = issueRepository.findMaxIssueNumberByStoryId(issue.getStoryId());
            if (maxIssueNumber == null) {
                maxIssueNumber = 0;
            }
            issue.setIssueNumber(maxIssueNumber + 1);
        }

        issue.setCreatedAt(LocalDateTime.now());
        issue.setUpdatedAt(LocalDateTime.now());
        Issue savedIssue = issueRepository.save(issue);

        // Create notification if issue is created with an assignee
        if (savedIssue.getAssigneeId() != null && !savedIssue.getAssigneeId().isEmpty()) {
            try {
                String title = "New Issue Assignment";
                String message = "You have been assigned to issue: " + savedIssue.getTitle();
                notificationService.createNotification(
                        savedIssue.getAssigneeId(),
                        title,
                        message,
                        "issue",
                        "issue",
                        savedIssue.getId());
            } catch (Exception e) {
                System.err.println("Failed to create notification for issue creation: " + e.getMessage());
            }
        }

        return savedIssue;
    }

    /**
     * Update an existing issue
     */
    public Issue updateIssue(Issue issue) {
        if (issueRepository.existsById(issue.getId())) {
            Optional<Issue> existingIssueOpt = issueRepository.findById(issue.getId());
            if (existingIssueOpt.isPresent()) {
                Issue existingIssue = existingIssueOpt.get();
                String oldAssigneeId = existingIssue.getAssigneeId();
                String newAssigneeId = issue.getAssigneeId();

                // Check if assignee changed and create notification
                if (newAssigneeId != null && !newAssigneeId.isEmpty() &&
                        !newAssigneeId.equals(oldAssigneeId)) {
                    try {
                        String title = "New Issue Assignment";
                        String message = "You have been assigned to issue: " + issue.getTitle();
                        notificationService.createNotification(
                                newAssigneeId,
                                title,
                                message,
                                "issue",
                                "issue",
                                issue.getId());
                    } catch (Exception e) {
                        System.err.println("Failed to create notification for issue assignment: " + e.getMessage());
                    }
                }
            }

            issue.setUpdatedAt(LocalDateTime.now());
            return issueRepository.save(issue);
        }
        return null;
    }

    /**
     * Delete an issue
     */
    public boolean deleteIssue(String id) {
        if (issueRepository.existsById(id)) {
            issueRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * Get issues by story ID
     */
    public List<Issue> getIssuesByStoryId(String storyId) {
        List<Issue> issues = issueRepository.findByStoryId(storyId);

        issues.forEach(issue -> {
            try {
                String rawStatus = issueRepository.findStatusById(issue.getId());
                if (rawStatus != null) {
                    if (rawStatus.startsWith("custom_lane_")) {
                        issue.setRawStatus(rawStatus);
                    } else {
                        try {
                            TaskStatus enumStatus = TaskStatus.fromValue(rawStatus);
                            if (!enumStatus.equals(issue.getStatus())) {
                                issue.setRawStatus(rawStatus);
                            }
                        } catch (IllegalArgumentException e) {
                            issue.setRawStatus(rawStatus);
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error getting raw status for issue " + issue.getId() + ": " + e.getMessage());
            }
        });

        return issues;
    }

    /**
     * Get issues by assignee ID
     */
    public List<Issue> getIssuesByAssigneeId(String assigneeId) {
        return issueRepository.findByAssigneeId(assigneeId);
    }

    /**
     * Get issues by status
     */
    public List<Issue> getIssuesByStatus(TaskStatus status) {
        return issueRepository.findByStatus(status);
    }

    /**
     * Update issue status (with TaskStatus enum)
     */
    public Issue updateIssueStatus(String id, TaskStatus status) {
        Optional<Issue> issueOpt = issueRepository.findById(id);
        if (issueOpt.isPresent()) {
            Issue issue = issueOpt.get();
            TaskStatus oldStatus = issue.getStatus();
            issue.setStatus(status);
            issue.setUpdatedAt(LocalDateTime.now());
            Issue saved = issueRepository.save(issue);
            if (activityLogService != null && oldStatus != status) {
                try {
                    java.util.Map<String, Object> oldV = new java.util.HashMap<>();
                    oldV.put("status", oldStatus != null ? oldStatus.getValue() : "");
                    java.util.Map<String, Object> newV = new java.util.HashMap<>();
                    newV.put("status", status != null ? status.getValue() : "");
                    activityLogService.logActivity("system", "issue", id, "status_updated",
                            "Issue status changed from " + oldStatus + " to " + status,
                            oldV, newV, null);
                } catch (Exception e) {
                    System.err.println("Failed to log issue status activity: " + e.getMessage());
                }
            }
            return saved;
        }
        return null;
    }

    /**
     * Update issue status (with String - supports custom lane statuses)
     */
    public Issue updateIssueStatus(String id, String statusValue) {
        Optional<Issue> issueOpt = issueRepository.findById(id);
        if (issueOpt.isPresent()) {
            Issue issue = issueOpt.get();
            String oldStatusStr = issue.getStatus() != null ? issue.getStatus().getValue() : null;
            try {
                // Try to convert to TaskStatus enum
                TaskStatus status = TaskStatus.fromValue(statusValue);
                issue.setStatus(status);
                issue.setUpdatedAt(LocalDateTime.now());
                Issue saved = issueRepository.save(issue);
                if (activityLogService != null && !statusValue.equals(oldStatusStr)) {
                    try {
                        java.util.Map<String, Object> oldV = new java.util.HashMap<>();
                        oldV.put("status", oldStatusStr != null ? oldStatusStr : "");
                        java.util.Map<String, Object> newV = new java.util.HashMap<>();
                        newV.put("status", statusValue != null ? statusValue : "");
                        activityLogService.logActivity("system", "issue", id, "status_updated",
                                "Issue status changed from " + oldStatusStr + " to " + statusValue,
                                oldV, newV, null);
                    } catch (Exception ex) {
                        System.err.println("Failed to log issue status activity: " + ex.getMessage());
                    }
                }
                return saved;
            } catch (IllegalArgumentException e) {
                // If it's a custom lane status, update directly in database
                issueRepository.updateIssueStatusDirectly(id, statusValue);
                Issue updated = issueRepository.findById(id).orElse(null);
                if (activityLogService != null && updated != null && !statusValue.equals(oldStatusStr)) {
                    try {
                        java.util.Map<String, Object> oldV = new java.util.HashMap<>();
                        oldV.put("status", oldStatusStr != null ? oldStatusStr : "");
                        java.util.Map<String, Object> newV = new java.util.HashMap<>();
                        newV.put("status", statusValue != null ? statusValue : "");
                        activityLogService.logActivity("system", "issue", id, "status_updated",
                                "Issue status changed from " + oldStatusStr + " to " + statusValue,
                                oldV, newV, null);
                    } catch (Exception ex) {
                        System.err.println("Failed to log issue status activity: " + ex.getMessage());
                    }
                }
                return updated;
            }
        }
        return null;
    }

    /**
     * Update issue assignee
     */
    public Issue updateIssueAssignee(String id, String assigneeId) {
        Optional<Issue> issueOpt = issueRepository.findById(id);
        if (issueOpt.isPresent()) {
            Issue issue = issueOpt.get();
            String oldAssigneeId = issue.getAssigneeId();
            issue.setAssigneeId(assigneeId);
            issue.setUpdatedAt(LocalDateTime.now());

            // Create notification if assignee changed
            if (assigneeId != null && !assigneeId.isEmpty() && !assigneeId.equals(oldAssigneeId)) {
                try {
                    String title = "New Issue Assignment";
                    String message = "You have been assigned to issue: " + issue.getTitle();
                    notificationService.createNotification(
                            assigneeId,
                            title,
                            message,
                            "issue",
                            "issue",
                            issue.getId());
                } catch (Exception e) {
                    System.err.println("Failed to create notification for issue assignment: " + e.getMessage());
                }
            }

            return issueRepository.save(issue);
        }
        return null;
    }

    /**
     * Update issue estimated hours (for manager controls)
     */
    public Issue updateIssueEstimatedHours(String id, java.math.BigDecimal estimatedHours) {
        Optional<Issue> issueOpt = issueRepository.findById(id);
        if (issueOpt.isPresent()) {
            Issue issue = issueOpt.get();
            issue.setEstimatedHours(estimatedHours);
            issue.setUpdatedAt(LocalDateTime.now());
            return issueRepository.save(issue);
        }
        return null;
    }

    /**
     * Update issue actual hours (for effort logging)
     */
    public Issue updateIssueActualHours(String id, java.math.BigDecimal actualHours) {
        Optional<Issue> issueOpt = issueRepository.findById(id);
        if (issueOpt.isPresent()) {
            Issue issue = issueOpt.get();
            issue.setActualHours(actualHours);
            issue.setUpdatedAt(LocalDateTime.now());
            return issueRepository.save(issue);
        }
        return null;
    }

    /**
     * Update issue due date
     */
    public Issue updateIssueDueDate(String id, java.time.LocalDate dueDate) {
        Optional<Issue> issueOpt = issueRepository.findById(id);
        if (issueOpt.isPresent()) {
            Issue issue = issueOpt.get();
            java.time.LocalDate oldDueDate = issue.getDueDate();
            issue.setDueDate(dueDate);
            issue.setUpdatedAt(LocalDateTime.now());
            Issue saved = issueRepository.save(issue);
            if (activityLogService != null && (oldDueDate != dueDate || (oldDueDate == null) != (dueDate == null))) {
                try {
                    java.util.Map<String, Object> oldV = new java.util.HashMap<>();
                    oldV.put("dueDate", oldDueDate != null ? oldDueDate.toString() : null);
                    java.util.Map<String, Object> newV = new java.util.HashMap<>();
                    newV.put("dueDate", dueDate != null ? dueDate.toString() : null);
                    activityLogService.logActivity("system", "issue", id, "due_date_updated",
                            "Issue due date changed", oldV, newV, null);
                } catch (Exception e) {
                    System.err.println("Failed to log issue due date activity: " + e.getMessage());
                }
            }
            return saved;
        }
        return null;
    }

    /**
     * Update issue linked task IDs
     */
    public Issue updateIssueLinkedTaskIds(String id, java.util.List<String> linkedTaskIds) {
        Optional<Issue> issueOpt = issueRepository.findById(id);
        if (issueOpt.isPresent()) {
            Issue issue = issueOpt.get();
            issue.setLinkedTaskIds(linkedTaskIds);
            issue.setUpdatedAt(LocalDateTime.now());
            return issueRepository.save(issue);
        }
        return null;
    }

    /**
     * Synchronize issue actual hours with the sum of its time entries.
     */
    public void syncActualHours(String issueId) {
        if (issueId == null || issueId.isEmpty())
            return;

        try {
            java.math.BigDecimal totalHours = issueRepository.sumHoursWorkedByIssueId(issueId);
            if (totalHours == null)
                totalHours = java.math.BigDecimal.ZERO;

            Optional<Issue> issueOpt = issueRepository.findById(issueId);
            if (issueOpt.isPresent()) {
                Issue issue = issueOpt.get();
                // Only update if changed to avoid unnecessary database writes
                if (issue.getActualHours() == null || issue.getActualHours().compareTo(totalHours) != 0) {
                    issue.setActualHours(totalHours);
                    issue.setUpdatedAt(LocalDateTime.now());
                    issueRepository.save(issue);
                    System.out.println("Synchronized actual hours for issue " + issueId + " to " + totalHours);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to sync actual hours for issue " + issueId + ": " + e.getMessage());
        }
    }

    /**
     * Update issue title
     */
    public Issue updateIssueTitle(String id, String title) {
        Optional<Issue> issueOpt = issueRepository.findById(id);
        if (issueOpt.isPresent()) {
            Issue issue = issueOpt.get();
            issue.setTitle(title);
            issue.setUpdatedAt(LocalDateTime.now());
            return issueRepository.save(issue);
        }
        return null;
    }

    /**
     * Update issue description
     */
    public Issue updateIssueDescription(String id, String description) {
        Optional<Issue> issueOpt = issueRepository.findById(id);
        if (issueOpt.isPresent()) {
            Issue issue = issueOpt.get();
            issue.setDescription(description);
            issue.setUpdatedAt(LocalDateTime.now());
            return issueRepository.save(issue);
        }
        return null;
    }
}
