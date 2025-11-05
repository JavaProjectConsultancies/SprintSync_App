import apiClient, { ApiResponse } from '../client';
import { Attachment } from '../../../types/api';

const BASE_URL = '/attachments';

export const attachmentApiService = {
  // Basic CRUD operations
  createAttachment: async (attachment: Omit<Attachment, 'id' | 'createdAt'>): Promise<ApiResponse<Attachment>> => 
    apiClient.post<Attachment>(BASE_URL, attachment),
  
  getAttachmentById: async (id: string): Promise<ApiResponse<Attachment>> => 
    apiClient.get<Attachment>(`${BASE_URL}/${id}`),
  
  deleteAttachment: async (id: string): Promise<ApiResponse<void>> => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Entity-specific operations
  getAttachmentsByEntity: async (entityType: string, entityId: string): Promise<ApiResponse<Attachment[]>> => 
    apiClient.get<Attachment[]>(`${BASE_URL}/entity/${entityType}/${entityId}`),

  // User-specific operations
  getAttachmentsByUser: async (userId: string): Promise<ApiResponse<Attachment[]>> => 
    apiClient.get<Attachment[]>(`${BASE_URL}/user/${userId}`),

  // Public attachments
  getPublicAttachments: async (): Promise<ApiResponse<Attachment[]>> => 
    apiClient.get<Attachment[]>(`${BASE_URL}/public`),

  // Count operations
  countAttachmentsByEntity: async (entityType: string, entityId: string): Promise<ApiResponse<{ count: number }>> => 
    apiClient.get<{ count: number }>(`${BASE_URL}/count/entity/${entityType}/${entityId}`),
};

