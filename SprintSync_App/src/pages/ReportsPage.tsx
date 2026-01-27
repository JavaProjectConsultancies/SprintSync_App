import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Bug, AlertCircle, AlertTriangle, CheckCircle2, XCircle, Clock, Loader2, X, Download } from 'lucide-react';
import { reportsApiService } from '../services/api/utilities/reportsApi';
import { toast } from 'sonner';

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

const ReportsPage: React.FC = () => {
  const [bugReports, setBugReports] = useState<BugReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedSprint, setSelectedSprint] = useState<string>('all');
  const [exporting, setExporting] = useState(false);

  // Fetch bug report data from API
  useEffect(() => {
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
  }, []);

  // Get unique projects and sprints for filters
  const projects = Array.from(new Set(bugReports.map(r => r.board).filter(Boolean)));
  const sprints = Array.from(new Set(bugReports.map(r => r.sprint).filter(Boolean)));

  // Filter rows based on selected filters
  const rows = bugReports.filter(row => {
    const projectMatch = selectedProject === 'all' || row.board === selectedProject;
    const sprintMatch = selectedSprint === 'all' || row.sprint === selectedSprint;
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

  // Export bug report to Excel
  const handleExportToExcel = async () => {
    try {
      setExporting(true);
      console.log('🟢 Starting Excel export...');
      const projectId = selectedProject !== 'all' ? selectedProject : undefined;
      console.log('🟢 Project ID:', projectId);
      
      const blob = await reportsApiService.exportBugReportToExcel(projectId);
      console.log('🟢 Blob received:', blob.size, 'bytes, type:', blob.type);
      
      if (!blob || blob.size === 0) {
        throw new Error('Received empty file from server');
      }
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = projectId 
        ? `bug-report-project-${projectId}-${new Date().toISOString().split('T')[0]}.xlsx`
        : `bug-report-${new Date().toISOString().split('T')[0]}.xlsx`;
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

  // Show loading state
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
          <p className="text-muted-foreground">Loading bug reports...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
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
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with icon and gradient */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-red-500 shadow-lg">
            <Bug className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bug Reports</h1>
            <p className="text-sm text-muted-foreground">Track and manage defects across all projects</p>
          </div>
        </div>

        {/* Filters and Export */}
        <div className="flex items-end gap-6">
          <div className="flex items-end gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">Project</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="px-4 py-3 border-2 border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white hover:border-slate-400 transition-colors min-w-[200px] cursor-pointer shadow-sm h-11"
              >
                <option value="all">📁 All Projects</option>
                {projects.map(project => (
                  <option key={project} value={project}>📁 {project}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wider">Sprint</label>
              <select
                value={selectedSprint}
                onChange={(e) => setSelectedSprint(e.target.value)}
                className="px-4 py-3 border-2 border-slate-300 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 bg-white hover:border-slate-400 transition-colors min-w-[200px] cursor-pointer shadow-sm h-11"
              >
                <option value="all">🚀 All Sprints</option>
                {sprints.map(sprint => (
                  <option key={sprint} value={sprint}>🚀 {sprint}</option>
                ))}
              </select>
            </div>

            {(selectedProject !== 'all' || selectedSprint !== 'all') && (
              <button
                onClick={() => {
                  setSelectedProject('all');
                  setSelectedSprint('all');
                }}
                className="px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all hover:shadow-md border-2 border-red-200 hover:border-red-300 h-11"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

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
      </div>

      {/* Summary Cards */}
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
                  {rows.filter(r => r.resolution?.toLowerCase() === 'resolved').length}
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
    </div>
  );
};

// Export the component
export default ReportsPage;
