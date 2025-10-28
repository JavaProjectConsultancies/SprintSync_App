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
    const startTime = Date.now();
    try {
      setLoading(true);
      setError(null);
      console.log('🔵 [useProjects] Starting fetch from:', 'http://localhost:8080/api/projects');
      console.log('🔵 [useProjects] Start time:', new Date().toISOString());
      
      const response = await projectApiService.getProjects();
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log('✅ [useProjects] Success! Duration:', duration, 'seconds');
      console.log('✅ [useProjects] Raw response:', response);
      console.log('✅ [useProjects] Response data structure:', {
        hasData: !!response.data,
        hasContent: !!(response.data as any)?.content,
        isArray: Array.isArray(response.data),
        dataType: typeof response.data
      });
      
      // Handle the new API response format: { content: Project[], totalElements: number, ... }
      // The backend might return paginated response or array directly
      const projectsData = (response.data as any)?.content || response.data || [];
      console.log('✅ [useProjects] Processed projects:', {
        count: Array.isArray(projectsData) ? projectsData.length : 0,
        projects: projectsData
      });
      
      setData(Array.isArray(projectsData) ? projectsData : []);
    } catch (err: any) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.error('❌ [useProjects] ERROR after', duration, 'seconds');
      console.error('❌ [useProjects] Error details:', {
        message: err?.message,
        code: err?.code,
        status: err?.status,
        fullError: err
      });
      
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      setData(null);
    } finally {
      setLoading(false);
      console.log('🏁 [useProjects] Fetch complete');
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
