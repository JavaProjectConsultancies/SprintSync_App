import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Plus, BarChart3, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import TodoItem from './TodoItem';
import { TodoItem as TodoItemType } from '../types';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { useTasksByAssignee } from '../hooks/api/useTasks';
import { useIssuesByAssignee } from '../hooks/api/useIssues';
import { useAllStories } from '../hooks/api/useStories';
import { taskApiService, issueApiService } from '../services/api';
import { Task, Issue } from '../types/api';
import LoadingSpinner from './LoadingSpinner';

const TodoList: React.FC = () => {
  const { user } = useAuth();

  // QA developers should only see tasks (not issues) in My Tasks page
  const isQADeveloper = user?.role?.toLowerCase() === 'qa_developer';

  // Fetch items assigned to the logged-in user
  const shouldFetch = !!user?.id;
  const {
    data: assignedTasksData,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks
  } = useTasksByAssignee(user?.id || '', undefined);

  const {
    data: assignedIssuesData,
    loading: issuesLoading,
    error: issuesError,
    refetch: refetchIssues
  } = useIssuesByAssignee(user?.id || '', undefined);

  const { data: allStoriesData } = useAllStories();

  const storiesMap = useMemo(() => {
    if (!allStoriesData) return new Map<string, { projectId: string, sprintId?: string }>();
    const stories = Array.isArray(allStoriesData) ? allStoriesData : [];
    const map = new Map<string, { projectId: string, sprintId?: string }>();
    stories.forEach((s: any) => {
      if (s.id) {
        map.set(s.id, { projectId: s.projectId, sprintId: s.sprintId });
      }
    });
    return map;
  }, [allStoriesData]);

  const [localTodos, setLocalTodos] = useState<TodoItemType[]>([]);
  const [hiddenTaskIds, setHiddenTaskIds] = useState<Set<string>>(new Set());
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'shopping' | 'health'>('work');
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'work' | 'personal' | 'shopping' | 'health'>('all');

  // Validate and normalize tasks data
  const assignedTasks = useMemo(() => {
    if (!shouldFetch || !assignedTasksData) return [];
    const tasks = Array.isArray(assignedTasksData) ? assignedTasksData : [];
    return tasks.filter((task: any) => task && task.id && task.title);
  }, [assignedTasksData, shouldFetch]);

  // Validate and normalize issues data
  // QA developers should NOT see issues in My Tasks page
  const assignedIssues = useMemo(() => {
    if (isQADeveloper) return []; // Exclude all issues for QA developers
    if (!shouldFetch || !assignedIssuesData) return [];
    const issues = Array.isArray(assignedIssuesData) ? assignedIssuesData : [];
    return issues.filter((issue: any) => issue && issue.id && issue.title);
  }, [assignedIssuesData, shouldFetch, isQADeveloper]);

  // Transform Task to TodoItem format
  const transformTaskToTodoItem = (task: Task): TodoItemType | null => {
    try {
      if (!task || !task.id || !task.title) return null;

      const normalizedStatus = task.status?.toString().toLowerCase().trim() || '';
      const isCompleted = normalizedStatus === 'done' || normalizedStatus === 'completed';

      let priority: 'low' | 'medium' | 'high' = 'medium';
      const normalizedPriority = task.priority?.toString().toLowerCase() || '';
      if (normalizedPriority === 'critical' || normalizedPriority === 'high') {
        priority = 'high';
      } else if (normalizedPriority === 'low') {
        priority = 'low';
      }

      return {
        id: task.id,
        text: task.title.trim(),
        description: task.description || '',
        completed: isCompleted,
        priority: priority,
        category: 'work',
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
        updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date(),
        completedAt: isCompleted && task.updatedAt ? new Date(task.updatedAt) : undefined,
        storyId: task.storyId,
        projectId: task.storyId ? storiesMap.get(task.storyId)?.projectId : undefined,
        sprintId: task.storyId ? storiesMap.get(task.storyId)?.sprintId : undefined,
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
        assigneeId: task.assigneeId,
        isTaskFromDatabase: true,
        entityType: 'task'
      };
    } catch (error) {
      console.error('Error transforming task:', error);
      return null;
    }
  };

  // Transform Issue to TodoItem format
  const transformIssueToTodoItem = (issue: Issue): TodoItemType | null => {
    try {
      if (!issue || !issue.id || !issue.title) return null;

      const normalizedStatus = issue.status?.toString().toLowerCase().trim() || '';
      const isCompleted = normalizedStatus === 'done' || normalizedStatus === 'closed' || normalizedStatus === 'completed';

      let priority: 'low' | 'medium' | 'high' = 'medium';
      const normalizedPriority = issue.priority?.toString().toLowerCase() || '';
      if (normalizedPriority === 'critical' || normalizedPriority === 'high') {
        priority = 'high';
      } else if (normalizedPriority === 'low') {
        priority = 'low';
      }

      return {
        id: issue.id,
        text: issue.title.trim(),
        description: issue.description || '',
        completed: isCompleted,
        priority: priority,
        category: 'work',
        dueDate: issue.dueDate ? new Date(issue.dueDate) : undefined,
        createdAt: issue.createdAt ? new Date(issue.createdAt) : new Date(),
        updatedAt: issue.updatedAt ? new Date(issue.updatedAt) : new Date(),
        completedAt: isCompleted && issue.updatedAt ? new Date(issue.updatedAt) : undefined,
        storyId: issue.storyId,
        projectId: issue.storyId ? storiesMap.get(issue.storyId)?.projectId : undefined,
        sprintId: issue.storyId ? storiesMap.get(issue.storyId)?.sprintId : undefined,
        assigneeId: issue.assigneeId,
        isTaskFromDatabase: true,
        entityType: 'issue'
      };
    } catch (error) {
      console.error('Error transforming issue:', error);
      return null;
    }
  };

  const taskTodos = useMemo(() => {
    return assignedTasks
      .map(transformTaskToTodoItem)
      .filter((item): item is TodoItemType => item !== null);
  }, [assignedTasks]);

  const issueTodos = useMemo(() => {
    return assignedIssues
      .map(transformIssueToTodoItem)
      .filter((item): item is TodoItemType => item !== null);
  }, [assignedIssues]);

  const combinedLoading = tasksLoading || issuesLoading;
  const combinedError = tasksError || issuesError;

  const todos = useMemo(() => {
    return [...taskTodos, ...issueTodos, ...localTodos];
  }, [taskTodos, issueTodos, localTodos]);

  useEffect(() => {
    if (!user?.id) return;
    const storageKey = `sprintSync-todos-${user.id}`;
    const savedTodos = localStorage.getItem(storageKey);
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined,
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
        }));
        setLocalTodos(parsedTodos);
      } catch (error) {
        console.error('Error loading user todos:', error);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const storageKey = `sprintSync-todos-${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(localTodos));
  }, [localTodos, user?.id]);

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: TodoItemType = {
      id: `local-${Date.now().toString()}`,
      text: newTodo.trim(),
      completed: false,
      priority: newPriority,
      category: newCategory,
      dueDate: newDueDate ? new Date(newDueDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setLocalTodos(prev => [todo, ...prev]);
    setNewTodo('');
    setNewDueDate('');
  };

  const updateTodo = async (id: string, updates: Partial<TodoItemType>) => {
    if (id.startsWith('local-')) {
      setLocalTodos(prev => prev.map(todo =>
        todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo
      ));
    } else {
      try {
        const item = todos.find(t => t.id === id);
        if (!item) return;

        const isIssue = item.entityType === 'issue';
        const updatesData: any = {};

        if (updates.completed !== undefined) {
          if (isIssue) updatesData.status = updates.completed ? 'DONE' : 'TODO';
          else updatesData.status = updates.completed ? 'DONE' : 'TO_DO';
        }
        if (updates.text !== undefined) updatesData.title = updates.text.trim();
        if (updates.priority !== undefined) {
          const priorityMap: any = { 'high': 'CRITICAL', 'medium': 'MEDIUM', 'low': 'LOW' };
          updatesData.priority = priorityMap[updates.priority];
        }

        if (isIssue) {
          await issueApiService.updateIssue(id, updatesData);
          refetchIssues && refetchIssues();
        } else {
          await taskApiService.updateTask(id, updatesData);
          refetchTasks && refetchTasks();
        }
      } catch (error) {
        console.error('Failed to update item:', error);
        alert('Failed to update item. Please try again.');
      }
    }
  };

  const deleteTodo = (id: string) => {
    if (id.startsWith('local-')) {
      setLocalTodos(prev => prev.filter(todo => todo.id !== id));
    } else {
      setHiddenTaskIds(prev => {
        const newSet = new Set(prev);
        newSet.add(id);
        return newSet;
      });
    }
  };

  const clearCompleted = async () => {
    setLocalTodos(prev => prev.filter(todo => !todo.completed));
    const completedItems = todos.filter(t => t.completed && !t.id.startsWith('local-'));
    if (completedItems.length === 0) return;

    for (const item of completedItems) {
      try {
        if (item.entityType === 'issue') await issueApiService.deleteIssue(item.id);
        else await taskApiService.deleteTask(item.id);
      } catch (error) {
        console.error(`Failed to delete item ${item.id}:`, error);
      }
    }
    refetchTasks && refetchTasks();
    refetchIssues && refetchIssues();
  };

  const filteredTodos = todos.filter(todo => {
    if (hiddenTaskIds.has(todo.id)) return false;
    if (filter === 'active' && todo.completed) return false;
    if (filter === 'completed' && !todo.completed) return false;
    if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && todo.category !== categoryFilter) return false;
    return true;
  });

  const totalTodos = todos.length;
  const completedTodos = todos.filter(t => t.completed).length;
  const activeTodos = totalTodos - completedTodos;
  const completionRate = totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

  const priorityStats = {
    high: todos.filter(t => t.priority === 'high' && !t.completed).length,
    medium: todos.filter(t => t.priority === 'medium' && !t.completed).length,
    low: todos.filter(t => t.priority === 'low' && !t.completed).length
  };

  const categoryStats = {
    work: todos.filter(t => t.category === 'work' && !t.completed).length,
    personal: todos.filter(t => t.category === 'personal' && !t.completed).length,
    shopping: todos.filter(t => t.category === 'shopping' && !t.completed).length,
    health: todos.filter(t => t.category === 'health' && !t.completed).length
  };

  if (!user || combinedLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message={!user ? "Loading user information..." : "Loading your assigned items..."} />
      </div>
    );
  }

  if (combinedError) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-red-600">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="font-medium">Failed to load items</h3>
          <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">Reload Page</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Items', value: totalTodos, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Active', value: activeTodos, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed', value: completedTodos, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Completion', value: `${completionRate.toFixed(0)}%`, color: 'text-purple-600', bg: 'bg-purple-50' }
        ].map((stat, i) => (
          <Card key={i} className={`${stat.bg} border-gray-200`}>
            <CardContent className="p-4 flex items-center space-x-3">
              <div className={`w-10 h-10 ${stat.color.replace('text', 'bg')} rounded-lg flex items-center justify-center`}>
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{completedTodos}/{totalTodos} items</span>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Add New Task</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2">
            <Input
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              className="flex-1"
            />
            <Select value={newPriority} onValueChange={(v: any) => setNewPriority(v)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <Select value={newCategory} onValueChange={(v: any) => setNewCategory(v)}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addTodo} className="bg-green-600 hover:bg-green-700">Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
          <TabsList>
            <TabsTrigger value="active">Active ({activeTodos})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTodos})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Select value={priorityFilter} onValueChange={(v: any) => setPriorityFilter(v)}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={(v: any) => setCategoryFilter(v)}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="health">Health</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border rounded-lg">No items found</div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem key={todo.id} item={todo} onUpdate={updateTodo} onDelete={deleteTodo} onTaskUpdated={() => {
              refetchTasks && refetchTasks();
              refetchIssues && refetchIssues();
            }} />
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList;