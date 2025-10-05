package com.sprintsync.api.dto;

/**
 * DTO for TeamMember data that matches frontend interface
 */
public class TeamMemberDto {
    private String id;
    private String name;
    private String role;
    private String[] skills;
    private Integer availability; // percentage
    private String department;
    private String experience; // 'junior' | 'mid' | 'senior' | 'lead'
    private Double hourlyRate;
    private String avatar;
    private Boolean isTeamLead;
    private Integer workload; // percentage of current workload
    private Integer performance; // performance score out of 100

    // Constructors
    public TeamMemberDto() {}

    public TeamMemberDto(String id, String name, String role) {
        this.id = id;
        this.name = name;
        this.role = role;
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

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String[] getSkills() {
        return skills;
    }

    public void setSkills(String[] skills) {
        this.skills = skills;
    }

    public Integer getAvailability() {
        return availability;
    }

    public void setAvailability(Integer availability) {
        this.availability = availability;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public Double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(Double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Boolean getIsTeamLead() {
        return isTeamLead;
    }

    public void setIsTeamLead(Boolean isTeamLead) {
        this.isTeamLead = isTeamLead;
    }

    public Integer getWorkload() {
        return workload;
    }

    public void setWorkload(Integer workload) {
        this.workload = workload;
    }

    public Integer getPerformance() {
        return performance;
    }

    public void setPerformance(Integer performance) {
        this.performance = performance;
    }
}
