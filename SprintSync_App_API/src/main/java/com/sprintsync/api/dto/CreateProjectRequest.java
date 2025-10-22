package com.sprintsync.api.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for creating a project with all related entities in a single request.
 */
public class CreateProjectRequest {

    // Project basic info
    @NotBlank(message = "Project name is required")
    private String name;
    
    private String description;
    
    @NotNull(message = "Project status is required")
    private String status;
    
    private Integer progress = 0;
    
    @NotNull(message = "Project priority is required")
    private String priority;
    
    private LocalDate startDate;
    
    private LocalDate endDate;
    
    @NotBlank(message = "Project manager is required")
    private String managerId;
    
    private String departmentId;
    
    private String domainId;
    
    private String scope;
    
    private String projectType;
    
    private String template;
    
    private String methodology;
    
    private String budget;
    
    private String spent;

    // Related entities
    private List<RequirementDto> requirements;
    private List<RiskDto> risks;
    private List<StakeholderDto> stakeholders;
    private List<TeamMemberDto> teamMembers;
    private List<EpicDto> epics;
    private List<ReleaseDto> releases;
    private List<String> successCriteria;
    private List<String> objectives;

    // Nested DTOs for related entities
    public static class RequirementDto {
        private String title;
        private String description;
        private String type;
        private String status;
        private String priority;
        private String module;
        private String acceptanceCriteria;
        private Integer effortPoints;

        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getModule() { return module; }
        public void setModule(String module) { this.module = module; }
        public String getAcceptanceCriteria() { return acceptanceCriteria; }
        public void setAcceptanceCriteria(String acceptanceCriteria) { this.acceptanceCriteria = acceptanceCriteria; }
        public Integer getEffortPoints() { return effortPoints; }
        public void setEffortPoints(Integer effortPoints) { this.effortPoints = effortPoints; }
    }

    public static class RiskDto {
        private String title;
        private String description;
        private String probability;
        private String impact;
        private String mitigation;
        private String status;
        private String owner;

        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getProbability() { return probability; }
        public void setProbability(String probability) { this.probability = probability; }
        public String getImpact() { return impact; }
        public void setImpact(String impact) { this.impact = impact; }
        public String getMitigation() { return mitigation; }
        public void setMitigation(String mitigation) { this.mitigation = mitigation; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getOwner() { return owner; }
        public void setOwner(String owner) { this.owner = owner; }
    }

    public static class StakeholderDto {
        private String name;
        private String role;
        private String email;
        private String responsibilities;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getResponsibilities() { return responsibilities; }
        public void setResponsibilities(String responsibilities) { this.responsibilities = responsibilities; }
    }

    public static class TeamMemberDto {
        private String userId;
        private String role;
        private Boolean isTeamLead;
        private Integer allocatedHours;
        private String startDate;
        private String endDate;

        // Getters and setters
        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public Boolean getIsTeamLead() { return isTeamLead; }
        public void setIsTeamLead(Boolean isTeamLead) { this.isTeamLead = isTeamLead; }
        public Integer getAllocatedHours() { return allocatedHours; }
        public void setAllocatedHours(Integer allocatedHours) { this.allocatedHours = allocatedHours; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
    }

    public static class EpicDto {
        private String title;
        private String description;
        private String summary;
        private String theme;
        private String businessValue;
        private String priority;
        private String status;
        private String startDate;
        private String endDate;
        private String assigneeId;
        private String owner;
        private Integer progress;
        private Integer storyPoints;

        // Getters and setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
        public String getTheme() { return theme; }
        public void setTheme(String theme) { this.theme = theme; }
        public String getBusinessValue() { return businessValue; }
        public void setBusinessValue(String businessValue) { this.businessValue = businessValue; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }
        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }
        public String getAssigneeId() { return assigneeId; }
        public void setAssigneeId(String assigneeId) { this.assigneeId = assigneeId; }
        public String getOwner() { return owner; }
        public void setOwner(String owner) { this.owner = owner; }
        public Integer getProgress() { return progress; }
        public void setProgress(Integer progress) { this.progress = progress; }
        public Integer getStoryPoints() { return storyPoints; }
        public void setStoryPoints(Integer storyPoints) { this.storyPoints = storyPoints; }
    }

    public static class ReleaseDto {
        private String name;
        private String description;
        private String version;
        private String status;
        private String releaseDate;
        private String targetDate;
        private String releaseNotes;
        private String risks;
        private String dependencies;
        private String createdBy;
        private Integer progress;
        private String linkedEpics;
        private String linkedStories;
        private String linkedSprints;
        private String completedAt;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getReleaseDate() { return releaseDate; }
        public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }
        public String getTargetDate() { return targetDate; }
        public void setTargetDate(String targetDate) { this.targetDate = targetDate; }
        public String getReleaseNotes() { return releaseNotes; }
        public void setReleaseNotes(String releaseNotes) { this.releaseNotes = releaseNotes; }
        public String getRisks() { return risks; }
        public void setRisks(String risks) { this.risks = risks; }
        public String getDependencies() { return dependencies; }
        public void setDependencies(String dependencies) { this.dependencies = dependencies; }
        public String getCreatedBy() { return createdBy; }
        public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
        public Integer getProgress() { return progress; }
        public void setProgress(Integer progress) { this.progress = progress; }
        public String getLinkedEpics() { return linkedEpics; }
        public void setLinkedEpics(String linkedEpics) { this.linkedEpics = linkedEpics; }
        public String getLinkedStories() { return linkedStories; }
        public void setLinkedStories(String linkedStories) { this.linkedStories = linkedStories; }
        public String getLinkedSprints() { return linkedSprints; }
        public void setLinkedSprints(String linkedSprints) { this.linkedSprints = linkedSprints; }
        public String getCompletedAt() { return completedAt; }
        public void setCompletedAt(String completedAt) { this.completedAt = completedAt; }
    }

    // Main class getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getManagerId() { return managerId; }
    public void setManagerId(String managerId) { this.managerId = managerId; }
    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    public String getDomainId() { return domainId; }
    public void setDomainId(String domainId) { this.domainId = domainId; }
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    public String getProjectType() { return projectType; }
    public void setProjectType(String projectType) { this.projectType = projectType; }
    public String getTemplate() { return template; }
    public void setTemplate(String template) { this.template = template; }
    public String getMethodology() { return methodology; }
    public void setMethodology(String methodology) { this.methodology = methodology; }
    public String getBudget() { return budget; }
    public void setBudget(String budget) { this.budget = budget; }
    public String getSpent() { return spent; }
    public void setSpent(String spent) { this.spent = spent; }
    public List<RequirementDto> getRequirements() { return requirements; }
    public void setRequirements(List<RequirementDto> requirements) { this.requirements = requirements; }
    public List<RiskDto> getRisks() { return risks; }
    public void setRisks(List<RiskDto> risks) { this.risks = risks; }
    public List<StakeholderDto> getStakeholders() { return stakeholders; }
    public void setStakeholders(List<StakeholderDto> stakeholders) { this.stakeholders = stakeholders; }
    public List<TeamMemberDto> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<TeamMemberDto> teamMembers) { this.teamMembers = teamMembers; }
    public List<EpicDto> getEpics() { return epics; }
    public void setEpics(List<EpicDto> epics) { this.epics = epics; }
    public List<ReleaseDto> getReleases() { return releases; }
    public void setReleases(List<ReleaseDto> releases) { this.releases = releases; }
    public List<String> getSuccessCriteria() { return successCriteria; }
    public void setSuccessCriteria(List<String> successCriteria) { this.successCriteria = successCriteria; }
    public List<String> getObjectives() { return objectives; }
    public void setObjectives(List<String> objectives) { this.objectives = objectives; }
}
