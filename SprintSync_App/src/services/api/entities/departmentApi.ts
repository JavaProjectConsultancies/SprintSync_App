import apiClient from '../client';
import { Department, Page } from '../../types/api';

const BASE_URL = '/departments';

export const departmentApiService = {
  // Basic CRUD operations
  createDepartment: (department: Department) => 
    apiClient.post<Department>(BASE_URL, department),
  
  getDepartmentById: (id: string) => 
    apiClient.get<Department>(`${BASE_URL}/${id}`),
  
  getDepartments: (params?: any) => 
    apiClient.get<Page<Department>>(BASE_URL, { params }),
  
  getAllDepartments: () => 
    apiClient.get<Department[]>(`${BASE_URL}/all`),
  
  updateDepartment: (id: string, department: Partial<Department>) => 
    apiClient.put<Department>(`${BASE_URL}/${id}`, department),
  
  deleteDepartment: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Search and filter operations
  searchDepartments: (query: string, params?: any) => 
    apiClient.get<Department[]>(`${BASE_URL}/search`, { 
      params: { ...params, name: query } 
    }),

  // Status operations
  setDepartmentActiveStatus: (id: string, isActive: boolean) => 
    apiClient.patch<void>(`${BASE_URL}/${id}/active`, null, { 
      params: { isActive } 
    }),

  getActiveDepartments: (params?: any) => 
    apiClient.get<Department[]>(`${BASE_URL}/active`, { params }),

  // Statistics
  getDepartmentStats: () => 
    apiClient.get<string>(`${BASE_URL}/stats`),
};
