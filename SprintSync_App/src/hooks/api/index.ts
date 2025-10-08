// API Hooks Index
// Export all API hooks for easy importing

// Core API hooks
export { useApi } from './useApi';

// Entity-specific hooks
export { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from './useUsers';
export { useProjects, useCreateProject } from './useProjects';
export { useSprints, useCreateSprint, useUpdateSprint, useDeleteSprint } from './useSprints';
export { useStories, useCreateStory, useUpdateStory, useDeleteStory } from './useStories';
export { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from './useTasks';
export { useSubtasks, createSubtask, updateSubtask, deleteSubtask } from './useSubtasks';
export { useDepartments, createDepartment, updateDepartment, deleteDepartment } from './useDepartments';
export { useDomains, createDomain, updateDomain, deleteDomain } from './useDomains';
export { useEpics, useCreateEpic, useUpdateEpic, useDeleteEpic, createEpic, updateEpic, deleteEpic } from './useEpics';
export { useReleases, useCreateRelease, useUpdateRelease, useDeleteRelease, createRelease, updateRelease, deleteRelease } from './useReleases';

// Re-export API services for convenience
export { userApiService, projectApiService, sprintApiService, storyApiService, taskApiService, subtaskApiService, departmentApiService, domainApiService, epicApiService, releaseApiService, dashboardApiService, reportsApiService, searchApiService, batchApiService } from '../../services/api';
