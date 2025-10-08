import { useState, useEffect } from 'react';
import { epicApiService } from '../../services/api/entities/epicApi';
import { Epic } from '../../types/api';

export const useEpics = () => {
  const [data, setData] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEpics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await epicApiService.getAllEpics();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch epics');
      console.error('Error fetching epics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEpics();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchEpics
  };
};

export const useCreateEpic = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEpic = async (epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await epicApiService.createEpic(epic);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create epic';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEpic,
    loading,
    error
  };
};

export const useUpdateEpic = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateEpic = async (id: string, epic: Partial<Epic>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await epicApiService.updateEpic(id, epic);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update epic';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateEpic,
    loading,
    error
  };
};

export const useDeleteEpic = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteEpic = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await epicApiService.deleteEpic(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete epic';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteEpic,
    loading,
    error
  };
};

// Standalone functions for direct use
export const createEpic = async (epic: Omit<Epic, 'id' | 'createdAt' | 'updatedAt'>) => {
  return epicApiService.createEpic(epic);
};

export const updateEpic = async (id: string, epic: Partial<Epic>) => {
  return epicApiService.updateEpic(id, epic);
};

export const deleteEpic = async (id: string) => {
  return epicApiService.deleteEpic(id);
};
