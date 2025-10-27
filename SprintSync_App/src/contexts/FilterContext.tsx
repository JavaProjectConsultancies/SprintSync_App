import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface DashboardComponentVisibility {
  showApiStatusIndicators: boolean;
  showApiErrorAlert: boolean;
  showPerformanceAlert: boolean;
  showAiInsights: boolean;
  showUserTasks: boolean;
  showMetricsCards: boolean;
  showTeamPerformanceAlerts: boolean;
  showChartsAndAnalytics: boolean;
  showRecentProjects: boolean;
  showQuickActions: boolean;
  showLiveStatusDashboard: boolean;
  showTeamAllocationDemo: boolean;
}

export interface DashboardFilters {
  projectIds: string[];
  projectStatus: string[];
  projectPriority: string[];
  sprintIds: string[];
  sprintStatus: string[];
  sprintDateRange: { start: Date | null; end: Date | null };
  taskStatus: string[];
  taskPriority: string[];
  assigneeIds: string[];
  dueDateRange: { start: Date | null; end: Date | null };
  teamIds: string[];
  departmentIds: string[];
  domainIds: string[];
  timeRange: string;
  customDateRange: { start: Date | null; end: Date | null };
  dataSource: 'all' | 'api' | 'mock';
  refreshInterval: number;
  viewMode: 'overview' | 'detailed' | 'analytics';
  chartType: 'bar' | 'line' | 'pie' | 'area';
  showOnlyMyProjects: boolean;
  showOnlyMyTasks: boolean;
  showOnlyActiveItems: boolean;
  showOverdueItems: boolean;
  componentVisibility: DashboardComponentVisibility;
}

interface FilterContextType {
  filters: DashboardFilters;
  setFilters: (filters: DashboardFilters) => void;
  updateFilter: (key: keyof DashboardFilters, value: any) => void;
  updateComponentVisibility: (component: keyof DashboardComponentVisibility, visible: boolean) => void;
  resetFilters: () => void;
  resetComponentVisibility: () => void;
  saveFilters: () => void;
  loadFilters: () => void;
  hasActiveFilters: boolean;
  getFilteredData: <T>(data: T[], filterType: 'projects' | 'sprints' | 'tasks' | 'team') => T[];
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const defaultComponentVisibility: DashboardComponentVisibility = {
  showApiStatusIndicators: true,
  showApiErrorAlert: true,
  showPerformanceAlert: true,
  showAiInsights: true,
  showUserTasks: true,
  showMetricsCards: true,
  showTeamPerformanceAlerts: true,
  showChartsAndAnalytics: true,
  showRecentProjects: true,
  showQuickActions: true,
  showLiveStatusDashboard: true,
  showTeamAllocationDemo: true
};

const defaultFilters: DashboardFilters = {
  projectIds: [],
  projectStatus: [],
  projectPriority: [],
  sprintIds: [],
  sprintStatus: [],
  sprintDateRange: { start: null, end: null },
  taskStatus: [],
  taskPriority: [],
  assigneeIds: [],
  dueDateRange: { start: null, end: null },
  teamIds: [],
  departmentIds: [],
  domainIds: [],
  timeRange: 'all',
  customDateRange: { start: null, end: null },
  dataSource: 'all',
  refreshInterval: 30000,
  viewMode: 'overview',
  chartType: 'bar',
  showOnlyMyProjects: false,
  showOnlyMyTasks: false,
  showOnlyActiveItems: false,
  showOverdueItems: false,
  componentVisibility: defaultComponentVisibility
};

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);

  // Check if filters are active
  useEffect(() => {
    const active = 
      filters.projectIds.length > 0 ||
      filters.projectStatus.length > 0 ||
      filters.projectPriority.length > 0 ||
      filters.sprintIds.length > 0 ||
      filters.sprintStatus.length > 0 ||
      filters.taskStatus.length > 0 ||
      filters.taskPriority.length > 0 ||
      filters.assigneeIds.length > 0 ||
      filters.teamIds.length > 0 ||
      filters.departmentIds.length > 0 ||
      filters.domainIds.length > 0 ||
      filters.timeRange !== 'all' ||
      filters.dataSource !== 'all' ||
      filters.viewMode !== 'overview' ||
      filters.showOnlyMyProjects ||
      filters.showOnlyMyTasks ||
      filters.showOnlyActiveItems ||
      filters.showOverdueItems;
    
    setHasActiveFilters(active);
  }, [filters]);

  const updateFilter = useCallback((key: keyof DashboardFilters, value: any) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value
      };
      return newFilters;
    });
  }, []);

  // Load saved filters on mount (per-user)
  useEffect(() => {
    const loadUserPreferences = () => {
      try {
        // Get user ID from localStorage
        const userStr = localStorage.getItem('sprintsync_user');
        const userId = userStr ? JSON.parse(userStr)?.id : null;
        
        if (userId) {
          const saved = localStorage.getItem(`dashboard-filters-${userId}`);
          if (saved) {
            const parsed = JSON.parse(saved);
            setFilters({ 
              ...defaultFilters, 
              ...parsed,
              componentVisibility: {
                ...defaultComponentVisibility,
                ...(parsed.componentVisibility || {})
              }
            });
            return;
          }
        }
        
        // Fallback to generic storage for backward compatibility
        const saved = localStorage.getItem('dashboard-filters');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFilters({ 
            ...defaultFilters, 
            ...parsed,
            componentVisibility: {
              ...defaultComponentVisibility,
              ...(parsed.componentVisibility || {})
            }
          });
        }
      } catch (error) {
        console.error('Error loading saved filters:', error);
      }
    };
    
    loadUserPreferences();
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    const userStr = localStorage.getItem('sprintsync_user');
    const userId = userStr ? JSON.parse(userStr)?.id : null;
    if (userId) {
      localStorage.removeItem(`dashboard-filters-${userId}`);
    }
    localStorage.removeItem('dashboard-filters');
  }, []);

  const resetComponentVisibility = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      componentVisibility: defaultComponentVisibility
    }));
  }, []);

  const saveFilters = useCallback(() => {
    const userStr = localStorage.getItem('sprintsync_user');
    const userId = userStr ? JSON.parse(userStr)?.id : null;
    
    if (userId) {
      localStorage.setItem(`dashboard-filters-${userId}`, JSON.stringify(filters));
    } else {
      // Fallback to generic storage
      localStorage.setItem('dashboard-filters', JSON.stringify(filters));
    }
  }, [filters]);

  const loadFilters = useCallback(() => {
    const userStr = localStorage.getItem('sprintsync_user');
    const userId = userStr ? JSON.parse(userStr)?.id : null;
    
    if (userId) {
      const saved = localStorage.getItem(`dashboard-filters-${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFilters({ 
            ...defaultFilters, 
            ...parsed,
            componentVisibility: {
              ...defaultComponentVisibility,
              ...(parsed.componentVisibility || {})
            }
          });
        } catch (error) {
          console.error('Error loading saved filters:', error);
        }
      }
    }
  }, []);

  const updateComponentVisibility = useCallback((component: keyof DashboardComponentVisibility, visible: boolean) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        componentVisibility: {
          ...prev.componentVisibility,
          [component]: visible
        }
      };
      
      // Auto-save when visibility changes
      const userStr = localStorage.getItem('sprintsync_user');
      const userId = userStr ? JSON.parse(userStr)?.id : null;
      if (userId) {
        localStorage.setItem(`dashboard-filters-${userId}`, JSON.stringify(newFilters));
      } else {
        localStorage.setItem('dashboard-filters', JSON.stringify(newFilters));
      }
      
      return newFilters;
    });
  }, []);

  const getFilteredData = useCallback(<T extends any>(
    data: T[],
    filterType: 'projects' | 'sprints' | 'tasks' | 'team'
  ): T[] => {
    if (!data || data.length === 0) return data;

    return data.filter((item: any) => {
      // Project filters
      if (filterType === 'projects') {
        if (filters.projectIds.length > 0 && !filters.projectIds.includes(item.id)) return false;
        if (filters.projectStatus.length > 0 && !filters.projectStatus.includes(item.status)) return false;
        if (filters.projectPriority.length > 0 && !filters.projectPriority.includes(item.priority)) return false;
        if (filters.showOnlyMyProjects && item.assignedUserId !== item.currentUserId) return false;
        if (filters.showOnlyActiveItems && !['active', 'planning'].includes(item.status)) return false;
      }

      // Sprint filters
      if (filterType === 'sprints') {
        if (filters.sprintIds.length > 0 && !filters.sprintIds.includes(item.id)) return false;
        if (filters.sprintStatus.length > 0 && !filters.sprintStatus.includes(item.status)) return false;
        if (filters.sprintDateRange.start && item.startDate && new Date(item.startDate) < filters.sprintDateRange.start) return false;
        if (filters.sprintDateRange.end && item.endDate && new Date(item.endDate) > filters.sprintDateRange.end) return false;
      }

      // Task filters
      if (filterType === 'tasks') {
        if (filters.taskStatus.length > 0 && !filters.taskStatus.includes(item.status)) return false;
        if (filters.taskPriority.length > 0 && !filters.taskPriority.includes(item.priority)) return false;
        if (filters.assigneeIds.length > 0 && !filters.assigneeIds.includes(item.assigneeId)) return false;
        if (filters.showOnlyMyTasks && item.assigneeId !== item.currentUserId) return false;
        if (filters.showOverdueItems && !item.isOverdue) return false;
        if (filters.dueDateRange.start && item.dueDate && new Date(item.dueDate) < filters.dueDateRange.start) return false;
        if (filters.dueDateRange.end && item.dueDate && new Date(item.dueDate) > filters.dueDateRange.end) return false;
      }

      // Team filters
      if (filterType === 'team') {
        if (filters.teamIds.length > 0 && !filters.teamIds.includes(item.teamId)) return false;
        if (filters.departmentIds.length > 0 && !filters.departmentIds.includes(item.departmentId)) return false;
        if (filters.domainIds.length > 0 && !filters.domainIds.includes(item.domainId)) return false;
      }

      // Time range filters
      if (filters.timeRange !== 'all') {
        const now = new Date();
        const itemDate = new Date(item.createdAt || item.startDate || item.dueDate);
        
        switch (filters.timeRange) {
          case 'today':
            if (itemDate.toDateString() !== now.toDateString()) return false;
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (itemDate < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            if (itemDate < monthAgo) return false;
            break;
          case 'quarter':
            const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            if (itemDate < quarterAgo) return false;
            break;
          case 'year':
            const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            if (itemDate < yearAgo) return false;
            break;
          case 'custom':
            if (filters.customDateRange.start && itemDate < filters.customDateRange.start) return false;
            if (filters.customDateRange.end && itemDate > filters.customDateRange.end) return false;
            break;
        }
      }

      // Data source filters
      if (filters.dataSource !== 'all') {
        if (filters.dataSource === 'api' && !item.isApiData) return false;
        if (filters.dataSource === 'mock' && item.isApiData) return false;
      }

      return true;
    });
  }, [filters]);

  const value: FilterContextType = {
    filters,
    setFilters,
    updateFilter,
    updateComponentVisibility,
    resetFilters,
    resetComponentVisibility,
    saveFilters,
    loadFilters,
    hasActiveFilters,
    getFilteredData
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = (): FilterContextType => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
