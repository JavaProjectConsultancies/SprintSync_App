package com.sprintsync.api.controller;

import com.sprintsync.api.entity.TimeEntry;
import com.sprintsync.api.entity.enums.TimeEntryType;
import com.sprintsync.api.service.TimeEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * REST Controller for TimeEntry entity operations.
 * Provides endpoints for time tracking operations.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/time-entries")
@CrossOrigin(origins = "*")
public class TimeEntryController {

    private final TimeEntryService timeEntryService;

    @Autowired
    public TimeEntryController(TimeEntryService timeEntryService) {
        this.timeEntryService = timeEntryService;
    }

    /**
     * Create a new time entry.
     * 
     * @param timeEntry the time entry to create
     * @return ResponseEntity containing the created time entry
     */
    @PostMapping
    @CacheEvict(value = {"projects", "projects-summary"}, allEntries = true)
    public ResponseEntity<TimeEntry> createTimeEntry(@RequestBody TimeEntry timeEntry) {
        try {
            TimeEntry createdTimeEntry = timeEntryService.createTimeEntry(timeEntry);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTimeEntry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get time entry by ID.
     * 
     * @param id the time entry ID
     * @return ResponseEntity containing the time entry if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<TimeEntry> getTimeEntryById(@PathVariable String id) {
        Optional<TimeEntry> timeEntry = timeEntryService.findById(id);
        return timeEntry.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all time entries with pagination.
     * 
     * @param page page number (default: 0)
     * @param size page size (default: 10)
     * @param sortBy sort field (default: workDate)
     * @param sortDir sort direction (default: desc)
     * @return ResponseEntity containing page of time entries
     */
    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<TimeEntry>> getAllTimeEntries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "workDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        org.springframework.data.domain.Page<TimeEntry> timeEntries = timeEntryService.getAllTimeEntries(page, size, sortBy, sortDir);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get all time entries without pagination.
     * 
     * @return ResponseEntity containing list of all time entries
     */
    @GetMapping("/all")
    public ResponseEntity<List<TimeEntry>> getAllTimeEntriesList() {
        List<TimeEntry> timeEntries = timeEntryService.getAllTimeEntries();
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get time entries by user ID.
     * 
     * @param userId the user ID
     * @return ResponseEntity containing list of time entries for the user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TimeEntry>> getTimeEntriesByUser(@PathVariable String userId) {
        List<TimeEntry> timeEntries = timeEntryService.findTimeEntriesByUser(userId);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get time entries by project ID.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing list of time entries for the project
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TimeEntry>> getTimeEntriesByProject(@PathVariable String projectId) {
        List<TimeEntry> timeEntries = timeEntryService.findTimeEntriesByProject(projectId);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get time entries by story ID.
     * 
     * @param storyId the story ID
     * @return ResponseEntity containing list of time entries for the story
     */
    @GetMapping("/story/{storyId}")
    public ResponseEntity<List<TimeEntry>> getTimeEntriesByStory(@PathVariable String storyId) {
        List<TimeEntry> timeEntries = timeEntryService.findTimeEntriesByStory(storyId);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get time entries by task ID.
     * 
     * @param taskId the task ID
     * @return ResponseEntity containing list of time entries for the task
     */
    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<TimeEntry>> getTimeEntriesByTask(@PathVariable String taskId) {
        List<TimeEntry> timeEntries = timeEntryService.findTimeEntriesByTask(taskId);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get time entries by date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return ResponseEntity containing list of time entries within the date range
     */
    @GetMapping("/date-range")
    public ResponseEntity<List<TimeEntry>> getTimeEntriesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<TimeEntry> timeEntries = timeEntryService.findTimeEntriesByDateRange(startDate, endDate);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get time entries by user ID and date range.
     * 
     * @param userId the user ID
     * @param startDate the start date
     * @param endDate the end date
     * @return ResponseEntity containing list of time entries for the user within the date range
     */
    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<List<TimeEntry>> getTimeEntriesByUserAndDateRange(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<TimeEntry> timeEntries = timeEntryService.findTimeEntriesByUserAndDateRange(userId, startDate, endDate);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get time entries by entry type.
     * 
     * @param entryType the entry type
     * @return ResponseEntity containing list of time entries of the specified type
     */
    @GetMapping("/type/{entryType}")
    public ResponseEntity<List<TimeEntry>> getTimeEntriesByType(@PathVariable TimeEntryType entryType) {
        List<TimeEntry> timeEntries = timeEntryService.findTimeEntriesByType(entryType);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get time entries by billable status.
     * 
     * @param isBillable the billable status
     * @return ResponseEntity containing list of billable/non-billable time entries
     */
    @GetMapping("/billable/{isBillable}")
    public ResponseEntity<List<TimeEntry>> getTimeEntriesByBillableStatus(@PathVariable Boolean isBillable) {
        List<TimeEntry> timeEntries = timeEntryService.findTimeEntriesByBillableStatus(isBillable);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get time entries by multiple criteria.
     * 
     * @param userId the user ID (optional)
     * @param projectId the project ID (optional)
     * @param entryType the entry type (optional)
     * @param startDate the start date (optional)
     * @param endDate the end date (optional)
     * @param isBillable the billable status (optional)
     * @return ResponseEntity containing list of time entries matching the criteria
     */
    @GetMapping("/criteria")
    public ResponseEntity<List<TimeEntry>> getTimeEntriesByCriteria(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String projectId,
            @RequestParam(required = false) TimeEntryType entryType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Boolean isBillable) {
        
        List<TimeEntry> timeEntries = timeEntryService.findTimeEntriesByCriteria(userId, projectId, entryType, startDate, endDate, isBillable);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get total hours worked by user.
     * 
     * @param userId the user ID
     * @return ResponseEntity containing total hours worked by the user
     */
    @GetMapping("/user/{userId}/total-hours")
    public ResponseEntity<BigDecimal> getTotalHoursWorkedByUser(@PathVariable String userId) {
        BigDecimal totalHours = timeEntryService.getTotalHoursWorkedByUser(userId);
        return ResponseEntity.ok(totalHours);
    }

    /**
     * Get total hours worked by project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing total hours worked on the project
     */
    @GetMapping("/project/{projectId}/total-hours")
    public ResponseEntity<BigDecimal> getTotalHoursWorkedByProject(@PathVariable String projectId) {
        BigDecimal totalHours = timeEntryService.getTotalHoursWorkedByProject(projectId);
        return ResponseEntity.ok(totalHours);
    }

    /**
     * Get total hours worked by story.
     * 
     * @param storyId the story ID
     * @return ResponseEntity containing total hours worked on the story
     */
    @GetMapping("/story/{storyId}/total-hours")
    public ResponseEntity<BigDecimal> getTotalHoursWorkedByStory(@PathVariable String storyId) {
        BigDecimal totalHours = timeEntryService.getTotalHoursWorkedByStory(storyId);
        return ResponseEntity.ok(totalHours);
    }

    /**
     * Get total hours worked by task.
     * 
     * @param taskId the task ID
     * @return ResponseEntity containing total hours worked on the task
     */
    @GetMapping("/task/{taskId}/total-hours")
    public ResponseEntity<BigDecimal> getTotalHoursWorkedByTask(@PathVariable String taskId) {
        BigDecimal totalHours = timeEntryService.getTotalHoursWorkedByTask(taskId);
        return ResponseEntity.ok(totalHours);
    }

    /**
     * Get total billable hours by user.
     * 
     * @param userId the user ID
     * @return ResponseEntity containing total billable hours worked by the user
     */
    @GetMapping("/user/{userId}/billable-hours")
    public ResponseEntity<BigDecimal> getTotalBillableHoursByUser(@PathVariable String userId) {
        BigDecimal billableHours = timeEntryService.getTotalBillableHoursByUser(userId);
        return ResponseEntity.ok(billableHours);
    }

    /**
     * Get total billable hours by project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing total billable hours worked on the project
     */
    @GetMapping("/project/{projectId}/billable-hours")
    public ResponseEntity<BigDecimal> getTotalBillableHoursByProject(@PathVariable String projectId) {
        BigDecimal billableHours = timeEntryService.getTotalBillableHoursByProject(projectId);
        return ResponseEntity.ok(billableHours);
    }

    /**
     * Get daily hours worked by user.
     * 
     * @param userId the user ID
     * @param workDate the work date
     * @return ResponseEntity containing total hours worked by the user on the specified date
     */
    @GetMapping("/user/{userId}/daily-hours")
    public ResponseEntity<BigDecimal> getDailyHoursWorkedByUser(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate) {
        
        BigDecimal dailyHours = timeEntryService.getDailyHoursWorkedByUser(userId, workDate);
        return ResponseEntity.ok(dailyHours);
    }

    /**
     * Get recent time entries for a user.
     * 
     * @param userId the user ID
     * @param limit the number of entries to return (default: 10)
     * @return ResponseEntity containing list of recent time entries for the user
     */
    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<TimeEntry>> getRecentTimeEntriesByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit) {
        
        List<TimeEntry> timeEntries = timeEntryService.getRecentTimeEntriesByUser(userId, limit);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Get time entries by user ID and date.
     * 
     * @param userId the user ID
     * @param workDate the work date
     * @return ResponseEntity containing list of time entries for the user on the specified date
     */
    @GetMapping("/user/{userId}/date")
    public ResponseEntity<List<TimeEntry>> getTimeEntriesByUserAndDate(
            @PathVariable String userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDate) {
        
        List<TimeEntry> timeEntries = timeEntryService.getTimeEntriesByUserAndDate(userId, workDate);
        return ResponseEntity.ok(timeEntries);
    }

    /**
     * Update an existing time entry.
     * 
     * @param id the time entry ID
     * @param timeEntryDetails the updated time entry details
     * @return ResponseEntity containing the updated time entry
     */
    @PutMapping("/{id}")
    @CacheEvict(value = {"projects", "projects-summary"}, allEntries = true)
    public ResponseEntity<TimeEntry> updateTimeEntry(@PathVariable String id, @RequestBody TimeEntry timeEntryDetails) {
        try {
            timeEntryDetails.setId(id);
            TimeEntry updatedTimeEntry = timeEntryService.updateTimeEntry(timeEntryDetails);
            return ResponseEntity.ok(updatedTimeEntry);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a time entry by ID.
     * 
     * @param id the time entry ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    @CacheEvict(value = {"projects", "projects-summary"}, allEntries = true)
    public ResponseEntity<Void> deleteTimeEntry(@PathVariable String id) {
        try {
            timeEntryService.deleteTimeEntry(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get time tracking statistics for a user.
     * 
     * @param userId the user ID
     * @return ResponseEntity containing time tracking statistics
     */
    @GetMapping("/user/{userId}/stats")
    public ResponseEntity<String> getTimeTrackingStatistics(@PathVariable String userId) {
        String stats = timeEntryService.getTimeTrackingStatistics(userId);
        return ResponseEntity.ok(stats);
    }

    /**
     * Get time tracking statistics for a project.
     * 
     * @param projectId the project ID
     * @return ResponseEntity containing time tracking statistics
     */
    @GetMapping("/project/{projectId}/stats")
    public ResponseEntity<String> getProjectTimeStatistics(@PathVariable String projectId) {
        String stats = timeEntryService.getProjectTimeStatistics(projectId);
        return ResponseEntity.ok(stats);
    }
}



