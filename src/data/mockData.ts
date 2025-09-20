import { Project, Scrum, Sprint, Story, Task, Subtask, Notification, DashboardMetrics, ChartData, Milestone } from '../types';

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'E-Commerce Platform',
    description: 'Full-stack e-commerce platform for Indian market with UPI integration',
    status: 'active',
    progress: 85,
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    teamMembers: ['1', '2', '3'],
    scrums: [],
    createdBy: '1',
    priority: 'high'
  },
  {
    id: 'proj-2',
    name: 'Mobile Banking App',
    description: 'Secure mobile banking application with biometric authentication for Indian users',
    status: 'active',
    progress: 60,
    startDate: '2024-02-01',
    endDate: '2024-08-15',
    teamMembers: ['2', '4'],
    scrums: [],
    createdBy: '2',
    priority: 'critical'
  },
  {
    id: 'proj-3',
    name: 'Corporate Website',
    description: 'Modern corporate website with multi-language support (Hindi/English)',
    status: 'planning',
    progress: 30,
    startDate: '2024-03-01',
    endDate: '2024-09-30',
    teamMembers: ['1', '3', '4'],
    scrums: [],
    createdBy: '1',
    priority: 'medium'
  },
  {
    id: 'proj-4',
    name: 'Internal HR Portal',
    description: 'Employee management system with attendance and payroll integration',
    status: 'completed',
    progress: 100,
    startDate: '2023-10-01',
    endDate: '2024-01-15',
    teamMembers: ['1', '2', '3', '4'],
    scrums: [],
    createdBy: '2',
    priority: 'medium'
  }
];

export const mockScrums: Scrum[] = [
  {
    id: 'scrum-1',
    projectId: 'proj-1',
    name: 'E-Commerce Core Features',
    description: 'Develop core e-commerce functionality including product catalog, cart, and UPI checkout',
    sprints: [],
    backlog: [],
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'scrum-2',
    projectId: 'proj-2',
    name: 'Banking Security Features',
    description: 'Implement security features and user authentication for mobile banking',
    sprints: [],
    backlog: [],
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const mockSprints: Sprint[] = [
  {
    id: 'sprint-1',
    scrumId: 'scrum-1',
    name: 'Sprint 1 - User Authentication',
    goal: 'Implement user registration, login, and profile management with OTP verification',
    startDate: '2024-01-15',
    endDate: '2024-01-29',
    status: 'completed',
    stories: [],
    capacity: 80,
    commitment: 75
  },
  {
    id: 'sprint-2',
    scrumId: 'scrum-1',
    name: 'Sprint 2 - Product Catalog',
    goal: 'Build product catalog with search, filtering, and multi-language support',
    startDate: '2024-01-30',
    endDate: '2024-02-13',
    status: 'active',
    stories: [],
    capacity: 80,
    commitment: 82
  }
];

export const mockStories: Story[] = [
  {
    id: 'story-1',
    title: 'User Registration with OTP',
    description: 'As a new user, I want to create an account with mobile OTP verification',
    acceptanceCriteria: [
      'User can enter mobile number and receive OTP',
      'OTP validation within 5 minutes',
      'Profile creation with basic details',
      'Welcome email/SMS is sent'
    ],
    storyPoints: 8,
    priority: 'high',
    status: 'done',
    assigneeId: '3',
    tasks: [],
    sprintId: 'sprint-1',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'story-2',
    title: 'Product Search with Hindi Support',
    description: 'As a customer, I want to search for products in both Hindi and English',
    acceptanceCriteria: [
      'Search bar supports Hindi and English input',
      'Search returns relevant results in preferred language',
      'Results can be filtered by category and price',
      'Search history is saved for logged-in users'
    ],
    storyPoints: 13,
    priority: 'high',
    status: 'in-progress',
    assigneeId: '3',
    tasks: [],
    sprintId: 'sprint-2',
    createdAt: '2024-01-20T00:00:00Z'
  },
  {
    id: 'story-3',
    title: 'UPI Payment Integration',
    description: 'As a customer, I want to pay using UPI for quick checkout',
    acceptanceCriteria: [
      'UPI payment gateway integration',
      'QR code generation for payments',
      'Payment status tracking',
      'Refund handling for failed transactions'
    ],
    storyPoints: 8,
    priority: 'critical',
    status: 'todo',
    assigneeId: '3',
    tasks: [],
    createdAt: '2024-01-22T00:00:00Z'
  }
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    storyId: 'story-1',
    title: 'Design OTP verification flow',
    description: 'Create wireframes and mockups for mobile OTP verification process',
    status: 'done',
    assigneeId: '4',
    estimatedHours: 8,
    actualHours: 6,
    subtasks: [],
    priority: 'high',
    dueDate: '2024-01-18',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'task-2',
    storyId: 'story-1',
    title: 'Implement SMS OTP service',
    description: 'Integrate with Indian SMS gateway for OTP delivery',
    status: 'done',
    assigneeId: '3',
    estimatedHours: 12,
    actualHours: 14,
    subtasks: [],
    priority: 'high',
    dueDate: '2024-01-22',
    createdAt: '2024-01-16T00:00:00Z'
  },
  {
    id: 'task-3',
    storyId: 'story-2',
    title: 'Design Hindi search interface',
    description: 'Create search UI with Hindi language support and transliteration',
    status: 'in-progress',
    assigneeId: '4',
    estimatedHours: 10,
    subtasks: [],
    priority: 'high',
    dueDate: '2024-02-05',
    createdAt: '2024-01-30T00:00:00Z'
  }
];

export const mockSubtasks: Subtask[] = [
  {
    id: 'subtask-1',
    taskId: 'task-1',
    title: 'Create OTP flow wireframes',
    completed: true,
    assigneeId: '4',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'subtask-2',
    taskId: 'task-1',
    title: 'Design high-fidelity OTP screens',
    completed: true,
    assigneeId: '4',
    createdAt: '2024-01-16T00:00:00Z'
  },
  {
    id: 'subtask-3',
    taskId: 'task-3',
    title: 'Research Hindi input methods',
    completed: true,
    assigneeId: '4',
    createdAt: '2024-01-30T00:00:00Z'
  },
  {
    id: 'subtask-4',
    taskId: 'task-3',
    title: 'Design search autocomplete for Hindi',
    completed: false,
    assigneeId: '4',
    createdAt: '2024-02-01T00:00:00Z'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: '3',
    title: 'New Task Assigned',
    message: 'You have been assigned to "Implement SMS OTP service"',
    type: 'task-assignment',
    priority: 'medium',
    read: false,
    createdAt: '2024-01-16T10:30:00Z',
    actionUrl: '/tasks/task-2'
  },
  {
    id: 'notif-2',
    userId: '2',
    title: 'Sprint Deadline Approaching',
    message: 'Sprint 2 - Product Catalog ends in 3 days',
    type: 'deadline-warning',
    priority: 'high',
    read: false,
    createdAt: '2024-02-10T09:00:00Z',
    actionUrl: '/sprints/sprint-2'
  },
  {
    id: 'notif-3',
    userId: '1',
    title: 'Team Performance Alert',
    message: 'Deepak Gupta needs performance review - 8 missed deadlines',
    type: 'project-risk',
    priority: 'critical',
    read: false,
    createdAt: '2024-02-08T14:15:00Z',
    actionUrl: '/team/performance'
  },
  {
    id: 'notif-4',
    userId: '1',
    title: 'AI Insight Available',
    message: 'Sprint velocity trending 12% above target - view recommendations',
    type: 'team-mention',
    priority: 'medium',
    read: false,
    createdAt: '2024-02-12T11:20:00Z',
    actionUrl: '/ai-insights'
  }
];

export const getDashboardMetrics = (userRole: string, userId: string): DashboardMetrics => {
  // Simulate role-based metrics
  const baseMetrics: DashboardMetrics = {
    projectCount: userRole === 'admin' || userRole === 'manager' ? 8 : 2,
    teamMembers: userRole === 'admin' ? 18 : userRole === 'manager' ? 8 : 4,
    sprintProgress: 85,
    taskCompletion: 73,
    criticalItems: 3,
    upcomingDeadlines: 5
  };

  return baseMetrics;
};

export const getBurndownData = (): ChartData[] => [
  { name: 'Day 1', value: 100 },
  { name: 'Day 3', value: 92 },
  { name: 'Day 5', value: 78 },
  { name: 'Day 7', value: 65 },
  { name: 'Day 9', value: 48 },
  { name: 'Day 11', value: 32 },
  { name: 'Day 13', value: 18 },
  { name: 'Day 14', value: 8 }
];

export const getMonthlyTrendData = (): ChartData[] => [
  { name: 'Jan', value: 42, date: '2024-01' },
  { name: 'Feb', value: 48, date: '2024-02' },
  { name: 'Mar', value: 35, date: '2024-03' },
  { name: 'Apr', value: 58, date: '2024-04' },
  { name: 'May', value: 62, date: '2024-05' },
  { name: 'Jun', value: 75, date: '2024-06' }
];

export const getProjectStatusData = (): ChartData[] => [
  { name: 'Active', value: 50 },
  { name: 'Planning', value: 25 },
  { name: 'Completed', value: 20 },
  { name: 'On Hold', value: 5 }
];

// Team performance data for AI insights
export const getTeamPerformanceData = () => [
  {
    id: '1',
    name: 'Arjun Sharma',
    role: 'Admin',
    velocity: 120,
    taskCompletion: 98,
    codeQuality: 4.9,
    performance: 'excellent'
  },
  {
    id: '2',
    name: 'Priya Mehta',
    role: 'Manager',
    velocity: 125,
    taskCompletion: 96,
    codeQuality: 4.8,
    performance: 'excellent'
  },
  {
    id: '3',
    name: 'Rohit Kumar',
    role: 'Developer',
    velocity: 110,
    taskCompletion: 94,
    codeQuality: 4.6,
    performance: 'good'
  },
  {
    id: '4',
    name: 'Sneha Patel',
    role: 'Designer',
    velocity: 115,
    taskCompletion: 92,
    codeQuality: 4.7,
    performance: 'good'
  },
  {
    id: '5',
    name: 'Deepak Gupta',
    role: 'Developer',
    velocity: 65,
    taskCompletion: 42,
    codeQuality: 3.2,
    performance: 'needs_attention'
  }
];

// AI insights data
export const getAIInsights = () => [
  {
    id: 'insight-1',
    type: 'velocity',
    title: 'Sprint velocity trending 12% above target',
    description: 'Your team is performing excellently this sprint',
    confidence: 95,
    action: 'Continue current practices and consider increasing sprint capacity',
    priority: 'positive'
  },
  {
    id: 'insight-2',
    type: 'bottleneck',
    title: 'Code review bottleneck detected',
    description: 'Consider adding 2 more reviewers for efficiency',
    confidence: 87,
    action: 'Add senior developers to review pool',
    priority: 'warning'
  },
  {
    id: 'insight-3',
    type: 'prediction',
    title: 'Sprint completion prediction: 95% on time',
    description: 'Current velocity suggests early completion',
    confidence: 92,
    action: 'Plan additional stories for next sprint',
    priority: 'positive'
  }
];

export const mockMilestones: Milestone[] = [
  {
    id: 'milestone-1',
    projectId: 'proj-1',
    name: 'Project Charter Approved',
    description: 'Complete project charter with stakeholder sign-off and budget approval',
    dueDate: '2024-01-25T00:00:00Z',
    status: 'completed',
    priority: 'critical',
    owner: 'user3',
    progress: 100,
    type: 'project-charter',
    linkedTasks: [],
    linkedStories: [],
    deliverables: [
      {
        id: 'del-1',
        milestoneId: 'milestone-1',
        name: 'Project Charter Document',
        description: 'Detailed project charter with scope and objectives',
        status: 'completed',
        assigneeId: 'user3'
      },
      {
        id: 'del-2',
        milestoneId: 'milestone-1',
        name: 'Stakeholder Sign-off',
        description: 'Formal approval from all stakeholders',
        status: 'completed',
        assigneeId: 'user3'
      }
    ],
    dependencies: [],
    isBlocker: true,
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-01-25T10:30:00Z',
    completedAt: '2024-01-25T10:30:00Z'
  },
  {
    id: 'milestone-2',
    projectId: 'proj-1',
    name: 'Requirements Finalized',
    description: 'Complete functional and technical requirements documentation with stakeholder review',
    dueDate: '2024-02-15T00:00:00Z',
    status: 'on-track',
    priority: 'high',
    owner: 'user1',
    progress: 85,
    type: 'requirements',
    linkedTasks: ['task-1', 'task-2'],
    linkedStories: ['story-1'],
    deliverables: [
      {
        id: 'del-3',
        milestoneId: 'milestone-2',
        name: 'Functional Requirements Document',
        description: 'Detailed functional requirements specification',
        status: 'completed',
        assigneeId: 'user1'
      },
      {
        id: 'del-4',
        milestoneId: 'milestone-2',
        name: 'Technical Architecture Document',
        description: 'System architecture and technical specifications',
        status: 'in-progress',
        assigneeId: 'user1'
      },
      {
        id: 'del-5',
        milestoneId: 'milestone-2',
        name: 'API Specifications',
        description: 'REST API documentation and endpoint specifications',
        status: 'pending',
        assigneeId: 'user3'
      }
    ],
    dependencies: ['milestone-1'],
    isBlocker: false,
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-02-10T14:20:00Z'
  },
  {
    id: 'milestone-3',
    projectId: 'proj-1',
    name: 'Design System Complete',
    description: 'UI/UX design system with component library and style guide',
    dueDate: '2024-03-01T00:00:00Z',
    status: 'at-risk',
    priority: 'high',
    owner: 'user2',
    progress: 60,
    type: 'design',
    linkedTasks: ['task-3'],
    linkedStories: ['story-2'],
    deliverables: [
      {
        id: 'del-6',
        milestoneId: 'milestone-3',
        name: 'Design System Documentation',
        description: 'Complete design system with guidelines',
        status: 'in-progress',
        assigneeId: 'user2'
      },
      {
        id: 'del-7',
        milestoneId: 'milestone-3',
        name: 'Component Library',
        description: 'Reusable UI components for development',
        status: 'pending',
        assigneeId: 'user2'
      }
    ],
    dependencies: ['milestone-2'],
    isBlocker: false,
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-02-28T09:15:00Z'
  },
  {
    id: 'milestone-4',
    projectId: 'proj-1',
    name: 'MVP Development Complete',
    description: 'Core MVP features development with basic e-commerce functionality',
    dueDate: '2024-04-15T00:00:00Z',
    status: 'upcoming',
    priority: 'critical',
    owner: 'user3',
    progress: 25,
    type: 'development',
    linkedTasks: [],
    linkedStories: ['story-3'],
    deliverables: [
      {
        id: 'del-8',
        milestoneId: 'milestone-4',
        name: 'User Authentication Module',
        description: 'Complete user registration and login functionality',
        status: 'pending',
        assigneeId: 'user3'
      },
      {
        id: 'del-9',
        milestoneId: 'milestone-4',
        name: 'Product Catalog System',
        description: 'Product listing, search, and filtering features',
        status: 'pending',
        assigneeId: 'user3'
      },
      {
        id: 'del-10',
        milestoneId: 'milestone-4',
        name: 'Shopping Cart & Checkout',
        description: 'Cart management and checkout process',
        status: 'pending',
        assigneeId: 'user3'
      }
    ],
    dependencies: ['milestone-3'],
    isBlocker: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-15T11:00:00Z'
  },
  {
    id: 'milestone-5',
    projectId: 'proj-1',
    name: 'Beta Testing Phase',
    description: 'User acceptance testing with beta users and bug fixes',
    dueDate: '2024-05-30T00:00:00Z',
    status: 'upcoming',
    priority: 'medium',
    owner: 'user5',
    progress: 0,
    type: 'testing',
    linkedTasks: [],
    linkedStories: [],
    deliverables: [
      {
        id: 'del-11',
        milestoneId: 'milestone-5',
        name: 'Test Plan Documentation',
        description: 'Comprehensive testing strategy and test cases',
        status: 'pending',
        assigneeId: 'user5'
      },
      {
        id: 'del-12',
        milestoneId: 'milestone-5',
        name: 'Beta User Feedback Report',
        description: 'Analysis of beta testing feedback and recommendations',
        status: 'pending',
        assigneeId: 'user5'
      }
    ],
    dependencies: ['milestone-4'],
    isBlocker: false,
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z'
  },
  {
    id: 'milestone-6',
    projectId: 'proj-1',
    name: 'Production Deployment',
    description: 'Live production deployment with monitoring and support setup',
    dueDate: '2024-06-30T00:00:00Z',
    status: 'upcoming',
    priority: 'critical',
    owner: 'user4',
    progress: 0,
    type: 'deployment',
    linkedTasks: [],
    linkedStories: [],
    deliverables: [
      {
        id: 'del-13',
        milestoneId: 'milestone-6',
        name: 'Production Environment Setup',
        description: 'AWS/Azure production infrastructure configuration',
        status: 'pending',
        assigneeId: 'user4'
      },
      {
        id: 'del-14',
        milestoneId: 'milestone-6',
        name: 'Monitoring & Alerting',
        description: 'Application monitoring and alerting system',
        status: 'pending',
        assigneeId: 'user4'
      },
      {
        id: 'del-15',
        milestoneId: 'milestone-6',
        name: 'User Documentation',
        description: 'End-user guides and help documentation',
        status: 'pending',
        assigneeId: 'user2'
      }
    ],
    dependencies: ['milestone-5'],
    isBlocker: false,
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  },
  // Milestones for Mobile Banking App (proj-2)
  {
    id: 'milestone-7',
    projectId: 'proj-2',
    name: 'Security Architecture Review',
    description: 'Complete security assessment and architecture approval for banking compliance',
    dueDate: '2024-03-15T00:00:00Z',
    status: 'delayed',
    priority: 'critical',
    owner: 'user4',
    progress: 40,
    type: 'review',
    linkedTasks: [],
    linkedStories: [],
    deliverables: [
      {
        id: 'del-16',
        milestoneId: 'milestone-7',
        name: 'Security Audit Report',
        description: 'Third-party security assessment report',
        status: 'in-progress',
        assigneeId: 'user4'
      },
      {
        id: 'del-17',
        milestoneId: 'milestone-7',
        name: 'Compliance Checklist',
        description: 'Banking regulatory compliance verification',
        status: 'pending',
        assigneeId: 'user4'
      }
    ],
    dependencies: [],
    isBlocker: true,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-03-12T08:45:00Z'
  },
  {
    id: 'milestone-8',
    projectId: 'proj-2',
    name: 'Biometric Integration Complete',
    description: 'Fingerprint and face recognition authentication implementation',
    dueDate: '2024-04-30T00:00:00Z',
    status: 'upcoming',
    priority: 'high',
    owner: 'user2',
    progress: 10,
    type: 'development',
    linkedTasks: [],
    linkedStories: [],
    deliverables: [
      {
        id: 'del-18',
        milestoneId: 'milestone-8',
        name: 'Biometric SDK Integration',
        description: 'Third-party biometric SDK implementation',
        status: 'pending',
        assigneeId: 'user2'
      },
      {
        id: 'del-19',
        milestoneId: 'milestone-8',
        name: 'Device Compatibility Testing',
        description: 'Cross-device biometric testing and optimization',
        status: 'pending',
        assigneeId: 'user5'
      }
    ],
    dependencies: ['milestone-7'],
    isBlocker: false,
    createdAt: '2024-02-05T00:00:00Z',
    updatedAt: '2024-02-20T13:30:00Z'
  }
];