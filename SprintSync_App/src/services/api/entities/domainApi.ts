import apiClient from '../client';
import { Domain, Page } from '../../types/api';

const BASE_URL = '/domains';

export const domainApiService = {
  // Basic CRUD operations
  createDomain: (domain: Domain) => 
    apiClient.post<Domain>(BASE_URL, domain),
  
  getDomainById: (id: string) => 
    apiClient.get<Domain>(`${BASE_URL}/${id}`),
  
  getDomains: (params?: any) => 
    apiClient.get<Page<Domain>>(BASE_URL, { params }),
  
  getAllDomains: () => 
    apiClient.get<Domain[]>(`${BASE_URL}/all`),
  
  updateDomain: (id: string, domain: Partial<Domain>) => 
    apiClient.put<Domain>(`${BASE_URL}/${id}`, domain),
  
  deleteDomain: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Search and filter operations
  searchDomains: (query: string, params?: any) => 
    apiClient.get<Domain[]>(`${BASE_URL}/search`, { 
      params: { ...params, name: query } 
    }),

  // Status operations
  setDomainActiveStatus: (id: string, isActive: boolean) => 
    apiClient.patch<void>(`${BASE_URL}/${id}/active`, null, { 
      params: { isActive } 
    }),

  getActiveDomains: (params?: any) => 
    apiClient.get<Domain[]>(`${BASE_URL}/active`, { params }),

  // Statistics
  getDomainStats: () => 
    apiClient.get<string>(`${BASE_URL}/stats`),
};
