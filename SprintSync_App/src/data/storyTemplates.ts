// Story Templates for different types of user stories
export interface StoryTemplate {
  id: string;
  name: string;
  type: 'feature' | 'enhancement' | 'bug-fix' | 'research' | 'technical';
  category: string;
  title: string;
  description: string;
  points: number;
  priority: 'high' | 'medium' | 'low';
  acceptanceCriteria: string[];
  labels: string[];
  epic?: string;
  components?: string[];
}

export const storyTemplates: StoryTemplate[] = [
  // Feature Stories
  {
    id: 'feature-user-auth',
    name: 'User Authentication Feature',
    type: 'feature',
    category: 'Authentication',
    title: 'As a user, I want to securely log in to the application so that I can access my personalized content',
    description: 'Implement comprehensive user authentication system including login, logout, password reset, and session management.',
    points: 13,
    priority: 'high',
    acceptanceCriteria: [
      'User can register with email and password',
      'User can log in with valid credentials',
      'User can reset forgotten password via email',
      'User session is maintained securely',
      'User can log out and session is terminated',
      'Password requirements are enforced',
      'Account lockout after failed attempts',
      'Authentication is protected against common attacks'
    ],
    labels: ['authentication', 'security', 'user-management'],
    epic: 'User Management',
    components: ['Backend', 'Frontend', 'Database']
  },
  {
    id: 'feature-payment',
    name: 'Payment Processing Feature',
    type: 'feature',
    category: 'E-commerce',
    title: 'As a customer, I want to make secure payments so that I can complete my purchases',
    description: 'Implement secure payment processing with multiple payment methods and proper transaction handling.',
    points: 21,
    priority: 'high',
    acceptanceCriteria: [
      'User can select from multiple payment methods',
      'Payment information is securely processed',
      'Transaction is properly recorded and tracked',
      'Payment confirmation is sent to user',
      'Failed payments are handled gracefully',
      'Payment history is available to user',
      'Refunds can be processed when needed',
      'PCI compliance requirements are met'
    ],
    labels: ['payment', 'e-commerce', 'security'],
    epic: 'E-commerce Platform',
    components: ['Payment Gateway', 'Backend', 'Database']
  },
  {
    id: 'feature-search',
    name: 'Advanced Search Feature',
    type: 'feature',
    category: 'Search & Discovery',
    title: 'As a user, I want to search and filter content so that I can quickly find what I need',
    description: 'Implement advanced search functionality with filters, sorting, and search suggestions.',
    points: 8,
    priority: 'medium',
    acceptanceCriteria: [
      'User can search using keywords',
      'Search results are relevant and accurate',
      'User can apply multiple filters',
      'Results can be sorted by different criteria',
      'Search suggestions appear as user types',
      'Search history is maintained',
      'No results state is handled gracefully',
      'Search performance is optimized'
    ],
    labels: ['search', 'filtering', 'user-experience'],
    epic: 'Content Discovery',
    components: ['Frontend', 'Backend', 'Search Engine']
  },

  // Enhancement Stories
  {
    id: 'enhancement-performance',
    name: 'Performance Optimization',
    type: 'enhancement',
    category: 'Performance',
    title: 'As a user, I want faster page load times so that I have a better experience',
    description: 'Optimize application performance to improve page load times and overall user experience.',
    points: 5,
    priority: 'medium',
    acceptanceCriteria: [
      'Page load times are reduced by 30%',
      'Images are optimized and lazy-loaded',
      'JavaScript bundles are code-split',
      'Database queries are optimized',
      'Caching is implemented where appropriate',
      'Performance metrics are monitored',
      'Mobile performance is improved',
      'Performance budget is established'
    ],
    labels: ['performance', 'optimization', 'user-experience'],
    epic: 'Performance Improvement',
    components: ['Frontend', 'Backend', 'Database']
  },
  {
    id: 'enhancement-mobile',
    name: 'Mobile Experience Enhancement',
    type: 'enhancement',
    category: 'Mobile',
    title: 'As a mobile user, I want a seamless experience so that I can use the app effectively on my device',
    description: 'Enhance mobile user experience with improved responsive design and touch interactions.',
    points: 8,
    priority: 'medium',
    acceptanceCriteria: [
      'App works well on all mobile screen sizes',
      'Touch interactions are intuitive',
      'Mobile navigation is optimized',
      'Loading states are appropriate for mobile',
      'Offline functionality is available',
      'Mobile-specific features are implemented',
      'App performance is optimized for mobile',
      'Mobile accessibility standards are met'
    ],
    labels: ['mobile', 'responsive', 'user-experience'],
    epic: 'Mobile Optimization',
    components: ['Frontend', 'Mobile App']
  },

  // Bug Fix Stories
  {
    id: 'bug-crash-fix',
    name: 'Application Crash Fix',
    type: 'bug-fix',
    category: 'Critical Bug',
    title: 'As a user, I want the application to not crash so that I can complete my tasks',
    description: 'Fix critical application crashes that prevent users from completing their workflows.',
    points: 3,
    priority: 'high',
    acceptanceCriteria: [
      'Application no longer crashes under reported conditions',
      'Error handling is implemented to prevent future crashes',
      'User data is not lost during error scenarios',
      'Error logging is implemented for debugging',
      'Fix is tested across different browsers and devices',
      'Regression testing is performed',
      'Error monitoring is set up',
      'User communication plan is in place'
    ],
    labels: ['bug', 'critical', 'stability'],
    epic: 'Application Stability',
    components: ['Frontend', 'Backend']
  },
  {
    id: 'bug-ui-fix',
    name: 'UI/UX Bug Fix',
    type: 'bug-fix',
    category: 'UI Bug',
    title: 'As a user, I want the interface to display correctly so that I can use all features',
    description: 'Fix UI/UX issues that affect user interface display or user experience.',
    points: 2,
    priority: 'medium',
    acceptanceCriteria: [
      'UI elements display correctly across browsers',
      'Responsive design works on all screen sizes',
      'Accessibility issues are resolved',
      'Visual consistency is maintained',
      'User interactions work as expected',
      'Loading states are properly displayed',
      'Error messages are user-friendly',
      'UI testing is performed'
    ],
    labels: ['bug', 'ui', 'user-experience'],
    epic: 'UI/UX Improvements',
    components: ['Frontend']
  },

  // Technical Stories
  {
    id: 'technical-refactor',
    name: 'Code Refactoring',
    type: 'technical',
    category: 'Code Quality',
    title: 'As a developer, I want clean and maintainable code so that I can work efficiently',
    description: 'Refactor existing code to improve maintainability, readability, and performance.',
    points: 5,
    priority: 'low',
    acceptanceCriteria: [
      'Code is refactored without changing functionality',
      'Code complexity is reduced',
      'Code duplication is eliminated',
      'Unit tests are updated and passing',
      'Code review is completed',
      'Documentation is updated',
      'Performance is maintained or improved',
      'Refactoring is done incrementally'
    ],
    labels: ['refactoring', 'code-quality', 'maintenance'],
    epic: 'Code Quality',
    components: ['Backend', 'Frontend']
  },
  {
    id: 'technical-security',
    name: 'Security Enhancement',
    type: 'technical',
    category: 'Security',
    title: 'As a system administrator, I want enhanced security measures so that the application is protected',
    description: 'Implement additional security measures to protect against vulnerabilities and attacks.',
    points: 8,
    priority: 'high',
    acceptanceCriteria: [
      'Security vulnerabilities are identified and fixed',
      'Input validation is strengthened',
      'Authentication and authorization are enhanced',
      'Security headers are properly configured',
      'Data encryption is implemented where needed',
      'Security testing is performed',
      'Security monitoring is set up',
      'Security documentation is updated'
    ],
    labels: ['security', 'vulnerability', 'protection'],
    epic: 'Security Hardening',
    components: ['Backend', 'Frontend', 'Infrastructure']
  },

  // Research Stories
  {
    id: 'research-technology',
    name: 'Technology Evaluation',
    type: 'research',
    category: 'Research',
    title: 'As a product owner, I want to evaluate new technology so that I can make informed decisions',
    description: 'Research and evaluate new technology or approach to determine its suitability for the project.',
    points: 13,
    priority: 'low',
    acceptanceCriteria: [
      'Research objectives are clearly defined',
      'Multiple technology options are evaluated',
      'Proof of concept is created',
      'Pros and cons are documented',
      'Implementation effort is estimated',
      'Risk assessment is completed',
      'Recommendation is provided with rationale',
      'Research findings are presented to stakeholders'
    ],
    labels: ['research', 'evaluation', 'technology'],
    epic: 'Technology Strategy',
    components: ['Research', 'Architecture']
  }
];

// Helper functions for story template management
export const getStoriesByType = (type: StoryTemplate['type']) => {
  return storyTemplates.filter(story => story.type === type);
};

export const getStoryById = (id: string) => {
  return storyTemplates.find(story => story.id === id);
};

export const getStoriesByCategory = (category: string) => {
  return storyTemplates.filter(story => story.category === category);
};

export const getStoriesByEpic = (epic: string) => {
  return storyTemplates.filter(story => story.epic === epic);
};

export const getAllCategories = () => {
  return [...new Set(storyTemplates.map(story => story.category))];
};

export const getAllTypes = () => {
  return [...new Set(storyTemplates.map(story => story.type))];
};

export const getAllEpics = () => {
  return [...new Set(storyTemplates.map(story => story.epic).filter(Boolean))];
};
