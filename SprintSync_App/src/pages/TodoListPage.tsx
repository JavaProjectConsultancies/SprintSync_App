import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { CheckSquare, ListTodo, Clock, TrendingUp, Lightbulb } from 'lucide-react';
import TodoList from '../components/TodoList';

const TodoListPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-green-600">Personal Todo List</h1>
              <p className="text-muted-foreground">Manage your personal tasks and stay organized</p>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <Badge variant="outline" className="bg-gradient-to-r from-green-50 to-cyan-50 border-green-200">
            <ListTodo className="w-3 h-3 mr-1" />
            Personal Productivity
          </Badge>
        </div>
      </div>

      {/* Quick Tips Card */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-cyan-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-purple-700">
            <Lightbulb className="w-5 h-5" />
            <span>Productivity Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-purple-700">Prioritize Tasks</p>
                <p className="text-purple-600">Use High/Medium/Low priorities to focus on what matters most</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-green-700">Categorize Work</p>
                <p className="text-green-600">Organize tasks by Work, Personal, Shopping, and Health categories</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <p className="font-medium text-cyan-700">Track Progress</p>
                <p className="text-cyan-600">Monitor your completion rate and celebrate achievements</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Todo List Component */}
      <TodoList />

      {/* Integration Info */}
      <Card className="bg-gradient-to-r from-green-50 to-cyan-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-green-600">Personal Todo Management</h3>
              <p className="text-sm text-muted-foreground mt-1">
                This personal todo list is separate from your project tasks and helps you manage individual productivity. 
                All data is stored locally in your browser for privacy.
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Badge variant="secondary" className="bg-white/50">
                <Clock className="w-3 h-3 mr-1" />
                Real-time Updates
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TodoListPage;