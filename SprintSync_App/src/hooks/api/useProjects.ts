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
      
      // Try /all endpoint first, fallback to paginated with large size
      let response;
      try {
        console.log('Attempting to fetch from /all endpoint...');
        response = await projectApiService.getAllProjects();
        console.log('Projects API response from /all endpoint:', response);
        console.log('Response data type:', typeof response.data);
        console.log('Response data is array:', Array.isArray(response.data));
      } catch (err: any) {
        console.warn('Failed to fetch from /all endpoint, trying paginated:', err);
        console.warn('Error details:', {
          message: err?.message,
          status: err?.status,
          code: err?.code,
          details: err?.details
        });
        
        // If timeout, try with smaller page size and timeout handling
        if (err?.code === 'TIMEOUT' || err?.status === 408) {
          console.log('Timeout occurred, trying with smaller page size...');
          try {
            response = await projectApiService.getProjects({ page: 0, size: 10 });
            console.log('Projects API response from paginated endpoint (small page):', response);
          } catch (timeoutErr: any) {
            console.error('Small page size also timed out:', timeoutErr);
            throw timeoutErr;
          }
        } else {
          // For other errors, try paginated endpoint with large page size
          try {
            response = await projectApiService.getProjects({ page: 0, size: 1000 });
            console.log('Projects API response from paginated endpoint:', response);
            console.log('Response data type:', typeof response.data);
            console.log('Response data is array:', Array.isArray(response.data));
          } catch (secondErr: any) {
            console.error('Both endpoints failed:', {
              firstError: err,
              secondError: secondErr
            });
            throw secondErr; // Throw the second error to be caught by outer catch
          }
        }
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
