package com.sprintsync.api.controller;

import com.sprintsync.api.dto.TeamMemberDto;
import com.sprintsync.api.entity.ProjectTeamMember;
import com.sprintsync.api.repository.ProjectTeamMemberRepository;
import com.sprintsync.api.repository.UserRepository;
import com.sprintsync.api.repository.DepartmentRepository;
<<<<<<< HEAD
import com.sprintsync.api.service.IdGenerationService;
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

<<<<<<< HEAD
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
=======
import java.util.ArrayList;
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
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

<<<<<<< HEAD
    @Autowired
    private IdGenerationService idGenerationService;

=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
    /**
     * Get all project team members
     */
    @GetMapping
    public ResponseEntity<List<TeamMemberDto>> getAllProjectTeamMembers() {
        List<TeamMemberDto> teamMembers = new ArrayList<>();
        
        projectTeamMemberRepository.findAll().forEach(teamMember -> {
            userRepository.findById(teamMember.getUserId()).ifPresent(user -> {
                TeamMemberDto dto = new TeamMemberDto();
                dto.setId(user.getId());
                dto.setName(user.getName());
                dto.setRole(teamMember.getRole());
                dto.setIsTeamLead(teamMember.getIsTeamLead());
                dto.setAvailability(teamMember.getAllocationPercentage());
                
<<<<<<< HEAD
                // Set additional user fields
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
                
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
                // Get department name
                if (user.getDepartmentId() != null) {
                    departmentRepository.findById(user.getDepartmentId())
                        .ifPresent(dept -> dto.setDepartment(dept.getName()));
<<<<<<< HEAD
                } else {
                    dto.setDepartment("Unassigned");
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
                }
                
                teamMembers.add(dto);
            });
        });
        
        return ResponseEntity.ok(teamMembers);
    }

    /**
     * Get team members by project ID
     */
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TeamMemberDto>> getTeamMembersByProject(@PathVariable String projectId) {
        List<TeamMemberDto> teamMembers = new ArrayList<>();
        
        projectTeamMemberRepository.findByProjectId(projectId).forEach(teamMember -> {
            userRepository.findById(teamMember.getUserId()).ifPresent(user -> {
                TeamMemberDto dto = new TeamMemberDto();
                dto.setId(user.getId());
                dto.setName(user.getName());
                dto.setRole(teamMember.getRole());
                dto.setIsTeamLead(teamMember.getIsTeamLead());
                dto.setAvailability(teamMember.getAllocationPercentage());
                
<<<<<<< HEAD
                // Set additional user fields
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
                
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
                // Get department name
                if (user.getDepartmentId() != null) {
                    departmentRepository.findById(user.getDepartmentId())
                        .ifPresent(dept -> dto.setDepartment(dept.getName()));
<<<<<<< HEAD
                } else {
                    dto.setDepartment("Unassigned");
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
                }
                
                teamMembers.add(dto);
            });
        });
        
        return ResponseEntity.ok(teamMembers);
    }

    /**
     * Create a new project team member
     */
    @PostMapping
    public ResponseEntity<ProjectTeamMember> createProjectTeamMember(@RequestBody ProjectTeamMember teamMember) {
        try {
<<<<<<< HEAD
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
            
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
            ProjectTeamMember savedTeamMember = projectTeamMemberRepository.save(teamMember);
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
<<<<<<< HEAD
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
                projectTeamMemberRepository.deleteById(teamMemberOpt.get().getId());
                
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
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
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
<<<<<<< HEAD
            teamMember.setId(idGenerationService.generateProjectTeamMemberId());
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
            teamMember.setProjectId(projectId);
            teamMember.setUserId(userId);
            teamMember.setRole(role);
            teamMember.setIsTeamLead(isTeamLead);
            teamMember.setAllocationPercentage(allocationPercentage);
            teamMember.setIsActive(true);
<<<<<<< HEAD
            teamMember.setCreatedAt(LocalDateTime.now());
            teamMember.setJoinedAt(LocalDateTime.now());
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
            
            ProjectTeamMember savedTeamMember = projectTeamMemberRepository.save(teamMember);
            
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
<<<<<<< HEAD

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
=======
>>>>>>> 018053f8a541a4295fcab50b1b95f6af8a882dc3
}
