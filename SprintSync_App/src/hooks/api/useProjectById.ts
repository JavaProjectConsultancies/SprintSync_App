import { useState, useEffect } from 'react';
import { projectApiService } from '../../services/api/entities/projectApi';

export interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  priority: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  managerId: string;
  department: string;
  teamMembers: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
    skills?: string[];
    availability?: number;
    department?: string;
    experience?: string;
    hourlyRate?: number;
    isTeamLead?: boolean;
    workload?: number;
    performance?: number;
  }>;
  sprints: number;
  completedSprints: number;
  methodology: string;
  template: string;
  scope?: string;
  requirements?: any[];
  stakeholders?: any[];
  risks?: any[];
  integrations?: any[];
  milestones?: any[];
  epics?: any[];
  releases?: any[];
  successCriteria?: string[];
  totalTasks?: number;
  completedTasks?: number;
}

export const useProjectById = (projectId: string | number) => {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  const fetchProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await projectApiService.getProjectById(projectId.toString());
      
      if (response.success && response.data) {
        // The API returns ProjectDto, cast it to any to access all properties
        const apiData = response.data as any;
        
        // Transform API data to match frontend interface
        const transformedProject: ProjectDetails = {
          id: apiData.id,
          name: apiData.name,
          description: apiData.description || '',
          status: apiData.status || 'active',
          progress: apiData.progress || 0,
          priority: apiData.priority || 'medium',
          startDate: apiData.startDate || '',
          endDate: apiData.endDate || '',
          budget: parseFloat(apiData.budget || '0'),
          spent: parseFloat(apiData.spent || '0'),
          managerId: apiData.managerId || '',
          department: apiData.department || '',
          teamMembers: apiData.teamMembers || [],
          sprints: apiData.sprints || 0,
          completedSprints: apiData.completedSprints || 0,
          methodology: apiData.methodology || 'scrum',
          template: apiData.template || 'web-app',
          scope: apiData.scope || '',
          requirements: apiData.requirements || [],
          stakeholders: apiData.stakeholders || [],
          risks: apiData.risks || [],
          integrations: apiData.integrations || [],
          milestones: apiData.milestones || [],
          epics: apiData.epics || [],
          releases: apiData.releases || [],
          successCriteria: apiData.successCriteria || [],
          totalTasks: apiData.totalTasks || 0,
          completedTasks: apiData.completedTasks || 0
        };
        
        setProject(transformedProject);
      } else {
        setError({ message: response.message || 'Failed to fetch project' });
      }
    } catch (err: any) {
      setError({ 
        message: err.message || 'Failed to fetch project',
        status: err.status 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  return {
    project,
    loading,
    error,
    refetch: fetchProject
  };
};
