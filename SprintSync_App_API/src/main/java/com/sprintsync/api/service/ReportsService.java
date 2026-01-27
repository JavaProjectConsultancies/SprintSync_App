package com.sprintsync.api.service;

import com.sprintsync.api.entity.*;
import com.sprintsync.api.repository.*;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
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
            
            double completionPercentage = sprintTasks.isEmpty() ? 0.0 : 
                (double) completedTasks / sprintTasks.size() * 100;
            report.put("completionPercentage", Math.round(completionPercentage * 100.0) / 100.0);
        }
        
        return report;
    }

    /**
     * Generate velocity report
     */
    public Map<String, Object> generateVelocityReport() {
        Map<String, Object> report = new HashMap<>();
        
        List<Sprint> completedSprints = sprintRepository.findByStatus(com.sprintsync.api.entity.enums.SprintStatus.COMPLETED);
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
                
                long completedTasks = taskRepository.findByAssigneeIdAndStatus(user.getId(), com.sprintsync.api.entity.enums.TaskStatus.DONE).size();
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
        
        // Note: Task entity doesn't have estimatedEffort or actualEffort fields in current database schema
        report.put("tasksWithEffortTracking", 0);
        report.put("note", "Effort tracking not available - estimatedEffort and actualEffort fields not present in current schema");
        
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
            .filter(story -> story.getCreatedAt().isAfter(startDateTime) && story.getCreatedAt().isBefore(endDateTime))
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
        List<Task> overdueTasks = taskRepository.findOverdueTasks(today, com.sprintsync.api.entity.enums.TaskStatus.DONE);
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
            .filter(task -> task.getDueDate() != null && task.getDueDate().isBefore(LocalDateTime.now().toLocalDate()))
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
     * @return List of bug report DTOs
     */
    public List<com.sprintsync.api.dto.BugReportDto> generateBugReport() {
        List<Object[]> results = issueRepository.findBugReportData();
        return mapToBugReportDtos(results);
    }

    /**
     * Generate bug report filtered by project ID
     * @param projectId the project ID to filter by
     * @return List of bug report DTOs
     */
    public List<com.sprintsync.api.dto.BugReportDto> generateBugReport(String projectId) {
        List<Object[]> results = issueRepository.findBugReportDataByProject(projectId);
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
     * @param projectId Optional project ID to filter by. If null, exports all bug reports
     * @return Byte array containing the Excel file
     */
    public byte[] exportBugReportToExcel(String projectId) throws IOException {
        List<com.sprintsync.api.dto.BugReportDto> bugReports;
        if (projectId != null && !projectId.isEmpty()) {
            bugReports = generateBugReport(projectId);
        } else {
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
     * Helper method to create a cell with value
     */
    private void createCell(Row row, int column, String value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }
}






