import { useState, useEffect } from 'react';
import { apiClient } from '../../services/api/client';

export interface ExperienceLevel {
  value: ExperienceLevelCode;
  label: string;
}

type ExperienceLevelResponse =
  | string
  | { value?: string; label?: string; name?: string };

export type ExperienceLevelCode =
  | 'E1'
  | 'E2'
  | 'M1'
  | 'M2'
  | 'M3'
  | 'L1'
  | 'L2'
  | 'L3'
  | 'S1';

export const EXPERIENCE_LEVEL_ORDER: ExperienceLevelCode[] = [
  'E1',
  'E2',
  'M1',
  'M2',
  'M3',
  'L1',
  'L2',
  'L3',
  'S1',
];

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevelCode, string> = {
  E1: 'E1 - 0-1 yr',
  E2: 'E2 - 1-3 yrs',
  M1: 'M1 - 3-7 yrs',
  M2: 'M2 - 5-8 yrs',
  M3: 'M3 - 7-10 yrs',
  L1: 'L1 - 10-15 yrs',
  L2: 'L2 - 12-18 yrs',
  L3: 'L3 - 15+ yrs',
  S1: 'S1 - 20+ yrs',
};

const LEGACY_EXPERIENCE_MAP: Record<string, ExperienceLevelCode> = {
  JUNIOR: 'E1',
  MID: 'M1',
  INTERMEDIATE: 'M1',
  SENIOR: 'M3',
  LEAD: 'L2',
  L0: 'L1',
  L4: 'L3',
  S2: 'S1',
};

export const getExperienceLabel = (value: string): string => {
  const normalized = value?.toUpperCase?.() as ExperienceLevelCode | undefined;
  return (normalized && EXPERIENCE_LEVEL_LABELS[normalized]) || value;
};

export const normalizeExperienceValue = (
  experience?: string | null
): ExperienceLevelCode | undefined => {
  if (!experience) {
    return;
  }

  const normalized = toExperienceLevelCode(experience);
  if (normalized) {
    return normalized;
  }

  const legacyMatch = LEGACY_EXPERIENCE_MAP[experience.trim().toUpperCase()];

  return legacyMatch;
};

export const useExperienceLevels = () => {
  const [experienceLevels, setExperienceLevels] = useState<ExperienceLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchExperienceLevels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔵 [useExperienceLevels] Fetching experience levels...');
      
      const response = await apiClient.get<ExperienceLevelResponse[]>(
        '/users/experience-levels'
      );
      
      console.log('✅ [useExperienceLevels] Success:', response.data);
      
      // Transform the enum values to user-friendly labels
      const transformedLevels = EXPERIENCE_LEVEL_ORDER.reduce<ExperienceLevel[]>(
        (acc, code) => {
          const hasCode = response.data.some((level) => {
            const normalized = normalizeExperienceLevel(level);
            return normalized === code;
          });

          if (hasCode) {
            acc.push({
              value: code,
              label: EXPERIENCE_LEVEL_LABELS[code],
            });
          }

          return acc;
        },
        []
      );

      // Fallback: if API returned additional values not in known order, append them
      const knownCodes = new Set(transformedLevels.map((level) => level.value));
      response.data.forEach((level) => {
        const normalized = normalizeExperienceLevel(level);
        if (normalized && !knownCodes.has(normalized)) {
          accPushUnique(transformedLevels, normalized);
          knownCodes.add(normalized);
        }
      });
      
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
const normalizeExperienceLevel = (
  level: ExperienceLevelResponse
): ExperienceLevelCode | undefined => {
  if (!level) {
    return;
  }

  if (typeof level === 'string') {
    return normalizeExperienceValue(level);
  }

  if (typeof level === 'object') {
    const { value, name, label } = level;
    return (
      normalizeExperienceValue(value) ||
      normalizeExperienceValue(name) ||
      normalizeExperienceValue(label)
    );
  }

  return normalizeExperienceValue(level.toString());
};

const accPushUnique = (
  collection: ExperienceLevel[],
  code: ExperienceLevelCode
) => {
  if (!collection.find((item) => item.value === code)) {
    collection.push({
      value: code,
      label: EXPERIENCE_LEVEL_LABELS[code] || code,
    });
  }
};

const toExperienceLevelCode = (
  value?: string | null
): ExperienceLevelCode | undefined => {
  if (!value) {
    return;
  }
  const normalized = value.toUpperCase();
  if (isExperienceLevelCode(normalized)) {
    return normalized;
  }

  return undefined;
};

const isExperienceLevelCode = (
  value?: string
): value is ExperienceLevelCode => {
  return !!value && EXPERIENCE_LEVEL_ORDER.includes(value as ExperienceLevelCode);
};
