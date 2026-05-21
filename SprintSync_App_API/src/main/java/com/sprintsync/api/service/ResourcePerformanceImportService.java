package com.sprintsync.api.service;

import com.sprintsync.api.entity.Sprint;
import com.sprintsync.api.entity.Story;
import com.sprintsync.api.entity.Task;
import com.sprintsync.api.entity.TimeEntry;
import com.sprintsync.api.entity.enums.Priority;
import com.sprintsync.api.entity.enums.SprintStatus;
import com.sprintsync.api.entity.enums.StoryPriority;
import com.sprintsync.api.entity.enums.StoryStatus;
import com.sprintsync.api.entity.enums.TaskStatus;
import com.sprintsync.api.entity.enums.TimeEntryType;
import com.sprintsync.api.repository.SprintRepository;
import com.sprintsync.api.repository.StoryRepository;
import com.sprintsync.api.repository.TaskRepository;
import com.sprintsync.api.repository.TimeEntryRepository;
import com.sprintsync.api.repository.UserRepository;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.function.Function;
import java.sql.Timestamp;

@Service
public class ResourcePerformanceImportService {

    private static final String SHEET_NAME = "Resource Performance Details";
    private static final DateTimeFormatter MONTH_YEAR_FORMAT = DateTimeFormatter.ofPattern("MMM-yyyy", Locale.ENGLISH);
    private static final List<DateTimeFormatter> DATE_FORMATTERS = List.of(
            DateTimeFormatter.ofPattern("dd-MM-uuuu"),
            DateTimeFormatter.ofPattern("d-M-uuuu"),
            DateTimeFormatter.ofPattern("dd/MM/uuuu"),
            DateTimeFormatter.ofPattern("d/M/uuuu"),
            DateTimeFormatter.ofPattern("MM/dd/uuuu"),
            DateTimeFormatter.ofPattern("M/d/uuuu"),
            DateTimeFormatter.ofPattern("dd-MMM-uuuu", Locale.ENGLISH),
            DateTimeFormatter.ofPattern("d-MMM-uuuu", Locale.ENGLISH)
    );

    private final SprintRepository sprintRepository;
    private final StoryRepository storyRepository;
    private final TaskRepository taskRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final UserRepository userRepository;
    private final IdGenerationService idGenerationService;
    private final JdbcTemplate jdbcTemplate;
    @PersistenceContext
    private EntityManager entityManager;
    private ImportMetrics importMetrics;
    private Map<String, String> userIdByResourceName = Map.of();
    private Map<String, String> userIdByNormalizedName = Map.of();
    private Map<String, String> userIdByFirstName = Map.of();
    private final Map<String, LocalDateTime> desiredSprintCreatedAt = new HashMap<>();
    private final Map<String, LocalDateTime> desiredSprintUpdatedAt = new HashMap<>();
    private final Map<String, LocalDateTime> desiredStoryCreatedAt = new HashMap<>();
    private final Map<String, LocalDateTime> desiredStoryUpdatedAt = new HashMap<>();
    private final Map<String, LocalDateTime> desiredTaskCreatedAt = new HashMap<>();
    private final Map<String, LocalDateTime> desiredTaskUpdatedAt = new HashMap<>();
    private final Map<String, LocalDateTime> desiredTimeEntryCreatedAt = new HashMap<>();
    private final Map<String, LocalDateTime> desiredTimeEntryUpdatedAt = new HashMap<>();

    public ResourcePerformanceImportService(
            SprintRepository sprintRepository,
            StoryRepository storyRepository,
            TaskRepository taskRepository,
            TimeEntryRepository timeEntryRepository,
            UserRepository userRepository,
            IdGenerationService idGenerationService,
            JdbcTemplate jdbcTemplate) {
        this.sprintRepository = sprintRepository;
        this.storyRepository = storyRepository;
        this.taskRepository = taskRepository;
        this.timeEntryRepository = timeEntryRepository;
        this.userRepository = userRepository;
        this.idGenerationService = idGenerationService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    public Map<String, Object> importFile(MultipartFile file, String projectId) throws IOException {
        return importFile(file, projectId, null);
    }

    @Transactional
    public Map<String, Object> importFile(MultipartFile file, String projectId, String sheetName) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Excel file is required.");
        }
        if (projectId == null || projectId.isBlank()) {
            throw new IllegalArgumentException("projectId is required.");
        }

        this.importMetrics = new ImportMetrics();
        clearDesiredAuditMaps();
        ReadRowsResult readRowsResult = readRows(file, sheetName);
        List<Map<String, String>> rows = readRowsResult.rows();
        if (rows.isEmpty()) {
            throw new IllegalArgumentException("No rows found in selected sheet: " + readRowsResult.sheetName());
        }

        Map<String, String> userIdByEmail = loadUserIdByEmail(rows);
        this.userIdByResourceName = loadUserIdByName(rows);
        buildFuzzyUserNameMaps();
        Map<String, String> sprintIdByName = new HashMap<>();
        Map<String, String> storyIdByLegacy = new HashMap<>();
        Map<String, String> taskIdByLegacy = new HashMap<>();

        List<Sprint> sprintsToSave = buildSprints(rows, projectId, sprintIdByName);
        List<Story> storiesToSave = buildStories(rows, projectId, userIdByEmail, sprintIdByName, storyIdByLegacy);
        List<Task> tasksToSave = buildTasks(rows, userIdByEmail, storyIdByLegacy, taskIdByLegacy);
        List<TimeEntry> timeEntriesToSave = buildTimeEntries(rows, projectId, userIdByEmail, storyIdByLegacy, taskIdByLegacy);

        int insertedSprints = persistSafely(
                sprintsToSave,
                sprintRepository::saveAll,
                sprintRepository::save,
                "sprints"
        );
        int insertedStories = persistSafely(
                storiesToSave,
                storyRepository::saveAll,
                storyRepository::save,
                "stories"
        );
        int insertedTasks = persistSafely(
                tasksToSave,
                taskRepository::saveAll,
                taskRepository::save,
                "tasks"
        );
        int insertedTimeEntries = persistSafely(
                timeEntriesToSave,
                timeEntryRepository::saveAll,
                timeEntryRepository::save,
                "time_entries"
        );

        // Ensure managed entities are flushed, then clear context so later JDBC updates
        // are not overwritten by a final JPA flush at transaction commit.
        entityManager.flush();
        entityManager.clear();

        // Spring auditing may overwrite CreatedDate/LastModifiedDate on persist.
        // Force the audit timestamps from sheet values after insert.
        boolean triggerBypassEnabled = enableTriggerBypassIfPermitted();
        try {
            applyAuditTimestamps("sprints", desiredSprintCreatedAt, desiredSprintUpdatedAt);
            applyAuditTimestamps("stories", desiredStoryCreatedAt, desiredStoryUpdatedAt);
            applyAuditTimestamps("tasks", desiredTaskCreatedAt, desiredTaskUpdatedAt);
            applyAuditTimestamps("time_entries", desiredTimeEntryCreatedAt, desiredTimeEntryUpdatedAt);
        } finally {
            if (triggerBypassEnabled) {
                disableTriggerBypass();
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("projectId", projectId);
        result.put("sheetUsed", readRowsResult.sheetName());
        result.put("availableSheets", readRowsResult.availableSheets());
        result.put("rowsRead", rows.size());
        result.put("distinctStoryIdsInSheet", rows.stream().map(r -> safe(r.get("Story Id"))).filter(v -> !v.isBlank()).distinct().count());
        result.put("distinctTaskIdsInSheet", rows.stream().map(r -> safe(r.get("Task/Issue Id"))).filter(v -> !v.isBlank()).distinct().count());
        result.put("insertedSprints", insertedSprints);
        result.put("insertedStories", insertedStories);
        result.put("insertedTasks", insertedTasks);
        result.put("insertedTimeEntries", insertedTimeEntries);
        result.put("failedSprints", Math.max(0, sprintsToSave.size() - insertedSprints));
        result.put("failedStories", Math.max(0, storiesToSave.size() - insertedStories));
        result.put("failedTasks", Math.max(0, tasksToSave.size() - insertedTasks));
        result.put("failedTimeEntries", Math.max(0, timeEntriesToSave.size() - insertedTimeEntries));
        result.put("skippedTimeEntriesMissingUser", importMetrics.skippedTimeEntriesMissingUser);
        result.put("skippedTimeEntriesNonPositiveHours", importMetrics.skippedTimeEntriesNonPositiveHours);
        result.put("timeEntriesUsedEstimatedHoursFallback", importMetrics.timeEntriesUsedEstimatedHoursFallback);
        result.put("skippedTasksMissingStoryRef", importMetrics.skippedTasksMissingStoryRef);
        result.put("skippedSample", importMetrics.skippedSamples);
        result.put("unresolvedUsers", importMetrics.unresolvedUsers);
        result.put("bulkFallbackEntities", importMetrics.bulkFallbackEntities);
        result.put("individualSaveFailures", importMetrics.individualSaveFailures);
        result.put("triggerBypassUsed", importMetrics.triggerBypassUsed);
        result.put("triggerBypassError", importMetrics.triggerBypassError);
        return result;
    }

    private ReadRowsResult readRows(MultipartFile file, String requestedSheetName) throws IOException {
        try (InputStream inputStream = file.getInputStream(); Workbook workbook = new XSSFWorkbook(inputStream)) {
            List<String> availableSheets = new ArrayList<>();
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                availableSheets.add(workbook.getSheetName(i));
            }

            String effectiveSheetName = safe(requestedSheetName).isBlank() ? SHEET_NAME : safe(requestedSheetName);
            Sheet sheet = workbook.getSheet(effectiveSheetName);
            if (sheet == null && safe(requestedSheetName).isBlank()) {
                sheet = workbook.getSheetAt(0);
                effectiveSheetName = sheet.getSheetName();
            }
            if (sheet == null) {
                throw new IllegalArgumentException("Sheet not found: " + effectiveSheetName + ". Available sheets: " + availableSheets);
            }

            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                return new ReadRowsResult(List.of(), effectiveSheetName, availableSheets);
            }

            DataFormatter formatter = new DataFormatter();
            Map<Integer, String> headers = new HashMap<>();
            for (Cell cell : headerRow) {
                headers.put(cell.getColumnIndex(), formatter.formatCellValue(cell).trim());
            }

            List<Map<String, String>> rows = new ArrayList<>();
            for (int i = headerRow.getRowNum() + 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) {
                    continue;
                }
                Map<String, String> rowData = new HashMap<>();
                boolean nonEmpty = false;
                for (Map.Entry<Integer, String> entry : headers.entrySet()) {
                    Cell currentCell = row.getCell(entry.getKey());
                    String value = extractCellValue(currentCell, entry.getValue(), formatter);
                    if (!value.isEmpty()) {
                        nonEmpty = true;
                    }
                    rowData.put(entry.getValue(), value);
                }
                if (nonEmpty) {
                    rows.add(rowData);
                }
            }
            return new ReadRowsResult(rows, effectiveSheetName, availableSheets);
        }
    }

    private Map<String, String> loadUserIdByEmail(List<Map<String, String>> rows) {
        Set<String> emails = rows.stream()
                .map(r -> toLower(r.get("Resource Email Id")))
                .filter(v -> !v.isBlank())
                .collect(Collectors.toSet());

        if (emails.isEmpty()) {
            return Map.of();
        }

        Map<String, String> userMap = new HashMap<>();
        List<Object[]> userRows = userRepository.findIdAndEmailByLowercaseEmailIn(emails);
        for (Object[] row : userRows) {
            if (row == null || row.length < 2 || row[0] == null || row[1] == null) {
                continue;
            }
            String userId = String.valueOf(row[0]);
            String email = String.valueOf(row[1]).toLowerCase(Locale.ENGLISH);
            userMap.put(email, userId);
        }
        return userMap;
    }

    private Map<String, String> loadUserIdByName(List<Map<String, String>> rows) {
        Set<String> names = rows.stream()
                .map(r -> toLower(r.get("Resource Name")))
                .filter(v -> !v.isBlank())
                .collect(Collectors.toSet());

        if (names.isEmpty()) {
            return Map.of();
        }

        Map<String, String> userMap = new HashMap<>();
        List<Object[]> userRows = userRepository.findIdAndNameByLowercaseNameIn(names);
        for (Object[] row : userRows) {
            if (row == null || row.length < 2 || row[0] == null || row[1] == null) {
                continue;
            }
            String userId = String.valueOf(row[0]);
            String name = String.valueOf(row[1]).toLowerCase(Locale.ENGLISH).trim();
            userMap.put(name, userId);
        }
        return userMap;
    }

    private List<Sprint> buildSprints(List<Map<String, String>> rows, String projectId, Map<String, String> sprintIdByName) {
        Map<String, Map<String, String>> unique = new LinkedHashMap<>();
        for (Map<String, String> row : rows) {
            String sprintName = safe(row.get("Sprint"));
            if (!sprintName.isBlank()) {
                unique.putIfAbsent(sprintName, row);
            }
        }

        List<Sprint> sprints = new ArrayList<>();
        for (Map.Entry<String, Map<String, String>> entry : unique.entrySet()) {
            String name = entry.getKey();
            Map<String, String> row = entry.getValue();

            Sprint sprint = new Sprint();
            String newId = idGenerationService.generateSprintId();
            sprint.setId(newId);
            sprint.setProjectId(projectId);
            sprint.setName(name);
            sprint.setGoal("Imported from resource-performance-2026-05-04_new.xlsx");
            sprint.setStatus(SprintStatus.COMPLETED);
            sprint.setStartDate(resolveSprintStart(name, row.get("Created Date")));
            sprint.setEndDate(resolveSprintEnd(name, row.get("Due Date")));
            sprint.setCapacityHours(null);
            sprint.setVelocityPoints(0);
            sprint.setIsActive(Boolean.FALSE);
            LocalDateTime sprintCreatedAt = parseDateTime(row.get("Created Date"));
            LocalDateTime sprintUpdatedAt = firstNonNullDateTime(
                    parseDateTime(row.get("Completed Date")),
                    parseDateTime(row.get("Due Date")),
                    sprintCreatedAt
            );
            if (sprintCreatedAt != null) {
                sprint.setCreatedAt(sprintCreatedAt);
                desiredSprintCreatedAt.put(newId, sprintCreatedAt);
            }
            if (sprintUpdatedAt != null) {
                sprint.setUpdatedAt(sprintUpdatedAt);
                desiredSprintUpdatedAt.put(newId, sprintUpdatedAt);
            }

            sprintIdByName.put(name, newId);
            sprints.add(sprint);
        }
        return sprints;
    }

    private List<Story> buildStories(
            List<Map<String, String>> rows,
            String projectId,
            Map<String, String> userIdByEmail,
            Map<String, String> sprintIdByName,
            Map<String, String> storyIdByLegacy) {
        Map<String, Map<String, String>> unique = new LinkedHashMap<>();
        for (Map<String, String> row : rows) {
            String legacyId = safe(row.get("Story Id"));
            String storyKey = legacyId.isBlank() ? buildStoryKey(row) : legacyId;
            if (!storyKey.isBlank()) {
                unique.putIfAbsent(storyKey, row);
            }
        }

        List<Story> stories = new ArrayList<>();
        for (Map.Entry<String, Map<String, String>> entry : unique.entrySet()) {
            Map<String, String> row = entry.getValue();

            Story story = new Story();
            String newId = idGenerationService.generateStoryId();
            story.setId(newId);
            story.setProjectId(projectId);
            story.setSprintId(sprintIdByName.get(safe(row.get("Sprint"))));
            story.setTitle(firstNonBlank(row.get("Story Name"), row.get("Task/Issue Name"), "Imported Story"));
            story.setDescription("Imported from resource performance sheet");
            story.setAcceptanceCriteria(List.of());
            story.setStatus(mapStoryStatus(row.get("Status")));
            story.setPriority(StoryPriority.MEDIUM);
            story.setStoryPoints(null);
            story.setAssigneeId(resolveUserId(row, userIdByEmail));
            story.setReporterId(resolveUserId(row, userIdByEmail));
            story.setLabels(labelsFromWorkCategory(row));
            story.setOrderIndex(0);
            story.setEstimatedHours(parseDecimal(row.get("Estimation Hours")));
            story.setActualHours(parseDecimalOrZero(row.get("Actual Hours")));
            story.setDueDate(parseDate(firstNonBlank(row.get("Due Date"), row.get("Completed Date"))));
            LocalDateTime storyCreatedAt = parseDateTime(row.get("Created Date"));
            LocalDateTime storyUpdatedAt = firstNonNullDateTime(
                    parseDateTime(row.get("Completed Date")),
                    parseDateTime(row.get("Due Date")),
                    storyCreatedAt
            );
            if (storyCreatedAt != null) {
                story.setCreatedAt(storyCreatedAt);
                desiredStoryCreatedAt.put(newId, storyCreatedAt);
            }
            if (storyUpdatedAt != null) {
                story.setUpdatedAt(storyUpdatedAt);
                desiredStoryUpdatedAt.put(newId, storyUpdatedAt);
            }

            String legacyStoryId = safe(row.get("Story Id"));
            if (!legacyStoryId.isBlank()) {
                storyIdByLegacy.put(legacyStoryId, newId);
            }
            storyIdByLegacy.put(buildStoryKey(row), newId);
            stories.add(story);
        }
        return stories;
    }

    private List<Task> buildTasks(
            List<Map<String, String>> rows,
            Map<String, String> userIdByEmail,
            Map<String, String> storyIdByLegacy,
            Map<String, String> taskIdByLegacy) {
        Map<String, Map<String, String>> unique = new LinkedHashMap<>();
        for (Map<String, String> row : rows) {
            String legacyId = safe(row.get("Task/Issue Id"));
            String taskKey = legacyId.isBlank() ? buildTaskKey(row) : legacyId;
            if (!taskKey.isBlank()) {
                unique.putIfAbsent(taskKey, row);
            }
        }

        List<Task> tasks = new ArrayList<>();
        Map<String, Integer> taskNumberByStory = new HashMap<>();
        for (Map.Entry<String, Map<String, String>> entry : unique.entrySet()) {
            Map<String, String> row = entry.getValue();
            String newStoryId = resolveMappedStoryId(row, storyIdByLegacy);
            if (newStoryId == null) {
                importMetrics.skippedTasksMissingStoryRef++;
                continue;
            }

            Task task = new Task();
            String newTaskId = idGenerationService.generateTaskId();
            task.setId(newTaskId);
            task.setStoryId(newStoryId);
            task.setTitle(firstNonBlank(row.get("Task/Issue Name"), "Imported Task"));
            task.setDescription("Imported from resource performance sheet");
            task.setStatus(mapTaskStatus(row.get("Status")));
            task.setPriority(Priority.MEDIUM);
            task.setAssigneeId(resolveUserId(row, userIdByEmail));
            task.setReporterId(resolveUserId(row, userIdByEmail));
            task.setEstimatedHours(parseDecimal(row.get("Estimation Hours")));
            task.setActualHours(parseDecimalOrZero(row.get("Actual Hours")));
            task.setOrderIndex(0);
            task.setDueDate(parseDate(firstNonBlank(row.get("Due Date"), row.get("Completed Date"))));
            task.setLabels(labelsFromWorkCategory(row));
            task.setIsPulledFromBacklog(Boolean.FALSE);
            int nextTaskNumber = taskNumberByStory.getOrDefault(newStoryId, 0) + 1;
            task.setTaskNumber(nextTaskNumber);
            taskNumberByStory.put(newStoryId, nextTaskNumber);
            LocalDateTime taskCreatedAt = parseDateTime(row.get("Created Date"));
            LocalDateTime taskUpdatedAt = firstNonNullDateTime(
                    parseDateTime(row.get("Completed Date")),
                    parseDateTime(row.get("Due Date")),
                    taskCreatedAt
            );
            if (taskCreatedAt != null) {
                task.setCreatedAt(taskCreatedAt);
                desiredTaskCreatedAt.put(newTaskId, taskCreatedAt);
            }
            if (taskUpdatedAt != null) {
                task.setUpdatedAt(taskUpdatedAt);
                desiredTaskUpdatedAt.put(newTaskId, taskUpdatedAt);
            }

            String rawTaskId = safe(row.get("Task/Issue Id"));
            if (!rawTaskId.isBlank()) {
                taskIdByLegacy.put(rawTaskId, newTaskId);
            }
            taskIdByLegacy.put(buildTaskKey(row), newTaskId);
            tasks.add(task);
        }
        return tasks;
    }

    private List<TimeEntry> buildTimeEntries(
            List<Map<String, String>> rows,
            String projectId,
            Map<String, String> userIdByEmail,
            Map<String, String> storyIdByLegacy,
            Map<String, String> taskIdByLegacy) {
        List<TimeEntry> timeEntries = new ArrayList<>();
        for (Map<String, String> row : rows) {
            String userId = resolveUserId(row, userIdByEmail);
            if (userId == null || userId.isBlank()) {
                importMetrics.skippedTimeEntriesMissingUser++;
                addSkippedSample("missing_user", row);
                continue;
            }
            BigDecimal actualHours = parseDecimalOrZero(row.get("Actual Hours"));
            BigDecimal estimatedHours = parseDecimalOrZero(row.get("Estimation Hours"));
            BigDecimal hoursWorked = actualHours;
            if (hoursWorked.compareTo(BigDecimal.ZERO) <= 0 && estimatedHours.compareTo(BigDecimal.ZERO) > 0) {
                hoursWorked = estimatedHours;
                importMetrics.timeEntriesUsedEstimatedHoursFallback++;
            }
            if (hoursWorked.compareTo(BigDecimal.ZERO) <= 0) {
                importMetrics.skippedTimeEntriesNonPositiveHours++;
                addSkippedSample("non_positive_hours", row);
                continue;
            }

            TimeEntry entry = new TimeEntry();
            entry.setId(idGenerationService.generateTimeEntryId());
            entry.setUserId(userId);
            entry.setProjectId(projectId);
            entry.setStoryId(resolveMappedStoryId(row, storyIdByLegacy));
            entry.setTaskId(resolveMappedTaskId(row, taskIdByLegacy));
            entry.setSubtaskId(null);
            entry.setDescription(firstNonBlank(row.get("Task/Issue Name"), row.get("Story Name"), "Imported time entry"));
            entry.setEntryType(mapEntryType(row.get("Work Category")));
            entry.setHoursWorked(hoursWorked);
            entry.setWorkDate(resolveWorkDate(row));
            entry.setStartTime(null);
            entry.setEndTime(null);
            entry.setIsBillable(Boolean.TRUE);
            LocalDateTime entryCreatedAt = parseDateTime(row.get("Created Date"));
            LocalDateTime entryUpdatedAt = firstNonNullDateTime(
                    parseDateTime(row.get("Completed Date")),
                    parseDateTime(row.get("Due Date")),
                    entryCreatedAt
            );
            if (entryCreatedAt != null) {
                entry.setCreatedAt(entryCreatedAt);
                desiredTimeEntryCreatedAt.put(entry.getId(), entryCreatedAt);
            }
            if (entryUpdatedAt != null) {
                entry.setUpdatedAt(entryUpdatedAt);
                desiredTimeEntryUpdatedAt.put(entry.getId(), entryUpdatedAt);
            }
            timeEntries.add(entry);
        }
        return timeEntries;
    }

    private String resolveUserId(Map<String, String> row, Map<String, String> userIdByEmail) {
        String explicitUserId = safe(row.get("User ID"));
        if (!explicitUserId.isBlank() && userRepository.existsById(explicitUserId)) {
            return explicitUserId;
        }
        String email = toLower(row.get("Resource Email Id"));
        if (!email.isBlank()) {
            String userId = userIdByEmail.get(email);
            if (userId != null && !userId.isBlank()) {
                return userId;
            }
        }

        String resourceName = toLower(row.get("Resource Name"));
        if (!resourceName.isBlank()) {
            String userId = userIdByResourceName.get(resourceName);
            if (userId != null && !userId.isBlank()) {
                return userId;
            }

            String normalizedName = normalizeName(resourceName);
            if (!normalizedName.isBlank()) {
                userId = userIdByNormalizedName.get(normalizedName);
                if (userId != null && !userId.isBlank()) {
                    return userId;
                }
            }

            String firstName = firstToken(resourceName);
            if (!firstName.isBlank()) {
                userId = userIdByFirstName.get(firstName);
                if (userId != null && !userId.isBlank()) {
                    return userId;
                }
            }
        }
        if (!resourceName.isBlank()) {
            importMetrics.unresolvedUsers.add(resourceName);
        }
        return null;
    }

    private StoryStatus mapStoryStatus(String value) {
        String v = safe(value).toLowerCase(Locale.ENGLISH);
        if ("done".equals(v) || "completed".equals(v) || "closed".equals(v)) {
            return StoryStatus.DONE;
        }
        if ("in_progress".equals(v) || "in progress".equals(v)) {
            return StoryStatus.IN_PROGRESS;
        }
        if ("review".equals(v) || "qa_review".equals(v) || "qa review".equals(v)) {
            return StoryStatus.REVIEW;
        }
        if ("todo".equals(v) || "to_do".equals(v) || "to do".equals(v)) {
            return StoryStatus.TODO;
        }
        return StoryStatus.BACKLOG;
    }

    private TaskStatus mapTaskStatus(String value) {
        String v = safe(value).toLowerCase(Locale.ENGLISH);
        if ("done".equals(v) || "completed".equals(v) || "closed".equals(v)) {
            return TaskStatus.DONE;
        }
        if ("in_progress".equals(v) || "in progress".equals(v)) {
            return TaskStatus.IN_PROGRESS;
        }
        if ("review".equals(v) || "qa_review".equals(v) || "qa review".equals(v)) {
            return TaskStatus.QA_REVIEW;
        }
        if ("blocked".equals(v)) {
            return TaskStatus.BLOCKED;
        }
        if ("cancelled".equals(v) || "canceled".equals(v)) {
            return TaskStatus.CANCELLED;
        }
        return TaskStatus.TO_DO;
    }

    private TimeEntryType mapEntryType(String value) {
        String v = safe(value).toLowerCase(Locale.ENGLISH);
        if (v.contains("test")) {
            return TimeEntryType.TESTING;
        }
        if (v.contains("design")) {
            return TimeEntryType.DESIGN;
        }
        if (v.contains("review")) {
            return TimeEntryType.REVIEW;
        }
        if (v.contains("meeting")) {
            return TimeEntryType.MEETING;
        }
        if (v.contains("research")) {
            return TimeEntryType.RESEARCH;
        }
        if (v.contains("documentation")) {
            return TimeEntryType.DOCUMENTATION;
        }
        if (v.contains("bug")) {
            return TimeEntryType.BUG_FIX;
        }
        if (v.contains("refactor")) {
            return TimeEntryType.REFACTORING;
        }
        if (v.contains("deploy")) {
            return TimeEntryType.DEPLOYMENT;
        }
        if (v.contains("training")) {
            return TimeEntryType.TRAINING;
        }
        if (v.contains("admin")) {
            return TimeEntryType.ADMINISTRATIVE;
        }
        return TimeEntryType.DEVELOPMENT;
    }

    private LocalDate resolveSprintStart(String sprintName, String fallback) {
        LocalDate byName = parseMonthYearStart(sprintName);
        if (byName != null) {
            return byName;
        }
        LocalDate parsed = parseDate(fallback);
        return parsed != null ? parsed : LocalDate.now();
    }

    private LocalDate resolveSprintEnd(String sprintName, String fallback) {
        LocalDate byName = parseMonthYearEnd(sprintName);
        if (byName != null) {
            return byName;
        }
        LocalDate parsed = parseDate(fallback);
        return parsed != null ? parsed : LocalDate.now();
    }

    private LocalDate resolveWorkDate(Map<String, String> row) {
        LocalDate completed = parseDate(row.get("Completed Date"));
        if (completed != null) {
            return completed;
        }
        LocalDate due = parseDate(row.get("Due Date"));
        if (due != null) {
            return due;
        }
        LocalDate created = parseDate(row.get("Created Date"));
        if (created != null) {
            return created;
        }
        return java.time.LocalDate.now();
    }

    private LocalDate parseMonthYearStart(String value) {
        String v = safe(value);
        if (v.isBlank()) {
            return null;
        }
        try {
            YearMonth ym = YearMonth.parse(v, MONTH_YEAR_FORMAT);
            return ym.atDay(1);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private LocalDate parseMonthYearEnd(String value) {
        String v = safe(value);
        if (v.isBlank()) {
            return null;
        }
        try {
            YearMonth ym = YearMonth.parse(v, MONTH_YEAR_FORMAT);
            return ym.atEndOfMonth();
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }

    private LocalDate parseDate(String value) {
        String v = safe(value);
        if (v.isBlank()) {
            return null;
        }
        if (v.matches("^\\d+(\\.\\d+)?$")) {
            try {
                double excelSerial = Double.parseDouble(v);
                if (excelSerial > 20000) {
                    return DateUtil.getLocalDateTime(excelSerial).toLocalDate();
                }
            } catch (Exception ignored) {
            }
        }
        try {
            return LocalDate.parse(v, DateTimeFormatter.ISO_DATE_TIME);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDate.parse(v);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.parse(v).toLocalDate();
        } catch (DateTimeParseException ignored) {
        }
        for (DateTimeFormatter formatter : DATE_FORMATTERS) {
            try {
                return LocalDate.parse(v, formatter);
            } catch (DateTimeParseException ignored) {
            }
        }
        if (v.length() >= 10) {
            try {
                return LocalDate.parse(v.substring(0, 10));
            } catch (DateTimeParseException ignored) {
            }
        }
        return null;
    }

    private LocalDateTime parseDateTime(String value) {
        String v = safe(value);
        if (v.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(v, DateTimeFormatter.ISO_DATE_TIME);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.parse(v);
        } catch (DateTimeParseException ignored) {
        }
        LocalDate date = parseDate(v);
        if (date != null) {
            return date.atTime(LocalTime.NOON);
        }
        return null;
    }

    private LocalDateTime firstNonNullDateTime(LocalDateTime... values) {
        for (LocalDateTime value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String extractCellValue(Cell cell, String header, DataFormatter formatter) {
        if (cell == null) {
            return "";
        }

        String normalizedHeader = safe(header).toLowerCase(Locale.ENGLISH);
        boolean isDateColumn = normalizedHeader.contains("date");
        boolean isHoursColumn = normalizedHeader.equals("actual hours")
                || normalizedHeader.equals("estimation hours")
                || normalizedHeader.equals("remaining hours");

        if (isDateColumn && isExcelDateCell(cell)) {
            try {
                return cell.getLocalDateTimeCellValue().toLocalDate().toString();
            } catch (Exception ignored) {
            }
        }

        if (isDateColumn && cell.getCellType() == CellType.NUMERIC) {
            try {
                return DateUtil.getLocalDateTime(cell.getNumericCellValue()).toLocalDate().toString();
            } catch (Exception ignored) {
            }
        }

        if (isHoursColumn && cell.getCellType() == CellType.NUMERIC) {
            try {
                BigDecimal numericValue = BigDecimal.valueOf(cell.getNumericCellValue());
                return numericValue.stripTrailingZeros().toPlainString();
            } catch (Exception ignored) {
            }
        }

        String value = formatter.formatCellValue(cell).trim();
        if (isDateColumn) {
            LocalDate parsed = parseDate(value);
            if (parsed != null) {
                return parsed.toString();
            }
        }
        return value;
    }

    private boolean isExcelDateCell(Cell cell) {
        if (cell == null) {
            return false;
        }
        CellType type = cell.getCellType();
        if (type == CellType.NUMERIC) {
            return DateUtil.isCellDateFormatted(cell);
        }
        return false;
    }

    private BigDecimal parseDecimal(String value) {
        String v = safe(value);
        if (v.isBlank()) {
            return null;
        }
        v = v.replace(",", "").replace("hrs", "").replace("hours", "").trim();
        try {
            return new BigDecimal(v);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private BigDecimal parseDecimalOrZero(String value) {
        BigDecimal parsed = parseDecimal(value);
        return parsed != null ? parsed : BigDecimal.ZERO;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String toLower(String value) {
        return safe(value).toLowerCase(Locale.ENGLISH);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            String v = safe(value);
            if (!v.isBlank()) {
                return v;
            }
        }
        return "";
    }

    private List<String> labelsFromWorkCategory(Map<String, String> row) {
        List<String> tags = new ArrayList<>(2);
        String workCategory = safe(row.get("Work Category")).trim();
        if (!workCategory.isBlank()) {
            tags.add(workCategory);
        }
        tags.add("resource-performance");
        return tags;
    }

    private void buildFuzzyUserNameMaps() {
        List<Object[]> allUserRows = userRepository.findAllIdAndName();
        Map<String, String> normalizedMap = new HashMap<>();
        Map<String, String> firstNameMap = new HashMap<>();
        Set<String> duplicateFirstNames = new java.util.HashSet<>();

        for (Object[] row : allUserRows) {
            if (row == null || row.length < 2 || row[0] == null || row[1] == null) {
                continue;
            }
            String userId = String.valueOf(row[0]);
            String userName = String.valueOf(row[1]).toLowerCase(Locale.ENGLISH).trim();
            String normalized = normalizeName(userName);
            if (!normalized.isBlank()) {
                normalizedMap.putIfAbsent(normalized, userId);
            }

            String first = firstToken(userName);
            if (!first.isBlank()) {
                if (firstNameMap.containsKey(first) && !firstNameMap.get(first).equals(userId)) {
                    duplicateFirstNames.add(first);
                } else {
                    firstNameMap.put(first, userId);
                }
            }
        }

        for (String duplicate : duplicateFirstNames) {
            firstNameMap.remove(duplicate);
        }

        this.userIdByNormalizedName = normalizedMap;
        this.userIdByFirstName = firstNameMap;
    }

    private String normalizeName(String value) {
        return safe(value).toLowerCase(Locale.ENGLISH).replaceAll("[^a-z0-9]", "");
    }

    private String firstToken(String value) {
        String cleaned = safe(value).toLowerCase(Locale.ENGLISH).trim();
        if (cleaned.isBlank()) {
            return "";
        }
        String[] parts = cleaned.split("\\s+");
        return parts.length > 0 ? parts[0] : "";
    }

    private <T> int persistSafely(
            List<T> entities,
            Function<List<T>, List<T>> bulkSaver,
            Function<T, T> singleSaver,
            String entityLabel) {
        if (entities == null || entities.isEmpty()) {
            return 0;
        }

        try {
            List<T> saved = bulkSaver.apply(entities);
            return saved == null ? entities.size() : saved.size();
        } catch (Exception bulkException) {
            importMetrics.bulkFallbackEntities.add(entityLabel);
            int successCount = 0;
            for (T entity : entities) {
                try {
                    singleSaver.apply(entity);
                    successCount++;
                } catch (Exception singleException) {
                    importMetrics.individualSaveFailures++;
                }
            }
            return successCount;
        }
    }

    private void clearDesiredAuditMaps() {
        desiredSprintCreatedAt.clear();
        desiredSprintUpdatedAt.clear();
        desiredStoryCreatedAt.clear();
        desiredStoryUpdatedAt.clear();
        desiredTaskCreatedAt.clear();
        desiredTaskUpdatedAt.clear();
        desiredTimeEntryCreatedAt.clear();
        desiredTimeEntryUpdatedAt.clear();
    }

    private void applyAuditTimestamps(
            String tableName,
            Map<String, LocalDateTime> createdAtById,
            Map<String, LocalDateTime> updatedAtById) {
        if ((createdAtById == null || createdAtById.isEmpty()) && (updatedAtById == null || updatedAtById.isEmpty())) {
            return;
        }

        Set<String> ids = new java.util.LinkedHashSet<>();
        if (createdAtById != null) {
            ids.addAll(createdAtById.keySet());
        }
        if (updatedAtById != null) {
            ids.addAll(updatedAtById.keySet());
        }

        for (String id : ids) {
            LocalDateTime createdAt = createdAtById != null ? createdAtById.get(id) : null;
            LocalDateTime updatedAt = updatedAtById != null ? updatedAtById.get(id) : null;
            if (createdAt == null && updatedAt == null) {
                continue;
            }

            jdbcTemplate.update(
                    "UPDATE sprintsync." + tableName + " SET created_at = COALESCE(?, created_at), updated_at = COALESCE(?, updated_at) WHERE id = ?",
                    createdAt != null ? Timestamp.valueOf(createdAt) : null,
                    updatedAt != null ? Timestamp.valueOf(updatedAt) : null,
                    id
            );
        }
    }

    private boolean enableTriggerBypassIfPermitted() {
        try {
            jdbcTemplate.execute("SAVEPOINT import_trigger_bypass");
            // Needed because BEFORE UPDATE triggers set updated_at=now().
            jdbcTemplate.execute("SET LOCAL session_replication_role = replica");
            importMetrics.triggerBypassUsed = true;
            return true;
        } catch (Exception e) {
            try {
                jdbcTemplate.execute("ROLLBACK TO SAVEPOINT import_trigger_bypass");
                jdbcTemplate.execute("RELEASE SAVEPOINT import_trigger_bypass");
            } catch (Exception ignored) {
            }
            importMetrics.triggerBypassUsed = false;
            importMetrics.triggerBypassError = e.getMessage();
            return false;
        }
    }

    private void disableTriggerBypass() {
        try {
            jdbcTemplate.execute("SET LOCAL session_replication_role = origin");
            jdbcTemplate.execute("RELEASE SAVEPOINT import_trigger_bypass");
        } catch (Exception ignored) {
        }
    }

    private String resolveMappedStoryId(Map<String, String> row, Map<String, String> storyIdByLegacy) {
        String rawStoryId = safe(row.get("Story Id"));
        if (!rawStoryId.isBlank()) {
            String mapped = storyIdByLegacy.get(rawStoryId);
            if (mapped != null && !mapped.isBlank()) {
                return mapped;
            }
        }
        return storyIdByLegacy.get(buildStoryKey(row));
    }

    private String resolveMappedTaskId(Map<String, String> row, Map<String, String> taskIdByLegacy) {
        String rawTaskId = safe(row.get("Task/Issue Id"));
        if (!rawTaskId.isBlank()) {
            String mapped = taskIdByLegacy.get(rawTaskId);
            if (mapped != null && !mapped.isBlank()) {
                return mapped;
            }
        }
        return taskIdByLegacy.get(buildTaskKey(row));
    }

    private String buildStoryKey(Map<String, String> row) {
        String storyName = normalizeName(row.get("Story Name"));
        String sprint = normalizeName(row.get("Sprint"));
        String project = normalizeName(row.get("Project"));
        return storyName + "|" + sprint + "|" + project;
    }

    private String buildTaskKey(Map<String, String> row) {
        String taskName = normalizeName(row.get("Task/Issue Name"));
        String storyKey = buildStoryKey(row);
        return taskName + "|" + storyKey;
    }

    private void addSkippedSample(String reason, Map<String, String> row) {
        if (importMetrics == null || importMetrics.skippedSamples.size() >= 25) {
            return;
        }
        Map<String, String> sample = new LinkedHashMap<>();
        sample.put("reason", reason);
        sample.put("resourceName", safe(row.get("Resource Name")));
        sample.put("resourceEmail", safe(row.get("Resource Email Id")));
        sample.put("userId", safe(row.get("User ID")));
        sample.put("storyId", safe(row.get("Story Id")));
        sample.put("taskId", safe(row.get("Task/Issue Id")));
        sample.put("actualHours", safe(row.get("Actual Hours")));
        sample.put("estimatedHours", safe(row.get("Estimation Hours")));
        sample.put("taskName", safe(row.get("Task/Issue Name")));
        importMetrics.skippedSamples.add(sample);
    }

    private record ReadRowsResult(List<Map<String, String>> rows, String sheetName, List<String> availableSheets) {}

    private static class ImportMetrics {
        int skippedTimeEntriesMissingUser;
        int skippedTimeEntriesNonPositiveHours;
        int timeEntriesUsedEstimatedHoursFallback;
        int skippedTasksMissingStoryRef;
        int individualSaveFailures;
        boolean triggerBypassUsed;
        String triggerBypassError;
        List<Map<String, String>> skippedSamples = new ArrayList<>();
        Set<String> unresolvedUsers = new java.util.LinkedHashSet<>();
        Set<String> bulkFallbackEntities = new java.util.LinkedHashSet<>();
    }
}
