import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContextEnhanced';
import { projectRolesApiService, UserProjectRoles, ProjectRoleInfo } from '../services/api/entities/projectRolesApi';
import { secureStorage } from '../services/api/encryptionUtils';
import { API_CONFIG } from '../services/api/config';

const TOKEN_KEY = 'sprintsync_token';

/**
 * Available role types for role switching
 */
export type SwitchableRole = 'developer' | 'manager';

/**
 * Role Switcher Context Type
 */
interface RoleSwitcherContextType {
    /** Currently active role for UI permissions */
    activeRole: SwitchableRole;
    /** List of roles available to the user (globally across all projects) */
    availableRoles: SwitchableRole[];
    /** User's roles per project */
    projectRoles: ProjectRoleInfo[];
    /** Currently selected project ID for role filtering */
    selectedProjectId: string | null;
    /** Roles available in the selected project */
    projectAvailableRoles: SwitchableRole[];
    /** Whether role data is being loaded */
    isLoading: boolean;
    /** Error message if loading failed */
    error: string | null;
    /** Switch to a different role */
    switchRole: (role: SwitchableRole) => void;
    /** Set the selected project for role filtering */
    setSelectedProject: (projectId: string | null) => void;
    /** Get user's role in a specific project */
    getRoleForProject: (projectId: string) => SwitchableRole | null;
    /** Check if user can use a specific role in the selected project */
    canUseRoleInProject: (role: SwitchableRole, projectId?: string) => boolean;
    /** Refresh roles from the API */
    refreshRoles: () => Promise<void>;
    /** Check if user has a specific role available (globally) */
    hasRole: (role: SwitchableRole) => boolean;
    /** Reset to user's original login role */
    resetToOriginalRole: () => void;
    /** Get user's original login role */
    originalRole: SwitchableRole;
}

const ACTIVE_ROLE_KEY = 'sprintsync_active_role';
const SELECTED_PROJECT_KEY = 'sprintsync_selected_project';

/**
 * Default context value
 */
const defaultContext: RoleSwitcherContextType = {
    activeRole: 'developer',
    availableRoles: ['developer'],
    projectRoles: [],
    selectedProjectId: null,
    projectAvailableRoles: ['developer'],
    isLoading: true,
    error: null,
    switchRole: () => { },
    setSelectedProject: () => { },
    getRoleForProject: () => null,
    canUseRoleInProject: () => false,
    refreshRoles: async () => { },
    hasRole: () => false,
    resetToOriginalRole: () => { },
    originalRole: 'developer',
};

const RoleSwitcherContext = createContext<RoleSwitcherContextType>(defaultContext);

/**
 * Provider component for role switching functionality
 */
export const RoleSwitcherProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, isAuthenticated } = useAuth();

    const [activeRole, setActiveRole] = useState<SwitchableRole>('developer');
    const [availableRoles, setAvailableRoles] = useState<SwitchableRole[]>(['developer']);
    const [projectRoles, setProjectRoles] = useState<ProjectRoleInfo[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * Get user's role in a specific project
     */
    const getRoleForProject = useCallback((projectId: string): SwitchableRole | null => {
        const projectRole = projectRoles.find(pr => pr.projectId === projectId);
        if (!projectRole) return null;

        const role = projectRole.role.toLowerCase();
        if (role === 'manager' || role === 'admin' || role === 'qa_manager') {
            return 'manager';
        }
        return 'developer';
    }, [projectRoles]);

    /**
     * Check if user can use a specific role in a project
     */
    const canUseRoleInProject = useCallback((role: SwitchableRole, projectId?: string): boolean => {
        const targetProjectId = projectId || selectedProjectId;

        // If no project selected, check global roles
        if (!targetProjectId) {
            return availableRoles.includes(role);
        }

        const projectRole = getRoleForProject(targetProjectId);

        // If user has no role in project, they can't use any role
        if (!projectRole) {
            return false;
        }

        // If user is a manager in the project, they can use both roles
        if (projectRole === 'manager') {
            return true;
        }

        // If user is a developer, they can only use developer role
        return role === 'developer';
    }, [selectedProjectId, availableRoles, getRoleForProject]);

    /**
     * Roles available in the currently selected project
     */
    const projectAvailableRoles = useMemo((): SwitchableRole[] => {
        if (!selectedProjectId) {
            return availableRoles;
        }

        const projectRole = getRoleForProject(selectedProjectId);

        if (!projectRole) {
            // User not in project - show no roles or fallback to developer
            return ['developer'];
        }

        if (projectRole === 'manager') {
            return ['developer', 'manager'];
        }

        return ['developer'];
    }, [selectedProjectId, availableRoles, getRoleForProject]);

    /**
     * Set selected project and adjust active role if needed
     */
    const setSelectedProject = useCallback((projectId: string | null) => {
        setSelectedProjectId(projectId);

        if (projectId) {
            const token = secureStorage.getItem(TOKEN_KEY, API_CONFIG.SIGNING_KEY);
            if (token) {
                secureStorage.setItem(SELECTED_PROJECT_KEY, projectId, token);
            }

            // Check if current active role is valid for this project
            const projectRole = getRoleForProject(projectId);

            if (projectRole) {
                // If user is developer in this project and active role is manager, switch to developer
                if (projectRole === 'developer' && activeRole === 'manager') {
                    setActiveRole('developer');
                    if (token) {
                        secureStorage.setItem(ACTIVE_ROLE_KEY, 'developer', token);
                    }
                }
            }
        } else {
            secureStorage.removeItem(SELECTED_PROJECT_KEY);
        }
    }, [getRoleForProject, activeRole]);

    /**
     * Fetch user's roles from the API
     */
    const fetchUserRoles = useCallback(async () => {
        if (!user?.id) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const rolesData = await projectRolesApiService.getUserProjectRoles(user.id);

            // Filter to only include switchable roles (developer, manager)
            const switchableRoles = rolesData.availableRoles.filter(
                (role): role is SwitchableRole => role === 'developer' || role === 'manager'
            );

            // Ensure at least 'developer' is available
            if (switchableRoles.length === 0) {
                switchableRoles.push('developer');
            }

            setAvailableRoles(switchableRoles);
            setProjectRoles(rolesData.projectRoles);

            // Restore saved project
            const token = secureStorage.getItem(TOKEN_KEY, API_CONFIG.SIGNING_KEY);
            if (token) {
                const savedProject = secureStorage.getItem(SELECTED_PROJECT_KEY, token);
                if (savedProject && rolesData.projectRoles.some(pr => pr.projectId === savedProject)) {
                    setSelectedProjectId(savedProject);
                }

                // Restore saved role or set default
                const savedRole = secureStorage.getItem(ACTIVE_ROLE_KEY, token) as SwitchableRole | null;
                if (savedRole && switchableRoles.includes(savedRole)) {
                    setActiveRole(savedRole);
                } else {
                    // Default to the highest available role (manager > developer)
                    const defaultRole = switchableRoles.includes('manager') ? 'manager' : 'developer';
                    setActiveRole(defaultRole);
                    if (token) {
                        secureStorage.setItem(ACTIVE_ROLE_KEY, defaultRole, token);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch user roles:', err);
            setError('Failed to load roles');
            // Fall back to user's global role
            const fallbackRole = user.role === 'manager' || user.role === 'admin' ? 'manager' : 'developer';
            setAvailableRoles([fallbackRole as SwitchableRole]);
            setActiveRole(fallbackRole as SwitchableRole);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, user?.role]);

    /**
     * Switch to a different role
     */
    const switchRole = useCallback((role: SwitchableRole) => {
        // Check if role is valid for selected project
        if (selectedProjectId) {
            if (!canUseRoleInProject(role, selectedProjectId)) {
                console.warn(`Cannot switch to ${role} - not available in selected project`);
                return;
            }
        } else if (!availableRoles.includes(role)) {
            return;
        }

        setActiveRole(role);
        const token = secureStorage.getItem(TOKEN_KEY, API_CONFIG.SIGNING_KEY);
        if (token) {
            secureStorage.setItem(ACTIVE_ROLE_KEY, role, token);
        }
    }, [availableRoles, selectedProjectId, canUseRoleInProject]);

    /**
     * Check if user has a specific role available
     */
    const hasRole = useCallback((role: SwitchableRole): boolean => {
        return availableRoles.includes(role);
    }, [availableRoles]);

    /**
     * Refresh roles from the API
     */
    const refreshRoles = useCallback(async () => {
        await fetchUserRoles();
    }, [fetchUserRoles]);

    /**
     * Get the user's original role from login
     */
    const originalRole: SwitchableRole = useMemo(() => {
        if (!user?.role) return 'developer';
        const role = user.role.toLowerCase();
        if (role === 'manager' || role === 'admin' || role === 'qa_manager') {
            return 'manager';
        }
        return 'developer';
    }, [user?.role]);

    /**
     * Reset active role back to user's original login role
     */
    const resetToOriginalRole = useCallback(() => {
        setActiveRole(originalRole);
        const token = secureStorage.getItem(TOKEN_KEY, API_CONFIG.SIGNING_KEY);
        if (token) {
            secureStorage.setItem(ACTIVE_ROLE_KEY, originalRole, token);
        }
    }, [originalRole]);

    // Fetch roles when user changes or authenticates
    useEffect(() => {
        if (isAuthenticated && user?.id) {
            fetchUserRoles();
        } else {
            // Reset when logged out
            setActiveRole('developer');
            setAvailableRoles(['developer']);
            setProjectRoles([]);
            setSelectedProjectId(null);
            setIsLoading(false);
            secureStorage.removeItem(ACTIVE_ROLE_KEY);
            secureStorage.removeItem(SELECTED_PROJECT_KEY);
        }
    }, [isAuthenticated, user?.id, fetchUserRoles]);

    const value: RoleSwitcherContextType = {
        activeRole,
        availableRoles,
        projectRoles,
        selectedProjectId,
        projectAvailableRoles,
        isLoading,
        error,
        switchRole,
        setSelectedProject,
        getRoleForProject,
        canUseRoleInProject,
        refreshRoles,
        hasRole,
        resetToOriginalRole,
        originalRole,
    };

    return (
        <RoleSwitcherContext.Provider value={value}>
            {children}
        </RoleSwitcherContext.Provider>
    );
};

/**
 * Hook to use the role switcher context
 */
export const useRoleSwitcher = (): RoleSwitcherContextType => {
    const context = useContext(RoleSwitcherContext);
    if (context === defaultContext) {
        console.warn('useRoleSwitcher is being used outside of RoleSwitcherProvider');
    }
    return context;
};

export default RoleSwitcherContext;
