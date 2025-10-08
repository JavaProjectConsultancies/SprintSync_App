import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authApiService, LoginResponse } from '../services/api/authApi';
import { apiClient } from '../services/api/client';

// Define role permissions
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['view_projects', 'manage_projects', 'view_team', 'manage_users', 'view_analytics', 'manage_system'],
  manager: ['view_projects', 'manage_projects', 'view_team', 'view_analytics'],
  developer: ['view_projects', 'view_team'],
  designer: ['view_projects', 'view_team']
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token management
const TOKEN_KEY = 'sprintsync_token';
const USER_KEY = 'sprintsync_user';

const saveAuthData = (token: string, user: User) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const getStoredAuthData = (): { token: string | null; user: User | null } => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  const user = userStr ? JSON.parse(userStr) : null;
  return { token, user };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const { token: storedToken, user: storedUser } = getStoredAuthData();
      
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

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setLoginError(null);

    try {
      console.log('Attempting login with API...');
      const response = await authApiService.login({ email, password });
      
      if (response.success && response.data) {
        const { token: authToken, user: userData } = response.data;
        
        // Convert API user format to local User format
        const localUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role.toLowerCase() as UserRole,
          avatar: userData.avatar,
          department: userData.department,
          domain: userData.domain,
          assignedProjects: [], // This would come from a separate API call
        };

        setToken(authToken);
        setUser(localUser);
        saveAuthData(authToken, localUser);
        apiClient.setAuthToken(authToken);
        
        console.log('Login successful:', localUser);
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

  const logout = () => {
    setUser(null);
    setToken(null);
    clearAuthData();
    apiClient.removeAuthToken();
    setLoginError(null);
    console.log('User logged out');
  };

  const refreshUser = async (): Promise<void> => {
    if (!token) return;

    try {
      const response = await authApiService.getCurrentUser();
      if (response.success && response.data) {
        const userData = response.data;
        const localUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role.toLowerCase() as UserRole,
          avatar: userData.avatar,
          department: userData.department,
          domain: userData.domain,
          assignedProjects: [],
        };
        
        setUser(localUser);
        saveAuthData(token, localUser);
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
    
    // Admin can access all projects
    if (user.role === 'admin') return true;
    
    // For now, allow all users to access all projects
    // In a real app, this would check user's assigned projects
    return true;
  };

  const clearLoginError = () => {
    setLoginError(null);
  };

  const setAuthState = (authToken: string, userData: any) => {
    console.log('Setting auth state with token:', authToken);
    console.log('Setting auth state with user data:', userData);
    
    // Convert API user format to local User format
    const localUser: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role.toLowerCase() as UserRole,
      avatar: userData.avatarUrl,
      department: userData.departmentId,
      domain: userData.domainId,
      assignedProjects: [], // This would come from a separate API call
    };

    setToken(authToken);
    setUser(localUser);
    saveAuthData(authToken, localUser);
    apiClient.setAuthToken(authToken);
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
