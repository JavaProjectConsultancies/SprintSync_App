import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  User, 
  Mail, 
  Shield, 
  Building, 
  Globe, 
  Briefcase, 
  IndianRupee, 
  Percent, 
  Star, 
  Image as ImageIcon,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { User as UserType } from '../types/api';
import { useDepartments } from '../hooks/api/useDepartments';
import { useDomains } from '../hooks/api/useDomains';
import {
  EXPERIENCE_LEVEL_LABELS,
  ExperienceLevelCode,
  getExperienceLabel,
  normalizeExperienceValue,
} from '../hooks/api/useExperienceLevels';
import './UserDetailsModal.css';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

const EXPERIENCE_LEVEL_COLORS: Record<ExperienceLevelCode, string> = {
  E1: 'bg-green-100 text-green-800 border-green-200',
  E2: 'bg-green-100 text-green-800 border-green-200',
  M1: 'bg-blue-100 text-blue-800 border-blue-200',
  M2: 'bg-blue-100 text-blue-800 border-blue-200',
  M3: 'bg-blue-100 text-blue-800 border-blue-200',
  L1: 'bg-purple-100 text-purple-800 border-purple-200',
  L2: 'bg-purple-100 text-purple-800 border-purple-200',
  L3: 'bg-purple-100 text-purple-800 border-purple-200',
  S1: 'bg-red-100 text-red-800 border-red-200',
};

const isExperienceLevelCode = (
  value: string
): value is ExperienceLevelCode => value in EXPERIENCE_LEVEL_COLORS;

const normalizeExperienceCode = (
  experience?: string | null
): ExperienceLevelCode | undefined => {
  const normalized = normalizeExperienceValue(experience || undefined);
  if (normalized && isExperienceLevelCode(normalized)) {
    return normalized;
  }

  return undefined;
};

const getExperienceBadgeClass = (experience?: string | null): string => {
  const code = normalizeExperienceCode(experience);
  if (code) {
    return EXPERIENCE_LEVEL_COLORS[code];
  }

  return 'bg-gray-100 text-gray-800 border-gray-200';
};

const getExperienceDisplayLabel = (experience?: string | null): string => {
  if (!experience) {
    return 'Not Set';
  }

  const code = normalizeExperienceCode(experience);
  if (code) {
    return EXPERIENCE_LEVEL_LABELS[code];
  }

  return getExperienceLabel(experience);
};

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ isOpen, onClose, user }) => {
  // Fetch departments and domains data
  const { data: departmentsData } = useDepartments();
  const { data: domainsData } = useDomains();

  const departments = Array.isArray(departmentsData) ? departmentsData : [];
  const domains = Array.isArray(domainsData) ? domainsData : [];

  if (!user) return null;

  // Mapping functions to get names by IDs
  const getDepartmentNameById = (id: string | undefined): string => {
    if (!id) return 'No Department Assigned';
    const department = departments.find(dept => dept.id === id);
    return department ? department.name : 'Unknown Department';
  };

  const getDomainNameById = (id: string | undefined): string => {
    if (!id) return 'No Domain Assigned';
    const domain = domains.find(dom => dom.id === id);
    return domain ? domain.name : 'Unknown Domain';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'MANAGER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DEVELOPER': return 'bg-green-100 text-green-800 border-green-200';
      case 'DESIGNER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'QA': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'TESTER': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ANALYST': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Parse skills stored as JSON string or comma-separated string and return clean names
  const parseSkills = (skills?: string): string[] => {
    if (!skills) return [];
    try {
      const parsed = JSON.parse(skills);
      if (Array.isArray(parsed)) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch (_) {
      // Not JSON, continue
    }
    return skills
      .replace(/^\[|\]$/g, '')
      .split(',')
      .map((s) => s.replace(/^\"|\"$/g, '').trim())
      .filter(Boolean);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateOnly = (dateString: string | undefined) => {
    if (!dateString) return 'Not Set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="user-details-modal-dialog flex flex-col">
        <DialogHeader className="user-details-modal-header pb-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-blue-100 text-blue-800 text-lg font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-800">
                  {user.name}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  User Profile Details
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="user-details-modal-content space-y-6 py-4 flex-1 overflow-y-auto">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="user-details-section-header flex items-center gap-2">
              <User className="user-details-section-icon text-indigo-600" />
              <h3>Basic Information</h3>
            </div>
            
            <div className="user-details-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <p className="font-medium">{user.email}</p>
              </div>

              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Role</span>
                </div>
                <Badge className={`${getRoleColor(user.role)} border`}>
                  {user.role}
                </Badge>
              </div>

              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  {user.isActive ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      <XCircle className="w-[15px] h-[15px] mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Last Login</span>
                </div>
                <p>{formatDate(user.lastLogin)}</p>
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <div className="space-y-4">
            <div className="user-details-section-header flex items-center gap-2">
              <Building className="user-details-section-icon text-indigo-600" />
              <h3>Organization</h3>
            </div>
            
            <div className="user-details-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Department</span>
                </div>
                <p>
                  {getDepartmentNameById(user.departmentId)}
                </p>
              </div>

              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Domain</span>
                </div>
                <p>
                  {getDomainNameById(user.domainId)}
                </p>
              </div>
            </div>
          </div>

          {/* Reporting & Joining */}
          <div className="space-y-4">
            <div className="user-details-section-header flex items-center gap-2">
              <UserCheck className="user-details-section-icon text-indigo-600" />
              <h3>Reporting & Joining</h3>
            </div>

            <div className="user-details-grid grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Reporting Manager</span>
                </div>
                <p className="font-medium">
                  {user.reportingManager || 'Not Set'}
                </p>
              </div>

              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Date of Joining</span>
                </div>
                <p className="font-medium">
                  {formatDateOnly(user.dateOfJoining)}
                </p>
              </div>
            </div>
          </div>

          {/* Professional Details */}
          <div className="space-y-4">
            <div className="user-details-section-header flex items-center gap-2">
              <Briefcase className="user-details-section-icon text-indigo-600" />
              <h3>Professional Details</h3>
            </div>
            
            <div className="user-details-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Experience</span>
                </div>
                <Badge className={`${getExperienceBadgeClass(user.experience)} border`}>
                  {getExperienceDisplayLabel(user.experience)}
                </Badge>
              </div>

              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Hourly Rate</span>
                </div>
                <p className="font-medium">
                  {user.hourlyRate ? `₹${user.hourlyRate.toFixed(2)}` : 'Not Set'}
                </p>
              </div>

              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">CTC</span>
                </div>
                <p className="font-medium">
                  {user.ctc ? `₹${user.ctc.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : 'Not Set'}
                </p>
              </div>

              <div className="user-details-field space-y-2">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Availability</span>
                </div>
                <p className="font-medium">
                  {user.availabilityPercentage || 100}%
                </p>
              </div>
            </div>

            {parseSkills(user.skills).length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Skills</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parseSkills(user.skills).map((skill, index) => (
                    <Badge key={index} variant="outline" className="skills-badge">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-4">
            <div className="user-details-section-header flex items-center gap-2">
              <ImageIcon className="user-details-section-icon text-indigo-600" />
              <h3>Profile</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Avatar URL</span>
              </div>
              <p className="text-gray-800 break-all">
                {user.avatarUrl || 'No avatar set'}
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Created</span>
                </div>
                <p className="text-gray-800">{formatDate(user.createdAt)}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Last Updated</span>
                </div>
                <p className="text-gray-800">{formatDate(user.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-end">
            <Button onClick={onClose} className="px-6 py-2">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
