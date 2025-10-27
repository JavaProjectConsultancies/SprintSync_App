import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { useNavigation } from '../contexts/NavigationContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Bell, Check, AlertTriangle, Users, FolderKanban, Brain, Clock, ExternalLink } from 'lucide-react';
import { mockNotifications } from '../data/mockData';
import { toast } from 'sonner';

const NotificationDropdown: React.FC = () => {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  if (!user) return null;

  // Filter notifications for current user
  const userNotifications = notifications.filter(n => n.userId === user.id);
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => 
        n.userId === user.id ? { ...n, read: true } : n
      )
    );
  };

  const handleNotificationClick = (notification: any) => {
    // Mark notification as read
    markAsRead(notification.id);
    
    // Navigate based on notification type and action URL
    if (notification.actionUrl) {
      try {
        // Parse the action URL to determine navigation
        const url = notification.actionUrl;
        
        if (url.startsWith('/')) {
          // Internal navigation
          navigate(url);
          toast.success(`Navigating to ${notification.title}`);
        } else if (url.startsWith('http')) {
          // External navigation
          window.open(url, '_blank');
          toast.success(`Opening ${notification.title} in new tab`);
        } else {
          // Handle specific notification types
          handleNotificationTypeNavigation(notification);
        }
      } catch (error) {
        console.error('Navigation error:', error);
        toast.error('Failed to navigate to notification target');
      }
    } else {
      // Fallback navigation based on notification type
      handleNotificationTypeNavigation(notification);
    }
  };

  const handleNotificationTypeNavigation = (notification: any) => {
    switch (notification.type) {
      case 'task-assignment':
        navigateTo('scrum', 'tasks');
        toast.success('Navigating to Tasks');
        break;
      case 'deadline-warning':
        navigateTo('scrum', 'sprints');
        toast.success('Navigating to Sprints');
        break;
      case 'project-risk':
        navigateTo('team-allocation');
        toast.success('Navigating to Team Allocation');
        break;
      case 'team-mention':
        navigateTo('ai-insights');
        toast.success('Navigating to AI Insights');
        break;
      default:
        navigateTo('dashboard');
        toast.success('Navigating to Dashboard');
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task-assignment':
        return <FolderKanban className="w-4 h-4 text-blue-500" />;
      case 'deadline-warning':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'project-risk':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'team-mention':
        return <Brain className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-auto p-1"
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        {userNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs">We'll notify you when something happens</p>
          </div>
        ) : (
          <ScrollArea className="h-80">
            <div className="space-y-1">
              {userNotifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium leading-tight text-gray-900">
                          {notification.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                          )}
                          {notification.actionUrl && (
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}
        
        {userNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center py-2">
              <Button variant="ghost" size="sm" className="w-full text-xs">
                View all notifications
              </Button>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;