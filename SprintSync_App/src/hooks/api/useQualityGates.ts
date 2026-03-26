import { useApi } from './useApi';
import { qualityGateApiService } from '../../services/api/entities/qualityGateApi';

export function useQualityGates() {
  return useApi(
    () => qualityGateApiService.getAllQualityGates(),
    ['quality-gates']
  );
}
