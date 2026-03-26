import apiClient from '../client';
import { QualityGate } from '../../../types/api';

const BASE_URL = '/quality-gates';

export const qualityGateApiService = {
  getAllQualityGates: () =>
    apiClient.get<QualityGate[]>(BASE_URL),

  getQualityGateById: (id: string) =>
    apiClient.get<QualityGate>(`${BASE_URL}/${id}`),

  getQualityGatesByRelease: (releaseId: string) =>
    apiClient.get<QualityGate[]>(`${BASE_URL}/release/${releaseId}`),
};
