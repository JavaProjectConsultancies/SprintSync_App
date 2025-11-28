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
  UserPlus,
  Shield,
  Settings,
  Palette,
  Code,
  Building,
  Briefcase,
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import sprintSyncLogo from '../assets/aadf192e83d08c7cc03896c06b452017e84d04aa.png';
import { useDomains } from '../hooks/api/useDomains';

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
  const { data: domainsData } = useDomains();
  const domains = Array.isArray(domainsData) ? domainsData : [];

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

  const featureStats = [
    { 
      label: 'Teams', 
      value: '120+', 
      icon: Users, 
      subtext: 'Collaborating daily',
      gradient: 'from-emerald-50/90 via-white to-cyan-50/70',
      accent: 'text-emerald-600',
      iconBg: 'bg-emerald-100/80'
    },
    { 
      label: 'Sprints shipped', 
      value: '2.8K', 
      icon: Target, 
      subtext: 'This quarter',
      gradient: 'from-cyan-50/90 via-white to-teal-50/70',
      accent: 'text-cyan-600',
      iconBg: 'bg-cyan-100/80'
    },
    { 
      label: 'Automation saves', 
      value: '14 hrs', 
      icon: TrendingUp, 
      subtext: 'Per manager / week',
      gradient: 'from-teal-50/90 via-white to-emerald-50/70',
      accent: 'text-teal-600',
      iconBg: 'bg-teal-100/80'
    },
  ];

  const workflowHighlights = [
    { title: 'AI Sprint Planning', description: 'Let SprintSync suggest optimal backlogs with story sizing intelligence.', icon: Sparkles, color: 'text-green-600' },
    { title: 'Live Timeline', description: 'Real-time burndown, blockers and utilization to keep everyone aligned.', icon: BarChart3, color: 'text-cyan-600' },
    { title: 'Enterprise Ready', description: 'Bank-grade security with SSO, audit logs and domain-based access.', icon: Shield, color: 'text-emerald-600' },
  ];

  const signupSteps = [
    { title: 'Team profile', icon: Users },
    { title: 'Work preferences', icon: Calendar },
    { title: 'Security setup', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),transparent_55%)] opacity-80 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(16,185,129,0.08) 25%,transparent 25%,transparent 50%,rgba(6,182,212,0.08) 50%,rgba(6,182,212,0.08) 75%,transparent 75%)] bg-[length:22px_22px] mix-blend-multiply opacity-20 pointer-events-none"></div>
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -top-12 -right-12 w-72 h-72 bg-gradient-to-br from-green-200 to-cyan-200 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-16 w-64 h-64 bg-gradient-to-br from-cyan-200 to-green-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-gradient-to-br from-green-300 to-cyan-200 rounded-full blur-3xl opacity-70"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-10 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Inspiration Panel */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-lg border border-white/60 flex flex-col justify-between space-y-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <img src={sprintSyncLogo} alt="SprintSync logo" className="h-14 w-14 rounded-2xl border border-emerald-100 shadow-inner" />
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-emerald-500">SprintSync</p>
                  <h1 className="text-3xl lg:text-4xl font-semibold text-slate-900 leading-tight">Your Agile Success Command Center</h1>
                  <p className="text-slate-500 mt-1 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Powered by AI &amp; Indian product craftsmanship</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {featureStats.map((item) => (
                  <div 
                    key={item.label} 
                    className={`rounded-2xl border border-white/70 bg-gradient-to-br ${item.gradient} p-4 shadow-lg shadow-emerald-100/40`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center mb-3`}>
                      <item.icon className={`w-4 h-4 ${item.accent}`} />
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
                    <p className={`text-xs uppercase tracking-wide ${item.accent}`}>{item.label}</p>
                    <p className="text-xs mt-1 text-slate-400">{item.subtext}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Why teams pick SprintSync</p>
                <div className="space-y-3">
                  {workflowHighlights.map((feature) => (
                    <div key={feature.title} className="flex items-start space-x-3 rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <feature.icon className={`w-4 h-4 ${feature.color}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{feature.title}</p>
                        <p className="text-sm text-slate-500">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-5 shadow-lg">
              <p className="text-sm uppercase tracking-[0.4em] mb-2 text-white/80">Customer Story</p>
              <p className="text-lg font-medium leading-relaxed">“SprintSync helped our 35-member team reduce stand-up confusion and improved release predictability by 42% within two sprints.”</p>
              <div className="mt-3 flex items-center space-x-3 text-sm">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-semibold">AP</div>
                <div>
                  <p>Akshita Patel</p>
                  <p className="text-white/70 text-xs">Program Manager, MicroPro</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Card */}
          <Card className="border-0 bg-white/90 backdrop-blur-xl shadow-2xl rounded-[26px]">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.4em] text-emerald-500">{isSignUpMode ? 'Welcome to the tribe' : 'Happy to see you again'}</p>
                  <CardTitle className="text-2xl">{isSignUpMode ? 'Create your SprintSync account' : 'Sign in to SprintSync'}</CardTitle>
                  <CardDescription className="text-sm text-slate-500">
                    {isSignUpMode 
                      ? 'Set up your workspace in under 2 minutes.'
                      : 'Secure access to your dashboards, boards & releases.'
                    }
                  </CardDescription>
                </div>
                <div className="bg-emerald-50 text-emerald-600 text-xs px-3 py-1 rounded-full font-medium">
                  v2.6 Nimbus
                </div>
              </div>

              <div className="flex items-center bg-slate-100 rounded-full p-1 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(false)}
                  className={`flex-1 py-2 rounded-full transition ${!isSignUpMode ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(true)}
                  className={`flex-1 py-2 rounded-full transition ${isSignUpMode ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                >
                  Create Account
                </button>
              </div>

              {isSignUpMode && (
                <div className="flex items-center text-xs text-slate-500 space-x-2">
                  {signupSteps.map((step, index) => (
                    <React.Fragment key={step.title}>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full border border-emerald-200 flex items-center justify-center text-emerald-600 bg-white">
                          <step.icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium text-slate-600">{step.title}</span>
                      </div>
                      {index < signupSteps.length - 1 && <span className="text-slate-300">—</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUpMode && (
                <div className="grid gap-4 md:grid-cols-2">
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

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <div className="relative">
                      <Settings className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                        required
                      >
                        <option value="developer">Developer</option>
                        <option value="designer">Designer</option>
                        <option value="manager">Project Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
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
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department / Project</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <select
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                        required
                      >
                        <option value="">Select Department/Project</option>
                        <option value="ERP & Strategic Technology">ERP & Strategic Technology</option>
                        <option value="HIMS & Pharma ZIP">HIMS & Pharma ZIP</option>
                        <option value="Pharma Old">Pharma Old</option>
                        <option value="Infrastructure Management">Infrastructure Management</option>
                        <option value="Implementation">Implementation</option>
                        <option value="Administration">Administration</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain / Specialization</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <select
                        id="domain"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                        required
                      >
                        <option value="">Select Domain/Specialization</option>
                        {domains.map((domainItem) => (
                          <option key={domainItem.id} value={domainItem.id}>
                            {domainItem.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
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
              {!isSignUpMode && (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="remember" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-200" />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <button type="button" className="text-emerald-600 hover:underline">Forgot password?</button>
                </div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:shadow-xl hover:-translate-y-0.5 transition-all border-0 text-white font-medium" 
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

            <div className="mt-8 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Need a quick tour?</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoLogin(account.email)}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left shadow-sm hover:border-emerald-200 hover:-translate-y-0.5 transition-all"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{account.name}</p>
                      <p className="text-xs text-slate-500">{account.role}</p>
                    </div>
                    <account.icon className="w-4 h-4 text-emerald-500" />
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

        <div className="mt-10 text-center text-xs text-slate-500">
          <div className="flex items-center justify-center space-x-4">
            <span className="flex items-center space-x-1">
              <Shield className="w-3 h-3" />
              <span>Bank-grade security</span>
            </span>
            <span className="flex items-center space-x-1">
              <Target className="w-3 h-3" />
              <span>99.9% uptime SLA</span>
            </span>
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Made in India</span>
            </span>
          </div>
          <p className="mt-3">© {new Date().getFullYear()} SprintSync. Designed for agile enterprises.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;