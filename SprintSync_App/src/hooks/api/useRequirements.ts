import { useState, useEffect } from 'react';
import { requirementApiService, Requirement } from '../../services/api/entities/requirementApi';

export interface UseRequirementsResult {
  requirements: Requirement[];
  loading: boolean;
  error: { message: string; status?: number } | null;
  createRequirement: (requirement: Omit<Requirement, 'id'>) => Promise<Requirement | null>;
  updateRequirement: (id: string, requirement: Partial<Requirement>) => Promise<Requirement | null>;
  deleteRequirement: (id: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useRequirements = (projectId?: string): UseRequirementsResult => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  const fetchRequirements = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await requirementApiService.getRequirementsByProjectId(projectId);
      
      if (response.success) {
        setRequirements(response.data);
      } else {
        setError({ message: 'Failed to fetch requirements' });
      }
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to fetch requirements',
        status: err.response?.status
      });
    } finally {
      setLoading(false);
    }
  };

  const createRequirement = async (requirement: Omit<Requirement, 'id'>): Promise<Requirement | null> => {
    try {
      setError(null);
      
      const response = await requirementApiService.createRequirement(requirement);
      
      if (response.success) {
        const newRequirement = response.data;
        setRequirements(prev => [...prev, newRequirement]);
        return newRequirement;
      } else {
        setError({ message: 'Failed to create requirement' });
        return null;
      }
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to create requirement',
        status: err.response?.status
      });
      return null;
    }
  };

  const updateRequirement = async (id: string, requirement: Partial<Requirement>): Promise<Requirement | null> => {
    try {
      setError(null);
      
      const response = await requirementApiService.updateRequirement(id, requirement);
      
      if (response.success) {
        const updatedRequirement = response.data;
        setRequirements(prev => prev.map(req => req.id === id ? updatedRequirement : req));
        return updatedRequirement;
      } else {
        setError({ message: 'Failed to update requirement' });
        return null;
      }
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to update requirement',
        status: err.response?.status
      });
      return null;
    }
  };

  const deleteRequirement = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await requirementApiService.deleteRequirement(id);
      
      if (response.success) {
        setRequirements(prev => prev.filter(req => req.id !== id));
        return true;
      } else {
        setError({ message: 'Failed to delete requirement' });
        return false;
      }
    } catch (err: any) {
      setError({
        message: err.message || 'Failed to delete requirement',
        status: err.response?.status
      });
      return false;
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, [projectId]);

  return {
    requirements,
    loading,
    error,
    createRequirement,
    updateRequirement,
    deleteRequirement,
    refetch: fetchRequirements
  };
};
