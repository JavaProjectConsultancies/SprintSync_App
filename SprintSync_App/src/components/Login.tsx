import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContextEnhanced';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Users, 
  Lock, 
  Mail, 
  Target, 
  Sparkles, 
  Eye, 
  EyeOff,
  ArrowLeft,
  UserPlus,
  Shield,
  Settings,
  Palette,
  Code,
  Building,
  Briefcase
} from 'lucide-react';
import sprintSyncLogo from '../assets/aadf192e83d08c7cc03896c06b452017e84d04aa.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('developer');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [domain, setDomain] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isSignUpMode) {
      // Handle sign up
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }
      // For demo, just switch to login mode
      setIsSignUpMode(false);
      setError('');
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid credentials. Please check your email and password.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('demo123');
    setIsSignUpMode(false);
  };

  const demoAccounts = [
    { 
      email: 'admin@demo.com', 
      role: 'Admin', 
      name: 'Arjun Sharma', 
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: Shield,
      description: 'Dashboard, Projects, Team, Reports'
    },
    { 
      email: 'priya@demo.com', 
      role: 'Manager', 
      name: 'Priya Mehta', 
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Settings,
      description: 'Full access to all features'
    },
    { 
      email: 'rohit@demo.com', 
      role: 'Developer', 
      name: 'Rohit Kumar', 
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: Code,
      description: 'All except admin panel'
    },
    { 
      email: 'sneha@demo.com', 
      role: 'Designer', 
      name: 'Sneha Patel', 
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Palette,
      description: 'All except admin panel'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-cyan-50 p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-green-200 to-cyan-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/4 -left-8 w-32 h-32 bg-gradient-to-br from-cyan-200 to-green-200 rounded-full opacity-15 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-16 h-16 bg-gradient-to-br from-green-300 to-cyan-300 rounded-full opacity-25 animate-pulse delay-2000"></div>
      </div>

      <div className="w-full max-w-lg space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <img 
                src={sprintSyncLogo} 
                alt="SprintSync Logo" 
                className="w-14 h-14 object-contain"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-green-600">
                SprintSync
              </h1>
              <div className="flex items-center justify-center space-x-1 text-sm text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-lg mb-16">
            AI-Powered Agile Project Management
          </p>
          <p className="text-sm text-muted-foreground">
            Built for modern Indian enterprises
          </p>
        </div>

        {/* Main Auth Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              {isSignUpMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSignUpMode(false)}
                  className="absolute left-4 top-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <span>{isSignUpMode ? 'Create Account' : 'Sign In'}</span>
            </CardTitle>
            <CardDescription>
              {isSignUpMode 
                ? 'Join SprintSync to manage your agile projects'
                : 'Enter your credentials to access your dashboard'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUpMode && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                      placeholder="Arjun Kumar Sharma"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder={isSignUpMode ? "arjun.sharma@company.com" : "Enter your email"}
                    required
                  />
                </div>
              </div>

              {isSignUpMode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      required
                    >
                      <option value="developer">Developer</option>
                      <option value="designer">Designer</option>
                      <option value="manager">Project Manager</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department/Project</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background"
                        required
                      >
                        <option value="">Select Department/Project</option>
                        <option value="VNIT">VNIT</option>
                        <option value="Dinshaw">Dinshaw</option>
                        <option value="Hospy">Hospy</option>
                        <option value="Pharma">Pharma</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain/Specialization</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <select
                        id="domain"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background"
                        required
                      >
                        <option value="">Select Domain/Specialization</option>
                        <option value="Angular">Angular</option>
                        <option value="Java">Java</option>
                        <option value="Maui">Maui</option>
                        <option value="Testing">Testing</option>
                        <option value="Implementation">Implementation</option>
                        <option value="Database">Database</option>
                        <option value="Marketing">Marketing</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isSignUpMode && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white shadow-lg" 
                disabled={isLoading}
              >
                {isLoading ? (
                  'Processing...'
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    {isSignUpMode ? <UserPlus className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                    <span>{isSignUpMode ? 'Create Account' : 'Sign In'}</span>
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsSignUpMode(!isSignUpMode)}
                className="text-sm"
              >
                {isSignUpMode 
                  ? "Already have an account? Sign in here"
                  : "Don't have an account? Create one here"
                }
              </Button>
            </div>
          </CardContent>
        </Card>


        {/* Footer */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            © 2025 SprintSync. Built for modern Indian enterprises.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </span>
            <span className="flex items-center space-x-1">
              <Target className="w-3 h-3" />
              <span>Scalable</span>
            </span>
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>AI-Powered</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;