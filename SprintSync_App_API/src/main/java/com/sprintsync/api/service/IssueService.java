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
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private IdGenerationService idGenerationService;

    @Autowired
    private NotificationService notificationService;

    /**
     * Get all issues with pagination
     */
    public Page<Issue> getAllIssues(Pageable pageable) {
        return issueRepository.findAll(pageable);
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
                    savedIssue.getId()
                );
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
                            issue.getId()
                        );
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
            issue.setStatus(status);
            issue.setUpdatedAt(LocalDateTime.now());
            return issueRepository.save(issue);
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
            try {
                // Try to convert to TaskStatus enum
                TaskStatus status = TaskStatus.fromValue(statusValue);
                issue.setStatus(status);
                issue.setUpdatedAt(LocalDateTime.now());
                return issueRepository.save(issue);
            } catch (IllegalArgumentException e) {
                // If it's a custom lane status, update directly in database
                issueRepository.updateIssueStatusDirectly(id, statusValue);
                // Return the updated issue
                return issueRepository.findById(id).orElse(null);
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
                        issue.getId()
                    );
                } catch (Exception e) {
                    System.err.println("Failed to create notification for issue assignment: " + e.getMessage());
                }
            }
            
            return issueRepository.save(issue);
        }
        return null;
    }
}

