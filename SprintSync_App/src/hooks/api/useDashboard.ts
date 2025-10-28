import { useState, useEffect } from 'react';
import { dashboardApiService } from '../../services/api';
import { DashboardMetrics, ChartData } from '../../types/api';

interface UseDashboardMetricsReturn {
  data: DashboardMetrics & {
    totalProjects: number;
    totalUsers: number;
    totalTasks: number;
    completedTasks: number;
    sprintVelocity: number;
    overallProgress: number;
    velocityTrend: 'up' | 'down' | 'stable';
    velocityChange: number;
  } | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useDashboardMetrics = (userId?: string): UseDashboardMetricsReturn => {
  const [data, setData] = useState<UseDashboardMetricsReturn['data']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardApiService.getDashboardMetrics(userId);
      setData(response.data as UseDashboardMetricsReturn['data']);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard metrics'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [userId]);

  return {
    data,
    loading,
    error,
    refetch: fetchMetrics,
  };
};

interface UseSprintPerformanceDataReturn {
  data: Array<{
    sprintName: string;
    plannedPoints: number;
    completedPoints: number;
    projectId: string;
  }> | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useSprintPerformanceData = (projectIds: string[] = [], sprintCount: number = 4): UseSprintPerformanceDataReturn => {
  const [data, setData] = useState<UseSprintPerformanceDataReturn['data']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, return empty data as the API might not support this endpoint
      setData([]);
    } catch (err) {
      console.error('Error fetching sprint performance data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch sprint performance data'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectIds.join(','), sprintCount]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

interface UseTaskDistributionDataReturn {
  data: Array<{
    label: string;
    count: number;
    percentage: number;
    projectId: string;
  }> | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useTaskDistributionData = (projectIds: string[] = []): UseTaskDistributionDataReturn => {
  const [data, setData] = useState<UseTaskDistributionDataReturn['data']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, return empty data as the API might not support this endpoint
      setData([]);
    } catch (err) {
      console.error('Error fetching task distribution data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch task distribution data'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectIds.join(',')]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

interface UseProjectListDataReturn {
  data: Array<{
    projectName: string;
    progress: number;
  }> | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useProjectListData = (userId?: string, includeArchived: boolean = false): UseProjectListDataReturn => {
  const [data, setData] = useState<UseProjectListDataReturn['data']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, return empty data as the API might not support this endpoint
      setData([]);
    } catch (err) {
      console.error('Error fetching project list data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch project list data'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId, includeArchived]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

interface UseTeamMemberMetricsReturn {
  data: Array<{
    userId: string;
    userName: string;
    tasksAssigned: number;
    tasksCompleted: number;
    completionRate: number;
  }> | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useTeamMemberMetrics = (): UseTeamMemberMetricsReturn => {
  const [data, setData] = useState<UseTeamMemberMetricsReturn['data']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, return empty data as the API might not support this endpoint
      setData([]);
    } catch (err) {
      console.error('Error fetching team member metrics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch team member metrics'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

interface UseVelocityTrendsDataReturn {
  data: Array<{
    period: string;
    completedPoints: number;
  }> | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useVelocityTrendsData = (projectIds: string[] = [], period: 'weekly' | 'monthly' = 'monthly'): UseVelocityTrendsDataReturn => {
  const [data, setData] = useState<UseVelocityTrendsDataReturn['data']>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, return empty data as the API might not support this endpoint
      setData([]);
    } catch (err) {
      console.error('Error fetching velocity trends data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch velocity trends data'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectIds.join(','), period]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

export const useAggregatedDashboardData = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      setData(null);
    } catch (err) {
      console.error('Error fetching aggregated dashboard data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch aggregated dashboard data'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

