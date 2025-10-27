package com.sprintsync.api.dto;

import java.util.List;

/**
 * DTO for Project data that matches frontend interface exactly
 */
public class ProjectDto {
    private String id; // Keep as String to match database
    private String name;
    private String description;
    private String status; // Frontend expects string, not enum
    private Integer progress; // Frontend expects number, not progressPercentage
    private String priority; // Frontend expects string, not enum
    private String startDate;
    private String endDate;
    private String managerId;
    private String department; // Frontend expects department name, not departmentId
    private List<TeamMemberDto> teamMembers;
    private Integer sprints;
    private Integer completedSprints;
    private Integer totalTasks;
    private Integer completedTasks;
    private String budget; // Frontend expects string, not BigDecimal
    private String spent; // Frontend expects string, not BigDecimal
    private String scope;
    private List<RequirementDto> requirements;
    private List<StakeholderDto> stakeholders;
    private List<RiskDto> risks;
    private List<IntegrationDto> integrations;
    private List<MilestoneDto> milestones;
<<<<<<< HEAD
    private List<EpicDto> epics;
    private List<ReleaseDto> releases;
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
    private String template;
    private String projectType;
    private String methodology;
    private List<String> successCriteria;

    // Constructors
    public ProjectDto() {}

    public ProjectDto(String id, String name, String description) {
        this.id = id;
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getManagerId() {
        return managerId;
    }

    public void setManagerId(String managerId) {
        this.managerId = managerId;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public List<TeamMemberDto> getTeamMembers() {
        return teamMembers;
    }

    public void setTeamMembers(List<TeamMemberDto> teamMembers) {
        this.teamMembers = teamMembers;
    }

    public Integer getSprints() {
        return sprints;
    }

    public void setSprints(Integer sprints) {
        this.sprints = sprints;
    }

    public Integer getCompletedSprints() {
        return completedSprints;
    }

    public void setCompletedSprints(Integer completedSprints) {
        this.completedSprints = completedSprints;
    }

    public Integer getTotalTasks() {
        return totalTasks;
    }

    public void setTotalTasks(Integer totalTasks) {
        this.totalTasks = totalTasks;
    }

    public Integer getCompletedTasks() {
        return completedTasks;
    }

    public void setCompletedTasks(Integer completedTasks) {
        this.completedTasks = completedTasks;
    }

    public String getBudget() {
        return budget;
    }

    public void setBudget(String budget) {
        this.budget = budget;
    }

    public String getSpent() {
        return spent;
    }

    public void setSpent(String spent) {
        this.spent = spent;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public List<RequirementDto> getRequirements() {
        return requirements;
    }

    public void setRequirements(List<RequirementDto> requirements) {
        this.requirements = requirements;
    }

    public List<StakeholderDto> getStakeholders() {
        return stakeholders;
    }

    public void setStakeholders(List<StakeholderDto> stakeholders) {
        this.stakeholders = stakeholders;
    }

    public List<RiskDto> getRisks() {
        return risks;
    }

    public void setRisks(List<RiskDto> risks) {
        this.risks = risks;
    }

    public List<IntegrationDto> getIntegrations() {
        return integrations;
    }

    public void setIntegrations(List<IntegrationDto> integrations) {
        this.integrations = integrations;
    }

    public List<MilestoneDto> getMilestones() {
        return milestones;
    }

    public void setMilestones(List<MilestoneDto> milestones) {
        this.milestones = milestones;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public String getMethodology() {
        return methodology;
    }

    public void setMethodology(String methodology) {
        this.methodology = methodology;
    }

    public List<String> getSuccessCriteria() {
        return successCriteria;
    }

    public void setSuccessCriteria(List<String> successCriteria) {
        this.successCriteria = successCriteria;
    }
<<<<<<< HEAD

    public List<EpicDto> getEpics() {
        return epics;
    }

    public void setEpics(List<EpicDto> epics) {
        this.epics = epics;
    }

    public List<ReleaseDto> getReleases() {
        return releases;
    }

    public void setReleases(List<ReleaseDto> releases) {
        this.releases = releases;
    }
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
}
