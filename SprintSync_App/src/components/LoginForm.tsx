import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Loader2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { authApiService, LoginRequest } from '../services/api/authApi';
import LoadingSpinner from './LoadingSpinner';
import { useDepartments } from '../hooks/api/useDepartments';
import { useDomains } from '../hooks/api/useDomains';
import ssLogo from '../assets/ss_logo.gif';

interface LoginFormProps {
  onLoginSuccess: (token: string, user: any) => void;
  onLoginError: (error: string) => void;
  isLoading?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onLoginError, isLoading = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [signUpData, setSignUpData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'none',
    department: 'none',
    domain: 'none'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [signUpErrors, setSignUpErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPanelActive, setIsPanelActive] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');

  // Rotating creators logic
  const creators = ["Mayuresh Gajbhiye", "Sanika Sapkale", "Sudhanshu Nakhate"];
  const [currentCreatorIndex, setCurrentCreatorIndex] = useState(0);
  const [fadeOpacity, setFadeOpacity] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeOpacity(0); // Fade out
      setTimeout(() => {
        setCurrentCreatorIndex((prev) => (prev + 1) % creators.length);
        setFadeOpacity(1); // Fade in
      }, 500); // Wait for fade out transition
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const { data: departmentsData } = useDepartments();
  const { data: domainsData } = useDomains();
  const departments = Array.isArray(departmentsData) ? departmentsData : [];
  const domains = Array.isArray(domainsData) ? domainsData : [];

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await authApiService.login(formData);

      if (response.success && response.data) {
        const responseData: any = response.data;
        const authData = responseData.data || responseData;
        const token = authData.token || authData.accessToken || authData.access_token;
        const user = authData.user || authData.userData;

        if (token && user) {
          onLoginSuccess(token, user);
        } else {
          throw new Error('Token or user data missing from response');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      let errorMessage = 'Login failed. Please try again.';

      if (error.status === 401) {
        errorMessage = 'Invalid Email / Password';
      } else if (error.status === 403) {
        errorMessage = 'Account Disabled';
      } else if (error.status === 404) {
        errorMessage = 'User Not Found';
      } else if (error.status === 500) {
        errorMessage = 'Server Error';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setLoginErrorMessage(errorMessage);
      onLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateSignUpForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!signUpData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!signUpData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!signUpData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signUpData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!signUpData.password) {
      newErrors.password = 'Password is required';
    } else if (signUpData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setSignUpErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignUpForm()) {
      return;
    }

    setIsSubmitting(true);
    setSignUpErrors({});

    try {
      const registerData = {
        name: `${signUpData.firstName} ${signUpData.lastName}`,
        email: signUpData.email,
        password: signUpData.password,
        role: signUpData.role,
        department: signUpData.department !== 'none' ? signUpData.department : undefined,
        domain: signUpData.domain !== 'none' ? signUpData.domain : undefined
      };

      const response = await authApiService.register(registerData);

      if (response.success && response.data) {
        const responseData: any = response.data;
        const authData = responseData.data || responseData;
        const token = authData.token || authData.accessToken || authData.access_token;
        const user = authData.user || authData.userData;

        if (token && user) {
          onLoginSuccess(token, user);
        } else {
          throw new Error('Admin will grant you access');
        }
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      let errorMessage = 'Registration failed. Please try again.';

      if (error.status === 409 || error.status === 400) {
        errorMessage = 'Email already exists. Please use a different email.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setSignUpErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setSignUpData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'none',
      department: 'none',
      domain: 'none'
    });
    setSignUpErrors({});
  };

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (loginErrorMessage) {
      setLoginErrorMessage('');
    }
  };

  if (isSubmitting || isLoading) {
    return (
      <div className="form-inner">
        <LoadingSpinner message="Signing in..." />
      </div>
    );
  }

  return (
    <div className={`sliding-container ${isPanelActive ? 'right-panel-active' : ''}`}>
      {/* Sign In Form */}
      <div className="form-container sign-in-container">
        <div className="form-inner">
          <div style={{ marginBottom: '25px' }}>
            <h1 className="form-title" style={{ marginBottom: '8px' }}>Sign In to SprintSync</h1>
            <span className="form-label">Welcome back! Please enter your credentials</span>
          </div>

          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '10px' }}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="form-input"
              disabled={isSubmitting}
            />
            {errors.email && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>
            )}

            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="form-input"
                style={{ paddingRight: '45px' }}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6b7280'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.password}</p>
            )}

            {loginErrorMessage && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>
                {loginErrorMessage}
              </p>
            )}

            <button type="submit" className="form-button" disabled={isSubmitting}>
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className="form-container sign-up-container">
        <div className="form-inner" style={{ padding: '20px 30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h1 className="form-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Create Your Account</h1>
            <span className="form-label">Join SprintSync - Fill in your details below</span>
          </div>

          <form onSubmit={handleSignUp} style={{ width: '100%', marginTop: '10px' }}>
            {/* General Error Message */}
            {signUpErrors.general && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '10px', textAlign: 'center', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '6px' }}>{signUpErrors.general}</p>
            )}

            {/* First and Last Name in two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={signUpData.firstName}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="form-input"
                  style={{ margin: '4px 0' }}
                  disabled={isSubmitting}
                />
                {signUpErrors.firstName && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px' }}>{signUpErrors.firstName}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={signUpData.lastName}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="form-input"
                  style={{ margin: '4px 0' }}
                  disabled={isSubmitting}
                />
                {signUpErrors.lastName && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px' }}>{signUpErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={signUpData.email}
                onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                className="form-input"
                style={{ margin: '4px 0' }}
                disabled={isSubmitting}
              />
              {signUpErrors.email && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px' }}>{signUpErrors.email}</p>
              )}
            </div>

            {/* Password and Confirm Password in two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Password field with eye button */}
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={signUpData.password}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                  className="form-input"
                  style={{ margin: '4px 0', paddingRight: '45px' }}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {signUpErrors.password && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px' }}>{signUpErrors.password}</p>
                )}
              </div>

              {/* Confirm Password field with eye button */}
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm"
                  value={signUpData.confirmPassword}
                  onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="form-input"
                  style={{ margin: '4px 0', paddingRight: '45px' }}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280'
                  }}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {signUpErrors.confirmPassword && (
                  <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '2px' }}>{signUpErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Role and Department in two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '4px 0' }}>
              <Select
                value={signUpData.role}
                onValueChange={(value) => setSignUpData(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="form-input" style={{ height: '46px', padding: '14px 20px' }}>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Role</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={signUpData.domain}
                onValueChange={(value) => setSignUpData(prev => ({ ...prev, domain: value }))}
              >
                <SelectTrigger className="form-input" style={{ height: '46px', padding: '14px 20px' }}>
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Domain</SelectItem>
                  {domains.map((domain: any) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <Select
              value={signUpData.department}
              onValueChange={(value) => setSignUpData(prev => ({ ...prev, department: value }))}
            >
              <SelectTrigger className="form-input" style={{ height: '46px', padding: '14px 20px', margin: '4px 0' }}>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Select Department</SelectItem>
                {departments.map((dept: any) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="submit"
                className="form-button"
                style={{
                  flex: 1,
                  margin: 0,
                  padding: '14px 10px'
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Sign Up'}
              </button>
              <button
                type="button"
                className="form-button"
                style={{
                  background: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  width: 'auto',
                  padding: '0 20px',
                  fontSize: '11px',
                  height: '46px', // Match height of select inputs/other buttons roughly, or slightly smaller
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={handleClear}
                disabled={isSubmitting}
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Overlay */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <img src={ssLogo} alt="SprintSync" className="w-48 h-48 mb-4 object-contain" />
            <h1 className="overlay-title">Welcome Back!</h1>
            <p className="overlay-text">
              To keep connected with us please login with your personal info
            </p>
            <button
              className="form-button ghost-button"
              onClick={() => setIsPanelActive(false)}
            >
              Sign In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <img src={ssLogo} alt="SprintSync" className="w-48 h-48 mb-4 object-contain" />
            <h1 className="overlay-title">Hello, Friend!</h1>
            <p className="overlay-text">
              Enter your personal details and start your journey with SprintSync
            </p>
            <button
              className="form-button ghost-button"
              onClick={() => setIsPanelActive(true)}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
      {createPortal(
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 2147483647,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '9999px',
          padding: '10px 20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          cursor: 'default',
          pointerEvents: 'auto'
        }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginRight: '8px' }}>Crafted by</span>
          <span style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#059669',
            opacity: fadeOpacity,
            transition: 'opacity 0.5s ease-in-out',
            minWidth: '120px' // Prevent layout jump
          }}>
            {creators[currentCreatorIndex]}
          </span>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LoginForm;
