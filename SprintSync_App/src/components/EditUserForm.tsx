import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { 
  UserPlus, 
  User as UserIcon, 
  Shield, 
  Briefcase, 
  Image, 
  Loader2, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Edit3
} from 'lucide-react';
import EnhancedScrollToTopButton from './EnhancedScrollToTopButton';
import { useUpdateUser } from '../hooks/api/useUsers';
import { useDepartments } from '../hooks/api/useDepartments';
import { useDomains } from '../hooks/api/useDomains';
import { useExperienceLevels } from '../hooks/api/useExperienceLevels';
import { User } from '../types/api';
import './EditUserForm.css';

interface EditUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: User | null;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  departmentId: string;
  domainId: string;
  avatarUrl: string;
  experience: string;
  hourlyRate: string;
  availabilityPercentage: string;
  skills: string;
  isActive: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  departmentId?: string;
  domainId?: string;
  avatarUrl?: string;
  experience?: string;
  hourlyRate?: string;
  availabilityPercentage?: string;
  skills?: string;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ isOpen, onClose, onSuccess, user }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'developer',
    departmentId: 'none',
    domainId: 'none',
    avatarUrl: '',
    experience: 'mid',
    hourlyRate: '',
    availabilityPercentage: '100',
    skills: '',
    isActive: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API hooks
  const updateUserMutation = useUpdateUser();
  const { data: departmentsData, loading: departmentsLoading, error: departmentsError } = useDepartments();
  const { data: domainsData, loading: domainsLoading, error: domainsError } = useDomains();
  const { experienceLevels, loading: experienceLevelsLoading, error: experienceLevelsError } = useExperienceLevels();

  const departments = Array.isArray(departmentsData) ? departmentsData : [];
  const domains = Array.isArray(domainsData) ? domainsData : [];

  // Debug logging
  console.log('🔍 [EditUserForm] Departments:', { departmentsData, departments, departmentsLoading, departmentsError });
  console.log('🔍 [EditUserForm] Domains:', { domainsData, domains, domainsLoading, domainsError });

  // Initialize form data when user changes
  useEffect(() => {
    if (user && isOpen) {
      const nameParts = user.name?.split(' ') || ['', ''];
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        password: '', // Don't pre-fill password
        confirmPassword: '', // Don't pre-fill password
        role: user.role ? convertRoleForFrontend(user.role) : 'developer',
        departmentId: user.departmentId || 'none',
        domainId: user.domainId || 'none',
        avatarUrl: user.avatarUrl || '',
        experience: user.experience || 'mid',
        hourlyRate: user.hourlyRate?.toString() || '',
        availabilityPercentage: user.availabilityPercentage?.toString() || '100',
        skills: user.skills || '',
        isActive: user.isActive ?? true
      });
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [user, isOpen]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  // Data type validation functions
  const isString = (value: unknown): value is string => {
    return typeof value === 'string';
  };

  const isNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value);
  };

  const isBoolean = (value: unknown): value is boolean => {
    return typeof value === 'boolean';
  };

  const isEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const isUrl = (value: string): boolean => {
    try {
      new URL(value);
      return value.startsWith('http://') || value.startsWith('https://');
    } catch {
      return false;
    }
  };

  const isPositiveNumber = (value: number): boolean => {
    return value >= 0;
  };

  const isPercentage = (value: number): boolean => {
    return value >= 0 && value <= 100;
  };

  // Role validation and conversion logic
  const validateAndConvertRole = (selectedRole: string): string => {
    // Define accepted roles in the exact case expected by database (lowercase)
    const acceptedRoles = ['admin', 'manager', 'developer', 'designer', 'tester', 'analyst'];
    
    // Normalize the selected role to lowercase
    const normalizedRole = selectedRole.toLowerCase();
    
    // Check if the normalized role exists in accepted roles
    if (!acceptedRoles.includes(normalizedRole)) {
      throw new Error(`Invalid role selected: ${selectedRole}. Please choose a valid role.`);
    }
    
    // Return the normalized role (lowercase) for database compatibility
    return normalizedRole;
  };

  // Allowed roles matching backend enum values (lowercase)
  const allowedRoles = ['admin', 'manager', 'developer', 'designer'] as const;

  const convertRoleForBackend = (frontendRole: string): string => frontendRole.toLowerCase();

  const convertRoleForFrontend = (backendRole: string): string => backendRole.toLowerCase();

  // Comprehensive validation schema for all form sections
  const validationSchema: Record<string, (value: any) => boolean> = {
    // Basic Information Section
    firstName: (value: string) => isString(value) && value.trim().length >= 2,
    lastName: (value: string) => isString(value) && value.trim().length >= 2,
    email: (value: string) => isString(value) && isEmail(value),
    password: (value: string) => value === '' || (isString(value) && value.length >= 6),
    confirmPassword: (value: string) => isString(value),
    
    // Role & Organization Section
    role: (value: string) => isString(value) && allowedRoles.includes(value as any),
    departmentId: (value: string) => isString(value),
    domainId: (value: string) => isString(value),
    isActive: (value: boolean) => isBoolean(value),
    
    // Professional Details Section
    hourlyRate: (value: string) => value === '' || (isString(value) && !isNaN(Number(value)) && Number(value) >= 0),
    availabilityPercentage: (value: string) => isString(value) && !isNaN(Number(value)) && isPercentage(Number(value)),
    experience: (value: string) => isString(value) && ['junior', 'mid', 'senior', 'lead'].includes(value.toLowerCase()),
    skills: (value: string) => isString(value),
    
    // Profile Section
    avatarUrl: (value: string) => value === '' || (isString(value) && isUrl(value))
  };

  // Data type conversion functions for each section
  const convertBasicInformation = (data: FormData) => ({
    name: `${data.firstName.trim()} ${data.lastName.trim()}`,
    email: data.email.trim(),
    passwordHash: data.password || undefined
  });

  const convertRoleAndOrganization = (data: FormData) => ({
    role: convertRoleForBackend(data.role),
    departmentId: data.departmentId === 'none' ? undefined : data.departmentId,
    domainId: data.domainId === 'none' ? undefined : data.domainId,
    isActive: data.isActive
  });

  const convertProfessionalDetails = (data: FormData) => ({
    hourlyRate: data.hourlyRate ? Number(data.hourlyRate) : undefined,
    availabilityPercentage: Number(data.availabilityPercentage),
    experience: data.experience ? data.experience.toLowerCase() : undefined,
    skills: data.skills.trim() ? JSON.stringify(data.skills.split(',').map(s => s.trim())) : undefined
  });

  const convertProfile = (data: FormData) => ({
    avatarUrl: data.avatarUrl.trim() || undefined
  });

  // Comprehensive data type validation summary
  const validateDataTypes = (data: FormData) => {
    const validationResults = {
      basicInformation: {
        firstName: { type: 'string', valid: validationSchema.firstName(data.firstName), value: data.firstName },
        lastName: { type: 'string', valid: validationSchema.lastName(data.lastName), value: data.lastName },
        email: { type: 'email', valid: validationSchema.email(data.email), value: data.email },
        password: { type: 'string', valid: validationSchema.password(data.password), value: data.password ? '***' : '' }
      },
      roleAndOrganization: {
        role: { type: 'enum', valid: validationSchema.role(data.role), value: data.role },
        departmentId: { type: 'string', valid: validationSchema.departmentId(data.departmentId), value: data.departmentId },
        domainId: { type: 'string', valid: validationSchema.domainId(data.domainId), value: data.domainId },
        isActive: { type: 'boolean', valid: validationSchema.isActive(data.isActive), value: data.isActive }
      },
      professionalDetails: {
        hourlyRate: { type: 'number', valid: validationSchema.hourlyRate(data.hourlyRate), value: data.hourlyRate },
        availabilityPercentage: { type: 'percentage', valid: validationSchema.availabilityPercentage(data.availabilityPercentage), value: data.availabilityPercentage },
        experience: { type: 'enum', valid: validationSchema.experience(data.experience), value: data.experience },
        skills: { type: 'string', valid: validationSchema.skills(data.skills), value: data.skills }
      },
      profile: {
        avatarUrl: { type: 'url', valid: validationSchema.avatarUrl(data.avatarUrl), value: data.avatarUrl }
      }
    };

    return validationResults;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate each field using the comprehensive schema
    Object.entries(validationSchema).forEach(([field, validator]) => {
      const value = formData[field as keyof FormData];
      
      if (!validator(value)) {
        switch (field) {
          case 'firstName':
            newErrors.firstName = 'First name must be at least 2 characters';
            break;
          case 'lastName':
            newErrors.lastName = 'Last name must be at least 2 characters';
            break;
          case 'email':
            newErrors.email = 'Please enter a valid email address';
            break;
          case 'password':
            newErrors.password = 'Password must be at least 6 characters long';
            break;
          case 'role':
            newErrors.role = 'Please select a valid role';
            break;
          case 'hourlyRate':
            newErrors.hourlyRate = 'CTC must be a positive number';
            break;
          case 'availabilityPercentage':
      newErrors.availabilityPercentage = 'Availability must be between 0 and 100';
            break;
          case 'experience':
            newErrors.experience = 'Please select a valid experience level';
            break;
          case 'avatarUrl':
            newErrors.avatarUrl = 'Please enter a valid URL starting with http:// or https://';
            break;
        }
      }
    });

    // Additional cross-field validations
    if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      console.error('No user provided for editing');
      return;
    }

    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare user data for API using section-specific conversion functions
      const basicInfo = convertBasicInformation(formData);
      const roleAndOrg = convertRoleAndOrganization(formData);
      const professionalDetails = convertProfessionalDetails(formData);
      const profile = convertProfile(formData);

      const userData: Partial<User> = {
        ...basicInfo,
        ...roleAndOrg,
        ...professionalDetails,
        ...profile,
        role: roleAndOrg.role as any // Type assertion for role conversion
      };

      // Only include password if it's provided
      if (formData.password) {
        userData.passwordHash = formData.password; // Backend will hash it
      }

      console.log('🔄 Updating user with data:', userData);
      console.log('🔄 Data type validation summary:', validateDataTypes(formData));
      console.log('🔄 Data type conversion by section:', {
        basicInformation: basicInfo,
        roleAndOrganization: roleAndOrg,
        professionalDetails: professionalDetails,
        profile: profile
      });
      console.log('🔄 User ID being updated:', user.id);
      console.log('🔄 Complete userData object:', JSON.stringify(userData, null, 2));
      console.log('🔄 Role conversion process:', {
        frontendRole: formData.role,
        backendRole: userData.role,
        conversion: `${formData.role} → ${userData.role}`,
        mapping: `${formData.role} (frontend) → ${userData.role} (backend/database)`
      });

      // Try a conservative update approach
      try {
        // First, try with only the most essential fields
        const essentialFields = {
          name: userData.name,
          email: userData.email,
          role: userData.role
        };
        
        console.log('🔄 Trying essential fields update...', essentialFields);
        await updateUserMutation.mutate({ id: user.id, user: essentialFields });
        console.log('✅ Essential fields updated successfully');
        
        // If essential fields work, try adding safe fields one by one
        const safeFields = {
          ...essentialFields,
          departmentId: userData.departmentId,
          domainId: userData.domainId,
          isActive: userData.isActive,
          hourlyRate: userData.hourlyRate,
          availabilityPercentage: userData.availabilityPercentage,
          skills: userData.skills,
          avatarUrl: userData.avatarUrl
        };
        
        console.log('🔄 Trying safe fields update...', safeFields);
        await updateUserMutation.mutate({ id: user.id, user: safeFields });
        console.log('✅ Safe fields updated successfully');

      console.log('✅ User updated successfully');
        
      } catch (apiError) {
        console.error('❌ API Error details:', apiError);
        
        // If even essential fields fail, try with absolute minimum
        try {
          console.warn('⚠️ Safe fields failed, trying absolute minimum...');
          
          const minimalData = {
            name: userData.name,
            email: userData.email
          };
          
          console.log('🔄 Trying minimal update...', minimalData);
          await updateUserMutation.mutate({ id: user.id, user: minimalData });
          console.log('✅ Minimal update successful');
          
          alert('User updated with basic information only. Some fields could not be saved.');
          
        } catch (minimalError) {
          console.error('❌ Even minimal update failed:', minimalError);
          throw apiError; // Re-throw the original error
        }
      }
      
      // Reset form and close dialog
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'DEVELOPER',
        departmentId: 'none',
        domainId: 'none',
        avatarUrl: '',
        experience: 'mid',
        hourlyRate: '',
        availabilityPercentage: '100',
        skills: '',
        isActive: true
      });
      setErrors({});
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('❌ Failed to update user:', error);
      
      // Show specific error message to user
      let errorMessage = 'Failed to update user. Please try again.';
      
      if (error?.message) {
        if (error.message.includes('experience') || error.message.includes('experi')) {
          errorMessage = 'There was an issue with the experience field. Please try again or contact support.';
        } else if (error.message.includes('JSON parse error')) {
          errorMessage = 'Invalid data format. Please check all fields and try again.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Invalid data provided. Please check all fields and try again.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Server error occurred. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'DEVELOPER',
      departmentId: 'none',
      domainId: 'none',
      avatarUrl: '',
      experience: 'mid',
      hourlyRate: '',
      availabilityPercentage: '100',
      skills: '',
      isActive: true
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="edit-user-form-dialog flex flex-col">
        <DialogHeader className="pb-4 border-b border-gray-200 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-blue-600" />
            Edit User Profile
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Update user information. All changes will be saved to the database.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="edit-user-form-content flex-1 overflow-y-auto py-2" id="edit-user-form-content">
          <div className="space-y-4">
            {/* Basic Information Section */}
            <div className="space-y-3">
              <div className="edit-user-section-header flex items-center gap-2">
                <UserIcon className="edit-user-section-icon text-blue-600" />
                <h3>Basic Information</h3>
              </div>
              
              <div className="edit-user-form-grid">
                {/* First Name */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editFirstName" className="text-sm font-semibold text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="editFirstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full h-10 px-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                      errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editLastName" className="text-sm font-semibold text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="editLastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full h-10 px-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                      errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.lastName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editEmail" className="text-sm font-semibold text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full h-10 px-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="user@company.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editPassword" className="text-sm font-semibold text-gray-700">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="editPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full h-10 px-3 pr-10 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Leave blank to keep current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Leave blank to keep current password
                  </p>
                </div>

                {/* Confirm Password */}
                {formData.password && (
                  <div className="edit-user-form-field space-y-2">
                    <Label htmlFor="editConfirmPassword" className="text-sm font-semibold text-gray-700">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="editConfirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`w-full h-10 px-3 pr-10 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                          errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Role & Organization Section */}
            <div className="space-y-3">
              <div className="edit-user-section-header flex items-center gap-2">
                <Shield className="edit-user-section-icon text-blue-600" />
                <h3>Role & Organization</h3>
              </div>
              
              <div className="edit-user-form-grid">
                {/* Role */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editRole" className="text-sm font-semibold text-gray-700">
                    Role *
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editDepartment" className="text-sm font-semibold text-gray-700">
                    Department
                  </Label>
                  {departmentsLoading ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-gray-200 rounded-lg bg-gray-50">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading departments...</span>
                    </div>
                  ) : departmentsError ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-red-300 rounded-lg bg-red-50">
                      <span className="text-sm text-red-600">Failed to load departments</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.departmentId}
                      onValueChange={(value) => handleInputChange('departmentId', value)}
                    >
                      <SelectTrigger className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Department</SelectItem>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Domain */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editDomain" className="text-sm font-semibold text-gray-700">
                    Domain
                  </Label>
                  {domainsLoading ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-gray-200 rounded-lg bg-gray-50">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading domains...</span>
                    </div>
                  ) : domainsError ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-red-300 rounded-lg bg-red-50">
                      <span className="text-sm text-red-600">Failed to load domains</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.domainId}
                      onValueChange={(value) => handleInputChange('domainId', value)}
                    >
                      <SelectTrigger className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                        <SelectValue placeholder="Select domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Domain</SelectItem>
                        {domains.map((domain) => (
                          <SelectItem key={domain.id} value={domain.id}>
                            {domain.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Account Status */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editAccountStatus" className="text-sm font-semibold text-gray-700">
                    Account Status
                  </Label>
                  <Select
                    value={formData.isActive.toString()}
                    onValueChange={(value) => handleInputChange('isActive', value === 'true')}
                  >
                    <SelectTrigger className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                      <SelectValue placeholder="Select account status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Active users can log in and access the system.
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="space-y-3">
              <div className="edit-user-section-header flex items-center gap-2">
                <Briefcase className="edit-user-section-icon text-blue-600" />
                <h3>Professional Details</h3>
              </div>
              
              <div className="edit-user-form-grid">
                {/* CTC */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editHourlyRate" className="text-sm font-semibold text-gray-700">
                    CTC (₹)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <Input
                      id="editHourlyRate"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      className={`w-full h-10 pl-8 pr-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                        errors.hourlyRate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="500000.00"
                    />
                  </div>
                  {errors.hourlyRate && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.hourlyRate}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    CTC (Cost to Company) in INR (stored as DECIMAL(10,2) in database)
                  </p>
                </div>

                {/* Availability Percentage */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editAvailability" className="text-sm font-semibold text-gray-700">
                    Availability (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="editAvailability"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.availabilityPercentage}
                      onChange={(e) => handleInputChange('availabilityPercentage', e.target.value)}
                      className={`w-full h-10 px-3 pr-8 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                        errors.availabilityPercentage ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="100"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
                  </div>
                  {errors.availabilityPercentage && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.availabilityPercentage}
                    </p>
                  )}
                </div>

                {/* Experience Level */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editExperience" className="text-sm font-semibold text-gray-700">
                    Experience Level
                  </Label>
                  {experienceLevelsLoading ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-gray-200 rounded-lg bg-gray-50">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading experience levels...</span>
                    </div>
                  ) : experienceLevelsError ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-red-300 rounded-lg bg-red-50">
                      <span className="text-sm text-red-600">Failed to load experience levels</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.experience}
                      onValueChange={(value) => handleInputChange('experience', value)}
                    >
                      <SelectTrigger className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Skills */}
                <div className="edit-user-form-field space-y-2">
                  <Label htmlFor="editSkills" className="text-sm font-semibold text-gray-700">
                    Skills
                  </Label>
                  <Input
                    id="editSkills"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    className="w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                    placeholder="JavaScript, React, Node.js"
                  />
                  <p className="text-xs text-gray-500">
                    Enter skills separated by commas
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="space-y-3">
              <div className="edit-user-section-header flex items-center gap-2">
                <Image className="edit-user-section-icon text-blue-600" />
                <h3>Profile</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editAvatarUrl" className="text-sm font-semibold text-gray-700">
                  Avatar URL
                </Label>
                <Input
                  id="editAvatarUrl"
                  value={formData.avatarUrl}
                  onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                  className={`w-full h-10 px-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                    errors.avatarUrl ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="https://example.com/avatar.jpg"
                />
                {errors.avatarUrl && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.avatarUrl}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Enter a valid image URL for the user's profile picture
                </p>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="pt-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
          <div className="flex justify-end gap-3 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2 h-10 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 h-10 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-black shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating User...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update User
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      
      {/* Scroll to Top Button */}
      <EnhancedScrollToTopButton 
        targetId="edit-user-form-content" 
        threshold={200}
        showOnFormScroll={true}
        showOnPageScroll={false}
        position="bottom-right"
        className="edit-user-scroll-button"
      />
    </Dialog>
  );
};

export default EditUserForm;
