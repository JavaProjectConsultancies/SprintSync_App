package com.sprintsync.api.repository;

import com.sprintsync.api.entity.ProjectTeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for ProjectTeamMember entity operations
 */
@Repository
public interface ProjectTeamMemberRepository extends JpaRepository<ProjectTeamMember, String> {
    
    /**
     * Find all team members for a specific project
     * @param projectId the project ID
     * @return list of project team members
     */
    List<ProjectTeamMember> findByProjectId(String projectId);
    
    /**
     * Find all projects for a specific user
     * @param userId the user ID
     * @return list of project team members
     */
    List<ProjectTeamMember> findByUserId(String userId);
    
    /**
     * Find team member by project and user
     * @param projectId the project ID
     * @param userId the user ID
     * @return project team member if found
     */
    ProjectTeamMember findByProjectIdAndUserId(String projectId, String userId);
    
    /**
     * Check if user is assigned to project
     * @param projectId the project ID
     * @param userId the user ID
     * @return true if user is assigned to project
     */
    boolean existsByProjectIdAndUserId(String projectId, String userId);
}
