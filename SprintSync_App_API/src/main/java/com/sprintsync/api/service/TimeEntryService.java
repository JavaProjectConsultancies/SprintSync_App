package com.sprintsync.api.service;

import com.sprintsync.api.entity.TimeEntry;
import com.sprintsync.api.entity.enums.TimeEntryType;
import com.sprintsync.api.repository.TimeEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for TimeEntry entity operations.
 * Provides business logic for time tracking operations.
 * 
 * @author Mayuresh G
 */
@Service
@Transactional
public class TimeEntryService {

    private final TimeEntryRepository timeEntryRepository;
    private final IdGenerationService idGenerationService;

    @Autowired
    public TimeEntryService(TimeEntryRepository timeEntryRepository, IdGenerationService idGenerationService) {
        this.timeEntryRepository = timeEntryRepository;
        this.idGenerationService = idGenerationService;
    }

    /**
     * Create a new time entry.
     * 
     * @param timeEntry the time entry to create
     * @return the created time entry
     */
    public TimeEntry createTimeEntry(TimeEntry timeEntry) {
        // Generate custom ID if not provided
        if (timeEntry.getId() == null) {
            timeEntry.setId(idGenerationService.generateTimeEntryId());
        }
        return timeEntryRepository.save(timeEntry);
    }

    /**
     * Find time entry by ID.
     * 
     * @param id the time entry ID
     * @return Optional containing the time entry if found
     */
    @Transactional(readOnly = true)
    public Optional<TimeEntry> findById(String id) {
        return timeEntryRepository.findById(id);
    }

    /**
     * Update an existing time entry.
     * 
     * @param timeEntry the time entry to update
     * @return the updated time entry
     * @throws IllegalArgumentException if time entry not found
     */
    public TimeEntry updateTimeEntry(TimeEntry timeEntry) {
        if (timeEntry == null || timeEntry.getId() == null) {
            throw new IllegalArgumentException("Time entry and ID are required");
        }
        
        // Fetch existing time entry to merge data
        TimeEntry existingTimeEntry = timeEntryRepository.findById(timeEntry.getId())
                .orElseThrow(() -> new IllegalArgumentException("Time entry not found with ID: " + timeEntry.getId()));
        
        // Update only provided fields
        // Required fields - only update if provided (not null)
        if (timeEntry.getUserId() != null) {
            existingTimeEntry.setUserId(timeEntry.getUserId());
        }
        if (timeEntry.getDescription() != null && !timeEntry.getDescription().trim().isEmpty()) {
            existingTimeEntry.setDescription(timeEntry.getDescription());
        }
        if (timeEntry.getEntryType() != null) {
            existingTimeEntry.setEntryType(timeEntry.getEntryType());
        }
        if (timeEntry.getHoursWorked() != null) {
            existingTimeEntry.setHoursWorked(timeEntry.getHoursWorked());
        }
        if (timeEntry.getWorkDate() != null) {
            existingTimeEntry.setWorkDate(timeEntry.getWorkDate());
        }
        if (timeEntry.getIsBillable() != null) {
            existingTimeEntry.setIsBillable(timeEntry.getIsBillable());
        }
        
        // Optional fields - update if provided (including null to allow clearing)
        if (timeEntry.getProjectId() != null) {
            existingTimeEntry.setProjectId(timeEntry.getProjectId());
        }
        if (timeEntry.getStoryId() != null) {
            existingTimeEntry.setStoryId(timeEntry.getStoryId());
        }
        if (timeEntry.getTaskId() != null) {
            existingTimeEntry.setTaskId(timeEntry.getTaskId());
        }
        if (timeEntry.getSubtaskId() != null) {
            existingTimeEntry.setSubtaskId(timeEntry.getSubtaskId());
        }
        // startTime and endTime can be null (to clear them)
        existingTimeEntry.setStartTime(timeEntry.getStartTime());
        existingTimeEntry.setEndTime(timeEntry.getEndTime());
        
        return timeEntryRepository.save(existingTimeEntry);
    }

    /**
     * Delete a time entry by ID.
     * 
     * @param id the time entry ID
     * @throws IllegalArgumentException if time entry not found
     */
    public void deleteTimeEntry(String id) {
        if (!timeEntryRepository.existsById(id)) {
            throw new IllegalArgumentException("Time entry not found with ID: " + id);
        }
        timeEntryRepository.deleteById(id);
    }

    /**
     * Get all time entries.
     * 
     * @return list of all time entries
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> getAllTimeEntries() {
        return timeEntryRepository.findAll();
    }

    /**
     * Get all time entries with pagination.
     * 
     * @param page page number (0-indexed)
     * @param size page size
     * @param sortBy sort field
     * @param sortDir sort direction
     * @return page of time entries
     */
    @Transactional(readOnly = true)
    public Page<TimeEntry> getAllTimeEntries(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return timeEntryRepository.findAll(pageable);
    }

    /**
     * Find time entries by user ID.
     * 
     * @param userId the user ID
     * @return list of time entries for the specified user
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> findTimeEntriesByUser(String userId) {
        return timeEntryRepository.findByUserId(userId);
    }

    /**
     * Find time entries by project ID.
     * 
     * @param projectId the project ID
     * @return list of time entries for the specified project
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> findTimeEntriesByProject(String projectId) {
        return timeEntryRepository.findByProjectId(projectId);
    }

    /**
     * Find time entries by story ID.
     * 
     * @param storyId the story ID
     * @return list of time entries for the specified story
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> findTimeEntriesByStory(String storyId) {
        return timeEntryRepository.findByStoryId(storyId);
    }

    /**
     * Find time entries by task ID.
     * 
     * @param taskId the task ID
     * @return list of time entries for the specified task
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> findTimeEntriesByTask(String taskId) {
        return timeEntryRepository.findByTaskId(taskId);
    }

    /**
     * Find time entries by date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of time entries within the date range
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> findTimeEntriesByDateRange(LocalDate startDate, LocalDate endDate) {
        return timeEntryRepository.findByWorkDateBetween(startDate, endDate);
    }

    /**
     * Find time entries by user ID and date range.
     * 
     * @param userId the user ID
     * @param startDate the start date
     * @param endDate the end date
     * @return list of time entries for the user within the date range
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> findTimeEntriesByUserAndDateRange(String userId, LocalDate startDate, LocalDate endDate) {
        return timeEntryRepository.findByUserIdAndWorkDateBetween(userId, startDate, endDate);
    }

    /**
     * Find time entries by entry type.
     * 
     * @param entryType the entry type
     * @return list of time entries of the specified type
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> findTimeEntriesByType(TimeEntryType entryType) {
        return timeEntryRepository.findByEntryType(entryType);
    }

    /**
     * Find billable time entries.
     * 
     * @param isBillable the billable status
     * @return list of billable/non-billable time entries
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> findTimeEntriesByBillableStatus(Boolean isBillable) {
        return timeEntryRepository.findByIsBillable(isBillable);
    }

    /**
     * Find time entries by multiple criteria.
     * 
     * @param userId the user ID (optional)
     * @param projectId the project ID (optional)
     * @param entryType the entry type (optional)
     * @param startDate the start date (optional)
     * @param endDate the end date (optional)
     * @param isBillable the billable status (optional)
     * @return list of time entries matching the criteria
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> findTimeEntriesByCriteria(String userId, String projectId, TimeEntryType entryType,
                                                    LocalDate startDate, LocalDate endDate, Boolean isBillable) {
        return timeEntryRepository.findTimeEntriesByCriteria(userId, projectId, entryType, startDate, endDate, isBillable);
    }

    /**
     * Get total hours worked by user.
     * 
     * @param userId the user ID
     * @return total hours worked by the user
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalHoursWorkedByUser(String userId) {
        return timeEntryRepository.sumHoursWorkedByUserId(userId);
    }

    /**
     * Get total hours worked by project.
     * 
     * @param projectId the project ID
     * @return total hours worked on the project
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalHoursWorkedByProject(String projectId) {
        return timeEntryRepository.sumHoursWorkedByProjectId(projectId);
    }

    /**
     * Get total hours worked by story.
     * 
     * @param storyId the story ID
     * @return total hours worked on the story
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalHoursWorkedByStory(String storyId) {
        return timeEntryRepository.sumHoursWorkedByStoryId(storyId);
    }

    /**
     * Get total hours worked by task.
     * 
     * @param taskId the task ID
     * @return total hours worked on the task
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalHoursWorkedByTask(String taskId) {
        return timeEntryRepository.sumHoursWorkedByTaskId(taskId);
    }

    /**
     * Get total billable hours by user.
     * 
     * @param userId the user ID
     * @return total billable hours worked by the user
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalBillableHoursByUser(String userId) {
        return timeEntryRepository.sumBillableHoursByUserId(userId);
    }

    /**
     * Get total billable hours by project.
     * 
     * @param projectId the project ID
     * @return total billable hours worked on the project
     */
    @Transactional(readOnly = true)
    public BigDecimal getTotalBillableHoursByProject(String projectId) {
        return timeEntryRepository.sumBillableHoursByProjectId(projectId);
    }

    /**
     * Get daily hours worked by user.
     * 
     * @param userId the user ID
     * @param workDate the work date
     * @return total hours worked by the user on the specified date
     */
    @Transactional(readOnly = true)
    public BigDecimal getDailyHoursWorkedByUser(String userId, LocalDate workDate) {
        return timeEntryRepository.sumDailyHoursByUserIdAndDate(userId, workDate);
    }

    /**
     * Get recent time entries for a user.
     * 
     * @param userId the user ID
     * @param limit the number of entries to return
     * @return list of recent time entries for the user
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> getRecentTimeEntriesByUser(String userId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return timeEntryRepository.findRecentTimeEntriesByUserId(userId, pageable);
    }

    /**
     * Get time entries by user ID and date.
     * 
     * @param userId the user ID
     * @param workDate the work date
     * @return list of time entries for the user on the specified date
     */
    @Transactional(readOnly = true)
    public List<TimeEntry> getTimeEntriesByUserAndDate(String userId, LocalDate workDate) {
        return timeEntryRepository.findByUserIdAndWorkDate(userId, workDate);
    }

    /**
     * Get time tracking statistics for a user.
     * 
     * @param userId the user ID
     * @return time tracking statistics
     */
    @Transactional(readOnly = true)
    public String getTimeTrackingStatistics(String userId) {
        long totalEntries = timeEntryRepository.countByUserId(userId);
        BigDecimal totalHours = timeEntryRepository.sumHoursWorkedByUserId(userId);
        BigDecimal billableHours = timeEntryRepository.sumBillableHoursByUserId(userId);
        
        return String.format("Total Entries: %d, Total Hours: %.2f, Billable Hours: %.2f",
                           totalEntries, totalHours, billableHours);
    }

    /**
     * Get time tracking statistics for a project.
     * 
     * @param projectId the project ID
     * @return time tracking statistics
     */
    @Transactional(readOnly = true)
    public String getProjectTimeStatistics(String projectId) {
        long totalEntries = timeEntryRepository.countByProjectId(projectId);
        BigDecimal totalHours = timeEntryRepository.sumHoursWorkedByProjectId(projectId);
        BigDecimal billableHours = timeEntryRepository.sumBillableHoursByProjectId(projectId);
        
        return String.format("Total Entries: %d, Total Hours: %.2f, Billable Hours: %.2f",
                           totalEntries, totalHours, billableHours);
    }
}
