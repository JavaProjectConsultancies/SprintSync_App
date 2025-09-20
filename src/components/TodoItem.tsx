import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Edit3, Save, X, Flag, Calendar, User } from 'lucide-react';
import { TodoItem as TodoItemType } from '../types';

interface TodoItemProps {
  item: TodoItemType;
  onUpdate: (id: string, updates: Partial<TodoItemType>) => void;
  onDelete: (id: string) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const [editPriority, setEditPriority] = useState(item.priority);
  const [editCategory, setEditCategory] = useState(item.category);

  const handleSave = () => {
    onUpdate(item.id, {
      text: editText,
      priority: editPriority,
      category: editCategory,
      updatedAt: new Date()
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(item.text);
    setEditPriority(item.priority);
    setEditCategory(item.category);
    setIsEditing(false);
  };

  const handleToggleComplete = () => {
    onUpdate(item.id, {
      completed: !item.completed,
      completedAt: !item.completed ? new Date() : undefined,
      updatedAt: new Date()
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work': return 'bg-blue-100 text-blue-700';
      case 'personal': return 'bg-purple-100 text-purple-700';
      case 'shopping': return 'bg-green-100 text-green-700';
      case 'health': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className={`p-4 transition-all duration-200 hover:shadow-md ${
      item.completed 
        ? 'bg-gradient-to-r from-green-50 to-cyan-50 border-green-200 opacity-75' 
        : 'bg-white border-gray-200 hover:border-green-300'
    }`}>
      <div className="flex items-start space-x-3">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <Checkbox
            checked={item.completed}
            onCheckedChange={handleToggleComplete}
            className="w-5 h-5 border-2 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500 transition-colors"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              {/* Edit Text */}
              <Input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Enter todo item..."
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                  if (e.key === 'Escape') handleCancel();
                }}
                autoFocus
              />

              {/* Edit Controls */}
              <div className="flex items-center space-x-2">
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="shopping">Shopping</SelectItem>
                    <SelectItem value="health">Health</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex space-x-1 ml-auto">
                  <Button size="sm" onClick={handleSave} className="h-8 px-3">
                    <Save className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="h-8 px-3">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Todo Text */}
              <p className={`${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {item.text}
              </p>

              {/* Badges and Metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getPriorityColor(item.priority)}>
                    <Flag className="w-3 h-3 mr-1" />
                    {item.priority}
                  </Badge>
                  <Badge variant="secondary" className={getCategoryColor(item.category)}>
                    {item.category}
                  </Badge>
                </div>

                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.createdAt)}</span>
                  </span>
                  {item.completedAt && (
                    <span className="text-green-600">
                      ✓ {formatDate(item.completedAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex-shrink-0 flex space-x-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 p-0 hover:bg-green-100"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              className="h-8 w-8 p-0 hover:bg-red-100 text-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TodoItem;