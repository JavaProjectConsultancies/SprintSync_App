package com.sprintsync.api.service;

import com.sprintsync.api.entity.Project;
import com.sprintsync.api.entity.enums.Priority;
import com.sprintsync.api.entity.enums.ProjectStatus;
import com.sprintsync.api.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service class for Project entity operations.
 * Provides business logic for project management operations.
 * 
 * @author Mayuresh G
 */
@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final IdGenerationService idGenerationService;

    @Autowired
    public ProjectService(ProjectRepository projectRepository, IdGenerationService idGenerationService) {
        this.projectRepository = projectRepository;
        this.idGenerationService = idGenerationService;
    }

    /**
     * Create a new project.
     * 
     * @param project the project to create
     * @return the created project
     */
    public Project createProject(Project project) {
        // Generate custom ID if not provided
        if (project.getId() == null) {
            project.setId(idGenerationService.generateProjectId());
        }
        return projectRepository.save(project);
    }

    /**
     * Find project by ID.
     * 
     * @param id the project ID
     * @return Optional containing the project if found
     */
    @Transactional(readOnly = true)
    public Optional<Project> findById(String id) {
        return projectRepository.findById(id);
    }

    /**
     * Update an existing project.
     * 
     * @param project the project to update
     * @return the updated project
     * @throws IllegalArgumentException if project not found
     */
    public Project updateProject(Project project) {
        if (!projectRepository.existsById(project.getId())) {
            throw new IllegalArgumentException("Project not found with ID: " + project.getId());
        }
        return projectRepository.save(project);
    }

    /**
     * Delete a project by ID.
     * 
     * @param id the project ID
     * @throws IllegalArgumentException if project not found
     */
    public void deleteProject(String id) {
        if (!projectRepository.existsById(id)) {
            throw new IllegalArgumentException("Project not found with ID: " + id);
        }
        projectRepository.deleteById(id);
    }

    /**
     * Get all projects.
     * 
     * @return list of all projects
     */
    @Transactional(readOnly = true)
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    /**
     * Get all projects with pagination.
     * 
     * @param page page number (0-indexed)
     * @param size page size
     * @param sortBy sort field
     * @param sortDir sort direction
     * @return page of projects
     */
    @Transactional(readOnly = true)
    public Page<Project> getAllProjects(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                   Sort.by(sortBy).descending() : 
                   Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return projectRepository.findAll(pageable);
    }

    /**
     * Find projects by status.
     * 
     * @param status the project status
     * @return list of projects with the specified status
     */
    @Transactional(readOnly = true)
    public List<Project> findProjectsByStatus(ProjectStatus status) {
        return projectRepository.findByStatus(status);
    }

    /**
     * Find projects by priority.
     * 
     * @param priority the project priority
     * @return list of projects with the specified priority
     */
    @Transactional(readOnly = true)
    public List<Project> findProjectsByPriority(Priority priority) {
        return projectRepository.findByPriority(priority);
    }

    /**
     * Find projects by manager ID.
     * 
     * @param managerId the manager ID
     * @return list of projects managed by the specified user
     */
    @Transactional(readOnly = true)
    public List<Project> findProjectsByManager(String managerId) {
        return projectRepository.findByManagerId(managerId);
    }

    /**
     * Find projects by department ID.
     * 
     * @param departmentId the department ID
     * @return list of projects in the specified department
     */
    @Transactional(readOnly = true)
    public List<Project> findProjectsByDepartment(String departmentId) {
        return projectRepository.findByDepartmentId(departmentId);
    }

    /**
     * Find active projects.
     * 
     * @return list of active projects
     */
    @Transactional(readOnly = true)
    public List<Project> findActiveProjects() {
        return projectRepository.findByIsActive(true);
    }

    /**
     * Search projects by name.
     * 
     * @param name the name to search for
     * @return list of projects with matching names
     */
    @Transactional(readOnly = true)
    public List<Project> searchProjectsByName(String name) {
        return projectRepository.findByNameContainingIgnoreCase(name);
    }

    /**
     * Find overdue projects.
     * 
     * @return list of overdue projects
     */
    @Transactional(readOnly = true)
    public List<Project> findOverdueProjects() {
        return projectRepository.findOverdueProjects(LocalDate.now(), ProjectStatus.COMPLETED, ProjectStatus.CANCELLED);
    }

    /**
     * Find projects with low progress.
     * 
     * @param threshold the progress threshold
     * @return list of projects with progress below threshold
     */
    @Transactional(readOnly = true)
    public List<Project> findProjectsWithLowProgress(Integer threshold) {
        return projectRepository.findProjectsWithLowProgress(threshold);
    }

    /**
     * Find projects by multiple criteria.
     * 
     * @param status the project status (optional)
     * @param priority the project priority (optional)
     * @param managerId the manager ID (optional)
     * @param isActive the active status (optional)
     * @return list of projects matching the criteria
     */
    @Transactional(readOnly = true)
    public List<Project> findProjectsByCriteria(ProjectStatus status, Priority priority, String managerId, Boolean isActive) {
        return projectRepository.findProjectsByCriteria(status, priority, managerId, isActive);
    }

    /**
     * Update project status.
     * 
     * @param id the project ID
     * @param status the new status
     * @return the updated project
     * @throws IllegalArgumentException if project not found
     */
    public Project updateProjectStatus(String id, ProjectStatus status) {
        Optional<Project> projectOptional = projectRepository.findById(id);
        if (projectOptional.isPresent()) {
            Project project = projectOptional.get();
            project.setStatus(status);
            return projectRepository.save(project);
        } else {
            throw new IllegalArgumentException("Project not found with ID: " + id);
        }
    }

    /**
     * Update project progress.
     * 
     * @param id the project ID
     * @param progress the new progress percentage
     * @return the updated project
     * @throws IllegalArgumentException if project not found
     */
    public Project updateProjectProgress(String id, Integer progress) {
        Optional<Project> projectOptional = projectRepository.findById(id);
        if (projectOptional.isPresent()) {
            Project project = projectOptional.get();
            project.setProgressPercentage(progress);
            return projectRepository.save(project);
        } else {
            throw new IllegalArgumentException("Project not found with ID: " + id);
        }
    }

    /**
     * Get project statistics.
     * 
     * @return project statistics
     */
    @Transactional(readOnly = true)
    public String getProjectStatistics() {
        long totalProjects = projectRepository.count();
        long activeProjects = projectRepository.countByIsActive(true);
        long completedProjects = projectRepository.countByStatus(ProjectStatus.COMPLETED);
        long highPriorityProjects = projectRepository.countByPriority(Priority.HIGH);
        
        return String.format("Total Projects: %d, Active: %d, Completed: %d, High Priority: %d", 
                           totalProjects, activeProjects, completedProjects, highPriorityProjects);
    }

    /**
     * Find projects starting within date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of projects starting within the date range
     */
    @Transactional(readOnly = true)
    public List<Project> findProjectsStartingBetween(LocalDate startDate, LocalDate endDate) {
        return projectRepository.findProjectsStartingBetween(startDate, endDate);
    }

    /**
     * Find projects ending within date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of projects ending within the date range
     */
    @Transactional(readOnly = true)
    public List<Project> findProjectsEndingBetween(LocalDate startDate, LocalDate endDate) {
        return projectRepository.findProjectsEndingBetween(startDate, endDate);
    }
}