package com.sprintsync.api.controller;

import com.sprintsync.api.dto.ProjectDto;
import com.sprintsync.api.dto.CreateProjectRequest;
import com.sprintsync.api.dto.CreateProjectResponse;
import com.sprintsync.api.entity.Project;
import com.sprintsync.api.entity.enums.Priority;
import com.sprintsync.api.entity.enums.ProjectStatus;
import com.sprintsync.api.service.ProjectService;
import com.sprintsync.api.service.ProjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * REST Controller for Project entity operations.
 * Provides endpoints for project management operations.
 * 
 * @author Mayuresh G
 */
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
public class ProjectController {

    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    @Autowired
    public ProjectController(ProjectService projectService, ProjectMapper projectMapper) {
        this.projectService = projectService;
        this.projectMapper = projectMapper;
    }

    /**
     * Create a new project.
     * 
     * @param project the project to create
     * @return ResponseEntity containing the created project
     */
    @PostMapping
    @CacheEvict(value = {"projects", "projects-summary"}, allEntries = true)
    public ResponseEntity<Project> createProject(@RequestBody Project project) {
        try {
            Project createdProject = projectService.createProject(project);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdProject);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create a new project with all related entities in a single request.
     * 
     * @param request the comprehensive project creation request
     * @return ResponseEntity containing the comprehensive project creation response
     */
    @PostMapping("/comprehensive")
    @CacheEvict(value = {"projects", "projects-summary"}, allEntries = true)
    public ResponseEntity<CreateProjectResponse> createProjectComprehensive(@RequestBody CreateProjectRequest request) {
        try {
            CreateProjectResponse response = projectService.createProjectWithRelatedEntities(request);
            if (response.isSuccess()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            CreateProjectResponse errorResponse = new CreateProjectResponse();
            errorResponse.setSuccess(false);
            errorResponse.setMessage("Failed to create project: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get project by ID.
     * 
     * @param id the project ID
     * @return ResponseEntity containing the project DTO if found
     */
    @GetMapping("/{id}")
    @Cacheable(value = "projects", key = "#id")
    public ResponseEntity<ProjectDto> getProjectById(@PathVariable String id) {
        Optional<Project> project = projectService.findById(id);
        return project.map(p -> ResponseEntity.ok(projectMapper.toDto(p)))
                     .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all projects with pagination.
     * 
     * @param page page number (default: 0)
     * @param size page size (default: 10)
     * @param sortBy sort field (default: name)
     * @param sortDir sort direction (default: asc)
     * @return ResponseEntity containing page of project DTOs
     */
    @GetMapping
    @Cacheable(value = "projects-summary", key = "#page + '-' + #size + '-' + #sortBy + '-' + #sortDir")
    public ResponseEntity<Map<String, Object>> getAllProjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        org.springframework.data.domain.Page<Project> projects = projectService.getAllProjects(page, size, sortBy, sortDir);
        
        // Convert to DTOs (lightweight mapping to keep list endpoint fast)
        org.springframework.data.domain.Page<ProjectDto> projectDtos = projects.map(project -> projectMapper.toDto(project, false));
        
        // Return in frontend-compatible format
        Map<String, Object> response = new HashMap<>();
        response.put("content", projectDtos.getContent());
        response.put("totalElements", projectDtos.getTotalElements());
        response.put("totalPages", projectDtos.getTotalPages());
        response.put("size", projectDtos.getSize());
        response.put("number", projectDtos.getNumber());
        response.put("first", projectDtos.isFirst());
        response.put("last", projectDtos.isLast());
        response.put("numberOfElements", projectDtos.getNumberOfElements());
        response.put("empty", projectDtos.isEmpty());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all projects without pagination.
     * 
     * @return ResponseEntity containing list of all projects
     */
    @GetMapping("/all")
    @Cacheable(value = "projects-summary", key = "'all'")
    public ResponseEntity<Map<String, Object>> getAllProjectsList() {
        List<Project> projects = projectService.getAllProjects();
        
        // Convert to DTOs
        List<ProjectDto> projectDtos = projects.stream()
                .map(project -> projectMapper.toDto(project, false))
                .collect(Collectors.toList());
        
        // Return in frontend-compatible format
        Map<String, Object> response = new HashMap<>();
        response.put("content", projectDtos);
        response.put("totalElements", (long) projectDtos.size());
        response.put("totalPages", 1);
        response.put("size", projectDtos.size());
        response.put("number", 0);
        response.put("first", true);
        response.put("last", true);
        response.put("numberOfElements", projectDtos.size());
        response.put("empty", projectDtos.isEmpty());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get projects by status.
     * 
     * @param status the project status
     * @return ResponseEntity containing list of projects with the specified status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Project>> getProjectsByStatus(@PathVariable ProjectStatus status) {
        List<Project> projects = projectService.findProjectsByStatus(status);
        return ResponseEntity.ok(projects);
    }

    /**
     * Get projects by priority.
     * 
     * @param priority the project priority
     * @return ResponseEntity containing list of projects with the specified priority
     */
    @GetMapping("/priority/{priority}")
    public ResponseEntity<List<Project>> getProjectsByPriority(@PathVariable Priority priority) {
        List<Project> projects = projectService.findProjectsByPriority(priority);
        return ResponseEntity.ok(projects);
    }

    /**
     * Get projects by manager ID.
     * 
     * @param managerId the manager ID
     * @return ResponseEntity containing list of projects managed by the specified user
     */
    @GetMapping("/manager/{managerId}")
    public ResponseEntity<List<Project>> getProjectsByManager(@PathVariable String managerId) {
        List<Project> projects = projectService.findProjectsByManager(managerId);
        return ResponseEntity.ok(projects);
    }

    /**
     * Get projects by department ID.
     * 
     * @param departmentId the department ID
     * @return ResponseEntity containing list of projects in the department
     */
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Project>> getProjectsByDepartment(@PathVariable String departmentId) {
        List<Project> projects = projectService.findProjectsByDepartment(departmentId);
        return ResponseEntity.ok(projects);
    }

    /**
     * Get active projects.
     * 
     * @return ResponseEntity containing list of active projects
     */
    @GetMapping("/active")
    public ResponseEntity<List<Project>> getActiveProjects() {
        List<Project> projects = projectService.findActiveProjects();
        return ResponseEntity.ok(projects);
    }

    /**
     * Search projects by name.
     * 
     * @param name the name to search for
     * @return ResponseEntity containing list of projects with matching names
     */
    @GetMapping("/search")
    public ResponseEntity<List<Project>> searchProjectsByName(@RequestParam String name) {
        List<Project> projects = projectService.searchProjectsByName(name);
        return ResponseEntity.ok(projects);
    }

    /**
     * Get overdue projects.
     * 
     * @return ResponseEntity containing list of overdue projects
     */
    @GetMapping("/overdue")
    public ResponseEntity<List<Project>> getOverdueProjects() {
        List<Project> projects = projectService.findOverdueProjects();
        return ResponseEntity.ok(projects);
    }

    /**
     * Get projects with low progress.
     * 
     * @param threshold the progress threshold
     * @return ResponseEntity containing list of projects with progress below threshold
     */
    @GetMapping("/low-progress")
    public ResponseEntity<List<Project>> getProjectsWithLowProgress(@RequestParam(defaultValue = "50") Integer threshold) {
        List<Project> projects = projectService.findProjectsWithLowProgress(threshold);
        return ResponseEntity.ok(projects);
    }

    /**
     * Get projects by multiple criteria.
     * 
     * @param status the project status (optional)
     * @param priority the project priority (optional)
     * @param managerId the manager ID (optional)
     * @param isActive the active status (optional)
     * @return ResponseEntity containing list of projects matching the criteria
     */
    @GetMapping("/criteria")
    public ResponseEntity<List<Project>> getProjectsByCriteria(
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String managerId,
            @RequestParam(required = false) Boolean isActive) {
        
        List<Project> projects = projectService.findProjectsByCriteria(status, priority, managerId, isActive);
        return ResponseEntity.ok(projects);
    }

    /**
     * Update an existing project.
     * 
     * @param id the project ID
     * @param projectDetails the updated project details
     * @return ResponseEntity containing the updated project
     */
    @PutMapping("/{id}")
    @CacheEvict(value = {"projects", "projects-summary"}, allEntries = true)
    public ResponseEntity<Project> updateProject(@PathVariable String id, @RequestBody Project projectDetails) {
        try {
            projectDetails.setId(id);
            Project updatedProject = projectService.updateProject(projectDetails);
            return ResponseEntity.ok(updatedProject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update project status.
     * 
     * @param id the project ID
     * @param status the new status
     * @return ResponseEntity containing the updated project
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Project> updateProjectStatus(@PathVariable String id, @RequestParam ProjectStatus status) {
        try {
            Project updatedProject = projectService.updateProjectStatus(id, status);
            return ResponseEntity.ok(updatedProject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Update project progress.
     * 
     * @param id the project ID
     * @param progress the new progress percentage
     * @return ResponseEntity containing the updated project
     */
    @PatchMapping("/{id}/progress")
    public ResponseEntity<Project> updateProjectProgress(@PathVariable String id, @RequestParam Integer progress) {
        try {
            Project updatedProject = projectService.updateProjectProgress(id, progress);
            return ResponseEntity.ok(updatedProject);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Delete a project by ID.
     * 
     * @param id the project ID
     * @return ResponseEntity with no content if successful
     */
    @DeleteMapping("/{id}")
    @CacheEvict(value = {"projects", "projects-summary"}, allEntries = true)
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        try {
            projectService.deleteProject(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get projects starting within date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return ResponseEntity containing list of projects starting within the date range
     */
    @GetMapping("/starting-between")
    public ResponseEntity<List<Project>> getProjectsStartingBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Project> projects = projectService.findProjectsStartingBetween(startDate, endDate);
        return ResponseEntity.ok(projects);
    }

    /**
     * Get projects ending within date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return ResponseEntity containing list of projects ending within the date range
     */
    @GetMapping("/ending-between")
    public ResponseEntity<List<Project>> getProjectsEndingBetween(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<Project> projects = projectService.findProjectsEndingBetween(startDate, endDate);
        return ResponseEntity.ok(projects);
    }

    /**
     * Get project statistics.
     * 
     * @return ResponseEntity containing project statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<String> getProjectStatistics() {
        String stats = projectService.getProjectStatistics();
        return ResponseEntity.ok(stats);
    }
}