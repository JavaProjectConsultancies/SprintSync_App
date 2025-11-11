package com.sprintsync.api.controller;

import com.sprintsync.api.dto.TeamMemberDto;
import com.sprintsync.api.entity.ProjectTeamMember;
import com.sprintsync.api.repository.ProjectTeamMemberRepository;
import com.sprintsync.api.service.ProjectService;
import com.sprintsync.api.entity.Project;
import com.sprintsync.api.repository.UserRepository;
import com.sprintsync.api.repository.DepartmentRepository;
import com.sprintsync.api.service.IdGenerationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST Controller for Project Team Member operations
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/project-team-members")
@CrossOrigin(origins = "*")
public class ProjectTeamMemberController {

    @Autowired
    private ProjectTeamMemberRepository projectTeamMemberRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private IdGenerationService idGenerationService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private com.sprintsync.api.service.NotificationService notificationService;

    /**
     * Get all project team members
     */
    @GetMapping
    public ResponseEntity<?> getAllProjectTeamMembers() {
        try {
            List<TeamMemberDto> teamMembers = new ArrayList<>();
            
            for (ProjectTeamMember teamMember : projectTeamMemberRepository.findAll()) {
                try {
                    if (teamMember.getUserId() == null || teamMember.getUserId().trim().isEmpty()) {
                        // Skip team members with invalid user IDs
                        continue;
                    }
                    
                    userRepository.findById(teamMember.getUserId()).ifPresent(user -> {
                        try {
                            TeamMemberDto dto = new TeamMemberDto();
                            dto.setId(user.getId() != null ? user.getId() : "");
                            dto.setName(user.getName() != null ? user.getName() : "Unknown User");
                            dto.setRole(teamMember.getRole() != null ? teamMember.getRole() : "developer");
                            dto.setIsTeamLead(teamMember.getIsTeamLead() != null ? teamMember.getIsTeamLead() : false);
                            dto.setAvailability(teamMember.getAllocationPercentage() != null ? teamMember.getAllocationPercentage() : 100);
                            
                            // Set additional user fields with null checks
                            dto.setHourlyRate(user.getHourlyRate() != null ? user.getHourlyRate().doubleValue() : 0.0);
                            dto.setExperience(user.getExperience() != null ? user.getExperience().name() : "mid");
                            dto.setAvatar(user.getAvatarUrl());
                            
                            // Set default values for missing fields
                            dto.setWorkload(0); // Default workload
                            dto.setPerformance(85); // Default performance
                            
                            // Set skills from user (skills is stored as JSON string)
                            if (user.getSkills() != null && !user.getSkills().trim().isEmpty()) {
                                try {
                                    // Parse JSON string to array (simple approach for now)
                                    String skillsJson = user.getSkills().trim();
                                    if (skillsJson.startsWith("[") && skillsJson.endsWith("]")) {
                                        // Remove brackets and split by comma
                                        String skillsStr = skillsJson.substring(1, skillsJson.length() - 1);
                                        String[] skillsArray = skillsStr.split(",");
                                        // Clean up quotes and whitespace
                                        for (int i = 0; i < skillsArray.length; i++) {
                                            skillsArray[i] = skillsArray[i].trim().replaceAll("^\"|\"$", "");
                                        }
                                        dto.setSkills(skillsArray);
                                    } else {
                                        dto.setSkills(new String[]{skillsJson});
                                    }
                                } catch (Exception e) {
                                    dto.setSkills(new String[]{"General"});
                                }
                            } else {
                                dto.setSkills(new String[]{"General"}); // Default skill
                            }
                            
                            // Get department name with null checks
                            if (user.getDepartmentId() != null && !user.getDepartmentId().trim().isEmpty()) {
                                try {
                                    departmentRepository.findById(user.getDepartmentId())
                                        .ifPresent(dept -> {
                                            if (dept.getName() != null) {
                                                dto.setDepartment(dept.getName());
                                            } else {
                                                dto.setDepartment("Unassigned");
                                            }
                                        });
                                    if (dto.getDepartment() == null) {
                                        dto.setDepartment("Unassigned");
                                    }
                                } catch (Exception e) {
                                    dto.setDepartment("Unassigned");
                                }
                            } else {
                                dto.setDepartment("Unassigned");
                            }
                            
                            teamMembers.add(dto);
                        } catch (Exception e) {
                            // Log error but continue processing other team members
                            System.err.println("Error processing team member: " + e.getMessage());
                            e.printStackTrace();
                        }
                    });
                } catch (Exception e) {
                    // Log error but continue processing other team members
                    System.err.println("Error processing team member entry: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            return ResponseEntity.ok(teamMembers);
        } catch (Exception e) {
            System.err.println("Error fetching all team members: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error fetching team members: " + e.getMessage()
            ));
        }
    }

    /**
     * Get team members by project ID
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getTeamMembersByProject(@PathVariable String projectId) {
        try {
            List<TeamMemberDto> teamMembers = new ArrayList<>();
            
            if (projectId == null || projectId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Project ID cannot be empty"
                ));
            }
            
            List<ProjectTeamMember> projectTeamMembers = projectTeamMemberRepository.findByProjectId(projectId);
            
            for (ProjectTeamMember teamMember : projectTeamMembers) {
                try {
                    if (teamMember.getUserId() == null || teamMember.getUserId().trim().isEmpty()) {
                        // Skip team members with invalid user IDs
                        continue;
                    }
                    
                    userRepository.findById(teamMember.getUserId()).ifPresent(user -> {
                        try {
                            TeamMemberDto dto = new TeamMemberDto();
                            dto.setId(user.getId() != null ? user.getId() : "");
                            dto.setName(user.getName() != null ? user.getName() : "Unknown User");
                            dto.setRole(teamMember.getRole() != null ? teamMember.getRole() : "developer");
                            dto.setIsTeamLead(teamMember.getIsTeamLead() != null ? teamMember.getIsTeamLead() : false);
                            dto.setAvailability(teamMember.getAllocationPercentage() != null ? teamMember.getAllocationPercentage() : 100);
                            
                            // Set additional user fields with null checks
                            dto.setHourlyRate(user.getHourlyRate() != null ? user.getHourlyRate().doubleValue() : 0.0);
                            dto.setExperience(user.getExperience() != null ? user.getExperience().name() : "mid");
                            dto.setAvatar(user.getAvatarUrl());
                            
                            // Set default values for missing fields
                            dto.setWorkload(0); // Default workload
                            dto.setPerformance(85); // Default performance
                            
                            // Set skills from user (skills is stored as JSON string)
                            if (user.getSkills() != null && !user.getSkills().trim().isEmpty()) {
                                try {
                                    // Parse JSON string to array (simple approach for now)
                                    String skillsJson = user.getSkills().trim();
                                    if (skillsJson.startsWith("[") && skillsJson.endsWith("]")) {
                                        // Remove brackets and split by comma
                                        String skillsStr = skillsJson.substring(1, skillsJson.length() - 1);
                                        String[] skillsArray = skillsStr.split(",");
                                        // Clean up quotes and whitespace
                                        for (int i = 0; i < skillsArray.length; i++) {
                                            skillsArray[i] = skillsArray[i].trim().replaceAll("^\"|\"$", "");
                                        }
                                        dto.setSkills(skillsArray);
                                    } else {
                                        dto.setSkills(new String[]{skillsJson});
                                    }
                                } catch (Exception e) {
                                    dto.setSkills(new String[]{"General"});
                                }
                            } else {
                                dto.setSkills(new String[]{"General"}); // Default skill
                            }
                            
                            // Get department name with null checks
                            if (user.getDepartmentId() != null && !user.getDepartmentId().trim().isEmpty()) {
                                try {
                                    departmentRepository.findById(user.getDepartmentId())
                                        .ifPresent(dept -> {
                                            if (dept.getName() != null) {
                                                dto.setDepartment(dept.getName());
                                            } else {
                                                dto.setDepartment("Unassigned");
                                            }
                                        });
                                    if (dto.getDepartment() == null) {
                                        dto.setDepartment("Unassigned");
                                    }
                                } catch (Exception e) {
                                    dto.setDepartment("Unassigned");
                                }
                            } else {
                                dto.setDepartment("Unassigned");
                            }
                            
                            teamMembers.add(dto);
                        } catch (Exception e) {
                            // Log error but continue processing other team members
                            System.err.println("Error processing team member: " + e.getMessage());
                            e.printStackTrace();
                        }
                    });
                } catch (Exception e) {
                    // Log error but continue processing other team members
                    System.err.println("Error processing team member entry: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            return ResponseEntity.ok(teamMembers);
        } catch (Exception e) {
            System.err.println("Error fetching team members for project " + projectId + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Error fetching team members: " + e.getMessage()
            ));
        }
    }

    /**
     * Create a new project team member
     */
    @PostMapping
    public ResponseEntity<ProjectTeamMember> createProjectTeamMember(@RequestBody ProjectTeamMember teamMember) {
        try {
            // Generate ID if not provided
            if (teamMember.getId() == null || teamMember.getId().isEmpty()) {
                teamMember.setId(idGenerationService.generateProjectTeamMemberId());
            }
            
            // Set timestamps
            if (teamMember.getCreatedAt() == null) {
                teamMember.setCreatedAt(LocalDateTime.now());
            }
            if (teamMember.getJoinedAt() == null) {
                teamMember.setJoinedAt(LocalDateTime.now());
            }
            
            ProjectTeamMember savedTeamMember = projectTeamMemberRepository.save(teamMember);
            
            // Create notification for the assigned user
            if (savedTeamMember.getUserId() != null && !savedTeamMember.getUserId().isEmpty()) {
                try {
                    Optional<Project> projectOpt = projectService.findById(savedTeamMember.getProjectId());
                    if (projectOpt.isPresent()) {
                        Project project = projectOpt.get();
                        String title = "Project Assignment";
                        String message = "You have been assigned to project: " + project.getName();
                        notificationService.createNotification(
                            savedTeamMember.getUserId(),
                            title,
                            message,
                            "project",
                            "project",
                            project.getId()
                        );
                    }
                } catch (Exception e) {
                    // Log error but don't fail the assignment
                    System.err.println("Failed to create notification for project assignment: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(savedTeamMember);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update a project team member
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjectTeamMember> updateProjectTeamMember(
            @PathVariable String id, 
            @RequestBody ProjectTeamMember teamMember) {
        Optional<ProjectTeamMember> existingTeamMember = projectTeamMemberRepository.findById(id);
        
        if (existingTeamMember.isPresent()) {
            teamMember.setId(id);
            ProjectTeamMember updatedTeamMember = projectTeamMemberRepository.save(teamMember);
            return ResponseEntity.ok(updatedTeamMember);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a project team member
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProjectTeamMember(@PathVariable String id) {
        if (projectTeamMemberRepository.existsById(id)) {
            projectTeamMemberRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Remove team member from project by user ID
     */
    @DeleteMapping("/project/{projectId}/user/{userId}")
    public ResponseEntity<Map<String, Object>> removeTeamMemberFromProject(
            @PathVariable String projectId,
            @PathVariable String userId) {
        try {
            // Find the project team member record
            List<ProjectTeamMember> teamMembers = projectTeamMemberRepository.findByProjectId(projectId);
            Optional<ProjectTeamMember> teamMemberOpt = teamMembers.stream()
                    .filter(tm -> tm.getUserId().equals(userId))
                    .findFirst();
            
            if (teamMemberOpt.isPresent()) {
                // Check if the user being removed is the current project manager
                Optional<Project> projectOpt = projectService.findById(projectId);
                if (projectOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Project not found"
                    ));
                }

                Project project = projectOpt.get();

                boolean removedIsManager = userId.equals(project.getManagerId());

                // Delete the association
                projectTeamMemberRepository.deleteById(teamMemberOpt.get().getId());

                // If removed user was manager, reassign manager to another member
                if (removedIsManager) {
                    // Refresh remaining members after deletion
                    List<ProjectTeamMember> remaining = projectTeamMemberRepository.findByProjectId(projectId);

                    // Prefer another member with role 'manager'
                    Optional<ProjectTeamMember> replacementManager = remaining.stream()
                        .filter(tm -> "manager".equalsIgnoreCase(String.valueOf(tm.getRole())))
                        .findFirst();

                    String replacementUserId = null;
                    if (replacementManager.isPresent()) {
                        replacementUserId = replacementManager.get().getUserId();
                    } else if (!remaining.isEmpty()) {
                        // Otherwise pick the first remaining member
                        replacementUserId = remaining.get(0).getUserId();
                    }

                    if (replacementUserId == null || replacementUserId.isEmpty()) {
                        // No replacement available; reject to keep invariant that managerId is not null
                        return ResponseEntity.badRequest().body(Map.of(
                            "success", false,
                            "message", "Cannot remove manager: no replacement team member available"
                        ));
                    }

                    // Update project manager
                    project.setManagerId(replacementUserId);
                    projectService.updateProject(project);
                }
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Team member removed successfully");
                response.put("removedUserId", userId);
                response.put("projectId", projectId);
                
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Team member not found in project");
                
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Error removing team member: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * Add team member to project (convenience endpoint)
     */
    @PostMapping("/add-to-project")
    public ResponseEntity<Map<String, Object>> addTeamMemberToProject(@RequestBody Map<String, Object> request) {
        try {
            String projectId = (String) request.get("projectId");
            String userId = (String) request.get("userId");
            String role = (String) request.get("role");
            Boolean isTeamLead = (Boolean) request.getOrDefault("isTeamLead", false);
            Integer allocationPercentage = (Integer) request.getOrDefault("allocationPercentage", 100);
            
            ProjectTeamMember teamMember = new ProjectTeamMember();
            teamMember.setId(idGenerationService.generateProjectTeamMemberId());
            teamMember.setProjectId(projectId);
            teamMember.setUserId(userId);
            teamMember.setRole(role);
            teamMember.setIsTeamLead(isTeamLead);
            teamMember.setAllocationPercentage(allocationPercentage);
            teamMember.setIsActive(true);
            teamMember.setCreatedAt(LocalDateTime.now());
            teamMember.setJoinedAt(LocalDateTime.now());
            
            ProjectTeamMember savedTeamMember = projectTeamMemberRepository.save(teamMember);
            
            // Create notification for the assigned user
            if (savedTeamMember.getUserId() != null && !savedTeamMember.getUserId().isEmpty()) {
                try {
                    Optional<Project> projectOpt = projectService.findById(savedTeamMember.getProjectId());
                    if (projectOpt.isPresent()) {
                        Project project = projectOpt.get();
                        String title = "Project Assignment";
                        String message = "You have been assigned to project: " + project.getName();
                        notificationService.createNotification(
                            savedTeamMember.getUserId(),
                            title,
                            message,
                            "project",
                            "project",
                            project.getId()
                        );
                    }
                } catch (Exception e) {
                    // Log error but don't fail the assignment
                    System.err.println("Failed to create notification for project assignment: " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Team member added successfully",
                "data", savedTeamMember
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Failed to add team member: " + e.getMessage()
            ));
        }
    }

    /**
     * Add multiple team members to a project
     */
    @PostMapping("/project/{projectId}/batch")
    public ResponseEntity<List<ProjectTeamMember>> addTeamMembersToProject(
            @PathVariable String projectId, 
            @RequestBody List<Map<String, Object>> teamMembers) {
        try {
            List<ProjectTeamMember> savedTeamMembers = new ArrayList<>();
            
            for (Map<String, Object> memberData : teamMembers) {
                String userId = (String) memberData.get("userId");
                String role = (String) memberData.get("role");
                Boolean isTeamLead = (Boolean) memberData.getOrDefault("isTeamLead", false);
                Integer allocationPercentage = (Integer) memberData.getOrDefault("allocationPercentage", 100);
                
                ProjectTeamMember teamMember = new ProjectTeamMember();
                teamMember.setId(idGenerationService.generateProjectTeamMemberId());
                teamMember.setProjectId(projectId);
                teamMember.setUserId(userId);
                teamMember.setRole(role);
                teamMember.setIsTeamLead(isTeamLead);
                teamMember.setAllocationPercentage(allocationPercentage);
                teamMember.setIsActive(true);
                teamMember.setCreatedAt(LocalDateTime.now());
                teamMember.setJoinedAt(LocalDateTime.now());
                
                ProjectTeamMember savedTeamMember = projectTeamMemberRepository.save(teamMember);
                savedTeamMembers.add(savedTeamMember);
            }
            
            return ResponseEntity.ok(savedTeamMembers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
