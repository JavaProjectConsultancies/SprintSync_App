import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { 
  userApiService,
  departmentApiService,
  domainApiService,
  projectApiService,
  epicApiService,
  releaseApiService,
  sprintApiService,
  storyApiService,
  taskApiService,
  subtaskApiService,
  dashboardApiService,
  reportsApiService,
  searchApiService,
  batchApiService,
  apiClient
} from '../services/api';

interface ApiStatus {
  name: string;
  endpoint: string;
  status: 'checking' | 'success' | 'error' | 'not-implemented';
  responseTime?: number;
  error?: string;
}

/**
 * API Status Checker Component
 * Verifies all backend APIs are working and accessible
 */
export const ApiStatusChecker: React.FC = () => {
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');

  // Define all API endpoints to check
  const apiEndpoints = [
    // Core Entity APIs
    { name: 'Users API', endpoint: '/api/users', service: userApiService, method: 'getUsers' },
    { name: 'Departments API', endpoint: '/api/departments', service: departmentApiService, method: 'getDepartments' },
    { name: 'Domains API', endpoint: '/api/domains', service: domainApiService, method: 'getDomains' },
    { name: 'Projects API', endpoint: '/api/projects', service: projectApiService, method: 'getProjects' },
    { name: 'Epics API', endpoint: '/api/epics', service: epicApiService, method: 'getEpics' },
    { name: 'Releases API', endpoint: '/api/releases', service: releaseApiService, method: 'getReleases' },
    { name: 'Sprints API', endpoint: '/api/sprints', service: sprintApiService, method: 'getSprints' },
    { name: 'Stories API', endpoint: '/api/stories', service: storyApiService, method: 'getStories' },
    { name: 'Tasks API', endpoint: '/api/tasks', service: taskApiService, method: 'getTasks' },
    { name: 'Subtasks API', endpoint: '/api/subtasks', service: subtaskApiService, method: 'getSubtasks' },
    
    // Utility APIs
    { name: 'Dashboard API', endpoint: '/api/dashboard/metrics', service: dashboardApiService, method: 'getDashboardMetrics' },
    { name: 'Reports API', endpoint: '/api/reports/projects', service: reportsApiService, method: 'getProjectReports' },
    { name: 'Search API', endpoint: '/api/search/global', service: searchApiService, method: 'globalSearch' },
    { name: 'Batch Operations API', endpoint: '/api/batch', service: batchApiService, method: 'bulkCreateProjects' },
  ];

  const checkApiStatus = async (endpoint: ApiStatus & { service: any; method: string }) => {
    const startTime = Date.now();
    
    try {
      // Test the API endpoint
      const response = await apiClient.get(endpoint.endpoint);
      const responseTime = Date.now() - startTime;
      
      return {
        name: endpoint.name,
        endpoint: endpoint.endpoint,
        status: 'success' as const,
        responseTime,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      return {
        name: endpoint.name,
        endpoint: endpoint.endpoint,
        status: 'error' as const,
        responseTime,
        error: error.message || 'Unknown error',
      };
    }
  };

  const checkAllApis = async () => {
    setIsChecking(true);
    setOverallStatus('checking');
    
    // Initialize all APIs as checking
    setApiStatuses(apiEndpoints.map(api => ({
      name: api.name,
      endpoint: api.endpoint,
      status: 'checking' as const,
    })));

    // Check each API endpoint
    const results = await Promise.all(
      apiEndpoints.map(api => checkApiStatus(api))
    );

    setApiStatuses(results);
    
    // Determine overall status
    const hasErrors = results.some(result => result.status === 'error');
    const hasSuccess = results.some(result => result.status === 'success');
    
    if (hasSuccess && !hasErrors) {
      setOverallStatus('success');
    } else if (hasErrors) {
      setOverallStatus('error');
    }
    
    setIsChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getOverallStatusBadge = () => {
    switch (overallStatus) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">All APIs Connected</Badge>;
      case 'error':
        return <Badge variant="destructive">Some APIs Failed</Badge>;
      case 'checking':
        return <Badge variant="secondary">Checking APIs...</Badge>;
      default:
        return <Badge variant="outline">Ready to Check</Badge>;
    }
  };

  const successfulApis = apiStatuses.filter(api => api.status === 'success').length;
  const failedApis = apiStatuses.filter(api => api.status === 'error').length;
  const totalApis = apiStatuses.length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>API Status Checker</CardTitle>
            <div className="flex items-center gap-2">
              {getOverallStatusBadge()}
              <Button 
                onClick={checkAllApis} 
                disabled={isChecking}
                className="ml-2"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check All APIs'
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successfulApis}</div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{failedApis}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalApis}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            {/* API Status List */}
            <div className="space-y-2">
              {apiStatuses.map((api, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(api.status)}
                      <div>
                        <div className="font-medium">{api.name}</div>
                        <div className="text-sm text-gray-500">{api.endpoint}</div>
                        {api.error && (
                          <div className="text-sm text-red-500 mt-1">{api.error}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {api.responseTime && (
                        <span className="text-sm text-gray-500">
                          {api.responseTime}ms
                        </span>
                      )}
                      {getStatusBadge(api.status)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Instructions */}
            <Card className="p-4 bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Make sure the Spring Boot backend is running on port 8080</li>
                <li>• Ensure the database is connected and tables are created</li>
                <li>• Check that all controllers and services are properly implemented</li>
                <li>• Verify CORS configuration allows requests from the frontend</li>
              </ul>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiStatusChecker;
