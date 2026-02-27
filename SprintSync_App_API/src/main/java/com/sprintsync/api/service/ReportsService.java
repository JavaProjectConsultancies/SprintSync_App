package com.sprintsync.api.service;

import com.sprintsync.api.entity.*;
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
    public Map<String, Object> generateProjectSummaryReport() {
        Map<String, Object> report = new HashMap<>();

        List<Project> projects = projectRepository.findAll();
        report.put("totalProjects", projects.size());

        Map<com.sprintsync.api.entity.enums.ProjectStatus, Long> statusCount = projects.stream()
                .collect(Collectors.groupingBy(Project::getStatus, Collectors.counting()));
        report.put("statusDistribution", statusCount);

        return report;
    }

    /**
     * Generate project summary report for specific project
     */
    public Map<String, Object> generateProjectSummaryReport(String projectId) {
        Map<String, Object> report = new HashMap<>();

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
     * Uses time_entries table for actual hours and activity_logs for completion dates
     */
    public Map<String, Object> generateResourceUtilizationReport(String projectId, String period) {
        Map<String, Object> report = new HashMap<>();
        
        List<Map<String, Object>> rows = new ArrayList<>();
        
        // Process Tasks
        // NOTE: To keep this endpoint fast, we avoid per-task time entry and activity log queries.
        // Actual hours come from the task entity (kept in sync with time entries) and completed date
        // is approximated using updatedAt when status is DONE.
        List<Task> tasks = projectId != null && !projectId.isEmpty()
            ? taskRepository.findAll().stream()
                .filter(task -> {
                    if (task.getStoryId() == null) {
                        return false;
                    }
                    Optional<Story> story = storyRepository.findById(task.getStoryId());
                    return story.isPresent() && projectId.equals(story.get().getProjectId());
                })
                .collect(Collectors.toList())
            : taskRepository.findAll();
        
        for (Task task : tasks) {
            if (task.getAssigneeId() == null || task.getAssigneeId().isEmpty() || task.getStoryId() == null) {
                continue;
            }
            
            Optional<User> assignee = userRepository.findById(task.getAssigneeId());
            Optional<Story> story = storyRepository.findById(task.getStoryId());
            Optional<User> reporter = task.getReporterId() != null 
                ? userRepository.findById(task.getReporterId()) 
                : Optional.empty();
            
            if (!assignee.isPresent() || !story.isPresent()) {
                continue;
            }
            
            // Use actual hours from task entity (already synced with time entries)
            double actualHours = task.getActualHours() != null
                    ? task.getActualHours().doubleValue()
                    : 0.0;

            // Work category from labels (fallback to generic label)
            String workCategory = task.getLabels() != null && !task.getLabels().isEmpty()
                    ? String.join(", ", task.getLabels())
                    : "Development";

            boolean isBugWorkItem = workCategory.toLowerCase().contains("bug");

            // Approximate completed date using updatedAt when status is DONE
            String completedDate = null;
            if (task.getStatus() != null
                    && task.getStatus().getValue().equals("done")
                    && task.getUpdatedAt() != null) {
                completedDate = task.getUpdatedAt().toString();
            }
            
            Map<String, Object> row = new HashMap<>();
            row.put("resourceEmailId", assignee.get().getEmail());
            row.put("resourceName", assignee.get().getName());
            row.put("taskIssueName", task.getTitle());
            row.put("taskIssueId", task.getId());
            row.put("storyName", story.get().getTitle());
            row.put("storyId", story.get().getId());
            row.put("estimationHours", task.getEstimatedHours() != null 
                ? task.getEstimatedHours().doubleValue() 
                : null);
            row.put("actualHours", actualHours);
            double estimated = task.getEstimatedHours() != null 
                ? task.getEstimatedHours().doubleValue() 
                : 0.0;
            row.put("remainingHours", Math.max(0, estimated - actualHours));
            row.put("reporterName", reporter.isPresent() ? reporter.get().getName() : null);
            row.put("workCategory", workCategory);
            row.put("itemType", "TASK");
            row.put("isBug", isBugWorkItem);
            row.put("status", task.getStatusAsString() != null ? task.getStatusAsString() : "to_do");
            row.put("createdDate", task.getCreatedAt() != null ? task.getCreatedAt().toString() : null);
            row.put("dueDate", task.getDueDate() != null ? task.getDueDate().toString() : null);
            row.put("completedDate", completedDate);
            
            Optional<Sprint> sprint = story.get().getSprintId() != null
                ? sprintRepository.findById(story.get().getSprintId())
                : Optional.empty();
            row.put("sprint", sprint.isPresent() ? sprint.get().getName() : null);
            
            Optional<Project> project = projectRepository.findById(story.get().getProjectId());
            row.put("project", project.isPresent() ? project.get().getName() : null);
            
            rows.add(row);
        }
        
        // Process Issues
        // Same performance optimizations as tasks: rely on issue fields instead of per-issue time entry / activity log queries.
        List<Issue> issues = projectId != null && !projectId.isEmpty()
            ? issueRepository.findAll().stream()
                .filter(issue -> {
                    if (issue.getStoryId() == null) {
                        return false;
                    }
                    Optional<Story> story = storyRepository.findById(issue.getStoryId());
                    return story.isPresent() && projectId.equals(story.get().getProjectId());
                })
                .collect(Collectors.toList())
            : issueRepository.findAll();
        
        for (Issue issue : issues) {
            if (issue.getAssigneeId() == null || issue.getAssigneeId().isEmpty() || issue.getStoryId() == null) {
                continue;
            }
            
            Optional<User> assignee = userRepository.findById(issue.getAssigneeId());
            Optional<Story> story = storyRepository.findById(issue.getStoryId());
            Optional<User> reporter = issue.getReporterId() != null 
                ? userRepository.findById(issue.getReporterId()) 
                : Optional.empty();
            
            if (!assignee.isPresent() || !story.isPresent()) {
                continue;
            }
            
            // Use actual hours from issue entity
            double actualHours = issue.getActualHours() != null
                    ? issue.getActualHours().doubleValue()
                    : 0.0;

            // Work category from labels (default to Bug for issues)
            String workCategory = issue.getLabels() != null && !issue.getLabels().isEmpty()
                    ? String.join(", ", issue.getLabels())
                    : "Bug";

            boolean isBugWorkItem = true;

            // Approximate completed date using updatedAt when status is DONE
            String completedDate = null;
            if (issue.getStatus() != null
                    && issue.getStatus().getValue().equals("done")
                    && issue.getUpdatedAt() != null) {
                completedDate = issue.getUpdatedAt().toString();
            }
            
            Map<String, Object> row = new HashMap<>();
            row.put("resourceEmailId", assignee.get().getEmail());
            row.put("resourceName", assignee.get().getName());
            row.put("taskIssueName", issue.getTitle());
            row.put("taskIssueId", issue.getId());
            row.put("storyName", story.get().getTitle());
            row.put("storyId", story.get().getId());
            row.put("estimationHours", issue.getEstimatedHours() != null 
                ? issue.getEstimatedHours().doubleValue() 
                : null);
            row.put("actualHours", actualHours);
            double estimated = issue.getEstimatedHours() != null 
                ? issue.getEstimatedHours().doubleValue() 
                : 0.0;
            row.put("remainingHours", Math.max(0, estimated - actualHours));
            row.put("reporterName", reporter.isPresent() ? reporter.get().getName() : null);
            row.put("workCategory", workCategory);
            row.put("itemType", "ISSUE");
            row.put("isBug", isBugWorkItem);
            row.put("status", issue.getStatusAsString() != null ? issue.getStatusAsString() : "to_do");
            row.put("createdDate", issue.getCreatedAt() != null ? issue.getCreatedAt().toString() : null);
            row.put("dueDate", issue.getDueDate() != null ? issue.getDueDate().toString() : null);
            row.put("completedDate", completedDate);
            
            Optional<Sprint> sprint = story.get().getSprintId() != null
                ? sprintRepository.findById(story.get().getSprintId())
                : Optional.empty();
            row.put("sprint", sprint.isPresent() ? sprint.get().getName() : null);
            
            Optional<Project> project = projectRepository.findById(story.get().getProjectId());
            row.put("project", project.isPresent() ? project.get().getName() : null);
            
            rows.add(row);
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
        
        double avgUtilization = totalEstimatedHours > 0 
            ? (totalActualHours / totalEstimatedHours) * 100 
            : 0.0;
        
        // Group by project for project utilization
        Map<String, List<Map<String, Object>>> projectGroups = rows.stream()
            .collect(Collectors.groupingBy(row -> 
                row.get("project") != null ? row.get("project").toString() : "Unknown"));
        
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
                
                projUtil.put("allocatedHours", projEstimated);
                projUtil.put("actualHours", projActual);
                projUtil.put("utilization", projEstimated > 0 
                    ? (projActual / projEstimated) * 100 
                    : 0.0);
                
                return projUtil;
            })
            .collect(Collectors.toList());
        
        report.put("rows", rows);
        report.put("totalResources", totalResources);
        report.put("activeResources", activeResources);
        report.put("allocatedHours", totalEstimatedHours);
        report.put("totalHours", totalActualHours);
        report.put("averageUtilization", avgUtilization);
        report.put("utilizationRate", avgUtilization);
        report.put("projectUtilization", projectUtilization);
        
        return report;
    }

    /**
     * Export resource utilization report to Excel with two sheets:
     * Sheet 1 - detailed rows
     * Sheet 2 - developers, managers and testers summary tables
     */
    public byte[] exportResourceUtilizationToExcel(String projectId,
            String period,
            String projectName,
            String userKey,
            String sprint,
            String duration,
            java.time.LocalDate fromDate,
            java.time.LocalDate toDate) throws IOException {
        Map<String, Object> report = generateResourceUtilizationReport(projectId, period);

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

        // Duration filter (last7, last30, custom) - applied on createdDate when sprint is selected
        if (sprint != null && !sprint.isEmpty()
                && duration != null
                && !"all".equalsIgnoreCase(duration)) {
            java.time.LocalDate now = java.time.LocalDate.now();
            java.time.LocalDate from = null;
            java.time.LocalDate to = null;

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

            final java.time.LocalDate fromFinal = from;
            final java.time.LocalDate toFinal = to;

            filteredRows = filteredRows.stream()
                    .filter(row -> {
                        Object created = row.get("createdDate");
                        if (created == null) {
                            return false;
                        }
                        String createdStr = created.toString();
                        java.time.LocalDate createdDate;
                        try {
                            if (createdStr.length() > 10 && createdStr.charAt(10) == 'T') {
                                createdDate = java.time.LocalDateTime.parse(createdStr).toLocalDate();
                            } else {
                                createdDate = java.time.LocalDate.parse(createdStr);
                            }
                        } catch (Exception e) {
                            return false;
                        }

                        if (fromFinal != null && createdDate.isBefore(fromFinal)) {
                            return false;
                        }
                        if (toFinal != null && createdDate.isAfter(toFinal)) {
                            return false;
                        }
                        return true;
                    })
                    .collect(Collectors.toList());
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
                    String status = r.get("status") != null ? r.get("status").toString().toLowerCase() : "";
                    boolean hasCompletedDate = r.get("completedDate") != null;
                    boolean isNotDone = !"done".equals(status) && !"completed".equals(status);
                    return isIssueRow.test(r) && hasCompletedDate && isNotDone;
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

            // Sheet 1: Details
            Sheet detailsSheet = workbook.createSheet("Details");
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
                createCell(excelRow, col++, row.get("resourceEmailId") != null ? row.get("resourceEmailId").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("resourceName") != null ? row.get("resourceName").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("taskIssueName") != null ? row.get("taskIssueName").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("taskIssueId") != null ? row.get("taskIssueId").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("storyName") != null ? row.get("storyName").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("storyId") != null ? row.get("storyId").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("estimationHours") != null ? row.get("estimationHours").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("actualHours") != null ? row.get("actualHours").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("remainingHours") != null ? row.get("remainingHours").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("reporterName") != null ? row.get("reporterName").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("workCategory") != null ? row.get("workCategory").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("status") != null ? row.get("status").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("createdDate") != null ? row.get("createdDate").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("dueDate") != null ? row.get("dueDate").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("completedDate") != null ? row.get("completedDate").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("sprint") != null ? row.get("sprint").toString() : "", dataStyle);
                createCell(excelRow, col++, row.get("project") != null ? row.get("project").toString() : "", dataStyle);
            }

            for (int i = 0; i < detailsHeaders.length; i++) {
                detailsSheet.autoSizeColumn(i);
            }

            // Sheet 2: Summary
            Sheet summarySheet = workbook.createSheet("Summary");
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
     * Helper method to create a cell with value
     */
    private void createCell(Row row, int column, String value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }
}
