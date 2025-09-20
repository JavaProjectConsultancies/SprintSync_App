import React, { useState, useEffect } from 'react';
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

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<TodoItemType[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newCategory, setNewCategory] = useState<'work' | 'personal' | 'shopping' | 'health'>('work');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'work' | 'personal' | 'shopping' | 'health'>('all');

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('sprintSync-todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined
      }));
      setTodos(parsedTodos);
    }
  }, []);

  // Save todos to localStorage whenever todos change
  useEffect(() => {
    localStorage.setItem('sprintSync-todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (!newTodo.trim()) return;

    const todo: TodoItemType = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
      priority: newPriority,
      category: newCategory,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo('');
  };

  const updateTodo = (id: string, updates: Partial<TodoItemType>) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed));
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