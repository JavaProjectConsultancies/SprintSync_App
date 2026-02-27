import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Bug, AlertCircle, AlertTriangle, CheckCircle2, XCircle, Clock, Loader2, X, Download, ChevronDown, Users, TrendingUp, BarChart3, ArrowLeft, Filter } from 'lucide-react';
import { reportsApiService } from '../services/api/utilities/reportsApi';
import { toast } from 'sonner';
import { useUsers } from '../hooks/api';

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
}

interface ResourcePerformanceData {
  totalResources?: number;
  activeResources?: number;
  averageUtilization?: number;
  totalHours?: number;
  allocatedHours?: number;
  utilizationRate?: number;
  projectUtilization?: Array<{
    projectId: string;
    projectName: string;
    utilization: number;
    allocatedHours: number;
    actualHours: number;
  }>;
  rows?: ResourcePerformanceRow[];
}

type ReportType = 'bug-report' | 'resource-performance' | null;
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
  const [selectedResourceSprint, setSelectedResourceSprint] = useState<string>('all');
  const [selectedResourceDuration, setSelectedResourceDuration] = useState<ResourceDurationFilter>('all');
  const [customDurationFrom, setCustomDurationFrom] = useState<string>('');
  const [customDurationTo, setCustomDurationTo] = useState<string>('');
  const [resourcePage, setResourcePage] = useState<number>(1);
  const [exportingResource, setExportingResource] = useState(false);

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

  // Shared loader for resource performance data
  const loadResourcePerformance = useCallback(async () => {
    try {
      setLoadingResourcePerformance(true);

      const response = await reportsApiService.getResourceUtilizationReports();
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
            itemType: row.itemType || null,
            isBug: typeof row.isBug === 'boolean'
              ? row.isBug
              : typeof row.isBug === 'string'
              ? row.isBug.toLowerCase() === 'true'
              : undefined,
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

  // Preload resource performance data once when the Reports page mounts
  useEffect(() => {
    loadResourcePerformance();
  }, [loadResourcePerformance]);

  // Optionally ensure data is available when switching to resource-performance view
  useEffect(() => {
    if (activeReport === 'resource-performance' && resourcePerformanceRows.length === 0) {
      loadResourcePerformance();
    }
  }, [activeReport, resourcePerformanceRows.length, loadResourcePerformance]);

  // Get unique projects and sprints for filters
  const projects = Array.from(new Set(bugReports.map(r => r.board).filter(Boolean)));
  const sprints = Array.from(new Set(bugReports.map(r => r.sprint).filter(Boolean)));

  // Filter resource performance rows based on selected filters
  const filteredResourcePerformanceRows = useMemo(() => {
    let filtered = resourcePerformanceRows;

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

    // Filter by duration (relative to createdDate) - only when a sprint is selected
    if (selectedResourceSprint !== 'all' && selectedResourceDuration !== 'all') {
      if (selectedResourceDuration === 'custom') {
        // Custom from/to date range
        const fromDate = customDurationFrom ? new Date(customDurationFrom) : null;
        const toDate = customDurationTo ? new Date(customDurationTo) : null;

        filtered = filtered.filter(row => {
          if (!row.createdDate) return false;
          const d = new Date(row.createdDate);
          if (isNaN(d.getTime())) return false;

          if (fromDate && !isNaN(fromDate.getTime()) && d < fromDate) return false;
          if (toDate && !isNaN(toDate.getTime())) {
            // include end date day fully
            const endOfTo = new Date(toDate);
            endOfTo.setHours(23, 59, 59, 999);
            if (d > endOfTo) return false;
          }
          return true;
        });
      } else {
        const now = new Date();
        const days = selectedResourceDuration === 'last7' ? 7 : 30;
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - days);

        filtered = filtered.filter(row => {
          if (!row.createdDate) return false;
          const d = new Date(row.createdDate);
          if (isNaN(d.getTime())) return false;
          return d >= cutoff;
        });
      }
    }

    return filtered;
  }, [resourcePerformanceRows, selectedResourceProject, selectedResourceUser, selectedResourceSprint, selectedResourceDuration]);

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
        const toDo = rows.filter(r => {
          const status = (r.status || '').toLowerCase();
          return status === 'to_do' || status === 'todo' || status === 'to do';
        }).length;

        const onGoing = rows.filter(r => {
          const status = (r.status || '').toLowerCase();
          return status === 'in_progress' || status === 'in-progress' || status === 'in progress';
        }).length;

        const done = rows.filter(r => {
          const status = (r.status || '').toLowerCase();
          return status === 'done' || status === 'completed';
        }).length;

        const totalBugResolved = rows.filter(r => {
          const status = (r.status || '').toLowerCase();
          return isIssueRow(r) && (status === 'done' || status === 'completed');
        }).length;

        const reworkCountForBugs = rows.filter(r => {
          const status = (r.status || '').toLowerCase();
          const hasCompletedDate = !!r.completedDate;
          const isNotDone = status !== 'done' && status !== 'completed';
          return isIssueRow(r) && hasCompletedDate && isNotDone;
        }).length;

        developers.push({
          name: resourceName,
          taskAssigned,
          issueAssigned,
          toDo,
          onGoing,
          done,
          totalBugResolved,
          reworkCountForBugs,
        });
      }
    });

    return { developers, testers, managers };
  }, [filteredResourcePerformanceRows, userRoleMap]);

  // Get unique projects and users from resource performance data
  const resourceProjects = useMemo(() => {
    const projectSet = new Set<string>();
    resourcePerformanceRows.forEach(row => {
      if (row.project) {
        projectSet.add(row.project);
      }
    });
    return Array.from(projectSet).sort();
  }, [resourcePerformanceRows]);

  // Sprints list depends on selected project
  const resourceSprints = useMemo(() => {
    const sprintSet = new Set<string>();
    const sourceRows =
      selectedResourceProject === 'all'
        ? resourcePerformanceRows
        : resourcePerformanceRows.filter(row => row.project === selectedResourceProject);

    sourceRows.forEach(row => {
      if (row.sprint) {
        sprintSet.add(row.sprint);
      }
    });
    return Array.from(sprintSet).sort();
  }, [resourcePerformanceRows, selectedResourceProject]);

  // Users list depends on selected project
  const resourceUsers = useMemo(() => {
    const userMap = new Map<string, { id: string; label: string }>();
    const sourceRows =
      selectedResourceProject === 'all'
        ? resourcePerformanceRows
        : resourcePerformanceRows.filter(row => row.project === selectedResourceProject);

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
  }, [resourcePerformanceRows, selectedResourceProject]);

  const resourceSummary = calculateResourceSummary();

  // Aggregate summary for filtered resource performance rows
  const filteredSummary = useMemo(() => {
    if (!filteredResourcePerformanceRows.length) return null;

    const resourceSet = new Set<string>();
    let totalEstimated = 0;
    let totalActual = 0;
    const projectMap = new Map<string, { allocatedHours: number; actualHours: number }>();

    filteredResourcePerformanceRows.forEach(row => {
      const key = row.resourceEmailId || row.resourceName || '';
      if (key) resourceSet.add(key);

      const est = row.estimationHours ?? 0;
      const act = row.actualHours ?? 0;
      totalEstimated += est;
      totalActual += act;

      const projectKey = row.project || 'Unknown';
      const existing = projectMap.get(projectKey) || { allocatedHours: 0, actualHours: 0 };
      existing.allocatedHours += est;
      existing.actualHours += act;
      projectMap.set(projectKey, existing);
    });

    const avgUtilization = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;

    const projectUtilization = Array.from(projectMap.entries()).map(([projectName, values]) => ({
      projectId: projectName,
      projectName,
      utilization: values.allocatedHours > 0 ? (values.actualHours / values.allocatedHours) * 100 : 0,
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

      if (sprintForExport && selectedResourceDuration !== 'all') {
        durationForExport = selectedResourceDuration;
        if (selectedResourceDuration === 'custom') {
          fromDateForExport = customDurationFrom || undefined;
          toDateForExport = customDurationTo || undefined;
        }
      }

      const blob = await reportsApiService.exportResourceUtilizationToExcel({
        projectName: projectNameForExport,
        userKey: userKeyForExport,
        sprint: sprintForExport,
        duration: durationForExport,
        fromDate: fromDateForExport,
        toDate: toDateForExport,
      });
      if (!blob || blob.size === 0) {
        throw new Error('Received empty file from server');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      let filename = 'resource-performance';
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
    } catch (err: any) {
      console.error('Error exporting resource performance:', err);
      toast.error(err.message || 'Failed to export resource performance to Excel');
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

      // Create download link
      const url = window.URL.createObjectURL(blob);
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-white to-white px-4 sm:px-6 lg:px-10 py-6 lg:py-8 space-y-8">
        {/* Back Button and Header */}
      <div className="flex items-center justify-between gap-4">
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
          </div>
        </div>
        {activeReport === 'resource-performance' && (
          <button
            type="button"
            onClick={handleExportResourcePerformance}
            disabled={exportingResource || resourcePerformanceRows.length === 0}
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-green-600 to-cyan-600 px-8 py-3 text-sm font-semibold text-white shadow-md hover:from-green-700 hover:to-cyan-700 active:shadow-lg disabled:from-green-400 disabled:to-cyan-400 disabled:cursor-not-allowed min-w-[190px] mr-4"
          >
            {exportingResource ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export to Excel
              </>
            )}
          </button>
        )}
      </div>

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
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export to Excel
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
          <div className="space-y-8">

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
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="p-4 rounded-lg border border-slate-200 bg-slate-50 animate-pulse space-y-2"
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
                <Card className="shadow-sm border">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Filter className="h-5 w-5" />
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
                        {selectedResourceSprint !== 'all' && selectedResourceDuration === 'custom' && (
                          <div className="mt-2 flex flex-col gap-2">
                            <div className="flex gap-3">
                              <div className="flex-1 space-y-1">
                                <Label htmlFor="duration-from" className="text-[11px] text-muted-foreground">
                                  From date
                                </Label>
                                <input
                                  id="duration-from"
                                  type="date"
                                  className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={customDurationFrom}
                                  onChange={e => setCustomDurationFrom(e.target.value)}
                                />
                              </div>
                              <div className="flex-1 space-y-1">
                                <Label htmlFor="duration-to" className="text-[11px] text-muted-foreground">
                                  To date
                                </Label>
                                <input
                                  id="duration-to"
                                  type="date"
                                  className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  value={customDurationTo}
                                  onChange={e => setCustomDurationTo(e.target.value)}
                                />
                              </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              Leave one side empty to filter from or up to a specific date.
                            </p>
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

              <Card className="shadow-lg border-t-4 border-t-blue-500 mt-2">
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-2">Total Resources</p>
                          <p className="text-3xl font-bold text-blue-600">
                            {summaryData.totalResources || summaryData.activeResources || 0}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">Active team members</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs font-medium text-purple-700 uppercase tracking-wider mb-2">Avg Utilization</p>
                          <p className="text-3xl font-bold text-purple-600">
                            {summaryData.averageUtilization 
                              ? `${Math.round(summaryData.averageUtilization)}%`
                              : summaryData.utilizationRate 
                              ? `${Math.round(summaryData.utilizationRate)}%`
                              : '0%'}
                          </p>
                          <p className="text-xs text-purple-600 mt-1">Resource efficiency</p>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                          <p className="text-xs font-medium text-indigo-700 uppercase tracking-wider mb-2">Allocated Hours</p>
                          <p className="text-3xl font-bold text-indigo-600">
                            {summaryData.allocatedHours || 0}
                          </p>
                          <p className="text-xs text-indigo-600 mt-1">Planned allocation</p>
                        </div>
                        <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                          <p className="text-xs font-medium text-cyan-700 uppercase tracking-wider mb-2">Total Hours</p>
                          <p className="text-3xl font-bold text-cyan-600">
                            {summaryData.totalHours || 0}
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
              <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Users className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                    </div>
                    <span className="text-xl">Resource Performance Details</span>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Showing {filteredResourcePerformanceRows.length} of {resourcePerformanceRows.length}{' '}
                    {resourcePerformanceRows.length === 1 ? 'record' : 'records'}
                    {(selectedResourceProject !== 'all' || selectedResourceUser !== 'all') && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (filtered)
                      </span>
                    )}
                  </CardDescription>
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
                          paginatedResourcePerformanceRows.map((row, index) => (
                            <TableRow
                              key={index}
                              className={`hover:bg-blue-50 transition-colors border-b border-slate-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                            >
                              <TableCell className="text-muted-foreground border-r border-gray-300">
                                {row.resourceEmailId || '—'}
                              </TableCell>
                              <TableCell className="font-medium border-r border-gray-300">
                                {row.resourceName || '—'}
                              </TableCell>
                              <TableCell className="max-w-xs border-r border-gray-300">
                                <div className="font-medium text-foreground">{row.taskIssueName || '—'}</div>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-blue-600 border-r border-gray-300">
                                {row.taskIssueId || '—'}
                              </TableCell>
                              <TableCell className="border-r border-gray-300">
                                <span className="text-sm text-foreground">{row.storyName || '—'}</span>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-blue-600 border-r border-gray-300">
                                {row.storyId || '—'}
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-300">
                                <span className="font-semibold">
                                  {row.estimationHours != null ? row.estimationHours.toFixed(2) : '—'}
                                </span>
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-300">
                                <span className="font-semibold text-blue-600">
                                  {row.actualHours != null ? row.actualHours.toFixed(2) : '—'}
                                </span>
                              </TableCell>
                              <TableCell className="text-center border-r border-gray-300">
                                <span className="font-semibold text-orange-600">
                                  {row.remainingHours != null ? row.remainingHours.toFixed(2) : '—'}
                                </span>
                              </TableCell>
                              <TableCell className="text-muted-foreground border-r border-gray-300">
                                {row.reporterName || '—'}
                              </TableCell>
                              <TableCell className="border-r border-gray-300">
                                <Badge variant="outline" className="bg-slate-50">
                                  {row.workCategory || '—'}
                                </Badge>
                              </TableCell>
                              <TableCell className="border-r border-gray-300">
                                {row.status ? (
                                  <Badge 
                                    className={
                                      row.status.toLowerCase() === 'completed' || row.status.toLowerCase() === 'done'
                                        ? 'bg-green-100 text-green-800 border-green-200'
                                        : row.status.toLowerCase() === 'in progress' || row.status.toLowerCase() === 'in-progress'
                                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                                        : 'bg-orange-100 text-orange-800 border-orange-200'
                                    }
                                  >
                                    {row.status}
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">—</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs border-r border-gray-300">
                                {row.createdDate || '—'}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs border-r border-gray-300">
                                {row.dueDate || '—'}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs border-r border-gray-300">
                                {row.completedDate || '—'}
                              </TableCell>
                              <TableCell className="text-muted-foreground border-r border-gray-300">
                                {row.sprint || '—'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {row.project || '—'}
                              </TableCell>
                            </TableRow>
                          ))
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
                <div className="space-y-6">
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
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-blue-50 border-b-2 border-blue-300">
                                <TableHead className="font-semibold border-r border-gray-300">Name (Developer)</TableHead>
                                <TableHead className="font-semibold border-r border-gray-300">Task Assigned</TableHead>
                                <TableHead className="font-semibold border-r border-gray-300">Issue Assigned</TableHead>
                                <TableHead className="font-semibold border-r border-gray-300">To Do</TableHead>
                                <TableHead className="font-semibold border-r border-gray-300">On Going</TableHead>
                                <TableHead className="font-semibold border-r border-gray-300">Done</TableHead>
                                <TableHead className="font-semibold border-r border-gray-300">Total Bug Resolved</TableHead>
                                <TableHead className="font-semibold">Rework Count For Bugs</TableHead>
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
                                  <TableCell className="text-center border-r border-gray-300">
                                    <Badge className="bg-slate-100 text-slate-800 border-slate-200">
                                      {dev.toDo}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center border-r border-gray-300">
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                                      {dev.onGoing}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-center border-r border-gray-300">
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      {dev.done}
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
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-indigo-50 border-b-2 border-indigo-300">
                                <TableHead className="font-semibold border-r border-gray-300">Name (Manager)</TableHead>
                                <TableHead className="font-semibold border-r border-gray-300">Issue Created</TableHead>
                                <TableHead className="font-semibold border-r border-gray-300">Task Created</TableHead>
                                <TableHead className="font-semibold border-r border-gray-300">Task Assigned</TableHead>
                                <TableHead className="font-semibold">Issue Assigned</TableHead>
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
                        <div className="rounded-md border overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-purple-50 border-b-2 border-purple-300">
                                <TableHead className="font-semibold border-r border-gray-300">Name (Tester)</TableHead>
                                <TableHead className="font-semibold border-r border-gray-300">Issue Created</TableHead>
                                <TableHead className="font-semibold">Task Assigned</TableHead>
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
        </div>
      </div>
    </div>
  );
};

// Export the component
export default ReportsPage;
