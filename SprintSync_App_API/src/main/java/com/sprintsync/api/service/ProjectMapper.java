package com.sprintsync.api.service;

import com.sprintsync.api.dto.*;
import com.sprintsync.api.entity.Project;
import com.sprintsync.api.repository.UserRepository;
import com.sprintsync.api.repository.DepartmentRepository;
import com.sprintsync.api.repository.ProjectTeamMemberRepository;
import com.sprintsync.api.repository.SprintRepository;
import com.sprintsync.api.repository.TaskRepository;
import com.sprintsync.api.repository.StoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Service for mapping between Project entity and ProjectDto
 */
@Service
public class ProjectMapper {

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

    /**
     * Convert Project entity to ProjectDto
     */
    public ProjectDto toDto(Project project) {
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

        // Get team members
        dto.setTeamMembers(getTeamMembers(project.getId()));

        // Get sprint counts
        dto.setSprints(getSprintCount(project.getId()));
        dto.setCompletedSprints(getCompletedSprintCount(project.getId()));

        // Set task counts
        dto.setTotalTasks(getTotalTaskCount(project.getId()));
        dto.setCompletedTasks(getCompletedTaskCount(project.getId()));

               // Get real milestones data
               dto.setMilestones(getMilestones(project.getId()));

               // Get real project detail data
               dto.setRequirements(getRequirements(project.getId()));
               dto.setStakeholders(getStakeholders(project.getId()));
               dto.setRisks(getRisks(project.getId()));
               dto.setIntegrations(getIntegrations(project.getId()));

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
    private List<TeamMemberDto> getTeamMembers(String projectId) {
        final List<TeamMemberDto> teamMembers = new ArrayList<>();
        
        try {
            System.out.println("DEBUG: Fetching team members for project: " + projectId);
            
            // Get team members from repository
            List<com.sprintsync.api.entity.ProjectTeamMember> projectTeamMembers = 
                projectTeamMemberRepository.findByProjectId(projectId);
            
            projectTeamMembers.forEach(teamMember -> {
                userRepository.findById(teamMember.getUserId()).ifPresent(user -> {
                    TeamMemberDto dto = new TeamMemberDto();
                    dto.setId(user.getId());
                    dto.setName(user.getName());
                    dto.setRole(teamMember.getRole());
                    dto.setIsTeamLead(teamMember.getIsTeamLead());
                    dto.setAvailability(teamMember.getAllocationPercentage());
                    
                    // Get department name
                    if (user.getDepartmentId() != null) {
                        departmentRepository.findById(user.getDepartmentId())
                            .ifPresent(dept -> dto.setDepartment(dept.getName()));
                    }
                    
                    // Calculate real workload based on task assignments
                    dto.setWorkload(calculateWorkload(user.getId()));
                    
                    // Calculate real performance based on task completion rates
                    dto.setPerformance(calculatePerformance(user.getId()));
                    
                    // Set additional user data
                    dto.setExperience(user.getExperience() != null ? user.getExperience().getValue() : "mid");
                    dto.setHourlyRate(user.getHourlyRate() != null ? user.getHourlyRate().doubleValue() : 0.0);
                    dto.setAvatar(user.getAvatarUrl());
                    
                    // Set skills - parse JSON string to String array
                    if (user.getSkills() != null && !user.getSkills().trim().isEmpty()) {
                        try {
                            // Parse JSON array string to String array
                            String skillsJson = user.getSkills().trim();
                            if (skillsJson.startsWith("[") && skillsJson.endsWith("]")) {
                                // Remove brackets and split by comma
                                skillsJson = skillsJson.substring(1, skillsJson.length() - 1);
                                String[] skills = skillsJson.split(",");
                                // Clean up each skill (remove quotes and trim)
                                for (int i = 0; i < skills.length; i++) {
                                    skills[i] = skills[i].trim().replaceAll("^\"|\"$", "");
                                }
                                dto.setSkills(skills);
                            }
                        } catch (Exception e) {
                            System.err.println("Error parsing skills for user " + user.getId() + ": " + e.getMessage());
                            dto.setSkills(new String[0]); // Set empty array if parsing fails
                        }
                    } else {
                        dto.setSkills(new String[0]); // Set empty array if no skills
                    }
                    
                    teamMembers.add(dto);
                });
            });
            
        } catch (Exception e) {
            System.err.println("DEBUG: Error fetching team members: " + e.getMessage());
            e.printStackTrace();
        }
        
        return teamMembers;
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
            // Count completed sprints by project ID
            return (int) sprintRepository.findByProjectId(projectId).stream()
                .filter(sprint -> "completed".equalsIgnoreCase(sprint.getStatus().getValue()))
                .count();
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Get total task count for a project
     */
    private Integer getTotalTaskCount(String projectId) {
        try {
            // Get all stories for this project
            List<com.sprintsync.api.entity.Story> stories = storyRepository.findByProjectId(projectId);
            
            // Count all tasks across all stories
            int totalTasks = 0;
            for (com.sprintsync.api.entity.Story story : stories) {
                totalTasks += taskRepository.countByStoryId(story.getId());
            }
            
            return totalTasks;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Get completed task count for a project
     */
    private Integer getCompletedTaskCount(String projectId) {
        try {
            // Get all stories for this project
            List<com.sprintsync.api.entity.Story> stories = storyRepository.findByProjectId(projectId);
            
            // Count completed tasks across all stories
            int completedTasks = 0;
            for (com.sprintsync.api.entity.Story story : stories) {
                List<com.sprintsync.api.entity.Task> tasks = taskRepository.findByStoryId(story.getId());
                for (com.sprintsync.api.entity.Task task : tasks) {
                    if ("DONE".equalsIgnoreCase(task.getStatus().name())) {
                        completedTasks++;
                    }
                }
            }
            
            return completedTasks;
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

}
