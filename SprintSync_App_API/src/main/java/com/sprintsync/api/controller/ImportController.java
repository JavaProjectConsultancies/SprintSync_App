package com.sprintsync.api.controller;

import com.sprintsync.api.service.ResourcePerformanceImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Controller for handling data import operations.
 */
@RestController
@RequestMapping("/api/import")
@CrossOrigin(origins = "*")
public class ImportController {

    @Autowired
    private ResourcePerformanceImportService importService;

    /**
     * Endpoint to import resource performance data from an Excel file.
     *
     * @param file      the Excel file
     * @param projectId the project ID to associate with the imported data
     * @return summary of the import operation
     */
    @PostMapping("/resource-performance")
    public ResponseEntity<Map<String, Object>> importResourcePerformance(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") String projectId) {
        try {
            Map<String, Object> result = importService.importFile(file, projectId);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process the Excel file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }
}
