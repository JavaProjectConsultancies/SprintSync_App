import apiClient from '../client';

export interface WorkflowLane {
  id: string;
  projectId: string;
  boardId?: string | null;
  title: string;
  color: string;
  objective?: string;
  wipLimitEnabled: boolean;
  wipLimit?: number;
  displayOrder: number;
  statusValue: string;
  createdAt?: string;
  updatedAt?: string;
}

const BASE_URL = '/workflow-lanes';

export const workflowLaneApiService = {
  // Basic CRUD operations
  createLane: (lane: Partial<WorkflowLane>) => 
    apiClient.post<WorkflowLane>(BASE_URL, lane),
  
  getLaneById: (id: string) => 
    apiClient.get<WorkflowLane>(`${BASE_URL}/${id}`),
  
  getAllLanes: () => 
    apiClient.get<WorkflowLane[]>(BASE_URL),
  
  updateLane: (id: string, lane: Partial<WorkflowLane>) => 
    apiClient.put<WorkflowLane>(`${BASE_URL}/${id}`, lane),
  
  deleteLane: (id: string) => 
    apiClient.delete<void>(`${BASE_URL}/${id}`),

  // Project-specific operations
  getLanesByProject: (projectId: string) => 
    apiClient.get<WorkflowLane[]>(`${BASE_URL}/project/${projectId}`),

  // Get lanes by project and board
  getLanesByProjectAndBoard: (projectId: string, boardId: string | null) => 
    boardId 
      ? apiClient.get<WorkflowLane[]>(`${BASE_URL}/project/${projectId}/board/${boardId}`)
      : apiClient.get<WorkflowLane[]>(`${BASE_URL}/project/${projectId}`),

  // Reorder lanes
  updateDisplayOrder: (laneIds: string[]) => 
    apiClient.put<void>(`${BASE_URL}/reorder`, laneIds),
};

