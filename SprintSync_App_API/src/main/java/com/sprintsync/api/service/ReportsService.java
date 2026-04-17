package com.sprintsync.api.service;

import com.sprintsync.api.entity.*;
import com.sprintsync.api.entity.enums.UserRole;
import com.sprintsync.api.repository.*;
import com.sprintsync.api.entity.ActivityLog;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service class for Reports operations.
 * Provides business logic for generating various reports and analytics.
 * 
 * @author Mayuresh G
 */
@Service
@SuppressWarnings("null")
public class ReportsService {

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
    private TimeEntryRepository timeEntryRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    /**
     * Generate project summary report
     */
    public Map<String, Object> generateProjectSummaryReport(User currentUser) {
        Map<String, Object> report = new HashMap<>();
 
        List<Project> projects;
        if (currentUser != null && currentUser.getRole() != UserRole.admin
                && currentUser.getRole() != UserRole.master_admin
                && currentUser.getRole() != UserRole.support_and_implementation) {
            projects = projectRepository.findProjectsByUserAccess(currentUser.getId());
        } else {
            projects = projectRepository.findAll();
        }
 
        report.put("totalProjects", projects.size());
 
        Map<com.sprintsync.api.entity.enums.ProjectStatus, Long> statusCount = projects.stream()
                .collect(Collectors.groupingBy(Project::getStatus, Collectors.counting()));
        report.put("statusDistribution", statusCount);
 
        return report;
    }

    /**
     * Generate project summary report for specific project
     */
    public Map<String, Object> generateProjectSummaryReport(String projectId, User currentUser) {
        Map<String, Object> report = new HashMap<>();
 
        // Optional security check: if non-admin and project not accessible, return empty report
        if (currentUser != null && currentUser.getRole() != UserRole.admin
                && currentUser.getRole() != UserRole.master_admin
                && currentUser.getRole() != UserRole.support_and_implementation) {
            List<Project> accessibleProjects = projectRepository.findProjectsByUserAccess(currentUser.getId());
            boolean hasAccess = accessibleProjects.stream().anyMatch(p -> p.getId().equals(projectId));
            if (!hasAccess) {
                return report;
            }
        }
 
        Optional<Project> optionalProject = projectRepository.findById(projectId);
        if (optionalProject.isPresent()) {
            Project project = optionalProject.get();
            report.put("project", project);

            List<Sprint> projectSprints = sprintRepository.findByProjectId(projectId);
            report.put("totalSprints", projectSprints.size());

            List<Story> projectStories = storyRepository.findByProjectId(projectId);
            report.put("totalStories", projectStories.size());

            List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
            report.put("totalTasks", projectTasks.size());
        }

        return report;
    }

    /**
     * Generate sprint report
     */
    public Map<String, Object> generateSprintReport(String sprintId, User currentUser) {
        // Optional security check could be added here to verify sprint belongs to accessible project
        return generateSprintReport(sprintId);
    }
 
    /**
     * Internal implementation for generateSprintReport
     */
    public Map<String, Object> generateSprintReport(String sprintId) {
        Map<String, Object> report = new HashMap<>();

        Optional<Sprint> optionalSprint = sprintRepository.findById(sprintId);
        if (optionalSprint.isPresent()) {
            Sprint sprint = optionalSprint.get();
            report.put("sprint", sprint);

            List<Story> sprintStories = storyRepository.findBySprintId(sprintId);
            report.put("totalStories", sprintStories.size());

            List<Task> sprintTasks = Collections.emptyList(); // Note: Task entity doesn't have sprintId field;
            report.put("totalTasks", sprintTasks.size());

            long completedTasks = sprintTasks.stream()
                    .filter(task -> task.getStatus() == com.sprintsync.api.entity.enums.TaskStatus.DONE)
                    .count();
            report.put("completedTasks", completedTasks);

            double completionPercentage = sprintTasks.isEmpty() ? 0.0
                    : (double) completedTasks / sprintTasks.size() * 100;
            report.put("completionPercentage", Math.round(completionPercentage * 100.0) / 100.0);
        }

        return report;
    }

    /**
     * Generate velocity report
     */
    public Map<String, Object> generateVelocityReport() {
        Map<String, Object> report = new HashMap<>();

        List<Sprint> completedSprints = sprintRepository
                .findByStatus(com.sprintsync.api.entity.enums.SprintStatus.COMPLETED);
        report.put("totalSprints", completedSprints.size());

        if (!completedSprints.isEmpty()) {
            double avgVelocity = completedSprints.stream()
                    .filter(sprint -> sprint.getVelocityPoints() != null)
                    .mapToDouble(Sprint::getVelocityPoints)
                    .average()
                    .orElse(0.0);
            report.put("averageVelocity", Math.round(avgVelocity * 100.0) / 100.0);

            double maxVelocity = completedSprints.stream()
                    .filter(sprint -> sprint.getVelocityPoints() != null)
                    .mapToDouble(Sprint::getVelocityPoints)
                    .max()
                    .orElse(0.0);
            report.put("maxVelocity", Math.round(maxVelocity * 100.0) / 100.0);

            double minVelocity = completedSprints.stream()
                    .filter(sprint -> sprint.getVelocityPoints() != null)
                    .mapToDouble(Sprint::getVelocityPoints)
                    .min()
                    .orElse(0.0);
            report.put("minVelocity", Math.round(minVelocity * 100.0) / 100.0);
        }

        return report;
    }

    /**
     * Generate velocity report for specific project
     */
    public Map<String, Object> generateVelocityReport(String projectId) {
        Map<String, Object> report = new HashMap<>();

        List<Sprint> projectSprints = sprintRepository.findByProjectId(projectId);
        List<Sprint> completedSprints = projectSprints.stream()
                .filter(sprint -> sprint.getStatus() == com.sprintsync.api.entity.enums.SprintStatus.COMPLETED)
                .collect(Collectors.toList());

        report.put("totalSprints", completedSprints.size());

        if (!completedSprints.isEmpty()) {
            double avgVelocity = completedSprints.stream()
                    .filter(sprint -> sprint.getVelocityPoints() != null)
                    .mapToDouble(Sprint::getVelocityPoints)
                    .average()
                    .orElse(0.0);
            report.put("averageVelocity", Math.round(avgVelocity * 100.0) / 100.0);
        }

        return report;
    }

    /**
     * Generate burndown report
     */
    public Map<String, Object> generateBurndownReport() {
        Map<String, Object> report = new HashMap<>();

        List<Sprint> activeSprints = sprintRepository.findByStatus(com.sprintsync.api.entity.enums.SprintStatus.ACTIVE);
        report.put("activeSprints", activeSprints.size());

        List<Map<String, Object>> burndownData = activeSprints.stream()
                .map(sprint -> {
                    Map<String, Object> sprintData = new HashMap<>();
                    sprintData.put("sprintId", sprint.getId());
                    sprintData.put("sprintName", sprint.getName());
                    sprintData.put("capacity", sprint.getCapacityHours());
                    sprintData.put("startDate", sprint.getStartDate());
                    sprintData.put("endDate", sprint.getEndDate());
                    return sprintData;
                })
                .collect(Collectors.toList());

        report.put("burndownData", burndownData);

        return report;
    }

    /**
     * Generate burndown report for specific sprint
     */
    public Map<String, Object> generateBurndownReport(String sprintId) {
        Map<String, Object> report = new HashMap<>();

        Optional<Sprint> optionalSprint = sprintRepository.findById(sprintId);
        if (optionalSprint.isPresent()) {
            Sprint sprint = optionalSprint.get();
            report.put("sprint", sprint);

            List<Task> sprintTasks = Collections.emptyList(); // Note: Task entity doesn't have sprintId field;
            long totalTasks = sprintTasks.size();
            long completedTasks = sprintTasks.stream()
                    .filter(task -> task.getStatus() == com.sprintsync.api.entity.enums.TaskStatus.DONE)
                    .count();

            report.put("totalTasks", totalTasks);
            report.put("completedTasks", completedTasks);
            report.put("remainingTasks", totalTasks - completedTasks);
        }

        return report;
    }

    /**
     * Generate team performance report
     */
    public Map<String, Object> generateTeamPerformanceReport() {
        Map<String, Object> report = new HashMap<>();

        List<User> users = userRepository.findAll();
        List<Map<String, Object>> userPerformance = users.stream()
                .map(user -> {
                    Map<String, Object> performance = new HashMap<>();
                    performance.put("userId", user.getId());
                    performance.put("userName", user.getName());

                    long assignedTasks = taskRepository.countByAssigneeId(user.getId());
                    performance.put("assignedTasks", assignedTasks);

                    long completedTasks = taskRepository
                            .findByAssigneeIdAndStatus(user.getId(), com.sprintsync.api.entity.enums.TaskStatus.DONE)
                            .size();
                    performance.put("completedTasks", completedTasks);

                    double completionRate = assignedTasks > 0 ? (double) completedTasks / assignedTasks * 100 : 0.0;
                    performance.put("completionRate", Math.round(completionRate * 100.0) / 100.0);

                    return performance;
                })
                .collect(Collectors.toList());

        report.put("userPerformance", userPerformance);

        return report;
    }

    /**
     * Generate team performance report for specific project
     */
    public Map<String, Object> generateTeamPerformanceReport(String projectId) {
        Map<String, Object> report = new HashMap<>();

        List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
        Set<String> assignedUserIds = projectTasks.stream()
                .filter(task -> task.getAssigneeId() != null)
                .map(Task::getAssigneeId)
                .collect(Collectors.toSet());

        List<Map<String, Object>> userPerformance = assignedUserIds.stream()
                .map(userId -> {
                    Optional<User> user = userRepository.findById(userId);
                    Map<String, Object> performance = new HashMap<>();
                    performance.put("userId", userId);
                    performance.put("userName", user.map(User::getName).orElse("Unknown"));

                    long userProjectTasks = projectTasks.stream()
                            .filter(task -> userId.equals(task.getAssigneeId()))
                            .count();
                    performance.put("assignedTasks", userProjectTasks);

                    long completedTasks = projectTasks.stream()
                            .filter(task -> userId.equals(task.getAssigneeId()))
                            .filter(task -> task.getStatus() == com.sprintsync.api.entity.enums.TaskStatus.DONE)
                            .count();
                    performance.put("completedTasks", completedTasks);

                    return performance;
                })
                .collect(Collectors.toList());

        report.put("userPerformance", userPerformance);

        return report;
    }

    /**
     * Generate user workload report
     */
    public Map<String, Object> generateUserWorkloadReport() {
        Map<String, Object> report = new HashMap<>();

        List<User> users = userRepository.findAll();
        List<Map<String, Object>> userWorkloads = users.stream()
                .map(user -> {
                    Map<String, Object> workload = new HashMap<>();
                    workload.put("userId", user.getId());
                    workload.put("userName", user.getName());

                    long assignedTasks = taskRepository.countByAssigneeId(user.getId());
                    workload.put("assignedTasks", assignedTasks);

                    long assignedSubtasks = subtaskRepository.countByAssigneeId(user.getId());
                    workload.put("assignedSubtasks", assignedSubtasks);

                    long assignedStories = storyRepository.findByAssigneeId(user.getId()).size();
                    workload.put("assignedStories", assignedStories);

                    return workload;
                })
                .collect(Collectors.toList());

        report.put("userWorkloads", userWorkloads);

        return report;
    }

    /**
     * Generate user workload report for specific user
     */
    public Map<String, Object> generateUserWorkloadReport(String userId) {
        Map<String, Object> report = new HashMap<>();

        Optional<User> optionalUser = userRepository.findById(userId);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            report.put("user", user);

            List<Task> assignedTasks = taskRepository.findByAssigneeId(userId);
            report.put("assignedTasks", assignedTasks);

            List<Subtask> assignedSubtasks = subtaskRepository.findByAssigneeId(userId);
            report.put("assignedSubtasks", assignedSubtasks);

            List<Story> assignedStories = storyRepository.findByAssigneeId(userId);
            report.put("assignedStories", assignedStories);
        }

        return report;
    }

    /**
     * Generate task distribution report
     */
    public Map<String, Object> generateTaskDistributionReport() {
        Map<String, Object> report = new HashMap<>();

        List<Task> allTasks = taskRepository.findAll();
        Map<com.sprintsync.api.entity.enums.TaskStatus, Long> statusDistribution = allTasks.stream()
                .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
        report.put("statusDistribution", statusDistribution);

        Map<String, Long> priorityDistribution = allTasks.stream()
                .collect(Collectors.groupingBy(task -> task.getPriority().getValue(), Collectors.counting()));
        report.put("priorityDistribution", priorityDistribution);

        return report;
    }

    /**
     * Generate task distribution report for specific project
     */
    public Map<String, Object> generateTaskDistributionReport(String projectId) {
        Map<String, Object> report = new HashMap<>();

        List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
        Map<com.sprintsync.api.entity.enums.TaskStatus, Long> statusDistribution = projectTasks.stream()
                .collect(Collectors.groupingBy(Task::getStatus, Collectors.counting()));
        report.put("statusDistribution", statusDistribution);

        Map<String, Long> priorityDistribution = projectTasks.stream()
                .collect(Collectors.groupingBy(task -> task.getPriority().getValue(), Collectors.counting()));
        report.put("priorityDistribution", priorityDistribution);

        return report;
    }

    /**
     * Generate priority report
     */
    public Map<String, Object> generatePriorityReport() {
        Map<String, Object> report = new HashMap<>();

        // Task priority distribution
        Map<String, Long> taskPriorityDistribution = taskRepository.findAll().stream()
                .collect(Collectors.groupingBy(task -> task.getPriority().getValue(), Collectors.counting()));
        report.put("taskPriorityDistribution", taskPriorityDistribution);

        // Story priority distribution
        Map<String, Long> storyPriorityDistribution = storyRepository.findAll().stream()
                .collect(Collectors.groupingBy(story -> story.getPriority().getValue(), Collectors.counting()));
        report.put("storyPriorityDistribution", storyPriorityDistribution);

        return report;
    }

    /**
     * Generate priority report for specific project
     */
    public Map<String, Object> generatePriorityReport(String projectId) {
        Map<String, Object> report = new HashMap<>();

        List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
        Map<String, Long> taskPriorityDistribution = projectTasks.stream()
                .collect(Collectors.groupingBy(task -> task.getPriority().getValue(), Collectors.counting()));
        report.put("taskPriorityDistribution", taskPriorityDistribution);

        List<Story> projectStories = storyRepository.findByProjectId(projectId);
        Map<String, Long> storyPriorityDistribution = projectStories.stream()
                .collect(Collectors.groupingBy(story -> story.getPriority().getValue(), Collectors.counting()));
        report.put("storyPriorityDistribution", storyPriorityDistribution);

        return report;
    }

    /**
     * Generate effort tracking report
     */
    public Map<String, Object> generateEffortTrackingReport() {
        Map<String, Object> report = new HashMap<>();

        List<Task> tasksWithEffort = taskRepository.findTasksWithEffortTracking();
        report.put("tasksWithEffortTracking", tasksWithEffort.size());

        List<Subtask> subtasksWithEffort = subtaskRepository.findSubtasksWithTimeTracking();
        report.put("subtasksWithEffortTracking", subtasksWithEffort.size());

        return report;
    }

    /**
     * Generate effort tracking report for specific project
     */
    public Map<String, Object> generateEffortTrackingReport(String projectId) {
        Map<String, Object> report = new HashMap<>();

        // Note: Task entity doesn't have estimatedEffort or actualEffort fields in
        // current database schema
        report.put("tasksWithEffortTracking", 0);
        report.put("note",
                "Effort tracking not available - estimatedEffort and actualEffort fields not present in current schema");

        return report;
    }

    /**
     * Generate time tracking report
     */
    public Map<String, Object> generateTimeTrackingReport() {
        Map<String, Object> report = new HashMap<>();

        List<TimeEntry> allTimeEntries = timeEntryRepository.findAll();
        report.put("totalTimeEntries", allTimeEntries.size());

        Map<String, Long> timeByUser = allTimeEntries.stream()
                .collect(Collectors.groupingBy(TimeEntry::getUserId, Collectors.counting()));
        report.put("timeEntriesByUser", timeByUser);

        return report;
    }

    /**
     * Generate time tracking report for specific user
     */
    public Map<String, Object> generateTimeTrackingReport(String userId) {
        Map<String, Object> report = new HashMap<>();

        List<TimeEntry> userTimeEntries = timeEntryRepository.findByUserId(userId);
        report.put("timeEntries", userTimeEntries);
        report.put("totalTimeEntries", userTimeEntries.size());

        return report;
    }

    /**
     * Generate date range report
     */
    public Map<String, Object> generateDateRangeReport(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<Task> tasksCreated = taskRepository.findByCreatedAtBetween(startDateTime, endDateTime);
        report.put("tasksCreated", tasksCreated.size());

        List<Story> storiesCreated = storyRepository.findAll().stream()
                .filter(story -> story.getCreatedAt().isAfter(startDateTime)
                        && story.getCreatedAt().isBefore(endDateTime))
                .collect(Collectors.toList());
        report.put("storiesCreated", storiesCreated.size());

        List<Sprint> sprintsCreated = sprintRepository.findByCreatedAtBetween(startDateTime, endDateTime);
        report.put("sprintsCreated", sprintsCreated.size());

        return report;
    }

    /**
     * Generate date range report for specific project
     */
    public Map<String, Object> generateDateRangeReport(String projectId, LocalDate startDate, LocalDate endDate) {
        Map<String, Object> report = new HashMap<>();

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

        List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
        List<Task> tasksCreated = projectTasks.stream()
                .filter(task -> task.getCreatedAt().isAfter(startDateTime) && task.getCreatedAt().isBefore(endDateTime))
                .collect(Collectors.toList());
        report.put("tasksCreated", tasksCreated.size());

        return report;
    }

    /**
     * Generate overdue report
     */
    @Cacheable(cacheNames = "reportsOverdue", cacheManager = "shortLivedCacheManager", key = "'global'")
    public Map<String, Object> generateOverdueReport() {
        Map<String, Object> report = new HashMap<>();

        LocalDate today = LocalDate.now();
        List<Task> overdueTasks = taskRepository.findOverdueTasks(today,
                com.sprintsync.api.entity.enums.TaskStatus.DONE);
        report.put("overdueTasks", overdueTasks);

        List<Subtask> overdueSubtasks = subtaskRepository.findOverdueSubtasks(today);
        report.put("overdueSubtasks", overdueSubtasks);

        report.put("totalOverdue", overdueTasks.size() + overdueSubtasks.size());

        return report;
    }

    /**
     * Generate overdue report for specific project
     */
    public Map<String, Object> generateOverdueReport(String projectId) {
        Map<String, Object> report = new HashMap<>();

        List<Task> projectTasks = Collections.emptyList(); // Note: Task entity doesn't have projectId field
        List<Task> overdueTasks = projectTasks.stream()
                .filter(task -> task.getDueDate() != null
                        && task.getDueDate().isBefore(LocalDateTime.now().toLocalDate()))
                .filter(task -> task.getStatus() != com.sprintsync.api.entity.enums.TaskStatus.DONE)
                .collect(Collectors.toList());
        report.put("overdueTasks", overdueTasks);

        return report;
    }

    // Additional report methods would be implemented here...
    // For brevity, I'm including placeholder methods for the remaining reports

    public Map<String, Object> generateQualityMetricsReport() {
        return new HashMap<>();
    }

    public Map<String, Object> generateQualityMetricsReport(String projectId) {
        return new HashMap<>();
    }

    public Map<String, Object> generateReleaseReport(String releaseId) {
        return new HashMap<>();
    }

    public Map<String, Object> generateEpicReport(String epicId) {
        return new HashMap<>();
    }

    public Map<String, Object> generateStoryReport(String storyId) {
        return new HashMap<>();
    }

    public Map<String, Object> generateTaskReport(String taskId) {
        return new HashMap<>();
    }

    public Map<String, Object> generateCustomReport(Map<String, Object> reportCriteria) {
        return new HashMap<>();
    }

    public String exportReportToCsv(String reportType, String projectId, LocalDate startDate, LocalDate endDate) {
        return "CSV export not implemented yet";
    }

    public byte[] exportReportToPdf(String reportType, String projectId, LocalDate startDate, LocalDate endDate) {
        return "PDF export not implemented yet".getBytes();
    }

    public Map<String, Object> scheduleReportGeneration(Map<String, Object> scheduleRequest) {
        return new HashMap<>();
    }

    public Map<String, Object> getScheduledReports() {
        return new HashMap<>();
    }

    public Map<String, Object> getReportTemplates() {
        return new HashMap<>();
    }

    /**
     * Generate bug report with data from issues and activity logs
     * 
     * @return List of bug report DTOs
     */
    public List<com.sprintsync.api.dto.BugReportDto> generateBugReport() {
        List<Object[]> results = issueRepository.findBugReportData();
        return mapToBugReportDtos(results);
    }

    /**
     * Generate bug report filtered by project ID
     * 
     * @param projectId the project ID to filter by
     * @return List of bug report DTOs
     */
    public List<com.sprintsync.api.dto.BugReportDto> generateBugReport(String projectId) {
        List<Object[]> results = issueRepository.findBugReportDataByProject(projectId);
        return mapToBugReportDtos(results);
    }

    /**
     * Generate bug report filtered by both project ID and sprint ID
     * 
     * @param projectId the project ID to filter by
     * @param sprintId  the sprint ID to filter by
     * @return List of bug report DTOs
     */
    public List<com.sprintsync.api.dto.BugReportDto> generateBugReport(String projectId, String sprintId) {
        List<Object[]> results = issueRepository.findBugReportDataByProjectAndSprint(projectId, sprintId);
        return mapToBugReportDtos(results);
    }

    /**
     * Helper method to map Object[] results to BugReportDto
     */
    private List<com.sprintsync.api.dto.BugReportDto> mapToBugReportDtos(List<Object[]> results) {
        return results.stream()
                .map(row -> com.sprintsync.api.dto.BugReportDto.builder()
                        .defectCode((String) row[0])
                        .defectName((String) row[1])
                        .type((String) row[2])
                        .parentCode((String) row[3])
                        .storyCode((String) row[4])
                        .storyName((String) row[5])
                        .linkedToTask((String) row[6])
                        .assignedTo((String) row[7])
                        .assignedToId((String) row[8])
                        .workflowLane((String) row[9])
                        .priority((String) row[10])
                        .severity((String) row[11])
                        .defectCategory((String) row[12])
                        .resolution((String) row[13])
                        .reportedBy((String) row[14])
                        .reportedById((String) row[15])
                        .createdDate((String) row[16])
                        .release((String) row[17])
                        .sprint((String) row[18])
                        .board((String) row[19])
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Export bug report to Excel format
     * 
     * @param projectId Optional project ID to filter by. If null, exports all bug
     *                  reports
     * @param sprintId  Optional sprint ID to filter by. If null, ignores sprint
     *                  filter
     * @return Byte array containing the Excel file
     */
    public byte[] exportBugReportToExcel(String projectId, String sprintId) throws IOException {
        List<com.sprintsync.api.dto.BugReportDto> bugReports;

        // Apply filters based on provided parameters
        if (projectId != null && !projectId.isEmpty() && sprintId != null && !sprintId.isEmpty()) {
            // Both project and sprint filters
            bugReports = generateBugReport(projectId, sprintId);
        } else if (projectId != null && !projectId.isEmpty()) {
            // Project filter only
            bugReports = generateBugReport(projectId);
        } else {
            // No filters - all bug reports
            bugReports = generateBugReport();
        }

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Bug Report");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Create data style
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setWrapText(true);

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Defect Code", "Defect Name", "Type", "Parent Code", "Story Code", "Story Name",
                    "Linked To Task", "Assigned To", "Assigned To ID", "Workflow Lane", "Priority",
                    "Severity", "Defect Category", "Resolution", "Reported By", "Reported By ID",
                    "Created Date", "Release", "Sprint", "Board"
            };

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Create data rows
            int rowNum = 1;
            for (com.sprintsync.api.dto.BugReportDto bugReport : bugReports) {
                Row row = sheet.createRow(rowNum++);

                int cellNum = 0;
                createCell(row, cellNum++, bugReport.getDefectCode(), dataStyle);
                createCell(row, cellNum++, bugReport.getDefectName(), dataStyle);
                createCell(row, cellNum++, bugReport.getType(), dataStyle);
                createCell(row, cellNum++, bugReport.getParentCode(), dataStyle);
                createCell(row, cellNum++, bugReport.getStoryCode(), dataStyle);
                createCell(row, cellNum++, bugReport.getStoryName(), dataStyle);
                createCell(row, cellNum++, bugReport.getLinkedToTask(), dataStyle);
                createCell(row, cellNum++, bugReport.getAssignedTo(), dataStyle);
                createCell(row, cellNum++, bugReport.getAssignedToId(), dataStyle);
                createCell(row, cellNum++, bugReport.getWorkflowLane(), dataStyle);
                createCell(row, cellNum++, bugReport.getPriority(), dataStyle);
                createCell(row, cellNum++, bugReport.getSeverity(), dataStyle);
                createCell(row, cellNum++, bugReport.getDefectCategory(), dataStyle);
                createCell(row, cellNum++, bugReport.getResolution(), dataStyle);
                createCell(row, cellNum++, bugReport.getReportedBy(), dataStyle);
                createCell(row, cellNum++, bugReport.getReportedById(), dataStyle);
                createCell(row, cellNum++, bugReport.getCreatedDate(), dataStyle);
                createCell(row, cellNum++, bugReport.getRelease(), dataStyle);
                createCell(row, cellNum++, bugReport.getSprint(), dataStyle);
                createCell(row, cellNum++, bugReport.getBoard(), dataStyle);
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                // Set minimum column width
                if (sheet.getColumnWidth(i) < 3000) {
                    sheet.setColumnWidth(i, 3000);
                }
            }

            // Write workbook to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Generate resource utilization report
     * Returns detailed resource performance data with all task/issue information
     * Uses time_entries table for actual hours and activity_logs for completion
     * dates
     */
    public Map<String, Object> generateResourceUtilizationReport(String projectId, String period, LocalDate fromDate, LocalDate toDate, User currentUser) {
        Map<String, Object> report = new HashMap<>();
        List<Map<String, Object>> rows = new ArrayList<>();

        // 1. Fetch Tasks and Issues (Optimized)
        List<Task> tasks;
        List<Issue> issues;

        if (projectId != null && !projectId.isEmpty()) {
            List<Story> projectStories = storyRepository.findByProjectId(projectId);
            List<String> storyIds = projectStories.stream().map(Story::getId).collect(Collectors.toList());
            if (storyIds.isEmpty()) {
                tasks = new ArrayList<>();
                issues = new ArrayList<>();
            } else {
                tasks = taskRepository.findByStoryIdIn(storyIds);
                issues = issueRepository.findByStoryIdIn(storyIds);
            }
        } else if (currentUser != null && currentUser.getRole() != UserRole.admin
                && currentUser.getRole() != UserRole.master_admin
                && currentUser.getRole() != UserRole.support_and_implementation) {
            // Non-admin user requesting all projects: restrict to assigned projects
            List<Project> accessibleProjects = projectRepository.findProjectsByUserAccess(currentUser.getId());
            List<String> accessibleProjectIds = accessibleProjects.stream()
                    .map(Project::getId)
                    .collect(Collectors.toList());

            if (accessibleProjectIds.isEmpty()) {
                tasks = new ArrayList<>();
                issues = new ArrayList<>();
            } else {
                List<Story> projectStories = storyRepository.findByProjectIdIn(accessibleProjectIds);
                List<String> storyIds = projectStories.stream().map(Story::getId).collect(Collectors.toList());
                if (storyIds.isEmpty()) {
                    tasks = new ArrayList<>();
                    issues = new ArrayList<>();
                } else {
                    tasks = taskRepository.findByStoryIdIn(storyIds);
                    issues = issueRepository.findByStoryIdIn(storyIds);
                }
            }
        } else {
            tasks = taskRepository.findAll();
            issues = issueRepository.findAll();
        }

        // 1.1. Log-Inclusive Fetching: Ensure all tasks with time entries in the range are included
        // This is especially important for tasks not linked to stories or projects fetched above
        LocalDate fromFinalFetch = null;
        LocalDate toFinalFetch = null;

        if (period != null && !"all".equalsIgnoreCase(period)) {
            LocalDate now = LocalDate.now();
            if ("last7".equalsIgnoreCase(period)) {
                fromFinalFetch = now.minusDays(7);
                toFinalFetch = now;
            } else if ("last30".equalsIgnoreCase(period)) {
                fromFinalFetch = now.minusDays(30);
                toFinalFetch = now;
            } 
        } else if (fromDate != null && toDate != null) {
            fromFinalFetch = fromDate;
            toFinalFetch = toDate;
        }

        if (fromFinalFetch != null && toFinalFetch != null) {
            List<TimeEntry> entriesInRange = timeEntryRepository.findByWorkDateBetween(fromFinalFetch, toFinalFetch);
            Set<String> extraTaskIds = entriesInRange.stream().map(TimeEntry::getTaskId).filter(Objects::nonNull).collect(Collectors.toSet());
            Set<String> extraIssueIds = entriesInRange.stream().map(TimeEntry::getIssueId).filter(Objects::nonNull).collect(Collectors.toSet());
            Set<String> extraSubtaskIds = entriesInRange.stream().map(TimeEntry::getSubtaskId).filter(Objects::nonNull).collect(Collectors.toSet());
            
            // If someone logged on a subtask, we need the parent task or issue
            if (!extraSubtaskIds.isEmpty()) {
                 subtaskRepository.findAllById(extraSubtaskIds).forEach(st -> {
                     if (st.getTaskId() != null) extraTaskIds.add(st.getTaskId());
                     if (st.getIssueId() != null) extraIssueIds.add(st.getIssueId());
                 });
            }
            
            Set<String> currentTaskIds = tasks.stream().map(Task::getId).collect(Collectors.toSet());
            Set<String> currentIssueIds = issues.stream().map(Issue::getId).collect(Collectors.toSet());
            
            extraTaskIds.removeAll(currentTaskIds);
            extraIssueIds.removeAll(currentIssueIds);
            
            if (!extraTaskIds.isEmpty()) {
                tasks.addAll(taskRepository.findAllById(extraTaskIds));
            }
            if (!extraIssueIds.isEmpty()) {
                issues.addAll(issueRepository.findAllById(extraIssueIds));
            }
        }

        // 1.5. Batch fetch TimeEntries and Subtasks for all Tasks/Issues
        List<String> taskIds = tasks.stream().map(Task::getId).collect(Collectors.toList());
        List<String> issueIds = issues.stream().map(Issue::getId).collect(Collectors.toList());

        Map<String, List<TimeEntry>> taskTimeEntries = new HashMap<>();
        Map<String, List<TimeEntry>> issueTimeEntries = new HashMap<>();
        Map<String, List<Subtask>> taskSubtasks = new HashMap<>();

        if (!taskIds.isEmpty()) {
            taskTimeEntries = timeEntryRepository.findByTaskIdIn(taskIds).stream()
                    .collect(Collectors.groupingBy(TimeEntry::getTaskId));
            taskSubtasks = subtaskRepository.findByTaskIdIn(taskIds).stream()
                    .collect(Collectors.groupingBy(Subtask::getTaskId));
        }
        if (!issueIds.isEmpty()) {
            issueTimeEntries = timeEntryRepository.findByIssueIdIn(issueIds).stream()
                    .collect(Collectors.groupingBy(TimeEntry::getIssueId));
        }

        Map<String, List<TimeEntry>> subtaskTimeEntries = new HashMap<>();
        if (!taskSubtasks.isEmpty()) {
            List<String> allSubtaskIds = taskSubtasks.values().stream()
                    .flatMap(List::stream)
                    .map(Subtask::getId)
                    .collect(Collectors.toList());
            if (!allSubtaskIds.isEmpty()) {
                subtaskTimeEntries = timeEntryRepository.findBySubtaskIdIn(allSubtaskIds).stream()
                        .collect(Collectors.groupingBy(TimeEntry::getSubtaskId));
            }
        }
        
        // Also fetch subtasks for Issues (if any)
        Map<String, List<Subtask>> issueSubtasks = new HashMap<>();
        if (!issueIds.isEmpty()) {
            issueSubtasks = subtaskRepository.findByIssueIdIn(issueIds).stream()
                    .collect(Collectors.groupingBy(Subtask::getIssueId));
            
            List<String> allIssueSubIds = issueSubtasks.values().stream()
                    .flatMap(List::stream)
                    .map(Subtask::getId)
                    .collect(Collectors.toList());
            if (!allIssueSubIds.isEmpty()) {
                Map<String, List<TimeEntry>> issueStEntries = timeEntryRepository.findBySubtaskIdIn(allIssueSubIds).stream()
                        .collect(Collectors.groupingBy(TimeEntry::getSubtaskId));
                subtaskTimeEntries.putAll(issueStEntries);
            }
        }

        // 2. Collect all IDs for batch fetching related entities
        Set<String> storyIdsToFetch = new HashSet<>();
        Set<String> userIdsToFetch = new HashSet<>();

        tasks.forEach(t -> {
            if (t.getStoryId() != null)
                storyIdsToFetch.add(t.getStoryId());
            if (t.getAssigneeId() != null)
                userIdsToFetch.add(t.getAssigneeId());
            if (t.getReporterId() != null)
                userIdsToFetch.add(t.getReporterId());
        });

        issues.forEach(i -> {
            if (i.getStoryId() != null)
                storyIdsToFetch.add(i.getStoryId());
            if (i.getAssigneeId() != null)
                userIdsToFetch.add(i.getAssigneeId());
            if (i.getReporterId() != null)
                userIdsToFetch.add(i.getReporterId());
        });

        // Also fetch users who have logged time (to support work attribution even if not an assignee)
        taskTimeEntries.values().forEach(list -> list.forEach(te -> userIdsToFetch.add(te.getUserId())));
        issueTimeEntries.values().forEach(list -> list.forEach(te -> userIdsToFetch.add(te.getUserId())));

        // 3. Batch fetch Stories and Users
        Map<String, Story> storyMap = storyRepository.findAllById(storyIdsToFetch).stream()
                .collect(Collectors.toMap(Story::getId, s -> s));
        Map<String, User> userMap = userRepository.findAllById(userIdsToFetch).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        // 4. Batch fetch Sprints and Projects (from stories)
        Set<String> sprintIdsToFetch = storyMap.values().stream()
                .map(Story::getSprintId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Set<String> projectIdsToFetch = storyMap.values().stream()
                .map(Story::getProjectId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<String, Sprint> sprintMap = sprintRepository.findAllById(sprintIdsToFetch).stream()
                .collect(Collectors.toMap(Sprint::getId, s -> s));
        Map<String, Project> projectMap = projectRepository.findAllById(projectIdsToFetch).stream()
                .collect(Collectors.toMap(Project::getId, p -> p));

        // 5. Process Tasks
        for (Task task : tasks) {
            User assignee = task.getAssigneeId() != null ? userMap.get(task.getAssigneeId()) : null;
            Story story = task.getStoryId() != null ? storyMap.get(task.getStoryId()) : null;
            User reporter = task.getReporterId() != null ? userMap.get(task.getReporterId()) : null;

            double actualHours = task.getActualHours() != null ? task.getActualHours().doubleValue() : 0.0;
            String workCategory = task.getLabels() != null && !task.getLabels().isEmpty()
                    ? String.join(", ", task.getLabels())
                    : "Development";
            String completedDate = (task.getStatus() != null && task.getStatus().getValue().equals("done")
                    && task.getUpdatedAt() != null) ? task.getUpdatedAt().toString() : null;

            Map<String, Object> row = new HashMap<>();
            row.put("resourceEmailId", assignee != null ? assignee.getEmail() : null);
            row.put("resourceName", assignee != null ? assignee.getName() : "Unassigned");
            row.put("taskIssueName", task.getTitle());
            row.put("taskIssueId", task.getId());
            row.put("storyName", story != null ? story.getTitle() : "Uncategorized");
            row.put("storyId", story != null ? story.getId() : null);
            row.put("estimationHours",
                    task.getEstimatedHours() != null ? task.getEstimatedHours().doubleValue() : null);
            row.put("actualHours", actualHours);
            double estimated = task.getEstimatedHours() != null ? task.getEstimatedHours().doubleValue() : 0.0;
            row.put("remainingHours", Math.max(0, estimated - actualHours));
            row.put("reporterName", reporter != null ? reporter.getName() : null);
            row.put("workCategory", workCategory);
            row.put("itemType", "TASK");
            row.put("isBug", workCategory.toLowerCase().contains("bug"));
            row.put("status", task.getStatusAsString() != null ? task.getStatusAsString() : "to_do");
            row.put("createdDate", task.getCreatedAt() != null ? task.getCreatedAt().toString() : null);
            row.put("dueDate", task.getDueDate() != null ? task.getDueDate().toString() : null);
            row.put("completedDate", completedDate);

            Sprint sprint = (story != null && story.getSprintId() != null) ? sprintMap.get(story.getSprintId()) : null;
            row.put("sprint", sprint != null ? sprint.getName() : null);

            Project project = (story != null && story.getProjectId() != null) ? projectMap.get(story.getProjectId()) : null;
            row.put("project", project != null ? project.getName() : null);
            row.put("projectId", project != null ? project.getId() : null);

            // Add detailed time entries and subtasks
            List<TimeEntry> taskEntries = new ArrayList<>(taskTimeEntries.getOrDefault(task.getId(), new ArrayList<>()));
            List<Subtask> subtasks = taskSubtasks.getOrDefault(task.getId(), new ArrayList<>());
            
            // Aggregate time entries from subtasks into the parent task row
            if (!subtasks.isEmpty()) {
                for (Subtask st : subtasks) {
                    List<TimeEntry> stEntries = subtaskTimeEntries.get(st.getId());
                    if (stEntries != null) {
                        taskEntries.addAll(stEntries);
                    }
                }
            }
            
            row.put("timeEntries", taskEntries);
            row.put("subtasks", subtasks);

            rows.add(row);
        }

        // 6. Process Issues
        for (Issue issue : issues) {
            User assignee = issue.getAssigneeId() != null ? userMap.get(issue.getAssigneeId()) : null;
            Story story = issue.getStoryId() != null ? storyMap.get(issue.getStoryId()) : null;
            User reporter = issue.getReporterId() != null ? userMap.get(issue.getReporterId()) : null;

            double actualHours = issue.getActualHours() != null ? issue.getActualHours().doubleValue() : 0.0;
            String workCategory = issue.getLabels() != null && !issue.getLabels().isEmpty()
                    ? String.join(", ", issue.getLabels())
                    : "Bug";
            String completedDate = (issue.getStatus() != null && issue.getStatus().getValue().equals("done")
                    && issue.getUpdatedAt() != null) ? issue.getUpdatedAt().toString() : null;

            Map<String, Object> row = new HashMap<>();
            row.put("resourceEmailId", assignee != null ? assignee.getEmail() : null);
            row.put("resourceName", assignee != null ? assignee.getName() : "Unassigned");
            row.put("taskIssueName", issue.getTitle());
            row.put("taskIssueId", issue.getId());
            row.put("storyName", story != null ? story.getTitle() : "Uncategorized");
            row.put("storyId", story != null ? story.getId() : null);
            row.put("estimationHours",
                    issue.getEstimatedHours() != null ? issue.getEstimatedHours().doubleValue() : null);
            row.put("actualHours", actualHours);
            double estimated = issue.getEstimatedHours() != null ? issue.getEstimatedHours().doubleValue() : 0.0;
            row.put("remainingHours", Math.max(0, estimated - actualHours));
            row.put("reporterName", reporter != null ? reporter.getName() : null);
            row.put("workCategory", workCategory);
            row.put("itemType", "ISSUE");
            row.put("isBug", true);
            row.put("status", issue.getStatusAsString() != null ? issue.getStatusAsString() : "to_do");
            row.put("createdDate", issue.getCreatedAt() != null ? issue.getCreatedAt().toString() : null);
            row.put("dueDate", issue.getDueDate() != null ? issue.getDueDate().toString() : null);
            row.put("completedDate", completedDate);

            Sprint sprint = (story != null && story.getSprintId() != null) ? sprintMap.get(story.getSprintId()) : null;
            row.put("sprint", sprint != null ? sprint.getName() : null);

            Project project = (story != null && story.getProjectId() != null) ? projectMap.get(story.getProjectId()) : null;
            row.put("project", project != null ? project.getName() : null);
            row.put("projectId", project != null ? project.getId() : null);

            // Add detailed time entries for issues
            List<TimeEntry> issueEntries = new ArrayList<>(issueTimeEntries.getOrDefault(issue.getId(), new ArrayList<>()));
            List<Subtask> subtasks = issueSubtasks.getOrDefault(issue.getId(), new ArrayList<>());
            
            // Aggregate time entries from subtasks into the parent issue row
            if (!subtasks.isEmpty()) {
                for (Subtask st : subtasks) {
                    List<TimeEntry> stEntries = subtaskTimeEntries.get(st.getId());
                    if (stEntries != null) {
                        issueEntries.addAll(stEntries);
                    }
                }
            }
            
            row.put("timeEntries", issueEntries);
            row.put("subtasks", subtasks);

            rows.add(row);
        }

        // Rework detection for issues: status moved from done/QA to todo, or due date
        // changed
        List<String> allIssueIds = rows.stream()
                .filter(r -> "ISSUE".equals(r.get("itemType")))
                .map(r -> r.get("taskIssueId"))
                .filter(Objects::nonNull)
                .map(Object::toString)
                .distinct()
                .collect(Collectors.toList());
        Set<String> reworkIssueIds = new HashSet<>();
        if (!allIssueIds.isEmpty()) {
            try {
                List<ActivityLog> issueLogs = activityLogRepository
                        .findByEntityTypeAndEntityIdInOrderByCreatedAtDesc("issue", allIssueIds);
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                for (ActivityLog log : issueLogs) {
                    if (!"status_updated".equals(log.getAction()) && !"due_date_updated".equals(log.getAction()))
                        continue;
                    if ("due_date_updated".equals(log.getAction())) {
                        reworkIssueIds.add(log.getEntityId());
                        continue;
                    }
                    try {
                        String oldJson = log.getOldValues();
                        String newJson = log.getNewValues();
                        if (oldJson != null && newJson != null) {
                            Map<?, ?> oldV = mapper.readValue(oldJson, Map.class);
                            Map<?, ?> newV = mapper.readValue(newJson, Map.class);
                            String oldStatus = oldV.get("status") != null ? oldV.get("status").toString().toLowerCase()
                                    : "";
                            String newStatus = newV.get("status") != null ? newV.get("status").toString().toLowerCase()
                                    : "";
                            boolean wasDone = "done".equals(oldStatus) || "completed".equals(oldStatus)
                                    || oldStatus.contains("qa");
                            boolean nowTodo = "to_do".equals(newStatus) || "todo".equals(newStatus)
                                    || "in_progress".equals(newStatus) || newStatus.contains("progress");
                            if (wasDone && nowTodo)
                                reworkIssueIds.add(log.getEntityId());
                        }
                    } catch (Exception e) {
                        /* ignore parse errors */
                    }
                }
            } catch (Exception e) {
                System.err.println("Rework detection failed: " + e.getMessage());
            }
        }
        for (Map<String, Object> row : rows) {
            if ("ISSUE".equals(row.get("itemType"))) {
                Object id = row.get("taskIssueId");
                row.put("isRework", id != null && reworkIssueIds.contains(id.toString()));
            } else {
                row.put("isRework", false);
            }
        }

        // Calculate summary statistics
        int totalResources = (int) rows.stream()
                .map(row -> row.get("resourceEmailId"))
                .distinct()
                .count();

        int activeResources = totalResources;

        double totalEstimatedHours = rows.stream()
                .filter(row -> row.get("estimationHours") != null)
                .mapToDouble(row -> ((Number) row.get("estimationHours")).doubleValue())
                .sum();

        double totalActualHours = rows.stream()
                .mapToDouble(row -> ((Number) row.get("actualHours")).doubleValue())
                .sum();

        double totalCompletedEstimatedHours = rows.stream()
                .filter(row -> {
                    String s = row.get("status") != null ? row.get("status").toString().toLowerCase() : "";
                    return "done".equals(s) || "completed".equals(s) || s.contains("qa");
                })
                .filter(row -> row.get("estimationHours") != null)
                .mapToDouble(row -> ((Number) row.get("estimationHours")).doubleValue())
                .sum();

        double avgUtilization = totalActualHours > 0
                ? (totalCompletedEstimatedHours / totalActualHours) * 100
                : 0.0;

        // Group by project for project utilization
        Map<String, List<Map<String, Object>>> projectGroups = rows.stream()
                .collect(Collectors
                        .groupingBy(row -> row.get("project") != null ? row.get("project").toString() : "Unknown"));

        List<Map<String, Object>> projectUtilization = projectGroups.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> projUtil = new HashMap<>();
                    projUtil.put("projectId", entry.getKey());
                    projUtil.put("projectName", entry.getKey());

                    double projEstimated = entry.getValue().stream()
                            .filter(row -> row.get("estimationHours") != null)
                            .mapToDouble(row -> ((Number) row.get("estimationHours")).doubleValue())
                            .sum();

                    double projActual = entry.getValue().stream()
                            .mapToDouble(row -> ((Number) row.get("actualHours")).doubleValue())
                            .sum();

                    double projCompletedEstimated = entry.getValue().stream()
                            .filter(row -> {
                                String s = row.get("status") != null ? row.get("status").toString().toLowerCase() : "";
                                return "done".equals(s) || "completed".equals(s) || s.contains("qa");
                            })
                            .filter(row -> row.get("estimationHours") != null)
                            .mapToDouble(row -> ((Number) row.get("estimationHours")).doubleValue())
                            .sum();

                    projUtil.put("allocatedHours", projEstimated);
                    projUtil.put("actualHours", projActual);
                    projUtil.put("utilization", projActual > 0
                            ? (projCompletedEstimated / projActual) * 100
                            : 0.0);

                    return projUtil;
                })
                .collect(Collectors.toList());

        // Build individual utilization summary per resource.
        // NOTE: A resource is anyone who logged time or is an assignee.
        Map<String, List<Map<String, Object>>> resourceGroups = new HashMap<>();
        
        for (Map<String, Object> row : rows) {
            @SuppressWarnings("unchecked")
            List<TimeEntry> entries = (List<TimeEntry>) row.get("timeEntries");
            Set<String> loggedUsers = new HashSet<>();
            
            if (entries != null) {
                for (TimeEntry te : entries) {
                    User logUser = te.getUserId() != null ? userMap.get(te.getUserId()) : null;
                    if (logUser != null) {
                        String userKey = logUser.getEmail() != null ? logUser.getEmail().toLowerCase() : logUser.getName().toLowerCase();
                        if (userKey != null) {
                            loggedUsers.add(userKey);
                            Map<String, Object> resourceRow = new HashMap<>(row);
                            resourceRow.put("resourceEmailId", logUser.getEmail());
                            resourceRow.put("resourceName", logUser.getName());
                            resourceGroups.computeIfAbsent(userKey, k -> new ArrayList<>()).add(resourceRow);
                        }
                    }
                }
            }
            
            // Also include the primary assignee if they haven't logged time but have the task assigned
            String assigneeEmail = row.get("resourceEmailId") != null ? row.get("resourceEmailId").toString() : null;
            String assigneeName = row.get("resourceName") != null ? row.get("resourceName").toString() : null;
            String primaryKey = assigneeEmail != null ? assigneeEmail : assigneeName;
            
            if (primaryKey != null && !loggedUsers.contains(primaryKey)) {
                resourceGroups.computeIfAbsent(primaryKey, k -> new ArrayList<>()).add(new HashMap<>(row));
            }
        }

        List<Map<String, Object>> individualUtilization = new ArrayList<>();
        for (Map.Entry<String, List<Map<String, Object>>> entry : resourceGroups.entrySet()) {
            List<Map<String, Object>> resourceRows = entry.getValue();
            Map<String, Object> firstRow = resourceRows.get(0);
            String resourceName = firstRow.get("resourceName") != null ? firstRow.get("resourceName").toString()
                    : entry.getKey();

            List<String> projects = resourceRows.stream()
                    .map(r -> r.get("project"))
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .distinct()
                    .collect(Collectors.toList());

            double hoursLogged = resourceRows.stream()
                    .mapToDouble(r -> safeDouble(r.get("actualHours")))
                    .sum();
            double allocated = resourceRows.stream()
                    .mapToDouble(r -> safeDouble(r.get("estimationHours")))
                    .sum();
            double completedEstimated = resourceRows.stream()
                    .filter(r -> {
                        String s = r.get("status") != null ? r.get("status").toString().toLowerCase() : "";
                        return "done".equals(s) || "completed".equals(s) || s.contains("qa");
                    })
                    .mapToDouble(r -> safeDouble(r.get("estimationHours")))
                    .sum();

            double utilizationLevel = hoursLogged > 0 ? (completedEstimated / hoursLogged) * 100 : 0;

            long inProgressCount = resourceRows.stream()
                    .filter(r -> {
                        String s = r.get("status") != null ? r.get("status").toString().toLowerCase() : "";
                        return "in_progress".equals(s) || "in-progress".equals(s) || "in progress".equals(s);
                    })
                    .count();

            String status = "optimal";
            List<String> concerns = new ArrayList<>();
            if (hoursLogged == 0) {
                status = "idle";
                concerns.add("Idle");
            } else if (allocated == 0) {
                concerns.add("No allocation");
            } else if (utilizationLevel < 50) {
                status = "underutilized";
                concerns.add("Underutilized");
            } else if (utilizationLevel > 120 || inProgressCount > 5) {
                status = "overloaded";
                if (utilizationLevel > 120)
                    concerns.add("Overloaded");
                if (inProgressCount > 5)
                    concerns.add("High in-progress count");
            }

            Map<String, Object> ind = new LinkedHashMap<>();
            ind.put("resourceName", resourceName);
            ind.put("resourceEmailId", firstRow.get("resourceEmailId"));
            ind.put("projects", String.join(", ", projects));
            ind.put("hoursLogged", hoursLogged);
            ind.put("allocatedHours", allocated);
            ind.put("utilizationLevel", utilizationLevel);
            ind.put("status", status);
            ind.put("concerns", String.join(", ", concerns));
            individualUtilization.add(ind);
        }
        individualUtilization
                .sort(Comparator.comparing(m -> m.get("resourceName") != null ? m.get("resourceName").toString() : ""));

        report.put("rows", rows);
        report.put("totalResources", totalResources);
        report.put("activeResources", activeResources);
        report.put("allocatedHours", totalEstimatedHours);
        report.put("totalHours", totalActualHours);
        report.put("averageUtilization", avgUtilization);
        report.put("utilizationRate", avgUtilization);
        report.put("projectUtilization", projectUtilization);
        report.put("individualUtilization", individualUtilization);
        report.put("userMap", userMap);

        return report;
    }

    /**
     * Generate resource performance report (for Resource Performance page).
     * Same data as resource utilization but excludes individual utilization.
     */
    public Map<String, Object> generateResourcePerformanceReport(String projectId, String period, User currentUser) {
        Map<String, Object> report = generateResourceUtilizationReport(projectId, period, null, null, currentUser);
        report.remove("individualUtilization");
        return report;
    }

    /**
     * Generate individual utilization report (for Resource Utilization page).
     * Returns rows and individual utilization with filters applied.
     */
    public Map<String, Object> generateIndividualUtilizationReport(String projectName, String userKey,
            String sprint, String duration, LocalDate fromDate, LocalDate toDate, User currentUser) {
        Map<String, Object> report = generateResourceUtilizationReport(null, null, fromDate, toDate, currentUser);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rows = (List<Map<String, Object>>) report.getOrDefault("rows", new ArrayList<>());
        @SuppressWarnings("unchecked")
        Map<String, User> userMap = (Map<String, User>) report.get("userMap");
        List<Map<String, Object>> filteredRows = new ArrayList<>(rows);

        if (projectName != null && !projectName.isEmpty()) {
            filteredRows = filteredRows.stream()
                    .filter(row -> {
                        Object proj = row.get("project");
                        return proj != null && projectName.equals(proj.toString());
                    })
                    .collect(Collectors.toList());
        }
        if (userKey != null && !userKey.isEmpty()) {
            final String keyLower = userKey.toLowerCase();
            filteredRows = filteredRows.stream()
                    .filter(row -> {
                        String email = row.get("resourceEmailId") != null
                                ? row.get("resourceEmailId").toString().toLowerCase()
                                : null;
                        String assigneeName = row.get("resourceName") != null
                                ? row.get("resourceName").toString().toLowerCase()
                                : null;
                        String reporterName = row.get("reporterName") != null
                                ? row.get("reporterName").toString().toLowerCase()
                                : null;
                        return keyLower.equals(email) || keyLower.equals(assigneeName) || keyLower.equals(reporterName);
                    })
                    .collect(Collectors.toList());
        }
        if (sprint != null && !sprint.isEmpty()) {
            filteredRows = filteredRows.stream()
                    .filter(row -> {
                        Object sprintVal = row.get("sprint");
                        return sprintVal != null && sprint.equals(sprintVal.toString());
                    })
                    .collect(Collectors.toList());
        }
        LocalDate now = LocalDate.now();
        LocalDate from = null;
        LocalDate to = null;
        if (duration != null && !"all".equalsIgnoreCase(duration)) {
            if ("last7".equalsIgnoreCase(duration)) {
                from = now.minusDays(7);
                to = now;
            } else if ("last30".equalsIgnoreCase(duration)) {
                from = now.minusDays(30);
                to = now;
            } else if ("custom".equalsIgnoreCase(duration) && fromDate != null && toDate != null) {
                from = fromDate;
                to = toDate;
            }
        }
        final LocalDate fromFinal = from;
        final LocalDate toFinal = to;
            if (fromFinal != null && toFinal != null) {
                filteredRows = filteredRows.stream()
                        .filter(row -> {
                            // 1. Check if any associated time logs fall within the range
                            @SuppressWarnings("unchecked")
                            List<TimeEntry> entries = (List<TimeEntry>) row.get("timeEntries");
                            if (entries != null && !entries.isEmpty()) {
                                boolean hasMatch = entries.stream()
                                        .anyMatch(entry -> {
                                            LocalDate workDate = entry.getWorkDate();
                                            if (workDate != null) {
                                                return !workDate.isBefore(fromFinal) && !workDate.isAfter(toFinal);
                                            }
                                            // Fallback to createdAt if workDate is null
                                            if (entry.getCreatedAt() != null) {
                                                LocalDate createdDate = entry.getCreatedAt().toLocalDate();
                                                return !createdDate.isBefore(fromFinal) && !createdDate.isAfter(toFinal);
                                            }
                                            return false;
                                        });
                                if (hasMatch)
                                    return true;
                            }

                            // 2. Fallback: Check if the task itself was created in this range
                            // (Kept as secondary to ensure newly created tasks with no logs yet are still visible)
                            Object created = row.get("createdDate");
                            if (created != null) {
                                try {
                                    String createdStr = created.toString();
                                    LocalDate createdDate;
                                    if (createdStr.length() > 10 && createdStr.charAt(10) == 'T') {
                                        createdDate = LocalDateTime.parse(createdStr).toLocalDate();
                                    } else {
                                        createdDate = LocalDate
                                                .parse(createdStr.substring(0, Math.min(10, createdStr.length())));
                                    }
                                    return !createdDate.isBefore(fromFinal) && !createdDate.isAfter(toFinal);
                                } catch (Exception e) {
                                    // ignore parsing errors
                                }
                            }

                            return false;
                        })
                        .collect(Collectors.toList());
            }

        // 4. Recalculate Actual Hours for each row based on logs in the range
        // and rebuild the individual utilization summary.
        if (fromFinal != null && toFinal != null) {
            for (Map<String, Object> row : filteredRows) {
                @SuppressWarnings("unchecked")
                List<TimeEntry> entries = (List<TimeEntry>) row.get("timeEntries");
                double periodicActualHours = 0.0;
                    String currentResourceEmail = row.get("resourceEmailId") != null ? row.get("resourceEmailId").toString().toLowerCase() : "";
                    String currentResourceName = row.get("resourceName") != null ? row.get("resourceName").toString().toLowerCase() : "";

                    if (entries != null) {
                        periodicActualHours = entries.stream()
                                .filter(entry -> {
                                    // ONLY count hours logged by THIS resource
                                    String entryUserId = entry.getUserId();
                                    User logUser = (userMap != null && entryUserId != null) ? userMap.get(entryUserId) : null;
                                    if (logUser != null) {
                                        String logEmail = logUser.getEmail() != null ? logUser.getEmail().toLowerCase() : "";
                                        String logName = logUser.getName() != null ? logUser.getName().toLowerCase() : "";
                                        if (!logEmail.equals(currentResourceEmail) && !logName.equals(currentResourceName)) {
                                            return false;
                                        }
                                    }
                                    
                                    LocalDate workDate = entry.getWorkDate();
                                if (workDate != null) {
                                    return !workDate.isBefore(fromFinal) && !workDate.isAfter(toFinal);
                                }
                                if (entry.getCreatedAt() != null) {
                                    LocalDate createdDate = entry.getCreatedAt().toLocalDate();
                                    return !createdDate.isBefore(fromFinal) && !createdDate.isAfter(toFinal);
                                }
                                return false;
                            })
                            .mapToDouble(entry -> entry.getHoursWorked() != null ? entry.getHoursWorked().doubleValue() : 0.0)
                            .sum();
                }
                row.put("actualHours", periodicActualHours);
                double estimated = safeDouble(row.get("estimationHours"));
                row.put("remainingHours", Math.max(0, estimated - periodicActualHours));
            }
        }

        // 5. Re-calculate summaries based on filteredRows
        Map<String, List<Map<String, Object>>> resourceGroups = filteredRows.stream()
                .filter(row -> row.get("resourceEmailId") != null || row.get("resourceName") != null)
                .collect(Collectors.groupingBy(row -> {
                    Object email = row.get("resourceEmailId");
                    Object name = row.get("resourceName");
                    return email != null && !email.toString().isEmpty() ? email.toString()
                            : (name != null ? name.toString() : "Unknown");
                }));

        List<Map<String, Object>> individualUtilization = new ArrayList<>();
        double totalActualHours = 0;
        double totalEstimatedHours = 0;

        for (Map.Entry<String, List<Map<String, Object>>> entry : resourceGroups.entrySet()) {
            List<Map<String, Object>> resourceRows = entry.getValue();
            Map<String, Object> firstRow = resourceRows.get(0);
            
            double hoursLogged = resourceRows.stream().mapToDouble(r -> safeDouble(r.get("actualHours"))).sum();
            double allocated = resourceRows.stream().mapToDouble(r -> safeDouble(r.get("estimationHours"))).sum();
            double completedEstimated = resourceRows.stream()
                .filter(r -> {
                    String s = r.get("status") != null ? r.get("status").toString().toLowerCase() : "";
                    return "done".equals(s) || "completed".equals(s) || s.contains("qa");
                })
                .mapToDouble(r -> safeDouble(r.get("estimationHours")))
                .sum();
            
            double utilizationLevel = hoursLogged > 0 ? (completedEstimated / hoursLogged) * 100 : 0;
            
            Map<String, Object> ind = new LinkedHashMap<>();
            ind.put("resourceName", firstRow.get("resourceName"));
            ind.put("resourceEmailId", firstRow.get("resourceEmailId"));
            ind.put("projects", resourceRows.stream().map(r -> String.valueOf(r.get("project"))).distinct().collect(Collectors.joining(", ")));
            ind.put("hoursLogged", hoursLogged);
            ind.put("allocatedHours", allocated);
            ind.put("utilizationLevel", utilizationLevel);
            ind.put("status", hoursLogged == 0 ? "idle" : (utilizationLevel < 50 ? "underutilized" : (utilizationLevel > 120 ? "overloaded" : "optimal")));
            individualUtilization.add(ind);
            
            totalActualHours += hoursLogged;
            totalEstimatedHours += allocated;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("rows", filteredRows);
        result.put("individualUtilization", individualUtilization);
        result.put("totalHours", totalActualHours);
        result.put("allocatedHours", totalEstimatedHours);
        result.put("totalResources", resourceGroups.size());
        return result;
    }

    /**
     * Export resource PERFORMANCE report to Excel with two sheets:
     * Sheet 1 - Resource Performance Details (detailed rows)
     * Sheet 2 - Resource Performance Summary (developers, managers, testers)
     */
    public byte[] exportResourceUtilizationToExcel(String projectId,
            String period,
            String projectName,
            String userKey,
            String sprint,
            String duration,
            java.time.LocalDate fromDate,
            java.time.LocalDate toDate,
            User currentUser) throws IOException {
        Map<String, Object> report = generateResourceUtilizationReport(projectId, period, fromDate, toDate, currentUser);
        @SuppressWarnings("unchecked")
        Map<String, User> userMap = (Map<String, User>) report.get("userMap");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rows = (List<Map<String, Object>>) report.getOrDefault("rows", new ArrayList<>());

        // Apply filters similar to frontend (project, user, sprint, duration)
        List<Map<String, Object>> filteredRows = new ArrayList<>(rows);

        // Project filter by project name (matches UI filter)
        if (projectName != null && !projectName.isEmpty()) {
            filteredRows = filteredRows.stream()
                    .filter(row -> {
                        Object proj = row.get("project");
                        return proj != null && projectName.equals(proj.toString());
                    })
                    .collect(Collectors.toList());
        }

        // User filter (assignee or reporter)
        if (userKey != null && !userKey.isEmpty()) {
            final String keyLower = userKey.toLowerCase();
            filteredRows = filteredRows.stream()
                    .filter(row -> {
                        String email = row.get("resourceEmailId") != null
                                ? row.get("resourceEmailId").toString().toLowerCase()
                                : null;
                        String assigneeName = row.get("resourceName") != null
                                ? row.get("resourceName").toString().toLowerCase()
                                : null;
                        String reporterName = row.get("reporterName") != null
                                ? row.get("reporterName").toString().toLowerCase()
                                : null;
                        return keyLower.equals(email) || keyLower.equals(assigneeName) || keyLower.equals(reporterName);
                    })
                    .collect(Collectors.toList());
        }

        // Sprint filter (by sprint name)
        if (sprint != null && !sprint.isEmpty()) {
            filteredRows = filteredRows.stream()
                    .filter(row -> {
                        Object sprintVal = row.get("sprint");
                        return sprintVal != null && sprint.equals(sprintVal.toString());
                    })
                    .collect(Collectors.toList());
        }

        // Duration filter (last7, last30, custom) - applied on log dates
        java.time.LocalDate now = java.time.LocalDate.now();
        java.time.LocalDate from = null;
        java.time.LocalDate to = null;

        if (duration != null && !"all".equalsIgnoreCase(duration)) {

            if ("last7".equalsIgnoreCase(duration)) {
                from = now.minusDays(7);
                to = now;
            } else if ("last30".equalsIgnoreCase(duration)) {
                from = now.minusDays(30);
                to = now;
            } else if ("custom".equalsIgnoreCase(duration)) {
                from = fromDate;
                to = toDate;
            }
        }

        final java.time.LocalDate fromFinal = from;
        final java.time.LocalDate toFinal = to;

            if (fromFinal != null && toFinal != null) {
                filteredRows = filteredRows.stream()
                        .filter(row -> {
                            // 1. Check if any associated time logs fall within the range
                            @SuppressWarnings("unchecked")
                            List<TimeEntry> entries = (List<TimeEntry>) row.get("timeEntries");
                            if (entries != null && !entries.isEmpty()) {
                                boolean hasMatch = entries.stream()
                                        .anyMatch(entry -> {
                                            LocalDate workDate = entry.getWorkDate();
                                            if (workDate != null) {
                                                return !workDate.isBefore(fromFinal) && !workDate.isAfter(toFinal);
                                            }
                                            // Fallback to createdAt if workDate is null
                                            if (entry.getCreatedAt() != null) {
                                                LocalDate createdDate = entry.getCreatedAt().toLocalDate();
                                                return !createdDate.isBefore(fromFinal) && !createdDate.isAfter(toFinal);
                                            }
                                            return false;
                                        });
                                if (hasMatch)
                                    return true;
                            }

                            // 2. Fallback: Check if the task itself was created in this range
                            Object created = row.get("createdDate");
                            if (created != null) {
                                try {
                                    String createdStr = created.toString();
                                    LocalDate createdDate;
                                    if (createdStr.length() > 10 && createdStr.charAt(10) == 'T') {
                                        createdDate = LocalDateTime.parse(createdStr).toLocalDate();
                                    } else {
                                        createdDate = LocalDate
                                                .parse(createdStr.substring(0, Math.min(10, createdStr.length())));
                                    }
                                    return !createdDate.isBefore(fromFinal) && !createdDate.isAfter(toFinal);
                                } catch (Exception e) {
                                    // ignore parsing errors
                                }
                            }

                            return false;
                        })
                        .collect(Collectors.toList());
        }

        if (fromFinal != null && toFinal != null) {
                for (Map<String, Object> row : filteredRows) {
                    @SuppressWarnings("unchecked")
                    List<TimeEntry> entries = (List<TimeEntry>) row.get("timeEntries");
                    double periodicActualHours = 0.0;
                    String currentResourceEmail = row.get("resourceEmailId") != null ? row.get("resourceEmailId").toString().toLowerCase() : "";
                    String currentResourceName = row.get("resourceName") != null ? row.get("resourceName").toString().toLowerCase() : "";

                    if (entries != null) {
                        periodicActualHours = entries.stream()
                                .filter(entry -> {
                                    // ONLY count hours logged by THIS resource
                                    String entryUserId = entry.getUserId();
                                    User logUser = (userMap != null && entryUserId != null) ? userMap.get(entryUserId) : null;
                                    if (logUser != null) {
                                        String logEmail = logUser.getEmail() != null ? logUser.getEmail().toLowerCase() : "";
                                        String logName = logUser.getName() != null ? logUser.getName().toLowerCase() : "";
                                        if (!logEmail.equals(currentResourceEmail) && !logName.equals(currentResourceName)) {
                                            return false;
                                        }
                                    }

                                    java.time.LocalDate workDate = entry.getWorkDate();
                                    if (workDate != null) {
                                        return !workDate.isBefore(fromFinal) && !workDate.isAfter(toFinal);
                                    }
                                    if (entry.getCreatedAt() != null) {
                                        java.time.LocalDate createdDate = entry.getCreatedAt().toLocalDate();
                                        return !createdDate.isBefore(fromFinal) && !createdDate.isAfter(toFinal);
                                    }
                                    return false;
                                })
                                .mapToDouble(entry -> entry.getHoursWorked() != null ? entry.getHoursWorked().doubleValue() : 0.0)
                                .sum();
                    }
                    row.put("actualHours", periodicActualHours);
                    double estimated = safeDouble(row.get("estimationHours"));
                    row.put("remainingHours", Math.max(0, estimated - periodicActualHours));
                }
            }

        // Use filtered rows for export and summaries
        rows = filteredRows;

        // Build user role map (email/name -> role)
        Map<String, String> userRoleMap = userRepository.findAll().stream().collect(Collectors.toMap(
                user -> user.getEmail() != null ? user.getEmail().toLowerCase() : user.getId(),
                user -> user.getRole() != null ? user.getRole().getValue().toLowerCase() : "",
                (a, b) -> a));
        userRepository.findAll().forEach(user -> {
            if (user.getName() != null) {
                userRoleMap.put(user.getName().toLowerCase(),
                        user.getRole() != null ? user.getRole().getValue().toLowerCase() : "");
            }
        });

        // Helper lambdas for classification
        java.util.function.Predicate<Map<String, Object>> isBugRow = row -> {
            Object isBug = row.get("isBug");
            if (isBug instanceof Boolean) {
                return (Boolean) isBug;
            }
            String category = row.get("workCategory") != null ? row.get("workCategory").toString().toLowerCase() : "";
            String status = row.get("status") != null ? row.get("status").toString().toLowerCase() : "";
            return category.contains("bug") || status.contains("bug");
        };

        java.util.function.Predicate<Map<String, Object>> isIssueRow = row -> {
            Object itemType = row.get("itemType");
            if (itemType != null && "ISSUE".equalsIgnoreCase(itemType.toString())) {
                return true;
            }
            return isBugRow.test(row);
        };

        java.util.function.Predicate<Map<String, Object>> isTaskRow = row -> {
            Object itemType = row.get("itemType");
            if (itemType != null && "TASK".equalsIgnoreCase(itemType.toString())) {
                return true;
            }
            return !isIssueRow.test(row);
        };

        // Pre-calculate created counts per reporter
        Map<String, Integer> createdIssueMap = new HashMap<>();
        Map<String, Integer> createdTaskMap = new HashMap<>();
        for (Map<String, Object> row : rows) {
            Object reporterNameObj = row.get("reporterName");
            if (reporterNameObj == null) {
                continue;
            }
            String reporterKey = reporterNameObj.toString().toLowerCase();
            if (reporterKey.isEmpty()) {
                continue;
            }

            if (isIssueRow.test(row)) {
                createdIssueMap.put(reporterKey, createdIssueMap.getOrDefault(reporterKey, 0) + 1);
            } else if (isTaskRow.test(row)) {
                createdTaskMap.put(reporterKey, createdTaskMap.getOrDefault(reporterKey, 0) + 1);
            }
        }

        // Group rows by resource (assignee)
        Map<String, List<Map<String, Object>>> resourceMap = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            String email = row.get("resourceEmailId") != null ? row.get("resourceEmailId").toString() : null;
            String name = row.get("resourceName") != null ? row.get("resourceName").toString() : null;
            String key = email != null && !email.isEmpty() ? email : (name != null ? name : null);
            if (key == null || key.isEmpty()) {
                continue;
            }
            resourceMap.computeIfAbsent(key, k -> new ArrayList<>()).add(row);
        }

        // Build individual utilization for Excel (from filtered rows)
        List<Map<String, Object>> individualUtilizationExport = new ArrayList<>();
        for (Map.Entry<String, List<Map<String, Object>>> entry : resourceMap.entrySet()) {
            List<Map<String, Object>> resourceRows = entry.getValue();
            Map<String, Object> firstRow = resourceRows.get(0);
            String resourceName = firstRow.get("resourceName") != null ? firstRow.get("resourceName").toString()
                    : entry.getKey();

            List<String> projectSprintPairs = resourceRows.stream()
                    .map(r -> {
                        String p = r.get("project") != null ? r.get("project").toString() : "—";
                        String s = r.get("sprint") != null ? r.get("sprint").toString() : "—";
                        return p + " - " + s;
                    })
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());

            int taskIssueCount = resourceRows.size();

            double hoursLogged = resourceRows.stream()
                    .mapToDouble(r -> safeDouble(r.get("actualHours")))
                    .sum();
            double allocated = resourceRows.stream()
                    .mapToDouble(r -> safeDouble(r.get("estimationHours")))
                    .sum();
            double utilizationLevel = allocated > 0 ? (hoursLogged / allocated) * 100 : 0;

            long inProgressCount = resourceRows.stream()
                    .filter(r -> {
                        String s = r.get("status") != null ? r.get("status").toString().toLowerCase() : "";
                        return "in_progress".equals(s) || "in-progress".equals(s) || "in progress".equals(s);
                    })
                    .count();

            String status = "optimal";
            List<String> concerns = new ArrayList<>();
            if (hoursLogged == 0) {
                status = "idle";
                concerns.add("Idle");
            } else if (allocated == 0) {
                concerns.add("No allocation");
            } else if (utilizationLevel < 50) {
                status = "underutilized";
                concerns.add("Underutilized");
            } else if (utilizationLevel > 120 || inProgressCount > 5) {
                status = "overloaded";
                if (utilizationLevel > 120)
                    concerns.add("Overloaded");
                if (inProgressCount > 5)
                    concerns.add("High in-progress count");
            }

            Map<String, Object> ind = new LinkedHashMap<>();
            ind.put("resourceName", resourceName);
            ind.put("projectSprintPairs", String.join(", ", projectSprintPairs));
            ind.put("taskIssueCount", taskIssueCount);
            ind.put("hoursLogged", hoursLogged);
            ind.put("allocatedHours", allocated);
            ind.put("utilizationLevel", utilizationLevel);
            ind.put("status", status);
            ind.put("concerns", String.join(", ", concerns));
            individualUtilizationExport.add(ind);
        }
        individualUtilizationExport
                .sort(Comparator.comparing(m -> m.get("resourceName") != null ? m.get("resourceName").toString() : ""));

        List<Map<String, Object>> developers = new ArrayList<>();
        List<Map<String, Object>> managers = new ArrayList<>();
        List<Map<String, Object>> testers = new ArrayList<>();

        for (Map.Entry<String, List<Map<String, Object>>> entry : resourceMap.entrySet()) {
            String resourceKey = entry.getKey();
            List<Map<String, Object>> resourceRows = entry.getValue();

            Map<String, Object> firstRow = resourceRows.get(0);
            String resourceName = firstRow.get("resourceName") != null ? firstRow.get("resourceName").toString()
                    : resourceKey;
            String resourceEmail = firstRow.get("resourceEmailId") != null
                    ? firstRow.get("resourceEmailId").toString().toLowerCase()
                    : "";
            String resourceNameLower = resourceName.toLowerCase();

            String userRole = userRoleMap.getOrDefault(resourceEmail,
                    userRoleMap.getOrDefault(resourceNameLower, "")).toLowerCase();

            boolean isManager = userRole.contains("manager");
            boolean isTester = !isManager && (userRole.contains("qa") || "tester".equals(userRole)
                    || userRole.contains("test"));

            long taskAssigned = resourceRows.stream().filter(isTaskRow).count();
            long issueAssigned = resourceRows.stream().filter(isIssueRow).count();

            int issueCreated = createdIssueMap.getOrDefault(resourceNameLower, 0);
            int taskCreated = createdTaskMap.getOrDefault(resourceNameLower, 0);

            if (isManager) {
                Map<String, Object> mgr = new LinkedHashMap<>();
                mgr.put("name", resourceName);
                mgr.put("taskAssigned", taskAssigned);
                mgr.put("issueAssigned", issueAssigned);
                mgr.put("taskCreated", taskCreated);
                mgr.put("issueCreated", issueCreated);
                managers.add(mgr);
            } else if (isTester) {
                Map<String, Object> tester = new LinkedHashMap<>();
                tester.put("name", resourceName);
                tester.put("taskAssigned", taskAssigned);
                tester.put("issueCreated", issueCreated);
                testers.add(tester);
            } else {
                long toDo = resourceRows.stream().filter(r -> {
                    String status = r.get("status") != null ? r.get("status").toString().toLowerCase() : "";
                    return "to_do".equals(status) || "todo".equals(status) || "to do".equals(status);
                }).count();

                long onGoing = resourceRows.stream().filter(r -> {
                    String status = r.get("status") != null ? r.get("status").toString().toLowerCase() : "";
                    return "in_progress".equals(status) || "in-progress".equals(status) || "in progress".equals(status);
                }).count();

                long done = resourceRows.stream().filter(r -> {
                    String status = r.get("status") != null ? r.get("status").toString().toLowerCase() : "";
                    return "done".equals(status) || "completed".equals(status);
                }).count();

                long totalBugResolved = resourceRows.stream().filter(r -> {
                    String status = r.get("status") != null ? r.get("status").toString().toLowerCase() : "";
                    return isIssueRow.test(r) && ("done".equals(status) || "completed".equals(status));
                }).count();

                long reworkCountForBugs = resourceRows.stream().filter(r -> {
                    if (!isIssueRow.test(r))
                        return false;
                    Object isRework = r.get("isRework");
                    return Boolean.TRUE.equals(isRework);
                }).count();

                Map<String, Object> dev = new LinkedHashMap<>();
                dev.put("name", resourceName);
                dev.put("taskAssigned", taskAssigned);
                dev.put("issueAssigned", issueAssigned);
                dev.put("toDo", toDo);
                dev.put("onGoing", onGoing);
                dev.put("done", done);
                dev.put("totalBugResolved", totalBugResolved);
                dev.put("reworkCountForBugs", reworkCountForBugs);
                developers.add(dev);
            }
        }

        try (Workbook workbook = new XSSFWorkbook()) {
            // Styles
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setWrapText(true);

            // Sheet 1: Resource Performance Details
            Sheet detailsSheet = workbook.createSheet("Resource Performance Details");
            Row headerRow = detailsSheet.createRow(0);
            String[] detailsHeaders = {
                    "Resource Email Id", "Resource Name", "Task/Issue Name", "Task/Issue Id", "Story Name", "Story Id",
                    "Estimation Hours", "Actual Hours", "Remaining Hours", "Reporter Name", "Work Category",
                    "Status", "Created Date", "Due Date", "Completed Date", "Sprint", "Project"
            };

            for (int i = 0; i < detailsHeaders.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(detailsHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Map<String, Object> row : rows) {
                Row excelRow = detailsSheet.createRow(rowNum++);
                int col = 0;
                createCell(excelRow, col++,
                        row.get("resourceEmailId") != null ? row.get("resourceEmailId").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("resourceName") != null ? row.get("resourceName").toString() : "",
                        dataStyle);
                createCell(excelRow, col++, row.get("taskIssueName") != null ? row.get("taskIssueName").toString() : "",
                        dataStyle);
                createCell(excelRow, col++, row.get("taskIssueId") != null ? row.get("taskIssueId").toString() : "",
                        dataStyle);
                createCell(excelRow, col++, row.get("storyName") != null ? row.get("storyName").toString() : "",
                        dataStyle);
                createCell(excelRow, col++, row.get("storyId") != null ? row.get("storyId").toString() : "", dataStyle);
                createCell(excelRow, col++,
                        row.get("estimationHours") != null ? row.get("estimationHours").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("actualHours") != null ? row.get("actualHours").toString() : "",
                        dataStyle);
                createCell(excelRow, col++,
                        row.get("remainingHours") != null ? row.get("remainingHours").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("reporterName") != null ? row.get("reporterName").toString() : "",
                        dataStyle);
                createCell(excelRow, col++, row.get("workCategory") != null ? row.get("workCategory").toString() : "",
                        dataStyle);
                createCell(excelRow, col++, row.get("status") != null ? row.get("status").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("createdDate") != null ? row.get("createdDate").toString() : "",
                        dataStyle);
                createCell(excelRow, col++, row.get("dueDate") != null ? row.get("dueDate").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("completedDate") != null ? row.get("completedDate").toString() : "",
                        dataStyle);
                createCell(excelRow, col++, row.get("sprint") != null ? row.get("sprint").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("project") != null ? row.get("project").toString() : "", dataStyle);
            }

            for (int i = 0; i < detailsHeaders.length; i++) {
                detailsSheet.autoSizeColumn(i);
            }

            // Sheet 2: Resource Performance Summary (Developers, Managers, Testers)
            Sheet summarySheet = workbook.createSheet("Resource Performance Summary");
            int summaryRowNum = 0;

            // Developers summary
            if (!developers.isEmpty()) {
                Row titleRow = summarySheet.createRow(summaryRowNum++);
                Cell titleCell = titleRow.createCell(0);
                titleCell.setCellValue("Developers Summary");
                titleCell.setCellStyle(headerStyle);

                Row devHeaderRow = summarySheet.createRow(summaryRowNum++);
                String[] devHeaders = {
                        "Name (Developer)", "Task Assigned", "Issue Assigned", "To Do", "On Going",
                        "Done", "Total Bug Resolved", "Rework Count For Bugs"
                };
                for (int i = 0; i < devHeaders.length; i++) {
                    Cell cell = devHeaderRow.createCell(i);
                    cell.setCellValue(devHeaders[i]);
                    cell.setCellStyle(headerStyle);
                }

                for (Map<String, Object> dev : developers) {
                    Row r = summarySheet.createRow(summaryRowNum++);
                    int c = 0;
                    createCell(r, c++, dev.get("name") != null ? dev.get("name").toString() : "", dataStyle);
                    createCell(r, c++, String.valueOf(dev.getOrDefault("taskAssigned", 0)), dataStyle);
                    createCell(r, c++, String.valueOf(dev.getOrDefault("issueAssigned", 0)), dataStyle);
                    createCell(r, c++, String.valueOf(dev.getOrDefault("toDo", 0)), dataStyle);
                    createCell(r, c++, String.valueOf(dev.getOrDefault("onGoing", 0)), dataStyle);
                    createCell(r, c++, String.valueOf(dev.getOrDefault("done", 0)), dataStyle);
                    createCell(r, c++, String.valueOf(dev.getOrDefault("totalBugResolved", 0)), dataStyle);
                    createCell(r, c++, String.valueOf(dev.getOrDefault("reworkCountForBugs", 0)), dataStyle);
                }

                summaryRowNum += 2; // spacer
            }

            // Managers summary
            if (!managers.isEmpty()) {
                Row titleRow = summarySheet.createRow(summaryRowNum++);
                Cell titleCell = titleRow.createCell(0);
                titleCell.setCellValue("Managers Summary");
                titleCell.setCellStyle(headerStyle);

                Row mgrHeaderRow = summarySheet.createRow(summaryRowNum++);
                String[] mgrHeaders = {
                        "Name (Manager)", "Issue Created", "Task Created", "Task Assigned", "Issue Assigned"
                };
                for (int i = 0; i < mgrHeaders.length; i++) {
                    Cell cell = mgrHeaderRow.createCell(i);
                    cell.setCellValue(mgrHeaders[i]);
                    cell.setCellStyle(headerStyle);
                }

                for (Map<String, Object> mgr : managers) {
                    Row r = summarySheet.createRow(summaryRowNum++);
                    int c = 0;
                    createCell(r, c++, mgr.get("name") != null ? mgr.get("name").toString() : "", dataStyle);
                    createCell(r, c++, String.valueOf(mgr.getOrDefault("issueCreated", 0)), dataStyle);
                    createCell(r, c++, String.valueOf(mgr.getOrDefault("taskCreated", 0)), dataStyle);
                    createCell(r, c++, String.valueOf(mgr.getOrDefault("taskAssigned", 0)), dataStyle);
                    createCell(r, c++, String.valueOf(mgr.getOrDefault("issueAssigned", 0)), dataStyle);
                }

                summaryRowNum += 2; // spacer
            }

            // Testers summary
            if (!testers.isEmpty()) {
                Row titleRow = summarySheet.createRow(summaryRowNum++);
                Cell titleCell = titleRow.createCell(0);
                titleCell.setCellValue("Testers Summary");
                titleCell.setCellStyle(headerStyle);

                Row testerHeaderRow = summarySheet.createRow(summaryRowNum++);
                String[] testerHeaders = {
                        "Name (Tester)", "Issue Created", "Task Assigned"
                };
                for (int i = 0; i < testerHeaders.length; i++) {
                    Cell cell = testerHeaderRow.createCell(i);
                    cell.setCellValue(testerHeaders[i]);
                    cell.setCellStyle(headerStyle);
                }

                for (Map<String, Object> tester : testers) {
                    Row r = summarySheet.createRow(summaryRowNum++);
                    int c = 0;
                    createCell(r, c++, tester.get("name") != null ? tester.get("name").toString() : "", dataStyle);
                    createCell(r, c++, String.valueOf(tester.getOrDefault("issueCreated", 0)), dataStyle);
                    createCell(r, c++, String.valueOf(tester.getOrDefault("taskAssigned", 0)), dataStyle);
                }
            }

            for (int i = 0; i < 10; i++) {
                summarySheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Export Resource Utilization report to Excel with two sheets:
     * Sheet 1 - Individual Utilization Summary
     * Sheet 2 - Sprint and Task/Issue Count (expanded report with colors)
     */
    public byte[] exportIndividualUtilizationToExcel(String projectName, String userKey, String sprint,
            String duration, LocalDate fromDate, LocalDate toDate, User currentUser) throws IOException {
        Map<String, Object> report = generateIndividualUtilizationReport(projectName, userKey, sprint, duration,
                fromDate, toDate, currentUser);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> filteredRows = (List<Map<String, Object>>) report.getOrDefault("rows",
                new ArrayList<>());

        // Build Individual Utilization with project-sprint breakdown (matching UI)
        Map<String, List<Map<String, Object>>> resourceMap = new LinkedHashMap<>();
        for (Map<String, Object> row : filteredRows) {
            String email = row.get("resourceEmailId") != null ? row.get("resourceEmailId").toString() : null;
            String name = row.get("resourceName") != null ? row.get("resourceName").toString() : null;
            String key = email != null && !email.isEmpty() ? email : (name != null ? name : null);
            if (key == null || key.isEmpty())
                continue;
            resourceMap.computeIfAbsent(key, k -> new ArrayList<>()).add(row);
        }

        List<Map<String, Object>> individualUtilization = new ArrayList<>();
        for (Map.Entry<String, List<Map<String, Object>>> entry : resourceMap.entrySet()) {
            List<Map<String, Object>> resourceRows = entry.getValue();
            Map<String, Object> firstRow = resourceRows.get(0);
            String resourceName = firstRow.get("resourceName") != null ? firstRow.get("resourceName").toString()
                    : entry.getKey();

            List<String> projects = resourceRows.stream()
                    .map(r -> r.get("project"))
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .distinct()
                    .collect(Collectors.toList());

            List<String> sprints = resourceRows.stream()
                    .map(r -> r.get("sprint"))
                    .filter(Objects::nonNull)
                    .map(Object::toString)
                    .distinct()
                    .collect(Collectors.toList());

            int taskCount = (int) resourceRows.stream()
                    .filter(r -> "TASK".equalsIgnoreCase(r.get("itemType") != null ? r.get("itemType").toString() : ""))
                    .count();
            int issueCount = (int) resourceRows.stream()
                    .filter(r -> "ISSUE"
                            .equalsIgnoreCase(r.get("itemType") != null ? r.get("itemType").toString() : ""))
                    .count();
            int taskIssueCount = resourceRows.size();

            double hoursLogged = resourceRows.stream()
                    .mapToDouble(r -> safeDouble(r.get("actualHours")))
                    .sum();
            double allocated = resourceRows.stream()
                    .mapToDouble(r -> safeDouble(r.get("estimationHours")))
                    .sum();
            double utilizationLevel = allocated > 0 ? (hoursLogged / allocated) * 100 : 0;

            long inProgressCount = resourceRows.stream()
                    .filter(r -> {
                        String s = r.get("status") != null ? r.get("status").toString().toLowerCase() : "";
                        return "in_progress".equals(s) || "in-progress".equals(s) || "in progress".equals(s);
                    })
                    .count();

            String status = "optimal";
            if (hoursLogged == 0)
                status = "idle";
            else if (allocated == 0)
                status = "optimal";
            else if (utilizationLevel < 50)
                status = "underutilized";
            else if (utilizationLevel > 120 || inProgressCount > 5)
                status = "overloaded";

            Map<String, Object> ind = new LinkedHashMap<>();
            ind.put("resourceName", resourceName);
            ind.put("resourceEmailId", firstRow.get("resourceEmailId"));
            ind.put("projects", String.join(", ", projects));
            ind.put("sprints", String.join(", ", sprints));
            ind.put("taskCount", taskCount);
            ind.put("issueCount", issueCount);
            ind.put("taskIssueCount", taskIssueCount);
            ind.put("hoursLogged", hoursLogged);
            ind.put("allocatedHours", allocated);
            ind.put("utilizationLevel", utilizationLevel);
            ind.put("status", status);
            individualUtilization.add(ind);
        }
        individualUtilization
                .sort(Comparator.comparing(m -> m.get("resourceName") != null ? m.get("resourceName").toString() : ""));

        // Build project-sprint breakdown (expandable rows in UI)
        List<Map<String, Object>> projectSprintBreakdown = new ArrayList<>();
        for (Map.Entry<String, List<Map<String, Object>>> entry : resourceMap.entrySet()) {
            List<Map<String, Object>> resourceRows = entry.getValue();
            Map<String, Object> firstRow = resourceRows.get(0);
            String resourceName = firstRow.get("resourceName") != null ? firstRow.get("resourceName").toString()
                    : entry.getKey();

            // Group by project-sprint
            Map<String, List<Map<String, Object>>> psMap = new LinkedHashMap<>();
            for (Map<String, Object> row : resourceRows) {
                String proj = row.get("project") != null ? row.get("project").toString() : "—";
                String spr = row.get("sprint") != null ? row.get("sprint").toString() : "—";
                String key = proj + "|||" + spr;
                psMap.computeIfAbsent(key, k -> new ArrayList<>()).add(row);
            }

            for (Map.Entry<String, List<Map<String, Object>>> psEntry : psMap.entrySet()) {
                String[] parts = psEntry.getKey().split("\\|\\|\\|", 2);
                String project = parts.length > 0 ? parts[0] : "—";
                String sprintName = parts.length > 1 ? parts[1] : "—";
                List<Map<String, Object>> psRows = psEntry.getValue();

                int taskIssueCount = psRows.size();
                double hoursLogged = psRows.stream()
                        .mapToDouble(r -> safeDouble(r.get("actualHours")))
                        .sum();
                double allocated = psRows.stream()
                        .mapToDouble(r -> safeDouble(r.get("estimationHours")))
                        .sum();
                double utilLevel = allocated > 0 ? (hoursLogged / allocated) * 100 : 0;

                String psStatus = "optimal";
                if (hoursLogged == 0)
                    psStatus = "idle";
                else if (allocated == 0)
                    psStatus = "optimal";
                else if (utilLevel < 50)
                    psStatus = "underutilized";
                else if (utilLevel > 120)
                    psStatus = "overloaded";

                Map<String, Object> ps = new LinkedHashMap<>();
                ps.put("resourceName", resourceName);
                ps.put("resourceEmailId", firstRow.get("resourceEmailId"));
                ps.put("project", project);
                ps.put("sprint", sprintName);
                ps.put("taskIssueCount", taskIssueCount);
                ps.put("allocatedHours", allocated);
                ps.put("hoursLogged", hoursLogged);
                ps.put("utilizationLevel", utilLevel);
                ps.put("status", psStatus);
                projectSprintBreakdown.add(ps);
            }
        }
        projectSprintBreakdown.sort(Comparator
                .comparing((Map<String, Object> m) -> m.get("resourceName") != null ? m.get("resourceName").toString()
                        : "")
                .thenComparing(m -> m.get("project") != null ? m.get("project").toString() : "")
                .thenComparing(m -> m.get("sprint") != null ? m.get("sprint").toString() : ""));

        try (Workbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 11);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setBorderTop(BorderStyle.THIN);
            headerStyle.setBorderLeft(BorderStyle.THIN);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderBottom(BorderStyle.THIN);
            dataStyle.setBorderTop(BorderStyle.THIN);
            dataStyle.setBorderLeft(BorderStyle.THIN);
            dataStyle.setBorderRight(BorderStyle.THIN);
            dataStyle.setWrapText(true);

            // Sheet 1: Individual Utilization Summary
            Sheet sheet = workbook.createSheet("Individual Utilization Summary");
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                    "Team Member Name", "Resource Email", "Project", "Sprint", "Task/Issue Count",
                    "Total Assigned Hours",
                    "Hours Logged", "Utilization Level", "Status"
            };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Map<String, Object> ind : individualUtilization) {
                Row r = sheet.createRow(rowNum++);
                int c = 0;
                createCell(r, c++, ind.get("resourceName") != null ? ind.get("resourceName").toString() : "",
                        dataStyle);
                createCell(r, c++, ind.get("resourceEmailId") != null ? ind.get("resourceEmailId").toString() : "",
                        dataStyle);
                createCell(r, c++, ind.get("projects") != null ? ind.get("projects").toString() : "", dataStyle);
                createCell(r, c++, ind.get("sprints") != null ? ind.get("sprints").toString() : "", dataStyle);
                createCell(r, c++, ind.get("taskIssueCount") != null ? String.valueOf(ind.get("taskIssueCount")) : "0",
                        dataStyle);
                createCell(r, c++,
                        String.format("%.1f", safeDouble(ind.get("allocatedHours"))),
                        dataStyle);
                createCell(r, c++,
                        String.format("%.1f", safeDouble(ind.get("hoursLogged"))),
                        dataStyle);
                double allocVal = safeDouble(ind.get("allocatedHours"));
                double utilVal = safeDouble(ind.get("utilizationLevel"));
                String utilStr = allocVal > 0 ? String.format("%.1f%%", utilVal) : "N/A";
                createCell(r, c++, utilStr, dataStyle);
                createCell(r, c++, ind.get("status") != null ? ind.get("status").toString() : "", dataStyle);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Sheet 2: Sprint and Task-Issue Count (expanded report with colors; / invalid
            // in sheet names)
            Sheet sheetDetails = workbook.createSheet("Sprint and Task-Issue Count");
            String[] detailHeaders = {
                    "Resource Email", "Team Member Name", "Project", "Sprint", "Item Type", "Task/Issue Name",
                    "Task/Issue Id", "Story Name", "Story Id", "Estimation Hours", "Actual Hours", "Utilization %",
                    "Utilization Status",
                    "Remaining Hours", "Status", "Created Date", "Due Date", "Completed Date", "Reporter",
                    "Work Category",
                    "Is Bug", "Is Rework"
            };
            Row detailHeaderRow = sheetDetails.createRow(0);
            for (int i = 0; i < detailHeaders.length; i++) {
                Cell cell = detailHeaderRow.createCell(i);
                cell.setCellValue(detailHeaders[i]);
                cell.setCellStyle(headerStyle);
            }

            int detailRowNum = 1;
            for (Map<String, Object> row : filteredRows) {
                Row r = sheetDetails.createRow(detailRowNum++);
                int c = 0;
                createCell(r, c++, row.get("resourceEmailId") != null ? row.get("resourceEmailId").toString() : "",
                        dataStyle);
                createCell(r, c++, row.get("resourceName") != null ? row.get("resourceName").toString() : "",
                        dataStyle);
                createCell(r, c++, row.get("project") != null ? row.get("project").toString() : "", dataStyle);
                createCell(r, c++, row.get("sprint") != null ? row.get("sprint").toString() : "", dataStyle);
                createCell(r, c++, row.get("itemType") != null ? row.get("itemType").toString() : "", dataStyle);
                createCell(r, c++, row.get("taskIssueName") != null ? row.get("taskIssueName").toString() : "",
                        dataStyle);
                createCell(r, c++, row.get("taskIssueId") != null ? row.get("taskIssueId").toString() : "",
                        dataStyle);
                createCell(r, c++, row.get("storyName") != null ? row.get("storyName").toString() : "",
                        dataStyle);
                createCell(r, c++, row.get("storyId") != null ? row.get("storyId").toString() : "",
                        dataStyle);
                createCell(r, c++,
                        row.get("estimationHours") != null
                                ? String.format("%.2f", safeDouble(row.get("estimationHours")))
                                : "",
                        dataStyle);
                createCell(r, c++,
                        row.get("actualHours") != null ? String.format("%.2f", safeDouble(row.get("actualHours"))) : "",
                        dataStyle);
                double estH = safeDouble(row.get("estimationHours"));
                double actH = safeDouble(row.get("actualHours"));
                double detailUtil = estH > 0 ? (actH / estH) * 100 : 0;
                String detailUtilStr = estH > 0 ? String.format("%.1f%%", detailUtil) : "N/A";
                String detailStatus = estH <= 0 ? "optimal"
                        : actH == 0 ? "idle"
                                : detailUtil < 50 ? "underutilized" : detailUtil > 120 ? "overloaded" : "optimal";
                createCell(r, c++, detailUtilStr, dataStyle);
                createCell(r, c++, detailStatus.substring(0, 1).toUpperCase() + detailStatus.substring(1), dataStyle);
                createCell(r, c++,
                        row.get("remainingHours") != null ? String.format("%.2f", safeDouble(row.get("remainingHours")))
                                : "",
                        dataStyle);
                createCell(r, c++, row.get("status") != null ? row.get("status").toString() : "", dataStyle);
                createCell(r, c++, row.get("createdDate") != null ? row.get("createdDate").toString() : "",
                        dataStyle);
                createCell(r, c++, row.get("dueDate") != null ? row.get("dueDate").toString() : "",
                        dataStyle);
                createCell(r, c++, row.get("completedDate") != null ? row.get("completedDate").toString() : "",
                        dataStyle);
                createCell(r, c++, row.get("reporterName") != null ? row.get("reporterName").toString() : "",
                        dataStyle);
                createCell(r, c++, row.get("workCategory") != null ? row.get("workCategory").toString() : "",
                        dataStyle);
                createCell(r, c++,
                        row.get("isBug") != null ? String.valueOf(row.get("isBug")) : "",
                        dataStyle);
                createCell(r, c++,
                        row.get("isRework") != null ? String.valueOf(row.get("isRework")) : "",
                        dataStyle);
            }

            for (int i = 0; i < detailHeaders.length; i++) {
                sheetDetails.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Helper method to create a cell with value
     */
    private void createCell(Row row, int column, String value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    /**
     * Safely extract double from map value (handles Number, String, null)
     */
    private double safeDouble(Object val) {
        if (val == null)
            return 0;
        if (val instanceof Number)
            return ((Number) val).doubleValue();
        try {
            return Double.parseDouble(val.toString());
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
