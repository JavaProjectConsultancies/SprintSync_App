package com.sprintsync.api.controller;

import com.sprintsync.api.service.ReportsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.Map;

/**
 * REST Controller for Reports operations.
 * Provides endpoints for generating various reports and analytics.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportsController {

    @Autowired
    private ReportsService reportsService;

    /**
     * Generate project summary report
     */
    @GetMapping("/project-summary")
    public ResponseEntity<Map<String, Object>> generateProjectSummaryReport() {
        try {
            Map<String, Object> report = reportsService.generateProjectSummaryReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate project summary report for specific project
     */
    @GetMapping("/project-summary/{projectId}")
    public ResponseEntity<Map<String, Object>> generateProjectSummaryReport(@PathVariable String projectId) {
        try {
            Map<String, Object> report = reportsService.generateProjectSummaryReport(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate sprint report
     */
    @GetMapping("/sprint/{sprintId}")
    public ResponseEntity<Map<String, Object>> generateSprintReport(@PathVariable String sprintId) {
        try {
            Map<String, Object> report = reportsService.generateSprintReport(sprintId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate velocity report
     */
    @GetMapping("/velocity")
    public ResponseEntity<Map<String, Object>> generateVelocityReport() {
        try {
            Map<String, Object> report = reportsService.generateVelocityReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate velocity report for specific project
     */
    @GetMapping("/velocity/project/{projectId}")
    public ResponseEntity<Map<String, Object>> generateVelocityReport(@PathVariable String projectId) {
        try {
            Map<String, Object> report = reportsService.generateVelocityReport(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate burndown report
     */
    @GetMapping("/burndown")
    public ResponseEntity<Map<String, Object>> generateBurndownReport() {
        try {
            Map<String, Object> report = reportsService.generateBurndownReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate burndown report for specific sprint
     */
    @GetMapping("/burndown/sprint/{sprintId}")
    public ResponseEntity<Map<String, Object>> generateBurndownReport(@PathVariable String sprintId) {
        try {
            Map<String, Object> report = reportsService.generateBurndownReport(sprintId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate team performance report
     */
    @GetMapping("/team-performance")
    public ResponseEntity<Map<String, Object>> generateTeamPerformanceReport() {
        try {
            Map<String, Object> report = reportsService.generateTeamPerformanceReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate team performance report for specific project
     */
    @GetMapping("/team-performance/project/{projectId}")
    public ResponseEntity<Map<String, Object>> generateTeamPerformanceReport(@PathVariable String projectId) {
        try {
            Map<String, Object> report = reportsService.generateTeamPerformanceReport(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate user workload report
     */
    @GetMapping("/user-workload")
    public ResponseEntity<Map<String, Object>> generateUserWorkloadReport() {
        try {
            Map<String, Object> report = reportsService.generateUserWorkloadReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate user workload report for specific user
     */
    @GetMapping("/user-workload/{userId}")
    public ResponseEntity<Map<String, Object>> generateUserWorkloadReport(@PathVariable String userId) {
        try {
            Map<String, Object> report = reportsService.generateUserWorkloadReport(userId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate task distribution report
     */
    @GetMapping("/task-distribution")
    public ResponseEntity<Map<String, Object>> generateTaskDistributionReport() {
        try {
            Map<String, Object> report = reportsService.generateTaskDistributionReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate task distribution report for specific project
     */
    @GetMapping("/task-distribution/project/{projectId}")
    public ResponseEntity<Map<String, Object>> generateTaskDistributionReport(@PathVariable String projectId) {
        try {
            Map<String, Object> report = reportsService.generateTaskDistributionReport(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate priority report
     */
    @GetMapping("/priority")
    public ResponseEntity<Map<String, Object>> generatePriorityReport() {
        try {
            Map<String, Object> report = reportsService.generatePriorityReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate priority report for specific project
     */
    @GetMapping("/priority/project/{projectId}")
    public ResponseEntity<Map<String, Object>> generatePriorityReport(@PathVariable String projectId) {
        try {
            Map<String, Object> report = reportsService.generatePriorityReport(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate effort tracking report
     */
    @GetMapping("/effort-tracking")
    public ResponseEntity<Map<String, Object>> generateEffortTrackingReport() {
        try {
            Map<String, Object> report = reportsService.generateEffortTrackingReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate effort tracking report for specific project
     */
    @GetMapping("/effort-tracking/project/{projectId}")
    public ResponseEntity<Map<String, Object>> generateEffortTrackingReport(@PathVariable String projectId) {
        try {
            Map<String, Object> report = reportsService.generateEffortTrackingReport(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate time tracking report
     */
    @GetMapping("/time-tracking")
    public ResponseEntity<Map<String, Object>> generateTimeTrackingReport() {
        try {
            Map<String, Object> report = reportsService.generateTimeTrackingReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate time tracking report for specific user
     */
    @GetMapping("/time-tracking/user/{userId}")
    public ResponseEntity<Map<String, Object>> generateTimeTrackingReport(@PathVariable String userId) {
        try {
            Map<String, Object> report = reportsService.generateTimeTrackingReport(userId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate date range report
     */
    @GetMapping("/date-range")
    public ResponseEntity<Map<String, Object>> generateDateRangeReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> report = reportsService.generateDateRangeReport(startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate date range report for specific project
     */
    @GetMapping("/date-range/project/{projectId}")
    public ResponseEntity<Map<String, Object>> generateDateRangeReport(
            @PathVariable String projectId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Map<String, Object> report = reportsService.generateDateRangeReport(projectId, startDate, endDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate overdue items report
     */
    @GetMapping("/overdue")
    public ResponseEntity<Map<String, Object>> generateOverdueReport() {
        try {
            Map<String, Object> report = reportsService.generateOverdueReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate overdue items report for specific project
     */
    @GetMapping("/overdue/project/{projectId}")
    public ResponseEntity<Map<String, Object>> generateOverdueReport(@PathVariable String projectId) {
        try {
            Map<String, Object> report = reportsService.generateOverdueReport(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate quality metrics report
     */
    @GetMapping("/quality-metrics")
    public ResponseEntity<Map<String, Object>> generateQualityMetricsReport() {
        try {
            Map<String, Object> report = reportsService.generateQualityMetricsReport();
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate quality metrics report for specific project
     */
    @GetMapping("/quality-metrics/project/{projectId}")
    public ResponseEntity<Map<String, Object>> generateQualityMetricsReport(@PathVariable String projectId) {
        try {
            Map<String, Object> report = reportsService.generateQualityMetricsReport(projectId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate release report
     */
    @GetMapping("/release/{releaseId}")
    public ResponseEntity<Map<String, Object>> generateReleaseReport(@PathVariable String releaseId) {
        try {
            Map<String, Object> report = reportsService.generateReleaseReport(releaseId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate epic report
     */
    @GetMapping("/epic/{epicId}")
    public ResponseEntity<Map<String, Object>> generateEpicReport(@PathVariable String epicId) {
        try {
            Map<String, Object> report = reportsService.generateEpicReport(epicId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate story report
     */
    @GetMapping("/story/{storyId}")
    public ResponseEntity<Map<String, Object>> generateStoryReport(@PathVariable String storyId) {
        try {
            Map<String, Object> report = reportsService.generateStoryReport(storyId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate task report
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<Map<String, Object>> generateTaskReport(@PathVariable String taskId) {
        try {
            Map<String, Object> report = reportsService.generateTaskReport(taskId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate custom report
     */
    @PostMapping("/custom")
    public ResponseEntity<Map<String, Object>> generateCustomReport(@RequestBody Map<String, Object> reportCriteria) {
        try {
            Map<String, Object> report = reportsService.generateCustomReport(reportCriteria);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Export report to CSV
     */
    @GetMapping("/export/csv")
    public ResponseEntity<String> exportReportToCsv(
            @RequestParam String reportType,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            String csvData = reportsService.exportReportToCsv(reportType, projectId, startDate, endDate);
            return ResponseEntity.ok(csvData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export report to PDF
     */
    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportReportToPdf(
            @RequestParam String reportType,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            byte[] pdfData = reportsService.exportReportToPdf(reportType, projectId, startDate, endDate);
            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "attachment; filename=report.pdf")
                    .body(pdfData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Schedule report generation
     */
    @PostMapping("/schedule")
    public ResponseEntity<Map<String, Object>> scheduleReportGeneration(
            @RequestBody Map<String, Object> scheduleRequest) {
        try {
            Map<String, Object> result = reportsService.scheduleReportGeneration(scheduleRequest);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Get scheduled reports
     */
    @GetMapping("/scheduled")
    public ResponseEntity<Map<String, Object>> getScheduledReports() {
        try {
            Map<String, Object> reports = reportsService.getScheduledReports();
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get report templates
     */
    @GetMapping("/templates")
    public ResponseEntity<Map<String, Object>> getReportTemplates() {
        try {
            Map<String, Object> templates = reportsService.getReportTemplates();
            return ResponseEntity.ok(templates);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export bug report to Excel
     * 
     * @param projectId Optional project ID to filter by. If not provided, exports
     *                  all bug reports
     * @param sprintId  Optional sprint ID to filter by. If not provided, ignores
     *                  sprint filter
     * @return Excel file as byte array
     */
    @GetMapping(value = "/export/bug-report/excel", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> exportBugReportToExcel(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String sprintId) {
        try {
            byte[] excelData = reportsService.exportBugReportToExcel(projectId, sprintId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            String filename = projectId != null && !projectId.isEmpty()
                    ? String.format("bug-report-project-%s.xlsx", projectId)
                    : "bug-report.xlsx";
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate bug report
     * Fetches bug/defect data from issues table with joined data from related
     * tables
     */
    @GetMapping("/bug-report")
    public ResponseEntity<java.util.List<com.sprintsync.api.dto.BugReportDto>> generateBugReport() {
        try {
            java.util.List<com.sprintsync.api.dto.BugReportDto> bugReport = reportsService.generateBugReport();
            return ResponseEntity.ok(bugReport);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate bug report filtered by project
     */
    @GetMapping("/bug-report/project/{projectId}")
    public ResponseEntity<java.util.List<com.sprintsync.api.dto.BugReportDto>> generateBugReportByProject(
            @PathVariable String projectId) {
        try {
            java.util.List<com.sprintsync.api.dto.BugReportDto> bugReport = reportsService.generateBugReport(projectId);
            return ResponseEntity.ok(bugReport);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate resource performance report (for Resource Performance page).
     * Returns rows, project utilization, summaries - does NOT include individual utilization.
     */
    @GetMapping("/resource-performance")
    public ResponseEntity<Map<String, Object>> generateResourcePerformanceReport(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String period) {
        try {
            Map<String, Object> report = reportsService.generateResourcePerformanceReport(projectId, period);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate individual utilization report (for Resource Utilization page).
     * Returns rows and individual utilization summary with optional filters.
     */
    @GetMapping("/individual-utilization")
    public ResponseEntity<Map<String, Object>> generateIndividualUtilizationReport(
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) String userKey,
            @RequestParam(required = false) String sprint,
            @RequestParam(required = false) String duration,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fromDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate toDate) {
        try {
            Map<String, Object> report = reportsService.generateIndividualUtilizationReport(
                    projectName, userKey, sprint, duration, fromDate, toDate);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate resource utilization report (legacy - kept for backward compatibility)
     */
    @GetMapping("/resource-utilization")
    public ResponseEntity<Map<String, Object>> generateResourceUtilizationReport(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String period) {
        try {
            Map<String, Object> report = reportsService.generateResourceUtilizationReport(projectId, period);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export Individual Utilization Summary to Excel (Resource Utilization page data).
     * Exports the same data shown on the Resource Utilization page with filters applied.
     */
    @GetMapping(value = "/export/individual-utilization/excel", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> exportIndividualUtilizationToExcel(
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) String userKey,
            @RequestParam(required = false) String sprint,
            @RequestParam(required = false) String duration,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fromDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate toDate) {
        try {
            byte[] excelData = reportsService.exportIndividualUtilizationToExcel(
                    projectName, userKey, sprint, duration, fromDate, toDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            String filename = "resource-utilization-" + java.time.LocalDate.now() + ".xlsx";
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (IOException e) {
            e.printStackTrace();
            org.slf4j.LoggerFactory.getLogger(ReportsController.class)
                    .error("Export individual-utilization failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            e.printStackTrace();
            org.slf4j.LoggerFactory.getLogger(ReportsController.class)
                    .error("Export individual-utilization failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export resource PERFORMANCE report to Excel (Resource Performance page).
     * Sheet1: detailed rows; Sheet2: developers, managers and testers summary.
     */
    @GetMapping(value = "/export/resource-performance/excel", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> exportResourcePerformanceToExcel(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) String userKey,
            @RequestParam(required = false) String sprint,
            @RequestParam(required = false) String duration,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fromDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate toDate) {
        try {
            byte[] excelData = reportsService.exportResourceUtilizationToExcel(
                    projectId, period, projectName, userKey, sprint, duration, fromDate, toDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            String filename = projectName != null && !projectName.isEmpty()
                    ? String.format("resource-performance-project-%s.xlsx", projectName)
                    : "resource-performance.xlsx";
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Export resource UTILIZATION report to Excel (Resource Utilization page).
     * Sheet1: detailed rows; Sheet2: developers, managers and testers summary.
     */
    @GetMapping(value = "/export/resource-utilization/excel", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    public ResponseEntity<byte[]> exportResourceUtilizationToExcel(
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) String projectName,
            @RequestParam(required = false) String userKey,
            @RequestParam(required = false) String sprint,
            @RequestParam(required = false) String duration,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fromDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate toDate) {
        try {
            byte[] excelData = reportsService.exportResourceUtilizationToExcel(
                    projectId, period, projectName, userKey, sprint, duration, fromDate, toDate);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            String filename = projectId != null && !projectId.isEmpty()
                    ? String.format("resource-utilization-project-%s.xlsx", projectId)
                    : "resource-utilization.xlsx";
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(excelData.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(excelData);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
