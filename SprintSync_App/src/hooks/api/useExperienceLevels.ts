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
    'junior': 'Junior (0-2 years)',
    'mid': 'Mid-level (2-5 years)', 
    'senior': 'Senior (5-10 years)',
    'lead': 'Lead (10+ years)'
  };
  
  return labels[value] || value;
};
