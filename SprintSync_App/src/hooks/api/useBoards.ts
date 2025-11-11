import { useApi, useApiMutation } from './useApi';
import { boardApiService, Board } from '../../services/api/entities/boardApi';

// Hook for fetching all boards
export function useBoards() {
  return useApi(
    () => boardApiService.getAllBoards(),
    []
  );
}

// Hook for fetching a single board
export function useBoard(id: string) {
  return useApi(
    () => boardApiService.getBoardById(id),
    [id],
    !!id
  );
}

// Hook for fetching boards by project
export function useBoardsByProject(projectId: string) {
  return useApi(
    () => projectId && projectId !== 'SKIP' 
      ? boardApiService.getBoardsByProject(projectId) 
      : Promise.resolve({ data: [] as Board[], success: true, message: '', status: 200 }),
    [projectId],
    !!(projectId && projectId !== 'SKIP')
  );
}

// Hook for fetching default board
export function useDefaultBoard(projectId: string) {
  return useApi(
    () => projectId && projectId !== 'SKIP' 
      ? boardApiService.getDefaultBoard(projectId) 
      : Promise.resolve({ data: null as Board | null, success: true, message: '', status: 200 }),
    [projectId],
    !!(projectId && projectId !== 'SKIP')
  );
}

// Hook for creating a board
export function useCreateBoard() {
  return useApiMutation<Board, Partial<Board>>(
    (board) => boardApiService.createBoard(board)
  );
}

// Hook for creating a board from default (copies lanes excluding QA)
export function useCreateBoardFromDefault() {
  return useApiMutation<Board, { projectId: string; name: string; description?: string }>(
    ({ projectId, name, description }) => boardApiService.createBoardFromDefault(projectId, name, description)
  );
}

// Hook for updating a board
export function useUpdateBoard() {
  return useApiMutation<Board, { id: string; board: Partial<Board> }>(
    ({ id, board }) => boardApiService.updateBoard(id, board)
  );
}

// Hook for deleting a board
export function useDeleteBoard() {
  return useApiMutation<void, string>(
    (id) => boardApiService.deleteBoard(id)
  );
}

