import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
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
  IndianRupee
} from 'lucide-react';
import EnhancedScrollToTopButton from './EnhancedScrollToTopButton';
import { useCreateUser, useUpdateUser } from '../hooks/api/useUsers';
import { useApprovePendingRegistration, useDeletePendingRegistration } from '../hooks/api/usePendingRegistrations';
import { useDepartments } from '../hooks/api/useDepartments';
import { useDomains } from '../hooks/api/useDomains';
import { useExperienceLevels } from '../hooks/api/useExperienceLevels';
import { User } from '../types/api';
import { calculateHourlyRateFromCTC } from '../utils/salaryCalculator';
import './AddUserForm.css';

interface AddUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialData?: Partial<FormData>;
  pendingRegistrationId?: string; // ID of pending registration if approving
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
  ctc: string;
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
  ctc?: string;
  availabilityPercentage?: string;
  skills?: string;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ isOpen, onClose, onSuccess, initialData, pendingRegistrationId }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'developer', // Use lowercase to match backend enum
    departmentId: 'none',
    domainId: 'none',
    avatarUrl: '',
    experience: 'E1',
    hourlyRate: '',
    ctc: '',
    availabilityPercentage: '100',
    skills: '',
    isActive: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API hooks
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const approvePendingMutation = useApprovePendingRegistration();
  const deletePendingMutation = useDeletePendingRegistration();
  const { data: departmentsData, loading: departmentsLoading, error: departmentsError } = useDepartments();
  const { data: domainsData, loading: domainsLoading, error: domainsError } = useDomains();
  const { experienceLevels, loading: experienceLevelsLoading, error: experienceLevelsError } = useExperienceLevels();

  const departments = Array.isArray(departmentsData) ? departmentsData : [];
  const domains = Array.isArray(domainsData) ? domainsData : [];

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: initialData?.firstName || '',
        lastName: initialData?.lastName || '',
        email: initialData?.email || '',
        password: initialData?.password || '',
        confirmPassword: initialData?.confirmPassword || '',
        role: initialData?.role || 'developer', // Use lowercase to match backend enum
        departmentId: initialData?.departmentId || 'none',
        domainId: initialData?.domainId || 'none',
        avatarUrl: initialData?.avatarUrl || '',
        experience: initialData?.experience || 'E1',
        hourlyRate: initialData?.hourlyRate || '',
        ctc: initialData?.ctc || '',
        availabilityPercentage: initialData?.availabilityPercentage || '100',
        skills: initialData?.skills || '',
        isActive: initialData?.isActive !== undefined ? initialData.isActive : true
      });
      setErrors({});
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [isOpen, initialData]);

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields validation (matching database NOT NULL constraints)
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = 'First name must be less than 50 characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = 'Last name must be less than 50 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email must be less than 255 characters';
    }

    // Password validation - optional when approving from pending registration
    if (!pendingRegistrationId) {
      // Password required for new user creation
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else if (!validatePassword(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      // Password optional when approving - can keep existing or set new one
      if (formData.password) {
        // If password is provided, validate it
        if (formData.password.length < 6) {
          newErrors.password = 'Password must be at least 6 characters';
        } else if (!validatePassword(formData.password)) {
          newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
      // If password is empty when approving, that's OK - will use existing password hash
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    // Optional field validations (matching database constraints)
    if (formData.avatarUrl && !formData.avatarUrl.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
      newErrors.avatarUrl = 'Please enter a valid image URL (jpg, jpeg, png, gif, webp)';
    }

    if (formData.hourlyRate) {
      const rate = parseFloat(formData.hourlyRate);
      if (isNaN(rate) || rate < 0) {
        newErrors.hourlyRate = 'Hourly rate must be a positive number';
      } else if (rate > 999999.99) {
        newErrors.hourlyRate = 'Hourly rate must be less than 1,000,000';
      }
    }

    if (formData.ctc) {
      const ctcValue = parseFloat(formData.ctc);
      if (isNaN(ctcValue) || ctcValue < 0) {
        newErrors.ctc = 'CTC must be a positive number';
      } else if (ctcValue > 999999999999999.99) {
        newErrors.ctc = 'CTC must be less than 999,999,999,999,999.99';
      }
    }

    const availability = parseInt(formData.availabilityPercentage);
    if (isNaN(availability) || availability < 0 || availability > 100) {
      newErrors.availabilityPercentage = 'Availability must be between 0 and 100';
    }

    // Skills validation (will be stored as JSONB)
    if (formData.skills && formData.skills.trim().length > 1000) {
      newErrors.skills = 'Skills description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    const updatedFormData = {
      ...formData,
      [field]: value
    };

    // Auto-calculate hourly rate when CTC or experience changes
    if (field === 'ctc' || field === 'experience') {
      const ctcValue = field === 'ctc' ? parseFloat(value as string) : parseFloat(updatedFormData.ctc);
      const experienceValue = field === 'experience' ? (value as string) : updatedFormData.experience;

      // Only calculate if both CTC and experience are valid
      if (ctcValue && ctcValue > 0 && experienceValue) {
        try {
          const calculatedHourlyRate = calculateHourlyRateFromCTC(ctcValue, experienceValue);
          updatedFormData.hourlyRate = calculatedHourlyRate.toFixed(2);
        } catch (error) {
          console.error('Error calculating hourly rate:', error);
        }
      }
    }

    setFormData(updatedFormData);

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
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare user data for API - ensuring perfect alignment with database schema
      const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
        // Required fields (matching database NOT NULL constraints)
        email: formData.email.trim(),
        // If approving from pending registration and password not provided, we'll use approve endpoint
        // If password provided, will be hashed by backend
        passwordHash: formData.password || '', // Will be hashed by backend
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        role: formData.role.toLowerCase() as any, // Convert to lowercase to match backend enum
        isActive: formData.isActive,
        
        // Optional fields (matching database nullable columns)
        departmentId: formData.departmentId === 'none' ? undefined : formData.departmentId,
        domainId: formData.domainId === 'none' ? undefined : formData.domainId,
        avatarUrl: formData.avatarUrl.trim() || undefined,
        experience: formData.experience ? formData.experience.toLowerCase() : undefined, // Convert to lowercase to match backend enum
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
        ctc: formData.ctc ? parseFloat(formData.ctc) : undefined,
        availabilityPercentage: parseInt(formData.availabilityPercentage) || 100,
        skills: formData.skills.trim() ? JSON.stringify(formData.skills.split(',').map(s => s.trim())) : undefined
      };

      // If approving from pending registration
      if (pendingRegistrationId) {
        if (!formData.password) {
          // No password provided - use approve endpoint which uses existing password hash
          console.log('Approving pending registration without password change - using existing password hash');
          const approvedUser = await approvePendingMutation.mutate(pendingRegistrationId);
          
          // After approval, update user with additional details entered in form
          // Extract user ID from response (structure may vary)
          const approvedUserData = approvedUser?.data?.data || approvedUser?.data;
          const userId = approvedUserData?.id;
          
          if (userId) {
            const updateData: Partial<User> = {
              ...userData,
              passwordHash: undefined, // Don't update password - keep existing hash
            };
            // Remove password hash from update data since we're keeping existing one
            delete updateData.passwordHash;
            
            console.log('Updating approved user with additional details:', updateData);
            await updateUserMutation.mutate({
              id: userId,
              user: updateData
            });
          }
        } else {
          // Password provided - create user with new password, then delete pending registration
          console.log('Approving pending registration with new password - creating user with data:', userData);
          await createUserMutation.mutate(userData);
          
          // Delete pending registration after successful user creation
          await deletePendingMutation.mutate(pendingRegistrationId);
        }
        console.log('✅ Pending registration approved and user created successfully');
      } else {
        // Normal user creation
        console.log('Creating user with data:', userData);
        await createUserMutation.mutate(userData);
        console.log('✅ User created successfully');
      }
      
      // Reset form and close dialog
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'developer', // Use lowercase to match backend enum
        departmentId: 'none',
        domainId: 'none',
        avatarUrl: '',
        experience: 'E1',
        hourlyRate: '',
        ctc: '',
        availabilityPercentage: '100',
        skills: '',
        isActive: true
      });
      setErrors({});
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('❌ Failed to create user:', error);
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          setErrors(prev => ({ ...prev, email: 'Email already exists' }));
        } else {
          alert('Failed to create user: ' + error.message);
        }
      } else {
        alert('Failed to create user: Unknown error');
      }
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
      <DialogContent className="add-user-form-dialog flex flex-col">
        <DialogHeader className="pb-4 border-b border-gray-200 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-blue-600" />
            Add New User
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Create a new user account with all necessary information. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="add-user-form-content flex-1 overflow-y-auto py-2" id="add-user-form-content">
          <div className="space-y-4">
            {/* Basic Information Section */}
            <div className="space-y-3">
              <div className="add-user-section-header flex items-center gap-2">
                <UserIcon className="add-user-section-icon text-blue-600" />
                <h3>Basic Information</h3>
              </div>
              
              <div className="add-user-form-grid">
                {/* First Name */}
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
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
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
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
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
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
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full h-10 px-3 pr-10 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder={pendingRegistrationId ? "Leave empty to use password from registration" : "Enter password"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {pendingRegistrationId 
                      ? 'Leave empty to keep the password from registration. If provided, password must be at least 6 characters.'
                      : 'Password must be at least 6 characters (will be hashed in database)'
                    }
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password {pendingRegistrationId ? '(Optional)' : '*'}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full h-10 px-3 pr-10 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Confirm password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role & Organization Section */}
            <div className="space-y-3">
              <div className="add-user-section-header flex items-center gap-2">
                <Shield className="add-user-section-icon text-green-600" />
                <h3>Role & Organization</h3>
              </div>
              
              <div className="add-user-form-grid">
                {/* Role */}
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="role" className="text-sm font-semibold text-gray-700">
                    Role *
                  </Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange('role', value)}
                  >
                    <SelectTrigger className={`w-full h-10 px-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                      errors.role ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="qa">QA</SelectItem>
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
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="department" className="text-sm font-semibold text-gray-700">
                    Department
                  </Label>
                  {departmentsLoading ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-gray-200 rounded-lg bg-gray-50">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : departmentsError ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-red-300 rounded-lg bg-red-50">
                      <span className="text-sm text-red-600">Failed to load</span>
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
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="domain" className="text-sm font-semibold text-gray-700">
                    Domain
                  </Label>
                  {domainsLoading ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-gray-200 rounded-lg bg-gray-50">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : domainsError ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-red-300 rounded-lg bg-red-50">
                      <span className="text-sm text-red-600">Failed to load</span>
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
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="accountStatus" className="text-sm font-semibold text-gray-700">
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
                    Active users can log in and access the system (stored as BOOLEAN in database)
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="space-y-3">
              <div className="add-user-section-header flex items-center gap-2">
                <Briefcase className="add-user-section-icon text-purple-600" />
                <h3>Professional Details</h3>
              </div>
              
              <div className="add-user-form-grid">
                {/* Hourly Rate */}
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="hourlyRate" className="text-sm font-semibold text-gray-700">
                    Hourly Rate (₹)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      className={`w-full h-10 pl-8 pr-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                        errors.hourlyRate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="1000.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.hourlyRate && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.hourlyRate}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Hourly rate in INR (auto-calculated from CTC and experience level, or enter manually)
                  </p>
                </div>

                {/* CTC */}
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="ctc" className="text-sm font-semibold text-gray-700">
                    CTC (₹)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <Input
                      id="ctc"
                      type="number"
                      value={formData.ctc}
                      onChange={(e) => handleInputChange('ctc', e.target.value)}
                      className={`w-full h-10 pl-8 pr-3 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                        errors.ctc ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="500000.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.ctc && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.ctc}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    CTC (Cost to Company) in INR (stored as DECIMAL(15,2) in database)
                  </p>
                </div>

                {/* Availability Percentage */}
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="availabilityPercentage" className="text-sm font-semibold text-gray-700">
                    Availability (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="availabilityPercentage"
                      type="number"
                      value={formData.availabilityPercentage}
                      onChange={(e) => handleInputChange('availabilityPercentage', e.target.value)}
                      className={`w-full h-10 px-3 pr-8 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                        errors.availabilityPercentage ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="100"
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
                  </div>
                  {errors.availabilityPercentage && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.availabilityPercentage}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Availability percentage 0-100 (stored as INTEGER in database)
                  </p>
                </div>

                {/* Experience Level */}
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="experience" className="text-sm font-semibold text-gray-700">
                    Experience Level
                  </Label>
                  {experienceLevelsLoading ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-gray-200 rounded-lg bg-gray-50">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  ) : experienceLevelsError ? (
                    <div className="w-full h-10 flex items-center justify-center border-2 border-red-300 rounded-lg bg-red-50">
                      <span className="text-sm text-red-600">Failed to load</span>
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
                <div className="add-user-form-field space-y-2">
                  <Label htmlFor="skills" className="text-sm font-semibold text-gray-700">
                    Skills
                  </Label>
                  <Input
                    id="skills"
                    value={formData.skills}
                    onChange={(e) => handleInputChange('skills', e.target.value)}
                    className={`w-full h-10 px-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${
                      errors.skills ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                    placeholder="JavaScript, React, Node.js"
                    maxLength={1000}
                  />
                  {errors.skills && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.skills}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    Enter skills separated by commas (stored as JSON in database)
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="space-y-3">
              <div className="add-user-section-header flex items-center gap-2">
                <Image className="add-user-section-icon text-orange-600" />
                <h3>Profile</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="avatarUrl" className="text-sm font-semibold text-gray-700">
                  Avatar URL
                </Label>
                <Input
                  id="avatarUrl"
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
                    Enter a valid image URL for the user's profile picture (stored as TEXT in database)
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
                  Creating User...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      
      {/* Scroll to Top Button */}
      <EnhancedScrollToTopButton 
        targetId="add-user-form-content" 
        threshold={200}
        showOnFormScroll={true}
        showOnPageScroll={false}
        position="bottom-right"
        className="add-user-scroll-button"
      />
    </Dialog>
  );
};

export default AddUserForm;
