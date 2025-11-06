import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api/client';

export interface ExperienceLevel {
  value: string;
  label: string;
}

export const useExperienceLevels = () => {
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExperienceLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔵 [useExperienceLevels] Fetching experience levels...');
      
      const response = await apiClient.get<ExperienceLevel[]>('/users/experience-levels');
      
      console.log('✅ [useExperienceLevels] Success:', response.data);
      
      // Transform the enum values to user-friendly labels
      const transformedLevels = response.data.map(level => ({
        value: level.value || level,
        label: getExperienceLabel(level.value || level)
      }));
      
      setExperienceLevels(transformedLevels);
    } catch (err: any) {
      console.error('❌ [useExperienceLevels] Error:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch experience levels'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperienceLevels();
  }, []);

  return {
    experienceLevels,
    loading,
    error,
    refetch: fetchExperienceLevels
  };
};

// Helper function to get user-friendly labels for experience levels
const getExperienceLabel = (value: string): string => {
  const labels: { [key: string]: string } = {
    'E1': 'E1 - 0-1yr',
    'E2': 'E2 - 1-3yrs',
    'M1': 'M1 - 3-7yrs',
    'M2': 'M2 - 5-8yrs',
    'M3': 'M3 - 7-10yrs',
    'L1': 'L1 - 10-15yrs',
    'L2': 'L2 - 12-18yrs',
    'L3': 'L3 - 15&above',
    'S1': 'S1 - 20yrs &above'
  };
  
  return labels[value] || value;
};
