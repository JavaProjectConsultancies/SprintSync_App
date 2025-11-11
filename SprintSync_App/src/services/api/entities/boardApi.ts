import apiClient from '../client';

export interface Board {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = '/boards';

export const boardApiService = {
  // Basic CRUD operations
  createBoard: (board: Partial<Board>) => 
    apiClient.post<Board>(BASE_URL, board),
  
  getBoardById: (id: string) => 
    apiClient.get<Board>(`${BASE_URL}/${id}`),
  
  getAllBoards: () => 
    apiClient.get<Board[]>(BASE_URL),
  
  updateBoard: (id: string, board: Partial<Board>) => 
    apiClient.put<Board>(`${BASE_URL}/${id}`, board),
  
  deleteBoard: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Project-specific operations
  getBoardsByProject: (projectId: string) => 
    apiClient.get<Board[]>(`${BASE_URL}/project/${projectId}`),

  getDefaultBoard: (projectId: string) => 
    apiClient.get<Board>(`${BASE_URL}/project/${projectId}/default`),

  // Create board from default (copies lanes excluding QA)
  createBoardFromDefault: (projectId: string, name: string, description?: string) =>
    apiClient.post<Board>(`${BASE_URL}/create-from-default`, {
      projectId,
      name,
      description
    }),
};

