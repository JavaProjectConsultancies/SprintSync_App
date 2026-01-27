package com.sprintsync.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Bug Report data.
 * Contains combined information from Issue and ActivityLog tables.
 * 
 * @author SprintSync Team
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BugReportDto {
    
    private String defectCode;         // Issue ID
    private String defectName;         // Issue title
    private String type;               // Fixed as "Bug" or from labels
    private String parentCode;         // Story ID
    private String storyCode;          // Story code/ID
    private String storyName;          // Story title/name
    private String linkedToTask;       // Related task ID if any
    private String assignedTo;         // Assignee name
    private String assignedToId;       // Assignee ID
    private String workflowLane;       // Current status
    private String priority;           // Priority level
    private String severity;           // Severity (derived from priority or labels)
    private String defectCategory;     // Category (UI, Backend, etc.)
    private String resolution;         // Resolution status
    private String reportedBy;         // Reporter name
    private String reportedById;       // Reporter ID
    private String createdDate;        // Created date
    private String release;            // Release version
    private String sprint;             // Sprint name
    private String board;              // Board/Project name
}

