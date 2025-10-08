import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';

// Authentication interfaces
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    department?: string;
    domain?: string;
    avatar?: string;
  };
  expiresIn?: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: string;
  department?: string;
  domain?: string;
}

// Authentication API Service
export class AuthApiService {
  // Login user
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/login', credentials);
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>('/auth/register', userData);
  }

  // Refresh token
  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return apiClient.post<{ token: string }>('/auth/refresh');
  }

  // Logout user
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/logout');
  }

  // Get current user profile
  async getCurrentUser(): Promise<ApiResponse<LoginResponse['user']>> {
    return apiClient.get<LoginResponse['user']>('/auth/me');
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Forgot password
  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/forgot-password', { email });
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/reset-password', {
      token,
      newPassword,
    });
  }
}

// Export singleton instance
export const authApiService = new AuthApiService();
