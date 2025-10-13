import { useState, useEffect, useCallback } from 'react';
import { activityLogApiService } from '../../services/api/entities/activityLogApi';
import { ActivityLog, ApiResponse, ApiError, Page } from '../../types/api';

/**
 * Hook to fetch activity logs by entity
 */
export const useActivityLogsByEntity = (entityType: string, entityId: string) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchActivityLogs = useCallback(async () => {
    if (!entityType || !entityId) {
      setActivityLogs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await activityLogApiService.getActivityLogsByEntity(entityType, entityId);
      setActivityLogs(response.data || []);
    } catch (err: any) {
      setError(err);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return { activityLogs, loading, error, refetch: fetchActivityLogs };
};

/**
 * Hook to fetch activity logs by user
 */
export const useActivityLogsByUser = (userId: string) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchActivityLogs = useCallback(async () => {
    if (!userId) {
      setActivityLogs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await activityLogApiService.getActivityLogsByUser(userId);
      setActivityLogs(response.data || []);
    } catch (err: any) {
      setError(err);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  return { activityLogs, loading, error, refetch: fetchActivityLogs };
};

/**
 * Hook to fetch recent activity logs by entity
 */
export const useRecentActivityByEntity = (entityType: string, entityId: string, days: number = 7) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchRecentActivity = useCallback(async () => {
    if (!entityType || !entityId) {
      setActivityLogs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await activityLogApiService.getRecentActivityByEntity(entityType, entityId, days);
      setActivityLogs(response.data || []);
    } catch (err: any) {
      setError(err);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId, days]);

  useEffect(() => {
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  return { activityLogs, loading, error, refetch: fetchRecentActivity };
};

/**
 * Hook to fetch recent activity logs by user
 */
export const useRecentActivityByUser = (userId: string, days: number = 7) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchRecentActivity = useCallback(async () => {
    if (!userId) {
      setActivityLogs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await activityLogApiService.getRecentActivityByUser(userId, days);
      setActivityLogs(response.data || []);
    } catch (err: any) {
      setError(err);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  }, [userId, days]);

  useEffect(() => {
    fetchRecentActivity();
  }, [fetchRecentActivity]);

  return { activityLogs, loading, error, refetch: fetchRecentActivity };
};

/**
 * Hook to create activity log
 */
export const useCreateActivityLog = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const createActivityLog = useCallback(async (activityLog: Omit<ActivityLog, 'id' | 'createdAt'>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await activityLogApiService.createActivityLog(activityLog);
      return response.data;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createActivityLog, loading, error };
};

/**
 * Hook to get activity log statistics
 */
export const useActivityLogStatistics = () => {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activityLogApiService.getActivityLogStatistics();
      setStatistics(response.data);
    } catch (err: any) {
      setError(err);
      setStatistics(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return { statistics, loading, error, refetch: fetchStatistics };
};

