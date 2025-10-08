import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  useProjects, 
  useSprints, 
  useStories, 
  useTasks, 
  useSubtasks,
  useUsers,
  useDepartments,
  useDomains,
  dashboardApiService,
  reportsApiService,
  searchApiService,
  batchApiService
} from '../hooks/api';
import { Project, Sprint, Story, Task, Subtask, User, Department, Domain } from '../types/api';

/**
 * API Integration Demo Component
 * Demonstrates how to use all the API services with proper error handling
 */
export const ApiIntegrationDemo: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedSprintId, setSelectedSprintId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // API Hooks
  const { data: projects, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: sprints, loading: sprintsLoading, error: sprintsError } = useSprints();
  const { data: stories, loading: storiesLoading, error: storiesError } = useStories();
  const { data: tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { data: subtasks, loading: subtasksLoading, error: subtasksError } = useSubtasks();
  const { data: users, loading: usersLoading, error: usersError } = useUsers();
  const { data: departments, loading: departmentsLoading, error: departmentsError } = useDepartments();
  const { data: domains, loading: domainsLoading, error: domainsError } = useDomains();

  // Dashboard data
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any>(null);

  // Load dashboard metrics on component mount
  useEffect(() => {
    const loadDashboardMetrics = async () => {
      try {
        const response = await dashboardApiService.getDashboardMetrics();
        setDashboardMetrics(response.data);
      } catch (error) {
        console.error('Failed to load dashboard metrics:', error);
      }
    };

    loadDashboardMetrics();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await searchApiService.globalSearch(searchQuery);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  // Filter data based on selections
  const filteredSprints = sprints?.filter(sprint => sprint.projectId === selectedProjectId) || [];
  const filteredStories = stories?.filter(story => story.sprintId === selectedSprintId) || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Integration Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="sprints">Sprints</TabsTrigger>
              <TabsTrigger value="stories">Stories</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            </TabsList>

            {/* Projects Tab */}
            <TabsContent value="projects">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Projects</h3>
                {projectsLoading && <div>Loading projects...</div>}
                {projectsError && <div className="text-red-500">Error: {projectsError.message}</div>}
                {projects && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project: Project) => (
                      <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-sm">{project.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Badge variant="outline">{project.status}</Badge>
                            <Badge variant="secondary">{project.priority}</Badge>
                            <p className="text-xs text-gray-600">{project.description}</p>
                            <p className="text-xs">
                              Progress: {project.progressPercentage}%
                            </p>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedProjectId(project.id)}
                              variant={selectedProjectId === project.id ? "default" : "outline"}
                            >
                              Select
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Sprints Tab */}
            <TabsContent value="sprints">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sprints</h3>
                {selectedProjectId && (
                  <p className="text-sm text-gray-600">
                    Showing sprints for selected project
                  </p>
                )}
                {sprintsLoading && <div>Loading sprints...</div>}
                {sprintsError && <div className="text-red-500">Error: {sprintsError.message}</div>}
                {filteredSprints.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {filteredSprints.map((sprint: Sprint) => (
                      <Card key={sprint.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-sm">{sprint.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Badge variant="outline">{sprint.status}</Badge>
                            <p className="text-xs text-gray-600">{sprint.goal}</p>
                            <div className="flex justify-between text-xs">
                              <span>Capacity: {sprint.capacityHours || 0}h</span>
                              <span>Velocity: {sprint.velocityPoints || 0}pts</span>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedSprintId(sprint.id)}
                              variant={selectedSprintId === sprint.id ? "default" : "outline"}
                            >
                              Select
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Stories Tab */}
            <TabsContent value="stories">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Stories</h3>
                {selectedSprintId && (
                  <p className="text-sm text-gray-600">
                    Showing stories for selected sprint
                  </p>
                )}
                {storiesLoading && <div>Loading stories...</div>}
                {storiesError && <div className="text-red-500">Error: {storiesError.message}</div>}
                {filteredStories.length > 0 && (
                  <div className="space-y-3">
                    {filteredStories.map((story: Story) => (
                      <Card key={story.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h4 className="font-medium">{story.title}</h4>
                              <p className="text-sm text-gray-600">{story.description}</p>
                              <div className="flex gap-2">
                                <Badge variant="outline">{story.status}</Badge>
                                <Badge variant="secondary">{story.priority}</Badge>
                                {story.storyPoints && (
                                  <Badge variant="outline">{story.storyPoints} pts</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Tasks</h3>
                {tasksLoading && <div>Loading tasks...</div>}
                {tasksError && <div className="text-red-500">Error: {tasksError.message}</div>}
                {tasks && tasks.length > 0 && (
                  <div className="space-y-3">
                    {tasks.slice(0, 10).map((task: Task) => (
                      <Card key={task.id}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-gray-600">{task.description}</p>
                              <div className="flex gap-2">
                                <Badge variant="outline">{task.status}</Badge>
                                <Badge variant="secondary">{task.priority}</Badge>
                                {task.estimatedHours && (
                                  <Badge variant="outline">{task.estimatedHours}h</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Users</h3>
                {usersLoading && <div>Loading users...</div>}
                {usersError && <div className="text-red-500">Error: {usersError.message}</div>}
                {users && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {users.map((user: User) => (
                      <Card key={user.id}>
                        <CardHeader>
                          <CardTitle className="text-sm">{user.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <Badge variant="outline">{user.role}</Badge>
                            <p className="text-xs text-gray-600">{user.email}</p>
                            {user.departmentId && (
                              <p className="text-xs">Dept: {user.departmentId}</p>
                            )}
                            <Badge variant={user.isActive ? "default" : "secondary"}>
                              {user.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Departments Tab */}
            <TabsContent value="departments">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Departments</h3>
                {departmentsLoading && <div>Loading departments...</div>}
                {departmentsError && <div className="text-red-500">Error: {departmentsError.message}</div>}
                {departments && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {departments.map((dept: Department) => (
                      <Card key={dept.id}>
                        <CardHeader>
                          <CardTitle className="text-sm">{dept.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-xs text-gray-600">{dept.description}</p>
                          <Badge variant={dept.isActive ? "default" : "secondary"}>
                            {dept.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Global Search</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search across all entities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch}>Search</Button>
                </div>
                {searchResults && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Search Results</h4>
                    <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                      {JSON.stringify(searchResults, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dashboard Metrics</h3>
                {dashboardMetrics && (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(dashboardMetrics).map(([key, value]) => (
                      <Card key={key}>
                        <CardContent className="pt-4">
                          <div className="text-2xl font-bold">{value as string}</div>
                          <p className="text-xs text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
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

export default ApiIntegrationDemo;
