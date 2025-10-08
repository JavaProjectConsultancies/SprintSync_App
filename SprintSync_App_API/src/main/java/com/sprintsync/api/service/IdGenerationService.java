package com.sprintsync.api.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.sprintsync.api.repository.ProjectRepository;
import com.sprintsync.api.repository.UserRepository;
import com.sprintsync.api.repository.DepartmentRepository;
import com.sprintsync.api.repository.DomainRepository;

import java.util.UUID;
import java.util.Optional;

/**
 * Service for generating custom IDs according to SprintSync conventions.
 * 
 * Master tables: 4-digit prefix + 12 zeros + increment (16 digits total)
 * Transaction tables: 4-digit prefix + UUID without dashes (36 characters total)
 * 
 * @author Mayuresh G
 */
@Service
public class IdGenerationService {

    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private DepartmentRepository departmentRepository;
    
    @Autowired
    private DomainRepository domainRepository;

    // Master table prefixes
    private static final String DEPARTMENTS_PREFIX = "DEPT";
    private static final String DOMAINS_PREFIX = "DOMN";
    private static final String USERS_PREFIX = "USER";
    private static final String PROJECTS_PREFIX = "PROJ";
    private static final String EPICS_PREFIX = "EPIC";
    private static final String RELEASES_PREFIX = "RELS";
    private static final String MILESTONES_PREFIX = "MILE";
    private static final String REQUIREMENTS_PREFIX = "REQU";
    private static final String STAKEHOLDERS_PREFIX = "STAKE";
    private static final String RISKS_PREFIX = "RISK";
    private static final String AVAILABLE_INTEGRATIONS_PREFIX = "AVIN";

    // Transaction table prefixes
    private static final String PROJECT_TEAM_MEMBERS_PREFIX = "PTMB";
    private static final String SPRINTS_PREFIX = "SPNT";
    private static final String QUALITY_GATES_PREFIX = "QLTY";
    private static final String STORIES_PREFIX = "STRY";
    private static final String TASKS_PREFIX = "TASK";
    private static final String SUBTASKS_PREFIX = "SUBT";
    private static final String TIME_ENTRIES_PREFIX = "TIME";
    private static final String NOTIFICATIONS_PREFIX = "NOTF";
    private static final String COMMENTS_PREFIX = "COMM";
    private static final String ATTACHMENTS_PREFIX = "ATTC";
    private static final String ACTIVITY_LOGS_PREFIX = "ACTL";
    private static final String TODOS_PREFIX = "TODO";
    private static final String AI_INSIGHTS_PREFIX = "AINS";
    private static final String REPORTS_PREFIX = "REPT";
    private static final String PROJECT_INTEGRATIONS_PREFIX = "PRIN";

    /**
     * Get the next available ID number for projects by finding the highest existing ID
     * 
     * @return The next available number
     */
    private Long getNextProjectNumber() {
        try {
            Optional<String> maxId = projectRepository.findMaxId();
            if (maxId.isPresent() && maxId.get().startsWith(PROJECTS_PREFIX)) {
                String numericPart = maxId.get().substring(4); // Remove "PROJ" prefix
                Long currentMax = Long.parseLong(numericPart);
                return currentMax + 1;
            }
            return 1L;
        } catch (Exception e) {
            return 1L;
        }
    }

    /**
     * Get the next available ID number for users by finding the highest existing ID
     * 
     * @return The next available number
     */
    private Long getNextUserNumber() {
        try {
            Optional<String> maxId = userRepository.findMaxId();
            if (maxId.isPresent() && maxId.get().startsWith(USERS_PREFIX)) {
                String numericPart = maxId.get().substring(4); // Remove "USER" prefix
                Long currentMax = Long.parseLong(numericPart);
                return currentMax + 1;
            }
            return 1L;
        } catch (Exception e) {
            return 1L;
        }
    }

    /**
     * Get the next available ID number for departments by finding the highest existing ID
     * 
     * @return The next available number
     */
    private Long getNextDepartmentNumber() {
        try {
            Optional<String> maxId = departmentRepository.findMaxId();
            if (maxId.isPresent() && maxId.get().startsWith(DEPARTMENTS_PREFIX)) {
                String numericPart = maxId.get().substring(4); // Remove "DEPT" prefix
                Long currentMax = Long.parseLong(numericPart);
                return currentMax + 1;
            }
            return 1L;
        } catch (Exception e) {
            return 1L;
        }
    }

    /**
     * Get the next available ID number for domains by finding the highest existing ID
     * 
     * @return The next available number
     */
    private Long getNextDomainNumber() {
        try {
            Optional<String> maxId = domainRepository.findMaxId();
            if (maxId.isPresent() && maxId.get().startsWith(DOMAINS_PREFIX)) {
                String numericPart = maxId.get().substring(4); // Remove "DOMN" prefix
                Long currentMax = Long.parseLong(numericPart);
                return currentMax + 1;
            }
            return 1L;
        } catch (Exception e) {
            return 1L;
        }
    }

    /**
     * Generate a master table ID with format: PREFIX + 12 zeros + increment
     * 
     * @param prefix The 4-character prefix for the table
     * @param counter The atomic counter for this table type
     * @return A 16-character ID string
     */
    private String generateMasterTableId(String prefix, java.util.concurrent.atomic.AtomicLong counter) {
        long nextValue = counter.getAndIncrement();
        String paddedValue = String.format("%012d", nextValue);
        return prefix + paddedValue;
    }

    /**
     * Generate a transaction table ID with format: PREFIX + UUID without dashes
     * 
     * @param prefix The 4-character prefix for the table
     * @return A 36-character ID string
     */
    private String generateTransactionTableId(String prefix) {
        String uuid = UUID.randomUUID().toString().replace("-", "");
        return prefix + uuid;
    }

    // Master table ID generation methods
    public String generateProjectId() {
        Long nextNumber = getNextProjectNumber();
        String paddedValue = String.format("%012d", nextNumber);
        return PROJECTS_PREFIX + paddedValue;
    }

    public String generateUserId() {
        Long nextNumber = getNextUserNumber();
        String paddedValue = String.format("%012d", nextNumber);
        return USERS_PREFIX + paddedValue;
    }

    public String generateDepartmentId() {
        Long nextNumber = getNextDepartmentNumber();
        String paddedValue = String.format("%012d", nextNumber);
        return DEPARTMENTS_PREFIX + paddedValue;
    }

    public String generateDomainId() {
        Long nextNumber = getNextDomainNumber();
        String paddedValue = String.format("%012d", nextNumber);
        return DOMAINS_PREFIX + paddedValue;
    }

    // For other entities, we'll use static counters for now (can be improved later)
    private static final java.util.concurrent.atomic.AtomicLong epicCounter = new java.util.concurrent.atomic.AtomicLong(1);
    private static final java.util.concurrent.atomic.AtomicLong relsCounter = new java.util.concurrent.atomic.AtomicLong(1);
    private static final java.util.concurrent.atomic.AtomicLong mileCounter = new java.util.concurrent.atomic.AtomicLong(1);
    private static final java.util.concurrent.atomic.AtomicLong requCounter = new java.util.concurrent.atomic.AtomicLong(1);
    private static final java.util.concurrent.atomic.AtomicLong stakeCounter = new java.util.concurrent.atomic.AtomicLong(1);
    private static final java.util.concurrent.atomic.AtomicLong riskCounter = new java.util.concurrent.atomic.AtomicLong(1);
    private static final java.util.concurrent.atomic.AtomicLong avinCounter = new java.util.concurrent.atomic.AtomicLong(1);

    public String generateEpicId() {
        return generateMasterTableId(EPICS_PREFIX, epicCounter);
    }

    public String generateReleaseId() {
        return generateMasterTableId(RELEASES_PREFIX, relsCounter);
    }

    public String generateMilestoneId() {
        return generateMasterTableId(MILESTONES_PREFIX, mileCounter);
    }

    public String generateRequirementId() {
        return generateMasterTableId(REQUIREMENTS_PREFIX, requCounter);
    }

    public String generateStakeholderId() {
        return generateMasterTableId(STAKEHOLDERS_PREFIX, stakeCounter);
    }

    public String generateRiskId() {
        return generateMasterTableId(RISKS_PREFIX, riskCounter);
    }

    public String generateAvailableIntegrationId() {
        return generateMasterTableId(AVAILABLE_INTEGRATIONS_PREFIX, avinCounter);
    }

    // Transaction table ID generation methods
    public String generateProjectTeamMemberId() {
        return generateTransactionTableId(PROJECT_TEAM_MEMBERS_PREFIX);
    }

    public String generateSprintId() {
        return generateTransactionTableId(SPRINTS_PREFIX);
    }

    public String generateQualityGateId() {
        return generateTransactionTableId(QUALITY_GATES_PREFIX);
    }

    public String generateStoryId() {
        return generateTransactionTableId(STORIES_PREFIX);
    }

    public String generateTaskId() {
        return generateTransactionTableId(TASKS_PREFIX);
    }

    public String generateSubtaskId() {
        return generateTransactionTableId(SUBTASKS_PREFIX);
    }

    public String generateTimeEntryId() {
        return generateTransactionTableId(TIME_ENTRIES_PREFIX);
    }

    public String generateNotificationId() {
        return generateTransactionTableId(NOTIFICATIONS_PREFIX);
    }

    public String generateCommentId() {
        return generateTransactionTableId(COMMENTS_PREFIX);
    }

    public String generateAttachmentId() {
        return generateTransactionTableId(ATTACHMENTS_PREFIX);
    }

    public String generateActivityLogId() {
        return generateTransactionTableId(ACTIVITY_LOGS_PREFIX);
    }

    public String generateTodoId() {
        return generateTransactionTableId(TODOS_PREFIX);
    }

    public String generateAiInsightId() {
        return generateTransactionTableId(AI_INSIGHTS_PREFIX);
    }

    public String generateReportId() {
        return generateTransactionTableId(REPORTS_PREFIX);
    }

    public String generateProjectIntegrationId() {
        return generateTransactionTableId(PROJECT_INTEGRATIONS_PREFIX);
    }

    /**
     * Utility method to extract prefix from an ID
     * 
     * @param id The ID to extract prefix from
     * @return The 4-character prefix
     */
    public String extractPrefix(String id) {
        if (id == null || id.length() < 4) {
            return null;
        }
        return id.substring(0, 4);
    }

    /**
     * Utility method to determine if an ID is from a master table
     * 
     * @param id The ID to check
     * @return true if it's a master table ID, false otherwise
     */
    public boolean isMasterTableId(String id) {
        if (id == null || id.length() != 16) {
            return false;
        }
        String prefix = extractPrefix(id);
        return DEPARTMENTS_PREFIX.equals(prefix) || DOMAINS_PREFIX.equals(prefix) ||
               USERS_PREFIX.equals(prefix) || PROJECTS_PREFIX.equals(prefix) ||
               EPICS_PREFIX.equals(prefix) || RELEASES_PREFIX.equals(prefix) ||
               MILESTONES_PREFIX.equals(prefix) || REQUIREMENTS_PREFIX.equals(prefix) ||
               STAKEHOLDERS_PREFIX.equals(prefix) || RISKS_PREFIX.equals(prefix) ||
               AVAILABLE_INTEGRATIONS_PREFIX.equals(prefix);
    }

    /**
     * Utility method to determine if an ID is from a transaction table
     * 
     * @param id The ID to check
     * @return true if it's a transaction table ID, false otherwise
     */
    public boolean isTransactionTableId(String id) {
        if (id == null || id.length() != 36) {
            return false;
        }
        String prefix = extractPrefix(id);
        return PROJECT_TEAM_MEMBERS_PREFIX.equals(prefix) || SPRINTS_PREFIX.equals(prefix) ||
               QUALITY_GATES_PREFIX.equals(prefix) || STORIES_PREFIX.equals(prefix) ||
               TASKS_PREFIX.equals(prefix) || SUBTASKS_PREFIX.equals(prefix) ||
               TIME_ENTRIES_PREFIX.equals(prefix) || NOTIFICATIONS_PREFIX.equals(prefix) ||
               COMMENTS_PREFIX.equals(prefix) || ATTACHMENTS_PREFIX.equals(prefix) ||
               ACTIVITY_LOGS_PREFIX.equals(prefix) || TODOS_PREFIX.equals(prefix) ||
               AI_INSIGHTS_PREFIX.equals(prefix) || REPORTS_PREFIX.equals(prefix) ||
               PROJECT_INTEGRATIONS_PREFIX.equals(prefix);
    }
}
