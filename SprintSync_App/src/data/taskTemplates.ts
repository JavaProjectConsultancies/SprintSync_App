// Task Templates for different work types
export interface TaskTemplate {
  id: string;
  name: string;
  type: 'db' | 'api' | 'ui' | 'qa' | 'devops' | 'research';
  category: string;
  title: string;
  description: string;
  estimatedHours: number;
  priority: 'high' | 'medium' | 'low';
  subtasks: string[];
  acceptanceCriteria: string[];
  labels: string[];
  assigneeRole: string[];
}

export const taskTemplates: TaskTemplate[] = [
  // Database Templates
  {
    id: 'db-schema-design',
    name: 'Database Schema Design',
    type: 'db',
    category: 'Database Design',
    title: 'Design database schema for [feature]',
    description: 'Create comprehensive database schema including tables, relationships, indexes, and constraints for the specified feature.',
    estimatedHours: 8,
    priority: 'high',
    subtasks: [
      'Analyze requirements and data flow',
      'Design entity relationship diagram (ERD)',
      'Define table structures and relationships',
      'Plan indexes and constraints',
      'Document schema specifications',
      'Review with team and stakeholders'
    ],
    acceptanceCriteria: [
      'ERD diagram is created and documented',
      'All required tables and relationships are defined',
      'Primary and foreign keys are properly established',
      'Indexes are planned for performance optimization',
      'Data validation rules are specified',
      'Schema is reviewed and approved by team'
    ],
    labels: ['database', 'schema', 'design'],
    assigneeRole: ['Senior Developer', 'Database Developer', 'Backend Developer']
  },
  {
    id: 'db-migration',
    name: 'Database Migration',
    type: 'db',
    category: 'Database Operations',
    title: 'Create migration for [change description]',
    description: 'Implement database migration to modify existing schema or data structure.',
    estimatedHours: 4,
    priority: 'medium',
    subtasks: [
      'Analyze current database state',
      'Write migration script',
      'Test migration on development environment',
      'Create rollback script',
      'Document migration process',
      'Deploy to staging environment'
    ],
    acceptanceCriteria: [
      'Migration script is created and tested',
      'Data integrity is maintained during migration',
      'Rollback procedure is documented and tested',
      'Migration runs successfully on staging',
      'Performance impact is assessed',
      'Migration is documented for production deployment'
    ],
    labels: ['database', 'migration', 'deployment'],
    assigneeRole: ['Database Developer', 'DevOps Engineer', 'Backend Developer']
  },
  {
    id: 'db-optimization',
    name: 'Database Performance Optimization',
    type: 'db',
    category: 'Performance',
    title: 'Optimize database performance for [query/table]',
    description: 'Analyze and optimize database performance for specific queries or tables.',
    estimatedHours: 6,
    priority: 'medium',
    subtasks: [
      'Analyze current performance metrics',
      'Identify bottlenecks and slow queries',
      'Review and optimize query execution plans',
      'Add or modify indexes as needed',
      'Test performance improvements',
      'Document optimization results'
    ],
    acceptanceCriteria: [
      'Performance baseline is established',
      'Bottlenecks are identified and documented',
      'Query execution time is improved by at least 25%',
      'New indexes are created and tested',
      'Performance monitoring is set up',
      'Optimization results are documented'
    ],
    labels: ['database', 'performance', 'optimization'],
    assigneeRole: ['Database Developer', 'Senior Developer']
  },

  // API Templates
  {
    id: 'api-endpoint',
    name: 'REST API Endpoint',
    type: 'api',
    category: 'API Development',
    title: 'Implement [endpoint] API endpoint',
    description: 'Create RESTful API endpoint with proper request/response handling, validation, and error management.',
    estimatedHours: 6,
    priority: 'high',
    subtasks: [
      'Design API endpoint specification',
      'Implement request validation',
      'Create business logic implementation',
      'Add proper error handling',
      'Write unit tests',
      'Update API documentation'
    ],
    acceptanceCriteria: [
      'API endpoint follows REST conventions',
      'Request/response validation is implemented',
      'Proper HTTP status codes are returned',
      'Error handling covers all edge cases',
      'Unit tests achieve 90%+ coverage',
      'API documentation is updated with examples'
    ],
    labels: ['api', 'rest', 'backend'],
    assigneeRole: ['Backend Developer', 'API Developer', 'Full Stack Developer']
  },
  {
    id: 'api-integration',
    name: 'Third-party API Integration',
    type: 'api',
    category: 'Integration',
    title: 'Integrate with [service] API',
    description: 'Implement integration with external third-party service API including authentication, data mapping, and error handling.',
    estimatedHours: 8,
    priority: 'medium',
    subtasks: [
      'Research third-party API documentation',
      'Set up authentication and credentials',
      'Implement API client with retry logic',
      'Create data mapping and transformation',
      'Handle rate limiting and errors',
      'Write integration tests'
    ],
    acceptanceCriteria: [
      'Third-party API is successfully integrated',
      'Authentication and security are properly implemented',
      'Rate limiting and retry logic are in place',
      'Data transformation is accurate and tested',
      'Error handling covers API failures',
      'Integration tests pass consistently'
    ],
    labels: ['api', 'integration', 'third-party'],
    assigneeRole: ['Backend Developer', 'Integration Specialist']
  },
  {
    id: 'api-security',
    name: 'API Security Implementation',
    type: 'api',
    category: 'Security',
    title: 'Implement security measures for [endpoint/service]',
    description: 'Add comprehensive security measures including authentication, authorization, rate limiting, and input sanitization.',
    estimatedHours: 10,
    priority: 'high',
    subtasks: [
      'Implement authentication mechanism',
      'Add authorization and role-based access',
      'Set up rate limiting and throttling',
      'Implement input validation and sanitization',
      'Add security headers and CORS configuration',
      'Conduct security testing'
    ],
    acceptanceCriteria: [
      'Authentication is properly implemented',
      'Authorization rules are enforced',
      'Rate limiting prevents abuse',
      'Input validation prevents injection attacks',
      'Security headers are configured',
      'Security testing passes all checks'
    ],
    labels: ['api', 'security', 'authentication'],
    assigneeRole: ['Security Engineer', 'Backend Developer']
  },

  // UI Templates
  {
    id: 'ui-component',
    name: 'React Component Development',
    type: 'ui',
    category: 'Frontend Development',
    title: 'Create [component name] React component',
    description: 'Develop reusable React component with proper props, state management, and styling.',
    estimatedHours: 6,
    priority: 'medium',
    subtasks: [
      'Design component interface and props',
      'Implement component logic and state',
      'Add responsive styling and themes',
      'Write component tests',
      'Create Storybook stories',
      'Document component usage'
    ],
    acceptanceCriteria: [
      'Component is fully functional and reusable',
      'Props interface is well-defined',
      'Component is responsive across devices',
      'Unit tests achieve 90%+ coverage',
      'Storybook stories demonstrate all variants',
      'Component documentation is complete'
    ],
    labels: ['ui', 'react', 'component'],
    assigneeRole: ['Frontend Developer', 'UI Developer', 'Full Stack Developer']
  },
  {
    id: 'ui-page',
    name: 'Page/View Implementation',
    type: 'ui',
    category: 'Frontend Development',
    title: 'Implement [page name] page/view',
    description: 'Create complete page or view with routing, data fetching, and user interactions.',
    estimatedHours: 8,
    priority: 'high',
    subtasks: [
      'Design page layout and wireframes',
      'Implement routing and navigation',
      'Add data fetching and state management',
      'Implement user interactions and forms',
      'Add loading states and error handling',
      'Optimize for performance and accessibility'
    ],
    acceptanceCriteria: [
      'Page layout matches design specifications',
      'Routing and navigation work correctly',
      'Data is fetched and displayed properly',
      'User interactions are smooth and intuitive',
      'Loading and error states are handled',
      'Page is accessible and performs well'
    ],
    labels: ['ui', 'page', 'frontend'],
    assigneeRole: ['Frontend Developer', 'UI/UX Developer']
  },
  {
    id: 'ui-responsive',
    name: 'Responsive Design Implementation',
    type: 'ui',
    category: 'Design',
    title: 'Make [component/page] responsive',
    description: 'Implement responsive design to ensure proper display across all device sizes.',
    estimatedHours: 4,
    priority: 'medium',
    subtasks: [
      'Analyze current design and breakpoints',
      'Implement mobile-first responsive layout',
      'Test across different screen sizes',
      'Optimize images and media queries',
      'Ensure touch-friendly interactions',
      'Validate accessibility on mobile'
    ],
    acceptanceCriteria: [
      'Design works on mobile, tablet, and desktop',
      'Layout adapts smoothly across breakpoints',
      'Images and media are optimized',
      'Touch interactions are properly sized',
      'Performance is maintained on mobile',
      'Accessibility standards are met'
    ],
    labels: ['ui', 'responsive', 'mobile'],
    assigneeRole: ['UI/UX Designer', 'Frontend Developer']
  },

  // QA Templates
  {
    id: 'qa-test-plan',
    name: 'Test Plan Creation',
    type: 'qa',
    category: 'Test Planning',
    title: 'Create test plan for [feature]',
    description: 'Develop comprehensive test plan including test cases, scenarios, and acceptance criteria.',
    estimatedHours: 6,
    priority: 'high',
    subtasks: [
      'Analyze requirements and user stories',
      'Identify test scenarios and edge cases',
      'Create detailed test cases',
      'Define test data requirements',
      'Plan test execution strategy',
      'Review test plan with stakeholders'
    ],
    acceptanceCriteria: [
      'Test plan covers all requirements',
      'Test cases are detailed and executable',
      'Edge cases and error scenarios are included',
      'Test data requirements are defined',
      'Test execution strategy is clear',
      'Test plan is reviewed and approved'
    ],
    labels: ['qa', 'testing', 'planning'],
    assigneeRole: ['QA Engineer', 'Test Lead']
  },
  {
    id: 'qa-manual-testing',
    name: 'Manual Testing Execution',
    type: 'qa',
    category: 'Test Execution',
    title: 'Execute manual testing for [feature]',
    description: 'Perform comprehensive manual testing including functional, integration, and user acceptance testing.',
    estimatedHours: 8,
    priority: 'medium',
    subtasks: [
      'Set up test environment and data',
      'Execute functional test cases',
      'Perform integration testing',
      'Conduct user acceptance testing',
      'Report and track defects',
      'Create test execution report'
    ],
    acceptanceCriteria: [
      'All test cases are executed',
      'Test results are documented',
      'Defects are properly reported',
      'Integration testing is completed',
      'User acceptance criteria are met',
      'Test execution report is created'
    ],
    labels: ['qa', 'manual-testing', 'execution'],
    assigneeRole: ['QA Engineer', 'Tester']
  },
  {
    id: 'qa-automation',
    name: 'Test Automation Implementation',
    type: 'qa',
    category: 'Test Automation',
    title: 'Implement automated tests for [feature]',
    description: 'Create automated test scripts for regression testing and continuous integration.',
    estimatedHours: 10,
    priority: 'medium',
    subtasks: [
      'Analyze test cases for automation',
      'Set up test automation framework',
      'Write automated test scripts',
      'Implement test data management',
      'Integrate with CI/CD pipeline',
      'Maintain and update test scripts'
    ],
    acceptanceCriteria: [
      'Automated tests cover critical paths',
      'Test scripts are maintainable and reliable',
      'Tests run successfully in CI/CD',
      'Test data is properly managed',
      'Test execution is fast and stable',
      'Test scripts are documented'
    ],
    labels: ['qa', 'automation', 'testing'],
    assigneeRole: ['QA Automation Engineer', 'SDET']
  },
  {
    id: 'qa-performance',
    name: 'Performance Testing',
    type: 'qa',
    category: 'Performance Testing',
    title: 'Conduct performance testing for [feature]',
    description: 'Execute performance testing to ensure system meets performance requirements under various load conditions.',
    estimatedHours: 8,
    priority: 'medium',
    subtasks: [
      'Define performance requirements',
      'Set up performance testing environment',
      'Create performance test scenarios',
      'Execute load and stress tests',
      'Analyze performance metrics',
      'Report performance test results'
    ],
    acceptanceCriteria: [
      'Performance requirements are defined',
      'Load testing is completed successfully',
      'Stress testing identifies breaking points',
      'Performance metrics are within acceptable limits',
      'Performance bottlenecks are identified',
      'Performance report includes recommendations'
    ],
    labels: ['qa', 'performance', 'testing'],
    assigneeRole: ['Performance Test Engineer', 'QA Engineer']
  },

  // DevOps Templates
  {
    id: 'devops-deployment',
    name: 'Deployment Pipeline',
    type: 'devops',
    category: 'Deployment',
    title: 'Set up deployment pipeline for [service]',
    description: 'Create automated deployment pipeline with proper staging, testing, and production environments.',
    estimatedHours: 12,
    priority: 'high',
    subtasks: [
      'Set up CI/CD pipeline configuration',
      'Configure staging and production environments',
      'Implement automated testing in pipeline',
      'Add deployment approval processes',
      'Set up monitoring and alerting',
      'Document deployment procedures'
    ],
    acceptanceCriteria: [
      'CI/CD pipeline is fully automated',
      'Staging and production deployments work',
      'Automated tests run in pipeline',
      'Deployment approvals are properly configured',
      'Monitoring and alerts are set up',
      'Deployment documentation is complete'
    ],
    labels: ['devops', 'deployment', 'ci-cd'],
    assigneeRole: ['DevOps Engineer', 'Platform Engineer']
  },
  {
    id: 'devops-monitoring',
    name: 'Monitoring Setup',
    type: 'devops',
    category: 'Monitoring',
    title: 'Set up monitoring for [service]',
    description: 'Implement comprehensive monitoring including metrics, logs, and alerting for production systems.',
    estimatedHours: 8,
    priority: 'medium',
    subtasks: [
      'Configure application metrics collection',
      'Set up log aggregation and analysis',
      'Create monitoring dashboards',
      'Configure alerting rules and notifications',
      'Test monitoring and alerting',
      'Document monitoring procedures'
    ],
    acceptanceCriteria: [
      'Key metrics are being collected',
      'Logs are aggregated and searchable',
      'Monitoring dashboards are created',
      'Alerts are configured and tested',
      'Monitoring covers all critical systems',
      'Monitoring documentation is complete'
    ],
    labels: ['devops', 'monitoring', 'alerting'],
    assigneeRole: ['DevOps Engineer', 'SRE']
  },

  // Research Templates
  {
    id: 'research-technology',
    name: 'Technology Research',
    type: 'research',
    category: 'Research & Analysis',
    title: 'Research [technology/tool] for [purpose]',
    description: 'Conduct thorough research on new technology or tool to evaluate its suitability for the project.',
    estimatedHours: 16,
    priority: 'low',
    subtasks: [
      'Define research objectives and criteria',
      'Gather information from multiple sources',
      'Create proof of concept or prototype',
      'Evaluate pros and cons',
      'Assess implementation effort and risks',
      'Create research report and recommendations'
    ],
    acceptanceCriteria: [
      'Research objectives are clearly defined',
      'Multiple sources and perspectives are considered',
      'Proof of concept demonstrates feasibility',
      'Pros and cons are thoroughly evaluated',
      'Implementation effort is estimated',
      'Research report includes clear recommendations'
    ],
    labels: ['research', 'analysis', 'technology'],
    assigneeRole: ['Senior Developer', 'Architect', 'Tech Lead']
  }
];

// Helper functions for template management
export const getTemplatesByType = (type: TaskTemplate['type']) => {
  return taskTemplates.filter(template => template.type === type);
};

export const getTemplateById = (id: string) => {
  return taskTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string) => {
  return taskTemplates.filter(template => template.category === category);
};

export const getAllCategories = () => {
  return [...new Set(taskTemplates.map(template => template.category))];
};

export const getAllTypes = () => {
  return [...new Set(taskTemplates.map(template => template.type))];
};
