package com.sprintsync.api.service;

import com.sprintsync.api.entity.Sprint;
import com.sprintsync.api.entity.Story;
import com.sprintsync.api.entity.Task;
import com.sprintsync.api.entity.TimeEntry;
import com.sprintsync.api.entity.User;
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
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ResourcePerformanceImportService {

    private static final String SHEET_NAME = "Resource Performance Details";
    private static final DateTimeFormatter MONTH_YEAR_FORMAT = DateTimeFormatter.ofPattern("MMM-yyyy", Locale.ENGLISH);

    private final SprintRepository sprintRepository;
    private final StoryRepository storyRepository;
    private final TaskRepository taskRepository;
    private final TimeEntryRepository timeEntryRepository;
    private final UserRepository userRepository;
    private final IdGenerationService idGenerationService;

    public ResourcePerformanceImportService(
            SprintRepository sprintRepository,
            StoryRepository storyRepository,
            TaskRepository taskRepository,
            TimeEntryRepository timeEntryRepository,
            UserRepository userRepository,
            IdGenerationService idGenerationService) {
        this.sprintRepository = sprintRepository;
        this.storyRepository = storyRepository;
        this.taskRepository = taskRepository;
        this.timeEntryRepository = timeEntryRepository;
        this.userRepository = userRepository;
        this.idGenerationService = idGenerationService;
    }

    @Transactional
    public Map<String, Object> importFile(MultipartFile file, String projectId) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Excel file is required.");
        }
        if (projectId == null || projectId.isBlank()) {
            throw new IllegalArgumentException("projectId is required.");
        }

        List<Map<String, String>> rows = readRows(file);
        if (rows.isEmpty()) {
            throw new IllegalArgumentException("No rows found in sheet: " + SHEET_NAME);
        }

        Map<String, String> userIdByEmail = loadUserIdByEmail(rows);
        Map<String, String> sprintIdByName = new HashMap<>();
        Map<String, String> storyIdByLegacy = new HashMap<>();
        Map<String, String> taskIdByLegacy = new HashMap<>();

        List<Sprint> sprintsToSave = buildSprints(rows, projectId, sprintIdByName);
        List<Story> storiesToSave = buildStories(rows, projectId, userIdByEmail, sprintIdByName, storyIdByLegacy);
        List<Task> tasksToSave = buildTasks(rows, userIdByEmail, storyIdByLegacy, taskIdByLegacy);
        List<TimeEntry> timeEntriesToSave = buildTimeEntries(rows, projectId, userIdByEmail, storyIdByLegacy, taskIdByLegacy);

        if (!sprintsToSave.isEmpty()) {
            sprintRepository.saveAll(sprintsToSave);
        }
        if (!storiesToSave.isEmpty()) {
            storyRepository.saveAll(storiesToSave);
        }
        if (!tasksToSave.isEmpty()) {
            taskRepository.saveAll(tasksToSave);
        }
        if (!timeEntriesToSave.isEmpty()) {
            timeEntryRepository.saveAll(timeEntriesToSave);
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("projectId", projectId);
        result.put("rowsRead", rows.size());
        result.put("insertedSprints", sprintsToSave.size());
        result.put("insertedStories", storiesToSave.size());
        result.put("insertedTasks", tasksToSave.size());
        result.put("insertedTimeEntries", timeEntriesToSave.size());
        return result;
    }

    private List<Map<String, String>> readRows(MultipartFile file) throws IOException {
        try (InputStream inputStream = file.getInputStream(); Workbook workbook = new XSSFWorkbook(inputStream)) {
            Sheet sheet = workbook.getSheet(SHEET_NAME);
            if (sheet == null) {
                throw new IllegalArgumentException("Sheet not found: " + SHEET_NAME);
            }

            Row headerRow = sheet.getRow(sheet.getFirstRowNum());
            if (headerRow == null) {
                return List.of();
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
                    String value = formatter.formatCellValue(row.getCell(entry.getKey())).trim();
                    if (!value.isEmpty()) {
                        nonEmpty = true;
                    }
                    rowData.put(entry.getValue(), value);
                }
                if (nonEmpty) {
                    rows.add(rowData);
                }
            }
            return rows;
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
            if (!legacyId.isBlank()) {
                unique.putIfAbsent(legacyId, row);
            }
        }

        List<Story> stories = new ArrayList<>();
        for (Map.Entry<String, Map<String, String>> entry : unique.entrySet()) {
            String legacyStoryId = entry.getKey();
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
            story.setLabels(List.of("imported", "resource-performance"));
            story.setOrderIndex(0);
            story.setEstimatedHours(parseDecimal(row.get("Estimation Hours")));
            story.setActualHours(parseDecimalOrZero(row.get("Actual Hours")));
            story.setDueDate(parseDate(firstNonBlank(row.get("Due Date"), row.get("Completed Date"))));

            storyIdByLegacy.put(legacyStoryId, newId);
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
            if (!legacyId.isBlank()) {
                unique.putIfAbsent(legacyId, row);
            }
        }

        List<Task> tasks = new ArrayList<>();
        Map<String, Integer> taskNumberByStory = new HashMap<>();
        for (Map.Entry<String, Map<String, String>> entry : unique.entrySet()) {
            String legacyTaskId = entry.getKey();
            Map<String, String> row = entry.getValue();
            String newStoryId = storyIdByLegacy.get(safe(row.get("Story Id")));
            if (newStoryId == null) {
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
            task.setLabels(List.of("imported", "resource-performance"));
            task.setIsPulledFromBacklog(Boolean.FALSE);
            int nextTaskNumber = taskNumberByStory.getOrDefault(newStoryId, 0) + 1;
            task.setTaskNumber(nextTaskNumber);
            taskNumberByStory.put(newStoryId, nextTaskNumber);

            taskIdByLegacy.put(legacyTaskId, newTaskId);
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
                continue;
            }
            BigDecimal hoursWorked = parseDecimalOrZero(row.get("Actual Hours"));
            if (hoursWorked.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }

            TimeEntry entry = new TimeEntry();
            entry.setId(idGenerationService.generateTimeEntryId());
            entry.setUserId(userId);
            entry.setProjectId(projectId);
            entry.setStoryId(storyIdByLegacy.get(safe(row.get("Story Id"))));
            entry.setTaskId(taskIdByLegacy.get(safe(row.get("Task/Issue Id"))));
            entry.setSubtaskId(null);
            entry.setDescription(firstNonBlank(row.get("Task/Issue Name"), row.get("Story Name"), "Imported time entry"));
            entry.setEntryType(mapEntryType(row.get("Work Category")));
            entry.setHoursWorked(hoursWorked);
            entry.setWorkDate(resolveWorkDate(row));
            entry.setStartTime(null);
            entry.setEndTime(null);
            entry.setIsBillable(Boolean.TRUE);
            timeEntries.add(entry);
        }
        return timeEntries;
    }

    private String resolveUserId(Map<String, String> row, Map<String, String> userIdByEmail) {
        String explicitUserId = safe(row.get("User ID"));
        if (!explicitUserId.isBlank()) {
            Optional<User> existing = userRepository.findById(explicitUserId);
            if (existing.isPresent()) {
                return explicitUserId;
            }
        }
        String email = toLower(row.get("Resource Email Id"));
        if (email.isBlank()) {
            return null;
        }
        return userIdByEmail.get(email);
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
        return LocalDate.now();
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
        try {
            return LocalDate.parse(v);
        } catch (DateTimeParseException ignored) {
        }
        try {
            return LocalDateTime.parse(v).toLocalDate();
        } catch (DateTimeParseException ignored) {
        }
        if (v.length() >= 10) {
            try {
                return LocalDate.parse(v.substring(0, 10));
            } catch (DateTimeParseException ignored) {
            }
        }
        return null;
    }

    private BigDecimal parseDecimal(String value) {
        String v = safe(value);
        if (v.isBlank()) {
            return null;
        }
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
}
