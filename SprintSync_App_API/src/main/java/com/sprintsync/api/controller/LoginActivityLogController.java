package com.sprintsync.api.controller;

import com.sprintsync.api.entity.LoginActivityLog;
import com.sprintsync.api.service.LoginActivityLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for retrieving Login Activity Logs.
 */
@RestController
@RequestMapping("/api/login-activity-logs")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class LoginActivityLogController {

    private static final Logger logger = LoggerFactory.getLogger(LoginActivityLogController.class);
    private final LoginActivityLogService loginActivityLogService;

    @Autowired
    public LoginActivityLogController(LoginActivityLogService loginActivityLogService) {
        this.loginActivityLogService = loginActivityLogService;
    }

    /**
     * Get login activity logs, optionally filtered by date.
     * Restricted to admin and master_admin roles.
     *
     * @param date Optional date to filter logs (ISO format, e.g., 2026-04-10)
     * @return List of logs
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<Object> getAllLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<LoginActivityLog> logs;
            if (date != null) {
                logger.info("Retrieving login activity logs for date: {}", date);
                logs = loginActivityLogService.getLogsByDate(date);
            } else {
                logger.info("Retrieving all login activity logs");
                logs = loginActivityLogService.getAllLogs();
            }
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            logger.error("Failed to retrieve login activity logs: {}", e.getMessage());

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve logs: " + e.getMessage());

            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Export login activity logs to Excel.
     *
     * @param date Optional date to filter logs
     * @return Excel file byte array
     */
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'MASTER_ADMIN')")
    public ResponseEntity<byte[]> exportLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<LoginActivityLog> logs;
            String filename = "login_activity_logs";
            
            if (date != null) {
                logs = loginActivityLogService.getLogsByDate(date);
                filename += "_" + date.toString();
            } else {
                logs = loginActivityLogService.getAllLogs();
                filename += "_all";
            }
            
            byte[] excelContent = loginActivityLogService.exportLogsToExcel(logs);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename + ".xlsx")
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(excelContent);
        } catch (Exception e) {
            logger.error("Failed to export login activity logs: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
