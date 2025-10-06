import { apiClient, ApiResponse, PaginationParams } from '../client';
import { API_ENDPOINTS } from '../config';
import { User, Department, Domain } from '../../../types/api';

// User API Service
export class UserApiService {
  // Get all users with pagination
  async getUsers(params?: PaginationParams): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<any>(API_ENDPOINTS.USERS, params);
    
    // Handle paginated response - extract content array
    if (response.data && response.data.content && Array.isArray(response.data.content)) {
      return {
        ...response,
        data: response.data.content
      };
    }
    
    // Fallback for non-paginated response
    return response as ApiResponse<User[]>;
  }

  // Get user by ID
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`${API_ENDPOINTS.USERS}/${id}`);
  }

  // Create new user
  async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<User>> {
    return apiClient.post<User>(API_ENDPOINTS.USERS, user);
  }

  // Update user
  async updateUser(id: string, user: Partial<User>): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`${API_ENDPOINTS.USERS}/${id}`, user);
  }

  // Delete user
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.USERS}/${id}`);
  }

  // Search users
  async searchUsers(query: string, params?: PaginationParams): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.USERS}/search`, {
      ...params,
      query,
    });
    
    // Handle paginated response - extract content array
    if (response.data && response.data.content && Array.isArray(response.data.content)) {
      return {
        ...response,
        data: response.data.content
      };
    }
    
    return response as ApiResponse<User[]>;
  }

  // Get users by department
  async getUsersByDepartment(departmentId: string, params?: PaginationParams): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.USERS}/department/${departmentId}`, params);
    
    // Handle paginated response - extract content array
    if (response.data && response.data.content && Array.isArray(response.data.content)) {
      return {
        ...response,
        data: response.data.content
      };
    }
    
    return response as ApiResponse<User[]>;
  }

  // Get users by domain
  async getUsersByDomain(domainId: string, params?: PaginationParams): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.USERS}/domain/${domainId}`, params);
    
    // Handle paginated response - extract content array
    if (response.data && response.data.content && Array.isArray(response.data.content)) {
      return {
        ...response,
        data: response.data.content
      };
    }
    
    return response as ApiResponse<User[]>;
  }

  // Get active users
  async getActiveUsers(params?: PaginationParams): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.USERS}/active`, params);
    
    // Handle paginated response - extract content array
    if (response.data && response.data.content && Array.isArray(response.data.content)) {
      return {
        ...response,
        data: response.data.content
      };
    }
    
    return response as ApiResponse<User[]>;
  }

  // Update user status
  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<User>> {
    return apiClient.patch<User>(`${API_ENDPOINTS.USERS}/${id}/status`, { isActive });
  }

  // Get user statistics
  async getUserStatistics(): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${API_ENDPOINTS.USERS}/statistics`);
  }
}

// Department API Service
export class DepartmentApiService {
  // Get all departments
  async getDepartments(params?: PaginationParams): Promise<ApiResponse<Department[]>> {
    return apiClient.get<Department[]>(API_ENDPOINTS.DEPARTMENTS, params);
  }

  // Get department by ID
  async getDepartmentById(id: string): Promise<ApiResponse<Department>> {
    return apiClient.get<Department>(`${API_ENDPOINTS.DEPARTMENTS}/${id}`);
  }

  // Create new department
  async createDepartment(department: Omit<Department, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Department>> {
    return apiClient.post<Department>(API_ENDPOINTS.DEPARTMENTS, department);
  }

  // Update department
  async updateDepartment(id: string, department: Partial<Department>): Promise<ApiResponse<Department>> {
    return apiClient.put<Department>(`${API_ENDPOINTS.DEPARTMENTS}/${id}`, department);
  }

  // Delete department
  async deleteDepartment(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.DEPARTMENTS}/${id}`);
  }

  // Search departments
  async searchDepartments(query: string, params?: PaginationParams): Promise<ApiResponse<Department[]>> {
    return apiClient.get<Department[]>(`${API_ENDPOINTS.DEPARTMENTS}/search`, {
      ...params,
      query,
    });
  }

  // Get active departments
  async getActiveDepartments(params?: PaginationParams): Promise<ApiResponse<Department[]>> {
    return apiClient.get<Department[]>(`${API_ENDPOINTS.DEPARTMENTS}/active`, params);
  }
}

// Domain API Service
export class DomainApiService {
  // Get all domains
  async getDomains(params?: PaginationParams): Promise<ApiResponse<Domain[]>> {
    return apiClient.get<Domain[]>(API_ENDPOINTS.DOMAINS, params);
  }

  // Get domain by ID
  async getDomainById(id: string): Promise<ApiResponse<Domain>> {
    return apiClient.get<Domain>(`${API_ENDPOINTS.DOMAINS}/${id}`);
  }

  // Create new domain
  async createDomain(domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Domain>> {
    return apiClient.post<Domain>(API_ENDPOINTS.DOMAINS, domain);
  }

  // Update domain
  async updateDomain(id: string, domain: Partial<Domain>): Promise<ApiResponse<Domain>> {
    return apiClient.put<Domain>(`${API_ENDPOINTS.DOMAINS}/${id}`, domain);
  }

  // Delete domain
  async deleteDomain(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.DOMAINS}/${id}`);
  }

  // Search domains
  async searchDomains(query: string, params?: PaginationParams): Promise<ApiResponse<Domain[]>> {
    return apiClient.get<Domain[]>(`${API_ENDPOINTS.DOMAINS}/search`, {
      ...params,
      query,
    });
  }

  // Get active domains
  async getActiveDomains(params?: PaginationParams): Promise<ApiResponse<Domain[]>> {
    return apiClient.get<Domain[]>(`${API_ENDPOINTS.DOMAINS}/active`, params);
  }
}

// Export singleton instances
export const userApiService = new UserApiService();
export const departmentApiService = new DepartmentApiService();
export const domainApiService = new DomainApiService();
