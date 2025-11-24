import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContextEnhanced';
import LoginForm from './components/LoginForm';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { SidebarProvider, SidebarInset, SidebarTrigger } from './components/ui/sidebar';
import { Separator } from './components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './components/ui/breadcrumb';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AppSidebar from './components/AppSidebar';
import NotificationDropdown from './components/NotificationDropdown';
import { Toaster } from './components/ui/sonner';
import { Brain, Sparkles, ChevronRight } from 'lucide-react';
import sprintSyncLogo from 'figma:asset/aadf192e83d08c7cc03896c06b452017e84d04aa.png';
import PageTransition from './components/PageTransition';

// Import page components
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import BacklogPage from './pages/BacklogPage';
import ScrumPage from './pages/ScrumPage';
import TimeTrackingPage from './pages/TimeTrackingPage';
import AIInsightsPage from './pages/AIInsightsPage';
import TeamAllocationPage from './pages/TeamAllocationPage';
import ReportsPage from './pages/ReportsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import TodoListPage from './pages/TodoListPage';
import RegistrationPage from './pages/RegistrationPage';

// Import API integration components
// import ApiIntegrationDemo from './components/ApiIntegrationDemo';
// import ApiStatusChecker from './components/ApiStatusChecker';
// import ApiTestComponent from './components/ApiTestComponent';

// Route Protection Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[]; 
  requiredRoute?: string;
}> = ({ children, allowedRoles, requiredRoute }) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // If no role restrictions, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }
  
  // Check if user's role is in allowed roles
  if (user) {
    const normalizedUserRole = (user.role || '').toLowerCase();
    const normalizedAllowed = allowedRoles.map(r => (r || '').toLowerCase());
    if (normalizedAllowed.includes(normalizedUserRole)) {
      return <>{children}</>;
    }
  }
  
  // If user doesn't have access, redirect to dashboard
  return <Navigate to="/" replace state={{ from: location }} />;
};

const AppContent: React.FC = () => {
  const { user, isLoading, loginError, setAuthState } = useAuth();
  const { navigationState, navigateTo } = useNavigation();
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure users are redirected to dashboard after login
  // This effect runs when user state changes (after login)
  useEffect(() => {
    // If user is logged in and navigates to an invalid route, redirect to dashboard
    // This ensures all users always land on dashboard after login
    if (user) {
      // If somehow user lands on a non-existent route, redirect to dashboard
      const validRoutes = ['/', '/projects', '/backlog', '/scrum', '/time-tracking', 
                          '/ai-insights', '/team-allocation', '/reports', '/profile', 
                          '/admin-panel', '/todo-list'];
      const isValidRoute = validRoutes.includes(location.pathname) || 
                          location.pathname.startsWith('/projects/');
      
      if (!isValidRoute && location.pathname !== '/') {
        navigate('/');
      }
      
      // Prefetch projects when navigating to dashboard for faster loading
      if (location.pathname === '/' && user.id) {
        import('./hooks/api/useProjects').then(({ prefetchProjects }) => {
          prefetchProjects(user.id).catch(() => {
            // Silently fail - projects will be fetched by hook
          });
        });
      }
    }
  }, [user, location.pathname, navigate]);

  // Get page title and description based on route
  const getPageInfo = (path: string) => {
    const routes: { [key: string]: { title: string; description: string; icon: string } } = {
      '/': { title: 'Dashboard', description: 'Project overview and insights', icon: '📊' },
      '/projects': { title: 'Projects', description: 'Manage your project portfolio', icon: '📁' },
      '/scrum': { title: 'Scrum Management', description: 'Sprint planning and tracking', icon: '🏃' },
      '/time-tracking': { title: 'Time Tracking', description: 'Monitor work hours and productivity', icon: '⏱️' },
      '/ai-insights': { title: 'AI Insights', description: 'Intelligent project analytics', icon: '🧠' },
      '/team-allocation': { title: 'Team Allocation', description: 'Resource management and planning', icon: '👥' },
      '/reports': { title: 'Reports', description: 'Performance metrics and analytics', icon: '📈' },
      '/profile': { title: 'Profile', description: 'Your account settings', icon: '👤' },
      '/admin-panel': { title: 'Admin Panel', description: 'System administration', icon: '⚙️' },
      '/todo-list': { title: 'Todo List', description: 'Personal task management', icon: '✅' },
      // '/api-demo': { title: 'API Demo', description: 'Interactive API integration showcase', icon: '🔌' },
      // '/api-status': { title: 'API Status', description: 'Monitor API health and connectivity', icon: '📡' },
      // '/api-test': { title: 'API Test', description: 'Test and validate API endpoints', icon: '🧪' }
    };
    
    const routeInfo = routes[path] || routes['/'];
    return routeInfo;
  };

  // Helper function to check route access based on role
  const hasRouteAccess = (path: string, role: string): boolean => {
    const roleAccess: { [key: string]: string[] } = {
      admin: ['/', '/projects', '/team-allocation', '/reports', '/profile', '/admin-panel'],
      manager: ['/', '/projects', '/scrum', '/time-tracking', '/ai-insights', '/team-allocation', '/reports', '/profile', '/todo-list'],
      developer: ['/', '/projects', '/scrum', '/time-tracking', '/ai-insights', '/reports', '/profile', '/todo-list'], // Removed team-allocation for developers
      qa: ['/', '/projects', '/scrum', '/time-tracking', '/ai-insights', '/team-allocation', '/reports', '/profile', '/todo-list'] // QA has manager-level access including team-allocation
    };
    
    return roleAccess[role]?.includes(path) || false;
  };

  // Handle AI Insights button click
  const handleAIInsightsClick = () => {
    if (user && hasRouteAccess('/ai-insights', user.role)) {
      navigate('/ai-insights');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-cyan-50">
        <div className="space-y-6 text-center max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src={sprintSyncLogo} 
                alt="SprintSync" 
                className="w-20 h-20 object-contain animate-pulse"
              />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-6 h-6 text-cyan-500 animate-sparkle" />
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-cyan-400 border-b-transparent rounded-full animate-spin mx-auto my-auto opacity-60" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-medium text-green-600">SprintSync</h3>
            <p className="text-muted-foreground">Initializing your agile workspace...</p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-cyan-50">
            <div className="w-full max-w-md p-6">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <img 
                    src={sprintSyncLogo} 
                    alt="SprintSync" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold text-green-600">SprintSync</h1>
                <p className="text-muted-foreground">Your Agile Project Management Solution</p>
              </div>
              
              <LoginForm
                onLoginSuccess={(token, userData) => {
                  console.log('Login successful from LoginForm - Token:', token);
                  console.log('Login successful from LoginForm - User:', userData);
                  
                  // Directly set the auth state with the received data
                  setAuthState(token, userData);
                  console.log('Auth state updated successfully');
                  
                  // Redirect to dashboard after successful login (for all users)
                  // Use setTimeout to ensure state is updated before navigation
                  setTimeout(() => {
                    navigate('/');
                  }, 100);
                }}
                onLoginError={(error) => {
                  console.error('Login failed from LoginForm:', error);
                  // The AuthContext will handle the error state
                }}
                isLoading={isLoading}
              />
              
              {loginError && (
                <div className="mt-4">
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {loginError}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        } />
      </Routes>
    );
  }

  const firstName = user?.name?.split(' ')[0] || 'User';
  const pageInfo = getPageInfo(location.pathname);

  // Get role color for badges
  const getRoleColor = (role: string) => {
    switch (role) {
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="sidebar-contained">
        {/* Enhanced Header */}
        <header className="sidebar-inset-header flex h-16 shrink-0 items-center gap-2 border-b bg-gradient-to-r from-white via-green-50/40 to-cyan-50/40 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
          <div className="flex items-center gap-3 px-4">
            <SidebarTrigger className="-ml-1 hover:bg-green-100/50 transition-colors" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            
            {/* Enhanced Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink 
                    href="/"
                    onClick={(e) => {
                      e.preventDefault();
                      try {
                        if (navigateTo) {
                          navigateTo('dashboard');
                        } else {
                          navigate('/');
                        }
                      } catch (error) {
                        console.error('Navigation error:', error);
                        navigate('/');
                      }
                    }}
                    className="flex items-center space-x-2 hover:text-green-600 transition-colors group cursor-pointer"
                    title="Go to Dashboard"
                  >
                    <div className="relative">
                      <img 
                        src={sprintSyncLogo} 
                        alt="SprintSync" 
                        className="w-5 h-5 object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <span className="font-medium">SprintSync</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="flex items-center space-x-2 font-medium">
                    <span className="text-lg">{pageInfo.icon}</span>
                    <span>{pageInfo.title}</span>
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* Enhanced Welcome Section */}
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="hidden lg:flex flex-col items-center text-center max-w-md">
              <div className="flex items-center space-x-3 mb-1">
                <span className="text-sm text-muted-foreground">Welcome back,</span>
                <span className="font-medium text-green-600">{firstName}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getRoleColor(user.role)}`}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-xs text-muted-foreground">{pageInfo.description}</p>
            </div>
            
            {/* Mobile Welcome */}
            <div className="lg:hidden flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Hi,</span>
              <span className="font-medium text-green-600">{firstName}</span>
              <Badge 
                variant="outline" 
                className={`text-xs ${getRoleColor(user.role)}`}
              >
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Badge>
            </div>
          </div>
          
          {/* Enhanced Header Actions */}
          <div className="flex items-center space-x-3 px-4">
            {/* Enhanced AI Insights Button - Now functional */}
            {user && hasRouteAccess('/ai-insights', user.role) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-green-50 to-cyan-50 border-green-200 hover:from-green-100 hover:to-cyan-100 transition-all duration-200 shadow-sm hover:shadow-md group"
                onClick={handleAIInsightsClick}
              >
                <Brain className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium">AI Insights</span>
                <Badge 
                  variant="secondary" 
                  className="bg-green-500 text-white text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center animate-pulse"
                >
                  3
                </Badge>
                <Sparkles className="w-3 h-3 text-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              </Button>
            )}
            
            <NotificationDropdown />
          </div>
        </header>

        {/* Enhanced Main Content */}
        <main className="flex-1 flex flex-col bg-gradient-to-br from-white via-green-50/30 to-cyan-50/30 min-h-0 relative">
          <div className="flex-shrink-0 px-6 pt-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{pageInfo.icon}</span>
                  <h1 className="text-2xl font-semibold text-green-600">{pageInfo.title}</h1>
                </div>
                <p className="text-muted-foreground">{pageInfo.description}</p>
              </div>
              
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-white/50 px-3 py-2 rounded-lg border">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live Updates</span>
                </div>
              </div>
            </div>
          </div>

          {/* Route Content - Uses remaining space */}
          <div className="flex-1 min-h-0 px-6 pb-6">
            <PageTransition>
                  <Routes>
                    {/* Dashboard - accessible by all roles */}
                    <Route path="/" element={<Dashboard />} />
                    
                    {/* Projects - accessible by admin, manager, qa (not developers) */}
                    <Route path="/projects" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'qa']}>
                        <ProjectsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/projects/:id" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'qa']}>
                        <ProjectDetailsPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Backlog - accessible by all roles */}
                    <Route path="/backlog" element={<BacklogPage />} />
                    
                    {/* Scrum Management - accessible by manager, developer, designer */}
                    <Route path="/scrum" element={
                      <ProtectedRoute allowedRoles={['manager', 'developer', 'qa']}>
                        <ScrumPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Time Tracking - accessible by manager, developer, designer */}
                    <Route path="/time-tracking" element={
                      <ProtectedRoute allowedRoles={['manager', 'developer', 'qa']}>
                        <TimeTrackingPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* AI Insights - accessible by manager, developer, designer */}
                    <Route path="/ai-insights" element={
                      <ProtectedRoute allowedRoles={['manager', 'developer', 'qa']}>
                        <AIInsightsPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Team Allocation - accessible by admin, manager, and qa (qa has manager-level access) */}
                    <Route path="/team-allocation" element={
                      <ProtectedRoute allowedRoles={['admin', 'manager', 'qa']}>
                        <TeamAllocationPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Reports - accessible by all roles */}
                    <Route path="/reports" element={<ReportsPage />} />
                    
                    {/* Profile - accessible by all roles */}
                    <Route path="/profile" element={<ProfilePage />} />
                    
                    {/* Admin Panel - accessible by admin only */}
                    <Route path="/admin-panel" element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminPanelPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Todo List - accessible by manager, developer, designer */}
                    <Route path="/todo-list" element={
                      <ProtectedRoute allowedRoles={['manager', 'developer', 'qa']}>
                        <TodoListPage />
                      </ProtectedRoute>
                    } />
                    
                    {/* Catch-all route for preview and other unmatched paths */}
                    <Route path="*" element={<Dashboard />} />
                  </Routes>
            </PageTransition>
          </div>
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <NavigationProvider>
          <AppContent />
        </NavigationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;