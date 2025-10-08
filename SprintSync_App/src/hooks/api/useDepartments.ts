import { useState, useEffect } from 'react';
import { departmentApiService } from '../../services/api';
import { Department } from '../../types/api';

interface UseDepartmentsReturn {
  data: Department[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  createDepartment: (department: Department) => Promise<Department>;
  updateDepartment: (id: string, department: Department) => Promise<Department>;
  deleteDepartment: (id: string) => Promise<void>;
}

export const useDepartments = (): UseDepartmentsReturn => {
  const [data, setData] = useState<Department[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await departmentApiService.getAllDepartments();
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch departments'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const createDepartment = async (department: Department): Promise<Department> => {
    try {
      const response = await departmentApiService.createDepartment(department);
      await fetchDepartments(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create department');
    }
  };

  const updateDepartment = async (id: string, department: Department): Promise<Department> => {
    try {
      const response = await departmentApiService.updateDepartment(id, department);
      await fetchDepartments(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update department');
    }
  };

  const deleteDepartment = async (id: string): Promise<void> => {
    try {
      await departmentApiService.deleteDepartment(id);
      await fetchDepartments(); // Refresh the list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete department');
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
};

// Export standalone functions for convenience
export const createDepartment = async (department: Department): Promise<Department> => {
  try {
    const response = await departmentApiService.createDepartment(department);
    return response.data;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to create department');
  }
};

export const updateDepartment = async (id: string, department: Department): Promise<Department> => {
  try {
    const response = await departmentApiService.updateDepartment(id, department);
    return response.data;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to update department');
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    await departmentApiService.deleteDepartment(id);
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to delete department');
  }
};
