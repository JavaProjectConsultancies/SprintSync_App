package com.sprintsync.api.repository;

import com.sprintsync.api.entity.Project;
import com.sprintsync.api.entity.enums.Priority;
import com.sprintsync.api.entity.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Project entity operations.
 * Provides CRUD operations and custom query methods for project management.
 * 
 * @author Mayuresh G
 */
@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

    /**
     * Find projects by status.
     * 
     * @param status the project status
     * @return list of projects with the specified status
     */
    List<Project> findByStatus(ProjectStatus status);

    /**
     * Find projects by priority.
     * 
     * @param priority the project priority
     * @return list of projects with the specified priority
     */
    List<Project> findByPriority(Priority priority);

    /**
     * Find projects by manager ID.
     * 
     * @param managerId the manager ID
     * @return list of projects managed by the specified user
     */
    List<Project> findByManagerId(String managerId);

    /**
     * Find projects by department ID.
     * 
     * @param departmentId the department ID
     * @return list of projects in the specified department
     */
    List<Project> findByDepartmentId(String departmentId);

    /**
     * Find active projects.
     * 
     * @param isActive the active status
     * @return list of active/inactive projects
     */
    List<Project> findByIsActive(Boolean isActive);

    /**
     * Find projects by status with pagination.
     * 
     * @param status the project status
     * @param pageable pagination information
     * @return page of projects with the specified status
     */
    Page<Project> findByStatus(ProjectStatus status, Pageable pageable);

    /**
     * Find projects by manager with pagination.
     * 
     * @param managerId the manager ID
     * @param pageable pagination information
     * @return page of projects managed by the specified user
     */
    Page<Project> findByManagerId(String managerId, Pageable pageable);

    /**
     * Search projects by name (case-insensitive).
     * 
     * @param name the name to search for
     * @return list of projects with names containing the search term
     */
    List<Project> findByNameContainingIgnoreCase(String name);

    /**
     * Find overdue projects (end date is in the past and status is not completed/cancelled).
     * 
     * @param currentDate the current date
     * @param completedStatus the completed status
     * @param cancelledStatus the cancelled status
     * @return list of overdue projects
     */
    @Query("SELECT p FROM Project p WHERE p.endDate < :currentDate AND p.status NOT IN (:completedStatus, :cancelledStatus)")
    List<Project> findOverdueProjects(@Param("currentDate") LocalDate currentDate,
                                     @Param("completedStatus") ProjectStatus completedStatus,
                                     @Param("cancelledStatus") ProjectStatus cancelledStatus);

    /**
     * Find projects with progress below threshold.
     * 
     * @param threshold the progress threshold
     * @return list of projects with progress below threshold
     */
    @Query("SELECT p FROM Project p WHERE p.progressPercentage < :threshold")
    List<Project> findProjectsWithLowProgress(@Param("threshold") Integer threshold);

    /**
     * Find projects by multiple criteria.
     * 
     * @param status the project status (optional)
     * @param priority the project priority (optional)
     * @param managerId the manager ID (optional)
     * @param isActive the active status (optional)
     * @return list of projects matching the criteria
     */
    @Query("SELECT p FROM Project p WHERE " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:priority IS NULL OR p.priority = :priority) AND " +
           "(:managerId IS NULL OR p.managerId = :managerId) AND " +
           "(:isActive IS NULL OR p.isActive = :isActive)")
    List<Project> findProjectsByCriteria(@Param("status") ProjectStatus status,
                                        @Param("priority") Priority priority,
                                        @Param("managerId") String managerId,
                                        @Param("isActive") Boolean isActive);

    /**
     * Count projects by status.
     * 
     * @param status the project status
     * @return count of projects with the specified status
     */
    long countByStatus(ProjectStatus status);

    /**
     * Count projects by priority.
     * 
     * @param priority the project priority
     * @return count of projects with the specified priority
     */
    long countByPriority(Priority priority);

    /**
     * Count active projects.
     * 
     * @param isActive the active status
     * @return count of active/inactive projects
     */
    long countByIsActive(Boolean isActive);

    /**
     * Find projects starting within date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of projects starting within the date range
     */
    @Query("SELECT p FROM Project p WHERE p.startDate BETWEEN :startDate AND :endDate")
    List<Project> findProjectsStartingBetween(@Param("startDate") LocalDate startDate,
                                             @Param("endDate") LocalDate endDate);

    /**
     * Find projects ending within date range.
     * 
     * @param startDate the start date
     * @param endDate the end date
     * @return list of projects ending within the date range
     */
    @Query("SELECT p FROM Project p WHERE p.endDate BETWEEN :startDate AND :endDate")
    List<Project> findProjectsEndingBetween(@Param("startDate") LocalDate startDate,
                                           @Param("endDate") LocalDate endDate);

    /**
     * Find the maximum ID in the projects table.
     * Used for generating the next available project ID.
     * 
     * @return the maximum ID as an optional string
     */
    @Query("SELECT MAX(p.id) FROM Project p")
    Optional<String> findMaxId();
}