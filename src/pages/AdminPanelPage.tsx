import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Shield, 
  Users,
  Settings,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Lock,
  Unlock,
  UserPlus,
  UserX,
  Download,
  BarChart3
} from 'lucide-react';

const AdminPanelPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const systemStats = [
    {
      label: 'Total Users',
      value: '24',
      trend: '+3 this month',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Active Projects',
      value: '8',
      trend: '2 completed this quarter',
      icon: Database,
      color: 'text-green-600'
    },
    {
      label: 'System Health',
      value: '99.8%',
      trend: 'Uptime this month',
      icon: CheckCircle2,
      color: 'text-green-600'
    },
    {
      label: 'Security Alerts',
      value: '2',
      trend: 'Requires attention',
      icon: AlertTriangle,
      color: 'text-orange-600'
    }
  ];

  const users = [
    {
      id: 1,
      name: 'Arjun Patel',
      email: 'arjun.patel@sprintsync.com',
      role: 'developer',
      status: 'active',
      lastActive: '2 hours ago',
      avatar: '',
      projects: 3,
      createdAt: '2022-01-15'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@sprintsync.com',
      role: 'designer',
      status: 'active',
      lastActive: '1 hour ago',
      avatar: '',
      projects: 2,
      createdAt: '2022-02-10'
    },
    {
      id: 3,
      name: 'Sneha Reddy',
      email: 'sneha.reddy@sprintsync.com',
      role: 'developer',
      status: 'inactive',
      lastActive: '3 days ago',
      avatar: '',
      projects: 2,
      createdAt: '2022-03-05'
    },
    {
      id: 4,
      name: 'Rahul Kumar',
      email: 'rahul.kumar@sprintsync.com',
      role: 'manager',
      status: 'active',
      lastActive: '30 minutes ago',
      avatar: '',
      projects: 5,
      createdAt: '2021-11-20'
    },
    {
      id: 5,
      name: 'Vikram Singh',
      email: 'vikram.singh@sprintsync.com',
      role: 'designer',
      status: 'active',
      lastActive: '1 day ago',
      avatar: '',
      projects: 1,
      createdAt: '2023-01-10'
    }
  ];

  const systemLogs = [
    {
      id: 1,
      timestamp: '2024-02-23 14:30:22',
      type: 'security',
      severity: 'high',
      message: 'Failed login attempt detected from IP 192.168.1.100',
      user: 'System'
    },
    {
      id: 2,
      timestamp: '2024-02-23 14:25:15',
      type: 'user',
      severity: 'low',
      message: 'User Arjun Patel updated profile information',
      user: 'Arjun Patel'
    },
    {
      id: 3,
      timestamp: '2024-02-23 14:20:08',
      type: 'project',
      severity: 'medium',
      message: 'New project "AI Chat Support" created',
      user: 'Rahul Kumar'
    },
    {
      id: 4,
      timestamp: '2024-02-23 14:15:45',
      type: 'system',
      severity: 'low',
      message: 'Database backup completed successfully',
      user: 'System'
    },
    {
      id: 5,
      timestamp: '2024-02-23 14:10:30',
      type: 'user',
      severity: 'medium',
      message: 'User permissions updated for Priya Sharma',
      user: 'Admin'
    }
  ];

  const permissions = [
    {
      category: 'Project Management',
      permissions: [
        { name: 'view_projects', label: 'View Projects', description: 'Can view all projects' },
        { name: 'create_projects', label: 'Create Projects', description: 'Can create new projects' },
        { name: 'edit_projects', label: 'Edit Projects', description: 'Can modify existing projects' },
        { name: 'delete_projects', label: 'Delete Projects', description: 'Can delete projects' }
      ]
    },
    {
      category: 'User Management',
      permissions: [
        { name: 'view_users', label: 'View Users', description: 'Can view user profiles' },
        { name: 'manage_users', label: 'Manage Users', description: 'Can create, edit, and delete users' },
        { name: 'assign_roles', label: 'Assign Roles', description: 'Can change user roles and permissions' }
      ]
    },
    {
      category: 'Analytics & Reports',
      permissions: [
        { name: 'view_analytics', label: 'View Analytics', description: 'Can access analytics and reports' },
        { name: 'export_data', label: 'Export Data', description: 'Can export system data' }
      ]
    },
    {
      category: 'System Administration',
      permissions: [
        { name: 'manage_system', label: 'System Management', description: 'Full system administration access' },
        { name: 'view_logs', label: 'View System Logs', description: 'Can access system audit logs' }
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'developer': return 'bg-green-100 text-green-800 border-green-200';
      case 'designer': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold text-foreground">Admin Panel</h1>
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-muted-foreground">System administration and user management</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
            <Download className="w-4 h-4 mr-2" />
            Export Logs
          </Button>
          <Button className="bg-gradient-primary border-0 text-white hover:opacity-90">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {systemStats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                  </div>
                  <IconComponent className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, roles, and access permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div 
                    key={user.id} 
                    className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedUser === user.name ? 'border-green-500 bg-green-50' : ''
                    }`}
                    onClick={() => setSelectedUser(user.name)}
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100 text-green-800">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{user.name}</h4>
                          <Badge variant="outline" className={getRoleColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(user.status)}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{user.email}</span>
                          <span>•</span>
                          <span>{user.projects} projects</span>
                          <span>•</span>
                          <span>Last active: {user.lastActive}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      {user.status === 'active' ? (
                        <Button size="sm" variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                          <Lock className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                          <Unlock className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Role Permissions</CardTitle>
              <CardDescription>Configure permissions for different user roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {permissions.map((category) => (
                  <div key={category.category} className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2">{category.category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.permissions.map((permission) => (
                        <div key={permission.name} className="flex items-start justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <h4 className="font-medium">{permission.label}</h4>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Badge variant="outline" className="text-xs">Admin</Badge>
                            <Badge variant="outline" className="text-xs">Manager</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Activity Logs</CardTitle>
              <CardDescription>Monitor system activities and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={getSeverityColor(log.severity)}>
                            {log.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {log.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                        </div>
                        <p className="text-sm">{log.message}</p>
                        <p className="text-xs text-muted-foreground">By: {log.user}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
                <CardDescription>Core system settings and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Maintenance Mode</h4>
                    <p className="text-sm text-muted-foreground">Temporarily disable user access</p>
                  </div>
                  <Button variant="outline" className="text-orange-600 border-orange-200">
                    Enable
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto Backups</h4>
                    <p className="text-sm text-muted-foreground">Automated daily system backups</p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Enabled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-muted-foreground">System-wide email alerts</p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Enabled
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Security policies and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Button variant="outline" className="text-green-600 border-green-200">
                    Enable
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Session Timeout</h4>
                    <p className="text-sm text-muted-foreground">Auto logout after 8 hours</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Active
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">IP Whitelist</h4>
                    <p className="text-sm text-muted-foreground">Restrict access by IP address</p>
                  </div>
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    Disabled
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanelPage;