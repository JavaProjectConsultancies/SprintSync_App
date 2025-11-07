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
      
      let response;
      try {
        console.log('Attempting to fetch accessible projects for current user...');
        response = await projectApiService.getAccessibleProjects();
        console.log('Projects API response from /accessible endpoint:', response);
      } catch (err: any) {
        console.warn('Failed to fetch accessible projects, falling back to /all endpoint:', err);
        console.warn('Error details:', {
          message: err?.message,
          status: err?.status,
          code: err?.code,
          details: err?.details
        });

        response = await projectApiService.getAllProjects();
      }
      
      // projectApiService should normalize the response to an array
      // response.data should be an array after normalization
      let projectsData: Project[] = [];
      
      if (Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response?.data?.content && Array.isArray(response.data.content)) {
        // Fallback: if normalization didn't work, extract from content
        projectsData = response.data.content;
      } else {
        console.warn('Unexpected response format:', response);
        projectsData = [];
      }
      
      console.log('Processed projects data:', projectsData);
      console.log('Projects count:', projectsData.length);
      console.log('First project:', projectsData[0]);
      
      if (projectsData.length === 0) {
        console.warn('No projects found. This might be expected if the database is empty.');
      }
      
      setData(projectsData);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      console.error('Error details:', {
        message: err?.message,
        status: err?.status,
        code: err?.code,
        details: err?.details,
        stack: err?.stack
      });
      const errorMessage = err?.message || 'Failed to fetch projects';
      setError(new Error(errorMessage));
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
