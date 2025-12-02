import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

// Define role permissions directly in this file to avoid import issues
const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['view_projects', 'manage_projects', 'view_team', 'manage_users', 'view_analytics', 'manage_system'],
  manager: ['view_projects', 'manage_projects', 'view_team', 'view_analytics'],
  developer: ['view_projects', 'view_team'],
  qa: ['view_projects', 'manage_projects', 'view_team', 'view_analytics']
};

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccessProject: (projectId: string) => boolean;
  isLoading: boolean;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Comprehensive employee data with Indian names and context - Expanded per domain
const DEMO_USERS: User[] = [
  // Admins - System administrators
  {
    id: '1',
    name: 'Arjun Sharma',
    email: 'admin@demo.com',
    role: 'admin',
    avatar: '/api/placeholder/40/40',
    assignedProjects: [],
    department: 'Administration',
    domain: 'System Administration'
  },
  {
    id: '2',
    name: 'Kavita Singh',
    email: 'kavita.admin@demo.com', 
    role: 'admin',
    avatar: '/api/placeholder/40/40',
    assignedProjects: [],
    department: 'Administration',
    domain: 'Database'
  },

  // Managers - Project managers from different departments
  {
    id: '3',
    name: 'Priya Mehta',
    email: 'priya@demo.com',
    role: 'manager',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-1', 'proj-2'],
    department: 'ERP & Strategic Technology',
    domain: 'Implementation'
  },
  {
    id: '4',
    name: 'Rajesh Gupta',
    email: 'rajesh.manager@demo.com',
    role: 'manager',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-3', 'proj-4'],
    department: 'ERP & Strategic Technology',
    domain: 'Java'
  },
  {
    id: '5',
    name: 'Anita Verma',
    email: 'anita.manager@demo.com',
    role: 'manager',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-5', 'proj-6'],
    department: 'HIMS & Pharma ZIP',
    domain: 'Angular'
  },
  {
    id: '6',
    name: 'Deepak Joshi',
    email: 'deepak.manager@demo.com',
    role: 'manager',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-7', 'proj-8'],
    department: 'Pharma Old',
    domain: 'Testing'
  },

  // Angular Developers - Multiple per domain
  {
    id: '7',
    name: 'Rohit Kumar',
    email: 'rohit@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-1', 'proj-3'],
    department: 'ERP & Strategic Technology',
    domain: 'Angular'
  },
  {
    id: '8',
    name: 'Neha Agarwal',
    email: 'neha.angular@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-5', 'proj-6'],
    department: 'HIMS & Pharma ZIP',
    domain: 'Angular'
  },
  {
    id: '9',
    name: 'Sanjay Reddy',
    email: 'sanjay.angular@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-2', 'proj-4'],
    department: 'ERP & Strategic Technology',
    domain: 'Angular'
  },
  {
    id: '10',
    name: 'Meera Iyer',
    email: 'meera.angular@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-7', 'proj-8'],
    department: 'Pharma Old',
    domain: 'Angular'
  },

  // Java Developers - Multiple per domain
  {
    id: '11',
    name: 'Amit Patel',
    email: 'amit.dev@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-2', 'proj-4'],
    department: 'ERP & Strategic Technology',
    domain: 'Java'
  },
  {
    id: '12',
    name: 'Ravi Sharma',
    email: 'ravi.java@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-1', 'proj-3'],
    department: 'ERP & Strategic Technology',
    domain: 'Java'
  },
  {
    id: '13',
    name: 'Pooja Yadav',
    email: 'pooja.java@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-5', 'proj-7'],
    department: 'HIMS & Pharma ZIP',
    domain: 'Java'
  },
  {
    id: '14',
    name: 'Karthik Nair',
    email: 'karthik.java@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-6', 'proj-8'],
    department: 'Pharma Old',
    domain: 'Java'
  },

  // Maui Developers - Multiple per domain
  {
    id: '15',
    name: 'Vikram Singh',
    email: 'vikram.dev@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-3', 'proj-6'],
    department: 'HIMS & Pharma ZIP',
    domain: 'Maui'
  },
  {
    id: '16',
    name: 'Shreya Kapoor',
    email: 'shreya.maui@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-1', 'proj-5'],
    department: 'ERP & Strategic Technology',
    domain: 'Maui'
  },
  {
    id: '17',
    name: 'Arun Ghosh',
    email: 'arun.maui@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-2', 'proj-7'],
    department: 'ERP & Strategic Technology',
    domain: 'Maui'
  },
  {
    id: '18',
    name: 'Divya Menon',
    email: 'divya.maui@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-4', 'proj-8'],
    department: 'Pharma Old',
    domain: 'Maui'
  },

  // Testing Engineers - Multiple per domain
  {
    id: '19',
    name: 'Ravi Shankar',
    email: 'ravi.test@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-4', 'proj-7'],
    department: 'Pharma Old',
    domain: 'Testing'
  },
  {
    id: '20',
    name: 'Sunita Gupta',
    email: 'sunita.test@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-1', 'proj-2'],
    department: 'ERP & Strategic Technology',
    domain: 'Testing'
  },
  {
    id: '21',
    name: 'Manoj Kumar',
    email: 'manoj.test@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-3', 'proj-5'],
    department: 'ERP & Strategic Technology',
    domain: 'Testing'
  },
  {
    id: '22',
    name: 'Lakshmi Pillai',
    email: 'lakshmi.test@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-6', 'proj-8'],
    department: 'HIMS & Pharma ZIP',
    domain: 'Testing'
  },

  // Implementation Engineers - Multiple per domain
  {
    id: '23',
    name: 'Suresh Bhat',
    email: 'suresh.impl@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-2', 'proj-8'],
    department: 'ERP & Strategic Technology',
    domain: 'Implementation'
  },
  {
    id: '24',
    name: 'Rekha Jain',
    email: 'rekha.impl@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-1', 'proj-4'],
    department: 'ERP & Strategic Technology',
    domain: 'Implementation'
  },
  {
    id: '25',
    name: 'Ashok Reddy',
    email: 'ashok.impl@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-5', 'proj-7'],
    department: 'HIMS & Pharma ZIP',
    domain: 'Implementation'
  },
  {
    id: '26',
    name: 'Geetha Krishnan',
    email: 'geetha.impl@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-3', 'proj-6'],
    department: 'Pharma Old',
    domain: 'Implementation'
  },

  // Database Engineers - Multiple per domain
  {
    id: '27',
    name: 'Vinod Agarwal',
    email: 'vinod.db@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-1', 'proj-5'],
    department: 'ERP & Strategic Technology',
    domain: 'Database'
  },
  {
    id: '28',
    name: 'Radha Sharma',
    email: 'radha.db@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-2', 'proj-6'],
    department: 'ERP & Strategic Technology',
    domain: 'Database'
  },
  {
    id: '29',
    name: 'Ramesh Rao',
    email: 'ramesh.db@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-3', 'proj-7'],
    department: 'HIMS & Pharma ZIP',
    domain: 'Database'
  },
  {
    id: '30',
    name: 'Nandini Joshi',
    email: 'nandini.db@demo.com',
    role: 'developer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-4', 'proj-8'],
    department: 'Pharma Old',
    domain: 'Database'
  },

  // Marketing Professionals - Multiple per domain
  {
    id: '31',
    name: 'Sneha Patel',
    email: 'sneha@demo.com',
    role: 'designer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-1', 'proj-2'],
    department: 'ERP & Strategic Technology',
    domain: 'Marketing'
  },
  {
    id: '32',
    name: 'Aarti Jain',
    email: 'aarti.marketing@demo.com',
    role: 'designer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-3', 'proj-4'],
    department: 'ERP & Strategic Technology',
    domain: 'Marketing'
  },
  {
    id: '33',
    name: 'Kiran Nair',
    email: 'kiran.marketing@demo.com',
    role: 'designer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-5', 'proj-6'],
    department: 'HIMS & Pharma ZIP',
    domain: 'Marketing'
  },
  {
    id: '34',
    name: 'Deepika Shetty',
    email: 'deepika.marketing@demo.com',
    role: 'designer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-7', 'proj-8'],
    department: 'Pharma Old',
    domain: 'Marketing'
  },
  {
    id: '35',
    name: 'Priyanka Verma',
    email: 'priyanka.marketing@demo.com',
    role: 'designer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-1', 'proj-5'],
    department: 'ERP & Strategic Technology',
    domain: 'Marketing'
  },
  {
    id: '36',
    name: 'Ritika Agarwal',
    email: 'ritika.marketing@demo.com',
    role: 'designer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-2', 'proj-7'],
    department: 'ERP & Strategic Technology',
    domain: 'Marketing'
  },

  // HR Professionals - Multiple per domain
  {
    id: '37',
    name: 'Sonia Kapoor',
    email: 'sonia.hr@demo.com',
    role: 'designer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-7', 'proj-8'],
    department: 'Pharma Old',
    domain: 'HR'
  },
  {
    id: '38',
    name: 'Manisha Gupta',
    email: 'manisha.hr@demo.com',
    role: 'designer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-1', 'proj-3'],
    department: 'ERP & Strategic Technology',
    domain: 'HR'
  },
  {
    id: '39',
    name: 'Neelam Singh',
    email: 'neelam.hr@demo.com',
    role: 'designer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-2', 'proj-6'],
    department: 'ERP & Strategic Technology',
    domain: 'HR'
  },
  {
    id: '40',
    name: 'Shweta Reddy',
    email: 'shweta.hr@demo.com',
    role: 'designer',
    avatar: '/api/placeholder/40/40',
    assignedProjects: ['proj-4', 'proj-5'],
    department: 'HIMS & Pharma ZIP',
    domain: 'HR'
  }
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('sprintsync_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('sprintsync_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Demo authentication - use backend-compatible passwords
    const demoUser = DEMO_USERS.find(u => u.email === email);
    
    if (demoUser) {
      // Check password based on user role/email
      let validPassword = false;
      
      if (email === 'admin@demo.com' || email === 'kavita.admin@demo.com') {
        validPassword = password === 'admin123';
      } else if (email.includes('manager') || email === 'priya@demo.com') {
        validPassword = password === 'manager123';
      } else if (email.includes('developer') || email === 'rohit@demo.com') {
        validPassword = password === 'dev123';
      } else if (email.includes('designer') || email === 'designer@demo.com') {
        validPassword = password === 'design123';
      } else if (email.includes('qa') || email === 'qa@demo.com') {
        validPassword = password === 'qa123';
      } else {
        // Fallback for other users - use demo123
        validPassword = password === 'demo123';
      }
      
      if (validPassword) {
        setUser(demoUser);
        localStorage.setItem('sprintsync_user', JSON.stringify(demoUser));
        return true;
      }
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sprintsync_user');
  };

  const hasPermission = (permission: string): boolean => {
    // Early return if no user
    if (!user) {
      return false;
    }

    // Early return if no role
    if (!user.role) {
      return false;
    }

    // Check if ROLE_PERMISSIONS is defined
    if (!ROLE_PERMISSIONS) {
      console.error('ROLE_PERMISSIONS is not defined');
      return false;
    }

    // Get role permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    
    if (!rolePermissions) {
      console.warn(`No permissions found for role: ${user.role}`);
      return false;
    }
    
    return rolePermissions.includes(permission);
  };

  const canAccessProject = (projectId: string): boolean => {
    if (!user) return false;
    
    // Admin and Manager can access all projects
    if (user.role === 'admin' || user.role === 'manager') {
      return true;
    }
    
    // Other roles can only access assigned projects
    return user.assignedProjects?.includes(projectId) || false;
  };

  const getAllUsers = (): User[] => {
    return DEMO_USERS;
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    hasPermission,
    canAccessProject,
    isLoading,
    getAllUsers
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export ROLE_PERMISSIONS for use in other components if needed
export { ROLE_PERMISSIONS };