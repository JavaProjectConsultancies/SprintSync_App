package com.sprintsync.api.service;

import com.sprintsync.api.dto.*;
import com.sprintsync.api.entity.Project;
import com.sprintsync.api.repository.UserRepository;
import com.sprintsync.api.repository.DepartmentRepository;
import com.sprintsync.api.repository.ProjectTeamMemberRepository;
import com.sprintsync.api.repository.SprintRepository;
import com.sprintsync.api.repository.TaskRepository;
import com.sprintsync.api.repository.StoryRepository;
import com.sprintsync.api.entity.enums.SprintStatus;
import com.sprintsync.api.entity.enums.TaskStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service for mapping between Project entity and ProjectDto
 */
@Service
@SuppressWarnings("null")
public class ProjectMapper {

    private static final Logger logger = LoggerFactory.getLogger(ProjectMapper.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private ProjectTeamMemberRepository projectTeamMemberRepository;

    @Autowired
    private SprintRepository sprintRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private StoryRepository storyRepository;

    @Autowired
    private com.sprintsync.api.repository.MilestoneRepository milestoneRepository;

    @Autowired
    private com.sprintsync.api.repository.RequirementRepository requirementRepository;

    @Autowired
    private com.sprintsync.api.repository.StakeholderRepository stakeholderRepository;

    @Autowired
    private com.sprintsync.api.repository.RiskRepository riskRepository;

    @Autowired
    private com.sprintsync.api.repository.ProjectIntegrationRepository projectIntegrationRepository;

    @Autowired
    private com.sprintsync.api.repository.AvailableIntegrationRepository availableIntegrationRepository;

    @Autowired
    private com.sprintsync.api.repository.EpicRepository epicRepository;

    @Autowired
    private com.sprintsync.api.repository.ReleaseRepository releaseRepository;

    /**
     * Convert Project entity to ProjectDto
     */
    public ProjectDto toDto(Project project) {
        return toDto(project, true, true);
    }

    public ProjectDto toDto(Project project, boolean includeDetails) {
        return toDto(project, includeDetails, includeDetails);
    }

    public ProjectDto toDto(Project project, boolean includeDetails, boolean includeTeamMetrics) {
        if (project == null) {
            return null;
        }

        ProjectDto dto = new ProjectDto();
        
        // Keep ID as String to match database
        dto.setId(project.getId());
        
        // Basic fields
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus() != null ? project.getStatus().name().toLowerCase() : "planning");
        dto.setProgress(project.getProgressPercentage() != null ? project.getProgressPercentage() : 0);
        dto.setPriority(project.getPriority() != null ? project.getPriority().name().toLowerCase() : "medium");
        dto.setStartDate(project.getStartDate() != null ? project.getStartDate().toString() : "");
        dto.setEndDate(project.getEndDate() != null ? project.getEndDate().toString() : "");
        dto.setManagerId(project.getManagerId());
        dto.setScope(project.getScope());
        dto.setTemplate(project.getTemplate());
        dto.setProjectType(project.getProjectType());
        dto.setMethodology(project.getMethodology());
        dto.setSuccessCriteria(project.getSuccessCriteria());

        // Convert BigDecimal to String for frontend
        dto.setBudget(project.getBudget() != null ? project.getBudget().toString() : "0");
        dto.setSpent(project.getSpent() != null ? project.getSpent().toString() : "0");

        // Get department name instead of ID
        if (project.getDepartmentId() != null) {
            departmentRepository.findById(project.getDepartmentId())
                .ifPresent(dept -> dto.setDepartment(dept.getName()));
        }

        // Get team members and high-level metrics
        dto.setTeamMembers(getTeamMembers(project.getId(), includeTeamMetrics));
        dto.setSprints(getSprintCount(project.getId()));
        dto.setCompletedSprints(getCompletedSprintCount(project.getId()));
        dto.setTotalTasks(getTotalTaskCount(project.getId()));
        dto.setCompletedTasks(getCompletedTaskCount(project.getId()));

        if (includeDetails) {
            dto.setMilestones(getMilestones(project.getId()));
            dto.setRequirements(getRequirements(project.getId()));
            dto.setStakeholders(getStakeholders(project.getId()));
            dto.setRisks(getRisks(project.getId()));
            dto.setIntegrations(getIntegrations(project.getId()));
            dto.setEpics(getEpics(project.getId()));
            dto.setReleases(getReleases(project.getId()));
        } else {
            dto.setMilestones(Collections.emptyList());
            dto.setRequirements(Collections.emptyList());
            dto.setStakeholders(Collections.emptyList());
            dto.setRisks(Collections.emptyList());
            dto.setIntegrations(Collections.emptyList());
            dto.setEpics(Collections.emptyList());
            dto.setReleases(Collections.emptyList());
        }

        return dto;
    }

    /**
     * Convert ProjectDto to Project entity
     */
    public Project toEntity(ProjectDto dto) {
        if (dto == null) {
            return null;
        }

        Project project = new Project();
        
        // Note: ID conversion back to UUID would need to be handled differently
        // For now, we'll let the database generate the ID
        
        // Basic fields
        project.setName(dto.getName());
        project.setDescription(dto.getDescription());
        
        // Convert string status back to enum
        if (dto.getStatus() != null) {
            try {
                project.setStatus(com.sprintsync.api.entity.enums.ProjectStatus.valueOf(dto.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                project.setStatus(com.sprintsync.api.entity.enums.ProjectStatus.PLANNING);
            }
        }
        
        // Convert string priority back to enum
        if (dto.getPriority() != null) {
            try {
                project.setPriority(com.sprintsync.api.entity.enums.Priority.valueOf(dto.getPriority().toUpperCase()));
            } catch (IllegalArgumentException e) {
                project.setPriority(com.sprintsync.api.entity.enums.Priority.MEDIUM);
            }
        }
        
        project.setManagerId(dto.getManagerId());
        project.setScope(dto.getScope());
        project.setTemplate(dto.getTemplate());
        project.setMethodology(dto.getMethodology());
        project.setSuccessCriteria(dto.getSuccessCriteria());

        // Convert String back to BigDecimal
        if (dto.getBudget() != null && !dto.getBudget().isEmpty()) {
            try {
                project.setBudget(new java.math.BigDecimal(dto.getBudget()));
            } catch (NumberFormatException e) {
                project.setBudget(java.math.BigDecimal.ZERO);
            }
        }

        if (dto.getSpent() != null && !dto.getSpent().isEmpty()) {
            try {
                project.setSpent(new java.math.BigDecimal(dto.getSpent()));
            } catch (NumberFormatException e) {
                project.setSpent(java.math.BigDecimal.ZERO);
            }
        }

        // Convert dates
        if (dto.getStartDate() != null && !dto.getStartDate().isEmpty()) {
            try {
                project.setStartDate(java.time.LocalDate.parse(dto.getStartDate()));
            } catch (Exception e) {
                // Handle date parsing error
            }
        }

        if (dto.getEndDate() != null && !dto.getEndDate().isEmpty()) {
            try {
                project.setEndDate(java.time.LocalDate.parse(dto.getEndDate()));
            } catch (Exception e) {
                // Handle date parsing error
            }
        }

        // Set progress percentage
        project.setProgressPercentage(dto.getProgress() != null ? dto.getProgress() : 0);

        // Set department ID (would need to look up by name)
        if (dto.getDepartment() != null) {
            departmentRepository.findByNameIgnoreCase(dto.getDepartment())
                .ifPresent(dept -> project.setDepartmentId(dept.getId()));
        }

        return project;
    }


    /**
     * Get team members for a project
     */
    private List<TeamMemberDto> getTeamMembers(String projectId, boolean includeMetrics) {
        try {
            List<com.sprintsync.api.entity.ProjectTeamMember> assignments = projectTeamMemberRepository.findByProjectId(projectId);
            if (assignments == null || assignments.isEmpty()) {
                return Collections.emptyList();
            }

            List<String> userIds = assignments.stream()
                    .map(com.sprintsync.api.entity.ProjectTeamMember::getUserId)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.toList());

            if (userIds.isEmpty()) {
                return Collections.emptyList();
            }

            Map<String, com.sprintsync.api.entity.User> usersById = userRepository.findAllById(userIds).stream()
                    .collect(Collectors.toMap(com.sprintsync.api.entity.User::getId, user -> user));

            if (usersById.isEmpty()) {
                return Collections.emptyList();
            }

            Set<String> departmentIds = usersById.values().stream()
                    .map(com.sprintsync.api.entity.User::getDepartmentId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());

            Map<String, String> departmentNamesById = departmentIds.isEmpty()
                    ? Collections.emptyMap()
                    : departmentRepository.findAllById(departmentIds).stream()
                        .collect(Collectors.toMap(com.sprintsync.api.entity.Department::getId,
                                                  com.sprintsync.api.entity.Department::getName));

            List<TeamMemberDto> teamMembers = new ArrayList<>(assignments.size());

            for (com.sprintsync.api.entity.ProjectTeamMember assignment : assignments) {
                com.sprintsync.api.entity.User user = usersById.get(assignment.getUserId());
                if (user == null) {
                    continue;
                }

                TeamMemberDto dto = new TeamMemberDto();
                dto.setId(user.getId());
                dto.setName(user.getName());
                dto.setRole(assignment.getRole());
                dto.setIsTeamLead(assignment.getIsTeamLead());
                dto.setAvailability(assignment.getAllocationPercentage());

                if (user.getDepartmentId() != null) {
                    dto.setDepartment(departmentNamesById.get(user.getDepartmentId()));
                }

                dto.setExperience(user.getExperience() != null ? user.getExperience().getValue() : "mid");
                dto.setHourlyRate(user.getHourlyRate() != null ? user.getHourlyRate().doubleValue() : 0.0);
                dto.setAvatar(user.getAvatarUrl());
                dto.setSkills(parseSkills(user.getSkills()));

                if (includeMetrics) {
                    dto.setWorkload(calculateWorkload(user.getId()));
                    dto.setPerformance(calculatePerformance(user.getId()));
                }

                teamMembers.add(dto);
            }

            return teamMembers;
        } catch (Exception e) {
            logger.warn("Failed to load team members for project {}: {}", projectId, e.getMessage());
            return Collections.emptyList();
        }
    }

    private String[] parseSkills(String skillsJson) {
        if (skillsJson == null || skillsJson.trim().isEmpty()) {
            return new String[0];
        }

        try {
            String trimmed = skillsJson.trim();
            if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
                trimmed = trimmed.substring(1, trimmed.length() - 1);
                if (trimmed.isEmpty()) {
                    return new String[0];
                }

                String[] skills = trimmed.split(",");
                for (int i = 0; i < skills.length; i++) {
                    skills[i] = skills[i].trim().replaceAll("^\"|\"$", "");
                }
                return skills;
            }
        } catch (Exception ex) {
            logger.debug("Unable to parse skills JSON '{}': {}", skillsJson, ex.getMessage());
        }

        return new String[0];
    }

    /**
     * Get milestones for a project
     */
    private List<MilestoneDto> getMilestones(String projectId) {
        List<MilestoneDto> milestones = new ArrayList<>();
        
        try {
            milestoneRepository.findByProjectId(projectId).forEach(milestone -> {
                MilestoneDto dto = new MilestoneDto();
                dto.setId(milestone.getId());
                dto.setName(milestone.getTitle()); // Milestone entity uses 'title' field
                dto.setDescription(milestone.getDescription());
                dto.setDueDate(milestone.getDueDate());
                dto.setStatus(milestone.getStatus() != null ? milestone.getStatus() : "pending");
                dto.setProgress(milestone.getProgressPercentage() != null ? milestone.getProgressPercentage() : 0);
                dto.setPriority("medium"); // Milestone entity doesn't have priority field
                dto.setProjectId(milestone.getProjectId());
                
                milestones.add(dto);
            });
        } catch (Exception e) {
            System.err.println("Error fetching milestones for project " + projectId + ": " + e.getMessage());
        }
        
        return milestones;
    }

    /**
     * Calculate workload percentage based on assigned tasks
     */
    private Integer calculateWorkload(String userId) {
        try {
            // Get total tasks assigned to this user
            List<com.sprintsync.api.entity.Task> assignedTasks = taskRepository.findByAssigneeId(userId);
            
            if (assignedTasks.isEmpty()) {
                return 0; // No tasks assigned
            }
            
            // Calculate total estimated hours for assigned tasks
            double totalEstimatedHours = assignedTasks.stream()
                .mapToDouble(task -> task.getEstimatedHours() != null ? task.getEstimatedHours().doubleValue() : 0.0)
                .sum();
            
            // Assume 40 hours per week capacity
            // Calculate workload as percentage of capacity
            int weeklyCapacity = 40;
            int workloadPercentage = Math.min(100, (int) ((totalEstimatedHours * 100) / weeklyCapacity));
            
            return workloadPercentage;
            
        } catch (Exception e) {
            return 0; // Return 0 if calculation fails
        }
    }

    /**
     * Calculate performance score based on task completion rates
     */
    private Integer calculatePerformance(String userId) {
        try {
            // Get all tasks assigned to this user
            List<com.sprintsync.api.entity.Task> assignedTasks = taskRepository.findByAssigneeId(userId);
            
            if (assignedTasks.isEmpty()) {
                return 85; // Default performance if no tasks
            }
            
            // Count completed tasks
            long completedTasks = assignedTasks.stream()
                .filter(task -> "completed".equalsIgnoreCase(task.getStatus().getValue()))
                .count();
            
            // Calculate performance percentage
            int performancePercentage = (int) ((completedTasks * 100) / assignedTasks.size());
            
            // Ensure performance is between 0 and 100
            return Math.max(0, Math.min(100, performancePercentage));
            
        } catch (Exception e) {
            return 85; // Return default performance if calculation fails
        }
    }

    /**
     * Get sprint count for a project
     */
    private Integer getSprintCount(String projectId) {
        try {
            return (int) sprintRepository.countByProjectId(projectId);
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Get completed sprint count for a project
     */
    private Integer getCompletedSprintCount(String projectId) {
        try {
            return (int) sprintRepository.countByProjectIdAndStatus(projectId, SprintStatus.COMPLETED);
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Get total task count for a project
     */
    private Integer getTotalTaskCount(String projectId) {
        try {
            List<String> storyIds = storyRepository.findIdsByProjectId(projectId);
            if (storyIds == null || storyIds.isEmpty()) {
                return 0;
            }

            return (int) taskRepository.countByStoryIds(storyIds);
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Get completed task count for a project
     */
    private Integer getCompletedTaskCount(String projectId) {
        try {
            List<String> storyIds = storyRepository.findIdsByProjectId(projectId);
            if (storyIds == null || storyIds.isEmpty()) {
                return 0;
            }

            return (int) taskRepository.countByStoryIdsAndStatus(storyIds, TaskStatus.DONE);
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Get requirements for a project
     */
    private List<com.sprintsync.api.dto.RequirementDto> getRequirements(String projectId) {
        List<com.sprintsync.api.dto.RequirementDto> requirements = new ArrayList<>();

        try {
            requirementRepository.findByProjectId(projectId).forEach(requirement -> {
                com.sprintsync.api.dto.RequirementDto dto = new com.sprintsync.api.dto.RequirementDto();
                dto.setId(requirement.getId());
                dto.setProjectId(requirement.getProjectId());
                dto.setTitle(requirement.getTitle());
                dto.setDescription(requirement.getDescription());
                dto.setType(requirement.getType() != null ? requirement.getType().getValue() : "functional");
                dto.setStatus(requirement.getStatus() != null ? requirement.getStatus().getValue() : "draft");
                dto.setPriority(requirement.getPriority() != null ? requirement.getPriority().getValue() : "medium");
                dto.setModule(requirement.getModule());
                dto.setEffortPoints(requirement.getEffortPoints());

                // Parse acceptance criteria from JSON
                if (requirement.getAcceptanceCriteria() != null && !requirement.getAcceptanceCriteria().trim().isEmpty()) {
                    try {
                        String criteriaJson = requirement.getAcceptanceCriteria().trim();
                        if (criteriaJson.startsWith("[") && criteriaJson.endsWith("]")) {
                            criteriaJson = criteriaJson.substring(1, criteriaJson.length() - 1);
                            String[] criteria = criteriaJson.split(",");
                            for (int i = 0; i < criteria.length; i++) {
                                criteria[i] = criteria[i].trim().replaceAll("^\"|\"$", "");
                            }
                            dto.setAcceptanceCriteria(criteria);
                        }
                    } catch (Exception e) {
                        dto.setAcceptanceCriteria(new String[0]);
                    }
                } else {
                    dto.setAcceptanceCriteria(new String[0]);
                }

                dto.setCreatedAt(requirement.getCreatedAt() != null ? requirement.getCreatedAt().toString() : "");
                dto.setUpdatedAt(requirement.getUpdatedAt() != null ? requirement.getUpdatedAt().toString() : "");

                requirements.add(dto);
            });
        } catch (Exception e) {
            System.err.println("Error fetching requirements for project " + projectId + ": " + e.getMessage());
        }

        return requirements;
    }

    /**
     * Get stakeholders for a project
     */
    private List<com.sprintsync.api.dto.StakeholderDto> getStakeholders(String projectId) {
        List<com.sprintsync.api.dto.StakeholderDto> stakeholders = new ArrayList<>();

        try {
            stakeholderRepository.findByProjectId(projectId).forEach(stakeholder -> {
                com.sprintsync.api.dto.StakeholderDto dto = new com.sprintsync.api.dto.StakeholderDto();
                dto.setId(stakeholder.getId());
                dto.setProjectId(stakeholder.getProjectId());
                dto.setName(stakeholder.getName());
                dto.setRole(stakeholder.getRole());
                dto.setEmail(stakeholder.getEmail());
                dto.setAvatarUrl(stakeholder.getAvatarUrl());

                // Parse responsibilities from JSON
                if (stakeholder.getResponsibilities() != null && !stakeholder.getResponsibilities().trim().isEmpty()) {
                    try {
                        String respJson = stakeholder.getResponsibilities().trim();
                        if (respJson.startsWith("[") && respJson.endsWith("]")) {
                            respJson = respJson.substring(1, respJson.length() - 1);
                            String[] responsibilities = respJson.split(",");
                            for (int i = 0; i < responsibilities.length; i++) {
                                responsibilities[i] = responsibilities[i].trim().replaceAll("^\"|\"$", "");
                            }
                            dto.setResponsibilities(responsibilities);
                        }
                    } catch (Exception e) {
                        dto.setResponsibilities(new String[0]);
                    }
                } else {
                    dto.setResponsibilities(new String[0]);
                }

                dto.setCreatedAt(stakeholder.getCreatedAt() != null ? stakeholder.getCreatedAt().toString() : "");
                dto.setUpdatedAt(stakeholder.getUpdatedAt() != null ? stakeholder.getUpdatedAt().toString() : "");

                stakeholders.add(dto);
            });
        } catch (Exception e) {
            System.err.println("Error fetching stakeholders for project " + projectId + ": " + e.getMessage());
        }

        return stakeholders;
    }

    /**
     * Get risks for a project
     */
    private List<com.sprintsync.api.dto.RiskDto> getRisks(String projectId) {
        List<com.sprintsync.api.dto.RiskDto> risks = new ArrayList<>();

        try {
            riskRepository.findByProjectId(projectId).forEach(risk -> {
                com.sprintsync.api.dto.RiskDto dto = new com.sprintsync.api.dto.RiskDto();
                dto.setId(risk.getId());
                dto.setProjectId(risk.getProjectId());
                dto.setTitle(risk.getTitle());
                dto.setDescription(risk.getDescription());
                dto.setProbability(risk.getProbability() != null ? risk.getProbability().getValue() : "medium");
                dto.setImpact(risk.getImpact() != null ? risk.getImpact().getValue() : "medium");
                dto.setMitigation(risk.getMitigation());
                dto.setStatus(risk.getStatus() != null ? risk.getStatus().getValue() : "identified");
                dto.setOwner(risk.getOwnerId()); // Store owner ID, could be enhanced to get owner name
                dto.setCreatedAt(risk.getCreatedAt() != null ? risk.getCreatedAt().toString() : "");
                dto.setUpdatedAt(risk.getUpdatedAt() != null ? risk.getUpdatedAt().toString() : "");

                risks.add(dto);
            });
        } catch (Exception e) {
            System.err.println("Error fetching risks for project " + projectId + ": " + e.getMessage());
        }

        return risks;
    }

    /**
     * Get integrations for a project
     */
    private List<com.sprintsync.api.dto.IntegrationDto> getIntegrations(String projectId) {
        List<com.sprintsync.api.dto.IntegrationDto> integrations = new ArrayList<>();

        try {
            projectIntegrationRepository.findByProjectId(projectId).forEach(projectIntegration -> {
                // Get integration details from available integrations
                if (projectIntegration.getIntegrationId() != null) {
                    availableIntegrationRepository.findById(projectIntegration.getIntegrationId()).ifPresent(availableIntegration -> {
                        com.sprintsync.api.dto.IntegrationDto dto = new com.sprintsync.api.dto.IntegrationDto();
                        dto.setId(projectIntegration.getId());
                        dto.setProjectId(projectIntegration.getProjectId());
                        dto.setIntegrationId(projectIntegration.getIntegrationId());
                        dto.setName(availableIntegration.getName());
                        dto.setType(availableIntegration.getType() != null ? availableIntegration.getType().getValue() : "communication");
                        dto.setDescription(availableIntegration.getDescription());
                        dto.setIconUrl(availableIntegration.getIconUrl());
                        dto.setIsEnabled(projectIntegration.getIsEnabled());
                        dto.setConfiguration(projectIntegration.getConfiguration());
                        dto.setStatus(projectIntegration.getIsEnabled() ? "active" : "inactive");
                        dto.setCreatedAt(projectIntegration.getCreatedAt() != null ? projectIntegration.getCreatedAt().toString() : "");
                        dto.setUpdatedAt(projectIntegration.getUpdatedAt() != null ? projectIntegration.getUpdatedAt().toString() : "");

                        integrations.add(dto);
                    });
                }
            });
        } catch (Exception e) {
            System.err.println("Error fetching integrations for project " + projectId + ": " + e.getMessage());
        }

        return integrations;
    }

    /**
     * Get epics for a project
     */
    private List<com.sprintsync.api.dto.EpicDto> getEpics(String projectId) {
        List<com.sprintsync.api.dto.EpicDto> epics = new ArrayList<>();
        
        try {
            List<com.sprintsync.api.entity.Epic> epicEntities = epicRepository.findByProjectId(projectId);
            
            for (com.sprintsync.api.entity.Epic epic : epicEntities) {
                com.sprintsync.api.dto.EpicDto dto = new com.sprintsync.api.dto.EpicDto();
                dto.setId(epic.getId());
                dto.setProjectId(epic.getProjectId());
                dto.setTitle(epic.getTitle());
                dto.setDescription(epic.getDescription());
                dto.setSummary(epic.getSummary());
                dto.setTheme(epic.getTheme());
                dto.setBusinessValue(epic.getBusinessValue());
                dto.setPriority(epic.getPriority() != null ? epic.getPriority().getValue() : "medium");
                dto.setStatus(epic.getStatus() != null ? epic.getStatus().getValue() : "draft");
                dto.setProgress(epic.getProgress() != null ? epic.getProgress() : 0);
                dto.setStoryPoints(epic.getStoryPoints() != null ? epic.getStoryPoints() : 0);
                dto.setAssigneeId(epic.getAssigneeId());
                dto.setOwner(epic.getOwner());
                dto.setStartDate(epic.getStartDate() != null ? epic.getStartDate().toString() : "");
                dto.setEndDate(epic.getEndDate() != null ? epic.getEndDate().toString() : "");
                dto.setCreatedAt(epic.getCreatedAt() != null ? epic.getCreatedAt().toString() : "");
                dto.setUpdatedAt(epic.getUpdatedAt() != null ? epic.getUpdatedAt().toString() : "");
                
                epics.add(dto);
            }
        } catch (Exception e) {
            System.err.println("Error fetching epics for project " + projectId + ": " + e.getMessage());
        }

        return epics;
    }

    /**
     * Get releases for a project
     */
    private List<com.sprintsync.api.dto.ReleaseDto> getReleases(String projectId) {
        List<com.sprintsync.api.dto.ReleaseDto> releases = new ArrayList<>();
        
        try {
            List<com.sprintsync.api.entity.Release> releaseEntities = releaseRepository.findByProjectId(projectId);
            
            for (com.sprintsync.api.entity.Release release : releaseEntities) {
                com.sprintsync.api.dto.ReleaseDto dto = new com.sprintsync.api.dto.ReleaseDto();
                dto.setId(release.getId());
                dto.setProjectId(release.getProjectId());
                dto.setName(release.getName());
                dto.setDescription(release.getDescription());
                dto.setVersion(release.getVersion());
                dto.setStatus(release.getStatus() != null ? release.getStatus().getValue() : "planning");
                dto.setProgress(release.getProgress() != null ? release.getProgress() : 0);
                dto.setReleaseDate(release.getReleaseDate() != null ? release.getReleaseDate().toString() : "");
                dto.setTargetDate(release.getTargetDate() != null ? release.getTargetDate().toString() : "");
                dto.setCompletedAt(release.getCompletedAt() != null ? release.getCompletedAt().toString() : "");
                dto.setReleaseNotes(release.getReleaseNotes());
                dto.setRisks(release.getRisks());
                dto.setDependencies(release.getDependencies());
                dto.setCreatedBy(release.getCreatedBy());
                dto.setLinkedEpics(release.getLinkedEpics());
                dto.setLinkedStories(release.getLinkedStories());
                dto.setLinkedSprints(release.getLinkedSprints());
                dto.setCreatedAt(release.getCreatedAt() != null ? release.getCreatedAt().toString() : "");
                dto.setUpdatedAt(release.getUpdatedAt() != null ? release.getUpdatedAt().toString() : "");
                
                releases.add(dto);
            }
        } catch (Exception e) {
            System.err.println("Error fetching releases for project " + projectId + ": " + e.getMessage());
        }

        return releases;
    }

}






