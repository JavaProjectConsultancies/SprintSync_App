package com.sprintsync.api.service;

import com.sprintsync.api.entity.LoginActivityLog;
import com.sprintsync.api.entity.User;
import com.sprintsync.api.repository.LoginActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

/**
 * Service class for Login Activity Log operations.
 */
@Service
public class LoginActivityLogService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(LoginActivityLogService.class);
    private final LoginActivityLogRepository loginActivityLogRepository;

    @Autowired
    public LoginActivityLogService(LoginActivityLogRepository loginActivityLogRepository) {
        this.loginActivityLogRepository = loginActivityLogRepository;
    }

    /**
     * Initial table accessibility check on startup.
     */
    @jakarta.annotation.PostConstruct
    public void checkTableAccessibility() {
        try {
            long count = loginActivityLogRepository.count();
            logger.info("✅ LoginActivityLog table accessibility check passed. Current records: {}", count);
        } catch (Exception e) {
            logger.error("❌ LoginActivityLog table is NOT accessible: {}", e.getMessage());
        }
    }

    /**
     * Records a new login activity.
     * @param user The user who logged in
     * @param ipAddress The IP address of the system
     */
    @Transactional
    public void recordLogin(User user, String ipAddress) {
        LoginActivityLog log = new LoginActivityLog();
        // Generate a UUID for the ID as per transaction table convention in this project
        // Prefix LGNL + UUID (without dashes) = 36 chars
        String id = "LGNL" + UUID.randomUUID().toString().replace("-", "").substring(0, 32);
        log.setId(id);
        log.setUserId(user.getId());
        log.setUserName(user.getName());
        log.setIpAddress(ipAddress);
        log.setLoginTime(LocalDateTime.now());
        log.setCreatedAt(LocalDateTime.now());
        log.setUpdatedAt(LocalDateTime.now());
        
        loginActivityLogRepository.save(log);
    }

    /**
     * Retrieves all login activity logs.
     * @return List of LoginActivityLog
     */
    public List<LoginActivityLog> getAllLogs() {
        return loginActivityLogRepository.findAllByOrderByLoginTimeDesc();
    }

    /**
     * Retrieves login activity logs for a specific date.
     * @param date The date to filter by
     * @return List of LoginActivityLog
     */
    public List<LoginActivityLog> getLogsByDate(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.atTime(23, 59, 59);
        return loginActivityLogRepository.findByLoginTimeBetweenOrderByLoginTimeDesc(start, end);
    }

    /**
     * Exports the provided list of logs to an Excel byte array.
     * @param logs The logs to export
     * @return Byte array containing the Excel file
     * @throws IOException If excel generation fails
     */
    public byte[] exportLogsToExcel(List<LoginActivityLog> logs) throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Login Activity Logs");

            // Create header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Create date style
            CellStyle dateStyle = workbook.createCellStyle();
            CreationHelper createHelper = workbook.getCreationHelper();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-mm-dd hh:mm:ss"));

            // Header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Log ID", "User ID", "User Name", "IP Address", "Login Time"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data rows
            int rowNum = 1;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            for (LoginActivityLog log : logs) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(log.getId());
                row.createCell(1).setCellValue(log.getUserId());
                row.createCell(2).setCellValue(log.getUserName());
                row.createCell(3).setCellValue(log.getIpAddress() != null ? log.getIpAddress() : "Unknown");
                
                Cell timeCell = row.createCell(4);
                if (log.getLoginTime() != null) {
                    timeCell.setCellValue(log.getLoginTime().format(formatter));
                }
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
}
