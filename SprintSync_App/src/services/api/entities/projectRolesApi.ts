import { apiClient } from '../client';

/**
 * Interface for project role information
 */
export interface ProjectRoleInfo {
    projectId: string;
    projectName: string;
    role: string;
}

/**
 * Interface for user's project roles response
 */
export interface UserProjectRoles {
    userId: string;
    projectRoles: ProjectRoleInfo[];
    availableRoles: string[];
}

/**
 * API service for fetching user's project roles
 */
export const projectRolesApiService = {
    /**
     * Fetch all project roles for a specific user
     * @param userId - The user ID to fetch roles for
     * @returns Promise<UserProjectRoles> - User's roles across all projects
     */
    getUserProjectRoles: async (userId: string): Promise<UserProjectRoles> => {
        try {
            // apiClient.get returns ApiResponse<T> with { data, success, status, message }
            // The backend returns { success: true, data: UserProjectRoles }
            const response = await apiClient.get<{ success: boolean; data: UserProjectRoles }>(
                `/project-team-members/user/${userId}/roles`
            );

            // response.data is the raw response body which has { success, data: UserProjectRoles }
            if (response.success && response.data?.data) {
                return response.data.data;
            }

            throw new Error('Failed to fetch user project roles');
        } catch (error) {
            console.error('Error fetching user project roles:', error);
            // Return default response on error
            return {
                userId,
                projectRoles: [],
                availableRoles: ['developer']
            };
        }
    }
};
