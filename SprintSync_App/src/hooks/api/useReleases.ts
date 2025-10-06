import { useState, useEffect } from 'react';
import { releaseApiService } from '../../services/api/entities/releaseApi';
import { Release } from '../../types/api';

export const useReleases = () => {
  const [data, setData] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await releaseApiService.getAllReleases();
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch releases');
      console.error('Error fetching releases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReleases();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchReleases
  };
};

export const useCreateRelease = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRelease = async (release: Omit<Release, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await releaseApiService.createRelease(release);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create release';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createRelease,
    loading,
    error
  };
};

export const useUpdateRelease = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateRelease = async (id: string, release: Partial<Release>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await releaseApiService.updateRelease(id, release);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update release';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateRelease,
    loading,
    error
  };
};

export const useDeleteRelease = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteRelease = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await releaseApiService.deleteRelease(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete release';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteRelease,
    loading,
    error
  };
};

// Standalone functions for direct use
export const createRelease = async (release: Omit<Release, 'id' | 'createdAt' | 'updatedAt'>) => {
  return releaseApiService.createRelease(release);
};

export const updateRelease = async (id: string, release: Partial<Release>) => {
  return releaseApiService.updateRelease(id, release);
};

export const deleteRelease = async (id: string) => {
  return releaseApiService.deleteRelease(id);
};
