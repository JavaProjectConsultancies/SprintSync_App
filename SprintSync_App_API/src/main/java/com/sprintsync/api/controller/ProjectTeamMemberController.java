package com.sprintsync.api.controller;

import com.sprintsync.api.dto.TeamMemberDto;
import com.sprintsync.api.entity.ProjectTeamMember;
import com.sprintsync.api.repository.ProjectTeamMemberRepository;
import com.sprintsync.api.repository.UserRepository;
import com.sprintsync.api.repository.DepartmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
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
                
                // Get department name
                if (user.getDepartmentId() != null) {
                    departmentRepository.findById(user.getDepartmentId())
                        .ifPresent(dept -> dto.setDepartment(dept.getName()));
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
                
                // Get department name
                if (user.getDepartmentId() != null) {
                    departmentRepository.findById(user.getDepartmentId())
                        .ifPresent(dept -> dto.setDepartment(dept.getName()));
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
            teamMember.setProjectId(projectId);
            teamMember.setUserId(userId);
            teamMember.setRole(role);
            teamMember.setIsTeamLead(isTeamLead);
            teamMember.setAllocationPercentage(allocationPercentage);
            teamMember.setIsActive(true);
            
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
}
