import { Epic } from '../types';

export const mockEpics: Epic[] = [
  {
    id: 'epic-1',
    projectId: 'proj-1',
    title: 'User Authentication & Authorization System',
    description: 'Implement a comprehensive user authentication and authorization system with modern security practices including OAuth2, JWT tokens, role-based access control, and multi-factor authentication.',
    summary: 'Build a secure and scalable authentication system that supports multiple login methods, role-based permissions, and advanced security features.',
    priority: 'high',
    status: 'in-progress',
    assigneeId: 'user1',
    owner: 'user1',
    startDate: '2024-01-15T00:00:00Z',
    endDate: '2024-03-15T00:00:00Z',
    progress: 65,
    storyPoints: 89,
    completedStoryPoints: 58,
    linkedMilestones: ['milestone-1', 'milestone-2'],
    linkedStories: ['story-1', 'story-2', 'story-3', 'story-4'],
    labels: ['authentication', 'security', 'authorization', 'user-management'],
    components: ['Auth Service', 'User Service', 'Permission Middleware', 'Login UI'],
    theme: 'User Experience & Security',
    businessValue: 'Enables secure user onboarding, improves user experience, and provides administrative control over user accounts and permissions.',
    acceptanceCriteria: [
      'Users can register, login, and logout securely',
      'Role-based access control is implemented and functional',
      'User profiles can be created, updated, and managed',
      'Administrators can manage user accounts and permissions',
      'Password reset and account recovery functionality works',
      'Multi-factor authentication is available for enhanced security'
    ],
    risks: [
      'Security vulnerabilities in authentication flow',
      'Performance impact of authorization checks',
      'Data migration complexity for existing users',
      'Third-party authentication service dependencies'
    ],
    dependencies: [],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'epic-2',
    projectId: 'proj-1',
    title: 'Payment Processing Platform',
    description: 'Develop a comprehensive payment processing system supporting multiple payment methods, currencies, and payment gateways with fraud detection and compliance.',
    summary: 'Create a scalable payment infrastructure supporting credit cards, digital wallets, bank transfers, and cryptocurrency payments.',
    priority: 'critical',
    status: 'planning',
    assigneeId: 'user2',
    owner: 'user2',
    startDate: '2024-02-01T00:00:00Z',
    endDate: '2024-05-01T00:00:00Z',
    progress: 15,
    storyPoints: 144,
    completedStoryPoints: 22,
    linkedMilestones: ['milestone-3'],
    linkedStories: ['story-5', 'story-6'],
    labels: ['payments', 'fintech', 'security', 'compliance', 'integration'],
    components: ['Payment Gateway', 'Fraud Detection', 'Transaction Service', 'Reporting Dashboard'],
    theme: 'Revenue Generation',
    businessValue: 'Enables monetization of the platform, supports global transactions, and provides secure payment processing for all user transactions.',
    acceptanceCriteria: [
      'Support for multiple payment methods (credit cards, digital wallets, bank transfers)',
      'Multi-currency support with real-time exchange rates',
      'Fraud detection and prevention mechanisms',
      'PCI DSS compliance and security standards',
      'Payment reconciliation and reporting capabilities',
      'Refund and chargeback handling functionality'
    ],
    risks: [
      'Regulatory compliance requirements (PCI DSS, GDPR)',
      'Third-party payment gateway reliability and costs',
      'Fraud prevention effectiveness and false positives',
      'Currency fluctuation impact on business operations'
    ],
    dependencies: ['epic-1'],
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z'
  },
  {
    id: 'epic-3',
    projectId: 'proj-1',
    title: 'Mobile Application Platform',
    description: 'Develop native mobile applications for iOS and Android platforms with offline capabilities, push notifications, and seamless synchronization.',
    summary: 'Create a comprehensive mobile experience with native performance, offline support, and real-time synchronization.',
    priority: 'high',
    status: 'backlog',
    assigneeId: 'user3',
    owner: 'user3',
    startDate: '2024-03-01T00:00:00Z',
    endDate: '2024-07-01T00:00:00Z',
    progress: 0,
    storyPoints: 156,
    completedStoryPoints: 0,
    linkedMilestones: ['milestone-4', 'milestone-5'],
    linkedStories: [],
    labels: ['mobile', 'ios', 'android', 'offline', 'notifications'],
    components: ['Mobile App (iOS)', 'Mobile App (Android)', 'Sync Service', 'Push Notification Service'],
    theme: 'Mobile Experience',
    businessValue: 'Expands user reach to mobile devices, improves user engagement through mobile-specific features, and provides offline access capabilities.',
    acceptanceCriteria: [
      'Native iOS and Android applications',
      'Offline functionality with data synchronization',
      'Push notifications for real-time updates',
      'Mobile-optimized user interface and navigation',
      'Biometric authentication support',
      'App store deployment and update mechanisms'
    ],
    risks: [
      'Platform-specific development complexity',
      'App store approval processes and guidelines',
      'Offline data synchronization conflicts',
      'Mobile device performance and battery optimization'
    ],
    dependencies: ['epic-1', 'epic-2'],
    createdAt: '2024-02-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'epic-4',
    projectId: 'proj-1',
    title: 'Search and Analytics Engine',
    description: 'Implement a powerful search engine with real-time analytics, user behavior tracking, and intelligent recommendations.',
    summary: 'Build an intelligent search platform with analytics, personalization, and recommendation capabilities.',
    priority: 'medium',
    status: 'in-progress',
    assigneeId: 'user4',
    owner: 'user4',
    startDate: '2024-01-20T00:00:00Z',
    endDate: '2024-03-20T00:00:00Z',
    progress: 45,
    storyPoints: 67,
    completedStoryPoints: 30,
    linkedMilestones: ['milestone-6'],
    linkedStories: ['story-7', 'story-8', 'story-9'],
    labels: ['search', 'analytics', 'recommendations', 'performance', 'data'],
    components: ['Search Engine', 'Analytics Service', 'Recommendation Engine', 'Dashboard'],
    theme: 'Data Intelligence',
    businessValue: 'Improves user engagement through better search results, provides business insights through analytics, and increases conversion rates.',
    acceptanceCriteria: [
      'Full-text search across all content types',
      'Real-time search suggestions and autocomplete',
      'User behavior tracking and analytics',
      'Personalized search results and recommendations',
      'Search performance optimization and caching',
      'Analytics dashboard with key metrics and insights'
    ],
    risks: [
      'Search performance with large datasets',
      'Privacy concerns with user behavior tracking',
      'Algorithm accuracy for recommendations',
      'Infrastructure costs for real-time processing'
    ],
    dependencies: [],
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z'
  },
  {
    id: 'epic-5',
    projectId: 'proj-1',
    title: 'Performance Optimization',
    description: 'Comprehensive performance optimization including database tuning, caching strategies, CDN implementation, and load testing.',
    summary: 'Optimize system performance across all layers to handle increased load and improve user experience.',
    priority: 'high',
    status: 'review',
    assigneeId: 'user5',
    owner: 'user5',
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-02-29T00:00:00Z',
    progress: 85,
    storyPoints: 67,
    completedStoryPoints: 57,
    linkedMilestones: ['milestone-7'],
    linkedStories: ['story-10', 'story-11', 'story-12'],
    labels: ['performance', 'optimization', 'scalability', 'caching', 'monitoring'],
    components: ['Cache Layer', 'CDN Configuration', 'Load Balancer', 'Monitoring System'],
    theme: 'Performance & Scalability',
    businessValue: 'Improves user experience through faster response times, enables handling of increased user load, and reduces infrastructure costs through optimization.',
    acceptanceCriteria: [
      'Database query optimization and indexing',
      'Application-level caching implementation',
      'CDN setup for static content delivery',
      'Load balancing and auto-scaling configuration',
      'Performance monitoring and alerting',
      'Load testing and capacity planning'
    ],
    risks: [
      'Performance optimization complexity and time investment',
      'Caching strategy effectiveness and cache invalidation',
      'Load testing accuracy and production load differences',
      'Optimization impact on system stability'
    ],
    dependencies: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  }
];

export const getEpicsByProject = (projectId: string) => {
  return mockEpics.filter(epic => epic.projectId === projectId);
};

export const getEpicById = (epicId: string) => {
  return mockEpics.find(epic => epic.id === epicId);
};
