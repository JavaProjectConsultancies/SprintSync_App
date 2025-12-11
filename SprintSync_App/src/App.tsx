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
import { Sparkles, ChevronRight } from 'lucide-react';
import sprintSyncLogo from './assets/aadf192e83d08c7cc03896c06b452017e84d04aa.png';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AppSidebar from './components/AppSidebar';
import NotificationDropdown from './components/NotificationDropdown';
import { Toaster } from './components/ui/sonner';
import PageTransition from './components/PageTransition';

// Import page components
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import BacklogPage from './pages/BacklogPage';
import ScrumPage from './pages/ScrumPage';
import TimeTrackingPage from './pages/TimeTrackingPage';
import TeamAllocationPage from './pages/TeamAllocationPage';
// ReportsPage removed from routes (hidden)
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
        '/team-allocation', '/profile',
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
      '/team-allocation': { title: 'Team Allocation', description: 'Resource management and planning', icon: '👥' },
      // '/reports' intentionally hidden from UI
      '/profile': { title: 'Profile', description: 'Your account settings', icon: '👤' },
      '/admin-panel': { title: 'Admin Panel', description: 'System administration', icon: '⚙️' },
      '/todo-list': { title: 'My Tasks', description: 'Personal task management', icon: '✅' },
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
      admin: ['/', '/projects', '/team-allocation', '/profile', '/admin-panel'],
      manager: ['/', '/projects', '/scrum', '/time-tracking', '/team-allocation', '/profile', '/todo-list'],
      developer: ['/', '/projects', '/scrum', '/time-tracking', '/profile', '/todo-list'], // Removed team-allocation for developers
    };

    return roleAccess[role]?.includes(path) || false;
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
          <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50/30 to-white p-8 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {/* Floating Gradient Orbs */}
              <div className="absolute top-20 left-[10%] w-64 h-64 bg-gradient-to-br from-green-300/20 to-emerald-200/10 rounded-full blur-3xl animate-float-slow"></div>
              <div className="absolute bottom-32 right-[15%] w-80 h-80 bg-gradient-to-tl from-emerald-300/20 to-green-200/10 rounded-full blur-3xl animate-float-delayed"></div>
              <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-gradient-to-r from-green-200/15 to-white/20 rounded-full blur-2xl animate-float"></div>

              {/* Floating Particles */}
              <div className="absolute top-[20%] left-[20%] w-2 h-2 bg-green-400/30 rounded-full animate-particle-1"></div>
              <div className="absolute top-[60%] left-[80%] w-3 h-3 bg-emerald-400/25 rounded-full animate-particle-2"></div>
              <div className="absolute top-[40%] right-[25%] w-2 h-2 bg-green-300/35 rounded-full animate-particle-3"></div>
              <div className="absolute bottom-[30%] left-[70%] w-2.5 h-2.5 bg-emerald-300/30 rounded-full animate-particle-4"></div>
              <div className="absolute top-[75%] left-[15%] w-2 h-2 bg-green-400/25 rounded-full animate-particle-5"></div>
            </div>

            <style>{`
              @keyframes float {
                0%, 100% { 
                  transform: translate(0, 0) scale(1);
                  opacity: 1;
                }
                33% { 
                  transform: translate(-30px, -30px) scale(1.05);
                  opacity: 0.8;
                }
                66% { 
                  transform: translate(20px, 15px) scale(0.95);
                  opacity: 0.9;
                }
              }

              @keyframes float-delayed {
                0%, 100% { 
                  transform: translate(0, 0) scale(1);
                  opacity: 1;
                }
                33% { 
                  transform: translate(25px, -35px) scale(0.98);
                  opacity: 0.85;
                }
                66% { 
                  transform: translate(-20px, 20px) scale(1.02);
                  opacity: 0.95;
                }
              }

              @keyframes float-slow {
                0%, 100% { 
                  transform: translate(0, 0) rotate(0deg);
                  opacity: 0.6;
                }
                50% { 
                  transform: translate(40px, -40px) rotate(180deg);
                  opacity: 0.8;
                }
              }

              @keyframes particle-1 {
                0%, 100% { transform: translate(0, 0); opacity: 0.3; }
                50% { transform: translate(-40px, -80px); opacity: 0.7; }
              }

              @keyframes particle-2 {
                0%, 100% { transform: translate(0, 0); opacity: 0.25; }
                50% { transform: translate(60px, -100px); opacity: 0.6; }
              }

              @keyframes particle-3 {
                0%, 100% { transform: translate(0, 0); opacity: 0.35; }
                50% { transform: translate(-50px, 90px); opacity: 0.8; }
              }

              @keyframes particle-4 {
                0%, 100% { transform: translate(0, 0); opacity: 0.3; }
                50% { transform: translate(70px, -60px); opacity: 0.65; }
              }

              @keyframes particle-5 {
                0%, 100% { transform: translate(0, 0); opacity: 0.25; }
                50% { transform: translate(-30px, -70px); opacity: 0.7; }
              }

              @keyframes logo-pulse {
                0%, 100% { 
                  transform: scale(1);
                  filter: drop-shadow(0 0 0px rgba(16, 185, 129, 0));
                }
                50% { 
                  transform: scale(1.05);
                  filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.3));
                }
              }

              @keyframes fade-in-up {
                from {
                  opacity: 0;
                  transform: translateY(30px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }

              @keyframes scale-in {
                from {
                  opacity: 0;
                  transform: scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }

              .animate-float {
                animation: float 25s ease-in-out infinite;
              }

              .animate-float-delayed {
                animation: float-delayed 30s ease-in-out infinite;
              }

              .animate-float-slow {
                animation: float-slow 35s ease-in-out infinite;
              }

              .animate-particle-1 {
                animation: particle-1 15s ease-in-out infinite;
              }

              .animate-particle-2 {
                animation: particle-2 18s ease-in-out infinite;
              }

              .animate-particle-3 {
                animation: particle-3 20s ease-in-out infinite;
              }

              .animate-particle-4 {
                animation: particle-4 22s ease-in-out infinite;
              }

              .animate-particle-5 {
                animation: particle-5 17s ease-in-out infinite;
              }

              .animate-logo-pulse {
                animation: logo-pulse 3s ease-in-out infinite;
              }

              .animate-fade-in-up {
                animation: fade-in-up 0.8s ease-out forwards;
              }

              .animate-scale-in {
                animation: scale-in 0.6s ease-out forwards;
              }
            `}</style>

            {/* Logo and Title */}
            <div className="text-center mb-8 animate-fade-in-up relative z-10">
              <div className="flex justify-center mb-4">
                <img
                  src={sprintSyncLogo}
                  alt="SprintSync"
                  className="w-32 h-32 object-contain animate-logo-pulse"
                />
              </div>
            </div>

            {/* Sliding Container */}
            <div className="sliding-container animate-scale-in relative z-10" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <style>{`
                .sliding-container {
                  background-color: #fff;
                  border-radius: 16px;
                  box-shadow: 0 14px 28px rgba(16, 185, 129, 0.15), 
                          0 10px 10px rgba(16, 185, 129, 0.1);
                  position: relative;
                  overflow: hidden;
                  width: 850px;
                  max-width: 100%;
                  min-height: 550px;
                }

                .form-container {
                  position: absolute;
                  top: 0;
                  height: 100%;
                  transition: all 0.6s ease-in-out;
                }

                .sign-in-container {
                  left: 0;
                  width: 50%;
                  z-index: 2;
                }

                .sliding-container.right-panel-active .sign-in-container {
                  transform: translateX(100%);
                }

                .sign-up-container {
                  left: 0;
                  width: 50%;
                  opacity: 0;
                  z-index: 1;
                }

                .sliding-container.right-panel-active .sign-up-container {
                  transform: translateX(100%);
                  opacity: 1;
                  z-index: 5;
                  animation: show 0.6s;
                }

                @keyframes show {
                  0%, 49.99% {
                    opacity: 0;
                    z-index: 1;
                  }
                  50%, 100% {
                    opacity: 1;
                    z-index: 5;
                  }
                }

                .overlay-container {
                  position: absolute;
                  top: 0;
                  left: 50%;
                  width: 50%;
                  height: 100%;
                  overflow: hidden;
                  transition: transform 0.6s ease-in-out;
                  z-index: 100;
                }

                .sliding-container.right-panel-active .overlay-container {
                  transform: translateX(-100%);
                }

                .overlay {
                  background: linear-gradient(135deg, #10b981 0%, #34d399 50%, #a7f3d0 100%);
                  background-size: cover;
                  background-position: 0 0;
                  color: #FFFFFF;
                  position: relative;
                  left: -100%;
                  height: 100%;
                  width: 200%;
                  transform: translateX(0);
                  transition: transform 0.6s ease-in-out;
                }

                .sliding-container.right-panel-active .overlay {
                  transform: translateX(50%);
                }

                .overlay-panel {
                  position: absolute;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-direction: column;
                  padding: 0 40px;
                  text-align: center;
                  top: 0;
                  height: 100%;
                  width: 50%;
                  transform: translateX(0);
                  transition: transform 0.6s ease-in-out;
                }

                .overlay-left {
                  transform: translateX(-20%);
                }

                .sliding-container.right-panel-active .overlay-left {
                  transform: translateX(0);
                }

                .overlay-right {
                  right: 0;
                  transform: translateX(0);
                }

                .sliding-container.right-panel-active .overlay-right {
                  transform: translateX(20%);
                }

                .form-inner {
                  background-color: #FFFFFF;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-direction: column;
                  padding: 0 50px;
                  height: 100%;
                  text-align: center;
                }

                .form-input {
                  background-color: #f0fdf4;
                  border: 1px solid #d1fae5;
                  padding: 14px 20px;
                  margin: 8px 0;
                  width: 100%;
                  border-radius: 8px;
                  font-size: 14px;
                  transition: all 0.3s ease;
                }

                .form-input:focus {
                  outline: none;
                  border-color: #10b981;
                  background-color: #ffffff;
                  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
                }

                .form-button {
                  border-radius: 24px;
                  border: 1px solid #10b981;
                  background: linear-gradient(135deg, #10b981, #059669);
                  color: #FFFFFF;
                  font-size: 13px;
                  font-weight: 600;
                  padding: 14px 50px;
                  letter-spacing: 1px;
                  text-transform: uppercase;
                  transition: all 0.2s ease;
                  cursor: pointer;
                  margin-top: 10px;
                }

                .form-button:hover {
                  background: linear-gradient(135deg, #059669, #047857);
                  transform: translateY(-2px);
                  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
                }

                .form-button:active {
                  transform: scale(0.98);
                }

                .ghost-button {
                  background-color: transparent;
                  border: 2px solid #FFFFFF;
                  color: #FFFFFF;
                }

                .ghost-button:hover {
                  background-color: rgba(255, 255, 255, 0.1);
                }

                .form-title {
                  font-weight: 700;
                  margin: 0 0 20px 0;
                  font-size: 32px;
                  background: linear-gradient(135deg, #10b981, #059669);
                  background-clip: text;
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                }

                .overlay-title {
                  font-weight: 700;
                  margin: 0;
                  font-size: 32px;
                  color: white;
                }

                .overlay-text {
                  font-size: 15px;
                  font-weight: 400;
                  line-height: 22px;
                  letter-spacing: 0.5px;
                  margin: 20px 0 30px;
                }

                .form-label {
                  font-size: 13px;
                  color: #6b7280;
                  margin: 15px 0 5px 0;
                }
              `}</style>

              <LoginForm
                onLoginSuccess={(token, userData) => {
                  setAuthState(token, userData);
                  setTimeout(() => navigate('/'), 100);
                }}
                onLoginError={(error) => {
                  console.error('Login failed:', error);
                }}
                isLoading={isLoading}
              />

              {loginError && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[200] w-full max-w-md px-4">
                  <Alert className="border-red-200 bg-red-50/95 backdrop-blur-sm shadow-lg">
                    <AlertDescription className="text-red-800 text-center">
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
            <NotificationDropdown />
          </div>
        </header>

        {/* Enhanced Main Content */}
        <main className="flex-1 flex flex-col bg-gradient-to-br from-white via-green-50/30 to-cyan-50/30 min-h-0 relative">
          {location.pathname !== '/todo-list' && (
            <div className="flex-shrink-0 px-6 pt-6">
              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                {/* Quick Actions */}
                <div className="hidden md:flex items-center space-x-2">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-white/50 px-3 py-2 rounded-lg border">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live Updates</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Route Content - Uses remaining space */}
          <div className="flex-1 min-h-0 px-6 pb-6">
            <PageTransition>
              <Routes>
                {/* Dashboard - accessible by all roles */}
                <Route path="/" element={<Dashboard />} />

                {/* Projects - accessible by admin, manager (not developers) */}
                <Route path="/projects" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <ProjectsPage />
                  </ProtectedRoute>
                } />
                <Route path="/projects/:id" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <ProjectDetailsPage />
                  </ProtectedRoute>
                } />

                {/* Backlog - accessible by all roles */}
                <Route path="/backlog" element={<BacklogPage />} />

                {/* Scrum Management - accessible by manager, developer */}
                <Route path="/scrum" element={
                  <ProtectedRoute allowedRoles={['manager', 'developer']}>
                    <ScrumPage />
                  </ProtectedRoute>
                } />

                {/* Time Tracking - accessible by manager, developer */}
                <Route path="/time-tracking" element={
                  <ProtectedRoute allowedRoles={['manager', 'developer']}>
                    <TimeTrackingPage />
                  </ProtectedRoute>
                } />

                {/* Team Allocation - accessible by admin, manager */}
                <Route path="/team-allocation" element={
                  <ProtectedRoute allowedRoles={['admin', 'manager']}>
                    <TeamAllocationPage />
                  </ProtectedRoute>
                } />

                {/* Reports - accessible by all roles */}
                {/* Reports route removed: reports page hidden */}

                {/* Profile - accessible by all roles */}
                <Route path="/profile" element={<ProfilePage />} />

                {/* Admin Panel - accessible by admin only */}
                <Route path="/admin-panel" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPanelPage />
                  </ProtectedRoute>
                } />

                {/* Todo List - accessible by manager, developer */}
                <Route path="/todo-list" element={
                  <ProtectedRoute allowedRoles={['manager', 'developer']}>
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