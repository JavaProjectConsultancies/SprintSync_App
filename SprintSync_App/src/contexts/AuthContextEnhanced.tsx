import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, UserRole } from '../types';
import { authApiService, LoginResponse } from '../services/api/authApi';
import { apiClient } from '../services/api/client';
import { toast } from 'sonner';
import { secureStorage } from '../services/api/encryptionUtils';
import { API_CONFIG } from '../services/api/config';

const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['view_projects', 'manage_projects', 'view_team', 'manage_users', 'view_analytics', 'manage_system'],
  manager: ['view_projects', 'manage_projects', 'view_team', 'view_analytics'],
  developer: ['view_projects', 'view_team'],
  qa_manager: ['view_projects', 'manage_projects', 'view_team', 'view_analytics'],
  qa_developer: ['view_projects', 'view_team', 'view_analytics'],
  master_admin: ['view_projects', 'view_team', 'view_analytics', 'view_all_data'],
  support_and_implementation: ['view_projects', 'manage_projects', 'view_team', 'view_analytics']
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessProject: (projectId: string) => boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  loginError: string | null;
  clearLoginError: () => void;
  refreshUser: () => Promise<void>;
  setAuthState: (token: string, userData: any) => void;
}

// Create context with a default value to prevent "must be used within AuthProvider" errors
const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  login: async () => false,
  logout: () => { },
  hasPermission: () => false,
  canAccessProject: () => false,
  isLoading: true,
  isAuthenticated: false,
  loginError: null,
  clearLoginError: () => { },
  refreshUser: async () => { },
  setAuthState: () => { },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

// Token management
const TOKEN_KEY = 'sprintsync_token';
const USER_KEY = 'sprintsync_user';
const SESSION_TIMESTAMP_KEY = 'sprintsync_session_timestamp';
// Session duration: 1 minute (for testing; increase to 30 * 60 * 1000 for 30 minutes)
const SESSION_DURATION_MS = 30* 60 * 1000;

const refreshSessionTimestamp = () => {
  try {
    localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Ignore storage errors
  }
};

const saveAuthData = (token: string, user: User) => {
  secureStorage.setItem(TOKEN_KEY, token, API_CONFIG.SIGNING_KEY);
  secureStorage.setItem(USER_KEY, user, token);
  // Store or refresh timestamp for session expiration
  refreshSessionTimestamp();
};

const clearAuthData = () => {
  // Get user ID before removing user data (needed for clearing user-specific cache)
  let userId: string | null = null;
  try {
    const token = secureStorage.getItem(TOKEN_KEY, API_CONFIG.SIGNING_KEY);
    if (token) {
      const user = secureStorage.getItem(USER_KEY, token);
      userId = user?.id || null;
    }
  } catch (error) {
    // Ignore parse errors
  }

  // Remove auth data
  secureStorage.removeItem(TOKEN_KEY);
  secureStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_TIMESTAMP_KEY);

  // Clear all other cache-related localStorage items
  try {
    // Clear projects cache
    localStorage.removeItem('sprintsync_projects_cache');

    // Clear dashboard filters
    if (userId) {
      localStorage.removeItem(`dashboard-filters-${userId}`);
    }
    localStorage.removeItem('dashboard-filters');

    // Clear any other sprint sync related cache
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sprintsync_') || key.startsWith('sprintSync-'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

const getStoredAuthData = (): { token: string | null; user: User | null } => {
  const token = secureStorage.getItem(TOKEN_KEY, API_CONFIG.SIGNING_KEY);
  if (!token) return { token: null, user: null };
  const user = secureStorage.getItem(USER_KEY, token);
  return { token, user };
};

// Check if session has expired
const isSessionExpired = (): boolean => {
  const timestampStr = localStorage.getItem(SESSION_TIMESTAMP_KEY);
  if (!timestampStr) {
    return true; // No timestamp means expired
  }

  const loginTimestamp = parseInt(timestampStr, 10);
  if (isNaN(loginTimestamp)) {
    return true; // Invalid timestamp means expired
  }

  const now = Date.now();
  const elapsed = now - loginTimestamp;
  return elapsed >= SESSION_DURATION_MS;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const logout = useCallback(() => {
    // Invalidate projects cache on logout
    import('../hooks/api/useProjects').then(({ invalidateProjectsCache }) => {
      invalidateProjectsCache();
    });

    setUser(null);
    setToken(null);
    clearAuthData();
    apiClient.removeAuthToken();
    setLoginError(null);
    console.log('User logged out');
  }, []);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const { token: storedToken, user: storedUser } = getStoredAuthData();

      // Check if session has expired
      if (isSessionExpired()) {
        console.log('Session expired, clearing auth data');
        try {
          // Set a flag so login page can show a toast
          sessionStorage.setItem('sprintsync_session_expired', '1');
        } catch {
          // Ignore storage errors
        }
        clearAuthData();
        setIsLoading(false);
        return;
      }

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
        apiClient.setAuthToken(storedToken);

        // Verify token is still valid
        try {
          await refreshUser();
        } catch (error) {
          console.log('Stored token is invalid, clearing auth data');
          logout();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up periodic session expiration check (every minute)
  useEffect(() => {
    if (!user || !token) {
      return;
    }

    const checkSessionExpiry = () => {
      if (isSessionExpired()) {
        console.log('Session expired, logging out user');
        try {
          // Set a flag so login page can show a toast after redirect
          sessionStorage.setItem('sprintsync_session_expired', '1');
        } catch {
          // Ignore storage errors
        }
        logout();
        // Show toast notification immediately as well
        toast.error('Your session has expired. Please log in again.');
        return true;
      }
      return false;
    };

    // Check immediately
    checkSessionExpiry();

    // Set up interval to check every minute
    const intervalId = setInterval(checkSessionExpiry, 60 * 1000); // Check every minute

    // On visibility change:
    // - when tab is hidden (blur): start timer from that moment
    // - when tab becomes visible (focus): if not expired, refresh session timestamp
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User moved away from the app – start timeout from this moment
        refreshSessionTimestamp();
      } else if (document.visibilityState === 'visible') {
        // User returned – if not yet expired, refresh session to keep them logged in
        const expired = checkSessionExpiry();
        if (!expired) {
          refreshSessionTimestamp();
        }
      }
    };

    // On user activity (mouse / keyboard / touch), refresh the session timer
    const handleUserActivity = () => {
      // Only refresh if the session is not already expired
      if (!isSessionExpired()) {
        refreshSessionTimestamp();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
    };
  }, [user, token, logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);

    try {
      console.log('Attempting login with API...');
      const response = await authApiService.login({ email, password });

      if (response.success && response.data) {
        const { token: authToken, user: userData } = response.data;

        // Extract name with fallbacks
        const userName = userData.name ||
          (userData as any).fullName ||
          (userData.email ? userData.email.split('@')[0] : 'User');

        // Convert API user format to local User format
        const localUser: User = {
          id: userData.id,
          name: userName,
          email: userData.email,
          role: (userData.role ? (typeof userData.role === 'string' ? userData.role.toLowerCase() : String(userData.role).toLowerCase()) : 'developer') as UserRole,
          avatar: (userData as any).avatarUrl || userData.avatar,
          department: (userData as any).departmentId || userData.department,
          domain: (userData as any).domainId || userData.domain,
          assignedProjects: [], // This would come from a separate API call
        };

        console.log('[AuthContext] Login - Setting user:', localUser);

        setToken(authToken);
        setUser(localUser);
        saveAuthData(authToken, localUser);
        apiClient.setAuthToken(authToken);

        // Prefetch projects immediately after login for faster page loads
        import('../hooks/api/useProjects').then(({ prefetchProjects, invalidateProjectsCache }) => {
          invalidateProjectsCache(localUser.id);
          prefetchProjects(localUser.id).catch(() => {
            // Silently fail - projects will be fetched when needed
          });
        });

        console.log('Login successful:', localUser);

        // Note: Navigation to dashboard should be handled by the component calling login
        // This ensures all users are redirected to dashboard after login

        return true;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';

      if (error.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.status === 403) {
        errorMessage = 'Account is disabled. Please contact administrator.';
      } else if (error.status === 404) {
        errorMessage = 'User not found. Please check your email.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setLoginError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    if (!token) return;

    try {
      const response = await authApiService.getCurrentUser();
      console.log('[AuthContext] Full API response:', JSON.stringify(response, null, 2));

      if (response.success && response.data) {
        // Handle nested data structure: response.data.data or response.data
        // The API might return: {success: true, data: {data: {user object}}}
        // Or: {success: true, data: {user object}}
        let userData = response.data;

        // Check if data is nested
        if ((userData as any).data && typeof (userData as any).data === 'object') {
          console.log('[AuthContext] Found nested data structure, extracting...');
          userData = (userData as any).data;
        }

        console.log('[AuthContext] Extracted user data:', JSON.stringify(userData, null, 2));

        if (!userData || (typeof userData === 'object' && !userData.id && !userData.email)) {
          console.error('[AuthContext] Invalid user data structure:', userData);
          console.error('[AuthContext] Response structure:', {
            hasData: !!response.data,
            dataType: typeof response.data,
            dataKeys: response.data ? Object.keys(response.data) : []
          });
          return;
        }

        // Safely handle role conversion with fallback
        let userRole: string = 'developer'; // Default role
        if (userData.role) {
          if (typeof userData.role === 'string') {
            userRole = userData.role.toLowerCase();
          } else {
            userRole = String(userData.role).toLowerCase();
          }
        }

        // Extract name with better fallbacks
        const userName = userData.name ||
          (userData as any).fullName ||
          (userData.email ? userData.email.split('@')[0] : null) ||
          'User';

        const localUser: User = {
          id: userData.id,
          name: userName,
          email: userData.email,
          role: (userRole as UserRole) || 'developer',
          avatar: userData.avatar || (userData as any).avatarUrl,
          department: userData.department || (userData as any).departmentId,
          domain: userData.domain || (userData as any).domainId,
          assignedProjects: [],
        };

        console.log('[AuthContext] Setting user:', localUser);
        setUser(localUser);
        saveAuthData(token, localUser);
      } else {
        console.error('[AuthContext] Failed to refresh user:', response);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, logout user
      logout();
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return ROLE_PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const canAccessProject = (projectId: string): boolean => {
    if (!user) return false;

    // Only admin, master_admin, and support_and_implementation can access all projects
    // manager, qa_manager, qa_developer, developer can only access their assigned projects
    if (user.role === 'admin' || user.role === 'master_admin' || user.role === 'support_and_implementation') return true;

    // Other roles can only access assigned projects
    return user.assignedProjects?.includes(projectId) || false;
  };

  const clearLoginError = () => {
    setLoginError(null);
  };

  const setAuthState = (authToken: string, userData: any) => {
    console.log('Setting auth state with token:', authToken);
    console.log('Setting auth state with user data:', userData);

    // Extract name with fallbacks
    const userName = userData.name ||
      userData.fullName ||
      (userData.email ? userData.email.split('@')[0] : 'User');

    // Convert API user format to local User format
    const localUser: User = {
      id: userData.id,
      name: userName,
      email: userData.email,
      role: (userData.role ? (typeof userData.role === 'string' ? userData.role.toLowerCase() : String(userData.role).toLowerCase()) : 'developer') as UserRole,
      avatar: userData.avatarUrl || userData.avatar,
      department: userData.departmentId || userData.department,
      domain: userData.domainId || userData.domain,
      assignedProjects: [], // This would come from a separate API call
    };

    setToken(authToken);
    setUser(localUser);
    saveAuthData(authToken, localUser); // This also saves the session timestamp
    apiClient.setAuthToken(authToken);

    // Prefetch projects immediately after setting auth state
    import('../hooks/api/useProjects').then(({ prefetchProjects, invalidateProjectsCache }) => {
      invalidateProjectsCache(localUser.id);
      prefetchProjects(localUser.id).catch(() => {
        // Silently fail - projects will be fetched when needed
      });
    });

    setLoginError(null);

    console.log('Auth state set successfully');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    hasPermission,
    canAccessProject,
    isLoading,
    isAuthenticated: !!user && !!token,
    loginError,
    clearLoginError,
    refreshUser,
    setAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  // Context will always have a value (either default or from provider)
  // Only throw if we can detect we're truly outside a provider
  // We can check if context is the default one by checking if it has the default login function
  if (context === defaultAuthContext && !context.user && context.isLoading === true) {
    // This is a heuristic - if we're using the default context and it hasn't been initialized,
    // we might be outside the provider. But since we provide a default, this should rarely happen.
    console.warn('useAuth may be called outside AuthProvider - using default context');
  }
  return context;
};
