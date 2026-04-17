import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Bug, AlertCircle, AlertTriangle, CheckCircle2, XCircle, Clock, Loader2, X, Download, ChevronDown, ChevronRight, Users, TrendingUp, BarChart3, ArrowLeft, Filter } from 'lucide-react';
import { Input } from '../components/ui/input';
import { reportsApiService } from '../services/api/utilities/reportsApi';
import { toast } from 'sonner';
import { useUsers, useWorkflowLanes, useProjects } from '../hooks/api';
import { projectApiService, sprintApiService } from '../services/api';
import { Project } from '../types/api';

import { getStatusLabel } from '../utils/statusUtils';

interface BugReportRow {
  defectCode: string;
  defectName: string;
  type?: string;
  parentCode?: string;
  storyCode?: string;
  storyName?: string;
  linkedToTask?: string;
  assignedTo?: string;
  assignedToId?: string;
  workflowLane?: string;
  priority?: string;
  severity?: string;
  defectCategory?: string;
  resolution?: string;
  reportedBy?: string;
  reportedById?: string;
  createdDate?: string;
  release?: string;
  sprint?: string;
  board?: string;
}

interface ResourcePerformanceRow {
  resourceEmailId?: string;
  resourceName?: string;
  taskIssueName?: string;
  taskIssueId?: string;
  storyName?: string;
  storyId?: string;
  estimationHours?: number;
  actualHours?: number;
  remainingHours?: number;
  reporterName?: string;
  workCategory?: string;
  status?: string;
  createdDate?: string;
  dueDate?: string;
  completedDate?: string;
  sprint?: string;
  project?: string;
  itemType?: string; // "TASK" | "ISSUE"
  isBug?: boolean;
  isRework?: boolean;
  timeEntries?: any[]; // Time entry breakdown
  subtasks?: any[]; // Subtask breakdown
  projectId?: string;
}

interface ResourcePerformanceData {
  totalResources?: number;
  activeResources?: number;
  averageUtilization?: number;
  averageEfficiency?: number;
  totalHours?: number;
  allocatedHours?: number;
  utilizationRate?: number;
  idleNotAllocatedCount?: number;
  idleEarlyCompletedHours?: number;
  projectUtilization?: Array<{
    projectId: string;
    projectName: string;
    utilization: number;
    allocatedHours: number;
    actualHours: number;
  }>;
  rows?: ResourcePerformanceRow[];
}

interface TaskIssueItem {
  taskIssueName?: string;
  taskIssueId?: string;
  itemType: 'TASK' | 'ISSUE';
  estimationHours: number;
  actualHours: number;
  dueDate?: string;
  status?: string;
}

interface ProjectSprintBreakdown {
  project: string;
  sprint: string;
  taskCount: number;
  issueCount: number;
  taskIssueCount: number;
  taskItems: TaskIssueItem[];
  issueItems: TaskIssueItem[];
  allocatedHours: number;
  hoursLogged: number;
  utilizationLevel: number;
  status: 'idle' | 'underutilized' | 'optimal' | 'overloaded';
  dueDate?: string;
}

interface IndividualUtilizationRow {
  resourceName: string;
  resourceEmailId?: string;
  resourceKey: string;
  projects: string[];
  projectSprintPairs: string[];
  projectSprintBreakdown: ProjectSprintBreakdown[];
  taskCount: number;
  issueCount: number;
  taskIssueCount: number;
  taskItems: TaskIssueItem[];
  issueItems: TaskIssueItem[];
  hoursLogged: number;
  allocatedHours: number;
  utilizationLevel: number;
  status: 'idle' | 'underutilized' | 'optimal' | 'overloaded';
  concerns: string[];
  dueDate?: string;
}

type ReportType = 'bug-report' | 'resource-performance' | 'resource-utilization' | null;
type ResourceDurationFilter = 'all' | 'last7' | 'last30' | 'custom';

const ReportsPage: React.FC = () => {
  // Start with no report selected; we'll preload resource performance data in the background
  const [activeReport, setActiveReport] = useState<ReportType>(null);
  const [bugReports, setBugReports] = useState<BugReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [selectedSprints, setSelectedSprints] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);
  const [resourcePerformance, setResourcePerformance] = useState<ResourcePerformanceData | null>(null);
  const [loadingResourcePerformance, setLoadingResourcePerformance] = useState(false);
  const [resourcePerformanceRows, setResourcePerformanceRows] = useState<ResourcePerformanceRow[]>([]);
  const [selectedResourceProject, setSelectedResourceProject] = useState<string>('all');
  const [selectedResourceUser, setSelectedResourceUser] = useState<string>('all');
  const { data: workflowLanesData } = useWorkflowLanes();
  const workflowLanes = useMemo(() => {
    if (!workflowLanesData) return [];
    return Array.isArray(workflowLanesData) ? workflowLanesData : (workflowLanesData as any)?.data || [];
  }, [workflowLanesData]);
  const [selectedResourceSprint, setSelectedResourceSprint] = useState<string>('all');
  const [selectedResourceDuration, setSelectedResourceDuration] = useState<ResourceDurationFilter>('all');
  const [customDurationFrom, setCustomDurationFrom] = useState<string>('');
  const [customDurationTo, setCustomDurationTo] = useState<string>('');
  const [resourcePage, setResourcePage] = useState<number>(1);
  const [exportingResource, setExportingResource] = useState(false);
  const [expandedUtilizationRows, setExpandedUtilizationRows] = useState<Set<string>>(new Set());
  const [expandedCountCells, setExpandedCountCells] = useState<Set<string>>(new Set());
  const [expandedPerformanceLogs, setExpandedPerformanceLogs] = useState<Set<number>>(new Set());
  const [masterProjects, setMasterProjects] = useState<Project[]>([]);
  const [loadingMasterProjects, setLoadingMasterProjects] = useState(false);


  const toggleUtilizationRow = useCallback((resourceKey: string) => {
    setExpandedUtilizationRows(prev => {
      const next = new Set(prev);
      if (next.has(resourceKey)) {
        next.delete(resourceKey);
      } else {
        next.add(resourceKey);
      }
      return next;
    });
  }, []);

  // Fetch users to get their roles
  const { data: usersData } = useUsers({ page: 0, size: 10000 });
  const users = Array.isArray(usersData) ? usersData : [];

  // Create a map of email/name to role for quick lookup
  const userRoleMap = useMemo(() => {
    const map = new Map<string, string>();
    users.forEach(user => {
      const email = user.email?.toLowerCase();
      const name = user.name?.toLowerCase();
      const role = (user.role || '').toLowerCase();

      if (email) map.set(email, role);
      if (name) map.set(name, role);
    });
    return map;
  }, [users]);

  // Helper function to format dates
  const formatDate = useCallback((dateString: string | null | undefined): string | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString; // Return original if parsing fails
    }
  }, []);

  // Fetch bug report data from API when bug report is selected
  useEffect(() => {
    if (activeReport === 'bug-report') {
      const fetchBugReports = async () => {
        try {
          setLoading(true);
          setError(null);

          const response = await reportsApiService.getBugReport();

          setBugReports(response.data);
        } catch (err: any) {
          console.error('Error fetching bug reports:', err);
          setError(err.message || 'Failed to fetch bug reports');
          // Keep empty array on error so UI shows "No data" message
          setBugReports([]);
        } finally {
          setLoading(false);
        }
      };

      fetchBugReports();
    }
  }, [activeReport]);

  // Loader for resource performance data (Resource Performance page only)
  const loadResourcePerformance = useCallback(async () => {
    try {
      setLoadingResourcePerformance(true);

      const response = await reportsApiService.getResourcePerformanceReports();
      console.log('Resource Performance API Response:', response);

      const data = response?.data || null;

      if (data) {
        // Set summary data
        setResourcePerformance({
          totalResources: data.totalResources ?? data.activeResources ?? 0,
          activeResources: data.activeResources ?? data.totalResources ?? 0,
          averageUtilization: data.averageUtilization ?? data.utilizationRate ?? 0,
          totalHours: data.totalHours ?? 0,
          allocatedHours: data.allocatedHours ?? 0,
          utilizationRate: data.utilizationRate ?? data.averageUtilization ?? 0,
          projectUtilization: data.projectUtilization || [],
          rows: data.rows || []
        });

        // Extract and transform rows data
        let rows: ResourcePerformanceRow[] = [];

        if (Array.isArray(data.rows)) {
          rows = data.rows.map((row: any) => ({
            resourceEmailId: row.resourceEmailId || null,
            resourceName: row.resourceName || null,
            taskIssueName: row.taskIssueName || null,
            taskIssueId: row.taskIssueId || null,
            storyName: row.storyName || null,
            storyId: row.storyId || null,
            estimationHours: row.estimationHours != null ? Number(row.estimationHours) : null,
            actualHours: row.actualHours != null ? Number(row.actualHours) : 0,
            remainingHours: row.remainingHours != null ? Number(row.remainingHours) : null,
            reporterName: row.reporterName || null,
            workCategory: row.workCategory || 'Development',
            status: row.status || null,
            createdDate: row.createdDate ? formatDate(row.createdDate) : null,
            dueDate: row.dueDate ? formatDate(row.dueDate) : null,
            completedDate: row.completedDate ? formatDate(row.completedDate) : null,
            sprint: row.sprint || null,
            project: row.project || null,
            itemType: row.itemType || null,
            isBug: typeof row.isBug === 'boolean'
              ? row.isBug
              : typeof row.isBug === 'string'
                ? row.isBug.toLowerCase() === 'true'
                : undefined,
            isRework: typeof row.isRework === 'boolean' ? row.isRework : undefined,
            timeEntries: Array.isArray(row.timeEntries) ? row.timeEntries : [],
            subtasks: Array.isArray(row.subtasks) ? row.subtasks : [],
          }));
        } else if (Array.isArray(data)) {
          // If data is directly an array
          rows = data.map((row: any) => ({
            resourceEmailId: row.resourceEmailId || null,
            resourceName: row.resourceName || null,
            taskIssueName: row.taskIssueName || null,
            taskIssueId: row.taskIssueId || null,
            storyName: row.storyName || null,
            storyId: row.storyId || null,
            estimationHours: row.estimationHours != null ? Number(row.estimationHours) : null,
            actualHours: row.actualHours != null ? Number(row.actualHours) : 0,
            remainingHours: row.remainingHours != null ? Number(row.remainingHours) : null,
            reporterName: row.reporterName || null,
            workCategory: row.workCategory || 'Development',
            status: row.status || null,
            createdDate: row.createdDate ? formatDate(row.createdDate) : null,
            dueDate: row.dueDate ? formatDate(row.dueDate) : null,
            completedDate: row.completedDate ? formatDate(row.completedDate) : null,
            sprint: row.sprint || null,
            project: row.project || null,
            projectId: row.projectId || null,
            itemType: row.itemType || null,
            isBug: typeof row.isBug === 'boolean'
              ? row.isBug
              : typeof row.isBug === 'string'
                ? row.isBug.toLowerCase() === 'true'
                : undefined,
            isRework: typeof row.isRework === 'boolean' ? row.isRework : undefined,
            timeEntries: Array.isArray(row.timeEntries) ? row.timeEntries : [],
          }));
        }

        console.log('Processed Resource Performance Rows:', rows);
        setResourcePerformanceRows(rows);
      } else {
        console.warn('No data received from resource utilization API');
        setResourcePerformance(null);
        setResourcePerformanceRows([]);
      }
    } catch (err: any) {
      console.error('Error fetching resource performance:', err);
      toast.error(err.message || 'Failed to fetch resource performance data');
      setResourcePerformance(null);
      setResourcePerformanceRows([]);
    } finally {
      setLoadingResourcePerformance(false);
    }
  }, [formatDate]);

  // Preload resource performance only when resource-performance is selected

  // Load resource performance when switching to resource-performance view
  useEffect(() => {
    if (activeReport === 'resource-performance' && resourcePerformanceRows.length === 0) {
      loadResourcePerformance();
    }
  }, [activeReport, resourcePerformanceRows.length, loadResourcePerformance]);

  // Resource Utilization - separate state and API
  const [resourceUtilizationRows, setResourceUtilizationRows] = useState<ResourcePerformanceRow[]>([]);
  const [loadingResourceUtilization, setLoadingResourceUtilization] = useState(false);
  const [resourceUtilizationFilterOptions, setResourceUtilizationFilterOptions] = useState<{
    projects: string[];
    sprints: string[];
    users: { id: string; label: string }[];
    projectSprintMap: Record<string, string[]>;
    projectUserMap: Record<string, string[]>;
  }>({ projects: [], sprints: [], users: [], projectSprintMap: {}, projectUserMap: {} });

  // Updated to use a single loading effect for all dependencies
  useEffect(() => {
    if (activeReport !== null && masterProjects.length === 0) {
      const initMasterData = async () => {
        try {
          setLoadingMasterProjects(true);
          const response = await projectApiService.getAccessibleProjects();
          if (response?.success && response.data) {
            setMasterProjects(response.data);
            const projectNames = response.data.map(p => p.name).sort();
            setResourceUtilizationFilterOptions(prev => ({
              ...prev,
              projects: projectNames
            }));
          }
        } catch (err) {
          console.error('Error fetching master projects:', err);
        } finally {
          setLoadingMasterProjects(false);
        }
      };
      initMasterData();
    }
  }, [activeReport, masterProjects.length]);



  const loadResourceUtilization = useCallback(async () => {
    try {
      setLoadingResourceUtilization(true);
      const needsFilterOptions = resourceUtilizationFilterOptions.users.length === 0;

      const projectName = !needsFilterOptions && selectedResourceProject !== 'all' ? selectedResourceProject : undefined;
      const userKey = !needsFilterOptions && selectedResourceUser !== 'all' ? selectedResourceUser : undefined;
      const sprint = !needsFilterOptions && selectedResourceSprint !== 'all' ? selectedResourceSprint : undefined;
      let duration: string | undefined;
      let fromDate: string | undefined;
      let toDate: string | undefined;
      
      if (!needsFilterOptions && selectedResourceDuration !== 'all') {
        duration = selectedResourceDuration;
        if (selectedResourceDuration === 'custom') {
          fromDate = customDurationFrom || undefined;
          toDate = customDurationTo || undefined;
        }
      }

      // Parallelize report fetch with project-specific sprint fetch if needed
      const projectForSprintFetch = selectedResourceProject !== 'all' ? masterProjects.find(p => p.name === selectedResourceProject) : null;
      const hasSprintsForProject = selectedResourceProject === 'all' || (resourceUtilizationFilterOptions.projectSprintMap[selectedResourceProject] || []).length > 0;

      const [reportResponse, sprintsResponse] = await Promise.all([
        reportsApiService.getIndividualUtilizationReport({
          projectName,
          userKey,
          sprint,
          duration,
          fromDate,
          toDate,
        }),
        !hasSprintsForProject && projectForSprintFetch 
          ? sprintApiService.getSprintsByProject(projectForSprintFetch.id)
          : Promise.resolve(null)
      ]);

      const data = reportResponse?.data;
      let rows: ResourcePerformanceRow[] = [];
      if (data?.rows && Array.isArray(data.rows)) {
        rows = data.rows.map((row: any) => ({
          resourceEmailId: row.resourceEmailId || null,
          resourceName: row.resourceName || null,
          taskIssueName: row.taskIssueName || null,
          taskIssueId: row.taskIssueId || null,
          storyName: row.storyName || null,
          storyId: row.storyId || null,
          estimationHours: row.estimationHours != null ? Number(row.estimationHours) : null,
          actualHours: row.actualHours != null ? Number(row.actualHours) : 0,
          remainingHours: row.remainingHours != null ? Number(row.remainingHours) : null,
          reporterName: row.reporterName || null,
          workCategory: row.workCategory || 'Development',
          status: row.status || null,
          createdDate: row.createdDate ? formatDate(row.createdDate) : null,
          dueDate: row.dueDate ? formatDate(row.dueDate) : null,
          completedDate: row.completedDate ? formatDate(row.completedDate) : null,
          sprint: row.sprint || null,
          project: row.project || null,
          projectId: row.projectId || null,
          itemType: row.itemType || null,
          isBug: typeof row.isBug === 'boolean' ? row.isBug : typeof row.isBug === 'string' ? row.isBug.toLowerCase() === 'true' : undefined,
          isRework: typeof row.isRework === 'boolean' ? row.isRework : undefined,
        }));
      }
      
      // SECURITY: Filter out inaccessible projects immediately
      if (masterProjects.length > 0) {
        const accessibleProjectNames = new Set(masterProjects.map(p => p.name));
        rows = rows.filter(r => r.project && accessibleProjectNames.has(r.project));
      }
      
      setResourceUtilizationRows(rows);

      // Process sprint response if we fetched it
      let newSprintMapping: Record<string, string[]> = {};
      if (sprintsResponse && sprintsResponse.success && sprintsResponse.data && selectedResourceProject !== 'all') {
        const sprintNames = sprintsResponse.data.map((s: any) => s.name).filter(Boolean).sort();
        newSprintMapping[selectedResourceProject] = sprintNames;
      }

      if (needsFilterOptions || Object.keys(newSprintMapping).length > 0) {
        const projectSprintMap: Record<string, Set<string>> = {};
        const projectUserMap: Record<string, Set<string>> = {};
        const projectSet = new Set<string>();
        const sprintSet = new Set<string>();
        const userMap = new Map<string, { id: string; label: string }>();

        rows.forEach(r => {
          if (r.project) {
            projectSet.add(r.project);
            if (!projectSprintMap[r.project]) projectSprintMap[r.project] = new Set();
            if (!projectUserMap[r.project]) projectUserMap[r.project] = new Set();
            
            if (r.sprint) {
              sprintSet.add(r.sprint);
              projectSprintMap[r.project].add(r.sprint);
            }
            
            const key = r.resourceEmailId || r.resourceName || '';
            if (key) {
              userMap.set(key, { id: key, label: r.resourceName || r.resourceEmailId || key });
              projectUserMap[r.project].add(key);
            }
          }
        });

        // Convert Sets back to arrays and merge with prefetched sprints
        const finalSprintMap: Record<string, string[]> = { ...resourceUtilizationFilterOptions.projectSprintMap };
        Object.keys(projectSprintMap).forEach(p => {
          const rowSprints = Array.from(projectSprintMap[p]);
          const prefetchedSprints = newSprintMapping[p] || [];
          finalSprintMap[p] = Array.from(new Set([...(finalSprintMap[p] || []), ...rowSprints, ...prefetchedSprints])).sort();
        });

        const userArrays: Record<string, string[]> = {};
        Object.keys(projectUserMap).forEach(p => userArrays[p] = Array.from(projectUserMap[p]).sort());

        setResourceUtilizationFilterOptions(prev => ({
          ...prev,
          projects: prev.projects.length > 0 ? prev.projects : Array.from(projectSet).sort(),
          sprints: Array.from(sprintSet).sort(),
          users: userMap.size > 0 ? Array.from(userMap.values()) : prev.users,
          projectSprintMap: finalSprintMap,
          projectUserMap: { ...prev.projectUserMap, ...userArrays },
        }));
      }
    } catch (err: any) {
      console.error('Error fetching resource utilization:', err);
      toast.error(err.message || 'Failed to fetch resource utilization data');
      setResourceUtilizationRows([]);
    } finally {
      setLoadingResourceUtilization(false);
    }
  }, [selectedResourceProject, selectedResourceUser, selectedResourceSprint, selectedResourceDuration, customDurationFrom, customDurationTo, resourceUtilizationFilterOptions, masterProjects, formatDate]);

  useEffect(() => {
    if (activeReport === 'resource-utilization') {
      loadResourceUtilization();
    }
  }, [activeReport, loadResourceUtilization]);

  // Get unique projects and sprints for filters
  const projects = useMemo(() => {
    if (masterProjects.length > 0) {
      return masterProjects.map(p => p.name).sort();
    }
    return Array.from(new Set(bugReports.map(r => r.board).filter(Boolean))).sort();
  }, [masterProjects, bugReports]);

  const sprints = Array.from(new Set(bugReports.map(r => r.sprint).filter(Boolean))).sort();

  // Filter resource performance rows based on selected filters
  const filteredResourcePerformanceRows = useMemo(() => {
    let filtered = resourcePerformanceRows;

    // SECURITY: Filter out inaccessible projects immediately
    if (masterProjects.length > 0) {
      const accessibleNames = new Set(masterProjects.map(p => p.name));
      filtered = filtered.filter(row => row.project && accessibleNames.has(row.project));
    }

    // Filter by project
    if (selectedResourceProject !== 'all') {
      filtered = filtered.filter(row => row.project === selectedResourceProject);
    }

    // Filter by user (assignee or reporter)
    if (selectedResourceUser !== 'all') {
      const selectedLower = selectedResourceUser.toLowerCase();
      filtered = filtered.filter(row => {
        const email = row.resourceEmailId?.toLowerCase();
        const assigneeName = row.resourceName?.toLowerCase();
        const reporterName = row.reporterName?.toLowerCase();
        return (
          email === selectedLower ||
          assigneeName === selectedLower ||
          reporterName === selectedLower
        );
      });
    }

    // Filter by sprint
    if (selectedResourceSprint !== 'all') {
      filtered = filtered.filter(row => row.sprint === selectedResourceSprint);
    }

    // Filter by duration (relative to log dates)
    if (selectedResourceDuration !== 'all') {
      const isWithinDuration = (row: ResourcePerformanceRow, from: Date | null, to: Date | null) => {
        // 1. Check if any associated time logs fall within the range
        if (row.timeEntries && row.timeEntries.length > 0) {
          const hasMatchingLog = row.timeEntries.some(log => {
            const logDateStr = log.workDate || log.date || log.createdAt;
            if (!logDateStr) return false;
            const ld = new Date(logDateStr);
            if (isNaN(ld.getTime())) return false;
            
            if (from && ld < from) return false;
            if (to) {
              const endOfTo = new Date(to);
              endOfTo.setHours(23, 59, 59, 999);
              if (ld > endOfTo) return false;
            }
            return true;
          });
          if (hasMatchingLog) return true;
        }

        // 2. Fallback: Check if the task itself was created in this range
        if (row.createdDate) {
          const cd = new Date(row.createdDate);
          if (!isNaN(cd.getTime())) {
            if (from && cd < from) return false;
            if (to) {
              const endOfTo = new Date(to);
              endOfTo.setHours(23, 59, 59, 999);
              if (cd > endOfTo) return false;
            }
            return true;
          }
        }
        return false;
      };

      if (selectedResourceDuration === 'custom') {
        const fromDate = customDurationFrom ? new Date(customDurationFrom) : null;
        const toDate = customDurationTo ? new Date(customDurationTo) : null;
        filtered = filtered.filter(row => isWithinDuration(row, fromDate, toDate));
      } else {
        const now = new Date();
        const days = selectedResourceDuration === 'last7' ? 7 : 30;
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - days);
        filtered = filtered.filter(row => isWithinDuration(row, cutoff, null));
      }
    }

    return filtered;
  }, [resourcePerformanceRows, selectedResourceProject, selectedResourceUser, selectedResourceSprint, selectedResourceDuration, customDurationFrom, customDurationTo, masterProjects]);

  // Reset pagination when filters change
  useEffect(() => {
    setResourcePage(1);
  }, [selectedResourceProject, selectedResourceUser, selectedResourceSprint, selectedResourceDuration, customDurationFrom, customDurationTo]);

  // Calculate summary metrics for resource performance
  const calculateResourceSummary = useCallback(() => {
    if (filteredResourcePerformanceRows.length === 0) {
      return { developers: [], testers: [], managers: [] };
    }

    // Helper to determine if a row represents a bug/defect work item
    const isBugRow = (row: ResourcePerformanceRow) => {
      if (typeof row.isBug === 'boolean') {
        return row.isBug;
      }
      const category = (row.workCategory || '').toLowerCase();
      const status = (row.status || '').toLowerCase();
      return category.includes('bug') || status.includes('bug');
    };

    const isIssueRow = (row: ResourcePerformanceRow) => {
      return (row.itemType || '').toUpperCase() === 'ISSUE' || isBugRow(row);
    };

    const isTaskRow = (row: ResourcePerformanceRow) => {
      return (row.itemType || '').toUpperCase() === 'TASK' || !isIssueRow(row);
    };

    // Pre-calculate created counts per user (based on reporter)
    const createdIssueMap = new Map<string, number>();
    const createdTaskMap = new Map<string, number>();

    filteredResourcePerformanceRows.forEach(row => {
      if (!row.reporterName) return;
      const reporterKey = row.reporterName.toLowerCase();
      if (!reporterKey) return;

      if (isIssueRow(row)) {
        createdIssueMap.set(reporterKey, (createdIssueMap.get(reporterKey) || 0) + 1);
      } else if (isTaskRow(row)) {
        createdTaskMap.set(reporterKey, (createdTaskMap.get(reporterKey) || 0) + 1);
      }
    });

    // Group rows by resource (assignee)
    const resourceMap = new Map<string, ResourcePerformanceRow[]>();
    filteredResourcePerformanceRows.forEach(row => {
      const key = row.resourceEmailId || row.resourceName || '';
      if (key) {
        if (!resourceMap.has(key)) {
          resourceMap.set(key, []);
        }
        resourceMap.get(key)!.push(row);
      }
    });

    const developers: any[] = [];
    const testers: any[] = [];
    const managers: any[] = [];

    resourceMap.forEach((rows, resourceKey) => {
      const firstRow = rows[0];
      const resourceName = firstRow.resourceName || resourceKey;
      const resourceEmail = (firstRow.resourceEmailId || '').toLowerCase();
      const resourceNameLower = (resourceName || '').toLowerCase();

      // Get user role from the map
      const userRole = (userRoleMap.get(resourceEmail) || userRoleMap.get(resourceNameLower) || '').toLowerCase();

      const isManager = userRole.includes('manager');
      const isTester = !isManager && (userRole.includes('qa') || userRole === 'tester' || userRole.includes('test'));

      const taskAssigned = rows.filter(r => isTaskRow(r)).length;
      const issueAssigned = rows.filter(r => isIssueRow(r)).length;

      const issueCreated = createdIssueMap.get(resourceNameLower) || 0;
      const taskCreated = createdTaskMap.get(resourceNameLower) || 0;

      if (isManager) {
        managers.push({
          name: resourceName,
          taskAssigned,
          issueAssigned,
          taskCreated,
          issueCreated,
        });
      } else if (isTester) {
        testers.push({
          name: resourceName,
          taskAssigned,
          issueCreated,
        });
      } else {
        // Developer metrics including workflow and bug-related stats
        const laneCounts: Record<string, number> = {};
        
        rows.forEach(r => {
          const label = getStatusLabel(r.status, workflowLanes);
          laneCounts[label] = (laneCounts[label] || 0) + 1;
        });

        const totalBugResolved = rows.filter(r => {
          const status = (r.status || '').toLowerCase();
          return isIssueRow(r) && (status === 'done' || status === 'completed');
        }).length;

        const reworkCountForBugs = rows.filter(r => {
          if (!isIssueRow(r)) return false;
          return r.isRework === true;
        }).length;

        const overdueCount = rows.filter(r => {
          const status = (r.status || '').toLowerCase();
          const isDone = status === 'done' || status === 'completed';
          if (isDone) return false;
          if (!r.dueDate) return false;
          try {
            const due = new Date(r.dueDate);
            return !isNaN(due.getTime()) && due < new Date();
          } catch {
            return false;
          }
        }).length;

        developers.push({
          name: resourceName,
          taskAssigned,
          issueAssigned,
          laneCounts,
          overdueCount,
          totalBugResolved,
          reworkCountForBugs,
        });
      }
    });

    // Identify all unique lanes based on configuration and actual data
    const allUniqueLanes = new Set<string>();

    // Get all project IDs present in the current filtered data
    const activeProjectIds = new Set<string>();
    filteredResourcePerformanceRows.forEach(row => {
      if (row.projectId) activeProjectIds.add(row.projectId);
    });

    // 1. Initialize from project-wide workflow configuration - ensures empty lanes from active boards appear
    if (Array.isArray(workflowLanes) && workflowLanes.length > 0) {
      workflowLanes.forEach(lane => {
        if (lane.title && activeProjectIds.has(lane.projectId)) {
          allUniqueLanes.add(lane.title);
        }
      });
    } else {
      // 2. Default standard lanes if no project-specific config is available (e.g., 'all' view)
      ['To Do', 'In Progress', 'QA/Review', 'Done'].forEach(l => allUniqueLanes.add(l));
    }

    // 3. Merging with data - catches any statuses that aren't in the active configuration
    developers.forEach(dev => {
      Object.keys(dev.laneCounts).forEach(lane => {
        if (lane) allUniqueLanes.add(lane);
      });
    });

    // Sort lanes: Priority for standard Scrum lanes, then by displayOrder
    const lanePriority = ['To Do', 'In Progress', 'QA/Review', 'Done'];
    const sortedLanes = Array.from(allUniqueLanes).sort((a, b) => {
      const indexA = lanePriority.findIndex(l => l.toLowerCase() === a.toLowerCase());
      const indexB = lanePriority.findIndex(l => l.toLowerCase() === b.toLowerCase());
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // For custom lanes, try to find the earliest displayOrder from the workflow config
      const laneA = workflowLanes.find(l => l.title === a);
      const laneB = workflowLanes.find(l => l.title === b);
      if (laneA && laneB && laneA.displayOrder !== undefined && laneB.displayOrder !== undefined) {
        return laneA.displayOrder - laneB.displayOrder;
      }

      return a.localeCompare(b);
    });

    return { developers, testers, managers, allLanes: sortedLanes };
  }, [filteredResourcePerformanceRows, userRoleMap, workflowLanes]);

  // Derived filtered options for the Utilization view
  const availableUtilizationSprints = useMemo(() => {
    if (selectedResourceProject === 'all') return resourceUtilizationFilterOptions.sprints;
    return resourceUtilizationFilterOptions.projectSprintMap[selectedResourceProject] || [];
  }, [selectedResourceProject, resourceUtilizationFilterOptions.sprints, resourceUtilizationFilterOptions.projectSprintMap]);

  const availableUtilizationUsers = useMemo(() => {
    const allUsers = resourceUtilizationFilterOptions.users;
    if (selectedResourceProject === 'all') return allUsers;
    const projectUsers = new Set(resourceUtilizationFilterOptions.projectUserMap[selectedResourceProject] || []);
    return allUsers.filter(u => projectUsers.has(u.id));
  }, [selectedResourceProject, resourceUtilizationFilterOptions.users, resourceUtilizationFilterOptions.projectUserMap]);

  // Effect to reset filters if they become invalid for the selected project
  useEffect(() => {
    if (selectedResourceProject !== 'all') {
      const pSprints = resourceUtilizationFilterOptions.projectSprintMap[selectedResourceProject] || [];
      const pUsers = new Set(resourceUtilizationFilterOptions.projectUserMap[selectedResourceProject] || []);

      if (selectedResourceSprint !== 'all' && !pSprints.includes(selectedResourceSprint)) {
        setSelectedResourceSprint('all');
      }
      if (selectedResourceUser !== 'all' && !pUsers.has(selectedResourceUser)) {
        setSelectedResourceUser('all');
      }
    }
  }, [selectedResourceProject, resourceUtilizationFilterOptions]);

  // Compute individual utilization summary (from resource utilization rows - Resource Utilization page only)
  const individualUtilization = useMemo((): IndividualUtilizationRow[] => {
    if (resourceUtilizationRows.length === 0) return [];

    const resourceMap = new Map<string, { rows: ResourcePerformanceRow[] }>();
    resourceUtilizationRows.forEach(row => {
      const key = row.resourceEmailId || row.resourceName || '';
      if (key) {
        if (!resourceMap.has(key)) {
          resourceMap.set(key, { rows: [] });
        }
        resourceMap.get(key)!.rows.push(row);
      }
    });

    const result: IndividualUtilizationRow[] = [];
    resourceMap.forEach(({ rows }, resourceKey) => {
      const firstRow = rows[0];
      const resourceName = firstRow.resourceName || resourceKey;
      const resourceEmailId = firstRow.resourceEmailId;

      const projects = Array.from(new Set(rows.map(r => r.project).filter(Boolean))) as string[];
      const projectSprintPairs = Array.from(
        new Set(
          rows.map(r => {
            const p = r.project || '—';
            const s = r.sprint || '—';
            return `${p} - ${s}`;
          })
        )
      ).sort();
      const taskCount = rows.filter(r => (r.itemType || '').toUpperCase() === 'TASK').length;
      const issueCount = rows.filter(r => (r.itemType || '').toUpperCase() === 'ISSUE').length;
      const taskIssueCount = rows.length;
      const hoursLogged = rows.reduce((sum, r) => sum + (r.actualHours ?? 0), 0);
      const allocatedHours = rows.reduce((sum, r) => sum + (r.estimationHours ?? 0), 0);
      const utilizationLevel = allocatedHours > 0 ? (hoursLogged / allocatedHours) * 100 : 0;

      const taskItems: TaskIssueItem[] = rows
        .filter(r => (r.itemType || '').toUpperCase() === 'TASK')
        .map(r => ({
          taskIssueName: r.taskIssueName,
          taskIssueId: r.taskIssueId,
          itemType: 'TASK' as const,
          estimationHours: r.estimationHours ?? 0,
          actualHours: r.actualHours ?? 0,
          dueDate: r.dueDate,
          status: r.status,
        }));
      const issueItems: TaskIssueItem[] = rows
        .filter(r => (r.itemType || '').toUpperCase() === 'ISSUE')
        .map(r => ({
          taskIssueName: r.taskIssueName,
          taskIssueId: r.taskIssueId,
          itemType: 'ISSUE' as const,
          estimationHours: r.estimationHours ?? 0,
          actualHours: r.actualHours ?? 0,
          dueDate: r.dueDate,
          status: r.status,
        }));
      const otherAsTasks: TaskIssueItem[] = rows
        .filter(r => (r.itemType || '').toUpperCase() !== 'TASK' && (r.itemType || '').toUpperCase() !== 'ISSUE')
        .map(r => ({
          taskIssueName: r.taskIssueName,
          taskIssueId: r.taskIssueId,
          itemType: 'TASK' as const,
          estimationHours: r.estimationHours ?? 0,
          actualHours: r.actualHours ?? 0,
          dueDate: r.dueDate,
          status: r.status,
        }));
      const allTaskItems = [...taskItems, ...otherAsTasks];

      // Project-Sprint breakdown (sprints per project)
      const projectSprintMap = new Map<string, { taskItems: TaskIssueItem[]; issueItems: TaskIssueItem[]; allocated: number; logged: number }>();
      rows.forEach(r => {
        const proj = r.project || 'Unknown';
        const sprint = r.sprint || '—';
        const mapKey = `${proj}|||${sprint}`;
        const curr = projectSprintMap.get(mapKey) || { taskItems: [], issueItems: [], allocated: 0, logged: 0 };
        const item: TaskIssueItem = {
          taskIssueName: r.taskIssueName,
          taskIssueId: r.taskIssueId,
          itemType: ((r.itemType || '').toUpperCase() === 'ISSUE' ? 'ISSUE' : 'TASK') as 'TASK' | 'ISSUE',
          estimationHours: r.estimationHours ?? 0,
          actualHours: r.actualHours ?? 0,
          dueDate: r.dueDate,
          status: r.status,
        };
        if (item.itemType === 'ISSUE') curr.issueItems.push(item);
        else curr.taskItems.push(item);
        curr.allocated += r.estimationHours ?? 0;
        curr.logged += r.actualHours ?? 0;
        projectSprintMap.set(mapKey, curr);
      });
      const projectSprintBreakdown: ProjectSprintBreakdown[] = Array.from(projectSprintMap.entries()).map(([mapKey, { taskItems: tItems, issueItems: iItems, allocated, logged }]) => {
        const [project, sprint] = mapKey.split('|||');
        const util = allocated > 0 ? (logged / allocated) * 100 : 0;
        let projStatus: ProjectSprintBreakdown['status'] = 'optimal';
        if (logged === 0) projStatus = 'idle';
        else if (allocated === 0) projStatus = 'optimal';
        else if (util < 50) projStatus = 'underutilized';
        else if (util > 120) projStatus = 'overloaded';
        return {
          project,
          sprint,
          taskCount: tItems.length,
          issueCount: iItems.length,
          taskIssueCount: tItems.length + iItems.length,
          taskItems: tItems,
          issueItems: iItems,
          allocatedHours: allocated,
          hoursLogged: logged,
          utilizationLevel: util,
          status: projStatus,
          dueDate: [...tItems, ...iItems]
            .filter(i => i.dueDate)
            .sort((a, b) => new Date(b.dueDate!).getTime() - new Date(a.dueDate!).getTime())[0]?.dueDate,
        };
      }).sort((a, b) => {
        const cmp = a.project.localeCompare(b.project);
        return cmp !== 0 ? cmp : a.sprint.localeCompare(b.sprint);
      });

      const inProgressCount = rows.filter(r => {
        const s = (r.status || '').toLowerCase();
        return s === 'in_progress' || s === 'in-progress' || s === 'in progress';
      }).length;

      let status: IndividualUtilizationRow['status'] = 'optimal';
      const concerns: string[] = [];

      if (hoursLogged === 0) {
        status = 'idle';
        concerns.push('Idle');
      } else if (allocatedHours === 0) {
        status = 'optimal';
        concerns.push('No allocation');
      } else if (utilizationLevel < 50) {
        status = 'underutilized';
        concerns.push('Underutilized');
      } else if (utilizationLevel > 120 || inProgressCount > 5) {
        status = 'overloaded';
        if (utilizationLevel > 120) concerns.push('Overloaded');
        if (inProgressCount > 5) concerns.push('High in-progress count');
      }

      result.push({
        resourceName,
        resourceEmailId,
        resourceKey,
        projects,
        projectSprintPairs,
        projectSprintBreakdown,
        taskCount,
        issueCount,
        taskIssueCount,
        taskItems: allTaskItems,
        issueItems,
        hoursLogged,
        allocatedHours,
        utilizationLevel,
        status,
        concerns,
        dueDate: [...allTaskItems, ...issueItems]
          .filter(i => i.dueDate)
          .sort((a, b) => new Date(b.dueDate!).getTime() - new Date(a.dueDate!).getTime())[0]?.dueDate,
      });
    });

    return result.sort((a, b) => a.resourceName.localeCompare(b.resourceName));
  }, [resourceUtilizationRows]);

  const filteredIndividualUtilization = individualUtilization;

  // Get unique projects and users from resource performance data
  const resourceProjects = useMemo(() => {
    if (masterProjects.length > 0) {
      return masterProjects.map(p => p.name).sort();
    }
    const projectSet = new Set<string>();
    resourcePerformanceRows.forEach(row => {
      if (row.project) {
        projectSet.add(row.project);
      }
    });
    return Array.from(projectSet).sort();
  }, [resourcePerformanceRows, masterProjects]);

  // Sprints list depends on selected project
  const resourceSprints = useMemo(() => {
    const sprintSet = new Set<string>();
    
    // SECURITY: Pre-filter source rows against accessible projects
    const accessibleNames = masterProjects.length > 0 ? new Set(masterProjects.map(p => p.name)) : null;
    let sourceRows = resourcePerformanceRows;
    if (accessibleNames) {
      sourceRows = sourceRows.filter(row => row.project && accessibleNames.has(row.project));
    }

    sourceRows =
      selectedResourceProject === 'all'
        ? sourceRows
        : sourceRows.filter(row => row.project === selectedResourceProject);

    sourceRows.forEach(row => {
      if (row.sprint) {
        sprintSet.add(row.sprint);
      }
    });
    return Array.from(sprintSet).sort();
  }, [resourcePerformanceRows, selectedResourceProject, masterProjects]);

  // Users list depends on selected project
  const resourceUsers = useMemo(() => {
    const userMap = new Map<string, { id: string; label: string }>();
    
    // SECURITY: Pre-filter source rows against accessible projects
    const accessibleNames = masterProjects.length > 0 ? new Set(masterProjects.map(p => p.name)) : null;
    let sourceRows = resourcePerformanceRows;
    if (accessibleNames) {
      sourceRows = sourceRows.filter(row => row.project && accessibleNames.has(row.project));
    }
    
    sourceRows =
      selectedResourceProject === 'all'
        ? sourceRows
        : sourceRows.filter(row => row.project === selectedResourceProject);

    sourceRows.forEach(row => {
      const name = row.resourceName || row.reporterName || '';
      const email = row.resourceEmailId || '';
      const idSource = (email || name).toLowerCase();
      if (!idSource) return;

      if (!userMap.has(idSource)) {
        userMap.set(idSource, {
          id: idSource,
          label: name || email,
        });
      }
    });
    return Array.from(userMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [resourcePerformanceRows, selectedResourceProject, masterProjects]);

  const resourceSummary = calculateResourceSummary();

  // Aggregate summary for filtered resource performance rows
  const filteredSummary = useMemo(() => {
    if (!filteredResourcePerformanceRows.length) return null;

    const resourceSet = new Set<string>();
    const resourceAllocatedMap = new Map<string, number>();
    let totalEstimated = 0;
    let totalCompletedEst = 0;
    let totalActual = 0;
    let completedCount = 0;
    let idleEarlyCompletedHours = 0;
    const projectMap = new Map<string, { allocatedHours: number; completedEst: number; actualHours: number }>();

    filteredResourcePerformanceRows.forEach(row => {
      const key = row.resourceEmailId || row.resourceName || '';
      if (key) resourceSet.add(key);

      const est = row.estimationHours ?? 0;
      const act = row.actualHours ?? 0;
      totalEstimated += est;
      totalActual += act;

      const resourceAllocated = resourceAllocatedMap.get(key) ?? 0;
      resourceAllocatedMap.set(key, resourceAllocated + est);

      const status = (row.status || '').toLowerCase();
      const isDone = status === 'done' || status === 'completed';
      if (isDone) {
        completedCount += 1;
        idleEarlyCompletedHours += row.remainingHours ?? 0;
      }

      const projectKey = row.project || 'Unknown';
      const existing = projectMap.get(projectKey) || { allocatedHours: 0, completedEst: 0, actualHours: 0 };
      existing.allocatedHours += est;
      existing.actualHours += act;
      if (isDone) {
        totalCompletedEst += est;
        existing.completedEst += est;
      }
      projectMap.set(projectKey, existing);
    });

    const performanceResult = totalActual > 0 ? (totalCompletedEst / totalActual) * 100 : 0;
    const avgUtilization = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;
    const rawEfficiency = totalActual > 0 ? (totalEstimated / totalActual) * 100 : 0;
    const avgEfficiency = Math.min(rawEfficiency, 150);
    
    const idleNotAllocatedCount = Array.from(resourceAllocatedMap.values()).filter(a => a === 0).length;

    const projectUtilization = Array.from(projectMap.entries()).map(([projectName, values]) => ({
      projectId: projectName,
      projectName,
      utilization: values.actualHours > 0 ? (values.completedEst / values.actualHours) * 100 : 0,
      allocatedHours: values.allocatedHours,
      actualHours: values.actualHours,
    }));

    return {
      totalResources: resourceSet.size,
      activeResources: resourceSet.size,
      allocatedHours: totalEstimated,
      totalHours: totalActual,
      averageUtilization: avgUtilization,
      utilizationRate: avgUtilization,
      averageEfficiency: avgEfficiency,
      idleNotAllocatedCount,
      idleEarlyCompletedHours,
      projectUtilization,
    } as ResourcePerformanceData;
  }, [filteredResourcePerformanceRows]);

  const summaryData = filteredSummary || resourcePerformance || null;

  // Pagination for resource performance details table
  const rowsPerPage = 20;
  const totalResourcePages = filteredResourcePerformanceRows.length
    ? Math.ceil(filteredResourcePerformanceRows.length / rowsPerPage)
    : 1;

  const paginatedResourcePerformanceRows = useMemo(() => {
    if (!filteredResourcePerformanceRows.length) return [];
    const safePage = Math.min(resourcePage, Math.ceil(filteredResourcePerformanceRows.length / rowsPerPage) || 1);
    const start = (safePage - 1) * rowsPerPage;
    return filteredResourcePerformanceRows.slice(start, start + rowsPerPage);
  }, [filteredResourcePerformanceRows, resourcePage]);

  const currentStartIndex = filteredResourcePerformanceRows.length
    ? (resourcePage - 1) * rowsPerPage + 1
    : 0;
  const currentEndIndex = filteredResourcePerformanceRows.length
    ? Math.min(filteredResourcePerformanceRows.length, resourcePage * rowsPerPage)
    : 0;

  const handleExportResourcePerformance = async () => {
    try {
      setExportingResource(true);
      const projectNameForExport = selectedResourceProject !== 'all' ? selectedResourceProject : undefined;
      const userKeyForExport = selectedResourceUser !== 'all' ? selectedResourceUser : undefined;
      const sprintForExport = selectedResourceSprint !== 'all' ? selectedResourceSprint : undefined;

      let durationForExport: string | undefined;
      let fromDateForExport: string | undefined;
      let toDateForExport: string | undefined;

      if (selectedResourceDuration !== 'all') {
        durationForExport = selectedResourceDuration;
        if (selectedResourceDuration === 'custom') {
          fromDateForExport = customDurationFrom || undefined;
          toDateForExport = customDurationTo || undefined;
        }
      }

      const filters = {
        projectName: projectNameForExport,
        userKey: userKeyForExport,
        sprint: sprintForExport,
        duration: durationForExport,
        fromDate: fromDateForExport,
        toDate: toDateForExport,
      };

      const blob = activeReport === 'resource-performance'
        ? await reportsApiService.exportResourcePerformanceToExcel(filters)
        : await reportsApiService.exportResourceUtilizationToExcel(filters);
      if (!blob || blob.size === 0) {
        throw new Error('Received empty file from server');
      }

      // Ensure correct Excel MIME type for proper multi-sheet recognition
      const excelBlob = blob.type?.includes('spreadsheet') || blob.type?.includes('octet-stream')
        ? blob
        : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const url = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;

      let filename = activeReport === 'resource-performance' ? 'resource-performance' : 'resource-utilization';
      if (projectNameForExport) {
        filename += `-project-${projectNameForExport}`;
      }
      filename += `-${new Date().toISOString().split('T')[0]}.xlsx`;

      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      toast.success(activeReport === 'resource-performance' ? 'Resource performance exported to Excel successfully!' : 'Resource utilization exported to Excel successfully!');
    } catch (err: any) {
      console.error('Error exporting resource report:', err);
      toast.error(err.message || 'Failed to export to Excel');
    } finally {
      setExportingResource(false);
    }
  };

  const handleResourceSprintChange = (value: string) => {
    setSelectedResourceSprint(value);
    if (value === 'all') {
      // When no sprint is selected, ensure all dates are shown and custom range cleared
      setSelectedResourceDuration('all');
      setCustomDurationFrom('');
      setCustomDurationTo('');
    }
  };

  // Filter rows based on selected filters
  const rows = bugReports.filter(row => {
    const projectMatch = selectedProjects.length === 0 || selectedProjects.includes(row.board || '');
    const sprintMatch = selectedSprints.length === 0 || selectedSprints.includes(row.sprint || '');
    return projectMatch && sprintMatch;
  });

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return <Badge variant="outline">—</Badge>;

    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high' || priorityLower === 'critical') {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          {priority}
        </Badge>
      );
    }
    if (priorityLower === 'medium') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {priority}
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        {priority}
      </Badge>
    );
  };

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return <Badge variant="outline">—</Badge>;

    const severityLower = severity.toLowerCase();
    if (severityLower === 'critical') {
      return <Badge className="bg-red-100 text-red-800 border-red-200 font-semibold">{severity}</Badge>;
    }
    if (severityLower === 'major') {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">{severity}</Badge>;
    }
    if (severityLower === 'minor') {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">{severity}</Badge>;
    }
    return <Badge variant="outline">{severity}</Badge>;
  };

  const getResolutionBadge = (resolution?: string) => {
    if (!resolution) return <Badge variant="outline">—</Badge>;

    const resolutionLower = resolution.toLowerCase();
    if (resolutionLower === 'resolved' || resolutionLower === 'closed') {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {resolution}
        </Badge>
      );
    }
    if (resolutionLower === 'in progress') {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
          <Clock className="w-3 h-3 mr-1" />
          {resolution}
        </Badge>
      );
    }
    if (resolutionLower === 'open') {
      return (
        <Badge className="bg-orange-100 text-orange-800 border-orange-200">
          <AlertCircle className="w-3 h-3 mr-1" />
          {resolution}
        </Badge>
      );
    }
    return <Badge variant="outline">{resolution}</Badge>;
  };

  const getCategoryBadge = (category?: string) => {
    if (!category) return <Badge variant="outline">—</Badge>;

    const categoryLower = category.toLowerCase();
    if (categoryLower === 'ui' || categoryLower === 'frontend') {
      return <Badge className="bg-purple-100 text-purple-800 border-purple-200">{category}</Badge>;
    }
    if (categoryLower === 'backend' || categoryLower === 'api') {
      return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">{category}</Badge>;
    }
    if (categoryLower === 'database') {
      return <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">{category}</Badge>;
    }
    return <Badge variant="outline">{category}</Badge>;
  };

  // Multi-Select Dropdown Component
  const MultiSelect: React.FC<{
    label: string;
    icon: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
  }> = ({ label, icon, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const toggleOption = (option: string) => {
      if (selected.includes(option)) {
        onChange(selected.filter(item => item !== option));
      } else {
        onChange([...selected, option]);
      }
    };

    const selectAll = () => {
      onChange([...options]);
    };

    const clearAll = () => {
      onChange([]);
    };

    const getDisplayText = () => {
      if (selected.length === 0) {
        return `${icon} All ${label}`;
      } else if (selected.length === 1) {
        return `${icon} ${selected[0]}`;
      } else {
        return `${icon} ${selected.length} ${label} Selected`;
      }
    };

    return (
      <div className="flex flex-col relative" ref={dropdownRef}>
        <label className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">{label}</label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-3 border-2 border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white hover:border-slate-400 transition-colors min-w-[200px] cursor-pointer shadow-sm h-11 flex items-center justify-between"
        >
          <span className="truncate">{getDisplayText()}</span>
          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-full bg-white border-2 border-slate-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-2 flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="p-1">
              {options.map(option => (
                <label
                  key={option}
                  className="flex items-center px-3 py-2 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    onChange={() => toggleOption(option)}
                    className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500 focus:ring-2 cursor-pointer"
                  />
                  <span className="ml-3 text-sm text-slate-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Export bug report to Excel
  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      console.log('🟢 Starting Excel export...');

      // For now, we'll still use the backend API but with combined filter logic
      // If multiple projects/sprints selected, we'll export all and let backend handle it
      // In future, we can update backend to accept arrays
      const projectId = selectedProjects.length === 1 ? selectedProjects[0] : undefined;
      const sprintId = selectedSprints.length === 1 ? selectedSprints[0] : undefined;

      console.log('🟢 Selected Projects:', selectedProjects);
      console.log('🟢 Selected Sprints:', selectedSprints);
      console.log('🟢 Exporting with filters - Project:', projectId, 'Sprint:', sprintId);

      const blob = await reportsApiService.exportBugReportToExcel(projectId, sprintId);
      console.log('🟢 Blob received:', blob.size, 'bytes, type:', blob.type);

      if (!blob || blob.size === 0) {
        throw new Error('Received empty file from server');
      }

      // Ensure correct Excel MIME type for proper file recognition
      const excelBlob = blob.type?.includes('spreadsheet') || blob.type?.includes('octet-stream')
        ? blob
        : new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      // Create download link
      const url = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;

      let filename = 'bug-report';
      if (selectedProjects.length > 0) {
        filename += `-${selectedProjects.length}-projects`;
      }
      if (selectedSprints.length > 0) {
        filename += `-${selectedSprints.length}-sprints`;
      }
      filename += `-${new Date().toISOString().split('T')[0]}.xlsx`;

      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      console.log('🟢 Triggering download for:', filename);
      link.click();

      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success('Bug report exported to Excel successfully!');
    } catch (err: any) {
      console.error('🔴 Error exporting bug report:', err);
      toast.error(err.message || 'Failed to export bug report to Excel');
    } finally {
      setExporting(false);
    }
  };

  // Show report view if a report is selected
  if (activeReport) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-white px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-10">
        {/* Back Button and Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveReport(null)}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div className="flex items-center space-x-4">
              {activeReport === 'bug-report' && (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 shadow-lg">
                    <Bug className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Bug Report</h1>
                    <p className="text-sm text-muted-foreground">Track and manage defects across all projects</p>
                  </div>
                </>
              )}
              {activeReport === 'resource-performance' && (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shadow-lg">
                    <Users className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Resource Performance</h1>
                    <p className="text-sm text-muted-foreground">Team utilization and allocation metrics</p>
                  </div>
                </>
              )}
              {activeReport === 'resource-utilization' && (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg">
                    <BarChart3 className="h-6 w-6 text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">Resource Utilization Report</h1>
                    <p className="text-sm text-muted-foreground">Resource utilization analytics</p>
                  </div>
                </>
              )}
            </div>
          </div>
          {(activeReport === 'resource-performance' || activeReport === 'resource-utilization') && (
            <button
              type="button"
              onClick={handleExportResourcePerformance}
              disabled={exportingResource || (activeReport === 'resource-performance' ? resourcePerformanceRows.length === 0 : resourceUtilizationRows.length === 0)}
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-green-600 to-cyan-600 px-24 py-3 text-l font-bold text-white shadow-2xl hover:from-green-700 hover:to-cyan-700 hover:scale-105 active:shadow-inner transition-all duration-300 disabled:from-green-400 disabled:to-cyan-400 disabled:cursor-not-allowed disabled:scale-100 min-w-[40px] mr-4"
            >
              {exportingResource ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mx-2" />
                  <span className="mx-2">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="h-5 w-5 mx-2" />
                  <span className="mx-2">Export to Excel</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Resource Utilization Report Section */}
        {activeReport === 'resource-utilization' && (
          <div className="flex flex-col gap-10 mt-8">
            {/* Filters and Export */}
            {resourceUtilizationFilterOptions.projects.length > 0 && (
              <Card className="shadow-sm border border-teal-100 bg-gradient-to-br from-white to-teal-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-lg text-teal-800">
                    <div className="rounded-lg bg-teal-100 p-1.5">
                      <Filter className="h-5 w-5 text-teal-600" />
                    </div>
                    <span>Filters</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-6">
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <Label htmlFor="util-project-filter">Project</Label>
                      <Select value={selectedResourceProject} onValueChange={setSelectedResourceProject}>
                        <SelectTrigger id="util-project-filter">
                          <SelectValue placeholder="All Projects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Projects</SelectItem>
                          {resourceUtilizationFilterOptions.projects.map(projectName => (
                            <SelectItem key={projectName} value={projectName}>
                              {projectName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <Label htmlFor="util-user-filter">User</Label>
                      <Select value={selectedResourceUser} onValueChange={setSelectedResourceUser}>
                        <SelectTrigger id="util-user-filter">
                          <SelectValue placeholder="All Users" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          {availableUtilizationUsers.map(u => (
                            <SelectItem key={u.id} value={u.id}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <Label htmlFor="util-sprint-filter">Sprint</Label>
                      <Select value={selectedResourceSprint} onValueChange={setSelectedResourceSprint}>
                        <SelectTrigger id="util-sprint-filter">
                          <SelectValue placeholder="All Sprints" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Sprints</SelectItem>
                          {availableUtilizationSprints.map(s => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[200px] space-y-2">
                      <Label htmlFor="util-duration-filter">Date Range</Label>
                      <Select value={selectedResourceDuration} onValueChange={(v) => setSelectedResourceDuration(v as ResourceDurationFilter)}>
                        <SelectTrigger id="util-duration-filter">
                          <SelectValue placeholder="All time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All time</SelectItem>
                          <SelectItem value="last7">Last 7 days</SelectItem>
                          <SelectItem value="last30">Last 30 days</SelectItem>
                          <SelectItem value="custom">Custom range</SelectItem>
                        </SelectContent>
                      </Select>
                      {selectedResourceDuration === 'custom' && (
                        <div className="mt-2 flex flex-col gap-2">
                          <div className="flex gap-3">
                            <div className="flex-1 space-y-1">
                              <Label htmlFor="util-duration-from" className="text-[11px] text-muted-foreground">
                                From date
                              </Label>
                              <Input
                                id="util-duration-from"
                                type="date"
                                className="h-9"
                                value={customDurationFrom}
                                onChange={(e) => setCustomDurationFrom(e.target.value)}
                              />
                            </div>
                            <div className="flex-1 space-y-1">
                              <Label htmlFor="util-duration-to" className="text-[11px] text-muted-foreground">
                                To date
                              </Label>
                              <Input
                                id="util-duration-to"
                                type="date"
                                className="h-9"
                                value={customDurationTo}
                                onChange={(e) => setCustomDurationTo(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {(selectedResourceProject !== 'all' || selectedResourceUser !== 'all' || selectedResourceSprint !== 'all' || selectedResourceDuration !== 'all' || customDurationFrom || customDurationTo) && (
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            setSelectedResourceProject('all');
                            setSelectedResourceUser('all');
                            setSelectedResourceSprint('all');
                            setSelectedResourceDuration('all');
                            setCustomDurationFrom('');
                            setCustomDurationTo('');
                          }}
                          className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Clear Filters
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {/* Individual Utilization Summary */}
            {loadingResourceUtilization ? (
              <Card className="shadow-md border-t-4 border-t-teal-500">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-10 w-10 animate-spin text-teal-500 mb-4" />
                  <p className="text-sm text-muted-foreground">Loading resource utilization data...</p>
                </CardContent>
              </Card>
            ) : resourceUtilizationRows.length > 0 && individualUtilization.length > 0 ? (
              <Card className="shadow-md border-t-4 border-t-teal-500">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="rounded-lg bg-teal-100 p-2">
                      <TrendingUp className="h-6 w-6 text-teal-600" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl">Individual Utilization Summary</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Team member hours and utilization level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-white">
                    <div className="overflow-auto max-h-[min(70vh,32rem)] min-h-[12rem]">
                      <Table className="min-w-[56rem] border-separate border-spacing-0">
                        <TableHeader>
                          <TableRow className="bg-teal-50 border-b shadow-[0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                            <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold text-teal-800 border-r border-b border-slate-200 px-4 py-3 min-w-[12rem] bg-teal-50">Team Member Name</TableHead>
                            <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold text-teal-800 border-r border-b border-slate-200 px-4 py-3 min-w-[10rem] bg-teal-50">Project</TableHead>
                            <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold text-teal-800 border-r border-b border-slate-200 px-4 py-3 min-w-[8rem] bg-teal-50">Sprint</TableHead>
                            <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold text-teal-800 border-r border-b border-slate-200 px-4 py-3 text-center min-w-[8rem] bg-teal-50">Due Date</TableHead>
                            <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold text-teal-800 border-r border-b border-slate-200 px-4 py-3 text-center min-w-[7rem] bg-teal-50">Task/Issue Count</TableHead>
                            <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold text-teal-800 border-r border-b border-slate-200 px-4 py-3 text-center min-w-[6rem] bg-teal-50">Total Assigned Hours</TableHead>
                            <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold text-teal-800 border-r border-b border-slate-200 px-4 py-3 text-center min-w-[5rem] bg-teal-50">Hours Logged</TableHead>
                            <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold text-teal-800 border-r border-b border-slate-200 px-4 py-3 text-center min-w-[5rem] bg-teal-50">Utilization Level</TableHead>
                            <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold text-teal-800 text-center px-4 py-3 min-w-[6rem] border-b border-slate-200 bg-teal-50">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredIndividualUtilization.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                              <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                                No utilization data available.
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredIndividualUtilization.map((row, index) => {
                              const isExpanded = expandedUtilizationRows.has(row.resourceKey);
                              const hasBreakdown = row.projectSprintBreakdown.length > 1;
                              return (
                                <React.Fragment key={row.resourceKey}>
                                  <TableRow
                                    className={`hover:bg-teal-50/60 transition-colors duration-150 border-b border-slate-100 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} ${hasBreakdown ? 'cursor-pointer' : ''}`}
                                    onClick={hasBreakdown ? () => toggleUtilizationRow(row.resourceKey) : undefined}
                                  >
                                    <TableCell className="font-medium border-r border-slate-100 px-4 py-3 min-w-0">
                                      {hasBreakdown ? (
                                        <span className="inline-flex items-center justify-center w-6 h-6 text-teal-600">
                                          {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                          ) : (
                                            <ChevronRight className="h-4 w-4" />
                                          )}
                                        </span>
                                      ) : (
                                        <span className="inline-block w-6" />
                                      )}
                                      <span className={`${hasBreakdown ? 'ml-1' : ''} break-words text-teal-800 font-semibold`}>{row.resourceName}</span>
                                    </TableCell>
                                    <TableCell className="border-r border-slate-100 px-4 py-3 text-sm min-w-0">
                                      <span className="break-words text-teal-700">{Array.from(new Set(row.projects)).join(', ') || '—'}</span>
                                    </TableCell>
                                    <TableCell className="border-r border-slate-100 px-4 py-3 text-sm min-w-0">
                                      <span className="text-teal-700">
                                        {row.projectSprintBreakdown.length > 0
                                          ? Array.from(new Set(row.projectSprintBreakdown.map(p => p.sprint))).join(', ')
                                          : '—'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="border-r border-slate-100 px-4 py-3 text-sm text-center min-w-0">
                                      <span className="text-teal-700 font-medium">
                                         {[...(row.taskItems || []), ...(row.issueItems || [])]
                                           .filter(i => i.dueDate)
                                           .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0]?.dueDate || '—'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center border-r border-slate-100 px-4 py-3">
                                      <div className="flex flex-col items-center gap-0.5">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const key = row.resourceKey;
                                            setExpandedCountCells(prev => {
                                              const next = new Set(prev);
                                              if (next.has(key)) next.delete(key);
                                              else next.add(key);
                                              return next;
                                            });
                                          }}
                                          className="flex items-center gap-1 font-semibold text-teal-700 hover:text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
                                        >
                                          {row.taskIssueCount}
                                          {(row.taskItems.length + row.issueItems.length) > 0 ? (
                                            expandedCountCells.has(row.resourceKey) ? (
                                              <ChevronDown className="h-3.5 w-3.5" />
                                            ) : (
                                              <ChevronRight className="h-3.5 w-3.5" />
                                            )
                                          ) : null}
                                        </button>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center border-r border-slate-100 px-4 py-3">
                                      <span className="font-semibold tabular-nums text-indigo-600">{row.allocatedHours.toFixed(2)}</span>
                                    </TableCell>
                                    <TableCell className="text-center border-r border-slate-100 px-4 py-3">
                                      <span className="font-semibold tabular-nums text-cyan-600">{row.hoursLogged.toFixed(2)}</span>
                                    </TableCell>
                                    <TableCell className="text-center border-r border-slate-100 px-4 py-3">
                                      <span className={`font-semibold tabular-nums ${
                                        row.allocatedHours <= 0 ? 'text-slate-500' :
                                        row.utilizationLevel >= 80 ? 'text-green-600' :
                                        row.utilizationLevel >= 60 ? 'text-teal-600' :
                                        row.utilizationLevel >= 40 ? 'text-amber-600' :
                                        row.utilizationLevel > 100 ? 'text-red-600' : 'text-orange-600'
                                      }`}>
                                        {row.allocatedHours > 0 ? `${row.utilizationLevel.toFixed(2)}%` : 'N/A'}
                                      </span>
                                    </TableCell>
                                    <TableCell className="text-center px-4 py-3">
                                      <span className="flex justify-center">
                                        <Badge
                                          className={
                                            row.status === 'idle'
                                              ? 'bg-slate-200 text-slate-800 font-semibold border border-slate-300'
                                              : row.status === 'underutilized'
                                                ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300'
                                                : row.status === 'overloaded'
                                                  ? 'bg-red-100 text-red-900 font-semibold border border-red-300'
                                                  : 'bg-green-100 text-green-800 font-semibold border border-green-300'
                                          }
                                        >
                                          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                                        </Badge>
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                  {expandedCountCells.has(row.resourceKey) && [...row.taskItems, ...row.issueItems].map((item, idx) => {
                                    const util = item.estimationHours > 0 ? (item.actualHours / item.estimationHours) * 100 : 0;
                                    const status = item.estimationHours <= 0 ? 'optimal' : item.actualHours === 0 ? 'idle' : util < 50 ? 'underutilized' : util > 120 ? 'overloaded' : 'optimal';
                                    const utilColor = item.estimationHours <= 0 ? 'text-slate-500' : util >= 80 ? 'text-green-600' : util >= 60 ? 'text-teal-600' : util >= 40 ? 'text-amber-600' : util > 100 ? 'text-red-600' : 'text-orange-600';
                                    return (
                                    <TableRow key={`${row.resourceKey}-${item.taskIssueId || idx}`} className="bg-teal-50/25 border-b border-slate-100 hover:bg-teal-50/35 transition-colors duration-150">
                                      <TableCell className="pl-12 py-2 text-sm border-r border-slate-100" />
                                      <TableCell className="py-2 text-sm border-r border-slate-100" />
                                      <TableCell className="py-2 text-sm border-r border-slate-100" />
                                      <TableCell className="py-2 text-sm border-r border-slate-100 px-4 text-center">
                                         <span className={`font-medium ${item.dueDate && new Date(item.dueDate) < new Date() && !['done', 'completed'].includes((item.status || "").toLowerCase()) ? 'text-red-600' : 'text-slate-600'}`}>
                                           {item.dueDate || '—'}
                                         </span>
                                      </TableCell>
                                      <TableCell className="py-2 text-sm font-medium border-r border-slate-100 px-4 min-w-0">
                                        <span className={item.itemType === 'ISSUE' ? 'text-amber-700' : 'text-teal-700'}>
                                          {item.itemType}: <span className="break-words">{item.taskIssueName || '—'}</span>
                                        </span>
                                      </TableCell>
                                      <TableCell className="py-2 text-sm text-center font-medium border-r border-slate-100 px-4 tabular-nums">
                                        <span className="text-indigo-600">{item.estimationHours.toFixed(2)}</span>
                                      </TableCell>
                                      <TableCell className="py-2 text-sm text-center font-medium border-r border-slate-100 px-4 tabular-nums">
                                        <span className="text-cyan-600">{item.actualHours.toFixed(2)}</span>
                                      </TableCell>
                                      <TableCell className="py-2 text-sm text-center border-r border-slate-100 px-4">
                                        <span className={`font-medium ${utilColor}`}>
                                          {item.estimationHours > 0 ? `${util.toFixed(2)}%` : 'N/A'}
                                        </span>
                                      </TableCell>
                                      <TableCell className="py-2 text-center px-4">
                                        <Badge
                                          className={
                                            status === 'idle'
                                              ? 'bg-slate-200 text-slate-800 font-semibold border border-slate-300 text-xs'
                                              : status === 'underutilized'
                                                ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300 text-xs'
                                                : status === 'overloaded'
                                                  ? 'bg-red-100 text-red-900 font-semibold border border-red-300 text-xs'
                                                  : 'bg-green-100 text-green-800 font-semibold border border-green-300 text-xs'
                                          }
                                        >
                                          {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Badge>
                                      </TableCell>
                                    </TableRow>
                                    );
                                  })}
                                  {isExpanded && hasBreakdown && row.projectSprintBreakdown.map((psb) => (
                                    <React.Fragment key={`${psb.project}-${psb.sprint}`}>
                                      <TableRow className="bg-teal-50/35 border-b border-slate-100 hover:bg-teal-50/50 transition-colors duration-150">
                                        <TableCell className="pl-12 py-2 text-sm border-r border-slate-100" />
                                        <TableCell className="py-2 text-sm font-medium border-r border-slate-100 px-4 min-w-0">
                                          <span className="break-words text-teal-700">{psb.project}</span>
                                        </TableCell>
                                        <TableCell className="py-2 text-sm font-medium border-r border-slate-100 px-4 min-w-0">
                                          <span className="break-words text-teal-700">{psb.sprint}</span>
                                        </TableCell>
                                        <TableCell className="py-2 text-sm text-center border-r border-slate-100 px-4 min-w-0">
                                          <span className="text-teal-700 font-medium">{psb.dueDate || '—'}</span>
                                        </TableCell>
                                        <TableCell className="py-2 text-sm text-center font-medium border-r border-slate-100 px-4">
                                          <div className="flex flex-col items-center gap-0.5">
                                            <button
                                              type="button"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const key = `${row.resourceKey}-${psb.project}-${psb.sprint}`;
                                                setExpandedCountCells(prev => {
                                                  const next = new Set(prev);
                                                  if (next.has(key)) next.delete(key);
                                                  else next.add(key);
                                                  return next;
                                                });
                                              }}
                                              className="flex items-center gap-1 font-medium text-teal-700 hover:text-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-500 rounded"
                                            >
                                              {psb.taskIssueCount}
                                              {(psb.taskItems.length + psb.issueItems.length) > 0 ? (
                                                expandedCountCells.has(`${row.resourceKey}-${psb.project}-${psb.sprint}`) ? (
                                                  <ChevronDown className="h-3 w-3" />
                                                ) : (
                                                  <ChevronRight className="h-3 w-3" />
                                                )
                                              ) : null}
                                            </button>
                                          </div>
                                        </TableCell>
                                        <TableCell className="py-2 text-sm text-center font-medium border-r border-slate-100 px-4 tabular-nums">
                                          <span className="text-indigo-600">{psb.allocatedHours.toFixed(2)}</span>
                                        </TableCell>
                                        <TableCell className="py-2 text-sm text-center font-medium border-r border-slate-100 px-4 tabular-nums">
                                          <span className="text-cyan-600">{psb.hoursLogged.toFixed(2)}</span>
                                        </TableCell>
                                        <TableCell className="py-2 text-sm text-center border-r border-slate-100 px-4">
                                          <span className={`font-medium ${
                                            psb.allocatedHours <= 0 ? 'text-slate-500' :
                                            psb.utilizationLevel >= 80 ? 'text-green-600' :
                                            psb.utilizationLevel >= 60 ? 'text-teal-600' :
                                            psb.utilizationLevel >= 40 ? 'text-amber-600' :
                                            psb.utilizationLevel > 100 ? 'text-red-600' : 'text-orange-600'
                                          }`}>
                                            {psb.allocatedHours > 0 ? `${psb.utilizationLevel.toFixed(2)}%` : 'N/A'}
                                          </span>
                                        </TableCell>
                                        <TableCell className="py-2 text-center px-4">
                                          <span className="flex justify-center">
                                            <Badge
                                              className={
                                                psb.status === 'idle'
                                                  ? 'bg-slate-200 text-slate-800 font-semibold border border-slate-300'
                                                  : psb.status === 'underutilized'
                                                    ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300'
                                                    : psb.status === 'overloaded'
                                                      ? 'bg-red-100 text-red-900 font-semibold border border-red-300'
                                                      : 'bg-green-100 text-green-800 font-semibold border border-green-300'
                                              }
                                            >
                                              {psb.status.charAt(0).toUpperCase() + psb.status.slice(1)}
                                            </Badge>
                                          </span>
                                        </TableCell>
                                      </TableRow>
                                      {expandedCountCells.has(`${row.resourceKey}-${psb.project}-${psb.sprint}`) && [...psb.taskItems, ...psb.issueItems].map((item, idx) => {
                                        const util = item.estimationHours > 0 ? (item.actualHours / item.estimationHours) * 100 : 0;
                                        const status = item.estimationHours <= 0 ? 'optimal' : item.actualHours === 0 ? 'idle' : util < 50 ? 'underutilized' : util > 120 ? 'overloaded' : 'optimal';
                                        const utilColor = item.estimationHours <= 0 ? 'text-slate-500' : util >= 80 ? 'text-green-600' : util >= 60 ? 'text-teal-600' : util >= 40 ? 'text-amber-600' : util > 100 ? 'text-red-600' : 'text-orange-600';
                                        return (
                                        <TableRow key={`${row.resourceKey}-${psb.project}-${psb.sprint}-${item.taskIssueId || idx}`} className="bg-teal-50/20 border-b border-slate-100 hover:bg-teal-50/30 transition-colors duration-150">
                                          <TableCell className="pl-16 py-2 text-sm border-r border-slate-100" />
                                          <TableCell className="py-2 text-sm border-r border-slate-100" />
                                          <TableCell className="py-2 text-sm border-r border-slate-100" />
                                          <TableCell className="py-2 text-sm font-medium border-r border-slate-100 px-4 min-w-0">
                                            <span className={item.itemType === 'ISSUE' ? 'text-amber-700' : 'text-teal-700'}>
                                              {item.itemType}: <span className="break-words">{item.taskIssueName || '—'}</span>
                                            </span>
                                          </TableCell>
                                          <TableCell className="py-2 text-sm text-center font-medium border-r border-slate-100 px-4 tabular-nums">
                                            <span className="text-indigo-600">{item.estimationHours.toFixed(2)}</span>
                                          </TableCell>
                                          <TableCell className="py-2 text-sm text-center font-medium border-r border-slate-100 px-4 tabular-nums">
                                            <span className="text-cyan-600">{item.actualHours.toFixed(2)}</span>
                                          </TableCell>
                                          <TableCell className="py-2 text-sm text-center border-r border-slate-100 px-4">
                                            <span className={`font-medium ${utilColor}`}>
                                              {item.estimationHours > 0 ? `${util.toFixed(2)}%` : 'N/A'}
                                            </span>
                                          </TableCell>
                                          <TableCell className="py-2 text-center px-4">
                                            <Badge
                                              className={
                                                status === 'idle'
                                                  ? 'bg-slate-200 text-slate-800 font-semibold border border-slate-300 text-xs'
                                                  : status === 'underutilized'
                                                    ? 'bg-amber-100 text-amber-900 font-semibold border border-amber-300 text-xs'
                                                    : status === 'overloaded'
                                                      ? 'bg-red-100 text-red-900 font-semibold border border-red-300 text-xs'
                                                      : 'bg-green-100 text-green-800 font-semibold border border-green-300 text-xs'
                                              }
                                            >
                                              {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </Badge>
                                          </TableCell>
                                        </TableRow>
                                        );
                                      })}
                                    </React.Fragment>
                                  ))}
                                </React.Fragment>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-md border-t-4 border-t-teal-500 bg-gradient-to-br from-teal-50/50 to-cyan-50/30">
                <CardContent className="flex flex-col items-center justify-center py-24 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mb-4 text-teal-300" strokeWidth={1.5} />
                  <p className="text-sm text-teal-700">No utilization data available.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Bug Report Section */}
        {activeReport === 'bug-report' && (
          <div className="space-y-8">
            {/* Filters and Export */}
            <div className="flex items-end justify-end gap-6 mb-4 lg:mb-6">
              <MultiSelect
                label="Projects"
                icon="📁"
                options={projects}
                selected={selectedProjects}
                onChange={setSelectedProjects}
              />

              <MultiSelect
                label="Sprints"
                icon="🚀"
                options={sprints}
                selected={selectedSprints}
                onChange={setSelectedSprints}
              />

              <button
                onClick={() => {
                  setSelectedProjects([]);
                  setSelectedSprints([]);
                }}
                disabled={selectedProjects.length === 0 && selectedSprints.length === 0}
                className="flex-shrink-0 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:shadow-md h-11 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-4 w-4" />
                Clear {selectedProjects.length > 0 || selectedSprints.length > 0 ? `(${selectedProjects.length + selectedSprints.length})` : ''}
              </button>

              <button
                onClick={handleExportToExcel}
                disabled={exporting || rows.length === 0}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed h-11"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mx-2" />
                    <span className="mx-2">Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mx-2" />
                    <span className="mx-2">Export to Excel</span>
                  </>
                )}
              </button>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mr-2" />
                <span className="text-muted-foreground">Loading bug reports...</span>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 text-red-800">
                    <AlertCircle className="h-6 w-6" />
                    <div>
                      <p className="font-semibold">Error loading bug reports</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary Cards */}
            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="border-l-4 border-l-red-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Total Bugs</p>
                          <p className="text-3xl font-bold text-foreground">{rows.length}</p>
                        </div>
                        <div className="rounded-full bg-red-100 p-3 flex-shrink-0">
                          <Bug className="h-8 w-8 text-red-500" strokeWidth={2} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-orange-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Open</p>
                          <p className="text-3xl font-bold text-orange-600">
                            {rows.filter(r => r.resolution?.toLowerCase() === 'open').length}
                          </p>
                        </div>
                        <div className="rounded-full bg-orange-100 p-3 flex-shrink-0">
                          <AlertCircle className="h-8 w-8 text-orange-500" strokeWidth={2} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-blue-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">In Progress</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {rows.filter(r => r.resolution?.toLowerCase() === 'in progress').length}
                          </p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3 flex-shrink-0">
                          <Clock className="h-8 w-8 text-blue-500" strokeWidth={2} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-green-500 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Resolved</p>
                          <p className="text-3xl font-bold text-green-600">
                            {rows.filter(r => r.resolution?.toLowerCase() === 'resolved' || r.resolution?.toLowerCase() === 'closed').length}
                          </p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3 flex-shrink-0">
                          <CheckCircle2 className="h-8 w-8 text-green-500" strokeWidth={2} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bug Report Table */}
                <Card className="shadow-md border-t-4 border-t-red-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="rounded-lg bg-red-100 p-2">
                        <Bug className="h-6 w-6 text-red-600" strokeWidth={2.5} />
                      </div>
                      <span className="text-xl">Defect Details</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Showing {rows.length} of {bugReports.length} {bugReports.length === 1 ? 'defect' : 'defects'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                      <Table className="[&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground [&_th]:px-4 [&_th]:py-3 [&_td]:text-sm [&_td]:px-4 [&_td]:py-3">
                        <TableHeader>
                          <TableRow className="bg-slate-50 border-b-2 border-slate-300">
                            <TableHead className="font-semibold border-r border-gray-300">Defect Code</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Defect Name</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Type</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Parent Code</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Story</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Linked To Task</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Assigned To</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Workflow Lane</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Priority</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Severity</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Category</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Resolution</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Reported By</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Created Date</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Release</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Sprint</TableHead>
                            <TableHead className="font-semibold">Board</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={17} className="text-center py-12">
                                <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                                  <Bug className="h-12 w-12 text-slate-300" />
                                  <p className="text-sm">No defect data available yet.</p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            rows.map((row, index) => (
                              <TableRow
                                key={row.defectCode}
                                className={`hover:bg-blue-50 transition-colors border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                              >
                                <TableCell className="font-mono text-xs font-semibold text-blue-600 border-r border-gray-300">
                                  {row.defectCode}
                                </TableCell>
                                <TableCell className="max-w-xs border-r border-gray-300">
                                  <div className="font-medium text-foreground">{row.defectName}</div>
                                </TableCell>
                                <TableCell className="border-r border-gray-300">
                                  <Badge variant="outline" className="bg-slate-100">
                                    {row.type || '—'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground border-r border-gray-300">
                                  {row.parentCode || '—'}
                                </TableCell>
                                <TableCell className="border-r border-gray-300">
                                  <span className="text-sm text-foreground">
                                    {row.storyName || '—'}
                                  </span>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-blue-600 border-r border-gray-300">
                                  {row.linkedToTask || '—'}
                                </TableCell>
                                <TableCell className="border-r border-gray-300">
                                  <span className="text-sm font-medium">{row.assignedTo || '—'}</span>
                                </TableCell>
                                <TableCell className="border-r border-gray-300">
                                  <Badge variant="outline" className="bg-slate-50">
                                    {row.workflowLane || '—'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="border-r border-gray-300">{getPriorityBadge(row.priority)}</TableCell>
                                <TableCell className="border-r border-gray-300">{getSeverityBadge(row.severity)}</TableCell>
                                <TableCell className="border-r border-gray-300">{getCategoryBadge(row.defectCategory)}</TableCell>
                                <TableCell className="border-r border-gray-300">{getResolutionBadge(row.resolution)}</TableCell>
                                <TableCell className="text-muted-foreground border-r border-gray-300">
                                  {row.reportedBy || '—'}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs border-r border-gray-300">
                                  {row.createdDate || '—'}
                                </TableCell>
                                <TableCell className="border-r border-gray-300">
                                  <Badge variant="outline" className="text-xs">
                                    {row.release || '—'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground border-r border-gray-300">
                                  {row.sprint || '—'}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {row.board || '—'}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Resource Performance Section */}
        {activeReport === 'resource-performance' && (
          <div className="flex flex-col gap-10">

            {/* Loading or Content */}
            {loadingResourcePerformance ? (
              <>
                {/* Skeleton Summary Card */}
                <Card className="shadow-lg border-t-4 border-t-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Users className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <span>Resource Performance Summary</span>
                    </CardTitle>
                    <CardDescription>Loading team utilization and allocation metrics...</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex w-full gap-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className="flex-1 min-w-0 p-4 rounded-lg border border-slate-200 bg-slate-50 animate-pulse space-y-2"
                        >
                          <div className="h-3 w-24 bg-slate-200 rounded" />
                          <div className="h-7 w-20 bg-slate-300 rounded" />
                          <div className="h-3 w-28 bg-slate-200 rounded" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Skeleton Table Card */}
                <Card className="shadow-md border-t-4 border-t-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Users className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <span className="text-xl">Resource Performance Details</span>
                    </CardTitle>
                    <CardDescription className="mt-2 flex items-center space-x-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      <span>Preparing detailed data, this can take a few seconds...</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-hidden">
                      <div className="h-10 bg-slate-50 border-b border-slate-200" />
                      {[0, 1, 2, 3, 4].map((row) => (
                        <div
                          key={row}
                          className="grid grid-cols-6 gap-4 px-4 py-3 border-b border-slate-100 animate-pulse"
                        >
                          {[0, 1, 2, 3, 4, 5].map((col) => (
                            <div key={col} className="h-4 bg-slate-200 rounded" />
                          ))}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* Filters */}
                {resourcePerformanceRows.length > 0 && (
                  <Card className="shadow-sm border border-blue-100 bg-gradient-to-br from-white to-blue-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-lg text-blue-800">
                        <div className="rounded-lg bg-blue-100 p-1.5">
                          <Filter className="h-5 w-5 text-blue-600" />
                        </div>
                        <span>Filters</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-6">
                        {/* Project Filter */}
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <Label htmlFor="project-filter">Project</Label>
                          <Select value={selectedResourceProject} onValueChange={setSelectedResourceProject}>
                            <SelectTrigger id="project-filter">
                              <SelectValue placeholder="All Projects" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Projects</SelectItem>
                              {resourceProjects.map(projectName => (
                                <SelectItem key={projectName} value={projectName}>
                                  {projectName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Sprint Filter */}
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <Label htmlFor="sprint-filter">Sprint</Label>
                          <Select value={selectedResourceSprint} onValueChange={handleResourceSprintChange}>
                            <SelectTrigger id="sprint-filter">
                              <SelectValue placeholder="All Sprints" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Sprints</SelectItem>
                              {resourceSprints.map(sprintName => (
                                <SelectItem key={sprintName} value={sprintName}>
                                  {sprintName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* User Filter */}
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <Label htmlFor="user-filter">User</Label>
                          <Select value={selectedResourceUser} onValueChange={setSelectedResourceUser}>
                            <SelectTrigger id="user-filter">
                              <SelectValue placeholder="All Users" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              {resourceUsers.map(user => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Duration Filter */}
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <Label htmlFor="duration-filter">Duration</Label>
                          <Select
                            value={selectedResourceDuration}
                            onValueChange={value => setSelectedResourceDuration(value as ResourceDurationFilter)}
                          >
                            <SelectTrigger id="duration-filter">
                              <SelectValue placeholder="All time" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All time</SelectItem>
                              <SelectItem value="last7">Last 7 days</SelectItem>
                              <SelectItem value="last30">Last 30 days</SelectItem>
                              <SelectItem value="custom">Custom range</SelectItem>
                            </SelectContent>
                          </Select>
                          {selectedResourceDuration === 'custom' && (
                            <div className="mt-2 flex flex-col gap-2">
                              <div className="flex gap-3">
                                <div className="flex-1 space-y-1">
                                  <Label htmlFor="duration-from" className="text-[11px] text-muted-foreground">
                                    From date
                                  </Label>
                                  <Input
                                    id="duration-from"
                                    type="date"
                                    className="h-9"
                                    value={customDurationFrom}
                                    onChange={e => setCustomDurationFrom(e.target.value)}
                                  />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <Label htmlFor="duration-to" className="text-[11px] text-muted-foreground">
                                    To date
                                  </Label>
                                  <Input
                                    id="duration-to"
                                    type="date"
                                    className="h-9"
                                    value={customDurationTo}
                                    onChange={e => setCustomDurationTo(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Clear Filters Button */}
                        {(selectedResourceProject !== 'all' || selectedResourceUser !== 'all' || selectedResourceSprint !== 'all' || selectedResourceDuration !== 'all' || customDurationFrom || customDurationTo) && (
                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                setSelectedResourceProject('all');
                                setSelectedResourceUser('all');
                                setSelectedResourceSprint('all');
                                setSelectedResourceDuration('all');
                                setCustomDurationFrom('');
                                setCustomDurationTo('');
                              }}
                              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                              Clear Filters
                            </button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="shadow-lg border-t-4 border-t-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="rounded-lg bg-blue-100 p-2">
                        <Users className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <span>Resource Performance Summary</span>
                    </CardTitle>
                    <CardDescription>Team utilization and allocation metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {summaryData ? (
                      <>
                        <div className="flex w-full gap-4">
                          <div className="flex-1 min-w-0 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-2">Total Resources</p>
                            <p className="text-3xl font-bold text-blue-600">
                              {summaryData.totalResources || summaryData.activeResources || 0}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">Active team members</p>
                          </div>
                          <div className="flex-1 min-w-0 p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <p className="text-xs font-medium text-purple-700 uppercase tracking-wider mb-2">Utilization</p>
                            <p className="text-3xl font-bold text-purple-600">
                              {summaryData.averageUtilization != null
                                ? `${Math.round(summaryData.averageUtilization)}%`
                                : summaryData.utilizationRate != null
                                  ? `${Math.round(summaryData.utilizationRate)}%`
                                  : '0%'}
                            </p>
                             <p className="text-xs text-purple-600 mt-1">Total Actual / Total Est.</p>
                            <div className="mt-2 pt-2 border-t border-purple-200 space-y-1">
                              <p className="text-xs font-medium text-purple-700">Idle</p>
                              <p className="text-xs text-purple-600">
                                Not Allocated: {summaryData.idleNotAllocatedCount ?? 0} resource(s)
                              </p>
                              <p className="text-xs text-purple-600">
                                Early Completed: {(summaryData.idleEarlyCompletedHours ?? 0).toFixed(2)} h
                              </p>
                            </div>
                          </div>
                          <div className={`flex-1 min-w-0 p-4 rounded-lg border transition-all duration-300 ${
                            (summaryData.totalHours ?? 0) < 15
                              ? 'bg-red-50 border-red-200 ring-1 ring-red-100 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                              : 'bg-emerald-50 border-emerald-200'
                          }`}>
                            <p className={`text-xs font-medium uppercase tracking-wider mb-2 ${
                              (summaryData.totalHours ?? 0) < 15 ? 'text-red-700' : 'text-emerald-700'
                            }`}>Efficiency</p>
                            <p className={`text-3xl font-bold ${
                              (summaryData.totalHours ?? 0) < 15 ? 'text-red-600' : 'text-emerald-600'
                            }`}>
                              {summaryData.averageEfficiency != null
                                ? `${Math.round(summaryData.averageEfficiency)}%`
                                : summaryData.averageUtilization != null
                                  ? `${Math.round(summaryData.averageUtilization)}%`
                                  : '0%'}
                            </p>
                            <p className={`text-xs mt-1 ${
                              (summaryData.totalHours ?? 0) < 15 ? 'text-red-600' : 'text-emerald-600'
                            }`}>Total Est. / Total Actual</p>
                            
                            {(summaryData.totalHours ?? 0) < 15 && (
                              <div className="mt-2 pt-2 border-t border-red-200">
                                <p className="text-[10px] font-bold text-red-700 uppercase flex items-center">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Unreliable Stat
                                </p>
                                <p className="text-[10px] text-red-600 mt-0.5">
                                  Logged hours ({summaryData.totalHours?.toFixed(2)}h) are under the required 10-15h threshold.
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <p className="text-xs font-medium text-indigo-700 uppercase tracking-wider mb-2">Allocated Hours</p>
                            <p className="text-3xl font-bold text-indigo-600">
                              {(summaryData.allocatedHours ?? 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-indigo-600 mt-1">Planned allocation</p>
                          </div>
                          <div className="flex-1 min-w-0 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                            <p className="text-xs font-medium text-cyan-700 uppercase tracking-wider mb-2">Total Hours</p>
                            <p className="text-3xl font-bold text-cyan-600">
                              {(summaryData.totalHours ?? 0).toFixed(2)}
                            </p>
                            <p className="text-xs text-cyan-600 mt-1">Actual hours logged</p>
                          </div>
                        </div>
                        {summaryData.projectUtilization && summaryData.projectUtilization.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Top Projects by Utilization</p>
                            <div className="space-y-2">
                              {summaryData.projectUtilization.slice(0, 3).map((project, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="text-foreground truncate max-w-[200px]" title={project.projectName}>
                                    {project.projectName}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${Math.min(project.utilization, 100)}%` }}
                                      />
                                    </div>
                                    <span className="font-semibold text-blue-600 w-12 text-right">
                                      {Math.round(project.utilization)}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mb-2 text-gray-300" />
                        <p className="text-sm">Resource performance data not available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resource Performance Table */}
                <Card className="shadow-md border-t-4 border-t-blue-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center space-x-3">
                        <div className="rounded-lg bg-blue-100 p-2">
                          <Users className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl">Resource Performance Details</span>
                      </CardTitle>
                      <CardDescription className="mt-2 text-sm text-muted-foreground flex items-center flex-wrap gap-x-3">
                        <span>
                          Showing {filteredResourcePerformanceRows.length} of {resourcePerformanceRows.length}{' '}
                          {resourcePerformanceRows.length === 1 ? 'record' : 'records'}
                        </span>
                        {(selectedResourceProject !== 'all' || selectedResourceUser !== 'all' || selectedResourceSprint !== 'all' || selectedResourceDuration !== 'all') && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-tight">
                            Filtered View
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-[200px]">
                        <Select value={selectedResourceUser} onValueChange={setSelectedResourceUser}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Filter by User" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Resources</SelectItem>
                            {resourceUsers.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border overflow-x-auto">
                      <Table className="[&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground [&_th]:px-4 [&_th]:py-3 [&_td]:text-sm [&_td]:px-4 [&_td]:py-3">
                        <TableHeader>
                          <TableRow className="bg-slate-50 border-b-2 border-slate-300">
                            <TableHead className="font-semibold border-r border-gray-300">Resource Email Id</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Resource Name</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Task/Issue Name</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Task/Issue Id</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Story Name</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Story Id</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Estimation Hours</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Actual Hours</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Remaining Hours</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Reporter Name</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Work Category</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Status</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Created Date</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Due Date</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Completed Date</TableHead>
                            <TableHead className="font-semibold border-r border-gray-300">Sprint</TableHead>
                            <TableHead className="font-semibold">Project</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredResourcePerformanceRows.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={17} className="text-center py-12">
                                <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                                  <Users className="h-12 w-12 text-slate-300" />
                                  <p className="text-sm">
                                    {resourcePerformanceRows.length === 0
                                      ? 'No resource performance data available yet.'
                                      : 'No data matches the selected filters.'}
                                  </p>
                                  {(selectedResourceProject !== 'all' || selectedResourceUser !== 'all') && (
                                    <button
                                      onClick={() => {
                                        setSelectedResourceProject('all');
                                        setSelectedResourceUser('all');
                                      }}
                                      className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                                    >
                                      Clear filters
                                    </button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            paginatedResourcePerformanceRows.map((row, index) => {
                              const isExpanded = expandedPerformanceLogs.has(index);
                              // Show dropdown if there are explicitly mapped entries OR if actual hours > 0
                              const hasLogs = (row.timeEntries && row.timeEntries.length > 0) || (row.actualHours != null && row.actualHours > 0);
                              
                              return (
                                <React.Fragment key={index}>
                                  <TableRow
                                    className={`hover:bg-blue-50 transition-colors border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} ${hasLogs ? 'cursor-pointer' : ''}`}
                                    onClick={hasLogs ? () => {
                                      setExpandedPerformanceLogs(prev => {
                                        const next = new Set(prev);
                                        if (next.has(index)) next.delete(index);
                                        else next.add(index);
                                        return next;
                                      });
                                    } : undefined}
                                  >
                                    <TableCell className="text-muted-foreground border-r border-gray-300">
                                      {row.resourceEmailId || '—'}
                                    </TableCell>
                                    <TableCell className="font-medium border-r border-gray-300">
                                      {row.resourceName || '—'}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300">
                                      {row.taskIssueName || '—'}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300 font-mono text-[10px] text-blue-600">
                                      {row.taskIssueId || '—'}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300">
                                      {row.storyName || '—'}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300 font-mono text-[10px] text-blue-600 truncate max-w-[100px]" title={row.storyId}>
                                      {row.storyId || '—'}
                                    </TableCell>
                                    <TableCell className="text-center border-r border-gray-300 tabular-nums font-medium text-indigo-600">
                                      {row.estimationHours != null ? row.estimationHours.toFixed(2) : '—'}
                                    </TableCell>
                                    <TableCell className="text-center font-semibold text-blue-600 border-r border-gray-300 tabular-nums select-none group">
                                      <div className="flex items-center justify-center space-x-2">
                                        <span>{row.actualHours != null ? row.actualHours.toFixed(2) : '0.00'}</span>
                                        {hasLogs && (
                                          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                            <ChevronDown className="h-4 w-4 text-blue-400 group-hover:text-blue-600" />
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-center border-r border-gray-300 tabular-nums font-medium text-amber-600">
                                      {row.remainingHours != null ? row.remainingHours.toFixed(2) : '—'}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300">
                                      {row.reporterName || '—'}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300">
                                      <Badge variant="outline" className="text-[10px] font-normal border-slate-300 bg-slate-50">
                                        {row.workCategory || 'Development'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300">
                                      <Badge
                                        className={`text-[10px] uppercase font-bold ${
                                          (row.status || '').toUpperCase() === 'DONE'
                                            ? 'bg-green-100 text-green-700 border-green-200'
                                            : (row.status || '').toUpperCase() === 'IN_PROGRESS' || (row.status || '').toUpperCase() === 'IN PROGRESS'
                                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                                              : 'bg-slate-100 text-slate-600 border-slate-200'
                                        }`}
                                      >
                                        {(row.status || 'TO DO').replace('_', ' ')}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300 text-xs">
                                      {row.createdDate || '—'}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300 text-xs">
                                      {row.dueDate || '—'}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300 text-xs">
                                      {row.completedDate || '—'}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300 text-xs">
                                      {row.sprint || '—'}
                                    </TableCell>
                                    <TableCell className="border-r border-gray-300 text-xs">
                                      {row.project || '—'}
                                    </TableCell>
                                  </TableRow>
                                  {isExpanded && hasLogs && (
                                    <TableRow className="bg-blue-50/30 border-b border-blue-100/50 hover:bg-blue-50/30">
                                      <TableCell colSpan={17} className="px-8 py-6">
                                        <div className="bg-white rounded-xl border border-blue-200 shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                                          {/* Header Section */}
                                          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center space-x-3 text-white">
                                              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                                <Clock className="h-5 w-5 text-white" />
                                              </div>
                                              <div>
                                                <h3 className="text-sm font-bold uppercase tracking-wider">Detailed Effort Logs Breakdown</h3>
                                                <p className="text-[10px] text-blue-100 opacity-90 font-medium">Full visibility into task and subtask performance</p>
                                              </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                              <div className="flex flex-col items-end">
                                                <span className="text-[10px] font-bold text-blue-100 uppercase tracking-tight">Record ID</span>
                                                <span className="text-xs font-mono font-bold text-white bg-white/10 px-2 py-0.5 rounded leading-none">{row.taskIssueId}</span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="p-6 space-y-8">
                                            {/* Summary Stats Cards */}
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 transition-all hover:shadow-md hover:border-blue-300 group">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Estimated Hours</p>
                                                <p className="text-2xl font-bold text-slate-800 tabular-nums">{row.estimationHours != null ? row.estimationHours.toFixed(2) : '0.00'}<span className="text-xs font-medium text-slate-400 ml-1">h</span></p>
                                              </div>
                                              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 transition-all hover:shadow-md hover:border-blue-400 group">
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Total Actual Logged</p>
                                                <p className="text-2xl font-bold text-blue-800 tabular-nums">{row.actualHours != null ? row.actualHours.toFixed(2) : '0.00'}<span className="text-xs font-medium text-blue-400 ml-1">h</span></p>
                                              </div>
                                              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 transition-all hover:shadow-md hover:border-amber-400 group">
                                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">Remaining Scope</p>
                                                <p className="text-2xl font-bold text-amber-800 tabular-nums">{row.remainingHours != null ? row.remainingHours.toFixed(2) : '0.00'}<span className="text-xs font-medium text-amber-400 ml-1">h</span></p>
                                              </div>
                                              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 transition-all hover:shadow-md hover:border-indigo-400 group">
                                                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Total Logs Count</p>
                                                <p className="text-2xl font-bold text-indigo-800 tabular-nums">{(row.timeEntries?.length || 0) + (row.subtasks?.length || 0)}<span className="text-xs font-medium text-indigo-400 ml-1">entries</span></p>
                                              </div>
                                            </div>

                                            {/* Subtasks Section */}
                                            {row.subtasks && row.subtasks.length > 0 && (
                                              <div className="space-y-3">
                                                <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                                                  <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Subtasks Performance ({row.subtasks.length})</h4>
                                                </div>
                                                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-slate-50/30">
                                                  <table className="w-full text-left border-collapse">
                                                    <thead>
                                                      <tr className="bg-slate-100/80 border-b border-slate-200">
                                                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight">Subtask Title</th>
                                                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight">Assignee</th>
                                                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight text-center">Status</th>
                                                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight text-center">Est.</th>
                                                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight text-center">Actual</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody className="bg-white">
                                                      {row.subtasks.map((sub, sIdx) => (
                                                        <tr key={sIdx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 text-xs">
                                                          <td className="px-4 py-3 font-medium text-slate-800">{sub.title}</td>
                                                          <td className="px-4 py-3 text-slate-500 italic">{sub.assigneeName || 'Unassigned'}</td>
                                                          <td className="px-4 py-3 text-center">
                                                            <Badge className={`text-[9px] uppercase font-bold py-0 h-4 ${sub.isCompleted ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                                              {sub.isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                                                            </Badge>
                                                          </td>
                                                          <td className="px-4 py-3 text-center tabular-nums text-slate-500 font-medium">
                                                            {sub.estimatedHours != null ? Number(sub.estimatedHours).toFixed(2) : '—'}
                                                          </td>
                                                          <td className="px-4 py-3 text-center tabular-nums font-bold text-indigo-600">
                                                            {sub.actualHours != null ? Number(sub.actualHours).toFixed(2) : '0.00'}h
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            )}

                                            {/* Daily Logs Section */}
                                            <div className="space-y-3">
                                              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Detailed Daily Log Entries ({row.timeEntries?.length || 0})</h4>
                                              </div>
                                              
                                              {row.timeEntries && row.timeEntries.length > 0 ? (
                                                <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-slate-50/30">
                                                  <table className="w-full text-left border-collapse">
                                                    <thead>
                                                      <tr className="bg-slate-100/80 border-b border-slate-200">
                                                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight w-32">Work Date</th>
                                                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight text-center w-24">Hours</th>
                                                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight">Log Description</th>
                                                        <th className="px-4 py-2.5 text-[10px] font-bold text-slate-600 uppercase tracking-tight w-32">Entry Type</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody className="bg-white">
                                                      {row.timeEntries.sort((a,b) => new Date(b.workDate).getTime() - new Date(a.workDate).getTime()).map((entry, eIdx) => {
                                                        const isManagerLog = entry.description?.includes('[Logged by');
                                                        return (
                                                          <tr key={eIdx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 text-xs">
                                                            <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                                                              {formatDate(entry.workDate)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center border-x border-slate-50">
                                                              <span className="font-bold text-blue-600 tabular-nums">
                                                                {Number(entry.hoursWorked || 0).toFixed(2)}h
                                                              </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-slate-700 italic max-w-xl break-words leading-relaxed group relative">
                                                              <div className="flex items-start">
                                                                <span>{entry.description || <span className="text-slate-400">No description provided</span>}</span>
                                                                {isManagerLog && (
                                                                  <Badge variant="secondary" className="ml-2 bg-indigo-50 text-indigo-700 text-[8px] h-3 px-1 border-indigo-100">MANAGER</Badge>
                                                                )}
                                                              </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tighter shadow-sm">
                                                                {entry.entryType || 'Development'}
                                                              </span>
                                                            </td>
                                                          </tr>
                                                        );
                                                      })}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              ) : (
                                                <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 py-10 flex flex-col items-center justify-center text-center px-4">
                                                  <div className="p-3 bg-slate-100 rounded-full mb-3">
                                                    <AlertCircle className="h-6 w-6 text-slate-400" />
                                                  </div>
                                                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">No direct daily logs found</p>
                                                  <p className="text-[10px] text-slate-400 mt-1 max-w-xs">Specific effort entries were not found for this record. Hours may be rolled up from subtasks or were bulk added without description logs.</p>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {/* Footer Branding */}
                                          <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-100 text-right">
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">SprintSync Internal Analytics Engine © 2026</p>
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </React.Fragment>
                              );
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {filteredResourcePerformanceRows.length > 0 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 text-xs text-muted-foreground">
                        <span>
                          Showing {currentStartIndex}-{currentEndIndex} of {filteredResourcePerformanceRows.length}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setResourcePage(prev => Math.max(1, prev - 1))}
                            disabled={resourcePage <= 1}
                            className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                          >
                            Previous
                          </button>
                          <span className="text-xs">
                            Page {Math.min(resourcePage, totalResourcePages)} of {totalResourcePages}
                          </span>
                          <button
                            type="button"
                            onClick={() => setResourcePage(prev => Math.min(totalResourcePages, prev + 1))}
                            disabled={resourcePage >= totalResourcePages || filteredResourcePerformanceRows.length === 0}
                            className="px-3 py-1.5 rounded border border-slate-300 bg-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resource Performance Summary Tables */}
                {filteredResourcePerformanceRows.length > 0 && (
                  <div className="flex flex-col gap-10">
                    {/* Developers Summary Table */}
                    {resourceSummary.developers.length > 0 && (
                      <Card className="shadow-md border-t-4 border-t-blue-500">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-3">
                            <div className="rounded-lg bg-blue-100 p-2">
                              <Users className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl">Developers Summary</span>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Task and issue assignment and bug metrics for developers
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-lg border border-slate-200 shadow-sm bg-white">
                            <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto' }} className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50">
                              <Table className="border-separate border-spacing-0">
                                <TableHeader>
                                  <TableRow className="bg-blue-50 border-b shadow-sm">
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-blue-50">Name (Developer)</TableHead>
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-blue-50">Task Assigned</TableHead>
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-blue-50">Issue Assigned</TableHead>
                                    {resourceSummary.allLanes.map((laneName) => (
                                      <TableHead 
                                        key={laneName} 
                                        style={{ position: 'sticky', top: 0, zIndex: 30 }} 
                                        className="font-semibold border-r border-b border-gray-300 bg-blue-50 text-center"
                                      >
                                        {laneName}
                                      </TableHead>
                                    ))}
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-blue-50">Over Due</TableHead>
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-blue-50">Total Bug Resolved</TableHead>
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-b border-gray-300 bg-blue-50">Rework Count For Bugs</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {resourceSummary.developers.map((dev, index) => (
                                    <TableRow
                                      key={index}
                                      className={`hover:bg-blue-50 transition-colors border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                    >
                                      <TableCell className="font-medium border-r border-gray-300">
                                        {dev.name}
                                      </TableCell>
                                      <TableCell className="text-center border-r border-gray-300">
                                        <span className="font-semibold">{dev.taskAssigned}</span>
                                      </TableCell>
                                      <TableCell className="text-center border-r border-gray-300">
                                        <span className="font-semibold text-purple-600">{dev.issueAssigned}</span>
                                      </TableCell>
                                      {resourceSummary.allLanes.map((laneName) => (
                                        <TableCell key={laneName} className="text-center border-r border-gray-300">
                                          <Badge 
                                            className={`${
                                              laneName.toLowerCase().includes('done') 
                                                ? 'bg-green-100 text-green-800 border-green-200' 
                                                : laneName.toLowerCase().includes('progress') || laneName.toLowerCase().includes('ongoing')
                                                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                                            }`}
                                          >
                                            {dev.laneCounts[laneName] || 0}
                                          </Badge>
                                        </TableCell>
                                      ))}
                                      <TableCell className="text-center border-r border-gray-300">
                                        <Badge className={dev.overdueCount > 0 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'}>
                                          {dev.overdueCount}
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-center border-r border-gray-300">
                                        <span className="font-semibold text-green-600">{dev.totalBugResolved}</span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className="font-semibold text-orange-600">{dev.reworkCountForBugs}</span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Managers Summary Table */}
                    {resourceSummary.managers.length > 0 && (
                      <Card className="shadow-md border-t-4 border-t-indigo-500">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-3">
                            <div className="rounded-lg bg-indigo-100 p-2">
                              <Users className="h-6 w-6 text-indigo-600" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl">Managers Summary</span>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Created and assigned tasks/issues for managers
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-lg border border-slate-200 shadow-sm bg-white">
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50">
                              <Table className="border-separate border-spacing-0">
                                <TableHeader>
                                  <TableRow className="bg-indigo-50 border-b shadow-sm">
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-indigo-50">Name (Manager)</TableHead>
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-indigo-50">Issue Created</TableHead>
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-indigo-50">Task Created</TableHead>
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-indigo-50">Task Assigned</TableHead>
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-b border-gray-300 bg-indigo-50">Issue Assigned</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {resourceSummary.managers.map((mgr, index) => (
                                    <TableRow
                                      key={index}
                                      className={`hover:bg-indigo-50 transition-colors border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                    >
                                      <TableCell className="font-medium border-r border-gray-300">
                                        {mgr.name}
                                      </TableCell>
                                      <TableCell className="text-center border-r border-gray-300">
                                        <span className="font-semibold text-purple-600">{mgr.issueCreated}</span>
                                      </TableCell>
                                      <TableCell className="text-center border-r border-gray-300">
                                        <span className="font-semibold text-blue-600">{mgr.taskCreated}</span>
                                      </TableCell>
                                      <TableCell className="text-center border-r border-gray-300">
                                        <span className="font-semibold">{mgr.taskAssigned}</span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className="font-semibold text-rose-600">{mgr.issueAssigned}</span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Testers Summary Table */}
                    {resourceSummary.testers.length > 0 && (
                      <Card className="shadow-md border-t-4 border-t-purple-500">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-3">
                            <div className="rounded-lg bg-purple-100 p-2">
                              <Users className="h-6 w-6 text-purple-600" strokeWidth={2.5} />
                            </div>
                            <span className="text-xl">Testers Summary</span>
                          </CardTitle>
                          <CardDescription className="mt-2">
                            Performance metrics for testers
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="rounded-lg border border-slate-200 shadow-sm bg-white">
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50">
                              <Table className="border-separate border-spacing-0">
                                <TableHeader>
                                  <TableRow className="bg-purple-50 border-b shadow-sm">
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-purple-50">Name (Tester)</TableHead>
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-r border-b border-gray-300 bg-purple-50">Issue Created</TableHead>
                                    <TableHead style={{ position: 'sticky', top: 0, zIndex: 30 }} className="font-semibold border-b border-gray-300 bg-purple-50">Task Assigned</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {resourceSummary.testers.map((tester, index) => (
                                    <TableRow
                                      key={index}
                                      className={`hover:bg-purple-50 transition-colors border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                    >
                                      <TableCell className="font-medium border-r border-gray-300">
                                        {tester.name}
                                      </TableCell>
                                      <TableCell className="text-center border-r border-gray-300">
                                        <span className="font-semibold text-purple-600">{tester.issueCreated}</span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className="font-semibold">{tester.taskAssigned}</span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {resourceSummary.developers.length === 0 && resourceSummary.testers.length === 0 && resourceSummary.managers.length === 0 && (
                      <Card className="shadow-md">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                          <BarChart3 className="h-12 w-12 mb-2 text-gray-300" />
                          <p className="text-sm">No summary data available</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Show card selection view when no report is selected
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-white px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-12">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md border border-slate-100">
              <BarChart3 className="h-8 w-8 text-blue-600" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Analytics
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">Reports</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                View and analyze project reports and metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Bug Report Card */}
          <Card
            className="group cursor-pointer border border-slate-200/80 bg-white/80 shadow-sm hover:shadow-lg hover:border-red-200 hover:-translate-y-0.5 transition-all duration-200 rounded-xl"
            onClick={() => setActiveReport('bug-report')}
          >
            <CardContent className="p-8 flex flex-col items-start space-y-3 text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 group-hover:bg-red-100 transition-colors">
                <Bug className="w-8 h-8 text-red-600" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-red-600 transition-colors">
                  Bug Report
                </h3>
                <p className="text-sm text-muted-foreground">
                  Code quality and bug reports.
                </p>
              </div>
              <p className="text-xs text-blue-600 font-medium mt-2 group-hover:underline">
                Click to view →
              </p>
            </CardContent>
          </Card>

          {/* Resource Performance Card */}
          <Card
            className="group cursor-pointer border border-slate-200/80 bg-white/80 shadow-sm hover:shadow-lg hover:border-orange-200 hover:-translate-y-0.5 transition-all duration-200 rounded-xl"
            onClick={() => setActiveReport('resource-performance')}
          >
            <CardContent className="p-8 flex flex-col items-start space-y-3 text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 group-hover:bg-orange-100 transition-colors">
                <Users className="w-8 h-8 text-orange-600" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-orange-600 transition-colors">
                  Resource Performance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Team capacity and allocation.
                </p>
              </div>
              <p className="text-xs text-orange-600 font-medium mt-2 group-hover:underline">
                Click to view →
              </p>
            </CardContent>
          </Card>

          {/* Resource Utilization Report Card */}
          <Card
            className="group cursor-pointer border border-teal-200/80 bg-gradient-to-br from-teal-50/60 to-cyan-50/40 shadow-sm hover:shadow-lg hover:border-teal-400 hover:-translate-y-0.5 transition-all duration-200 rounded-xl"
            onClick={() => setActiveReport('resource-utilization')}
          >
            <CardContent className="p-8 flex flex-col items-start space-y-3 text-left">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 group-hover:from-teal-200 group-hover:to-cyan-200 transition-colors border border-teal-200/50">
                <BarChart3 className="h-7 w-7 text-teal-600" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-teal-800 transition-colors">
                  Resource Utilization Report
                </h3>
                <p className="text-sm text-muted-foreground">
                  Resource utilization analytics.
                </p>
              </div>
              <p className="text-xs text-teal-600 font-medium mt-2 group-hover:underline group-hover:text-teal-700">
                Click to view →
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Export the component
export default ReportsPage;
