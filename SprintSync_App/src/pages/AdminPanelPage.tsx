import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
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
  Eye,
  Lock,
  Unlock,
  UserPlus,
  UserX,
  BarChart3,
  Loader2,
  Save,
  User as UserIcon,
  Briefcase,
  Image,
  RefreshCw
} from 'lucide-react';
import { useUsers, useUserStatistics, useUpdateUserStatus, useUpdateUser, useCreateUser } from '../hooks/api/useUsers';
import { useProjects } from '../hooks/api/useProjects';
import { useExperienceLevels } from '../hooks/api/useExperienceLevels';
import { useDepartments } from '../hooks/api/useDepartments';
import { useDomains } from '../hooks/api/useDomains';
import { usePendingRegistrations, useDeletePendingRegistration } from '../hooks/api/usePendingRegistrations';
import { PendingRegistration } from '../services/api/entities/pendingRegistrationApi';
import { User } from '../types/api';
import AddUserForm from '../components/AddUserForm';
import EditUserForm from '../components/EditUserForm';
import UserDetailsModal from '../components/UserDetailsModal';
import PendingRegistrationsTab from '../components/PendingRegistrationsTab';

const AdminPanelPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [lockedUsers, setLockedUsers] = useState<Set<string>>(new Set());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  
  // Add User Dialog State
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  
  // User Details Modal State
  const [userDetailsModalOpen, setUserDetailsModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  
  // Fetch users and projects from API - fetch all users with large page size
  const { data: usersData, loading: usersLoading, error: usersError, refetch: refetchUsers } = useUsers({ page: 0, size: 1000 });
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useProjects();
  const { data: userStats, loading: statsLoading } = useUserStatistics();
  const { experienceLevels, loading: experienceLevelsLoading, error: experienceLevelsError } = useExperienceLevels();
  const { data: departmentsData, loading: departmentsLoading, error: departmentsError } = useDepartments();
  const { data: domainsData, loading: domainsLoading, error: domainsError } = useDomains();
  const updateUserStatusMutation = useUpdateUserStatus();
  const updateUserMutation = useUpdateUser();
  
  const users = Array.isArray(usersData) ? usersData : [];
  const departments = Array.isArray(departmentsData) ? departmentsData : [];
  const domains = Array.isArray(domainsData) ? domainsData : [];
  const totalUsers = users.length;
  const activeProjects = projectsData?.length || 0;
  const activeUsers = users.filter(u => u.isActive).length;
  const inactiveUsers = users.filter(u => !u.isActive).length;

  // Resolve department name from id
  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return undefined;
    const dep = departments.find(d => d.id === deptId);
    return dep?.name;
  };

  // Debug: Log project data state
  console.log('Admin Panel - Projects State:', {
    loading: projectsLoading,
    error: projectsError,
    data: projectsData,
    count: activeProjects
  });

  // Calculate system stats from API data
  const systemStats = [
    {
      label: 'Total Users',
      value: usersLoading ? '...' : totalUsers.toString(),
      trend: usersLoading ? 'Loading...' : `${activeUsers} active, ${inactiveUsers} inactive`,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Active Projects',
      value: projectsLoading ? '...' : (projectsError ? 'Error' : activeProjects.toString()),
      trend: projectsLoading ? 'Loading...' : (projectsError ? 'Failed to load' : `${projectsData?.filter(p => p.status === 'ACTIVE').length || 0} in progress`),
      icon: Database,
      color: projectsError ? 'text-red-600' : 'text-green-600'
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
      value: '0',
      trend: 'All clear',
      icon: AlertTriangle,
      color: 'text-green-600'
    }
  ];

  // Handle user lock/unlock (frontend state only)
  const handleToggleLock = (userId: string) => {
    setLockedUsers(prev => {
      const newSet = new Set(prev); 
      if (newSet.has(userId)) {
        newSet.delete(userId);
        console.log('🔓 User unlocked:', userId);
      } else {
        newSet.add(userId);
        console.log('🔒 User locked:', userId);
      }
      return newSet;
    });
  };

  // Check if user is locked
  const isUserLocked = (userId: string): boolean => {
    return lockedUsers.has(userId);
  };

  // Handle opening edit dialog
  const handleEditUser = (user: User) => {
    if (isUserLocked(user.id)) {
      console.warn('Cannot edit locked user:', user.id);
      return;
    }
    console.log('🔧 Opening edit dialog for user:', user);
    setEditingUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      domainId: user.domainId,
      avatarUrl: user.avatarUrl,
      hourlyRate: user.hourlyRate,
      availabilityPercentage: user.availabilityPercentage,
      experience: user.experience,
      isActive: user.isActive,
    });
    setEditDialogOpen(true);
  };

  // Handle form input changes
  const handleEditFormChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save user changes
  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      // Merge edited fields with original user data to send complete object
      // Backend requires passwordHash, so we must preserve it
      const completeUserData: any = {
        id: editingUser.id,
        email: editFormData.email || editingUser.email,
        passwordHash: editingUser.passwordHash, // Required field - must preserve
        name: editFormData.name || editingUser.name,
        role: editFormData.role || editingUser.role,
        departmentId: editFormData.departmentId !== undefined ? editFormData.departmentId : editingUser.departmentId,
        domainId: editFormData.domainId !== undefined ? editFormData.domainId : editingUser.domainId,
        avatarUrl: editFormData.avatarUrl !== undefined ? editFormData.avatarUrl : editingUser.avatarUrl,
        hourlyRate: editFormData.hourlyRate !== undefined ? editFormData.hourlyRate : editingUser.hourlyRate,
        availabilityPercentage: editFormData.availabilityPercentage !== undefined ? editFormData.availabilityPercentage : editingUser.availabilityPercentage,
        experience: editFormData.experience !== undefined ? editFormData.experience : editingUser.experience,
        skills: editingUser.skills, // Preserve skills
        isActive: editingUser.isActive, // Preserve active status
        lastLogin: editingUser.lastLogin, // Preserve last login
      };
      
      console.log('💾 Saving user changes:', { 
        id: editingUser.id, 
        original: editingUser,
        changes: editFormData,
        sending: completeUserData
      });
      
      await updateUserMutation.mutate({
        id: editingUser.id,
        user: completeUserData
      });
      
      console.log('✅ User updated successfully');
      setEditDialogOpen(false);
      setEditingUser(null);
      setEditFormData({});
      
      // Refresh user list
      await refetchUsers();
    } catch (error) {
      console.error('❌ Failed to update user:', error);
      alert('Failed to update user: ' + (error as any)?.message || 'Unknown error');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setEditingUser(null);
    setEditFormData({});
  };

  // Handle viewing user details
  const handleViewUser = (user: User) => {
    console.log('👁️ Opening user details for:', user);
    setViewingUser(user);
    setUserDetailsModalOpen(true);
  };

  // Handle closing user details modal
  const handleCloseUserDetails = () => {
    setUserDetailsModalOpen(false);
    setViewingUser(null);
  };

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


  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getRoleColor = (role: string) => {
    const roleLower = role?.toLowerCase() || '';
    switch (roleLower) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': 
      case 'project_manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'developer': return 'bg-green-100 text-green-800 border-green-200';
      case 'designer': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'qa': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'tester':
      case 'qa': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {systemStats.map((stat) => {
          const IconComponent = stat.icon;
          const isProjectStat = stat.label === 'Active Projects';
          const hasError = isProjectStat && projectsError;
          
          return (
            <Card key={stat.label} className={hasError ? 'border-red-200' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                    {hasError && (
                      <p className="text-xs text-red-600 mt-2 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Check console for details
                      </p>
                    )}
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts, roles, and access permissions</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => refetchUsers()}
                    disabled={usersLoading}
                    className="border-2 border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${usersLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button 
                    className="bg-gradient-primary border-0 text-white hover:opacity-90"
                    onClick={() => setAddUserDialogOpen(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                  <span className="ml-3 text-muted-foreground">Loading users...</span>
                </div>
              ) : usersError ? (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertTriangle className="w-6 h-6 mr-2" />
                  <span>Failed to load users: {usersError.message}</span>
                </div>
              ) : users.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Users className="w-6 h-6 mr-2" />
                  <span>No users found</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div 
                      key={user.id} 
                      className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedUser === user.id ? 'border-green-500 bg-green-50' : ''
                      }`}
                      onClick={() => setSelectedUser(user.id)}
                    >
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatarUrl || ''} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100 text-green-800">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{user.name}</h4>
                            <Badge variant="outline" className={getRoleColor(user.role)}>
                              {user.role.replace('_', ' ').charAt(0).toUpperCase() + user.role.replace('_', ' ').slice(1)}
                            </Badge>
                            <Badge variant="outline" className={getStatusColor(user.isActive)}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {isUserLocked(user.id) && (
                              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                                <Lock className="w-3 h-3 mr-1" />
                                Locked
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{user.email}</span>
                            {getDepartmentName(user.departmentId) && (
                              <>
                                <span>•</span>
                                <span>Dept: {getDepartmentName(user.departmentId)}</span>
                              </>
                            )}
                            {/* Last login removed from list view as requested */}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          title="View user details"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewUser(user);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={isUserLocked(user.id)}
                          className={isUserLocked(user.id) ? 'opacity-50 cursor-not-allowed' : ''}
                          title={isUserLocked(user.id) ? 'User is locked - unlock to edit' : 'Edit user'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                          }}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        {isUserLocked(user.id) ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            title="Unlock user to allow editing"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLock(user.id);
                            }}
                          >
                            <Unlock className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            title="Lock user to prevent editing"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleLock(user.id);
                            }}
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4 mt-6">
          <PendingRegistrationsTab onRefresh={refetchUsers} />
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

          {/* Edit User Dialog */}
          <EditUserForm
            isOpen={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            onSuccess={() => {
              console.log('✅ User updated successfully, refreshing user list...');
              refetchUsers();
            }}
            user={editingUser}
          />

      {/* Add User Dialog */}
      <AddUserForm
        isOpen={addUserDialogOpen}
        onClose={() => setAddUserDialogOpen(false)}
        onSuccess={() => {
          console.log('✅ User created successfully, refreshing user list...');
          refetchUsers();
        }}
      />

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={userDetailsModalOpen}
        onClose={handleCloseUserDetails}
        user={viewingUser}
      />
    </div>
  );
};

export default AdminPanelPage;