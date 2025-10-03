import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../contexts/NavigationContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from './ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronUp,
  Target,
  GitBranch,
  Calendar,
  UserCog,
  Clock,
  Brain,
  Sparkles,
  Shield,
  Palette,
  Code,
  CheckSquare
} from 'lucide-react';
import sprintSyncLogo from 'figma:asset/aadf192e83d08c7cc03896c06b452017e84d04aa.png';

interface MenuItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  children?: MenuItem[];
  badge?: string;
  id?: string;
}

const AppSidebar: React.FC = () => {
  const { user, logout, hasPermission } = useAuth();
  const { navigationState, navigateTo } = useNavigation();
  
  const allMenuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      id: 'dashboard'
    },
    {
      title: 'PROJECT MANAGEMENT',
      icon: FolderKanban,
      permission: 'view_projects',
      children: [
        { title: 'Projects', icon: FolderKanban, permission: 'view_projects', id: 'projects' },
        { title: 'Backlog', icon: Target, permission: 'view_projects', id: 'backlog' },
        { title: 'Scrum Management', icon: GitBranch, permission: 'view_projects', id: 'scrum' },
        { title: 'Time Tracking', icon: Clock, permission: 'view_projects', id: 'time-tracking' },
      ]
    },
    {
      title: 'AI & ANALYTICS',
      icon: Brain,
      permission: 'view_analytics',
      children: [
        { title: 'AI Insights', icon: Brain, permission: 'view_analytics', badge: 'NEW', id: 'ai-insights' },
        { title: 'Team Allocation', icon: Users, permission: 'view_team', id: 'team-allocation' },
        { title: 'Reports', icon: BarChart3, permission: 'view_analytics', id: 'reports' },
      ]
    },
    {
      title: 'ACCOUNT',
      icon: User,
      children: [
        { title: 'Profile', icon: User, id: 'profile' },
        { title: 'Todo List', icon: CheckSquare, id: 'todo-list' },
      ]
    },
    {
      title: 'ADMINISTRATION',
      icon: UserCog,
      permission: 'manage_system',
      children: [
        { title: 'Admin Panel', icon: Shield, permission: 'manage_system', id: 'admin-panel' },
      ]
    },
  ];

  // Role-based menu filtering
  const getRoleBasedMenuItems = (userRole: string): MenuItem[] => {
    if (userRole === 'admin') {
      // Admin only has Dashboard, Projects, Team Allocation, and Reports
      return [
        {
          title: 'Dashboard',
          icon: LayoutDashboard,
          id: 'dashboard'
        },
        {
          title: 'PROJECT MANAGEMENT',
          icon: FolderKanban,
          children: [
            { title: 'Projects', icon: FolderKanban, id: 'projects' },
          ]
        },
        {
          title: 'AI & ANALYTICS',
          icon: Brain,
          children: [
            { title: 'Team Allocation', icon: Users, id: 'team-allocation' },
            { title: 'Reports', icon: BarChart3, id: 'reports' },
          ]
        },
        {
          title: 'ACCOUNT',
          icon: User,
          children: [
            { title: 'Profile', icon: User, id: 'profile' },
          ]
        },
        {
          title: 'ADMINISTRATION',
          icon: UserCog,
          children: [
            { title: 'Admin Panel', icon: Shield, id: 'admin-panel' },
          ]
        },
      ];
    } else if (userRole === 'manager') {
      // Manager has access to all sidebar widgets
      return allMenuItems;
    } else {
      // Developer and Designer have limited access (excluding admin panel)
      return allMenuItems.filter(item => item.title !== 'ADMINISTRATION');
    }
  };

  const menuItems = user ? getRoleBasedMenuItems(user.role) : [];

  // Safely filter menu items with proper checks
  const filteredMenuItems = menuItems.filter(item => {
    if (!item.permission) return true; // Items without permission requirements are always shown
    if (!user) return false; // No user, no access
    
    try {
      return hasPermission(item.permission);
    } catch (error) {
      console.error('Error checking permission for menu item:', item.title, error);
      return false;
    }
  });

  const handleNavigation = (id?: string, title?: string) => {
    if (id) {
      navigateTo(id, title);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'developer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'designer':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'manager':
        return Settings;
      case 'developer':
        return Code;
      case 'designer':
        return Palette;
      default:
        return User;
    }
  };

  // Don't render sidebar if user is not available
  if (!user) {
    return null;
  }

  const RoleIcon = getRoleIcon(user.role);

  return (
    <Sidebar>
      <SidebarHeader>
        <div 
          className="flex items-center space-x-3 px-2 py-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors"
          onClick={() => {
            try {
              if (navigateTo) {
                navigateTo('dashboard');
              } else {
                window.location.href = '/';
              }
            } catch (error) {
              console.error('Navigation error:', error);
              window.location.href = '/';
            }
          }}
          title="Go to Dashboard"
        >
          <div className="relative">
            <img 
              src={sprintSyncLogo} 
              alt="SprintSync Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-green-600">SprintSync</h2>
            <p className="text-xs text-muted-foreground">AI Project Management</p>
          </div>
        </div>

        {/* Current Project Context */}
        <div className="mx-2 mb-2">
          <div className="bg-gradient-light rounded-lg p-3 border">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">E-Commerce Platform</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">Sprint: Sprint 1 (5 days left)</p>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-1.5" />
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {filteredMenuItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.children ? (
                  section.children
                    .filter(child => {
                      // Role-based filtering is already handled in getRoleBasedMenuItems
                      // So we just need to check permissions if they exist
                      if (!child.permission) return true;
                      if (!user) return false;
                      
                      try {
                        return hasPermission(child.permission);
                      } catch (error) {
                        console.error('Error checking permission for child menu item:', child.title, error);
                        return false;
                      }
                    })
                    .map((child) => (
                      <SidebarMenuItem key={child.title}>
                        <SidebarMenuButton 
                          className={`group cursor-pointer ${navigationState.currentSection === child.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                          onClick={() => handleNavigation(child.id, child.title)}
                        >
                          <child.icon className="w-4 h-4" />
                          <span>{child.title}</span>
                          {child.badge && (
                            <Badge 
                              variant="secondary" 
                              className="ml-auto text-xs bg-green-100 text-green-800 border-green-200"
                            >
                              {child.badge}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                ) : (
                  <SidebarMenuItem>
                    <SidebarMenuButton 
                      className={`cursor-pointer ${navigationState.currentSection === section.id ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}`}
                      onClick={() => handleNavigation(section.id, section.title)}
                    >
                      <section.icon className="w-4 h-4" />
                      <span>{section.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-10 w-10 rounded-xl border-2 border-gradient-to-br from-green-200 to-cyan-200">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-green-100 to-cyan-100 text-green-800">
                      {user ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <div className="p-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 rounded-xl">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-green-100 to-cyan-100 text-green-800">
                        {user ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getRoleColor(user?.role || '')}`}
                        >
                          <RoleIcon className="w-3 h-3 mr-1" />
                          {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleNavigation('profile', 'Profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;