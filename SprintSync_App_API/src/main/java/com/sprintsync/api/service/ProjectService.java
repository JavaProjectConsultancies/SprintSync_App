package com.sprintsync.api.service;

import com.sprintsync.api.dto.CreateProjectRequest;
import com.sprintsync.api.dto.CreateProjectResponse;
import com.sprintsync.api.entity.Project;
import com.sprintsync.api.entity.Requirement;
import com.sprintsync.api.entity.Risk;
import com.sprintsync.api.entity.Stakeholder;
import com.sprintsync.api.entity.ProjectTeamMember;
import com.sprintsync.api.entity.Epic;
import com.sprintsync.api.entity.Release;
import com.sprintsync.api.entity.enums.Priority;
import com.sprintsync.api.entity.enums.ProjectStatus;
import com.sprintsync.api.entity.enums.RequirementType;
import com.sprintsync.api.entity.enums.RequirementStatus;
import com.sprintsync.api.entity.enums.RiskProbability;
import com.sprintsync.api.entity.enums.RiskImpact;
import com.sprintsync.api.entity.enums.RiskStatus;
import com.sprintsync.api.entity.enums.EpicStatus;
import com.sprintsync.api.entity.enums.ReleaseStatus;
import com.sprintsync.api.repository.ProjectRepository;
import com.sprintsync.api.repository.ProjectTeamMemberRepository;
import java.math.BigDecimal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

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

@SuppressWarnings("null")
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final IdGenerationService idGenerationService;
    private final RequirementService requirementService;
    private final RiskService riskService;
    private final StakeholderService stakeholderService;
    private final ProjectTeamMemberRepository projectTeamMemberRepository;
    private final EpicService epicService;
    private final ReleaseService releaseService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public ProjectService(ProjectRepository projectRepository, IdGenerationService idGenerationService,
                         RequirementService requirementService, RiskService riskService,
                         StakeholderService stakeholderService, ProjectTeamMemberRepository projectTeamMemberRepository,
                         EpicService epicService, ReleaseService releaseService) {
        this.projectRepository = projectRepository;
        this.idGenerationService = idGenerationService;
        this.requirementService = requirementService;
        this.riskService = riskService;
        this.stakeholderService = stakeholderService;
        this.projectTeamMemberRepository = projectTeamMemberRepository;
        this.epicService = epicService;
        this.releaseService = releaseService;
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
     * Create a new project with all related entities in a single transaction.
     * 
     * @param request the comprehensive project creation request
     * @return the comprehensive project creation response
     */
    // Helper method to validate and ensure valid JSON
    private String ensureValidJson(String jsonString) {
        if (jsonString == null || jsonString.trim().isEmpty()) {
            return "[]";
        }
        try {
            // Validate that it's valid JSON by parsing it
            objectMapper.readTree(jsonString);
            return jsonString;
        } catch (Exception e) {
            // If not valid JSON, return empty array
            return "[]";
        }
    }

    public CreateProjectResponse createProjectWithRelatedEntities(CreateProjectRequest request) {
        try {
            System.out.println("Received request: " + request.getName());
            System.out.println("Priority: " + request.getPriority());
            System.out.println("Status: " + request.getStatus());
            // Create the main project
            Project project = new Project();
            project.setId(idGenerationService.generateProjectId());
            project.setName(request.getName());
            project.setDescription(request.getDescription());
            project.setStatus(ProjectStatus.fromValue(request.getStatus()));
            project.setPriority(Priority.fromValue(request.getPriority()));
            project.setStartDate(request.getStartDate());
            project.setEndDate(request.getEndDate());
            project.setManagerId(request.getManagerId());
            project.setDepartmentId(request.getDepartmentId());
            project.setScope(request.getScope());
            project.setProjectType(request.getProjectType());
            project.setTemplate(request.getTemplate());
            project.setMethodology(request.getMethodology());
            if (request.getBudget() != null) {
                project.setBudget(new BigDecimal(request.getBudget()));
            }
            if (request.getSpent() != null) {
                project.setSpent(new BigDecimal(request.getSpent()));
            }

            Project savedProject = projectRepository.save(project);
            String projectId = savedProject.getId();

            int totalEntitiesCreated = 1; // Project itself

            // Create requirements
            if (request.getRequirements() != null && !request.getRequirements().isEmpty()) {
                for (CreateProjectRequest.RequirementDto reqDto : request.getRequirements()) {
                    Requirement req = new Requirement();
                    req.setId(idGenerationService.generateRequirementId());
                    req.setProjectId(projectId);
                    req.setTitle(reqDto.getTitle());
                    req.setDescription(reqDto.getDescription());
                    req.setType(RequirementType.fromValue(reqDto.getType()));
                    req.setStatus(RequirementStatus.fromValue(reqDto.getStatus()));
                    req.setPriority(Priority.fromValue(reqDto.getPriority()));
                    req.setModule(reqDto.getModule());
                    // Handle JSON string for acceptance criteria - validate JSON
                    req.setAcceptanceCriteria(ensureValidJson(reqDto.getAcceptanceCriteria()));
                    req.setEffortPoints(reqDto.getEffortPoints());
                    requirementService.createRequirement(req);
                    totalEntitiesCreated++;
                }
            }

            // Create risks
            if (request.getRisks() != null && !request.getRisks().isEmpty()) {
                for (CreateProjectRequest.RiskDto riskDto : request.getRisks()) {
                    Risk risk = new Risk();
                    risk.setId(idGenerationService.generateRiskId());
                    risk.setProjectId(projectId);
                    risk.setTitle(riskDto.getTitle());
                    risk.setDescription(riskDto.getDescription());
                    risk.setProbability(RiskProbability.fromValue(riskDto.getProbability()));
                    risk.setImpact(RiskImpact.fromValue(riskDto.getImpact()));
                    risk.setMitigation(riskDto.getMitigation());
                    risk.setStatus(RiskStatus.fromValue(riskDto.getStatus()));
                    risk.setOwnerId(riskDto.getOwner());
                    riskService.createRisk(risk);
                    totalEntitiesCreated++;
                }
            }

            // Create stakeholders
            if (request.getStakeholders() != null && !request.getStakeholders().isEmpty()) {
                for (CreateProjectRequest.StakeholderDto stakeDto : request.getStakeholders()) {
                    Stakeholder stakeholder = new Stakeholder();
                    stakeholder.setId(idGenerationService.generateStakeholderId());
                    stakeholder.setProjectId(projectId);
                    stakeholder.setName(stakeDto.getName());
                    stakeholder.setRole(stakeDto.getRole());
                    stakeholder.setEmail(stakeDto.getEmail());
                    // Handle JSON string for responsibilities - validate JSON
                    stakeholder.setResponsibilities(ensureValidJson(stakeDto.getResponsibilities()));
                    stakeholderService.createStakeholder(stakeholder);
                    totalEntitiesCreated++;
                }
            }

            // Create team members
            if (request.getTeamMembers() != null && !request.getTeamMembers().isEmpty()) {
                for (CreateProjectRequest.TeamMemberDto teamDto : request.getTeamMembers()) {
                    ProjectTeamMember teamMember = new ProjectTeamMember();
                    teamMember.setId(idGenerationService.generateProjectTeamMemberId());
                    teamMember.setProjectId(projectId);
                    teamMember.setUserId(teamDto.getUserId());
                    teamMember.setRole(teamDto.getRole());
                    teamMember.setIsTeamLead(teamDto.getIsTeamLead());
                    // Note: ProjectTeamMember doesn't have allocatedHours field
                    // Note: startDate and endDate are handled differently in ProjectTeamMember
                    projectTeamMemberRepository.save(teamMember);
                    totalEntitiesCreated++;
                }
            }

            // Create epics
            if (request.getEpics() != null && !request.getEpics().isEmpty()) {
                for (CreateProjectRequest.EpicDto epicDto : request.getEpics()) {
                    Epic epic = new Epic();
                    epic.setId(idGenerationService.generateEpicId());
                    epic.setProjectId(projectId);
                    epic.setTitle(epicDto.getTitle());
                    epic.setDescription(epicDto.getDescription());
                    epic.setSummary(epicDto.getSummary());
                    epic.setTheme(epicDto.getTheme());
                    epic.setBusinessValue(epicDto.getBusinessValue());
                    epic.setPriority(Priority.fromValue(epicDto.getPriority()));
                    epic.setStatus(EpicStatus.fromValue(epicDto.getStatus()));
                    if (epicDto.getStartDate() != null && !epicDto.getStartDate().isEmpty()) {
                        epic.setStartDate(LocalDate.parse(epicDto.getStartDate()));
                    }
                    if (epicDto.getEndDate() != null && !epicDto.getEndDate().isEmpty()) {
                        epic.setEndDate(LocalDate.parse(epicDto.getEndDate()));
                    }
                    // Handle assigneeId - set to null if empty to avoid foreign key constraint violation
                    String assigneeId = epicDto.getAssigneeId();
                    if (assigneeId != null && !assigneeId.trim().isEmpty()) {
                        epic.setAssigneeId(assigneeId);
                    } else {
                        epic.setAssigneeId(null); // Set to null instead of empty string
                    }
                    epic.setOwner(epicDto.getOwner());
                    epic.setProgress(epicDto.getProgress());
                    epic.setStoryPoints(epicDto.getStoryPoints());
                    epicService.createEpic(epic);
                    totalEntitiesCreated++;
                }
            }

            // Create releases
            if (request.getReleases() != null && !request.getReleases().isEmpty()) {
                for (CreateProjectRequest.ReleaseDto releaseDto : request.getReleases()) {
                    Release release = new Release();
                    release.setId(idGenerationService.generateReleaseId());
                    release.setProjectId(projectId);
                    release.setName(releaseDto.getName());
                    release.setDescription(releaseDto.getDescription());
                    release.setVersion(releaseDto.getVersion());
                    release.setStatus(ReleaseStatus.fromValue(releaseDto.getStatus()));
                    if (releaseDto.getReleaseDate() != null && !releaseDto.getReleaseDate().isEmpty()) {
                        release.setReleaseDate(LocalDate.parse(releaseDto.getReleaseDate()));
                    }
                    if (releaseDto.getTargetDate() != null && !releaseDto.getTargetDate().isEmpty()) {
                        release.setTargetDate(LocalDate.parse(releaseDto.getTargetDate()));
                    }
                    release.setReleaseNotes(releaseDto.getReleaseNotes());
                    // Handle JSON strings for risks and dependencies - validate JSON
                    release.setRisks(ensureValidJson(releaseDto.getRisks()));
                    release.setDependencies(ensureValidJson(releaseDto.getDependencies()));
                    release.setCreatedBy(releaseDto.getCreatedBy());
                    release.setProgress(releaseDto.getProgress());
                    // Handle other JSONB fields - validate JSON
                    release.setLinkedEpics(ensureValidJson(releaseDto.getLinkedEpics()));
                    release.setLinkedStories(ensureValidJson(releaseDto.getLinkedStories()));
                    release.setLinkedSprints(ensureValidJson(releaseDto.getLinkedSprints()));
                    if (releaseDto.getCompletedAt() != null && !releaseDto.getCompletedAt().isEmpty()) {
                        release.setCompletedAt(LocalDate.parse(releaseDto.getCompletedAt()));
                    }
                    releaseService.createRelease(release);
                    totalEntitiesCreated++;
                }
            }

            // Create response
            CreateProjectResponse response = new CreateProjectResponse();
            response.setSuccess(true);
            response.setMessage("Project and all related entities created successfully");
            response.setProject(savedProject);
            response.setTotalEntitiesCreated(totalEntitiesCreated);

            return response;

        } catch (Exception e) {
            CreateProjectResponse response = new CreateProjectResponse();
            response.setSuccess(false);
            response.setMessage("Failed to create project: " + e.getMessage());
            return response;
        }
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

    public List<Project> getProjectsForUser(String userId) {
        return projectRepository.findProjectsByUserAccess(userId);
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





