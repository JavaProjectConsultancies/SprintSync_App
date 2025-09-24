import { Release, QualityGate } from '../types';

export const mockReleases: Release[] = [
  {
    id: 'release-1',
    projectId: 'proj-1',
    name: 'Mobile-First Experience',
    version: 'v2.0.0',
    description: 'Major release focusing on mobile user experience with new features and performance improvements.',
    status: 'development',
    releaseDate: '2024-03-15T00:00:00Z',
    targetDate: '2024-03-15T00:00:00Z',
    progress: 65,
    linkedEpics: ['epic-1', 'epic-3', 'epic-4'],
    linkedStories: ['story-1', 'story-2', 'story-3', 'story-4', 'story-7', 'story-8'],
    linkedSprints: ['sprint-15', 'sprint-16', 'sprint-17'],
    releaseNotes: 'This release introduces mobile-first design, improved authentication system, and enhanced search capabilities.',
    qualityGates: [
      {
        id: 'qg-1',
        name: 'Code Review Completion',
        description: 'All code changes reviewed and approved',
        status: 'passed',
        required: true,
        completedAt: '2024-02-10T00:00:00Z'
      },
      {
        id: 'qg-2',
        name: 'Unit Test Coverage',
        description: 'Minimum 80% test coverage achieved',
        status: 'passed',
        required: true,
        completedAt: '2024-02-12T00:00:00Z'
      },
      {
        id: 'qg-3',
        name: 'Integration Testing',
        description: 'All integration tests passing',
        status: 'in-progress',
        required: true
      },
      {
        id: 'qg-4',
        name: 'Performance Testing',
        description: 'Performance benchmarks met',
        status: 'pending',
        required: true
      },
      {
        id: 'qg-5',
        name: 'Security Audit',
        description: 'Security vulnerabilities addressed',
        status: 'pending',
        required: true
      }
    ],
    risks: [
      'Mobile app store approval process may cause delays',
      'Third-party API integration stability concerns',
      'Performance optimization complexity'
    ],
    dependencies: [],
    createdBy: 'user1',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  },
  {
    id: 'release-2',
    projectId: 'proj-1',
    name: 'Payment Integration',
    version: 'v2.1.0',
    description: 'Release focusing on payment processing capabilities and financial features.',
    status: 'planning',
    releaseDate: '2024-05-01T00:00:00Z',
    targetDate: '2024-05-01T00:00:00Z',
    progress: 15,
    linkedEpics: ['epic-2'],
    linkedStories: ['story-5', 'story-6'],
    linkedSprints: ['sprint-18', 'sprint-19'],
    releaseNotes: 'This release adds comprehensive payment processing, multi-currency support, and financial reporting.',
    qualityGates: [
      {
        id: 'qg-6',
        name: 'PCI DSS Compliance',
        description: 'Payment card industry compliance verified',
        status: 'pending',
        required: true
      },
      {
        id: 'qg-7',
        name: 'Payment Gateway Integration',
        description: 'All payment gateways tested and functional',
        status: 'pending',
        required: true
      },
      {
        id: 'qg-8',
        name: 'Financial Data Security',
        description: 'Financial data encryption and security verified',
        status: 'pending',
        required: true
      }
    ],
    risks: [
      'PCI DSS compliance requirements complexity',
      'Payment gateway API reliability',
      'Financial regulation compliance'
    ],
    dependencies: ['release-1'],
    createdBy: 'user2',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-10T00:00:00Z'
  },
  {
    id: 'release-3',
    projectId: 'proj-1',
    name: 'Performance Optimization',
    version: 'v1.9.0',
    description: 'Performance improvements and system optimization release.',
    status: 'testing',
    releaseDate: '2024-02-29T00:00:00Z',
    targetDate: '2024-02-29T00:00:00Z',
    progress: 85,
    linkedEpics: ['epic-5'],
    linkedStories: ['story-10', 'story-11', 'story-12'],
    linkedSprints: ['sprint-14'],
    releaseNotes: 'Performance improvements including database optimization, caching implementation, and load balancing.',
    qualityGates: [
      {
        id: 'qg-9',
        name: 'Performance Benchmarks',
        description: 'All performance targets met',
        status: 'passed',
        required: true,
        completedAt: '2024-02-20T00:00:00Z'
      },
      {
        id: 'qg-10',
        name: 'Load Testing',
        description: 'System handles expected load',
        status: 'passed',
        required: true,
        completedAt: '2024-02-22T00:00:00Z'
      },
      {
        id: 'qg-11',
        name: 'Database Optimization',
        description: 'Database performance improvements verified',
        status: 'in-progress',
        required: true
      }
    ],
    risks: [
      'Performance improvements may affect system stability',
      'Database migration complexity'
    ],
    dependencies: [],
    createdBy: 'user5',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z'
  }
];

export const getReleasesByProject = (projectId: string) => {
  return mockReleases.filter(release => release.projectId === projectId);
};

export const getReleaseById = (releaseId: string) => {
  return mockReleases.find(release => release.id === releaseId);
};

export const getReleaseStatusColor = (status: string) => {
  switch (status) {
    case 'planning': return 'bg-blue-100 text-blue-800';
    case 'development': return 'bg-orange-100 text-orange-800';
    case 'testing': return 'bg-purple-100 text-purple-800';
    case 'staging': return 'bg-yellow-100 text-yellow-800';
    case 'ready-for-release': return 'bg-green-100 text-green-800';
    case 'released': return 'bg-emerald-100 text-emerald-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getQualityGateStatusColor = (status: string) => {
  switch (status) {
    case 'passed': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};
