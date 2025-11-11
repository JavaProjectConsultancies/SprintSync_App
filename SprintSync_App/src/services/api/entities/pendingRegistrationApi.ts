import { apiClient, ApiResponse } from '../client';

export interface PendingRegistration {
  id: string;
  email: string;
  name: string;
  role: string;
  departmentId?: string;
  domainId?: string;
  createdAt: string;
  updatedAt: string;
}

// Pending Registration API Service
export class PendingRegistrationApiService {
  // Get all pending registrations
  async getPendingRegistrations(): Promise<ApiResponse<PendingRegistration[]>> {
    const response = await apiClient.get<any>('/pending-registrations');
    
    // Handle response structure
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return {
        ...response,
        data: response.data.data
      };
    }
    
    return response as ApiResponse<PendingRegistration[]>;
  }

  // Get pending registration by ID
  async getPendingRegistrationById(id: string): Promise<ApiResponse<PendingRegistration>> {
    const response = await apiClient.get<any>(`/pending-registrations/${id}`);
    
    if (response.data && response.data.data) {
      return {
        ...response,
        data: response.data.data
      };
    }
    
    return response as ApiResponse<PendingRegistration>;
  }

  // Delete pending registration (cancel)
  async deletePendingRegistration(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/pending-registrations/${id}`);
  }

  // Approve pending registration and create user
  async approvePendingRegistration(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.post<any>(`/pending-registrations/${id}/approve`);
    
    if (response.data && response.data.data) {
      return {
        ...response,
        data: response.data.data
      };
    }
    
    return response;
  }
}

export const pendingRegistrationApiService = new PendingRegistrationApiService();

