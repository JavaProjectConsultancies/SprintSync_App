import { useState, useEffect } from 'react';
import { subtaskApiService } from '../../services/api';
import { Subtask } from '../../types/api';

interface UseSubtasksReturn {
  data: Subtask[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  createSubtask: (subtask: Subtask) => Promise<Subtask>;
  updateSubtask: (id: string, subtask: Subtask) => Promise<Subtask>;
  deleteSubtask: (id: string) => Promise<void>;
}

export const useSubtasks = (): UseSubtasksReturn => {
  const [data, setData] = useState<Subtask[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubtasks = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use paginated endpoint with large page size to get all subtasks
      const response = await subtaskApiService.getSubtasks({ page: 0, size: 10000 });
      const data = response.data as any;
      // Handle paginated response
      if (Array.isArray(data)) {
        setData(data);
      } else if (data?.content && Array.isArray(data.content)) {
        setData(data.content);
      } else if (data?.data && Array.isArray(data.data)) {
        setData(data.data);
      } else {
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subtasks'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const createSubtask = async (subtask: Subtask): Promise<Subtask> => {
    try {
      const response = await subtaskApiService.createSubtask(subtask);
      await fetchSubtasks(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create subtask');
    }
  };

  const updateSubtask = async (id: string, subtask: Subtask): Promise<Subtask> => {
    try {
      const response = await subtaskApiService.updateSubtask(id, subtask);
      await fetchSubtasks(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update subtask');
    }
  };

  const deleteSubtask = async (id: string): Promise<void> => {
    try {
      await subtaskApiService.deleteSubtask(id);
      await fetchSubtasks(); // Refresh the list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete subtask');
    }
  };

  useEffect(() => {
    fetchSubtasks();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchSubtasks,
    createSubtask,
    updateSubtask,
    deleteSubtask,
  };
};

// Export standalone functions for convenience
export const createSubtask = async (subtask: Subtask): Promise<Subtask> => {
  try {
    const response = await subtaskApiService.createSubtask(subtask);
    return response.data;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to create subtask');
  }
};

export const updateSubtask = async (id: string, subtask: Subtask): Promise<Subtask> => {
  try {
    const response = await subtaskApiService.updateSubtask(id, subtask);
    return response.data;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to update subtask');
  }
};

export const deleteSubtask = async (id: string): Promise<void> => {
  try {
    await subtaskApiService.deleteSubtask(id);
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to delete subtask');
  }
};
