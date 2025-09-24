import { Epic } from '../types';

export interface EpicTemplate {
  id: string;
  name: string;
  type: 'feature' | 'platform' | 'infrastructure' | 'integration' | 'migration' | 'research' | 'performance' | 'security';
  title: string;
  description: string;
  summary: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  theme: string;
  businessValue: string;
  acceptanceCriteria: string[];
  risks: string[];
  labels: string[];
  components: string[];
  estimatedStoryPoints: number;
  estimatedDuration: number; // in weeks
}

export const epicTemplates: EpicTemplate[] = [
  // Feature Epics
  {
    id: 'epic-user-management',
    name: 'User Management System',
    type: 'feature',
    title: 'Comprehensive User Management and Authentication',
    description: 'Implement a complete user management system including registration, authentication, authorization, profile management, and user administration features.',
    summary: 'Build a robust user management system with modern authentication, role-based access control, and user lifecycle management.',
    priority: 'high',
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
    labels: ['authentication', 'authorization', 'security', 'user-experience'],
    components: ['Authentication Service', 'User Service', 'Authorization Middleware', 'User Interface'],
    estimatedStoryPoints: 89,
    estimatedDuration: 8
  },

  {
    id: 'epic-payment-system',
    name: 'Payment Processing Platform',
    type: 'feature',
    title: 'Multi-Gateway Payment Processing System',
    description: 'Develop a comprehensive payment processing system supporting multiple payment methods, currencies, and payment gateways with fraud detection and compliance.',
    summary: 'Create a scalable payment infrastructure supporting credit cards, digital wallets, bank transfers, and cryptocurrency payments.',
    priority: 'critical',
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
    labels: ['payments', 'fintech', 'security', 'compliance', 'integration'],
    components: ['Payment Gateway', 'Fraud Detection', 'Transaction Service', 'Reporting Dashboard'],
    estimatedStoryPoints: 144,
    estimatedDuration: 12
  },

  {
    id: 'epic-search-analytics',
    name: 'Search and Analytics Engine',
    type: 'feature',
    title: 'Advanced Search with Real-time Analytics',
    description: 'Implement a powerful search engine with real-time analytics, user behavior tracking, and intelligent recommendations.',
    summary: 'Build an intelligent search platform with analytics, personalization, and recommendation capabilities.',
    priority: 'high',
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
    labels: ['search', 'analytics', 'recommendations', 'performance', 'data'],
    components: ['Search Engine', 'Analytics Service', 'Recommendation Engine', 'Dashboard'],
    estimatedStoryPoints: 67,
    estimatedDuration: 6
  },

  // Platform Epics
  {
    id: 'epic-mobile-platform',
    name: 'Mobile Application Platform',
    type: 'platform',
    title: 'Cross-Platform Mobile Application',
    description: 'Develop native mobile applications for iOS and Android platforms with offline capabilities, push notifications, and seamless synchronization.',
    summary: 'Create a comprehensive mobile experience with native performance, offline support, and real-time synchronization.',
    priority: 'high',
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
    labels: ['mobile', 'ios', 'android', 'offline', 'notifications'],
    components: ['Mobile App (iOS)', 'Mobile App (Android)', 'Sync Service', 'Push Notification Service'],
    estimatedStoryPoints: 156,
    estimatedDuration: 16
  },

  {
    id: 'epic-api-platform',
    name: 'Public API Platform',
    type: 'platform',
    title: 'Developer-Friendly API Platform',
    description: 'Build a comprehensive API platform with documentation, SDKs, rate limiting, and developer tools for third-party integrations.',
    summary: 'Create a robust API ecosystem enabling third-party developers to integrate and extend platform functionality.',
    priority: 'medium',
    theme: 'Developer Ecosystem',
    businessValue: 'Enables third-party integrations, creates new revenue streams through API usage, and builds a developer community around the platform.',
    acceptanceCriteria: [
      'RESTful API with comprehensive endpoints',
      'Interactive API documentation and sandbox',
      'SDKs for major programming languages',
      'Rate limiting and usage analytics',
      'Webhook support for real-time notifications',
      'Developer portal with authentication and management'
    ],
    risks: [
      'API versioning and backward compatibility',
      'Security vulnerabilities in public endpoints',
      'Rate limiting impact on legitimate users',
      'Third-party developer support and documentation maintenance'
    ],
    labels: ['api', 'developer-tools', 'integration', 'documentation', 'sdk'],
    components: ['API Gateway', 'Documentation Portal', 'SDK Libraries', 'Developer Dashboard'],
    estimatedStoryPoints: 78,
    estimatedDuration: 10
  },

  // Infrastructure Epics
  {
    id: 'epic-microservices',
    name: 'Microservices Architecture',
    type: 'infrastructure',
    title: 'Microservices Migration and Architecture',
    description: 'Migrate from monolithic architecture to microservices with service discovery, API gateway, and distributed system patterns.',
    summary: 'Transform the application architecture into scalable, maintainable microservices with proper service boundaries and communication patterns.',
    priority: 'medium',
    theme: 'Scalability & Architecture',
    businessValue: 'Improves system scalability, enables independent team development, reduces deployment risks, and enhances system resilience.',
    acceptanceCriteria: [
      'Service boundaries properly defined and implemented',
      'Service discovery and load balancing configured',
      'API gateway routing and authentication',
      'Distributed logging and monitoring',
      'Database per service pattern implemented',
      'Circuit breakers and fault tolerance mechanisms'
    ],
    risks: [
      'Distributed system complexity and debugging',
      'Data consistency across service boundaries',
      'Network latency and service communication overhead',
      'Operational complexity of managing multiple services'
    ],
    labels: ['microservices', 'architecture', 'scalability', 'devops', 'infrastructure'],
    components: ['Service Registry', 'API Gateway', 'Message Queue', 'Monitoring System'],
    estimatedStoryPoints: 112,
    estimatedDuration: 14
  },

  {
    id: 'epic-cloud-migration',
    name: 'Cloud Infrastructure Migration',
    type: 'infrastructure',
    title: 'Cloud-Native Infrastructure Migration',
    description: 'Migrate the entire infrastructure to cloud-native services with containerization, orchestration, and automated deployment pipelines.',
    summary: 'Transition to cloud infrastructure with Kubernetes orchestration, CI/CD pipelines, and infrastructure as code.',
    priority: 'high',
    theme: 'Cloud & DevOps',
    businessValue: 'Reduces infrastructure costs, improves scalability and reliability, enables faster deployments, and provides better disaster recovery.',
    acceptanceCriteria: [
      'Containerized applications with Docker',
      'Kubernetes orchestration and management',
      'CI/CD pipelines with automated testing',
      'Infrastructure as Code (IaC) implementation',
      'Cloud monitoring and alerting systems',
      'Disaster recovery and backup procedures'
    ],
    risks: [
      'Migration downtime and data loss risks',
      'Cloud vendor lock-in and cost management',
      'Learning curve for new technologies',
      'Security configuration in cloud environment'
    ],
    labels: ['cloud', 'kubernetes', 'docker', 'devops', 'infrastructure'],
    components: ['Container Registry', 'Kubernetes Cluster', 'CI/CD Pipeline', 'Monitoring Stack'],
    estimatedStoryPoints: 89,
    estimatedDuration: 12
  },

  // Integration Epics
  {
    id: 'epic-third-party-integrations',
    name: 'Third-Party Integrations',
    type: 'integration',
    title: 'Enterprise Third-Party Integrations',
    description: 'Integrate with major enterprise systems including CRM, ERP, marketing automation, and productivity tools.',
    summary: 'Build seamless integrations with enterprise software to streamline workflows and data synchronization.',
    priority: 'medium',
    theme: 'Enterprise Integration',
    businessValue: 'Improves workflow efficiency, reduces manual data entry, enables data synchronization across platforms, and enhances user productivity.',
    acceptanceCriteria: [
      'CRM integration (Salesforce, HubSpot)',
      'ERP system connectivity (SAP, Oracle)',
      'Marketing automation platform integration',
      'Productivity tool synchronization (Slack, Microsoft Teams)',
      'Data mapping and transformation capabilities',
      'Error handling and retry mechanisms'
    ],
    risks: [
      'Third-party API changes and versioning',
      'Data mapping complexity and accuracy',
      'Integration performance and reliability',
      'Security and compliance requirements'
    ],
    labels: ['integration', 'enterprise', 'api', 'data-sync', 'automation'],
    components: ['Integration Hub', 'Data Mapper', 'Sync Service', 'Error Handler'],
    estimatedStoryPoints: 95,
    estimatedDuration: 11
  },

  // Migration Epics
  {
    id: 'epic-data-migration',
    name: 'Data Migration Platform',
    type: 'migration',
    title: 'Legacy System Data Migration',
    description: 'Develop a comprehensive data migration platform to transfer data from legacy systems with validation, transformation, and rollback capabilities.',
    summary: 'Create a robust data migration solution ensuring data integrity, completeness, and system continuity during transitions.',
    priority: 'critical',
    theme: 'Data Migration',
    businessValue: 'Enables system modernization, preserves historical data, reduces manual data entry, and ensures business continuity during transitions.',
    acceptanceCriteria: [
      'Data extraction from legacy systems',
      'Data validation and cleansing processes',
      'Data transformation and mapping capabilities',
      'Migration rollback and recovery procedures',
      'Data integrity verification and reporting',
      'Minimal downtime migration execution'
    ],
    risks: [
      'Data corruption or loss during migration',
      'Legacy system compatibility and access issues',
      'Migration timeline and business disruption',
      'Data format and structure incompatibilities'
    ],
    labels: ['migration', 'data', 'legacy', 'validation', 'transformation'],
    components: ['Migration Engine', 'Data Validator', 'Transformation Service', 'Rollback Manager'],
    estimatedStoryPoints: 123,
    estimatedDuration: 15
  },

  // Research Epics
  {
    id: 'epic-ai-ml-platform',
    name: 'AI/ML Platform Integration',
    type: 'research',
    title: 'Artificial Intelligence and Machine Learning Platform',
    description: 'Research and implement AI/ML capabilities including predictive analytics, natural language processing, and automated decision-making systems.',
    summary: 'Explore and integrate AI/ML technologies to enhance user experience and provide intelligent automation and insights.',
    priority: 'low',
    theme: 'AI & Innovation',
    businessValue: 'Provides competitive advantage through AI capabilities, improves user experience with intelligent features, and enables data-driven decision making.',
    acceptanceCriteria: [
      'Predictive analytics for user behavior',
      'Natural language processing for content analysis',
      'Automated recommendation systems',
      'Machine learning model training and deployment',
      'AI-powered customer support chatbot',
      'Performance monitoring and model optimization'
    ],
    risks: [
      'AI/ML model accuracy and reliability',
      'Data privacy and ethical AI concerns',
      'Computational resource requirements',
      'Integration complexity with existing systems'
    ],
    labels: ['ai', 'machine-learning', 'analytics', 'nlp', 'automation'],
    components: ['ML Pipeline', 'Model Registry', 'Inference Service', 'Monitoring Dashboard'],
    estimatedStoryPoints: 134,
    estimatedDuration: 18
  },

  // Performance Epics
  {
    id: 'epic-performance-optimization',
    name: 'Performance Optimization',
    type: 'performance',
    title: 'System Performance and Scalability Optimization',
    description: 'Comprehensive performance optimization including database tuning, caching strategies, CDN implementation, and load testing.',
    summary: 'Optimize system performance across all layers to handle increased load and improve user experience.',
    priority: 'high',
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
    labels: ['performance', 'optimization', 'scalability', 'caching', 'monitoring'],
    components: ['Cache Layer', 'CDN Configuration', 'Load Balancer', 'Monitoring System'],
    estimatedStoryPoints: 67,
    estimatedDuration: 8
  },

  // Security Epics
  {
    id: 'epic-security-enhancement',
    name: 'Security Enhancement Platform',
    type: 'security',
    title: 'Comprehensive Security Enhancement and Compliance',
    description: 'Implement advanced security measures including threat detection, vulnerability scanning, compliance automation, and security monitoring.',
    summary: 'Strengthen security posture through proactive threat detection, compliance automation, and comprehensive security monitoring.',
    priority: 'critical',
    theme: 'Security & Compliance',
    businessValue: 'Protects against security threats, ensures regulatory compliance, builds customer trust, and reduces security-related risks and costs.',
    acceptanceCriteria: [
      'Automated vulnerability scanning and remediation',
      'Threat detection and incident response systems',
      'Compliance monitoring and reporting automation',
      'Security audit logging and monitoring',
      'Penetration testing and security assessments',
      'Security awareness training and documentation'
    ],
    risks: [
      'False positives in security monitoring',
      'Compliance requirement changes and updates',
      'Security tool integration complexity',
      'Balancing security with user experience'
    ],
    labels: ['security', 'compliance', 'threat-detection', 'vulnerability', 'monitoring'],
    components: ['Security Scanner', 'Threat Detection', 'Compliance Engine', 'Audit Logger'],
    estimatedStoryPoints: 89,
    estimatedDuration: 10
  }
];

export const getEpicTemplatesByType = (type: EpicTemplate['type']) => {
  return epicTemplates.filter(template => template.type === type);
};

export const getEpicTemplateById = (id: string) => {
  return epicTemplates.find(template => template.id === id);
};

export const createEpicFromTemplate = (template: EpicTemplate, projectId: string, ownerId: string): Omit<Epic, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    projectId,
    title: template.title,
    description: template.description,
    summary: template.summary,
    priority: template.priority,
    status: 'backlog',
    assigneeId: undefined,
    owner: ownerId,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + template.estimatedDuration * 7 * 24 * 60 * 60 * 1000).toISOString(), // Convert weeks to milliseconds
    progress: 0,
    storyPoints: template.estimatedStoryPoints,
    completedStoryPoints: 0,
    linkedMilestones: [],
    linkedStories: [],
    labels: template.labels,
    components: template.components,
    theme: template.theme,
    businessValue: template.businessValue,
    acceptanceCriteria: template.acceptanceCriteria,
    risks: template.risks,
    dependencies: []
  };
};
