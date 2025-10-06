import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { 
  useProjects, 
  useUsers, 
  useDepartments, 
  useDomains,
  projectApiService,
  userApiService,
  departmentApiService,
  domainApiService
} from '../hooks/api';
import { useCreateProject } from '../hooks/api/useProjects';
import { useCreateUser } from '../hooks/api/useUsers';

/**
 * API Test Component
 * Tests all API endpoints and demonstrates real-time data integration
 */
export const ApiTestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [isTesting, setIsTesting] = useState(false);

  // API Hooks
  const { data: projects, loading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { data: users, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers();
  const { data: departments, loading: departmentsLoading, error: departmentsError, refetch: refetchDepartments } = useDepartments();
  const { data: domains, loading: domainsLoading, error: domainsError, refetch: refetchDomains } = useDomains();

  // Mutation hooks
  const createProjectMutation = useCreateProject();
  const createUserMutation = useCreateUser();

  // Test form states
  const [testProject, setTestProject] = useState({
    name: 'Test Project',
    description: 'API Test Project',
    status: 'PLANNING',
    priority: 'MEDIUM',
    managerId: '1',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    budget: 100000,
    isActive: true
  });

  const [testUser, setTestUser] = useState({
    name: 'Test User',
    email: 'test@example.com',
    role: 'DEVELOPER',
    isActive: true
  });

  // Run comprehensive API tests
  const runApiTests = async () => {
    setIsTesting(true);
    const results: Record<string, any> = {};

    try {
      // Test 1: Projects API
      try {
        const projectsResponse = await projectApiService.getProjects();
        results.projects = {
          status: 'success',
          data: projectsResponse.data,
          message: `Found ${projectsResponse.data?.content?.length || 0} projects`
        };
      } catch (error: any) {
        results.projects = {
          status: 'error',
          error: error.message,
          message: 'Projects API failed'
        };
      }

      // Test 2: Users API
      try {
        const usersResponse = await userApiService.getUsers();
        results.users = {
          status: 'success',
          data: usersResponse.data,
          message: `Found ${usersResponse.data?.content?.length || 0} users`
        };
      } catch (error: any) {
        results.users = {
          status: 'error',
          error: error.message,
          message: 'Users API failed'
        };
      }

      // Test 3: Departments API
      try {
        const departmentsResponse = await departmentApiService.getDepartments();
        results.departments = {
          status: 'success',
          data: departmentsResponse.data,
          message: `Found ${departmentsResponse.data?.content?.length || 0} departments`
        };
      } catch (error: any) {
        results.departments = {
          status: 'error',
          error: error.message,
          message: 'Departments API failed'
        };
      }

      // Test 4: Domains API
      try {
        const domainsResponse = await domainApiService.getDomains();
        results.domains = {
          status: 'success',
          data: domainsResponse.data,
          message: `Found ${domainsResponse.data?.content?.length || 0} domains`
        };
      } catch (error: any) {
        results.domains = {
          status: 'error',
          error: error.message,
          message: 'Domains API failed'
        };
      }

      setTestResults(results);
    } catch (error) {
      console.error('API test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  // Test creating a project
  const testCreateProject = async () => {
    try {
      await createProjectMutation.mutateAsync(testProject);
      await refetchProjects(); // Refresh the projects list
    } catch (error) {
      console.error('Failed to create test project:', error);
    }
  };

  // Test creating a user
  const testCreateUser = async () => {
    try {
      await createUserMutation.mutateAsync(testUser);
      await refetchUsers(); // Refresh the users list
    } catch (error) {
      console.error('Failed to create test user:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Integration Test</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="status">API Status</TabsTrigger>
              <TabsTrigger value="data">Live Data</TabsTrigger>
              <TabsTrigger value="create">Create Test</TabsTrigger>
              <TabsTrigger value="results">Test Results</TabsTrigger>
            </TabsList>

            {/* API Status Tab */}
            <TabsContent value="status">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">API Endpoint Status</h3>
                  <Button onClick={runApiTests} disabled={isTesting}>
                    {isTesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Run API Tests'
                    )}
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {projectsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : projectsError ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span className="font-medium">Projects API</span>
                        </div>
                        {projectsLoading ? (
                          <Badge variant="secondary">Loading...</Badge>
                        ) : projectsError ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-500">Connected</Badge>
                        )}
                      </div>
                      {projectsError && (
                        <p className="text-sm text-red-500 mt-2">{projectsError.message}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {usersLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : usersError ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span className="font-medium">Users API</span>
                        </div>
                        {usersLoading ? (
                          <Badge variant="secondary">Loading...</Badge>
                        ) : usersError ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-500">Connected</Badge>
                        )}
                      </div>
                      {usersError && (
                        <p className="text-sm text-red-500 mt-2">{usersError.message}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {departmentsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : departmentsError ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span className="font-medium">Departments API</span>
                        </div>
                        {departmentsLoading ? (
                          <Badge variant="secondary">Loading...</Badge>
                        ) : departmentsError ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-500">Connected</Badge>
                        )}
                      </div>
                      {departmentsError && (
                        <p className="text-sm text-red-500 mt-2">{departmentsError.message}</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {domainsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          ) : domainsError ? (
                            <XCircle className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          <span className="font-medium">Domains API</span>
                        </div>
                        {domainsLoading ? (
                          <Badge variant="secondary">Loading...</Badge>
                        ) : domainsError ? (
                          <Badge variant="destructive">Error</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-500">Connected</Badge>
                        )}
                      </div>
                      {domainsError && (
                        <p className="text-sm text-red-500 mt-2">{domainsError.message}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Live Data Tab */}
            <TabsContent value="data">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Live API Data</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Projects ({projects?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {projectsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : projectsError ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{projectsError.message}</AlertDescription>
                        </Alert>
                      ) : projects && projects.length > 0 ? (
                        <div className="space-y-2">
                          {projects.slice(0, 3).map((project: any) => (
                            <div key={project.id} className="p-2 border rounded">
                              <div className="font-medium">{project.name}</div>
                              <div className="text-sm text-gray-500">{project.status}</div>
                            </div>
                          ))}
                          {projects.length > 3 && (
                            <div className="text-sm text-gray-500">... and {projects.length - 3} more</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No projects found</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Users ({users?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {usersLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : usersError ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{usersError.message}</AlertDescription>
                        </Alert>
                      ) : users && users.length > 0 ? (
                        <div className="space-y-2">
                          {users.slice(0, 3).map((user: any) => (
                            <div key={user.id} className="p-2 border rounded">
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.role}</div>
                            </div>
                          ))}
                          {users.length > 3 && (
                            <div className="text-sm text-gray-500">... and {users.length - 3} more</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No users found</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Departments ({departments?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {departmentsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : departmentsError ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{departmentsError.message}</AlertDescription>
                        </Alert>
                      ) : departments && departments.length > 0 ? (
                        <div className="space-y-2">
                          {departments.slice(0, 3).map((dept: any) => (
                            <div key={dept.id} className="p-2 border rounded">
                              <div className="font-medium">{dept.name}</div>
                              <div className="text-sm text-gray-500">{dept.description}</div>
                            </div>
                          ))}
                          {departments.length > 3 && (
                            <div className="text-sm text-gray-500">... and {departments.length - 3} more</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No departments found</div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Domains ({domains?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {domainsLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : domainsError ? (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{domainsError.message}</AlertDescription>
                        </Alert>
                      ) : domains && domains.length > 0 ? (
                        <div className="space-y-2">
                          {domains.slice(0, 3).map((domain: any) => (
                            <div key={domain.id} className="p-2 border rounded">
                              <div className="font-medium">{domain.name}</div>
                              <div className="text-sm text-gray-500">{domain.description}</div>
                            </div>
                          ))}
                          {domains.length > 3 && (
                            <div className="text-sm text-gray-500">... and {domains.length - 3} more</div>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No domains found</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Create Test Tab */}
            <TabsContent value="create">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Test API Create Operations</h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Test Create Project */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Test Create Project</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Project Name</label>
                        <Input
                          value={testProject.name}
                          onChange={(e) => setTestProject({ ...testProject, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          value={testProject.description}
                          onChange={(e) => setTestProject({ ...testProject, description: e.target.value })}
                        />
                      </div>
                      <Button 
                        onClick={testCreateProject} 
                        disabled={createProjectMutation.isPending}
                        className="w-full"
                      >
                        {createProjectMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Test Project'
                        )}
                      </Button>
                      {createProjectMutation.isSuccess && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>Project created successfully!</AlertDescription>
                        </Alert>
                      )}
                      {createProjectMutation.isError && (
                        <Alert variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>Failed to create project</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Test Create User */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Test Create User</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">User Name</label>
                        <Input
                          value={testUser.name}
                          onChange={(e) => setTestUser({ ...testUser, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          value={testUser.email}
                          onChange={(e) => setTestUser({ ...testUser, email: e.target.value })}
                        />
                      </div>
                      <Button 
                        onClick={testCreateUser} 
                        disabled={createUserMutation.isPending}
                        className="w-full"
                      >
                        {createUserMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          'Create Test User'
                        )}
                      </Button>
                      {createUserMutation.isSuccess && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>User created successfully!</AlertDescription>
                        </Alert>
                      )}
                      {createUserMutation.isError && (
                        <Alert variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>Failed to create user</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Test Results Tab */}
            <TabsContent value="results">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">API Test Results</h3>
                
                {Object.keys(testResults).length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No test results yet. Click "Run API Tests" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(testResults).map(([key, result]: [string, any]) => (
                      <Card key={key}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(result.status)}
                              <span className="font-medium capitalize">{key} API</span>
                            </div>
                            {getStatusBadge(result.status)}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{result.message}</p>
                          {result.error && (
                            <p className="text-sm text-red-500 mt-1">Error: {result.error}</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTestComponent;
