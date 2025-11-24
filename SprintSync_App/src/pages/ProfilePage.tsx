import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { useUser, useUpdateUser } from '../hooks/api/useUsers';
import { useDepartments } from '../hooks/api/useUsers';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { 
  User, 
  Settings,
  Bell,
  Shield,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Target,
  Award,
  Briefcase,
  Edit3,
  Save,
  X
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Fetch user data from API (only if user ID exists)
  const shouldFetchUser = !!authUser?.id;
  const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useUser(authUser?.id || '');
  
  // Fetch departments for department name lookup
  const { data: departmentsData } = useDepartments();
  const departments = Array.isArray(departmentsData) ? departmentsData : [];
  
  // Update user mutation
  const updateUserMutation = useUpdateUser();
  
  // Initialize form data from API
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    title: '',
    department: '',
    departmentId: '',
    joiningDate: '',
    manager: '',
    avatarUrl: '',
    experience: '',
    skills: '',
    hourlyRate: '',
    availabilityPercentage: ''
  });
  
  // Get department name from ID
  const departmentName = useMemo(() => {
    if (formData.departmentId && departments.length > 0) {
      const dept = departments.find(d => d.id === formData.departmentId);
      return dept?.name || '';
    }
    return formData.department || '';
  }, [formData.departmentId, formData.department, departments]);
  
  // Populate form data when user data is loaded
  useEffect(() => {
    if (userData) {
      const user = userData as any;
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || user.skills || '',
        title: user.role || '',
        department: user.departmentId ? (departments.find(d => d.id === user.departmentId)?.name || '') : '',
        departmentId: user.departmentId || '',
        joiningDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
        manager: user.manager || '',
        avatarUrl: user.avatarUrl || '',
        experience: user.experience || '',
        skills: user.skills || '',
        hourlyRate: user.hourlyRate?.toString() || '',
        availabilityPercentage: user.availabilityPercentage?.toString() || ''
      });
    }
  }, [userData, departments]);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sprint: true,
    mentions: true,
    updates: false
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'team',
    activityStatus: true,
    workingHours: true
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'developer':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'designer':
      case 'qa':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSave = async () => {
    if (!authUser?.id) {
      toast.error('User ID not found');
      return;
    }
    
    setIsSaving(true);
    try {
      // Prepare update payload
      const updatePayload: any = {
        name: formData.name,
        email: formData.email,
        departmentId: formData.departmentId || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        experience: formData.experience || undefined,
        skills: formData.skills || undefined,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        availabilityPercentage: formData.availabilityPercentage ? parseInt(formData.availabilityPercentage) : undefined,
      };
      
      // Remove undefined values
      Object.keys(updatePayload).forEach(key => {
        if (updatePayload[key] === undefined || updatePayload[key] === '') {
          delete updatePayload[key];
        }
      });
      
      const response = await updateUserMutation.mutate({
        id: authUser.id,
        user: updatePayload
      });
      
      // Refetch user data to get updated information
      if (refetchUser) {
        await refetchUser();
      }
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const achievements = [
    {
      title: 'Sprint Champion',
      description: 'Completed 5 consecutive sprints without missing deadlines',
      date: '2024-02-15',
      icon: Target
    },
    {
      title: 'Code Quality Expert',
      description: 'Maintained 95%+ code quality score for 3 months',
      date: '2024-01-20',
      icon: Award
    },
    {
      title: 'Team Player',
      description: 'Helped 3 team members complete their tasks',
      date: '2024-01-10',
      icon: User
    }
  ];

  const recentActivity = [
    {
      action: 'Completed story',
      item: 'User Authentication Module',
      project: 'E-Commerce Platform',
      time: '2 hours ago'
    },
    {
      action: 'Reviewed code',
      item: 'Payment Gateway Integration',
      project: 'E-Commerce Platform',
      time: '4 hours ago'
    },
    {
      action: 'Updated sprint board',
      item: 'Sprint 15 Planning',
      project: 'E-Commerce Platform',
      time: '1 day ago'
    },
    {
      action: 'Attended meeting',
      item: 'Daily Standup',
      project: 'Team Sync',
      time: '1 day ago'
    }
  ];

  // Loading state
  if (userLoading || !authUser) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (userError) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-destructive">Error loading profile data</p>
              <Button onClick={() => refetchUser()} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Use authUser as fallback if userData is not available
  const displayUser = userData || authUser;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-gradient-primary border-0 text-white hover:opacity-90"
          >
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button 
              onClick={handleSave} 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile Overview Card */}
      <Card className="bg-gradient-light border-green-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-6">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={formData.avatarUrl || displayUser?.avatar || displayUser?.avatarUrl} alt={displayUser?.name || ''} />
                <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100 text-green-800 text-xl">
                  {getInitials(displayUser?.name || formData.name || '')}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button 
                  size="sm" 
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white border-2 border-gray-200 text-gray-600 hover:text-gray-800"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-semibold">{formData.name || displayUser?.name || ''}</h2>
                  <Badge variant="outline" className={getRoleColor(displayUser?.role || formData.title)}>
                    {(displayUser?.role || formData.title)?.charAt(0).toUpperCase() + (displayUser?.role || formData.title)?.slice(1)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{formData.title || displayUser?.role || ''} • {departmentName || formData.department || 'No Department'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{formData.email || displayUser?.email || ''}</span>
                </div>
                {formData.phone && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{formData.phone}</span>
                  </div>
                )}
                {formData.location && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{formData.location}</span>
                  </div>
                )}
                {formData.joiningDate && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(formData.joiningDate).toLocaleDateString()}</span>
                  </div>
                )}
                {formData.manager && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>Reports to {formData.manager}</span>
                  </div>
                )}
                {userData && (userData as any).isActive !== false && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Active now</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled={true}
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card>
              <CardHeader>
                <CardTitle>Work Information</CardTitle>
                <CardDescription>Your role and organizational details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {isEditing ? (
                    <Select
                      value={formData.departmentId}
                      onValueChange={(value) => {
                        const selectedDept = departments.find(d => d.id === value);
                        setFormData({
                          ...formData,
                          departmentId: value,
                          department: selectedDept?.name || ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="department"
                      value={departmentName || formData.department || 'No Department'}
                      disabled
                    />
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="manager">Reporting Manager</Label>
                  <Input
                    id="manager"
                    value={formData.manager}
                    onChange={(e) => setFormData({...formData, manager: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="joining">Joining Date</Label>
                  <Input
                    id="joining"
                    type="date"
                    value={formData.joiningDate}
                    onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                    disabled={!isEditing}
                  />
                </div>

                {/* Privacy Settings */}
                <div className="pt-4 border-t space-y-4">
                  <h4 className="font-medium">Privacy Settings</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Show Activity Status</Label>
                      <p className="text-xs text-muted-foreground">Let others see when you're online</p>
                    </div>
                    <Switch 
                      checked={privacy.activityStatus}
                      onCheckedChange={(checked) => setPrivacy({...privacy, activityStatus: checked})}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Show Working Hours</Label>
                      <p className="text-xs text-muted-foreground">Display your working schedule</p>
                    </div>
                    <Switch 
                      checked={privacy.workingHours}
                      onCheckedChange={(checked) => setPrivacy({...privacy, workingHours: checked})}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;