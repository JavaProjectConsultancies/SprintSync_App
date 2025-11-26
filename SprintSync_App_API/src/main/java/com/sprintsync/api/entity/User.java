package com.sprintsync.api.entity;

import com.sprintsync.api.entity.enums.UserRole;
import com.sprintsync.api.entity.enums.ExperienceLevel;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.sprintsync.api.entity.converter.ExperienceLevelConverter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * User entity representing users in the SprintSync application.
 * Maps to the 'users' table in the database.
 * 
 * @author Mayuresh G
 */
@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @NotBlank
    @Email
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @NotBlank
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "role", nullable = false, columnDefinition = "user_role")
    @NotNull
    private UserRole role;

    @Column(name = "department_id")
    private String departmentId;

    @Column(name = "domain_id")
    private String domainId;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Convert(converter = ExperienceLevelConverter.class)
    @Column(name = "experience")
    private ExperienceLevel experience;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    private BigDecimal hourlyRate;

    @Column(name = "ctc", precision = 15, scale = 2)
    private BigDecimal ctc;

    @Column(name = "availability_percentage")
    private Integer availabilityPercentage;

    @Column(name = "skills", columnDefinition = "jsonb")
    private String skills;

    @Column(name = "reporting_manager", length = 100)
    private String reportingManager;

    @Column(name = "date_of_joining")
    private LocalDate dateOfJoining;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    // Constructors
    public User() {}

    public User(String email, String passwordHash, String name, UserRole role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        this.role = role;
    }

    // Getters and Setters
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @JsonIgnore
    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public String getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(String departmentId) {
        this.departmentId = departmentId;
    }

    public String getDomainId() {
        return domainId;
    }

    public void setDomainId(String domainId) {
        this.domainId = domainId;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public ExperienceLevel getExperience() {
        return experience;
    }

    public void setExperience(ExperienceLevel experience) {
        this.experience = experience;
    }

    public BigDecimal getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(BigDecimal hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public BigDecimal getCtc() {
        return ctc;
    }

    public void setCtc(BigDecimal ctc) {
        this.ctc = ctc;
    }

    public Integer getAvailabilityPercentage() {
        return availabilityPercentage;
    }

    public void setAvailabilityPercentage(Integer availabilityPercentage) {
        this.availabilityPercentage = availabilityPercentage;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getReportingManager() {
        return reportingManager;
    }

    public void setReportingManager(String reportingManager) {
        this.reportingManager = reportingManager;
    }

    public LocalDate getDateOfJoining() {
        return dateOfJoining;
    }

    public void setDateOfJoining(LocalDate dateOfJoining) {
        this.dateOfJoining = dateOfJoining;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }
}
