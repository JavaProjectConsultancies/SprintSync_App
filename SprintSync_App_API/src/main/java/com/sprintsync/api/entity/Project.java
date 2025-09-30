package com.sprintsync.api.entity;

import com.sprintsync.api.entity.enums.Priority;
import com.sprintsync.api.entity.enums.ProjectStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Project entity representing projects in the SprintSync application.
 * Maps to the 'projects' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "projects")
public class Project extends BaseEntity {

    @NotBlank(message = "Project name cannot be blank")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Project status cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ProjectStatus status;

    @NotNull(message = "Project priority cannot be null")
    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false)
    private Priority priority;

    @Column(name = "methodology")
    private String methodology; // e.g., scrum, kanban, waterfall

    @Column(name = "template")
    private String template; // e.g., web-app, mobile-app, api-service

    @Column(name = "department_id")
    private String departmentId;

    @NotNull(message = "Project manager cannot be null")
    @Column(name = "manager_id", nullable = false)
    private String managerId;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "budget", precision = 15, scale = 2)
    private BigDecimal budget;

    @Column(name = "spent", precision = 15, scale = 2)
    private BigDecimal spent;

    @Min(value = 0, message = "Progress percentage cannot be less than 0")
    @Max(value = 100, message = "Progress percentage cannot be more than 100")
    @Column(name = "progress_percentage")
    private Integer progressPercentage = 0;

    @Column(name = "scope", columnDefinition = "TEXT")
    private String scope;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "success_criteria", columnDefinition = "jsonb")
    private List<String> successCriteria;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "objectives", columnDefinition = "jsonb")
    private List<String> objectives;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Constructors
    public Project() {}

    public Project(String name, String description, ProjectStatus status, Priority priority, String managerId) {
        this.name = name;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.managerId = managerId;
    }

    // Getters and Setters
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

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public Priority getPriority() {
        return priority;
    }

    public void setPriority(Priority priority) {
        this.priority = priority;
    }

    public String getMethodology() {
        return methodology;
    }

    public void setMethodology(String methodology) {
        this.methodology = methodology;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getManagerId() {
        return managerId;
    }

    public void setManagerId(String managerId) {
        this.managerId = managerId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public BigDecimal getSpent() {
        return spent;
    }

    public void setSpent(BigDecimal spent) {
        this.spent = spent;
    }

    public Integer getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Integer progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public String getScope() {
        return scope;
    }

    public void setScope(String scope) {
        this.scope = scope;
    }

    public List<String> getSuccessCriteria() {
        return successCriteria;
    }

    public void setSuccessCriteria(List<String> successCriteria) {
        this.successCriteria = successCriteria;
    }

    public List<String> getObjectives() {
        return objectives;
    }

    public void setObjectives(List<String> objectives) {
        this.objectives = objectives;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}