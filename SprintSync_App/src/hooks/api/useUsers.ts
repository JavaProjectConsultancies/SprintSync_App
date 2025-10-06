import { useApi, useApiMutation, usePaginatedApi, useSearchApi } from './useApi';
import { 
  userApiService, 
  departmentApiService,
  domainApiService,
  User, 
  Department,
  Domain,
  ApiResponse, 
  PaginationParams 
} from '../../services/api';

// User Hooks
export function useUsers(params?: PaginationParams) {
  return useApi(
    () => userApiService.getUsers(params),
    [JSON.stringify(params)]
  );
}

export function useUser(id: string) {
  return useApi(
    () => userApiService.getUserById(id),
    [id]
  );
}

export function useCreateUser() {
  return useApiMutation<User, Omit<User, 'id' | 'createdAt' | 'updatedAt'>>(
    (user) => userApiService.createUser(user)
  );
}

export function useUpdateUser() {
  return useApiMutation<User, { id: string; user: Partial<User> }>(
    ({ id, user }) => userApiService.updateUser(id, user)
  );
}

export function useDeleteUser() {
  return useApiMutation<void, string>(
    (id) => userApiService.deleteUser(id)
  );
}

export function usePaginatedUsers(initialParams?: PaginationParams) {
  return usePaginatedApi<User>(
    (params) => userApiService.getUsers(params),
    initialParams
  );
}

export function useSearchUsers() {
  return useSearchApi<User>(
    (query, params) => userApiService.searchUsers(query, params)
  );
}

export function useUsersByDepartment(departmentId: string, params?: PaginationParams) {
  return useApi(
    () => userApiService.getUsersByDepartment(departmentId, params),
    [departmentId, JSON.stringify(params)]
  );
}

export function useUsersByDomain(domainId: string, params?: PaginationParams) {
  return useApi(
    () => userApiService.getUsersByDomain(domainId, params),
    [domainId, JSON.stringify(params)]
  );
}

export function useActiveUsers(params?: PaginationParams) {
  return useApi(
    () => userApiService.getActiveUsers(params),
    [JSON.stringify(params)]
  );
}

export function useUpdateUserStatus() {
  return useApiMutation<User, { id: string; isActive: boolean }>(
    ({ id, isActive }) => userApiService.updateUserStatus(id, isActive)
  );
}

export function useUserStatistics() {
  return useApi(
    () => userApiService.getUserStatistics(),
    []
  );
}

// Department Hooks
export function useDepartments(params?: PaginationParams) {
  return useApi(
    () => departmentApiService.getDepartments(params),
    [JSON.stringify(params)]
  );
}

export function useDepartment(id: string) {
  return useApi(
    () => departmentApiService.getDepartmentById(id),
    [id]
  );
}

export function useCreateDepartment() {
  return useApiMutation<Department, Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>(
    (department) => departmentApiService.createDepartment(department)
  );
}

export function useUpdateDepartment() {
  return useApiMutation<Department, { id: string; department: Partial<Department> }>(
    ({ id, department }) => departmentApiService.updateDepartment(id, department)
  );
}

export function useDeleteDepartment() {
  return useApiMutation<void, string>(
    (id) => departmentApiService.deleteDepartment(id)
  );
}

export function useSearchDepartments() {
  return useSearchApi<Department>(
    (query, params) => departmentApiService.searchDepartments(query, params)
  );
}

export function useActiveDepartments(params?: PaginationParams) {
  return useApi(
    () => departmentApiService.getActiveDepartments(params),
    [JSON.stringify(params)]
  );
}

// Domain Hooks
export function useDomains(params?: PaginationParams) {
  return useApi(
    () => domainApiService.getDomains(params),
    [JSON.stringify(params)]
  );
}

export function useDomain(id: string) {
  return useApi(
    () => domainApiService.getDomainById(id),
    [id]
  );
}

export function useCreateDomain() {
  return useApiMutation<Domain, Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>>(
    (domain) => domainApiService.createDomain(domain)
  );
}

export function useUpdateDomain() {
  return useApiMutation<Domain, { id: string; domain: Partial<Domain> }>(
    ({ id, domain }) => domainApiService.updateDomain(id, domain)
  );
}

export function useDeleteDomain() {
  return useApiMutation<void, string>(
    (id) => domainApiService.deleteDomain(id)
  );
}

export function useSearchDomains() {
  return useSearchApi<Domain>(
    (query, params) => domainApiService.searchDomains(query, params)
  );
}

export function useActiveDomains(params?: PaginationParams) {
  return useApi(
    () => domainApiService.getActiveDomains(params),
    [JSON.stringify(params)]
  );
}
