import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { authApiService, LoginRequest } from '../services/api/authApi';

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
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      console.log('Attempting login with:', { email: formData.email });
      
      const response = await authApiService.login(formData);
      
      if (response.success && response.data) {
        console.log('Login successful:', response.data);
        console.log('Data keys:', Object.keys(response.data));
        console.log('Full data object:', JSON.stringify(response.data, null, 2));
        
        // Access the nested data structure
        const authData = response.data.data || response.data;
        const token = authData.token || authData.accessToken || authData.access_token;
        const user = authData.user || authData.userData;
        
        console.log('Extracted token:', token);
        console.log('Extracted user:', user);
        
        if (token && user) {
          onLoginSuccess(token, user);
        } else {
          throw new Error('Token or user data missing from response');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.status === 401) {
        errorMessage = 'Invalid email or password.';
      } else if (error.status === 403) {
        errorMessage = 'Account is disabled. Please contact administrator.';
      } else if (error.status === 404) {
        errorMessage = 'User not found. Please check your email.';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      onLoginError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const demoLogin = (role: 'admin' | 'manager' | 'developer' | 'qa') => {
    const demoCredentials = {
      admin: { email: 'admin@demo.com', password: 'admin123' },
      manager: { email: 'manager@demo.com', password: 'manager123' },
      developer: { email: 'developer@demo.com', password: 'dev123' },
      qa: { email: 'qa@demo.com', password: 'qa123' },
    };

    setFormData(demoCredentials[role]);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access SprintSync
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                disabled={isSubmitting || isLoading}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                disabled={isSubmitting || isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting || isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or try demo accounts
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => demoLogin('admin')}
            disabled={isSubmitting || isLoading}
          >
            <User className="mr-1 h-3 w-3" />
            Admin
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => demoLogin('manager')}
            disabled={isSubmitting || isLoading}
          >
            <User className="mr-1 h-3 w-3" />
            Manager
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => demoLogin('developer')}
            disabled={isSubmitting || isLoading}
          >
            <User className="mr-1 h-3 w-3" />
            Developer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => demoLogin('qa')}
            disabled={isSubmitting || isLoading}
          >
            <User className="mr-1 h-3 w-3" />
            QA
          </Button>
        </div>

        {/* Footer Link */}
        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account? </span>
          <Button
            variant="link"
            onClick={() => navigate('/register')}
            className="p-0 text-green-600 hover:text-green-700 h-auto"
            disabled={isSubmitting || isLoading}
          >
            Create Account
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
