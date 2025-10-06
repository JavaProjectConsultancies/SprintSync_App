import { useState, useEffect } from 'react';
import { projectApiService } from '../../services/api';
import { Project } from '../../types/api';

interface UseProjectsReturn {
  data: Project[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  createProject: (project: Project) => Promise<Project>;
  updateProject: (id: string, project: Project) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

export const useProjects = (): UseProjectsReturn => {
  const [data, setData] = useState<Project[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching projects from API...');
      const response = await projectApiService.getProjects();
      console.log('Projects API response:', response);
      // Handle the new API response format: { content: Project[], totalElements: number, ... }
      const projectsData = response.data?.content || response.data || [];
      console.log('Processed projects data:', projectsData);
      setData(projectsData);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (project: Project): Promise<Project> => {
    try {
      const response = await projectApiService.createProject(project);
      await fetchProjects(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create project');
    }
  };

  const updateProject = async (id: string, project: Project): Promise<Project> => {
    try {
      const response = await projectApiService.updateProject(id, project);
      await fetchProjects(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update project');
    }
  };

  const deleteProject = async (id: string): Promise<void> => {
    try {
      await projectApiService.deleteProject(id);
      await fetchProjects(); // Refresh the list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete project');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
};

// Hook for creating projects
export const useCreateProject = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProject = async (project: Project): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      const response = await projectApiService.createProject(project);
      return response.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create project');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    loading,
    error,
  };
};
