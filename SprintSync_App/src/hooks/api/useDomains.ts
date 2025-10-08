import { useState, useEffect } from 'react';
import { domainApiService } from '../../services/api';
import { Domain } from '../../types/api';

interface UseDomainsReturn {
  data: Domain[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  createDomain: (domain: Domain) => Promise<Domain>;
  updateDomain: (id: string, domain: Domain) => Promise<Domain>;
  deleteDomain: (id: string) => Promise<void>;
}

export const useDomains = (): UseDomainsReturn => {
  const [data, setData] = useState<Domain[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await domainApiService.getAllDomains();
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch domains'));
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const createDomain = async (domain: Domain): Promise<Domain> => {
    try {
      const response = await domainApiService.createDomain(domain);
      await fetchDomains(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create domain');
    }
  };

  const updateDomain = async (id: string, domain: Domain): Promise<Domain> => {
    try {
      const response = await domainApiService.updateDomain(id, domain);
      await fetchDomains(); // Refresh the list
      return response.data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update domain');
    }
  };

  const deleteDomain = async (id: string): Promise<void> => {
    try {
      await domainApiService.deleteDomain(id);
      await fetchDomains(); // Refresh the list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete domain');
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchDomains,
    createDomain,
    updateDomain,
    deleteDomain,
  };
};

// Export standalone functions for convenience
export const createDomain = async (domain: Domain): Promise<Domain> => {
  try {
    const response = await domainApiService.createDomain(domain);
    return response.data;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to create domain');
  }
};

export const updateDomain = async (id: string, domain: Domain): Promise<Domain> => {
  try {
    const response = await domainApiService.updateDomain(id, domain);
    return response.data;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to update domain');
  }
};

export const deleteDomain = async (id: string): Promise<void> => {
  try {
    await domainApiService.deleteDomain(id);
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to delete domain');
  }
};
