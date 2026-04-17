import React, { useState, useEffect } from 'react';
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

// Cache for users to support prefetching
interface UsersCache {
  data: User[] | null;
  timestamp: number;
  promise: Promise<User[]> | null;
}

let usersCache: UsersCache = {
  data: null,
  timestamp: 0,
  promise: null,
};

const USERS_CACHE_TTL = 300000; // 5 minutes

// Prefetch users function
export const prefetchUsers = async (params?: PaginationParams): Promise<User[]> => {
  const now = Date.now();
  const paginationParams = params || { page: 0, size: 10000 };

  // Return cached data if still valid
  if (usersCache.data && (now - usersCache.timestamp) < USERS_CACHE_TTL) {
    return usersCache.data;
  }

  // Return existing promise if fetch is in progress
  if (usersCache.promise) {
    return usersCache.promise;
  }

  const fetchPromise = (async () => {
    try {
      const response = await userApiService.getUsers(paginationParams);
      const users = Array.isArray(response.data) ? response.data : ((response.data as any)?.content || []);
      
      usersCache = {
        data: users,
        timestamp: Date.now(),
        promise: null,
      };
      return users;
    } catch (err) {
      usersCache.promise = null;
      throw err;
    }
  })();

  usersCache.promise = fetchPromise;
  return fetchPromise;
};

// User Hooks
export function useUsers(params?: PaginationParams) {
  const [data, setData] = useState<User[] | null>(usersCache.data);
  const [loading, setLoading] = useState(!usersCache.data);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        if (!usersCache.data || (Date.now() - usersCache.timestamp) > USERS_CACHE_TTL) {
          setLoading(true);
        }
        const users = await prefetchUsers(params);
        setData(users);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [JSON.stringify(params)]);

  return { data, loading, error, refetch: () => {
    usersCache.data = null;
    usersCache.timestamp = 0;
    prefetchUsers(params);
  }};
}

export function useUser(id: string) {
  return useApi(
    () => {
      if (!id || id.trim() === '') {
        return Promise.resolve({ data: null, status: 200, success: true, message: 'No user ID provided' } as any);
      }
      return userApiService.getUserById(id);
    },
    [id],
    !!id && id.trim() !== '' // Only execute immediately if we have a valid ID
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
  // Default to large page size if params not provided
  const paginationParams = params || { page: 0, size: 1000 };
  return useApi(
    () => userApiService.getActiveUsers(paginationParams),
    [JSON.stringify(paginationParams)]
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
