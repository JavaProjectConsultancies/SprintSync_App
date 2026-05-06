import apiClient from '../client';
import { API_ENDPOINTS } from '../config';

export interface ScrumBoard {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = API_ENDPOINTS.SCRUM_BOARD;

export const scrumBoardApiService = {
  getBoardsByProject: (projectId: string) => 
    apiClient.get<ScrumBoard[]>(`${BASE_URL}/project/${projectId}`),
  
  createBoard: (board: Partial<ScrumBoard>) => 
    apiClient.post<ScrumBoard>(BASE_URL, board),

  deleteBoard: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),
};
