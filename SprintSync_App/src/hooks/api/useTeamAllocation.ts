import { useState, useEffect } from 'react';
import { dashboardApiService } from '../../services/api';

export interface TeamAllocationData {
  totalUsers: number;
  userAllocations: Array<{
    userId: string;
    userName: string;
    assignedTasks: number;
    assignedSubtasks: number;
    assignedStories: number;
  }>;
}

export interface TeamPerformanceData {
  totalTeamMembers: number;
  avgVelocity: number;
  avgQuality: number;
  avgOnTimeDelivery: number;
  teamMembers: Array<{
    userId: string;
    userName: string;
    velocity: number;
    quality: number;
    onTime: number;
  }>;
}

export interface ProjectHealthData {
  totalProjects: number;
  healthyProjects: number;
  atRiskProjects: number;
  projects: Array<{
    projectId: string;
    projectName: string;
    healthStatus: 'healthy' | 'at-risk' | 'critical';
    progress: number;
    budgetUsage: number;
  }>;
}

export interface UseTeamAllocationReturn {
  teamAllocation: TeamAllocationData | null;
  teamPerformance: TeamPerformanceData | null;
  projectHealth: ProjectHealthData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useTeamAllocation = (projectId?: string): UseTeamAllocationReturn => {
  const [teamAllocation, setTeamAllocation] = useState<TeamAllocationData | null>(null);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformanceData | null>(null);
  const [projectHealth, setProjectHealth] = useState<ProjectHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTeamAllocation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [allocationRes, performanceRes, healthRes] = await Promise.all([
        projectId
          ? dashboardApiService.getProjectTeamAllocation(projectId)
          : dashboardApiService.getTeamAllocationOverview(),
        dashboardApiService.getTeamPerformanceMetrics(projectId),
        dashboardApiService.getProjectHealthMetrics(projectId),
      ]);

      setTeamAllocation(allocationRes.data);
      setTeamPerformance(performanceRes.data);
      setProjectHealth(healthRes.data);
    } catch (err) {
      console.error('Error fetching team allocation data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch team allocation data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamAllocation();
  }, [projectId]);

  return {
    teamAllocation,
    teamPerformance,
    projectHealth,
    loading,
    error,
    refetch: fetchTeamAllocation,
  };
};

