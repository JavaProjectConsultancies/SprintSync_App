package com.sprintsync.api.dto;

import java.util.List;

/**
 * DTO for user's project roles across all projects
 */
public class UserProjectRolesDTO {
    private String userId;
    private List<ProjectRoleDTO> projectRoles;
    private List<String> availableRoles; // unique roles: ["developer", "manager"]

    // Constructors
    public UserProjectRolesDTO() {
    }

    public UserProjectRolesDTO(String userId, List<ProjectRoleDTO> projectRoles, List<String> availableRoles) {
        this.userId = userId;
        this.projectRoles = projectRoles;
        this.availableRoles = availableRoles;
    }

    // Getters and Setters
    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<ProjectRoleDTO> getProjectRoles() {
        return projectRoles;
    }

    public void setProjectRoles(List<ProjectRoleDTO> projectRoles) {
        this.projectRoles = projectRoles;
    }

    public List<String> getAvailableRoles() {
        return availableRoles;
    }

    public void setAvailableRoles(List<String> availableRoles) {
        this.availableRoles = availableRoles;
    }

    /**
     * Nested DTO for individual project role
     */
    public static class ProjectRoleDTO {
        private String projectId;
        private String projectName;
        private String role;

        // Constructors
        public ProjectRoleDTO() {
        }

        public ProjectRoleDTO(String projectId, String projectName, String role) {
            this.projectId = projectId;
            this.projectName = projectName;
            this.role = role;
        }

        // Getters and Setters
        public String getProjectId() {
            return projectId;
        }

        public void setProjectId(String projectId) {
            this.projectId = projectId;
        }

        public String getProjectName() {
            return projectName;
        }

        public void setProjectName(String projectName) {
            this.projectName = projectName;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }
}
