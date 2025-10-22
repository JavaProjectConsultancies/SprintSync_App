package com.sprintsync.api.dto;

import com.sprintsync.api.entity.Project;
import com.sprintsync.api.entity.Requirement;
import com.sprintsync.api.entity.Risk;
import com.sprintsync.api.entity.Stakeholder;
import com.sprintsync.api.entity.ProjectTeamMember;
import com.sprintsync.api.entity.Epic;
import com.sprintsync.api.entity.Release;

import java.util.List;

/**
 * DTO for the response when creating a project with all related entities.
 */
public class CreateProjectResponse {
    
    private boolean success;
    private String message;
    private Project project;
    private List<Requirement> requirements;
    private List<Risk> risks;
    private List<Stakeholder> stakeholders;
    private List<ProjectTeamMember> teamMembers;
    private List<Epic> epics;
    private List<Release> releases;
    private int totalEntitiesCreated;

    // Constructors
    public CreateProjectResponse() {}

    public CreateProjectResponse(boolean success, String message, Project project) {
        this.success = success;
        this.message = message;
        this.project = project;
    }

    // Getters and setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public List<Requirement> getRequirements() { return requirements; }
    public void setRequirements(List<Requirement> requirements) { this.requirements = requirements; }
    public List<Risk> getRisks() { return risks; }
    public void setRisks(List<Risk> risks) { this.risks = risks; }
    public List<Stakeholder> getStakeholders() { return stakeholders; }
    public void setStakeholders(List<Stakeholder> stakeholders) { this.stakeholders = stakeholders; }
    public List<ProjectTeamMember> getTeamMembers() { return teamMembers; }
    public void setTeamMembers(List<ProjectTeamMember> teamMembers) { this.teamMembers = teamMembers; }
    public List<Epic> getEpics() { return epics; }
    public void setEpics(List<Epic> epics) { this.epics = epics; }
    public List<Release> getReleases() { return releases; }
    public void setReleases(List<Release> releases) { this.releases = releases; }
    public int getTotalEntitiesCreated() { return totalEntitiesCreated; }
    public void setTotalEntitiesCreated(int totalEntitiesCreated) { this.totalEntitiesCreated = totalEntitiesCreated; }
}
