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

      console.log(`Fetching activity logs: entityType="${entityType}", entityId="${entityId}"`);
      const response = await activityLogApiService.getActivityLogsByEntity(entityType, entityId);
      console.log('Activity logs API response:', response);

      // Handle response - API client returns { data, status, success, message }
      let logs: ActivityLog[] = [];

      if (response && response.data !== undefined) {
        if (Array.isArray(response.data)) {
          logs = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Check for nested structures
          if (Array.isArray(response.data.data)) {
            logs = response.data.data;
          } else if (Array.isArray(response.data.content)) {
            logs = response.data.content;
          } else if (Array.isArray(response.data.items)) {
            logs = response.data.items;
          }
        }
      } else if (Array.isArray(response)) {
        logs = response;
      }

      console.log(`Parsed ${logs.length} activity logs`);
      setActivityLogs(Array.isArray(logs) ? logs : []);
    } catch (err: any) {
      console.error('Error fetching activity logs:', err);
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
      console.log('useRecentActivityByEntity: Missing entityType or entityId', { entityType, entityId });
      setActivityLogs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log(`useRecentActivityByEntity: Fetching recent activity for entityType="${entityType}", entityId="${entityId}", days=${days}`);
      const response = await activityLogApiService.getRecentActivityByEntity(entityType, entityId, days);
      console.log('useRecentActivityByEntity: API response:', response);

      // Handle response - API client returns { data, status, success, message }
      let logs: ActivityLog[] = [];

      if (response && response.data !== undefined) {
        if (Array.isArray(response.data)) {
          logs = response.data;
        } else if (response.data && typeof response.data === 'object') {
          // Check for nested structures
          if (Array.isArray(response.data.data)) {
            logs = response.data.data;
          } else if (Array.isArray(response.data.content)) {
            logs = response.data.content;
          } else if (Array.isArray(response.data.items)) {
            logs = response.data.items;
          }
        }
      } else if (Array.isArray(response)) {
        logs = response;
      }

      console.log(`useRecentActivityByEntity: Parsed ${logs.length} activity logs`);
      setActivityLogs(logs);
    } catch (err: any) {
      console.error('useRecentActivityByEntity: Error fetching recent activity:', err);
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

/**
 * Helper function to parse activity log response
 */
const parseActivityLogResponse = (response: any): ActivityLog[] => {
  let logs: ActivityLog[] = [];

  if (response && response.data !== undefined) {
    if (Array.isArray(response.data)) {
      logs = response.data;
    } else if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data.data)) {
        logs = response.data.data;
      } else if (Array.isArray(response.data.content)) {
        logs = response.data.content;
      } else if (Array.isArray(response.data.items)) {
        logs = response.data.items;
      }
    }
  } else if (Array.isArray(response)) {
    logs = response;
  }

  return logs;
};

/**
 * Hook to fetch all project-related activities including related entities
 * This includes activities for the project itself, stories, tasks, epics, releases, team members, etc.
 */
export const useProjectActivities = (projectId: string, days: number = 30) => {
  const [allActivities, setAllActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchProjectActivities = useCallback(async () => {
    if (!projectId) {
      setAllActivities([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const allActivityLogs: ActivityLog[] = [];

      // 1. Fetch project activities (includes project creation, updates, etc.)
      try {
        const projectActivitiesResponse = await activityLogApiService.getRecentActivityByEntity('project', projectId, days);
        const projectActivities = parseActivityLogResponse(projectActivitiesResponse);
        allActivityLogs.push(...projectActivities);
      } catch (err) {
        console.warn('Error fetching project activities:', err);
      }

      // 2. Fetch stories for the project, then their activities
      try {
        const { storyApiService } = await import('../../services/api/entities/storyApi');
        const storiesResponse = await storyApiService.getStoriesByProject(projectId);
        const stories = Array.isArray(storiesResponse.data) ? storiesResponse.data : [];

        // Fetch activities for each story
        const storyActivitiesPromises = stories.map(async (story: any) => {
          try {
            const response = await activityLogApiService.getRecentActivityByEntity('story', story.id, days);
            return parseActivityLogResponse(response);
          } catch (err) {
            console.warn(`Error fetching activities for story ${story.id}:`, err);
            return [];
          }
        });

        const storyActivitiesArrays = await Promise.all(storyActivitiesPromises);
        const storyActivities = storyActivitiesArrays.flat();
        allActivityLogs.push(...storyActivities);
      } catch (err) {
        console.warn('Error fetching story activities:', err);
      }

      // 3. Fetch epics for the project, then their activities
      try {
        const { epicApiService } = await import('../../services/api/entities/epicApi');
        const epicsResponse = await epicApiService.getEpicsByProject(projectId);

        // Handle different response structures
        let epics: any[] = [];
        if (Array.isArray(epicsResponse)) {
          epics = epicsResponse;
        } else if (epicsResponse && epicsResponse.data) {
          if (Array.isArray(epicsResponse.data)) {
            epics = epicsResponse.data;
          } else if (epicsResponse.data.data && Array.isArray(epicsResponse.data.data)) {
            epics = epicsResponse.data.data;
          }
        }

        console.log(`Found ${epics.length} epics for project ${projectId}`);

        // Fetch activities for each epic - try both 'epic' and 'Epic' entity types
        const epicActivitiesPromises = epics.map(async (epic: any) => {
          if (!epic || !epic.id) {
            return [];
          }

          const activities: ActivityLog[] = [];

          // Try 'epic' (lowercase)
          try {
            const response = await activityLogApiService.getRecentActivityByEntity('epic', epic.id, days);
            const parsed = parseActivityLogResponse(response);
            activities.push(...parsed);
          } catch (err) {
            console.warn(`Error fetching activities for epic ${epic.id} (lowercase):`, err);
          }

          // Try 'Epic' (capitalized) - some systems use capitalized entity types
          try {
            const response = await activityLogApiService.getRecentActivityByEntity('Epic', epic.id, days);
            const parsed = parseActivityLogResponse(response);
            activities.push(...parsed);
          } catch (err) {
            // Silently fail - this is expected if entity type is lowercase
          }

          if (activities.length > 0) {
            console.log(`Found ${activities.length} activities for epic ${epic.id} (${epic.title || 'unnamed'})`);
          }

          return activities;
        });

        const epicActivitiesArrays = await Promise.all(epicActivitiesPromises);
        const epicActivities = epicActivitiesArrays.flat();

        if (epicActivities.length > 0) {
          console.log(`Total epic activities found: ${epicActivities.length}`);
        }

        allActivityLogs.push(...epicActivities);
      } catch (err) {
        console.error('Error fetching epic activities:', err);
      }

      // 4. Fetch tasks - need to get them through stories
      try {
        const { storyApiService } = await import('../../services/api/entities/storyApi');
        const storiesResponse = await storyApiService.getStoriesByProject(projectId);
        const stories = Array.isArray(storiesResponse.data) ? storiesResponse.data : [];

        // Get all tasks from stories
        const { taskApiService } = await import('../../services/api/entities/taskApi');
        const taskActivitiesPromises = stories.map(async (story: any) => {
          try {
            const tasksResponse = await taskApiService.getTasksByStory(story.id);
            const tasks = Array.isArray(tasksResponse.data) ? tasksResponse.data : [];

            // Fetch activities for each task
            const taskActivitiesPromises = tasks.map(async (task: any) => {
              try {
                const response = await activityLogApiService.getRecentActivityByEntity('task', task.id, days);
                return parseActivityLogResponse(response);
              } catch (err) {
                console.warn(`Error fetching activities for task ${task.id}:`, err);
                return [];
              }
            });

            const taskActivitiesArrays = await Promise.all(taskActivitiesPromises);
            return taskActivitiesArrays.flat();
          } catch (err) {
            console.warn(`Error fetching tasks for story ${story.id}:`, err);
            return [];
          }
        });

        const taskActivitiesArrays = await Promise.all(taskActivitiesPromises);
        const taskActivities = taskActivitiesArrays.flat();
        allActivityLogs.push(...taskActivities);
      } catch (err) {
        console.warn('Error fetching task activities:', err);
      }

      // 5. Fetch team member activities (project_team_member entity)
      try {
        const { teamMemberApi } = await import('../../services/api/entities/teamMemberApi');
        const teamMembers = await teamMemberApi.getTeamMembersByProject(projectId);

        // Fetch activities for each team member addition
        const teamMemberActivitiesPromises = teamMembers.map(async (member: any) => {
          try {
            // Try to find activities for project_team_member entity
            const response = await activityLogApiService.getRecentActivityByEntity('project_team_member', member.id, days);
            return parseActivityLogResponse(response);
          } catch (err) {
            // If no specific entity type, try to find by entityId
            console.warn(`Error fetching activities for team member ${member.id}:`, err);
            return [];
          }
        });

        const teamMemberActivitiesArrays = await Promise.all(teamMemberActivitiesPromises);
        const teamMemberActivities = teamMemberActivitiesArrays.flat();
        allActivityLogs.push(...teamMemberActivities);
      } catch (err) {
        console.warn('Error fetching team member activities:', err);
      }

      // Sort by createdAt (most recent first)
      allActivityLogs.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });

      // Remove duplicates based on id
      const uniqueActivities = allActivityLogs.filter((activity, index, self) =>
        index === self.findIndex((a) => a.id === activity.id)
      );

      // Log summary
      const activityCounts = uniqueActivities.reduce((acc, activity) => {
        const type = activity.entityType || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      console.log(`Total unique activities found: ${uniqueActivities.length}`, activityCounts);

      setAllActivities(uniqueActivities);
    } catch (err: any) {
      console.error('Error fetching project activities:', err);
      setError(err);
      setAllActivities([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, days]);

  useEffect(() => {
    fetchProjectActivities();
  }, [fetchProjectActivities]);

  return { activityLogs: allActivities, loading, error, refetch: fetchProjectActivities };
};

