import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Plus, Filter, BarChart3, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import TodoItem from './TodoItem';
import { TodoItem as TodoItemType } from '../types';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { useTasksByAssignee } from '../hooks/api/useTasks';
import { taskApiService } from '../services/api';
import { Task } from '../types/api';
import LoadingSpinner from './LoadingSpinner';

const TodoList: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch tasks assigned to the logged-in user directly from API
  // Only fetch if user ID is available
  const shouldFetch = !!user?.id;
  const { 
    data: assignedTasksData, 
    loading: tasksLoading, 
    error: tasksError,
    refetch: refetchTasks
  } = useTasksByAssignee(user?.id || '', undefined);
  
  const [localTodos, setLocalTodos] = useState<TodoItemType[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'shopping' | 'health'>('work');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'work' | 'personal' | 'shopping' | 'health'>('all');

  // Validate and normalize tasks data
  const assignedTasks = useMemo(() => {
    // Skip if user is not loaded or user ID is invalid
    if (!shouldFetch || !assignedTasksData) return [];
    
    // Ensure data is an array
    const tasks = Array.isArray(assignedTasksData) ? assignedTasksData : [];
    
    // Validate each task has required fields
    return tasks.filter((task: any) => {
      const isValid = task && 
             typeof task.id === 'string' && 
             typeof task.title === 'string' &&
             task.id.trim() !== '' &&
             task.title.trim() !== '';
      
      if (!isValid) {
        console.warn('[TodoList] Invalid task structure:', task);
      }
      
      return isValid;
    });
  }, [assignedTasksData, shouldFetch]);

  // Transform Task to TodoItem format with validation
  const transformTaskToTodoItem = (task: Task): TodoItemType | null => {
    try {
      // Validate task structure
      if (!task || !task.id || !task.title) {
        console.warn('Invalid task structure:', task);
        return null;
      }

      const normalizedStatus = task.status?.toString().toLowerCase().trim() || '';
      const isCompleted = normalizedStatus === 'done' || normalizedStatus === 'completed' || normalizedStatus === 'done';
      
      // Map priority: CRITICAL -> high, HIGH -> high, MEDIUM -> medium, LOW -> low
      let priority: 'low' | 'medium' | 'high' = 'medium';
      const normalizedPriority = task.priority?.toString().toLowerCase() || '';
      if (normalizedPriority === 'critical' || normalizedPriority === 'high') {
        priority = 'high';
      } else if (normalizedPriority === 'low') {
        priority = 'low';
      }
      
      // Validate dates
      let createdAt: Date;
      let updatedAt: Date;
      let completedAt: Date | undefined;

      try {
        createdAt = task.createdAt ? new Date(task.createdAt) : new Date();
        if (isNaN(createdAt.getTime())) createdAt = new Date();
        
        updatedAt = task.updatedAt ? new Date(task.updatedAt) : new Date();
        if (isNaN(updatedAt.getTime())) updatedAt = new Date();
        
        if (isCompleted && task.updatedAt) {
          completedAt = new Date(task.updatedAt);
          if (isNaN(completedAt.getTime())) completedAt = undefined;
        }
      } catch (dateError) {
        console.warn('Error parsing dates for task:', task.id, dateError);
        createdAt = new Date();
        updatedAt = new Date();
        completedAt = undefined;
      }
      
      return {
        id: task.id,
        text: task.title.trim(),
        completed: isCompleted,
        priority: priority,
        category: 'work', // Default to work for assigned tasks
        createdAt,
        updatedAt,
        completedAt
      };
    } catch (error) {
      console.error('Error transforming task to TodoItem:', task, error);
      return null;
    }
  };

  // Transform assigned tasks to TodoItems with validation
  const taskTodos = useMemo(() => {
    const transformed = assignedTasks
      .map(transformTaskToTodoItem)
      .filter((item): item is TodoItemType => item !== null);
    
    // Debug logging
    if (user) {
      console.log('[TodoList] Fetched tasks:', {
        userId: user.id,
        totalTasksFromAPI: assignedTasks.length,
        validTransformedTasks: transformed.length,
        sampleTask: transformed[0] || null
      });
    }
    
    return transformed;
  }, [assignedTasks, user]);

  // Combine local todos and task todos
  const todos = useMemo(() => {
    // Use task todos from database, local todos are kept separate for personal tasks
    return [...taskTodos, ...localTodos];
  }, [taskTodos, localTodos]);

  // Load local todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('sprintSync-todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined
      }));
      setLocalTodos(parsedTodos);
    }
  }, []);

  // Save local todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('sprintSync-todos', JSON.stringify(localTodos));
  }, [localTodos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;

    const todo: TodoItemType = {
      id: `local-${Date.now().toString()}`,
      text: newTodo.trim(),
      completed: false,
      priority: newPriority,
      category: newCategory,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setLocalTodos(prev => [todo, ...prev]);
    setNewTodo('');
  };

  const updateTodo = async (id: string, updates: Partial<TodoItemType>) => {
    // Check if it's a local todo or a task todo
    const isLocalTodo = id.startsWith('local-');
    
    if (isLocalTodo) {
      // Update local todo
      setLocalTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo
      ));
    } else {
      // Update task in database
      try {
        const task = assignedTasks.find((t: Task) => t.id === id);
        if (!task) {
          console.warn('Task not found for update:', id);
          return;
        }

        const taskUpdates: Partial<Task> = {};
        
        // Map TodoItem updates to Task updates
        if (updates.completed !== undefined) {
          taskUpdates.status = (updates.completed ? 'DONE' : 'TO_DO') as any;
        }
        if (updates.text !== undefined && updates.text.trim() !== '') {
          taskUpdates.title = updates.text.trim();
        }
        if (updates.priority !== undefined) {
          // Map priority back: high -> CRITICAL, medium -> MEDIUM, low -> LOW
          const priorityMap: Record<string, string> = {
            'high': 'CRITICAL',
            'medium': 'MEDIUM',
            'low': 'LOW'
          };
          taskUpdates.priority = priorityMap[updates.priority] as any;
        }
        
        // Validate that we have updates to make
        if (Object.keys(taskUpdates).length === 0) {
          console.warn('No valid updates provided for task:', id);
          return;
        }

        console.log('[TodoList] Updating task:', { id, updates: taskUpdates });
        await taskApiService.updateTask(id, taskUpdates);
        
        // Refetch tasks to get updated data
        if (refetchTasks) {
          await refetchTasks();
        }
      } catch (error) {
        console.error('Failed to update task:', error);
        // Show user-friendly error message
        alert('Failed to update task. Please try again.');
      }
    }
  };

  const deleteTodo = async (id: string) => {
    // Check if it's a local todo or a task todo
    const isLocalTodo = id.startsWith('local-');
    
    if (isLocalTodo) {
      // Delete local todo
      setLocalTodos(prev => prev.filter(todo => todo.id !== id));
    } else {
      // Delete task from database
      try {
        // Validate task exists before deletion
        const task = assignedTasks.find((t: Task) => t.id === id);
        if (!task) {
          console.warn('Task not found for deletion:', id);
          return;
        }

        console.log('[TodoList] Deleting task:', id);
        await taskApiService.deleteTask(id);
        
        // Refetch tasks to get updated data
        if (refetchTasks) {
          await refetchTasks();
        }
      } catch (error) {
        console.error('Failed to delete task:', error);
        // Show user-friendly error message
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const clearCompleted = async () => {
    // Clear completed local todos
    setLocalTodos(prev => prev.filter(todo => !todo.completed));
    
    // Delete completed tasks from database
    const completedTaskIds = assignedTasks
      .filter((task: Task) => {
        const normalizedStatus = task.status?.toString().toLowerCase().trim() || '';
        return normalizedStatus === 'done' || normalizedStatus === 'completed';
      })
      .map((task: Task) => task.id)
      .filter((id): id is string => typeof id === 'string' && id.trim() !== '');
    
    if (completedTaskIds.length === 0) {
      return;
    }

    console.log('[TodoList] Clearing completed tasks:', completedTaskIds.length);
    
    // Delete completed tasks one by one
    let successCount = 0;
    let failCount = 0;
    
    for (const taskId of completedTaskIds) {
      try {
        await taskApiService.deleteTask(taskId);
        successCount++;
      } catch (error) {
        console.error(`Failed to delete completed task ${taskId}:`, error);
        failCount++;
      }
    }
    
    // Refetch tasks after deletion
    if (successCount > 0 && refetchTasks) {
      await refetchTasks();
    }
    
    if (failCount > 0) {
      alert(`Failed to delete ${failCount} completed task(s). Please try again.`);
    }
  };

  // Filter todos based on current filters
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active' && todo.completed) return false;
    if (filter === 'completed' && !todo.completed) return false;
    if (priorityFilter !== 'all' && todo.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && todo.category !== categoryFilter) return false;
    return true;
  });

  // Statistics
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

  // Show loading spinner while fetching tasks or if user is not loaded
  if (!user || tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner message={!user ? "Loading user information..." : "Loading your assigned tasks..."} />
      </div>
    );
  }

  // Show error message if tasks failed to load
  if (tasksError) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="font-medium text-red-600">Failed to load tasks</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {tasksError instanceof Error ? tasksError.message : 'An error occurred while loading your tasks'}
              </p>
              {!user?.id && (
                <p className="text-sm text-muted-foreground mt-2 text-yellow-600">
                  Please make sure you are logged in.
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => refetchTasks && refetchTasks()} variant="outline">
                Retry
              </Button>
              <Button onClick={() => window.location.reload()} variant="outline">
                Reload Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-green-50 to-cyan-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-semibold text-green-600">{totalTodos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-semibold text-blue-600">{activeTodos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold text-green-600">{completedTodos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completion</p>
                <p className="text-2xl font-semibold text-purple-600">{completionRate.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {totalTodos > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{completedTodos}/{totalTodos} tasks</span>
              </div>
              <Progress value={completionRate} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Todo Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5 text-green-600" />
            <span>Add New Task</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <Input
              placeholder="What needs to be done?"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              className="flex-1"
            />
            
            <Select value={newPriority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewPriority(value)}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            <Select value={newCategory} onValueChange={(value: 'work' | 'personal' | 'shopping' | 'health') => setNewCategory(value)}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={addTodo} className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Tabs */}
      <Card>
        <CardContent className="p-4">
          <Tabs value={filter} onValueChange={(value: 'all' | 'active' | 'completed') => setFilter(value)}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <TabsList className="grid grid-cols-3 w-full md:w-auto">
                <TabsTrigger value="all">All ({totalTodos})</TabsTrigger>
                <TabsTrigger value="active">Active ({activeTodos})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedTodos})</TabsTrigger>
              </TabsList>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Select value={priorityFilter} onValueChange={(value: 'all' | 'low' | 'medium' | 'high') => setPriorityFilter(value)}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High ({priorityStats.high})</SelectItem>
                    <SelectItem value="medium">Medium ({priorityStats.medium})</SelectItem>
                    <SelectItem value="low">Low ({priorityStats.low})</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={(value: 'all' | 'work' | 'personal' | 'shopping' | 'health') => setCategoryFilter(value)}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="work">Work ({categoryStats.work})</SelectItem>
                    <SelectItem value="personal">Personal ({categoryStats.personal})</SelectItem>
                    <SelectItem value="shopping">Shopping ({categoryStats.shopping})</SelectItem>
                    <SelectItem value="health">Health ({categoryStats.health})</SelectItem>
                  </SelectContent>
                </Select>

                {completedTodos > 0 && (
                  <Button variant="outline" onClick={clearCompleted} className="text-red-600 hover:bg-red-50">
                    Clear Completed
                  </Button>
                )}
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">
                    {filter === 'completed' ? 'No completed tasks yet' : 
                     filter === 'active' ? 'No active tasks' : 'No tasks found'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {filter === 'completed' ? 'Complete some tasks to see them here' : 
                     filter === 'active' ? 'All tasks are completed! 🎉' : 'Add your first task to get started'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              item={todo}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>

      {/* Summary Statistics */}
      {totalTodos > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Task Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Priority Breakdown</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Badge variant="destructive" className="text-xs">High</Badge>
                    <span className="text-sm">{priorityStats.high}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-700">Medium</Badge>
                    <span className="text-sm">{priorityStats.medium}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">Low</Badge>
                    <span className="text-sm">{priorityStats.low}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Category Breakdown</p>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Work</span>
                    <span className="text-sm">{categoryStats.work}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Personal</span>
                    <span className="text-sm">{categoryStats.personal}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Shopping</span>
                    <span className="text-sm">{categoryStats.shopping}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Health</span>
                    <span className="text-sm">{categoryStats.health}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TodoList;