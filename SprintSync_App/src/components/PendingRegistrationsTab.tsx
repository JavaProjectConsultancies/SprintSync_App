import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  UserPlus,
  Mail,
  RefreshCw
} from 'lucide-react';
import { usePendingRegistrations, useDeletePendingRegistration } from '../hooks/api/usePendingRegistrations';
import { useDepartments } from '../hooks/api/useDepartments';
import { useDomains } from '../hooks/api/useDomains';
import { PendingRegistration } from '../services/api/entities/pendingRegistrationApi';
import AddUserForm from './AddUserForm';

interface PendingRegistrationsTabProps {
  onRefresh?: () => void;
}

const PendingRegistrationsTab: React.FC<PendingRegistrationsTabProps> = ({ onRefresh }) => {
  const { data: pendingRegistrationsData, loading: pendingLoading, error: pendingError, refetch: refetchPending } = usePendingRegistrations();
  const { data: departmentsData } = useDepartments();
  const { data: domainsData } = useDomains();
  const deletePendingMutation = useDeletePendingRegistration();

  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false);
  const [selectedPendingRegistration, setSelectedPendingRegistration] = useState<PendingRegistration | null>(null);

  const pendingRegistrations = Array.isArray(pendingRegistrationsData) ? pendingRegistrationsData : [];
  const departments = Array.isArray(departmentsData) ? departmentsData : [];
  const domains = Array.isArray(domainsData) ? domainsData : [];

  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return undefined;
    const dept = departments.find(d => d.id === deptId);
    return dept?.name;
  };

  const getDomainName = (domainId?: string) => {
    if (!domainId) return undefined;
    const domain = domains.find(d => d.id === domainId);
    return domain?.name;
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleCancel = async (pendingReg: PendingRegistration) => {
    if (!confirm(`Are you sure you want to cancel the registration request for ${pendingReg.email}?`)) {
      return;
    }

    try {
      await deletePendingMutation.mutate(pendingReg.id);
      refetchPending();
    } catch (error) {
      console.error('Error cancelling pending registration:', error);
      alert('Failed to cancel registration request');
    }
  };

  const handleAdd = (pendingReg: PendingRegistration) => {
    setSelectedPendingRegistration(pendingReg);
    setAddUserDialogOpen(true);
  };

  const handleAddUserSuccess = async () => {
    if (selectedPendingRegistration) {
      try {
        // Delete the pending registration after user is created
        await deletePendingMutation.mutate(selectedPendingRegistration.id);
        refetchPending();
        onRefresh?.();
      } catch (error) {
        console.error('Error deleting pending registration after approval:', error);
      }
    }
    setAddUserDialogOpen(false);
    setSelectedPendingRegistration(null);
  };

  const getInitialFormData = (pendingReg: PendingRegistration) => {
    const nameParts = pendingReg.name?.split(' ') || ['', ''];
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: pendingReg.email || '',
      password: '', // Don't pre-fill password - admin sets it
      confirmPassword: '',
      role: pendingReg.role || 'developer',
      departmentId: pendingReg.departmentId || 'none',
      domainId: pendingReg.domainId || 'none',
      avatarUrl: '',
      experience: 'mid',
      hourlyRate: '',
      availabilityPercentage: '100',
      skills: '',
      isActive: true
    };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Registrations</CardTitle>
              <CardDescription>
                Review and approve or cancel user registration requests
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => refetchPending()}
                disabled={pendingLoading}
                className="border-2 border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${pendingLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              <span className="ml-3 text-muted-foreground">Loading pending registrations...</span>
            </div>
          ) : pendingError ? (
            <div className="flex items-center justify-center py-12 text-red-600">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <span>Failed to load pending registrations: {(pendingError as any)?.message || 'Unknown error'}</span>
            </div>
          ) : pendingRegistrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mb-4 text-green-500" />
              <span className="text-lg font-medium">No pending registrations</span>
              <span className="text-sm mt-2">All registration requests have been processed</span>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRegistrations.map((pendingReg) => (
                <div 
                  key={pendingReg.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-green-100 to-cyan-100 text-green-800">
                        {getInitials(pendingReg.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{pendingReg.name}</h4>
                        <Badge variant="outline" className={getRoleColor(pendingReg.role)}>
                          {pendingReg.role.replace('_', ' ').charAt(0).toUpperCase() + pendingReg.role.replace('_', ' ').slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{pendingReg.email}</span>
                        </div>
                        {getDepartmentName(pendingReg.departmentId) && (
                          <>
                            <span>•</span>
                            <span>Dept: {getDepartmentName(pendingReg.departmentId)}</span>
                          </>
                        )}
                        {getDomainName(pendingReg.domainId) && (
                          <>
                            <span>•</span>
                            <span>Domain: {getDomainName(pendingReg.domainId)}</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Requested: {new Date(pendingReg.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleCancel(pendingReg)}
                      disabled={deletePendingMutation.isPending}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAdd(pendingReg)}
                      disabled={deletePendingMutation.isPending}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog - Pre-filled with pending registration data */}
      {selectedPendingRegistration && (
        <AddUserForm
          isOpen={addUserDialogOpen}
          onClose={() => {
            setAddUserDialogOpen(false);
            setSelectedPendingRegistration(null);
          }}
          onSuccess={handleAddUserSuccess}
          initialData={getInitialFormData(selectedPendingRegistration)}
          pendingRegistrationId={selectedPendingRegistration.id}
        />
      )}
    </>
  );
};

export default PendingRegistrationsTab;

